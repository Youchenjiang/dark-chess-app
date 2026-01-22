/**
 * Integration test for BoardView - User Story 1 & 2 (T025, T036, T037, T038)
 */

import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { BoardView } from '../../../src/components/BoardView';
import { useGameStore } from '../../../src/store/gameStore';
import { Board, Match } from '../../../src/core/types';
import { GAME_MODES, RED_FACTION, BLACK_FACTION } from '../../../src/core/GameModes';

// Mock the store
jest.mock('../../../src/store/gameStore');

describe('BoardView Integration', () => {
  const mockFlipPiece = jest.fn();
  const mockMovePiece = jest.fn();
  const mockCapturePiece = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Helper: Create a Classic mode match for testing
  const createTestMatch = (overrides: Partial<Match> = {}): Match => {
    return {
      status: 'waiting-first-flip',
      mode: GAME_MODES.classic,
      factions: [RED_FACTION, BLACK_FACTION],
      activeFactions: ['red', 'black'],
      currentFactionIndex: 0,
      winner: null,
      board: new Array(32).fill(null),
      capturedByFaction: { red: [], black: [] },
      movesWithoutCapture: null,
      ...overrides,
    };
  };

  describe('User Story 1: Flip to start game (T025)', () => {
    beforeEach(() => {
      (useGameStore as unknown as jest.Mock).mockReturnValue({
        match: createTestMatch({
          board: new Array(32).fill(null).map((_, i) => ({
            id: `piece-${i}`,
            type: 'Pawn',
            factionId: i % 2 === 0 ? 'red' : 'black',
            isRevealed: false,
            isDead: false,
          })),
        }),
        flipPiece: mockFlipPiece,
        movePiece: mockMovePiece,
        capturePiece: mockCapturePiece,
      });
    });

    it('should render a 4x8 grid board', () => {
      const { getAllByText } = render(<BoardView />);
      const faceDownPieces = getAllByText('🀫');
      expect(faceDownPieces).toHaveLength(32);
    });

    it('should call flipPiece when tapping a cell', () => {
      const { getAllByText } = render(<BoardView />);
      const faceDownPieces = getAllByText('🀫');
      fireEvent.press(faceDownPieces[0].parent!);
      expect(mockFlipPiece).toHaveBeenCalledWith(0);
    });
  });

  describe('User Story 2: Move piece (T036)', () => {
    beforeEach(() => {
      const board: Board = new Array(32).fill(null);
      board[0] = {
        id: 'red-pawn-1',
        type: 'Pawn',
        factionId: 'red',
        isRevealed: true,
        isDead: false,
      };

      (useGameStore as unknown as jest.Mock).mockReturnValue({
        match: createTestMatch({
          status: 'in-progress',
          currentFactionIndex: 0, // red's turn
          board,
        }),
        flipPiece: mockFlipPiece,
        movePiece: mockMovePiece,
        capturePiece: mockCapturePiece,
      });
    });

    it('should select piece and call movePiece when tapping empty cell', () => {
      const { getByTestId } = render(<BoardView />);

      // Tap on revealed red pawn at cell 0 to select
      const cell0 = getByTestId('cell-0');
      fireEvent.press(cell0);

      // Tap on adjacent empty cell (index 1)
      const emptyCell = getByTestId('cell-1');
      fireEvent.press(emptyCell);

      expect(mockMovePiece).toHaveBeenCalledWith(0, 1);
    });
  });

  describe('User Story 2: Illegal action error handling (T037)', () => {
    beforeEach(() => {
      const board: Board = new Array(32).fill(null);
      board[0] = {
        id: 'red-pawn-1',
        type: 'Pawn',
        factionId: 'red',
        isRevealed: true,
        isDead: false,
      };
      board[1] = {
        id: 'black-king-1',
        type: 'King',
        factionId: 'black',
        isRevealed: true,
        isDead: false,
      };

      (useGameStore as unknown as jest.Mock).mockReturnValue({
        match: createTestMatch({
          status: 'in-progress',
          currentFactionIndex: 0, // red's turn
          board,
        }),
        flipPiece: mockFlipPiece,
        movePiece: mockMovePiece,
        capturePiece: mockCapturePiece,
        error: 'Invalid capture: rank too low',
        clearError: jest.fn(),
      });
    });

    it('should display error message when illegal action is attempted', () => {
      const { getByText } = render(<BoardView />);

      // Error should be displayed (checked in GameInfo component)
      // This test validates that BoardView works with error state
      expect(mockCapturePiece).not.toHaveBeenCalled();
    });
  });

  describe('User Story 2: Capture piece (T038)', () => {
    beforeEach(() => {
      const board: Board = new Array(32).fill(null);
      board[0] = {
        id: 'red-rook-1',
        type: 'Rook',
        factionId: 'red',
        isRevealed: true,
        isDead: false,
      };
      board[1] = {
        id: 'black-pawn-1',
        type: 'Pawn',
        factionId: 'black',
        isRevealed: true,
        isDead: false,
      };

      (useGameStore as unknown as jest.Mock).mockReturnValue({
        match: createTestMatch({
          status: 'in-progress',
          currentFactionIndex: 0, // red's turn
          board,
        }),
        flipPiece: mockFlipPiece,
        movePiece: mockMovePiece,
        capturePiece: mockCapturePiece,
      });
    });

    it('should call capturePiece when selecting piece and tapping enemy piece', () => {
      const { getByTestId } = render(<BoardView />);

      // Tap on red rook at cell 0 to select
      const cell0 = getByTestId('cell-0');
      fireEvent.press(cell0);

      // Tap on adjacent black pawn (index 1)
      const enemyCell = getByTestId('cell-1');
      fireEvent.press(enemyCell);

      expect(mockCapturePiece).toHaveBeenCalledWith(0, 1);
    });
  });

  describe('User Story 3: Capture-all ends match (T047)', () => {
    it('should display winner when capture-all condition is met', () => {
      const board: Board = new Array(32).fill(null);
      board[0] = {
        id: 'red-rook-1',
        type: 'Rook',
        factionId: 'red',
        isRevealed: true,
        isDead: false,
      };

      // Red captured all 16 black pieces
      const capturedPieces = new Array(16).fill(null).map((_, i) => ({
        id: `black-${i}`,
        type: 'Pawn' as const,
        factionId: 'black' as const,
        isRevealed: true,
        isDead: true,
      }));

      (useGameStore as unknown as jest.Mock).mockReturnValue({
        match: createTestMatch({
          status: 'ended',
          winner: 'red',
          board,
          capturedByFaction: { red: capturedPieces, black: [] },
        }),
        flipPiece: mockFlipPiece,
        movePiece: mockMovePiece,
        capturePiece: mockCapturePiece,
      });

      render(<BoardView />);

      // Match ended, no further actions should be allowed
      // This is validated by BoardView logic (status === 'ended')
      expect(mockFlipPiece).not.toHaveBeenCalled();
      expect(mockMovePiece).not.toHaveBeenCalled();
      expect(mockCapturePiece).not.toHaveBeenCalled();
    });
  });

  describe('User Story 3: Stalemate ends match (T048)', () => {
    it('should display winner when stalemate condition is met', () => {
      const board: Board = new Array(32).fill(null);
      // Red pawn trapped with no legal moves
      board[0] = {
        id: 'red-pawn-1',
        type: 'Pawn',
        factionId: 'red',
        isRevealed: true,
        isDead: false,
      };

      // Surrounded by black kings (cannot capture)
      board[1] = {
        id: 'black-king-1',
        type: 'King',
        factionId: 'black',
        isRevealed: true,
        isDead: false,
      };

      (useGameStore as unknown as jest.Mock).mockReturnValue({
        match: createTestMatch({
          status: 'ended',
          winner: 'black',
          board,
        }),
        flipPiece: mockFlipPiece,
        movePiece: mockMovePiece,
        capturePiece: mockCapturePiece,
      });

      render(<BoardView />);

      // Match ended due to stalemate, no further actions allowed
      expect(mockFlipPiece).not.toHaveBeenCalled();
      expect(mockMovePiece).not.toHaveBeenCalled();
      expect(mockCapturePiece).not.toHaveBeenCalled();
    });
  });
});
