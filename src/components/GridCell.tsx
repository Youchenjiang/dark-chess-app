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
    backgroundColor: '#D2B48C', // Tan (wooden board)
    borderWidth: 1,
    borderColor: '#8B4513', // Brown border
    margin: 2,
  },
  selected: {
    backgroundColor: '#F4A460', // Sandy brown (highlighted)
    borderColor: '#FF6347', // Tomato (highlighted border)
    borderWidth: 2,
  },
});
