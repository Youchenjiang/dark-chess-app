# Data Model: Classic Dark Chess (Banqi)

**Date**: 2025-01-27  
**Feature**: `specs/001-banqi-game-rules/spec.md`

## Entities

### Piece

Represents a single game piece on the board.

**Fields**:
- `id: string` - Unique identifier (e.g., "red-king-1", "black-pawn-3")
- `type: PieceType` - Enum: 'King' | 'Guard' | 'Minister' | 'Rook' | 'Horse' | 'Cannon' | 'Pawn'
- `color: 'red' | 'black'` - Piece color (determines side)
- `isRevealed: boolean` - Whether piece is face-up (true) or face-down (false)
- `isDead: boolean` - Whether piece has been captured (true) or is alive (false)

**Validation Rules**:
- `id` must be unique across all pieces
- `type` must be valid PieceType
- `color` must be 'red' or 'black'
- `isRevealed` defaults to false at match start
- `isDead` defaults to false at match start

**State Transitions**:
- `isRevealed: false → true` - When piece is flipped (FR-006)
- `isDead: false → true` - When piece is captured (FR-008, FR-009, FR-010)
- No reverse transitions (once revealed/dead, stays that way)

### Board

Represents the 4x8 game board grid.

**Structure**: `Array<Piece | null>` (length 32)

**Indices**: 0-31 (1D array representation)
- Row calculation: `row = Math.floor(index / 8)`
- Column calculation: `col = index % 8`
- Index calculation: `index = row * 8 + col`

**Validation Rules**:
- Must contain exactly 32 cells
- At match start: all 32 cells contain pieces (no nulls)
- After captures: cells may be null (empty squares)
- Each piece must have unique `id`

**State Transitions**:
- Initial state: 32 pieces, all `isRevealed: false`, randomly shuffled
- After flip: piece at index has `isRevealed: true`
- After move: piece moves from index A to index B (B was null)
- After capture: attacker moves to target index, target piece has `isDead: true`

### Match

Represents a complete game session.

**Fields**:
- `status: 'waiting-first-flip' | 'in-progress' | 'ended'` - Match state
- `currentTurn: 'red' | 'black' | null` - Current player (null before first flip)
- `winner: 'red' | 'black' | null` - Winner (null if not ended)
- `board: Board` - Current board state (32-element array)
- `redCaptured: Piece[]` - Pieces captured by red player
- `blackCaptured: Piece[]` - Pieces captured by black player

**Validation Rules**:
- `status` must be valid enum value
- `currentTurn` is null only when `status === 'waiting-first-flip'`
- `winner` is null unless `status === 'ended'`
- `board` must be valid Board structure
- Captured arrays contain only pieces with `isDead: true`

**State Transitions**:
- `'waiting-first-flip'` → `'in-progress'`: When first piece is flipped, `currentTurn` set to flipped piece color
- `'in-progress'` → `'ended'`: When win condition detected (FR-012)
  - Win by capture: One player's captured array contains all 16 opponent pieces
  - Win by stalemate: Current player has no legal moves

### Player

Represents a game participant.

**Fields**:
- `side: 'red' | 'black'` - Assigned side (determined by first flip)
- `name: string` - Optional player name (for future use)

**Validation Rules**:
- `side` must be 'red' or 'black'
- Side assignment happens once (on first flip) and cannot change

**Relationships**:
- Player controls all pieces matching their `side` color
- Player can only flip/move/capture pieces of their own color

### Action

Represents a single turn action.

**Type**: `'flip' | 'move' | 'capture'`

**Fields** (varies by type):
- `type: 'flip'` - `{ type: 'flip', pieceIndex: number }`
- `type: 'move'` - `{ type: 'move', fromIndex: number, toIndex: number }`
- `type: 'capture'` - `{ type: 'capture', fromIndex: number, toIndex: number }`

**Validation Rules**:
- Exactly one action per turn (FR-005)
- `pieceIndex`/`fromIndex` must be valid board index (0-31)
- `toIndex` must be valid board index (0-31)
- Actions must pass GameEngine validation before execution

## Relationships

- **Match** contains one **Board** (1:1)
- **Board** contains 32 **Piece** references (1:32, may include nulls after captures)
- **Match** tracks two **Player** sides (red and black)
- **Match** contains captured pieces arrays (redCaptured, blackCaptured)
- **Action** operates on **Board** state and **Piece** entities

## Data Flow

1. **Match Initialization**:
   - Create 32 Piece objects (16 red, 16 black)
   - Shuffle pieces randomly
   - Place all pieces face-down on board (indices 0-31)
   - Set match status to 'waiting-first-flip'

2. **First Flip**:
   - Player selects face-down piece at index
   - Piece.isRevealed = true
   - Match.currentTurn = piece.color
   - Match.status = 'in-progress'

3. **Turn Actions**:
   - Flip: Piece.isRevealed = true
   - Move: Piece moves from fromIndex to toIndex (board[toIndex] = board[fromIndex], board[fromIndex] = null)
   - Capture: Target piece.isDead = true, target added to capturer's captured array, attacker moves to target index

4. **Win Detection**:
   - Check after each capture: if one player captured all 16 opponent pieces → win
   - Check at turn start: if current player has no legal moves → stalemate win for opponent

## Constraints

- Board must always have exactly 32 cells (some may be null after captures)
- No duplicate piece IDs
- Pieces cannot be moved/captured if face-down (except flip action)
- Players can only control pieces matching their assigned side
