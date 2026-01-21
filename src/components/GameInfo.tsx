/**
 * GameInfo - Display game status info (T024)
 * Shows current turn, side assignment, and captured pieces count
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

  // Game status text in Traditional Chinese
  let statusText = '';
  if (match.status === 'waiting-first-flip') {
    statusText = '點擊任意棋子開始遊戲'; // Tap any piece to start game
  } else if (match.status === 'in-progress' && match.currentTurn) {
    const turnText = match.currentTurn === 'red' ? '紅方' : '黑方'; // Red side / Black side
    statusText = `${turnText}回合`; // [Side] turn
  } else if (match.status === 'ended' && match.winner) {
    const winnerText = match.winner === 'red' ? '紅方' : '黑方';
    statusText = `${winnerText}獲勝!`; // [Side] wins!
  }

  return (
    <View style={styles.container}>
      <Text style={styles.statusText}>{statusText}</Text>

      {match.status === 'in-progress' && (
        <View style={styles.captureInfo}>
          <Text style={styles.captureText}>
            紅方俘獲: {match.redCaptured.length} 🔴
          </Text>
          <Text style={styles.captureText}>
            黑方俘獲: {match.blackCaptured.length} ⚫
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
  statusText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#8B4513', // Brown
    marginBottom: 8,
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
});
