import { useRouter } from "expo-router";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import React from "react";
import { Image, Pressable, ScrollView, StyleSheet, View } from "react-native";
import { Text } from "react-native-paper";
import { mockCurrentUser } from "../../src/lib/mockData";
import { colors, spacing } from "../../src/lib/theme";

const SELF_AVATAR =
  "https://images.unsplash.com/photo-1579975979101-7a3c3909d659?w=400&h=400&fit=crop";

const statRows = [
  { label: "Groups", value: "12", icon: "account-group-outline", color: colors.primary },
  { label: "Events", value: "34", icon: "calendar-month-outline", color: "#66BAFF" },
  { label: "Wins", value: "156", icon: "trophy-outline", color: "#FFD700" },
  { label: "Hours", value: "2.4K", icon: "controller-classic-outline", color: "#4ADE80" },
] as const;

const achievements = [
  {
    name: "Tournament Winner",
    icon: "trophy",
    rarity: "Legendary",
    color: "#FFD700",
  },
  {
    name: "Team Player",
    icon: "handshake-outline",
    rarity: "Epic",
    color: "#9B59B6",
  },
  {
    name: "Veteran",
    icon: "star-outline",
    rarity: "Rare",
    color: "#3498DB",
  },
  {
    name: "Marksman",
    icon: "crosshairs",
    rarity: "Common",
    color: "#95A5A6",
  },
] as const;

const games = [
  {
    name: "Overwatch",
    hours: 450,
    image: "https://images.unsplash.com/photo-1511512578047-dfb367046420?w=400&q=80",
  },
  {
    name: "Valorant",
    hours: 320,
    image: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=400&q=80",
  },
  {
    name: "CS2",
    hours: 280,
    image: "https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=400&q=80",
  },
  {
    name: "Apex Legends",
    hours: 190,
    image: "https://images.unsplash.com/photo-1552820728-8b83bb6b773f?w=400&q=80",
  },
  {
    name: "League",
    hours: 150,
    image: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=400&q=80",
  },
  {
    name: "Fortnite",
    hours: 120,
    image: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=400&q=80",
  },
] as const;

