# Implementation Tasks: Three Kingdoms Dark Chess (三國暗棋)

**Feature**: `002-three-kingdoms-dark-chess`  
**Branch**: `002-three-kingdoms-dark-chess`  
**Status**: Ready for Implementation  
**Generated**: 2026-01-22

---

## Summary

**Total Tasks**: 87 tasks across 7 phases  
**Parallel Opportunities**: 34 parallelizable tasks marked with [P]  
**Test Coverage Required**: 100% for core logic (ClassicRules, ThreeKingdomsRules)  
**Estimated Effort**: 4-6 days (43 hours)

**Task Breakdown by Phase**:
- Phase 1 (Setup): 2 tasks
- Phase 2 (Foundational): 18 tasks  
- Phase 3 (User Story 1): 14 tasks
- Phase 4 (User Story 2): 22 tasks
- Phase 5 (User Story 4): 13 tasks
- Phase 6 (User Story 3): 8 tasks
- Phase 7 (Polish): 10 tasks

---

## Phase 1: Setup

**Goal**: Initialize project structure for multi-mode support

**Blocking**: All subsequent phases depend on this

### Tasks

- [ ] T001 Review existing Classic Dark Chess implementation in src/core/
- [ ] T002 Create src/core/rules/ directory for Strategy Pattern implementations

**Duration**: 30 minutes  
**Dependencies**: None  
**Parallel**: N/A (setup tasks are sequential)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Goal**: Refactor core architecture to support pluggable rule systems

**Blocking**: User stories 1, 2, and 4 depend on this foundation

**Independent Test**: Classic mode regression tests pass without modifications

### Tasks

#### Type Refactoring

- [ ] T003 Add GameMode interface to src/core/types.ts
- [ ] T004 Add Faction interface to src/core/types.ts
- [ ] T005 [P] Replace Piece.color with Piece.factionId in src/core/types.ts
- [ ] T006 [P] Add mode, factions, activeFactions, currentFactionIndex fields to Match in src/core/types.ts
- [ ] T007 [P] Add capturedByFaction, movesWithoutCapture fields to Match in src/core/types.ts
- [ ] T008 [P] Change Match.winner from 'red'|'black'|null to string|null in src/core/types.ts

#### RuleSet Interface

- [ ] T009 Create RuleSet interface in src/core/RuleSet.ts
- [ ] T010 Add validateMove method signature to RuleSet interface
- [ ] T011 Add validateCapture method signature to RuleSet interface
- [ ] T012 Add checkWinCondition method signature to RuleSet interface
- [ ] T013 Add checkDrawCondition method signature to RuleSet interface
- [ ] T014 Add getLegalMoves method signature to RuleSet interface
- [ ] T015 Add getAdjacentIndices method signature to RuleSet interface
- [ ] T016 Add canPieceCapture method signature to RuleSet interface

#### ClassicRules Extraction

- [ ] T017 Create ClassicRules class implementing RuleSet in src/core/rules/ClassicRules.ts
- [ ] T018 [P] Extract validateMove logic from GameEngine.ts to ClassicRules
- [ ] T019 [P] Extract validateCapture logic from GameEngine.ts to ClassicRules
- [ ] T020 [P] Extract checkWinCondition logic from GameEngine.ts to ClassicRules

**Duration**: 6 hours  
**Dependencies**: T001-T002  
**Parallel Opportunities**: T005-T008 (type changes), T018-T020 (logic extraction)

### Testing

- [ ] T021 Write unit tests for ClassicRules.validateMove in tests/unit/core/rules/ClassicRules.test.ts (target: 100% coverage)
- [ ] T022 Write unit tests for ClassicRules.validateCapture in tests/unit/core/rules/ClassicRules.test.ts (target: 100% coverage)
- [ ] T023 Write unit tests for ClassicRules.checkWinCondition in tests/unit/core/rules/ClassicRules.test.ts (target: 100% coverage)
- [ ] T024 Write unit tests for ClassicRules adjacency logic (8x4 grid) in tests/unit/core/rules/ClassicRules.test.ts
- [ ] T025 Run existing 001 tests to verify no Classic mode regressions

