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
 * Create Three Kingdoms mode match (3 players, 45 intersections, 13 empty spots)
 */
function createThreeKingdomsMatch(mode: GameMode): Match {
  // Create all pieces (12 + 10 + 10 = 32 pieces)
  const teamAPieces = createThreeKingdomsPiecesForFaction('team-a');
  const teamBPieces = createThreeKingdomsPiecesForFaction('team-b');
  const teamCPieces = createThreeKingdomsPiecesForFaction('team-c');
  const allPieces = [...teamAPieces, ...teamBPieces, ...teamCPieces];

  // Shuffle all pieces
  const shuffledPieces = shuffleArray(allPieces);

  // Create board (45 intersections: 32 pieces + 13 nulls)
  const board: Board = new Array(mode.boardSize);
  
  // Fill first 32 positions with shuffled pieces
  for (let i = 0; i < allPieces.length; i++) {
    board[i] = shuffledPieces[i];
  }
  
  // Fill remaining 13 positions with nulls (empty intersections)
  for (let i = allPieces.length; i < mode.boardSize; i++) {
    board[i] = null;
  }

  // Shuffle the entire board (including nulls) for random distribution
  const shuffledBoard = shuffleArray(board);

  return {
    status: 'waiting-first-flip',
    mode,
    factions: [TEAM_A_FACTION, TEAM_B_FACTION, TEAM_C_FACTION],
    activeFactions: ['team-a', 'team-b', 'team-c'],
    currentFactionIndex: 0,
    winner: null,
    board: shuffledBoard,
    capturedByFaction: { 'team-a': [], 'team-b': [], 'team-c': [] },
    movesWithoutCapture: 60, // Three Kingdoms has 60-move draw counter
  };
}
