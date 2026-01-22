# Implementation Plan: Three Kingdoms Dark Chess (三國暗棋)

**Branch**: `002-three-kingdoms-dark-chess` | **Date**: 2026-01-22 | **Spec**: [spec.md](./spec.md)  
**Input**: Feature specification from `/specs/002-three-kingdoms-dark-chess/spec.md` (v2 with critical corrections)

---

## Summary

Implement Three Kingdoms Dark Chess (三國暗棋), a 3-player variant of Classic Dark Chess featuring a **Portrait-oriented 5×9 intersection grid** with **"Four Corners" (四角) initial setup**, **dynamic faction assignment** (First Flip Rule), **Army Chess (軍棋) style movement** (Ministers/Horses move without blocking), no rank hierarchy, and a 60-move draw counter. This requires significant architectural refactoring to implement a **multi-mode system** using the Strategy Pattern, extending the existing Classic Dark Chess (001) codebase while maintaining Clean Architecture principles and 100% test coverage.

**Key Technical Approach**:
- **RuleSet Strategy Pattern**: Create abstract `RuleSet` interface, extract Classic logic into `ClassicRules`, implement new `ThreeKingdomsRules` with Army Chess mechanics
- **Data Model Refactoring**: Replace `Piece.color` with `Piece.factionId`, extend `Match` with `mode`, `factions`, `activeFactions`, `movesWithoutCapture`
- **Board Topology**: Support both Classic (32 cells) and Three Kingdoms (45 intersections) with Portrait 5×9 layout
- **UI Rendering**: Create separate `ClassicBoardRenderer` and `IntersectionBoardRenderer` components for Portrait rendering with grid lines
- **State Management**: Extend Zustand store with `currentMode` field and mode-specific initialization logic
- **Testing**: 100% unit test coverage for both `ClassicRules` and `ThreeKingdomsRules`, integration tests for 3-player gameplay with dynamic faction assignment and Four Corners layout

---

## Technical Context

**Language/Version**: TypeScript 5.3+ with strict mode  
**Primary Dependencies**: React Native 0.74.x, Expo Managed Workflow, Zustand 4.5.x, Jest 29.x  
**Storage**: AsyncStorage (for mode persistence)  
**Testing**: Jest (unit tests), React Native Testing Library (integration tests)  
**Target Platform**: iOS 15+ / Android 10+ (Mobile)  
**Project Type**: Mobile application (single codebase)  
**Performance Goals**: 
- Match initialization: < 2 seconds
- UI responsiveness: 60 FPS (smooth rendering on mobile)
- Turn actions: < 100ms latency

**Constraints**:
- **Portrait-only orientation** for Three Kingdoms mode (5 columns × 9 rows aligned with phone long edge)
- **SafeAreaView** must handle device notches/safe areas
- **Dynamic scaling** required to fit entire board within screen without scrolling
- Board must render **grid lines** with pieces at **intersection points** (Go board / Junqi style)
- "Four Corners" (四角) layout: 32 pieces arranged in 4 blocks (2×4 each) at corners, 13 empty center positions
- **Dynamic faction assignment**: Players NOT pre-assigned, receive faction based on **first flipped piece** (First Flip Rule)
- **Army Chess movement**: Ministers (相/象) and Horses (馬/傌) move **without blocking checks** (no 象眼/馬腳)
- Generals (帥/將) move infinite steps (rail movement) but **ARE blocked** by obstacles
- Ministers/Horses can **jump** over pieces freely
- Clean Architecture: Game core logic MUST have zero UI dependencies

**Scale/Scope**: 
- Single mobile app with 2 game modes (Classic, Three Kingdoms)
- ~10k lines of TypeScript code (including tests)
- 100% core logic test coverage (Jest)
- Support for pass-and-play local multiplayer (no online multiplayer in v1.1)

---

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Initial Check (Pre-Research) ✅

