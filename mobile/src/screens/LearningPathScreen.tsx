import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Linking,
} from 'react-native';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { PageHeader } from '../components/PageHeader';
import { LoadingScreen } from '../components/LoadingScreen';
import api, { getApiErrorMessage } from '../services/api';
import { theme } from '../theme';
import { LearningPathData, WeeklyPath } from '../types';
import { useProgress } from '../context/ProgressContext';

interface LearningPathScreenProps {
  navigation: any;
}

export const LearningPathScreen: React.FC<LearningPathScreenProps> = () => {
  const { refreshProgress } = useProgress();
  const [learningPath, setLearningPath] = useState<LearningPathData | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [adapting, setAdapting] = useState(false);
  const [togglingProgress, setTogglingProgress] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

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
    setTogglingProgress(true);

    const previousPath = learningPath;
    const optimisticPath: LearningPathData = {
      ...learningPath,
      weekly_paths: learningPath.weekly_paths.map((week) => {
        if (week.week_number !== weekNumber) return week;
        const indices = new Set(week.completed_resources || []);
        if (completed) indices.add(resourceIndex);
        else indices.delete(resourceIndex);
        return {
          ...week,
          completed_resources: Array.from(indices).sort((a, b) => a - b),
        };
      }),
    };
    setLearningPath(optimisticPath);

    try {
      const response = await api.post('/api/learning-path/progress', {
        week_number: weekNumber,
        resource_index: resourceIndex,
        completed,
      });

      setLearningPath((current) => {
        if (!current) return current;
        return {
          ...current,
          weekly_paths: current.weekly_paths.map((week) => {
            const weekCompleted = response.data.completed
              .filter((c: { week_number: number }) => c.week_number === week.week_number)
              .map((c: { resource_index: number }) => c.resource_index);
            return {
              ...week,
              completed_resources: weekCompleted,
              status: response.data.week_status[week.week_number] || week.status,
            };
          }),
        };
      });
      refreshProgress().catch(() => {});
    } catch (error: any) {
      setLearningPath(previousPath);
      alert(getApiErrorMessage(error, 'Failed to update progress'));
    } finally {
      setTogglingProgress(false);
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
        return theme.colors.info;
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
  overallCard: {
    marginBottom: theme.spacing.lg,
  },
  overallLabel: {
    ...theme.typography.caption,
    color: theme.colors.text.secondary,
    textTransform: 'uppercase',
    marginBottom: theme.spacing.xs,
  },
  overallPct: {
    ...theme.typography.h1,
    color: theme.colors.gold.DEFAULT,
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
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: theme.colors.gold.DEFAULT,
    borderRadius: 3,
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
    flexDirection: 'row',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.lg,
  },
  actionButton: {
    flex: 1,
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
  generateButton: {
    width: '100%',
  },
  weekCard: {
    marginBottom: theme.spacing.lg,
  },
  revisedCard: {
    borderWidth: 1,
    borderColor: theme.colors.gold.DEFAULT,
  },
  weekHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.md,
  },
  weekTitleContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  weekTitle: {
    ...theme.typography.h4,
    color: theme.colors.text.primary,
    marginRight: theme.spacing.sm,
  },
  revisedBadge: {
    backgroundColor: theme.colors.gold.faint,
    borderWidth: 1,
    borderColor: theme.colors.gold.DEFAULT,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 4,
    borderRadius: theme.borderRadius.sm,
  },
  revisedBadgeText: {
    ...theme.typography.caption,
    color: theme.colors.gold.DEFAULT,
    fontWeight: '600',
  },
  statusBadge: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 4,
    borderRadius: theme.borderRadius.sm,
  },
  statusText: {
    ...theme.typography.caption,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  estimatedHours: {
    ...theme.typography.bodySmall,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.sm,
  },
  resourcesTitle: {
    ...theme.typography.body,
    fontWeight: '600',
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.md,
    marginTop: theme.spacing.sm,
  },
  resourcesContainer: {
    gap: theme.spacing.sm,
  },
  resourceItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: theme.spacing.md,
    backgroundColor: theme.colors.ink,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  resourceCompleted: {
    backgroundColor: theme.colors.gold.faint,
    borderColor: theme.colors.gold.DEFAULT,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: theme.colors.gray[300],
    marginRight: theme.spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: theme.colors.gold.DEFAULT,
    borderColor: theme.colors.gold.DEFAULT,
  },
  checkmark: {
    color: theme.colors.ink,
    fontSize: 14,
    fontWeight: '700',
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
    fontWeight: '500',
    color: theme.colors.text.primary,
    marginBottom: 4,
  },
  resourceType: {
    ...theme.typography.caption,
    color: theme.colors.text.secondary,
    textTransform: 'capitalize',
  },
  resourceLink: {
    ...theme.typography.bodySmall,
    color: theme.colors.gold.DEFAULT,
    marginTop: theme.spacing.xs,
    fontWeight: '600',
  },
  noResources: {
    ...theme.typography.bodySmall,
    color: theme.colors.text.secondary,
  },
});
