# Technical Research: Three Kingdoms Dark Chess

**Feature**: `002-three-kingdoms-dark-chess`  
**Date**: 2026-01-22  
**Status**: Complete

## Research Overview

This document consolidates all technical research decisions for implementing the Three Kingdoms Dark Chess variant. The primary challenge is refactoring the existing Classic Dark Chess codebase (001) to support multiple game modes while maintaining Clean Architecture principles and 100% test coverage.

---

## Research Questions & Decisions

### 1. Strategy Pattern for RuleSet Abstraction

**Question**: How to refactor GameEngine.ts to support multiple rule systems without code duplication?

**Decision**: Implement Strategy Pattern with `RuleSet` interface

**Rationale**:
- Strategy Pattern allows pluggable rule implementations without modifying existing code (Open/Closed Principle)
- Enables isolated testing of each rule variant (Classic vs Three Kingdoms)
- Supports future expansion (Army Chess, custom variants) with minimal changes
- Aligns with Clean Architecture principles (dependency inversion)

**Implementation Approach**:
```typescript
// src/core/RuleSet.ts
export interface RuleSet {
  validateMove(match: Match, fromIndex: number, toIndex: number): ValidationResult;
  validateCapture(match: Match, fromIndex: number, toIndex: number): ValidationResult;
  checkWinCondition(match: Match): WinResult;
  checkDrawCondition(match: Match): boolean;
  getLegalMoves(match: Match): LegalMoveSet;
  getAdjacentIndices(index: number, boardSize: number): number[];
  canPieceCapture(attacker: Piece, target: Piece): boolean;
}

// src/core/rules/ClassicRules.ts
export class ClassicRules implements RuleSet {
  // Extract existing GameEngine logic
  // Board: 32 cells, 2 players, rank hierarchy
}

// src/core/rules/ThreeKingdomsRules.ts
export class ThreeKingdomsRules implements RuleSet {
  // New logic for 45 intersections, 3 players, no rank hierarchy
}
```

**Alternatives Considered**:
- **Option A**: Conditional logic in GameEngine (if mode === 'classic' else...) - Rejected due to code duplication and maintenance burden
- **Option B**: Inheritance (BaseRules → ClassicRules/ThreeKingdomsRules) - Rejected due to inflexibility and tight coupling
- **Option C**: Strategy Pattern - **SELECTED** for flexibility and testability

---

### 2. Board Topology: Cells vs Intersections

**Question**: How to represent both Classic (32 cells) and Three Kingdoms (45 intersections) boards?

**Decision**: Use dynamically-sized `Board` type with mode-aware rendering

**Rationale**:
- Classic: `Board = Array<Piece | null>` (length 32)
- Three Kingdoms: `Board = Array<Piece | null>` (length 45)
- GameMode.boardSize property determines array length
- UI layer adapts based on mode (ClassicBoardRenderer vs IntersectionBoardRenderer)

**Data Structure**:
```typescript
export type Board = Array<Piece | null>; // Dynamic size based on GameMode

export interface GameMode {
  id: string;
  boardSize: number; // 32 for Classic, 45 for Three Kingdoms
  gridDimensions: { rows: number; cols: number }; // 8x4 for Classic, 5x9 for TK
  ruleSet: RuleSet;
}
```

**Coordinate Systems**:
- **Classic**: 1D array (8 rows × 4 cols = 32 indices)
  - Index = row * 4 + col
  - Row = Math.floor(index / 4)
  - Col = index % 4

- **Three Kingdoms**: 1D array (9 rows × 5 cols = 45 indices)
  - Index = row * 5 + col
  - Row = Math.floor(index / 5)
  - Col = index % 5

**Adjacency Logic**:
- Classic: Up/Down/Left/Right (grid cells)
- Three Kingdoms: Up/Down/Left/Right along grid lines (intersections)

**Alternatives Considered**:
- **Option A**: Separate Board types (ClassicBoard vs ThreeKingdomsBoard) - Rejected due to code duplication in GameEngine
- **Option B**: Unified Board with dynamic size - **SELECTED** for simplicity and flexibility
- **Option C**: Graph-based representation (nodes + edges) - Rejected as over-engineering for MVP

---

### 3. Faction System: Color vs Faction

**Question**: How to extend Piece.color (red/black) to support 3 teams (green/red/black)?

**Decision**: Replace `color: 'red' | 'black'` with `factionId: string`

**Rationale**:
- Classic mode: 2 factions ("red", "black")
- Three Kingdoms mode: 3 factions ("team-a", "team-b", "team-c")
- Faction entity stores color for UI rendering (green/red/black)
- Decouples game logic from UI presentation

