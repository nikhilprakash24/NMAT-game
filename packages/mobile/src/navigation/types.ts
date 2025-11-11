/**
 * Navigation types
 * Type-safe navigation throughout the app
 */

import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';

export type RootStackParamList = {
  Welcome: undefined;
  CreateGame: undefined;
  JoinGame: undefined;
  Lobby: { sessionCode: string; sessionId: string };
  GamePlay: { sessionId: string };
  Results: { sessionId: string };
};

export type WelcomeScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'Welcome'
>;

export type LobbyScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'Lobby'
>;
export type LobbyScreenRouteProp = RouteProp<RootStackParamList, 'Lobby'>;

export type GamePlayScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'GamePlay'
>;
export type GamePlayScreenRouteProp = RouteProp<RootStackParamList, 'GamePlay'>;
