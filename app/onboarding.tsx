import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { Text } from "react-native-paper";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { signup } from "../services/auth";
import { updateMyProfile } from "../services/profile";
import { getAccessToken } from "../services/storage";
import { Button } from "../src/components/ui/Button";
import { Input } from "../src/components/ui/Input";
import { useAuth } from "../src/context/AuthContext";
import { primeHomeContentCache } from "../src/lib/content-data";
import { setCompletedOnboarding } from "../src/lib/onboarding-store";
import { useResponsive } from "../src/lib/responsive";
import { colors, spacing } from "../src/lib/theme";

const ONBOARDING_GAMES = [
  "Apex Legends",
  "Valorant",
  "Rocket League",
  "Call of Duty",
  "Fortnite",
  "Overwatch 2",
  "League of Legends",
  "Counter-Strike 2",
];

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const USERNAME_PATTERN = /^[a-zA-Z0-9_-]{3,30}$/;
const PASSWORD_PATTERN = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{10,}$/;

function isValidEmail(value: string) {
  return EMAIL_PATTERN.test(value.trim());
}

function isValidUsername(value: string) {
  return USERNAME_PATTERN.test(value.trim());
}

function isStrongPassword(value: string) {
  return PASSWORD_PATTERN.test(value);
}

type Step = 1 | 2 | 3;

