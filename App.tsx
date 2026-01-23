import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View, Text, TouchableOpacity, SafeAreaView } from 'react-native';
import { useGameStore } from './src/store/gameStore';
import { BoardView } from './src/components/BoardView';
import { GameInfo } from './src/components/GameInfo';
import { Toast } from './src/components/Toast';
import { ModeSelector } from './src/components/ModeSelector';
import { useEffect, useState } from 'react';

export default function App() {
  const { match, newMatch, loadPersistedMode, error, clearError } = useGameStore();
  const [showModeSelector, setShowModeSelector] = useState(false); // Start with game view (not mode selector)

  // Load persisted mode and start a new match on mount
  useEffect(() => {
    const initialize = async () => {
      await loadPersistedMode();
      if (!match) {
        newMatch();
      }
    };
    initialize();
  }, []);

  // Handle mode selection: hide mode selector after selection
  const handleModeSelected = () => {
    setShowModeSelector(false);
  };

  // Handle "Back to Menu": show mode selector and reset match
  const handleBackToMenu = () => {
    setShowModeSelector(true);
  };

  // Translate error messages to Traditional Chinese
  const translateError = (errorMsg: string): string => {
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
      "Not current faction's turn": '現在不是你的回合',
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

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="auto" />
      <View style={styles.content}>
        <View style={styles.header}>
          <View style={styles.headerButtons}>
            {!showModeSelector && (
              <TouchableOpacity 
                style={styles.backButton} 
                onPress={handleBackToMenu} 
                activeOpacity={0.8}
              >
                <Text style={styles.backButtonText}>◀ 模式選擇</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity 
              style={styles.newGameButton} 
              onPress={newMatch} 
              activeOpacity={0.8}
            >
              <Text style={styles.newGameButtonText}>新遊戲</Text>
            </TouchableOpacity>
          </View>
        </View>
        {showModeSelector ? (
          <ModeSelector onSelect={handleModeSelected} />
        ) : match?.mode.id === 'classic' ? (
          <View style={styles.gameContainer}>
            <View style={styles.boardContainer}>
              <BoardView />
            </View>
            <GameInfo />
          </View>
        ) : (
          <>
            <GameInfo />
            <BoardView />
          </>
        )}
      </View>
      {error && (
        <Toast 
          message={translateError(error)} 
          onDismiss={clearError}
          duration={3000}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAEBD7', // Antique white
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: 10,
    paddingBottom: 10,
  },
  header: {
    marginBottom: 8,
    marginTop: 5,
    width: '100%',
    paddingHorizontal: 16,
  },
  headerButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  backButton: {
    backgroundColor: '#757575', // Gray
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  backButtonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  newGameButton: {
    backgroundColor: '#5D4037', // Dark wood brown
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  newGameButtonText: {
    color: '#F5F5DC', // Beige/Cream
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  gameContainer: {
    flex: 1,
    flexDirection: 'row',
    width: '100%',
    alignItems: 'stretch',
    justifyContent: 'space-between',
  },
  boardContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 0, // Allow flex shrinking
  },
});
