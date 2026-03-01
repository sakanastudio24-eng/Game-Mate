import { Platform, TextInputProps } from "react-native";

// Samsung keyboards can fail to commit characters on some controlled inputs.
// Keep Android text entry in inline mode and disable aggressive autofill/spell features.
type AndroidKeyboardCompatProps = Pick<
  TextInputProps,
  "autoCorrect" | "spellCheck" | "autoComplete" | "importantForAutofill" | "disableFullscreenUI"
>;

export const androidKeyboardCompatProps: AndroidKeyboardCompatProps | {} =
  Platform.OS === "android"
    ? {
        autoCorrect: false,
        spellCheck: false,
        autoComplete: "off",
        importantForAutofill: "no",
        disableFullscreenUI: true,
      }
    : {};
