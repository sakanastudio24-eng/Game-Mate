import React, { useState } from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { Text, Card as PaperCard, SegmentedButtons, Chip } from 'react-native-paper';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { Screen } from '../../src/components/ui/Screen';
import { Header } from '../../src/components/ui/Header';
import { Card } from '../../src/components/ui/Card';
import { Button } from '../../src/components/ui/Button';
import { colors, spacing } from '../../src/lib/theme';

// MatchmakingScreen: Find matched groups
// Backend integration: GET /api/matchmaking/suggestions endpoint in Phase B

interface MatchedGroup {
  id: string;
  game: string;
  players: number;
  yourRank: string;
  averageRank: string;
  playStyle: string;
  region: string;
  trustScore: number;
}

export default function MatchmakingScreen() {
  const [filterType, setFilterType] = useState<'all' | 'active' | 'incoming'>('all');
  const [dismissedGroups, setDismissedGroups] = useState<Set<string>>(new Set());

  const mockMatches: MatchedGroup[] = [
    {
      id: '1',
      game: 'Valorant',
      players: 3,
      yourRank: 'Platinum',
      averageRank: 'Platinum',
      playStyle: 'Competitive',
      region: 'NA East',
      trustScore: 95,
    },
    {
      id: '2',
      game: 'CS:GO',
      players: 4,
      yourRank: 'Gold',
      averageRank: 'Gold',
      playStyle: 'Casual',
      region: 'NA West',
      trustScore: 87,
    },
    {
      id: '3',
      game: 'Apex Legends',
      players: 2,
      yourRank: 'Diamond',
      averageRank: 'Diamond',
      playStyle: 'Ranked',
      region: 'NA East',
      trustScore: 92,
    },
  ];

  const filteredMatches = mockMatches.filter(
    match => !dismissedGroups.has(match.id)
  );

  const dismissMatch = (groupId: string) => {
    setDismissedGroups(prev => new Set([...prev, groupId]));
  };

  const renderMatchCard = (match: MatchedGroup) => (
    <Card style={styles.matchCard} key={match.id}>
      <View style={styles.cardHeader}>
        <View style={styles.gameInfo}>
          <View style={styles.gameIconContainer}>
            <MaterialCommunityIcons
              name="gamepad-variant"
              size={24}
              color={colors.primary}
            />
          </View>
          <View>
            <Text style={styles.gameName}>{match.game}</Text>
            <Text style={styles.playStyle}>{match.playStyle}</Text>
          </View>
        </View>

        <View style={styles.trustScore}>
          <MaterialCommunityIcons
            name="heart"
            size={16}
            color={colors.primary}
          />
          <Text style={styles.trustText}>{match.trustScore}%</Text>
        </View>
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Players</Text>
          <Text style={styles.statValue}>{match.players}/5</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Your Rank</Text>
          <Text style={styles.statValue}>{match.yourRank}</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Avg Rank</Text>
          <Text style={styles.statValue}>{match.averageRank}</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Region</Text>
          <Text style={styles.statValue}>{match.region}</Text>
        </View>
      </View>

      <View style={styles.actionButtons}>
        <Button
          mode="contained"
          onPress={() => {}}
          style={{ flex: 1 }}
          size="small"
          label="Join"
        />
        <Button
          mode="outlined"
          onPress={() => dismissMatch(match.id)}
          style={{ flex: 1, marginLeft: spacing.sm }}
          size="small"
          label="Skip"
        />
      </View>
    </Card>
  );

  return (
    <Screen scrollable={false}>
      <Header title="Matchmaking" showBackButton onBack={() => {}} />

      <View style={styles.filterContainer}>
        <SegmentedButtons
          value={filterType}
          onValueChange={val => setFilterType(val as any)}
          buttons={[
            { value: 'all', label: 'All' },
            { value: 'active', label: 'Active' },
            { value: 'incoming', label: 'Incoming' },
          ]}
          style={styles.segmentedButtons}
        />
      </View>

      {filteredMatches.length > 0 ? (
        <FlatList
          data={filteredMatches}
          renderItem={({ item }) => renderMatchCard(item)}
          keyExtractor={item => item.id}
          scrollEnabled={false}
          contentContainerStyle={styles.matchesList}
        />
      ) : (
        <View style={styles.emptyState}>
          <MaterialCommunityIcons
            name="shuffle-variant"
            size={48}
            color={colors.textSecondary}
          />
          <Text style={styles.emptyText}>
            No matches available right now
          </Text>
          <Text style={styles.emptySubtext}>
            Update your preferences to find more groups
          </Text>
        </View>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  filterContainer: {
    marginHorizontal: spacing.md,
    marginVertical: spacing.md,
  },
  segmentedButtons: {
    width: '100%',
  },
  matchesList: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.lg,
  },
  matchCard: {
    marginBottom: spacing.md,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  gameInfo: {
    flexDirection: 'row',
    align: 'center',
    flex: 1,
  },
  gameIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 8,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  gameName: {
    color: colors.text,
    fontWeight: '700',
    fontSize: 16,
  },
  playStyle: {
    color: colors.textSecondary,
    fontSize: 12,
    marginTop: spacing.xs,
  },
  trustScore: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 16,
  },
  trustText: {
    color: colors.primary,
    fontWeight: '600',
    fontSize: 12,
    marginLeft: spacing.xs,
  },
  statsContainer: {
    flexDirection: 'row',
    marginBottom: spacing.lg,
    backgroundColor: colors.surface,
    borderRadius: 8,
    overflow: 'hidden',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  statLabel: {
    color: colors.textSecondary,
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
    marginBottom: spacing.xs,
  },
  statValue: {
    color: colors.text,
    fontWeight: '700',
    fontSize: 14,
  },
  statDivider: {
    width: 1,
    backgroundColor: colors.border,
  },
  actionButtons: {
    flexDirection: 'row',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  emptyText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '600',
    marginTop: spacing.md,
  },
  emptySubtext: {
    color: colors.textSecondary,
    fontSize: 13,
    marginTop: spacing.sm,
  },
});
