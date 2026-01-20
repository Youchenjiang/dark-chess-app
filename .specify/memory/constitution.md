<!--
Sync Impact Report:
Version change: [TEMPLATE] → 1.0.0
Modified principles: N/A (initial creation)
Added sections: Core Principles (6 principles), Development Standards, Governance
Removed sections: N/A
Templates requiring updates:
  ✅ .specify/templates/plan-template.md - Updated Constitution Check section
  ✅ .specify/templates/spec-template.md - Verified alignment
  ✅ .specify/templates/tasks-template.md - Verified alignment
Follow-up TODOs: None
-->

# Dark Chess App Constitution

## Core Principles

### I. React Native with Expo Framework

The project MUST use React Native with Expo Managed Workflow for seamless Android/iOS deployment. TypeScript MUST be used strictly throughout the codebase. This ensures cross-platform compatibility, simplified deployment, and type safety across the entire application.

### II. Clean Architecture Separation

The Game Core Logic MUST be completely separated from React UI Components. The core logic MUST be implemented as pure TypeScript with zero UI dependencies. This separation enables:
- Independent testing of game rules without UI complexity
- Reusability of game logic across different UI implementations
- Clear boundaries between business logic and presentation layer

### III. Comprehensive Testing (NON-NEGOTIABLE)

The Game Core Logic MUST achieve 100% unit test coverage using Jest. All game rules including piece hierarchy, movement validation, and capturing logic MUST be verified through automated tests. This is critical for a strategy game where rule correctness directly impacts gameplay integrity.

### IV. Minimalist Traditional Chinese Aesthetic

The UI/UX MUST follow a minimalist aesthetic with traditional Chinese feel. Visual design MUST use wooden textures or simple colors. The game board MUST be responsive and implement a 4x8 grid layout. This ensures cultural authenticity while maintaining modern usability standards.

### V. Language Standards

Code comments and git commit messages MUST be written in English. All user-facing application UI text MUST be displayed in Traditional Chinese (繁體中文). This separation ensures code maintainability for international developers while providing localized user experience.

### VI. State Management with Zustand

Game board state MUST be managed using Zustand. This lightweight state management solution provides simplicity and performance suitable for mobile game state requirements.

## Development Standards

### Code Quality

- TypeScript strict mode MUST be enabled
- All Game Core Logic functions MUST have corresponding unit tests
- Code reviews MUST verify architecture separation compliance
- UI components MUST NOT contain game rule logic

### Testing Requirements

- Game Core Logic: 100% unit test coverage required
- UI Components: Integration tests for user interactions
- Test files MUST be co-located with source files
- Tests MUST run before any commit (pre-commit hooks recommended)

### UI/UX Guidelines

- Board layout: 4x8 grid (responsive)
- Visual style: Minimalist with traditional Chinese elements
- Color scheme: Wooden textures or simple, muted colors
- Typography: Traditional Chinese fonts for UI text

## Governance

This constitution supersedes all other development practices and guidelines. Amendments require:
- Documentation of the proposed change
- Justification for the modification
- Impact assessment on existing code and tests
- Approval from Tech Lead

All pull requests and code reviews MUST verify compliance with these principles. Any violation MUST be addressed before merge. Complexity additions MUST be justified against simpler alternatives.

**Version**: 1.0.0 | **Ratified**: 2025-01-27 | **Last Amended**: 2025-01-27
