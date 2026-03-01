import React from "react";
import {
  Chip as PaperChip,
  ChipProps as PaperChipProps,
} from "react-native-paper";
import { useResponsive } from "../../lib/responsive";
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
  const responsive = useResponsive();
  const isSmall = size === "small";
  const baseHeight = isSmall ? Math.max(28, responsive.iconButtonSize - 12) : Math.max(34, responsive.iconButtonSize - 6);

  return (
    <PaperChip
      onPress={onPress}
      selected={selected}
      mode={selected ? "flat" : "outlined"}
      selectedColor={colors.text}
      showSelectedCheck={false}
      style={[
        {
          height: baseHeight,
          borderRadius: responsive.cardRadius,
        },
        isSmall ? undefined : { paddingHorizontal: 4 },
      ]}
      textStyle={
        isSmall
          ? { fontSize: responsive.captionSize, lineHeight: Math.round(responsive.captionSize * 1.35) }
          : { fontSize: responsive.bodySmallSize }
      }
      {...props}
    >
      {children ?? label ?? ""}
    </PaperChip>
  );
}
