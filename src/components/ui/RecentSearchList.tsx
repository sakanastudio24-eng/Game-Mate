import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import React from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { Text } from "react-native-paper";
import { colors, spacing } from "../../lib/theme";

interface RecentSearchListProps {
  items: string[];
  onSelect: (value: string) => void;
  onClear: () => void;
}

export function RecentSearchList({ items, onSelect, onClear }: RecentSearchListProps) {
  if (items.length === 0) return null;

  return (
    <View style={styles.wrap}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>Recent searches</Text>
        <Pressable
          onPress={onClear}
          accessibilityRole="button"
          accessibilityLabel="Clear recent searches"
          style={({ pressed }) => [styles.clearButton, pressed && styles.pressed]}
        >
          <Text style={styles.clearText}>Clear</Text>
        </Pressable>
      </View>

      <View style={styles.list}>
        {items.map((item) => (
          <Pressable
            key={item}
            onPress={() => onSelect(item)}
            accessibilityRole="button"
            accessibilityLabel={`Reuse search ${item}`}
            style={({ pressed }) => [styles.row, pressed && styles.pressed]}
          >
            <MaterialCommunityIcons name="history" size={14} color={colors.textSecondary} />
            <Text style={styles.rowText} numberOfLines={1}>
              {item}
            </Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginTop: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    backgroundColor: "#222222",
    padding: spacing.sm,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.xs,
  },
  title: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: "700",
  },
  clearButton: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  clearText: {
    color: colors.text,
    fontSize: 11,
    fontWeight: "700",
  },
  list: {
    gap: spacing.xs,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    borderRadius: 8,
    paddingHorizontal: spacing.xs,
    paddingVertical: 6,
  },
  rowText: {
    color: colors.text,
    flex: 1,
    fontSize: 12,
    fontWeight: "600",
  },
  pressed: {
    opacity: 0.8,
  },
});
