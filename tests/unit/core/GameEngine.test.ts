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

describe('GameEngine', () => {
  let match: Match;

  beforeEach(() => {
    match = createInitialMatch();
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
        winner: 'red',
      };

      const result = validateFlip(endedMatch, 0);
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Match already ended');
    });
  });

  describe('executeFlip - First flip side assignment (T016)', () => {
    it('should flip a piece and assign sides on first flip', () => {
      const piece = match.board[0]!;
      const originalColor = piece.color;

      const newMatch = executeFlip(match, 0);

      // Piece should be revealed
      expect(newMatch.board[0]?.isRevealed).toBe(true);

      // Status should change from waiting-first-flip to in-progress
      expect(match.status).toBe('waiting-first-flip');
      expect(newMatch.status).toBe('in-progress');

      // Current turn should be set to the flipped piece's color
      expect(match.currentTurn).toBe(null);
      expect(newMatch.currentTurn).toBe(originalColor);
    });

    it('should toggle turn on subsequent flips', () => {
      // First flip
      const firstFlip = executeFlip(match, 0);
      const firstTurn = firstFlip.currentTurn!;

      // Second flip
      const secondFlip = executeFlip(firstFlip, 1);

      // Turn should toggle
      expect(secondFlip.currentTurn).toBe(firstTurn === 'red' ? 'black' : 'red');
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
      const result = validateMove(inProgressMatch, 0, 8); // Not adjacent (different row)
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Destination not adjacent');
    });

    it('should reject move to occupied cell', () => {
      // Place a piece at index 1
      inProgressMatch.board[1] = {
        id: 'piece-1',
        type: 'pawn',
        color: 'black',
        isRevealed: true,
        isDead: false,
      };

      const result = validateMove(inProgressMatch, 0, 1);
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Destination not empty');
    });

    it('should reject move of opponent piece (turn ownership)', () => {
      // Place an opponent piece at index 8
      const opponentColor: Piece['color'] = inProgressMatch.currentTurn === 'red' ? 'black' : 'red';
      inProgressMatch.board[8] = {
        id: 'opponent-piece',
        type: 'pawn',
        color: opponentColor,
        isRevealed: true,
        isDead: false,
      };

      const result = validateMove(inProgressMatch, 8, 9);
      expect(result.isValid).toBe(false);
      expect(result.error).toBe("Not current player's turn");
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
        type: 'rook',
        color: 'red',
        isRevealed: true,
        isDead: false,
      };

      // Place a Pawn (rank 1) at index 1 (adjacent)
      inProgressMatch.board[1] = {
        id: 'black-pawn-1',
        type: 'pawn',
        color: 'black',
        isRevealed: true,
        isDead: false,
      };

      inProgressMatch.currentTurn = 'red';

      const result = validateCapture(inProgressMatch, 0, 1);
      expect(result.isValid).toBe(true);
    });

    it('should reject capture when attacker rank < target rank', () => {
      // Place a Pawn (rank 1) at index 0
      inProgressMatch.board[0] = {
        id: 'red-pawn-1',
        type: 'pawn',
        color: 'red',
        isRevealed: true,
        isDead: false,
      };

      // Place a Rook (rank 4) at index 1 (adjacent)
      inProgressMatch.board[1] = {
        id: 'black-rook-1',
        type: 'rook',
        color: 'black',
        isRevealed: true,
        isDead: false,
      };

      inProgressMatch.currentTurn = 'red';

      const result = validateCapture(inProgressMatch, 0, 1);
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Invalid capture: rank too low');
    });
  });

  describe('validateCapture - King vs Pawn special rule (T028)', () => {
    let inProgressMatch: Match;

    beforeEach(() => {
      inProgressMatch = executeFlip(match, 0);
      inProgressMatch.currentTurn = 'red';
    });

    it('should reject King capturing Pawn', () => {
      // Place King at index 0
      inProgressMatch.board[0] = {
        id: 'red-king-1',
        type: 'king',
        color: 'red',
        isRevealed: true,
        isDead: false,
      };

      // Place Pawn at index 1 (adjacent)
      inProgressMatch.board[1] = {
        id: 'black-pawn-1',
        type: 'pawn',
        color: 'black',
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
        type: 'pawn',
        color: 'red',
        isRevealed: true,
        isDead: false,
      };

      // Place King at index 1 (adjacent)
      inProgressMatch.board[1] = {
        id: 'black-king-1',
        type: 'king',
        color: 'black',
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
      inProgressMatch.currentTurn = 'red';
    });

    it('should reject Cannon capturing adjacent piece (0 screens)', () => {
      // Place Cannon at index 0
      inProgressMatch.board[0] = {
        id: 'red-cannon-1',
        type: 'cannon',
        color: 'red',
        isRevealed: true,
        isDead: false,
      };

      // Place enemy at index 1 (adjacent, no screen)
      inProgressMatch.board[1] = {
        id: 'black-pawn-1',
        type: 'pawn',
        color: 'black',
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
        type: 'cannon',
        color: 'red',
        isRevealed: true,
        isDead: false,
      };

      // Place screen at index 1
      inProgressMatch.board[1] = {
        id: 'red-pawn-1',
        type: 'pawn',
        color: 'red',
        isRevealed: true,
        isDead: false,
      };

      // Place enemy at index 2 (with one screen)
      inProgressMatch.board[2] = {
        id: 'black-pawn-1',
        type: 'pawn',
        color: 'black',
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
        type: 'cannon',
        color: 'red',
        isRevealed: true,
        isDead: false,
      };

      // Place screen 1 at index 1
      inProgressMatch.board[1] = {
        id: 'red-pawn-1',
        type: 'pawn',
        color: 'red',
        isRevealed: true,
        isDead: false,
      };

      // Place screen 2 at index 2
      inProgressMatch.board[2] = {
        id: 'red-pawn-2',
        type: 'pawn',
        color: 'red',
        isRevealed: true,
        isDead: false,
      };

      // Place enemy at index 3 (with 2 screens)
      inProgressMatch.board[3] = {
        id: 'black-pawn-1',
        type: 'pawn',
        color: 'black',
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
        currentTurn: 'red',
        redCaptured: new Array(16).fill(null).map((_, i) => ({
          id: `black-${i}`,
          type: 'pawn',
          color: 'black' as const,
          isRevealed: true,
          isDead: true,
        })),
        blackCaptured: [],
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
        currentTurn: 'black',
        redCaptured: [],
        blackCaptured: new Array(16).fill(null).map((_, i) => ({
          id: `red-${i}`,
          type: 'pawn',
          color: 'red' as const,
          isRevealed: true,
          isDead: true,
        })),
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
        currentTurn: 'red',
        redCaptured: new Array(10).fill(null).map((_, i) => ({
          id: `black-${i}`,
          type: 'pawn',
          color: 'black' as const,
          isRevealed: true,
          isDead: true,
        })),
        blackCaptured: [],
      };

      const result = checkWinCondition(ongoingMatch);
      expect(result.hasEnded).toBe(false);
    });
  });

  describe('getLegalMoves (T040)', () => {
    let inProgressMatch: Match;

    beforeEach(() => {
      inProgressMatch = executeFlip(match, 0);
      inProgressMatch.currentTurn = 'red';
    });

    it('should find all face-down pieces as flips', () => {
      const legalMoves = getLegalMoves(inProgressMatch);

      // First piece is revealed, remaining 31 are face-down
      expect(legalMoves.flips.length).toBe(31);
    });

    it('should find valid moves for revealed pieces', () => {
      // Ensure piece at 0 can move to adjacent empty cell
      inProgressMatch.board[1] = null;

      const legalMoves = getLegalMoves(inProgressMatch);

      // Should have at least one move
      expect(legalMoves.moves.length).toBeGreaterThan(0);
    });

    it('should find valid captures for revealed pieces', () => {
      // Place red piece at 0, black piece at 1
      inProgressMatch.board[0] = {
        id: 'red-rook-1',
        type: 'rook',
        color: 'red',
        isRevealed: true,
        isDead: false,
      };

      inProgressMatch.board[1] = {
        id: 'black-pawn-1',
        type: 'pawn',
        color: 'black',
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
        currentTurn: 'red',
        board: new Array(32).fill(null),
        redCaptured: [],
        blackCaptured: [],
      };

      // Place red pawn at corner (index 0)
      stalemateMatch.board[0] = {
        id: 'red-pawn-1',
        type: 'pawn',
        color: 'red',
        isRevealed: true,
        isDead: false,
      };

      // Surround with black pieces (adjacent at indices 1 and 8)
      stalemateMatch.board[1] = {
        id: 'black-king-1',
        type: 'king',
        color: 'black',
        isRevealed: true,
        isDead: false,
      };

      stalemateMatch.board[8] = {
        id: 'black-king-2',
        type: 'king',
        color: 'black',
        isRevealed: true,
        isDead: false,
      };

      // Red pawn cannot capture kings (rank too low) and has no empty adjacent cells
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
        currentTurn: 'red',
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
        winner: 'red',
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
});
