import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { theme } from '../theme';

interface SplashScreenProps {
  navigation: any;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ navigation }) => {
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading) {
      const timer = setTimeout(() => {
        if (user) {
          navigation.replace('MainStack');
        } else {
          navigation.replace('Auth');
        }
      }, 1500);

      return () => clearTimeout(timer);
    }
  }, [loading, user, navigation]);

  return (
    <View style={styles.container}>
      <Text style={styles.logo}>SkillSync</Text>
      <Text style={styles.tagline}>Your learning journey, personalized</Text>
      <ActivityIndicator
        size="small"
        color={theme.colors.gold.DEFAULT}
        style={styles.loader}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.ink,
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
