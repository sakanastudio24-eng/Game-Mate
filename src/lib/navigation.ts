import { Href, useNavigation, useRouter } from "expo-router";
import { useCallback } from "react";

export function useSafeBackNavigation(fallback: Href = "/(tabs)/news") {
  const router = useRouter();
  const navigation = useNavigation();

  return useCallback(() => {
    if (navigation.canGoBack()) {
      navigation.goBack();
      return;
    }

    router.replace(fallback);
  }, [fallback, navigation, router]);
}
