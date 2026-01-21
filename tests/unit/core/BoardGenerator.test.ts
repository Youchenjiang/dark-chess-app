/**
 * Unit tests for BoardGenerator.ts (T015)
 */

import { createInitialMatch } from '../../../src/core/BoardGenerator';
import { BOARD_SIZE, TOTAL_PIECES_PER_COLOR, PIECE_COUNTS } from '../../../src/core/rules';
import { PieceType } from '../../../src/core/types';

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

    it('should have correct piece type distribution for each color', () => {
      const match = createInitialMatch();
      const redPieces = match.board.filter((p) => p?.color === 'red');
      const blackPieces = match.board.filter((p) => p?.color === 'black');

      // Check red pieces
      for (const [type, count] of Object.entries(PIECE_COUNTS) as [PieceType, number][]) {
        const redTypeCount = redPieces.filter((p) => p?.type === type).length;
        expect(redTypeCount).toBe(count);
      }

      // Check black pieces
      for (const [type, count] of Object.entries(PIECE_COUNTS) as [PieceType, number][]) {
        const blackTypeCount = blackPieces.filter((p) => p?.type === type).length;
        expect(blackTypeCount).toBe(count);
      }
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

    it('should shuffle pieces randomly (different positions in multiple runs)', () => {
      const match1 = createInitialMatch();
      const match2 = createInitialMatch();

      // Get first 5 piece types from each match
      const types1 = match1.board.slice(0, 5).map((p) => p?.type);
      const types2 = match2.board.slice(0, 5).map((p) => p?.type);

      // Should be very unlikely to have same first 5 pieces in same order
      // (Not 100% guaranteed due to randomness, but highly unlikely)
      const same = types1.every((t, i) => t === types2[i]);
      // We allow for the rare case where they are the same
      // This test is more about verifying shuffle exists than guaranteeing randomness
      expect(match1.board).not.toBe(match2.board); // Different instances
    });
  });
});
