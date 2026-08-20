import React from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Card } from './Card';
import { AppTheme } from '../theme';
import { useStyles } from '../theme/useStyles';
import { useTheme } from '../context/ThemeContext';
import { HeatDay } from '../lib/gamification';

const createStyles = (theme: AppTheme) => ({
  header: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'space-between' as const,
    marginBottom: theme.spacing.md,
  },
  kicker: {
    ...theme.typography.kicker,
    color: theme.colors.muted,
  },
  chip: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: theme.borderRadius.full,
    backgroundColor: `${theme.colors.rose}20`,
    borderWidth: 1,
    borderColor: `${theme.colors.rose}55`,
  },
  chipText: {
    ...theme.typography.caption,
    color: theme.colors.rose,
    fontWeight: '600' as const,
  },
  grid: {
    flexDirection: 'row' as const,
    flexWrap: 'wrap' as const,
    width: 7 * 16,
    gap: 4,
  },
  cell: {
    width: 12,
    height: 12,
    borderRadius: 3,
    backgroundColor: theme.colors.gray[100],
  },
  cellOn: {
    backgroundColor: theme.colors.rose,
    shadowColor: theme.colors.rose,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.55,
    shadowRadius: 6,
  },
});

export function StreakCard({ days = 0, heat = [] }: { days?: number; heat?: HeatDay[] }) {
  const styles = useStyles(createStyles);
  const { theme } = useTheme();

  return (
    <Card glow>
      <View style={styles.header}>
        <Text style={styles.kicker}>Streak</Text>
        <View style={styles.chip}>
          <Ionicons name="flame" size={12} color={theme.colors.rose} />
          <Text style={styles.chipText}>
            {days} day{days === 1 ? '' : 's'}
          </Text>
        </View>
      </View>
      <View style={styles.grid}>
        {heat.map((d) => (
          <View key={d.key} style={[styles.cell, d.on && styles.cellOn]} />
        ))}
      </View>
    </Card>
  );
}
