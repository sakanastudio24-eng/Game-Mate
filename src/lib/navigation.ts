import { Href, useNavigation, useRouter } from "expo-router";
import { useCallback } from "react";

export function useSafeBackNavigation(fallback: Href = "/(tabs)/news") {
  const router = useRouter();
  const navigation = useNavigation();

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

    router.push(fallback);
  }, [fallback, navigation, router]);
}
