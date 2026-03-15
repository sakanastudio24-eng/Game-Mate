import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import React from "react";
import { StyleProp, StyleSheet, View, ViewStyle } from "react-native";
import { Text } from "react-native-paper";
import { colors, spacing } from "../../lib/theme";

interface EmptyStateProps {
  title: string;
  description: string;
  suggestion?: string;
  icon?: string;
  style?: StyleProp<ViewStyle>;
}

export function EmptyState({
  title,
  description,
  suggestion,
  icon = "magnify-close",
  style,
}: EmptyStateProps) {
  return (
    <View style={[styles.wrap, style]}>
      <View style={styles.iconWrap}>
        <MaterialCommunityIcons name={icon as any} size={20} color={colors.textSecondary} />
      </View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.description}>{description}</Text>
      {suggestion ? <Text style={styles.suggestion}>{suggestion}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceRaised,
    borderRadius: 14,
    padding: spacing.md,
    alignItems: "center",
  },
  iconWrap: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceInset,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.sm,
  },
  title: {
    color: colors.text,
    fontWeight: "800",
    fontSize: 16,
  },
  description: {
    color: colors.textSecondary,
    marginTop: 4,
    textAlign: "center",
    lineHeight: 20,
  },
  suggestion: {
    color: colors.textSecondary,
    marginTop: spacing.sm,
    fontSize: 12,
    fontWeight: "700",
    textAlign: "center",
  },
});
