import { Platform } from 'react-native';

export const colors = {
  background: '#F8FAFC',
  surface: '#FFFFFF',
  surfaceMuted: '#F1F5F9',
  primary: '#F97316',
  primaryPressed: '#EA580C',
  text: '#0F172A',
  textSecondary: '#475569',
  border: '#E2E8F0',
  success: '#16A34A',
  successLight: '#DCFCE7',
  danger: '#DC2626',
  dangerLight: '#FEE2E2',
  warning: '#C2410C',
  warningLight: '#FFEDD5',
  shadow: '#0F172A',
  white: '#FFFFFF',
  card: '#FFFFFF',
  muted: '#64748B',
  dark: '#0F172A',
  darkSoft: '#1E293B',
  slate: '#334155',
  orangeSoft: '#FFF7ED',
};

export const spacing = {
  xs: 6,
  sm: 10,
  md: 16,
  lg: 20,
  xl: 24,
  xxl: 32,
};

export const radius = {
  sm: 10,
  md: 14,
  lg: 18,
  xl: 24,
  pill: 999,
};

export const typography = {
  title: 24,
  subtitle: 16,
  body: 14,
  caption: 12,
};

export const shadows = {
  card: Platform.select({
    ios: {
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: 0.08,
      shadowRadius: 18,
    },
    android: {
      elevation: 4,
    },
    default: {},
  }),
};

export const theme = {
  colors,
  spacing,
  radius,
  typography,
  shadows,
};

export default theme;
