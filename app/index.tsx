import { useRouter } from "expo-router";
import React, { useEffect } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { useAuth } from "../src/context/AuthContext";
import { hasCompletedOnboarding } from "../src/lib/onboarding-store";
import { colors } from "../src/lib/theme";

export default function EntryScreen() {
  const router = useRouter();
  const { accessToken, loading } = useAuth();

  useEffect(() => {
    let mounted = true;

    const run = async () => {
      if (loading) return;
      const completed = await hasCompletedOnboarding();
      if (!mounted) return;
      router.replace((completed && accessToken ? "/(tabs)/news" : "/onboarding") as any);
    };

    run();

    return () => {
      mounted = false;
    };
  }, [accessToken, loading, router]);

  return (
    <View style={styles.container}>
      <ActivityIndicator color={colors.primary} size="large" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.background,
  },
});
