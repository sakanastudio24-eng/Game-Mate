import { useRouter } from "expo-router";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import React from "react";
import { Image, StyleSheet, View } from "react-native";
import { List, Text } from "react-native-paper";
import { Button } from "../../src/components/ui/Button";
import { Card } from "../../src/components/ui/Card";
import { Header } from "../../src/components/ui/Header";
import { Screen } from "../../src/components/ui/Screen";
import { mockCurrentUser } from "../../src/lib/mockData";
import { useResponsive } from "../../src/lib/responsive";
import { colors, spacing } from "../../src/lib/theme";

const SELF_AVATAR =
  "https://images.unsplash.com/photo-1579975979101-7a3c3909d659?w=400&h=400&fit=crop";

export default function SettingsScreen() {
  const router = useRouter();
  const responsive = useResponsive();

  return (
    <Screen scrollable>
      <Header title="Profile Settings" showBackButton />

      <Card style={styles.profileCard}>
        <View style={styles.profileRow}>
          <Image source={{ uri: SELF_AVATAR }} style={styles.profileAvatar} />
          <View style={styles.profileMeta}>
            <Text style={[styles.profileName, { fontSize: responsive.sectionTitleSize - 2 }]}>
              {mockCurrentUser.username}
            </Text>
            <Text style={[styles.profileEmail, { fontSize: responsive.bodySmallSize }]}>
              {mockCurrentUser.email}
            </Text>
          </View>
        </View>
      </Card>

      <Card style={styles.section}>
        <Text style={[styles.sectionTitle, { fontSize: responsive.captionSize }]}>Account</Text>

        <List.Item
          title="Edit Profile"
          description="Username, bio, and avatar"
          titleStyle={[styles.listTitle, { fontSize: responsive.bodySize }]}
          left={() => <MaterialCommunityIcons name="account-edit-outline" size={20} color={colors.primary} />}
          onPress={() => router.push("/(tabs)/edit-profile" as any)}
        />

        <List.Item
          title="Account Settings"
          description="Email, password, and two-factor auth"
          titleStyle={[styles.listTitle, { fontSize: responsive.bodySize }]}
          left={() => <MaterialCommunityIcons name="account-cog-outline" size={20} color={colors.primary} />}
          onPress={() => router.push("/(tabs)/account-settings" as any)}
        />
      </Card>

      <Card style={styles.section}>
        <Text style={[styles.sectionTitle, { fontSize: responsive.captionSize }]}>Preferences</Text>

        <List.Item
          title="Notification Settings"
          description="Push, social, and activity alerts"
          titleStyle={[styles.listTitle, { fontSize: responsive.bodySize }]}
          left={() => <MaterialCommunityIcons name="bell-outline" size={20} color={colors.primary} />}
          onPress={() => router.push("/(tabs)/notification-settings" as any)}
        />

        <List.Item
          title="Privacy & Security"
          description="Visibility, messaging, and safety controls"
          titleStyle={[styles.listTitle, { fontSize: responsive.bodySize }]}
          left={() => <MaterialCommunityIcons name="shield-lock-outline" size={20} color={colors.primary} />}
          onPress={() => router.push("/(tabs)/privacy-settings" as any)}
        />

        <List.Item
          title="Platform Connections"
          description="Link PlayStation, Computer, Phone, and Switch"
          titleStyle={[styles.listTitle, { fontSize: responsive.bodySize }]}
          left={() => <MaterialCommunityIcons name="gamepad-variant-outline" size={20} color={colors.primary} />}
          onPress={() => router.push("/(tabs)/platform-connections" as any)}
        />
      </Card>

      <Card style={styles.section}>
        <Text style={[styles.sectionTitle, { fontSize: responsive.captionSize }]}>Support</Text>

        <List.Item
          title="Help & Support"
          titleStyle={[styles.listTitle, { fontSize: responsive.bodySize }]}
          left={() => <MaterialCommunityIcons name="lifebuoy" size={20} color={colors.primary} />}
          onPress={() => router.push("/(tabs)/help" as any)}
        />

        <List.Item
          title="Blocked Users"
          titleStyle={[styles.listTitle, { fontSize: responsive.bodySize }]}
          left={() => <MaterialCommunityIcons name="block-helper" size={20} color={colors.destructive} />}
          onPress={() => router.push("/(tabs)/privacy-detail" as any)}
        />

        <List.Item
          title="Site Map (Preview)"
          titleStyle={[styles.listTitle, { fontSize: responsive.bodySize }]}
          left={() => <MaterialCommunityIcons name="map-search-outline" size={20} color={colors.textSecondary} />}
          onPress={() => router.push("/(tabs)/explore" as any)}
        />
      </Card>

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
  profileCard: {
    marginBottom: spacing.lg,
  },
  profileRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  profileAvatar: {
    width: 58,
    height: 58,
    borderRadius: 29,
    marginRight: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  profileMeta: {
    flex: 1,
  },
  profileName: {
    color: colors.text,
    fontWeight: "800",
  },
  profileEmail: {
    color: colors.textSecondary,
    marginTop: 2,
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    color: colors.primary,
    fontWeight: "700",
    textTransform: "uppercase",
    marginBottom: spacing.md,
    letterSpacing: 0.5,
  },
  listTitle: {
    color: colors.text,
  },
  logoutButton: {
    marginBottom: spacing.xl,
  },
});