- ✅ **Framework**: Using React Native with Expo Managed Workflow and TypeScript 5.3+ with strict mode
- ✅ **Architecture**: Maintaining Clean Architecture separation - Game Core Logic (`src/core/`) is pure TypeScript with zero UI dependencies
- ✅ **Testing**: 100% unit test coverage planned for `ClassicRules` and `ThreeKingdomsRules` using Jest
- ✅ **UI/UX**: Following minimalist traditional Chinese aesthetic; Portrait 5×9 grid for Three Kingdoms, 8×4 grid for Classic
- ✅ **Language**: Code comments and commits in English, all UI text in Traditional Chinese (繁體中文)
- ✅ **State Management**: Continuing to use Zustand for game board state, extending for multi-mode support

**Violations**: None - This feature complies with all constitution principles.

### Post-Design Check (After Phase 1) ✅

- ✅ **Framework**: Data model and contracts maintain React Native + Expo + TypeScript usage
- ✅ **Architecture**: RuleSet abstraction maintains Clean Architecture (core logic separate from UI)
- ✅ **Testing**: Test structure covers 100% of `ClassicRules.ts` and `ThreeKingdomsRules.ts`
- ✅ **UI/UX**: Contracts specify Portrait 5×9 grid rendering with Traditional Chinese text, SafeAreaView for notch handling
- ✅ **Language**: All contracts and data models use English comments, UI strings marked for Traditional Chinese translation
- ✅ **State Management**: Zustand store extended with `currentMode` field, maintains existing API

**Final Status**: ✅ **COMPLIANT** - No constitution violations

---

## Project Structure

### Documentation (this feature)

```text
specs/002-three-kingdoms-dark-chess/
├── spec.md                  # Feature specification (v2 with critical corrections)
├── plan.md                  # This file (implementation plan)
├── research.md              # Phase 0 research decisions (updated for v2)
├── data-model.md            # Entity definitions and relationships (updated for v2)
├── quickstart.md            # Implementation guide (updated for v2)
├── tasks.md                 # Actionable task breakdown (to be generated by /speckit.tasks)
├── contracts/               # API contracts
│   ├── RuleSet.md           # RuleSet interface contract
│   ├── BoardGenerator.md    # Board generation contract (Four Corners layout)
│   └── GameStore.md         # Zustand store contract (dynamic faction assignment)
└── checklists/
    ├── requirements.md      # Original quality checklist
    └── requirements-v2.md   # Updated quality checklist (v2 corrections)
```

### Source Code (repository root)

```text
src/
├── core/                    # Game Core Logic (Pure TypeScript, Zero UI Dependencies)
│   ├── types.ts             # MODIFIED: Add GameMode, Faction; Replace Piece.color with factionId
│   ├── RuleSet.ts           # NEW: RuleSet interface definition
│   ├── GameEngine.ts        # MODIFIED: Delegate to RuleSet, handle multi-mode logic
│   ├── BoardGenerator.ts    # MODIFIED: Support Four Corners layout for Three Kingdoms
│   ├── GameModes.ts         # NEW: Centralized game mode registry
│   ├── rules/               # NEW: RuleSet implementations
│   │   ├── ClassicRules.ts  # NEW: Extracted Classic logic from GameEngine
│   │   └── ThreeKingdomsRules.ts  # NEW: Three Kingdoms logic (Army Chess movement, no rank hierarchy)
│   └── utils/
│       └── boardUtils.ts    # MODIFIED: Add mode-aware coordinate utilities
│
├── components/              # UI Components (React Native)
│   ├── BoardView.tsx        # MODIFIED: Conditionally render mode-specific board
│   ├── ClassicBoardRenderer.tsx     # NEW: 8×4 cell-based rendering
│   ├── IntersectionBoardRenderer.tsx # NEW: 5×9 intersection rendering (Portrait, grid lines)
│   ├── GridCell.tsx         # EXISTING: Reused for both modes
│   ├── PieceComponent.tsx   # MODIFIED: Support green color for Team 1
│   ├── GameInfo.tsx         # MODIFIED: Show draw counter, 3-player turn indicator
│   ├── ModeSelector.tsx     # NEW: Mode selection UI
│   └── Toast.tsx            # EXISTING: Error notifications
│
└── store/
    └── gameStore.ts         # MODIFIED: Add currentMode, setMode, loadPersistedMode, dynamic faction assignment

tests/
├── unit/
│   ├── core/
│   │   ├── rules/
│   │   │   ├── ClassicRules.test.ts         # NEW: 100% coverage for Classic
│   │   │   └── ThreeKingdomsRules.test.ts   # NEW: 100% coverage for Three Kingdoms (Army Chess, Four Corners)
│   │   ├── BoardGenerator.test.ts           # MODIFIED: Verify Four Corners layout
│   │   └── GameEngine.test.ts               # MODIFIED: Multi-mode delegation tests
│   └── store/
│       └── gameStore.test.ts                # MODIFIED: Mode switching, dynamic faction assignment tests
│
└── integration/
    ├── components/
    │   ├── ClassicBoardView.test.tsx        # NEW: Classic UI tests
    │   ├── IntersectionBoardView.test.tsx   # NEW: Three Kingdoms Portrait UI tests
    │   └── ModeSelector.test.tsx            # NEW: Mode selection tests
    └── e2e/
        ├── ThreeKingdomsGameFlow.test.tsx   # NEW: Full 3-player game (Four Corners, dynamic assignment, elimination, draw)
        └── ModeSwitching.test.tsx           # NEW: Switching between Classic and Three Kingdoms
```

