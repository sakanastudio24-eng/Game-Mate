import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useRouter } from "expo-router";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Animated,
  Easing,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from "react-native";
import { Text } from "react-native-paper";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useResponsive } from "../src/lib/responsive";
import { primeHomeContentCache } from "../src/lib/content-data";
import { setCompletedOnboarding } from "../src/lib/onboarding-store";

type Step = "welcome" | "email" | "birthdate" | "preferences";

const GENRES = [
  "FPS",
  "RPG",
  "MOBA",
  "Battle Royale",
  "MMO",
  "Sports",
  "Racing",
  "Strategy",
] as const;

const PLAY_STYLES = [
  { id: "casual", label: "Casual", description: "Play for fun", icon: "heart-outline" },
  {
    id: "competitive",
    label: "Competitive",
    description: "Climb the ranks",
    icon: "trophy-outline",
  },
  {
    id: "social",
    label: "Social",
    description: "Make friends",
    icon: "account-group-outline",
  },
  {
    id: "achievement",
    label: "Achievement Hunter",
    description: "Complete everything",
    icon: "star-outline",
  },
] as const;

const PLATFORM_OPTIONS = [
  { id: "playstation", label: "PlayStation", icon: "sony-playstation" },
  { id: "computer", label: "Computer", icon: "monitor" },
  { id: "phone", label: "Phone", icon: "cellphone" },
  { id: "switch", label: "Switch", icon: "nintendo-switch" },
  { id: "none", label: "None", icon: "close-circle-outline" },
] as const;

const SOCIAL_AUTH = [
  { id: "google", label: "Continue with Google", icon: "google" },
  { id: "steam", label: "Continue with Steam", icon: "steam" },
  {
    id: "playstation",
    label: "Continue with PlayStation",
    icon: "sony-playstation",
  },
  { id: "xbox", label: "Continue with Xbox", icon: "microsoft-xbox" },
] as const;

