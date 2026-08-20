import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Linking,
  Modal,
  TextInput,
  Alert,
} from 'react-native';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { PageHeader } from '../components/PageHeader';
import { LoadingScreen } from '../components/LoadingScreen';
import api, { getApiErrorMessage } from '../services/api';
import { AppTheme } from '../theme';
import { useStyles } from '../theme/useStyles';
import { useTheme } from '../context/ThemeContext';
import { LearningPathData, WeeklyPath } from '../types';
import { useProgress } from '../context/ProgressContext';

interface LearningPathScreenProps {
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
  overallCard: {
    marginBottom: theme.spacing.lg,
  },
  overallLabel: {
    ...theme.typography.caption,
    color: theme.colors.text.secondary,
    textTransform: 'uppercase' as const,
    marginBottom: theme.spacing.xs,
  },
  overallPct: {
    ...theme.typography.h1,
    color: theme.colors.accent,
    fontWeight: '800' as const,
  },
  overallDetail: {
    ...theme.typography.bodySmall,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.sm,
  },
  progressBar: {
    height: 6,
    backgroundColor: theme.colors.gray[200],
    borderRadius: 3,
    overflow: 'hidden' as const,
  },
  progressFill: {
    height: '100%' as const,
    backgroundColor: theme.colors.accent,
    borderRadius: 3,
    shadowColor: theme.colors.neon,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
  },
  header: {
    marginBottom: theme.spacing.md,
  },
  headerText: {
    flex: 1,
  },
  title: {
    ...theme.typography.h2,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.xs,
  },
  subtitle: {
    ...theme.typography.body,
    color: theme.colors.text.secondary,
  },
  actionRow: {
    flexDirection: 'row' as const,
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.lg,
  },
  actionButton: {
    flex: 1,
  },
  emptyCard: {
    alignItems: 'center' as const,
    padding: theme.spacing['2xl'],
  },
  emptyTitle: {
    ...theme.typography.h3,
    color: theme.colors.text.primary,
    fontWeight: '700' as const,
    marginBottom: theme.spacing.md,
    textAlign: 'center' as const,
  },
  emptyText: {
    ...theme.typography.body,
    color: theme.colors.text.secondary,
    textAlign: 'center' as const,
    marginBottom: theme.spacing.xl,
  },
  generateButton: {
    width: '100%' as const,
  },
  weekCard: {
    marginBottom: theme.spacing.lg,
  },
  revisedCard: {
    borderWidth: 1,
    borderColor: `${theme.colors.violet}55`,
  },
  weekHeader: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'flex-start' as const,
    marginBottom: theme.spacing.md,
  },
  weekTitleContainer: {
    flex: 1,
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    flexWrap: 'wrap' as const,
  },
  weekTitle: {
    ...theme.typography.h4,
    color: theme.colors.text.primary,
    fontWeight: '700' as const,
    marginRight: theme.spacing.sm,
  },
  revisedBadge: {
    backgroundColor: `${theme.colors.violet}18`,
    borderWidth: 1,
    borderColor: `${theme.colors.violet}55`,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 4,
    borderRadius: theme.borderRadius.sm,
  },
  revisedBadgeText: {
    ...theme.typography.caption,
    color: theme.colors.violet,
    fontWeight: '700' as const,
  },
  statusBadge: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 4,
    borderRadius: theme.borderRadius.sm,
  },
  statusText: {
    ...theme.typography.caption,
    fontWeight: '700' as const,
    textTransform: 'capitalize' as const,
  },
  estimatedHours: {
    ...theme.typography.bodySmall,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.sm,
  },
  resourcesTitle: {
    ...theme.typography.body,
    fontWeight: '700' as const,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.md,
    marginTop: theme.spacing.sm,
  },
  resourcesContainer: {
    gap: theme.spacing.sm,
  },
  resourceItem: {
    flexDirection: 'row' as const,
    alignItems: 'flex-start' as const,
    padding: theme.spacing.md,
    backgroundColor: theme.colors.ink,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  resourceCompleted: {
    backgroundColor: `${theme.colors.teal}18`,
    borderColor: `${theme.colors.teal}55`,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: theme.colors.gray[300],
    marginRight: theme.spacing.sm,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  checkboxChecked: {
    backgroundColor: theme.colors.accent,
    borderColor: theme.colors.accent,
  },
  checkmark: {
    color: theme.colors.ink,
    fontSize: 14,
    fontWeight: '700' as const,
  },
  resourceIcon: {
    fontSize: 20,
    marginRight: theme.spacing.sm,
    marginTop: 2,
  },
  resourceContent: {
    flex: 1,
  },
  resourceTitle: {
    ...theme.typography.body,
    fontWeight: '600' as const,
    color: theme.colors.text.primary,
    marginBottom: 4,
  },
  resourceType: {
    ...theme.typography.caption,
    color: theme.colors.text.secondary,
    textTransform: 'capitalize' as const,
  },
  resourceLink: {
    ...theme.typography.bodySmall,
    color: theme.colors.accent,
    marginTop: theme.spacing.xs,
    fontWeight: '700' as const,
  },
  noResources: {
    ...theme.typography.bodySmall,
    color: theme.colors.text.secondary,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(5, 5, 8, 0.88)',
    justifyContent: 'center' as const,
    padding: theme.spacing.lg,
  },
  modalCard: {
    backgroundColor: `${theme.colors.surface}F0`,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    borderWidth: 1,
    borderColor: `${theme.colors.accent}40`,
    shadowColor: theme.colors.neon,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  modalPrompt: {
    ...theme.typography.bodySmall,
    color: theme.colors.muted,
    marginBottom: theme.spacing.md,
  },
  modalMiss: {
    ...theme.typography.bodySmall,
    color: theme.colors.rose,
    fontWeight: '600' as const,
    marginBottom: theme.spacing.sm,
  },
  modalInput: {
    minHeight: 120,
    borderWidth: 1,
    borderColor: `${theme.colors.accent}35`,
    backgroundColor: `${theme.colors.ink}CC`,
    borderRadius: theme.borderRadius.md,
    color: theme.colors.cream,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    textAlignVertical: 'top' as const,
  },
  modalCancel: {
    marginTop: 8,
  },
  cardTitle: {
    ...theme.typography.h4,
    color: theme.colors.cream,
    fontWeight: '700' as const,
    marginBottom: theme.spacing.md,
  },
});

export const LearningPathScreen: React.FC<LearningPathScreenProps> = () => {
  const { refreshProgress } = useProgress();
  const { theme } = useTheme();
  const styles = useStyles(createStyles);
  const [learningPath, setLearningPath] = useState<LearningPathData | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [adapting, setAdapting] = useState(false);
  const [togglingProgress, setTogglingProgress] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [teachback, setTeachback] = useState<{
    week_number: number;
    resource_index: number;
    prompt: string;
    resource_title?: string;
    miss?: string;
  } | null>(null);
  const [teachAnswer, setTeachAnswer] = useState('');
  const [teachBusy, setTeachBusy] = useState(false);

  useEffect(() => {
    loadLearningPath();
  }, []);

  const loadLearningPath = async () => {
    try {
      const response = await api.get('/api/learning-path');
      setLearningPath(response.data);
    } catch (error: any) {
      if (error.response?.status !== 404) {
        console.error('Failed to load learning path:', error);
      }
      setLearningPath(null);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const generateLearningPath = async () => {
    setGenerating(true);
    try {
      const response = await api.post('/api/learning-path/generate', null, {
        timeout: 120000,
      });
      setLearningPath(response.data);
      refreshProgress().catch(() => {});
    } catch (error: any) {
      alert(getApiErrorMessage(error, 'Failed to generate learning path'));
    } finally {
      setGenerating(false);
    }
  };

  const computeSkillProgress = () => {
    if (!learningPath?.weekly_paths) return [];

    const skillTotals: Record<string, number> = {};
    const skillCompleted: Record<string, number> = {};

    learningPath.weekly_paths.forEach((week) => {
      const skillKey = week.skill_name.split(' (')[0];
      const completed = week.completed_resources || [];
      const total = week.resources?.length || 0;
      skillTotals[skillKey] = (skillTotals[skillKey] || 0) + total;
      skillCompleted[skillKey] = (skillCompleted[skillKey] || 0) + completed.length;
    });

    return Object.keys(skillTotals).map((skill_name) => ({
      skill_name,
      progress_percentage:
        skillTotals[skill_name] > 0
          ? (skillCompleted[skill_name] / skillTotals[skill_name]) * 100
          : 0,
    }));
  };

  const adaptLearningPath = async () => {
    if (!learningPath) return;
    setAdapting(true);
    try {
      const progressData = computeSkillProgress();
      const response = await api.post('/api/learning-path/adapt', progressData, {
        timeout: 120000,
      });
      setLearningPath(response.data.adapted_path);
    } catch (error: any) {
      alert(getApiErrorMessage(error, 'Failed to adapt learning path'));
    } finally {
      setAdapting(false);
    }
  };

  const handleToggleResource = async (
    weekNumber: number,
    resourceIndex: number,
    completed: boolean
  ) => {
    if (!learningPath) return;

    if (completed) {
      try {
        const start = await api.post('/api/teachback/start', {
          week_number: weekNumber,
          resource_index: resourceIndex,
        });
        if (start.data.passed) {
          await api.post('/api/learning-path/progress', {
            week_number: weekNumber,
            resource_index: resourceIndex,
            completed: true,
          });
          await loadLearningPath();
          refreshProgress().catch(() => {});
          return;
        }
        setTeachAnswer('');
        setTeachback(start.data);
      } catch (error: any) {
        Alert.alert('Teach-back', getApiErrorMessage(error, 'Could not start teach-back.'));
      }
      return;
    }

    setTogglingProgress(true);
    try {
      await api.post('/api/learning-path/progress', {
        week_number: weekNumber,
        resource_index: resourceIndex,
        completed: false,
      });
      await loadLearningPath();
      refreshProgress().catch(() => {});
    } catch (error: any) {
      Alert.alert('Error', getApiErrorMessage(error, 'Failed to update progress'));
    } finally {
      setTogglingProgress(false);
    }
  };

  const submitTeachback = async () => {
    if (!teachback) return;
    setTeachBusy(true);
    try {
      const res = await api.post('/api/teachback/submit', {
        week_number: teachback.week_number,
        resource_index: teachback.resource_index,
        answer: teachAnswer,
      });
      if (res.data.passed) {
        setTeachback(null);
        await loadLearningPath();
        refreshProgress().catch(() => {});
      } else {
        setTeachback({ ...teachback, ...res.data });
        Alert.alert('Try again', res.data.miss || 'Not quite — add more detail.');
      }
    } catch (error: any) {
      Alert.alert('Error', getApiErrorMessage(error, 'Teach-back failed.'));
    } finally {
      setTeachBusy(false);
    }
  };

  const overallCompletion = () => {
    if (!learningPath?.weekly_paths?.length) return { pct: 0, done: 0, total: 0 };
    let done = 0;
    let total = 0;
    learningPath.weekly_paths.forEach((week) => {
      total += week.resources?.length || 0;
      done += (week.completed_resources || []).length;
    });
    return { pct: total > 0 ? Math.round((done / total) * 100) : 0, done, total };
  };

  const getResourceIcon = (type: string) => {
    switch (type) {
      case 'video':
        return '🎥';
      case 'article':
        return '📄';
      case 'course':
        return '📚';
      case 'practice':
        return '💻';
      default:
        return '📖';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return theme.colors.success;
      case 'in_progress':
        return theme.colors.accent;
      default:
        return theme.colors.text.secondary;
    }
  };

  if (loading) {
    return <LoadingScreen />;
  }

  if (!learningPath) {
    return (
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.emptyContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={loadLearningPath} />
        }
      >
        <Card style={styles.emptyCard}>
          <Text style={styles.emptyTitle}>No Learning Path Yet</Text>
          <Text style={styles.emptyText}>
            Complete skill assessments and set your career goal to generate a personalized
            learning path.
          </Text>
          <Button
            title={generating ? 'Generating...' : 'Generate Learning Path'}
            onPress={generateLearningPath}
            disabled={generating}
            loading={generating}
            style={styles.generateButton}
          />
        </Card>
      </ScrollView>
    );
  }

  const completion = overallCompletion();

  const renderWeek = (week: WeeklyPath, index: number) => {
    const weekDone = (week.completed_resources || []).length;
    const weekTotal = week.resources?.length || 0;
    const weekPct = weekTotal > 0 ? Math.round((weekDone / weekTotal) * 100) : 0;

    return (
      <Card key={index} style={[styles.weekCard, week.is_revised && styles.revisedCard]}>
        <View style={styles.weekHeader}>
          <View style={styles.weekTitleContainer}>
            <Text style={styles.weekTitle}>
              Week {week.week_number}: {week.skill_name}
            </Text>
            {week.is_revised && (
              <View style={styles.revisedBadge}>
                <Text style={styles.revisedBadgeText}>Revised</Text>
              </View>
            )}
          </View>
          <View
            style={[styles.statusBadge, { backgroundColor: getStatusColor(week.status) + '20' }]}
          >
            <Text style={[styles.statusText, { color: getStatusColor(week.status) }]}>
              {week.status.replace('_', ' ')}
            </Text>
          </View>
        </View>

        <Text style={styles.estimatedHours}>
          {week.estimated_hours.toFixed(1)} hours
          {weekTotal > 0 ? ` · ${weekDone}/${weekTotal} resources` : ''}
        </Text>

        {weekTotal > 0 && (
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${weekPct}%` }]} />
          </View>
        )}

        <Text style={styles.resourcesTitle}>Resources</Text>
        {week.resources && week.resources.length > 0 ? (
          <View style={styles.resourcesContainer}>
            {week.resources.map((resource, resIndex) => {
              const isCompleted = (week.completed_resources || []).includes(resIndex);
              return (
                <TouchableOpacity
                  key={resIndex}
                  style={[styles.resourceItem, isCompleted && styles.resourceCompleted]}
                  onPress={() =>
                    handleToggleResource(week.week_number, resIndex, !isCompleted)
                  }
                  disabled={togglingProgress}
                >
                  <View style={[styles.checkbox, isCompleted && styles.checkboxChecked]}>
                    {isCompleted && <Text style={styles.checkmark}>✓</Text>}
                  </View>
                  <Text style={styles.resourceIcon}>{getResourceIcon(resource.type)}</Text>
                  <View style={styles.resourceContent}>
                    <Text style={styles.resourceTitle}>{resource.title}</Text>
                    <Text style={styles.resourceType}>
                      {resource.type} · {resource.estimated_hours}h
                    </Text>
                    {resource.url && (
                      <TouchableOpacity
                        onPress={() => Linking.openURL(resource.url!)}
                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                      >
                        <Text style={styles.resourceLink}>
                          {resource.url.replace(/^https?:\/\//, '')}
                        </Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        ) : (
          <Text style={styles.noResources}>No resources assigned for this week.</Text>
        )}
      </Card>
    );
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={loadLearningPath} />}
    >
      <Card style={styles.overallCard}>
        <Text style={styles.overallLabel}>Overall progress</Text>
        <Text style={styles.overallPct}>{completion.pct}%</Text>
        <Text style={styles.overallDetail}>
          {completion.done} of {completion.total} resources complete
        </Text>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${completion.pct}%` }]} />
        </View>
      </Card>

      <View style={styles.header}>
        <PageHeader
          kicker="Curriculum"
          title="Learning path"
          subtitle={`${learningPath.total_weeks} weeks of focused work`}
        />
      </View>

      <View style={styles.actionRow}>
        <Button
          title={adapting ? 'Adapting...' : 'Adapt Path'}
          onPress={adaptLearningPath}
          disabled={adapting || generating || togglingProgress}
          loading={adapting}
          style={styles.actionButton}
        />
        <Button
          title={generating ? 'Regenerating...' : 'Regenerate'}
          onPress={generateLearningPath}
          disabled={generating || adapting}
          loading={generating}
          variant="secondary"
          style={styles.actionButton}
        />
      </View>

      {learningPath.weekly_paths.map(renderWeek)}
      <Modal visible={Boolean(teachback)} animationType="slide" transparent>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.cardTitle}>Teach-back</Text>
            <Text style={styles.modalPrompt}>{teachback?.prompt}</Text>
            {teachback?.miss ? <Text style={styles.modalMiss}>{teachback.miss}</Text> : null}
            <TextInput
              style={styles.modalInput}
              multiline
              value={teachAnswer}
              onChangeText={setTeachAnswer}
              placeholder="Four short sentences…"
              placeholderTextColor={theme.colors.muted}
            />
            <Button title={teachBusy ? 'Scoring...' : 'Submit explanation'} onPress={submitTeachback} loading={teachBusy} />
            <Button title="Cancel" variant="secondary" onPress={() => setTeachback(null)} style={styles.modalCancel} />
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};
