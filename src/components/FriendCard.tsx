import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import React from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { Text } from "react-native-paper";
import { Friend } from "../lib/mockData";
import { useResponsive } from "../lib/responsive";
import { colors, spacing } from "../lib/theme";

// FriendCard: Shows friend info, status, follow/unfollow button
// Backend integration: onFollow() sends POST /api/friends/{id}/follow in Phase B

interface FriendCardProps {
  friend: Friend;
  isFollowing?: boolean;
  onFollow?: () => void;
  onPress?: () => void;
}

export function FriendCard({
  friend,
  isFollowing = false,
  onFollow,
  onPress,
}: FriendCardProps) {
  const responsive = useResponsive();
  const statusColor =
    friend.status === "online" ? colors.online : colors.textMuted;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        {
          borderRadius: responsive.cardRadius - 4,
          padding: responsive.cardPadding,
        },
        pressed && styles.cardPressed,
      ]}
    >
      <View style={styles.content}>
        <Text style={[styles.avatar, { fontSize: responsive.titleSize + 4 }]}>{friend.avatar}</Text>

        <View style={styles.info}>
          <View style={styles.nameRow}>
            <Text style={[styles.name, { fontSize: responsive.bodySize + 1 }]}>{friend.username}</Text>
            <View
              style={[styles.statusDot, { backgroundColor: statusColor }]}
            />
          </View>

          {friend.currentGame && (
            <Text style={[styles.game, { fontSize: responsive.bodySmallSize }]}>
              Playing {friend.currentGame}
            </Text>
          )}

          {friend.lastSeen && friend.status === "offline" && (
            <Text style={[styles.lastSeen, { fontSize: responsive.captionSize }]}>
              Last seen {getTimeAgo(friend.lastSeen)}
            </Text>
          )}

          {friend.gamesPlayed.length > 0 && (
            <Text style={[styles.games, { fontSize: responsive.captionSize }]}>
              {friend.gamesPlayed.slice(0, 2).join(", ")}
              {friend.gamesPlayed.length > 2
                ? ` +${friend.gamesPlayed.length - 2}`
                : ""}
            </Text>
          )}
        </View>
      </View>

      <Pressable
        onPress={(event) => {
          event.stopPropagation();
          onFollow?.();
        }}
        style={({ pressed }) => [
          styles.button,
          {
            width: responsive.touchTargetMin,
            height: responsive.touchTargetMin,
            borderRadius: responsive.touchTargetMin / 2,
          },
          isFollowing && styles.followingButton,
          pressed && styles.buttonPressed,
        ]}
      >
        <MaterialCommunityIcons
          name={isFollowing ? "check" : "plus"}
          size={18}
          color={isFollowing ? colors.primary : colors.background}
        />
      </Pressable>
    </Pressable>
  );
}

function getTimeAgo(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);

  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  return date.toLocaleDateString();
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.sm,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardPressed: {
    opacity: 0.9,
  },
  content: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  avatar: {
    fontSize: 40,
  },
  info: {
    flex: 1,
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    marginBottom: spacing.xs,
  },
  name: {
    color: colors.text,
    fontWeight: "600",
    fontSize: 14,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  game: {
    color: colors.primary,
    fontSize: 12,
    marginBottom: spacing.xs,
  },
  lastSeen: {
    color: colors.textMuted,
    fontSize: 11,
  },
  games: {
    color: colors.textMuted,
    fontSize: 11,
    marginTop: spacing.xs,
  },
  button: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  followingButton: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  buttonPressed: {
    opacity: 0.7,
  },
});
