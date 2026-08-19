import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Card } from './Card';
import { theme } from '../theme';
import { LevelInfo } from '../lib/gamification';

export function LevelCard({ level }: { level: LevelInfo }) {
  return (
    <Card>
      <Text style={styles.kicker}>Level</Text>
      <View style={styles.row}>
        <View style={styles.ring}>
          <Text style={styles.ringText}>{level.level}</Text>
        </View>
        <View style={styles.meta}>
          <Text style={styles.title}>{level.title}</Text>
          <Text style={styles.xp}>{Math.round(level.xp)} XP</Text>
          {level.next ? (
            <Text style={styles.next}>
              Next: {level.next.title} at {level.next.xp} XP
            </Text>
          ) : null}
        </View>
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
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ring: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 3,
    borderColor: theme.colors.gold.DEFAULT,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.md,
  },
  ringText: {
    ...theme.typography.h4,
    color: theme.colors.cream,
  },
  meta: {
    flex: 1,
  },
  title: {
    ...theme.typography.h3,
    color: theme.colors.cream,
  },
  xp: {
    ...theme.typography.bodySmall,
    color: theme.colors.muted,
    marginTop: 2,
  },
  next: {
    ...theme.typography.caption,
    color: theme.colors.text.tertiary,
    marginTop: 4,
  },
});
