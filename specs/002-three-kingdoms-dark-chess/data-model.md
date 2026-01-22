# Data Model: Three Kingdoms Dark Chess

**Date**: 2026-01-22  
**Feature**: `002-three-kingdoms-dark-chess`  
**Based on**: Classic Dark Chess data model (001) with multi-mode extensions

---

## Overview

This data model extends the Classic Dark Chess (001) foundation to support multiple game modes (Classic, Three Kingdoms, future variants). Key changes:
- **GameMode**: New entity for mode configuration
- **Faction**: Replaces simple color (red/black) with multi-player factions
- **Piece**: Uses `factionId` instead of `color` for N-player support
- **Match**: Extended with `mode`, `factions`, `activeFactions`, `movesWithoutCapture`
- **RuleSet**: New interface for pluggable rule systems

---

## Core Entities

### GameMode (NEW)

Represents a game variant (Classic, Three Kingdoms, Army Chess).

**Fields**:
- `id: string` - Unique identifier ("classic", "three-kingdoms", "army-chess")
- `name: string` - Display name (e.g., "三國暗棋")
- `boardSize: number` - Number of positions (32 for Classic, 45 for Three Kingdoms)
- `gridDimensions: { rows: number; cols: number }` - Grid layout (8x4 for Classic, 9x5 for Three Kingdoms)
- `playerCount: number` - Number of players (2 or 3)
- `ruleSet: RuleSet` - Rule implementation (ClassicRules, ThreeKingdomsRules)

**Validation Rules**:
- `id` must be unique across all modes
- `boardSize` must match `gridDimensions.rows * gridDimensions.cols`
- `playerCount` must be ≥ 2
- `ruleSet` must implement RuleSet interface

**Examples**:
```typescript
const CLASSIC_MODE: GameMode = {
  id: 'classic',
  name: '經典暗棋',
  boardSize: 32,
  gridDimensions: { rows: 8, cols: 4 },
  playerCount: 2,
  ruleSet: new ClassicRules(),
};

const THREE_KINGDOMS_MODE: GameMode = {
  id: 'three-kingdoms',
  name: '三國暗棋',
  boardSize: 45,
  gridDimensions: { rows: 9, cols: 5 },
  playerCount: 3,
  ruleSet: new ThreeKingdomsRules(),
};
```

---

### Faction (NEW)

Represents a player faction/team (replaces simple red/black colors).

**Fields**:
- `id: string` - Unique faction identifier ("red", "black", "team-a", "team-b", "team-c")
- `displayName: string` - Localized name (e.g., "紅方", "將軍軍", "紅方輔臣")
- `color: 'red' | 'black' | 'green'` - UI color for piece rendering
- `pieceCount: number` - Total pieces for this faction (16 for Classic, 12/10/10 for Three Kingdoms)
- `isEliminated: boolean` - Whether faction has been eliminated (for turn rotation)

**Validation Rules**:
- `id` must be unique within a Match
- `color` must be valid UI color ('red' | 'black' | 'green')
- `pieceCount` must be > 0
- `isEliminated` defaults to false at match start

**State Transitions**:
- `isEliminated: false → true` - When all faction pieces are captured or faction has no legal moves
- Once eliminated, faction is removed from turn rotation

**Examples**:
```typescript
// Classic mode factions
const RED_FACTION: Faction = {
  id: 'red',
  displayName: '紅方',
  color: 'red',
  pieceCount: 16,
  isEliminated: false,
};

const BLACK_FACTION: Faction = {
  id: 'black',
  displayName: '黑方',
  color: 'black',
  pieceCount: 16,
  isEliminated: false,
};

// Three Kingdoms mode factions
const TEAM_A_FACTION: Faction = {
  id: 'team-a',
  displayName: '將軍軍',
  color: 'green',
  pieceCount: 12,
  isEliminated: false,
};

const TEAM_B_FACTION: Faction = {
  id: 'team-b',
  displayName: '紅方輔臣',
  color: 'red',
  pieceCount: 10,
  isEliminated: false,
};

const TEAM_C_FACTION: Faction = {
  id: 'team-c',
  displayName: '黑方輔臣',
  color: 'black',
  pieceCount: 10,
  isEliminated: false,
};
```

