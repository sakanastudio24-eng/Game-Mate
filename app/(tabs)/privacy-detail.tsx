import React, { useState } from 'react';
import { View, FlatList, StyleSheet } from 'react-native';
import { Switch, List } from 'react-native-paper';
import { Screen } from '../../src/components/ui/Screen';
import { Header } from '../../src/components/ui/Header';
import { colors, spacing } from '../../src/lib/theme';

// PrivacyDetailScreen: Detailed privacy controls and blocked users
// Backend integration: PUT /api/user/privacy/*, GET /api/user/blocked, DELETE /api/user/blocked/{userId} in Phase B

interface BlockedUser {
  id: string;
  username: string;
  avatar: string;
}

export default function PrivacyDetailScreen() {
  const [profilePublic, setProfilePublic] = useState(true);
  const [allowFriendRequests, setAllowFriendRequests] = useState(true);
  const [allowGroupInvites, setAllowGroupInvites] = useState(true);
  const [allowMessages, setAllowMessages] = useState(true);
  const [showOnlineStatus, setShowOnlineStatus] = useState(true);
  const [allowDataCollection, setAllowDataCollection] = useState(false);

  const [blockedUsers, setBlockedUsers] = useState<BlockedUser[]>([
    { id: '1', username: 'ToxicPlayer123', avatar: '😠' },
    { id: '2', username: 'Spammer99', avatar: '🤖' },
  ]);

  const handleUnblock = (userId: string) => {
    setBlockedUsers(prev => prev.filter(u => u.id !== userId));
  };

  return (
    <Screen scrollable>
      <Header title="Privacy Settings" showBackButton onBack={() => {}} />

      {/* Privacy Controls Section */}
      <View style={styles.sectionContainer}>
        <View style={styles.sectionTitle}>
          <View style={styles.sectionLabel}>Profile Visibility</View>
        </View>

        <View style={styles.settingItem}>
          <View style={styles.settingContent}>
            <View style={styles.settingName}>Public Profile</View>
            <View style={styles.settingDesc}>Others can view your profile</View>
          </View>
          <Switch
            value={profilePublic}
            onValueChange={setProfilePublic}
            color={colors.primary}
          />
        </View>

        <View style={styles.settingItem}>
          <View style={styles.settingContent}>
            <View style={styles.settingName}>Show Online Status</View>
            <View style={styles.settingDesc}>Let friends see when you're online</View>
          </View>
          <Switch
            value={showOnlineStatus}
            onValueChange={setShowOnlineStatus}
            color={colors.primary}
          />
        </View>

        <View style={styles.settingItem}>
          <View style={styles.settingContent}>
            <View style={styles.settingName}>Allow Friend Requests</View>
            <View style={styles.settingDesc}>Let anyone send you friend requests</View>
          </View>
          <Switch
            value={allowFriendRequests}
            onValueChange={setAllowFriendRequests}
            color={colors.primary}
          />
        </View>

        <View style={styles.settingItem}>
          <View style={styles.settingContent}>
            <View style={styles.settingName}>Allow Group Invites</View>
            <View style={styles.settingDesc}>Let friends invite you to groups</View>
          </View>
          <Switch
            value={allowGroupInvites}
            onValueChange={setAllowGroupInvites}
            color={colors.primary}
          />
        </View>

        <View style={styles.settingItem}>
          <View style={styles.settingContent}>
            <View style={styles.settingName}>Allow Direct Messages</View>
            <View style={styles.settingDesc}>Let anyone message you directly</View>
          </View>
          <Switch
            value={allowMessages}
            onValueChange={setAllowMessages}
            color={colors.primary}
          />
        </View>
      </View>

      {/* Data & Analytics Section */}
      <View style={styles.sectionContainer}>
        <View style={styles.sectionTitle}>
          <View style={styles.sectionLabel}>Data & Analytics</View>
        </View>

        <View style={styles.settingItem}>
          <View style={styles.settingContent}>
            <View style={styles.settingName}>Allow Analytics</View>
            <View style={styles.settingDesc}>Help us improve with usage analytics</View>
          </View>
          <Switch
            value={allowDataCollection}
            onValueChange={setAllowDataCollection}
            color={colors.primary}
          />
        </View>
      </View>

      {/* Blocked Users Section */}
      <View style={styles.sectionContainer}>
        <View style={styles.sectionTitle}>
          <View style={styles.sectionLabel}>Blocked Users</View>
          {blockedUsers.length > 0 && (
            <View style={styles.badgeCount}>{blockedUsers.length}</View>
          )}
        </View>

        {blockedUsers.length > 0 ? (
          <FlatList
            data={blockedUsers}
            keyExtractor={user => user.id}
            scrollEnabled={false}
            renderItem={({ item }) => (
              <View style={styles.blockedUserItem}>
                <View style={styles.blockedUserInfo}>
                  <View style={styles.blockedUserAvatar}>{item.avatar}</View>
                  <View style={styles.blockedUserName}>{item.username}</View>
                </View>
                <List.Icon
                  icon="close"
                  color={colors.destructive}
                  onPress={() => handleUnblock(item.id)}
                />
              </View>
            )}
          />
        ) : (
          <View style={styles.emptyState}>
            <View style={styles.emptyText}>No blocked users</View>
          </View>
        )}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  sectionContainer: {
    borderBottomWidth: 1,
    borderBottomColor: colors.card,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.lg,
  },
  sectionTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.primary,
    textTransform: 'uppercase',
    flex: 1,
  },
  badgeCount: {
    backgroundColor: colors.primary,
    color: colors.background,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 12,
    fontSize: 12,
    fontWeight: '700',
    overflow: 'hidden',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  settingDesc: {
    fontSize: 13,
    color: colors.textMuted,
    lineHeight: 18,
  },
  blockedUserItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.card,
  },
  blockedUserInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  blockedUserAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.card,
    justifyContent: 'center',
    alignItems: 'center',
    fontSize: 24,
    marginRight: spacing.md,
  },
  blockedUserName: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
  },
  emptyState: {
    paddingVertical: spacing.lg,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: colors.textMuted,
  },
});
