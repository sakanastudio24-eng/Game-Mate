import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useRouter } from "expo-router";
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
  rightAction?: {
    icon: string;
    onPress?: () => void;
    label?: string;
  };
  rightAction2?: {
    icon: string;
    onPress?: () => void;
    label?: string;
  };
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
  rightAction,
  rightAction2,
  rightIcon,
  onRightPress,
  rightIcon2,
  onRightPress2,
}: HeaderProps) {
  const router = useRouter();
  const resolvedRightIcon = rightAction?.icon ?? rightIcon;
  const resolvedRightPress = rightAction?.onPress ?? onRightPress;
  const resolvedRightIcon2 = rightAction2?.icon ?? rightIcon2;
  const resolvedRightPress2 = rightAction2?.onPress ?? onRightPress2;

  return (
    <View style={styles.header}>
      <View style={styles.leftSection}>
        {showBackButton && (
          <Pressable onPress={onBack ?? (() => router.back())} style={styles.backButton}>
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
        {resolvedRightIcon && (
          <Pressable onPress={resolvedRightPress} style={styles.iconButton}>
            <MaterialCommunityIcons
              name={resolvedRightIcon as any}
              size={24}
              color={colors.text}
            />
          </Pressable>
        )}
        {resolvedRightIcon2 && (
          <Pressable onPress={resolvedRightPress2} style={styles.iconButton}>
            <MaterialCommunityIcons
              name={resolvedRightIcon2 as any}
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