---

### Piece (MODIFIED)

Represents a single game piece on the board.

**Fields** (CHANGED):
- `id: string` - Unique identifier (e.g., "red-king-1", "team-a-general-red")
- `type: PieceType` - Enum: 'King' | 'Guard' | 'Minister' | 'Rook' | 'Horse' | 'Cannon' | 'Pawn'
- ~~`color: 'red' | 'black'`~~ → **`factionId: string`** - References Faction.id
- `isRevealed: boolean` - Whether piece is face-up (true) or face-down (false)
- `isDead: boolean` - Whether piece has been captured (true) or is alive (false)

**Validation Rules**:
- `id` must be unique across all pieces in a Match
- `type` must be valid PieceType
- `factionId` must reference a valid Faction in Match.factions
- `isRevealed` defaults to false at match start
- `isDead` defaults to false at match start

**State Transitions**:
- `isRevealed: false → true` - When piece is flipped
- `isDead: false → true` - When piece is captured
- No reverse transitions (once revealed/dead, stays that way)

**Migration from Classic**:
```typescript
// OLD (Classic only)
const oldPiece: Piece = {
  id: 'red-king-1',
  type: 'King',
  color: 'red', // ❌ Limited to 2 players
  isRevealed: false,
  isDead: false,
};

// NEW (Multi-mode support)
const newPiece: Piece = {
  id: 'red-king-1',
  type: 'King',
  factionId: 'red', // ✅ References Faction entity
  isRevealed: false,
  isDead: false,
};

// Three Kingdoms example
const tkPiece: Piece = {
  id: 'team-a-general-red',
  type: 'King',
  factionId: 'team-a', // ✅ References Team A faction
  isRevealed: true,
  isDead: false,
};
```

---

### Board (MODIFIED)

Represents the game board grid.

**Structure**: `Array<Piece | null>` (length varies by mode)

**Size**:
- **Classic**: 32 elements (8 rows × 4 cols)
- **Three Kingdoms**: 45 elements (9 rows × 5 cols)

**Coordinate System**:
```typescript
// Classic (8x4)
function getIndex(row: number, col: number): number {
  return row * 4 + col;
}
function getRow(index: number): number {
  return Math.floor(index / 4);
}
function getCol(index: number): number {
  return index % 4;
}

// Three Kingdoms (9x5)
function getIndex(row: number, col: number): number {
  return row * 5 + col;
}
function getRow(index: number): number {
  return Math.floor(index / 5);
}
function getCol(index: number): number {
  return index % 5;
}
```

**Validation Rules**:
- Length must match `GameMode.boardSize`
- At match start: Classic has 32 pieces (no nulls), Three Kingdoms has 32 pieces + 13 nulls
- After captures: cells may be null (empty positions)
- Each piece must have unique `id`
- All `factionId` values must reference valid factions

**State Transitions**:
- Initial state: All pieces face-down (`isRevealed: false`), randomly shuffled
- After flip: piece at index has `isRevealed: true`
- After move: piece moves from index A to index B (B was null or empty)
- After capture: attacker moves to target index, target piece has `isDead: true`, target position becomes occupied by attacker

---

### Match (MODIFIED)

Represents a complete game session.

**Fields** (CHANGED):
- `status: 'waiting-first-flip' | 'in-progress' | 'ended'` - Match state (unchanged)
- ~~`currentTurn: 'red' | 'black' | null`~~ → **`currentFactionIndex: number`** - Index into `activeFactions` array
- ~~`winner: 'red' | 'black' | null`~~ → **`winner: string | null`** - Winning faction ID (null if not ended)
- `board: Board` - Current board state (32 or 45 elements, varies by mode)
- ~~`redCaptured: Piece[]`~~
- ~~`blackCaptured: Piece[]`~~
- **`mode: GameMode`** (NEW) - Current game mode
- **`factions: Faction[]`** (NEW) - All factions in this match (length 2 or 3)
- **`activeFactions: string[]`** (NEW) - Non-eliminated faction IDs (for turn rotation)
- **`capturedByFaction: Record<string, Piece[]>`** (NEW) - Captured pieces per faction
- **`movesWithoutCapture: number | null`** (NEW) - Draw counter (null for Classic, 60 for Three Kingdoms)

