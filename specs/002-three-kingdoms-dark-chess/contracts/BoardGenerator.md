# Contract: BoardGenerator (Multi-Mode Support)

**Type**: Core Game Logic Module  
**Package**: `src/core/BoardGenerator.ts`  
**Purpose**: Generate initial match state for Classic and Three Kingdoms modes

---

## Function Signatures

### createInitialMatch

```typescript
/**
 * Create a new match with shuffled pieces for the specified game mode
 * 
 * @param mode - Game mode (Classic or Three Kingdoms)
 * @returns New match with status 'waiting-first-flip', pieces shuffled
 * 
 * @example
 * // Classic mode
 * const classicMatch = BoardGenerator.createInitialMatch(GAME_MODES.classic);
 * // Result: 32 pieces on 32-element board, 2 factions
 * 
 * @example
 * // Three Kingdoms mode
 * const tkMatch = BoardGenerator.createInitialMatch(GAME_MODES.threeKingdoms);
 * // Result: 32 pieces on 45-element board (13 nulls), 3 factions
 */
export function createInitialMatch(mode: GameMode): Match;
```

---

## createInitialMatch Implementation

### Algorithm

```text
1. Create factions based on mode.playerCount
   - Classic: 2 factions (red, black)
   - Three Kingdoms: 3 factions (team-a, team-b, team-c)

2. Create pieces based on faction distribution
   - Classic: 16 pieces per faction (32 total)
   - Three Kingdoms: 12 + 10 + 10 pieces (32 total)

3. Initialize board array
   - Classic: length 32, all positions have pieces
   - Three Kingdoms: length 45, 32 positions have pieces, 13 are null

4. Shuffle pieces randomly
   - Fisher-Yates shuffle algorithm
   - Shuffle pieces array before placement
   - For Three Kingdoms: shuffle 45-element array (32 pieces + 13 nulls)

5. Create Match object
   - status: 'waiting-first-flip'
   - currentFactionIndex: 0 (not used until first flip)
   - activeFactions: all faction IDs
   - movesWithoutCapture: null (Classic) or 60 (Three Kingdoms)

6. Return Match
```

### Classic Mode Setup

**Factions**:
```typescript
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
```

**Piece Distribution** (16 per color):
- 1 King (帥/將)
- 2 Guards (仕/士)
- 2 Ministers (相/象)
- 2 Rooks (俥/車)
- 2 Horses (傌/馬)
- 2 Cannons (炮/包)
- 5 Pawns (兵/卒)

**Board**:
- Size: 32 elements
- All positions occupied (no nulls)
- Grid: 8 rows × 4 cols

---

### Three Kingdoms Mode Setup

**Factions**:
```typescript
const teamAFaction: Faction = {
  id: 'team-a',
  displayName: '將軍軍',
  color: 'green',
  pieceCount: 12,
  isEliminated: false,
};

const teamBFaction: Faction = {
  id: 'team-b',
  displayName: '紅方輔臣',
  color: 'red',
  pieceCount: 10,
  isEliminated: false,
};

const teamCFaction: Faction = {
  id: 'team-c',
  displayName: '黑方輔臣',
  color: 'black',
  pieceCount: 10,
  isEliminated: false,
};
```

**Piece Distribution**:

**Team A (12 pieces)**:
- 1 Red General (帥)
- 1 Black General (將)
- 5 Red Soldiers (兵)
- 5 Black Soldiers (卒)

**Team B (10 pieces)**:
- 2 Red Advisors (仕)
- 2 Red Ministers (相)
- 2 Red Rooks (俥)
- 2 Red Horses (傌)
- 2 Red Cannons (炮)

**Team C (10 pieces)**:
- 2 Black Advisors (士)
- 2 Black Ministers (象)
- 2 Black Rooks (車)
- 2 Black Horses (馬)
- 2 Black Cannons (包)

**Board**:
- Size: 45 elements
- 32 positions occupied, 13 positions null (empty)
- Grid: 9 rows × 5 cols (intersection points)

---

## Helper Functions

### createPieces

```typescript
/**
 * Create piece objects for a faction
 * 
 * @param factionId - Faction identifier
 * @param distribution - Piece type distribution (e.g., { King: 1, Pawn: 5 })
 * @param colorSuffix - Optional color suffix for piece IDs (e.g., "-red", "-black")
 * @returns Array of Piece objects
 * 
 * @example
 * const pieces = createPieces('red', {
 *   King: 1,
 *   Guard: 2,
 *   Minister: 2,
 *   Rook: 2,
 *   Horse: 2,
 *   Cannon: 2,
 *   Pawn: 5,
 * });
 * // Returns: Array of 16 Piece objects
 */
function createPieces(
  factionId: string,
  distribution: Record<PieceType, number>,
  colorSuffix?: string
): Piece[];
```

### shuffleArray

