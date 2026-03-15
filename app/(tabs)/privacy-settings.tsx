import { useRouter } from "expo-router";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import React, { useState } from "react";
import { StyleSheet } from "react-native";
import { List, Switch, Text } from "react-native-paper";
import { Card } from "../../src/components/ui/Card";
import { Header } from "../../src/components/ui/Header";
import { Screen } from "../../src/components/ui/Screen";
import { useResponsive } from "../../src/lib/responsive";
import { colors, spacing } from "../../src/lib/theme";

// PrivacySettingsScreen: Privacy and content controls
// Backend integration: PATCH /api/me/privacy endpoint in Phase B

export default function PrivacySettingsScreen() {
  const router = useRouter();
  const responsive = useResponsive();
  const [privacySettings, setPrivacySettings] = useState({
    profilePublic: true,
    showOnlineStatus: true,
    allowMessages: true,
    allowGroupInvites: true,
    searchable: true,
  });

  const toggleSetting = (key: keyof typeof privacySettings) => {
    setPrivacySettings((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <Screen scrollable>
      <Header title="Privacy & Security" showBackButton onBack={() => router.replace("/(tabs)/settings")} />

      <Card style={styles.section}>
        <Text
          accessibilityRole="header"
          style={[styles.sectionTitle, { fontSize: responsive.captionSize }]}
        >
          Profile Visibility
        </Text>

        <List.Item
          title="Public Profile"
          description="Allow others to view your profile"
          right={() => (
            <Switch
              value={privacySettings.profilePublic}
              onValueChange={() => toggleSetting("profilePublic")}
              color={colors.primary}
              accessibilityLabel="Public profile"
            />
          )}
          titleStyle={[styles.listTitle, { fontSize: responsive.bodySize }]}
          onPress={() => toggleSetting("profilePublic")}
        />

        <List.Item
          title="Show Online Status"
          description="Let friends see when you're online"
          right={() => (
            <Switch
              value={privacySettings.showOnlineStatus}
              onValueChange={() => toggleSetting("showOnlineStatus")}
              color={colors.primary}
              accessibilityLabel="Show online status"
            />
          )}
          titleStyle={[styles.listTitle, { fontSize: responsive.bodySize }]}
          onPress={() => toggleSetting("showOnlineStatus")}
        />

        <List.Item
          title="Searchable Profile"
          description="Appear in search results"
          right={() => (
            <Switch
              value={privacySettings.searchable}
              onValueChange={() => toggleSetting("searchable")}
              color={colors.primary}
              accessibilityLabel="Searchable profile"
            />
          )}
          titleStyle={[styles.listTitle, { fontSize: responsive.bodySize }]}
          onPress={() => toggleSetting("searchable")}
        />
      </Card>

      <Card style={styles.section}>
        <Text
          accessibilityRole="header"
          style={[styles.sectionTitle, { fontSize: responsive.captionSize }]}
        >
          Interactions
        </Text>

        <List.Item
          title="Allow Direct Messages"
          description="Who can message you"
          right={() => (
            <Switch
              value={privacySettings.allowMessages}
              onValueChange={() => toggleSetting("allowMessages")}
              color={colors.primary}
              accessibilityLabel="Allow direct messages"
            />
          )}
          titleStyle={[styles.listTitle, { fontSize: responsive.bodySize }]}
          onPress={() => toggleSetting("allowMessages")}
        />

        <List.Item
          title="Allow Group Invites"
          description="Who can invite you to groups"
          right={() => (
            <Switch
              value={privacySettings.allowGroupInvites}
              onValueChange={() => toggleSetting("allowGroupInvites")}
              color={colors.primary}
              accessibilityLabel="Allow group invites"
            />
          )}
          titleStyle={[styles.listTitle, { fontSize: responsive.bodySize }]}
          onPress={() => toggleSetting("allowGroupInvites")}
        />
      </Card>

      <Card style={styles.section}>
        <Text
          accessibilityRole="header"
          style={[styles.sectionTitle, { fontSize: responsive.captionSize }]}
        >
          Safety
        </Text>

        <List.Item
          title="Blocked Users"
          description="Manage blocked accounts"
          left={() => (
            <MaterialCommunityIcons
              name="block-helper"
              size={20}
              color={colors.destructive}
            />
          )}
          titleStyle={[styles.listTitle, { color: colors.destructive, fontSize: responsive.bodySize }]}
          onPress={() => router.push("/(tabs)/privacy-detail" as any)}
        />

        <List.Item
          title="Report User"
          description="Report suspicious behavior"
          left={() => (
            <MaterialCommunityIcons
              name="alert-circle"
              size={20}
              color={colors.destructive}
            />
          )}
          titleStyle={[styles.listTitle, { color: colors.destructive, fontSize: responsive.bodySize }]}
          onPress={() => router.push("/(tabs)/help" as any)}
        />
      </Card>
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
});
