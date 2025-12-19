import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, Alert, Image } from 'react-native';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { useAuth } from '../context/AuthContext';
import { theme } from '../theme';

interface SignupScreenProps {
  navigation: any;
}

export const SignupScreen: React.FC<SignupScreenProps> = ({ navigation }) => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{
    fullName?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
  }>({});
  const { signup } = useAuth();

  const validate = () => {
    const newErrors: {
      fullName?: string;
      email?: string;
      password?: string;
      confirmPassword?: string;
    } = {};

    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignup = async () => {
    if (!validate()) return;

    setLoading(true);
    const result = await signup(email, password, fullName || undefined);
    setLoading(false);

    if (result.success) {
      navigation.replace('MainStack');
    } else {
      Alert.alert('Signup Failed', result.error || 'Please try again');
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.gradient}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.content}>
            {/* Logo Container with Glow Effect */}
            <View style={styles.logoContainer}>
              <View style={styles.logoGlow} />
              <Image 
                source={require('../../assets/icon.png')}
                style={styles.logo}
                resizeMode="contain"
              />
            </View>

            <Text style={styles.title}>Create Your Account</Text>
            <Text style={styles.subtitle}>Start your personalized learning journey today</Text>

            <View style={styles.card}>
              <View style={styles.form}>
                <Input
                  label="Full Name (Optional)"
                  placeholder="John Doe"
                  value={fullName}
                  onChangeText={setFullName}
                  error={errors.fullName}
                  style={styles.input}
                />

                <Input
                  label="Email Address"
                  placeholder="you@example.com"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  error={errors.email}
                  style={styles.input}
                />

                <Input
                  label="Password"
                  placeholder="Create a strong password"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                  error={errors.password}
                  style={styles.input}
                />

                <Input
                  label="Confirm Password"
                  placeholder="Confirm your password"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry
                  error={errors.confirmPassword}
                  style={styles.input}
                />

                <Button
                  title="Create Account"
                  onPress={handleSignup}
                  loading={loading}
                  style={styles.signupButton}
                />

                {/* Divider */}
                <View style={styles.dividerContainer}>
                  <View style={styles.dividerLine} />
                  <Text style={styles.dividerText}>Already have an account?</Text>
                  <View style={styles.dividerLine} />
                </View>

                <Button
                  title="Sign In Instead"
                  onPress={() => navigation.navigate('Login')}
                  variant="secondary"
                  style={styles.loginButton}
                />

              </View>
            </View>

            <Text style={styles.footerText}>
              By creating an account, you agree to our Terms of Service and Privacy Policy
            </Text>
          </View>
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
    backgroundColor: '#f8f5fb',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: theme.spacing.xl,
  },
  content: {
    width: '100%',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: theme.spacing['2xl'],
    position: 'relative',
  },
  logoGlow: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: theme.colors.primary[200],
    opacity: 0.3,
    top: -10,
  },
  logo: {
    width: 180,
    height: 180,
    zIndex: 1,
  },
  title: {
    ...theme.typography.h1,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.sm,
    textAlign: 'center',
    fontWeight: '700',
    fontSize: 32,
  },
  subtitle: {
    ...theme.typography.body,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing['2xl'],
    textAlign: 'center',
    fontSize: 16,
  },
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 24,
    padding: theme.spacing.xl,
    marginBottom: theme.spacing.lg,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.5)',
  },
  form: {
    width: '100%',
  },
  input: {
    marginBottom: theme.spacing.md,
  },
  signupButton: {
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.lg,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: theme.spacing.lg,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: theme.colors.border,
  },
  dividerText: {
    ...theme.typography.caption,
    color: theme.colors.text.secondary,
    marginHorizontal: theme.spacing.md,
  },
  loginButton: {
    marginBottom: theme.spacing.md,
  },
  backContainer: {
    alignItems: 'center',
    marginTop: theme.spacing.md,
  },
  backLink: {
    ...theme.typography.body,
    color: theme.colors.text.secondary,
    fontSize: 14,
  },
  footerText: {
    ...theme.typography.caption,
    color: theme.colors.text.secondary,
    textAlign: 'center',
    fontSize: 12,
    marginTop: theme.spacing.md,
  },
});
