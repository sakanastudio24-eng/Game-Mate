import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import React from "react";
import { Modal, Pressable, StyleSheet, View } from "react-native";
import { Text } from "react-native-paper";
import { colors, spacing } from "../../lib/theme";

export interface ActionSheetOption {
  id: string;
  label: string;
  icon?: string;
  destructive?: boolean;
  onPress: () => void;
}

interface ActionSheetProps {
  visible: boolean;
  title: string;
  subtitle?: string;
  options: ActionSheetOption[];
  onClose: () => void;
}

export function ActionSheet({ visible, title, subtitle, options, onClose }: ActionSheetProps) {
  const handleOptionPress = (onPress: () => void) => {
    onClose();
    onPress();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <View style={styles.root}>
        <Pressable style={styles.scrim} onPress={onClose} accessibilityLabel="Close menu" />
        <View style={styles.sheet}>
          <View style={styles.header}>
            <Text style={styles.title}>{title}</Text>
            {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
          </View>

          <View style={styles.options}>
            {options.map((option) => (
              <Pressable
                key={option.id}
                onPress={() => handleOptionPress(option.onPress)}
                accessibilityRole="button"
                accessibilityLabel={option.label}
                style={({ pressed }) => [styles.optionButton, pressed && styles.optionPressed]}
              >
                {option.icon ? (
                  <MaterialCommunityIcons
                    name={option.icon as any}
                    size={20}
                    color={option.destructive ? colors.destructive : colors.text}
                    style={styles.optionIcon}
                  />
                ) : null}
                <Text style={[styles.optionText, option.destructive && styles.optionTextDestructive]}>
                  {option.label}
                </Text>
              </Pressable>
            ))}
          </View>

          <Pressable
            onPress={onClose}
            accessibilityRole="button"
            accessibilityLabel="Cancel"
            style={({ pressed }) => [styles.cancelButton, pressed && styles.optionPressed]}
          >
            <Text style={styles.cancelText}>Cancel</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    justifyContent: "flex-end",
  },
  scrim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.46)",
  },
  sheet: {
    backgroundColor: "#1F1F1F",
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.lg,
    borderTopWidth: 1,
    borderColor: colors.border,
  },
  header: {
    paddingBottom: spacing.sm,
  },
  title: {
    color: colors.text,
    fontSize: 17,
    fontWeight: "800",
  },
  subtitle: {
    color: colors.textSecondary,
    fontSize: 13,
    marginTop: 2,
  },
  options: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    overflow: "hidden",
    backgroundColor: "#242424",
  },
  optionButton: {
    minHeight: 50,
    paddingHorizontal: spacing.md,
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  optionPressed: {
    opacity: 0.72,
  },
  optionIcon: {
    marginRight: spacing.sm,
  },
  optionText: {
    color: colors.text,
    fontSize: 15,
    fontWeight: "700",
  },
  optionTextDestructive: {
    color: colors.destructive,
  },
  cancelButton: {
    marginTop: spacing.md,
    minHeight: 50,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: "#242424",
    alignItems: "center",
    justifyContent: "center",
  },
  cancelText: {
    color: colors.textSecondary,
    fontSize: 15,
    fontWeight: "700",
  },
});
