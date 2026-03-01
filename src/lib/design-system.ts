import { useMemo } from "react";
import { Platform, useWindowDimensions } from "react-native";

export type MobilePlatform = "ios" | "android";

interface PlatformPreset {
  horizontalPadding: number;
  titleSize: number;
  sectionTitleSize: number;
  bodySize: number;
  bodySmallSize: number;
  captionSize: number;
  cardRadius: number;
  cardPadding: number;
  headerTopSpacing: number;
  headerTitleSize: number;
  iconButtonSize: number;
  touchTargetMin: number;
  buttonHeightSmall: number;
  buttonHeightMedium: number;
  buttonHeightLarge: number;
  tabBarBaseHeight: number;
  tabBarLabelSize: number;
  searchRadius: number;
  safeBottomInset: number;
  safeTopInset: number;
}

export interface MobileDesignTokens {
  platform: MobilePlatform;
  width: number;
  height: number;
  isCompact: boolean;
  isTablet: boolean;
  horizontalPadding: number;
  contentMaxWidth: number;
  titleSize: number;
  sectionTitleSize: number;
  bodySize: number;
  bodySmallSize: number;
  captionSize: number;
  cardRadius: number;
  cardPadding: number;
  headerTopSpacing: number;
  headerTitleSize: number;
  iconButtonSize: number;
  touchTargetMin: number;
  buttonHeightSmall: number;
  buttonHeightMedium: number;
  buttonHeightLarge: number;
  tabBarBaseHeight: number;
  tabBarLabelSize: number;
  searchRadius: number;
  safeBottomInset: number;
  safeTopInset: number;
}

const PLATFORM_PRESETS: Record<MobilePlatform, PlatformPreset> = {
  ios: {
    horizontalPadding: 18,
    titleSize: 36,
    sectionTitleSize: 22,
    bodySize: 15,
    bodySmallSize: 13,
    captionSize: 12,
    cardRadius: 20,
    cardPadding: 14,
    headerTopSpacing: 8,
    headerTitleSize: 19,
    iconButtonSize: 44,
    touchTargetMin: 44,
    buttonHeightSmall: 44,
    buttonHeightMedium: 48,
    buttonHeightLarge: 52,
    tabBarBaseHeight: 58,
    tabBarLabelSize: 12,
    searchRadius: 14,
    safeBottomInset: 10,
    safeTopInset: 10,
  },
  android: {
    horizontalPadding: 16,
    titleSize: 34,
    sectionTitleSize: 21,
    bodySize: 14,
    bodySmallSize: 12,
    captionSize: 11,
    cardRadius: 18,
    cardPadding: 12,
    headerTopSpacing: 6,
    headerTitleSize: 18,
    iconButtonSize: 48,
    touchTargetMin: 48,
    buttonHeightSmall: 48,
    buttonHeightMedium: 52,
    buttonHeightLarge: 56,
    tabBarBaseHeight: 60,
    tabBarLabelSize: 11,
    searchRadius: 12,
    safeBottomInset: 8,
    safeTopInset: 8,
  },
};

export function useMobileDesignTokens(): MobileDesignTokens {
  const { width, height } = useWindowDimensions();

  return useMemo(() => {
    const platform: MobilePlatform = Platform.OS === "ios" ? "ios" : "android";
    const isTablet = width >= 768;
    const isCompact = width < 360;

    const preset = PLATFORM_PRESETS[platform];
    const sizeScale = isTablet ? 1.18 : isCompact ? 0.94 : 1;

    return {
      platform,
      width,
      height,
      isCompact,
      isTablet,
      horizontalPadding: Math.round(preset.horizontalPadding * sizeScale),
      contentMaxWidth: isTablet ? (platform === "ios" ? 680 : 640) : width,
      titleSize: Math.round(preset.titleSize * sizeScale),
      sectionTitleSize: Math.round(preset.sectionTitleSize * sizeScale),
      bodySize: Math.round(preset.bodySize * sizeScale),
      bodySmallSize: Math.round(preset.bodySmallSize * sizeScale),
      captionSize: Math.round(preset.captionSize * sizeScale),
      cardRadius: Math.round(preset.cardRadius * sizeScale),
      cardPadding: Math.round(preset.cardPadding * sizeScale),
      headerTopSpacing: preset.headerTopSpacing,
      headerTitleSize: Math.round(preset.headerTitleSize * sizeScale),
      iconButtonSize: Math.round(preset.iconButtonSize * sizeScale),
      touchTargetMin: preset.touchTargetMin,
      buttonHeightSmall: Math.max(
        preset.touchTargetMin,
        Math.round(preset.buttonHeightSmall * sizeScale),
      ),
      buttonHeightMedium: Math.max(
        preset.touchTargetMin,
        Math.round(preset.buttonHeightMedium * sizeScale),
      ),
      buttonHeightLarge: Math.max(
        preset.touchTargetMin,
        Math.round(preset.buttonHeightLarge * sizeScale),
      ),
      tabBarBaseHeight: Math.round(preset.tabBarBaseHeight * sizeScale),
      tabBarLabelSize: Math.round(preset.tabBarLabelSize * sizeScale),
      searchRadius: Math.round(preset.searchRadius * sizeScale),
      safeBottomInset: preset.safeBottomInset,
      safeTopInset: preset.safeTopInset,
    };
  }, [height, width]);
}
