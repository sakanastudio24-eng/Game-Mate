import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import React, { useEffect, useRef } from "react";
import { Animated, Pressable, StyleSheet, View } from "react-native";
import { Text } from "react-native-paper";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useResponsive } from "../../lib/responsive";
import { colors, spacing } from "../../lib/theme";

export interface ToastAction {
  label: string;
  onPress: () => void;
}

interface ToastProps {
  visible: boolean;
  message: string;
  icon?: string;
  durationMs?: number;
  action?: ToastAction;
  onDismiss: () => void;
}

export function Toast({
  visible,
  message,
  icon = "check-circle-outline",
  durationMs = 2600,
  action,
  onDismiss,
}: ToastProps) {
  const insets = useSafeAreaInsets();
  const responsive = useResponsive();
  const translateY = useRef(new Animated.Value(24)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const toastBottomOffset =
    Math.max(insets.bottom, responsive.safeBottomInset) +
    responsive.tabBarBaseHeight +
    spacing.sm;

  useEffect(() => {
    if (!visible) return;

    Animated.parallel([
      Animated.timing(translateY, {
        toValue: 0,
        duration: 180,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: 180,
        useNativeDriver: true,
      }),
    ]).start();

    const timeout = setTimeout(() => {
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: 24,
          duration: 160,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0,
          duration: 160,
          useNativeDriver: true,
        }),
      ]).start(onDismiss);
    }, durationMs);

    return () => {
      clearTimeout(timeout);
    };
  }, [action, durationMs, message, onDismiss, opacity, translateY, visible]);

  if (!visible) return null;

  return (
    <Animated.View
      style={[
        styles.wrap,
        {
          opacity,
          transform: [{ translateY }],
          bottom: toastBottomOffset,
        },
      ]}
      pointerEvents="box-none"
    >
      <View style={styles.toast}>
        <MaterialCommunityIcons name={icon as any} size={18} color={colors.primary} />
        <Text style={styles.message} numberOfLines={2}>
          {message}
        </Text>

        {action ? (
          <Pressable
            onPress={action.onPress}
            accessibilityRole="button"
            accessibilityLabel={action.label}
            style={({ pressed }) => [styles.action, pressed && styles.pressed]}
          >
            <Text style={styles.actionText}>{action.label}</Text>
          </Pressable>
        ) : null}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: "absolute",
    left: spacing.md,
    right: spacing.md,
    bottom: spacing.lg,
    zIndex: 50,
  },
  toast: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    backgroundColor: "#1E1E1E",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  message: {
    flex: 1,
    color: colors.text,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "700",
  },
  action: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.primary,
    backgroundColor: "rgba(255,159,102,0.14)",
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  actionText: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: "800",
  },
  pressed: {
    opacity: 0.8,
  },
});
