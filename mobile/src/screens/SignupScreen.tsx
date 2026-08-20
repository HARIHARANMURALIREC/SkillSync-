import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { useAuth } from '../context/AuthContext';
import { AppTheme } from '../theme';
import { useStyles } from '../theme/useStyles';

interface SignupScreenProps {
  navigation: any;
}

const createStyles = (theme: AppTheme) => ({
  container: { flex: 1, backgroundColor: theme.colors.background },
  scrollContent: { flexGrow: 1, justifyContent: 'center' as const, padding: theme.spacing.xl },
  content: { width: '100%' as const },
  wordmark: {
    ...theme.typography.h2,
    color: theme.colors.cream,
    textAlign: 'center' as const,
    marginBottom: theme.spacing.xl,
    fontWeight: '800' as const,
  },
  kicker: { ...theme.typography.kicker, color: theme.colors.accent, marginBottom: theme.spacing.sm },
  title: { ...theme.typography.h1, color: theme.colors.cream, marginBottom: theme.spacing.sm },
  subtitle: { ...theme.typography.body, color: theme.colors.muted, marginBottom: theme.spacing.xl },
  form: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: theme.spacing.lg,
  },
  signupButton: { marginTop: theme.spacing.sm, marginBottom: theme.spacing.lg },
  dividerContainer: { flexDirection: 'row' as const, alignItems: 'center' as const, marginBottom: theme.spacing.lg },
  dividerLine: { flex: 1, height: 1, backgroundColor: theme.colors.border },
  dividerText: { ...theme.typography.caption, color: theme.colors.muted, marginHorizontal: theme.spacing.md },
});

export const SignupScreen: React.FC<SignupScreenProps> = ({ navigation }) => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string; confirmPassword?: string }>({});
  const { signup } = useAuth();
  const styles = useStyles(createStyles);

  const validate = () => {
    const newErrors: typeof errors = {};
    if (!email.trim()) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = 'Email is invalid';
    if (!password) newErrors.password = 'Password is required';
    else if (password.length < 6) newErrors.password = 'Password must be at least 6 characters';
    if (password !== confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignup = async () => {
    if (!validate()) return;
    setLoading(true);
    const result = await signup(email, password, fullName || undefined);
    setLoading(false);
    if (result.success) navigation.replace('MainStack');
    else Alert.alert('Signup Failed', result.error || 'Please try again');
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <Text style={styles.wordmark}>SkillSync</Text>
          <Text style={styles.kicker}>Get started</Text>
          <Text style={styles.title}>Create account</Text>
          <Text style={styles.subtitle}>Start your personalized learning journey</Text>
          <View style={styles.form}>
            <Input label="Full name (optional)" placeholder="John Doe" value={fullName} onChangeText={setFullName} />
            <Input label="Email" placeholder="you@example.com" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" error={errors.email} />
            <Input label="Password" placeholder="Create a password" value={password} onChangeText={setPassword} secureTextEntry error={errors.password} />
            <Input label="Confirm password" placeholder="Confirm your password" value={confirmPassword} onChangeText={setConfirmPassword} secureTextEntry error={errors.confirmPassword} />
            <Button title="Create account" onPress={handleSignup} loading={loading} style={styles.signupButton} />
            <View style={styles.dividerContainer}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>Already have an account?</Text>
              <View style={styles.dividerLine} />
            </View>
            <Button title="Sign in instead" onPress={() => navigation.navigate('Login')} variant="secondary" />
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};