**Validation Rules**:
- `status` must be valid enum value
- `currentFactionIndex` must be valid index into `activeFactions` (0 to length-1)
- `winner` is null unless `status === 'ended'`
- `board` must be valid Board structure with size matching `mode.boardSize`
- `factions.length` must match `mode.playerCount`
- `activeFactions` is subset of `factions.map(f => f.id)`
- `capturedByFaction` keys must match `factions.map(f => f.id)`
- `movesWithoutCapture` is null for Classic, 60 at start for Three Kingdoms

**State Transitions**:

1. **'waiting-first-flip' → 'in-progress'**:
   - Trigger: First piece is flipped
   - `currentFactionIndex` set to index of flipped piece's faction in `activeFactions`

2. **'in-progress' → 'in-progress'** (turn rotation):
   - Trigger: After each action (flip/move/capture)
   - `currentFactionIndex = (currentFactionIndex + 1) % activeFactions.length`
   - Skip eliminated factions (removed from `activeFactions`)

3. **'in-progress' → 'ended'** (win condition):
   - Trigger: Win condition detected
   - Capture-all: One faction captured all opponent pieces
   - Elimination: Only one faction remains in `activeFactions`
   - Draw: `movesWithoutCapture` reaches 0 (Three Kingdoms only)
   - Stalemate: Current faction has no legal moves

**Examples**:
```typescript
// Classic match
const classicMatch: Match = {
  status: 'in-progress',
  mode: CLASSIC_MODE,
  factions: [RED_FACTION, BLACK_FACTION],
  activeFactions: ['red', 'black'],
  currentFactionIndex: 0, // Red's turn
  winner: null,
  board: [...], // 32 elements
  capturedByFaction: {
    red: [], // Pieces captured by red
    black: [], // Pieces captured by black
  },
  movesWithoutCapture: null, // Classic has no draw counter
};

// Three Kingdoms match
const tkMatch: Match = {
  status: 'in-progress',
  mode: THREE_KINGDOMS_MODE,
  factions: [TEAM_A_FACTION, TEAM_B_FACTION, TEAM_C_FACTION],
  activeFactions: ['team-a', 'team-b', 'team-c'],
  currentFactionIndex: 1, // Team B's turn
  winner: null,
  board: [...], // 45 elements (32 pieces + 13 nulls)
  capturedByFaction: {
    'team-a': [piece1, piece2],
    'team-b': [],
    'team-c': [piece3],
  },
  movesWithoutCapture: 45, // Countdown from 60
};

// Three Kingdoms match with one faction eliminated
const tkMatchEliminated: Match = {
  status: 'in-progress',
  mode: THREE_KINGDOMS_MODE,
  factions: [
    { ...TEAM_A_FACTION, isEliminated: false },
    { ...TEAM_B_FACTION, isEliminated: true }, // Eliminated!
    { ...TEAM_C_FACTION, isEliminated: false },
  ],
  activeFactions: ['team-a', 'team-c'], // Team B removed
  currentFactionIndex: 0, // Rotates between Team A and Team C only
  winner: null,
  board: [...],
  capturedByFaction: {
    'team-a': [/* 10 Team B pieces */],
    'team-b': [],
    'team-c': [],
  },
  movesWithoutCapture: 60, // Reset after last capture
};
```

---

### RuleSet (NEW - Interface)

Abstract interface for pluggable rule systems.

**Methods**:

