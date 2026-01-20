---

description: "Task list for implementing Classic Dark Chess (Banqi) core gameplay"
---

# Tasks: Classic Dark Chess (Banqi) Core Gameplay Rules

**Input**: Design documents from `/specs/001-banqi-game-rules/`  
**Prerequisites**: `plan.md` (required), `spec.md` (required), `research.md`, `data-model.md`, `contracts/`,
`quickstart.md`

**Tests**: Core logic tests are **REQUIRED** by constitution (100% unit test coverage for `src/core/` using
Jest).

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each
story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [ ] T001 Initialize Expo React Native TypeScript app in repo root (creates `package.json`, `app.json`,
  `App.tsx`)
- [ ] T002 Configure TypeScript strict mode in `tsconfig.json`
- [ ] T003 [P] Configure linting + formatting in `.eslintrc.*`, `.prettierrc`, `.prettierignore`
- [ ] T004 Create project directories per plan in `src/core/`, `src/components/`, `src/store/`,
  `tests/unit/core/`, `tests/integration/components/`
- [ ] T005 Configure Jest + coverage thresholds for core logic in `jest.config.js` and scripts in
  `package.json`
- [ ] T006 [P] Install and configure React Native Testing Library dependencies in `package.json`
- [ ] T007 [P] Add basic `.gitignore` updates for Node/Expo artifacts in `.gitignore` (preserve existing
  entries)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [ ] T008 [P] Define core domain types in `src/core/types.ts` (PieceType, Piece, Board, Match, actions)
- [ ] T009 [P] Define ranks and rule helpers in `src/core/rules.ts` (rank map, King/Pawn rule helpers)
- [ ] T010 [P] Implement board coordinate helpers in `src/core/boardUtils.ts` (index↔row/col, adjacency,
  line scanning for Cannon)
- [ ] T011 Create initial match/board factory in `src/core/BoardGenerator.ts` (API skeleton per plan)
- [ ] T012 Create GameEngine API skeleton in `src/core/GameEngine.ts` (functions per
  `specs/001-banqi-game-rules/contracts/game-engine.md`)
- [ ] T013 [P] Add Jest unit test scaffolding for core files in `tests/unit/core/rules.test.ts`,
  `tests/unit/core/BoardGenerator.test.ts`, `tests/unit/core/GameEngine.test.ts`
- [ ] T014 Create Zustand store skeleton in `src/store/gameStore.ts` (match state + actions that call core
  logic)

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Start a New Match (Priority: P1) 🎯 MVP

**Goal**: A player can start a new match, see a full 4x8 face-down board, and perform the first flip to
assign sides.

**Independent Test**: Start a match → verify 32 face-down pieces → tap a cell to flip → piece reveals and
side assignment + current turn are set.

### Tests for User Story 1 ⚠️

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [ ] T015 [P] [US1] Unit tests for BoardGenerator piece creation + shuffle invariants in
  `tests/unit/core/BoardGenerator.test.ts`
- [ ] T016 [P] [US1] Unit tests for first flip side assignment in `tests/unit/core/GameEngine.test.ts`
  (waiting-first-flip → in-progress)
- [ ] T017 [P] [US1] Unit tests for flip validation edge cases in `tests/unit/core/GameEngine.test.ts`
  (invalid index, already revealed, empty cell, match ended)

### Implementation for User Story 1

- [ ] T018 [US1] Implement `createInitialMatch()` and shuffle placement in `src/core/BoardGenerator.ts`
- [ ] T019 [US1] Implement `validateFlip()` + `executeFlip()` in `src/core/GameEngine.ts`
- [ ] T020 [US1] Implement store actions `newMatch()` and `flipPiece()` in `src/store/gameStore.ts`
- [ ] T021 [P] [US1] Implement `PieceComponent` (face-down vs face-up display) in
  `src/components/PieceComponent.tsx`
- [ ] T022 [P] [US1] Implement tappable grid cell in `src/components/GridCell.tsx`
- [ ] T023 [US1] Implement board rendering + flip interaction in `src/components/BoardView.tsx`
- [ ] T024 [P] [US1] Implement minimal game info display (turn/side) in Traditional Chinese in
  `src/components/GameInfo.tsx`
- [ ] T025 [P] [US1] Integration test: tap to flip reveals a piece in
  `tests/integration/components/BoardView.test.tsx`

**Checkpoint**: User Story 1 is fully functional and testable independently

---

## Phase 4: User Story 2 - Play Turns (Flip, Move, Capture) (Priority: P2)

**Goal**: Players can take turns performing valid Flip/Move/Capture actions; illegal actions are rejected
without state change.

**Independent Test**: From an in-progress match, alternate turns and verify:
flip reveals; move is 1-step orthogonal to empty; capture follows rank + special rules; illegal actions do
not change board.

### Tests for User Story 2 ⚠️

- [ ] T026 [P] [US2] Unit tests for move validation (adjacent only, empty destination, turn ownership) in
  `tests/unit/core/GameEngine.test.ts`
- [ ] T027 [P] [US2] Unit tests for standard rank capture (attacker rank >= target rank) in
  `tests/unit/core/GameEngine.test.ts`
- [ ] T028 [P] [US2] Unit tests for King vs Pawn special rule in `tests/unit/core/GameEngine.test.ts`
- [ ] T029 [P] [US2] Unit tests for Cannon capture screen rule in `tests/unit/core/GameEngine.test.ts`
  (exactly one screen, reject 0 screens, reject 2+ screens, reject adjacent capture)
- [ ] T030 [P] [US2] Unit tests ensuring illegal actions do not mutate state in
  `tests/unit/core/GameEngine.test.ts`

