# Contract: RuleSet Interface

**Type**: Core Game Logic Interface  
**Package**: `src/core/RuleSet.ts`  
**Purpose**: Abstract interface for pluggable rule systems (Classic, Three Kingdoms, future variants)

---

## Interface Definition

```typescript
import { Match, ValidationResult, WinResult, LegalMoveSet, Piece } from './types';

export interface RuleSet {
  /**
   * Validate if a move action is legal
   * 
   * @param match - Current match state
   * @param fromIndex - Source position index
   * @param toIndex - Destination position index (must be empty)
   * @returns Validation result with error message if invalid
   * 
   * @example
   * const result = ruleSet.validateMove(match, 10, 11);
   * if (!result.isValid) {
   *   console.error(result.error); // "Destination not adjacent"
   * }
   */
  validateMove(match: Match, fromIndex: number, toIndex: number): ValidationResult;

  /**
   * Validate if a capture action is legal
   * 
   * @param match - Current match state
   * @param fromIndex - Attacker position index
   * @param toIndex - Target position index (must contain opponent piece)
   * @returns Validation result with error message if invalid
   * 
   * @example
   * const result = ruleSet.validateCapture(match, 5, 6);
   * if (!result.isValid) {
   *   console.error(result.error); // "Invalid capture: rank too low"
   * }
   */
  validateCapture(match: Match, fromIndex: number, toIndex: number): ValidationResult;

  /**
   * Check if game has ended and determine winner
   * 
   * @param match - Current match state
   * @returns Win result with winner and reason if game ended
   * 
   * @example
   * const result = ruleSet.checkWinCondition(match);
   * if (result.hasEnded) {
   *   console.log(`Winner: ${result.winner}, Reason: ${result.reason}`);
   *   // "Winner: team-a, Reason: elimination"
   * }
   */
  checkWinCondition(match: Match): WinResult;

  /**
   * Check if game should end in a draw
   * 
   * Note: Only applicable to Three Kingdoms (60-move rule).
   * Classic mode always returns false.
   * 
   * @param match - Current match state
   * @returns True if draw condition met (movesWithoutCapture === 0)
   * 
   * @example
   * const isDraw = ruleSet.checkDrawCondition(match);
   * if (isDraw) {
   *   // End game with no winner
   * }
   */
  checkDrawCondition(match: Match): boolean;

  /**
   * Get all legal moves for current faction
   * 
   * @param match - Current match state
   * @returns Set of legal flips, moves, and captures
   * 
   * @example
   * const legalMoves = ruleSet.getLegalMoves(match);
   * console.log(`Flips: ${legalMoves.flips.length}`); // 5
   * console.log(`Moves: ${legalMoves.moves.length}`); // 12
   * console.log(`Captures: ${legalMoves.captures.length}`); // 3
   */
  getLegalMoves(match: Match): LegalMoveSet;

  /**
   * Get adjacent indices for a given position
   * 
   * Adjacency varies by board topology:
   * - Classic: Up/Down/Left/Right in 8x4 grid
   * - Three Kingdoms: Up/Down/Left/Right in 9x5 grid
   * 
   * @param index - Current position index
   * @param boardSize - Total board size (32 for Classic, 45 for Three Kingdoms)
   * @returns Array of adjacent position indices
   * 
   * @example
   * // Classic mode, position 10 (row 2, col 2)
   * const adjacent = classicRules.getAdjacentIndices(10, 32);
   * // Returns: [6, 14, 9, 11] (up, down, left, right)
   */
  getAdjacentIndices(index: number, boardSize: number): number[];

  /**
   * Check if attacker piece can capture target piece
   * 
   * Rules vary by mode:
   * - Classic: Rank hierarchy (King > Guard > ... > Pawn), King vs Pawn exception
   * - Three Kingdoms: No rank hierarchy (any piece captures any opponent piece)
   * 
   * @param attacker - Attacking piece
   * @param target - Target piece (must be opponent)
   * @returns True if capture is allowed by rank/rules
   * 
   * @example
   * // Classic mode
   * const canCapture = classicRules.canPieceCapture(king, pawn);
   * // Returns: false (King cannot capture Pawn)
   * 
   * // Three Kingdoms mode
   * const canCapture = tkRules.canPieceCapture(soldier, general);
   * // Returns: true (no rank hierarchy)
   */
  canPieceCapture(attacker: Piece, target: Piece): boolean;
}
```

---

## Validation Rules

### validateMove

**Preconditions**:
- `match.status === 'in-progress'`
- `fromIndex` and `toIndex` are valid board indices
- `board[fromIndex]` is not null
- `board[fromIndex].isRevealed === true`
- `board[fromIndex].factionId === activeFactions[currentFactionIndex]`
- `board[toIndex] === null` (destination is empty)

**Validation Checks**:
1. Match status is 'in-progress'
2. Source has piece
3. Source piece is revealed
4. Source piece belongs to current faction
5. Destination is adjacent (via `getAdjacentIndices`)
6. Destination is empty

**Returns**:
- `{ isValid: true }` if all checks pass
- `{ isValid: false, error: string }` with specific error message

