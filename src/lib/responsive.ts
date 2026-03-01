import { useMemo } from "react";
import { useMobileDesignTokens } from "./design-system";

export interface ResponsiveInfo {
  platform: "ios" | "android";
  width: number;
  height: number;
  isSmallPhone: boolean;
  isPhone: boolean;
  isTablet: boolean;
  bodySize: number;
  bodySmallSize: number;
  captionSize: number;
  sectionTitleSize: number;
  horizontalPadding: number;
  contentMaxWidth: number;
  titleSize: number;
  headerTopSpacing: number;
  headerTitleSize: number;
  iconButtonSize: number;
  touchTargetMin: number;
  buttonHeightSmall: number;
  buttonHeightMedium: number;
  buttonHeightLarge: number;
  cardRadius: number;
  cardPadding: number;
  tabBarBaseHeight: number;
  tabBarLabelSize: number;
  searchRadius: number;
  safeBottomInset: number;
  safeTopInset: number;
}

export function useResponsive(): ResponsiveInfo {
  const tokens = useMobileDesignTokens();

  return useMemo(() => {
    const isTablet = tokens.isTablet;
    const isSmallPhone = tokens.isCompact;
    const isPhone = !isTablet;

    return {
      platform: tokens.platform,
      width: tokens.width,
      height: tokens.height,
      isSmallPhone,
      isPhone,
      isTablet,
      bodySize: tokens.bodySize,
      bodySmallSize: tokens.bodySmallSize,
      captionSize: tokens.captionSize,
      sectionTitleSize: tokens.sectionTitleSize,
      horizontalPadding: tokens.horizontalPadding,
      contentMaxWidth: tokens.contentMaxWidth,
      titleSize: tokens.titleSize,
      headerTopSpacing: tokens.headerTopSpacing,
      headerTitleSize: tokens.headerTitleSize,
      iconButtonSize: tokens.iconButtonSize,
      touchTargetMin: tokens.touchTargetMin,
      buttonHeightSmall: tokens.buttonHeightSmall,
      buttonHeightMedium: tokens.buttonHeightMedium,
      buttonHeightLarge: tokens.buttonHeightLarge,
      cardRadius: tokens.cardRadius,
      cardPadding: tokens.cardPadding,
      tabBarBaseHeight: tokens.tabBarBaseHeight,
      tabBarLabelSize: tokens.tabBarLabelSize,
      searchRadius: tokens.searchRadius,
      safeBottomInset: tokens.safeBottomInset,
      safeTopInset: tokens.safeTopInset,
    };
  }, [tokens]);
}
