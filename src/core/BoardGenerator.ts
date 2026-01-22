/**
 * Board generation and initialization (Multi-mode support)
 * Pure TypeScript - NO React dependencies
 */

import { Match, Piece, Board, GameMode } from './types';
import { PieceType, PIECE_COUNTS } from './rules';
import {
  GAME_MODES,
  RED_FACTION,
  BLACK_FACTION,
  TEAM_A_FACTION,
  TEAM_B_FACTION,
  TEAM_C_FACTION,
} from './GameModes';

/**
 * Piece distribution for Three Kingdoms mode
 * Team A (Green - Generals' Army): 12 pieces (1 將, 2 士, 2 相, 2 車, 2 馬, 1 炮, 2 兵)
 * Team B (Red - Red Advisors): 10 pieces (1 帥, 2 士, 2 車, 2 馬, 1 炮, 2 卒)
 * Team C (Black - Black Advisors): 10 pieces (same as Team B)
 */
const THREE_KINGDOMS_PIECE_COUNTS = {
  'team-a': {
    King: 1,    // 將
    Guard: 2,   // 士
    Minister: 2, // 相
    Rook: 2,    // 車
    Horse: 2,   // 馬
    Cannon: 1,  // 炮
    Pawn: 2,    // 兵
  },
  'team-b': {
    King: 1,    // 帥
    Guard: 2,   // 士
    Minister: 0, // 0 相
    Rook: 2,    // 車
    Horse: 2,   // 馬
    Cannon: 1,  // 炮
    Pawn: 2,    // 卒
  },
  'team-c': {
    King: 1,    // 帥
    Guard: 2,   // 士
    Minister: 0, // 0 象
    Rook: 2,    // 車
    Horse: 2,   // 馬
    Cannon: 1,  // 炮
    Pawn: 2,    // 卒
  },
};

/**
 * Create all pieces for a faction (Classic mode)
 */
function createClassicPiecesForFaction(factionId: string): Piece[] {
  const pieces: Piece[] = [];
  let pieceCounter = 1;

  for (const [type, count] of Object.entries(PIECE_COUNTS) as [PieceType, number][]) {
    for (let i = 0; i < count; i++) {
      pieces.push({
        id: `${factionId}-${type.toLowerCase()}-${pieceCounter++}`,
        type,
        factionId,
        isRevealed: false,
        isDead: false,
      });
    }
  }

  return pieces;
}

/**
 * Create all pieces for a faction (Three Kingdoms mode)
 */
