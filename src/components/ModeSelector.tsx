/**
 * ModeSelector - Game mode selection component (T064-T067)
 * Allows users to switch between Classic and Three Kingdoms modes
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useGameStore } from '../store/gameStore';
import { GAME_MODES } from '../core/GameModes';

export const ModeSelector: React.FC = () => {
  const { currentMode, setMode, newMatch } = useGameStore();

  const handleModeSelect = async (modeId: 'classic' | 'three-kingdoms') => {
    const mode = modeId === 'classic' ? GAME_MODES.classic : GAME_MODES.threeKingdoms;
    
    // Set mode and start new match
    await setMode(mode);
    newMatch();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>選擇遊戲模式</Text>
      
      <View style={styles.buttonsContainer}>
        {/* Classic Mode Button */}
        <TouchableOpacity
          style={[
            styles.modeButton,
            currentMode.id === 'classic' && styles.selectedButton,
          ]}
          onPress={() => handleModeSelect('classic')}
          activeOpacity={0.7}
        >
          <Text
            style={[
              styles.buttonText,
              currentMode.id === 'classic' && styles.selectedButtonText,
            ]}
          >
            經典暗棋
          </Text>
          <Text style={styles.subtitleText}>(Classic)</Text>
          {currentMode.id === 'classic' && <Text style={styles.checkmark}>✓</Text>}
        </TouchableOpacity>

        {/* Three Kingdoms Mode Button */}
        <TouchableOpacity
          style={[
            styles.modeButton,
            currentMode.id === 'three-kingdoms' && styles.selectedButton,
          ]}
          onPress={() => handleModeSelect('three-kingdoms')}
          activeOpacity={0.7}
        >
          <Text
            style={[
              styles.buttonText,
              currentMode.id === 'three-kingdoms' && styles.selectedButtonText,
            ]}
          >
            三國暗棋
          </Text>
          <Text style={styles.subtitleText}>(Three Kingdoms)</Text>
          {currentMode.id === 'three-kingdoms' && <Text style={styles.checkmark}>✓</Text>}
        </TouchableOpacity>
      </View>

      {/* Mode Info */}
      <View style={styles.infoContainer}>
        <Text style={styles.infoText}>
          {currentMode.id === 'classic' 
            ? '2 位玩家 · 32 格 · 經典規則'
            : '3 位玩家 · 45 交叉點 · 特殊規則'}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#FFF',
    borderBottomWidth: 2,
    borderBottomColor: '#E0E0E0',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    textAlign: 'center',
    marginBottom: 12,
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 12,
  },
  modeButton: {
    flex: 1,
    marginHorizontal: 6,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#DDD',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 80,
  },
  selectedButton: {
    backgroundColor: '#4CAF50',
    borderColor: '#388E3C',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  selectedButtonText: {
    color: '#FFF',
  },
  subtitleText: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
  },
  checkmark: {
    fontSize: 20,
    color: '#FFF',
    marginTop: 4,
    fontWeight: 'bold',
  },
  infoContainer: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#F9F9F9',
    borderRadius: 6,
    alignItems: 'center',
  },
  infoText: {
    fontSize: 13,
    color: '#666',
    textAlign: 'center',
  },
});
