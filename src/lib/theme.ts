import { MD3LightTheme } from "react-native-paper";

// GameMate custom theme with Figma colors

export const colors = {
  primary: "#FF9F66", // Orange - primary action
  secondary: "#66FF9F", // Green - secondary accent
  online: "#66FF9F", // Green - online status
  destructive: "#FF6B6B", // Red - destructive actions
  background: "#1A1A1A", // Dark background
  surface: "#2D2D2D", // Elevated surfaces (cards)
  text: "#F5F5F5", // Light text
  textSecondary: "#B0B0B0", // Secondary text
  border: "#3D3D3D", // Border/divider color
  success: "#51CF66", // Green - success states
  warning: "#FFD43B", // Yellow - warning states
  error: "#FF6B6B", // Red - error states
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const typography = {
  heading: {
    fontFamily: "System",
    fontWeight: "700" as const,
    letterSpacing: 0.15,
  },
  body: {
    fontFamily: "System",
    fontWeight: "400" as const,
  },
  caption: {
    fontFamily: "System",
    fontWeight: "500" as const,
    fontSize: 12,
    letterSpacing: 0.4,
  },
};

// React Native Paper theme
export const paperTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: colors.primary,
    secondary: colors.secondary,
    background: colors.background,
    surface: colors.surface,
    surfaceVariant: colors.surface,
    error: colors.error,
    onBackground: colors.text,
    onSurface: colors.text,
  },
};

export default {
  colors,
  spacing,
  typography,
  paperTheme,
};
