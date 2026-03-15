import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SecureStore from "expo-secure-store";

const ONBOARDING_KEY = "gamemate:onboarding:completed";
const ONBOARDING_DRAFT_KEY = "gamemate:onboarding:draft";
const ONBOARDING_SECRET_DRAFT_KEY = "gamemate:onboarding:draft:secret";

export type OnboardingStep = "email" | "password" | "profile" | "preferences";

export type OnboardingDraft = {
  email: string;
  username: string;
  birthdate: string;
  acceptTerms: boolean;
  favoriteGames: string[];
  step: OnboardingStep;
  password?: string;
  confirmPassword?: string;
};

/** Returns whether onboarding has already been completed on this device. */
export async function hasCompletedOnboarding(): Promise<boolean> {
  try {
    const stored = await AsyncStorage.getItem(ONBOARDING_KEY);
    return stored === "true";
  } catch {
    return false;
  }
}

/** Persists the device-level onboarding completion flag. */
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

/** Restores the saved onboarding draft from local and secure storage. */
export async function getOnboardingDraft(): Promise<OnboardingDraft | null> {
  try {
    const [draftJson, secretJson] = await Promise.all([
      AsyncStorage.getItem(ONBOARDING_DRAFT_KEY),
      SecureStore.getItemAsync(ONBOARDING_SECRET_DRAFT_KEY),
    ]);

    if (!draftJson) return null;

    const draft = JSON.parse(draftJson) as Omit<OnboardingDraft, "password" | "confirmPassword">;
    const secrets = secretJson
      ? (JSON.parse(secretJson) as Pick<OnboardingDraft, "password" | "confirmPassword">)
      : {};

    return {
      ...draft,
      password: secrets.password ?? "",
      confirmPassword: secrets.confirmPassword ?? "",
    };
  } catch {
    return null;
  }
}

/** Saves the current onboarding draft, splitting secrets into secure storage. */
export async function saveOnboardingDraft(draft: OnboardingDraft): Promise<void> {
  try {
    const { password = "", confirmPassword = "", ...publicDraft } = draft;
    await Promise.all([
      AsyncStorage.setItem(ONBOARDING_DRAFT_KEY, JSON.stringify(publicDraft)),
      SecureStore.setItemAsync(
        ONBOARDING_SECRET_DRAFT_KEY,
        JSON.stringify({
          password,
          confirmPassword,
        }),
      ),
    ]);
  } catch {
    // Keep onboarding non-blocking even if local persistence fails.
  }
}

/** Clears any saved onboarding draft after successful completion or reset. */
export async function clearOnboardingDraft(): Promise<void> {
  try {
    await Promise.all([
      AsyncStorage.removeItem(ONBOARDING_DRAFT_KEY),
      SecureStore.deleteItemAsync(ONBOARDING_SECRET_DRAFT_KEY),
    ]);
  } catch {
    // Keep onboarding non-blocking even if local persistence fails.
  }
}
