# Quick Start Guide: Three Kingdoms Dark Chess Implementation

**Feature**: `002-three-kingdoms-dark-chess`  
**Branch**: `002-three-kingdoms-dark-chess`  
**Prerequisites**: 001-banqi-game-rules (Classic Dark Chess) must be complete

---

## Overview

This guide provides a step-by-step roadmap for implementing the Three Kingdoms Dark Chess variant. The implementation follows Test-Driven Development (TDD) and Clean Architecture principles, extending the existing Classic Dark Chess foundation.

**Estimated Effort**: 4-6 days for TDD implementation + testing

---

## Architecture Overview

### Strategy Pattern Refactoring

```text
BEFORE (001 - Classic Only):
┌─────────────────┐
│  GameEngine.ts  │ ← Hardcoded Classic rules
└─────────────────┘

AFTER (002 - Multi-Mode):
┌──────────────────────────────────────────┐
│            RuleSet Interface             │
│  (validateMove, validateCapture, etc.)   │
└──────────────────────────────────────────┘
             ▲                 ▲
             │                 │
  ┌──────────┴────────┐ ┌──────┴────────────────┐
  │   ClassicRules    │ │ ThreeKingdomsRules   │
  │ (extracted from   │ │ (new implementation)  │
  │  GameEngine.ts)   │ │                       │
  └───────────────────┘ └───────────────────────┘
```

---

## Implementation Phases

### Phase 1: Core Type Refactoring (Day 1)

**Goal**: Extend type system to support multi-player, multi-mode gameplay

**Tasks**:

1. **Create `GameMode` type** (`src/core/types.ts`)
   ```typescript
   export interface GameMode {
     id: string;
     name: string;
     boardSize: number;
     gridDimensions: { rows: number; cols: number };
     playerCount: number;
     ruleSet: RuleSet;
   }
   ```

2. **Create `Faction` type** (`src/core/types.ts`)
   ```typescript
   export interface Faction {
     id: string;
     displayName: string;
     color: 'red' | 'black' | 'green';
     pieceCount: number;
     isEliminated: boolean;
   }
   ```

3. **Refactor `Piece` type**
   ```typescript
   // OLD
   export interface Piece {
     color: 'red' | 'black'; // ❌ Remove
   }
   
   // NEW
   export interface Piece {
     factionId: string; // ✅ Add
   }
   ```

4. **Extend `Match` type**
   ```typescript
   export interface Match {
     // NEW fields
     mode: GameMode;
     factions: Faction[];
     activeFactions: string[];
     currentFactionIndex: number;
     capturedByFaction: Record<string, Piece[]>;
     movesWithoutCapture: number | null;
     
     // REMOVED fields
     // currentTurn: 'red' | 'black' | null; // ❌
     // winner: 'red' | 'black' | null; // ❌
     // redCaptured: Piece[]; // ❌
     // blackCaptured: Piece[]; // ❌
     
     // MODIFIED fields
     winner: string | null; // ✅ Changed to string
   }
   ```

**Testing**:
- Unit tests for type validation
- Ensure backward compatibility with Classic mode

**Estimated Time**: 4 hours

---

### Phase 2: RuleSet Interface & ClassicRules (Day 1-2)

**Goal**: Extract Classic logic into reusable RuleSet implementation

**Tasks**:

1. **Define RuleSet interface** (`src/core/RuleSet.ts`)
   ```typescript
   export interface RuleSet {
     validateMove(match: Match, fromIndex: number, toIndex: number): ValidationResult;
     validateCapture(match: Match, fromIndex: number, toIndex: number): ValidationResult;
     checkWinCondition(match: Match): WinResult;
     checkDrawCondition(match: Match): boolean;
     getLegalMoves(match: Match): LegalMoveSet;
     getAdjacentIndices(index: number, boardSize: number): number[];
     canPieceCapture(attacker: Piece, target: Piece): boolean;
   }
   ```

2. **Extract Classic logic** (`src/core/rules/ClassicRules.ts`)
   - Copy existing logic from `GameEngine.ts`
   - Adapt to RuleSet interface
   - Update adjacency logic for 8x4 board
   - Keep rank hierarchy and King vs Pawn exception

3. **Update `GameEngine.ts`**
   - Remove hardcoded Classic logic
   - Delegate to `match.mode.ruleSet` methods
   - Keep utility functions (executeFlip, executeMove, executeCapture)

**Testing**:
- Unit tests for ClassicRules (100% coverage required)
- Integration tests to ensure Classic mode still works
- Compare behavior with 001 implementation (no regressions)

**Estimated Time**: 6 hours

---

### Phase 3: Three Kingdoms Rules (Day 2-3)

**Goal**: Implement Three Kingdoms-specific game logic

