import { Href, useNavigation, usePathname, useRouter } from "expo-router";
import { useCallback } from "react";

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

export function useSafeBackNavigation(fallback?: Href) {
  const router = useRouter();
  const navigation = useNavigation();
  const pathname = usePathname();

  return useCallback(() => {
    let currentNav: any = navigation;

    // Walk up navigation parents so back works across nested layouts (tabs -> stack).
    while (currentNav) {
      if (typeof currentNav.canGoBack === "function" && currentNav.canGoBack()) {
        currentNav.goBack();
        return;
      }
      currentNav =
        typeof currentNav.getParent === "function" ? currentNav.getParent() : undefined;
    }

    router.push(fallback ?? resolveRouteFallback(pathname));
  }, [fallback, navigation, pathname, router]);
}
