/**
 * BoardView - Main game board component (T023)
 * Renders 4x8 grid and handles piece interactions (flip, move, capture)
 */

import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { useGameStore } from '../store/gameStore';
import { GridCell } from './GridCell';
import { ROWS, COLS, indexToRowCol } from '../core/boardUtils';

export const BoardView: React.FC = () => {
  const { match, flipPiece, movePiece, capturePiece } = useGameStore();
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  if (!match) {
    return null;
  }

  const handleCellTap = (index: number) => {
    const piece = match.board[index];

    // If match is waiting for first flip, only allow flip
    if (match.status === 'waiting-first-flip') {
      flipPiece(index);
      return;
    }

    // If match is ended, do nothing
    if (match.status === 'ended') {
      return;
    }

    // If no piece is selected yet
    if (selectedIndex === null) {
      // If tapped on a face-down piece, flip it
      if (piece !== null && !piece.isRevealed) {
        flipPiece(index);
        return;
      }

      // If tapped on a face-up own piece, select it
      if (piece !== null && piece.isRevealed && piece.color === match.currentTurn) {
        setSelectedIndex(index);
        return;
      }

      // Otherwise, do nothing
      return;
    }

    // If a piece is already selected
    const selectedPiece = match.board[selectedIndex]!;

    // If tapped on the same cell, deselect
    if (index === selectedIndex) {
      setSelectedIndex(null);
      return;
    }

    // If tapped on an empty cell, try to move
    if (piece === null) {
      movePiece(selectedIndex, index);
      setSelectedIndex(null);
      return;
    }

    // If tapped on an enemy piece, try to capture
    if (piece.isRevealed && piece.color !== selectedPiece.color) {
      capturePiece(selectedIndex, index);
      setSelectedIndex(null);
      return;
    }

    // If tapped on another own piece, switch selection
    if (piece.isRevealed && piece.color === selectedPiece.color) {
      setSelectedIndex(index);
      return;
    }

    // Otherwise (face-down piece), deselect
    setSelectedIndex(null);
  };

  // Render board as 4 rows × 8 columns
  const renderBoard = () => {
    const rows: JSX.Element[] = [];

    for (let row = 0; row < ROWS; row++) {
      const cells: JSX.Element[] = [];

      for (let col = 0; col < COLS; col++) {
        const index = row * COLS + col;
        const piece = match.board[index];

        cells.push(
          <GridCell
            key={index}
            piece={piece}
            index={index}
            onTap={handleCellTap}
            isSelected={index === selectedIndex}
          />
        );
      }

      rows.push(
        <View key={row} style={styles.row}>
          {cells}
        </View>
      );
    }

    return rows;
  };

  return <View style={styles.board}>{renderBoard()}</View>;
};

const styles = StyleSheet.create({
  board: {
    padding: 16,
    backgroundColor: '#F4E4C1', // Light tan (wooden board background)
    borderWidth: 8,
    borderColor: '#8B6914', // Dark goldenrod (board frame)
    borderRadius: 4,
    // Add subtle shadow for depth
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 5,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
});
