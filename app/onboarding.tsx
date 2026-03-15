import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useRouter } from "expo-router";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Animated,
  Easing,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from "react-native";
import { Text } from "react-native-paper";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { signup } from "../services/auth";
import { updateMyProfile } from "../services/profile";
import { getAccessToken } from "../services/storage";
import { useAuth } from "../src/context/AuthContext";
import { useReducedMotionPreference } from "../src/lib/accessibility";
import { androidKeyboardCompatProps } from "../src/lib/androidInput";
import { primeHomeContentCache } from "../src/lib/content-data";
import { setCompletedOnboarding } from "../src/lib/onboarding-store";
import { useResponsive } from "../src/lib/responsive";

type Step = "email" | "password" | "profile" | "preferences";

const ONBOARDING_GAMES = [
  "Apex Legends",
  "Valorant",
  "Rocket League",
  "Call of Duty",
  "Fortnite",
  "Overwatch 2",
  "League of Legends",
  "Counter-Strike 2",
] as const;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const USERNAME_PATTERN = /^[a-zA-Z0-9_-]{3,30}$/;
const PASSWORD_PATTERN = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)\S{10,}$/;

function sanitizeBirthdateInput(value: string): string {
  return value.replace(/\D/g, "").slice(0, 8);
}

function isBirthdateBeforeToday(value: string): boolean {
  if (value.length !== 8) return false;

  const month = Number(value.slice(0, 2));
  const day = Number(value.slice(2, 4));
  const year = Number(value.slice(4, 8));

  if (!Number.isInteger(month) || !Number.isInteger(day) || !Number.isInteger(year)) return false;
  if (month < 1 || month > 12) return false;
  if (day < 1 || day > 31) return false;
  if (year < 1900) return false;

  const candidate = new Date(year, month - 1, day);
  if (
    candidate.getFullYear() !== year ||
    candidate.getMonth() !== month - 1 ||
    candidate.getDate() !== day
  ) {
    return false;
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return candidate.getTime() < today.getTime();
}

function isValidEmail(value: string) {
  return EMAIL_PATTERN.test(value.trim());
}

function isValidUsername(value: string) {
  return USERNAME_PATTERN.test(value.trim());
}

function isStrongPassword(value: string) {
  return PASSWORD_PATTERN.test(value);
}

function getPasswordChecks(value: string, confirmValue: string) {
  return [
    { key: "length", label: "At least 10 characters", passed: value.length >= 10 },
    { key: "upper", label: "At least 1 uppercase letter", passed: /[A-Z]/.test(value) },
    { key: "lower", label: "At least 1 lowercase letter", passed: /[a-z]/.test(value) },
    { key: "number", label: "At least 1 number", passed: /\d/.test(value) },
    { key: "spaces", label: "No spaces allowed", passed: !/\s/.test(value) },
    {
      key: "match",
      label: "Passwords match",
      passed: confirmValue.length > 0 && value === confirmValue,
    },
  ];
}

export default function OnboardingScreen() {
  const router = useRouter();
  const { loginUser } = useAuth();
  const responsive = useResponsive();
  const insets = useSafeAreaInsets();
  const reduceMotion = useReducedMotionPreference();
  const safeTop = Math.max(insets.top, responsive.safeTopInset);
  const safeBottom = Math.max(insets.bottom, responsive.safeBottomInset);

  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [username, setUsername] = useState("");
  const [birthdate, setBirthdate] = useState("");
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [selectedGames, setSelectedGames] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const stepTransition = useRef(new Animated.Value(1)).current;
  const stepTitleSize = responsive.isSmallPhone ? 24 : responsive.isLargePhone ? 30 : 28;
  const scrollEnabled = step === "preferences";
  const heroCompact = step !== "preferences";
  const passwordChecks = useMemo(() => getPasswordChecks(password, confirmPassword), [confirmPassword, password]);

  useEffect(() => {
    if (reduceMotion) {
      stepTransition.setValue(1);
      return;
    }

    stepTransition.setValue(0);
    Animated.timing(stepTransition, {
      toValue: 1,
      duration: responsive.motionBase,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [reduceMotion, responsive.motionBase, step, stepTransition]);

  const stepAnimatedStyle = {
    opacity: stepTransition,
    transform: [
      {
        translateY: stepTransition.interpolate({
          inputRange: [0, 1],
          outputRange: [Math.max(10, responsive.screenEntranceOffset + 4), 0],
        }),
      },
    ],
  };

  const progress = useMemo(() => {
    if (step === "email") return 1;
    if (step === "password") return 2;
    if (step === "profile") return 3;
    return 4;
  }, [step]);

  const isValidBirthdate = useMemo(() => isBirthdateBeforeToday(birthdate), [birthdate]);

  const birthdateHintMessage = useMemo(() => {
    if (birthdate.length === 0) return "Use 8 digits only (MMDDYYYY)";
    if (birthdate.length < 8) return "Date of birth must be 8 digits (MMDDYYYY).";
    if (!isValidBirthdate) return "Enter a valid date in MMDDYYYY format before today.";
    return "You look good to go.";
  }, [birthdate.length, isValidBirthdate]);

  const emailIssues = useMemo(() => {
    const issues: string[] = [];
    if (!isValidEmail(email)) issues.push("Enter a valid email address.");
    return issues;
  }, [email]);

  const passwordIssues = useMemo(() => {
    const issues: string[] = [];
    if (!isStrongPassword(password)) {
      issues.push("Password must meet all listed rules.");
    }
    if (confirmPassword.length > 0 && password !== confirmPassword) {
      issues.push("Passwords must match.");
    }
    return issues;
  }, [confirmPassword, password]);

  const profileIssues = useMemo(() => {
    const issues: string[] = [];
    if (!isValidUsername(username)) {
      issues.push("Username must be 3-30 characters using letters, numbers, underscores, or hyphens.");
    }
    if (!isValidBirthdate) issues.push("Enter a valid birthdate before today.");
    if (!acceptTerms) issues.push("Accept Terms of Service and Privacy Policy.");
    return issues;
  }, [acceptTerms, isValidBirthdate, username]);

  const preferenceIssues = useMemo(() => {
    const issues: string[] = [];
    if (selectedGames.length === 0) issues.push("Pick at least one game for initial recommendations.");
    if (selectedGames.length > 5) issues.push("Choose up to 5 games.");
    return issues;
  }, [selectedGames]);

  const canContinue = useMemo(() => {
    if (step === "email") return emailIssues.length === 0;
    if (step === "password") return passwordIssues.length === 0 && confirmPassword.length > 0;
    if (step === "profile") return profileIssues.length === 0;
    return preferenceIssues.length === 0;
  }, [confirmPassword.length, emailIssues.length, passwordIssues.length, preferenceIssues.length, profileIssues.length, step]);

  const currentIssues = useMemo(() => {
    if (step === "email") return emailIssues;
    if (step === "password") return passwordIssues;
    if (step === "profile") return profileIssues;
    return preferenceIssues;
  }, [emailIssues, passwordIssues, preferenceIssues, profileIssues, step]);

  const handleNext = async () => {
    if (!canContinue || submitting) return;
    if (submitError) setSubmitError(null);

    if (step === "email") {
      setStep("password");
      return;
    }
    if (step === "password") {
      setStep("profile");
      return;
    }
    if (step === "profile") {
      setStep("preferences");
      return;
    }

    const normalizedEmail = email.trim().toLowerCase();
    const normalizedUsername = username.trim();

    setSubmitting(true);
    setSubmitError(null);
    try {
      await signup(normalizedEmail, normalizedUsername, password);
      await loginUser(normalizedEmail, password);

      const accessToken = await getAccessToken();
      if (accessToken) {
        await updateMyProfile(accessToken, {
          favorite_games: selectedGames,
        });
      }

      primeHomeContentCache();
      await setCompletedOnboarding(true);
      router.replace("/(tabs)/news");
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "Unable to create account.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleBack = () => {
    if (submitting) return;
    if (step === "preferences") {
      setStep("profile");
      return;
    }
    if (step === "profile") {
      setStep("password");
      return;
    }
    if (step === "password") {
      setStep("email");
      return;
    }
    router.replace("/login" as any);
  };

  const toggleGame = (game: string) => {
    setSelectedGames((prev) => {
      if (prev.includes(game)) return prev.filter((item) => item !== game);
      if (prev.length >= 5) return prev;
      return [...prev, game];
    });
  };

  return (
    <KeyboardAvoidingView
      style={styles.keyboardRoot}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? safeTop + 8 : 0}
    >
      <ScrollView
        style={styles.container}
        scrollEnabled={scrollEnabled}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode={Platform.OS === "ios" ? "interactive" : "on-drag"}
        automaticallyAdjustKeyboardInsets={Platform.OS === "ios"}
        showsVerticalScrollIndicator={scrollEnabled}
        contentContainerStyle={[
          styles.content,
          {
            paddingTop: safeTop + 14,
            paddingBottom: safeBottom + 24,
            minHeight: scrollEnabled ? undefined : "100%",
          },
        ]}
      >
        <View
          style={[
            styles.inner,
            {
              paddingHorizontal: responsive.horizontalPadding,
              maxWidth: responsive.contentMaxWidth,
              alignSelf: "center",
              width: "100%",
            },
          ]}
        >
          <View style={styles.headerBlock}>
            <View style={styles.headerTopRow}>
              <Text style={styles.brandText}>Welcome to Game Mate</Text>
              <Pressable
                onPress={handleBack}
                accessibilityRole="button"
                accessibilityLabel="Go back"
                style={({ pressed }) => [styles.topBackButton, pressed && styles.pressed]}
              >
                <MaterialCommunityIcons name="chevron-left" size={20} color="#1A1A1A" />
              </Pressable>
            </View>
            <Text accessibilityRole="header" style={[styles.heading, { fontSize: responsive.titleSize }]}>
              Create Account
            </Text>
            <View style={styles.progressRow}>
              {[1, 2, 3, 4].map((index) => (
                <View
                  key={index}
                  style={[
                    styles.progressBar,
                    index <= progress ? styles.progressBarActive : undefined,
                  ]}
                />
              ))}
            </View>
          </View>

          <View style={[styles.welcomeHero, heroCompact ? styles.welcomeHeroCompact : undefined]}>
            <View style={styles.logoCircle}>
              <MaterialCommunityIcons name="gamepad-variant" size={52} color="#1A1A1A" />
            </View>
            <View style={styles.heroTextWrap}>
              <Text style={styles.appTitle}>Game Mate</Text>
              <Text style={styles.welcomeCopy}>Squads, clips, groups, and a feed shaped by what you play.</Text>
            </View>
          </View>

          <Animated.View style={[styles.stepSection, styles.stepSectionCompact, stepAnimatedStyle]}>
            {step === "email" && (
              <>
                <Text accessibilityRole="header" style={[styles.stepTitle, { fontSize: stepTitleSize }]}>
                  Start With Email
                </Text>
                <Text style={styles.stepCopy}>Use the email you want attached to your Game Mate account.</Text>

                <Text style={styles.fieldLabel}>Email Address</Text>
                <View style={styles.inputWrap}>
                  <TextInput
                    value={email}
                    onChangeText={setEmail}
                    placeholder="gamer@example.com"
                    placeholderTextColor="#999"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                    accessibilityLabel="Email address"
                    {...androidKeyboardCompatProps}
                    style={styles.input}
                  />
                  {isValidEmail(email) ? (
                    <View style={styles.validBadge}>
                      <MaterialCommunityIcons name="check" size={16} color="#1A1A1A" />
                    </View>
                  ) : null}
                </View>
              </>
            )}

            {step === "password" && (
              <>
                <Text accessibilityRole="header" style={[styles.stepTitle, { fontSize: stepTitleSize }]}>
                  Create a Password
                </Text>
                <Text style={styles.stepCopy}>Keep it strong with upper, lower, and a number.</Text>

                <Text style={styles.fieldLabel}>Password</Text>
                <View style={styles.inputWrap}>
                  <TextInput
                    value={password}
                    onChangeText={setPassword}
                    placeholder="10+ chars, upper, lower, number"
                    placeholderTextColor="#999"
                    autoCapitalize="none"
                    autoCorrect={false}
                    secureTextEntry
                    accessibilityLabel="Password"
                    {...androidKeyboardCompatProps}
                    style={styles.input}
                  />
                </View>

                <Text style={styles.fieldLabel}>Confirm Password</Text>
                <View style={styles.inputWrap}>
                  <TextInput
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    placeholder="Re-enter password"
                    placeholderTextColor="#999"
                    autoCapitalize="none"
                    autoCorrect={false}
                    secureTextEntry
                    accessibilityLabel="Confirm password"
                    {...androidKeyboardCompatProps}
                    style={styles.input}
                  />
                  {isStrongPassword(password) && confirmPassword.length > 0 && password === confirmPassword ? (
                    <View style={styles.validBadge}>
                      <MaterialCommunityIcons name="check" size={16} color="#1A1A1A" />
                    </View>
                  ) : null}
                </View>

                <View style={styles.passwordChecklist}>
                  {passwordChecks.map((check) => (
                    <View key={check.key} style={styles.passwordChecklistRow}>
                      <MaterialCommunityIcons
                        name={check.passed ? "check-circle" : "close-circle-outline"}
                        size={18}
                        color={check.passed ? "#22C55E" : "#9A9A9A"}
                      />
                      <Text
                        style={[
                          styles.passwordChecklistText,
                          check.passed ? styles.passwordChecklistTextPassed : undefined,
                        ]}
                      >
                        {check.label}
                      </Text>
                    </View>
                  ))}
                </View>
              </>
            )}

            {step === "profile" && (
              <>
                <Text accessibilityRole="header" style={[styles.stepTitle, { fontSize: stepTitleSize }]}>
                  Set Your Profile
                </Text>
                <Text style={styles.stepCopy}>Pick the username people will find and confirm your birthdate.</Text>

                <Text style={styles.fieldLabel}>Username</Text>
                <View style={styles.inputWrap}>
                  <TextInput
                    value={username}
                    onChangeText={setUsername}
                    placeholder="your_username"
                    placeholderTextColor="#999"
                    autoCapitalize="none"
                    autoCorrect={false}
                    accessibilityLabel="Username"
                    {...androidKeyboardCompatProps}
                    style={styles.input}
                  />
                  {isValidUsername(username) ? (
                    <View style={styles.validBadge}>
                      <MaterialCommunityIcons name="check" size={16} color="#1A1A1A" />
                    </View>
                  ) : null}
                </View>

                <Text style={styles.fieldLabel}>Date of Birth</Text>
                <View style={styles.inputWrap}>
                  <TextInput
                    value={birthdate}
                    onChangeText={(value) => setBirthdate(sanitizeBirthdateInput(value))}
                    placeholder="MMDDYYYY"
                    placeholderTextColor="#999"
                    keyboardType="number-pad"
                    maxLength={8}
                    accessibilityLabel="Date of birth"
                    {...androidKeyboardCompatProps}
                    style={styles.input}
                  />
                  <MaterialCommunityIcons
                    name="calendar-month-outline"
                    size={20}
                    color="#777"
                    style={styles.inputTrailingIcon}
                  />
                </View>

                <Text
                  style={[
                    styles.birthdateHint,
                    birthdate.length === 8 && !isValidBirthdate ? styles.birthdateHintError : undefined,
                    birthdate.length === 8 && isValidBirthdate ? styles.birthdateHintSuccess : undefined,
                  ]}
                >
                  {birthdateHintMessage}
                </Text>

                <Pressable
                  onPress={() => setAcceptTerms((prev) => !prev)}
                  accessibilityRole="checkbox"
                  accessibilityLabel="Agree to terms and privacy policy"
                  accessibilityState={{ checked: acceptTerms }}
                  style={({ pressed }) => [
                    styles.checkboxRow,
                    acceptTerms ? styles.checkboxRowActive : undefined,
                    pressed && styles.pressed,
                  ]}
                >
                  <View style={[styles.checkbox, acceptTerms ? styles.checkboxOn : undefined]}>
                    {acceptTerms ? <MaterialCommunityIcons name="check" size={16} color="#1A1A1A" /> : null}
                  </View>
                  <View style={styles.termsTextWrap}>
                    <Text style={styles.checkboxText}>
                      I agree to the <Text style={styles.linkText}>Terms of Service</Text> and{" "}
                      <Text style={styles.linkText}>Privacy Policy</Text>
                    </Text>
                    <Text style={styles.securityHint}>Email and password only. No third-party sign-in.</Text>
                  </View>
                </Pressable>
              </>
            )}

            {step === "preferences" && (
              <>
                <Text accessibilityRole="header" style={[styles.stepTitle, { fontSize: stepTitleSize }]}>
                  Pick Your Games
                </Text>
                <Text style={styles.stepCopy}>
                  Select up to 5 games for your profile and initial feed recommendations.
                </Text>

                <View style={styles.genreGrid}>
                  {ONBOARDING_GAMES.map((game) => {
                    const selected = selectedGames.includes(game);
                    return (
                      <Pressable
                        key={game}
                        onPress={() => toggleGame(game)}
                        accessibilityRole="checkbox"
                        accessibilityLabel={`Game ${game}`}
                        accessibilityState={{ checked: selected }}
                        style={({ pressed }) => [
                          styles.genreChip,
                          pressed && styles.pressed,
                        ]}
                      >
                        <Text style={[styles.genreChipText, selected ? styles.genreChipTextSelected : undefined]}>
                          {game}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </>
            )}
          </Animated.View>

          <View style={styles.footer}>
            {currentIssues.length > 0 ? (
              <View style={styles.missingOptionsWrap}>
                {currentIssues.map((issue) => (
                  <Text key={`${step}-${issue}`} style={styles.missingOptionText}>
                    • {issue}
                  </Text>
                ))}
              </View>
            ) : null}

            {submitError ? <Text style={styles.submitError}>{submitError}</Text> : null}

            <View style={styles.footerActions}>
              <Pressable
                onPress={handleNext}
                accessibilityRole="button"
                accessibilityLabel={
                  step === "email"
                    ? "Continue to password step"
                    : step === "password"
                      ? "Continue to profile step"
                      : step === "profile"
                        ? "Continue to preferences step"
                        : "Finish onboarding"
                }
                accessibilityState={{ disabled: !canContinue || submitting }}
                style={({ pressed }) => [
                  styles.nextButton,
                  !canContinue || submitting ? styles.nextButtonDisabled : undefined,
                  pressed && styles.pressed,
                ]}
              >
                {submitting ? (
                  <Text style={styles.nextButtonLoading}>...</Text>
                ) : (
                  <MaterialCommunityIcons
                    name={step === "preferences" ? "check" : "chevron-right"}
                    size={36}
                    color="#1A1A1A"
                  />
                )}
              </Pressable>
            </View>

            <Text style={styles.stepFootnote}>
              {step === "email"
                ? "Step 1 of 4"
                : step === "password"
                  ? "Step 2 of 4"
                  : step === "profile"
                    ? "Step 3 of 4"
                    : "Step 4 of 4"}
            </Text>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  keyboardRoot: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  content: {
    paddingBottom: 40,
  },
  inner: {
    flex: 1,
  },
  headerBlock: {
    marginBottom: 12,
  },
  headerTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  brandText: {
    color: "#8A8A8A",
    fontSize: 13,
  },
  topBackButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#DFDFDF",
  },
  heading: {
    color: "#1A1A1A",
    fontWeight: "800",
  },
  progressRow: {
    flexDirection: "row",
    marginTop: 14,
  },
  progressBar: {
    flex: 1,
    height: 4,
    borderRadius: 4,
    backgroundColor: "#D0D0D0",
    marginRight: 8,
  },
  progressBarActive: {
    backgroundColor: "#FF9F66",
  },
  welcomeHero: {
    borderRadius: 24,
    backgroundColor: "#1A1A1A",
    paddingHorizontal: 20,
    paddingVertical: 18,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 18,
  },
  welcomeHeroCompact: {
    marginBottom: 14,
  },
  logoCircle: {
    width: 84,
    height: 84,
    borderRadius: 42,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FF9F66",
    marginRight: 16,
  },
  heroTextWrap: {
    flex: 1,
  },
  appTitle: {
    color: "#F5F5F5",
    fontSize: 26,
    fontWeight: "800",
    marginBottom: 4,
  },
  welcomeCopy: {
    color: "#B0B0B0",
    fontSize: 13,
    lineHeight: 18,
  },
  stepSection: {
    flex: 1,
  },
  stepSectionCompact: {
    paddingBottom: 4,
  },
  stepTitle: {
    color: "#1A1A1A",
    fontWeight: "800",
    marginBottom: 6,
  },
  stepCopy: {
    color: "#777",
    fontSize: 14,
    marginBottom: 12,
  },
  fieldLabel: {
    color: "#1A1A1A",
    fontSize: 12,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 0.6,
    marginBottom: 8,
  },
  inputWrap: {
    position: "relative",
    marginBottom: 12,
  },
  input: {
    backgroundColor: "#E8E8E8",
    borderRadius: 16,
    paddingHorizontal: 18,
    paddingVertical: 13,
    color: "#1A1A1A",
    fontSize: 16,
  },
  inputTrailingIcon: {
    position: "absolute",
    right: 14,
    top: 14,
  },
  passwordChecklist: {
    marginTop: -2,
    marginBottom: 4,
    gap: 6,
  },
  passwordChecklistRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  passwordChecklistText: {
    color: "#7A7A7A",
    fontSize: 13,
  },
  passwordChecklistTextPassed: {
    color: "#1A1A1A",
    fontWeight: "700",
  },
  validBadge: {
    position: "absolute",
    right: 12,
    top: 10,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#66FF9F",
    alignItems: "center",
    justifyContent: "center",
  },
  birthdateHint: {
    color: "#777",
    fontSize: 12,
    marginTop: -8,
    marginBottom: 10,
  },
  birthdateHintError: {
    color: "#EF4444",
  },
  birthdateHintSuccess: {
    color: "#22C55E",
  },
  checkboxRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#E8E8E8",
    borderRadius: 12,
    padding: 11,
  },
  checkboxRowActive: {
    borderWidth: 1,
    borderColor: "#FF9F66",
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 8,
    backgroundColor: "#D0D0D0",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  checkboxOn: {
    backgroundColor: "#FF9F66",
  },
  checkboxText: {
    color: "#333",
    flex: 1,
    lineHeight: 20,
  },
  termsTextWrap: {
    flex: 1,
  },
  linkText: {
    color: "#FF9F66",
    fontWeight: "700",
  },
  securityHint: {
    color: "#777",
    marginTop: 3,
    fontSize: 12,
  },
  genreGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginHorizontal: -4,
  },
  genreChip: {
    width: "50%",
    paddingHorizontal: 4,
    marginBottom: 8,
  },
  genreChipText: {
    backgroundColor: "#E8E8E8",
    borderRadius: 12,
    paddingVertical: 12,
    textAlign: "center",
    color: "#333",
    fontWeight: "800",
    fontSize: 13,
  },
  genreChipTextSelected: {
    backgroundColor: "#FF9F66",
    color: "#1A1A1A",
  },
  footer: {
    alignItems: "center",
    marginTop: 8,
  },
  missingOptionsWrap: {
    marginBottom: 12,
    paddingHorizontal: 2,
    gap: 4,
    alignSelf: "stretch",
  },
  missingOptionText: {
    color: "#B44E2B",
    fontSize: 12,
    lineHeight: 16,
  },
  submitError: {
    color: "#B44E2B",
    fontSize: 12,
    textAlign: "center",
    marginBottom: 8,
    maxWidth: 320,
  },
  footerActions: {
    alignItems: "center",
    justifyContent: "center",
  },
  nextButton: {
    width: 84,
    height: 84,
    borderRadius: 42,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FF9F66",
  },
  nextButtonDisabled: {
    backgroundColor: "#D0D0D0",
  },
  nextButtonLoading: {
    color: "#1A1A1A",
    fontSize: 18,
    fontWeight: "800",
    letterSpacing: 2,
  },
  stepFootnote: {
    color: "#777",
    fontSize: 12,
    marginTop: 8,
  },
  pressed: {
    opacity: 0.8,
  },
});
