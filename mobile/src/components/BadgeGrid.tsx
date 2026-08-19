import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Card } from './Card';
import { theme } from '../theme';
import { BadgeInfo } from '../lib/gamification';

export function BadgeGrid({ badges = [] }: { badges?: BadgeInfo[] }) {
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

const styles = StyleSheet.create({
  kicker: {
    ...theme.typography.kicker,
    color: theme.colors.muted,
    marginBottom: theme.spacing.md,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
  item: {
    width: '48%',
    flexGrow: 1,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    padding: theme.spacing.sm,
  },
  unlocked: {
    borderColor: 'rgba(200, 169, 106, 0.4)',
    backgroundColor: theme.colors.gold.faint,
  },
  locked: {
    borderColor: theme.colors.border,
    opacity: 0.5,
  },
  name: {
    ...theme.typography.bodySmall,
    fontWeight: '600',
    color: theme.colors.cream,
  },
  hint: {
    ...theme.typography.caption,
    color: theme.colors.muted,
    marginTop: 4,
  },
});
