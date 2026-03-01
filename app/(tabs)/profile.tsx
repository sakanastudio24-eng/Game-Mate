import { useRouter } from "expo-router";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import React from "react";
import { FlatList, Pressable, StyleSheet, View } from "react-native";
import { Text } from "react-native-paper";
import { Card } from "../../src/components/ui/Card";
import { Header } from "../../src/components/ui/Header";
import { Screen } from "../../src/components/ui/Screen";
import { mockCurrentUser } from "../../src/lib/mockData";
import { colors, spacing } from "../../src/lib/theme";

const statRows = [
  { label: "Groups", value: String(mockCurrentUser.groupsJoined), icon: "account-group" },
  { label: "Games", value: String(mockCurrentUser.gamesPlayed.length), icon: "gamepad-variant" },
  { label: "Wins", value: String(mockCurrentUser.stats?.wins ?? 0), icon: "trophy" },
  { label: "Hours", value: `${Math.floor(mockCurrentUser.totalHours / 100) / 10}K`, icon: "clock-outline" },
] as const;

export default function ProfileScreen() {
  const router = useRouter();

  return (
    <Screen scrollable>
      <Header
        title="Profile"
        subtitle="Your gamer identity"
        rightAction={{ icon: "cog", onPress: () => router.push("/(tabs)/settings" as any) }}
      />

      <View style={styles.hero}>
        <View style={styles.avatarRing}>
          <Text style={styles.avatar}>{mockCurrentUser.avatar}</Text>
        </View>

        <View style={styles.nameRow}>
          <Text style={styles.username}>{mockCurrentUser.username}</Text>
          <MaterialCommunityIcons name="check-decagram" size={18} color={colors.primary} />
        </View>

        <Text style={styles.status}>Online • Playing Valorant</Text>
        <Text style={styles.bio}>{mockCurrentUser.bio}</Text>

        <Pressable
          onPress={() => router.push("/(tabs)/edit-profile" as any)}
          style={styles.editButton}
        >
          <MaterialCommunityIcons name="pencil" size={16} color={colors.background} />
          <Text style={styles.editButtonText}>Edit Profile</Text>
        </Pressable>
      </View>

      <View style={styles.statsGrid}>
        {statRows.map((stat) => (
          <View key={stat.label} style={styles.statTile}>
            <MaterialCommunityIcons name={stat.icon as any} size={18} color={colors.primary} />
            <Text style={styles.statValue}>{stat.value}</Text>
            <Text style={styles.statLabel}>{stat.label}</Text>
          </View>
        ))}
      </View>

      <Card>
        <Text style={styles.sectionTitle}>Achievements</Text>
        <View style={styles.badgesWrap}>
          {mockCurrentUser.badges.map((badge) => (
            <View key={badge} style={styles.badgePill}>
              <MaterialCommunityIcons name="star-four-points" size={14} color={colors.primary} />
              <Text style={styles.badgeText}>{badge}</Text>
            </View>
          ))}
        </View>
      </Card>

      <Card>
        <View style={styles.gamesHeader}>
          <Text style={styles.sectionTitle}>My Games</Text>
          <Text style={styles.gamesCount}>{mockCurrentUser.gamesPlayed.length} games</Text>
        </View>
        <FlatList
          data={mockCurrentUser.gamesPlayed}
          keyExtractor={(item) => item}
          horizontal
          showsHorizontalScrollIndicator={false}
          renderItem={({ item }) => (
            <View style={styles.gameTile}>
              <Text style={styles.gameTitle}>{item}</Text>
            </View>
          )}
        />
      </Card>

      <Card style={styles.settingsCard}>
        <Text style={styles.sectionTitle}>Quick Settings</Text>

        {[
          { label: "Account Settings", icon: "lock", route: "/(tabs)/account-settings" },
          { label: "Notifications", icon: "bell", route: "/(tabs)/notification-settings" },
          { label: "Privacy & Security", icon: "shield", route: "/(tabs)/privacy-settings" },
          { label: "Help & Support", icon: "help-circle", route: "/(tabs)/help" },
          { label: "My QR Code", icon: "qrcode", route: "/(tabs)/qr-code" },
        ].map((item) => (
          <Pressable
            key={item.label}
            onPress={() => router.push(item.route as any)}
            style={styles.menuRow}
          >
            <View style={styles.menuRowLeft}>
              <MaterialCommunityIcons name={item.icon as any} size={20} color={colors.primary} />
              <Text style={styles.menuRowText}>{item.label}</Text>
            </View>
            <MaterialCommunityIcons
              name="chevron-right"
              size={20}
              color={colors.textMuted}
            />
          </Pressable>
        ))}
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    alignItems: "center",
  },
  avatarRing: {
    width: 104,
    height: 104,
    borderRadius: 52,
    borderWidth: 2,
    borderColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.md,
  },
  avatar: {
    fontSize: 60,
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
  username: {
    color: colors.text,
    fontWeight: "800",
    fontSize: 26,
  },
  status: {
    color: colors.online,
    fontSize: 12,
    marginTop: spacing.xs,
  },
  bio: {
    color: colors.textMuted,
    marginTop: spacing.sm,
    textAlign: "center",
    lineHeight: 20,
  },
  editButton: {
    marginTop: spacing.md,
    backgroundColor: colors.primary,
    borderRadius: 999,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
  editButtonText: {
    color: colors.background,
    fontWeight: "700",
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  statTile: {
    width: "48%",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    padding: spacing.md,
  },
  statValue: {
    color: colors.text,
    fontWeight: "700",
    fontSize: 20,
    marginTop: spacing.xs,
  },
  statLabel: {
    color: colors.textMuted,
    marginTop: 2,
    fontSize: 12,
  },
  sectionTitle: {
    color: colors.text,
    fontWeight: "700",
    fontSize: 15,
    marginBottom: spacing.md,
  },
  badgesWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  badgePill: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    backgroundColor: colors.background,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
  },
  badgeText: {
    color: colors.text,
    fontSize: 12,
    fontWeight: "600",
  },
  gamesHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  gamesCount: {
    color: colors.textMuted,
    fontSize: 12,
  },
  gameTile: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    marginRight: spacing.sm,
    minWidth: 130,
  },
  gameTitle: {
    color: colors.text,
    fontWeight: "700",
    fontSize: 13,
  },
  settingsCard: {
    marginBottom: spacing.xl,
  },
  menuRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  menuRowLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  menuRowText: {
    color: colors.text,
    fontSize: 14,
    fontWeight: "600",
  },
});
