# Quickstart Guide: Classic Dark Chess (Banqi)

**Date**: 2025-01-27  
**Feature**: `specs/001-banqi-game-rules/spec.md`

## Overview

This guide provides a quick reference for implementing and testing the Banqi game engine. It covers the essential steps to get a working game implementation.

## Prerequisites

- Node.js 18+ and npm/yarn
- Expo CLI installed globally: `npm install -g expo-cli`
- TypeScript knowledge
- Jest testing framework

## Project Setup

1. **Initialize Expo project**:
   ```bash
   npx create-expo-app dark-chess-app --template blank-typescript
   cd dark-chess-app
   ```

2. **Install dependencies**:
   ```bash
   npm install zustand
   npm install --save-dev jest @types/jest ts-jest
   ```

3. **Configure TypeScript** (tsconfig.json):
   ```json
   {
     "compilerOptions": {
       "strict": true,
       "target": "ES2020",
       "module": "commonjs",
       "jsx": "react-native"
     }
   }
   ```

4. **Configure Jest** (jest.config.js):
   ```javascript
   module.exports = {
     preset: 'ts-jest',
     testEnvironment: 'node',
     collectCoverageFrom: ['src/core/**/*.ts'],
     coverageThreshold: {
       global: {
         statements: 100,
         branches: 100,
         functions: 100,
         lines: 100
       }
     }
   };
   ```

## Implementation Order

### Phase 1: Core Logic (Pure TypeScript)

1. **Create types** (`src/core/types.ts`):
   - Define `PieceType`, `Piece`, `Board`, `Match` types
   - Define action types (`FlipAction`, `MoveAction`, `CaptureAction`)

2. **Implement rules** (`src/core/rules.ts`):
   - Define piece ranks (King=7, Guard=6, ..., Pawn=1)
   - Implement rank comparison functions
   - Implement King vs Pawn special rule
   - Implement Cannon screen detection logic

3. **Implement BoardGenerator** (`src/core/BoardGenerator.ts`):
   - Create 32 pieces (16 red, 16 black)
   - Shuffle pieces randomly
   - Place pieces face-down on board
   - Write unit tests (100% coverage)

4. **Implement GameEngine** (`src/core/GameEngine.ts`):
   - `validateFlip()` - Test all edge cases
   - `validateMove()` - Test adjacency, turn validation
   - `validateCapture()` - Test rank hierarchy, King/Pawn, Cannon rules
   - `executeFlip()` - Test side assignment, state transitions
   - `executeMove()` - Test board updates, turn switching
   - `executeCapture()` - Test capture logic, win detection
   - `checkWinCondition()` - Test capture-all and stalemate
   - `getLegalMoves()` - Test complete move generation
   - Write unit tests (100% coverage required)

### Phase 2: State Management

1. **Create Zustand store** (`src/store/gameStore.ts`):
   - Define store interface with Match state
   - Implement actions: `flipPiece()`, `movePiece()`, `capturePiece()`
   - Actions call GameEngine functions and update store
   - Write unit tests for store actions

### Phase 3: UI Components

1. **Create PieceComponent** (`src/components/PieceComponent.tsx`):
   - Display Chinese character for piece type
   - Style face-down vs face-up states
   - Handle tap events (dispatch to store)

2. **Create GridCell** (`src/components/GridCell.tsx`):
   - Render cell with PieceComponent or empty state
   - Handle tap events
   - Visual feedback for selected/valid moves

3. **Create BoardView** (`src/components/BoardView.tsx`):
   - Render 4x8 grid using GridCell components
   - Read board state from Zustand store
   - Handle user interactions (flip/move/capture)

4. **Create GameInfo** (`src/components/GameInfo.tsx`):
   - Display current turn
   - Display captured pieces count
   - Display match status and winner

### Phase 4: Integration

1. **Create main App component**:
   - Initialize new match on mount
   - Render BoardView and GameInfo
   - Handle game end state

2. **Write integration tests**:
   - Test complete user flows (flip → move → capture → win)
   - Test error handling (illegal moves rejected)
   - Test UI updates on state changes

## Testing Strategy

### Unit Tests (Core Logic)

```typescript
// Example: GameEngine.test.ts
describe('GameEngine', () => {
  describe('validateFlip', () => {
    it('should allow flip when match is waiting-first-flip', () => {
      // Test implementation
    });
    
    it('should reject flip when piece already revealed', () => {
      // Test implementation
    });
    
    // ... 100% coverage required
  });
  
  describe('validateCapture', () => {
    it('should allow Rook to capture Horse (rank 4 > rank 3)', () => {
      // Test implementation
    });
    
    it('should reject King capturing Pawn', () => {
      // Test implementation
    });
    
    it('should allow Pawn capturing King', () => {
      // Test implementation
    });
    
    it('should allow Cannon jumping over one screen', () => {
      // Test implementation
    });
    
    it('should reject Cannon with zero screens', () => {
      // Test implementation
    });
    
    // ... all edge cases from spec
  });
});
```

### Integration Tests (UI)

```typescript
// Example: BoardView.test.tsx
describe('BoardView Integration', () => {
  it('should flip piece on tap', () => {
    // Render component, simulate tap, verify state update
  });
  
  it('should reject illegal move and show error', () => {
    // Test error handling
  });
});
```

## Validation Checklist

Before considering implementation complete:

- [ ] All core logic functions have 100% unit test coverage
- [ ] All acceptance scenarios from spec.md pass
- [ ] All edge cases from spec.md are tested
- [ ] UI displays Traditional Chinese text correctly
- [ ] Board is responsive 4x8 grid
- [ ] Move validation < 10ms
- [ ] Board updates < 50ms
- [ ] No React dependencies in src/core/
- [ ] TypeScript strict mode enabled
- [ ] All linter errors resolved

## Common Pitfalls

1. **Mixing UI and logic**: Keep `src/core/` completely free of React imports
2. **Incomplete Cannon rule**: Remember Cannon must jump over exactly one piece
3. **King vs Pawn**: King cannot capture Pawn, but Pawn can capture King
4. **Stalemate detection**: Check for no legal moves, not just no pieces
5. **State immutability**: Always return new Match objects, never mutate existing state

## Next Steps

After completing this implementation:
1. Run `/speckit.tasks` to break down into detailed tasks
2. Implement tasks in priority order (P1 → P2 → P3)
3. Run tests continuously during development
4. Validate against spec.md acceptance scenarios