**Tasks**:

1. **Create ThreeKingdomsRules** (`src/core/rules/ThreeKingdomsRules.ts`)
   - Implement RuleSet interface
   - 9x5 grid adjacency logic
   - **NO rank hierarchy** (any piece captures any piece)
   - **NO King vs Pawn exception**
   - Draw counter management (60 moves)
   - Modified movement rules:
     - Generals: Infinite straight movement
     - Ministers: Jump 2 diagonals WITHOUT blocking
     - Horses: Knight L-shape WITHOUT blocking

2. **Create GameModes registry** (`src/core/GameModes.ts`)
   ```typescript
   export const GAME_MODES = {
     classic: {
       id: 'classic',
       name: '經典暗棋',
       boardSize: 32,
       gridDimensions: { rows: 8, cols: 4 },
       playerCount: 2,
       ruleSet: new ClassicRules(),
     },
     threeKingdoms: {
       id: 'three-kingdoms',
       name: '三國暗棋',
       boardSize: 45,
       gridDimensions: { rows: 9, cols: 5 },
       playerCount: 3,
       ruleSet: new ThreeKingdomsRules(),
     },
   };
   ```

**Testing**:
- Unit tests for ThreeKingdomsRules (100% coverage required)
- Test 9x5 adjacency logic
- Test no rank hierarchy (Pawn can capture General)
- Test draw counter (decrement, reset, game end)
- Test elimination victory (activeFactions tracking)

**Estimated Time**: 8 hours

---

### Phase 4: BoardGenerator Multi-Mode Support (Day 3)

**Goal**: Update BoardGenerator to support both Classic and Three Kingdoms modes

**Tasks**:

1. **Refactor `createInitialMatch`** (`src/core/BoardGenerator.ts`)
   ```typescript
   // OLD
   export function createInitialMatch(): Match {
     // Hardcoded Classic logic
   }
   
   // NEW
   export function createInitialMatch(mode: GameMode): Match {
     if (mode.id === 'classic') {
       // Create 2 factions, 32 pieces, 32-element board
     } else if (mode.id === 'three-kingdoms') {
       // Create 3 factions, 32 pieces, 45-element board (13 nulls)
     }
   }
   ```

2. **Implement Three Kingdoms piece distribution**
   - Team A: 12 pieces (2 Generals, 10 Soldiers)
   - Team B: 10 pieces (2 Advisors, 2 Ministers, 2 Rooks, 2 Horses, 2 Cannons)
   - Team C: 10 pieces (2 Advisors, 2 Ministers, 2 Rooks, 2 Horses, 2 Cannons)

3. **Shuffle pieces across 45 positions**
   - 32 pieces + 13 nulls
   - Use Fisher-Yates shuffle

**Testing**:
- Unit tests for Classic mode (backward compatibility)
- Unit tests for Three Kingdoms mode (45 positions, 13 nulls)
- Verify piece distribution (12+10+10)
- Verify shuffle randomness

**Estimated Time**: 4 hours

---

### Phase 5: State Management (GameStore) (Day 3-4)

**Goal**: Extend Zustand store to support mode selection and multi-mode gameplay

**Tasks**:

1. **Add mode management** (`src/store/gameStore.ts`)
   ```typescript
   export interface GameStore {
     currentMode: GameMode; // ✅ NEW
     setMode: (mode: GameMode) => void; // ✅ NEW
     loadPersistedMode: () => Promise<void>; // ✅ NEW
     // ... existing fields/actions
   }
   ```

2. **Update `newMatch` action**
   ```typescript
   newMatch: () => {
     const mode = get().currentMode;
     const match = BoardGenerator.createInitialMatch(mode);
     set({ match, error: null });
   }
   ```

3. **Update `flipPiece`, `movePiece`, `capturePiece`**
   - Use `match.mode.ruleSet` for validation
   - Handle draw counter (Three Kingdoms only)
   - No API changes required

4. **Implement mode persistence** (AsyncStorage)
   ```typescript
   setMode: async (mode) => {
     set({ currentMode: mode });
     await AsyncStorage.setItem('@dark-chess:current-mode', mode.id);
   }
   ```

**Testing**:
- Unit tests for mode selection
- Unit tests for Classic and Three Kingdoms actions
- Integration tests for draw counter management
- Test AsyncStorage persistence

**Estimated Time**: 5 hours

---

### Phase 6: UI Components (Day 4-5)

**Goal**: Create UI components for mode selection and multi-mode board rendering

**Tasks**:

1. **Create Mode Selector** (`src/components/ModeSelector.tsx`)
   - Display "經典暗棋 (Classic)" and "三國暗棋 (Three Kingdoms)" buttons
   - Highlight current mode
   - Call `setMode` and `newMatch` on selection

