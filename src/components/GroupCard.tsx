import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import React from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { Text } from "react-native-paper";
import { Group } from "../lib/mockData";
import { useResponsive } from "../lib/responsive";
import { colors, spacing } from "../lib/theme";

// GroupCard: Shows group info, members, join button
// Backend integration: onJoin() sends POST /api/groups/{id}/join in Phase B

interface GroupCardProps {
  group: Group;
  onPress?: () => void;
  onJoin?: () => void;
  isJoined?: boolean;
}

export function GroupCard({
  group,
  onPress,
  onJoin,
  isJoined = false,
}: GroupCardProps) {
  const responsive = useResponsive();
  const modeColor = group.mode === "ranked" ? colors.primary : colors.secondary;

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole={onPress ? "button" : undefined}
      accessibilityLabel={`${group.name}, ${group.game}, ${group.memberCount} members`}
      accessibilityHint={onPress ? "Open group details" : undefined}
      style={({ pressed }) => [
        styles.card,
        {
          borderRadius: responsive.cardRadius - 4,
          padding: responsive.cardPadding,
        },
        pressed && styles.cardPressed,
      ]}
    >
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Text style={[styles.title, { fontSize: responsive.bodySize + 2 }]}>{group.name}</Text>
          <Text style={[styles.game, { fontSize: responsive.bodySmallSize }]}>{group.game}</Text>
        </View>
        <View style={[styles.modeBadge, { backgroundColor: modeColor }]}>
          <Text style={styles.modeText}>
            {group.mode === "ranked" ? "⭐" : "😄"}
          </Text>
        </View>
      </View>

      <View style={styles.info}>
        <View style={styles.infoItem}>
          <MaterialCommunityIcons
            name="account-group"
            size={16}
            color={colors.primary}
          />
          <Text style={[styles.infoText, { fontSize: responsive.bodySmallSize }]}>
            {group.memberCount} members
          </Text>
        </View>

        {group.micRequired && (
          <View style={styles.infoItem}>
            <MaterialCommunityIcons
              name="microphone"
              size={16}
              color={colors.primary}
            />
            <Text style={[styles.infoText, { fontSize: responsive.bodySmallSize }]}>
              Mic required
            </Text>
          </View>
        )}

        {group.minRank && (
          <View style={styles.infoItem}>
            <Text style={[styles.infoText, { fontSize: responsive.bodySmallSize }]}>
              {group.minRank} - {group.maxRank || "Max"}
            </Text>
          </View>
        )}
      </View>

      <Text
        style={[
          styles.description,
          {
            fontSize: responsive.bodySmallSize,
            lineHeight: Math.round(responsive.bodySize * 1.25),
          },
        ]}
        numberOfLines={2}
      >
        {group.description}
      </Text>

      <Pressable
        onPress={(event) => {
          event.stopPropagation();
          onJoin?.();
        }}
        accessibilityRole="button"
        accessibilityLabel={isJoined ? `${group.name} joined` : `Join ${group.name}`}
        accessibilityState={{ selected: isJoined }}
        style={({ pressed }) => [
          styles.joinButton,
          {
            minHeight: responsive.buttonHeightSmall,
            minWidth: responsive.touchTargetMin,
          },
          isJoined && styles.joinedButton,
          pressed && styles.buttonPressed,
        ]}
      >
        <Text
          style={[
            styles.joinButtonText,
            { fontSize: responsive.bodySmallSize },
            isJoined && styles.joinedButtonText,
          ]}
        >
          {isJoined ? "✓ Joined" : "Join"}
        </Text>
      </Pressable>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardPressed: {
    opacity: 0.8,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: spacing.md,
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "600",
    marginBottom: spacing.xs,
  },
  game: {
    color: colors.textMuted,
    fontSize: 12,
  },
  modeBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 6,
  },
  modeText: {
    fontSize: 14,
  },
  info: {
    flexDirection: "row",
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  infoItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
  infoText: {
    color: colors.textMuted,
    fontSize: 12,
  },
  description: {
    color: colors.text,
    fontSize: 12,
    lineHeight: 16,
    marginBottom: spacing.md,
  },
  joinButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  joinedButton: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  joinButtonText: {
    color: colors.background,
    fontWeight: "600",
    fontSize: 12,
  },
  joinedButtonText: {
    color: colors.primary,
  },
  buttonPressed: {
    opacity: 0.7,
  },
});
