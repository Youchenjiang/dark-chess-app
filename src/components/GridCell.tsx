/**
 * GridCell - Tappable cell in the game board (T022)
 * Displays a piece and handles tap events
 */

import React from 'react';
import { TouchableOpacity, StyleSheet, ViewStyle } from 'react-native';
import { Piece } from '../core/types';
import { PieceComponent } from './PieceComponent';

interface GridCellProps {
  piece: Piece | null;
  index: number;
  onTap: (index: number) => void;
  isSelected?: boolean;
}

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
    width: 80,
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#DEB887', // Burlywood (wooden board)
    borderWidth: 2,
    borderColor: '#8B6914', // Dark goldenrod (traditional board lines)
    margin: 1,
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
