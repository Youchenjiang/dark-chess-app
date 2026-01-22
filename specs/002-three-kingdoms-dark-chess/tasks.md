# Implementation Tasks: Three Kingdoms Dark Chess - Phase 5 Corrections

**Feature**: `002-three-kingdoms-dark-chess`  
**Branch**: `002-three-kingdoms-dark-chess`  
**Status**: Phase 5 - Critical Corrections & Refinement  
**Generated**: 2026-01-22

---

## Overview

This task list focuses on **Phase 5: Three Kingdoms Correction & Refinement**, implementing critical v2 specification corrections to the existing implementation. These corrections address user feedback on board orientation, initial setup, faction assignment, and movement mechanics.

**Critical v2 Corrections**:
1. **Portrait 5×9 Layout**: Reorient board from landscape to Portrait (5 columns × 9 rows)
2. **Four Corners (四角) Setup**: Replace random scatter with strategic corner clusters
3. **Dynamic Faction Assignment**: Implement First Flip Rule (players not pre-assigned)
4. **Army Chess Movement**: Ministers/Horses move without blocking (no 象眼/馬腳)
5. **UI Safety**: SafeAreaView, dynamic scaling, "Back/Exit" button

---

## Task Summary

| Phase | Task Count | Focus |
|-------|------------|-------|
| **Setup** | 3 | Project validation & backup |
| **US1-Corrections** | 18 | Board layout, rendering, mode selector fixes |
| **US2-Corrections** | 12 | Gameplay logic, dynamic faction assignment, Army Chess movement |
| **US3-Corrections** | 2 | Rules guide updates |
| **US4-Corrections** | 4 | Team color display |
| **Polish** | 6 | Testing, validation, cleanup |
| **TOTAL** | **45 tasks** | Complete v2 corrections |

---

## Phase 0: Setup & Validation (3 tasks)

**Goal**: Validate existing implementation and prepare for refactoring

- [ ] T001 Run all existing tests to establish baseline (expect 122 passing tests) in tests/
- [ ] T002 Create backup branch `002-three-kingdoms-dark-chess-pre-v2` for rollback safety
- [ ] T003 Document current implementation state in CHANGELOG.md (features working, known issues)

---

## Phase 1: US1 Corrections - Board Layout & Rendering (18 tasks)

**User Story**: US1 - Switch Between Classic and Three Kingdoms Modes (Priority: P1)

**Goal**: Implement Portrait 5×9 board with Four Corners layout and fix UI rendering

**Independent Test Criteria**:
- [ ] Three Kingdoms board displays as Portrait 5×9 grid (5 columns × 9 rows)
- [ ] Pieces arranged in Four Corners pattern (4 blocks of 2×4 at corners, 13 empty center)
- [ ] Board fits within screen without scrolling (SafeAreaView + dynamic scaling)
- [ ] Mode selector includes "Back/Exit" button
- [ ] Switching modes preserves mode selection in AsyncStorage

### T004-T010: BoardGenerator Four Corners Logic

- [X] T004 [US1] Update `BoardGenerator.createInitialMatch` signature to use Four Corners layout for Three Kingdoms in src/core/BoardGenerator.ts
- [X] T005 [P] [US1] Create helper function `createFourCornersLayout(pieces: Piece[]): Board` in src/core/BoardGenerator.ts
- [X] T006 [US1] Define corner region indices for Portrait 5×9 grid (Top-Left, Top-Right, Bottom-Left, Bottom-Right) in src/core/BoardGenerator.ts
- [X] T007 [US1] Define center empty indices (Col 2 all rows + Row 4 all cols = 13 positions) in src/core/BoardGenerator.ts
- [X] T008 [US1] Implement piece shuffling: shuffle 32 pieces, distribute 8 pieces to each of 4 corners in src/core/BoardGenerator.ts
- [X] T009 [US1] Update board initialization to use `createFourCornersLayout` for Three Kingdoms mode in src/core/BoardGenerator.ts
- [ ] T010 [US1] Update BoardGenerator unit tests to verify Four Corners layout (4 corners occupied, 13 center empty) in tests/unit/core/BoardGenerator.test.ts

