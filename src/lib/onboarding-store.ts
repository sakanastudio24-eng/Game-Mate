import AsyncStorage from "@react-native-async-storage/async-storage";

const ONBOARDING_KEY = "gamemate:onboarding:completed";

export async function hasCompletedOnboarding(): Promise<boolean> {
  try {
    const stored = await AsyncStorage.getItem(ONBOARDING_KEY);
    return stored === "true";
  } catch {
    return false;
  }
}

export async function setCompletedOnboarding(completed: boolean): Promise<void> {
  try {
    if (completed) {
      await AsyncStorage.setItem(ONBOARDING_KEY, "true");
      return;
    }
    await AsyncStorage.removeItem(ONBOARDING_KEY);
  } catch {
    // Keep onboarding non-blocking even if local persistence fails.
  }
}
