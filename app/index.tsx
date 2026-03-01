import { useRouter } from "expo-router";
import React, { useEffect } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { hasCompletedOnboarding } from "../src/lib/onboarding-store";
import { colors } from "../src/lib/theme";

export default function EntryScreen() {
  const router = useRouter();

  useEffect(() => {
    let mounted = true;

    const run = async () => {
      const completed = await hasCompletedOnboarding();
      if (!mounted) return;
      router.replace((completed ? "/(tabs)/news" : "/onboarding") as any);
    };

    run();

    return () => {
      mounted = false;
    };
  }, [router]);

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