### T011-T018: IntersectionBoardRenderer Portrait Refactoring

- [X] T011 [US1] Update `GRID_COLS` and `GRID_ROWS` constants to Portrait orientation (5 cols × 9 rows) in src/components/IntersectionBoardRenderer.tsx
- [X] T012 [US1] Recalculate `INTERSECTION_SPACING` based on available screen HEIGHT (primary constraint for Portrait) in src/components/IntersectionBoardRenderer.tsx
- [X] T013 [US1] Update grid line rendering for Portrait (5 vertical lines, 9 horizontal lines) in src/components/IntersectionBoardRenderer.tsx
- [X] T014 [US1] Update piece positioning to use correct Portrait row/col calculations (index = row * 5 + col) in src/components/IntersectionBoardRenderer.tsx
- [X] T015 [US1] Add SafeAreaView wrapper to handle device notches and safe areas in src/components/IntersectionBoardRenderer.tsx
- [X] T016 [US1] Implement dynamic scaling fallback if board height exceeds available space in src/components/IntersectionBoardRenderer.tsx
- [X] T017 [US1] Update empty intersection dot rendering for 13 center positions in src/components/IntersectionBoardRenderer.tsx
- [ ] T018 [US1] Test Portrait rendering on multiple device sizes (iPhone 13, Galaxy S21, verify no overflow) in tests/integration/components/IntersectionBoardView.test.tsx

### T019-T021: Mode Selector UI Improvements

- [X] T019 [P] [US1] Add "Back/Exit" button to return to mode selection screen in src/components/ModeSelector.tsx
- [X] T020 [P] [US1] Update App.tsx to handle "Back/Exit" navigation (reset match, show mode selector) in App.tsx
- [ ] T021 [US1] Test mode switching with AsyncStorage persistence (Classic → Three Kingdoms → restart app → verify Three Kingdoms selected) in tests/integration/components/ModeSelector.test.tsx

---

## Phase 2: US2 Corrections - Gameplay Logic (12 tasks)

**User Story**: US2 - Play 3-Player Local Multiplayer (Priority: P1)

**Goal**: Implement dynamic faction assignment, Army Chess movement, and turn rotation logic

**Independent Test Criteria**:
- [ ] Player 1 flips piece → assigned to that faction (not pre-assigned)
- [ ] Player 2 flips different faction → assigned; flips same faction → retry (not assigned)
- [ ] Ministers/Horses move without blocking checks (no 象眼/馬腳)
- [ ] Generals/Rooks/Cannons move with rail blocking (stopped by obstacles)
- [ ] Eliminated faction removed from turn rotation (A → C → A if B eliminated)
- [ ] Draw counter decrements on non-capture moves, resets to 60 on capture

### T022-T027: Dynamic Faction Assignment Logic

- [X] T022 [US2] Add `playerFactionMap: Record<number, string | null>` and `currentPlayerIndex` to Match interface in src/core/types.ts (COMPLETED: Phase 5 Part 2)
- [X] T023 [US2] Update BoardGenerator to initialize `playerFactionMap` in `createClassicMatch` and `createThreeKingdomsMatch` in src/core/BoardGenerator.ts (COMPLETED: Phase 5 Part 2)
- [X] T024 [P] [US2] Update turn indicator UI to show "玩家 X 回合 - 翻開棋子選擇陣營" (before assignment) vs "陣營回合" (after assignment) in src/components/GameInfo.tsx (COMPLETED: Phase 5 Part 2)
- [X] T025 [P] [US2] Refactor `executeFlip` in GameEngine to implement First Flip Rule logic (dynamic faction assignment for Three Kingdoms mode) in src/core/GameEngine.ts (COMPLETED: Phase 5 Part 2)
- [X] T026 [US2] Write unit tests for dynamic faction assignment (5 test cases: initialize unassigned, first flip assignment, retry if faction taken, transition to in-progress, player rotation) in tests/unit/core/GameEngine.test.ts (COMPLETED: Phase 5 Part 2)
- [ ] T027 [US2] Write E2E test for First Flip Rule (P1 flips Green, P2 flips Green → retry, P2 flips Red → assigned) in tests/integration/e2e/ThreeKingdomsGameFlow.test.tsx (DEFERRED: Unit tests provide sufficient coverage)

