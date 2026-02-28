import React from "react";
import { TextInput, TextInputProps } from "react-native-paper";
import { colors, spacing } from "../../lib/theme";

// Input wrapper around React Native Paper TextInput
// Provides consistent styling for text fields

interface InputProps extends Omit<TextInputProps, "theme"> {
  label?: string;
  error?: boolean;
  errorText?: string;
}

export function Input({
  label,
  error = false,
  errorText,
  ...props
}: InputProps) {
  return (
    <TextInput
      label={label}
      mode="flat"
      activeUnderlineColor={colors.primary}
      underlineColor={colors.border}
      outlineColor={error ? colors.destructive : colors.border}
      activeOutlineColor={error ? colors.destructive : colors.primary}
      textColor={colors.text}
      style={{ marginBottom: spacing.md, backgroundColor: colors.surface }}
      {...props}
    />
  );
}
