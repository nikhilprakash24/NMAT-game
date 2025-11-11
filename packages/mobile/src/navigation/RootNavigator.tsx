import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator, TransitionPresets } from '@react-navigation/stack';
import { RootStackParamList } from './types';
import { colors } from '../theme';

// Screens (to be created)
import WelcomeScreen from '../screens/WelcomeScreen';
import CreateGameScreen from '../screens/CreateGameScreen';
import JoinGameScreen from '../screens/JoinGameScreen';
import LobbyScreen from '../screens/LobbyScreen';
import GamePlayScreen from '../screens/GamePlayScreen';
import ResultsScreen from '../screens/ResultsScreen';

const Stack = createStackNavigator<RootStackParamList>();

export const RootNavigator: React.FC = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Welcome"
        screenOptions={{
          headerShown: false,
          cardStyle: { backgroundColor: colors.primary.cream },
          ...TransitionPresets.SlideFromRightIOS, // Smooth transitions
        }}
      >
        <Stack.Screen name="Welcome" component={WelcomeScreen} />
        <Stack.Screen name="CreateGame" component={CreateGameScreen} />
        <Stack.Screen name="JoinGame" component={JoinGameScreen} />
        <Stack.Screen
          name="Lobby"
          component={LobbyScreen}
          options={{
            ...TransitionPresets.ModalSlideFromBottomIOS,
          }}
        />
        <Stack.Screen
          name="GamePlay"
          component={GamePlayScreen}
          options={{
            gestureEnabled: false, // Can't swipe back during game
          }}
        />
        <Stack.Screen
          name="Results"
          component={ResultsScreen}
          options={{
            ...TransitionPresets.ModalSlideFromBottomIOS,
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};