```typescript
export interface RuleSet {
  /**
   * Validate if a move action is legal
   */
  validateMove(match: Match, fromIndex: number, toIndex: number): ValidationResult;

  /**
   * Validate if a capture action is legal
   */
  validateCapture(match: Match, fromIndex: number, toIndex: number): ValidationResult;

  /**
   * Check if game has ended and determine winner
   */
  checkWinCondition(match: Match): WinResult;

  /**
   * Check if game should end in a draw (Three Kingdoms only)
   */
  checkDrawCondition(match: Match): boolean;

  /**
   * Get all legal moves for current faction
   */
  getLegalMoves(match: Match): LegalMoveSet;

  /**
   * Get adjacent indices for a given position
   * (varies by board topology: cells vs intersections)
   */
  getAdjacentIndices(index: number, boardSize: number): number[];

  /**
   * Check if attacker piece can capture target piece
   * (rank hierarchy for Classic, no hierarchy for Three Kingdoms)
   */
  canPieceCapture(attacker: Piece, target: Piece): boolean;
}
```

**Implementations**:
- **ClassicRules**: 2-player logic with rank hierarchy, no draw counter
- **ThreeKingdomsRules**: 3-player logic without rank hierarchy, draw counter, modified movement

---

### Action (UNCHANGED)

Represents a single turn action.

**Type**: `'flip' | 'move' | 'capture'`

**Fields** (varies by type):
- `type: 'flip'` - `{ type: 'flip', pieceIndex: number }`
- `type: 'move'` - `{ type: 'move', fromIndex: number, toIndex: number }`
- `type: 'capture'` - `{ type: 'capture', fromIndex: number, toIndex: number }`

**Validation Rules**:
- Exactly one action per turn
- `pieceIndex`/`fromIndex` must be valid board index
- `toIndex` must be valid board index
- Actions must pass RuleSet validation before execution

---

## Relationships

```text
GameMode (1) ──────────────> RuleSet (1)
                   uses

Match (1) ──────────────> GameMode (1)
         │                references
         │
         ├────────────> Board (1)
         │              contains
         │
         └────────────> Faction (2-3)
                        has

Board (1) ──────────────> Piece (0-45)
                          contains

Piece (1) ──────────────> Faction (1)
                          belongs to

Match.capturedByFaction ──> Piece (0-N per faction)
                            tracks
```

**Key Relationships**:
- **Match** contains one **GameMode** (1:1) - determines board size, player count, rules
- **Match** contains one **Board** (1:1) - size varies by mode
- **Match** contains 2-3 **Faction** entities (1:2 for Classic, 1:3 for Three Kingdoms)
- **Board** contains 0-N **Piece** references (32 for Classic, 45 for Three Kingdoms, may include nulls)
- **Piece** belongs to one **Faction** (via `factionId`)
- **Match** tracks captured pieces per faction (via `capturedByFaction`)

---

## Data Flow

### 1. Match Initialization

```text
1. User selects GameMode (e.g., "three-kingdoms")
2. System creates Match:
   - Set mode = THREE_KINGDOMS_MODE
   - Create 3 Factions (Team A, Team B, Team C)
   - Set activeFactions = ["team-a", "team-b", "team-c"]
   - Create 32 Pieces (12 + 10 + 10 distribution)
   - Shuffle pieces randomly
   - Place pieces on board (45 positions: 32 pieces + 13 nulls)
   - Set movesWithoutCapture = 60
   - Set status = 'waiting-first-flip'
```

### 2. First Flip

```text
1. Player taps face-down piece at index
2. System validates flip action:
   - validateFlip(match, index) → { isValid: true }
3. System executes flip:
   - piece.isRevealed = true
   - match.status = 'in-progress'
   - match.currentFactionIndex = indexOf(piece.factionId in activeFactions)
4. Turn starts for flipped piece's faction
```

### 3. Turn Actions (Flip, Move, Capture)

#### Flip
```text
1. Player taps face-down piece
2. Validate: validateFlip(match, index)
3. Execute: piece.isRevealed = true
4. Decrement draw counter (Three Kingdoms only): movesWithoutCapture--
5. Rotate turn: currentFactionIndex = (currentFactionIndex + 1) % activeFactions.length
```

#### Move
```text
1. Player selects piece A and taps empty position B
2. Validate: validateMove(match, fromIndex, toIndex)
3. Execute:
   - board[toIndex] = board[fromIndex]
   - board[fromIndex] = null
4. Decrement draw counter (Three Kingdoms only): movesWithoutCapture--
5. Rotate turn
```

