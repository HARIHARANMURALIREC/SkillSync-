import React, { useEffect } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { AppTheme } from '../theme';
import { useStyles } from '../theme/useStyles';

interface SplashScreenProps {
  navigation: any;
}

const createStyles = (theme: AppTheme) => ({
  container: {
    flex: 1,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    backgroundColor: theme.colors.background,
  },
  logo: {
    ...theme.typography.h1,
    color: theme.colors.cream,
    marginBottom: theme.spacing.sm,
  },
  tagline: {
    ...theme.typography.body,
    color: theme.colors.muted,
  },
  loader: {
    marginTop: theme.spacing.xl,
  },
});

export const SplashScreen: React.FC<SplashScreenProps> = ({ navigation }) => {
  const { user, loading } = useAuth();
  const { theme } = useTheme();
  const styles = useStyles(createStyles);

  useEffect(() => {
    if (!loading) {
      const timer = setTimeout(() => {
        if (user) {
          navigation.replace('MainStack');
        } else {
          navigation.replace('Auth');
        }
      }, 1200);
      return () => clearTimeout(timer);
    }
  }, [loading, user, navigation]);

  return (
    <View style={styles.container}>
      <Text style={styles.logo}>SkillSync</Text>
      <Text style={styles.tagline}>Close the gap to your next role</Text>
      <ActivityIndicator size="small" color={theme.colors.accent} style={styles.loader} />
    </View>
  );
};