### T028-T033: Army Chess Movement Logic

- [X] T028 [US2] VERIFIED: `ThreeKingdomsRules.isMinisterJump` has no blocking checks - Ministers (相/象) jump 2 diagonals freely in src/core/rules/ThreeKingdomsRules.ts (COMPLETED: Phase 5 Part 2)
- [X] T029 [US2] VERIFIED: `ThreeKingdomsRules.isHorseMove` has no blocking checks - Horses (馬/傌) perform L-shape moves freely in src/core/rules/ThreeKingdomsRules.ts (COMPLETED: Phase 5 Part 2)
- [X] T030 [US2] VERIFIED: `ThreeKingdomsRules.isInfiniteStraitMove` has blocking checks - Generals (帥/將) are blocked by obstacles in src/core/rules/ThreeKingdomsRules.ts (COMPLETED: Phase 5 Part 2)
- [X] T031 [US2] VERIFIED: Rooks and Cannons use `isInfiniteStraitMove` (Rooks) or screen-checking logic (Cannons) - both blocked by obstacles in src/core/rules/ThreeKingdomsRules.ts (COMPLETED: Phase 5 Part 2)
- [X] T032 [US2] VERIFIED: `ThreeKingdomsRules.getLegalMoves` correctly calls movement functions (no blocking for Ministers/Horses, blocking for others) in src/core/rules/ThreeKingdomsRules.ts (COMPLETED: Phase 5 Part 2)
- [X] T033 [US2] Write unit tests for Army Chess movement (9 test cases: Minister/Horse unblocked, General/Rook/Cannon blocked, screen counting) in tests/unit/core/rules/ThreeKingdomsRules.test.ts (COMPLETED: Phase 5 Part 2)

---

## Phase 3: US3 Corrections - Rules Guide Updates (2 tasks)

**User Story**: US3 - Understand Three Kingdoms Rules (Priority: P2)

**Goal**: Update rules guide to reflect v2 corrections (Portrait, Four Corners, Army Chess movement)

**Independent Test Criteria**:
- [ ] Rules guide displays Portrait 5×9 board topology
- [ ] Rules guide explains Four Corners initial setup
- [ ] Rules guide clarifies Ministers/Horses move without blocking

### Rules Guide Content Updates

- [ ] T034 [P] [US3] Update rules guide to describe Portrait 5×9 board (5 cols × 9 rows, 45 intersections) in src/components/RulesGuide.tsx
- [ ] T035 [P] [US3] Update rules guide to explain Four Corners setup (4 blocks of 2×4 pieces, 13 empty center) and Army Chess movement (Ministers/Horses no blocking) in src/components/RulesGuide.tsx

---

## Phase 4: US4 Corrections - Team Color Display (4 tasks)

**User Story**: US4 - Visualize 3 Teams Clearly (Priority: P2)

**Goal**: Ensure GREEN/RED/BLACK colors display correctly for 3 teams

