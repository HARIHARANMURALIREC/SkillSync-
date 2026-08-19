import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Card } from './Card';
import { theme } from '../theme';
import { HeatDay } from '../lib/gamification';

export function StreakCard({ days = 0, heat = [] }: { days?: number; heat?: HeatDay[] }) {
  return (
    <Card>
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

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.md,
  },
  kicker: {
    ...theme.typography.kicker,
    color: theme.colors.muted,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: theme.borderRadius.full,
    backgroundColor: 'rgba(232, 160, 160, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(232, 160, 160, 0.35)',
  },
  chipText: {
    ...theme.typography.caption,
    color: theme.colors.rose,
    fontWeight: '600',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
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
    backgroundColor: theme.colors.gold.DEFAULT,
  },
});