**Structure Decision**: 
We use a **single mobile project structure** with Clean Architecture separation:
- **Core Layer** (`src/core/`): Pure TypeScript game logic, zero UI dependencies, 100% unit tested
- **UI Layer** (`src/components/`): React Native components, integration tested
- **State Layer** (`src/store/`): Zustand state management, bridges core and UI

This structure maintains the existing 001 architecture while extending it for multi-mode support through the Strategy Pattern.

---

## Complexity Tracking

> **No constitution violations - section not applicable**

---

## Phase 0: Research (Complete)

**Status**: ✅ Complete  
**Output**: [`research.md`](./research.md) (updated for v2 corrections)

**Key Decisions**:
1. **RuleSet Strategy Pattern** for pluggable rule systems
2. **Dynamic Board Size** (32 for Classic, 45 for Three Kingdoms)
3. **Faction System** (`factionId` instead of `color`)
4. **Turn Rotation** with `activeFactions` array for elimination handling
5. **Draw Counter** (`movesWithoutCapture: number | null`)
6. **Portrait 5×9 Layout** aligned with phone's long edge (v2)
7. **Four Corners (四角) Setup** (4 blocks of 2×4 pieces, 13 empty center) (v2)
8. **Dynamic Faction Assignment** (First Flip Rule) (v2)
9. **Army Chess Movement** (Ministers/Horses without blocking) (v2)
10. **SafeAreaView & Dynamic Scaling** for responsive Portrait rendering (v2)

See [`research.md`](./research.md) for complete decision rationale and alternatives considered.

---

## Phase 1: Design & Contracts (Complete)

**Status**: ✅ Complete  
**Outputs**:
- [`data-model.md`](./data-model.md) - Entity definitions (updated for v2 corrections)
- [`contracts/RuleSet.md`](./contracts/RuleSet.md) - RuleSet interface contract
- [`contracts/BoardGenerator.md`](./contracts/BoardGenerator.md) - Board generation contract (Four Corners layout)
- [`contracts/GameStore.md`](./contracts/GameStore.md) - Zustand store contract (dynamic faction assignment)
- [`quickstart.md`](./quickstart.md) - Implementation roadmap (updated for v2 corrections)

**Key Design Artifacts**:
1. **GameMode** entity with `boardSize`, `gridDimensions`, `ruleSet`
2. **Faction** entity with `color: 'red' | 'black' | 'green'`
3. **Piece** refactored from `color` to `factionId`
4. **Match** extended with `mode`, `factions`, `activeFactions`, `movesWithoutCapture`
5. **RuleSet** interface with 7 methods (`validateMove`, `validateCapture`, `checkWinCondition`, `checkDrawCondition`, `getLegalMoves`, `getAdjacentIndices`, `canPieceCapture`)
6. **ClassicRules** and **ThreeKingdomsRules** implementations
7. **Four Corners Layout** logic in `BoardGenerator` (v2)
8. **Dynamic Faction Assignment** logic in `GameStore` (v2)
9. **Portrait Board Renderers** with grid lines and intersection points (v2)

