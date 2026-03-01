import React from "react";
import { View } from "react-native";
import { HelperText, TextInput, TextInputProps } from "react-native-paper";
import { useResponsive } from "../../lib/responsive";
import { colors, spacing } from "../../lib/theme";

// Input wrapper around React Native Paper TextInput
// Provides consistent styling for text fields

interface InputProps extends Omit<TextInputProps, "theme"> {
  label?: string;
  error?: boolean;
  errorText?: string;
  fullWidth?: boolean;
}

export function Input({
  label,
  error = false,
  errorText,
  fullWidth = false,
  style,
  ...props
}: InputProps) {
  const responsive = useResponsive();
  const resolvedA11yLabel =
    props.accessibilityLabel ?? (typeof label === "string" ? label : undefined);

  return (
    <View style={fullWidth ? { width: "100%" as const } : undefined}>
      <TextInput
        label={label}
        mode="flat"
        activeUnderlineColor={colors.primary}
        underlineColor={colors.border}
        outlineColor={error ? colors.destructive : colors.border}
        activeOutlineColor={error ? colors.destructive : colors.primary}
        textColor={colors.text}
        accessibilityLabel={resolvedA11yLabel}
        contentStyle={{ fontSize: responsive.bodySize }}
        style={[
          {
            marginBottom: error && errorText ? spacing.xs : spacing.md,
            backgroundColor: colors.surface,
            borderRadius: responsive.searchRadius,
          },
          style,
        ]}
        {...props}
      />
      <HelperText
        type="error"
        visible={Boolean(error && errorText)}
        style={{ marginBottom: spacing.sm }}
      >
        {errorText}
      </HelperText>
    </View>
  );
}
