import React from "react";
import {
  Button as PaperButton,
  ButtonProps as PaperButtonProps,
} from "react-native-paper";
import { colors } from "../../lib/theme";

// Button wrapper around React Native Paper Button
// Provides consistent styling and color handling

interface ButtonProps extends Omit<PaperButtonProps, "children"> {
  label: string;
  mode?: "contained" | "outlined" | "text";
  size?: "small" | "medium" | "large";
}

export function Button({
  label,
  mode = "contained",
  size = "medium",
  ...props
}: ButtonProps) {
  const buttonStyle = size === "small" ? { minHeight: 32 } : undefined;

  return (
    <PaperButton
      mode={mode}
      textColor={mode === "contained" ? colors.background : colors.primary}
      buttonColor={mode === "contained" ? colors.primary : undefined}
      style={buttonStyle}
      {...props}
    >
      {label}
    </PaperButton>
  );
}
