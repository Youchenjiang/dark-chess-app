/**
 * Unit tests for GameEngine.ts
 * Tests will be expanded as implementation progresses
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
import { Match } from '../../../src/core/types';

describe('GameEngine', () => {
  let match: Match;

  beforeEach(() => {
    match = createInitialMatch();
  });

  describe('validateFlip', () => {
    it('should validate flip for face-down piece', () => {
      const result = validateFlip(match, 0);
      expect(result.isValid).toBe(true);
    });

    it('should reject flip for invalid index', () => {
      const result = validateFlip(match, 32);
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Invalid piece index');
    });
  });

  describe('executeFlip', () => {
    it('should flip a piece and assign sides on first flip', () => {
      const piece = match.board[0]!;
      const newMatch = executeFlip(match, 0);
      expect(newMatch.board[0]?.isRevealed).toBe(true);
      expect(newMatch.status).toBe('in-progress');
      expect(newMatch.currentTurn).toBe(piece.color);
    });
  });

  // More tests will be added as implementation progresses
  describe('validateMove', () => {
    it('should be implemented', () => {
      // Placeholder
      expect(true).toBe(true);
    });
  });

  describe('validateCapture', () => {
    it('should be implemented', () => {
      // Placeholder
      expect(true).toBe(true);
    });
  });
});
