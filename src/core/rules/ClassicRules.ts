/**
 * Classic Dark Chess Rules Implementation
 * Extracted from GameEngine.ts for Strategy Pattern
 * Pure TypeScript - NO React dependencies
 */

import {
  Match,
  ValidationResult,
  WinResult,
  LegalMoveSet,
  Piece,
  RuleSet,
} from '../types';
import {
  isValidIndex,
  isAdjacent,
  hasExactlyOneScreen,
  isInStraightLine,
  getStraightLineIndices,
  BOARD_SIZE,
  indexToRowCol,
} from '../boardUtils';
import {
  canCaptureByRank,
  isKingVsPawn,
  canKingCapturePawn,
  isCannonCapture,
  TOTAL_PIECES_PER_COLOR,
} from '../rules';

/**
 * ClassicRules: 2-player Dark Chess with rank hierarchy
 * - Board: 8x4 grid (32 cells)
 * - Players: 2 (Red vs Black)
 * - Rank hierarchy enforced (King > Guard > ... > Pawn)
 * - Special rules: King cannot capture Pawn, Cannon requires screen
 * - Win condition: Capture-all or stalemate
 * - No draw counter
 */
export class ClassicRules implements RuleSet {
  /**
   * Validate if a move action is legal
   */
  validateMove(match: Match, fromIndex: number, toIndex: number): ValidationResult {
    if (match.status !== 'in-progress') {
      return { isValid: false, error: 'Match not in progress' };
    }

    if (!isValidIndex(fromIndex) || !isValidIndex(toIndex)) {
      return { isValid: false, error: 'Invalid indices' };
    }

    const fromPiece = match.board[fromIndex];
    if (fromPiece === null) {
      return { isValid: false, error: 'No piece at source index' };
    }

    if (!fromPiece.isRevealed) {
      return { isValid: false, error: 'Piece not revealed' };
    }

    // Check if it's the current faction's turn
    const currentFactionId = match.activeFactions[match.currentFactionIndex];
    if (fromPiece.factionId !== currentFactionId) {
      return { isValid: false, error: 'Not current faction\'s turn' };
    }

    if (!isAdjacent(fromIndex, toIndex)) {
      return { isValid: false, error: 'Destination not adjacent' };
    }

    if (match.board[toIndex] !== null) {
      return { isValid: false, error: 'Destination not empty' };
    }

    return { isValid: true };
  }

  /**
   * Validate if a capture action is legal
   */
  validateCapture(match: Match, fromIndex: number, toIndex: number): ValidationResult {
    if (match.status !== 'in-progress') {
      return { isValid: false, error: 'Match not in progress' };
    }

    if (!isValidIndex(fromIndex) || !isValidIndex(toIndex)) {
      return { isValid: false, error: 'Invalid indices' };
    }

    const attacker = match.board[fromIndex];
    if (attacker === null) {
      return { isValid: false, error: 'No piece at attacker index' };
    }

    if (!attacker.isRevealed) {
      return { isValid: false, error: 'Attacker not revealed' };
    }

    const currentFactionId = match.activeFactions[match.currentFactionIndex];
    if (attacker.factionId !== currentFactionId) {
      return { isValid: false, error: 'Not current faction\'s turn' };
    }

    const target = match.board[toIndex];
    if (target === null) {
      return { isValid: false, error: 'No piece at target index' };
    }

    if (!target.isRevealed) {
      return { isValid: false, error: 'Target not revealed' };
    }

    if (target.factionId === attacker.factionId) {
      return { isValid: false, error: 'Target is own piece' };
    }

    // Special rule: Cannon capture
    if (isCannonCapture(attacker.type)) {
      if (!isInStraightLine(fromIndex, toIndex)) {
        return { isValid: false, error: 'Cannon target not in straight line' };
      }

      if (isAdjacent(fromIndex, toIndex)) {
        return { isValid: false, error: 'Cannon cannot capture adjacent piece' };
      }

      if (!hasExactlyOneScreen(match.board, fromIndex, toIndex)) {
        return { isValid: false, error: 'Cannon requires exactly one screen to capture' };
      }

      return { isValid: true };
    }

    // For non-Cannon pieces, target must be adjacent
    if (!isAdjacent(fromIndex, toIndex)) {
      return { isValid: false, error: 'Target not adjacent' };
    }

    // Check if capture is allowed by rank
    if (!this.canPieceCapture(attacker, target)) {
      if (isKingVsPawn(attacker.type, target.type)) {
        return { isValid: false, error: 'King cannot capture Pawn' };
      }
      return { isValid: false, error: 'Invalid capture: rank too low' };
    }

    return { isValid: true };
  }

