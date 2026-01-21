/**
 * GridCell - Tappable cell in the game board (T022)
 * Displays a piece and handles tap events
 */

import React from 'react';
import { TouchableOpacity, StyleSheet, ViewStyle, Dimensions } from 'react-native';
import { Piece } from '../core/types';
import { PieceComponent } from './PieceComponent';
import { BOARD_COLS } from '../core/boardUtils';

interface GridCellProps {
  piece: Piece | null;
  index: number;
  onTap: (index: number) => void;
  isSelected?: boolean;
}

// Calculate cell size based on screen width
const screenWidth = Dimensions.get('window').width;
const BOARD_PADDING = 16; // Padding from BoardView
const BORDER_WIDTH = 8; // Border from BoardView
const CELL_MARGIN = 1; // Margin around each cell
const availableWidth = screenWidth - (BOARD_PADDING * 2) - (BORDER_WIDTH * 2);
const CELL_SIZE = Math.floor((availableWidth - (CELL_MARGIN * 2 * BOARD_COLS)) / BOARD_COLS);

export const GridCell: React.FC<GridCellProps> = ({ piece, index, onTap, isSelected = false }) => {
  const handlePress = () => {
    onTap(index);
  };

  const cellStyle: ViewStyle[] = [styles.cell];
  if (isSelected) {
    cellStyle.push(styles.selected);
  }

  return (
    <TouchableOpacity style={cellStyle} onPress={handlePress} activeOpacity={0.7}>
      <PieceComponent piece={piece} />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  cell: {
    width: CELL_SIZE,
    height: CELL_SIZE,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#DEB887', // Burlywood (wooden board)
    borderWidth: 2,
    borderColor: '#8B6914', // Dark goldenrod (traditional board lines)
    margin: CELL_MARGIN,
    // Add subtle 3D effect for wooden feel
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  selected: {
    backgroundColor: '#FFD700', // Gold (highlighted)
    borderColor: '#FF8C00', // Dark orange (highlighted border)
    borderWidth: 3,
    elevation: 4,
  },
});
