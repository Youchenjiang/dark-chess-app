/**
 * Three Kingdoms Dark Chess Rules Implementation
 * 3-player variant with modified rules
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
import { isCannonCapture } from '../rules';

/**
 * Board dimensions for Three Kingdoms mode
 * 9 rows × 5 cols = 45 intersection points
 */
const TK_BOARD_ROWS = 9;
const TK_BOARD_COLS = 5;
const TK_BOARD_SIZE = 45;

/**
 * ThreeKingdomsRules: 3-player Dark Chess with no rank hierarchy
 * - Board: 9x5 grid (45 intersection points)
 * - Players: 3 (Team A/Green, Team B/Red, Team C/Black)
 * - NO rank hierarchy (any piece can capture any opponent piece)
 * - NO King vs Pawn exception
 * - Draw counter: 60 moves without capture
 * - Modified movement: Generals move like Rooks (infinite straight)
 * - Win condition: Elimination (only 1 faction remains) or capture-all
 */
export class ThreeKingdomsRules implements RuleSet {
  /**
   * Validate if a move action is legal
   */
  validateMove(match: Match, fromIndex: number, toIndex: number): ValidationResult {
    // Check if match has ended
    if (match.status === 'ended') {
      return { isValid: false, error: 'Match already ended' };
    }

    // Check if current player is assigned (allows movement during 'waiting-first-flip' if player is assigned)
    const currentPlayerFaction = match.playerFactionMap[match.currentPlayerIndex];
    if (currentPlayerFaction === null) {
      return { isValid: false, error: 'Must flip a piece first' };
    }

    if (!this.isValidIndex(fromIndex) || !this.isValidIndex(toIndex)) {
      return { isValid: false, error: 'Invalid indices' };
    }

    const fromPiece = match.board[fromIndex];
    if (fromPiece === null) {
      return { isValid: false, error: 'No piece at source index' };
    }

    if (!fromPiece.isRevealed) {
      return { isValid: false, error: 'Piece not revealed' };
    }

    const currentFactionId = match.activeFactions[match.currentFactionIndex];
    if (fromPiece.factionId !== currentFactionId) {
      return { isValid: false, error: 'Not current faction\'s turn' };
    }

    if (match.board[toIndex] !== null) {
      return { isValid: false, error: 'Destination not empty' };
    }

    // Check if move is legal based on piece type
    if (!this.isLegalMove(match.board, fromPiece, fromIndex, toIndex)) {
      return { isValid: false, error: 'Illegal move for this piece type' };
    }

    return { isValid: true };
  }

  /**
   * Check if a move is legal based on piece type (Three Kingdoms movement rules)
   */
  private isLegalMove(
    board: (Piece | null)[],
    piece: Piece,
    fromIndex: number,
    toIndex: number
  ): boolean {
    const adjacentIndices = this.getAdjacentIndices(fromIndex, TK_BOARD_SIZE);
    
    switch (piece.type) {
      case 'King': // General (將/帥) - infinite straight movement like Rook
        return this.isInfiniteStraitMove(fromIndex, toIndex, board);
      
      case 'Minister': // Minister (相/象) - jump 2 diagonals WITHOUT blocking
        return this.isMinisterJump(fromIndex, toIndex);
      
      case 'Horse': // Horse (馬) - L-shape WITHOUT blocking
        return this.isHorseMove(fromIndex, toIndex);
      
      case 'Rook': // Rook (車) - infinite straight
        return this.isInfiniteStraitMove(fromIndex, toIndex, board);
      
      case 'Guard': // Guard (士) - one step DIAGONAL (Army Chess style)
        return this.isOneDiagonalStep(fromIndex, toIndex);
      
      case 'Cannon': // Cannon (炮) - one step orthogonal (capture is different)
      case 'Pawn': // Pawn (兵/卒) - one step orthogonal
      default:
        // Standard adjacent move (orthogonal)
        return adjacentIndices.includes(toIndex);
    }
  }

  /**
   * Check if move is infinite straight (for General/Rook)
   */
  private isInfiniteStraitMove(
    fromIndex: number,
    toIndex: number,
    board: (Piece | null)[]
  ): boolean {
    if (!this.isInStraightLine(fromIndex, toIndex)) {
      return false;
    }
    
    // Check if path is clear
    const { row: fromRow, col: fromCol } = this.indexToRowCol(fromIndex);
    const { row: toRow, col: toCol } = this.indexToRowCol(toIndex);
    
    const rowStep = fromRow === toRow ? 0 : (toRow > fromRow ? 1 : -1);
    const colStep = fromCol === toCol ? 0 : (toCol > fromCol ? 1 : -1);
    
    let currentRow = fromRow + rowStep;
    let currentCol = fromCol + colStep;
    
    while (currentRow !== toRow || currentCol !== toCol) {
      const index = this.rowColToIndex(currentRow, currentCol);
      if (board[index] !== null) {
        return false; // Path blocked
      }
      currentRow += rowStep;
      currentCol += colStep;
    }
    
    return true;
  }