#### Capture
```text
1. Player selects piece A and taps opponent piece B
2. Validate: validateCapture(match, fromIndex, toIndex)
3. Execute:
   - target.isDead = true
   - capturedByFaction[attacker.factionId].push(target)
   - board[toIndex] = attacker
   - board[fromIndex] = null
   - movesWithoutCapture = 60 (reset for Three Kingdoms)
4. Check win condition
5. If not ended, rotate turn
```

### 4. Faction Elimination

```text
1. After capture, check if target faction has 0 pieces remaining on board
2. If yes:
   - faction.isEliminated = true
   - Remove faction ID from activeFactions array
3. If only 1 faction remains in activeFactions:
   - match.status = 'ended'
   - match.winner = activeFactions[0]
```

### 5. Win/Draw Detection

#### Capture-All Victory (Classic & Three Kingdoms)
```text
1. After each capture, count pieces on board per faction
2. If one faction captured all opponent pieces:
   - match.status = 'ended'
   - match.winner = victorious faction ID
```

#### Elimination Victory (Three Kingdoms only)
```text
1. After each capture/elimination, check activeFactions.length
2. If activeFactions.length === 1:
   - match.status = 'ended'
   - match.winner = activeFactions[0]
```

#### Draw (Three Kingdoms only)
```text
1. After each non-capture action, check movesWithoutCapture
2. If movesWithoutCapture === 0:
   - match.status = 'ended'
   - match.winner = null (draw)
```

#### Stalemate (Classic & Three Kingdoms)
```text
1. At start of turn, get legal moves: getLegalMoves(match)
2. If flips.length === 0 && moves.length === 0 && captures.length === 0:
   - Current faction has no legal moves
   - Classic: Opponent wins
   - Three Kingdoms: Current faction is eliminated, removed from activeFactions
```

---

## Constraints

### General Constraints
- Board size must match `GameMode.boardSize` (32 or 45)
- No duplicate piece IDs within a Match
- All `factionId` values must reference valid factions in `Match.factions`
- `activeFactions` must be a subset of `factions.map(f => f.id)`
- `currentFactionIndex` must be valid index into `activeFactions`

### Classic Mode Constraints
- Exactly 2 factions (red, black)
- Exactly 32 pieces (16 per faction)
- Board has 32 positions (8 rows × 4 cols)
- No draw counter (`movesWithoutCapture = null`)
- Rank hierarchy enforced (King > Guard > ... > Pawn)
- King vs Pawn exception applies

### Three Kingdoms Mode Constraints
- Exactly 3 factions (team-a, team-b, team-c)
- Exactly 32 pieces (12 + 10 + 10 distribution)
- Board has 45 positions (9 rows × 5 cols)
- 13 empty positions (nulls) at start
- Draw counter starts at 60, resets to 60 on capture
- No rank hierarchy (any piece captures any opponent piece)
- No King vs Pawn exception
- Generals move infinite steps (like Rooks)
- Ministers and Horses move without blocking checks

---

## Migration Guide (Classic → Multi-Mode)

### Code Changes

```typescript
// OLD: Classic-only Piece
interface Piece {
  color: 'red' | 'black'; // ❌ Remove this
}

// NEW: Multi-mode Piece
interface Piece {
  factionId: string; // ✅ Add this
}

// OLD: Classic-only Match
interface Match {
  currentTurn: 'red' | 'black' | null; // ❌ Remove this
  winner: 'red' | 'black' | null; // ❌ Remove this
  redCaptured: Piece[]; // ❌ Remove this
  blackCaptured: Piece[]; // ❌ Remove this
}

// NEW: Multi-mode Match
interface Match {
  mode: GameMode; // ✅ Add this
  factions: Faction[]; // ✅ Add this
  activeFactions: string[]; // ✅ Add this
  currentFactionIndex: number; // ✅ Add this
  winner: string | null; // ✅ Change to string
  capturedByFaction: Record<string, Piece[]>; // ✅ Add this
  movesWithoutCapture: number | null; // ✅ Add this
}
```

