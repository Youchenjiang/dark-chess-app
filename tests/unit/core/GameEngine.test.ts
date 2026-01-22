/**
 * Unit tests for GameEngine.ts (T016, T017)
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
import { Match, Piece } from '../../../src/core/types';
import { GAME_MODES, RED_FACTION, BLACK_FACTION } from '../../../src/core/GameModes';

/**
 * Test helper: Create a Classic mode match for testing
 */
function createTestMatch(): Match {
  return createInitialMatch(GAME_MODES.classic);
}

/**
 * Test helper: Get the current faction ID from match
 */
function getCurrentFactionId(match: Match): string {
  return match.activeFactions[match.currentFactionIndex];
}

describe('GameEngine', () => {
  let match: Match;

  beforeEach(() => {
    match = createTestMatch();
  });

  describe('validateFlip (T016, T017)', () => {
    it('should validate flip for face-down piece', () => {
      const result = validateFlip(match, 0);
      expect(result.isValid).toBe(true);
    });

    it('should reject flip for invalid index (out of bounds)', () => {
      const result1 = validateFlip(match, 32);
      expect(result1.isValid).toBe(false);
      expect(result1.error).toBe('Invalid piece index');

      const result2 = validateFlip(match, -1);
      expect(result2.isValid).toBe(false);
      expect(result2.error).toBe('Invalid piece index');
    });

    it('should reject flip for already revealed piece', () => {
      // Flip a piece first
      const flippedMatch = executeFlip(match, 0);

      // Try to flip the same piece again
      const result = validateFlip(flippedMatch, 0);
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Piece already revealed');
    });

    it('should reject flip for empty cell (null)', () => {
      // Create a match with an empty cell
      const modifiedMatch: Match = {
        ...match,
        board: [...match.board],
      };
      modifiedMatch.board[0] = null;

      const result = validateFlip(modifiedMatch, 0);
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('No piece at index');
    });

    it('should reject flip when match has ended', () => {
      const endedMatch: Match = {
        ...match,
        status: 'ended',
        winner: 'red', // Faction ID
      };

      const result = validateFlip(endedMatch, 0);
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Match already ended');
    });
  });

  describe('executeFlip - First flip side assignment (T016)', () => {
    it('should flip a piece and assign sides on first flip', () => {
      const piece = match.board[0]!;
      const originalFactionId = piece.factionId;

      const newMatch = executeFlip(match, 0);

      // Piece should be revealed
      expect(newMatch.board[0]?.isRevealed).toBe(true);

      // Status should change from waiting-first-flip to in-progress
      expect(match.status).toBe('waiting-first-flip');
      expect(newMatch.status).toBe('in-progress');

      // Current turn should be set to the flipped piece's faction
      expect(match.currentFactionIndex).toBe(0);
      expect(getCurrentFactionId(newMatch)).toBe(originalFactionId);
    });

    it('should toggle turn on subsequent flips', () => {
      // First flip
      const firstFlip = executeFlip(match, 0);
      const firstFactionIndex = firstFlip.currentFactionIndex;

      // Second flip
      const secondFlip = executeFlip(firstFlip, 1);

      // Turn should toggle (in Classic: 0 -> 1, or 1 -> 0)
      expect(secondFlip.currentFactionIndex).not.toBe(firstFactionIndex);
    });

    it('should preserve immutability (return new match object)', () => {
      const originalMatch = match;
      const newMatch = executeFlip(match, 0);

      // Should be different objects
      expect(newMatch).not.toBe(originalMatch);
      expect(newMatch.board).not.toBe(originalMatch.board);

      // Original should be unchanged
      expect(originalMatch.board[0]?.isRevealed).toBe(false);
      expect(originalMatch.status).toBe('waiting-first-flip');
    });

    it('should throw error when trying to flip invalid piece', () => {
      expect(() => executeFlip(match, 32)).toThrow();
    });
  });

  describe('validateMove (T026)', () => {
    let inProgressMatch: Match;

    beforeEach(() => {
      // Create match in progress with revealed pieces
      inProgressMatch = executeFlip(match, 0);
      // Place a revealed piece at index 0 and leave index 1 empty
      const piece = inProgressMatch.board[0]!;
      inProgressMatch.board[1] = null; // Ensure adjacent cell is empty
    });

    it('should reject move when match not in progress', () => {
      const result = validateMove(match, 0, 1);
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Match not in progress');
    });

    it('should validate move to adjacent empty cell', () => {
      // Assume piece at 0 can move to 1 (adjacent horizontally)
      const result = validateMove(inProgressMatch, 0, 1);
      expect(result.isValid).toBe(true);
    });

    it('should reject move to non-adjacent cell', () => {
      // Ensure index 8 is empty first
      inProgressMatch.board[8] = null;
      
      const result = validateMove(inProgressMatch, 0, 8); // Not adjacent (different row)
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Destination not adjacent');
    });

    it('should reject move to occupied cell', () => {
      // Place a piece at index 1
      inProgressMatch.board[1] = {
        id: 'piece-1',
        type: 'Pawn',
        factionId: 'black',
        isRevealed: true,
        isDead: false,
      };

      const result = validateMove(inProgressMatch, 0, 1);
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Destination not empty');
    });

    it('should reject move of opponent piece (turn ownership)', () => {
      // Place an opponent piece at index 8
      const currentFactionId = getCurrentFactionId(inProgressMatch);
      const opponentFactionId = currentFactionId === 'red' ? 'black' : 'red';
      inProgressMatch.board[8] = {
        id: 'opponent-piece',
        type: 'Pawn',
        factionId: opponentFactionId,
        isRevealed: true,
        isDead: false,
      };

      const result = validateMove(inProgressMatch, 8, 9);
      expect(result.isValid).toBe(false);
      expect(result.error).toBe("Not current faction's turn");
    });
  });

  describe('validateCapture - Standard rank capture (T027)', () => {
    let inProgressMatch: Match;

    beforeEach(() => {
      inProgressMatch = executeFlip(match, 0);
    });

    it('should allow capture when attacker rank >= target rank', () => {
      // Place a Rook (rank 4) at index 0
      inProgressMatch.board[0] = {
        id: 'red-rook-1',
        type: 'Rook',
        factionId: 'red',
        isRevealed: true,
        isDead: false,
      };

      // Place a Pawn (rank 1) at index 1 (adjacent)
      inProgressMatch.board[1] = {
        id: 'black-pawn-1',
        type: 'Pawn',
        factionId: 'black',
        isRevealed: true,
        isDead: false,
      };

      // Set current turn to red
      inProgressMatch.currentFactionIndex = 0; // red is at index 0

      const result = validateCapture(inProgressMatch, 0, 1);
      expect(result.isValid).toBe(true);
    });

    it('should reject capture when attacker rank < target rank', () => {
      // Place a Pawn (rank 1) at index 0
      inProgressMatch.board[0] = {
        id: 'red-pawn-1',
        type: 'Pawn',
        factionId: 'red',
        isRevealed: true,
        isDead: false,
      };

      // Place a Rook (rank 4) at index 1 (adjacent)
      inProgressMatch.board[1] = {
        id: 'black-rook-1',
        type: 'Rook',
        factionId: 'black',
        isRevealed: true,
        isDead: false,
      };

      // Set current turn to red
      inProgressMatch.currentFactionIndex = 0; // red is at index 0

      const result = validateCapture(inProgressMatch, 0, 1);
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Invalid capture: rank too low');
    });
  });

  describe('validateCapture - King vs Pawn special rule (T028)', () => {
    let inProgressMatch: Match;

    beforeEach(() => {
      inProgressMatch = executeFlip(match, 0);
      inProgressMatch.currentFactionIndex = 0; // Set to red
    });

    it('should reject King capturing Pawn', () => {
      // Place King at index 0
      inProgressMatch.board[0] = {
        id: 'red-king-1',
        type: 'King',
        factionId: 'red',
        isRevealed: true,
        isDead: false,
      };

      // Place Pawn at index 1 (adjacent)
      inProgressMatch.board[1] = {
        id: 'black-pawn-1',
        type: 'Pawn',
        factionId: 'black',
        isRevealed: true,
        isDead: false,
      };

      const result = validateCapture(inProgressMatch, 0, 1);
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('King cannot capture Pawn');
    });

    it('should allow Pawn capturing King', () => {
      // Place Pawn at index 0
      inProgressMatch.board[0] = {
        id: 'red-pawn-1',
        type: 'Pawn',
        factionId: 'red',
        isRevealed: true,
        isDead: false,
      };

      // Place King at index 1 (adjacent)
      inProgressMatch.board[1] = {
        id: 'black-king-1',
        type: 'King',
        factionId: 'black',
        isRevealed: true,
        isDead: false,
      };

      const result = validateCapture(inProgressMatch, 0, 1);
      expect(result.isValid).toBe(true);
    });
  });

  describe('validateCapture - Cannon capture screen rule (T029)', () => {
    let inProgressMatch: Match;

    beforeEach(() => {
      inProgressMatch = executeFlip(match, 0);
      inProgressMatch.currentFactionIndex = 0; // Set to red
    });

    it('should reject Cannon capturing adjacent piece (0 screens)', () => {
      // Place Cannon at index 0
      inProgressMatch.board[0] = {
        id: 'red-cannon-1',
        type: 'Cannon',
        factionId: 'red',
        isRevealed: true,
        isDead: false,
      };

      // Place enemy at index 1 (adjacent, no screen)
      inProgressMatch.board[1] = {
        id: 'black-pawn-1',
        type: 'Pawn',
        factionId: 'black',
        isRevealed: true,
        isDead: false,
      };

      const result = validateCapture(inProgressMatch, 0, 1);
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Cannon cannot capture adjacent piece');
    });

    it('should allow Cannon capturing with exactly one screen', () => {
      // Place Cannon at index 0
      inProgressMatch.board[0] = {
        id: 'red-cannon-1',
        type: 'Cannon',
        factionId: 'red',
        isRevealed: true,
        isDead: false,
      };

      // Place screen at index 1
      inProgressMatch.board[1] = {
        id: 'red-pawn-1',
        type: 'Pawn',
        factionId: 'red',
        isRevealed: true,
        isDead: false,
      };

      // Place enemy at index 2 (with one screen)
      inProgressMatch.board[2] = {
        id: 'black-pawn-1',
        type: 'Pawn',
        factionId: 'black',
        isRevealed: true,
        isDead: false,
      };

      // Note: This test uses getLegalMoves to validate Cannon capture
      // since validateCapture rejects adjacent captures by design
      const legalMoves = getLegalMoves(inProgressMatch);
      const cannonCapture = legalMoves.captures.find((c) => c.fromIndex === 0 && c.toIndex === 2);

      expect(cannonCapture).toBeDefined();
    });

    it('should reject Cannon capturing with 2+ screens', () => {
      // Place Cannon at index 0
      inProgressMatch.board[0] = {
        id: 'red-cannon-1',
        type: 'Cannon',
        factionId: 'red',
        isRevealed: true,
        isDead: false,
      };

      // Place screen 1 at index 1
      inProgressMatch.board[1] = {
        id: 'red-pawn-1',
        type: 'Pawn',
        factionId: 'red',
        isRevealed: true,
        isDead: false,
      };

      // Place screen 2 at index 2
      inProgressMatch.board[2] = {
        id: 'red-pawn-2',
        type: 'Pawn',
        factionId: 'red',
        isRevealed: true,
        isDead: false,
      };

      // Place enemy at index 3 (with 2 screens)
      inProgressMatch.board[3] = {
        id: 'black-pawn-1',
        type: 'Pawn',
        factionId: 'black',
        isRevealed: true,
        isDead: false,
      };

      const legalMoves = getLegalMoves(inProgressMatch);
      const cannonCapture = legalMoves.captures.find((c) => c.fromIndex === 0 && c.toIndex === 3);

      expect(cannonCapture).toBeUndefined();
    });
  });

  describe('checkWinCondition - Win by capture-all (T039)', () => {
    it('should detect red win when 16 black pieces captured', () => {
      const captureAllMatch: Match = {
        ...match,
        status: 'in-progress',
        currentFactionIndex: 0, // red's turn
        capturedByFaction: {
          red: new Array(16).fill(null).map((_, i) => ({
            id: `black-${i}`,
            type: 'Pawn',
            factionId: 'black',
            isRevealed: true,
            isDead: true,
          })),
          black: [],
        },
      };

      const result = checkWinCondition(captureAllMatch);
      expect(result.hasEnded).toBe(true);
      expect(result.winner).toBe('red');
      expect(result.reason).toBe('capture-all');
    });

    it('should detect black win when 16 red pieces captured', () => {
      const captureAllMatch: Match = {
        ...match,
        status: 'in-progress',
        currentFactionIndex: 1, // black's turn
        capturedByFaction: {
          red: [],
          black: new Array(16).fill(null).map((_, i) => ({
            id: `red-${i}`,
            type: 'Pawn',
            factionId: 'red',
            isRevealed: true,
            isDead: true,
          })),
        },
      };

      const result = checkWinCondition(captureAllMatch);
      expect(result.hasEnded).toBe(true);
      expect(result.winner).toBe('black');
      expect(result.reason).toBe('capture-all');
    });

    it('should not end game if less than 16 pieces captured', () => {
      const ongoingMatch: Match = {
        ...match,
        status: 'in-progress',
        currentFactionIndex: 0, // red's turn
        capturedByFaction: {
          red: new Array(10).fill(null).map((_, i) => ({
            id: `black-${i}`,
            type: 'Pawn',
            factionId: 'black',
            isRevealed: true,
            isDead: true,
          })),
          black: [],
        },
      };

      const result = checkWinCondition(ongoingMatch);
      expect(result.hasEnded).toBe(false);
    });
  });

  describe('getLegalMoves (T040)', () => {
    let inProgressMatch: Match;

    beforeEach(() => {
      inProgressMatch = executeFlip(match, 0);
      inProgressMatch.currentFactionIndex = 0; // Set to red
    });

    it('should find all face-down pieces as flips', () => {
      const legalMoves = getLegalMoves(inProgressMatch);

      // First piece is revealed, remaining 31 are face-down
      expect(legalMoves.flips.length).toBe(31);
    });

    it('should find valid moves for revealed pieces', () => {
      // Place a red piece at 0 and ensure adjacent cell 1 is empty
      inProgressMatch.board[0] = {
        id: 'red-pawn-1',
        type: 'Pawn',
        factionId: 'red',
        isRevealed: true,
        isDead: false,
      };
      inProgressMatch.board[1] = null;
      inProgressMatch.currentFactionIndex = 0; // red's turn

      const legalMoves = getLegalMoves(inProgressMatch);

      // Should have at least one move (0 -> 1)
      expect(legalMoves.moves.length).toBeGreaterThan(0);
    });

    it('should find valid captures for revealed pieces', () => {
      // Place red piece at 0, black piece at 1
      inProgressMatch.board[0] = {
        id: 'red-rook-1',
        type: 'Rook',
        factionId: 'red',
        isRevealed: true,
        isDead: false,
      };

      inProgressMatch.board[1] = {
        id: 'black-pawn-1',
        type: 'Pawn',
        factionId: 'black',
        isRevealed: true,
        isDead: false,
      };

      const legalMoves = getLegalMoves(inProgressMatch);

      // Should find capture
      const capture = legalMoves.captures.find((c) => c.fromIndex === 0 && c.toIndex === 1);
      expect(capture).toBeDefined();
    });

    it('should return empty sets for ended match', () => {
      const endedMatch: Match = {
        ...inProgressMatch,
        status: 'ended',
        winner: 'red',
      };

      const legalMoves = getLegalMoves(endedMatch);

      expect(legalMoves.flips).toEqual([]);
      expect(legalMoves.moves).toEqual([]);
      expect(legalMoves.captures).toEqual([]);
    });
  });

  describe('checkWinCondition - Stalemate (T041)', () => {
    it('should detect stalemate when current player has no legal moves', () => {
      // Create a board with only one red piece trapped
      const stalemateMatch: Match = {
        ...match,
        status: 'in-progress',
        currentFactionIndex: 0, // red's turn
        board: new Array(32).fill(null),
        capturedByFaction: { red: [], black: [] },
      };

      // Place red pawn at corner (index 0)
      stalemateMatch.board[0] = {
        id: 'red-pawn-1',
        type: 'Pawn',
        factionId: 'red',
        isRevealed: true,
        isDead: false,
      };

      // Surround with black higher-rank pieces (adjacent at indices 1 and 4)
      // In 8x4 layout: index 0 = (row 0, col 0), index 1 = (0,1), index 4 = (1,0)
      // Note: Cannot use King because Pawn can capture King (special rule)
      stalemateMatch.board[1] = {
        id: 'black-rook-1',
        type: 'Rook',
        factionId: 'black',
        isRevealed: true,
        isDead: false,
      };

      stalemateMatch.board[4] = {
        id: 'black-rook-2',
        type: 'Rook',
        factionId: 'black',
        isRevealed: true,
        isDead: false,
      };

      // Red pawn cannot capture rooks (rank too low) and has no empty adjacent cells
      // No face-down pieces to flip
      
      const result = checkWinCondition(stalemateMatch);

      expect(result.hasEnded).toBe(true);
      expect(result.winner).toBe('black'); // Opponent wins
      expect(result.reason).toBe('stalemate');
    });

    it('should not detect stalemate when player has legal flips', () => {
      const ongoingMatch: Match = {
        ...match,
        status: 'in-progress',
        currentFactionIndex: 0, // red's turn
      };

      // Board has face-down pieces (legal flips)
      const result = checkWinCondition(ongoingMatch);

      expect(result.hasEnded).toBe(false);
    });
  });

  describe('Ended matches reject actions (T042)', () => {
    let endedMatch: Match;

    beforeEach(() => {
      endedMatch = {
        ...match,
        status: 'ended',
        winner: 'red', // Faction ID
      };
    });

    it('should reject flip when match ended', () => {
      const result = validateFlip(endedMatch, 0);
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Match already ended');
    });

    it('should reject move when match ended', () => {
      const result = validateMove(endedMatch, 0, 1);
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Match not in progress');
    });

    it('should reject capture when match ended', () => {
      const result = validateCapture(endedMatch, 0, 1);
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Match not in progress');
    });
  });

  describe('Illegal actions immutability (T030)', () => {
    it('should not mutate state on invalid flip', () => {
      const originalMatch = { ...match };
      const originalBoard = [...match.board];

      try {
        executeFlip(match, 32); // Invalid index
      } catch (error) {
        // Error expected
      }

      expect(match).toEqual(originalMatch);
      expect(match.board).toEqual(originalBoard);
    });

    it('should not mutate state on invalid move', () => {
      const inProgressMatch = executeFlip(match, 0);
      const originalMatch = { ...inProgressMatch };
      const originalBoard = [...inProgressMatch.board];

      try {
        executeMove(inProgressMatch, 0, 32); // Invalid index
      } catch (error) {
        // Error expected
      }

      expect(inProgressMatch).toEqual(originalMatch);
      expect(inProgressMatch.board).toEqual(originalBoard);
    });

    it('should not mutate state on invalid capture', () => {
      const inProgressMatch = executeFlip(match, 0);
      const originalMatch = { ...inProgressMatch };
      const originalBoard = [...inProgressMatch.board];

      try {
        executeCapture(inProgressMatch, 0, 32); // Invalid index
      } catch (error) {
        // Error expected
      }

      expect(inProgressMatch).toEqual(originalMatch);
      expect(inProgressMatch.board).toEqual(originalBoard);
    });
  });

  describe('Dynamic Faction Assignment (Three Kingdoms Mode - T026)', () => {
    let tkMatch: Match;

    beforeEach(() => {
      tkMatch = createInitialMatch(GAME_MODES.threeKingdoms);
    });

    it('should initialize with all players unassigned (null)', () => {
      expect(tkMatch.playerFactionMap[0]).toBeNull();
      expect(tkMatch.playerFactionMap[1]).toBeNull();
      expect(tkMatch.playerFactionMap[2]).toBeNull();
      expect(tkMatch.currentPlayerIndex).toBe(0);
      expect(tkMatch.status).toBe('waiting-first-flip');
    });

    it('should assign Player 0 to flipped faction on first flip', () => {
      // Find a piece and flip it
      const firstPieceIndex = tkMatch.board.findIndex((p) => p !== null)!;
      const flippedPiece = tkMatch.board[firstPieceIndex]!;

      const newMatch = executeFlip(tkMatch, firstPieceIndex);

      // Player 0 should be assigned to the flipped piece's faction
      expect(newMatch.playerFactionMap[0]).toBe(flippedPiece.factionId);
      // Other players still unassigned
      expect(newMatch.playerFactionMap[1]).toBeNull();
      expect(newMatch.playerFactionMap[2]).toBeNull();
      // Turn moves to Player 1
      expect(newMatch.currentPlayerIndex).toBe(1);
      // Still in assignment phase (not all players assigned)
      expect(newMatch.status).toBe('waiting-first-flip');
    });

    it('should NOT assign player if flipped faction already taken', () => {
      // Player 0 flips a piece
      const firstPieceIndex = tkMatch.board.findIndex((p) => p !== null)!;
      const firstPiece = tkMatch.board[firstPieceIndex]!;
      let currentMatch = executeFlip(tkMatch, firstPieceIndex);

      // Player 0 is now assigned to firstPiece.factionId
      expect(currentMatch.playerFactionMap[0]).toBe(firstPiece.factionId);

      // Player 1 tries to flip a piece of the SAME faction
      const sameFactory = currentMatch.board.findIndex(
        (p) => p !== null && !p.isRevealed && p.factionId === firstPiece.factionId
      );

      if (sameFactory !== -1) {
        currentMatch = executeFlip(currentMatch, sameFactory);

        // Player 1 should NOT be assigned (faction already taken by Player 0)
        expect(currentMatch.playerFactionMap[1]).toBeNull();
        // Turn should still move to Player 2
        expect(currentMatch.currentPlayerIndex).toBe(2);
      }
    });

    it('should transition to in-progress when all 3 players assigned', () => {
      // We need to manually create a scenario where all 3 players get different factions
      // This is tricky with random board, so let's simulate step by step

      // Player 0 flips first piece (team-a)
      const teamAPieceIdx = tkMatch.board.findIndex((p) => p !== null && p.factionId === 'team-a')!;
      let currentMatch = executeFlip(tkMatch, teamAPieceIdx);
      expect(currentMatch.playerFactionMap[0]).toBe('team-a');
      expect(currentMatch.status).toBe('waiting-first-flip');

      // Player 1 flips second piece (team-b)
      const teamBPieceIdx = currentMatch.board.findIndex(
        (p) => p !== null && !p.isRevealed && p.factionId === 'team-b'
      );
      if (teamBPieceIdx !== -1) {
        currentMatch = executeFlip(currentMatch, teamBPieceIdx);
        expect(currentMatch.playerFactionMap[1]).toBe('team-b');
        expect(currentMatch.status).toBe('waiting-first-flip');

        // Player 2 flips third piece (team-c)
        const teamCPieceIdx = currentMatch.board.findIndex(
          (p) => p !== null && !p.isRevealed && p.factionId === 'team-c'
        );
        if (teamCPieceIdx !== -1) {
          currentMatch = executeFlip(currentMatch, teamCPieceIdx);
          expect(currentMatch.playerFactionMap[2]).toBe('team-c');
          
          // Now all 3 players are assigned → game transitions to 'in-progress'
          expect(currentMatch.status).toBe('in-progress');
          // Current faction should be the faction of Player 0
          expect(currentMatch.currentFactionIndex).toBe(
            currentMatch.activeFactions.indexOf('team-a')
          );
        }
      }
    });

    it('should rotate player index correctly during assignment phase', () => {
      // Player 0 flips
      const firstIdx = tkMatch.board.findIndex((p) => p !== null)!;
      let currentMatch = executeFlip(tkMatch, firstIdx);
      expect(currentMatch.currentPlayerIndex).toBe(1);

      // Player 1 flips (may or may not get assigned, doesn't matter for rotation)
      const secondIdx = currentMatch.board.findIndex((p) => p !== null && !p.isRevealed)!;
      currentMatch = executeFlip(currentMatch, secondIdx);
      expect(currentMatch.currentPlayerIndex).toBe(2);

      // Player 2 flips
      const thirdIdx = currentMatch.board.findIndex((p) => p !== null && !p.isRevealed)!;
      currentMatch = executeFlip(currentMatch, thirdIdx);

      // If not all assigned yet, should rotate back to Player 0
      if (currentMatch.status === 'waiting-first-flip') {
        expect(currentMatch.currentPlayerIndex).toBe(0);
      }
    });

    it('should NOT change faction if player is already assigned (FACTION LOCKING)', () => {
      // Player 0 flips a team-a piece
      const teamAPieceIdx = tkMatch.board.findIndex((p) => p !== null && p.factionId === 'team-a')!;
      let currentMatch = executeFlip(tkMatch, teamAPieceIdx);
      
      // Player 0 is now assigned to team-a
      expect(currentMatch.playerFactionMap[0]).toBe('team-a');
      expect(currentMatch.currentPlayerIndex).toBe(1);

      // Player 1 flips a team-b piece
      const teamBPieceIdx = currentMatch.board.findIndex(
        (p) => p !== null && !p.isRevealed && p.factionId === 'team-b'
      )!;
      currentMatch = executeFlip(currentMatch, teamBPieceIdx);
      
      // Player 1 is now assigned to team-b
      expect(currentMatch.playerFactionMap[1]).toBe('team-b');
      expect(currentMatch.currentPlayerIndex).toBe(2);

      // Player 2 flips a team-c piece
      const teamCPieceIdx = currentMatch.board.findIndex(
        (p) => p !== null && !p.isRevealed && p.factionId === 'team-c'
      )!;
      currentMatch = executeFlip(currentMatch, teamCPieceIdx);
      
      // Player 2 is now assigned to team-c
      expect(currentMatch.playerFactionMap[2]).toBe('team-c');
      
      // Game should transition to in-progress
      expect(currentMatch.status).toBe('in-progress');
      
      // Now back to Player 0's turn (via rotation logic)
      // Player 0 is currently assigned to team-a
      // Player 0 tries to flip a team-b piece (different faction)
      // This should NOT change Player 0's faction from team-a to team-b
      
      // We need to simulate the game continuing to a point where Player 0 gets another turn
      // For simplicity, let's manually test the executeFlip logic with a modified match
      const testMatch = {
        ...currentMatch,
        status: 'waiting-first-flip' as const, // Manually set back to assignment phase
        currentPlayerIndex: 0, // Player 0's turn
        playerFactionMap: {
          0: 'team-a', // Player 0 already assigned to team-a
          1: null, // Player 1 not assigned (for this test scenario)
          2: null, // Player 2 not assigned (for this test scenario)
        },
      };
      
      // Player 0 (already assigned to team-a) tries to flip a team-b piece
      const anotherTeamBPiece = testMatch.board.findIndex(
        (p) => p !== null && !p.isRevealed && p.factionId === 'team-b'
      );
      
      if (anotherTeamBPiece !== -1) {
        const resultMatch = executeFlip(testMatch, anotherTeamBPiece);
        
        // Player 0's faction should STILL be team-a (not changed to team-b)
        expect(resultMatch.playerFactionMap[0]).toBe('team-a');
        
        // Turn should move to Player 1
        expect(resultMatch.currentPlayerIndex).toBe(1);
      }
    });
  });
});
