import { AccessibilityInfo } from "react-native";
import { useEffect, useState } from "react";

export function useReducedMotionPreference(): boolean {
  const [reduceMotionEnabled, setReduceMotionEnabled] = useState(false);

  useEffect(() => {
    let active = true;

    AccessibilityInfo.isReduceMotionEnabled()
      .then((enabled) => {
        if (active) {
          setReduceMotionEnabled(enabled);
        }
      })
      .catch(() => {
        // Keep default when preference cannot be resolved.
      });

    const subscription = AccessibilityInfo.addEventListener(
      "reduceMotionChanged",
      setReduceMotionEnabled,
    );

    return () => {
      active = false;
      subscription.remove();
    };
  }, []);

  return reduceMotionEnabled;
}
