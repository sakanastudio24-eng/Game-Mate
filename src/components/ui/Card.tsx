import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { colors, spacing } from '../../lib/theme';

// Card component for grouping content
// Provides consistent styling with padding and background

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  onPress?: () => void;
}

export function Card({ children, style, onPress }: CardProps) {
  return (
    <View
      style={[styles.card, style]}
      onTouchEnd={onPress}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: 8,
    padding: spacing.lg,
    borderColor: colors.border,
    borderWidth: 1,
    marginBottom: spacing.md,
  },
});
