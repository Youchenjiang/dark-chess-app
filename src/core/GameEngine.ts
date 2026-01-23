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
 * For Three Kingdoms: implements dynamic faction assignment (First Flip Rule)
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
  let newCurrentPlayerIndex = match.currentPlayerIndex;
  let newPlayerFactionMap = { ...match.playerFactionMap };
  let newMovesWithoutCapture = match.movesWithoutCapture;

  // Check if this is Three Kingdoms mode
  const isThreeKingdoms = match.mode.id === 'three-kingdoms';

  if (match.status === 'waiting-first-flip') {
    if (isThreeKingdoms) {
      // Three Kingdoms: Dynamic faction assignment via First Flip Rule
      const flippedFactionId = piece.factionId;
      const currentPlayer = match.currentPlayerIndex;
      const currentPlayerFaction = match.playerFactionMap[currentPlayer];

      // FACTION LOCKING: If current player is already assigned, DO NOT change their faction
      if (currentPlayerFaction === null) {
        // Player NOT assigned yet - execute First Flip assignment logic
        // Check if this faction is already taken by another player
        const isFactionTaken = Object.entries(match.playerFactionMap).some(
          ([playerIdx, factionId]) =>
            Number(playerIdx) !== currentPlayer && factionId === flippedFactionId
        );

        if (!isFactionTaken) {
          // Assign this faction to the current player
          newPlayerFactionMap[currentPlayer] = flippedFactionId;
        }
        // Note: If faction is taken, player remains unassigned (retry next turn)
      }
      // If player IS assigned, skip assignment logic (faction is locked)

      // AUTO-ASSIGN REMAINING FACTION:
      // Once two distinct factions are taken, the last unassigned player
      // automatically receives the remaining faction. They no longer need
      // to "choose" a faction via flip.
      const unassignedPlayers = Object.entries(newPlayerFactionMap)
        .filter(([, factionId]) => factionId === null)
        .map(([playerIdx]) => Number(playerIdx));

      const assignedFactions = Array.from(
        new Set(
          Object.values(newPlayerFactionMap).filter(
            (factionId): factionId is string => factionId !== null
          )
        )
      );

      if (unassignedPlayers.length === 1 && assignedFactions.length >= 2) {
        const remainingFaction = match.activeFactions.find(
          (factionId) => !assignedFactions.includes(factionId)
        );

        if (remainingFaction) {
          newPlayerFactionMap[unassignedPlayers[0]] = remainingFaction;
        }
      }

      // Move to next player (rotate 0 -> 1 -> 2 -> 0)
      newCurrentPlayerIndex = (match.currentPlayerIndex + 1) % match.mode.playerCount;

      // Check if all players are now assigned
      const allAssigned = Object.values(newPlayerFactionMap).every((f) => f !== null);
      if (allAssigned) {
        // Transition to 'in-progress' and set first faction
        newStatus = 'in-progress';
        // Start with the faction of Player 0
        const firstFactionId = newPlayerFactionMap[0]!;
        newCurrentFactionIndex = match.activeFactions.indexOf(firstFactionId);
      }
    } else {
      // Classic: Dynamic faction assignment via First Flip
      // P1 flips -> P1 gets that faction, P2 gets opposite faction
      const flippedFactionId = piece.factionId;
      const oppositeFactionId = flippedFactionId === 'red' ? 'black' : 'red';
      
      // Assign P1 to flipped faction, P2 to opposite
      newPlayerFactionMap[0] = flippedFactionId;
      newPlayerFactionMap[1] = oppositeFactionId;
      
      // Start game with P1's faction
      newStatus = 'in-progress';
      newCurrentFactionIndex = match.activeFactions.indexOf(flippedFactionId);
      newCurrentPlayerIndex = 0; // P1 starts
      
      if (newCurrentFactionIndex === -1) {
        newCurrentFactionIndex = 0; // Fallback
      }
    }
  } else if (match.status === 'in-progress') {
    // Subsequent flip: rotate turn based on mode
    if (isThreeKingdoms) {
      // Three Kingdoms: rotate player (0 -> 1 -> 2 -> 0)
      newCurrentPlayerIndex = (match.currentPlayerIndex + 1) % match.mode.playerCount;
      // Update faction index based on the new player's assigned faction
      const nextPlayerFaction = newPlayerFactionMap[newCurrentPlayerIndex];
      if (nextPlayerFaction) {
        newCurrentFactionIndex = match.activeFactions.indexOf(nextPlayerFaction);
      }
    } else {
      // Classic: rotate faction directly
      newCurrentFactionIndex = getNextFactionIndex(match);
    }
    // Decrement draw counter if applicable
    if (newMovesWithoutCapture !== null && newMovesWithoutCapture > 0) {
      newMovesWithoutCapture -= 1;
    }
  }

  return {
    ...match,
    status: newStatus,
    currentFactionIndex: newCurrentFactionIndex,
    currentPlayerIndex: newCurrentPlayerIndex,
    playerFactionMap: newPlayerFactionMap,
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

  // Rotate turn based on mode
  let newCurrentFactionIndex = match.currentFactionIndex;
  let newCurrentPlayerIndex = match.currentPlayerIndex;
  const isThreeKingdoms = match.mode.id === 'three-kingdoms';

  if (isThreeKingdoms) {
    // Three Kingdoms: rotate player (0 -> 1 -> 2 -> 0)
    newCurrentPlayerIndex = (match.currentPlayerIndex + 1) % match.mode.playerCount;
    // Update faction index based on the new player's assigned faction
    const nextPlayerFaction = match.playerFactionMap[newCurrentPlayerIndex];
    if (nextPlayerFaction) {
      newCurrentFactionIndex = match.activeFactions.indexOf(nextPlayerFaction);
    }
  } else {
    // Classic: rotate faction directly
    newCurrentFactionIndex = getNextFactionIndex(match);
  }

  return {
    ...match,
    currentFactionIndex: newCurrentFactionIndex,
    currentPlayerIndex: newCurrentPlayerIndex,
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
  let newCurrentPlayerIndex = match.currentPlayerIndex;

  if (winResult.hasEnded && winResult.winner) {
    newStatus = 'ended';
    newWinner = winResult.winner;
  } else {
    // Rotate turn if game continues based on mode
    const isThreeKingdoms = match.mode.id === 'three-kingdoms';
    
    if (isThreeKingdoms) {
      // Three Kingdoms: rotate player (0 -> 1 -> 2 -> 0)
      newCurrentPlayerIndex = (match.currentPlayerIndex + 1) % match.mode.playerCount;
      // Update faction index based on the new player's assigned faction
      const nextPlayerFaction = match.playerFactionMap[newCurrentPlayerIndex];
      if (nextPlayerFaction && newActiveFactions.includes(nextPlayerFaction)) {
        newCurrentFactionIndex = newActiveFactions.indexOf(nextPlayerFaction);
      } else {
        // If next player's faction is eliminated, continue rotating until we find an active player
        let attempts = 0;
        while (attempts < match.mode.playerCount) {
          newCurrentPlayerIndex = (newCurrentPlayerIndex + 1) % match.mode.playerCount;
          const playerFaction = match.playerFactionMap[newCurrentPlayerIndex];
          if (playerFaction && newActiveFactions.includes(playerFaction)) {
            newCurrentFactionIndex = newActiveFactions.indexOf(playerFaction);
            break;
          }
          attempts++;
        }
      }
    } else {
      // Classic: rotate faction directly
      newCurrentFactionIndex = getNextFactionIndex({
        ...match,
        activeFactions: newActiveFactions,
      });
    }
  }

  return {
    ...match,
    status: newStatus,
    currentFactionIndex: newCurrentFactionIndex,
    currentPlayerIndex: newCurrentPlayerIndex,
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
