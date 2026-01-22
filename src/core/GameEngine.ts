/**
 * Game engine: validation and execution of game actions (Multi-mode support)
 * Pure TypeScript - NO React dependencies
 */

import {
  Match,
  ValidationResult,
  WinResult,
  LegalMoveSet,
} from './types';

/**
 * Validate if a flip action is legal
 */
export function validateFlip(match: Match, pieceIndex: number): ValidationResult {
  if (match.status === 'ended') {
    return { isValid: false, error: 'Match already ended' };
  }

  if (pieceIndex < 0 || pieceIndex >= match.board.length) {
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
  let newCurrentFactionIndex = match.currentFactionIndex;
  let newMovesWithoutCapture = match.movesWithoutCapture;

  if (match.status === 'waiting-first-flip') {
    // First flip: assign starting faction
    newStatus = 'in-progress';
    // Find the faction index for the flipped piece
    newCurrentFactionIndex = match.activeFactions.indexOf(piece.factionId);
    if (newCurrentFactionIndex === -1) {
      newCurrentFactionIndex = 0; // Fallback
    }
  } else if (match.status === 'in-progress') {
    // Subsequent flip: rotate turn
    newCurrentFactionIndex = getNextFactionIndex(match);
    // Decrement draw counter if applicable
    if (newMovesWithoutCapture !== null && newMovesWithoutCapture > 0) {
      newMovesWithoutCapture -= 1;
    }
  }

  return {
    ...match,
    status: newStatus,
    currentFactionIndex: newCurrentFactionIndex,
    board: newBoard,
    movesWithoutCapture: newMovesWithoutCapture,
  };
}

/**
 * Validate if a move action is legal (delegate to RuleSet)
 */
export function validateMove(match: Match, fromIndex: number, toIndex: number): ValidationResult {
  return match.mode.ruleSet.validateMove(match, fromIndex, toIndex);
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

  let newMovesWithoutCapture = match.movesWithoutCapture;
  // Decrement draw counter if applicable
  if (newMovesWithoutCapture !== null && newMovesWithoutCapture > 0) {
    newMovesWithoutCapture -= 1;
  }

  const newCurrentFactionIndex = getNextFactionIndex(match);

  return {
    ...match,
    currentFactionIndex: newCurrentFactionIndex,
    board: newBoard,
    movesWithoutCapture: newMovesWithoutCapture,
  };
}

/**
 * Validate if a capture action is legal (delegate to RuleSet)
 */
export function validateCapture(
  match: Match,
  fromIndex: number,
  toIndex: number
): ValidationResult {
  return match.mode.ruleSet.validateCapture(match, fromIndex, toIndex);
}

/**
 * Execute a capture action and return new match state
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

  // Add to captured by faction map
  const newCapturedByFaction = { ...match.capturedByFaction };
  newCapturedByFaction[attacker.factionId] = [
    ...newCapturedByFaction[attacker.factionId],
    deadTarget,
  ];

  // Move attacker to target position
  const newBoard = [...match.board];
  newBoard[toIndex] = attacker;
  newBoard[fromIndex] = null;

  // Reset draw counter if applicable
  let newMovesWithoutCapture = match.movesWithoutCapture;
  if (newMovesWithoutCapture !== null) {
    newMovesWithoutCapture = 60; // Reset to 60 for Three Kingdoms
  }

  // Check if target faction is eliminated
  const targetFactionId = target.factionId;
  const targetFactionPiecesRemaining = newBoard.filter(
    p => p !== null && p.factionId === targetFactionId
  ).length;
  
  let newActiveFactions = [...match.activeFactions];
  if (targetFactionPiecesRemaining === 0) {
    // Remove target faction from active factions
    newActiveFactions = newActiveFactions.filter(id => id !== targetFactionId);
  }

  // Check win condition
  const tempMatch: Match = {
    ...match,
    board: newBoard,
    capturedByFaction: newCapturedByFaction,
    activeFactions: newActiveFactions,
  };
  const winResult = checkWinCondition(tempMatch);

  let newStatus = match.status;
  let newWinner: string | null = null;
  let newCurrentFactionIndex = match.currentFactionIndex;

  if (winResult.hasEnded && winResult.winner) {
    newStatus = 'ended';
    newWinner = winResult.winner;
  } else {
    // Rotate turn if game continues
    newCurrentFactionIndex = getNextFactionIndex({
      ...match,
      activeFactions: newActiveFactions,
    });
  }

  return {
    ...match,
    status: newStatus,
    currentFactionIndex: newCurrentFactionIndex,
    winner: newWinner,
    board: newBoard,
    capturedByFaction: newCapturedByFaction,
    activeFactions: newActiveFactions,
    movesWithoutCapture: newMovesWithoutCapture,
  };
}

/**
 * Check win condition (delegate to RuleSet)
 */
export function checkWinCondition(match: Match): WinResult {
  // Check draw condition first (Three Kingdoms only)
  if (match.mode.ruleSet.checkDrawCondition(match)) {
    return { hasEnded: true, winner: undefined, reason: 'stalemate' };
  }

  // Delegate to RuleSet
  return match.mode.ruleSet.checkWinCondition(match);
}

/**
 * Get all legal moves for current faction (delegate to RuleSet)
 */
export function getLegalMoves(match: Match): LegalMoveSet {
  return match.mode.ruleSet.getLegalMoves(match);
}

/**
 * Helper: Get next faction index in turn rotation
 * Automatically skips eliminated factions
 */
function getNextFactionIndex(match: Match): number {
  if (match.activeFactions.length === 0) {
    return 0;
  }
  return (match.currentFactionIndex + 1) % match.activeFactions.length;
}