See design artifacts for complete specifications.

---

## Phase 2: Implementation Roadmap

**Goal**: Transform design into executable code following TDD principles

**Approach**: 7-phase implementation strategy

### Phase 2.1: Setup & Type Refactoring (Day 1)
- Create `src/core/rules/` directory
- Add `GameMode`, `Faction`, `RuleSet` interfaces to `types.ts`
- Replace `Piece.color` with `Piece.factionId`
- Extend `Match` with new fields (`mode`, `factions`, `activeFactions`, `capturedByFaction`, `movesWithoutCapture`)
- **BREAKING CHANGE**: All existing code referencing `piece.color` must be updated

### Phase 2.2: RuleSet Abstraction (Day 1-2)
- Define `RuleSet` interface in `src/core/RuleSet.ts`
- Extract Classic logic from `GameEngine.ts` into `src/core/rules/ClassicRules.ts`
- Write 100% unit tests for `ClassicRules` (33 tests minimum)
- Verify existing 001 tests still pass (regression testing)

### Phase 2.3: Three Kingdoms Rules Implementation (Day 2-3)
- Implement `ThreeKingdomsRules` class with:
  - **Portrait 5×9 adjacency logic** (intersection-based)
  - **Army Chess movement** (Ministers/Horses without blocking, Generals infinite rail)
  - **No rank hierarchy** capture rules
  - **60-move draw counter** logic
  - **Elimination & turn rotation** logic
- Write 100% unit tests for `ThreeKingdomsRules` (40+ tests)
- Test Four Corners layout generation
- Test dynamic faction assignment (First Flip Rule)

### Phase 2.4: Board Generator Refactoring (Day 3)
- Update `BoardGenerator.createInitialMatch()` to accept `GameMode` parameter
- Implement **Four Corners (四角) layout** for Three Kingdoms:
  - Top-Left: Cols 0-1, Rows 0-3 (8 pieces)
  - Top-Right: Cols 3-4, Rows 0-3 (8 pieces)
  - Bottom-Left: Cols 0-1, Rows 5-8 (8 pieces)
  - Bottom-Right: Cols 3-4, Rows 5-8 (8 pieces)
  - Center: Col 2 (all rows) + Row 4 (all cols) = 13 empty positions
- Classic: Generate 32-element array (full board)
- Three Kingdoms: Generate 45-element array (32 pieces + 13 nulls)
- Create `GameModes.ts` registry with `GAME_MODES.classic` and `GAME_MODES.threeKingdoms`
- Write unit tests for both board generation modes

### Phase 2.5: State Management Extension (Day 4)
- Add `currentMode: GameMode` to `gameStore`
- Implement `setMode(mode: GameMode)` action
- Implement `loadPersistedMode()` action with AsyncStorage
- Update `newMatch()` to use `currentMode` for initialization
- Implement **dynamic faction assignment** logic:
  - Game starts with "Player 1", "Player 2", "Player 3" (no pre-assigned factions)
  - On first flip, assign player to flipped piece's faction
  - If player flips same faction as existing player, retry on next turn
  - Continue until all 3 distinct factions assigned
- Update `flipPiece()`, `movePiece()`, `capturePiece()` for multi-mode support
- Update draw counter logic (decrement on move, reset to 60 on capture)
- Write unit tests for mode switching and dynamic assignment

### Phase 2.6: UI Board Renderers (Day 4-5)
- Create `ClassicBoardRenderer.tsx` (8×4 cell-based rendering, existing logic)
- Create `IntersectionBoardRenderer.tsx` with:
  - **Portrait 5×9 grid** (5 columns × 9 rows aligned with phone long edge)
  - **Grid lines** (horizontal and vertical) rendered first
  - **Intersection points** rendered at line crossings
  - **Empty dots** for 13 center positions
  - **SafeAreaView** wrapper for notch handling
  - **Dynamic scaling** to fit screen (calculate `INTERSECTION_SPACING` based on available height/width)
  - **Four Corners visual** (4 clusters at corners, center empty)