export default function OnboardingScreen() {
  const router = useRouter();
  const responsive = useResponsive();
  const insets = useSafeAreaInsets();
  const safeTop = Math.max(insets.top, responsive.safeTopInset);
  const safeBottom = Math.max(insets.bottom, responsive.safeBottomInset);
  const [step, setStep] = useState<Step>("welcome");
  const [email, setEmail] = useState("");
  const [birthdate, setBirthdate] = useState("02/24/1999");
  const [acceptEmails, setAcceptEmails] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [playStyle, setPlayStyle] = useState("");
  const [platform, setPlatform] = useState("");
  const stepTitleSize = responsive.isSmallPhone ? 24 : responsive.isLargePhone ? 30 : 28;
  const platformChipWidth = responsive.isSmallPhone ? "100%" : "48.5%";

  const stepTransition = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    stepTransition.setValue(0);
    Animated.timing(stepTransition, {
      toValue: 1,
      duration: responsive.motionBase,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [responsive.motionBase, step, stepTransition]);

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
    if (step === "birthdate") return 2;
    if (step === "preferences") return 3;
    return 0;
  }, [step]);

  const canContinue = useMemo(() => {
    if (step === "welcome") return true;
    if (step === "email") return email.includes("@");
    if (step === "birthdate") return acceptTerms;
    return selectedGenres.length > 0 && playStyle.length > 0 && platform.length > 0;
  }, [acceptTerms, email, platform.length, playStyle, selectedGenres.length, step]);

  const finishOnboarding = async () => {
    primeHomeContentCache();
    await setCompletedOnboarding(true);
    router.replace("/(tabs)/news");
  };

  const handleNext = async () => {
    if (!canContinue) return;

    if (step === "welcome") {
      setStep("email");
      return;
    }

    if (step === "email") {
      setStep("birthdate");
      return;
    }

    if (step === "birthdate") {
      setStep("preferences");
      return;
    }

    await finishOnboarding();
  };

  const toggleGenre = (genre: string) => {
    setSelectedGenres((prev) => {
      if (prev.includes(genre)) return prev.filter((item) => item !== genre);
      if (prev.length >= 5) return prev;
      return [...prev, genre];
    });
  };

  const handleSocialAuth = () => {
    setStep("email");
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[styles.content, { paddingBottom: safeBottom + 20 }]}
    >
        <View
          style={[
            styles.inner,
            {
              paddingTop: safeTop + 14,
              paddingHorizontal: responsive.horizontalPadding,
              maxWidth: responsive.contentMaxWidth,
              alignSelf: "center",
            width: "100%",
          },
        ]}
      >
        <View style={styles.headerBlock}>
          <Text style={styles.brandText}>Welcome to Game Mate</Text>
          <Text style={[styles.heading, { fontSize: responsive.titleSize }]}>Create Account</Text>

          {step !== "welcome" && (
            <View style={styles.progressRow}>
              {[1, 2, 3].map((index) => (
                <View
                  key={index}
                  style={[
                    styles.progressBar,
                    index <= progress ? styles.progressBarActive : undefined,
                  ]}
                />
              ))}
            </View>
          )}
        </View>

        <Animated.View style={stepAnimatedStyle}>
          {step === "welcome" && (
            <View style={styles.stepSection}>
              <View style={styles.welcomeHero}>
                <View style={styles.logoCircle}>
                  <MaterialCommunityIcons name="gamepad-variant" size={72} color="#1A1A1A" />
                </View>
                <Text style={styles.appTitle}>Game Mate</Text>
                <Text style={styles.welcomeCopy}>Your Gaming Community Hub</Text>
              </View>

              <Text style={styles.authHint}>Sign in with your gaming account</Text>
              <View style={styles.authList}>
                {SOCIAL_AUTH.map((provider, index) => (
                  <View key={provider.id} style={{ marginTop: index === 0 ? 0 : 0 }}>
                    <Pressable
                      onPress={handleSocialAuth}
                      style={({ pressed }) => [
                        styles.authButton,
                        { minHeight: responsive.buttonHeightMedium },
                        pressed && styles.pressed,
                      ]}
                    >
                      <MaterialCommunityIcons
                        name={provider.icon as any}
                        size={20}
                        color="#F5F5F5"
                        style={styles.authIcon}
                      />
                      <Text style={styles.authLabel}>{provider.label}</Text>
                    </Pressable>
                  </View>
                ))}
              </View>

              <View style={styles.orRow}>
                <View style={styles.orLine} />
                <Text style={styles.orText}>or</Text>
                <View style={styles.orLine} />
              </View>

              <Pressable
                onPress={handleNext}
                style={({ pressed }) => [
                  styles.primaryWideButton,
                  { minHeight: responsive.buttonHeightLarge },
                  pressed && styles.pressed,
                ]}
              >
                <MaterialCommunityIcons name="email-outline" size={20} color="#1A1A1A" />
                <Text style={styles.primaryWideButtonText}>Continue with Email</Text>
              </Pressable>
            </View>
          )}

          {step === "email" && (
            <View style={styles.stepSection}>
              <Text style={[styles.stepTitle, { fontSize: stepTitleSize }]}>What's Your Email?</Text>
              <Text style={styles.stepCopy}>We'll use this to keep your account secure</Text>

              <Text style={styles.fieldLabel}>Email Address</Text>
              <View style={styles.inputWrap}>
                <TextInput
                  value={email}
                  onChangeText={setEmail}
                  placeholder="gamer@example.com"
                  placeholderTextColor="#999"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  style={styles.input}
                />
                {email.includes("@") && (
                  <View style={styles.validBadge}>
                    <MaterialCommunityIcons name="check" size={16} color="#1A1A1A" />
                  </View>
                )}
              </View>

              <Pressable
                onPress={() => setAcceptEmails((prev) => !prev)}
                style={({ pressed }) => [
                  styles.checkboxRow,
                  acceptEmails ? styles.checkboxRowActive : undefined,
                  pressed && styles.pressed,
                ]}
              >
                <View style={[styles.checkbox, acceptEmails ? styles.checkboxOn : undefined]}>
                  {acceptEmails && <MaterialCommunityIcons name="check" size={16} color="#1A1A1A" />}
                </View>
                <Text style={styles.checkboxText}>
                  Send me updates about Game Mate features and gaming news
                </Text>
              </Pressable>
            </View>
          )}

          {step === "birthdate" && (
            <View style={styles.stepSection}>
              <Text style={[styles.stepTitle, { fontSize: stepTitleSize }]}>When Were You Born?</Text>
              <Text style={styles.stepCopy}>We need this to verify your age</Text>

              <Text style={styles.fieldLabel}>Date of Birth</Text>
              <View style={styles.inputWrap}>
                <TextInput
                  value={birthdate}
                  onChangeText={setBirthdate}
                  placeholder="MM/DD/YYYY"
                  placeholderTextColor="#999"
                  style={styles.input}
                />
                <MaterialCommunityIcons
                  name="calendar-month-outline"
                  size={20}
                  color="#777"
                  style={styles.inputTrailingIcon}
                />
              </View>

              <Pressable
                onPress={() => setAcceptTerms((prev) => !prev)}
                style={({ pressed }) => [
                  styles.checkboxRow,
                  acceptTerms ? styles.checkboxRowActive : undefined,
                  pressed && styles.pressed,
                ]}
              >
                <View style={[styles.checkbox, acceptTerms ? styles.checkboxOn : undefined]}>
                  {acceptTerms && <MaterialCommunityIcons name="check" size={16} color="#1A1A1A" />}
                </View>
                <View style={styles.termsTextWrap}>
                  <Text style={styles.checkboxText}>
                    I agree to the <Text style={styles.linkText}>Terms of Service</Text> and{" "}
                    <Text style={styles.linkText}>Privacy Policy</Text>
                  </Text>
                  <Text style={styles.securityHint}>Your data is secure and encrypted.</Text>
                </View>
              </Pressable>
            </View>
          )}

          {step === "preferences" && (
            <View style={styles.stepSection}>
              <Text style={[styles.stepTitle, { fontSize: stepTitleSize }]}>What Do You Like to Play?</Text>
              <Text style={styles.stepCopy}>Select up to 5 genres (minimum 1)</Text>

              <View style={styles.genreGrid}>
                {GENRES.map((genre) => {
                  const selected = selectedGenres.includes(genre);
                  return (
                    <Pressable
                      key={genre}
                      onPress={() => toggleGenre(genre)}
                      style={({ pressed }) => [
                        styles.genreChip,
                        selected ? styles.genreChipSelected : undefined,
                        pressed && styles.pressed,
                      ]}
                    >
                      <Text style={[styles.genreChipText, selected ? styles.genreChipTextSelected : undefined]}>
                        {genre}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>

              <Text style={[styles.stepTitle, styles.playStyleTitle, { fontSize: stepTitleSize }]}>
                How Do You Play?
              </Text>
              <Text style={styles.stepCopy}>Choose your primary play style</Text>

              <View style={styles.playStyleList}>
                {PLAY_STYLES.map((style) => {
                  const selected = playStyle === style.id;
                  return (
                    <Pressable
                      key={style.id}
                      onPress={() => setPlayStyle(style.id)}
                      style={({ pressed }) => [
                        styles.playStyleRow,
                        selected ? styles.playStyleRowSelected : undefined,
                        pressed && styles.pressed,
                      ]}
                    >
                      <View
                        style={[
                          styles.playStyleIconWrap,
                          selected ? styles.playStyleIconWrapSelected : undefined,
                        ]}
                      >
                        <MaterialCommunityIcons
                          name={style.icon as any}
                          size={20}
                          color={selected ? "#1A1A1A" : "#444"}
                        />
                      </View>
                      <View style={styles.playStyleTextWrap}>
                        <Text style={[styles.playStyleLabel, selected ? styles.playStyleLabelSelected : undefined]}>
                          {style.label}
                        </Text>
                        <Text style={[styles.playStyleDescription, selected ? styles.playStyleDescriptionSelected : undefined]}>
                          {style.description}
                        </Text>
                      </View>
                      {selected && (
                        <View style={styles.playStyleCheck}>
                          <MaterialCommunityIcons name="check" size={16} color="#FF9F66" />
                        </View>
                      )}
                    </Pressable>
                  );
                })}
              </View>

              <Text style={[styles.stepTitle, styles.platformTitle, { fontSize: stepTitleSize }]}>
                Where Do You Play?
              </Text>
              <Text style={styles.stepCopy}>Choose your primary platform</Text>

              <View style={styles.platformGrid}>
                {PLATFORM_OPTIONS.map((item) => {
                  const selected = platform === item.id;
                  return (
                    <Pressable
                      key={item.id}
                      onPress={() => setPlatform(item.id)}
                      style={({ pressed }) => [
                        styles.platformChip,
                        {
                          width: platformChipWidth,
                          minHeight: responsive.buttonHeightSmall,
                        },
                        selected ? styles.platformChipSelected : undefined,
                        pressed && styles.pressed,
                      ]}
                    >
                      <MaterialCommunityIcons
                        name={item.icon as any}
                        size={20}
                        color={selected ? "#1A1A1A" : "#555"}
                      />
                      <Text
                        style={[
                          styles.platformChipLabel,
                          selected ? styles.platformChipLabelSelected : undefined,
                        ]}
                      >
                        {item.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>
          )}
        </Animated.View>

        {step !== "welcome" && (
          <View style={styles.footer}>
            <Pressable
              onPress={handleNext}
              style={({ pressed }) => [
                styles.nextButton,
                !canContinue ? styles.nextButtonDisabled : undefined,
                pressed && styles.pressed,
              ]}
            >
              <MaterialCommunityIcons name="chevron-right" size={36} color="#1A1A1A" />
            </Pressable>
            <Text style={styles.stepFootnote}>
              {step === "email" ? "Step 1 of 3" : step === "birthdate" ? "Step 2 of 3" : "Step 3 of 3"}
            </Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  content: {
    minHeight: "100%",
    paddingTop: 0,
    paddingBottom: 40,
  },
  inner: {
    flex: 1,
  },
  headerBlock: {
    marginBottom: 18,
  },
  brandText: {
    color: "#8A8A8A",
    fontSize: 13,
    marginBottom: 8,
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
    width: 48,
    height: 4,
    borderRadius: 4,
    backgroundColor: "#D0D0D0",
    marginRight: 8,
  },
  progressBarActive: {
    backgroundColor: "#FF9F66",
  },
  stepSection: {
    flex: 1,
  },
  welcomeHero: {
    borderRadius: 24,
    backgroundColor: "#1A1A1A",
    paddingHorizontal: 24,
    paddingVertical: 30,
    alignItems: "center",
    marginBottom: 20,
  },
  logoCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FF9F66",
    marginBottom: 14,
  },
  appTitle: {
    color: "#F5F5F5",
    fontSize: 30,
    fontWeight: "800",
    marginBottom: 4,
  },
  welcomeCopy: {
    color: "#B0B0B0",
    textAlign: "center",
    fontSize: 15,
  },
  authHint: {
    color: "#666",
    fontSize: 13,
    marginBottom: 10,
    textAlign: "center",
    fontWeight: "600",
  },
  authList: {
    marginBottom: 8,
  },
  authButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#2A2A2A",
    borderWidth: 1,
    borderColor: "#3A3A3A",
    borderRadius: 12,
    paddingVertical: 12,
    marginBottom: 10,
  },
  authIcon: {
    marginRight: 8,
  },
  authLabel: {
    color: "#F5F5F5",
    fontSize: 15,
    fontWeight: "700",
  },
  orRow: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 10,
  },
  orLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#D0D0D0",
  },
  orText: {
    color: "#8A8A8A",
    marginHorizontal: 10,
    fontWeight: "600",
  },
  primaryWideButton: {
    backgroundColor: "#FF9F66",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
  },
  primaryWideButtonText: {
    color: "#1A1A1A",
    fontSize: 16,
    fontWeight: "800",
    marginLeft: 6,
  },
  stepTitle: {
    color: "#1A1A1A",
    fontSize: 28,
    fontWeight: "800",
    marginBottom: 6,
  },
  stepCopy: {
    color: "#777",
    fontSize: 14,
    marginBottom: 16,
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
    marginBottom: 16,
  },
  input: {
    backgroundColor: "#E8E8E8",
    borderRadius: 16,
    paddingHorizontal: 18,
    paddingVertical: 14,
    color: "#1A1A1A",
    fontSize: 16,
  },
  inputTrailingIcon: {
    position: "absolute",
    right: 14,
    top: 14,
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
  checkboxRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#E8E8E8",
    borderRadius: 12,
    padding: 12,
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
    marginTop: 4,
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
  genreChipSelected: {},
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
  playStyleTitle: {
    marginTop: 6,
  },
  playStyleList: {
    marginTop: 6,
  },
  playStyleRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E8E8E8",
    borderRadius: 14,
    padding: 12,
    marginBottom: 8,
  },
  playStyleRowSelected: {
    backgroundColor: "#FF9F66",
  },
  playStyleIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: "#D8D8D8",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  playStyleIconWrapSelected: {
    backgroundColor: "#FFCCB3",
  },
  playStyleTextWrap: {
    flex: 1,
  },
  playStyleLabel: {
    color: "#1A1A1A",
    fontSize: 15,
    fontWeight: "800",
    marginBottom: 2,
  },
  playStyleLabelSelected: {
    color: "#1A1A1A",
  },
  playStyleDescription: {
    color: "#666",
    fontSize: 12,
  },
  playStyleDescriptionSelected: {
    color: "#4A3A30",
  },
  playStyleCheck: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#1A1A1A",
    alignItems: "center",
    justifyContent: "center",
  },
  platformTitle: {
    marginTop: 6,
  },
  platformGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  platformChip: {
    width: "48.5%",
    backgroundColor: "#E8E8E8",
    borderRadius: 12,
    paddingVertical: 12,
    marginBottom: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  platformChipSelected: {
    backgroundColor: "#FF9F66",
  },
  platformChipLabel: {
    color: "#333",
    fontWeight: "800",
    fontSize: 13,
    marginLeft: 6,
  },
  platformChipLabelSelected: {
    color: "#1A1A1A",
  },
  footer: {
    alignItems: "center",
    marginTop: 20,
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
  stepFootnote: {
    color: "#777",
    fontSize: 12,
    marginTop: 8,
  },
  pressed: {
    opacity: 0.8,
  },
});
