import { DefaultTheme as NavDefaultTheme, DarkTheme as NavDarkTheme, Theme } from '@react-navigation/native';

export const DefaultTheme: Theme = {
  ...NavDefaultTheme,
  colors: {
    ...NavDefaultTheme.colors,
    primary: '#2196F3',
    background: '#FFFFFF',
    card: '#FFFFFF',
    text: '#212121',
    border: '#E0E0E0',
    notification: '#2196F3',
  },
};

export const DarkTheme: Theme = {
  ...NavDarkTheme,
  colors: {
    ...NavDarkTheme.colors,
    primary: '#90CAF9',
    background: '#121212',
    card: '#1E1E1E',
    text: '#FAFAFA',
    border: '#333333',
    notification: '#90CAF9',
  },
};

// Design tokens for app components (light defaults)
export const colors = {
  primary: '#2196F3',
  primaryLight: '#E3F2FD',
  textPrimary: '#212121',
  textSecondary: '#757575',
  background: '#FFFFFF',
  surface: '#FFFFFF',
  border: '#E0E0E0',
  success: '#4CAF50',
  warning: '#FFC107',
  danger: '#F44336',
  white: '#FFFFFF',
  black: '#000000',
};

export const spacing = {
  xxs: 4,
  xs: 6,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
};

export const typography = {
  h1: { fontSize: 28, fontWeight: '700' as const },
  h2: { fontSize: 22, fontWeight: '700' as const },
  h3: { fontSize: 16, fontWeight: '600' as const },
  body: { fontSize: 14, fontWeight: '400' as const },
  bodyBold: { fontSize: 14, fontWeight: '700' as const },
  caption: { fontSize: 12, fontWeight: '400' as const },
};
