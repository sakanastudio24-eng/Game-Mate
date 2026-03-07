import { useRouter } from "expo-router";
import React, { useEffect } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { useAuth } from "../src/context/AuthContext";
import { colors } from "../src/lib/theme";

export default function EntryScreen() {
  const router = useRouter();
  const { accessToken, loading } = useAuth();

  useEffect(() => {
    let mounted = true;

    const run = async () => {
      if (loading) return;
      if (!mounted) return;
      router.replace((accessToken ? "/(tabs)/news" : "/login") as any);
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
