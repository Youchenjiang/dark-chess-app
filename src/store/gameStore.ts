/**
 * Zustand store for game state management (Multi-mode support)
 */

import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Match, GameMode } from '../core/types';
import { createInitialMatch } from '../core/BoardGenerator';
import { GAME_MODES } from '../core/GameModes';
import {
  validateFlip,
  executeFlip,
  validateMove,
  executeMove,
  validateCapture,
  executeCapture,
  checkWinCondition,
} from '../core/GameEngine';

interface GameState {
  // Mode management (NEW)
  currentMode: GameMode;
  setMode: (mode: GameMode) => Promise<void>;
  loadPersistedMode: () => Promise<void>;

  // Match state
  match: Match | null;
  error: string | null;

  // Actions
  newMatch: () => void;
  flipPiece: (pieceIndex: number) => void;
  movePiece: (fromIndex: number, toIndex: number) => void;
  capturePiece: (fromIndex: number, toIndex: number) => void;
  clearError: () => void;
}

export const useGameStore = create<GameState>((set, get) => ({
  // Default to Classic mode
  currentMode: GAME_MODES.classic,

  // Set current game mode and persist to AsyncStorage
  setMode: async (mode: GameMode) => {
    set({ currentMode: mode });
    try {
      await AsyncStorage.setItem('@dark-chess:current-mode', mode.id);
    } catch (error) {
      console.error('Failed to persist game mode:', error);
    }
  },

  // Load persisted mode from AsyncStorage on app start
  loadPersistedMode: async () => {
    try {
      const modeId = await AsyncStorage.getItem('@dark-chess:current-mode');
      if (modeId === 'classic') {
        set({ currentMode: GAME_MODES.classic });
      } else if (modeId === 'three-kingdoms') {
        set({ currentMode: GAME_MODES.threeKingdoms });
      }
      // If invalid or not found, keep default (Classic)
    } catch (error) {
      console.error('Failed to load persisted game mode:', error);
    }
  },

  match: null,
  error: null,

  // Start new match using current game mode
  newMatch: () => {
    const mode = get().currentMode;
    const match = createInitialMatch(mode);
    set({ match, error: null });
  },

  flipPiece: (pieceIndex: number) => {
    set((state) => {
      if (!state.match) {
        return { error: 'No match in progress' };
      }

      const validation = validateFlip(state.match, pieceIndex);
      if (!validation.isValid) {
        return { error: validation.error || 'Invalid flip' };
      }

      try {
        const newMatch = executeFlip(state.match, pieceIndex);
        return { match: newMatch, error: null };
      } catch (error) {
        return { error: error instanceof Error ? error.message : 'Flip failed' };
      }
    });
  },

  movePiece: (fromIndex: number, toIndex: number) => {
    set((state) => {
      if (!state.match) {
        return { error: 'No match in progress' };
      }

      const validation = validateMove(state.match, fromIndex, toIndex);
      if (!validation.isValid) {
        return { error: validation.error || 'Invalid move' };
      }

      try {
        let newMatch = executeMove(state.match, fromIndex, toIndex);

        // Three Kingdoms: Decrement draw counter
        if (newMatch.movesWithoutCapture !== null && newMatch.status !== 'ended') {
          newMatch = {
            ...newMatch,
            movesWithoutCapture: newMatch.movesWithoutCapture - 1,
          };
        }

        // Check win condition after move
        const winResult = checkWinCondition(newMatch);
        if (winResult.hasEnded) {
          return {
            match: { ...newMatch, status: 'ended', winner: winResult.winner },
            error: null,
          };
        }

        return { match: newMatch, error: null };
      } catch (error) {
        return { error: error instanceof Error ? error.message : 'Move failed' };
      }
    });
  },

  capturePiece: (fromIndex: number, toIndex: number) => {
    set((state) => {
      if (!state.match) {
        return { error: 'No match in progress' };
      }

      const validation = validateCapture(state.match, fromIndex, toIndex);
      if (!validation.isValid) {
        return { error: validation.error || 'Invalid capture' };
      }

      try {
        let newMatch = executeCapture(state.match, fromIndex, toIndex);

        // Three Kingdoms: Reset draw counter to 60 on capture
        if (newMatch.movesWithoutCapture !== null && newMatch.status !== 'ended') {
          newMatch = {
            ...newMatch,
            movesWithoutCapture: 60,
          };
        }

        // Check win condition after capture
        const winResult = checkWinCondition(newMatch);
        if (winResult.hasEnded) {
          return {
            match: { ...newMatch, status: 'ended', winner: winResult.winner },
            error: null,
          };
        }

        return { match: newMatch, error: null };
      } catch (error) {
        return { error: error instanceof Error ? error.message : 'Capture failed' };
      }
    });
  },

  clearError: () => {
    set({ error: null });
  },
}));
