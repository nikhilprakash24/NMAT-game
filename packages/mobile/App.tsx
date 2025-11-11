import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider } from 'react-redux';
import { store } from './src/store';
import { RootNavigator } from './src/navigation/RootNavigator';
import { useSocket } from './src/hooks/useSocket';

/**
 * App Content with Socket.io integration
 */
function AppContent() {
  useSocket(); // Initialize socket connection and event listeners

  return (
    <>
      <RootNavigator />
      <StatusBar style="dark" />
    </>
  );
}

/**
 * Main App Component
 * NMAT Game - Beautiful handwritten card aesthetic
 */
export default function App() {
  return (
    <Provider store={store}>
      <SafeAreaProvider>
        <AppContent />
      </SafeAreaProvider>
    </Provider>
  );
}
