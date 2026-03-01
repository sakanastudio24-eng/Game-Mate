import { useMemo } from "react";
import { useWindowDimensions } from "react-native";

export interface ResponsiveInfo {
  width: number;
  height: number;
  isSmallPhone: boolean;
  isPhone: boolean;
  isTablet: boolean;
  horizontalPadding: number;
  contentMaxWidth: number;
  titleSize: number;
  cardRadius: number;
}

export function useResponsive(): ResponsiveInfo {
  const { width, height } = useWindowDimensions();

  return useMemo(() => {
    const isTablet = width >= 768;
    const isSmallPhone = width < 360;
    const isPhone = !isTablet;

    return {
      width,
      height,
      isSmallPhone,
      isPhone,
      isTablet,
      horizontalPadding: isTablet ? 28 : isSmallPhone ? 14 : 16,
      contentMaxWidth: isTablet ? 640 : width,
      titleSize: isTablet ? 42 : isSmallPhone ? 32 : 36,
      cardRadius: isTablet ? 24 : 20,
    };
  }, [width, height]);
}