**Data Model Migration**:
```typescript
// OLD (Classic only)
export interface Piece {
  id: string;
  type: PieceType;
  color: 'red' | 'black'; // ❌ Limited to 2 players
  isRevealed: boolean;
  isDead: boolean;
}

// NEW (Supports 2-N players)
export interface Piece {
  id: string;
  type: PieceType;
  factionId: string; // ✅ References Faction entity
  isRevealed: boolean;
  isDead: boolean;
}

export interface Faction {
  id: string; // "red", "black", "team-a", "team-b", "team-c"
  displayName: string; // "紅方", "黑方", "將軍軍", "紅方輔臣", "黑方輔臣"
  color: 'red' | 'black' | 'green'; // UI color
  pieceCount: number; // 16 for Classic, 12/10/10 for Three Kingdoms
  isEliminated: boolean; // For turn rotation
}
```

**Backward Compatibility**:
- ClassicRules maps factionId "red" → Faction { color: 'red' }
- ClassicRules maps factionId "black" → Faction { color: 'black' }
- No breaking changes to existing Classic gameplay

---

### 4. Turn Rotation with Elimination

**Question**: How to skip eliminated players in 3-player rotation?

**Decision**: Use `activeFactions: string[]` array in Match state

**Rationale**:
- `activeFactions` initially contains all faction IDs: ["team-a", "team-b", "team-c"]
- When a faction is eliminated, remove from `activeFactions`
- `currentFactionIndex` cycles through `activeFactions` (not all factions)
- When only 1 faction remains, game ends with elimination victory

**Implementation**:
```typescript
export interface Match {
  // ... other fields
  factions: Faction[]; // All factions (length 2 or 3)
  activeFactions: string[]; // Non-eliminated faction IDs
  currentFactionIndex: number; // Index into activeFactions array
}

// Turn rotation logic
function nextTurn(match: Match): Match {
  const nextIndex = (match.currentFactionIndex + 1) % match.activeFactions.length;
  return {
    ...match,
    currentFactionIndex: nextIndex,
  };
}

// Elimination logic
function eliminateFaction(match: Match, factionId: string): Match {
  const activeFactions = match.activeFactions.filter(id => id !== factionId);
  return {
    ...match,
    activeFactions,
    // If only 1 faction remains, game ends
    status: activeFactions.length === 1 ? 'ended' : 'in-progress',
    winner: activeFactions.length === 1 ? activeFactions[0] : null,
  };
}
```

**Alternatives Considered**:
- **Option A**: Separate eliminated flags (Faction.isEliminated) with skip logic - Rejected for complexity
- **Option B**: `activeFactions` array - **SELECTED** for simplicity and clarity

---

### 5. Draw Counter Management

**Question**: How to implement the 60-move draw rule for Three Kingdoms?

**Decision**: Add `movesWithoutCapture: number` field to Match entity

**Rationale**:
- Counter starts at 60 at game start
- Decrements by 1 after each non-capture move (flip, move)
- Resets to 60 immediately when ANY capture occurs
- Game ends in draw when counter reaches 0
- Classic mode ignores this field (always null)

**Implementation**:
```typescript
export interface Match {
  // ... other fields
  movesWithoutCapture: number | null; // null for Classic, 60 for Three Kingdoms
}

// In ThreeKingdomsRules
function checkDrawCondition(match: Match): boolean {
  return match.movesWithoutCapture !== null && match.movesWithoutCapture <= 0;
}

function executeMove(match: Match, fromIndex: number, toIndex: number): Match {
  const newMovesWithoutCapture = match.movesWithoutCapture !== null
    ? match.movesWithoutCapture - 1
    : null;
  
  return {
    ...match,
    movesWithoutCapture: newMovesWithoutCapture,
    // ... other updates
  };
}

function executeCapture(match: Match, fromIndex: number, toIndex: number): Match {
  return {
    ...match,
    movesWithoutCapture: 60, // Reset to 60 on capture
    // ... other updates
  };
}
```

**Alternatives Considered**:
- **Option A**: Separate MoveHistory array - Rejected as over-engineering
- **Option B**: Simple counter field - **SELECTED** for simplicity

---

### 6. UI Board Rendering Strategy

**Question**: How to render both cell-based (Classic) and intersection-based (Three Kingdoms) boards?

**Decision**: Create two separate board renderers with shared GridCell abstraction

**Rationale**:
- Classic: Pieces occupy grid cells (8 rows × 4 cols)
- Three Kingdoms: Pieces occupy intersections (9 rows × 5 cols of points)
- Separate renderers avoid complex conditional logic in single component
- Shared `GridCell` component for tap handling and piece display

