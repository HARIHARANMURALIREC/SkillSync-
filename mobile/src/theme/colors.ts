export type ColorPalette = ReturnType<typeof buildPalette>;

function buildPalette(base: {
  bg: string;
  elev: string;
  surface: string;
  surface2: string;
  fg: string;
  muted: string;
  faint: string;
  accent: string;
  accent2: string;
  violet: string;
  teal: string;
  rose: string;
  amber: string;
  success: string;
  error: string;
  border: string;
  borderLight: string;
}) {
  return {
    ink: base.bg,
    cream: base.fg,
    muted: base.muted,
    surface: base.surface,
    elev: base.elev,
    surface2: base.surface2,
    faint: base.faint,

    accent: base.accent,
    accent2: base.accent2,

    gold: {
      DEFAULT: base.accent,
      hover: base.accent,
      muted: base.accent,
      faint: `${base.accent}20`,
    },

    primary: {
      50: `${base.accent}20`,
      100: `${base.accent}33`,
      200: base.accent,
      300: base.accent,
      400: base.accent,
      500: base.accent,
      600: base.accent,
      700: base.accent2,
      800: base.accent,
      900: base.accent2,
    },

    background: base.bg,
    cardBackground: base.surface,

    text: {
      primary: base.fg,
      secondary: base.muted,
      tertiary: base.faint,
      inverse: base.bg,
    },

    violet: base.violet,
    teal: base.teal,
    rose: base.rose,
    amber: base.amber,
    success: base.success,
    warning: base.amber,
    error: base.error,
    info: base.teal,

    gray: {
      50: base.borderLight,
      100: base.borderLight,
      200: base.border,
      300: base.border,
      400: base.muted,
      500: base.faint,
      600: base.surface2,
      700: base.surface,
      800: base.elev,
      900: base.bg,
    },

    border: base.border,
    borderLight: base.borderLight,
    shadow: 'rgba(0, 0, 0, 0.55)',
    shadowDark: 'rgba(0, 0, 0, 0.75)',
    neon: base.accent,
  };
}

export const darkColors = buildPalette({
  bg: '#050508',
  elev: '#0A0B10',
  surface: '#111218',
  surface2: '#161821',
  fg: '#F8FAFC',
  muted: '#94A3B8',
  faint: '#64748B',
  accent: '#22D3EE',
  accent2: '#A855F7',
  violet: '#A855F7',
  teal: '#2DD4BF',
  rose: '#F472B6',
  amber: '#FBBF24',
  success: '#34D399',
  error: '#F87171',
  border: 'rgba(56, 62, 78, 0.9)',
  borderLight: 'rgba(56, 62, 78, 0.45)',
});

export const lightColors = buildPalette({
  bg: '#F4F4F5',
  elev: '#FFFFFF',
  surface: '#FFFFFF',
  surface2: '#F1F5F9',
  fg: '#0F172A',
  muted: '#64748B',
  faint: '#94A3B8',
  accent: '#0891B2',
  accent2: '#7C3AED',
  violet: '#7C3AED',
  teal: '#0D9488',
  rose: '#DB2777',
  amber: '#D97706',
  success: '#059669',
  error: '#DC2626',
  border: 'rgba(226, 232, 240, 1)',
  borderLight: 'rgba(226, 232, 240, 0.6)',
});

export default darkColors;
