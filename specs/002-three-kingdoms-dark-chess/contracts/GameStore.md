# Contract: GameStore (Multi-Mode Support)

**Type**: State Management (Zustand Store)  
**Package**: `src/store/gameStore.ts`  
**Purpose**: Manage game state for Classic and Three Kingdoms modes

---

## Store Interface

```typescript
import { Match, GameMode } from '../core/types';
import { GAME_MODES } from '../core/GameModes';

export interface GameStore {
  // Mode management (NEW)
  currentMode: GameMode;
  setMode: (mode: GameMode) => void;
  loadPersistedMode: () => Promise<void>;
  
  // Match state (existing, unchanged)
  match: Match | null;
  error: string | null;
  
  // Actions (existing, no API changes)
  newMatch: () => void;
  flipPiece: (index: number) => void;
  movePiece: (fromIndex: number, toIndex: number) => void;
  capturePiece: (fromIndex: number, toIndex: number) => void;
  clearError: () => void;
}
```

---

## State Fields

### currentMode (NEW)

**Type**: `GameMode`

**Purpose**: Currently selected game mode (Classic or Three Kingdoms)

**Initial Value**: `GAME_MODES.classic`

**Persistence**: Persisted to AsyncStorage on change

**Usage**:
```typescript
const { currentMode } = useGameStore();
console.log(currentMode.name); // "經典暗棋" or "三國暗棋"
```

---

### match (existing)

**Type**: `Match | null`

**Purpose**: Current match state (null if no active match)

**Initial Value**: `null`

**Changes**: Match structure extended to support multi-mode (see data-model.md)

---

### error (existing)

**Type**: `string | null`

**Purpose**: Error message from last action (null if no error)

**Initial Value**: `null`

**Usage**: Display in Toast notification

---

## Actions

### setMode (NEW)

```typescript
/**
 * Set current game mode and persist to AsyncStorage
 * 
 * @param mode - Game mode to set (GAME_MODES.classic or GAME_MODES.threeKingdoms)
 * 
 * @example
 * const { setMode } = useGameStore();
 * setMode(GAME_MODES.threeKingdoms);
 * // Mode switched, persisted to storage
 */
setMode: (mode: GameMode) => void;
```

**Implementation**:
```typescript
setMode: async (mode) => {
  set({ currentMode: mode });
  await AsyncStorage.setItem('@dark-chess:current-mode', mode.id);
}
```

**Side Effects**:
- Updates `currentMode` state
- Persists mode ID to AsyncStorage
- Does NOT affect current match (user must start new match)

---

### loadPersistedMode (NEW)

```typescript
/**
 * Load persisted game mode from AsyncStorage on app start
 * 
 * @returns Promise that resolves when mode is loaded
 * 
 * @example
 * // In App.tsx useEffect
 * useEffect(() => {
 *   useGameStore.getState().loadPersistedMode();
 * }, []);
 */
loadPersistedMode: () => Promise<void>;
```

**Implementation**:
```typescript
loadPersistedMode: async () => {
  const modeId = await AsyncStorage.getItem('@dark-chess:current-mode');
  if (modeId && GAME_MODES[modeId as keyof typeof GAME_MODES]) {
    set({ currentMode: GAME_MODES[modeId as keyof typeof GAME_MODES] });
  }
}
```

**Side Effects**:
- Reads from AsyncStorage
- Updates `currentMode` if valid mode ID found
- Falls back to Classic mode if invalid or not found

---

### newMatch (MODIFIED)

```typescript
/**
 * Start a new match using current game mode
 * 
 * Creates new match with pieces shuffled, status 'waiting-first-flip'.
 * Uses currentMode to determine board size, factions, and rules.
 * 
 * @example
 * const { newMatch, currentMode } = useGameStore();
 * newMatch();
 * // If currentMode is Classic: 32-element board, 2 factions
 * // If currentMode is Three Kingdoms: 45-element board, 3 factions
 */
newMatch: () => void;
```

**Implementation**:
```typescript
newMatch: () => {
  const mode = get().currentMode;
  const match = BoardGenerator.createInitialMatch(mode);
  set({ match, error: null });
}
```

**Changes from Classic-only version**:
- Now uses `currentMode` to determine match setup
- No API changes (same signature, same behavior for Classic mode)
- Supports both 32-element (Classic) and 45-element (Three Kingdoms) boards

**Side Effects**:
- Creates new Match object
- Clears error state
- Match status set to 'waiting-first-flip'

---

