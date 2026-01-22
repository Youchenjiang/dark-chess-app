/**
 * Core domain types for Banqi (Dark Chess) game
 * Pure TypeScript - NO React dependencies
 */

export type PieceType = 'King' | 'Guard' | 'Minister' | 'Rook' | 'Horse' | 'Cannon' | 'Pawn';

export type PieceColor = 'red' | 'black';

export type FactionColor = 'red' | 'black' | 'green';

export type MatchStatus = 'waiting-first-flip' | 'in-progress' | 'ended';

// Forward declarations for RuleSet
export interface RuleSet {
  validateMove(match: Match, fromIndex: number, toIndex: number): ValidationResult;
  validateCapture(match: Match, fromIndex: number, toIndex: number): ValidationResult;
  checkWinCondition(match: Match): WinResult;
  checkDrawCondition(match: Match): boolean;
  getLegalMoves(match: Match): LegalMoveSet;
  getAdjacentIndices(index: number, boardSize: number): number[];
  canPieceCapture(attacker: Piece, target: Piece): boolean;
}

// NEW: GameMode interface for multi-mode support
export interface GameMode {
  id: string;
  name: string;
  boardSize: number;
  gridDimensions: { rows: number; cols: number };
  playerCount: number;
  ruleSet: RuleSet;
}

// NEW: Faction interface for N-player support
export interface Faction {
  id: string;
  displayName: string;
  color: FactionColor;
  pieceCount: number;
  isEliminated: boolean;
}

// MODIFIED: Piece now uses factionId instead of color
export interface Piece {
  id: string;
  type: PieceType;
  factionId: string; // References Faction.id
  isRevealed: boolean;
  isDead: boolean;
}

export type Board = Array<Piece | null>; // Dynamic size (32 for Classic, 45 for Three Kingdoms)

// MODIFIED: Match structure for multi-mode support
export interface Match {
  status: MatchStatus;
  mode: GameMode;
  factions: Faction[];
  activeFactions: string[]; // Non-eliminated faction IDs
  currentFactionIndex: number; // Index into activeFactions
  currentPlayerIndex: number; // For Three Kingdoms: current player (0, 1, 2) - used during First Flip phase
  playerFactionMap: Record<number, string | null>; // Player index -> Faction ID (null = unassigned)
  winner: string | null; // Winning faction ID
  board: Board;
  capturedByFaction: Record<string, Piece[]>; // Captured pieces per faction
  movesWithoutCapture: number | null; // Draw counter (null for Classic, 60 for Three Kingdoms)
}

export type ActionType = 'flip' | 'move' | 'capture';

export interface FlipAction {
  type: 'flip';
  pieceIndex: number;
}

export interface MoveAction {
  type: 'move';
  fromIndex: number;
  toIndex: number;
}

export interface CaptureAction {
  type: 'capture';
  fromIndex: number;
  toIndex: number;
}

export type Action = FlipAction | MoveAction | CaptureAction;

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

export interface WinResult {
  hasEnded: boolean;
  winner?: string; // Faction ID (was PieceColor, now supports N players)
  reason?: 'capture-all' | 'elimination' | 'stalemate';
}

export interface LegalMoveSet {
  flips: number[];
  moves: Array<{ fromIndex: number; toIndex: number }>;
  captures: Array<{ fromIndex: number; toIndex: number }>;
}