function createThreeKingdomsPiecesForFaction(factionId: string): Piece[] {
  const pieces: Piece[] = [];
  let pieceCounter = 1;

  const pieceCounts = THREE_KINGDOMS_PIECE_COUNTS[factionId as keyof typeof THREE_KINGDOMS_PIECE_COUNTS];
  if (!pieceCounts) {
    throw new Error(`Unknown faction ID: ${factionId}`);
  }

  for (const [type, count] of Object.entries(pieceCounts) as [PieceType, number][]) {
    for (let i = 0; i < count; i++) {
      pieces.push({
        id: `${factionId}-${type.toLowerCase()}-${pieceCounter++}`,
        type,
        factionId,
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
 * Create initial match with shuffled board (Multi-mode support)
 * @param mode - Game mode (Classic or Three Kingdoms). Defaults to Classic.
 */
export function createInitialMatch(mode: GameMode = GAME_MODES.classic): Match {
  if (mode.id === 'classic') {
    return createClassicMatch(mode);
  } else if (mode.id === 'three-kingdoms') {
    return createThreeKingdomsMatch(mode);
  } else {
    throw new Error(`Unknown game mode: ${mode.id}`);
  }
}

/**
 * Create Classic mode match (2 players, 32 cells, all filled)
 */
function createClassicMatch(mode: GameMode): Match {
  // Create all pieces (16 red + 16 black)
  const redPieces = createClassicPiecesForFaction('red');
  const blackPieces = createClassicPiecesForFaction('black');
  const allPieces = [...redPieces, ...blackPieces];

  // Shuffle all pieces
  const shuffledPieces = shuffleArray(allPieces);

  // Create board (32 cells, all filled)
  const board: Board = new Array(mode.boardSize);
  for (let i = 0; i < mode.boardSize; i++) {
    board[i] = shuffledPieces[i];
  }

  return {
    status: 'waiting-first-flip',
    mode,
    factions: [RED_FACTION, BLACK_FACTION],
    activeFactions: ['red', 'black'],
    currentFactionIndex: 0,
    winner: null,
    board,
    capturedByFaction: { red: [], black: [] },
    movesWithoutCapture: null, // Classic has no draw counter
  };
}

/**
 * Create "Four Corners" (四角) layout for Three Kingdoms mode
 * Portrait 5×9 grid: 4 corner blocks (2×4 each), 13 empty center positions
 * 
 * Grid Layout (Portrait, 5 cols × 9 rows):
 * ◆ ◆ ○ ◆ ◆  ← Row 0 (Top)
 * ◆ ◆ ○ ◆ ◆  ← Row 1
 * ◆ ◆ ○ ◆ ◆  ← Row 2
 * ◆ ◆ ○ ◆ ◆  ← Row 3
 * ○ ○ ○ ○ ○  ← Row 4 (Center - Empty)
 * ◆ ◆ ○ ◆ ◆  ← Row 5
 * ◆ ◆ ○ ◆ ◆  ← Row 6
 * ◆ ◆ ○ ◆ ◆  ← Row 7
 * ◆ ◆ ○ ◆ ◆  ← Row 8 (Bottom)
 * 
 * @param pieces - 32 shuffled pieces to distribute into 4 corners
 * @returns Board with pieces in corners (45 elements, 32 pieces + 13 nulls)
 */
function createFourCornersLayout(pieces: Piece[]): Board {
  const GRID_COLS = 5;
  const GRID_ROWS = 9;
  const BOARD_SIZE = 45;

  // Initialize board with all nulls
  const board: Board = new Array(BOARD_SIZE).fill(null);

  // Define corner region indices for Portrait 5×9 grid
  // Index = row * GRID_COLS + col
  
  // Top-Left corner (Rows 0-3, Cols 0-1): 8 pieces
  const topLeft = [
    0, 1,      // Row 0
    5, 6,      // Row 1
    10, 11,    // Row 2
    15, 16,    // Row 3
  ];

  // Top-Right corner (Rows 0-3, Cols 3-4): 8 pieces
  const topRight = [
    3, 4,      // Row 0
    8, 9,      // Row 1
    13, 14,    // Row 2
    18, 19,    // Row 3
  ];

  // Bottom-Left corner (Rows 5-8, Cols 0-1): 8 pieces
  const bottomLeft = [
    25, 26,    // Row 5
    30, 31,    // Row 6
    35, 36,    // Row 7
    40, 41,    // Row 8
  ];

  // Bottom-Right corner (Rows 5-8, Cols 3-4): 8 pieces
  const bottomRight = [
    28, 29,    // Row 5
    33, 34,    // Row 6
    38, 39,    // Row 7
    43, 44,    // Row 8
  ];

  // Combine all corner indices (32 total)
  const cornerIndices = [...topLeft, ...topRight, ...bottomLeft, ...bottomRight];

  // Distribute shuffled pieces to corner positions (8 pieces per corner)
  for (let i = 0; i < cornerIndices.length; i++) {
    board[cornerIndices[i]] = pieces[i];
  }

  // Center positions remain null (13 positions):
  // - Col 2 (all rows): indices 2, 7, 12, 17, 22, 27, 32, 37, 42 (9 positions)
  // - Row 4 (all cols): indices 20, 21, 22, 23, 24 (5 positions)
  // Note: index 22 (Row 4, Col 2) is counted once
  // Total: 9 + 5 - 1 = 13 empty positions

  return board;
}

/**
 * Create Three Kingdoms mode match (3 players, 45 intersections, Four Corners layout)
 */
function createThreeKingdomsMatch(mode: GameMode): Match {
  // Create all pieces (12 + 10 + 10 = 32 pieces)
  const teamAPieces = createThreeKingdomsPiecesForFaction('team-a');
  const teamBPieces = createThreeKingdomsPiecesForFaction('team-b');
  const teamCPieces = createThreeKingdomsPiecesForFaction('team-c');
  const allPieces = [...teamAPieces, ...teamBPieces, ...teamCPieces];

  // Shuffle all 32 pieces before distributing to corners
  const shuffledPieces = shuffleArray(allPieces);

  // Create board with Four Corners (四角) layout
  const board = createFourCornersLayout(shuffledPieces);

  return {
    status: 'waiting-first-flip',
    mode,
    factions: [TEAM_A_FACTION, TEAM_B_FACTION, TEAM_C_FACTION],
    activeFactions: ['team-a', 'team-b', 'team-c'],
    currentFactionIndex: 0,
    winner: null,
    board,
    capturedByFaction: { 'team-a': [], 'team-b': [], 'team-c': [] },
    movesWithoutCapture: 60, // Three Kingdoms has 60-move draw counter
  };
}