### flipPiece (existing, no changes)

```typescript
/**
 * Flip a face-down piece to reveal it
 * 
 * @param index - Board index of piece to flip
 * 
 * @example
 * const { flipPiece } = useGameStore();
 * flipPiece(12);
 * // Piece at index 12 is revealed
 */
flipPiece: (index: number) => void;
```

**Implementation** (unchanged):
```typescript
flipPiece: (index) => {
  const match = get().match;
  if (!match) {
    set({ error: 'No active match' });
    return;
  }
  
  const ruleSet = match.mode.ruleSet; // ✅ Mode-aware
  const validation = validateFlip(match, index);
  
  if (!validation.isValid) {
    set({ error: validation.error || 'Invalid flip' });
    return;
  }
  
  const newMatch = executeFlip(match, index);
  set({ match: newMatch, error: null });
}
```

**Works with both modes**: Uses `match.mode.ruleSet` for validation

---

### movePiece (existing, no changes)

```typescript
/**
 * Move a piece to an adjacent empty position
 * 
 * @param fromIndex - Source position index
 * @param toIndex - Destination position index (must be empty)
 * 
 * @example
 * const { movePiece } = useGameStore();
 * movePiece(10, 11);
 * // Piece moves from index 10 to index 11
 */
movePiece: (fromIndex: number, toIndex: number) => void;
```

**Implementation** (unchanged):
```typescript
movePiece: (fromIndex, toIndex) => {
  const match = get().match;
  if (!match) {
    set({ error: 'No active match' });
    return;
  }
  
  const ruleSet = match.mode.ruleSet; // ✅ Mode-aware
  const validation = ruleSet.validateMove(match, fromIndex, toIndex);
  
  if (!validation.isValid) {
    set({ error: validation.error || 'Invalid move' });
    return;
  }
  
  let newMatch = executeMove(match, fromIndex, toIndex);
  
  // Three Kingdoms: Decrement draw counter
  if (newMatch.movesWithoutCapture !== null) {
    newMatch = {
      ...newMatch,
      movesWithoutCapture: newMatch.movesWithoutCapture - 1,
    };
    
    // Check draw condition
    if (ruleSet.checkDrawCondition(newMatch)) {
      newMatch = { ...newMatch, status: 'ended', winner: null };
    }
  }
  
  set({ match: newMatch, error: null });
}
```

**Works with both modes**: 
- Uses `match.mode.ruleSet` for validation
- Handles draw counter for Three Kingdoms (null for Classic)

---

### capturePiece (existing, no changes)

```typescript
/**
 * Capture an opponent piece
 * 
 * @param fromIndex - Attacker position index
 * @param toIndex - Target position index (must contain opponent piece)
 * 
 * @example
 * const { capturePiece } = useGameStore();
 * capturePiece(5, 6);
 * // Piece at index 5 captures piece at index 6
 */
capturePiece: (fromIndex: number, toIndex: number) => void;
```

**Implementation** (unchanged):
```typescript
capturePiece: (fromIndex, toIndex) => {
  const match = get().match;
  if (!match) {
    set({ error: 'No active match' });
    return;
  }
  
  const ruleSet = match.mode.ruleSet; // ✅ Mode-aware
  const validation = ruleSet.validateCapture(match, fromIndex, toIndex);
  
  if (!validation.isValid) {
    set({ error: validation.error || 'Invalid capture' });
    return;
  }
  
  let newMatch = executeCapture(match, fromIndex, toIndex);
  
  // Three Kingdoms: Reset draw counter
  if (newMatch.movesWithoutCapture !== null && newMatch.status !== 'ended') {
    newMatch = { ...newMatch, movesWithoutCapture: 60 };
  }
  
  set({ match: newMatch, error: null });
}
```

**Works with both modes**: 
- Uses `match.mode.ruleSet` for validation
- Resets draw counter to 60 for Three Kingdoms (null for Classic)
- Checks win condition after capture (mode-specific)

---

### clearError (existing, no changes)

```typescript
/**
 * Clear error message (typically called by Toast after auto-dismiss)
 * 
 * @example
 * const { clearError } = useGameStore();
 * clearError();
 * // error state set to null
 */
clearError: () => void;
```

**Implementation** (unchanged):
```typescript
clearError: () => {
  set({ error: null });
}
```

---

## Usage Examples

### Mode Selection Screen

