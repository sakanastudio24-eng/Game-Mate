import React, { useEffect, useRef } from "react";
import { Animated, Easing, ViewStyle } from "react-native";
import { useResponsive } from "../../lib/responsive";

interface AnimatedEntranceProps {
  children: React.ReactNode;
  delay?: number;
  duration?: number | null;
  offsetY?: number;
  preset?: "screen" | "section" | "card";
  staggerIndex?: number;
  style?: ViewStyle | ViewStyle[];
}

export function AnimatedEntrance({
  children,
  delay = 0,
  duration = null,
  offsetY,
  preset = "section",
  staggerIndex = 0,
  style,
}: AnimatedEntranceProps) {
  const responsive = useResponsive();
  const progress = useRef(new Animated.Value(0)).current;
  const resolvedDuration =
    duration ??
    (preset === "screen"
      ? responsive.motionSlow
      : preset === "card"
        ? responsive.motionFast
        : responsive.motionBase);
  const resolvedOffsetY =
    offsetY ??
    (preset === "screen"
      ? responsive.screenEntranceOffset
      : preset === "card"
        ? responsive.cardEntranceOffset
        : Math.max(8, Math.round(responsive.screenEntranceOffset * 0.75)));
  const resolvedDelay = delay + staggerIndex * responsive.motionStagger;
  const scaleFrom = preset === "card" ? 0.985 : 0.993;

  useEffect(() => {
    progress.setValue(0);
    Animated.timing(progress, {
      toValue: 1,
      duration: resolvedDuration,
      delay: resolvedDelay,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [progress, resolvedDelay, resolvedDuration]);

  return (
    <Animated.View
      style={[
        style,
        {
          opacity: progress,
          transform: [
            {
              translateY: progress.interpolate({
                inputRange: [0, 1],
                outputRange: [resolvedOffsetY, 0],
              }),
            },
            {
              scale: progress.interpolate({
                inputRange: [0, 1],
                outputRange: [scaleFrom, 1],
              }),
            },
          ],
        },
      ]}
    >
      {children}
    </Animated.View>
  );
}