### Data Migration

```typescript
// Helper: Migrate Classic Match to Multi-Mode
function migrateClassicMatch(oldMatch: OldMatch): Match {
  const mode = GAME_MODES.classic;
  
  const redFaction: Faction = {
    id: 'red',
    displayName: '紅方',
    color: 'red',
    pieceCount: 16,
    isEliminated: false,
  };
  
  const blackFaction: Faction = {
    id: 'black',
    displayName: '黑方',
    color: 'black',
    pieceCount: 16,
    isEliminated: false,
  };
  
  // Migrate pieces: add factionId based on old color
  const newBoard = oldMatch.board.map(piece => {
    if (piece === null) return null;
    return {
      ...piece,
      factionId: piece.color, // "red" or "black"
    };
  });
  
  return {
    status: oldMatch.status,
    mode,
    factions: [redFaction, blackFaction],
    activeFactions: ['red', 'black'],
    currentFactionIndex: oldMatch.currentTurn === 'red' ? 0 : 1,
    winner: oldMatch.winner,
    board: newBoard,
    capturedByFaction: {
      red: oldMatch.redCaptured.map(p => ({ ...p, factionId: 'black' })),
      black: oldMatch.blackCaptured.map(p => ({ ...p, factionId: 'red' })),
    },
    movesWithoutCapture: null, // Classic has no draw counter
  };
}
```

---

## Examples

### Complete Match Lifecycle (Three Kingdoms)

```typescript
// 1. Initialize Match
const match: Match = {
  status: 'waiting-first-flip',
  mode: GAME_MODES.threeKingdoms,
  factions: [
    { id: 'team-a', displayName: '將軍軍', color: 'green', pieceCount: 12, isEliminated: false },
    { id: 'team-b', displayName: '紅方輔臣', color: 'red', pieceCount: 10, isEliminated: false },
    { id: 'team-c', displayName: '黑方輔臣', color: 'black', pieceCount: 10, isEliminated: false },
  ],
  activeFactions: ['team-a', 'team-b', 'team-c'],
  currentFactionIndex: 0, // Not used until first flip
  winner: null,
  board: [/* 32 pieces shuffled across 45 positions */],
  capturedByFaction: { 'team-a': [], 'team-b': [], 'team-c': [] },
  movesWithoutCapture: 60,
};

// 2. First Flip (Player A flips a Team A General)
const afterFlip = executeFlip(match, 12);
// Result:
// - board[12].isRevealed = true
// - status = 'in-progress'
// - currentFactionIndex = 0 (Team A's turn)
// - movesWithoutCapture = 59 (decremented)

// 3. Player A Moves General (non-capture)
const afterMove = executeMove(afterFlip, 12, 13);
// Result:
// - board[13] = General piece
// - board[12] = null
// - currentFactionIndex = 1 (Team B's turn)
// - movesWithoutCapture = 58

// 4. Player B Flips and Reveals a Team B Cannon
const afterFlipB = executeFlip(afterMove, 30);
// Result:
// - board[30].isRevealed = true
// - currentFactionIndex = 2 (Team C's turn)
// - movesWithoutCapture = 57

// 5. Player C Captures Team A piece with Team C Horse
const afterCapture = executeCapture(afterFlipB, 5, 13); // Horse captures General!
// Result:
// - board[13].isDead = true
// - capturedByFaction['team-c'].push(General)
// - board[13] = Horse piece
// - board[5] = null
// - movesWithoutCapture = 60 (RESET!)
// - currentFactionIndex = 0 (Team A's turn again)

// 6. Eventually, Team B is eliminated (all pieces captured)
// activeFactions = ['team-a', 'team-c']
// Turn rotation now: Team A → Team C → Team A

// 7. Final elimination: Team C captures all Team A pieces
// activeFactions.length === 1 → Game ends
// match.status = 'ended'
// match.winner = 'team-c'
```

---

**Data Model Version**: 2.0.0  
**Created**: 2026-01-22  
**Status**: ✅ Complete and ready for implementation
