import React from "react";
import {
  Chip as PaperChip,
  ChipProps as PaperChipProps,
} from "react-native-paper";
import { colors } from "../../lib/theme";

// Chip wrapper around React Native Paper Chip
// Used for tags, filters, and selections

interface ChipProps extends Omit<PaperChipProps, "children"> {
  label?: string;
  children?: React.ReactNode;
  selected?: boolean;
  onPress?: () => void;
  size?: "small" | "medium";
}

export function Chip({
  label,
  children,
  selected = false,
  onPress,
  size = "medium",
  ...props
}: ChipProps) {
  const isSmall = size === "small";

  return (
    <PaperChip
      onPress={onPress}
      selected={selected}
      mode={selected ? "flat" : "outlined"}
      selectedColor={colors.text}
      showSelectedCheck={false}
      style={isSmall ? { height: 28 } : undefined}
      textStyle={isSmall ? { fontSize: 12, lineHeight: 16 } : undefined}
      {...props}
    >
      {children ?? label ?? ""}
    </PaperChip>
  );
}