```typescript
/**
 * Shuffle array in-place using Fisher-Yates algorithm
 * 
 * @param array - Array to shuffle (modified in-place)
 * @returns Shuffled array (same reference)
 * 
 * @example
 * const arr = [1, 2, 3, 4, 5];
 * shuffleArray(arr);
 * // arr is now shuffled, e.g., [3, 1, 5, 2, 4]
 */
function shuffleArray<T>(array: T[]): T[];
```

**Algorithm** (Fisher-Yates):
```typescript
function shuffleArray<T>(array: T[]): T[] {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]]; // Swap
  }
  return array;
}
```

---

## Validation Rules

### Preconditions
- `mode` must be a valid GameMode object
- `mode.playerCount` must be 2 or 3
- `mode.boardSize` must be 32 or 45

### Postconditions
- Returned Match has `status === 'waiting-first-flip'`
- `board.length === mode.boardSize`
- All pieces have `isRevealed === false` and `isDead === false`
- Piece distribution matches mode requirements:
  - Classic: 32 pieces (16 red, 16 black)
  - Three Kingdoms: 32 pieces (12 team-a, 10 team-b, 10 team-c)
- Three Kingdoms board has exactly 13 null elements
- `activeFactions` contains all faction IDs
- `capturedByFaction` has empty arrays for all factions
- `movesWithoutCapture` is null (Classic) or 60 (Three Kingdoms)

---

## Examples

### Classic Mode

```typescript
import { GAME_MODES } from './GameModes';
import { BoardGenerator } from './BoardGenerator';

const match = BoardGenerator.createInitialMatch(GAME_MODES.classic);

// Result:
// {
//   status: 'waiting-first-flip',
//   mode: GAME_MODES.classic,
//   factions: [
//     { id: 'red', displayName: '紅方', color: 'red', pieceCount: 16, isEliminated: false },
//     { id: 'black', displayName: '黑方', color: 'black', pieceCount: 16, isEliminated: false },
//   ],
//   activeFactions: ['red', 'black'],
//   currentFactionIndex: 0,
//   winner: null,
//   board: [
//     { id: 'red-king-1', type: 'King', factionId: 'red', isRevealed: false, isDead: false },
//     { id: 'black-pawn-3', type: 'Pawn', factionId: 'black', isRevealed: false, isDead: false },
//     // ... 30 more pieces (shuffled)
//   ],
//   capturedByFaction: { red: [], black: [] },
//   movesWithoutCapture: null,
// }
```

### Three Kingdoms Mode

```typescript
import { GAME_MODES } from './GameModes';
import { BoardGenerator } from './BoardGenerator';

const match = BoardGenerator.createInitialMatch(GAME_MODES.threeKingdoms);

// Result:
// {
//   status: 'waiting-first-flip',
//   mode: GAME_MODES.threeKingdoms,
//   factions: [
//     { id: 'team-a', displayName: '將軍軍', color: 'green', pieceCount: 12, isEliminated: false },
//     { id: 'team-b', displayName: '紅方輔臣', color: 'red', pieceCount: 10, isEliminated: false },
//     { id: 'team-c', displayName: '黑方輔臣', color: 'black', pieceCount: 10, isEliminated: false },
//   ],
//   activeFactions: ['team-a', 'team-b', 'team-c'],
//   currentFactionIndex: 0,
//   winner: null,
//   board: [
//     { id: 'team-a-general-red', type: 'King', factionId: 'team-a', isRevealed: false, isDead: false },
//     null, // Empty intersection
//     { id: 'team-b-advisor-1', type: 'Guard', factionId: 'team-b', isRevealed: false, isDead: false },
//     null, // Empty intersection
//     // ... 41 more positions (32 pieces + 13 nulls, shuffled)
//   ],
//   capturedByFaction: { 'team-a': [], 'team-b': [], 'team-c': [] },
//   movesWithoutCapture: 60,
// }
```

---

## Testing Requirements

### Unit Tests

