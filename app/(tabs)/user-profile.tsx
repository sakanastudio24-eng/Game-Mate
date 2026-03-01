import { useLocalSearchParams, useRouter } from "expo-router";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import React, { useMemo, useState } from "react";
import { Image, StyleSheet, View } from "react-native";
import { Text } from "react-native-paper";
import { Button } from "../../src/components/ui/Button";
import { Card } from "../../src/components/ui/Card";
import { Header } from "../../src/components/ui/Header";
import { Screen } from "../../src/components/ui/Screen";
import { mockFriends } from "../../src/lib/mockData";
import { useResponsive } from "../../src/lib/responsive";
import { colors, spacing } from "../../src/lib/theme";

type ProfileStatus = "online" | "offline" | "in-game";

export default function UserProfileScreen() {
  const router = useRouter();
  const responsive = useResponsive();
  const params = useLocalSearchParams<{
    userId?: string;
    name?: string;
    avatar?: string;
    status?: string;
    currentGame?: string;
    level?: string;
  }>();

  const matchedUser = mockFriends.find((item) => item.id === params.userId);
  const [isFollowing, setIsFollowing] = useState(Boolean(matchedUser?.isFriend));

  const profile = useMemo(() => {
    const parsedStatus: ProfileStatus =
      params.status === "online" || params.status === "in-game" ? params.status : "offline";

    if (matchedUser) {
      return {
        id: matchedUser.id,
        username: matchedUser.username,
        rank: matchedUser.rank,
        status: matchedUser.status,
        currentGame: matchedUser.currentGame,
        avatar: matchedUser.avatar ?? "🎮",
        level: matchedUser.level ?? 1,
        groupsJoined: matchedUser.groupsJoined ?? 0,
        gamesPlayed: matchedUser.gamesPlayed,
      };
    }

    return {
      id: params.userId ?? "unknown-user",
      username: params.name ?? "Player",
      rank: "Unranked",
      status: parsedStatus,
      currentGame: params.currentGame,
      avatar: params.avatar ?? "🎮",
      level: Number(params.level ?? 1),
      groupsJoined: 0,
      gamesPlayed: params.currentGame ? [params.currentGame] : ["Unknown"],
    };
  }, [matchedUser, params.avatar, params.currentGame, params.level, params.name, params.status, params.userId]);

  const statusText =
    profile.status === "online"
      ? "Online"
      : profile.status === "in-game"
        ? "In game"
        : "Offline";
  const statusColor =
    profile.status === "online" || profile.status === "in-game"
      ? colors.online
      : colors.textMuted;

  const hasImageAvatar = typeof profile.avatar === "string" && /^https?:\/\//.test(profile.avatar);

  return (
    <Screen scrollable>
      <Header title={profile.username} showBackButton />

      <Card style={styles.heroCard}>
        <View style={styles.heroTopRow}>
          <View style={styles.avatarWrap}>
            {hasImageAvatar ? (
              <Image source={{ uri: profile.avatar }} style={styles.avatarImage} />
            ) : (
              <View style={styles.avatarFallback}>
                <Text style={[styles.avatarEmoji, { fontSize: responsive.titleSize + 10 }]}>
                  {profile.avatar}
                </Text>
              </View>
            )}
            <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
          </View>

          <View style={styles.heroInfo}>
            <Text style={[styles.username, { fontSize: responsive.sectionTitleSize + 2 }]}>
              {profile.username}
            </Text>
            <Text style={[styles.rank, { fontSize: responsive.bodySize }]}>
              {profile.rank}
            </Text>
            <View style={styles.statusRow}>
              <MaterialCommunityIcons name="circle" size={8} color={statusColor} />
              <Text style={[styles.statusText, { fontSize: responsive.bodySmallSize }]}>
                {statusText}
              </Text>
            </View>
            {profile.currentGame ? (
              <Text style={[styles.currentGame, { fontSize: responsive.bodySmallSize }]}>
                Playing {profile.currentGame}
              </Text>
            ) : null}
          </View>
        </View>

        <View style={styles.actionRow}>
          <Button
            variant={isFollowing ? "secondary" : "primary"}
            onPress={() => setIsFollowing((prev) => !prev)}
            fullWidth
          >
            {isFollowing ? "Following" : "Follow"}
          </Button>
          <Button
            variant="secondary"
            fullWidth
            onPress={() => router.push(`/(tabs)/chat?userId=${profile.id}` as any)}
          >
            Message
          </Button>
        </View>
      </Card>

      <View style={styles.statsGrid}>
        <View style={styles.statCard}>
          <MaterialCommunityIcons name="account-star-outline" size={18} color={colors.primary} />
          <Text style={[styles.statValue, { fontSize: responsive.sectionTitleSize }]}>
            {profile.level}
          </Text>
          <Text style={[styles.statLabel, { fontSize: responsive.captionSize }]}>Level</Text>
        </View>
        <View style={styles.statCard}>
          <MaterialCommunityIcons name="account-group-outline" size={18} color="#66BAFF" />
          <Text style={[styles.statValue, { fontSize: responsive.sectionTitleSize }]}>
            {profile.groupsJoined}
          </Text>
          <Text style={[styles.statLabel, { fontSize: responsive.captionSize }]}>Groups</Text>
        </View>
        <View style={styles.statCard}>
          <MaterialCommunityIcons name="controller-classic-outline" size={18} color="#4ADE80" />
          <Text style={[styles.statValue, { fontSize: responsive.sectionTitleSize }]}>
            {profile.gamesPlayed.length}
          </Text>
          <Text style={[styles.statLabel, { fontSize: responsive.captionSize }]}>Games</Text>
        </View>
      </View>

      <Card style={styles.gamesCard}>
        <Text style={[styles.sectionTitle, { fontSize: responsive.bodySize }]}>Games</Text>
        <View style={styles.gamesList}>
          {profile.gamesPlayed.map((game, idx) => (
            <View key={`${game}-${idx}`} style={styles.gameTag}>
              <Text style={[styles.gameTagText, { fontSize: responsive.captionSize }]}>{game}</Text>
            </View>
          ))}
        </View>
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  heroCard: {
    marginBottom: spacing.lg,
  },
  heroTopRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  avatarWrap: {
    width: 86,
    height: 86,
    borderRadius: 43,
    position: "relative",
  },
  avatarImage: {
    width: "100%",
    height: "100%",
    borderRadius: 43,
    borderWidth: 2,
    borderColor: colors.border,
  },
  avatarFallback: {
    width: "100%",
    height: "100%",
    borderRadius: 43,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#242424",
    borderWidth: 2,
    borderColor: colors.border,
  },
  avatarEmoji: {
    color: colors.text,
  },
  statusDot: {
    position: "absolute",
    right: 0,
    bottom: 2,
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: colors.card,
  },
  heroInfo: {
    flex: 1,
  },
  username: {
    color: colors.text,
    fontWeight: "800",
  },
  rank: {
    color: colors.textSecondary,
    marginTop: 2,
    fontWeight: "600",
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: spacing.xs,
  },
  statusText: {
    color: colors.textSecondary,
    marginLeft: 6,
  },
  currentGame: {
    color: colors.primary,
    marginTop: spacing.xs,
    fontWeight: "600",
  },
  actionRow: {
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  statsGrid: {
    flexDirection: "row",
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  statCard: {
    flex: 1,
    backgroundColor: "#242424",
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: spacing.md,
  },
  statValue: {
    color: colors.text,
    fontWeight: "800",
    marginTop: 6,
  },
  statLabel: {
    color: colors.textSecondary,
    marginTop: 2,
    fontWeight: "600",
  },
  gamesCard: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    color: colors.text,
    fontWeight: "800",
    marginBottom: spacing.sm,
  },
  gamesList: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  gameTag: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  gameTagText: {
    color: colors.text,
    fontWeight: "700",
  },
});
