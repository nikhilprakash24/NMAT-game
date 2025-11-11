import React, { Component, ErrorInfo, ReactNode } from 'react';
import { View, StyleSheet } from 'react-native';
import { HandwrittenText, Button, Card } from './';
import { colors, spacing } from '../theme';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * ErrorBoundary
 * Catches JavaScript errors in child component tree
 * Displays fallback UI instead of crashing the app
 */
class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
    });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <View style={styles.container}>
          <Card color="pink" style={styles.card}>
            <HandwrittenText variant="heading" size="xxl" center>
              😵 Oops!
            </HandwrittenText>
            <HandwrittenText variant="handwritten" size="md" center color={colors.ink.secondary}>
              Something went wrong
            </HandwrittenText>
            {__DEV__ && this.state.error && (
              <HandwrittenText variant="handwritten" size="sm" color={colors.error} center>
                {this.state.error.toString()}
              </HandwrittenText>
            )}
          </Card>
          <Button onPress={this.handleReset} variant="primary" fullWidth size="large">
            Try Again 🔄
          </Button>
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primary.cream,
    padding: spacing.lg,
    justifyContent: 'center',
  },
  card: {
    marginBottom: spacing.lg,
  },
});

export default ErrorBoundary;