```typescript
describe('BoardGenerator.createInitialMatch', () => {
  describe('Classic Mode', () => {
    it('should create match with 32 pieces on 32-element board', () => {
      const match = BoardGenerator.createInitialMatch(GAME_MODES.classic);
      expect(match.board).toHaveLength(32);
      expect(match.board.filter(p => p !== null)).toHaveLength(32);
    });

    it('should create 2 factions (red, black)', () => {
      const match = BoardGenerator.createInitialMatch(GAME_MODES.classic);
      expect(match.factions).toHaveLength(2);
      expect(match.factions[0].id).toBe('red');
      expect(match.factions[1].id).toBe('black');
    });

    it('should distribute 16 pieces per faction', () => {
      const match = BoardGenerator.createInitialMatch(GAME_MODES.classic);
      const redPieces = match.board.filter(p => p?.factionId === 'red');
      const blackPieces = match.board.filter(p => p?.factionId === 'black');
      expect(redPieces).toHaveLength(16);
      expect(blackPieces).toHaveLength(16);
    });

    it('should set all pieces to face-down (isRevealed: false)', () => {
      const match = BoardGenerator.createInitialMatch(GAME_MODES.classic);
      const revealedPieces = match.board.filter(p => p?.isRevealed === true);
      expect(revealedPieces).toHaveLength(0);
    });

    it('should shuffle pieces randomly (not always same order)', () => {
      const match1 = BoardGenerator.createInitialMatch(GAME_MODES.classic);
      const match2 = BoardGenerator.createInitialMatch(GAME_MODES.classic);
      
      const board1Ids = match1.board.map(p => p?.id);
      const board2Ids = match2.board.map(p => p?.id);
      
      // Very unlikely to have same order if truly shuffled
      expect(board1Ids).not.toEqual(board2Ids);
    });

    it('should set movesWithoutCapture to null (no draw counter)', () => {
      const match = BoardGenerator.createInitialMatch(GAME_MODES.classic);
      expect(match.movesWithoutCapture).toBeNull();
    });
  });

  describe('Three Kingdoms Mode', () => {
    it('should create match with 32 pieces on 45-element board', () => {
      const match = BoardGenerator.createInitialMatch(GAME_MODES.threeKingdoms);
      expect(match.board).toHaveLength(45);
      expect(match.board.filter(p => p !== null)).toHaveLength(32);
    });

    it('should have exactly 13 null (empty) positions', () => {
      const match = BoardGenerator.createInitialMatch(GAME_MODES.threeKingdoms);
      const nullPositions = match.board.filter(p => p === null);
      expect(nullPositions).toHaveLength(13);
    });

    it('should create 3 factions (team-a, team-b, team-c)', () => {
      const match = BoardGenerator.createInitialMatch(GAME_MODES.threeKingdoms);
      expect(match.factions).toHaveLength(3);
      expect(match.factions[0].id).toBe('team-a');
      expect(match.factions[1].id).toBe('team-b');
      expect(match.factions[2].id).toBe('team-c');
    });

    it('should distribute pieces correctly (12 + 10 + 10)', () => {
      const match = BoardGenerator.createInitialMatch(GAME_MODES.threeKingdoms);
      const teamAPieces = match.board.filter(p => p?.factionId === 'team-a');
      const teamBPieces = match.board.filter(p => p?.factionId === 'team-b');
      const teamCPieces = match.board.filter(p => p?.factionId === 'team-c');
      
      expect(teamAPieces).toHaveLength(12);
      expect(teamBPieces).toHaveLength(10);
      expect(teamCPieces).toHaveLength(10);
    });

    it('should set Team A pieces: 1 Red General, 1 Black General, 5 Red Soldiers, 5 Black Soldiers', () => {
      const match = BoardGenerator.createInitialMatch(GAME_MODES.threeKingdoms);
      const teamAPieces = match.board.filter(p => p?.factionId === 'team-a') as Piece[];
      
      const generals = teamAPieces.filter(p => p.type === 'King');
      const soldiers = teamAPieces.filter(p => p.type === 'Pawn');
      
      expect(generals).toHaveLength(2);
      expect(soldiers).toHaveLength(10);
    });

    it('should set movesWithoutCapture to 60', () => {
      const match = BoardGenerator.createInitialMatch(GAME_MODES.threeKingdoms);
      expect(match.movesWithoutCapture).toBe(60);
    });

    it('should initialize activeFactions with all 3 factions', () => {
      const match = BoardGenerator.createInitialMatch(GAME_MODES.threeKingdoms);
      expect(match.activeFactions).toEqual(['team-a', 'team-b', 'team-c']);
    });

    it('should shuffle pieces and nulls randomly across 45 positions', () => {
      const match1 = BoardGenerator.createInitialMatch(GAME_MODES.threeKingdoms);
      const match2 = BoardGenerator.createInitialMatch(GAME_MODES.threeKingdoms);
      
      const board1Ids = match1.board.map(p => p?.id || 'null');
      const board2Ids = match2.board.map(p => p?.id || 'null');
      
      // Very unlikely to have same order if truly shuffled
      expect(board1Ids).not.toEqual(board2Ids);
    });
  });

  describe('shuffleArray helper', () => {
    it('should shuffle array in-place', () => {
      const original = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
      const array = [...original];
      
      shuffleArray(array);
      
      // Same elements, different order (very likely)
      expect(array.sort()).toEqual(original.sort());
      expect(array).not.toEqual(original); // Unlikely to be same order
    });

    it('should handle arrays with nulls', () => {
      const array = [1, 2, null, 3, null, 4, 5];
      shuffleArray(array);
      
      expect(array).toContain(null);
      expect(array.filter(x => x === null)).toHaveLength(2);
    });
  });
});
```

---

## Performance Requirements

- `createInitialMatch`: < 50ms per call
- `shuffleArray`: < 10ms for 45-element array
- Memory: < 1MB per Match object

---

**Contract Version**: 1.0.0  
**Created**: 2026-01-22  
**Status**: ✅ Complete and ready for implementation
