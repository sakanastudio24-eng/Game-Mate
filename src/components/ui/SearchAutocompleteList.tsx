import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import React from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { Text } from "react-native-paper";
import { colors, spacing } from "../../lib/theme";

interface SearchAutocompleteListProps {
  items: string[];
  onSelect: (value: string) => void;
}

export function SearchAutocompleteList({
  items,
  onSelect,
}: SearchAutocompleteListProps) {
  if (items.length === 0) return null;

  return (
    <View style={styles.wrap}>
      <Text style={styles.title}>Suggestions</Text>
      <View style={styles.list}>
        {items.map((item) => (
          <Pressable
            key={item}
            onPress={() => onSelect(item)}
            accessibilityRole="button"
            accessibilityLabel={`Autocomplete ${item}`}
            style={({ pressed }) => [styles.row, pressed && styles.pressed]}
          >
            <MaterialCommunityIcons name="magnify" size={14} color={colors.textSecondary} />
            <Text numberOfLines={1} style={styles.rowText}>
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
    backgroundColor: colors.surfaceSoft,
    padding: spacing.sm,
  },
  title: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: "700",
    marginBottom: spacing.xs,
  },
  list: {
    gap: spacing.xs,
  },
  row: {
    borderRadius: 8,
    paddingVertical: 7,
    paddingHorizontal: spacing.xs,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
  rowText: {
    color: colors.text,
    fontSize: 12,
    fontWeight: "600",
    flex: 1,
  },
  pressed: {
    opacity: 0.8,
  },
});
