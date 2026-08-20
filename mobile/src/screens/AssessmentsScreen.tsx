import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { Card } from '../components/Card';
import { LoadingScreen } from '../components/LoadingScreen';
import { PageHeader } from '../components/PageHeader';
import api from '../services/api';
import { AppTheme } from '../theme';
import { useStyles } from '../theme/useStyles';
import { useAuth } from '../context/AuthContext';
import { SkillInfo } from '../types';

interface AssessmentsScreenProps {
  navigation: any;
}

const createStyles = (theme: AppTheme) => ({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  contentContainer: {
    padding: theme.spacing.lg,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center' as const,
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
    marginBottom: theme.spacing.lg,
  },
  sectionLabel: {
    ...theme.typography.kicker,
    color: theme.colors.accent,
    marginBottom: theme.spacing.sm,
    marginTop: theme.spacing.sm,
  },
  sectionLabelMuted: {
    ...theme.typography.kicker,
    color: theme.colors.muted,
    marginBottom: theme.spacing.sm,
    marginTop: theme.spacing.lg,
  },
  skillCard: {
    marginBottom: theme.spacing.md,
    borderWidth: 1,
    borderColor: `${theme.colors.accent}30`,
    shadowColor: theme.colors.neon,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 3,
  },
  skillHeader: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
  },
  skillInfo: {
    flex: 1,
  },
  skillName: {
    ...theme.typography.h4,
    color: theme.colors.cream,
    fontWeight: '700' as const,
  },
  questionCount: {
    ...theme.typography.bodySmall,
    color: theme.colors.text.secondary,
    marginTop: 4,
  },
  arrow: {
    ...theme.typography.h3,
    color: theme.colors.accent,
    fontWeight: '700' as const,
  },
  emptyCard: {
    alignItems: 'center' as const,
    padding: theme.spacing['2xl'],
  },
  emptyTitle: {
    ...theme.typography.h3,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.md,
    textAlign: 'center' as const,
  },
  emptyText: {
    ...theme.typography.body,
    color: theme.colors.text.secondary,
    textAlign: 'center' as const,
    marginBottom: theme.spacing.xl,
  },
  setGoalButton: {
    backgroundColor: theme.colors.accent,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.xl,
    borderRadius: theme.borderRadius.md,
    shadowColor: theme.colors.neon,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
  },
  setGoalButtonText: {
    ...theme.typography.button,
    color: theme.colors.ink,
  },
});

export const AssessmentsScreen: React.FC<AssessmentsScreenProps> = ({ navigation }) => {
  const { user } = useAuth();
  const styles = useStyles(createStyles);
  const [skills, setSkills] = useState<SkillInfo[]>([]);
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

  const recommended = skills.filter((s) => s.recommended);
  const other = skills.filter((s) => !s.recommended);

  const renderSkill = (skill: SkillInfo) => (
    <TouchableOpacity
      key={skill.name}
      onPress={() => navigation.navigate('MCQTest', { skillName: skill.name, recert: skill.freshness === 'stale' })}
    >
      <Card style={styles.skillCard}>
        <View style={styles.skillHeader}>
          <View style={styles.skillInfo}>
            <Text style={styles.skillName}>
              {skill.name}
              {skill.recommended ? ' ★' : ''}
            </Text>
            <Text style={styles.questionCount}>
              {skill.question_count} questions
              {skill.freshness ? ` · ${skill.freshness}` : ''}
            </Text>
          </View>
          <Text style={styles.arrow}>→</Text>
        </View>
      </Card>
    </TouchableOpacity>
  );

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
      <PageHeader
        kicker="Evaluate"
        title="Skill assessments"
        subtitle="Choose a skill to assess your knowledge"
      />

      {recommended.length > 0 && (
        <>
          <Text style={styles.sectionLabel}>Recommended for your goal</Text>
          {recommended.map(renderSkill)}
        </>
      )}

      {other.length > 0 && (
        <>
          {recommended.length > 0 && (
            <Text style={styles.sectionLabelMuted}>Other skills</Text>
          )}
          {other.map(renderSkill)}
        </>
      )}
    </ScrollView>
  );
};
