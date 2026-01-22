/**
 * BoardView - Main game board container (T063)
 * Conditionally renders ClassicBoardRenderer or IntersectionBoardRenderer based on game mode
 */

import React, { useState } from 'react';
import { useGameStore } from '../store/gameStore';
import { ClassicBoardRenderer } from './ClassicBoardRenderer';
import { IntersectionBoardRenderer } from './IntersectionBoardRenderer';

export const BoardView: React.FC = () => {
  const { match, flipPiece, movePiece, capturePiece } = useGameStore();
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  if (!match) {
    return null;
  }

  const handleCellTap = (index: number) => {
    const piece = match.board[index];
    const currentFactionId = match.activeFactions[match.currentFactionIndex];

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
      if (piece !== null && piece.isRevealed && piece.factionId === currentFactionId) {
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
    if (piece.isRevealed && piece.factionId !== selectedPiece.factionId) {
      capturePiece(selectedIndex, index);
      setSelectedIndex(null);
      return;
    }

    // If tapped on another own piece, switch selection
    if (piece.isRevealed && piece.factionId === selectedPiece.factionId) {
      setSelectedIndex(index);
      return;
    }

    // Otherwise (face-down piece), deselect
    setSelectedIndex(null);
  };

  // Conditionally render board based on game mode
  if (match.mode.id === 'classic') {
    return (
      <ClassicBoardRenderer
        board={match.board}
        selectedIndex={selectedIndex}
        onCellTap={handleCellTap}
      />
    );
  } else if (match.mode.id === 'three-kingdoms') {
    return (
      <IntersectionBoardRenderer
        board={match.board}
        factions={match.factions}
        selectedIndex={selectedIndex}
        onCellTap={handleCellTap}
      />
    );
  }

  return null;
};
