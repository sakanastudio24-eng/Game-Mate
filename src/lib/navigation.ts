import { Href, useNavigation, usePathname, useRouter } from "expo-router";
import { useCallback, useEffect } from "react";
import { BackHandler, Platform } from "react-native";

const ROUTE_HISTORY_LIMIT = 64;
const routeHistory: string[] = [];
const ROOT_EXIT_ROUTES = new Set([
  "/",
  "/index",
  "/login",
  "/onboarding",
  "/(tabs)/news",
  "/(tabs)/groups",
  "/(tabs)/social",
  "/(tabs)/profile",
]);

function pushRouteHistory(pathname?: string | null) {
  if (!pathname) return;
  const last = routeHistory[routeHistory.length - 1];
  if (last === pathname) return;
  routeHistory.push(pathname);
  if (routeHistory.length > ROUTE_HISTORY_LIMIT) {
    routeHistory.splice(0, routeHistory.length - ROUTE_HISTORY_LIMIT);
  }
}

function getHistoryBackTarget(currentPathname?: string | null): string | null {
  if (!currentPathname || routeHistory.length < 2) return null;
  const lastIndex = routeHistory.lastIndexOf(currentPathname);
  const start = lastIndex > 0 ? lastIndex - 1 : routeHistory.length - 2;

  for (let index = start; index >= 0; index -= 1) {
    const candidate = routeHistory[index];
    if (candidate && candidate !== currentPathname) {
      return candidate;
    }
  }
  return null;
}

function resolveRouteFallback(pathname?: string | null): Href {
  if (!pathname) return "/(tabs)/news";

  const settingsRoutes = [
    "/(tabs)/account-settings",
    "/(tabs)/notification-settings",
    "/(tabs)/platform-connections",
    "/(tabs)/privacy-settings",
    "/(tabs)/help",
    "/(tabs)/explore",
  ];
  if (settingsRoutes.includes(pathname)) return "/(tabs)/settings";
  if (pathname === "/(tabs)/privacy-detail") return "/(tabs)/privacy-settings";
  if (pathname === "/(tabs)/settings") return "/(tabs)/profile";

  const profileRoutes = ["/(tabs)/edit-profile", "/(tabs)/create-collection", "/(tabs)/qr-code"];
  if (profileRoutes.includes(pathname)) return "/(tabs)/profile";

  const groupsRoutes = [
    "/(tabs)/group-detail",
    "/(tabs)/discover-groups",
    "/(tabs)/create-group",
    "/(tabs)/matchmaking",
  ];
  if (groupsRoutes.includes(pathname)) return "/(tabs)/groups";

  const socialRoutes = [
    "/(tabs)/messages",
    "/(tabs)/chat",
    "/(tabs)/search-players",
    "/(tabs)/user-profile",
    "/(tabs)/notifications",
  ];
  if (socialRoutes.includes(pathname)) return "/(tabs)/social";

  const feedRoutes = ["/(tabs)/ai-advisor", "/(tabs)/video-preview"];
  if (feedRoutes.includes(pathname)) return "/(tabs)/news";

  return "/(tabs)/news";
}

function canNavigateBack(navigation: any) {
  let currentNav: any = navigation;
  while (currentNav) {
    if (typeof currentNav.canGoBack === "function" && currentNav.canGoBack()) {
      return true;
    }
    currentNav =
      typeof currentNav.getParent === "function" ? currentNav.getParent() : undefined;
  }
  return false;
}

function goBackOnAnyNavigator(navigation: any) {
  let currentNav: any = navigation;
  while (currentNav) {
    if (typeof currentNav.canGoBack === "function" && currentNav.canGoBack()) {
      currentNav.goBack();
      return true;
    }
    currentNav =
      typeof currentNav.getParent === "function" ? currentNav.getParent() : undefined;
  }
  return false;
}

export function useTrackRouteHistory() {
  const pathname = usePathname();

  useEffect(() => {
    pushRouteHistory(pathname);
  }, [pathname]);
}

export function useSafeBackNavigation(fallback?: Href) {
  const router = useRouter();
  const navigation = useNavigation();
  const pathname = usePathname();

  return useCallback(() => {
    if (goBackOnAnyNavigator(navigation)) {
      return;
    }

    const historyTarget = getHistoryBackTarget(pathname);
    if (historyTarget) {
      router.push(historyTarget as Href);
      return;
    }

    router.push(fallback ?? resolveRouteFallback(pathname));
  }, [fallback, navigation, pathname, router]);
}

export function useAndroidHardwareBackNavigation(fallback?: Href) {
  const safeBack = useSafeBackNavigation(fallback);
  const navigation = useNavigation();
  const pathname = usePathname();

  useEffect(() => {
    if (Platform.OS !== "android") return;

    const subscription = BackHandler.addEventListener("hardwareBackPress", () => {
      if (canNavigateBack(navigation)) {
        safeBack();
        return true;
      }

      const historyTarget = getHistoryBackTarget(pathname);
      if (historyTarget && historyTarget !== pathname) {
        safeBack();
        return true;
      }

      if (pathname && ROOT_EXIT_ROUTES.has(pathname)) {
        return false;
      }

      safeBack();
      return true;
    });

    return () => subscription.remove();
  }, [navigation, pathname, safeBack]);
}
