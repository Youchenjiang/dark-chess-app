/**
 * Unit tests for ClassicRules (T021-T024)
 * Target: 100% coverage for extracted Classic logic
 */

import { ClassicRules } from '../../../../src/core/rules/ClassicRules';
import { Match, Piece, GameMode, Faction } from '../../../../src/core/types';

describe('ClassicRules', () => {
  let classicRules: ClassicRules;
  let testMode: GameMode;
  let redFaction: Faction;
  let blackFaction: Faction;

  beforeEach(() => {
    classicRules = new ClassicRules();
    
    // Create test GameMode
    testMode = {
      id: 'classic',
      name: '經典暗棋',
      boardSize: 32,
      gridDimensions: { rows: 8, cols: 4 },
      playerCount: 2,
      ruleSet: classicRules,
    };

    // Create test factions
    redFaction = {
      id: 'red',
      displayName: '紅方',
      color: 'red',
      pieceCount: 16,
      isEliminated: false,
    };

    blackFaction = {
      id: 'black',
      displayName: '黑方',
      color: 'black',
      pieceCount: 16,
      isEliminated: false,
    };
  });

  // Helper: Create a test match
  function createTestMatch(): Match {
    const board: (Piece | null)[] = new Array(32).fill(null);
    return {
      status: 'in-progress',
      mode: testMode,
      factions: [redFaction, blackFaction],
      activeFactions: ['red', 'black'],
      currentFactionIndex: 0, // Red's turn
      winner: null,
      board,
      capturedByFaction: { red: [], black: [] },
      movesWithoutCapture: null,
    };
  }

  // Helper: Create a test piece
  function createPiece(
    id: string,
    type: Piece['type'],
    factionId: string,
    isRevealed: boolean = true
  ): Piece {
    return { id, type, factionId, isRevealed, isDead: false };
  }

  describe('validateMove (T021)', () => {
    it('should validate move to adjacent empty cell', () => {
      const match = createTestMatch();
      match.board[10] = createPiece('red-pawn-1', 'Pawn', 'red');
      match.board[11] = null; // Empty adjacent cell

      const result = classicRules.validateMove(match, 10, 11);
      expect(result.isValid).toBe(true);
    });

    it('should reject move when match not in progress', () => {
      const match = createTestMatch();
      match.status = 'ended';
      match.board[10] = createPiece('red-pawn-1', 'Pawn', 'red');

      const result = classicRules.validateMove(match, 10, 11);
      expect(result).toEqual({ isValid: false, error: 'Match not in progress' });
    });

    it('should reject move from invalid index', () => {
      const match = createTestMatch();
      const result = classicRules.validateMove(match, 32, 0);
      expect(result).toEqual({ isValid: false, error: 'Invalid indices' });
    });

    it('should reject move when no piece at source', () => {
      const match = createTestMatch();
      const result = classicRules.validateMove(match, 10, 11);
      expect(result).toEqual({ isValid: false, error: 'No piece at source index' });
    });

    it('should reject move when piece not revealed', () => {
      const match = createTestMatch();
      match.board[10] = createPiece('red-pawn-1', 'Pawn', 'red', false);

      const result = classicRules.validateMove(match, 10, 11);
      expect(result).toEqual({ isValid: false, error: 'Piece not revealed' });
    });

    it('should reject move when not current faction\'s turn', () => {
      const match = createTestMatch();
      match.currentFactionIndex = 0; // Red's turn
      match.board[10] = createPiece('black-pawn-1', 'Pawn', 'black'); // Black piece

      const result = classicRules.validateMove(match, 10, 11);
      expect(result).toEqual({ isValid: false, error: 'Not current faction\'s turn' });
    });

    it('should reject move to non-adjacent cell', () => {
      const match = createTestMatch();
      match.board[10] = createPiece('red-pawn-1', 'Pawn', 'red');

      const result = classicRules.validateMove(match, 10, 20); // Not adjacent
      expect(result).toEqual({ isValid: false, error: 'Destination not adjacent' });
    });

    it('should reject move to occupied cell', () => {
      const match = createTestMatch();
      match.board[10] = createPiece('red-pawn-1', 'Pawn', 'red');
      match.board[11] = createPiece('red-pawn-2', 'Pawn', 'red');

      const result = classicRules.validateMove(match, 10, 11);
      expect(result).toEqual({ isValid: false, error: 'Destination not empty' });
    });
  });

  describe('validateCapture (T022)', () => {
    it('should validate standard rank capture', () => {
      const match = createTestMatch();
      match.board[10] = createPiece('red-guard', 'Guard', 'red'); // Rank 6
      match.board[11] = createPiece('black-pawn', 'Pawn', 'black'); // Rank 1

      const result = classicRules.validateCapture(match, 10, 11);
      expect(result.isValid).toBe(true);
    });

    it('should reject capture when rank too low', () => {
      const match = createTestMatch();
      match.board[10] = createPiece('red-pawn', 'Pawn', 'red'); // Rank 1
      match.board[11] = createPiece('black-guard', 'Guard', 'black'); // Rank 6

      const result = classicRules.validateCapture(match, 10, 11);
      expect(result).toEqual({ isValid: false, error: 'Invalid capture: rank too low' });
    });

    it('should enforce King cannot capture Pawn', () => {
      const match = createTestMatch();
      match.board[10] = createPiece('red-king', 'King', 'red');
      match.board[11] = createPiece('black-pawn', 'Pawn', 'black');

      const result = classicRules.validateCapture(match, 10, 11);
      expect(result).toEqual({ isValid: false, error: 'King cannot capture Pawn' });
    });

    it('should allow Pawn to capture King', () => {
      const match = createTestMatch();
      match.board[10] = createPiece('red-pawn', 'Pawn', 'red');
      match.board[11] = createPiece('black-king', 'King', 'black');

      const result = classicRules.validateCapture(match, 10, 11);
      expect(result.isValid).toBe(true);
    });

    it('should validate Cannon capture with screen', () => {
      const match = createTestMatch();
      match.board[4] = createPiece('red-cannon', 'Cannon', 'red'); // Row 1, Col 0
      match.board[8] = createPiece('red-pawn', 'Pawn', 'red'); // Row 2, Col 0 (screen)
      match.board[12] = createPiece('black-king', 'King', 'black'); // Row 3, Col 0 (target)

      const result = classicRules.validateCapture(match, 4, 12);
      expect(result.isValid).toBe(true);
    });

    it('should reject Cannon capture without screen', () => {
      const match = createTestMatch();
      match.board[4] = createPiece('red-cannon', 'Cannon', 'red'); // Row 1, Col 0
      match.board[12] = createPiece('black-king', 'King', 'black'); // Row 3, Col 0 (no screen)

      const result = classicRules.validateCapture(match, 4, 12);
      expect(result).toEqual({
        isValid: false,
        error: 'Cannon requires exactly one screen to capture',
      });
    });

    it('should reject Cannon capture of adjacent piece', () => {
      const match = createTestMatch();
      match.board[10] = createPiece('red-cannon', 'Cannon', 'red');
      match.board[11] = createPiece('black-pawn', 'Pawn', 'black');

      const result = classicRules.validateCapture(match, 10, 11);
      expect(result).toEqual({ isValid: false, error: 'Cannon cannot capture adjacent piece' });
    });

    it('should reject Cannon capture not in straight line', () => {
      const match = createTestMatch();
      match.board[5] = createPiece('red-cannon', 'Cannon', 'red');
      match.board[10] = createPiece('black-pawn', 'Pawn', 'black'); // Diagonal

      const result = classicRules.validateCapture(match, 5, 10);
      expect(result).toEqual({ isValid: false, error: 'Cannon target not in straight line' });
    });

    it('should reject capture of own piece', () => {
      const match = createTestMatch();
      match.board[10] = createPiece('red-guard', 'Guard', 'red');
      match.board[11] = createPiece('red-pawn', 'Pawn', 'red');

      const result = classicRules.validateCapture(match, 10, 11);
      expect(result).toEqual({ isValid: false, error: 'Target is own piece' });
    });
  });

  describe('checkWinCondition (T023)', () => {
    it('should detect capture-all victory', () => {
      const match = createTestMatch();
      match.capturedByFaction['red'] = new Array(16).fill(
        createPiece('black-piece', 'Pawn', 'black')
      );

      const result = classicRules.checkWinCondition(match);
      expect(result).toEqual({ hasEnded: true, winner: 'red', reason: 'capture-all' });
    });

    it('should detect stalemate (no legal moves)', () => {
      const match = createTestMatch();
      // Red's only piece is a King surrounded by black Pawns (King cannot capture Pawn!)
      // Fill all cells with pieces (no flips available)
      for (let i = 0; i < 32; i++) {
        match.board[i] = createPiece(`filler-${i}`, 'Guard', 'black');
      }
      
      match.board[10] = createPiece('red-king', 'King', 'red'); // Row 2, Col 2
      // Adjacent cells are all black Pawns (King CANNOT capture Pawns, special rule!)
      match.board[6] = createPiece('black-pawn-up', 'Pawn', 'black'); // Up
      match.board[14] = createPiece('black-pawn-down', 'Pawn', 'black'); // Down
      match.board[9] = createPiece('black-pawn-left', 'Pawn', 'black'); // Left
      match.board[11] = createPiece('black-pawn-right', 'Pawn', 'black'); // Right

      const result = classicRules.checkWinCondition(match);
      expect(result).toEqual({ hasEnded: true, winner: 'black', reason: 'stalemate' });
    });

    it('should return not ended when game continues', () => {
      const match = createTestMatch();
      match.board[10] = createPiece('red-pawn', 'Pawn', 'red');
      match.board[11] = null; // Has legal moves

      const result = classicRules.checkWinCondition(match);
      expect(result).toEqual({ hasEnded: false });
    });
  });

  describe('checkDrawCondition (T023)', () => {
    it('should always return false for Classic mode', () => {
      const match = createTestMatch();
      const result = classicRules.checkDrawCondition(match);
      expect(result).toBe(false);
    });
  });

  describe('getAdjacentIndices (T024)', () => {
    it('should return 4 adjacent indices for center position', () => {
      const adjacent = classicRules.getAdjacentIndices(10, 32); // Row 2, Col 2
      expect(adjacent).toContain(6); // Up
      expect(adjacent).toContain(14); // Down
      expect(adjacent).toContain(9); // Left
      expect(adjacent).toContain(11); // Right
      expect(adjacent).toHaveLength(4);
    });

    it('should return 2 adjacent indices for corner position', () => {
      const adjacent = classicRules.getAdjacentIndices(0, 32); // Top-left corner
      expect(adjacent).toContain(4); // Down
      expect(adjacent).toContain(1); // Right
      expect(adjacent).toHaveLength(2);
    });

    it('should return 3 adjacent indices for edge position', () => {
      const adjacent = classicRules.getAdjacentIndices(1, 32); // Top edge
      expect(adjacent).toContain(5); // Down
      expect(adjacent).toContain(0); // Left
      expect(adjacent).toContain(2); // Right
      expect(adjacent).toHaveLength(3);
    });

    it('should return empty array for invalid index', () => {
      const adjacent = classicRules.getAdjacentIndices(32, 32);
      expect(adjacent).toEqual([]);
    });
  });

  describe('canPieceCapture (T022)', () => {
    it('should allow Cannon to capture any piece', () => {
      const cannon = createPiece('red-cannon', 'Cannon', 'red');
      const king = createPiece('black-king', 'King', 'black');
      expect(classicRules.canPieceCapture(cannon, king)).toBe(true);
    });

    it('should allow higher rank to capture lower rank', () => {
      const guard = createPiece('red-guard', 'Guard', 'red'); // Rank 6
      const pawn = createPiece('black-pawn', 'Pawn', 'black'); // Rank 1
      expect(classicRules.canPieceCapture(guard, pawn)).toBe(true);
    });

    it('should disallow King to capture Pawn', () => {
      const king = createPiece('red-king', 'King', 'red');
      const pawn = createPiece('black-pawn', 'Pawn', 'black');
      expect(classicRules.canPieceCapture(king, pawn)).toBe(false);
    });

    it('should allow Pawn to capture King', () => {
      const pawn = createPiece('red-pawn', 'Pawn', 'red');
      const king = createPiece('black-king', 'King', 'black');
      expect(classicRules.canPieceCapture(pawn, king)).toBe(true);
    });
  });

  describe('getLegalMoves (T021)', () => {
    it('should find all legal flips', () => {
      const match = createTestMatch();
      match.board[0] = createPiece('red-pawn', 'Pawn', 'red', false);
      match.board[1] = createPiece('black-pawn', 'Pawn', 'black', false);

      const legalMoves = classicRules.getLegalMoves(match);
      expect(legalMoves.flips).toContain(0);
      expect(legalMoves.flips).toContain(1);
    });

    it('should find all legal moves for current faction', () => {
      const match = createTestMatch();
      match.board[10] = createPiece('red-pawn', 'Pawn', 'red');
      match.board[11] = null; // Empty adjacent
      match.board[14] = null; // Empty adjacent

      const legalMoves = classicRules.getLegalMoves(match);
      expect(legalMoves.moves).toContainEqual({ fromIndex: 10, toIndex: 11 });
      expect(legalMoves.moves).toContainEqual({ fromIndex: 10, toIndex: 14 });
    });

    it('should find all legal captures for current faction', () => {
      const match = createTestMatch();
      match.board[10] = createPiece('red-guard', 'Guard', 'red');
      match.board[11] = createPiece('black-pawn', 'Pawn', 'black');

      const legalMoves = classicRules.getLegalMoves(match);
      expect(legalMoves.captures).toContainEqual({ fromIndex: 10, toIndex: 11 });
    });

    it('should return empty sets when match ended', () => {
      const match = createTestMatch();
      match.status = 'ended';

      const legalMoves = classicRules.getLegalMoves(match);
      expect(legalMoves.flips).toHaveLength(0);
      expect(legalMoves.moves).toHaveLength(0);
      expect(legalMoves.captures).toHaveLength(0);
    });
  });
});
