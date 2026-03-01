import { useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
import { FlatList, StyleSheet, View } from "react-native";
import { Searchbar } from "react-native-paper";
import { GroupCard } from "../../src/components/GroupCard";
import { Chip } from "../../src/components/ui/Chip";
import { Header } from "../../src/components/ui/Header";
import { Screen } from "../../src/components/ui/Screen";
import { androidKeyboardCompatProps } from "../../src/lib/androidInput";
import { mockGroups } from "../../src/lib/mockData";
import { useResponsive } from "../../src/lib/responsive";
import { colors, spacing } from "../../src/lib/theme";

// DiscoverGroupsScreen: Browse and discover new groups
// Backend integration: GET /api/groups/discover?search={query}&filter={filter} in Phase B
// Features: Search, filter by game/mode, discover recommendations

export default function DiscoverGroupsScreen() {
  const router = useRouter();
  const responsive = useResponsive();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterGame, setFilterGame] = useState<string | null>(null);
  const [joinedGroups, setJoinedGroups] = useState<string[]>([]);

  // Unique games from mock data
  const games = Array.from(new Set(mockGroups.map((g) => g.game)));

  // Filter groups
  const filteredGroups = useMemo(() => {
    return mockGroups.filter((group) => {
      const matchesSearch =
        group.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        group.game.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesGame = !filterGame || group.game === filterGame;
      return matchesSearch && matchesGame;
    });
  }, [searchQuery, filterGame]);

  const handleJoin = (groupId: string) => {
    setJoinedGroups((prev) =>
      prev.includes(groupId)
        ? prev.filter((id) => id !== groupId)
        : [...prev, groupId],
    );
  };

  return (
    <Screen scrollable={false}>
      <Header title="Discover Groups" showBackButton />

      {/* Search */}
      <Searchbar
        placeholder="Search groups..."
        onChangeText={setSearchQuery}
        value={searchQuery}
        {...androidKeyboardCompatProps}
        style={[styles.searchbar, { borderRadius: responsive.searchRadius }]}
        inputStyle={[styles.searchInput, { fontSize: responsive.bodySize }]}
        placeholderTextColor={colors.textMuted}
        iconColor={colors.primary}
      />

      {/* Game filters */}
      <View style={styles.filterContainer}>
        <Chip
          label="All Games"
          selected={!filterGame}
          onPress={() => setFilterGame(null)}
          style={styles.filterChip}
          mode={!filterGame ? "flat" : "outlined"}
          selectedColor={colors.primary}
        />
        {games.map((game) => (
          <Chip
            key={game}
            label={game}
            selected={filterGame === game}
            onPress={() => setFilterGame(game)}
            style={styles.filterChip}
            mode={filterGame === game ? "flat" : "outlined"}
            selectedColor={colors.primary}
          />
        ))}
      </View>

      {/* Groups list */}
      <FlatList
        data={filteredGroups}
        keyExtractor={(group) => group.id}
        renderItem={({ item }) => (
          <GroupCard
            group={item}
            isJoined={joinedGroups.includes(item.id)}
            onJoin={() => handleJoin(item.id)}
            onPress={() =>
              router.push(`/(tabs)/group-detail?groupId=${item.id}` as any)
            }
          />
        )}
        contentContainerStyle={styles.listContent}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  searchbar: {
    marginVertical: spacing.md,
    backgroundColor: colors.card,
  },
  searchInput: {
    color: colors.text,
  },
  filterContainer: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    flexDirection: "row",
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  filterChip: {
    marginRight: spacing.xs,
  },
  listContent: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
});
