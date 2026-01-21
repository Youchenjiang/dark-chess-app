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

// Calculate font size based on screen width
const screenWidth = Dimensions.get('window').width;
const BOARD_PADDING = 16;
const BORDER_WIDTH = 8;
const CELL_MARGIN = 1;
const availableWidth = screenWidth - (BOARD_PADDING * 2) - (BORDER_WIDTH * 2);
const CELL_SIZE = Math.floor((availableWidth - (CELL_MARGIN * 2 * BOARD_COLS)) / BOARD_COLS);
const FONT_SIZE = Math.floor(CELL_SIZE * 0.5); // Font size is 50% of cell size

// Chinese characters for each piece type
const PIECE_LABELS: Record<Piece['type'], string> = {
  king: '帥',    // Red: 帥, Black: 將
  guard: '仕',   // Red: 仕, Black: 士
  minister: '相', // Red: 相, Black: 象
  rook: '俥',    // Red: 俥, Black: 車
  horse: '傌',   // Red: 傌, Black: 馬
  cannon: '炮',  // Red: 炮, Black: 包
  pawn: '兵',    // Red: 兵, Black: 卒
};

// Alternative characters for black pieces (traditional)
const PIECE_LABELS_BLACK: Record<Piece['type'], string> = {
  king: '將',
  guard: '士',
  minister: '象',
  rook: '車',
  horse: '馬',
  cannon: '包',
  pawn: '卒',
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