**Test Coverage Target**: 100% for ClassicRules

---

## Phase 3: User Story 1 - Switch Between Classic and Three Kingdoms Modes (P1)

**User Story**: As a player, I want to **select between Classic (2-player) and Three Kingdoms (3-player) modes** so that I can choose my preferred game variant.

**Goal**: Enable mode selection UI and persist user choice

**Independent Test**: User can switch between modes and see correct board layout (32 cells vs 45 intersections)

**Priority**: P1 (blocks User Story 2)

### Tasks

#### ThreeKingdomsRules Core Logic

- [ ] T026 [US1] Create ThreeKingdomsRules class implementing RuleSet in src/core/rules/ThreeKingdomsRules.ts
- [ ] T027 [P] [US1] Implement getAdjacentIndices for 9x5 grid (45 intersections) in ThreeKingdomsRules
- [ ] T028 [P] [US1] Implement canPieceCapture with no rank hierarchy in ThreeKingdomsRules
- [ ] T029 [P] [US1] Implement validateMove for Three Kingdoms in ThreeKingdomsRules
- [ ] T030 [P] [US1] Implement validateCapture for Three Kingdoms in ThreeKingdomsRules
- [ ] T031 [US1] Implement checkWinCondition for elimination victory in ThreeKingdomsRules
- [ ] T032 [US1] Implement checkDrawCondition for 60-move rule in ThreeKingdomsRules

#### GameModes Registry

- [ ] T033 [US1] Create GAME_MODES registry in src/core/GameModes.ts
- [ ] T034 [US1] Define GAME_MODES.classic with ClassicRules instance in GameModes.ts
- [ ] T035 [US1] Define GAME_MODES.threeKingdoms with ThreeKingdomsRules instance in GameModes.ts

#### BoardGenerator Multi-Mode

- [ ] T036 [US1] Refactor createInitialMatch to accept GameMode parameter in src/core/BoardGenerator.ts
- [ ] T037 [P] [US1] Implement Classic mode initialization (32 pieces, 32-element board) in BoardGenerator
- [ ] T038 [P] [US1] Implement Three Kingdoms initialization (32 pieces, 45-element board, 13 nulls) in BoardGenerator
- [ ] T039 [US1] Implement 12+10+10 piece distribution for Three Kingdoms in BoardGenerator

**Duration**: 8 hours  
**Dependencies**: T003-T020 (Foundational phase)  
**Parallel Opportunities**: T027-T030 (ThreeKingdomsRules methods), T037-T038 (BoardGenerator modes)

### Testing

- [ ] T040 [P] [US1] Write unit tests for ThreeKingdomsRules.validateMove (100% coverage)
- [ ] T041 [P] [US1] Write unit tests for ThreeKingdomsRules.validateCapture (100% coverage)
- [ ] T042 [P] [US1] Write unit tests for ThreeKingdomsRules.checkWinCondition (100% coverage)
- [ ] T043 [P] [US1] Write unit tests for ThreeKingdomsRules.checkDrawCondition (100% coverage)
- [ ] T044 [P] [US1] Write unit tests for ThreeKingdomsRules adjacency (9x5 grid)
- [ ] T045 [P] [US1] Write unit tests for BoardGenerator with Classic mode
- [ ] T046 [P] [US1] Write unit tests for BoardGenerator with Three Kingdoms mode (45 positions, 13 nulls)
- [ ] T047 [US1] Verify Classic mode still works after BoardGenerator refactoring

**Test Coverage Target**: 100% for ThreeKingdomsRules, 100% for BoardGenerator multi-mode logic

---

## Phase 4: User Story 2 - Play 3-Player Local Multiplayer (P1)

**User Story**: As a player, I want to **play Three Kingdoms Dark Chess with 2 other players locally** (pass-and-play), taking turns flipping, moving, and capturing pieces.

**Goal**: Implement complete 3-player gameplay with turn rotation, elimination, and draw counter

**Independent Test**: Three players can complete a full game from setup to victory or draw

**Priority**: P1 (core gameplay loop)

### Tasks

#### State Management

