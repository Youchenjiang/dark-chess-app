/**
 * IntersectionBoardRenderer - Renders Portrait 5×9 intersection grid for Three Kingdoms Dark Chess
 * Portrait orientation: 5 columns × 9 rows (aligned with phone's long edge)
 * Features: Four Corners layout, grid lines, intersection points, SafeAreaView
 */

import React from 'react';
import { View, StyleSheet, TouchableOpacity, Dimensions, SafeAreaView } from 'react-native';
import { Board } from '../core/types';
import { PieceComponent } from './PieceComponent';

interface IntersectionBoardRendererProps {
  board: Board;
  selectedIndex: number | null;
  onCellTap: (index: number) => void;
}

// Board dimensions for Three Kingdoms: Portrait 5×9 (5 columns × 9 rows = 45 intersections)
const GRID_COLS = 5;
const GRID_ROWS = 9;
const TOTAL_INTERSECTIONS = 45;

// Calculate intersection spacing based on screen dimensions (Portrait orientation)
const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
const BOARD_PADDING = 24;
const HEADER_FOOTER_SPACE = 280; // Space for header, mode selector, game info, footer

const availableWidth = screenWidth - (BOARD_PADDING * 2);
const availableHeight = screenHeight - HEADER_FOOTER_SPACE;

// Calculate spacing (Portrait: height is primary constraint for 9 rows)
const INTERSECTION_SPACING_X = Math.floor(availableWidth / (GRID_COLS - 1)); // 4 spacings for 5 columns
const INTERSECTION_SPACING_Y = Math.floor(availableHeight / (GRID_ROWS - 1)); // 8 spacings for 9 rows

// Use smaller spacing to maintain aspect ratio and prevent overflow
const INTERSECTION_SPACING = Math.min(INTERSECTION_SPACING_X, INTERSECTION_SPACING_Y, 60);

// Piece/dot size (dynamic based on spacing)
const PIECE_SIZE = Math.min(INTERSECTION_SPACING * 0.8, 48);
const EMPTY_DOT_SIZE = 8;

export const IntersectionBoardRenderer: React.FC<IntersectionBoardRendererProps> = ({
  board,
  selectedIndex,
  onCellTap,
}) => {
  // Convert linear index to grid coordinates
  const indexToCoords = (index: number): { row: number; col: number } => {
    const row = Math.floor(index / GRID_COLS);
    const col = index % GRID_COLS;
    return { row, col };
  };

  // Render a single intersection point
  const renderIntersection = (index: number) => {
    if (index >= TOTAL_INTERSECTIONS) return null;

    const piece = board[index];
    const { row, col } = indexToCoords(index);
    const isSelected = index === selectedIndex;

    const positionStyle = {
      top: row * INTERSECTION_SPACING,
      left: col * INTERSECTION_SPACING,
    };

    return (
      <TouchableOpacity
        key={index}
        testID={`intersection-${index}`}
        style={[styles.intersection, positionStyle, isSelected && styles.selected]}
        onPress={() => onCellTap(index)}
        activeOpacity={0.7}
      >
        {piece === null ? (
          // Empty intersection: render small dot
          <View style={styles.emptyDot} />
        ) : (
          // Piece at intersection
          <View style={styles.pieceContainer}>
            <PieceComponent piece={piece} />
          </View>
        )}
      </TouchableOpacity>
    );
  };

  // Render all intersections
  const renderAllIntersections = () => {
    const intersections: JSX.Element[] = [];
    for (let i = 0; i < TOTAL_INTERSECTIONS; i++) {
      intersections.push(renderIntersection(i));
    }
    return intersections;
  };

  // Render horizontal grid lines
  const renderHorizontalLines = () => {
    const lines: JSX.Element[] = [];
    for (let row = 0; row < GRID_ROWS; row++) {
      lines.push(
        <View
          key={`h-line-${row}`}
          style={[
            styles.horizontalLine,
            {
              top: row * INTERSECTION_SPACING,
              width: (GRID_COLS - 1) * INTERSECTION_SPACING,
            },
          ]}
        />
      );
    }
    return lines;
  };

  // Render vertical grid lines
  const renderVerticalLines = () => {
    const lines: JSX.Element[] = [];
    for (let col = 0; col < GRID_COLS; col++) {
      lines.push(
        <View
          key={`v-line-${col}`}
          style={[
            styles.verticalLine,
            {
              left: col * INTERSECTION_SPACING,
              height: (GRID_ROWS - 1) * INTERSECTION_SPACING,
            },
          ]}
        />
      );
    }
    return lines;
  };

  const boardWidth = (GRID_COLS - 1) * INTERSECTION_SPACING;
  const boardHeight = (GRID_ROWS - 1) * INTERSECTION_SPACING;

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={[styles.board, { width: boardWidth, height: boardHeight }]}>
          {/* Grid lines (rendered first, so pieces are on top) */}
          {renderHorizontalLines()}
          {renderVerticalLines()}

          {/* Intersection points with pieces/dots */}
          {renderAllIntersections()}
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#2C2416', // Dark wooden background
  },
  container: {
    flex: 1,
    padding: BOARD_PADDING,
    alignItems: 'center',
    justifyContent: 'center',
  },
  board: {
    position: 'relative',
    backgroundColor: '#F4E4C1', // Light tan (wooden board background)
    padding: 12,
    borderWidth: 6,
    borderColor: '#8B6914', // Dark goldenrod (board frame)
    borderRadius: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 5,
  },
  horizontalLine: {
    position: 'absolute',
    height: 2,
    backgroundColor: '#8B6914',
  },
  verticalLine: {
    position: 'absolute',
    width: 2,
    backgroundColor: '#8B6914',
  },
  intersection: {
    position: 'absolute',
    width: PIECE_SIZE,
    height: PIECE_SIZE,
    justifyContent: 'center',
    alignItems: 'center',
    // Center the piece on the intersection
    transform: [
      { translateX: -PIECE_SIZE / 2 },
      { translateY: -PIECE_SIZE / 2 },
    ],
  },
  selected: {
    backgroundColor: '#FFD70080', // Semi-transparent gold
    borderRadius: PIECE_SIZE / 2,
    borderWidth: 2,
    borderColor: '#FF8C00',
  },
  emptyDot: {
    width: EMPTY_DOT_SIZE,
    height: EMPTY_DOT_SIZE,
    borderRadius: EMPTY_DOT_SIZE / 2,
    backgroundColor: '#8B6914',
    opacity: 0.4,
  },
  pieceContainer: {
    width: PIECE_SIZE,
    height: PIECE_SIZE,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
