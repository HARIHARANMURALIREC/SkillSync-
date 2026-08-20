import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Pressable,
  Switch,
} from 'react-native';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { AppTheme } from '../theme';
import { useStyles } from '../theme/useStyles';
import api from '../services/api';

const CAREER_GOALS = [
  'Software Engineer',
  'Data Scientist',
  'Frontend Developer',
  'Backend Developer',
  'Full Stack Developer',
];

interface ProfileScreenProps {
  navigation: any;
}

function chunk<T>(items: T[], size: number): T[][] {
  const rows: T[][] = [];
  for (let i = 0; i < items.length; i += size) {
    rows.push(items.slice(i, i + size));
  }
  return rows;
}

const createStyles = (theme: AppTheme) => ({
  container: { flex: 1, backgroundColor: theme.colors.background },
  contentContainer: { padding: theme.spacing.lg, paddingBottom: theme.spacing['3xl'] },
  cardTitle: { ...theme.typography.h4, color: theme.colors.cream, marginBottom: theme.spacing.lg },
  input: { marginBottom: theme.spacing.md },
  hoursInput: { marginTop: theme.spacing.md, marginBottom: 0 },
  selectLabel: {
    ...theme.typography.bodySmall,
    color: theme.colors.muted,
    marginBottom: theme.spacing.sm,
    fontWeight: '600' as const,
  },
  goalRow: { flexDirection: 'row' as const, alignItems: 'stretch' as const, marginBottom: theme.spacing.sm },
  goalChip: {
    flex: 1,
    minHeight: 52,
    marginHorizontal: theme.spacing.xs,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.elev,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
  },
  goalChipActive: {
    borderColor: `${theme.colors.accent}99`,
    backgroundColor: `${theme.colors.accent}18`,
  },
  goalChipSpacer: { flex: 1, marginHorizontal: theme.spacing.xs },
  goalChipText: {
    ...theme.typography.bodySmall,
    color: theme.colors.cream,
    textAlign: 'center' as const,
    fontWeight: '500' as const,
  },
  goalChipTextActive: { color: theme.colors.accent, fontWeight: '600' as const },
  themeRow: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'space-between' as const,
    marginBottom: theme.spacing.md,
  },
  themeLabel: { ...theme.typography.body, color: theme.colors.cream, fontWeight: '600' as const },
  themeHint: { ...theme.typography.caption, color: theme.colors.muted, marginTop: 4 },
  updateButton: { marginTop: theme.spacing.md, marginBottom: theme.spacing.sm },
  logoutButton: { marginTop: theme.spacing.sm, marginBottom: theme.spacing.lg },
});

export const ProfileScreen: React.FC<ProfileScreenProps> = ({ navigation }) => {
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const styles = useStyles(createStyles);
  const [fullName, setFullName] = useState(user?.full_name || '');
  const [careerGoal, setCareerGoal] = useState(user?.career_goal || '');
  const [hoursPerWeek, setHoursPerWeek] = useState(String(user?.hours_per_week || 10));
  const [loading, setLoading] = useState(false);

  const handleUpdate = async () => {
    setLoading(true);
    try {
      await api.put('/api/profile', {
        full_name: fullName || undefined,
        career_goal: careerGoal || undefined,
        hours_per_week: parseInt(hoursPerWeek) || 10,
      });
      Alert.alert('Success', 'Profile updated successfully');
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.detail || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: async () => {
          await logout();
          navigation.replace('Login');
        },
      },
    ]);
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView contentContainerStyle={styles.contentContainer} keyboardShouldPersistTaps="handled">
        <Card glow>
          <View style={styles.themeRow}>
            <View>
              <Text style={styles.themeLabel}>Appearance</Text>
              <Text style={styles.themeHint}>{isDark ? 'Dark mode' : 'Light mode'}</Text>
            </View>
            <Switch
              value={!isDark}
              onValueChange={toggleTheme}
              trackColor={{ false: '#334155', true: '#22D3EE' }}
              thumbColor="#F8FAFC"
            />
          </View>
        </Card>

        <Card>
          <Text style={styles.cardTitle}>Profile Information</Text>
          <Input label="Email" value={user?.email || ''} editable={false} style={styles.input} onChangeText={() => {}} />
          <Input label="Full Name" placeholder="Enter your full name" value={fullName} onChangeText={setFullName} style={styles.input} />
        </Card>

        <Card>
          <Text style={styles.cardTitle}>Learning Preferences</Text>
          <Text style={styles.selectLabel}>Career Goal</Text>
          {chunk(CAREER_GOALS, 2).map((row) => (
            <View key={row.join('-')} style={styles.goalRow}>
              {row.map((goal) => {
                const selected = careerGoal === goal;
                return (
                  <Pressable
                    key={goal}
                    onPress={() => setCareerGoal(goal)}
                    style={[styles.goalChip, selected && styles.goalChipActive]}
                  >
                    <Text style={[styles.goalChipText, selected && styles.goalChipTextActive]} numberOfLines={2}>
                      {goal}
                    </Text>
                  </Pressable>
                );
              })}
              {row.length === 1 ? <View style={styles.goalChipSpacer} /> : null}
            </View>
          ))}
          <Input
            label="Hours per Week"
            placeholder="Available hours for learning"
            value={hoursPerWeek}
            onChangeText={setHoursPerWeek}
            keyboardType="numeric"
            style={styles.hoursInput}
          />
        </Card>

        <Button title="Update Profile" onPress={handleUpdate} loading={loading} style={styles.updateButton} />
        <Button title="Logout" onPress={handleLogout} variant="secondary" style={styles.logoutButton} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
};
