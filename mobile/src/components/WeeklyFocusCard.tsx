import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Card } from './Card';
import { AppTheme } from '../theme';
import { useStyles } from '../theme/useStyles';
import { WeeklyPlanData } from '../types';

const createStyles = (theme: AppTheme) => ({
  card: {
    marginBottom: theme.spacing.lg,
    borderWidth: 1,
    borderColor: `${theme.colors.violet}55`,
    backgroundColor: `${theme.colors.violet}10`,
  },
  title: {
    ...theme.typography.h4,
    color: theme.colors.cream,
    fontWeight: '700' as const,
    marginBottom: theme.spacing.sm,
  },
  focus: {
    ...theme.typography.body,
    color: theme.colors.text.primary,
    fontWeight: '600' as const,
    marginBottom: theme.spacing.md,
  },
  item: {
    flexDirection: 'row' as const,
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.sm,
  },
  bullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: theme.colors.accent,
    marginTop: 7,
  },
  itemText: {
    ...theme.typography.bodySmall,
    color: theme.colors.muted,
    flex: 1,
  },
  skillName: {
    color: theme.colors.cream,
    fontWeight: '600' as const,
  },
  checkIn: {
    ...theme.typography.caption,
    color: theme.colors.muted,
    marginTop: theme.spacing.sm,
  },
  cta: {
    marginTop: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: `${theme.colors.violet}55`,
    backgroundColor: `${theme.colors.violet}18`,
    alignSelf: 'flex-start' as const,
  },
  ctaText: {
    ...theme.typography.bodySmall,
    color: theme.colors.violet,
    fontWeight: '700' as const,
  },
});

interface WeeklyFocusCardProps {
  plan: WeeklyPlanData;
  onAskCoach?: (starter: string) => void;
}

export const WeeklyFocusCard: React.FC<WeeklyFocusCardProps> = ({ plan, onAskCoach }) => {
  const styles = useStyles(createStyles);
  if (!plan?.focus) return null;

  const items = (plan.plan || []).slice(0, 3);
  const starter = `Help me with this week's focus: ${plan.focus}`;

  return (
    <Card style={styles.card}>
      <Text style={styles.title}>Weekly focus</Text>
      <Text style={styles.focus}>{plan.focus}</Text>
      {items.map((item) => (
        <View key={item.skill} style={styles.item}>
          <View style={styles.bullet} />
          <Text style={styles.itemText}>
            <Text style={styles.skillName}>{item.skill}</Text>
            {` · ${item.hours}h — ${item.action}`}
          </Text>
        </View>
      ))}
      {plan.check_in ? <Text style={styles.checkIn}>Check-in: {plan.check_in}</Text> : null}
      {onAskCoach ? (
        <TouchableOpacity style={styles.cta} onPress={() => onAskCoach(starter)}>
          <Text style={styles.ctaText}>Ask coach about this plan</Text>
        </TouchableOpacity>
      ) : null}
    </Card>
  );
};