### Implementation for User Story 2

- [ ] T031 [US2] Implement `validateMove()` + `executeMove()` in `src/core/GameEngine.ts`
- [ ] T032 [US2] Implement `validateCapture()` + `executeCapture()` (rank, King/Pawn, Cannon) in
  `src/core/GameEngine.ts`
- [ ] T033 [US2] Implement store actions `movePiece()` and `capturePiece()` in `src/store/gameStore.ts`
- [ ] T034 [US2] Add selection UX and action resolution (flip/move/capture) in `src/components/BoardView.tsx`
- [ ] T035 [P] [US2] Add user-visible error messages in Traditional Chinese for illegal actions in
  `src/components/GameInfo.tsx`
- [ ] T036 [P] [US2] Integration test: move a piece updates board in
  `tests/integration/components/BoardView.test.tsx`
- [ ] T037 [P] [US2] Integration test: illegal action shows error and does not change board in
  `tests/integration/components/BoardView.test.tsx`
- [ ] T038 [P] [US2] Integration test: capture removes target and moves attacker in
  `tests/integration/components/BoardView.test.tsx`

**Checkpoint**: User Stories 1 AND 2 both work independently

---

## Phase 5: User Story 3 - Determine Game End (Win / Stalemate) (Priority: P3)

**Goal**: The game detects win-by-capture-all and win-by-stalemate; ended matches reject further actions.

**Independent Test**: Force capture-all and stalemate scenarios; verify match ends and further actions are
rejected.

### Tests for User Story 3 ⚠️

- [ ] T039 [P] [US3] Unit tests for win-by-capture-all in `tests/unit/core/GameEngine.test.ts`
- [ ] T040 [P] [US3] Unit tests for legal move generation in `tests/unit/core/GameEngine.test.ts`
  (flips/moves/captures set)
- [ ] T041 [P] [US3] Unit tests for stalemate detection in `tests/unit/core/GameEngine.test.ts`
- [ ] T042 [P] [US3] Unit tests that ended matches reject actions in `tests/unit/core/GameEngine.test.ts`

### Implementation for User Story 3

- [ ] T043 [US3] Implement `getLegalMoves()` in `src/core/GameEngine.ts`
- [ ] T044 [US3] Implement `checkWinCondition()` and integrate into turn flow in `src/core/GameEngine.ts`
- [ ] T045 [US3] Update store to persist `status/winner` and block actions after end in
  `src/store/gameStore.ts`
- [ ] T046 [P] [US3] Update UI to display winner + reason in Traditional Chinese in `src/components/GameInfo.tsx`
- [ ] T047 [P] [US3] Integration test: capture-all ends match in
  `tests/integration/components/BoardView.test.tsx`
- [ ] T048 [P] [US3] Integration test: stalemate ends match in
  `tests/integration/components/BoardView.test.tsx`

**Checkpoint**: All user stories are independently functional

---

## Phase N: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [ ] T049 [P] Enforce 100% Jest coverage thresholds for `src/core/**` in `jest.config.js`
- [ ] T050 [P] Add minimalist wooden/traditional styling polish in `src/components/BoardView.tsx` and
  `src/components/GridCell.tsx`
- [ ] T051 [P] Add piece visual styling for face-down vs face-up in `src/components/PieceComponent.tsx`
- [ ] T052 [P] Run and fix all unit tests for core logic (`npm test`) and verify coverage report
- [ ] T053 [P] Run and fix integration tests (`npm test` or dedicated script) in `tests/integration/**`
- [ ] T054 [P] Validate `specs/001-banqi-game-rules/quickstart.md` steps against the real repo setup and
  update the doc if needed

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3+)**: All depend on Foundational phase completion (P1 → P2 → P3)
- **Polish (Final Phase)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - no dependencies on other stories
- **User Story 2 (P2)**: Can start after Foundational (Phase 2) - depends on US1 state model being in place
- **User Story 3 (P3)**: Can start after Foundational (Phase 2) - depends on US2 move/capture to generate
  legal moves and evaluate end conditions

### Within Each User Story

- Unit tests MUST be written and FAIL before implementation (core logic is non-negotiable)
- Core types/utilities before engine functions
- Engine validation/execution before store actions
- Store actions before UI wiring
- Story complete before moving to next priority

### Parallel Opportunities

- Many unit test tasks are [P] (same file but independent test cases; consolidate if preferred)
- UI components (`GridCell`, `PieceComponent`, `GameInfo`) can be developed in parallel once store shape is
  fixed
- Different user stories can be worked on in parallel only after Phase 2, but MVP delivery should follow
  P1 → P2 → P3

---

## Parallel Example: User Story 1

```bash
# Parallel unit tests (can be authored separately, then merged):
Task: "Unit tests for BoardGenerator in tests/unit/core/BoardGenerator.test.ts"
Task: "Unit tests for first flip side assignment in tests/unit/core/GameEngine.test.ts"

# Parallel UI components:
Task: "Implement PieceComponent in src/components/PieceComponent.tsx"
Task: "Implement GridCell in src/components/GridCell.tsx"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1
4. **STOP and VALIDATE**: Test User Story 1 independently

### Incremental Delivery

1. Setup + Foundational → foundation ready
2. Add User Story 1 → test independently (MVP)
3. Add User Story 2 → test independently
4. Add User Story 3 → test independently
5. Polish → performance and UI consistency

---

## Notes

- Keep `src/core/` pure TypeScript (NO React imports)
- UI text must be Traditional Chinese; code/comments/commits are English
- Cannon capture is the highest-risk rule; ensure exhaustive unit tests
