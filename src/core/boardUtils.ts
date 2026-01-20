/**
 * Board coordinate and utility functions
 * Pure TypeScript - NO React dependencies
 */

import { Board, Piece } from './types';

/**
 * Board dimensions
 */
export const BOARD_ROWS = 4;
export const BOARD_COLS = 8;
export const BOARD_SIZE = BOARD_ROWS * BOARD_COLS; // 32

/**
 * Convert 1D index to row/column
 */
export function indexToRowCol(index: number): { row: number; col: number } {
  if (index < 0 || index >= BOARD_SIZE) {
    throw new Error(`Invalid board index: ${index}`);
  }
  return {
    row: Math.floor(index / BOARD_COLS),
    col: index % BOARD_COLS,
  };
}

/**
 * Convert row/column to 1D index
 */
export function rowColToIndex(row: number, col: number): number {
  if (row < 0 || row >= BOARD_ROWS || col < 0 || col >= BOARD_COLS) {
    throw new Error(`Invalid board coordinates: row=${row}, col=${col}`);
  }
  return row * BOARD_COLS + col;
}

/**
 * Check if an index is valid (0-31)
 */
export function isValidIndex(index: number): boolean {
  return index >= 0 && index < BOARD_SIZE;
}

/**
 * Check if two indices are orthogonally adjacent (1 step horizontal or vertical)
 */
export function isAdjacent(index1: number, index2: number): boolean {
  if (!isValidIndex(index1) || !isValidIndex(index2)) {
    return false;
  }
  const { row: row1, col: col1 } = indexToRowCol(index1);
  const { row: row2, col: col2 } = indexToRowCol(index2);

  const rowDiff = Math.abs(row1 - row2);
  const colDiff = Math.abs(col1 - col2);

  // Adjacent if exactly one step in one direction
  return (rowDiff === 1 && colDiff === 0) || (rowDiff === 0 && colDiff === 1);
}

/**
 * Get all indices in a straight line from start to end (for Cannon screen detection)
 * Returns empty array if not in a straight line
 */
export function getLineIndices(startIndex: number, endIndex: number): number[] {
  if (!isValidIndex(startIndex) || !isValidIndex(endIndex)) {
    return [];
  }

  const { row: startRow, col: startCol } = indexToRowCol(startIndex);
  const { row: endRow, col: endCol } = indexToRowCol(endIndex);

  const rowDiff = endRow - startRow;
  const colDiff = endCol - startCol;

  // Must be in a straight line (horizontal, vertical, or diagonal)
  if (rowDiff !== 0 && colDiff !== 0 && Math.abs(rowDiff) !== Math.abs(colDiff)) {
    return [];
  }

  const indices: number[] = [];
  const steps = Math.max(Math.abs(rowDiff), Math.abs(colDiff));
  const rowStep = rowDiff === 0 ? 0 : rowDiff / steps;
  const colStep = colDiff === 0 ? 0 : colDiff / steps;

  for (let i = 1; i < steps; i++) {
    const row = startRow + rowStep * i;
    const col = startCol + colStep * i;
    indices.push(rowColToIndex(row, col));
  }

  return indices;
}

/**
 * Count pieces between two indices (for Cannon screen rule)
 * Returns count of non-null pieces in the line
 */
export function countPiecesBetween(board: Board, startIndex: number, endIndex: number): number {
  const lineIndices = getLineIndices(startIndex, endIndex);
  return lineIndices.filter((idx) => board[idx] !== null).length;
}

/**
 * Check if there is exactly one piece (screen) between Cannon and target
 */
export function hasExactlyOneScreen(
  board: Board,
  cannonIndex: number,
  targetIndex: number
): boolean {
  return countPiecesBetween(board, cannonIndex, targetIndex) === 1;
}