  /**
   * Check if move is Minister jump (2 diagonals, no blocking)
   */
  private isMinisterJump(fromIndex: number, toIndex: number): boolean {
    const { row: fromRow, col: fromCol } = this.indexToRowCol(fromIndex);
    const { row: toRow, col: toCol } = this.indexToRowCol(toIndex);
    
    const rowDiff = Math.abs(toRow - fromRow);
    const colDiff = Math.abs(toCol - fromCol);
    
    // Must be exactly 2 steps diagonal
    return rowDiff === 2 && colDiff === 2;
  }

  /**
   * Check if move is Horse L-shape (no blocking)
   */
  private isHorseMove(fromIndex: number, toIndex: number): boolean {
    const { row: fromRow, col: fromCol } = this.indexToRowCol(fromIndex);
    const { row: toRow, col: toCol } = this.indexToRowCol(toIndex);
    
    const rowDiff = Math.abs(toRow - fromRow);
    const colDiff = Math.abs(toCol - fromCol);
    
    // L-shape: (2,1) or (1,2)
    return (rowDiff === 2 && colDiff === 1) || (rowDiff === 1 && colDiff === 2);
  }

  /**
   * Check if move is one step diagonal (for Guard/Advisor)
   */
  private isOneDiagonalStep(fromIndex: number, toIndex: number): boolean {
    const { row: fromRow, col: fromCol } = this.indexToRowCol(fromIndex);
    const { row: toRow, col: toCol } = this.indexToRowCol(toIndex);
    
    const rowDiff = Math.abs(toRow - fromRow);
    const colDiff = Math.abs(toCol - fromCol);
    
    // Must be exactly 1 step diagonal
    return rowDiff === 1 && colDiff === 1;
  }

  /**
   * Validate if a capture action is legal
   */
  validateCapture(match: Match, fromIndex: number, toIndex: number): ValidationResult {
    // Check if match has ended
    if (match.status === 'ended') {
      return { isValid: false, error: 'Match already ended' };
    }

    // Check if current player is assigned (allows capture during 'waiting-first-flip' if player is assigned)
    const currentPlayerFaction = match.playerFactionMap[match.currentPlayerIndex];
    if (currentPlayerFaction === null) {
      return { isValid: false, error: 'Must flip a piece first' };
    }

    if (!this.isValidIndex(fromIndex) || !this.isValidIndex(toIndex)) {
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
      if (!this.isInStraightLine(fromIndex, toIndex)) {
        return { isValid: false, error: 'Cannon target not in straight line' };
      }

      const adjacentIndices = this.getAdjacentIndices(fromIndex, TK_BOARD_SIZE);
      if (adjacentIndices.includes(toIndex)) {
        return { isValid: false, error: 'Cannon cannot capture adjacent piece' };
      }

      if (!this.hasExactlyOneScreen(match.board, fromIndex, toIndex)) {
        return { isValid: false, error: 'Cannon requires exactly one screen to capture' };
      }

      return { isValid: true };
    }

    // For non-Cannon pieces, check if capture is legal based on movement
    if (!this.isLegalCapture(match.board, attacker, fromIndex, toIndex)) {
      return { isValid: false, error: 'Illegal capture for this piece type' };
    }

    return { isValid: true };
  }

  /**
   * Check if capture is legal based on piece movement rules
   */
  private isLegalCapture(
    board: (Piece | null)[],
    piece: Piece,
    fromIndex: number,
    toIndex: number
  ): boolean {
    const adjacentIndices = this.getAdjacentIndices(fromIndex, TK_BOARD_SIZE);
    
    switch (piece.type) {
      case 'King': // General - infinite straight capture
        return this.isInfiniteStraitMove(fromIndex, toIndex, board);
      
      case 'Minister': // Minister - 2 diagonal jump capture
        return this.isMinisterJump(fromIndex, toIndex);
      
      case 'Horse': // Horse - L-shape capture
        return this.isHorseMove(fromIndex, toIndex);
      
      case 'Rook': // Rook - infinite straight capture
        return this.isInfiniteStraitMove(fromIndex, toIndex, board);
      
      case 'Guard': // Guard - one step diagonal capture
        return this.isOneDiagonalStep(fromIndex, toIndex);
      
      case 'Pawn': // Pawn - adjacent only
      default:
        return adjacentIndices.includes(toIndex);
    }
  }

  /**
   * Check if game has ended and determine winner
   */
  checkWinCondition(match: Match): WinResult {
    // Check if only one faction remains (elimination victory)
    if (match.activeFactions.length === 1) {
      return {
        hasEnded: true,
        winner: match.activeFactions[0],
        reason: 'elimination',
      };
    }

    // Check capture-all condition (rare in 3-player, but possible)
    for (const factionId of match.activeFactions) {
      const capturedByThisFaction = match.capturedByFaction[factionId] || [];
      // In 3-player, a faction wins if they captured all opponent pieces
      const totalOpponentPieces = match.factions
        .filter(f => f.id !== factionId)
        .reduce((sum, f) => sum + f.pieceCount, 0);
      
      if (capturedByThisFaction.length >= totalOpponentPieces) {
        return { hasEnded: true, winner: factionId, reason: 'capture-all' };
      }
    }

    // Check stalemate (current faction has no legal moves -> elimination)
    if (match.status === 'in-progress' && match.activeFactions.length > 0) {
      const legalMoves = this.getLegalMoves(match);
      if (
        legalMoves.flips.length === 0 &&
        legalMoves.moves.length === 0 &&
        legalMoves.captures.length === 0
      ) {
        // Current faction is eliminated (stalemate)
        // Note: This should trigger elimination, not immediate end
        // The game continues with remaining factions
        const currentFactionId = match.activeFactions[match.currentFactionIndex];
        const remainingFactions = match.activeFactions.filter(id => id !== currentFactionId);
        
        if (remainingFactions.length === 1) {
          return { hasEnded: true, winner: remainingFactions[0], reason: 'stalemate' };
        }
        // If more than 1 faction remains, game continues (elimination handled elsewhere)
      }
    }

    return { hasEnded: false };
  }