- [ ] T048 [US2] Add currentMode field to GameStore in src/store/gameStore.ts
- [ ] T049 [US2] Implement setMode action in GameStore
- [ ] T050 [US2] Implement loadPersistedMode action with AsyncStorage in GameStore
- [ ] T051 [US2] Update newMatch action to use currentMode in GameStore
- [ ] T052 [US2] Update flipPiece action to use match.mode.ruleSet in GameStore
- [ ] T053 [US2] Update movePiece action to handle draw counter (Three Kingdoms) in GameStore
- [ ] T054 [US2] Update capturePiece action to reset draw counter (Three Kingdoms) in GameStore

#### GameEngine Delegation

- [ ] T055 [US2] Update GameEngine.executeFlip to work with multi-mode Match structure
- [ ] T056 [US2] Update GameEngine.executeMove to decrement draw counter (if not null)
- [ ] T057 [US2] Update GameEngine.executeCapture to reset draw counter to 60 (if not null)
- [ ] T058 [US2] Update GameEngine turn rotation logic to use activeFactions array

#### Board Renderers

- [ ] T059 [P] [US2] Create ClassicBoardRenderer component in src/components/ClassicBoardRenderer.tsx
- [ ] T060 [P] [US2] Implement 8x4 cell-based rendering in ClassicBoardRenderer
- [ ] T061 [P] [US2] Create IntersectionBoardRenderer component in src/components/IntersectionBoardRenderer.tsx
- [ ] T062 [P] [US2] Implement 9x5 intersection-based rendering with grid lines in IntersectionBoardRenderer
- [ ] T063 [US2] Update BoardView to conditionally render ClassicBoardRenderer or IntersectionBoardRenderer based on mode

#### Mode Selector UI

- [ ] T064 [US2] Create ModeSelector component in src/components/ModeSelector.tsx
- [ ] T065 [US2] Display "經典暗棋 (Classic)" and "三國暗棋 (Three Kingdoms)" buttons in ModeSelector
- [ ] T066 [US2] Highlight currently selected mode in ModeSelector
- [ ] T067 [US2] Call setMode and newMatch when user selects a mode in ModeSelector

**Duration**: 10 hours  
**Dependencies**: T026-T047 (User Story 1)  
**Parallel Opportunities**: T059-T062 (board renderers can be developed in parallel)

### Testing

- [ ] T068 [P] [US2] Write unit tests for GameStore.setMode action
- [ ] T069 [P] [US2] Write unit tests for GameStore.loadPersistedMode with AsyncStorage
- [ ] T070 [P] [US2] Write unit tests for GameStore.newMatch with both modes
- [ ] T071 [P] [US2] Write unit tests for draw counter decrement in movePiece action
- [ ] T072 [P] [US2] Write unit tests for draw counter reset in capturePiece action
- [ ] T073 [P] [US2] Write integration test for ModeSelector UI
- [ ] T074 [P] [US2] Write integration test for ClassicBoardRenderer (8x4 cells)
- [ ] T075 [P] [US2] Write integration test for IntersectionBoardRenderer (9x5 intersections)
- [ ] T076 [US2] Write E2E test for complete 3-player Three Kingdoms match (flip, move, capture, elimination)
- [ ] T077 [US2] Write E2E test for draw condition (60 moves without capture)
- [ ] T078 [US2] Write E2E test for elimination and turn skipping (Player B eliminated, turn A → C → A)

**Test Coverage Target**: 100% for GameStore multi-mode logic, E2E coverage for 3-player gameplay

---

## Phase 5: User Story 4 - Visualize 3 Teams Clearly (P2)

**User Story**: As a player, I want to **distinguish between the 3 teams visually** so that I can quickly identify which pieces belong to which faction.

**Goal**: Implement GREEN/RED/BLACK team color system and draw counter display

**Independent Test**: All revealed pieces display team colors correctly (GREEN/RED/BLACK)

**Priority**: P2 (enhances User Story 2)

**Note**: This phase is scheduled after US2 because it enhances the visual clarity of the 3-player gameplay implemented in US2.

### Tasks

#### Piece Visualization

