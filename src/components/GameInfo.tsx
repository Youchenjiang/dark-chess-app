/**
 * GameInfo - Display game status info (T024, T035)
 * Shows current turn, side assignment, captured pieces count, and error messages
 * All UI text in Traditional Chinese
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useGameStore } from '../store/gameStore';

export const GameInfo: React.FC = () => {
  const { match, error, clearError } = useGameStore();

  if (!match) {
    return null;
  }

  // Game status text in Traditional Chinese (T046)
  let statusText = '';
  let winReasonText = '';
  
  if (match.status === 'waiting-first-flip') {
    statusText = '點擊任意棋子開始遊戲'; // Tap any piece to start game
  } else if (match.status === 'in-progress' && match.currentTurn) {
    const turnText = match.currentTurn === 'red' ? '紅方' : '黑方'; // Red side / Black side
    statusText = `${turnText}回合`; // [Side] turn
  } else if (match.status === 'ended' && match.winner) {
    const winnerText = match.winner === 'red' ? '紅方' : '黑方';
    statusText = `${winnerText}獲勝!`; // [Side] wins!
    
    // Add win reason if available
    // Note: WinResult reason is not directly stored in Match, but can be inferred
    // For now, we'll check captured counts to determine reason
    const redCaptured = match.redCaptured.length;
    const blackCaptured = match.blackCaptured.length;
    
    if (match.winner === 'red' && redCaptured >= 16) {
      winReasonText = '(全數吃光)'; // (capture-all)
    } else if (match.winner === 'black' && blackCaptured >= 16) {
      winReasonText = '(全數吃光)'; // (capture-all)
    } else {
      winReasonText = '(對方無子可動)'; // (stalemate - opponent cannot move)
    }
  }

  // Translate error messages to Traditional Chinese (T035)
  const translateError = (errorMsg: string | null): string => {
    if (!errorMsg) return '';

    const translations: Record<string, string> = {
      'No match in progress': '沒有進行中的遊戲',
      'Invalid flip': '無效的翻牌',
      'Invalid move': '無效的移動',
      'Invalid capture': '無效的吃子',
      'Match already ended': '遊戲已結束',
      'Invalid piece index': '無效的棋子位置',
      'No piece at index': '該位置沒有棋子',
      'Piece already revealed': '棋子已翻開',
      'Match not in progress': '遊戲尚未開始',
      'Invalid indices': '無效的位置',
      'No piece at source index': '起始位置沒有棋子',
      'Piece not revealed': '棋子尚未翻開',
      "Not current player's turn": '現在不是你的回合',
      'Destination not adjacent': '目標位置不相鄰',
      'Destination not empty': '目標位置不是空的',
      'No piece at attacker index': '進攻位置沒有棋子',
      'Attacker not revealed': '進攻棋子尚未翻開',
      'No piece at target index': '目標位置沒有棋子',
      'Target not revealed': '目標棋子尚未翻開',
      'Target is own piece': '目標是自己的棋子',
      'Target not adjacent': '目標位置不相鄰',
      'Cannon target not in straight line': '炮的目標必須在同一直線上',
      'Cannon cannot capture adjacent piece': '炮不能吃相鄰的棋子',
      'Cannon requires exactly one screen to capture': '炮必須跳過恰好一個棋子才能吃子',
      'King cannot capture Pawn': '帥(將)不能吃兵(卒)',
      'Invalid capture: rank too low': '無效吃子:等級太低',
    };

    return translations[errorMsg] || errorMsg;
  };

  // Determine turn indicator styling
  const getTurnStyle = () => {
    if (match.status !== 'in-progress' || !match.currentTurn) {
      return styles.statusText;
    }
    return match.currentTurn === 'red' 
      ? [styles.statusText, styles.turnIndicatorRed] 
      : [styles.statusText, styles.turnIndicatorBlack];
  };

  return (
    <View style={styles.container}>
      <View style={match.status === 'in-progress' && match.currentTurn ? styles.turnIndicatorContainer : {}}>
        <Text style={getTurnStyle()}>
          {statusText}
          {winReasonText && <Text style={styles.winReason}> {winReasonText}</Text>}
        </Text>
      </View>

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

      {match.status === 'ended' && (
        <View style={styles.finalScoreInfo}>
          <Text style={styles.finalScoreText}>
            最終比數: 紅 {match.redCaptured.length} - 黑 {match.blackCaptured.length}
          </Text>
        </View>
      )}

      {error && (
        <TouchableOpacity style={styles.errorContainer} onPress={clearError}>
          <Text style={styles.errorText}>{translateError(error)}</Text>
          <Text style={styles.errorDismiss}>點擊關閉</Text>
        </TouchableOpacity>
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
  winReason: {
    fontSize: 18,
    color: '#666',
    fontWeight: 'normal',
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
  errorContainer: {
    marginTop: 12,
    padding: 12,
    backgroundColor: '#FFEBEE', // Light red
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E53935', // Red
  },
  errorText: {
    fontSize: 16,
    color: '#C62828', // Dark red
    fontWeight: 'bold',
    textAlign: 'center',
  },
  errorDismiss: {
    fontSize: 12,
    color: '#757575', // Gray
    textAlign: 'center',
    marginTop: 4,
  },
});
