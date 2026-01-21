import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View, Button, SafeAreaView, ScrollView } from 'react-native';
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
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Button title="新遊戲 (New Game)" onPress={newMatch} />
        </View>
        <GameInfo />
        <BoardView />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAEBD7', // Antique white
  },
  scrollContent: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  header: {
    marginBottom: 16,
  },
});
