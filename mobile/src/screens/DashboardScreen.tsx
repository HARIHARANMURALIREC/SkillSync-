import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { LoadingScreen } from '../components/LoadingScreen';
import api from '../services/api';
import { theme } from '../theme';
import { useAuth } from '../context/AuthContext';

interface DashboardScreenProps {
  navigation: any;
}

interface DashboardData {
  user: {
    email: string;
    full_name?: string;
    career_goal?: string;
  };
  progress_summary: {
    total_assessments: number;
    skills_assessed: number;
  };
  skill_gaps: Array<{
    skill_name: string;
    current_level: number;
    target_level: number;
    gap: number;
    priority: string;
  }>;
  career_readiness?: {
    score: number;
    completed_skills: number;
    total_skills: number;
  };
}

export const DashboardScreen: React.FC<DashboardScreenProps> = ({ navigation }) => {
  const { user: authUser } = useAuth();
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const response = await api.get('/api/dashboard');
      setDashboardData(response.data);
    } catch (error) {
      console.error('Failed to fetch dashboard:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchDashboard();
  };

  if (loading) {
    return <LoadingScreen />;
  }

  const hasCareerGoal = dashboardData?.user?.career_goal;
  const hasAssessments = dashboardData?.progress_summary?.total_assessments > 0;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      {/* Welcome Card */}
      <Card style={styles.welcomeCard}>
        <Text style={styles.welcomeTitle}>
          Welcome back, {dashboardData?.user?.full_name || dashboardData?.user?.email}!
        </Text>
        <Text style={styles.welcomeSubtitle}>
          {hasCareerGoal
            ? `Your career goal: ${dashboardData?.user.career_goal}`
            : 'Set your career goal to get personalized learning recommendations'}
        </Text>
      </Card>

      {/* Progress Cards */}
      <View style={styles.progressRow}>
        <Card style={styles.progressCard}>
          <Text style={styles.progressLabel}>Assessments</Text>
          <Text style={styles.progressValue}>
            {dashboardData?.progress_summary?.total_assessments || 0}
          </Text>
        </Card>
        <Card style={styles.progressCard}>
          <Text style={styles.progressLabel}>Skills</Text>
          <Text style={styles.progressValue}>
            {dashboardData?.progress_summary?.skills_assessed || 0}
          </Text>
        </Card>
      </View>

      {/* Career Readiness */}
      {dashboardData?.career_readiness && (
        <Card style={styles.readinessCard}>
          <Text style={styles.cardTitle}>Career Readiness</Text>
          <View style={styles.readinessContent}>
            <View style={styles.readinessScoreContainer}>
              <Text style={styles.readinessScore}>
                {dashboardData.career_readiness.score.toFixed(0)}%
              </Text>
            </View>
            <View style={styles.readinessStats}>
              <Text style={styles.readinessStat}>
                {dashboardData.career_readiness.completed_skills}/
                {dashboardData.career_readiness.total_skills} skills
              </Text>
              <Text style={styles.readinessDescription}>
                Based on required skills for your chosen career
              </Text>
            </View>
          </View>
        </Card>
      )}

      {/* Quick Actions */}
      <Card>
        <Text style={styles.cardTitle}>Quick Actions</Text>
        <View style={styles.actionsContainer}>
          {!hasCareerGoal && (
            <Button
              title="Set Career Goal"
              onPress={() => navigation.navigate('Profile')}
              style={styles.actionButton}
            />
          )}
          {!hasAssessments && (
            <Button
              title="Take Skill Assessment"
              onPress={() => navigation.navigate('Assessments')}
              style={styles.actionButton}
            />
          )}
          {hasCareerGoal && hasAssessments && (
            <Button
              title="View Learning Path"
              onPress={() => navigation.navigate('LearningPath')}
              style={styles.actionButton}
            />
          )}
        </View>
      </Card>

      {/* Skill Gaps Preview */}
      {dashboardData?.skill_gaps && dashboardData.skill_gaps.length > 0 && (
        <Card>
          <Text style={styles.cardTitle}>Top Skill Gaps</Text>
          {dashboardData.skill_gaps.slice(0, 3).map((gap, index) => (
            <View key={index} style={styles.gapItem}>
              <View style={styles.gapHeader}>
                <Text style={styles.gapSkill}>{gap.skill_name}</Text>
                <View
                  style={[
                    styles.priorityBadge,
                    gap.priority === 'High' && styles.priorityHigh,
                    gap.priority === 'Medium' && styles.priorityMedium,
                  ]}
                >
                  <Text style={styles.priorityText}>{gap.priority}</Text>
                </View>
              </View>
              <Text style={styles.gapText}>
                {gap.current_level.toFixed(1)}/10 → {gap.target_level.toFixed(1)}/10
              </Text>
            </View>
          ))}
        </Card>
      )}
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
  welcomeCard: {
    backgroundColor: theme.colors.primary[800],
    marginBottom: theme.spacing.lg,
  },
  welcomeTitle: {
    ...theme.typography.h2,
    color: theme.colors.text.inverse,
    marginBottom: theme.spacing.xs,
  },
  welcomeSubtitle: {
    ...theme.typography.body,
    color: theme.colors.primary[100],
  },
  progressRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.lg,
  },
  progressCard: {
    flex: 1,
    marginHorizontal: theme.spacing.xs,
    alignItems: 'center',
  },
  progressLabel: {
    ...theme.typography.bodySmall,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.xs,
  },
  progressValue: {
    ...theme.typography.h2,
    color: theme.colors.primary[800],
  },
  readinessCard: {
    marginBottom: theme.spacing.lg,
  },
  cardTitle: {
    ...theme.typography.h4,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.md,
  },
  readinessContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  readinessScoreContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: theme.colors.primary[100],
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.lg,
  },
  readinessScore: {
    ...theme.typography.h1,
    color: theme.colors.primary[800],
  },
  readinessStats: {
    flex: 1,
  },
  readinessStat: {
    ...theme.typography.h3,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.xs,
  },
  readinessDescription: {
    ...theme.typography.bodySmall,
    color: theme.colors.text.secondary,
  },
  actionsContainer: {
    gap: theme.spacing.md,
  },
  actionButton: {
    width: '100%',
  },
  gapItem: {
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  gapHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.xs,
  },
  gapSkill: {
    ...theme.typography.body,
    fontWeight: '600',
    color: theme.colors.text.primary,
    flex: 1,
  },
  priorityBadge: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 4,
    borderRadius: theme.borderRadius.sm,
    backgroundColor: theme.colors.gray[100],
  },
  priorityHigh: {
    backgroundColor: '#fee2e2',
  },
  priorityMedium: {
    backgroundColor: '#fef3c7',
  },
  priorityText: {
    ...theme.typography.caption,
    fontWeight: '600',
  },
  gapText: {
    ...theme.typography.bodySmall,
    color: theme.colors.text.secondary,
  },
});

