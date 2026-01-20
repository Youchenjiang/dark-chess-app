/**
 * Zustand store for game state management
 */

import { create } from 'zustand';
import { Match } from '../core/types';
import { createInitialMatch } from '../core/BoardGenerator';
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
  match: Match | null;
  error: string | null;
  newMatch: () => void;
  flipPiece: (pieceIndex: number) => void;
  movePiece: (fromIndex: number, toIndex: number) => void;
  capturePiece: (fromIndex: number, toIndex: number) => void;
  clearError: () => void;
}

export const useGameStore = create<GameState>((set) => ({
  match: null,
  error: null,

  newMatch: () => {
    const match = createInitialMatch();
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
        const newMatch = executeMove(state.match, fromIndex, toIndex);
        // Check win condition after move
        const winResult = checkWinCondition(newMatch);
        if (winResult.hasEnded && winResult.winner) {
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
        const newMatch = executeCapture(state.match, fromIndex, toIndex);
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