```typescript
import { useGameStore } from './store/gameStore';
import { GAME_MODES } from './core/GameModes';

function ModeSelector() {
  const { currentMode, setMode, newMatch } = useGameStore();
  
  return (
    <View>
      <Text>選擇遊戲模式</Text>
      
      <TouchableOpacity onPress={() => {
        setMode(GAME_MODES.classic);
        newMatch();
      }}>
        <Text>經典暗棋 (Classic)</Text>
        {currentMode.id === 'classic' && <Text>✓ 已選擇</Text>}
      </TouchableOpacity>
      
      <TouchableOpacity onPress={() => {
        setMode(GAME_MODES.threeKingdoms);
        newMatch();
      }}>
        <Text>三國暗棋 (Three Kingdoms)</Text>
        {currentMode.id === 'three-kingdoms' && <Text>✓ 已選擇</Text>}
      </TouchableOpacity>
    </View>
  );
}
```

### Game Screen (works with both modes)

```typescript
import { useGameStore } from './store/gameStore';

function GameScreen() {
  const { match, currentMode, flipPiece, movePiece, capturePiece, error, clearError } = useGameStore();
  
  if (!match) {
    return <Text>No active match</Text>;
  }
  
  const handleCellPress = (index: number) => {
    const piece = match.board[index];
    
    if (selectedIndex === null) {
      // First tap: select piece
      if (piece && !piece.isRevealed) {
        flipPiece(index);
      } else if (piece && piece.isRevealed) {
        setSelectedIndex(index);
      }
    } else {
      // Second tap: move or capture
      if (match.board[index] === null) {
        movePiece(selectedIndex, index);
      } else {
        capturePiece(selectedIndex, index);
      }
      setSelectedIndex(null);
    }
  };
  
  return (
    <View>
      <Text>模式: {currentMode.name}</Text>
      <Text>Turn: {match.activeFactions[match.currentFactionIndex]}</Text>
      {match.movesWithoutCapture !== null && (
        <Text>Moves Until Draw: {match.movesWithoutCapture}</Text>
      )}
      
      <BoardView board={match.board} onCellPress={handleCellPress} />
      
      {error && <Toast message={error} onDismiss={clearError} />}
    </View>
  );
}
```

### App Initialization

```typescript
import { useGameStore } from './store/gameStore';

function App() {
  const { loadPersistedMode } = useGameStore();
  
  useEffect(() => {
    // Load persisted mode on app start
    loadPersistedMode();
  }, []);
  
  return <NavigationContainer>{/* ... */}</NavigationContainer>;
}
```

---

## Migration from Classic-only Store

### Before (Classic-only)

```typescript
export interface GameStore {
  match: Match | null;
  error: string | null;
  
  newMatch: () => void;
  flipPiece: (index: number) => void;
  movePiece: (fromIndex: number, toIndex: number) => void;
  capturePiece: (fromIndex: number, toIndex: number) => void;
  clearError: () => void;
}

const useGameStore = create<GameStore>((set, get) => ({
  match: null,
  error: null,
  
  newMatch: () => {
    const match = BoardGenerator.createInitialMatch(); // ❌ Hardcoded Classic
    set({ match, error: null });
  },
  // ... other actions
}));
```

### After (Multi-mode)

```typescript
export interface GameStore {
  currentMode: GameMode; // ✅ NEW
  setMode: (mode: GameMode) => void; // ✅ NEW
  loadPersistedMode: () => Promise<void>; // ✅ NEW
  
  match: Match | null;
  error: string | null;
  
  newMatch: () => void;
  flipPiece: (index: number) => void;
  movePiece: (fromIndex: number, toIndex: number) => void;
  capturePiece: (fromIndex: number, toIndex: number) => void;
  clearError: () => void;
}

const useGameStore = create<GameStore>((set, get) => ({
  currentMode: GAME_MODES.classic, // ✅ Default to Classic
  
  setMode: async (mode) => { // ✅ NEW
    set({ currentMode: mode });
    await AsyncStorage.setItem('@dark-chess:current-mode', mode.id);
  },
  
  loadPersistedMode: async () => { // ✅ NEW
    const modeId = await AsyncStorage.getItem('@dark-chess:current-mode');
    if (modeId && GAME_MODES[modeId as keyof typeof GAME_MODES]) {
      set({ currentMode: GAME_MODES[modeId as keyof typeof GAME_MODES] });
    }
  },
  
  match: null,
  error: null,
  
  newMatch: () => {
    const mode = get().currentMode; // ✅ Use current mode
    const match = BoardGenerator.createInitialMatch(mode);
    set({ match, error: null });
  },
  // ... other actions (no changes to API)
}));
```

