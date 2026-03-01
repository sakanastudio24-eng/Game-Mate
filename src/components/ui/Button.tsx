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
  contentStyle: contentStyleProp,
  labelStyle: labelStyleProp,
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
  const minHeight =
    size === "small"
      ? responsive.buttonHeightSmall
      : size === "large"
        ? responsive.buttonHeightLarge
        : responsive.buttonHeightMedium;
  const minWidth = responsive.touchTargetMin;

  const buttonStyle = [
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
  const contentStyle = [
    {
      minHeight,
      minWidth: fullWidth ? undefined : minWidth,
      paddingHorizontal: size === "small" ? 12 : size === "large" ? 18 : 14,
    },
    contentStyleProp,
  ];

  return (
    <PaperButton
      mode={resolvedMode}
      textColor={
        resolvedMode === "contained" ? colors.background : colors.primary
      }
      buttonColor={resolvedMode === "contained" ? colors.primary : undefined}
      style={buttonStyle}
      contentStyle={contentStyle}
      labelStyle={[
        { fontSize: responsive.bodySize, fontWeight: "700" },
        labelStyleProp,
      ]}
      {...props}
    >
      {children ?? label ?? ""}
    </PaperButton>
  );
}
