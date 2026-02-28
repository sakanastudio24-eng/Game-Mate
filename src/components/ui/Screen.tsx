import React from "react";
import { ScrollView, StyleSheet, View, ViewStyle } from "react-native";
import { colors, spacing } from "../../lib/theme";

// Screen wrapper component for consistent padding and layout
// Supports both scrollable and non-scrollable content

interface ScreenProps {
  children: React.ReactNode;
  scrollable?: boolean;
  style?: ViewStyle;
  padded?: boolean;
}

export function Screen({
  children,
  scrollable = false,
  style,
  padded = true,
}: ScreenProps) {
  const containerStyle = [styles.container, padded && styles.padded, style];

  if (scrollable) {
    return (
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={containerStyle}
        showsVerticalScrollIndicator={false}
      >
        {children}
      </ScrollView>
    );
  }

  return <View style={containerStyle}>{children}</View>;
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  padded: {
    paddingHorizontal: spacing.md,
  },
});
