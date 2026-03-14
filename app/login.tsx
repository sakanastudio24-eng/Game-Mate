import { useRouter } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { Text } from "react-native-paper";
import { Button } from "../src/components/ui/Button";
import { Card } from "../src/components/ui/Card";
import { Input } from "../src/components/ui/Input";
import { Screen } from "../src/components/ui/Screen";
import { useAuth } from "../src/context/AuthContext";
import { useResponsive } from "../src/lib/responsive";
import { colors, spacing } from "../src/lib/theme";

export default function LoginScreen() {
  const router = useRouter();
  const responsive = useResponsive();
  const { accessToken, loading, loginUser } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (accessToken) {
      router.replace("/(tabs)/news" as any);
    }
  }, [accessToken, router]);

  const canSubmit = useMemo(() => email.includes("@") && password.length > 0, [email, password]);

  const handleLogin = async () => {
    if (!canSubmit || submitting) return;

    setErrorMessage(null);
    setSubmitting(true);

    try {
      await loginUser(email.trim(), password);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Unable to sign in.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreateAccount = () => {
    if (submitting) return;
    router.push("/onboarding" as any);
  };

  if (loading && !accessToken) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator color={colors.primary} size="large" />
        <Text style={styles.loadingText}>Restoring session...</Text>
      </View>
    );
  }

  return (
    <Screen>
      <View style={styles.container}>
        <Card style={styles.card}>
          <Text style={[styles.title, { fontSize: responsive.titleSize }]}>Welcome Back</Text>
          <Text style={[styles.subtitle, { fontSize: responsive.bodySmallSize }]}>
            Sign in with email and password.
          </Text>

          <Input
            label="Email"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            autoCorrect={false}
            autoComplete="email"
            textContentType="emailAddress"
            fullWidth
            accessibilityLabel="Email address"
          />

          <Input
            label="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoCapitalize="none"
            autoCorrect={false}
            autoComplete="password"
            textContentType="password"
            fullWidth
            accessibilityLabel="Password"
          />

          {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}
          {submitting ? <Text style={styles.pendingText}>Signing in...</Text> : null}

          <Button
            variant="primary"
            fullWidth
            size="large"
            onPress={handleLogin}
            disabled={!canSubmit || submitting}
            loading={submitting}
          >
            Sign In
          </Button>

          <Button
            variant="secondary"
            fullWidth
            size="large"
            onPress={handleCreateAccount}
            disabled={submitting}
          >
            Create Account
          </Button>
        </Card>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.background,
    gap: spacing.sm,
  },
  loadingText: {
    color: colors.textSecondary,
    fontSize: 13,
  },
  container: {
    flex: 1,
    justifyContent: "center",
  },
  card: {
    gap: spacing.sm,
  },
  title: {
    color: colors.text,
    fontWeight: "800",
  },
  subtitle: {
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  errorText: {
    color: colors.destructive,
    fontSize: 13,
    marginBottom: spacing.sm,
  },
  pendingText: {
    color: colors.textSecondary,
    fontSize: 12,
    marginBottom: spacing.sm,
  },
});
