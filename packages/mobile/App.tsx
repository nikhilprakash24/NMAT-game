import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { RootNavigator } from './src/navigation/RootNavigator';

/**
 * Main App Component
 * NMAT Game - Beautiful handwritten card aesthetic
 */
export default function App() {
  return (
    <SafeAreaProvider>
      <RootNavigator />
      <StatusBar style="dark" />
    </SafeAreaProvider>
  );
}
