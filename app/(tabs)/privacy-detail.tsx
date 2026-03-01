import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import React, { useState } from "react";
import { FlatList, Pressable, StyleSheet, View } from "react-native";
import { Switch, Text } from "react-native-paper";
import { Header } from "../../src/components/ui/Header";
import { Screen } from "../../src/components/ui/Screen";
import { useResponsive } from "../../src/lib/responsive";
import { colors, spacing } from "../../src/lib/theme";

interface BlockedUser {
  id: string;
  username: string;
  avatar: string;
}

export default function PrivacyDetailScreen() {
  const responsive = useResponsive();
  const [profilePublic, setProfilePublic] = useState(true);
  const [allowFriendRequests, setAllowFriendRequests] = useState(true);
  const [allowGroupInvites, setAllowGroupInvites] = useState(true);
  const [allowMessages, setAllowMessages] = useState(true);
  const [showOnlineStatus, setShowOnlineStatus] = useState(true);
  const [allowDataCollection, setAllowDataCollection] = useState(false);

  const [blockedUsers, setBlockedUsers] = useState<BlockedUser[]>([
    { id: "1", username: "ToxicPlayer123", avatar: "😠" },
    { id: "2", username: "Spammer99", avatar: "🤖" },
  ]);

  const handleUnblock = (userId: string) => {
    setBlockedUsers((prev) => prev.filter((user) => user.id !== userId));
  };

  return (
    <Screen scrollable>
      <Header title="Privacy Settings" showBackButton />

      <View style={styles.sectionContainer}>
        <Text
          accessibilityRole="header"
          style={[styles.sectionLabel, { fontSize: responsive.bodySize }]}
        >
          Profile Visibility
        </Text>
        <SettingRow
          name="Public Profile"
          description="Others can view your profile"
          value={profilePublic}
          onValueChange={setProfilePublic}
        />
        <SettingRow
          name="Show Online Status"
          description="Let friends see when you're online"
          value={showOnlineStatus}
          onValueChange={setShowOnlineStatus}
        />
        <SettingRow
          name="Allow Friend Requests"
          description="Let anyone send you friend requests"
          value={allowFriendRequests}
          onValueChange={setAllowFriendRequests}
        />
        <SettingRow
          name="Allow Group Invites"
          description="Let friends invite you to groups"
          value={allowGroupInvites}
          onValueChange={setAllowGroupInvites}
        />
        <SettingRow
          name="Allow Direct Messages"
          description="Let anyone message you directly"
          value={allowMessages}
          onValueChange={setAllowMessages}
        />
      </View>

      <View style={styles.sectionContainer}>
        <Text
          accessibilityRole="header"
          style={[styles.sectionLabel, { fontSize: responsive.bodySize }]}
        >
          Data & Analytics
        </Text>
        <SettingRow
          name="Allow Analytics"
          description="Help us improve with usage analytics"
          value={allowDataCollection}
          onValueChange={setAllowDataCollection}
        />
      </View>

      <View style={styles.sectionContainer}>
        <View style={styles.blockedHeader}>
          <Text
            accessibilityRole="header"
            style={[styles.sectionLabel, { fontSize: responsive.bodySize }]}
          >
            Blocked Users
          </Text>
          {blockedUsers.length > 0 && (
            <View style={styles.badgeCount}>
              <Text style={[styles.badgeCountText, { fontSize: responsive.captionSize }]}>
                {blockedUsers.length}
              </Text>
            </View>
          )}
        </View>

        {blockedUsers.length > 0 ? (
          <FlatList
            data={blockedUsers}
            keyExtractor={(user) => user.id}
            scrollEnabled={false}
            renderItem={({ item }) => (
              <View style={styles.blockedUserItem}>
                <View style={styles.blockedUserInfo}>
                  <Text style={[styles.blockedUserAvatar, { fontSize: responsive.sectionTitleSize }]}>
                    {item.avatar}
                  </Text>
                  <Text style={[styles.blockedUserName, { fontSize: responsive.bodySize + 1 }]}>
                    {item.username}
                  </Text>
                </View>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={`Unblock ${item.username}`}
                  onPress={() => handleUnblock(item.id)}
                >
                  <MaterialCommunityIcons
                    name="close"
                    size={20}
                    color={colors.destructive}
                  />
                </Pressable>
              </View>
            )}
          />
        ) : (
          <View style={styles.emptyState}>
            <Text style={[styles.emptyText, { fontSize: responsive.bodySize }]}>No blocked users</Text>
          </View>
        )}
      </View>
    </Screen>
  );
}

function SettingRow({
  name,
  description,
  value,
  onValueChange,
}: {
  name: string;
  description: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
}) {
  const responsive = useResponsive();
  return (
    <View style={styles.settingItem}>
      <View style={styles.settingContent}>
        <Text style={[styles.settingName, { fontSize: responsive.bodySize + 1 }]}>{name}</Text>
        <Text style={[styles.settingDesc, { fontSize: responsive.bodySmallSize }]}>{description}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        color={colors.primary}
        accessibilityLabel={name}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  sectionContainer: {
    borderBottomWidth: 1,
    borderBottomColor: colors.card,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.lg,
  },
  blockedHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.md,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.primary,
    textTransform: "uppercase",
    flex: 1,
  },
  badgeCount: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 12,
  },
  badgeCountText: {
    color: colors.background,
    fontSize: 12,
    fontWeight: "700",
  },
  settingItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.card,
  },
  settingContent: {
    flex: 1,
    marginRight: spacing.md,
  },
  settingName: {
    fontSize: 15,
    fontWeight: "600",
    color: colors.text,
    marginBottom: spacing.xs,
  },
  settingDesc: {
    fontSize: 13,
    color: colors.textMuted,
    lineHeight: 18,
  },
  blockedUserItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.card,
  },
  blockedUserInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  blockedUserAvatar: {
    width: 40,
    height: 40,
    textAlign: "center",
    textAlignVertical: "center",
    borderRadius: 20,
    backgroundColor: colors.card,
    marginRight: spacing.md,
    overflow: "hidden",
    fontSize: 24,
    lineHeight: 40,
  },
  blockedUserName: {
    fontSize: 15,
    fontWeight: "600",
    color: colors.text,
  },
  emptyState: {
    paddingVertical: spacing.lg,
    alignItems: "center",
  },
  emptyText: {
    fontSize: 14,
    color: colors.textMuted,
  },
});
