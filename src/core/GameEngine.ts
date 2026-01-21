/**
 * Game engine: validation and execution of game actions
 * Pure TypeScript - NO React dependencies
 */

import {
  Match,
  ValidationResult,
  WinResult,
  LegalMoveSet,
  PieceColor,
} from './types';
import { 
  isValidIndex, 
  isAdjacent, 
  hasExactlyOneScreen, 
  getLineIndices, 
  isInStraightLine,
  getStraightLineIndices 
} from './boardUtils';
import {
  canCaptureByRank,
  isKingVsPawn,
  canKingCapturePawn,
  isCannonCapture,
  TOTAL_PIECES_PER_COLOR,
} from './rules';

/**
 * Validate if a flip action is legal
 */
export function validateFlip(match: Match, pieceIndex: number): ValidationResult {
  if (match.status === 'ended') {
    return { isValid: false, error: 'Match already ended' };
  }

  if (!isValidIndex(pieceIndex)) {
    return { isValid: false, error: 'Invalid piece index' };
  }

  const piece = match.board[pieceIndex];
  if (piece === null) {
    return { isValid: false, error: 'No piece at index' };
  }

  if (piece.isRevealed) {
    return { isValid: false, error: 'Piece already revealed' };
  }

  return { isValid: true };
}

/**
 * Execute a flip action and return new match state
 */
export function executeFlip(match: Match, pieceIndex: number): Match {
  const validation = validateFlip(match, pieceIndex);
  if (!validation.isValid) {
    throw new Error(validation.error || 'Invalid flip action');
  }

  const piece = match.board[pieceIndex]!;
  const newBoard = [...match.board];
  newBoard[pieceIndex] = { ...piece, isRevealed: true };

  let newStatus: Match['status'] = match.status;
  let newCurrentTurn: PieceColor | null = match.currentTurn;

  if (match.status === 'waiting-first-flip') {
    // First flip: assign sides
    newStatus = 'in-progress';
    newCurrentTurn = piece.color;
  } else if (match.status === 'in-progress') {
    // Subsequent flip: toggle turn
    newCurrentTurn = match.currentTurn === 'red' ? 'black' : 'red';
  }

  return {
    ...match,
    status: newStatus,
    currentTurn: newCurrentTurn,
    board: newBoard,
  };
}

/**
 * Validate if a move action is legal
 */