**Component Structure**:
```text
<BoardView>
  ├─ mode === 'classic' → <ClassicBoardRenderer>
  │   └─ Renders 8×4 grid of cells
  │       └─ Each cell contains <GridCell>
  │
  └─ mode === 'three-kingdoms' → <IntersectionBoardRenderer>
      └─ Renders 9×5 grid of intersection points
          └─ Each intersection contains <GridCell>
```

**Visual Representation**:
```typescript
// ClassicBoardRenderer.tsx
export function ClassicBoardRenderer({ board, onCellPress }: Props) {
  return (
    <View style={styles.boardContainer}>
      {Array.from({ length: 8 }).map((_, row) => (
        <View key={row} style={styles.row}>
          {Array.from({ length: 4 }).map((_, col) => {
            const index = row * 4 + col;
            const piece = board[index];
            return (
              <GridCell
                key={index}
                index={index}
                piece={piece}
                onPress={() => onCellPress(index)}
                style={styles.cell} // Rectangular cell
              />
            );
          })}
        </View>
      ))}
    </View>
  );
}

// IntersectionBoardRenderer.tsx
export function IntersectionBoardRenderer({ board, onCellPress }: Props) {
  return (
    <View style={styles.boardContainer}>
      {/* Render grid lines first */}
      <GridLines />
      
      {/* Render intersection points */}
      {Array.from({ length: 9 }).map((_, row) => (
        <View key={row} style={styles.row}>
          {Array.from({ length: 5 }).map((_, col) => {
            const index = row * 5 + col;
            const piece = board[index];
            return (
              <GridCell
                key={index}
                index={index}
                piece={piece}
                onPress={() => onCellPress(index)}
                style={styles.intersection} // Circular intersection point
                showEmptyMarker={piece === null} // Show dot for empty intersections
              />
            );
          })}
        </View>
      ))}
    </View>
  );
}
```

**Alternatives Considered**:
- **Option A**: Single BoardView with conditional rendering - Rejected due to complexity
- **Option B**: Separate board renderers - **SELECTED** for clarity and maintainability
- **Option C**: Canvas-based rendering - Rejected as over-engineering for MVP

---

### 7. State Migration Strategy

**Question**: How to migrate existing Zustand store from Classic-only to multi-mode?

**Decision**: Extend store with mode field and add mode-specific actions

**Rationale**:
- Add `currentMode: GameMode` field to store
- Add `setMode(mode: GameMode)` action for mode selection
- Existing actions (flipPiece, movePiece, capturePiece) remain unchanged
- `newMatch()` action uses `currentMode` to initialize correct board size and rule set

**Store Structure**:
```typescript
export interface GameStore {
  // Mode management
  currentMode: GameMode;
  setMode: (mode: GameMode) => void;
  
  // Match state (existing)
  match: Match | null;
  error: string | null;
  
  // Actions (existing - no changes)
  newMatch: () => void;
  flipPiece: (index: number) => void;
  movePiece: (fromIndex: number, toIndex: number) => void;
  capturePiece: (fromIndex: number, toIndex: number) => void;
  clearError: () => void;
}

// newMatch() implementation
function newMatch(mode: GameMode): Match {
  const ruleSet = mode.ruleSet; // ClassicRules or ThreeKingdomsRules
  const boardSize = mode.boardSize; // 32 or 45
  
  // Generate initial match using mode-specific logic
  return BoardGenerator.createInitialMatch(mode);
}
```

**Backward Compatibility**:
- Default mode is "classic" if not explicitly set
- Existing tests continue to work with Classic mode
- No breaking changes to existing game store API

---

### 8. Testing Strategy

**Question**: How to achieve 100% coverage for both Classic and Three Kingdoms rules?

**Decision**: Separate test suites for each RuleSet implementation

**Test Structure**:
```text
tests/
├── unit/
│   ├── core/
│   │   ├── rules/
│   │   │   ├── ClassicRules.test.ts      # Classic-specific logic
│   │   │   ├── ThreeKingdomsRules.test.ts # Three Kingdoms-specific logic
│   │   │   └── RuleSet.test.ts           # Interface contract tests
│   │   ├── BoardGenerator.test.ts         # Both modes
│   │   └── types.test.ts
│   └── store/
│       └── gameStore.test.ts              # Both modes
└── integration/
    ├── components/
    │   ├── ClassicBoardView.test.tsx
    │   └── ThreeKingdomsBoardView.test.tsx
    └── e2e/
        ├── ClassicGameFlow.test.tsx
        └── ThreeKingdomsGameFlow.test.tsx
```

