import { ColorPalette, darkColors } from './colors';
import spacing from './spacing';
import typography from './typography';

export type AppTheme = {
  colors: ColorPalette;
  spacing: typeof spacing;
  typography: typeof typography;
  borderRadius: {
    sm: number;
    md: number;
    lg: number;
    xl: number;
    full: number;
  };
  shadows: {
    sm: object;
    md: object;
    lg: object;
    neon: object;
  };
};

export function createTheme(colors: ColorPalette): AppTheme {
  return {
    colors,
    spacing,
    typography,
    borderRadius: {
      sm: 8,
      md: 12,
      lg: 16,
      xl: 20,
      full: 9999,
    },
    shadows: {
      sm: {
        shadowColor: colors.neon,
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.15,
        shadowRadius: 4,
        elevation: 2,
      },
      md: {
        shadowColor: colors.neon,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
      },
      lg: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.35,
        shadowRadius: 12,
        elevation: 8,
      },
      neon: {
        shadowColor: colors.neon,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.35,
        shadowRadius: 12,
        elevation: 6,
      },
    },
  };
}

/** Static default (dark) — prefer useTheme() for theme-aware UI */
export const theme = createTheme(darkColors);

export default theme;
