import { Platform } from 'react-native';

export const fonts = {
  sans: Platform.select({ ios: 'System', android: 'sans-serif', default: 'System' }),
  serif: Platform.select({ ios: 'Georgia', android: 'serif', default: 'Georgia' }),
};

export const typography = {
  h1: {
    fontSize: 32,
    fontWeight: '400' as const,
    lineHeight: 40,
    fontFamily: fonts.serif,
    letterSpacing: -0.5,
  },
  h2: {
    fontSize: 24,
    fontWeight: '400' as const,
    lineHeight: 32,
    fontFamily: fonts.serif,
    letterSpacing: -0.3,
  },
  h3: {
    fontSize: 20,
    fontWeight: '400' as const,
    lineHeight: 28,
    fontFamily: fonts.serif,
  },
  h4: {
    fontSize: 18,
    fontWeight: '500' as const,
    lineHeight: 24,
    fontFamily: fonts.serif,
  },
  body: {
    fontSize: 16,
    fontWeight: '400' as const,
    lineHeight: 24,
    fontFamily: fonts.sans,
  },
  bodySmall: {
    fontSize: 14,
    fontWeight: '400' as const,
    lineHeight: 20,
    fontFamily: fonts.sans,
  },
  caption: {
    fontSize: 12,
    fontWeight: '400' as const,
    lineHeight: 16,
    fontFamily: fonts.sans,
  },
  button: {
    fontSize: 16,
    fontWeight: '600' as const,
    lineHeight: 24,
    fontFamily: fonts.sans,
  },
  kicker: {
    fontSize: 12,
    fontWeight: '500' as const,
    lineHeight: 16,
    fontFamily: fonts.sans,
    letterSpacing: 2.5,
    textTransform: 'uppercase' as const,
  },
};

export default typography;