2. **Create Board Renderers**
   - **ClassicBoardRenderer** (`src/components/ClassicBoardRenderer.tsx`)
     - 8 rows × 4 cols grid cells
     - Existing BoardView logic
   - **IntersectionBoardRenderer** (`src/components/IntersectionBoardRenderer.tsx`)
     - 9 rows × 5 cols intersection points
     - Render grid lines + intersection points
     - Display empty intersections (13 spots)

3. **Update BoardView** (`src/components/BoardView.tsx`)
   ```typescript
   export function BoardView({ board, mode, onCellPress }: Props) {
     if (mode.id === 'classic') {
       return <ClassicBoardRenderer board={board} onCellPress={onCellPress} />;
     } else if (mode.id === 'three-kingdoms') {
       return <IntersectionBoardRenderer board={board} onCellPress={onCellPress} />;
     }
   }
   ```

4. **Update PieceComponent** (`src/components/PieceComponent.tsx`)
   - Accept `factionColor: 'red' | 'black' | 'green'` prop
   - Render with team color borders/text

5. **Update GameInfo** (`src/components/GameInfo.tsx`)
   - Display 3-player turn indicator
   - Display "Moves Until Draw" counter (Three Kingdoms only)
   - Display captured pieces per faction (3 counts)

**Testing**:
- Integration tests for mode selector
- Integration tests for Classic board rendering
- Integration tests for Three Kingdoms board rendering
- Snapshot tests for UI components

**Estimated Time**: 8 hours

---

### Phase 7: Integration & E2E Testing (Day 5-6)

**Goal**: Comprehensive testing of complete game flow for both modes

**Tasks**:

1. **Classic Mode E2E Tests**
   - Start new Classic match
   - Complete full game flow (flip, move, capture)
   - Verify win conditions (capture-all, stalemate)
   - Ensure no regressions from 001

2. **Three Kingdoms Mode E2E Tests**
   - Start new Three Kingdoms match
   - Test 3-player turn rotation
   - Test elimination and turn skipping
   - Test draw counter (decrement, reset, game end)
   - Test elimination victory
   - Test stalemate elimination

3. **Mode Switching Tests**
   - Switch from Classic to Three Kingdoms mid-game
   - Verify mode persistence across app restarts

4. **Performance Testing**
   - Measure match initialization time (< 2 seconds)
   - Measure move validation time (< 10ms)
   - Measure board rendering time (60 FPS target)

**Estimated Time**: 8 hours

---

## Testing Strategy

### Unit Tests (100% Coverage Required)

**Core Logic**:
- `src/core/rules/ClassicRules.test.ts` - 100% coverage
- `src/core/rules/ThreeKingdomsRules.test.ts` - 100% coverage
- `src/core/BoardGenerator.test.ts` - Both modes
- `src/core/types.test.ts` - Type validation

**State Management**:
- `src/store/gameStore.test.ts` - Both modes

### Integration Tests

**UI Components**:
- `tests/integration/components/ModeSelector.test.tsx`
- `tests/integration/components/ClassicBoardView.test.tsx`
- `tests/integration/components/IntersectionBoardView.test.tsx`

**E2E Flows**:
- `tests/e2e/ClassicGameFlow.test.tsx` - No regressions
- `tests/e2e/ThreeKingdomsGameFlow.test.tsx` - Full 3-player game

### Test Execution Order

```bash
# 1. Unit tests for core logic (TDD)
npm test src/core/rules/ClassicRules.test.ts
npm test src/core/rules/ThreeKingdomsRules.test.ts
npm test src/core/BoardGenerator.test.ts

# 2. Unit tests for state management
npm test src/store/gameStore.test.ts

# 3. Integration tests for UI
npm test tests/integration/components/

# 4. E2E tests
npm test tests/e2e/

# 5. Full test suite
npm test
```

---

## Commit Strategy

Follow Conventional Commits format:

