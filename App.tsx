import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View, Text, TouchableOpacity, SafeAreaView, ScrollView } from 'react-native';
import { useGameStore } from './src/store/gameStore';
import { BoardView } from './src/components/BoardView';
import { GameInfo } from './src/components/GameInfo';
import { useEffect } from 'react';

export default function App() {
  const { match, newMatch } = useGameStore();

  // Start a new match on mount
  useEffect(() => {
    if (!match) {
      newMatch();
    }
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="auto" />
      <View style={styles.content}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.newGameButton} onPress={newMatch} activeOpacity={0.8}>
            <Text style={styles.newGameButtonText}>新遊戲 (NEW GAME)</Text>
          </TouchableOpacity>
        </View>
        <GameInfo />
        <BoardView />
      </View>
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
});
