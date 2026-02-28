import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text } from 'react-native-paper';
import { Screen } from '../../src/components/ui/Screen';
import { Header } from '../../src/components/ui/Header';
import { Card } from '../../src/components/ui/Card';
import { Button } from '../../src/components/ui/Button';
import { mockFriends } from '../../src/lib/mockData';
import { colors, spacing } from '../../src/lib/theme';

// UserProfileScreen: View another user's profile
// Backend integration: GET /api/users/{id} endpoint in Phase B
// Shows: avatar, name, level, games, stats, follow/message buttons

export default function UserProfileScreen() {
  const user = mockFriends[0]; // Mock: use first friend
  const [isFollowing, setIsFollowing] = useState(false);

  return (
    <Screen scrollable>
      <Header title={user.username} showBackButton onBack={() => {}} />

      {/* User card */}
      <Card style={styles.userCard}>
        <View style={styles.header}>
          <Text style={styles.avatar}>{user.avatar}</Text>
          <View style={styles.info}>
            <Text style={styles.name}>{user.username}</Text>
            <View style={[styles.statusBadge, { backgroundColor: user.status === 'online' ? colors.online : colors.textMuted }]} />
            <Text style={styles.status}>{user.status === 'online' ? 'Online' : 'Offline'}</Text>
          </View>
        </View>

        {user.currentGame && (
          <View style={styles.gameRow}>
            <Text style={styles.gameLabel}>Playing</Text>
            <Text style={styles.gameName}>{user.currentGame}</Text>
          </View>
        )}

        <View style={styles.actions}>
          <Button
            variant={isFollowing ? 'secondary' : 'primary'}
            onPress={() => setIsFollowing(!isFollowing)}
            fullWidth
          >
            {isFollowing ? '✓ Following' : '+ Follow'}
          </Button>
          <Button variant="secondary" fullWidth>
            💬 Message
          </Button>
        </View>
      </Card>

      {/* Games */}
      <Card>
        <Text style={styles.sectionTitle}>Games</Text>
        <View style={styles.gamesList}>
          {user.gamesPlayed.map((game, idx) => (
            <View key={idx} style={styles.gameTag}>
              <Text style={styles.gameTagText}>{game}</Text>
            </View>
          ))}
        </View>
      </Card>

      {/* Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Groups Joined</Text>
          <Text style={styles.statValue}>{user.groupsJoined}</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Level</Text>
          <Text style={styles.statValue}>{user.level || '—'}</Text>
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  userCard: {
    marginBottom: spacing.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  avatar: {
    fontSize: 56,
  },
  info: {
    flex: 1,
  },
  name: {
    color: colors.text,
    fontWeight: '700',
    fontSize: 18,
    marginBottom: spacing.xs,
  },
  statusBadge: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginBottom: spacing.xs,
  },
  status: {
    color: colors.textMuted,
    fontSize: 12,
  },
  gameRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    marginTop: spacing.md,
    marginBottom: spacing.md,
  },
  gameLabel: {
    color: colors.textMuted,
    fontSize: 12,
  },
  gameName: {
    color: colors.primary,
    fontWeight: '600',
    fontSize: 12,
  },
  actions: {
    gap: spacing.sm,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
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
  statsContainer: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.lg,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  statLabel: {
    color: colors.textMuted,
    fontSize: 11,
    marginBottom: spacing.sm,
  },
  statValue: {
    color: colors.primary,
    fontWeight: '700',
    fontSize: 18,
  },
});
