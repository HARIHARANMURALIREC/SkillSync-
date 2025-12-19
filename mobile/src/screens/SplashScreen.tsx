import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
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
          navigation.replace('Login');
        }
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [loading, user, navigation]);

  return (
    <View style={styles.container}>
      <Image 
        source={require('../../assets/splash-icon.png')}
        style={styles.logoImage}
        resizeMode="contain"
      />
      <Text style={styles.logo}>SkillSync</Text>
      <Text style={styles.tagline}>Your Learning Journey, Personalized</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.primary[800],
  },
  logoImage: {
    width: 250,
    height: 250,
    marginBottom: theme.spacing.xl,
  },
  logo: {
    ...theme.typography.h1,
    color: theme.colors.text.inverse,
    marginBottom: theme.spacing.md,
  },
  tagline: {
    ...theme.typography.body,
    color: theme.colors.primary[100],
  },
});

