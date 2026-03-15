import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useFocusEffect } from "@react-navigation/native";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useMemo, useState } from "react";
import { ActivityIndicator, Image, StyleSheet, View } from "react-native";
import { Text } from "react-native-paper";

import { getProfileByUsername, type PublicProfileData } from "../../services/profile";
import { Button } from "../../src/components/ui/Button";
import { Card } from "../../src/components/ui/Card";
import { Header } from "../../src/components/ui/Header";
import { Screen } from "../../src/components/ui/Screen";
import { useAuth } from "../../src/context/AuthContext";
import { SESSION_EXPIRED_MESSAGE, isSessionExpiredMessage } from "../../src/lib/auth-messages";
import { CURRENT_USER_AVATAR } from "../../src/lib/current-user";
import { mockFriends } from "../../src/lib/mockData";
import { useResponsive } from "../../src/lib/responsive";
import { colors, spacing } from "../../src/lib/theme";

type ProfileStatus = "online" | "offline" | "in-game";

export default function UserProfileScreen() {
  const router = useRouter();
  const responsive = useResponsive();
  const { accessToken, expireSession } = useAuth();
  const params = useLocalSearchParams<{
    userId?: string;
    name?: string;
    avatar?: string;
    bio?: string;
    status?: string;
    currentGame?: string;
    level?: string;
    username?: string;
    source?: string;
    groupId?: string;
  }>();
  const backTarget = useMemo(() => {
    if (params.source === "qr") return "/(tabs)/qr-code";
    if (params.source === "feed") return "/(tabs)/news";
    if (params.source === "group") {
      if (typeof params.groupId === "string" && params.groupId) {
        return (`/(tabs)/group-detail?groupId=${params.groupId}` as any);
      }
      return "/(tabs)/groups";
    }
    return "/(tabs)/social";
  }, [params.groupId, params.source]);

  const routeUsername = typeof params.username === "string" ? params.username.trim() : "";
  const isRemoteProfileMode = Boolean(routeUsername);
  const matchedUser = mockFriends.find((item) => item.id === params.userId);
  const [isFollowing, setIsFollowing] = useState(Boolean(matchedUser?.isFriend));
  const [remoteProfile, setRemoteProfile] = useState<PublicProfileData | null>(null);
  const [remoteError, setRemoteError] = useState<string | null>(null);
  const [remoteLoading, setRemoteLoading] = useState(false);
  const isSessionExpiredError = isSessionExpiredMessage(remoteError);

  const loadRemoteProfile = useCallback(async () => {
    if (!isRemoteProfileMode) return;
    if (!accessToken) {
      setRemoteError(SESSION_EXPIRED_MESSAGE);
      return;
    }

    setRemoteLoading(true);
    setRemoteError(null);
    try {
      const profile = await getProfileByUsername(accessToken, routeUsername);
      setRemoteProfile(profile);
    } catch (error) {
      setRemoteError(error instanceof Error ? error.message : "Unable to load profile.");
    } finally {
      setRemoteLoading(false);
    }
  }, [accessToken, isRemoteProfileMode, routeUsername]);

  useFocusEffect(
    useCallback(() => {
      if (!isRemoteProfileMode) return undefined;
      void loadRemoteProfile();
      return undefined;
    }, [isRemoteProfileMode, loadRemoteProfile]),
  );

  const profile = useMemo(() => {
    if (isRemoteProfileMode && remoteProfile) {
      return {
        mode: "remote" as const,
        id: params.userId ?? remoteProfile.username,
        username: remoteProfile.username,
        avatar: remoteProfile.avatar_url?.trim() || CURRENT_USER_AVATAR,
        bio: remoteProfile.bio?.trim() || "No bio yet.",
        posts: remoteProfile.stats?.posts ?? 0,
        friends: remoteProfile.stats?.friends ?? 0,
        groups: remoteProfile.stats?.groups ?? 0,
        favoriteGames: remoteProfile.favorite_games?.length ? remoteProfile.favorite_games : [],
      };
    }

    const parsedStatus: ProfileStatus =
      params.status === "online" || params.status === "in-game" ? params.status : "offline";

    if (matchedUser) {
      return {
        mode: "legacy" as const,
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
      mode: "legacy" as const,
      id: params.userId ?? "unknown-user",
      username: params.name ?? "Player",
      bio:
        typeof params.bio === "string" && params.bio.trim()
          ? params.bio.trim()
          : "No bio yet.",
      rank: "Unranked",
      status: parsedStatus,
      currentGame: params.currentGame,
      avatar: params.avatar ?? "🎮",
      level: Number(params.level ?? 1),
      groupsJoined: 0,
      gamesPlayed: params.currentGame ? [params.currentGame] : ["Unknown"],
    };
  }, [
    isRemoteProfileMode,
    matchedUser,
    params.avatar,
    params.bio,
    params.currentGame,
    params.level,
    params.name,
    params.status,
    params.userId,
    remoteProfile,
  ]);

  const hasImageAvatar = typeof profile.avatar === "string" && /^https?:\/\//.test(profile.avatar);
  const statusText =
    profile.mode === "legacy"
      ? profile.status === "online"
        ? "Online"
        : profile.status === "in-game"
          ? "In game"
          : "Offline"
      : "GameMate profile";
  const statusColor =
    profile.mode === "legacy"
      ? profile.status === "online" || profile.status === "in-game"
        ? colors.online
        : colors.textMuted
      : colors.primary;

  const statCards =
    profile.mode === "remote"
      ? [
          { label: "Posts", value: profile.posts, icon: "play-box-multiple-outline", color: colors.info },
          { label: "Friends", value: profile.friends, icon: "account-multiple-outline", color: colors.highlight },
          { label: "Groups", value: profile.groups, icon: "account-group-outline", color: colors.primary },
        ]
      : [
          { label: "Level", value: profile.level, icon: "account-star-outline", color: colors.primary },
          { label: "Groups", value: profile.groupsJoined, icon: "account-group-outline", color: colors.info },
          {
            label: "Games",
            value: profile.gamesPlayed.length,
            icon: "controller-classic-outline",
            color: colors.online,
          },
        ];

  return (
    <Screen scrollable>
      <Header title={profile.username} showBackButton onBack={() => router.replace(backTarget)} />

      {isRemoteProfileMode && remoteLoading && !remoteProfile ? (
        <Card style={styles.stateCard}>
          <ActivityIndicator color={colors.primary} />
          <Text style={[styles.stateText, { fontSize: responsive.bodySize }]}>Loading profile...</Text>
        </Card>
      ) : null}

      {isRemoteProfileMode && remoteError && !remoteProfile ? (
        <Card style={styles.stateCard}>
          <MaterialCommunityIcons name="alert-circle-outline" size={32} color={colors.primary} />
          <Text style={[styles.stateText, { fontSize: responsive.bodySize }]}>{remoteError}</Text>
          <Button
            variant="primary"
            onPress={() => {
              if (isSessionExpiredError) {
                void expireSession().finally(() => {
                  router.replace("/login" as any);
                });
                return;
              }
              void loadRemoteProfile();
            }}
          >
            {isSessionExpiredError ? "Sign In" : "Retry"}
          </Button>
        </Card>
      ) : null}

      {(!isRemoteProfileMode || remoteProfile) && (
        <>
          <Card style={styles.heroCard}>
            <View style={styles.heroTopRow}>
              <View style={styles.avatarWrap}>
                {hasImageAvatar ? (
                  <Image source={{ uri: profile.avatar }} style={styles.avatarImage} />
                ) : (
                  <View style={styles.avatarFallback}>
                    <Text style={[styles.avatarEmoji, { fontSize: responsive.titleSize + 10 }]}>{profile.avatar}</Text>
                  </View>
                )}
                <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
              </View>

              <View style={styles.heroInfo}>
                <Text style={[styles.username, { fontSize: responsive.sectionTitleSize + 2 }]}>{profile.username}</Text>
                {profile.mode === "legacy" ? (
                  <Text style={[styles.rank, { fontSize: responsive.bodySize }]}>{profile.rank}</Text>
                ) : null}
                <View style={styles.statusRow}>
                  <MaterialCommunityIcons name="circle" size={8} color={statusColor} />
                  <Text style={[styles.statusText, { fontSize: responsive.bodySmallSize }]}>{statusText}</Text>
                </View>
                {profile.mode === "legacy" && profile.currentGame ? (
                  <Text style={[styles.currentGame, { fontSize: responsive.bodySmallSize }]}>
                    Playing {profile.currentGame}
                  </Text>
                ) : null}
                {profile.mode === "remote" ? (
                  <Text style={[styles.bioPreview, { fontSize: responsive.bodySmallSize }]}>{profile.bio}</Text>
                ) : null}
              </View>
            </View>

            {profile.mode === "legacy" ? (
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
            ) : null}
          </Card>

          <View style={styles.statsGrid}>
            {statCards.map((stat) => (
              <View key={stat.label} style={styles.statCard}>
                <MaterialCommunityIcons name={stat.icon as any} size={18} color={stat.color} />
                <Text style={[styles.statValue, { fontSize: responsive.sectionTitleSize }]}>{stat.value}</Text>
                <Text style={[styles.statLabel, { fontSize: responsive.captionSize }]}>{stat.label}</Text>
              </View>
            ))}
          </View>

          {profile.mode === "remote" ? (
            <>
              <Card style={styles.bioCard}>
                <Text style={[styles.sectionTitle, { fontSize: responsive.bodySize }]}>Bio</Text>
                <Text style={[styles.bioBody, { fontSize: responsive.bodySmallSize }]}>{profile.bio}</Text>
              </Card>

              <Card style={styles.gamesCard}>
                <Text style={[styles.sectionTitle, { fontSize: responsive.bodySize }]}>Favorite Games</Text>
                <View style={styles.gamesList}>
                  {profile.favoriteGames.length ? (
                    profile.favoriteGames.map((game, idx) => (
                      <View key={`${game}-${idx}`} style={styles.gameTag}>
                        <Text style={[styles.gameTagText, { fontSize: responsive.captionSize }]}>{game}</Text>
                      </View>
                    ))
                  ) : (
                    <Text style={[styles.emptyText, { fontSize: responsive.bodySmallSize }]}>
                      No favorite games listed yet.
                    </Text>
                  )}
                </View>
              </Card>
            </>
          ) : (
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
          )}
        </>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  heroCard: {
    marginBottom: spacing.lg,
  },
  stateCard: {
    alignItems: "center",
    gap: spacing.md,
    marginBottom: spacing.lg,
    paddingVertical: spacing.xl,
  },
  stateText: {
    color: colors.text,
    textAlign: "center",
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
    backgroundColor: colors.surfaceRaised,
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
  bioPreview: {
    color: colors.textSecondary,
    marginTop: spacing.sm,
    lineHeight: 18,
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
    backgroundColor: colors.surfaceRaised,
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
  bioCard: {
    marginBottom: spacing.lg,
  },
  bioBody: {
    color: colors.textSecondary,
    lineHeight: 20,
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
  emptyText: {
    color: colors.textMuted,
  },
});
