/**
 * Core domain types for Banqi (Dark Chess) game
 * Pure TypeScript - NO React dependencies
 */

export type PieceType = 'King' | 'Guard' | 'Minister' | 'Rook' | 'Horse' | 'Cannon' | 'Pawn';

export type PieceColor = 'red' | 'black';

export type MatchStatus = 'waiting-first-flip' | 'in-progress' | 'ended';

export interface Piece {
  id: string;
  type: PieceType;
  color: PieceColor;
  isRevealed: boolean;
  isDead: boolean;
}

export type Board = Array<Piece | null>; // 32 elements (4x8 grid as 1D array)

export interface Match {
  status: MatchStatus;
  currentTurn: PieceColor | null;
  winner: PieceColor | null;
  board: Board;
  redCaptured: Piece[];
  blackCaptured: Piece[];
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
  winner?: PieceColor;
  reason?: 'capture-all' | 'stalemate';
}

export interface LegalMoveSet {
  flips: number[];
  moves: Array<{ fromIndex: number; toIndex: number }>;
  captures: Array<{ fromIndex: number; toIndex: number }>;
}
