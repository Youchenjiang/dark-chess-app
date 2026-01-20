# Game Engine API Contracts

**Date**: 2025-01-27  
**Feature**: `specs/001-banqi-game-rules/spec.md`

## Core Logic Functions

These functions are pure TypeScript with zero UI dependencies. They operate on board state and return new state or validation results.

### `validateFlip(match: Match, pieceIndex: number): ValidationResult`

Validates if a flip action is legal.

**Parameters**:
- `match: Match` - Current match state
- `pieceIndex: number` - Board index (0-31) of piece to flip

**Returns**: `{ isValid: boolean, error?: string }`

**Validation Rules**:
- Match status must be 'waiting-first-flip' or 'in-progress'
- `pieceIndex` must be valid (0-31)
- Piece at `pieceIndex` must exist and have `isRevealed: false`
- If match status is 'waiting-first-flip', any face-down piece is valid
- If match status is 'in-progress', any face-down piece is valid (no color restriction)

**Errors**:
- `"Invalid piece index"` - Index out of bounds
- `"Piece already revealed"` - Piece is already face-up
- `"No piece at index"` - Cell is empty (null)
- `"Match already ended"` - Cannot flip after game ends

### `validateMove(match: Match, fromIndex: number, toIndex: number): ValidationResult`

Validates if a move action is legal.

**Parameters**:
- `match: Match` - Current match state
- `fromIndex: number` - Board index (0-31) of piece to move
- `toIndex: number` - Board index (0-31) of destination

**Returns**: `{ isValid: boolean, error?: string }`

**Validation Rules**:
- Match status must be 'in-progress'
- `fromIndex` and `toIndex` must be valid (0-31)
- Piece at `fromIndex` must exist, be face-up, and match current turn color
- `toIndex` must be orthogonally adjacent to `fromIndex` (1 step horizontal or vertical)
- `toIndex` must be empty (null)

**Errors**:
- `"Invalid indices"` - Indices out of bounds
- `"Match not in progress"` - Match hasn't started or has ended
- `"Not current player's turn"` - Piece color doesn't match currentTurn
- `"Piece not revealed"` - Piece is face-down
- `"Destination not adjacent"` - toIndex is not orthogonally adjacent
- `"Destination not empty"` - toIndex contains a piece

### `validateCapture(match: Match, fromIndex: number, toIndex: number): ValidationResult`

Validates if a capture action is legal according to rank hierarchy and special rules.

**Parameters**:
- `match: Match` - Current match state
- `fromIndex: number` - Board index (0-31) of attacking piece
- `toIndex: number` - Board index (0-31) of target piece

**Returns**: `{ isValid: boolean, error?: string }`

**Validation Rules**:
- Match status must be 'in-progress'
- `fromIndex` and `toIndex` must be valid (0-31)
- Piece at `fromIndex` must exist, be face-up, and match current turn color
- Piece at `toIndex` must exist, be face-up, and match opponent color
- Standard capture: Attacker rank >= target rank (except King vs Pawn, Cannon)
- King vs Pawn: King cannot capture Pawn; Pawn can capture King
- Cannon capture: Must jump over exactly one piece (screen) in straight orthogonal line

**Errors**:
- `"Invalid indices"` - Indices out of bounds
- `"Match not in progress"` - Match hasn't started or has ended
- `"Not current player's turn"` - Attacker color doesn't match currentTurn
- `"Attacker not revealed"` - Attacker piece is face-down
- `"Target not revealed"` - Target piece is face-down
- `"Target is own piece"` - Target color matches attacker color
- `"Invalid capture: rank too low"` - Attacker rank < target rank (standard rule violation)
- `"King cannot capture Pawn"` - King attempting to capture Pawn
- `"Cannon must jump over exactly one piece"` - Cannon capture screen rule violation
- `"Cannon cannot capture adjacent piece"` - Cannon attempting direct 1-step capture

### `executeFlip(match: Match, pieceIndex: number): Match`

Executes a flip action and returns new match state.

**Parameters**:
- `match: Match` - Current match state
- `pieceIndex: number` - Board index (0-31) of piece to flip

**Returns**: New `Match` object with updated state

**Side Effects**: None (pure function)

**Behavior**:
- Creates new Match object (immutable update)
- Sets piece at `pieceIndex` to `isRevealed: true`
- If match status is 'waiting-first-flip':
  - Sets `currentTurn` to flipped piece color
  - Sets `status` to 'in-progress'
- If match status is 'in-progress':
  - Toggles `currentTurn` to opponent color
- Returns new Match object

### `executeMove(match: Match, fromIndex: number, toIndex: number): Match`

Executes a move action and returns new match state.

**Parameters**:
- `match: Match` - Current match state
- `fromIndex: number` - Board index (0-31) of piece to move
- `toIndex: number` - Board index (0-31) of destination

**Returns**: New `Match` object with updated state

**Side Effects**: None (pure function)

**Behavior**:
- Creates new Match object (immutable update)
- Moves piece from `fromIndex` to `toIndex` (board[toIndex] = board[fromIndex], board[fromIndex] = null)
- Toggles `currentTurn` to opponent color
- Returns new Match object

### `executeCapture(match: Match, fromIndex: number, toIndex: number): Match`

Executes a capture action and returns new match state.

**Parameters**:
- `match: Match` - Current match state
- `fromIndex: number` - Board index (0-31) of attacking piece
- `toIndex: number` - Board index (0-31) of target piece

**Returns**: New `Match` object with updated state

**Side Effects**: None (pure function)

**Behavior**:
- Creates new Match object (immutable update)
- Sets target piece `isDead: true`
- Adds target piece to capturer's captured array (redCaptured or blackCaptured)
- Moves attacker from `fromIndex` to `toIndex`
- Sets `board[fromIndex] = null`
- Checks win condition (if all 16 opponent pieces captured, set status to 'ended' and winner)
- If not won, toggles `currentTurn` to opponent color
- Returns new Match object

### `checkWinCondition(match: Match): WinResult`

Checks if match has ended due to win condition.

**Parameters**:
- `match: Match` - Current match state

**Returns**: `{ hasEnded: boolean, winner?: 'red' | 'black', reason?: 'capture-all' | 'stalemate' }`

**Win Conditions**:
- Capture all: One player's captured array contains all 16 opponent pieces
- Stalemate: Current player has no legal moves (no flips available, no valid moves, no valid captures)

**Behavior**:
- Checks capture-all condition first
- If not won, checks stalemate condition
- Returns win result

### `getLegalMoves(match: Match): LegalMoveSet`

Returns all legal actions available to current player.

**Parameters**:
- `match: Match` - Current match state

**Returns**: `{ flips: number[], moves: MoveAction[], captures: CaptureAction[] }`

**Behavior**:
- Scans board for face-down pieces (flips)
- For each face-up piece of current player color, finds valid moves and captures
- Returns complete set of legal actions

## Type Definitions

```typescript
type ValidationResult = {
  isValid: boolean;
  error?: string;
};

type WinResult = {
  hasEnded: boolean;
  winner?: 'red' | 'black';
  reason?: 'capture-all' | 'stalemate';
};

type LegalMoveSet = {
  flips: number[];  // Indices of face-down pieces
  moves: Array<{ fromIndex: number; toIndex: number }>;
  captures: Array<{ fromIndex: number; toIndex: number }>;
};
```