**Coverage Requirements**:
- ClassicRules: 100% unit test coverage
- ThreeKingdomsRules: 100% unit test coverage
- Shared utilities (boardUtils): 100% coverage for both modes
- UI components: Integration tests for user flows

---

### 9. Persistence Strategy

**Question**: Should game mode selection persist across app restarts?

**Decision**: Yes, persist `currentMode` in AsyncStorage

**Rationale**:
- Users expect mode selection to persist (FR-003)
- AsyncStorage is lightweight and built into React Native
- Store only mode ID (e.g., "classic" or "three-kingdoms"), not entire GameMode object

**Implementation**:
```typescript
// src/store/gameStore.ts
const STORAGE_KEY = '@dark-chess:current-mode';

export const useGameStore = create<GameStore>((set, get) => ({
  currentMode: GAME_MODES.classic, // Default
  
  setMode: async (mode: GameMode) => {
    set({ currentMode: mode });
    await AsyncStorage.setItem(STORAGE_KEY, mode.id);
  },
  
  // Load persisted mode on app start
  loadPersistedMode: async () => {
    const modeId = await AsyncStorage.getItem(STORAGE_KEY);
    if (modeId) {
      const mode = GAME_MODES[modeId as keyof typeof GAME_MODES];
      if (mode) {
        set({ currentMode: mode });
      }
    }
  },
}));
```

**Alternatives Considered**:
- **Option A**: No persistence - Rejected due to poor UX
- **Option B**: AsyncStorage - **SELECTED** for simplicity
- **Option C**: SQLite - Rejected as over-engineering

---

### 10. GameMode Registry

**Question**: How to manage available game modes (Classic, Three Kingdoms, future modes)?

**Decision**: Create centralized `GameModes` registry with factory pattern

**Implementation**:
```typescript
// src/core/GameModes.ts
import { ClassicRules } from './rules/ClassicRules';
import { ThreeKingdomsRules } from './rules/ThreeKingdomsRules';

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
  // Future modes can be added here
} as const;

export type GameModeId = keyof typeof GAME_MODES;
export type GameMode = typeof GAME_MODES[GameModeId];
```

**Benefits**:
- Single source of truth for all game modes
- Easy to add new modes in future (Army Chess, etc.)
- Type-safe mode selection

---

## Summary of Technical Decisions

| Decision | Approach | Rationale |
|----------|----------|-----------|
| **Rule System** | Strategy Pattern (RuleSet interface) | Flexibility, testability, Open/Closed Principle |
| **Board Representation** | Dynamic-size `Board` array (32 or 45) | Simplicity, unified type system |
| **Faction System** | Replace `color` with `factionId` + Faction entity | Supports 2-N players, decouples logic from UI |
| **Turn Rotation** | `activeFactions` array with elimination removal | Clear logic, easy to test |
| **Draw Counter** | `movesWithoutCapture: number \| null` field | Simple, mode-aware |
| **UI Rendering** | Separate ClassicBoardRenderer + IntersectionBoardRenderer | Clarity, avoids complex conditionals |
| **State Management** | Extend Zustand store with `currentMode` | Backward compatible, no breaking changes |
| **Testing** | Separate test suites per RuleSet | 100% coverage per mode |
| **Persistence** | AsyncStorage for mode selection | Lightweight, built-in |
| **Mode Registry** | Centralized `GAME_MODES` object | Single source of truth, extensible |

---

## Open Technical Questions

### Resolved ✅

1. ✅ Board topology (cells vs intersections) - Use dynamic-size Board array
2. ✅ Faction system (2 vs 3 players) - Use factionId + Faction entity
3. ✅ Turn rotation with elimination - Use activeFactions array
4. ✅ Draw counter implementation - Use movesWithoutCapture field
5. ✅ UI rendering strategy - Separate board renderers

### Deferred to v1.2

1. ⏸️ Alliance system (team alliances in Three Kingdoms) - Out of scope for MVP
2. ⏸️ Recover Army rule (capturing and recovering Generals) - Out of scope for MVP

---

## Next Steps

1. ✅ Research complete (this document)
2. 🔜 Generate `data-model.md` (Phase 1)
3. 🔜 Generate `contracts/` (Phase 1)
4. 🔜 Generate `quickstart.md` (Phase 1)
5. 🔜 Update agent context with new tech stack
6. 🔜 Generate `tasks.md` with `/speckit.tasks` command

---

**Research Date**: 2026-01-22  
**Researcher**: AI Assistant  
**Status**: ✅ Complete and ready for Phase 1 (Design)
