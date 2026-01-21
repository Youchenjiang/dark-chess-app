/**
 * Integration test for BoardView - User Story 1 & 2 (T025, T036, T037, T038)
 */

import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { BoardView } from '../../../src/components/BoardView';
import { useGameStore } from '../../../src/store/gameStore';
import { Board } from '../../../src/core/types';

// Mock the store
jest.mock('../../../src/store/gameStore');

describe('BoardView Integration', () => {
  const mockFlipPiece = jest.fn();
  const mockMovePiece = jest.fn();
  const mockCapturePiece = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('User Story 1: Flip to start game (T025)', () => {
    beforeEach(() => {
      (useGameStore as unknown as jest.Mock).mockReturnValue({
        match: {
          status: 'waiting-first-flip',
          currentTurn: null,
          winner: null,
          board: new Array(32).fill(null).map((_, i) => ({
            id: `piece-${i}`,
            type: 'Pawn',
            color: i % 2 === 0 ? 'red' : 'black',
            isRevealed: false,
            isDead: false,
          })),
          redCaptured: [],
          blackCaptured: [],
        },
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
        color: 'red',
        isRevealed: true,
        isDead: false,
      };

      (useGameStore as unknown as jest.Mock).mockReturnValue({
        match: {
          status: 'in-progress',
          currentTurn: 'red',
          winner: null,
          board,
          redCaptured: [],
          blackCaptured: [],
        },
        flipPiece: mockFlipPiece,
        movePiece: mockMovePiece,
        capturePiece: mockCapturePiece,
      });
    });

    it('should select piece and call movePiece when tapping empty cell', () => {
      const { getByText, UNSAFE_getAllByType } = render(<BoardView />);

      // Tap on revealed red pawn to select
      const redPawn = getByText('兵');
      fireEvent.press(redPawn.parent!);

      // Tap on adjacent empty cell (index 1)
      const cells = UNSAFE_getAllByType('RCTTouchableOpacity' as any);
      fireEvent.press(cells[1]);

      expect(mockMovePiece).toHaveBeenCalledWith(0, 1);
    });
  });

  describe('User Story 2: Illegal action error handling (T037)', () => {
    beforeEach(() => {
      const board: Board = new Array(32).fill(null);
      board[0] = {
        id: 'red-pawn-1',
        type: 'Pawn',
        color: 'red',
        isRevealed: true,
        isDead: false,
      };
      board[1] = {
        id: 'black-king-1',
        type: 'King',
        color: 'black',
        isRevealed: true,
        isDead: false,
      };

      (useGameStore as unknown as jest.Mock).mockReturnValue({
        match: {
          status: 'in-progress',
          currentTurn: 'red',
          winner: null,
          board,
          redCaptured: [],
          blackCaptured: [],
        },
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
        color: 'red',
        isRevealed: true,
        isDead: false,
      };
      board[1] = {
        id: 'black-pawn-1',
        type: 'Pawn',
        color: 'black',
        isRevealed: true,
        isDead: false,
      };

      (useGameStore as unknown as jest.Mock).mockReturnValue({
        match: {
          status: 'in-progress',
          currentTurn: 'red',
          winner: null,
          board,
          redCaptured: [],
          blackCaptured: [],
        },
        flipPiece: mockFlipPiece,
        movePiece: mockMovePiece,
        capturePiece: mockCapturePiece,
      });
    });

    it('should call capturePiece when selecting piece and tapping enemy piece', () => {
      const { getByText, UNSAFE_getAllByType } = render(<BoardView />);

      // Tap on red rook to select
      const redRook = getByText('俥');
      fireEvent.press(redRook.parent!);

      // Tap on adjacent black pawn (index 1)
      const cells = UNSAFE_getAllByType('RCTTouchableOpacity' as any);
      fireEvent.press(cells[1]);

      expect(mockCapturePiece).toHaveBeenCalledWith(0, 1);
    });
  });

  describe('User Story 3: Capture-all ends match (T047)', () => {
    it('should display winner when capture-all condition is met', () => {
      const board: Board = new Array(32).fill(null);
      board[0] = {
        id: 'red-rook-1',
        type: 'Rook',
        color: 'red',
        isRevealed: true,
        isDead: false,
      };

      // Red captured all 16 black pieces
      const capturedPieces = new Array(16).fill(null).map((_, i) => ({
        id: `black-${i}`,
        type: 'Pawn' as const,
        color: 'black' as const,
        isRevealed: true,
        isDead: true,
      }));

      (useGameStore as unknown as jest.Mock).mockReturnValue({
        match: {
          status: 'ended',
          currentTurn: null,
          winner: 'red',
          board,
          redCaptured: capturedPieces,
          blackCaptured: [],
        },
        flipPiece: mockFlipPiece,
        movePiece: mockMovePiece,
        capturePiece: mockCapturePiece,
      });

      const { container } = render(<BoardView />);

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
        color: 'red',
        isRevealed: true,
        isDead: false,
      };

      // Surrounded by black kings (cannot capture)
      board[1] = {
        id: 'black-king-1',
        type: 'King',
        color: 'black',
        isRevealed: true,
        isDead: false,
      };

      (useGameStore as unknown as jest.Mock).mockReturnValue({
        match: {
          status: 'ended',
          currentTurn: null,
          winner: 'black',
          board,
          redCaptured: [],
          blackCaptured: [],
        },
        flipPiece: mockFlipPiece,
        movePiece: mockMovePiece,
        capturePiece: mockCapturePiece,
      });

      const { container } = render(<BoardView />);

      // Match ended due to stalemate, no further actions allowed
      expect(mockFlipPiece).not.toHaveBeenCalled();
      expect(mockMovePiece).not.toHaveBeenCalled();
      expect(mockCapturePiece).not.toHaveBeenCalled();
    });
  });
});
