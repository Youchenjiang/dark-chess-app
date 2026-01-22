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

  // Get current faction info
  const currentFactionId = match.activeFactions[match.currentFactionIndex];
  const currentFaction = match.factions.find((f) => f.id === currentFactionId);

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

  // Game status text in Traditional Chinese
  let statusText = '';
  let winReasonText = '';
  
  if (match.status === 'waiting-first-flip') {
    // For Three Kingdoms: show player turn if in dynamic assignment phase
    if (match.mode.id === 'three-kingdoms') {
      const currentPlayer = match.currentPlayerIndex;
      const currentPlayerFaction = match.playerFactionMap[currentPlayer];
      
      if (currentPlayerFaction === null) {
        // Player not yet assigned - show player number
        statusText = `玩家 ${currentPlayer + 1} 回合 - 翻開棋子選擇陣營`; // Player X turn - flip to choose faction
      } else {
        // Player already assigned - show "waiting for others"
        statusText = `等待其他玩家選擇陣營...`; // Waiting for other players
      }
    } else {
      // Classic mode
      statusText = '點擊任意棋子開始遊戲'; // Tap any piece to start game
    }
  } else if (match.status === 'in-progress') {
    const turnText = getFactionDisplayName(currentFactionId);
    statusText = `${turnText}回合`; // [Faction] turn
  } else if (match.status === 'ended' && match.winner) {
    const winnerText = getFactionDisplayName(match.winner);
    statusText = `${winnerText}獲勝!`; // [Faction] wins!
    
    // Add win reason if available
    const winnerCaptured = match.capturedByFaction[match.winner]?.length || 0;
    const totalPiecesPerFaction = match.mode.id === 'classic' ? 16 : (match.mode.id === 'three-kingdoms' ? 22 : 0);
    
    if (winnerCaptured >= totalPiecesPerFaction) {
      winReasonText = '(全數吃光)'; // (capture-all)
    } else {
      winReasonText = '(對方無子可動)'; // (stalemate - opponent cannot move)
    }
  } else if (match.status === 'ended' && !match.winner) {
    statusText = '平局'; // Draw
    winReasonText = '(和棋)'; // (draw condition)
  }

  return (
    <View style={styles.container}>
      {/* Status Text (only for non-gameplay states) */}
      {match.status !== 'in-progress' && (
        <View style={styles.statusContainer}>
          <Text style={styles.statusText}>
            {statusText}
            {winReasonText && <Text style={styles.winReason}> {winReasonText}</Text>}
          </Text>
        </View>
      )}

      {/* Player Avatars with Captured Pieces (supports both Classic and Three Kingdoms) */}
      <View style={styles.playerAvatarsContainer}>
        {Array.from({ length: match.mode.playerCount }, (_, playerIndex) => {
          const assignedFactionId = match.playerFactionMap[playerIndex];
          const assignedFaction = match.factions.find((f) => f.id === assignedFactionId);
          const isActive = match.currentPlayerIndex === playerIndex;
          const capturedPieces = assignedFactionId ? match.capturedByFaction[assignedFactionId] || [] : [];

          // Color circle or "?" if unassigned
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

          return (
            <View key={playerIndex} style={styles.playerSection}>
              {/* Avatar */}
              <View style={styles.playerAvatarWrapper}>
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

              {/* Captured Pieces (Visual Mini-Icons) */}
              {match.status === 'in-progress' && capturedPieces.length > 0 && (
                <View style={styles.capturedPiecesContainer}>
                  {capturedPieces.slice(0, 6).map((piece, idx) => {
                    // Get Chinese character for the piece
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
                  {capturedPieces.length > 6 && (
                    <View style={styles.miniPieceIcon}>
                      <Text style={styles.miniPieceText}>+{capturedPieces.length - 6}</Text>
                    </View>
                  )}
                </View>
              )}
            </View>
          );
        })}
      </View>

      {/* Draw counter for Three Kingdoms mode */}
      {match.status === 'in-progress' && match.movesWithoutCapture !== null && (
        <View style={styles.drawCounterContainer}>
          <Text style={styles.drawCounterText}>
            距離和棋: {match.movesWithoutCapture} 步
          </Text>
        </View>
      )}

      {match.status === 'ended' && (
        <View style={styles.finalScoreInfo}>
          <Text style={styles.finalScoreText}>
            最終比數: {match.factions.map((f) => `${getFactionDisplayName(f.id)} ${match.capturedByFaction[f.id]?.length || 0}`).join(' - ')}
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#FFF8DC', // Cornsilk (light yellow)
    alignItems: 'center',
  },
  statusContainer: {
    marginBottom: 12,
  },
  statusText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#8B4513', // Brown
    textAlign: 'center',
  },
  winReason: {
    fontSize: 16,
    color: '#666',
    fontWeight: 'normal',
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
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 4,
    maxWidth: 100,
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