export default function ProfileScreen() {
  const router = useRouter();

  return (
    <View style={styles.screen}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <View style={styles.cover}>
          <View style={styles.coverPattern} />

          <View style={styles.headerActions}>
            <Pressable
              onPress={() => router.push("/(tabs)/qr-code")}
              style={({ pressed }) => [styles.headerIcon, pressed && styles.pressed]}
            >
              <MaterialCommunityIcons name="qrcode" size={20} color={colors.text} />
            </Pressable>
            <Pressable
              onPress={() => router.push("/(tabs)/settings")}
              style={({ pressed }) => [styles.headerIcon, pressed && styles.pressed]}
            >
              <MaterialCommunityIcons name="cog-outline" size={20} color={colors.text} />
            </Pressable>
          </View>
        </View>

        <View style={styles.profileBlock}>
          <View style={styles.avatarRing}>
            <Image source={{ uri: SELF_AVATAR }} style={styles.avatar} />
          </View>
          <View style={styles.onlineDot} />

          <View style={styles.nameRow}>
            <Text style={styles.name}>PlayerMaker34</Text>
            <MaterialCommunityIcons name="check-decagram" size={18} color={colors.primary} />
          </View>

          <View style={styles.statusRow}>
            <MaterialCommunityIcons name="controller-classic-outline" size={15} color={colors.textSecondary} />
            <Text style={styles.statusText}>Online · Playing Overwatch</Text>
          </View>

          <Text style={styles.bio}>
            Competitive gamer · Tournament organizer · Always looking for new challenges
          </Text>

          <Pressable
            onPress={() => router.push("/(tabs)/edit-profile")}
            style={({ pressed }) => [styles.editButton, pressed && styles.pressed]}
          >
            <MaterialCommunityIcons name="pencil-outline" size={16} color="#1A1A1A" />
            <Text style={styles.editButtonText}>Edit Profile</Text>
          </Pressable>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Stats</Text>
          <View style={styles.statsGrid}>
            {statRows.map((stat) => (
              <View key={stat.label} style={styles.statCard}>
                <MaterialCommunityIcons name={stat.icon as any} size={20} color={stat.color} />
                <Text style={styles.statValue}>{stat.value}</Text>
                <Text style={styles.statLabel}>{stat.label}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Achievements</Text>
          <View style={styles.achievementsGrid}>
            {achievements.map((achievement) => (
              <View
                key={achievement.name}
                style={[
                  styles.achievementCard,
                  { borderColor: `${achievement.color}44` },
                ]}
              >
                <View
                  style={[
                    styles.achievementIconWrap,
                    { backgroundColor: `${achievement.color}22` },
                  ]}
                >
                  <MaterialCommunityIcons
                    name={achievement.icon as any}
                    size={22}
                    color={achievement.color}
                  />
                </View>
                <Text style={styles.achievementName}>{achievement.name}</Text>
                <Text style={[styles.achievementRarity, { color: achievement.color }]}>
                  {achievement.rarity}
                </Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.gamesHeader}>
            <Text style={styles.sectionTitle}>My Games</Text>
            <Text style={styles.gamesCount}>{games.length} games</Text>
          </View>

          <View style={styles.gamesGrid}>
            {games.map((game) => (
              <View key={game.name} style={styles.gameCard}>
                <Image source={{ uri: game.image }} style={styles.gameImage} />
                <View style={styles.gameOverlay}>
                  <Text style={styles.gameName}>{game.name}</Text>
                  <Text style={styles.gameHours}>{game.hours}h</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.accountMeta}>
          <Text style={styles.accountMetaText}>@{mockCurrentUser.username}</Text>
          <Text style={styles.accountMetaText}>Level {mockCurrentUser.level}</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    paddingBottom: 110,
  },
  cover: {
    height: 160,
    backgroundColor: "#FF7F3A",
    position: "relative",
  },
  coverPattern: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "transparent",
    borderTopWidth: 0,
    opacity: 0.16,
  },
  headerActions: {
    position: "absolute",
    right: spacing.md,
    top: 52,
    flexDirection: "row",
  },
  headerIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    marginLeft: spacing.sm,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(26,26,26,0.62)",
    borderWidth: 1,
    borderColor: "rgba(245,245,245,0.2)",
  },
  profileBlock: {
    paddingHorizontal: spacing.md,
    marginTop: -58,
    marginBottom: spacing.lg,
  },
  avatarRing: {
    width: 122,
    height: 122,
    borderRadius: 61,
    borderWidth: 3,
    borderColor: colors.primary,
    backgroundColor: colors.background,
    overflow: "hidden",
  },
  avatar: {
    width: "100%",
    height: "100%",
  },
  onlineDot: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 3,
    borderColor: colors.background,
    backgroundColor: "#4ADE80",
    position: "absolute",
    left: 102,
    top: 88,
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: spacing.md,
  },
  name: {
    color: colors.text,
    fontSize: 30,
    fontWeight: "800",
    marginRight: 8,
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  statusText: {
    color: colors.textSecondary,
    marginLeft: 6,
    fontSize: 13,
  },
  bio: {
    color: colors.textSecondary,
    marginTop: spacing.sm,
    lineHeight: 20,
  },
  editButton: {
    marginTop: spacing.md,
    backgroundColor: colors.primary,
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
  },
  editButtonText: {
    color: "#1A1A1A",
    fontWeight: "800",
    fontSize: 15,
    marginLeft: 6,
  },
  section: {
    paddingHorizontal: spacing.md,
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 22,
    fontWeight: "800",
    marginBottom: spacing.sm,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginHorizontal: -4,
  },
  statCard: {
    width: "25%",
    paddingHorizontal: 4,
    marginBottom: 8,
  },
  statValue: {
    color: colors.text,
    fontWeight: "800",
    fontSize: 20,
    marginTop: 6,
    textAlign: "center",
  },
  statLabel: {
    color: colors.textSecondary,
    fontSize: 11,
    textAlign: "center",
    marginTop: 2,
  },
  achievementsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginHorizontal: -4,
  },
  achievementCard: {
    width: "50%",
    paddingHorizontal: 4,
    marginBottom: 8,
  },
  achievementIconWrap: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  achievementName: {
    color: colors.text,
    fontWeight: "700",
    fontSize: 13,
  },
  achievementRarity: {
    fontSize: 11,
    marginTop: 2,
    textTransform: "uppercase",
  },
  gamesHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  gamesCount: {
    color: colors.textSecondary,
    fontSize: 12,
    marginBottom: spacing.sm,
  },
  gamesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginHorizontal: -4,
  },
  gameCard: {
    width: "33.33%",
    paddingHorizontal: 4,
    marginBottom: 8,
  },
  gameImage: {
    width: "100%",
    aspectRatio: 1,
    borderRadius: 14,
  },
  gameOverlay: {
    position: "absolute",
    left: 8,
    right: 8,
    bottom: 10,
  },
  gameName: {
    color: colors.text,
    fontSize: 11,
    fontWeight: "800",
  },
  gameHours: {
    color: colors.textSecondary,
    fontSize: 10,
    marginTop: 1,
  },
  accountMeta: {
    paddingHorizontal: spacing.md,
  },
  accountMetaText: {
    color: colors.textSecondary,
    fontSize: 12,
    marginBottom: 2,
  },
  pressed: {
    opacity: 0.85,
  },
});
