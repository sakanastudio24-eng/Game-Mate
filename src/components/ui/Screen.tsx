import React, { useEffect, useRef } from "react";
import {
  Animated,
  Easing,
  ScrollView,
  StyleSheet,
  View,
  ViewStyle,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useReducedMotionPreference } from "../../lib/accessibility";
import { useResponsive } from "../../lib/responsive";
import { colors } from "../../lib/theme";

// Screen wrapper component for consistent padding and layout
// Supports both scrollable and non-scrollable content

interface ScreenProps {
  children: React.ReactNode;
  scrollable?: boolean;
  style?: ViewStyle;
  padded?: boolean;
}

export function Screen({
  children,
  scrollable = false,
  style,
  padded = true,
}: ScreenProps) {
  const insets = useSafeAreaInsets();
  const responsive = useResponsive();
  const reduceMotion = useReducedMotionPreference();
  const entry = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (reduceMotion) {
      entry.setValue(1);
      return;
    }

    Animated.timing(entry, {
      toValue: 1,
      duration: responsive.motionBase,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [entry, reduceMotion, responsive.motionBase]);

  const animatedStyle = {
    opacity: entry,
    transform: [
      {
        translateY: entry.interpolate({
          inputRange: [0, 1],
          outputRange: [reduceMotion ? 0 : responsive.screenEntranceOffset, 0],
        }),
      },
      {
        scale: entry.interpolate({
          inputRange: [0, 1],
          outputRange: [reduceMotion ? 1 : 0.995, 1],
        }),
      },
    ],
  };

  const widthStyle = {
    paddingBottom: Math.max(insets.bottom, responsive.safeBottomInset),
    width: "100%" as const,
    maxWidth: responsive.contentMaxWidth,
    alignSelf: "center" as const,
  };

  const nonScrollableContainerStyle = [
    styles.container,
    padded && { paddingHorizontal: responsive.horizontalPadding },
    widthStyle,
    style,
  ];

  const scrollContainerStyle = [
    styles.scrollContent,
    padded && { paddingHorizontal: responsive.horizontalPadding },
    widthStyle,
    style,
  ];

  if (scrollable) {
    return (
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={scrollContainerStyle}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Animated.View style={animatedStyle}>{children}</Animated.View>
      </ScrollView>
    );
  }

  return (
    <View style={nonScrollableContainerStyle}>
      <Animated.View style={[styles.fill, animatedStyle]}>{children}</Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  fill: {
    flex: 1,
  },
});
