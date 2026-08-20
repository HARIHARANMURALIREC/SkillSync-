import React from 'react';
import { View, Text } from 'react-native';
import { Card } from './Card';
import { AppTheme } from '../theme';
import { useStyles } from '../theme/useStyles';
import { BadgeInfo } from '../lib/gamification';

const createStyles = (theme: AppTheme) => ({
  kicker: {
    ...theme.typography.kicker,
    color: theme.colors.muted,
    marginBottom: theme.spacing.md,
  },
  grid: {
    flexDirection: 'row' as const,
    flexWrap: 'wrap' as const,
    gap: theme.spacing.sm,
  },
  item: {
    width: '48%' as const,
    flexGrow: 1,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    padding: theme.spacing.sm,
  },
  unlocked: {
    borderColor: `${theme.colors.accent}66`,
    backgroundColor: `${theme.colors.accent}18`,
  },
  locked: {
    borderColor: theme.colors.border,
    opacity: 0.45,
  },
  name: {
    ...theme.typography.bodySmall,
    fontWeight: '600' as const,
    color: theme.colors.cream,
  },
  hint: {
    ...theme.typography.caption,
    color: theme.colors.muted,
    marginTop: 4,
  },
});

export function BadgeGrid({ badges = [] }: { badges?: BadgeInfo[] }) {
  const styles = useStyles(createStyles);

  return (
    <Card>
      <Text style={styles.kicker}>Badges</Text>
      <View style={styles.grid}>
        {badges.map((badge) => (
          <View
            key={badge.id}
            style={[styles.item, badge.unlocked ? styles.unlocked : styles.locked]}
          >
            <Text style={styles.name}>{badge.name}</Text>
            <Text style={styles.hint}>{badge.hint}</Text>
          </View>
        ))}
      </View>
    </Card>
  );
}