```bash
# Phase 1: Types
git commit -m "refactor(core): extend types for multi-mode support

- Add GameMode and Faction types
- Replace Piece.color with Piece.factionId
- Extend Match with mode, factions, activeFactions
- Update Board to support dynamic size (32 or 45)

BREAKING CHANGE: Match structure modified for multi-player support"

# Phase 2: RuleSet
git commit -m "refactor(core): extract Classic logic into RuleSet pattern

- Define RuleSet interface
- Create ClassicRules implementation
- Update GameEngine to delegate to RuleSet
- Maintain 100% unit test coverage

No functional changes to Classic mode behavior"

# Phase 3: Three Kingdoms Rules
git commit -m "feat(core): implement Three Kingdoms rule system

- Create ThreeKingdomsRules implementation
- Support 9x5 grid (45 intersections)
- Implement no rank hierarchy
- Add draw counter (60 moves)
- Support 3-player elimination
- 100% unit test coverage"

# Phase 4: BoardGenerator
git commit -m "refactor(core): update BoardGenerator for multi-mode

- Accept GameMode parameter in createInitialMatch
- Support Classic (32 cells) and Three Kingdoms (45 intersections)
- Implement 12+10+10 piece distribution for Three Kingdoms
- Shuffle 32 pieces + 13 nulls for Three Kingdoms board"

# Phase 5: State Management
git commit -m "feat(store): add mode selection to GameStore

- Add currentMode, setMode, loadPersistedMode
- Update newMatch to use currentMode
- Persist mode selection to AsyncStorage
- Handle draw counter in actions (Three Kingdoms only)"

# Phase 6: UI
git commit -m "feat(ui): add mode selector and multi-mode board rendering

- Create ModeSelector component
- Create ClassicBoardRenderer (8x4 cells)
- Create IntersectionBoardRenderer (9x5 intersections)
- Update GameInfo for 3-player indicators
- Support green/red/black team colors"

# Phase 7: Testing
git commit -m "test(e2e): add comprehensive Three Kingdoms integration tests

- E2E tests for 3-player gameplay
- Test elimination and turn skipping
- Test draw counter mechanics
- Verify no regressions in Classic mode
- Performance tests (< 2s match init, 60 FPS rendering)"
```

---

## Common Pitfalls & Solutions

### Pitfall 1: Hardcoded 32-element board assumptions

**Problem**: Code assumes `board.length === 32` or `board[31]` exists

**Solution**: Use `match.mode.boardSize` and bounds checking
```typescript
// ❌ Bad
if (index >= 32) return false;

// ✅ Good
if (index >= match.mode.boardSize) return false;
```

---

### Pitfall 2: Hardcoded red/black color checks

**Problem**: Code assumes `piece.color === 'red'`

**Solution**: Use `piece.factionId` and `match.factions`
```typescript
// ❌ Bad
if (piece.color === match.currentTurn) { ... }

// ✅ Good
const currentFaction = match.activeFactions[match.currentFactionIndex];
if (piece.factionId === currentFaction) { ... }
```

---

### Pitfall 3: Adjacency logic errors (8x4 vs 9x5)

**Problem**: Classic adjacency (col % 4) applied to Three Kingdoms (col % 5)

**Solution**: Use RuleSet.getAdjacentIndices()
```typescript
// ❌ Bad
const adjacent = [
  index - 4, // Up
  index + 4, // Down
  index - 1, // Left
  index + 1, // Right
];

// ✅ Good
const adjacent = match.mode.ruleSet.getAdjacentIndices(index, match.mode.boardSize);
```

---

### Pitfall 4: Forgetting draw counter management

**Problem**: `movesWithoutCapture` not updated or checked

**Solution**: Always check `movesWithoutCapture !== null` before decrement/reset
```typescript
// ✅ Good
if (newMatch.movesWithoutCapture !== null) {
  newMatch = {
    ...newMatch,
    movesWithoutCapture: newMatch.movesWithoutCapture - 1,
  };
}
```

---

## Verification Checklist

Before marking feature complete, verify:

- [ ] All unit tests pass (100% coverage for core logic)
- [ ] All integration tests pass
- [ ] All E2E tests pass
- [ ] Classic mode behavior unchanged (no regressions)
- [ ] Three Kingdoms mode supports:
  - [ ] 45-position board (32 pieces + 13 nulls)
  - [ ] 3-player turn rotation
  - [ ] Elimination and turn skipping
  - [ ] Draw counter (60 moves)
  - [ ] No rank hierarchy
  - [ ] Modified movement rules (Generals, Ministers, Horses)
- [ ] UI displays:
  - [ ] Mode selector
  - [ ] 3-player turn indicator
  - [ ] Draw counter (Three Kingdoms only)
  - [ ] GREEN/RED/BLACK team colors
  - [ ] Empty intersections (Three Kingdoms only)
- [ ] Mode selection persists across app restarts
- [ ] Performance meets requirements (< 2s init, 60 FPS)
- [ ] No linter errors
- [ ] All commits follow Conventional Commits format

---

## Next Steps After Implementation

1. ✅ Implementation complete (this guide)
2. 🔜 Run `/speckit.tasks` to generate task breakdown
3. 🔜 Begin TDD implementation following tasks
4. 🔜 Manual QA testing on physical devices
5. 🔜 Merge to main after all tests pass
6. 🔜 Plan next feature (004-ai-opponent or 010-online-multiplayer)

---

**Guide Version**: 1.0.0  
**Created**: 2026-01-22  
**Status**: ✅ Complete and ready for implementation
