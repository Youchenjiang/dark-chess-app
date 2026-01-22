/**
 * ModeSelector - Full-screen Lobby experience for game mode selection
 * Redesigned with large cards, title/logo, and wooden theme
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { useGameStore } from '../store/gameStore';
import { GAME_MODES } from '../core/GameModes';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface ModeSelectorProps {
  onSelect?: () => void; // Optional callback after mode selection
}

export const ModeSelector: React.FC<ModeSelectorProps> = ({ onSelect }) => {
  const { currentMode, setMode, newMatch } = useGameStore();

  const handleModeSelect = async (modeId: 'classic' | 'three-kingdoms') => {
    const mode = modeId === 'classic' ? GAME_MODES.classic : GAME_MODES.threeKingdoms;
    
    // Set mode and start new match
    await setMode(mode);
    newMatch();
    
    // Call onSelect callback if provided
    if (onSelect) {
      onSelect();
    }
  };

  return (
    <View style={styles.lobbyContainer}>
      {/* Logo/Title Section */}
      <View style={styles.logoSection}>
        <Text style={styles.mainTitle}>暗棋</Text>
        <Text style={styles.subtitle}>DARK CHESS</Text>
        <View style={styles.divider} />
        <Text style={styles.welcomeText}>選擇遊戲模式</Text>
      </View>

      {/* Mode Cards Container */}
      <View style={styles.cardsContainer}>
        {/* Classic Mode Card */}
        <TouchableOpacity
          style={[styles.modeCard, styles.classicCard]}
          onPress={() => handleModeSelect('classic')}
          activeOpacity={0.85}
        >
          <View style={styles.cardHeader}>
            <Text style={styles.cardIcon}>♟️</Text>
            <Text style={styles.cardTitle}>經典暗棋</Text>
            <Text style={styles.cardSubtitle}>Classic Mode</Text>
          </View>
          <View style={styles.cardBody}>
            <Text style={styles.cardFeature}>👥 2 位玩家</Text>
            <Text style={styles.cardFeature}>🎲 32 格棋盤</Text>
            <Text style={styles.cardFeature}>⚔️ 經典規則</Text>
          </View>
          {currentMode.id === 'classic' && (
            <View style={styles.selectedBadge}>
              <Text style={styles.selectedText}>✓ 已選擇</Text>
            </View>
          )}
        </TouchableOpacity>

        {/* Three Kingdoms Mode Card */}
        <TouchableOpacity
          style={[styles.modeCard, styles.threeKingdomsCard]}
          onPress={() => handleModeSelect('three-kingdoms')}
          activeOpacity={0.85}
        >
          <View style={styles.cardHeader}>
            <Text style={styles.cardIcon}>🏰</Text>
            <Text style={styles.cardTitle}>三國暗棋</Text>
            <Text style={styles.cardSubtitle}>Three Kingdoms</Text>
          </View>
          <View style={styles.cardBody}>
            <Text style={styles.cardFeature}>👥 3 位玩家</Text>
            <Text style={styles.cardFeature}>🎲 45 交叉點</Text>
            <Text style={styles.cardFeature}>⚔️ 特殊規則</Text>
          </View>
          {currentMode.id === 'three-kingdoms' && (
            <View style={styles.selectedBadge}>
              <Text style={styles.selectedText}>✓ 已選擇</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>選擇模式後將開始新遊戲</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  lobbyContainer: {
    flex: 1,
    backgroundColor: '#D7CCC8', // Light brown/beige (wooden theme)
    justifyContent: 'space-between',
    paddingVertical: 40,
    paddingHorizontal: 20,
    minHeight: SCREEN_HEIGHT * 0.8, // Full screen experience
  },
  logoSection: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 30,
  },
  mainTitle: {
    fontSize: 56,
    fontWeight: 'bold',
    color: '#4E342E', // Dark brown
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
    letterSpacing: 8,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#6D4C41', // Medium brown
    letterSpacing: 4,
    marginTop: 8,
  },
  divider: {
    width: 120,
    height: 3,
    backgroundColor: '#8D6E63', // Medium-dark brown
    marginVertical: 20,
    borderRadius: 2,
  },
  welcomeText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#5D4037', // Dark wood brown
    marginTop: 8,
  },
  cardsContainer: {
    flex: 1,
    justifyContent: 'center',
    gap: 20,
  },
  modeCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 24,
    marginVertical: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    borderWidth: 3,
    minHeight: 180,
  },
  classicCard: {
    borderColor: '#C62828', // Red border
    backgroundColor: '#FFEBEE', // Light red background
  },
  threeKingdomsCard: {
    borderColor: '#2E7D32', // Green border
    backgroundColor: '#E8F5E9', // Light green background
  },
  cardHeader: {
    alignItems: 'center',
    marginBottom: 16,
  },
  cardIcon: {
    fontSize: 48,
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#3E2723', // Very dark brown
    textAlign: 'center',
  },
  cardSubtitle: {
    fontSize: 14,
    color: '#6D4C41',
    fontStyle: 'italic',
    marginTop: 4,
  },
  cardBody: {
    marginTop: 12,
  },
  cardFeature: {
    fontSize: 16,
    color: '#4E342E',
    marginVertical: 4,
    paddingLeft: 8,
  },
  selectedBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: '#4CAF50',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  selectedText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  footer: {
    alignItems: 'center',
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 2,
    borderTopColor: '#BCAAA4',
  },
  footerText: {
    fontSize: 14,
    color: '#6D4C41',
    fontStyle: 'italic',
  },
});
