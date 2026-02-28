import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import React from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { Text } from "react-native-paper";
import { colors, spacing, typography } from "../../lib/theme";

// Header component with title, optional back button, and action buttons
// Used across all screens for consistent navigation header

interface HeaderProps {
  title: string;
  subtitle?: string;
  showBackButton?: boolean;
  onBack?: () => void;
  rightIcon?: string;
  onRightPress?: () => void;
  rightIcon2?: string;
  onRightPress2?: () => void;
}

export function Header({
  title,
  subtitle,
  showBackButton = false,
  onBack,
  rightIcon,
  onRightPress,
  rightIcon2,
  onRightPress2,
}: HeaderProps) {
  return (
    <View style={styles.header}>
      <View style={styles.leftSection}>
        {showBackButton && (
          <Pressable onPress={onBack} style={styles.backButton}>
            <MaterialCommunityIcons
              name="chevron-left"
              size={24}
              color={colors.text}
            />
          </Pressable>
        )}
        <View style={styles.titleSection}>
          <Text style={styles.title}>{title}</Text>
          {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
        </View>
      </View>

      <View style={styles.rightSection}>
        {rightIcon && (
          <Pressable onPress={onRightPress} style={styles.iconButton}>
            <MaterialCommunityIcons
              name={rightIcon as any}
              size={24}
              color={colors.text}
            />
          </Pressable>
        )}
        {rightIcon2 && (
          <Pressable onPress={onRightPress2} style={styles.iconButton}>
            <MaterialCommunityIcons
              name={rightIcon2 as any}
              size={24}
              color={colors.text}
            />
          </Pressable>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.background,
  },
  leftSection: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  backButton: {
    marginRight: spacing.sm,
    padding: spacing.sm,
  },
  titleSection: {
    flex: 1,
  },
  title: {
    ...typography.heading,
    color: colors.text,
    fontSize: 18,
    fontWeight: "700",
  },
  subtitle: {
    color: colors.textSecondary,
    fontSize: 12,
    marginTop: spacing.xs,
  },
  rightSection: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  iconButton: {
    padding: spacing.sm,
  },
});
