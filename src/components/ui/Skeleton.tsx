import React, { useEffect, useRef } from "react";
import {
  Animated,
  StyleProp,
  StyleSheet,
  View,
  ViewStyle,
} from "react-native";
import { useReducedMotionPreference } from "../../lib/accessibility";
import { colors } from "../../lib/theme";

interface SkeletonProps {
  width?: number | `${number}%`;
  height: number;
  borderRadius?: number;
  style?: StyleProp<ViewStyle>;
}

export function Skeleton({
  width = "100%",
  height,
  borderRadius = 10,
  style,
}: SkeletonProps) {
  const reduceMotion = useReducedMotionPreference();
  const opacity = useRef(new Animated.Value(0.45)).current;

  useEffect(() => {
    if (reduceMotion) {
      opacity.setValue(0.7);
      return;
    }

    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0.9,
          duration: 700,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.45,
          duration: 700,
          useNativeDriver: true,
        }),
      ]),
    );

    loop.start();
    return () => {
      loop.stop();
    };
  }, [opacity, reduceMotion]);

  return (
    <Animated.View
      style={[
        styles.block,
        {
          width,
          height,
          borderRadius,
          opacity,
        },
        style,
      ]}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    />
  );
}

interface SkeletonCardProps {
  style?: StyleProp<ViewStyle>;
}

export function SkeletonCard({ style }: SkeletonCardProps) {
  return (
    <View style={[styles.card, style]}>
      <Skeleton height={16} width="56%" />
      <Skeleton height={12} width="32%" style={styles.gapSm} />
      <Skeleton height={164} width="100%" borderRadius={14} style={styles.gapMd} />
      <View style={styles.row}>
        <Skeleton height={10} width="22%" />
        <Skeleton height={10} width="18%" />
        <Skeleton height={10} width="20%" />
      </View>
    </View>
  );
}

interface SkeletonLineProps {
  width?: number | `${number}%`;
  style?: StyleProp<ViewStyle>;
}

export function SkeletonLine({ width = "100%", style }: SkeletonLineProps) {
  return <Skeleton width={width} height={12} borderRadius={8} style={style} />;
}

interface SkeletonAvatarProps {
  size?: number;
  style?: StyleProp<ViewStyle>;
}

export function SkeletonAvatar({ size = 40, style }: SkeletonAvatarProps) {
  return <Skeleton width={size} height={size} borderRadius={size / 2} style={style} />;
}

interface SkeletonListProps {
  rows?: number;
  style?: StyleProp<ViewStyle>;
}

export function SkeletonList({ rows = 3, style }: SkeletonListProps) {
  return (
    <View style={[styles.listWrap, style]}>
      {Array.from({ length: rows }).map((_, index) => (
        <View key={`sk-row-${index}`} style={styles.listRow}>
          <SkeletonAvatar size={42} />
          <View style={styles.listTextWrap}>
            <SkeletonLine width="62%" />
            <SkeletonLine width="40%" style={styles.gapSm} />
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  block: {
    backgroundColor: colors.border,
  },
  card: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: "#242424",
    padding: 14,
  },
  row: {
    marginTop: 10,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  gapSm: {
    marginTop: 8,
  },
  gapMd: {
    marginTop: 12,
  },
  listWrap: {
    gap: 12,
  },
  listRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  listTextWrap: {
    flex: 1,
  },
});