export function validateMove(match: Match, fromIndex: number, toIndex: number): ValidationResult {
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

  if (fromPiece.color !== match.currentTurn) {
    return { isValid: false, error: 'Not current player\'s turn' };
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
 * Execute a move action and return new match state
 */
export function executeMove(match: Match, fromIndex: number, toIndex: number): Match {
  const validation = validateMove(match, fromIndex, toIndex);
  if (!validation.isValid) {
    throw new Error(validation.error || 'Invalid move action');
  }

  const newBoard = [...match.board];
  newBoard[toIndex] = newBoard[fromIndex];
  newBoard[fromIndex] = null;

  const newCurrentTurn: PieceColor = match.currentTurn === 'red' ? 'black' : 'red';

  return {
    ...match,
    currentTurn: newCurrentTurn,
    board: newBoard,
  };
}

/**
 * Validate if a capture action is legal
 */
export function validateCapture(
  match: Match,
  fromIndex: number,
  toIndex: number
): ValidationResult {
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

  if (attacker.color !== match.currentTurn) {
    return { isValid: false, error: 'Not current player\'s turn' };
  }

  const target = match.board[toIndex];
  if (target === null) {
    return { isValid: false, error: 'No piece at target index' };
  }

  if (!target.isRevealed) {
    return { isValid: false, error: 'Target not revealed' };
  }

  if (target.color === attacker.color) {
    return { isValid: false, error: 'Target is own piece' };
  }

  // Special rule: Cannon capture
  if (isCannonCapture(attacker.type)) {
    // Cannon must jump over exactly one piece (screen) to capture
    // Target must be in a straight line (same row or column)
    if (!isInStraightLine(fromIndex, toIndex)) {
      return { isValid: false, error: 'Cannon target not in straight line' };
    }
    
    // Cannon cannot capture adjacent piece directly
    if (isAdjacent(fromIndex, toIndex)) {
      return { isValid: false, error: 'Cannon cannot capture adjacent piece' };
    }
    
    // Must have exactly one screen between Cannon and target
    if (!hasExactlyOneScreen(match.board, fromIndex, toIndex)) {
      return { isValid: false, error: 'Cannon requires exactly one screen to capture' };
    }
    
    // Cannon can capture any piece (ignores rank)
    return { isValid: true };
  }

  // For non-Cannon pieces, target must be adjacent
  if (!isAdjacent(fromIndex, toIndex)) {
    return { isValid: false, error: 'Target not adjacent' };
  }

  // Special rule: King vs Pawn
  if (isKingVsPawn(attacker.type, target.type)) {
    if (!canKingCapturePawn(attacker.type, target.type)) {
      return { isValid: false, error: 'King cannot capture Pawn' };
    }
    // Pawn can capture King (allowed)
    return { isValid: true };
  }

  // Standard rank hierarchy
  if (!canCaptureByRank(attacker.type, target.type)) {
    return { isValid: false, error: 'Invalid capture: rank too low' };
  }

  return { isValid: true };
}

/**
 * Execute a capture action and return new match state
 * Note: Cannon capture validation is handled separately (requires screen check)
 */
export function executeCapture(match: Match, fromIndex: number, toIndex: number): Match {
  const validation = validateCapture(match, fromIndex, toIndex);
  if (!validation.isValid) {
    throw new Error(validation.error || 'Invalid capture action');
  }

  const attacker = match.board[fromIndex]!;
  const target = match.board[toIndex]!;

  // Mark target as dead
  const deadTarget = { ...target, isDead: true };

  // Add to captured array
  const redCaptured = [...match.redCaptured];
  const blackCaptured = [...match.blackCaptured];
  if (attacker.color === 'red') {
    redCaptured.push(deadTarget);
  } else {
    blackCaptured.push(deadTarget);
  }

  // Move attacker to target position
  const newBoard = [...match.board];
  newBoard[toIndex] = attacker;
  newBoard[fromIndex] = null;

  // Check win condition (capture-all)
  const winResult = checkWinCondition({
    ...match,
    board: newBoard,
    redCaptured,
    blackCaptured,
  });

  let newStatus = match.status;
  let newWinner: PieceColor | null = null;
  let newCurrentTurn: PieceColor | null = match.currentTurn;

  if (winResult.hasEnded && winResult.winner) {
    newStatus = 'ended';
    newWinner = winResult.winner;
  } else {
    // Toggle turn if game continues
    newCurrentTurn = match.currentTurn === 'red' ? 'black' : 'red';
  }

  return {
    ...match,
    status: newStatus,
    currentTurn: newCurrentTurn,
    winner: newWinner,
    board: newBoard,
    redCaptured,
    blackCaptured,
  };
}

/**
 * Check win condition (capture-all or stalemate)
 */
export function checkWinCondition(match: Match): WinResult {
  // Check capture-all condition
  if (match.redCaptured.length >= TOTAL_PIECES_PER_COLOR) {
    return { hasEnded: true, winner: 'red', reason: 'capture-all' };
  }
  if (match.blackCaptured.length >= TOTAL_PIECES_PER_COLOR) {
    return { hasEnded: true, winner: 'black', reason: 'capture-all' };
  }

  // Check stalemate (if match is in progress and current player has no legal moves)
  if (match.status === 'in-progress' && match.currentTurn) {
    const legalMoves = getLegalMoves(match);
    if (
      legalMoves.flips.length === 0 &&
      legalMoves.moves.length === 0 &&
      legalMoves.captures.length === 0
    ) {
      // Current player has no legal moves - opponent wins
      const winner: PieceColor = match.currentTurn === 'red' ? 'black' : 'red';
      return { hasEnded: true, winner, reason: 'stalemate' };
    }
  }

  return { hasEnded: false };
}

/**
 * Get all legal moves for current player
 */
export function getLegalMoves(match: Match): LegalMoveSet {
  const flips: number[] = [];
  const moves: Array<{ fromIndex: number; toIndex: number }> = [];
  const captures: Array<{ fromIndex: number; toIndex: number }> = [];

  if (match.status === 'ended' || match.currentTurn === null) {
    return { flips, moves, captures };
  }

  // Find all face-down pieces (flips)
  for (let i = 0; i < match.board.length; i++) {
    const piece = match.board[i];
    if (piece !== null && !piece.isRevealed) {
      flips.push(i);
    }
  }

  // Find all moves and captures for current player's face-up pieces
  for (let fromIndex = 0; fromIndex < match.board.length; fromIndex++) {
    const piece = match.board[fromIndex];
    if (piece === null || !piece.isRevealed || piece.color !== match.currentTurn) {
      continue;
    }

    // Check adjacent cells for moves
    for (let toIndex = 0; toIndex < match.board.length; toIndex++) {
      if (!isAdjacent(fromIndex, toIndex)) {
        continue;
      }

      const target = match.board[toIndex];
      if (target === null) {
        // Empty cell - potential move
        const moveValidation = validateMove(match, fromIndex, toIndex);
        if (moveValidation.isValid) {
          moves.push({ fromIndex, toIndex });
        }
      } else if (target.isRevealed && target.color !== piece.color) {
        // Enemy piece - potential capture (non-Cannon)
        if (!isCannonCapture(piece.type)) {
          const captureValidation = validateCapture(match, fromIndex, toIndex);
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
        if (target !== null && target.isRevealed && target.color !== piece.color) {
          // Enemy piece in straight line - check if valid Cannon capture
          const captureValidation = validateCapture(match, fromIndex, toIndex);
          if (captureValidation.isValid) {
            captures.push({ fromIndex, toIndex });
          }
        }
      }
    }
  }

  return { flips, moves, captures };
}
