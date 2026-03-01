import React from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { Text } from "react-native-paper";
import { colors, spacing } from "../../lib/theme";

export interface FilterChipOption {
  id: string;
  label: string;
}

interface FilterChipsProps {
  options: FilterChipOption[];
  selectedIds: string[];
  onToggle: (id: string) => void;
  accessibilityLabelPrefix?: string;
}

export function FilterChips({
  options,
  selectedIds,
  onToggle,
  accessibilityLabelPrefix = "Toggle filter",
}: FilterChipsProps) {
  return (
    <View style={styles.wrap}>
      {options.map((option) => {
        const selected = selectedIds.includes(option.id);

        return (
          <Pressable
            key={option.id}
            onPress={() => onToggle(option.id)}
            accessibilityRole="button"
            accessibilityLabel={`${accessibilityLabelPrefix}: ${option.label}`}
            accessibilityState={{ selected }}
            style={({ pressed }) => [
              styles.chip,
              selected ? styles.chipActive : undefined,
              pressed ? styles.pressed : undefined,
            ]}
          >
            <Text style={[styles.chipText, selected ? styles.chipTextActive : undefined]}>
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.xs,
  },
  chip: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: "#242424",
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  chipActive: {
    borderColor: colors.primary,
    backgroundColor: "rgba(255,159,102,0.18)",
  },
  chipText: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: "700",
  },
  chipTextActive: {
    color: colors.primary,
  },
  pressed: {
    opacity: 0.82,
  },
});
