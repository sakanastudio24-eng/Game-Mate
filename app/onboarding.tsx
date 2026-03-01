import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from "react-native";
import { Text } from "react-native-paper";
import {
  setCompletedOnboarding,
} from "../src/lib/onboarding-store";

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
];

const PLAY_STYLES = [
  "Casual",
  "Competitive",
  "Social",
  "Achievement Hunter",
];

export default function OnboardingScreen() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("welcome");
  const [email, setEmail] = useState("");
  const [birthdate, setBirthdate] = useState("02/24/1999");
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [playStyle, setPlayStyle] = useState("");

  const progress = useMemo(() => {
    if (step === "welcome") return 0;
    if (step === "email") return 1;
    if (step === "birthdate") return 2;
    return 3;
  }, [step]);

  const canContinue = useMemo(() => {
    if (step === "welcome") return true;
    if (step === "email") return email.includes("@");
    if (step === "birthdate") return acceptTerms;
    return selectedGenres.length > 0 && playStyle.length > 0;
  }, [acceptTerms, email, playStyle, selectedGenres.length, step]);

  const handleNext = async () => {
    if (!canContinue) return;
    if (step === "welcome") setStep("email");
    else if (step === "email") setStep("birthdate");
    else if (step === "birthdate") setStep("preferences");
    else {
      await setCompletedOnboarding(true);
      router.replace("/(tabs)/news");
    }
  };

  const toggleGenre = (genre: string) => {
    setSelectedGenres((prev) => {
      if (prev.includes(genre)) return prev.filter((g) => g !== genre);
      if (prev.length >= 5) return prev;
      return [...prev, genre];
    });
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.head}>
        <Text style={styles.brand}>Game Mate</Text>
        <Text style={styles.heading}>Create Account</Text>
        {step !== "welcome" && (
          <View style={styles.progressRow}>
            {[1, 2, 3].map((n) => (
              <View
                key={n}
                style={[styles.progressBar, n <= progress && styles.progressBarActive]}
              />
            ))}
          </View>
        )}
      </View>

      {step === "welcome" && (
        <View style={styles.section}>
          <View style={styles.logoWrap}>
            <MaterialCommunityIcons name="gamepad-variant" size={72} color="#1A1A1A" />
          </View>
          <Text style={styles.title}>Welcome to your gaming community</Text>
          <Text style={styles.subTitle}>
            Find squads, join groups, and connect with players that match your style.
          </Text>
          <Pressable style={styles.providerButton} onPress={handleNext}>
            <Text style={styles.providerText}>Continue with Email</Text>
          </Pressable>
        </View>
      )}

      {step === "email" && (
        <View style={styles.section}>
          <Text style={styles.title}>What's your email?</Text>
          <TextInput
            value={email}
            onChangeText={setEmail}
            placeholder="gamer@example.com"
            placeholderTextColor="#999"
            keyboardType="email-address"
            autoCapitalize="none"
            style={styles.input}
          />
        </View>
      )}

      {step === "birthdate" && (
        <View style={styles.section}>
          <Text style={styles.title}>When were you born?</Text>
          <TextInput
            value={birthdate}
            onChangeText={setBirthdate}
            placeholder="MM/DD/YYYY"
            placeholderTextColor="#999"
            style={styles.input}
          />
          <Pressable
            onPress={() => setAcceptTerms((v) => !v)}
            style={[styles.toggle, acceptTerms && styles.toggleActive]}
          >
            <MaterialCommunityIcons
              name={acceptTerms ? "check-circle" : "checkbox-blank-circle-outline"}
              size={18}
              color={acceptTerms ? "#FF9F66" : "#444"}
            />
            <Text style={styles.toggleText}>
              I agree to Terms of Service and Privacy Policy
            </Text>
          </Pressable>
        </View>
      )}

      {step === "preferences" && (
        <View style={styles.section}>
          <Text style={styles.title}>Pick your game genres</Text>
          <Text style={styles.subTitleDark}>Select up to 5</Text>
          <View style={styles.genreGrid}>
            {GENRES.map((genre) => {
              const selected = selectedGenres.includes(genre);
              return (
                <Pressable
                  key={genre}
                  onPress={() => toggleGenre(genre)}
                  style={[styles.genreChip, selected && styles.genreChipActive]}
                >
                  <Text style={[styles.genreText, selected && styles.genreTextActive]}>
                    {genre}
                  </Text>
                </Pressable>
              );
            })}
          </View>
          <Text style={[styles.title, styles.playTitle]}>Play style</Text>
          <View style={styles.playStyleList}>
            {PLAY_STYLES.map((style) => {
              const selected = playStyle === style;
              return (
                <Pressable
                  key={style}
                  onPress={() => setPlayStyle(style)}
                  style={[styles.playRow, selected && styles.playRowActive]}
                >
                  <Text style={[styles.playText, selected && styles.playTextActive]}>
                    {style}
                  </Text>
                  {selected && (
                    <MaterialCommunityIcons name="check" size={20} color="#1A1A1A" />
                  )}
                </Pressable>
              );
            })}
          </View>
        </View>
      )}

      <View style={styles.footer}>
        <Pressable
          onPress={handleNext}
          style={[styles.nextButton, !canContinue && styles.nextButtonDisabled]}
        >
          <MaterialCommunityIcons name="chevron-right" size={36} color="#1A1A1A" />
        </Pressable>
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
    paddingHorizontal: 24,
    paddingTop: 48,
    paddingBottom: 40,
  },
  head: {
    marginBottom: 24,
  },
  brand: {
    color: "#999",
    fontSize: 13,
    marginBottom: 8,
  },
  heading: {
    color: "#1A1A1A",
    fontSize: 34,
    fontWeight: "800",
  },
  progressRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 16,
  },
  progressBar: {
    width: 46,
    height: 4,
    borderRadius: 4,
    backgroundColor: "#D0D0D0",
  },
  progressBarActive: {
    backgroundColor: "#FF9F66",
  },
  section: {
    flex: 1,
  },
  logoWrap: {
    width: 140,
    height: 140,
    borderRadius: 70,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FF9F66",
    alignSelf: "center",
    marginVertical: 24,
  },
  title: {
    color: "#1A1A1A",
    fontSize: 26,
    fontWeight: "800",
    marginBottom: 8,
  },
  subTitle: {
    color: "#606060",
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 20,
    textAlign: "center",
  },
  providerButton: {
    backgroundColor: "#FF9F66",
    borderRadius: 16,
    paddingVertical: 14,
    marginTop: 12,
    alignItems: "center",
  },
  providerText: {
    color: "#1A1A1A",
    fontWeight: "700",
    fontSize: 16,
  },
  input: {
    backgroundColor: "#E8E8E8",
    borderRadius: 16,
    paddingHorizontal: 18,
    paddingVertical: 14,
    fontSize: 16,
    color: "#1A1A1A",
    marginTop: 8,
  },
  toggle: {
    flexDirection: "row",
    gap: 10,
    alignItems: "center",
    marginTop: 18,
    padding: 12,
    borderRadius: 12,
    backgroundColor: "#E8E8E8",
  },
  toggleActive: {
    borderWidth: 1,
    borderColor: "#FF9F66",
  },
  toggleText: {
    color: "#333",
    flex: 1,
    lineHeight: 19,
  },
  subTitleDark: {
    color: "#606060",
    marginBottom: 10,
  },
  genreGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  genreChip: {
    backgroundColor: "#E8E8E8",
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  genreChipActive: {
    backgroundColor: "#FF9F66",
  },
  genreText: {
    color: "#333",
    fontWeight: "700",
    fontSize: 13,
  },
  genreTextActive: {
    color: "#1A1A1A",
  },
  playTitle: {
    marginTop: 18,
  },
  playStyleList: {
    gap: 8,
  },
  playRow: {
    backgroundColor: "#E8E8E8",
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  playRowActive: {
    backgroundColor: "#FF9F66",
  },
  playText: {
    color: "#333",
    fontWeight: "700",
  },
  playTextActive: {
    color: "#1A1A1A",
  },
  footer: {
    alignItems: "center",
    marginTop: 28,
  },
  nextButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FF9F66",
  },
  nextButtonDisabled: {
    opacity: 0.45,
  },
});
