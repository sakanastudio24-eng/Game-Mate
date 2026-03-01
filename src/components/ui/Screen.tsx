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
  const entry = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(entry, {
      toValue: 1,
      duration: 220,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [entry]);

  const animatedStyle = {
    opacity: entry,
    transform: [
      {
        translateY: entry.interpolate({
          inputRange: [0, 1],
          outputRange: [14, 0],
        }),
      },
    ],
  };

  const containerStyle = [
    styles.container,
    padded && { paddingHorizontal: responsive.horizontalPadding },
    { paddingBottom: Math.max(insets.bottom, responsive.safeBottomInset) },
    style,
  ];

  if (scrollable) {
    return (
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={containerStyle}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View style={animatedStyle}>{children}</Animated.View>
      </ScrollView>
    );
  }

  return (
    <View style={containerStyle}>
      <Animated.View style={[styles.fill, animatedStyle]}>{children}</Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
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