- Update `BoardView.tsx` to conditionally render based on `match.mode.id`
- Create `ModeSelector.tsx` with buttons for "經典暗棋 (Classic)" and "三國暗棋 (Three Kingdoms)"
- Update `PieceComponent.tsx` to support GREEN color for Team 1
- Update `GameInfo.tsx` to show:
  - Turn indicator: "Player 1's Turn" (before assignment) or "Red's Turn" (after assignment)
  - Draw counter: "Moves Until Draw: 45" (countdown from 60 to 0)
  - Eliminated factions grayed out
- Write integration tests for both board renderers (Portrait orientation, grid lines, intersection points)

### Phase 2.7: Integration & E2E Testing (Day 5-6)
- E2E test: Complete 3-player Three Kingdoms match (Four Corners setup, dynamic assignment, flip, move, capture, elimination, victory)
- E2E test: 60-move draw condition (verify counter decrement, reset on capture, game ends at 0)
- E2E test: Faction elimination and turn skipping (Player B eliminated → turn A → C → A)
- E2E test: Mode switching (Classic → Three Kingdoms → Classic)
- E2E test: Portrait rendering (verify SafeAreaView, dynamic scaling, no overflow)
- Regression test: Existing Classic mode still works after refactoring
- Performance test: Three Kingdoms match initialization < 2 seconds
- Write integration tests for `ModeSelector` (mode selection, persistence)

---

## Key Technical Challenges

### 1. Portrait 5×9 Intersection Grid Rendering (NEW - v2)

**Challenge**: Render a Portrait-oriented 5×9 grid (5 columns × 9 rows) with grid lines and intersection points, fitting within phone screen without scrolling.

**Solution**:
- Calculate `INTERSECTION_SPACING` dynamically based on available screen height (primary constraint)
- Use `SafeAreaView` to handle notches and safe areas
- Render grid lines first (View with border styling)
- Position pieces at intersection points using absolute positioning
- Display empty center positions (13 spots) with subtle dots
- Implement "Four Corners" visual (4 clusters at corners)

**Code Snippet**:
```typescript
// IntersectionBoardRenderer.tsx
const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
const BOARD_PADDING = 24;
const HEADER_FOOTER_SPACE = 280; // Space for header, mode selector, footer

const availableHeight = screenHeight - HEADER_FOOTER_SPACE;
const availableWidth = screenWidth - (BOARD_PADDING * 2);

// Calculate spacing (Portrait: height is primary constraint)
const INTERSECTION_SPACING_Y = Math.floor(availableHeight / (GRID_ROWS - 1));
const INTERSECTION_SPACING_X = Math.floor(availableWidth / (GRID_COLS - 1));
const INTERSECTION_SPACING = Math.min(INTERSECTION_SPACING_X, INTERSECTION_SPACING_Y, 60);
```

### 2. Four Corners (四角) Layout Generation (NEW - v2)

**Challenge**: Generate board with 32 pieces arranged in 4 corner blocks (2×4 each), leaving 13 empty center positions.

**Solution**:
- Define corner regions:
  - Top-Left: Cols 0-1, Rows 0-3 (8 pieces)
  - Top-Right: Cols 3-4, Rows 0-3 (8 pieces)
  - Bottom-Left: Cols 0-1, Rows 5-8 (8 pieces)
  - Bottom-Right: Cols 3-4, Rows 5-8 (8 pieces)
- Define center region: Col 2 (all rows) + Row 4 (all cols) = 13 empty positions
- Shuffle 32 pieces randomly
- Distribute shuffled pieces into 4 corner blocks (8 per block)
- Fill center positions with `null`

**Code Snippet**:
```typescript
// BoardGenerator.ts (Three Kingdoms)
function createFourCornersLayout(pieces: Piece[]): Board {
  const board: Board = Array(45).fill(null);
  const shuffledPieces = shufflePieces(pieces);
  
  // Define corner regions (indices)
  const topLeft = [0, 1, 5, 6, 10, 11, 15, 16];
  const topRight = [3, 4, 8, 9, 13, 14, 18, 19];
  const bottomLeft = [25, 26, 30, 31, 35, 36, 40, 41];
  const bottomRight = [28, 29, 33, 34, 38, 39, 43, 44];
  
  const corners = [...topLeft, ...topRight, ...bottomLeft, ...bottomRight];
  
  // Place shuffled pieces in corner regions
  corners.forEach((index, i) => {
    board[index] = shuffledPieces[i];
  });
  
  // Center positions remain null (indices: 2, 7, 12, 17, 20-24, 27, 32, 37, 42)
  return board;
}
```

