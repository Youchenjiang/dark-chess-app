/**
 * Game rules and constants for Banqi (Dark Chess)
 * Pure TypeScript - NO React dependencies
 */

import { PieceType, Piece, PieceColor } from './types';

/**
 * Piece ranks (higher number = higher rank)
 * King: 7 (highest)
 * Guard: 6
 * Minister: 5
 * Rook: 4
 * Horse: 3
 * Cannon: 2 (special capture rule)
 * Pawn: 1 (lowest, but can capture King)
 */
export const PIECE_RANKS: Record<PieceType, number> = {
  King: 7,
  Guard: 6,
  Minister: 5,
  Rook: 4,
  Horse: 3,
  Cannon: 2,
  Pawn: 1,
};

/**
 * Get the rank of a piece type
 */
export function getPieceRank(pieceType: PieceType): number {
  return PIECE_RANKS[pieceType];
}

/**
 * Check if attacker can capture target based on standard rank hierarchy
 * Returns true if attacker rank >= target rank
 * Special cases (King vs Pawn, Cannon) are handled separately
 */
export function canCaptureByRank(attackerType: PieceType, targetType: PieceType): boolean {
  return getPieceRank(attackerType) >= getPieceRank(targetType);
}

/**
 * Check if this is a King vs Pawn scenario
 */
export function isKingVsPawn(attackerType: PieceType, targetType: PieceType): boolean {
  return (
    (attackerType === 'King' && targetType === 'Pawn') ||
    (attackerType === 'Pawn' && targetType === 'King')
  );
}

/**
 * Check if King can capture Pawn (special rule: King CANNOT capture Pawn)
 */
export function canKingCapturePawn(attackerType: PieceType, targetType: PieceType): boolean {
  if (attackerType === 'King' && targetType === 'Pawn') {
    return false; // King cannot capture Pawn
  }
  return true; // Pawn can capture King, or not a King/Pawn scenario
}

/**
 * Check if this is a Cannon capture (requires special screen rule)
 */
export function isCannonCapture(attackerType: PieceType): boolean {
  return attackerType === 'Cannon';
}

/**
 * Piece counts per color (total 16 pieces per side)
 */
export const PIECE_COUNTS: Record<PieceType, number> = {
  King: 1,
  Guard: 2,
  Minister: 2,
  Rook: 2,
  Horse: 2,
  Cannon: 2,
  Pawn: 5,
};

/**
 * Total pieces per color
 */
export const TOTAL_PIECES_PER_COLOR = 16;