  /**
   * Check if game should end in a draw (60-move rule)
   */
  checkDrawCondition(match: Match): boolean {
    return match.movesWithoutCapture !== null && match.movesWithoutCapture === 0;
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

      // Check all possible destinations
      for (let toIndex = 0; toIndex < match.board.length; toIndex++) {
        if (fromIndex === toIndex) continue;

        const target = match.board[toIndex];
        if (target === null) {
          // Empty cell - potential move
          const moveValidation = this.validateMove(match, fromIndex, toIndex);
          if (moveValidation.isValid) {
            moves.push({ fromIndex, toIndex });
          }
        } else if (target.isRevealed && target.factionId !== piece.factionId) {
          // Enemy piece - potential capture
          const captureValidation = this.validateCapture(match, fromIndex, toIndex);
          if (captureValidation.isValid) {
            captures.push({ fromIndex, toIndex });
          }
        }
      }
    }

    return { flips, moves, captures };
  }

  /**
   * Get adjacent indices for a given position (9x5 grid)
   */
  getAdjacentIndices(index: number, boardSize: number): number[] {
    if (!this.isValidIndex(index)) {
      return [];
    }

    const { row, col } = this.indexToRowCol(index);
    const adjacent: number[] = [];

    // Up
    if (row > 0) {
      adjacent.push(index - TK_BOARD_COLS);
    }

    // Down
    if (row < TK_BOARD_ROWS - 1) {
      adjacent.push(index + TK_BOARD_COLS);
    }

    // Left
    if (col > 0) {
      adjacent.push(index - 1);
    }

    // Right
    if (col < TK_BOARD_COLS - 1) {
      adjacent.push(index + 1);
    }

    return adjacent;
  }

  /**
   * Check if attacker piece can capture target piece
   * Three Kingdoms: NO rank hierarchy (any piece can capture any piece)
   */
  canPieceCapture(attacker: Piece, target: Piece): boolean {
    // Cannon ignores rank (handled separately in validateCapture)
    if (isCannonCapture(attacker.type)) {
      return true;
    }

    // No rank hierarchy in Three Kingdoms - any piece can capture any opponent piece
    return true;
  }

  /**
   * Helper: Check if index is valid (0-44 for 9x5 grid)
   */
  private isValidIndex(index: number): boolean {
    return index >= 0 && index < TK_BOARD_SIZE;
  }

  /**
   * Helper: Convert 1D index to row/col
   */
  private indexToRowCol(index: number): { row: number; col: number } {
    return {
      row: Math.floor(index / TK_BOARD_COLS),
      col: index % TK_BOARD_COLS,
    };
  }

  /**
   * Helper: Convert row/col to 1D index
   */
  private rowColToIndex(row: number, col: number): number {
    return row * TK_BOARD_COLS + col;
  }

  /**
   * Helper: Check if two indices are in straight line (same row or column)
   */
  private isInStraightLine(index1: number, index2: number): boolean {
    if (!this.isValidIndex(index1) || !this.isValidIndex(index2)) {
      return false;
    }
    const { row: row1, col: col1 } = this.indexToRowCol(index1);
    const { row: row2, col: col2 } = this.indexToRowCol(index2);
    
    // Same row or same column
    return row1 === row2 || col1 === col2;
  }

  /**
   * Helper: Check if there is exactly one piece (screen) between Cannon and target
   */
  private hasExactlyOneScreen(
    board: (Piece | null)[],
    cannonIndex: number,
    targetIndex: number
  ): boolean {
    const { row: fromRow, col: fromCol } = this.indexToRowCol(cannonIndex);
    const { row: toRow, col: toCol } = this.indexToRowCol(targetIndex);
    
    const rowStep = fromRow === toRow ? 0 : (toRow > fromRow ? 1 : -1);
    const colStep = fromCol === toCol ? 0 : (toCol > fromCol ? 1 : -1);
    
    let count = 0;
    let currentRow = fromRow + rowStep;
    let currentCol = fromCol + colStep;
    
    while (currentRow !== toRow || currentCol !== toCol) {
      const index = this.rowColToIndex(currentRow, currentCol);
      if (board[index] !== null) {
        count++;
      }
      currentRow += rowStep;
      currentCol += colStep;
    }
    
    return count === 1;
  }
}