---

## Testing Requirements

### Unit Tests

```typescript
describe('GameStore', () => {
  beforeEach(() => {
    // Reset store before each test
    useGameStore.setState({ match: null, error: null, currentMode: GAME_MODES.classic });
  });
  
  describe('setMode', () => {
    it('should update currentMode state', () => {
      const { setMode } = useGameStore.getState();
      setMode(GAME_MODES.threeKingdoms);
      
      expect(useGameStore.getState().currentMode.id).toBe('three-kingdoms');
    });
    
    it('should persist mode to AsyncStorage', async () => {
      const { setMode } = useGameStore.getState();
      await setMode(GAME_MODES.threeKingdoms);
      
      const persisted = await AsyncStorage.getItem('@dark-chess:current-mode');
      expect(persisted).toBe('three-kingdoms');
    });
  });
  
  describe('newMatch', () => {
    it('should create Classic match when currentMode is Classic', () => {
      const { setMode, newMatch } = useGameStore.getState();
      setMode(GAME_MODES.classic);
      newMatch();
      
      const { match } = useGameStore.getState();
      expect(match?.mode.id).toBe('classic');
      expect(match?.board).toHaveLength(32);
      expect(match?.factions).toHaveLength(2);
    });
    
    it('should create Three Kingdoms match when currentMode is Three Kingdoms', () => {
      const { setMode, newMatch } = useGameStore.getState();
      setMode(GAME_MODES.threeKingdoms);
      newMatch();
      
      const { match } = useGameStore.getState();
      expect(match?.mode.id).toBe('three-kingdoms');
      expect(match?.board).toHaveLength(45);
      expect(match?.factions).toHaveLength(3);
      expect(match?.movesWithoutCapture).toBe(60);
    });
  });
  
  describe('flipPiece', () => {
    it('should work with Classic mode', () => {
      const { newMatch, flipPiece } = useGameStore.getState();
      newMatch(); // Classic mode by default
      
      flipPiece(0);
      
      const { match } = useGameStore.getState();
      expect(match?.board[0]?.isRevealed).toBe(true);
      expect(match?.status).toBe('in-progress');
    });
    
    it('should work with Three Kingdoms mode', () => {
      const { setMode, newMatch, flipPiece } = useGameStore.getState();
      setMode(GAME_MODES.threeKingdoms);
      newMatch();
      
      flipPiece(0);
      
      const { match } = useGameStore.getState();
      expect(match?.board[0]?.isRevealed).toBe(true);
      expect(match?.movesWithoutCapture).toBe(59); // Decremented
    });
  });
  
  describe('movePiece', () => {
    it('should decrement draw counter in Three Kingdoms mode', () => {
      const { setMode, newMatch, flipPiece, movePiece } = useGameStore.getState();
      setMode(GAME_MODES.threeKingdoms);
      newMatch();
      
      // Setup: flip and move a piece
      flipPiece(0); // movesWithoutCapture = 59
      movePiece(0, 5); // movesWithoutCapture = 58
      
      const { match } = useGameStore.getState();
      expect(match?.movesWithoutCapture).toBe(58);
    });
    
    it('should not affect draw counter in Classic mode', () => {
      const { newMatch, flipPiece, movePiece } = useGameStore.getState();
      newMatch(); // Classic mode
      
      flipPiece(0);
      movePiece(0, 4);
      
      const { match } = useGameStore.getState();
      expect(match?.movesWithoutCapture).toBeNull();
    });
  });
  
  describe('capturePiece', () => {
    it('should reset draw counter to 60 in Three Kingdoms mode', () => {
      const { setMode, newMatch, flipPiece, capturePiece } = useGameStore.getState();
      setMode(GAME_MODES.threeKingdoms);
      newMatch();
      
      // Setup: create scenario with capture
      // ... (flip pieces, position for capture)
      
      capturePiece(5, 10);
      
      const { match } = useGameStore.getState();
      expect(match?.movesWithoutCapture).toBe(60); // Reset!
    });
  });
});
```

---

## Performance Requirements

- `setMode`: < 10ms per call (plus AsyncStorage write)
- `loadPersistedMode`: < 50ms per call (AsyncStorage read)
- `newMatch`: < 100ms per call (includes board generation)
- Other actions: Same as Classic-only version

---

**Contract Version**: 1.0.0  
**Created**: 2026-01-22  
**Status**: ✅ Complete and ready for implementation
