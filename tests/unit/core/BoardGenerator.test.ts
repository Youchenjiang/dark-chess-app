/**
 * Unit tests for BoardGenerator.ts
 */

import { createInitialMatch } from '../../../src/core/BoardGenerator';
import { BOARD_SIZE, TOTAL_PIECES_PER_COLOR } from '../../../src/core/rules';

describe('BoardGenerator', () => {
  describe('createInitialMatch', () => {
    it('should create a match with 32 pieces', () => {
      const match = createInitialMatch();
      expect(match.board.length).toBe(BOARD_SIZE);
      expect(match.board.filter((p) => p !== null).length).toBe(BOARD_SIZE);
    });

    it('should have all pieces face-down initially', () => {
      const match = createInitialMatch();
      match.board.forEach((piece) => {
        if (piece !== null) {
          expect(piece.isRevealed).toBe(false);
          expect(piece.isDead).toBe(false);
        }
      });
    });

    it('should have exactly 16 red and 16 black pieces', () => {
      const match = createInitialMatch();
      const redCount = match.board.filter((p) => p?.color === 'red').length;
      const blackCount = match.board.filter((p) => p?.color === 'black').length;
      expect(redCount).toBe(TOTAL_PIECES_PER_COLOR);
      expect(blackCount).toBe(TOTAL_PIECES_PER_COLOR);
    });

    it('should initialize match status as waiting-first-flip', () => {
      const match = createInitialMatch();
      expect(match.status).toBe('waiting-first-flip');
      expect(match.currentTurn).toBe(null);
      expect(match.winner).toBe(null);
    });

    it('should have empty captured arrays', () => {
      const match = createInitialMatch();
      expect(match.redCaptured).toEqual([]);
      expect(match.blackCaptured).toEqual([]);
    });

    it('should have unique piece IDs', () => {
      const match = createInitialMatch();
      const ids = match.board.map((p) => p?.id).filter((id) => id !== undefined) as string[];
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);
    });
  });
});
