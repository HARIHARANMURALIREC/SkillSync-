import React from 'react';
import { View, Text } from 'react-native';
import { Card } from './Card';
import { AppTheme } from '../theme';
import { useStyles } from '../theme/useStyles';
import { LevelInfo } from '../lib/gamification';

const createStyles = (theme: AppTheme) => ({
  kicker: {
    ...theme.typography.kicker,
    color: theme.colors.muted,
    marginBottom: theme.spacing.md,
  },
  row: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
  },
  ring: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 3,
    borderColor: theme.colors.violet,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    marginRight: theme.spacing.md,
    shadowColor: theme.colors.violet,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
  },
  ringText: {
    ...theme.typography.h4,
    color: theme.colors.cream,
    fontFamily: theme.typography.mono.fontFamily,
  },
  meta: {
    flex: 1,
  },
  title: {
    ...theme.typography.h3,
    color: theme.colors.cream,
  },
  xp: {
    ...theme.typography.mono,
    fontSize: 14,
    color: theme.colors.accent,
    marginTop: 2,
  },
  next: {
    ...theme.typography.caption,
    color: theme.colors.text.tertiary,
    marginTop: 4,
  },
});

export function LevelCard({ level }: { level: LevelInfo }) {
  const styles = useStyles(createStyles);

  return (
    <Card glow>
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
