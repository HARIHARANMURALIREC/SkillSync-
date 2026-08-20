import React from 'react';
import { View, ActivityIndicator } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { AppTheme } from '../theme';
import { useStyles } from '../theme/useStyles';

const createStyles = (theme: AppTheme) => ({
  container: {
    flex: 1,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    backgroundColor: theme.colors.background,
  },
});

export const LoadingScreen: React.FC = () => {
  const { theme } = useTheme();
  const styles = useStyles(createStyles);
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={theme.colors.accent} />
    </View>
  );
};
