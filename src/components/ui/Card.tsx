import React from "react";
import {
  Pressable,
  StyleProp,
  StyleSheet,
  View,
  ViewStyle,
} from "react-native";
import { useResponsive } from "../../lib/responsive";
import { colors, spacing } from "../../lib/theme";

// Card component for grouping content
// Provides consistent styling with padding and background

interface CardProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  onPress?: () => void;
  variant?: "default" | "elevated";
  accessibilityLabel?: string;
  accessibilityHint?: string;
}

export function Card({
  children,
  style,
  onPress,
  accessibilityLabel,
  accessibilityHint,
}: CardProps) {
  const responsive = useResponsive();
  const sharedStyle = [
    styles.card,
    {
      borderRadius: responsive.cardRadius,
      padding: responsive.cardPadding,
    },
    style,
  ];

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        accessibilityHint={accessibilityHint}
        style={({ pressed }) => [sharedStyle, pressed && styles.pressed]}
      >
        {children}
      </Pressable>
    );
  }

  return <View style={sharedStyle}>{children}</View>;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    padding: spacing.lg,
    borderColor: colors.border,
    borderWidth: 1,
    marginBottom: spacing.md,
  },
  pressed: {
    opacity: 0.88,
  },
});
