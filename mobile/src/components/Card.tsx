import React, { ReactNode } from 'react';
import { View } from 'react-native';
import { AppTheme } from '../theme';
import { useStyles } from '../theme/useStyles';

interface CardProps {
  children: ReactNode;
  style?: object;
  glow?: boolean;
}

const createStyles = (theme: AppTheme) => ({
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  glow: {
    shadowColor: theme.colors.neon,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.18,
    shadowRadius: 10,
    elevation: 4,
  },
});

export const Card: React.FC<CardProps> = ({ children, style, glow }) => {
  const styles = useStyles(createStyles);
  return <View style={[styles.card, glow && styles.glow, style]}>{children}</View>;
};
