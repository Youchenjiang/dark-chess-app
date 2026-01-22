/**
 * Game Modes Registry
 * Centralized configuration for all game variants
 * Pure TypeScript - NO React dependencies
 */

import { GameMode, Faction } from './types';
import { ClassicRules } from './rules/ClassicRules';
import { ThreeKingdomsRules } from './rules/ThreeKingdomsRules';

/**
 * Classic Dark Chess (2-player) Mode
 */
export const CLASSIC_MODE: GameMode = {
  id: 'classic',
  name: '經典暗棋',
  boardSize: 32,
  gridDimensions: { rows: 8, cols: 4 },
  playerCount: 2,
  ruleSet: new ClassicRules(),
};

/**
 * Three Kingdoms Dark Chess (3-player) Mode
 */
export const THREE_KINGDOMS_MODE: GameMode = {
  id: 'three-kingdoms',
  name: '三國暗棋',
  boardSize: 45,
  gridDimensions: { rows: 9, cols: 5 },
  playerCount: 3,
  ruleSet: new ThreeKingdomsRules(),
};

/**
 * Game Modes Registry
 * Single source of truth for all game modes
 */
export const GAME_MODES = {
  classic: CLASSIC_MODE,
  threeKingdoms: THREE_KINGDOMS_MODE,
} as const;

/**
 * Faction definitions for Classic mode
 */
export const RED_FACTION: Faction = {
  id: 'red',
  displayName: '紅方',
  color: 'red',
  pieceCount: 16,
  isEliminated: false,
};

export const BLACK_FACTION: Faction = {
  id: 'black',
  displayName: '黑方',
  color: 'black',
  pieceCount: 16,
  isEliminated: false,
};

/**
 * Faction definitions for Three Kingdoms mode
 */
export const TEAM_A_FACTION: Faction = {
  id: 'team-a',
  displayName: '將軍軍',
  color: 'green',
  pieceCount: 12,
  isEliminated: false,
};

export const TEAM_B_FACTION: Faction = {
  id: 'team-b',
  displayName: '紅方輔臣',
  color: 'red',
  pieceCount: 10,
  isEliminated: false,
};

export const TEAM_C_FACTION: Faction = {
  id: 'team-c',
  displayName: '黑方輔臣',
  color: 'black',
  pieceCount: 10,
  isEliminated: false,
};
