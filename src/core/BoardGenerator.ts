/**
 * Board generation and initialization
 * Pure TypeScript - NO React dependencies
 */

import { Match, Piece, PieceColor, Board } from './types';
import { PieceType, PIECE_COUNTS, TOTAL_PIECES_PER_COLOR } from './rules';
import { BOARD_SIZE } from './boardUtils';

/**
 * Create all pieces for a color
 */
function createPiecesForColor(color: PieceColor): Piece[] {
  const pieces: Piece[] = [];
  let pieceCounter = 1;

  for (const [type, count] of Object.entries(PIECE_COUNTS) as [PieceType, number][]) {
    for (let i = 0; i < count; i++) {
      pieces.push({
        id: `${color}-${type.toLowerCase()}-${pieceCounter++}`,
        type,
        color,
        isRevealed: false,
        isDead: false,
      });
    }
  }

  return pieces;
}

/**
 * Shuffle array using Fisher-Yates algorithm
 */
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * Create initial match with shuffled board
 * All 32 pieces are placed face-down randomly
 */
export function createInitialMatch(): Match {
  // Create all pieces (16 red + 16 black)
  const redPieces = createPiecesForColor('red');
  const blackPieces = createPiecesForColor('black');
  const allPieces = [...redPieces, ...blackPieces];

  // Shuffle all pieces
  const shuffledPieces = shuffleArray(allPieces);

  // Create board (32 cells, all filled)
  const board: Board = new Array(BOARD_SIZE);
  for (let i = 0; i < BOARD_SIZE; i++) {
    board[i] = shuffledPieces[i];
  }

  return {
    status: 'waiting-first-flip',
    currentTurn: null,
    winner: null,
    board,
    redCaptured: [],
    blackCaptured: [],
  };
}
