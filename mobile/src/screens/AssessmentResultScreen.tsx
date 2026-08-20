import React, { useEffect } from 'react';
import { View, Text, ScrollView } from 'react-native';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { AppTheme } from '../theme';
import { useStyles } from '../theme/useStyles';
import { useTheme } from '../context/ThemeContext';
import { useProgress } from '../context/ProgressContext';

interface AssessmentResultScreenProps {
  navigation: any;
  route: {
    params: {
      result: {
        skill_name: string;
        score: number;
        level: string;
        breakdown: any;
        passed?: boolean;
        stored_score?: number;
      };
      skillName: string;
      recert?: boolean;
    };
  };
}

const createStyles = (theme: AppTheme) => ({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  contentContainer: {
    padding: theme.spacing.lg,
  },
  resultCard: {
    alignItems: 'center' as const,
    marginBottom: theme.spacing.lg,
  },
  skillName: {
    ...theme.typography.h3,
    color: theme.colors.text.primary,
    fontWeight: '800' as const,
    marginBottom: theme.spacing.lg,
  },
  historyLevel: {
    ...theme.typography.bodySmall,
    color: theme.colors.accent,
    fontWeight: '600' as const,
    marginBottom: theme.spacing.md,
    textAlign: 'center' as const,
  },
  scoreContainer: {
    flexDirection: 'row' as const,
    alignItems: 'baseline' as const,
    marginBottom: theme.spacing.md,
  },
  score: {
    ...theme.typography.h1,
    color: theme.colors.accent,
    fontSize: 48,
    fontWeight: '800' as const,
    fontFamily: theme.typography.h1.fontFamily,
  },
  scoreLabel: {
    ...theme.typography.h3,
    color: theme.colors.text.secondary,
    fontWeight: '700' as const,
    marginLeft: theme.spacing.xs,
  },
  levelBadge: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.full,
  },
  levelText: {
    ...theme.typography.button,
    textTransform: 'uppercase' as const,
    fontWeight: '700' as const,
  },
  cardTitle: {
    ...theme.typography.h4,
    color: theme.colors.text.primary,
    fontWeight: '700' as const,
    marginBottom: theme.spacing.md,
  },
  breakdownRow: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    paddingVertical: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  breakdownLabel: {
    ...theme.typography.body,
    color: theme.colors.text.secondary,
  },
  breakdownValue: {
    ...theme.typography.body,
    fontWeight: '700' as const,
    color: theme.colors.text.primary,
  },
  feedbackCard: {
    marginTop: theme.spacing.md,
    borderWidth: 1,
    borderColor: `${theme.colors.accent}55`,
    shadowColor: theme.colors.neon,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 2,
  },
  feedbackLabel: {
    ...theme.typography.kicker,
    color: theme.colors.accent,
    marginBottom: theme.spacing.sm,
  },
  feedbackText: {
    ...theme.typography.body,
    color: theme.colors.text.primary,
    lineHeight: 22,
  },
  buttonContainer: {
    gap: theme.spacing.md,
    marginTop: theme.spacing.md,
  },
  button: {
    width: '100%' as const,
  },
});

export const AssessmentResultScreen: React.FC<AssessmentResultScreenProps> = ({
  navigation,
  route,
}) => {
  const { result, recert } = route.params;
  const { refreshProgress } = useProgress();
  const { theme } = useTheme();
  const styles = useStyles(createStyles);

  useEffect(() => {
    refreshProgress().catch(() => {});
  }, []);

  const getLevelColor = (level: string) => {
    switch (level.toLowerCase()) {
      case 'advanced':
        return theme.colors.success;
      case 'intermediate':
        return theme.colors.warning;
      default:
        return theme.colors.error;
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <Card style={styles.resultCard}>
        <Text style={styles.skillName}>{result.skill_name}</Text>
        {recert ? (
          <Text style={styles.historyLevel}>{result.passed ? 'Recert passed' : 'Recert missed'}</Text>
        ) : null}
        <View style={styles.scoreContainer}>
          <Text style={styles.score}>{result.score.toFixed(1)}</Text>
          <Text style={styles.scoreLabel}>/ 10</Text>
        </View>
        <View style={[styles.levelBadge, { backgroundColor: getLevelColor(result.level) + '20' }]}>
          <Text style={[styles.levelText, { color: getLevelColor(result.level) }]}>
            {result.level}
          </Text>
        </View>
      </Card>

      <Card>
        <Text style={styles.cardTitle}>Assessment Breakdown</Text>
        {result.breakdown && (
          <View>
            <View style={styles.breakdownRow}>
              <Text style={styles.breakdownLabel}>Total Questions:</Text>
              <Text style={styles.breakdownValue}>{result.breakdown.total_questions || 'N/A'}</Text>
            </View>
            <View style={styles.breakdownRow}>
              <Text style={styles.breakdownLabel}>Correct Answers:</Text>
              <Text style={styles.breakdownValue}>
                {result.breakdown.correct_answers || 'N/A'}
              </Text>
            </View>
            <View style={styles.breakdownRow}>
              <Text style={styles.breakdownLabel}>Accuracy:</Text>
              <Text style={styles.breakdownValue}>
                {result.breakdown.overall_accuracy != null
                  ? `${result.breakdown.overall_accuracy}%`
                  : result.breakdown.accuracy
                    ? `${(result.breakdown.accuracy * 100).toFixed(1)}%`
                    : 'N/A'}
              </Text>
            </View>
          </View>
        )}
      </Card>

      {result.breakdown?.feedback && (
        <Card style={styles.feedbackCard}>
          <Text style={styles.feedbackLabel}>AI Feedback</Text>
          <Text style={styles.feedbackText}>{result.breakdown.feedback}</Text>
        </Card>
      )}

      <View style={styles.buttonContainer}>
        <Button
          title="View Dashboard"
          onPress={() => navigation.navigate('Dashboard')}
          style={styles.button}
        />
        <Button
          title="Ask Your Coach"
          onPress={() => navigation.navigate('Coach')}
          variant="secondary"
          style={styles.button}
        />
        <Button
          title="Another Assessment"
          onPress={() => navigation.navigate('Assessments')}
          variant="secondary"
          style={styles.button}
        />
      </View>
    </ScrollView>
  );
};
