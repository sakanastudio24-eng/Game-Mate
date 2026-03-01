import { useRouter } from "expo-router";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import React, { useState } from "react";
import { Image, Pressable, ScrollView, StyleSheet, View } from "react-native";
import { Text } from "react-native-paper";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AnimatedEntrance } from "../../src/components/ui/AnimatedEntrance";
import { MY_GROUPS } from "../../src/lib/content-data";
import { mockCurrentUser } from "../../src/lib/mockData";
import { useResponsive } from "../../src/lib/responsive";
import { colors, spacing } from "../../src/lib/theme";

const SELF_AVATAR =
  "https://images.unsplash.com/photo-1579975979101-7a3c3909d659?w=400&h=400&fit=crop";

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
  const responsive = useResponsive();
  const insets = useSafeAreaInsets();
  const safeBottom = Math.max(insets.bottom, responsive.safeBottomInset);
  const safeTop = Math.max(insets.top, responsive.safeTopInset);
  const listBottomPadding = safeBottom + responsive.tabBarBaseHeight + spacing.sm;
  const [myGroups, setMyGroups] = useState(MY_GROUPS);
  const [activeCollectionTab, setActiveCollectionTab] = useState<"games" | "groups">("games");

  const statRows = [
    { label: "Groups", value: String(myGroups.length), icon: "account-group-outline", color: colors.primary },
    { label: "Events", value: "34", icon: "calendar-month-outline", color: "#66BAFF" },
    { label: "Wins", value: "156", icon: "trophy-outline", color: "#FFD700" },
    { label: "Hours", value: "2.4K", icon: "controller-classic-outline", color: "#4ADE80" },
  ] as const;

  const leaveGroup = (groupId: string) => {
    setMyGroups((prev) => prev.filter((group) => group.id !== groupId));
  };

  return (
    <View style={styles.screen}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.content, { paddingBottom: listBottomPadding }]}
      >
        <AnimatedEntrance>
          <View style={styles.cover}>
            <View style={styles.coverPattern} />

            <View
            style={[
              styles.headerActions,
              { right: responsive.horizontalPadding, top: safeTop + responsive.headerTopSpacing },
            ]}
          >
            <Pressable
              onPress={() => router.push("/(tabs)/qr-code")}
              style={({ pressed }) => [
                styles.headerIcon,
                {
                  minWidth: responsive.touchTargetMin,
                  minHeight: responsive.touchTargetMin,
                  width: responsive.iconButtonSize,
                  height: responsive.iconButtonSize,
                  borderRadius: responsive.iconButtonSize / 2,
                },
                pressed && styles.pressed,
              ]}
              hitSlop={4}
            >
              <MaterialCommunityIcons name="qrcode" size={20} color={colors.text} />
            </Pressable>
            <Pressable
              onPress={() => router.push("/(tabs)/settings")}
              style={({ pressed }) => [
                styles.headerIcon,
                {
                  minWidth: responsive.touchTargetMin,
                  minHeight: responsive.touchTargetMin,
                  width: responsive.iconButtonSize,
                  height: responsive.iconButtonSize,
                  borderRadius: responsive.iconButtonSize / 2,
                },
                pressed && styles.pressed,
              ]}
              hitSlop={4}
            >
              <MaterialCommunityIcons name="cog-outline" size={20} color={colors.text} />
            </Pressable>
            </View>
          </View>
        </AnimatedEntrance>

        <AnimatedEntrance delay={80}>
          <View
            style={[
              styles.profileBlock,
              {
                paddingHorizontal: responsive.horizontalPadding,
                maxWidth: responsive.contentMaxWidth,
                alignSelf: "center",
                width: "100%",
              },
            ]}
          >
            <View style={styles.avatarRing}>
              <Image source={{ uri: SELF_AVATAR }} style={styles.avatar} />
            </View>
            <View style={styles.onlineDot} />

            <View style={styles.nameRow}>
              <Text
                style={[
                  styles.name,
                  {
                    fontSize: responsive.titleSize - 4,
                    lineHeight: Math.round((responsive.titleSize - 4) * 1.1),
                  },
                ]}
              >
                PlayerMaker34
              </Text>
              <MaterialCommunityIcons name="check-decagram" size={18} color={colors.primary} />
            </View>

            <View style={styles.statusRow}>
              <MaterialCommunityIcons name="controller-classic-outline" size={15} color={colors.textSecondary} />
              <Text style={[styles.statusText, { fontSize: responsive.bodySmallSize }]}>
                Online · Playing Overwatch
              </Text>
            </View>

            <Text
              style={[
                styles.bio,
                {
                  fontSize: responsive.bodySize,
                  lineHeight: Math.round(responsive.bodySize * 1.45),
                },
              ]}
            >
              Competitive gamer · Tournament organizer · Always looking for new challenges
            </Text>

            <Pressable
              onPress={() => router.push("/(tabs)/edit-profile")}
              style={({ pressed }) => [
                styles.editButton,
                { minHeight: responsive.buttonHeightMedium },
                pressed && styles.pressed,
              ]}
            >
              <MaterialCommunityIcons name="pencil-outline" size={16} color="#1A1A1A" />
              <Text style={[styles.editButtonText, { fontSize: responsive.bodySize + 1 }]}>
                Edit Profile
              </Text>
            </Pressable>
          </View>
        </AnimatedEntrance>

        <AnimatedEntrance delay={140}>
          <View
            style={[
              styles.section,
              {
                paddingHorizontal: responsive.horizontalPadding,
                maxWidth: responsive.contentMaxWidth,
                alignSelf: "center",
                width: "100%",
              },
            ]}
          >
            <Text style={[styles.sectionTitle, { fontSize: responsive.sectionTitleSize }]}>
              Stats
            </Text>
            <View style={styles.statsGrid}>
              {statRows.map((stat) => (
                <View key={stat.label} style={styles.statCard}>
                  <View style={styles.statIconWrap}>
                    <MaterialCommunityIcons name={stat.icon as any} size={18} color={stat.color} />
                  </View>
                  <Text style={styles.statValue}>{stat.value}</Text>
                  <Text style={styles.statLabel}>{stat.label}</Text>
                </View>
              ))}
            </View>
          </View>
        </AnimatedEntrance>

        <AnimatedEntrance delay={200}>
          <View
            style={[
              styles.section,
              {
                paddingHorizontal: responsive.horizontalPadding,
                maxWidth: responsive.contentMaxWidth,
                alignSelf: "center",
                width: "100%",
              },
            ]}
          >
            <Text style={[styles.sectionTitle, { fontSize: responsive.sectionTitleSize }]}>
              Achievements
            </Text>
            <View style={styles.achievementsGrid}>
              {achievements.map((achievement) => (
                <View
                  key={achievement.name}
                  style={[
                    styles.achievementCard,
                    { borderColor: `${achievement.color}66` },
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
                      size={20}
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
        </AnimatedEntrance>

        <AnimatedEntrance delay={260}>
          <View
            style={[
              styles.section,
              {
                paddingHorizontal: responsive.horizontalPadding,
                maxWidth: responsive.contentMaxWidth,
                alignSelf: "center",
                width: "100%",
              },
            ]}
          >
            <View style={styles.collectionTabs}>
              {(
                [
                  { id: "games", label: "Games" },
                  { id: "groups", label: "Groups" },
                ] as const
              ).map((tab) => {
                const isActive = activeCollectionTab === tab.id;
                return (
                  <Pressable
                    key={tab.id}
                    onPress={() => setActiveCollectionTab(tab.id)}
                    style={({ pressed }) => [
                      styles.collectionTabButton,
                      {
                        minHeight: responsive.buttonHeightSmall,
                        borderRadius: responsive.cardRadius - 6,
                      },
                      isActive && styles.collectionTabButtonActive,
                      pressed && styles.pressed,
                    ]}
                  >
                    <Text style={[styles.collectionTabText, isActive && styles.collectionTabTextActive]}>
                      {tab.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            {activeCollectionTab === "games" ? (
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
            ) : myGroups.length === 0 ? (
              <View style={styles.emptyGroups}>
                <Text style={styles.emptyGroupsText}>No active groups yet.</Text>
              </View>
            ) : (
              myGroups.map((group) => (
                <Pressable
                  key={group.id}
                  onPress={() => router.push(`/(tabs)/group-detail?groupId=${group.id}`)}
                  style={({ pressed }) => [styles.myGroupCard, pressed && styles.pressed]}
                >
                  <Image source={{ uri: group.thumbnail }} style={styles.myGroupThumb} />

                  <View style={styles.myGroupInfo}>
                    <View style={styles.myGroupTopRow}>
                      <Text style={styles.myGroupName}>{group.name}</Text>
                      <Pressable
                        onPress={(event) => {
                          event.stopPropagation();
                          router.push(`/(tabs)/group-detail?groupId=${group.id}`);
                        }}
                        style={({ pressed }) => [
                          styles.groupOptionsButton,
                          {
                            minWidth: responsive.touchTargetMin,
                            minHeight: responsive.touchTargetMin,
                            borderRadius: responsive.touchTargetMin / 2,
                          },
                          pressed && styles.pressed,
                        ]}
                      >
                        <MaterialCommunityIcons
                          name="dots-vertical"
                          size={20}
                          color={colors.textSecondary}
                        />
                      </Pressable>
                    </View>

                    <Text style={styles.myGroupMeta}>
                      {group.game} · {group.members} members · {group.online} online
                    </Text>

                    <Pressable
                      onPress={(event) => {
                        event.stopPropagation();
                        leaveGroup(group.id);
                      }}
                      style={({ pressed }) => [
                        styles.groupLeaveButton,
                        { minHeight: responsive.buttonHeightSmall, minWidth: responsive.touchTargetMin + 10 },
                        pressed && styles.pressed,
                      ]}
                    >
                      <Text style={styles.groupLeaveButtonText}>Leave</Text>
                    </Pressable>
                  </View>
                </Pressable>
              ))
            )}
          </View>
        </AnimatedEntrance>

        <AnimatedEntrance delay={320}>
          <View
            style={[
              styles.accountMeta,
              {
                paddingHorizontal: responsive.horizontalPadding,
                maxWidth: responsive.contentMaxWidth,
                alignSelf: "center",
                width: "100%",
              },
            ]}
          >
            <Text style={styles.accountMetaText}>@{mockCurrentUser.username}</Text>
            <Text style={styles.accountMetaText}>Level {mockCurrentUser.level}</Text>
          </View>
        </AnimatedEntrance>
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
    paddingBottom: spacing.md,
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
    top: 52,
    flexDirection: "row",
  },
  headerIcon: {
    marginLeft: spacing.sm,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(26,26,26,0.62)",
    borderWidth: 1,
    borderColor: "rgba(245,245,245,0.2)",
  },
  profileBlock: {
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
    justifyContent: "space-between",
  },
  statCard: {
    width: "24%",
    marginBottom: 12,
    alignItems: "center",
  },
  statIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 999,
    backgroundColor: "#242424",
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  statValue: {
    color: colors.text,
    fontWeight: "800",
    fontSize: 20,
    marginTop: 7,
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
    justifyContent: "space-between",
  },
  myGroupCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#242424",
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    padding: 12,
    marginBottom: spacing.sm,
  },
  myGroupThumb: {
    width: 62,
    height: 62,
    borderRadius: 12,
    marginRight: spacing.md,
  },
  myGroupInfo: {
    flex: 1,
  },
  myGroupTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  myGroupName: {
    color: colors.text,
    fontWeight: "800",
    fontSize: 14,
    flex: 1,
    marginRight: spacing.sm,
  },
  myGroupMeta: {
    color: colors.textSecondary,
    fontSize: 11,
    marginTop: 3,
    marginBottom: spacing.sm,
  },
  groupLeaveButton: {
    alignSelf: "flex-start",
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: "#2A2A2A",
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
    alignItems: "center",
    justifyContent: "center",
  },
  groupOptionsButton: {
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: "#2A2A2A",
    alignItems: "center",
    justifyContent: "center",
  },
  groupLeaveButtonText: {
    color: colors.textSecondary,
    fontWeight: "700",
    fontSize: 11,
  },
  emptyGroups: {
    backgroundColor: "#242424",
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    paddingVertical: spacing.md,
    alignItems: "center",
  },
  emptyGroupsText: {
    color: colors.textSecondary,
    fontSize: 12,
  },
  achievementCard: {
    width: "48.5%",
    marginBottom: 12,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderRadius: 16,
    minHeight: 112,
    paddingVertical: 12,
    backgroundColor: "#242424",
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
    textAlign: "center",
  },
  achievementRarity: {
    fontSize: 11,
    marginTop: 2,
    textTransform: "uppercase",
    textAlign: "center",
  },
  collectionTabs: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  collectionTabButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: "#242424",
    alignItems: "center",
    justifyContent: "center",
  },
  collectionTabButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  collectionTabText: {
    color: colors.textSecondary,
    fontWeight: "800",
    fontSize: 13,
  },
  collectionTabTextActive: {
    color: "#1A1A1A",
  },
  gamesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  gameCard: {
    width: "31.5%",
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
    marginTop: 4,
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