- [ ] T079 [P] [US4] Update PieceComponent to accept factionColor prop in src/components/PieceComponent.tsx
- [ ] T080 [P] [US4] Render piece with GREEN color for Team 1 (Generals' Army) in PieceComponent
- [ ] T081 [P] [US4] Render piece with RED color for Team 2 (Red Advisors) in PieceComponent
- [ ] T082 [P] [US4] Render piece with BLACK color for Team 3 (Black Advisors) in PieceComponent

#### Game Info Panel

- [ ] T083 [US4] Update GameInfo to display 3-player turn indicator in src/components/GameInfo.tsx
- [ ] T084 [P] [US4] Display current turn with team color highlighting (GREEN/RED/BLACK) in GameInfo
- [ ] T085 [P] [US4] Display "Moves Until Draw" counter for Three Kingdoms mode in GameInfo
- [ ] T086 [P] [US4] Display captured pieces per faction (3 separate counts) in GameInfo
- [ ] T087 [US4] Show eliminated teams as grayed out in GameInfo

#### Empty Intersection Display

- [ ] T088 [US4] Render empty intersection points as small dots in IntersectionBoardRenderer
- [ ] T089 [US4] Visually distinguish occupied vs empty intersections (13 empty spots)

**Duration**: 4 hours  
**Dependencies**: T048-T078 (User Story 2)  
**Parallel Opportunities**: T079-T082 (piece colors), T084-T086 (GameInfo updates)

### Testing

- [ ] T090 [P] [US4] Write integration test for PieceComponent with GREEN faction color
- [ ] T091 [P] [US4] Write integration test for PieceComponent with RED faction color
- [ ] T092 [P] [US4] Write integration test for PieceComponent with BLACK faction color
- [ ] T093 [P] [US4] Write integration test for GameInfo 3-player turn indicator
- [ ] T094 [P] [US4] Write integration test for GameInfo draw counter display
- [ ] T095 [US4] Write snapshot test for all 3 team colors on board

**Test Coverage Target**: Visual regression tests for 3 team colors

---

## Phase 6: User Story 3 - Understand Three Kingdoms Rules (P2)

**User Story**: As a new player, I want to **access a rules guide for Three Kingdoms** mode so that I understand the differences from Classic.

**Goal**: Create in-app rules guide with Traditional Chinese text

**Independent Test**: Rules screen displays all team compositions, movement rules, capture rules, and draw rule

**Priority**: P2 (educational content)

### Tasks

#### Rules Screen

- [ ] T096 [US3] Create RulesScreen component in src/components/RulesScreen.tsx
- [ ] T097 [US3] Display team distribution section (12+10+10 pieces) in RulesScreen
- [ ] T098 [P] [US3] Display movement rules section (Generals, Ministers, Horses) in RulesScreen
- [ ] T099 [P] [US3] Display capture rules section (no rank hierarchy) in RulesScreen
- [ ] T100 [P] [US3] Display win conditions section (elimination, draw, stalemate) in RulesScreen
- [ ] T101 [US3] Add "Three Kingdoms Rules" button to ModeSelector
- [ ] T102 [US3] Navigate to RulesScreen when user taps "Three Kingdoms Rules" button

**Duration**: 3 hours  
**Dependencies**: T048-T078 (User Story 2)  
**Parallel Opportunities**: T098-T100 (rules sections can be written in parallel)

### Testing

- [ ] T103 [P] [US3] Write integration test for RulesScreen rendering
- [ ] T104 [US3] Write snapshot test for RulesScreen Traditional Chinese text

**Test Coverage Target**: Basic rendering and navigation tests

---

## Phase 7: Polish & Cross-Cutting Concerns

**Goal**: Final optimization, performance testing, and documentation

**Independent Test**: All performance targets met (< 2s init, 60 FPS, < 10ms validation)

### Tasks

#### Performance Optimization

- [ ] T105 Measure match initialization time for Three Kingdoms mode (target: < 2 seconds)
- [ ] T106 Measure move validation time (target: < 10ms)
- [ ] T107 Measure board rendering time (target: 60 FPS)
- [ ] T108 Optimize getLegalMoves if performance targets not met
- [ ] T109 Add React.memo to PieceComponent and GridCell if needed

#### Final Testing & QA

- [ ] T110 Run full test suite (unit + integration + E2E) for both modes
- [ ] T111 Verify Classic mode has no regressions (compare with 001 baseline)
- [ ] T112 Manual QA testing on iOS device (mode switch, 3-player game, draw counter)
- [ ] T113 Manual QA testing on Android device (mode switch, 3-player game, draw counter)
- [ ] T114 Fix any linter errors or warnings

**Duration**: 4 hours  
**Dependencies**: All previous phases  
**Parallel Opportunities**: T112-T113 (iOS/Android testing in parallel)

---

## Dependencies Graph

```text
Phase 1 (Setup)
   └─> Phase 2 (Foundational - ClassicRules extraction)
          └─> Phase 3 (US1 - ThreeKingdomsRules, Mode Selection)
                 └─> Phase 4 (US2 - 3-Player Gameplay)
                        ├─> Phase 5 (US4 - Visual Clarity)
                        └─> Phase 6 (US3 - Rules Guide)
                               └─> Phase 7 (Polish)
```

**Critical Path**: Phase 1 → Phase 2 → Phase 3 → Phase 4 → Phase 7

**Parallel Opportunities**:
- Phase 5 (US4) can run in parallel with Phase 6 (US3) after Phase 4 completes
- Within each phase, tasks marked with [P] can be parallelized

---

## Parallel Execution Examples

### Phase 2 (Foundational)

**Parallel Stream 1**: Type refactoring (T005-T008)  
**Parallel Stream 2**: ClassicRules logic extraction (T018-T020)  
**Parallel Stream 3**: ClassicRules unit tests (T021-T024)

```bash
# Developer A: Type refactoring
git checkout -b feat/002-types
# Work on T005-T008

# Developer B: ClassicRules extraction
git checkout -b feat/002-classic-rules
# Work on T018-T020

# Developer C: ClassicRules tests
git checkout -b feat/002-classic-rules-tests
# Work on T021-T024
```

---

### Phase 3 (US1)

**Parallel Stream 1**: ThreeKingdomsRules methods (T027-T030)  
**Parallel Stream 2**: BoardGenerator modes (T037-T038)  
**Parallel Stream 3**: Unit tests (T040-T046)

```bash
# Developer A: ThreeKingdomsRules implementation
git checkout -b feat/002-us1-tk-rules
# Work on T027-T030

# Developer B: BoardGenerator multi-mode
git checkout -b feat/002-us1-board-gen
# Work on T037-T038

# Developer C: Unit tests
git checkout -b feat/002-us1-tests
# Work on T040-T046
```

---

### Phase 4 (US2)

**Parallel Stream 1**: Board renderers (T059-T062)  
**Parallel Stream 2**: Mode selector UI (T064-T067)  
**Parallel Stream 3**: Integration tests (T073-T075)

```bash
# Developer A: ClassicBoardRenderer
git checkout -b feat/002-us2-classic-renderer
# Work on T059-T060

# Developer B: IntersectionBoardRenderer
git checkout -b feat/002-us2-intersection-renderer
# Work on T061-T062

# Developer C: ModeSelector
git checkout -b feat/002-us2-mode-selector
# Work on T064-T067
```

---

## Implementation Strategy

### MVP (Minimum Viable Product)

**Scope**: Phase 1 + Phase 2 + Phase 3 (User Story 1)

**Rationale**: Mode selection is the entry point for all Three Kingdoms features. Without it, users cannot access the new variant.

**Duration**: ~2 days (14 hours)

**Deliverable**: Users can switch between Classic and Three Kingdoms modes, see correct board layouts, but full 3-player gameplay is not yet implemented.

---

### Incremental Delivery Plan

**Iteration 1** (MVP): Phase 1-3 (Mode Selection)  
**Iteration 2**: Phase 4 (3-Player Gameplay)  
**Iteration 3**: Phase 5 (Visual Clarity) + Phase 6 (Rules Guide)  
**Iteration 4**: Phase 7 (Polish)

Each iteration produces a testable, demoable increment.

---

## Testing Summary

### Unit Tests (Required - 100% Coverage)

**Core Logic**:
- `tests/unit/core/rules/ClassicRules.test.ts` - 100% coverage (T021-T025)
- `tests/unit/core/rules/ThreeKingdomsRules.test.ts` - 100% coverage (T040-T044)
- `tests/unit/core/BoardGenerator.test.ts` - Both modes (T045-T047)

**State Management**:
- `tests/unit/store/gameStore.test.ts` - Mode selection, persistence (T068-T072)

### Integration Tests

**UI Components**:
- `tests/integration/components/ModeSelector.test.tsx` (T073)
- `tests/integration/components/ClassicBoardRenderer.test.tsx` (T074)
- `tests/integration/components/IntersectionBoardRenderer.test.tsx` (T075)
- `tests/integration/components/PieceComponent.test.tsx` (T090-T092)
- `tests/integration/components/GameInfo.test.tsx` (T093-T094)
- `tests/integration/components/RulesScreen.test.tsx` (T103)

### E2E Tests

**Complete Game Flows**:
- `tests/e2e/ClassicGameFlow.test.tsx` - No regressions (T111)
- `tests/e2e/ThreeKingdomsGameFlow.test.tsx` - Full 3-player game (T076-T078)

### Performance Tests

- Match initialization < 2 seconds (T105)
- Move validation < 10ms (T106)
- Board rendering 60 FPS (T107)

---

## Commit Strategy

Follow Conventional Commits format. Suggested commits per phase:

### Phase 2 (Foundational)

```bash
git commit -m "refactor(core): extend types for multi-mode support

- Add GameMode and Faction types (T003-T004)
- Replace Piece.color with Piece.factionId (T005)
- Extend Match with mode, factions, activeFactions (T006-T007)
- Change Match.winner to string (T008)

BREAKING CHANGE: Match structure modified for multi-player support"

git commit -m "refactor(core): define RuleSet interface

- Create RuleSet interface with 7 methods (T009-T016)
- Prepare for Strategy Pattern implementation"

git commit -m "refactor(core): extract Classic logic into ClassicRules

- Create ClassicRules class implementing RuleSet (T017)
- Extract validateMove, validateCapture, checkWinCondition (T018-T020)
- Maintain 100% unit test coverage (T021-T025)

No functional changes to Classic mode behavior"
```

### Phase 3 (User Story 1)

```bash
git commit -m "feat(core): implement Three Kingdoms rule system

- Create ThreeKingdomsRules class (T026)
- Implement 9x5 grid adjacency (T027)
- Implement no rank hierarchy (T028)
- Implement draw counter logic (T032)
- 100% unit test coverage (T040-T044)"

git commit -m "feat(core): create GameModes registry

- Define GAME_MODES.classic and GAME_MODES.threeKingdoms (T033-T035)
- Centralized mode configuration"

git commit -m "refactor(core): update BoardGenerator for multi-mode

- Accept GameMode parameter in createInitialMatch (T036)
- Support Classic (32 cells) and Three Kingdoms (45 intersections) (T037-T038)
- Implement 12+10+10 piece distribution (T039)
- Unit tests for both modes (T045-T047)"
```

### Phase 4 (User Story 2)

```bash
git commit -m "feat(store): add mode selection to GameStore

- Add currentMode, setMode, loadPersistedMode (T048-T050)
- Update newMatch to use currentMode (T051)
- Persist mode to AsyncStorage (T050)
- Unit tests for mode management (T068-T070)"

git commit -m "refactor(store): update game actions for multi-mode

- Update flipPiece to use match.mode.ruleSet (T052)
- Handle draw counter in movePiece and capturePiece (T053-T054)
- Unit tests for draw counter (T071-T072)"

git commit -m "feat(ui): create board renderers for both modes

- Create ClassicBoardRenderer (8x4 cells) (T059-T060)
- Create IntersectionBoardRenderer (9x5 intersections) (T061-T062)
- Update BoardView to conditionally render (T063)
- Integration tests (T074-T075)"

git commit -m "feat(ui): add mode selector component

- Create ModeSelector UI (T064-T067)
- Display Classic and Three Kingdoms options
- Integration test (T073)"

git commit -m "test(e2e): add Three Kingdoms gameplay tests

- E2E test for full 3-player match (T076)
- E2E test for draw condition (T077)
- E2E test for elimination and turn skipping (T078)"
```

### Phase 5 (User Story 4)

```bash
git commit -m "feat(ui): add 3-team color visualization

- Update PieceComponent for GREEN/RED/BLACK colors (T079-T082)
- Update GameInfo for 3-player indicators (T083-T084)
- Display draw counter (T085)
- Display captured pieces per faction (T086)
- Integration tests for team colors (T090-T095)"

git commit -m "feat(ui): visualize empty intersections

- Render empty spots as dots (T088-T089)
- Distinguish occupied vs empty (13 spots)"
```

### Phase 6 (User Story 3)

```bash
git commit -m "feat(ui): add Three Kingdoms rules guide

- Create RulesScreen component (T096)
- Display team distribution, movement rules, capture rules (T097-T100)
- Add navigation from ModeSelector (T101-T102)
- Integration tests (T103-T104)"
```

### Phase 7 (Polish)

```bash
git commit -m "perf(core): optimize Three Kingdoms performance

- Measure and optimize match initialization (T105)
- Optimize move validation (T106)
- Optimize board rendering (T107-T109)
- All targets met: < 2s init, 60 FPS, < 10ms validation"

git commit -m "test(qa): comprehensive QA and regression testing

- Full test suite passing (T110)
- No Classic mode regressions (T111)
- Manual QA on iOS and Android (T112-T113)
- Fix linter errors (T114)"
```

---

## Validation Checklist

Before marking feature complete:

- [ ] All 87 tasks completed
- [ ] All unit tests pass (100% coverage for core logic)
- [ ] All integration tests pass
- [ ] All E2E tests pass
- [ ] Classic mode behavior unchanged (no regressions)
- [ ] Three Kingdoms mode fully functional:
  - [ ] 45-position board (32 pieces + 13 nulls)
  - [ ] 3-player turn rotation
  - [ ] Elimination and turn skipping
  - [ ] Draw counter (60 moves)
  - [ ] No rank hierarchy
  - [ ] Modified movement rules
- [ ] UI complete:
  - [ ] Mode selector
  - [ ] 3-player turn indicator
  - [ ] Draw counter display
  - [ ] GREEN/RED/BLACK team colors
  - [ ] Empty intersections
  - [ ] Rules guide
- [ ] Mode selection persists across app restarts
- [ ] Performance targets met (< 2s init, 60 FPS, < 10ms validation)
- [ ] No linter errors
- [ ] All commits follow Conventional Commits format

---

## Success Criteria Mapping

| Success Criterion | Tasks | Verification |
|-------------------|-------|--------------|
| **SC-001**: Complete 3-player match | T048-T078 | E2E test (T076) |
| **SC-002**: Mode switch < 3 taps | T064-T067 | Integration test (T073) |
| **SC-003**: 100% rules enforced | T040-T044 | Unit tests (100% coverage) |
| **SC-004**: Turn rotation with elimination | T058, T078 | E2E test (T078) |
| **SC-005**: Elimination victory | T031, T076 | E2E test (T076) |
| **SC-006**: Draw condition (60 moves) | T032, T077 | E2E test (T077) |
| **SC-007**: 3 team colors (GREEN/RED/BLACK) | T079-T087, T090-T095 | Integration/snapshot tests |
| **SC-008**: Extensible architecture | T009-T016 | RuleSet interface design |
| **SC-009**: No performance degradation | T105-T109 | Performance tests |

---

## Next Steps

1. ✅ **Task breakdown complete** (this document)
2. 🔜 **Begin implementation** following task order (T001 → T114)
3. 🔜 **Commit after each logical group** using Conventional Commits format
4. 🔜 **Run tests continuously** (TDD approach: write tests before implementation)
5. 🔜 **Manual QA** after Phase 4 (first playable version)
6. 🔜 **Performance profiling** in Phase 7
7. 🔜 **Final review** and merge to main after all validation checks pass

---

**Tasks Version**: 1.0.0  
**Status**: ✅ Ready for Implementation  
**Last Updated**: 2026-01-22  
**Total Estimated Effort**: 4-6 days (43 hours)
