/**
 * Unit tests for rules.ts
 */

import {
  getPieceRank,
  canCaptureByRank,
  isKingVsPawn,
  canKingCapturePawn,
  isCannonCapture,
  PIECE_RANKS,
} from '../../../src/core/rules';

describe('rules', () => {
  describe('getPieceRank', () => {
    it('should return correct rank for each piece type', () => {
      expect(getPieceRank('King')).toBe(7);
      expect(getPieceRank('Guard')).toBe(6);
      expect(getPieceRank('Minister')).toBe(5);
      expect(getPieceRank('Rook')).toBe(4);
      expect(getPieceRank('Horse')).toBe(3);
      expect(getPieceRank('Cannon')).toBe(2);
      expect(getPieceRank('Pawn')).toBe(1);
    });
  });

  describe('canCaptureByRank', () => {
    it('should allow higher rank to capture lower rank', () => {
      expect(canCaptureByRank('Rook', 'Horse')).toBe(true);
      expect(canCaptureByRank('King', 'Pawn')).toBe(true);
    });

    it('should allow equal rank to capture', () => {
      expect(canCaptureByRank('Rook', 'Rook')).toBe(true);
      expect(canCaptureByRank('Guard', 'Guard')).toBe(true);
    });

    it('should reject lower rank capturing higher rank', () => {
      expect(canCaptureByRank('Horse', 'Rook')).toBe(false);
      expect(canCaptureByRank('Pawn', 'King')).toBe(false);
    });
  });

  describe('isKingVsPawn', () => {
    it('should detect King vs Pawn scenarios', () => {
      expect(isKingVsPawn('King', 'Pawn')).toBe(true);
      expect(isKingVsPawn('Pawn', 'King')).toBe(true);
    });

    it('should reject non-King/Pawn scenarios', () => {
      expect(isKingVsPawn('King', 'Rook')).toBe(false);
      expect(isKingVsPawn('Rook', 'Pawn')).toBe(false);
    });
  });

  describe('canKingCapturePawn', () => {
    it('should reject King capturing Pawn', () => {
      expect(canKingCapturePawn('King', 'Pawn')).toBe(false);
    });

    it('should allow Pawn capturing King', () => {
      expect(canKingCapturePawn('Pawn', 'King')).toBe(true);
    });

    it('should allow non-King/Pawn scenarios', () => {
      expect(canKingCapturePawn('Rook', 'Horse')).toBe(true);
    });
  });

  describe('isCannonCapture', () => {
    it('should detect Cannon captures', () => {
      expect(isCannonCapture('Cannon')).toBe(true);
    });

    it('should reject non-Cannon pieces', () => {
      expect(isCannonCapture('Rook')).toBe(false);
      expect(isCannonCapture('King')).toBe(false);
    });
  });
});
