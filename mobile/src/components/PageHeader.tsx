import React from 'react';
import { View, Text } from 'react-native';
import { AppTheme } from '../theme';
import { useStyles } from '../theme/useStyles';

interface PageHeaderProps {
  kicker?: string;
  title: string;
  subtitle?: string;
}

const createStyles = (theme: AppTheme) => ({
  container: {
    marginBottom: theme.spacing.lg,
  },
  kicker: {
    ...theme.typography.kicker,
    color: theme.colors.accent,
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

export const PageHeader: React.FC<PageHeaderProps> = ({ kicker, title, subtitle }) => {
  const styles = useStyles(createStyles);
  return (
    <View style={styles.container}>
      {kicker && <Text style={styles.kicker}>{kicker}</Text>}
      <Text style={styles.title}>{title}</Text>
      {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
    </View>
  );
};
