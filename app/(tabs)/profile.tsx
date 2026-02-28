import React from 'react';
import { View, StyleSheet, ScrollView, Pressable } from 'react-native';
import { Text, List } from 'react-native-paper';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { Screen } from '../../src/components/ui/Screen';
import { Header } from '../../src/components/ui/Header';
import { Card } from '../../src/components/ui/Card';
import { mockCurrentUser } from '../../src/lib/mockData';
import { colors, spacing, typography } from '../../src/lib/theme';

// ProfileScreen: Tab 4 - User profile, stats, settings
// Backend integration: GET /api/me endpoint in Phase B
// Navigates to settings, edit profile, QR code screens

export default function ProfileScreen() {
  return (
    <Screen scrollable>
      <Header
        title="Profile"
        rightAction={{
          icon: 'cog',
          onPress: () => {},
          label: 'Settings',
        }}
      />

      {/* User card */}
      <Card variant="default" style={styles.userCard}>
        <View style={styles.userHeader}>
          <Text style={styles.userAvatar}>{mockCurrentUser.avatar}</Text>
          <View style={styles.userInfo}>
            <Text style={styles.username}>{mockCurrentUser.username}</Text>
            <Text style={styles.bio}>{mockCurrentUser.bio}</Text>
          </View>
        </View>

        {/* QR button */}
        <Pressable style={({ pressed }) => [styles.qrButton, pressed && { opacity: 0.7 }]}>
          <MaterialCommunityIcons name="qrcode" size={20} color={colors.primary} />
          <Text style={styles.qrButtonText}>Show QR Code</Text>
        </Pressable>
      </Card>

      {/* Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{mockCurrentUser.level}</Text>
          <Text style={styles.statLabel}>Level</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{mockCurrentUser.groupsJoined}</Text>
          <Text style={styles.statLabel}>Groups</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{mockCurrentUser.gamesPlayed.length}</Text>
          <Text style={styles.statLabel}>Games</Text>
        </View>
      </View>

      {/* Games */}
      <Card variant="default">
        <Text style={styles.sectionTitle}>Favorite Games</Text>
        <View style={styles.gamesList}>
          {mockCurrentUser.gamesPlayed.map((game, idx) => (
            <View key={idx} style={styles.gameTag}>
              <Text style={styles.gameTagText}>{game}</Text>
            </View>
          ))}
        </View>
      </Card>

      {/* Settings menu */}
      <Card variant="default" style={styles.settingsCard}>
        <Text style={styles.sectionTitle}>Settings</Text>

        <List.Item
          title="Edit Profile"
          left={() => <MaterialCommunityIcons name="pencil" size={20} color={colors.primary} />}
          titleStyle={styles.listTitle}
          onPress={() => {}}
        />

        <List.Item
          title="Account Settings"
          left={() => <MaterialCommunityIcons name="lock" size={20} color={colors.primary} />}
          titleStyle={styles.listTitle}
          onPress={() => {}}
        />

        <List.Item
          title="Notifications"
          left={() => <MaterialCommunityIcons name="bell" size={20} color={colors.primary} />}
          titleStyle={styles.listTitle}
          onPress={() => {}}
        />

        <List.Item
          title="Privacy & Security"
          left={() => <MaterialCommunityIcons name="shield" size={20} color={colors.primary} />}
          titleStyle={styles.listTitle}
          onPress={() => {}}
        />

        <List.Item
          title="Help & Support"
          left={() => <MaterialCommunityIcons name="help-circle" size={20} color={colors.primary} />}
          titleStyle={styles.listTitle}
          onPress={() => {}}
        />

        <List.Item
          title="Logout"
          left={() => <MaterialCommunityIcons name="logout" size={20} color={colors.destructive} />}
          titleStyle={[styles.listTitle, { color: colors.destructive }]}
          onPress={() => {}}
        />
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  userCard: {
    marginBottom: spacing.lg,
  },
  userHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  userAvatar: {
    fontSize: 56,
  },
  userInfo: {
    flex: 1,
  },
  username: {
    color: colors.text,
    fontWeight: '700',
    fontSize: 18,
    marginBottom: spacing.xs,
  },
  bio: {
    color: colors.textMuted,
    fontSize: 12,
  },
  qrButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  qrButtonText: {
    color: colors.primary,
    fontWeight: '600',
    fontSize: 14,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: spacing.lg,
  },
  statCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    flex: 1,
    marginHorizontal: spacing.xs,
  },
  statValue: {
    color: colors.primary,
    fontWeight: '700',
    fontSize: 20,
    marginBottom: spacing.xs,
  },
  statLabel: {
    color: colors.textMuted,
    fontSize: 12,
  },
  sectionTitle: {
    color: colors.text,
    fontWeight: '700',
    fontSize: 14,
    marginBottom: spacing.md,
  },
  gamesList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  gameTag: {
    backgroundColor: colors.background,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  gameTagText: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: '600',
  },
  settingsCard: {
    marginBottom: spacing.xl,
  },
  listTitle: {
    color: colors.text,
    fontSize: 14,
  },
});
