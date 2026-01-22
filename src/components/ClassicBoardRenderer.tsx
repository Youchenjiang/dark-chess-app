/**
 * ClassicBoardRenderer - Renders 8x4 grid for Classic Dark Chess (T059-T060)
 * Cell-based layout with pieces in boxes
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Board } from '../core/types';
import { GridCell } from './GridCell';
import { BOARD_ROWS, BOARD_COLS } from '../core/boardUtils';

interface ClassicBoardRendererProps {
  board: Board;
  selectedIndex: number | null;
  onCellTap: (index: number) => void;
}

export const ClassicBoardRenderer: React.FC<ClassicBoardRendererProps> = ({
  board,
  selectedIndex,
  onCellTap,
}) => {
  // Render board as 8 rows × 4 columns (portrait layout)
  const renderBoard = () => {
    const rows: JSX.Element[] = [];

    for (let row = 0; row < BOARD_ROWS; row++) {
      const cells: JSX.Element[] = [];

      for (let col = 0; col < BOARD_COLS; col++) {
        const index = row * BOARD_COLS + col;
        const piece = board[index];

        cells.push(
          <GridCell
            key={index}
            piece={piece}
            index={index}
            onTap={onCellTap}
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
