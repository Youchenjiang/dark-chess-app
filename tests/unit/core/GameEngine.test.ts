/**
 * Unit tests for GameEngine.ts (T016, T017)
 */

import {
  validateFlip,
  executeFlip,
  validateMove,
  executeMove,
  validateCapture,
  executeCapture,
  checkWinCondition,
  getLegalMoves,
} from '../../../src/core/GameEngine';
import { createInitialMatch } from '../../../src/core/BoardGenerator';
import { Match, Piece } from '../../../src/core/types';

describe('GameEngine', () => {
  let match: Match;

  beforeEach(() => {
    match = createInitialMatch();
  });

  describe('validateFlip (T016, T017)', () => {
    it('should validate flip for face-down piece', () => {
      const result = validateFlip(match, 0);
      expect(result.isValid).toBe(true);
    });

    it('should reject flip for invalid index (out of bounds)', () => {
      const result1 = validateFlip(match, 32);
      expect(result1.isValid).toBe(false);
      expect(result1.error).toBe('Invalid piece index');

      const result2 = validateFlip(match, -1);
      expect(result2.isValid).toBe(false);
      expect(result2.error).toBe('Invalid piece index');
    });

    it('should reject flip for already revealed piece', () => {
      // Flip a piece first
      const flippedMatch = executeFlip(match, 0);

      // Try to flip the same piece again
      const result = validateFlip(flippedMatch, 0);
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Piece already revealed');
    });

    it('should reject flip for empty cell (null)', () => {
      // Create a match with an empty cell
      const modifiedMatch: Match = {
        ...match,
        board: [...match.board],
      };
      modifiedMatch.board[0] = null;

      const result = validateFlip(modifiedMatch, 0);
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('No piece at index');
    });

    it('should reject flip when match has ended', () => {
      const endedMatch: Match = {
        ...match,
        status: 'ended',
        winner: 'red',
      };

      const result = validateFlip(endedMatch, 0);
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Match already ended');
    });
  });

  describe('executeFlip - First flip side assignment (T016)', () => {
    it('should flip a piece and assign sides on first flip', () => {
      const piece = match.board[0]!;
      const originalColor = piece.color;

      const newMatch = executeFlip(match, 0);

      // Piece should be revealed
      expect(newMatch.board[0]?.isRevealed).toBe(true);

      // Status should change from waiting-first-flip to in-progress
      expect(match.status).toBe('waiting-first-flip');
      expect(newMatch.status).toBe('in-progress');

      // Current turn should be set to the flipped piece's color
      expect(match.currentTurn).toBe(null);
      expect(newMatch.currentTurn).toBe(originalColor);
    });

    it('should toggle turn on subsequent flips', () => {
      // First flip
      const firstFlip = executeFlip(match, 0);
      const firstTurn = firstFlip.currentTurn!;

      // Second flip
      const secondFlip = executeFlip(firstFlip, 1);

      // Turn should toggle
      expect(secondFlip.currentTurn).toBe(firstTurn === 'red' ? 'black' : 'red');
    });

    it('should preserve immutability (return new match object)', () => {
      const originalMatch = match;
      const newMatch = executeFlip(match, 0);

      // Should be different objects
      expect(newMatch).not.toBe(originalMatch);
      expect(newMatch.board).not.toBe(originalMatch.board);

      // Original should be unchanged
      expect(originalMatch.board[0]?.isRevealed).toBe(false);
      expect(originalMatch.status).toBe('waiting-first-flip');
    });

    it('should throw error when trying to flip invalid piece', () => {
      expect(() => executeFlip(match, 32)).toThrow();
    });
  });

  describe('validateMove', () => {
    it('should reject move when match not in progress', () => {
      const result = validateMove(match, 0, 1);
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Match not in progress');
    });
  });

  describe('validateCapture', () => {
    it('should reject capture when match not in progress', () => {
      const result = validateCapture(match, 0, 1);
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Match not in progress');
    });
  });
});
