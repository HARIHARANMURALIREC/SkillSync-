import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, TouchableOpacity } from 'react-native';
import { Card } from '../components/Card';
import { PageHeader } from '../components/PageHeader';
import { Button } from '../components/Button';
import { LoadingScreen } from '../components/LoadingScreen';
import { StreakCard } from '../components/StreakCard';
import { LevelCard } from '../components/LevelCard';
import { BadgeGrid } from '../components/BadgeGrid';
import api from '../services/api';
import { theme } from '../theme';
import { useProgress } from '../context/ProgressContext';
import { AssessmentHistoryEntry, SkillInfo } from '../types';

interface DashboardScreenProps {
  navigation: any;
}

export const DashboardScreen: React.FC<DashboardScreenProps> = ({ navigation }) => {
  const { summary: dashboardData, streakDays, heat, badges, level, refreshProgress } = useProgress();
  const [history, setHistory] = useState<AssessmentHistoryEntry[]>([]);
  const [assessableSkills, setAssessableSkills] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      await refreshProgress();
      const [historyRes, skillsRes] = await Promise.all([
        api.get('/api/assessment/history').catch(() => ({ data: [] })),
        api.get('/api/assessment/skills').catch(() => ({ data: [] })),
      ]);
      setHistory(historyRes.data || []);
      setAssessableSkills(new Set((skillsRes.data || []).map((s: SkillInfo) => s.name)));
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
  const hasAssessments = (dashboardData?.progress_summary?.total_assessments || 0) > 0;
  const pathPct = dashboardData?.progress_summary?.path_completion_pct ?? 0;
  const pathDetail =
    (dashboardData?.progress_summary?.total_resources || 0) > 0
      ? `${dashboardData?.progress_summary?.resources_completed || 0}/${dashboardData?.progress_summary?.total_resources} resources`
      : 'No path yet';

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <PageHeader
        kicker="Overview"
        title={dashboardData?.user?.full_name || dashboardData?.user?.email || 'Dashboard'}
        subtitle={
          hasCareerGoal
            ? `Working toward ${dashboardData?.user.career_goal}`
            : 'Set a career goal to personalize recommendations'
        }
      />

      <LevelCard level={level} />
      <StreakCard days={streakDays} heat={heat} />

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

      <View style={styles.progressRow}>
        <Card style={styles.progressCard}>
          <Text style={styles.progressLabel}>Path completion</Text>
          <Text style={styles.progressValue}>{pathPct}%</Text>
          <Text style={styles.progressSub}>{pathDetail}</Text>
        </Card>
        <Card style={styles.progressCard}>
          <Text style={styles.progressLabel}>High priority gaps</Text>
          <Text style={styles.progressValue}>
            {dashboardData?.progress_summary?.gap_summary?.high_priority_gaps || 0}
          </Text>
        </Card>
      </View>

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

      <BadgeGrid badges={badges} />

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
          <Button
            title="Ask Your Coach"
            onPress={() => navigation.navigate('Coach')}
            variant="secondary"
            style={styles.actionButton}
          />
        </View>
      </Card>

      {history.length > 0 && (
        <Card>
          <Text style={styles.cardTitle}>Assessment History</Text>
          {history.slice(-5).reverse().map((entry, index) => (
            <View key={index} style={styles.historyItem}>
              <View>
                <Text style={styles.historySkill}>{entry.skill_name}</Text>
                <Text style={styles.historyLevel}>{entry.level}</Text>
              </View>
              <Text style={styles.historyScore}>{entry.score.toFixed(1)}/10</Text>
            </View>
          ))}
        </Card>
      )}

      {dashboardData?.skill_gaps && dashboardData.skill_gaps.length > 0 && (
        <Card>
          <Text style={styles.cardTitle}>Top Skill Gaps</Text>
          {dashboardData.skill_gaps.slice(0, 5).map((gap, index) => (
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
              {assessableSkills.has(gap.skill_name) && (
                <TouchableOpacity
                  onPress={() =>
                    navigation.navigate('MCQTest', { skillName: gap.skill_name })
                  }
                >
                  <Text style={styles.assessLink}>Take assessment →</Text>
                </TouchableOpacity>
              )}
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
    marginBottom: theme.spacing.lg,
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
    color: theme.colors.muted,
    marginBottom: theme.spacing.xs,
    textAlign: 'center',
  },
  progressValue: {
    ...theme.typography.h2,
    color: theme.colors.gold.DEFAULT,
  },
  progressSub: {
    ...theme.typography.caption,
    color: theme.colors.text.secondary,
    marginTop: 4,
    textAlign: 'center',
  },
  readinessCard: {
    marginBottom: theme.spacing.lg,
  },
  cardTitle: {
    ...theme.typography.h4,
    color: theme.colors.cream,
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
    backgroundColor: theme.colors.gold.faint,
    borderWidth: 1,
    borderColor: theme.colors.border,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.lg,
  },
  readinessScore: {
    ...theme.typography.h1,
    color: theme.colors.gold.DEFAULT,
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
  historyItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  historySkill: {
    ...theme.typography.body,
    fontWeight: '600',
    color: theme.colors.text.primary,
  },
  historyLevel: {
    ...theme.typography.caption,
    color: theme.colors.text.secondary,
  },
  historyScore: {
    ...theme.typography.h4,
    color: theme.colors.primary[800],
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
    backgroundColor: theme.colors.gold.faint,
    borderWidth: 1,
    borderColor: theme.colors.gold.DEFAULT,
  },
  priorityMedium: {
    backgroundColor: theme.colors.gray[100],
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  priorityText: {
    ...theme.typography.caption,
    fontWeight: '600',
    color: theme.colors.cream,
  },
  gapText: {
    ...theme.typography.bodySmall,
    color: theme.colors.text.secondary,
  },
  assessLink: {
    ...theme.typography.bodySmall,
    color: theme.colors.gold.DEFAULT,
    fontWeight: '600',
    marginTop: theme.spacing.sm,
  },
});