export default function OnboardingScreen() {
  const router = useRouter();
  const responsive = useResponsive();
  const insets = useSafeAreaInsets();
  const { loginUser } = useAuth();
  const safeTop = Math.max(insets.top, responsive.safeTopInset);
  const safeBottom = Math.max(insets.bottom, responsive.safeBottomInset);

  const [step, setStep] = useState<Step>(1);
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [selectedGames, setSelectedGames] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const stepOneIssues = useMemo(() => {
    const nextIssues: string[] = [];
    if (!isValidEmail(email)) nextIssues.push("Enter a valid email address.");
    if (!isValidUsername(username)) {
      nextIssues.push("Username must be 3-30 characters using letters, numbers, underscores, or hyphens.");
    }
    return nextIssues;
  }, [email, username]);

  const stepTwoIssues = useMemo(() => {
    const nextIssues: string[] = [];
    if (!isStrongPassword(password)) {
      nextIssues.push("Password must be at least 10 characters and include upper, lower, and number.");
    }
    if (confirmPassword.length > 0 && password !== confirmPassword) {
      nextIssues.push("Passwords must match.");
    }
    return nextIssues;
  }, [confirmPassword, password]);

  const stepThreeIssues = useMemo(() => {
    const nextIssues: string[] = [];
    if (selectedGames.length === 0) nextIssues.push("Pick at least one game for initial feed recommendations.");
    if (selectedGames.length > 5) nextIssues.push("Choose up to 5 games.");
    return nextIssues;
  }, [selectedGames]);

  const canContinueStepOne = stepOneIssues.length === 0;
  const canContinueStepTwo = stepTwoIssues.length === 0 && confirmPassword.length > 0;
  const canSubmit = canContinueStepOne && canContinueStepTwo && stepThreeIssues.length === 0;

  const toggleGame = (game: string) => {
    setSelectedGames((current) => {
      const exists = current.includes(game);
      if (exists) return current.filter((item) => item !== game);
      if (current.length >= 5) return current;
      return [...current, game];
    });
  };

  const handleCreateAccount = async () => {
    if (!canSubmit || submitting) return;

    const normalizedEmail = email.trim().toLowerCase();
    const normalizedUsername = username.trim();

    setSubmitError(null);
    setSubmitting(true);
    try {
      await signup(normalizedEmail, normalizedUsername, password);
      await loginUser(normalizedEmail, password);

      const accessToken = await getAccessToken();
      if (accessToken) {
        await updateMyProfile(accessToken, {
          favorite_games: selectedGames,
        });
      }

      await setCompletedOnboarding(true);
      primeHomeContentCache();
      router.replace("/(tabs)/news");
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "Unable to create account.");
    } finally {
      setSubmitting(false);
    }
  };

  const renderStep = () => {
    if (step === 1) {
      return (
        <>
          <Text style={[styles.formTitle, { fontSize: responsive.sectionTitleSize }]}>Step 1 of 3 · Identity</Text>
          <Text style={[styles.formCopy, { fontSize: responsive.bodySmallSize }]}>
            Use your real email and the public username you want other players to scan and find.
          </Text>

          <Input
            label="Email"
            accessibilityLabel="Email"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            autoCorrect={false}
            autoComplete="email"
            textContentType="emailAddress"
            keyboardType="email-address"
            placeholder="you@gamemate.dev"
            fullWidth
            error={stepOneIssues.some((issue) => issue.includes("email"))}
          />

          <Input
            label="Username"
            accessibilityLabel="Username"
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
            autoCorrect={false}
            autoComplete="username"
            textContentType="username"
            placeholder="playername"
            fullWidth
            error={stepOneIssues.some((issue) => issue.includes("Username"))}
          />

          {stepOneIssues.length > 0 ? (
            <View style={styles.issueList}>
              {stepOneIssues.map((issue) => (
                <Text key={issue} style={styles.issueText}>
                  • {issue}
                </Text>
              ))}
            </View>
          ) : null}

          <Button variant="primary" fullWidth size="large" onPress={() => setStep(2)} disabled={!canContinueStepOne}>
            Continue
          </Button>
        </>
      );
    }

    if (step === 2) {
      return (
        <>
          <Text style={[styles.formTitle, { fontSize: responsive.sectionTitleSize }]}>Step 2 of 3 · Security</Text>
          <Text style={[styles.formCopy, { fontSize: responsive.bodySmallSize }]}>
            Create a stronger password. This app only supports email and password sign in.
          </Text>

          <Input
            label="Password"
            accessibilityLabel="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoCapitalize="none"
            autoCorrect={false}
            autoComplete="password-new"
            textContentType="newPassword"
            placeholder="10+ chars, upper, lower, number"
            fullWidth
            error={stepTwoIssues.some((issue) => issue.includes("Password"))}
          />

          <Input
            label="Confirm Password"
            accessibilityLabel="Confirm password"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
            autoCapitalize="none"
            autoCorrect={false}
            autoComplete="password-new"
            textContentType="newPassword"
            placeholder="Re-enter password"
            fullWidth
            error={stepTwoIssues.some((issue) => issue.includes("match"))}
          />

          {stepTwoIssues.length > 0 ? (
            <View style={styles.issueList}>
              {stepTwoIssues.map((issue) => (
                <Text key={issue} style={styles.issueText}>
                  • {issue}
                </Text>
              ))}
            </View>
          ) : null}

          <View style={styles.actionRow}>
            <Button variant="secondary" fullWidth size="large" onPress={() => setStep(1)}>
              Back
            </Button>
            <Button variant="primary" fullWidth size="large" onPress={() => setStep(3)} disabled={!canContinueStepTwo}>
              Continue
            </Button>
          </View>
        </>
      );
    }

    return (
      <>
        <Text style={[styles.formTitle, { fontSize: responsive.sectionTitleSize }]}>Step 3 of 3 · Preferences</Text>
        <Text style={[styles.formCopy, { fontSize: responsive.bodySmallSize }]}>
          Pick up to 5 games. These get saved to your profile immediately and influence your first feed recommendations.
        </Text>

        <View style={styles.gameGrid}>
          {ONBOARDING_GAMES.map((game) => {
            const selected = selectedGames.includes(game);
            return (
              <Pressable
                key={game}
                onPress={() => toggleGame(game)}
                accessibilityRole="button"
                accessibilityState={{ selected }}
                accessibilityLabel={`Select ${game}`}
                style={({ pressed }) => [
                  styles.gameChip,
                  selected && styles.gameChipSelected,
                  pressed && styles.pressed,
                ]}
              >
                <MaterialCommunityIcons
                  name={selected ? "check-circle" : "gamepad-variant-outline"}
                  size={16}
                  color={selected ? colors.background : colors.primary}
                />
                <Text style={[styles.gameChipText, selected && styles.gameChipTextSelected]}>{game}</Text>
              </Pressable>
            );
          })}
        </View>

        {stepThreeIssues.length > 0 ? (
          <View style={styles.issueList}>
            {stepThreeIssues.map((issue) => (
              <Text key={issue} style={styles.issueText}>
                • {issue}
              </Text>
            ))}
          </View>
        ) : null}

        {submitError ? <Text style={styles.submitError}>{submitError}</Text> : null}

        <View style={styles.actionRow}>
          <Button variant="secondary" fullWidth size="large" onPress={() => setStep(2)} disabled={submitting}>
            Back
          </Button>
          <Button
            variant="primary"
            fullWidth
            size="large"
            onPress={handleCreateAccount}
            disabled={!canSubmit || submitting}
            loading={submitting}
          >
            {submitting ? "Creating Account..." : "Create Account"}
          </Button>
        </View>
      </>
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.keyboardRoot}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? safeTop + 8 : 0}
    >
      <ScrollView
        style={styles.screen}
        contentContainerStyle={[
          styles.content,
          {
            paddingTop: safeTop + spacing.md,
            paddingBottom: safeBottom + spacing.xl,
            paddingHorizontal: responsive.horizontalPadding,
          },
        ]}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode={Platform.OS === "ios" ? "interactive" : "on-drag"}
        automaticallyAdjustKeyboardInsets={Platform.OS === "ios"}
        showsVerticalScrollIndicator={false}
      >
        <View
          style={[
            styles.shell,
            {
              maxWidth: responsive.contentMaxWidth,
              alignSelf: "center",
              width: "100%",
            },
          ]}
        >
          <View style={styles.heroCard}>
            <View style={styles.heroBadge}>
              <MaterialCommunityIcons name="gamepad-variant-outline" size={28} color="#1A1A1A" />
            </View>
            <Text style={[styles.kicker, { fontSize: responsive.captionSize + 1 }]}>GAME MATE</Text>
            <Text
              style={[
                styles.heroTitle,
                {
                  fontSize: responsive.titleSize + (responsive.isSmallPhone ? 0 : 2),
                  lineHeight: Math.round((responsive.titleSize + (responsive.isSmallPhone ? 0 : 2)) * 1.05),
                },
              ]}
            >
              Build your player identity. Find squads. Shape your feed.
            </Text>
            <Text style={[styles.heroCopy, { fontSize: responsive.bodySize }]}>
              No social sign-in. Just your email, your handle, and the games you actually play.
            </Text>

            <View style={styles.heroPoints}>
              {[
                "Create a public player username",
                "Secure your account with a stronger password",
                "Seed your first feed with real game preferences",
              ].map((point) => (
                <View key={point} style={styles.heroPointRow}>
                  <MaterialCommunityIcons name="check-circle" size={16} color={colors.primary} />
                  <Text style={styles.heroPointText}>{point}</Text>
                </View>
              ))}
            </View>
          </View>

          <View style={styles.formCard}>
            <View style={styles.stepRail}>
              {[1, 2, 3].map((railStep) => (
                <View
                  key={railStep}
                  style={[
                    styles.stepDot,
                    railStep <= step ? styles.stepDotActive : styles.stepDotInactive,
                  ]}
                />
              ))}
            </View>

            {renderStep()}

            <Pressable
              onPress={() => {
                if (submitting) return;
                router.replace("/login" as any);
              }}
              accessibilityRole="button"
              accessibilityLabel="Already have an account? Sign in"
              style={({ pressed }) => [styles.signInRow, pressed && styles.pressed]}
            >
              <Text style={styles.signInCopy}>Already have an account?</Text>
              <Text style={styles.signInAction}>Sign In</Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  keyboardRoot: {
    flex: 1,
    backgroundColor: colors.background,
  },
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flexGrow: 1,
  },
  shell: {
    flex: 1,
    justifyContent: "center",
  },
  heroCard: {
    backgroundColor: "#232323",
    borderWidth: 1,
    borderColor: "#383838",
    borderRadius: 28,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  heroBadge: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.md,
  },
  kicker: {
    color: colors.primary,
    fontWeight: "800",
    letterSpacing: 1.2,
    marginBottom: spacing.sm,
  },
  heroTitle: {
    color: colors.text,
    fontWeight: "800",
    marginBottom: spacing.sm,
  },
  heroCopy: {
    color: colors.textSecondary,
    lineHeight: 22,
    marginBottom: spacing.md,
  },
  heroPoints: {
    gap: spacing.sm,
  },
  heroPointRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  heroPointText: {
    color: colors.text,
    fontSize: 13,
    fontWeight: "600",
  },
  formCard: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 24,
    padding: spacing.lg,
  },
  stepRail: {
    flexDirection: "row",
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  stepDot: {
    flex: 1,
    height: 6,
    borderRadius: 999,
  },
  stepDotActive: {
    backgroundColor: colors.primary,
  },
  stepDotInactive: {
    backgroundColor: "#4A4A4A",
  },
  formTitle: {
    color: colors.text,
    fontWeight: "800",
    marginBottom: spacing.xs,
  },
  formCopy: {
    color: colors.textSecondary,
    marginBottom: spacing.md,
    lineHeight: 20,
  },
  issueList: {
    marginTop: -spacing.xs,
    marginBottom: spacing.sm,
    gap: spacing.xs,
  },
  issueText: {
    color: colors.warning,
    fontSize: 13,
  },
  submitError: {
    color: colors.destructive,
    fontSize: 13,
    marginBottom: spacing.sm,
  },
  actionRow: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  gameGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  gameChip: {
    minWidth: "47%",
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
  },
  gameChipSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primary,
  },
  gameChipText: {
    color: colors.text,
    fontSize: 13,
    fontWeight: "700",
    flexShrink: 1,
  },
  gameChipTextSelected: {
    color: colors.background,
  },
  signInRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: spacing.xs,
    marginTop: spacing.lg,
  },
  signInCopy: {
    color: colors.textSecondary,
    fontSize: 13,
  },
  signInAction: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: "700",
  },
  pressed: {
    opacity: 0.85,
  },
});
