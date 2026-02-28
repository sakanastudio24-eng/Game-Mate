import { useRouter } from "expo-router";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import React, { useState } from "react";
import { StyleSheet } from "react-native";
import { List, Switch, Text } from "react-native-paper";
import { Button } from "../../src/components/ui/Button";
import { Card } from "../../src/components/ui/Card";
import { Header } from "../../src/components/ui/Header";
import { Screen } from "../../src/components/ui/Screen";
import { colors, spacing } from "../../src/lib/theme";

// SettingsScreen: User preferences and account settings
// Backend integration: PATCH /api/me/settings endpoint in Phase B
// State: notification toggles, privacy settings (local)

export default function SettingsScreen() {
  const router = useRouter();
  const [notifications, setNotifications] = useState({
    push: true,
    email: false,
    mentions: true,
    groupUpdates: true,
  });

  const [privacy, setPrivacy] = useState({
    profilePublic: true,
    showOnlineStatus: true,
    allowMessages: true,
  });

  const toggleNotification = (key: keyof typeof notifications) => {
    setNotifications((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const togglePrivacy = (key: keyof typeof privacy) => {
    setPrivacy((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <Screen scrollable>
      <Header title="Settings" showBackButton />

      {/* Account section */}
      <Card style={styles.section}>
        <Text style={styles.sectionTitle}>Account</Text>

        <List.Item
          title="Change Email"
          description="Update your email address"
          left={() => (
            <MaterialCommunityIcons
              name="email"
              size={20}
              color={colors.primary}
            />
          )}
          titleStyle={styles.listTitle}
          onPress={() => router.push("/(tabs)/account-settings" as any)}
        />

        <List.Item
          title="Change Password"
          description="Update your password"
          left={() => (
            <MaterialCommunityIcons
              name="lock"
              size={20}
              color={colors.primary}
            />
          )}
          titleStyle={styles.listTitle}
          onPress={() => router.push("/(tabs)/account-settings" as any)}
        />

        <List.Item
          title="Two-Factor Authentication"
          description="Add extra security"
          left={() => (
            <MaterialCommunityIcons
              name="shield-check"
              size={20}
              color={colors.primary}
            />
          )}
          titleStyle={styles.listTitle}
          onPress={() => router.push("/(tabs)/account-settings" as any)}
        />
      </Card>

      {/* Notifications section */}
      <Card style={styles.section}>
        <Text style={styles.sectionTitle}>Notifications</Text>

        <List.Item
          title="Push Notifications"
          right={() => (
            <Switch
              value={notifications.push}
              onValueChange={() => toggleNotification("push")}
              color={colors.primary}
            />
          )}
          titleStyle={styles.listTitle}
          onPress={() => toggleNotification("push")}
        />

        <List.Item
          title="Email Notifications"
          right={() => (
            <Switch
              value={notifications.email}
              onValueChange={() => toggleNotification("email")}
              color={colors.primary}
            />
          )}
          titleStyle={styles.listTitle}
          onPress={() => toggleNotification("email")}
        />

        <List.Item
          title="Mentions"
          right={() => (
            <Switch
              value={notifications.mentions}
              onValueChange={() => toggleNotification("mentions")}
              color={colors.primary}
            />
          )}
          titleStyle={styles.listTitle}
          onPress={() => toggleNotification("mentions")}
        />

        <List.Item
          title="Group Updates"
          right={() => (
            <Switch
              value={notifications.groupUpdates}
              onValueChange={() => toggleNotification("groupUpdates")}
              color={colors.primary}
            />
          )}
          titleStyle={styles.listTitle}
          onPress={() => toggleNotification("groupUpdates")}
        />
      </Card>

      {/* Privacy section */}
      <Card style={styles.section}>
        <Text style={styles.sectionTitle}>Privacy & Security</Text>

        <List.Item
          title="Public Profile"
          description="Allow others to view your profile"
          right={() => (
            <Switch
              value={privacy.profilePublic}
              onValueChange={() => togglePrivacy("profilePublic")}
              color={colors.primary}
            />
          )}
          titleStyle={styles.listTitle}
          onPress={() => togglePrivacy("profilePublic")}
        />

        <List.Item
          title="Show Online Status"
          right={() => (
            <Switch
              value={privacy.showOnlineStatus}
              onValueChange={() => togglePrivacy("showOnlineStatus")}
              color={colors.primary}
            />
          )}
          titleStyle={styles.listTitle}
          onPress={() => togglePrivacy("showOnlineStatus")}
        />

        <List.Item
          title="Allow Direct Messages"
          right={() => (
            <Switch
              value={privacy.allowMessages}
              onValueChange={() => togglePrivacy("allowMessages")}
              color={colors.primary}
            />
          )}
          titleStyle={styles.listTitle}
          onPress={() => togglePrivacy("allowMessages")}
        />

        <List.Item
          title="Blocked Users"
          left={() => (
            <MaterialCommunityIcons
              name="block-helper"
              size={20}
              color={colors.destructive}
            />
          )}
          titleStyle={[styles.listTitle, { color: colors.destructive }]}
          onPress={() => router.push("/(tabs)/privacy-detail" as any)}
        />
      </Card>

      {/* App section */}
      <Card style={styles.section}>
        <Text style={styles.sectionTitle}>App</Text>

        <List.Item
          title="About"
          titleStyle={styles.listTitle}
          onPress={() => router.push("/(tabs)/help" as any)}
        />

        <List.Item
          title="Version"
          description="1.0.0 (Build 1)"
          titleStyle={styles.listTitle}
        />

        <List.Item
          title="Terms of Service"
          titleStyle={styles.listTitle}
          onPress={() => router.push("/(tabs)/help" as any)}
        />

        <List.Item
          title="Privacy Policy"
          titleStyle={styles.listTitle}
          onPress={() => router.push("/(tabs)/privacy-detail" as any)}
        />
      </Card>

      {/* Logout button */}
      <Button
        variant="primary"
        fullWidth
        size="large"
        style={styles.logoutButton}
        onPress={() => router.replace("/(tabs)/news" as any)}
      >
        Logout
      </Button>
    </Screen>
  );
}

const styles = StyleSheet.create({
  section: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    color: colors.primary,
    fontWeight: "700",
    fontSize: 12,
    textTransform: "uppercase",
    marginBottom: spacing.md,
    letterSpacing: 0.5,
  },
  listTitle: {
    color: colors.text,
    fontSize: 14,
  },
  logoutButton: {
    marginBottom: spacing.xl,
  },
});
