/**
 * PieceComponent - Display a single Chinese Chess piece (T021)
 * Shows face-down (hidden) or face-up (revealed with Chinese character)
 */

import React from 'react';
import { Text, StyleSheet, Dimensions } from 'react-native';
import { Piece } from '../core/types';
import { BOARD_COLS } from '../core/boardUtils';

interface PieceComponentProps {
  piece: Piece | null;
}

// Calculate font size based on screen dimensions (responsive)
const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
const BOARD_PADDING = 16;
const BORDER_WIDTH = 8;
const CELL_MARGIN = 1;
const HEADER_FOOTER_SPACE = 200;
const BOARD_ROWS = 8;

// Calculate max cell size based on both width and height constraints
const availableWidth = screenWidth - (BOARD_PADDING * 2) - (BORDER_WIDTH * 2);
const availableHeight = screenHeight - HEADER_FOOTER_SPACE;

const cellSizeByWidth = Math.floor((availableWidth - (CELL_MARGIN * 2 * BOARD_COLS)) / BOARD_COLS);
const cellSizeByHeight = Math.floor((availableHeight - (CELL_MARGIN * 2 * BOARD_ROWS)) / BOARD_ROWS);

const CELL_SIZE = Math.min(cellSizeByWidth, cellSizeByHeight);
const FONT_SIZE = Math.floor(CELL_SIZE * 0.5); // Font size is 50% of cell size

// Chinese characters for each piece type (PascalCase keys match PieceType)
const PIECE_LABELS: Record<Piece['type'], string> = {
  King: '帥',      // Red: 帥, Black: 將
  Guard: '仕',     // Red: 仕, Black: 士
  Minister: '相',   // Red: 相, Black: 象
  Rook: '俥',      // Red: 俥, Black: 車
  Horse: '傌',     // Red: 傌, Black: 馬
  Cannon: '炮',    // Red: 炮, Black: 包
  Pawn: '兵',      // Red: 兵, Black: 卒
};

// Alternative characters for black pieces (traditional)
const PIECE_LABELS_BLACK: Record<Piece['type'], string> = {
  King: '將',
  Guard: '士',
  Minister: '象',
  Rook: '車',
  Horse: '馬',
  Cannon: '包',
  Pawn: '卒',
};

export const PieceComponent: React.FC<PieceComponentProps> = ({ piece }) => {
  if (piece === null) {
    return <Text style={styles.empty}></Text>;
  }

  if (!piece.isRevealed) {
    // Face-down piece
    return <Text style={[styles.piece, styles.faceDown]}>🀫</Text>;
  }

  // Face-up piece - show Chinese character with color
  const label = piece.color === 'red' ? PIECE_LABELS[piece.type] : PIECE_LABELS_BLACK[piece.type];
  const colorStyle = piece.color === 'red' ? styles.red : styles.black;

  return <Text style={[styles.piece, styles.faceUp, colorStyle]}>{label}</Text>;
};

const styles = StyleSheet.create({
  empty: {
    fontSize: FONT_SIZE,
  },
  piece: {
    fontSize: FONT_SIZE,
    fontWeight: 'bold',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  faceDown: {
    color: '#6B4423', // Dark brown for face-down
    fontSize: Math.floor(FONT_SIZE * 0.8),
  },
  faceUp: {
    fontSize: FONT_SIZE,
  },
  red: {
    color: '#C62828', // Deep red (traditional)
    textShadowColor: 'rgba(139, 0, 0, 0.3)',
  },
  black: {
    color: '#1A1A1A', // Near black (traditional)
    textShadowColor: 'rgba(0, 0, 0, 0.4)',
  },
});