**Error Messages**:
- "Match not in progress"
- "No piece at source index"
- "Piece not revealed"
- "Not current faction's turn"
- "Destination not adjacent"
- "Destination not empty"

---

### validateCapture

**Preconditions**:
- `match.status === 'in-progress'`
- `fromIndex` and `toIndex` are valid board indices
- `board[fromIndex]` is not null (attacker exists)
- `board[fromIndex].isRevealed === true`
- `board[fromIndex].factionId === activeFactions[currentFactionIndex]`
- `board[toIndex]` is not null (target exists)
- `board[toIndex].isRevealed === true`
- `board[toIndex].factionId !== board[fromIndex].factionId` (different factions)

**Validation Checks (Classic)**:
1. Match status is 'in-progress'
2. Attacker exists and is revealed
3. Attacker belongs to current faction
4. Target exists and is revealed
5. Target belongs to different faction
6. **Special case: Cannon**
   - Target must be in straight line (same row or column)
   - Target must NOT be adjacent
   - Exactly one piece (screen) between Cannon and target
7. **Non-Cannon pieces**
   - Target must be adjacent
   - **Special case: King vs Pawn**
     - Pawn CAN capture King (allowed)
     - King CANNOT capture Pawn (exception)
   - **Standard rank hierarchy**
     - Attacker rank must be >= target rank

**Validation Checks (Three Kingdoms)**:
1. Match status is 'in-progress'
2. Attacker exists and is revealed
3. Attacker belongs to current faction
4. Target exists and is revealed
5. Target belongs to different faction
6. **Special case: Cannon**
   - Same as Classic (straight line, screen, not adjacent)
7. **Non-Cannon pieces**
   - Target must be adjacent
   - **NO rank hierarchy** (any piece captures any piece)

**Returns**:
- `{ isValid: true }` if all checks pass
- `{ isValid: false, error: string }` with specific error message

**Error Messages**:
- "Match not in progress"
- "No piece at attacker index"
- "Attacker not revealed"
- "Not current faction's turn"
- "No piece at target index"
- "Target not revealed"
- "Target is own piece"
- "Cannon target not in straight line"
- "Cannon cannot capture adjacent piece"
- "Cannon requires exactly one screen to capture"
- "Target not adjacent"
- "King cannot capture Pawn" (Classic only)
- "Invalid capture: rank too low" (Classic only)

---

### checkWinCondition

**Checks (Classic)**:
1. **Capture-all**: One faction captured all 16 opponent pieces
2. **Stalemate**: Current faction has no legal moves (opponent wins)

**Checks (Three Kingdoms)**:
1. **Capture-all**: One faction captured all opponent pieces (rare)
2. **Elimination**: Only one faction remains in `activeFactions` (most common)
3. **Stalemate**: Current faction has no legal moves → eliminated, removed from `activeFactions`

**Returns**:
- `{ hasEnded: false }` if game continues
- `{ hasEnded: true, winner: string, reason: 'capture-all' | 'elimination' | 'stalemate' }`

---

### checkDrawCondition

**Checks (Classic)**:
- Always returns `false` (no draw rule)

**Checks (Three Kingdoms)**:
- Returns `true` if `movesWithoutCapture === 0`
- Returns `false` otherwise

**Returns**: `boolean`

---

### getLegalMoves

**Returns**: `LegalMoveSet` object with:
- `flips: number[]` - Indices of face-down pieces
- `moves: Array<{ fromIndex, toIndex }>` - Valid move actions
- `captures: Array<{ fromIndex, toIndex }>` - Valid capture actions

**Algorithm**:
1. If match ended or no current faction → return empty set
2. Find all face-down pieces → add to `flips`
3. For each piece belonging to current faction:
   - For each adjacent cell:
     - If empty → validate move, add to `moves`
     - If opponent piece → validate capture, add to `captures`
   - For Cannon pieces:
     - Check all positions in straight lines (same row/column)
     - Validate cannon capture (screen check), add to `captures`

---

### getAdjacentIndices

**Classic Mode (8 rows × 4 cols)**:
```
Index calculation: index = row * 4 + col

Adjacent positions (Up, Down, Left, Right):
- Up: index - 4 (if row > 0)
- Down: index + 4 (if row < 7)
- Left: index - 1 (if col > 0)
- Right: index + 1 (if col < 3)
```

**Three Kingdoms Mode (9 rows × 5 cols)**:
```
Index calculation: index = row * 5 + col

Adjacent positions (Up, Down, Left, Right):
- Up: index - 5 (if row > 0)
- Down: index + 5 (if row < 8)
- Left: index - 1 (if col > 0)
- Right: index + 1 (if col < 4)
```

**Returns**: `number[]` (0 to 4 adjacent indices)

---

### canPieceCapture