### 3. Dynamic Faction Assignment (First Flip Rule) (NEW - v2)

**Challenge**: Assign factions to players dynamically based on their first flipped piece, not pre-assigned.

**Solution**:
- Game starts with "Player 1", "Player 2", "Player 3" (no faction assignment)
- Track `playerFactionMap: Record<string, string>` (playerId → factionId)
- On first flip by Player X:
  - If flipped piece's `factionId` is not yet assigned → assign Player X to that faction
  - If flipped piece's `factionId` is already assigned to another player → turn passes, Player X not assigned yet (retry on next turn)
- Continue until all 3 players assigned to distinct factions
- Update turn indicator UI based on assignment status

**Code Snippet**:
```typescript
// gameStore.ts (flipPiece action)
flipPiece: (index: number) => {
  const { match } = get();
  if (!match) return;
  
  const piece = match.board[index];
  if (!piece || piece.isRevealed) return;
  
  // Flip the piece
  piece.isRevealed = true;
  
  // Dynamic faction assignment logic
  const currentPlayer = `player-${match.currentFactionIndex + 1}`;
  const playerFactionMap = getPlayerFactionMap(match); // Helper to track assignments
  
  if (!playerFactionMap[currentPlayer]) {
    // Player not yet assigned
    const factionId = piece.factionId;
    const factionAlreadyAssigned = Object.values(playerFactionMap).includes(factionId);
    
    if (!factionAlreadyAssigned) {
      // Assign player to this faction
      playerFactionMap[currentPlayer] = factionId;
      setPlayerFactionMap(match, playerFactionMap);
    } else {
      // Faction already taken by another player, retry on next turn
      // Turn passes but player not assigned
    }
  }
  
  // ... continue with normal flip logic
},
```

### 4. Army Chess (軍棋) Style Movement (NEW - v2)

**Challenge**: Implement movement rules where Ministers (相/象) and Horses (馬/傌) move **without blocking checks** (no 象眼/馬腳), but Generals/Rooks/Cannons move with rail movement (**are blocked** by obstacles).

**Solution**:
- **Ministers (相/象)**: Check target is 2 steps diagonal, **skip blocking check** (ignore pieces in between)
- **Horses (馬/傌)**: Check target is Knight L-shape, **skip blocking check** (ignore pieces in between)
- **Generals (帥/將)**: Infinite straight movement (rail), **check for blocking** (stop at first obstacle)
- **Rooks (俥/車)**: Infinite straight movement (rail), **check for blocking**
- **Cannons (炮/包)**: Infinite straight movement (rail), **check for blocking**; capture requires exactly 1 screen

**Code Snippet**:
```typescript
// ThreeKingdomsRules.ts (validateMove)
function validateMove(match: Match, fromIndex: number, toIndex: number): ValidationResult {
  const piece = match.board[fromIndex];
  
  switch (piece.type) {
    case 'Minister': {
      // 2 steps diagonal, NO blocking check (Army Chess style)
      const isDiagonal = checkDiagonal(fromIndex, toIndex, 2);
      if (!isDiagonal) return { isValid: false, error: 'Minister must move 2 steps diagonal' };
      // ✅ No blocking check - Ministers can jump freely
      return { isValid: true };
    }
    
    case 'Horse': {
      // Knight L-shape, NO blocking check (Army Chess style)
      const isKnight = checkKnightMove(fromIndex, toIndex);
      if (!isKnight) return { isValid: false, error: 'Horse must move in L-shape' };
      // ✅ No blocking check - Horses can jump freely
      return { isValid: true };
    }
    
    case 'King': { // General
      // Infinite straight, WITH blocking check (rail movement)
      const isStraight = checkStraightLine(fromIndex, toIndex);
      if (!isStraight) return { isValid: false, error: 'General must move straight' };
      // ❌ Blocking check required - Generals cannot jump
      const isBlocked = checkBlockedPath(match.board, fromIndex, toIndex);
      if (isBlocked) return { isValid: false, error: 'Path is blocked' };
      return { isValid: true };
    }
    
    // Similar for Rook, Cannon (rail movement with blocking)
  }
}
```

