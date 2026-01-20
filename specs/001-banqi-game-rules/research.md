# Research: Classic Dark Chess (Banqi) Implementation

**Date**: 2025-01-27  
**Feature**: `specs/001-banqi-game-rules/spec.md`

## Technology Decisions

### Decision: React Native with Expo Managed Workflow

**Rationale**: 
- Constitution mandates React Native with Expo for cross-platform deployment
- Managed Workflow simplifies build and deployment process
- TypeScript strict mode ensures type safety across codebase
- No native code required for core gameplay features

**Alternatives considered**:
- React Native CLI: Rejected - requires more native configuration, violates Expo requirement
- Flutter: Rejected - violates constitution framework requirement
- Native iOS/Android: Rejected - violates cross-platform requirement

### Decision: Clean Architecture with Pure TypeScript Core

**Rationale**:
- Constitution requires complete separation of Game Core Logic from UI
- Pure TypeScript enables 100% unit test coverage without UI dependencies
- Core logic can be tested independently of React Native
- Enables potential reuse of game logic in other contexts (web, CLI, etc.)

**Alternatives considered**:
- Mixed logic in components: Rejected - violates architecture separation principle
- Game logic in Zustand store: Rejected - violates separation, makes testing harder

### Decision: Zustand for State Management

**Rationale**:
- Constitution mandates Zustand for game board state
- Lightweight and performant for mobile game requirements
- Simple API reduces complexity
- Good TypeScript support

**Alternatives considered**:
- Redux: Rejected - violates constitution requirement, more complex than needed
- Context API: Rejected - violates constitution requirement, less performant
- MobX: Rejected - violates constitution requirement

### Decision: Jest for Testing

**Rationale**:
- Constitution mandates Jest for unit tests
- Standard testing framework for React Native/TypeScript projects
- Excellent TypeScript support
- Supports 100% coverage requirement for core logic

**Alternatives considered**:
- Vitest: Rejected - violates constitution requirement
- Mocha: Rejected - violates constitution requirement

### Decision: 1D Array (size 32) for Board Representation

**Rationale**:
- Simpler index calculations (0-31 vs [row][col])
- More efficient memory usage
- Easier to shuffle and manipulate
- Conversion to 2D for display is straightforward (index = row * 8 + col)

**Alternatives considered**:
- 2D Array (4x8): Considered but 1D is simpler for core logic operations
- Object-based board: Rejected - less efficient, harder to validate

### Decision: Piece Object Structure

**Rationale**:
- `id`: Unique identifier for tracking pieces
- `type`: PieceType enum (King, Guard, Minister, Rook, Horse, Cannon, Pawn)
- `color`: 'red' | 'black' for side assignment
- `isRevealed`: boolean for face-down/face-up state
- `isDead`: boolean for captured pieces (allows tracking without removing from array)

**Alternatives considered**:
- Separate arrays for alive/dead pieces: Rejected - complicates state management
- Remove dead pieces from array: Rejected - makes board representation inconsistent

## Best Practices

### TypeScript Strict Mode
- Enable all strict flags in tsconfig.json
- Use explicit return types for public functions
- Avoid `any` type (use `unknown` if necessary)

### Testing Strategy
- Core logic: 100% unit test coverage (constitution requirement)
- UI components: Integration tests for user interactions
- Test files co-located with source files
- Use descriptive test names matching acceptance scenarios

### State Management Patterns
- Zustand store contains: board array, current turn, match status, captured pieces
- Core logic functions are pure (no side effects)
- UI components read from store and dispatch actions
- Actions call core logic functions and update store

### Board Representation Patterns
- Use 0-31 indices for 1D array
- Helper functions: `indexToRowCol(index)`, `rowColToIndex(row, col)`
- Validation functions check bounds: `isValidIndex(index)`, `isAdjacent(index1, index2)`

## Integration Patterns

### Core Logic → UI Flow
1. User taps cell → UI component dispatches action
2. Action calls core logic validation function
3. If valid, core logic returns new board state
4. Store updates with new state
5. UI re-renders from store

### Error Handling
- Core logic throws errors for illegal moves
- UI catches errors and displays user-friendly messages (Traditional Chinese)
- No state changes on error (constitution requirement)

## Performance Considerations

- Board state updates should be < 50ms for smooth UI
- Move validation should be < 10ms
- Use React.memo for PieceComponent to prevent unnecessary re-renders
- Zustand selectors for granular state subscriptions

## Clarifications Resolved

All technical decisions align with constitution requirements. No NEEDS CLARIFICATION markers remain.