**Classic Mode Logic**:
```typescript
// Special case: Cannon ignores rank
if (attacker.type === 'Cannon') return true;

// Special case: King vs Pawn
if (attacker.type === 'King' && target.type === 'Pawn') return false; // ❌
if (attacker.type === 'Pawn' && target.type === 'King') return true; // ✅

// Standard rank hierarchy
const ranks = {
  King: 7, Guard: 6, Minister: 5, Rook: 4,
  Horse: 3, Cannon: 2, Pawn: 1,
};
return ranks[attacker.type] >= ranks[target.type];
```

**Three Kingdoms Mode Logic**:
```typescript
// Cannon still requires screen check (handled in validateCapture)
if (attacker.type === 'Cannon') return true;

// No rank hierarchy - any piece captures any piece
return true;
```

---

## Implementation Requirements

### ClassicRules

- Implements all RuleSet methods
- Board size: 32 (8 rows × 4 cols)
- Adjacency: 4-directional (up/down/left/right)
- Rank hierarchy enforced
- King vs Pawn exception applied
- No draw counter

### ThreeKingdomsRules

- Implements all RuleSet methods
- Board size: 45 (9 rows × 5 cols)
- Adjacency: 4-directional (up/down/left/right)
- **NO** rank hierarchy
- **NO** King vs Pawn exception
- Draw counter management (60 moves)
- Modified piece movement:
  - Generals: Infinite straight movement (like Rooks)
  - Ministers: Jump 2 diagonals WITHOUT blocking
  - Horses: Knight L-shape WITHOUT blocking

---

## Testing Requirements

### Unit Tests (per implementation)

```typescript
describe('ClassicRules', () => {
  it('should validate move to adjacent empty cell', () => {
    const result = classicRules.validateMove(match, 10, 11);
    expect(result.isValid).toBe(true);
  });

  it('should reject move to non-adjacent cell', () => {
    const result = classicRules.validateMove(match, 10, 20);
    expect(result).toEqual({ isValid: false, error: 'Destination not adjacent' });
  });

  it('should enforce rank hierarchy in captures', () => {
    const pawn = { type: 'Pawn', factionId: 'red' };
    const king = { type: 'King', factionId: 'black' };
    expect(classicRules.canPieceCapture(pawn, king)).toBe(true); // Pawn can capture King
    expect(classicRules.canPieceCapture(king, pawn)).toBe(false); // King cannot capture Pawn
  });

  it('should validate Cannon capture with screen', () => {
    // Setup: Cannon at index 5, screen at index 10, target at index 15
    const result = classicRules.validateCapture(match, 5, 15);
    expect(result.isValid).toBe(true);
  });

  it('should detect capture-all victory', () => {
    // Setup: Red captured all 16 black pieces
    const result = classicRules.checkWinCondition(match);
    expect(result).toEqual({ hasEnded: true, winner: 'red', reason: 'capture-all' });
  });
});

describe('ThreeKingdomsRules', () => {
  it('should allow any piece to capture any opponent piece', () => {
    const soldier = { type: 'Pawn', factionId: 'team-a' };
    const general = { type: 'King', factionId: 'team-b' };
    expect(tkRules.canPieceCapture(soldier, general)).toBe(true); // ✅ No rank hierarchy
    expect(tkRules.canPieceCapture(general, soldier)).toBe(true); // ✅ No exception
  });

  it('should detect draw when movesWithoutCapture reaches 0', () => {
    match.movesWithoutCapture = 0;
    expect(tkRules.checkDrawCondition(match)).toBe(true);
  });

  it('should detect elimination victory when only one faction remains', () => {
    match.activeFactions = ['team-c'];
    const result = tkRules.checkWinCondition(match);
    expect(result).toEqual({ hasEnded: true, winner: 'team-c', reason: 'elimination' });
  });

  it('should handle 9x5 adjacency correctly', () => {
    const adjacent = tkRules.getAdjacentIndices(22, 45); // Middle position (row 4, col 2)
    expect(adjacent).toContain(17); // Up
    expect(adjacent).toContain(27); // Down
    expect(adjacent).toContain(21); // Left
    expect(adjacent).toContain(23); // Right
    expect(adjacent).toHaveLength(4);
  });
});
```

### Integration Tests

```typescript
describe('RuleSet Integration', () => {
  it('should switch rule sets when mode changes', () => {
    store.setMode(GAME_MODES.classic);
    expect(store.match.mode.ruleSet).toBeInstanceOf(ClassicRules);
    
    store.setMode(GAME_MODES.threeKingdoms);
    expect(store.match.mode.ruleSet).toBeInstanceOf(ThreeKingdomsRules);
  });

  it('should use mode-specific adjacency in move validation', () => {
    // Test that ClassicRules uses 8x4 adjacency
    // Test that ThreeKingdomsRules uses 9x5 adjacency
  });
});
```

---

## Performance Requirements

- `validateMove`: < 5ms per call
- `validateCapture`: < 10ms per call (includes screen check for Cannon)
- `getLegalMoves`: < 50ms per call (scans entire board)
- `checkWinCondition`: < 10ms per call
- `getAdjacentIndices`: < 1ms per call (simple calculation)

---

**Contract Version**: 1.0.0  
**Created**: 2026-01-22  
**Status**: ✅ Complete and ready for implementation