### 5. Turn Rotation with Elimination (Existing, but critical)

**Challenge**: Skip eliminated factions in turn rotation.

**Solution**:
- Maintain `activeFactions: string[]` array (initially all faction IDs)
- `currentFactionIndex` cycles through `activeFactions` (not all factions)
- When faction eliminated, remove from `activeFactions`
- Turn rotation: `(currentFactionIndex + 1) % activeFactions.length`

---

## Testing Strategy

### Unit Testing (100% Coverage)

**Target Files**:
- `src/core/rules/ClassicRules.ts` (33 tests)
- `src/core/rules/ThreeKingdomsRules.ts` (45 tests, including Army Chess, Four Corners, dynamic assignment)
- `src/core/BoardGenerator.ts` (15 tests, including Four Corners layout)
- `src/core/GameEngine.ts` (36 tests, multi-mode delegation)
- `src/store/gameStore.ts` (25 tests, mode switching, dynamic assignment)

**Coverage Requirements**:
- All `RuleSet` methods: 100% branch coverage
- All board generation scenarios: 100% path coverage
- All turn rotation scenarios: 100% edge case coverage

### Integration Testing

**Target Flows**:
- Classic board rendering (8×4 cells)
- Three Kingdoms board rendering (Portrait 5×9 intersections with grid lines, SafeAreaView, dynamic scaling)
- Mode selection and switching
- Dynamic faction assignment (First Flip Rule)
- 3-player turn rotation with elimination
- Draw counter UI updates
- Four Corners visual display

### E2E Testing

**Test Scenarios**:
1. **Complete Three Kingdoms Match**:
   - Setup: Four Corners layout, 32 pieces, 13 empty center
   - Player 1 flips → assigned to faction
   - Player 2 flips → assigned to different faction
   - Player 3 flips → assigned to third faction
   - Gameplay: flip, move (Army Chess style), capture
   - Elimination: Player B eliminated → turn A → C → A
   - Victory: Only Player C remains
   
2. **60-Move Draw**:
   - Setup: Three Kingdoms match
   - 59 non-capture moves → counter decrements to 1
   - 60th non-capture move → counter reaches 0 → game ends in draw
   - Verify draw UI message

3. **Mode Switching**:
   - Start in Classic mode
   - Switch to Three Kingdoms → verify Portrait 5×9 board with Four Corners
   - Confirm dialog warns about discarding current match
   - Switch back to Classic → verify 8×4 board

4. **Portrait Rendering**:
   - Test on various device sizes (iPhone 13, Galaxy S21, iPad)
   - Verify SafeAreaView handles notches correctly
   - Verify dynamic scaling prevents overflow
   - Verify grid lines and intersection points render correctly

---

## Success Criteria

### Functional Criteria
- ✅ Users can switch between Classic and Three Kingdoms modes in < 3 taps
- ✅ Three Kingdoms board renders as Portrait 5×9 grid with grid lines and intersection points
- ✅ Four Corners layout displays correctly (4 clusters at corners, 13 empty center)
- ✅ Dynamic faction assignment works (players assigned based on first flip, not pre-assigned)
- ✅ Army Chess movement enforced (Ministers/Horses move without blocking, Generals/Rooks/Cannons blocked by obstacles)
- ✅ 3-player turn rotation works correctly with elimination skipping
- ✅ 60-move draw counter displays and counts down correctly
- ✅ Draw counter resets to 60 on capture
- ✅ Game ends when counter reaches 0 (draw) or only 1 faction remains (victory)
- ✅ All Classic mode functionality still works after refactoring (regression-free)

### Technical Criteria
- ✅ 100% unit test coverage for `ClassicRules` and `ThreeKingdomsRules`
- ✅ All 122 existing tests pass after refactoring
- ✅ No breaking changes to existing Classic mode gameplay
- ✅ Clean Architecture maintained (zero UI dependencies in core logic)
- ✅ Mode selection persists across app restarts (AsyncStorage)

