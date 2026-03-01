import React from "react";
import {
  Button as PaperButton,
  ButtonProps as PaperButtonProps,
} from "react-native-paper";
import { useResponsive } from "../../lib/responsive";
import { colors } from "../../lib/theme";

// Button wrapper around React Native Paper Button
// Provides consistent styling and color handling

type ButtonVariant = "primary" | "secondary";

interface ButtonProps extends Omit<PaperButtonProps, "children"> {
  label?: string;
  children?: React.ReactNode;
  mode?: "contained" | "outlined" | "text";
  variant?: ButtonVariant;
  size?: "small" | "medium" | "large";
  fullWidth?: boolean;
}

export function Button({
  label,
  children,
  mode = "contained",
  variant,
  size = "medium",
  fullWidth = false,
  style,
  ...props
}: ButtonProps) {
  const responsive = useResponsive();
  const resolvedMode =
    variant === "secondary"
      ? "outlined"
      : variant === "primary"
        ? "contained"
        : mode;

  const buttonStyle = [
    size === "small"
      ? { minHeight: Math.max(32, responsive.iconButtonSize - 6) }
      : size === "large"
        ? { minHeight: Math.max(46, responsive.iconButtonSize + 8) }
        : { minHeight: Math.max(40, responsive.iconButtonSize) },
    {
      borderRadius:
        size === "small"
          ? responsive.cardRadius - 8
          : size === "large"
            ? responsive.cardRadius - 4
            : responsive.cardRadius - 6,
    },
    fullWidth ? { width: "100%" as const } : undefined,
    style,
  ];

  return (
    <PaperButton
      mode={resolvedMode}
      textColor={
        resolvedMode === "contained" ? colors.background : colors.primary
      }
      buttonColor={resolvedMode === "contained" ? colors.primary : undefined}
      style={buttonStyle}
      labelStyle={{ fontSize: responsive.bodySize, fontWeight: "700" }}
      {...props}
    >
      {children ?? label ?? ""}
    </PaperButton>
  );
}
