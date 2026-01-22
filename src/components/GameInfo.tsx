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

  // Determine turn indicator styling
  const getTurnStyle = () => {
    if (match.status !== 'in-progress') {
      return styles.statusText;
    }

    const factionColor = currentFaction?.color;
    if (factionColor === 'red') {
      return [styles.statusText, styles.turnIndicatorRed];
    } else if (factionColor === 'black') {
      return [styles.statusText, styles.turnIndicatorBlack];
    } else if (factionColor === 'green') {
      return [styles.statusText, styles.turnIndicatorGreen];
    }
    return styles.statusText;
  };

  return (
    <View style={styles.container}>
      <View style={match.status === 'in-progress' ? styles.turnIndicatorContainer : {}}>
        <Text style={getTurnStyle()}>
          {statusText}
          {winReasonText && <Text style={styles.winReason}> {winReasonText}</Text>}
        </Text>
      </View>

      {/* Player Avatars (supports both Classic and Three Kingdoms) */}
      <View style={styles.playerAvatarsContainer}>
        {Array.from({ length: match.mode.playerCount }, (_, playerIndex) => {
          const assignedFactionId = match.playerFactionMap[playerIndex];
          const assignedFaction = match.factions.find((f) => f.id === assignedFactionId);
          const isActive = match.currentPlayerIndex === playerIndex;

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
            <View key={playerIndex} style={styles.playerAvatarWrapper}>
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

      {match.status === 'in-progress' && (
        <View style={styles.captureInfo}>
          {match.factions.map((faction) => {
            const captured = match.capturedByFaction[faction.id]?.length || 0;
            const emoji = faction.color === 'red' ? '🔴' : faction.color === 'black' ? '⚫' : '🟢';
            return (
              <Text key={faction.id} style={styles.captureText}>
                {getFactionDisplayName(faction.id)}俘獲: {captured} {emoji}
              </Text>
            );
          })}
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
  turnIndicatorContainer: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 8,
  },
  statusText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#8B4513', // Brown
    marginBottom: 8,
  },
  turnIndicatorRed: {
    color: '#C62828', // Deep red
    fontSize: 28,
    borderWidth: 3,
    borderColor: '#C62828',
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: '#FFEBEE', // Light red background
    overflow: 'hidden',
  },
  turnIndicatorBlack: {
    color: '#1A1A1A', // Near black
    fontSize: 28,
    borderWidth: 3,
    borderColor: '#1A1A1A',
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: '#E0E0E0', // Light gray background
    overflow: 'hidden',
  },
  turnIndicatorGreen: {
    color: '#2E7D32', // Deep green
    fontSize: 28,
    borderWidth: 3,
    borderColor: '#2E7D32',
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: '#E8F5E9', // Light green background
    overflow: 'hidden',
  },
  winReason: {
    fontSize: 18,
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
  captureInfo: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginTop: 8,
  },
  captureText: {
    fontSize: 16,
    color: '#333',
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
    alignItems: 'center',
    marginTop: 12,
    marginBottom: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: '#FFFAF0', // Floral white
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#D7CCC8', // Light brown
  },
  playerAvatarWrapper: {
    alignItems: 'center',
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
    borderWidth: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
    elevation: 5,
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
});
