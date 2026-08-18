import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { theme } from '../theme';

interface PageHeaderProps {
  kicker?: string;
  title: string;
  subtitle?: string;
}

export const PageHeader: React.FC<PageHeaderProps> = ({ kicker, title, subtitle }) => (
  <View style={styles.container}>
    {kicker && <Text style={styles.kicker}>{kicker}</Text>}
    <Text style={styles.title}>{title}</Text>
    {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
  </View>
);

const styles = StyleSheet.create({
  container: {
    marginBottom: theme.spacing.lg,
  },
  kicker: {
    ...theme.typography.kicker,
    color: theme.colors.gold.DEFAULT,
    marginBottom: theme.spacing.sm,
  },
  title: {
    ...theme.typography.h2,
    color: theme.colors.cream,
    marginBottom: theme.spacing.xs,
  },
  subtitle: {
    ...theme.typography.body,
    color: theme.colors.muted,
  },
});
