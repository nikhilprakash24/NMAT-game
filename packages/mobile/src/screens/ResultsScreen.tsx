import React from 'react';
import { View, StyleSheet } from 'react-native';
import { HandwrittenText } from '../components';
import { colors, spacing } from '../theme';

// TODO: Implement results screen
const ResultsScreen: React.FC = () => {
  return (
    <View style={styles.container}>
      <HandwrittenText variant="heading" size="xl">
        Results
      </HandwrittenText>
      <HandwrittenText variant="body" size="md">
        Coming soon...
      </HandwrittenText>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primary.cream,
    padding: spacing.lg,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default ResultsScreen;
