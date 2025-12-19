import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { theme } from '../theme';

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

export const ProfileScreen: React.FC<ProfileScreenProps> = ({ navigation }) => {
  const { user, logout } = useAuth();
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
      // Refresh user data - would need to update AuthContext
    } catch (error: any) {
      console.error('Failed to update profile:', error);
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
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.contentContainer}>
        <Card>
          <Text style={styles.cardTitle}>Profile Information</Text>
          <Input
            label="Email"
            value={user?.email || ''}
            editable={false}
            style={styles.input}
          />
          <Input
            label="Full Name"
            placeholder="Enter your full name"
            value={fullName}
            onChangeText={setFullName}
            style={styles.input}
          />
        </Card>

        <Card>
          <Text style={styles.cardTitle}>Learning Preferences</Text>
          
          <View style={styles.selectContainer}>
            <Text style={styles.selectLabel}>Career Goal</Text>
            <View style={styles.optionsContainer}>
              {CAREER_GOALS.map((goal) => (
                <Button
                  key={goal}
                  title={goal}
                  onPress={() => setCareerGoal(goal)}
                  variant={careerGoal === goal ? 'primary' : 'secondary'}
                  style={styles.optionButton}
                />
              ))}
            </View>
          </View>

          <Input
            label="Hours per Week"
            placeholder="Available hours for learning"
            value={hoursPerWeek}
            onChangeText={setHoursPerWeek}
            keyboardType="numeric"
            style={styles.input}
          />
        </Card>

        <Button
          title="Update Profile"
          onPress={handleUpdate}
          loading={loading}
          style={styles.updateButton}
        />

        <Button
          title="Logout"
          onPress={handleLogout}
          variant="secondary"
          style={styles.logoutButton}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  contentContainer: {
    padding: theme.spacing.lg,
  },
  cardTitle: {
    ...theme.typography.h4,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.lg,
  },
  input: {
    marginBottom: theme.spacing.md,
  },
  selectContainer: {
    marginBottom: theme.spacing.lg,
  },
  selectLabel: {
    ...theme.typography.bodySmall,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.sm,
    fontWeight: '500',
  },
  optionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
  optionButton: {
    flex: 1,
    minWidth: '45%',
  },
  updateButton: {
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.sm,
  },
  logoutButton: {
    marginTop: theme.spacing.sm,
  },
});

