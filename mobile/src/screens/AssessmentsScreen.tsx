import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { Card } from '../components/Card';
import { LoadingScreen } from '../components/LoadingScreen';
import api from '../services/api';
import { theme } from '../theme';
import { useAuth } from '../context/AuthContext';

interface AssessmentsScreenProps {
  navigation: any;
}

export const AssessmentsScreen: React.FC<AssessmentsScreenProps> = ({ navigation }) => {
  const { user } = useAuth();
  const [skills, setSkills] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchSkills();
  }, [user]);

  const fetchSkills = async () => {
    try {
      const response = await api.get('/api/assessment/skills');
      setSkills(response.data);
    } catch (error) {
      console.error('Failed to fetch skills:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchSkills();
  };

  if (loading) {
    return <LoadingScreen />;
  }

  if (skills.length === 0) {
    return (
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.emptyContainer}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <Card style={styles.emptyCard}>
          <Text style={styles.emptyTitle}>No Assessments Available</Text>
          <Text style={styles.emptyText}>
            {user?.career_goal
              ? `No assessments available for your career goal: "${user.career_goal}".`
              : 'Please set your career goal to see relevant assessments.'}
          </Text>
          <TouchableOpacity
            style={styles.setGoalButton}
            onPress={() => navigation.navigate('Profile')}
          >
            <Text style={styles.setGoalButtonText}>Set Career Goal</Text>
          </TouchableOpacity>
        </Card>
      </ScrollView>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <Text style={styles.title}>Available Assessments</Text>
      <Text style={styles.subtitle}>Choose a skill to assess your knowledge</Text>

      {skills.map((skill, index) => (
        <TouchableOpacity
          key={index}
          onPress={() => navigation.navigate('MCQTest', { skillName: skill })}
        >
          <Card style={styles.skillCard}>
            <View style={styles.skillHeader}>
              <Text style={styles.skillName}>{skill}</Text>
              <Text style={styles.arrow}>→</Text>
            </View>
          </Card>
        </TouchableOpacity>
      ))}
    </ScrollView>
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
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    padding: theme.spacing.lg,
  },
  title: {
    ...theme.typography.h2,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.xs,
  },
  subtitle: {
    ...theme.typography.body,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.xl,
  },
  skillCard: {
    marginBottom: theme.spacing.md,
  },
  skillHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  skillName: {
    ...theme.typography.h4,
    color: theme.colors.text.primary,
    flex: 1,
  },
  arrow: {
    ...theme.typography.h3,
    color: theme.colors.primary[800],
  },
  emptyCard: {
    alignItems: 'center',
    padding: theme.spacing['2xl'],
  },
  emptyTitle: {
    ...theme.typography.h3,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.md,
    textAlign: 'center',
  },
  emptyText: {
    ...theme.typography.body,
    color: theme.colors.text.secondary,
    textAlign: 'center',
    marginBottom: theme.spacing.xl,
  },
  setGoalButton: {
    backgroundColor: theme.colors.primary[800],
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.xl,
    borderRadius: theme.borderRadius.md,
  },
  setGoalButtonText: {
    ...theme.typography.button,
    color: theme.colors.text.inverse,
  },
});

