import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, TouchableOpacity } from 'react-native';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { LoadingScreen } from '../components/LoadingScreen';
import api from '../services/api';
import { theme } from '../theme';

interface LearningPathScreenProps {
  navigation: any;
}

interface WeeklyPath {
  week_number: number;
  skill_name: string;
  resources: Array<{
    title: string;
    type: string;
    url?: string;
    estimated_hours: number;
  }>;
  estimated_hours: number;
  status: string;
  is_revised?: boolean;
}

interface LearningPathData {
  total_weeks: number;
  weekly_paths: WeeklyPath[];
}

export const LearningPathScreen: React.FC<LearningPathScreenProps> = ({ navigation }) => {
  const [learningPath, setLearningPath] = useState<LearningPathData | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
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
      const response = await api.post('/api/learning-path/generate');
      setLearningPath(response.data);
    } catch (error: any) {
      console.error('Failed to generate learning path:', error);
      alert(error.response?.data?.detail || 'Failed to generate learning path');
    } finally {
      setGenerating(false);
    }
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
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={loadLearningPath} />}
      >
        <Card style={styles.emptyCard}>
          <Text style={styles.emptyTitle}>No Learning Path Yet</Text>
          <Text style={styles.emptyText}>
            Complete skill assessments and set your career goal to generate a personalized learning
            path.
          </Text>
          <Button
            title={generating ? 'Generating...' : 'Generate Learning Path'}
            onPress={generateLearningPath}
            disabled={generating}
            style={styles.generateButton}
          />
        </Card>
      </ScrollView>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={loadLearningPath} />}
    >
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Your Learning Path</Text>
          <Text style={styles.subtitle}>{learningPath.total_weeks} weeks of personalized learning</Text>
        </View>
        <Button
          title="Regenerate"
          onPress={generateLearningPath}
          disabled={generating}
          variant="secondary"
          style={styles.regenerateButton}
        />
      </View>

      {learningPath.weekly_paths.map((week, index) => (
        <Card
          key={index}
          style={[styles.weekCard, week.is_revised && styles.revisedCard]}
        >
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
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(week.status) + '20' }]}>
              <Text style={[styles.statusText, { color: getStatusColor(week.status) }]}>
                {week.status.replace('_', ' ')}
              </Text>
            </View>
          </View>

          <Text style={styles.estimatedHours}>
            Estimated: {week.estimated_hours.toFixed(1)} hours
          </Text>

          <Text style={styles.resourcesTitle}>Learning Resources:</Text>
          {week.resources && week.resources.length > 0 ? (
            <View style={styles.resourcesContainer}>
              {week.resources.map((resource, resIndex) => (
                <View key={resIndex} style={styles.resourceItem}>
                  <Text style={styles.resourceIcon}>{getResourceIcon(resource.type)}</Text>
                  <View style={styles.resourceContent}>
                    <Text style={styles.resourceTitle}>{resource.title}</Text>
                    <Text style={styles.resourceType}>{resource.type}</Text>
                  </View>
                  <Text style={styles.resourceHours}>{resource.estimated_hours}h</Text>
                </View>
              ))}
            </View>
          ) : (
            <Text style={styles.noResources}>No resources assigned for this week.</Text>
          )}
        </Card>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.lg,
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
  regenerateButton: {
    minWidth: 100,
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
    borderWidth: 2,
    borderColor: theme.colors.warning,
    backgroundColor: '#fef3c7',
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
    backgroundColor: theme.colors.warning,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 4,
    borderRadius: theme.borderRadius.sm,
  },
  revisedBadgeText: {
    ...theme.typography.caption,
    color: theme.colors.text.inverse,
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
    marginBottom: theme.spacing.md,
  },
  resourcesTitle: {
    ...theme.typography.body,
    fontWeight: '600',
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.md,
  },
  resourcesContainer: {
    gap: theme.spacing.md,
  },
  resourceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.md,
    backgroundColor: theme.colors.gray[50],
    borderRadius: theme.borderRadius.md,
  },
  resourceIcon: {
    fontSize: 24,
    marginRight: theme.spacing.md,
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
  resourceHours: {
    ...theme.typography.bodySmall,
    color: theme.colors.text.secondary,
  },
  noResources: {
    ...theme.typography.bodySmall,
    color: theme.colors.text.secondary,
  },
});

