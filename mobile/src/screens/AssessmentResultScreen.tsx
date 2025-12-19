import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { theme } from '../theme';

interface AssessmentResultScreenProps {
  navigation: any;
  route: {
    params: {
      result: {
        skill_name: string;
        score: number;
        level: string;
        breakdown: any;
      };
      skillName: string;
    };
  };
}

export const AssessmentResultScreen: React.FC<AssessmentResultScreenProps> = ({
  navigation,
  route,
}) => {
  const { result } = route.params;

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
                {result.breakdown.accuracy
                  ? `${(result.breakdown.accuracy * 100).toFixed(1)}%`
                  : 'N/A'}
              </Text>
            </View>
          </View>
        )}
      </Card>

      <View style={styles.buttonContainer}>
        <Button
          title="Back to Assessments"
          onPress={() => navigation.navigate('Assessments')}
          variant="secondary"
          style={styles.button}
        />
        <Button
          title="View Dashboard"
          onPress={() => navigation.navigate('Dashboard')}
          style={styles.button}
        />
      </View>
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
  resultCard: {
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  skillName: {
    ...theme.typography.h3,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.lg,
  },
  scoreContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: theme.spacing.md,
  },
  score: {
    ...theme.typography.h1,
    color: theme.colors.primary[800],
    fontSize: 48,
  },
  scoreLabel: {
    ...theme.typography.h3,
    color: theme.colors.text.secondary,
    marginLeft: theme.spacing.xs,
  },
  levelBadge: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.full,
  },
  levelText: {
    ...theme.typography.button,
    textTransform: 'uppercase',
  },
  cardTitle: {
    ...theme.typography.h4,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.md,
  },
  breakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
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
    fontWeight: '600',
    color: theme.colors.text.primary,
  },
  buttonContainer: {
    gap: theme.spacing.md,
    marginTop: theme.spacing.md,
  },
  button: {
    width: '100%',
  },
});