### Performance Criteria
- ✅ Three Kingdoms match initialization: < 2 seconds
- ✅ UI remains responsive at 60 FPS (smooth rendering on mobile)
- ✅ Turn actions (flip/move/capture): < 100ms latency
- ✅ Board rendering fits within screen without scrolling (SafeAreaView + dynamic scaling)

### UX Criteria
- ✅ Portrait 5×9 board is clearly readable with grid lines and intersection points
- ✅ Four Corners layout is visually distinct (4 clusters, center empty)
- ✅ Turn indicator shows correct player/faction (before and after assignment)
- ✅ Draw counter is prominently displayed and updates in real-time
- ✅ Eliminated factions are grayed out or marked clearly
- ✅ All UI text is in Traditional Chinese (繁體中文)
- ✅ SafeAreaView handles notches correctly on all devices

---

## Risks & Mitigation

### Risk 1: Breaking Changes to Existing Classic Mode

**Impact**: High - Could break existing gameplay  
**Probability**: Medium

**Mitigation**:
- Run full regression test suite after each refactoring step
- Maintain backward compatibility by defaulting to Classic mode
- Extract Classic logic into `ClassicRules` without modifications
- Test migration of existing `Piece.color` to `Piece.factionId` thoroughly

### Risk 2: Portrait Rendering Overflow on Small Devices

**Impact**: Medium - Board may not fit on screen  
**Probability**: Medium

**Mitigation**:
- Implement dynamic scaling (`INTERSECTION_SPACING` calculation)
- Use SafeAreaView to handle notches and safe areas
- Test on multiple device sizes (iPhone SE, Galaxy S21, iPad)
- Add fallback scrolling if board exceeds screen height (as last resort)

### Risk 3: Four Corners Layout Generation Errors

**Impact**: High - Incorrect piece placement breaks gameplay  
**Probability**: Low

**Mitigation**:
- Write comprehensive unit tests for `createFourCornersLayout`
- Verify 32 pieces distributed correctly (8 per corner)
- Verify 13 empty center positions
- Add visual regression tests for Four Corners layout

### Risk 4: Dynamic Faction Assignment Logic Bugs

**Impact**: High - Players may not be assigned correctly  
**Probability**: Medium

**Mitigation**:
- Write E2E test for dynamic assignment (First Flip Rule)
- Test edge cases (all 3 players flip same faction, retry logic)
- Add clear UI feedback for assignment status ("Player 1's Turn" vs "Red's Turn")

### Risk 5: Army Chess Movement Implementation Errors

**Impact**: High - Incorrect movement breaks gameplay  
**Probability**: Medium

**Mitigation**:
- Write 100% unit tests for `ThreeKingdomsRules.validateMove`
- Test all piece types (Ministers/Horses without blocking, Generals/Rooks/Cannons with blocking)
- Add integration tests for movement scenarios
- Verify blocking checks work correctly for rail movement

---

## Next Steps

1. ✅ **Phase 0: Research** (COMPLETE) - [`research.md`](./research.md) updated for v2
2. ✅ **Phase 1: Design** (COMPLETE) - [`data-model.md`](./data-model.md), [`contracts/`](./contracts/), [`quickstart.md`](./quickstart.md) updated for v2
3. ✅ **Phase 2: Planning** (COMPLETE) - This document
4. 🔜 **Phase 3: Task Breakdown** - Run `/speckit.tasks` to generate actionable task list ([`tasks.md`](./tasks.md))
5. 🔜 **Phase 4: Implementation** - Execute tasks in dependency order (7-phase roadmap)
6. 🔜 **Phase 5: Testing** - Achieve 100% unit test coverage + integration tests
7. 🔜 **Phase 6: Validation** - Run E2E tests, verify success criteria
8. 🔜 **Phase 7: Documentation** - Update README, user guide, release notes

---

**Plan Version**: 2.0 (Updated for v2 critical corrections)  
**Created**: 2026-01-22  
**Last Updated**: 2026-01-22  
**Status**: ✅ **READY FOR TASK GENERATION** - Run `/speckit.tasks` to proceed
