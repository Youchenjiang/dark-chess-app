/**
 * GameInfo - Display game status info (Multi-mode support)
 * Shows current turn, side assignment, captured pieces count, draw counter
 * All UI text in Traditional Chinese
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useGameStore } from '../store/gameStore';

export const GameInfo: React.FC = () => {
  const { match } = useGameStore();

  if (!match) {
    return null;
  }

  // Faction display names
  const getFactionDisplayName = (factionId: string): string => {
    const factionNames: Record<string, string> = {
      'red': '紅方',
      'black': '黑方',
      'team-a': '將軍陣營', // Generals' Army
      'team-b': '紅國陣營', // Red Advisors
      'team-c': '黑國陣營', // Black Advisors
    };
    return factionNames[factionId] || factionId;
  };

  // Helper: Get player color and label
  const getPlayerInfo = (assignedFaction: any) => {
    let playerColor = '#9E9E9E'; // Gray default
    let playerLabel = '?';
    if (assignedFaction) {
      if (assignedFaction.color === 'green') {
        playerColor = '#2E7D32';
        playerLabel = '綠';
      } else if (assignedFaction.color === 'red') {
        playerColor = '#C62828';
        playerLabel = '紅';
      } else if (assignedFaction.color === 'black') {
        playerColor = '#212121';
        playerLabel = '黑';
      }
    }
    return { playerColor, playerLabel };
  };

  // Render single player info
  const renderPlayerInfo = (playerIndex: number) => {
    const assignedFactionId = match.playerFactionMap[playerIndex];
    const assignedFaction = match.factions.find((f) => f.id === assignedFactionId);
    const isActive = match.currentPlayerIndex === playerIndex;
    const capturedPieces = assignedFactionId ? match.capturedByFaction[assignedFactionId] || [] : [];
    const { playerColor, playerLabel } = getPlayerInfo(assignedFaction);

    return (
      <View key={playerIndex} style={styles.sidePlayerSection} pointerEvents="box-none">
        <View style={styles.playerAvatarWrapper} pointerEvents="auto">
          <View 
            style={[
              styles.playerAvatar, 
              { borderColor: playerColor },
              isActive && styles.playerAvatarActive,
            ]}
          >
            <Text style={[styles.playerAvatarText, { color: playerColor }]}>
              {playerLabel}
            </Text>
          </View>
          <Text style={styles.playerAvatarLabel}>P{playerIndex + 1}</Text>
        </View>

        {/* Captured Pieces (Visual Mini-Icons) - Vertical Column */}
        {match.status === 'in-progress' && capturedPieces.length > 0 && (
          <View style={styles.capturedPiecesContainer}>
            {capturedPieces.slice(0, 20).map((piece, idx) => {
              const pieceLabels: Record<string, string> = {
                'King': '將', 'Guard': '士', 'Minister': '相',
                'Rook': '車', 'Horse': '馬', 'Cannon': '炮', 'Pawn': '兵',
              };
              return (
                <View key={`${piece.id}-${idx}`} style={styles.miniPieceIcon}>
                  <Text style={styles.miniPieceText}>
                    {pieceLabels[piece.type] || '棋'}
                  </Text>
                </View>
              );
            })}
            {capturedPieces.length > 20 && (
              <View style={styles.miniPieceIcon}>
                <Text style={styles.miniPieceText}>+{capturedPieces.length - 20}</Text>
              </View>
            )}
          </View>
        )}
      </View>
    );
  };

  // Classic mode: Side-by-side layout (left: P1, right: P2)
  if (match.mode.id === 'classic') {
    return (
      <>
        {/* Left side: P1 */}
        <View style={styles.leftSideContainer}>
          {renderPlayerInfo(0)}
        </View>
        {/* Right side: P2 */}
        <View style={styles.rightSideContainer}>
          {renderPlayerInfo(1)}
        </View>
      </>
    );
  }

  // Three Kingdoms mode: Side layout (left: P1, right: P2 & P3)
  return (
    <>
      {/* Left side: P1 */}
      <View style={styles.leftSideContainer}>
        {renderPlayerInfo(0)}
      </View>
      {/* Right side: P2 and P3 stacked vertically */}
      <View style={styles.rightSideContainer}>
        <View style={styles.rightSidePlayersWrapper}>
          {renderPlayerInfo(1)}
          {renderPlayerInfo(2)}
        </View>
      </View>
      {/* Draw counter and final score - positioned at top center */}
      {match.status === 'in-progress' && match.movesWithoutCapture !== null && (
        <View style={styles.drawCounterOverlay}>
          <Text style={styles.drawCounterText}>
            距離和棋: {match.movesWithoutCapture} 步
          </Text>
        </View>
      )}
      {match.status === 'ended' && (
        <View style={styles.finalScoreOverlay}>
          <Text style={styles.finalScoreText}>
            最終比數: {match.factions.map((f) => `${getFactionDisplayName(f.id)} ${match.capturedByFaction[f.id]?.length || 0}`).join(' - ')}
          </Text>
        </View>
      )}
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#FFF8DC', // Cornsilk (light yellow)
    alignItems: 'center',
  },
  leftSideContainer: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 60, // Fixed width for left side
    paddingLeft: 4,
    paddingVertical: 8,
    alignItems: 'center',
    pointerEvents: 'box-none', // Allow touches to pass through to board
  },
  rightSideContainer: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: 60, // Fixed width for right side
    paddingRight: 4,
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'flex-start',
    pointerEvents: 'box-none', // Allow touches to pass through to board
  },
  rightSidePlayersWrapper: {
    alignItems: 'center',
    gap: 16, // Space between P2 and P3
  },
  drawCounterOverlay: {
    position: 'absolute',
    top: 8,
    left: '50%',
    transform: [{ translateX: -75 }], // Center horizontally (approximate)
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: '#FFF3E0', // Light orange
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#FF9800', // Orange
    pointerEvents: 'box-none',
  },
  finalScoreOverlay: {
    position: 'absolute',
    top: 8,
    left: '50%',
    transform: [{ translateX: -100 }], // Center horizontally (approximate)
    pointerEvents: 'box-none',
  },
  sidePlayerSection: {
    alignItems: 'center',
    width: '100%',
    pointerEvents: 'box-none',
  },
  drawCounterContainer: {
    marginTop: 8,
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: '#FFF3E0', // Light orange
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#FF9800', // Orange
  },
  drawCounterText: {
    fontSize: 14,
    color: '#E65100', // Dark orange
    fontWeight: 'bold',
    textAlign: 'center',
  },
  finalScoreInfo: {
    marginTop: 8,
  },
  finalScoreText: {
    fontSize: 18,
    color: '#8B4513',
    fontWeight: 'bold',
  },
  playerAvatarsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-start',
    width: '100%',
    marginTop: 8,
    marginBottom: 8,
    paddingVertical: 12,
    paddingHorizontal: 8,
    backgroundColor: '#FFFAF0', // Floral white
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#D7CCC8', // Light brown
  },
  playerSection: {
    alignItems: 'center',
    flex: 1,
  },
  playerAvatarWrapper: {
    alignItems: 'center',
    marginBottom: 8,
  },
  playerAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 3,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFF',
  },
  playerAvatarActive: {
    borderWidth: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.5,
    shadowRadius: 5,
    elevation: 8,
    // Add glowing effect
    transform: [{ scale: 1.1 }],
  },
  playerAvatarText: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  playerAvatarLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#6D4C41',
    marginTop: 4,
  },
  capturedPiecesContainer: {
    flexDirection: 'column', // Vertical column (直排)
    justifyContent: 'flex-start',
    alignItems: 'center',
    marginTop: 8,
    width: '100%',
  },
  miniPieceIcon: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#E0E0E0',
    borderWidth: 1,
    borderColor: '#999',
    justifyContent: 'center',
    alignItems: 'center',
    margin: 2,
  },
  miniPieceText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#333',
  },
});
