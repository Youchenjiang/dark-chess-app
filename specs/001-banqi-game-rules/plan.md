# Implementation Plan: Classic Dark Chess (Banqi) Core Gameplay Rules

**Branch**: `001-banqi-game-rules` | **Date**: 2025-01-27 | **Spec**: `specs/001-banqi-game-rules/spec.md`
**Input**: Feature specification from `/specs/001-banqi-game-rules/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Implement the complete Banqi (Dark Chess) game rules engine with a React Native UI. The core game logic will be implemented as pure TypeScript modules in `src/core/` with zero UI dependencies, enabling 100% unit test coverage. The UI layer will use React Native components with Zustand for state management, following Clean Architecture principles. The game supports a 4x8 grid board with 32 pieces, turn-based gameplay (flip/move/capture), complex capture rules (rank hierarchy, King vs Pawn, Cannon screen capture), and win condition detection.

## Technical Context

**Language/Version**: TypeScript 5.x (strict mode enabled)  
**Primary Dependencies**: React Native, Expo SDK (Managed Workflow), Zustand (state management), Jest (testing)  
**Storage**: In-memory state only (no persistent storage required for core gameplay)  
**Testing**: Jest for unit tests (100% coverage required for core logic), React Native Testing Library for UI integration tests  
**Target Platform**: iOS and Android via Expo Managed Workflow  
**Project Type**: Mobile application  
**Performance Goals**: 60 FPS UI rendering, move validation < 10ms, board state updates < 50ms  
**Constraints**: Offline-capable (no network required), < 100MB memory footprint, responsive 4x8 grid layout  
**Scale/Scope**: Single-player vs single-player (local), 1 game session at a time

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

Verify compliance with Dark Chess App Constitution principles:

- **Framework**: Confirm React Native with Expo Managed Workflow and TypeScript usage
- **Architecture**: Verify Clean Architecture separation (Game Core Logic vs UI Components)
- **Testing**: Ensure Game Core Logic has 100% unit test coverage plan with Jest
- **UI/UX**: Validate minimalist traditional Chinese aesthetic and 4x8 responsive grid
- **Language**: Confirm English code/comments and Traditional Chinese UI text
- **State Management**: Verify Zustand usage for game board state

Any violations MUST be justified in the Complexity Tracking table below.

## Project Structure

### Documentation (this feature)

```text
specs/[###-feature]/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
src/
├── core/                    # Pure TypeScript game logic (NO React dependencies)
│   ├── GameEngine.ts        # Move validation, capture rules, win detection
│   ├── BoardGenerator.ts    # Shuffling and initial board placement
│   ├── types.ts             # Piece types, board state types
│   └── rules.ts             # Rule constants (ranks, special rules)
├── components/              # React Native UI components
│   ├── BoardView.tsx        # Main 4x8 grid board component
│   ├── GridCell.tsx         # Individual cell with tap handling
│   ├── PieceComponent.tsx   # Piece display (face-down/face-up, Chinese characters)
│   └── GameInfo.tsx        # Turn indicator, captured pieces display
└── store/                   # Zustand state management
    └── gameStore.ts         # Game state (board, turn, scores, match status)

tests/
├── unit/                    # Jest unit tests (core logic)
│   ├── core/
│   │   ├── GameEngine.test.ts
│   │   ├── BoardGenerator.test.ts
│   │   └── rules.test.ts
└── integration/            # UI integration tests
    └── components/
        └── BoardView.test.tsx
```

**Structure Decision**: Mobile application structure with strict separation between core logic (`src/core/`) and UI components (`src/components/`). Core logic is pure TypeScript with zero React dependencies, enabling independent testing. State management uses Zustand in `src/store/`. Tests are co-located with source files following the constitution requirements.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

No violations detected. All technical decisions comply with constitution requirements.

## Phase 0: Research Complete ✅

**Date**: 2025-01-27

All technical clarifications resolved. Research document generated at `specs/001-banqi-game-rules/research.md`.

**Key Decisions**:
- React Native with Expo Managed Workflow (constitution requirement)
- Clean Architecture with pure TypeScript core (constitution requirement)
- Zustand for state management (constitution requirement)
- Jest for testing (constitution requirement)
- 1D array (32 elements) for board representation
- Piece object structure with id, type, color, isRevealed, isDead

## Phase 1: Design Complete ✅

**Date**: 2025-01-27

**Generated Artifacts**:
- `data-model.md` - Complete entity definitions, relationships, and data flow
- `contracts/game-engine.md` - API contracts for all core logic functions
- `quickstart.md` - Implementation guide and testing strategy

**Agent Context Updated**: Cursor IDE context file updated with technology stack information.

**Constitution Check Re-evaluation**: ✅ All principles still compliant after design phase.