  /**
   * Check if game has ended and determine winner
   */
  checkWinCondition(match: Match): WinResult {
    // Check capture-all condition
    for (const factionId of match.activeFactions) {
      const capturedByThisFaction = match.capturedByFaction[factionId] || [];
      if (capturedByThisFaction.length >= TOTAL_PIECES_PER_COLOR) {
        return { hasEnded: true, winner: factionId, reason: 'capture-all' };
      }
    }

    // Check stalemate (current player has no legal moves)
    if (match.status === 'in-progress' && match.activeFactions.length > 0) {
      const legalMoves = this.getLegalMoves(match);
      if (
        legalMoves.flips.length === 0 &&
        legalMoves.moves.length === 0 &&
        legalMoves.captures.length === 0
      ) {
        // Current faction has no legal moves - opponent wins
        const currentFactionId = match.activeFactions[match.currentFactionIndex];
        const opponentFactionId = match.activeFactions.find(id => id !== currentFactionId);
        if (opponentFactionId) {
          return { hasEnded: true, winner: opponentFactionId, reason: 'stalemate' };
        }
      }
    }

    return { hasEnded: false };
  }

  /**
   * Check if game should end in a draw
   * Classic mode has no draw condition
   */
  checkDrawCondition(match: Match): boolean {
    return false; // Classic mode has no draw counter
  }

  /**
   * Get all legal moves for current faction
   */
  getLegalMoves(match: Match): LegalMoveSet {
    const flips: number[] = [];
    const moves: Array<{ fromIndex: number; toIndex: number }> = [];
    const captures: Array<{ fromIndex: number; toIndex: number }> = [];

    if (match.status === 'ended' || match.activeFactions.length === 0) {
      return { flips, moves, captures };
    }

    const currentFactionId = match.activeFactions[match.currentFactionIndex];

    // Find all face-down pieces (flips)
    for (let i = 0; i < match.board.length; i++) {
      const piece = match.board[i];
      if (piece !== null && !piece.isRevealed) {
        flips.push(i);
      }
    }

    // Find all moves and captures for current faction's face-up pieces
    for (let fromIndex = 0; fromIndex < match.board.length; fromIndex++) {
      const piece = match.board[fromIndex];
      if (piece === null || !piece.isRevealed || piece.factionId !== currentFactionId) {
        continue;
      }

      // Check adjacent cells for moves
      const adjacentIndices = this.getAdjacentIndices(fromIndex, match.board.length);
      for (const toIndex of adjacentIndices) {
        const target = match.board[toIndex];
        if (target === null) {
          // Empty cell - potential move
          const moveValidation = this.validateMove(match, fromIndex, toIndex);
          if (moveValidation.isValid) {
            moves.push({ fromIndex, toIndex });
          }
        } else if (target.isRevealed && target.factionId !== piece.factionId) {
          // Enemy piece - potential capture (non-Cannon)
          if (!isCannonCapture(piece.type)) {
            const captureValidation = this.validateCapture(match, fromIndex, toIndex);
            if (captureValidation.isValid) {
              captures.push({ fromIndex, toIndex });
            }
          }
        }
      }

      // Special handling for Cannon captures (can jump to non-adjacent targets)
      if (isCannonCapture(piece.type)) {
        const straightLineIndices = getStraightLineIndices(fromIndex);
        for (const toIndex of straightLineIndices) {
          const target = match.board[toIndex];
          if (target !== null && target.isRevealed && target.factionId !== piece.factionId) {
            // Enemy piece in straight line - check if valid Cannon capture
            const captureValidation = this.validateCapture(match, fromIndex, toIndex);
            if (captureValidation.isValid) {
              captures.push({ fromIndex, toIndex });
            }
          }
        }
      }
    }

    return { flips, moves, captures };
  }

  /**
   * Get adjacent indices for a given position (8x4 grid)
   */
  getAdjacentIndices(index: number, boardSize: number): number[] {
    if (!isValidIndex(index)) {
      return [];
    }

    const { row, col } = indexToRowCol(index);
    const adjacent: number[] = [];

    // Up
    if (row > 0) {
      adjacent.push(index - 4);
    }

    // Down
    if (row < 7) {
      adjacent.push(index + 4);
    }

    // Left
    if (col > 0) {
      adjacent.push(index - 1);
    }

    // Right
    if (col < 3) {
      adjacent.push(index + 1);
    }

    return adjacent;
  }

  /**
   * Check if attacker piece can capture target piece
   * Enforces Classic mode rank hierarchy and King vs Pawn exception
   */
  canPieceCapture(attacker: Piece, target: Piece): boolean {
    // Cannon ignores rank (handled separately in validateCapture)
    if (isCannonCapture(attacker.type)) {
      return true;
    }

    // Special case: King vs Pawn
    if (isKingVsPawn(attacker.type, target.type)) {
      return canKingCapturePawn(attacker.type, target.type);
    }

    // Standard rank hierarchy
    return canCaptureByRank(attacker.type, target.type);
  }
}
