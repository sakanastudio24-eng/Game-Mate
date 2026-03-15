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
import { Button } from "../src/components/ui/Button";
import { Input } from "../src/components/ui/Input";
import { useAuth } from "../src/context/AuthContext";
import { primeHomeContentCache } from "../src/lib/content-data";
import { setCompletedOnboarding } from "../src/lib/onboarding-store";
import { useResponsive } from "../src/lib/responsive";
import { colors, spacing } from "../src/lib/theme";

function isValidEmail(value: string) {
  return /\S+@\S+\.\S+/.test(value.trim());
}

export default function OnboardingScreen() {
  const router = useRouter();
  const responsive = useResponsive();
  const insets = useSafeAreaInsets();
  const { loginUser } = useAuth();
  const safeTop = Math.max(insets.top, responsive.safeTopInset);
  const safeBottom = Math.max(insets.bottom, responsive.safeBottomInset);

  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const issues = useMemo(() => {
    const nextIssues: string[] = [];
    if (!isValidEmail(email)) nextIssues.push("Enter a valid email address.");
    if (username.trim().length < 3) nextIssues.push("Username must be at least 3 characters.");
    if (password.length < 8) nextIssues.push("Password must be at least 8 characters.");
    if (confirmPassword.length > 0 && password !== confirmPassword) {
      nextIssues.push("Passwords must match.");
    }
    return nextIssues;
  }, [confirmPassword, email, password, username]);

  const canSubmit = useMemo(
    () =>
      isValidEmail(email) &&
      username.trim().length >= 3 &&
      password.length >= 8 &&
      password === confirmPassword,
    [confirmPassword, email, password, username],
  );

  const handleCreateAccount = async () => {
    if (!canSubmit || submitting) return;

    const normalizedEmail = email.trim().toLowerCase();
    const normalizedUsername = username.trim();

    setSubmitError(null);
    setSubmitting(true);
    try {
      await signup(normalizedEmail, normalizedUsername, password);
      await loginUser(normalizedEmail, password);
      await setCompletedOnboarding(true);
      primeHomeContentCache();
      router.replace("/(tabs)/news");
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "Unable to create account.");
    } finally {
      setSubmitting(false);
    }
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
              Build your player identity. Find squads. Share the win.
            </Text>
            <Text style={[styles.heroCopy, { fontSize: responsive.bodySize }]}>
              Create your account to unlock your feed, groups, messages, and profile.
            </Text>

            <View style={styles.heroPoints}>
              {[
                "Create a real player profile",
                "Join or build gaming groups",
                "Share clips and stay in the loop",
              ].map((point) => (
                <View key={point} style={styles.heroPointRow}>
                  <MaterialCommunityIcons name="check-circle" size={16} color={colors.primary} />
                  <Text style={styles.heroPointText}>{point}</Text>
                </View>
              ))}
            </View>
          </View>

          <View style={styles.formCard}>
            <Text style={[styles.formTitle, { fontSize: responsive.sectionTitleSize }]}>Create Account</Text>
            <Text style={[styles.formCopy, { fontSize: responsive.bodySmallSize }]}>
              Email and password only. You can finish profile setup after signup.
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
            />

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
              placeholder="At least 8 characters"
              fullWidth
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
            />

            {issues.length > 0 ? (
              <View style={styles.issueList}>
                {issues.map((issue) => (
                  <Text key={issue} style={styles.issueText}>
                    • {issue}
                  </Text>
                ))}
              </View>
            ) : null}

            {submitError ? <Text style={styles.submitError}>{submitError}</Text> : null}

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
  formTitle: {
    color: colors.text,
    fontWeight: "800",
    marginBottom: spacing.xs,
  },
  formCopy: {
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  issueList: {
    marginBottom: spacing.sm,
  },
  issueText: {
    color: colors.destructive,
    fontSize: 12,
    lineHeight: 18,
  },
  submitError: {
    color: colors.destructive,
    fontSize: 13,
    fontWeight: "600",
    marginBottom: spacing.sm,
  },
  signInRow: {
    marginTop: spacing.md,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.xs,
  },
  signInCopy: {
    color: colors.textSecondary,
    fontSize: 13,
  },
  signInAction: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: "800",
  },
  pressed: {
    opacity: 0.78,
  },
});