**Independent Test Criteria**:
- [ ] Team 1 (Generals' Army) pieces display with GREEN font/border
- [ ] Team 2 (Red Advisors) pieces display with RED font/border
- [ ] Team 3 (Black Advisors) pieces display with BLACK font/border
- [ ] Turn indicator shows correct team color

### Team Color Rendering

- [ ] T036 [P] [US4] Verify `PieceComponent.tsx` correctly maps `faction.color` to GREEN/RED/BLACK styles in src/components/PieceComponent.tsx
- [ ] T037 [P] [US4] Verify `GameInfo.tsx` displays turn indicator with correct team color (GREEN for Team 1) in src/components/GameInfo.tsx
- [ ] T038 [P] [US4] Update faction color constants in `GameModes.ts` to ensure Team 1 uses 'green' in src/core/GameModes.ts
- [ ] T039 [US4] Write integration test for team color display (verify GREEN/RED/BLACK pieces render correctly) in tests/integration/components/PieceComponent.test.tsx

---

## Phase 5: Polish & Validation (6 tasks)

**Goal**: Comprehensive testing, validation, and cleanup

### Final Testing & Validation

- [ ] T040 [P] Run full unit test suite (expect 122+ tests passing, including v2 corrections) in tests/
- [ ] T041 [P] Run integration tests for Three Kingdoms mode (Four Corners layout, dynamic assignment, Army Chess movement) in tests/integration/
- [ ] T042 Run E2E test for complete 3-player Three Kingdoms match (Four Corners → dynamic assignment → gameplay → elimination/draw) in tests/integration/e2e/ThreeKingdomsGameFlow.test.tsx
- [ ] T043 Test Portrait rendering on multiple devices (iPhone SE, iPhone 13, Galaxy S21, verify SafeAreaView and dynamic scaling) using React Native Debugger
- [ ] T044 Update CHANGELOG.md with v2 corrections summary (Portrait layout, Four Corners, dynamic assignment, Army Chess movement)
- [ ] T045 Commit all v2 corrections with message: "feat(three-kingdoms): implement v2 critical corrections"

---

## Dependency Graph

```text
Phase 0 (Setup) → Phase 1 (US1) → Phase 2 (US2) → Phase 3 (US3) → Phase 4 (US4) → Phase 5 (Polish)
     ↓                 ↓                ↓
   T001-T003      T004-T021        T022-T033
  (validate)   (board & UI fixes) (logic fixes)
                                       ↓
                               T034-T035, T036-T039
                              (rules guide, colors)
                                       ↓
                                   T040-T045
                                  (final validation)
```

**Blocking Dependencies**:
- **T004-T010** (BoardGenerator) MUST complete before T022-T027 (dynamic assignment depends on correct board layout)
- **T011-T018** (IntersectionBoardRenderer) MUST complete before T043 (device testing)
- **T022-T027** (dynamic assignment) MUST complete before T042 (E2E test)
- **T028-T033** (Army Chess movement) MUST complete before T042 (E2E test)

**Parallel Execution Opportunities**:
- **T005-T007** (Four Corners indices) can run in parallel with T011-T013 (Portrait grid constants)
- **T019-T021** (Mode Selector UI) can run in parallel with T004-T018 (BoardGenerator & renderer)
- **T034-T035** (Rules Guide) can run in parallel with T036-T039 (Team Colors)
- **T040-T041** (Unit & Integration tests) can run in parallel

---

## Implementation Strategy

### Phase Execution Order

1. **Setup (T001-T003)**: Validate baseline, create backup
2. **US1 - Board Layout (T004-T021)**: Fix Portrait rendering and Four Corners layout
3. **US2 - Gameplay Logic (T022-T033)**: Implement dynamic assignment and Army Chess movement
4. **US3/US4 - Content Updates (T034-T039)**: Update rules guide and verify team colors
5. **Polish (T040-T045)**: Final testing and validation

### Critical Success Factors

1. **Four Corners Layout**: Correct index mapping for Portrait 5×9 grid (4 blocks of 2×4 pieces, 13 empty center)
2. **Dynamic Faction Assignment**: First Flip Rule logic (players assigned based on flipped piece, retry if faction taken)
3. **Army Chess Movement**: Ministers/Horses move without blocking, Generals/Rooks/Cannons blocked by obstacles
4. **Portrait Rendering**: SafeAreaView + dynamic scaling ensures board fits screen without scrolling
5. **Regression-Free**: All existing Classic mode tests still pass after refactoring

### Testing Approach

- **Unit Tests**: Verify Four Corners indices, dynamic assignment logic, Army Chess movement rules
- **Integration Tests**: Test Portrait rendering, mode switching, team colors
- **E2E Tests**: Complete 3-player game from Four Corners setup → dynamic assignment → gameplay → victory/draw
- **Device Tests**: Portrait rendering on iPhone SE, iPhone 13, Galaxy S21 (verify no overflow)

---

## Key File Changes

### Core Logic Files (High Priority)

| File | Changes | Tasks |
|------|---------|-------|
| `src/core/BoardGenerator.ts` | Implement Four Corners layout (4 blocks, 13 empty center) | T004-T010 |
| `src/core/rules/ThreeKingdomsRules.ts` | Remove blocking for Ministers/Horses, keep for Generals/Rooks/Cannons | T028-T033 |
| `src/store/gameStore.ts` | Add `playerFactionMap`, implement First Flip Rule in `flipPiece` | T022-T027 |

### UI Files (High Priority)

| File | Changes | Tasks |
|------|---------|-------|
| `src/components/IntersectionBoardRenderer.tsx` | Reorient to Portrait 5×9 (5 cols × 9 rows), SafeAreaView, dynamic scaling | T011-T018 |
| `src/components/ModeSelector.tsx` | Add "Back/Exit" button | T019-T020 |
| `src/components/GameInfo.tsx` | Display "Player X's Turn" (before assignment) vs "Faction's Turn" (after) | T024 |

### Test Files (Required)

| File | Changes | Tasks |
|------|---------|-------|
| `tests/unit/core/BoardGenerator.test.ts` | Verify Four Corners layout (4 corners, 13 center empty) | T010 |
| `tests/unit/core/rules/ThreeKingdomsRules.test.ts` | Verify Army Chess movement (Ministers/Horses no blocking) | T033 |
| `tests/unit/store/gameStore.test.ts` | Verify dynamic faction assignment (First Flip Rule) | T026 |
| `tests/integration/e2e/ThreeKingdomsGameFlow.test.tsx` | E2E test for complete 3-player game (Four Corners → dynamic assignment → victory/draw) | T027, T042 |

---

## Expected Outcomes

### After Phase 1 (US1 - Board Layout)
- ✅ Three Kingdoms board displays as Portrait 5×9 grid with Four Corners layout
- ✅ Board fits within screen without scrolling (SafeAreaView + dynamic scaling)
- ✅ Mode selector includes "Back/Exit" button

### After Phase 2 (US2 - Gameplay Logic)
- ✅ Dynamic faction assignment works (First Flip Rule: players assigned based on flipped piece, retry if faction taken)
- ✅ Army Chess movement enforced (Ministers/Horses jump over pieces, Generals/Rooks/Cannons blocked by obstacles)
- ✅ Turn rotation skips eliminated factions
- ✅ Draw counter decrements and resets correctly

### After Phase 3/4 (US3/US4 - Content & Colors)
- ✅ Rules guide explains Portrait, Four Corners, Army Chess movement
- ✅ Team 1 (GREEN), Team 2 (RED), Team 3 (BLACK) colors display correctly

### After Phase 5 (Polish)
- ✅ All 122+ tests passing (100% unit test coverage)
- ✅ E2E test confirms complete 3-player game works (Four Corners → dynamic assignment → victory/draw)
- ✅ Portrait rendering tested on multiple devices (no overflow)
- ✅ v2 corrections documented in CHANGELOG.md

---

## Notes

**Critical Corrections (v2)**:
1. **Portrait 5×9 Layout**: Board MUST be Portrait-oriented (5 columns × 9 rows) aligned with phone's long edge
2. **Four Corners Setup**: Pieces MUST be arranged in 4 corner blocks (2×4 each), NOT random scatter
3. **Dynamic Faction Assignment**: Players MUST be assigned based on First Flip Rule, NOT pre-assigned
4. **Army Chess Movement**: Ministers/Horses MUST move without blocking (no 象眼/馬腳), Generals/Rooks/Cannons MUST be blocked by obstacles
5. **SafeAreaView**: UI MUST handle device notches and fit within screen without scrolling

**Regression Prevention**:
- All existing Classic mode tests MUST still pass after refactoring
- `GameEngine.test.ts` (36 tests), `ClassicRules.test.ts` (33 tests), `BoardGenerator.test.ts` (15 tests) must remain green

**Performance Targets**:
- Three Kingdoms match initialization: < 2 seconds
- Board rendering: 60 FPS (smooth on mobile)
- Turn actions: < 100ms latency

---

**Task List Version**: 5.0 (Phase 5 - Critical Corrections)  
**Generated**: 2026-01-22  
**Total Tasks**: 45  
**Status**: ✅ **READY FOR EXECUTION** - Begin with T001 (Setup & Validation)
