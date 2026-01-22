/**
 * Unit tests for ThreeKingdomsRules (T040-T044)
 * Target: 100% coverage for Three Kingdoms logic
 */

import { ThreeKingdomsRules } from '../../../../src/core/rules/ThreeKingdomsRules';
import { Match, Piece, GameMode, Faction } from '../../../../src/core/types';

describe('ThreeKingdomsRules', () => {
  let tkRules: ThreeKingdomsRules;
  let testMode: GameMode;
  let teamAFaction: Faction;
  let teamBFaction: Faction;
  let teamCFaction: Faction;

  beforeEach(() => {
    tkRules = new ThreeKingdomsRules();
    
    // Create test GameMode
    testMode = {
      id: 'three-kingdoms',
      name: '三國暗棋',
      boardSize: 45,
      gridDimensions: { rows: 9, cols: 5 },
      playerCount: 3,
      ruleSet: tkRules,
    };

    // Create test factions
    teamAFaction = {
      id: 'team-a',
      displayName: '將軍軍',
      color: 'green',
      pieceCount: 12,
      isEliminated: false,
    };

    teamBFaction = {
      id: 'team-b',
      displayName: '紅方輔臣',
      color: 'red',
      pieceCount: 10,
      isEliminated: false,
    };

    teamCFaction = {
      id: 'team-c',
      displayName: '黑方輔臣',
      color: 'black',
      pieceCount: 10,
      isEliminated: false,
    };
  });

  // Helper: Create a test match
  function createTestMatch(): Match {
    const board: (Piece | null)[] = new Array(45).fill(null);
    return {
      status: 'in-progress',
      mode: testMode,
      factions: [teamAFaction, teamBFaction, teamCFaction],
      activeFactions: ['team-a', 'team-b', 'team-c'],
      currentFactionIndex: 0, // Team A's turn
      currentPlayerIndex: 0, // Player 0's turn
      playerFactionMap: { 0: 'team-a', 1: 'team-b', 2: 'team-c' }, // Players assigned to factions
      winner: null,
      board,
      capturedByFaction: { 'team-a': [], 'team-b': [], 'team-c': [] },
      movesWithoutCapture: 60,
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

  describe('validateMove (T040)', () => {
    it('should validate adjacent move for Pawn', () => {
      const match = createTestMatch();
      match.board[10] = createPiece('team-a-pawn-1', 'Pawn', 'team-a');
      match.board[11] = null; // Adjacent empty

      const result = tkRules.validateMove(match, 10, 11);
      expect(result.isValid).toBe(true);
    });

    it('should validate infinite straight move for General', () => {
      const match = createTestMatch();
      match.board[10] = createPiece('team-a-general', 'King', 'team-a'); // Row 2, Col 0
      match.board[15] = null; // Row 3, Col 0 (same column, 1 row down)
      match.board[20] = null; // Row 4, Col 0 (same column, 2 rows down)

      const result = tkRules.validateMove(match, 10, 20);
      expect(result.isValid).toBe(true);
    });

    it('should reject General move if path blocked', () => {
      const match = createTestMatch();
      match.board[10] = createPiece('team-a-general', 'King', 'team-a');
      match.board[15] = createPiece('team-b-pawn', 'Pawn', 'team-b'); // Blocking
      match.board[20] = null;

      const result = tkRules.validateMove(match, 10, 20);
      expect(result).toEqual({ isValid: false, error: 'Illegal move for this piece type' });
    });

    it('should validate Minister 2-diagonal jump', () => {
      const match = createTestMatch();
      match.board[11] = createPiece('team-a-minister', 'Minister', 'team-a'); // Row 2, Col 1
      match.board[23] = null; // Row 4, Col 3 (2 diagonals)

      const result = tkRules.validateMove(match, 11, 23);
      expect(result.isValid).toBe(true);
    });

    it('should validate Horse L-shape move', () => {
      const match = createTestMatch();
      match.board[11] = createPiece('team-a-horse', 'Horse', 'team-a'); // Row 2, Col 1
      match.board[21] = null; // Row 4, Col 1 (2 down, 0 right - wait, needs to be L-shape)
      match.board[17] = null; // Row 3, Col 2 (1 down, 1 right - not L-shape)
      match.board[22] = null; // Row 4, Col 2 (2 down, 1 right - L-shape!)

      const result = tkRules.validateMove(match, 11, 22);
      expect(result.isValid).toBe(true);
    });
  });

  describe('validateCapture (T040)', () => {
    it('should allow any piece to capture any opponent piece (no rank hierarchy)', () => {
      const match = createTestMatch();
      match.board[10] = createPiece('team-a-pawn', 'Pawn', 'team-a'); // Lowest rank
      match.board[11] = createPiece('team-b-king', 'King', 'team-b'); // Highest rank

      const result = tkRules.validateCapture(match, 10, 11);
      expect(result.isValid).toBe(true); // Pawn can capture King!
    });

    it('should allow King to capture Pawn (no exception)', () => {
      const match = createTestMatch();
      match.board[10] = createPiece('team-a-king', 'King', 'team-a');
      match.board[11] = createPiece('team-b-pawn', 'Pawn', 'team-b');

      const result = tkRules.validateCapture(match, 10, 11);
      expect(result.isValid).toBe(true); // No King vs Pawn exception!
    });

    it('should validate Cannon capture with screen', () => {
      const match = createTestMatch();
      match.board[5] = createPiece('team-a-cannon', 'Cannon', 'team-a'); // Row 1, Col 0
      match.board[10] = createPiece('team-b-pawn', 'Pawn', 'team-b'); // Row 2, Col 0 (screen)
      match.board[15] = createPiece('team-c-king', 'King', 'team-c'); // Row 3, Col 0 (target)

      const result = tkRules.validateCapture(match, 5, 15);
      expect(result.isValid).toBe(true);
    });

    it('should reject Cannon capture without screen', () => {
      const match = createTestMatch();
      match.board[5] = createPiece('team-a-cannon', 'Cannon', 'team-a'); // Row 1, Col 0
      match.board[15] = createPiece('team-c-king', 'King', 'team-c'); // Row 3, Col 0 (no screen)

      const result = tkRules.validateCapture(match, 5, 15);
      expect(result).toEqual({
        isValid: false,
        error: 'Cannon requires exactly one screen to capture',
      });
    });

    it('should reject capture of own faction piece', () => {
      const match = createTestMatch();
      match.board[10] = createPiece('team-a-guard', 'Guard', 'team-a');
      match.board[11] = createPiece('team-a-pawn', 'Pawn', 'team-a');

      const result = tkRules.validateCapture(match, 10, 11);
      expect(result).toEqual({ isValid: false, error: 'Target is own piece' });
    });
  });

  describe('checkWinCondition (T041)', () => {
    it('should detect elimination victory (only 1 faction remains)', () => {
      const match = createTestMatch();
      match.activeFactions = ['team-c']; // Only Team C remains

      const result = tkRules.checkWinCondition(match);
      expect(result).toEqual({ hasEnded: true, winner: 'team-c', reason: 'elimination' });
    });

    it('should detect capture-all victory', () => {
      const match = createTestMatch();
      // Team A captured all 20 opponent pieces (10 + 10)
      match.capturedByFaction['team-a'] = new Array(20).fill(
        createPiece('opponent-piece', 'Pawn', 'team-b')
      );

      const result = tkRules.checkWinCondition(match);
      expect(result).toEqual({ hasEnded: true, winner: 'team-a', reason: 'capture-all' });
    });

    it('should detect stalemate when only 1 faction remains after elimination', () => {
      const match = createTestMatch();
      // Simulate that Team A and Team C have been eliminated, only Team B remains
      match.activeFactions = ['team-b'];
      match.currentFactionIndex = 0; // Team B's turn (only one left)
      
      match.board[10] = createPiece('team-b-pawn', 'Pawn', 'team-b');
      match.board[11] = null; // Team B has legal moves

      const result = tkRules.checkWinCondition(match);
      expect(result).toEqual({ hasEnded: true, winner: 'team-b', reason: 'elimination' });
    });

    it('should return not ended when game continues', () => {
      const match = createTestMatch();
      match.board[10] = createPiece('team-a-pawn', 'Pawn', 'team-a');
      match.board[11] = null; // Has legal moves

      const result = tkRules.checkWinCondition(match);
      expect(result).toEqual({ hasEnded: false });
    });
  });

  describe('checkDrawCondition (T042)', () => {
    it('should return true when movesWithoutCapture reaches 0', () => {
      const match = createTestMatch();
      match.movesWithoutCapture = 0;

      const result = tkRules.checkDrawCondition(match);
      expect(result).toBe(true);
    });

    it('should return false when movesWithoutCapture > 0', () => {
      const match = createTestMatch();
      match.movesWithoutCapture = 30;

      const result = tkRules.checkDrawCondition(match);
      expect(result).toBe(false);
    });
  });

  describe('getAdjacentIndices (T043)', () => {
    it('should return 4 adjacent indices for center position (9x5 grid)', () => {
      const adjacent = tkRules.getAdjacentIndices(22, 45); // Row 4, Col 2 (center)
      expect(adjacent).toContain(17); // Up (row 3)
      expect(adjacent).toContain(27); // Down (row 5)
      expect(adjacent).toContain(21); // Left (col 1)
      expect(adjacent).toContain(23); // Right (col 3)
      expect(adjacent).toHaveLength(4);
    });

    it('should return 2 adjacent indices for corner position', () => {
      const adjacent = tkRules.getAdjacentIndices(0, 45); // Top-left corner
      expect(adjacent).toContain(5); // Down
      expect(adjacent).toContain(1); // Right
      expect(adjacent).toHaveLength(2);
    });

    it('should return 3 adjacent indices for edge position', () => {
      const adjacent = tkRules.getAdjacentIndices(1, 45); // Top edge
      expect(adjacent).toContain(6); // Down
      expect(adjacent).toContain(0); // Left
      expect(adjacent).toContain(2); // Right
      expect(adjacent).toHaveLength(3);
    });

    it('should return empty array for invalid index', () => {
      const adjacent = tkRules.getAdjacentIndices(45, 45);
      expect(adjacent).toEqual([]);
    });
  });

  describe('canPieceCapture (T040)', () => {
    it('should allow Cannon to capture any piece', () => {
      const cannon = createPiece('team-a-cannon', 'Cannon', 'team-a');
      const king = createPiece('team-b-king', 'King', 'team-b');
      expect(tkRules.canPieceCapture(cannon, king)).toBe(true);
    });

    it('should allow any piece to capture any piece (no rank hierarchy)', () => {
      const pawn = createPiece('team-a-pawn', 'Pawn', 'team-a');
      const king = createPiece('team-b-king', 'King', 'team-b');
      expect(tkRules.canPieceCapture(pawn, king)).toBe(true);
    });

    it('should allow King to capture Pawn (no exception)', () => {
      const king = createPiece('team-a-king', 'King', 'team-a');
      const pawn = createPiece('team-b-pawn', 'Pawn', 'team-b');
      expect(tkRules.canPieceCapture(king, pawn)).toBe(true);
    });
  });

  describe('getLegalMoves (T040)', () => {
    it('should find all legal flips', () => {
      const match = createTestMatch();
      match.board[0] = createPiece('team-a-pawn', 'Pawn', 'team-a', false);
      match.board[1] = createPiece('team-b-pawn', 'Pawn', 'team-b', false);

      const legalMoves = tkRules.getLegalMoves(match);
      expect(legalMoves.flips).toContain(0);
      expect(legalMoves.flips).toContain(1);
    });

    it('should find all legal moves for current faction', () => {
      const match = createTestMatch();
      match.board[10] = createPiece('team-a-pawn', 'Pawn', 'team-a');
      match.board[11] = null; // Adjacent empty
      match.board[15] = null; // Adjacent empty

      const legalMoves = tkRules.getLegalMoves(match);
      expect(legalMoves.moves).toContainEqual({ fromIndex: 10, toIndex: 11 });
      expect(legalMoves.moves).toContainEqual({ fromIndex: 10, toIndex: 15 });
    });

    it('should find all legal captures for current faction', () => {
      const match = createTestMatch();
      // Place Guard at index 10 (row=2, col=0)
      match.board[10] = createPiece('team-a-guard', 'Guard', 'team-a');
      // Place enemy at diagonal position: index 6 (row=1, col=1) - one step diagonal
      match.board[6] = createPiece('team-b-pawn', 'Pawn', 'team-b');

      const legalMoves = tkRules.getLegalMoves(match);
      expect(legalMoves.captures).toContainEqual({ fromIndex: 10, toIndex: 6 });
    });

    it('should return empty sets when match ended', () => {
      const match = createTestMatch();
      match.status = 'ended';

      const legalMoves = tkRules.getLegalMoves(match);
      expect(legalMoves.flips).toHaveLength(0);
      expect(legalMoves.moves).toHaveLength(0);
      expect(legalMoves.captures).toHaveLength(0);
    });
  });

  describe('Army Chess Movement - Unblocked Movement (T031, T032, T033)', () => {
    beforeEach(() => {
      // Update helper function to include playerFactionMap and currentPlayerIndex
      createTestMatch().playerFactionMap = { 0: 'team-a', 1: 'team-b', 2: 'team-c' };
      createTestMatch().currentPlayerIndex = 0;
    });

    it('should allow Guard (Advisor) to move one step diagonally only', () => {
      const match = createTestMatch();
      match.playerFactionMap = { 0: 'team-a', 1: 'team-b', 2: 'team-c' };
      match.currentPlayerIndex = 0;
      
      // Place Guard at index 22 (row=4, col=2) - center
      match.board[22] = createPiece('team-a-guard', 'Guard', 'team-a');
      
      // Diagonal positions from 22: (3,1)=16, (3,3)=18, (5,1)=26, (5,3)=28
      // Orthogonal positions from 22: (3,2)=17, (4,1)=21, (4,3)=23, (5,2)=27
      
      // Empty diagonal target (5,3) = index 28
      match.board[28] = null;
      // Empty orthogonal target (5,2) = index 27
      match.board[27] = null;

      // Guard should be able to move diagonally
      const resultDiagonal = tkRules.validateMove(match, 22, 28);
      expect(resultDiagonal.isValid).toBe(true);

      // Guard should NOT be able to move orthogonally
      const resultOrthogonal = tkRules.validateMove(match, 22, 27);
      expect(resultOrthogonal.isValid).toBe(false);
    });

    it('should allow Minister to jump 2 diagonals over obstacles (unblocked)', () => {
      const match = createTestMatch();
      match.playerFactionMap = { 0: 'team-a', 1: 'team-b', 2: 'team-c' };
      match.currentPlayerIndex = 0;
      
      // Place Minister at (4, 2) - center (index = 4*5+2 = 22)
      match.board[22] = createPiece('team-a-minister', 'Minister', 'team-a');
      
      // Place obstacle between Minister and target (blocking position for Classic, but NOT for Army Chess)
      // Target: (2, 0) - index = 2*5+0 = 10 (2 diagonal steps up-left)
      // Blocking position would be (3, 1) - index = 3*5+1 = 16 (in Classic, this would block)
      match.board[16] = createPiece('team-b-pawn', 'Pawn', 'team-b');
      
      // Empty target
      match.board[10] = null;

      // In Army Chess, Minister should be able to jump over the obstacle
      const result = tkRules.validateMove(match, 22, 10);
      expect(result.isValid).toBe(true);
    });

    it('should allow Horse to perform L-shape move over obstacles (unblocked)', () => {
      const match = createTestMatch();
      match.playerFactionMap = { 0: 'team-a', 1: 'team-b', 2: 'team-c' };
      match.currentPlayerIndex = 0;
      
      // Place Horse at (4, 2) - center (index = 4*5+2 = 22)
      match.board[22] = createPiece('team-a-horse', 'Horse', 'team-a');
      
      // Place obstacle in the "pivot" position (would block in Classic Chess)
      // Target: (3, 0) - index = 3*5+0 = 15 (L-shape: 1 up, 2 left)
      // Pivot position would be (4, 1) or (3, 2) - index 21 or 17 (in Classic, this would block)
      match.board[21] = createPiece('team-b-pawn', 'Pawn', 'team-b');
      
      // Empty target
      match.board[15] = null;

      // In Army Chess, Horse should be able to jump over the obstacle
      const result = tkRules.validateMove(match, 22, 15);
      expect(result.isValid).toBe(true);
    });

    it('should block General infinite straight move by obstacles', () => {
      const match = createTestMatch();
      match.playerFactionMap = { 0: 'team-a', 1: 'team-b', 2: 'team-c' };
      match.currentPlayerIndex = 0;
      
      // Place General at (4, 2) - center (index 22)
      match.board[22] = createPiece('team-a-king', 'King', 'team-a'); // General = King type
      
      // Place obstacle between General and target
      // Target: (0, 2) - index 2 (4 steps up)
      // Blocking position: (2, 2) - index 12 (in the path)
      match.board[12] = createPiece('team-b-pawn', 'Pawn', 'team-b');
      
      // Empty target
      match.board[2] = null;

      // General should be BLOCKED by the obstacle
      const result = tkRules.validateMove(match, 22, 2);
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Illegal move for this piece type');
    });

    it('should block Rook infinite straight move by obstacles', () => {
      const match = createTestMatch();
      match.playerFactionMap = { 0: 'team-a', 1: 'team-b', 2: 'team-c' };
      match.currentPlayerIndex = 0;
      
      // Place Rook at (4, 2) - center (index 22)
      match.board[22] = createPiece('team-a-rook', 'Rook', 'team-a');
      
      // Place obstacle between Rook and target
      // Target: (4, 0) - index 20 (2 steps left)
      // Blocking position: (4, 1) - index 21 (in the path)
      match.board[21] = createPiece('team-b-pawn', 'Pawn', 'team-b');
      
      // Empty target
      match.board[20] = null;

      // Rook should be BLOCKED by the obstacle
      const result = tkRules.validateMove(match, 22, 20);
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Illegal move for this piece type');
    });

    it('should allow Cannon to capture with exactly one screen (unblocked screen counting)', () => {
      const match = createTestMatch();
      match.playerFactionMap = { 0: 'team-a', 1: 'team-b', 2: 'team-c' };
      match.currentPlayerIndex = 0;
      
      // Place Cannon at (4, 2) - center (index 22)
      match.board[22] = createPiece('team-a-cannon', 'Cannon', 'team-a');
      
      // Place exactly one screen between Cannon and target
      // Target: (4, 4) - index 24 (2 steps right, enemy piece)
      match.board[24] = createPiece('team-b-pawn', 'Pawn', 'team-b');
      
      // Screen: (4, 3) - index 23 (1 step right)
      match.board[23] = createPiece('team-c-pawn', 'Pawn', 'team-c');

      // Cannon should be able to capture with exactly one screen
      const result = tkRules.validateCapture(match, 22, 24);
      expect(result.isValid).toBe(true);
    });

    it('should reject Cannon capture with zero screens (adjacent)', () => {
      const match = createTestMatch();
      match.playerFactionMap = { 0: 'team-a', 1: 'team-b', 2: 'team-c' };
      match.currentPlayerIndex = 0;
      
      // Place Cannon at (4, 2) - center (index 22)
      match.board[22] = createPiece('team-a-cannon', 'Cannon', 'team-a');
      
      // Place adjacent enemy (no screen)
      // Target: (4, 3) - index 23 (1 step right, adjacent)
      match.board[23] = createPiece('team-b-pawn', 'Pawn', 'team-b');

      // Cannon should be rejected (cannot capture adjacent)
      const result = tkRules.validateCapture(match, 22, 23);
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Cannon cannot capture adjacent piece');
    });

    it('should reject Cannon capture with two screens', () => {
      const match = createTestMatch();
      match.playerFactionMap = { 0: 'team-a', 1: 'team-b', 2: 'team-c' };
      match.currentPlayerIndex = 0;
      
      // Place Cannon at (4, 0) - index 20
      match.board[20] = createPiece('team-a-cannon', 'Cannon', 'team-a');
      
      // Place two screens between Cannon and target
      // Target: (4, 4) - index 24 (4 steps right, enemy piece)
      match.board[24] = createPiece('team-b-pawn', 'Pawn', 'team-b');
      
      // Screen 1: (4, 1) - index 21
      match.board[21] = createPiece('team-c-pawn', 'Pawn', 'team-c');
      // Screen 2: (4, 3) - index 23
      match.board[23] = createPiece('team-a-guard', 'Guard', 'team-a');

      // Cannon should be rejected (requires exactly one screen)
      const result = tkRules.validateCapture(match, 20, 24);
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Cannon requires exactly one screen to capture');
    });

    it('should allow Minister to capture with 2-diagonal jump (unblocked)', () => {
      const match = createTestMatch();
      match.playerFactionMap = { 0: 'team-a', 1: 'team-b', 2: 'team-c' };
      match.currentPlayerIndex = 0;
      
      // Place Minister at (4, 2) - center (index = 4*5+2 = 22)
      match.board[22] = createPiece('team-a-minister', 'Minister', 'team-a');
      
      // Place obstacle in diagonal path (would block in Classic)
      // Blocking position: (3, 1) - index = 3*5+1 = 16
      match.board[16] = createPiece('team-c-pawn', 'Pawn', 'team-c');
      
      // Place enemy at 2-diagonal target (2, 0) - index = 2*5+0 = 10
      match.board[10] = createPiece('team-b-pawn', 'Pawn', 'team-b');

      // In Army Chess, Minister should be able to capture over the obstacle
      const result = tkRules.validateCapture(match, 22, 10);
      expect(result.isValid).toBe(true);
    });

    it('should allow Horse to capture with L-shape (unblocked)', () => {
      const match = createTestMatch();
      match.playerFactionMap = { 0: 'team-a', 1: 'team-b', 2: 'team-c' };
      match.currentPlayerIndex = 0;
      
      // Place Horse at (4, 2) - center (index = 4*5+2 = 22)
      match.board[22] = createPiece('team-a-horse', 'Horse', 'team-a');
      
      // Place obstacle in "pivot" position (would block in Classic)
      // Pivot: (4, 1) - index = 4*5+1 = 21
      match.board[21] = createPiece('team-c-pawn', 'Pawn', 'team-c');
      
      // Place enemy at L-shape target (3, 0) - index = 3*5+0 = 15
      match.board[15] = createPiece('team-b-pawn', 'Pawn', 'team-b');

      // In Army Chess, Horse should be able to capture over the obstacle
      const result = tkRules.validateCapture(match, 22, 15);
      expect(result.isValid).toBe(true);
    });
  });
});
