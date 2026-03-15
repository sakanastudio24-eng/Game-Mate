import { useLocalSearchParams, useRouter } from "expo-router";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import React, { useMemo, useState } from "react";
import { FlatList, StyleSheet, View } from "react-native";
import { Searchbar, Text } from "react-native-paper";
import { sendConnectionRequest } from "../../services/connections";
import { Button } from "../../src/components/ui/Button";
import { Card } from "../../src/components/ui/Card";
import { Chip } from "../../src/components/ui/Chip";
import { Header } from "../../src/components/ui/Header";
import { Screen } from "../../src/components/ui/Screen";
import { useToast } from "../../src/components/ui/ToastProvider";
import { useAuth } from "../../src/context/AuthContext";
import { androidKeyboardCompatProps } from "../../src/lib/androidInput";
import { useResponsive } from "../../src/lib/responsive";
import { colors, spacing } from "../../src/lib/theme";

// SearchPlayersScreen: Find and add players
// Backend integration: GET /api/players/search endpoint in Phase B

interface PlayerSearchResult {
  id: string;
  name: string;
  rank: string;
  games: string[];
  onlineStatus: boolean;
  mutualFriends: number;
}

export default function SearchPlayersScreen() {
  const router = useRouter();
  const responsive = useResponsive();
  const params = useLocalSearchParams<{ source?: string }>();
  const { accessToken } = useAuth();
  const { showToast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [addedPlayers, setAddedPlayers] = useState<Set<string>>(new Set());
  const [sendingPlayerIds, setSendingPlayerIds] = useState<Set<string>>(new Set());

  const allGenres = ["FPS", "RPG", "Strategy", "Sports", "Fighting", "MMO"];
  const backTarget = params.source === "messages" ? "/(tabs)/messages" : "/(tabs)/social";

  const toggleGenre = (genre: string) => {
    setSelectedGenres((prev) =>
      prev.includes(genre) ? prev.filter((g) => g !== genre) : [...prev, genre],
    );
  };

  const mockSearchResults: PlayerSearchResult[] = [
    {
      id: "1",
      name: "ProGamer92",
      rank: "Diamond",
      games: ["Valorant", "CS:GO"],
      onlineStatus: true,
      mutualFriends: 3,
    },
    {
      id: "2",
      name: "SkyWalker",
      rank: "Platinum",
      games: ["Valorant", "Apex"],
      onlineStatus: false,
      mutualFriends: 1,
    },
    {
      id: "3",
      name: "EchoPlayer",
      rank: "Gold",
      games: ["CS:GO", "Overwatch"],
      onlineStatus: true,
      mutualFriends: 2,
    },
  ];

  const filteredResults = useMemo(() => {
    return mockSearchResults.filter((player) => {
      const matchesSearch = player.name
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      const matchesGenres =
        selectedGenres.length === 0 ||
        player.games.some((game) =>
          allGenres.some((genre) => game.includes(genre)),
        );
      return matchesSearch && matchesGenres;
    });
  }, [searchQuery, selectedGenres]);

  const handleAddPlayer = async (playerId: string, playerName: string) => {
    if (addedPlayers.has(playerId) || sendingPlayerIds.has(playerId)) return;
    if (!accessToken) {
      showToast({ message: "Sign in to send requests." });
      return;
    }

    const numericId = Number(playerId);
    if (!Number.isFinite(numericId)) {
      showToast({ message: "Invalid player id." });
      return;
    }

    setSendingPlayerIds((prev) => new Set(prev).add(playerId));
    try {
      await sendConnectionRequest(accessToken, numericId);
      setAddedPlayers((prev) => new Set(prev).add(playerId));
      showToast({ message: `Request sent to ${playerName}` });
    } catch (error) {
      showToast({
        message: error instanceof Error ? error.message : "Unable to send request right now.",
      });
    } finally {
      setSendingPlayerIds((prev) => {
        const next = new Set(prev);
        next.delete(playerId);
        return next;
      });
    }
  };

  const renderPlayerCard = (player: PlayerSearchResult) => (
    <Card style={styles.playerCard} key={player.id}>
      <View style={styles.playerHeader}>
        <View style={styles.playerInfo}>
          <View style={styles.playerNameRow}>
            <Text style={[styles.playerName, { fontSize: responsive.bodySize + 2 }]}>
              {player.name}
            </Text>
            {player.onlineStatus && (
              <View
                style={[styles.onlineBadge, { backgroundColor: colors.online }]}
              />
            )}
          </View>
          <Text style={[styles.playerRank, { fontSize: responsive.bodySmallSize }]}>
            {player.rank} Rank
          </Text>
          {player.mutualFriends > 0 && (
            <Text style={[styles.mutualFriends, { fontSize: responsive.bodySmallSize }]}>
              {player.mutualFriends} mutual friends
            </Text>
          )}
        </View>

        <Button
          mode={addedPlayers.has(player.id) ? "contained" : "outlined"}
          onPress={() => {
            void handleAddPlayer(player.id, player.name);
          }}
          size="small"
          disabled={addedPlayers.has(player.id) || sendingPlayerIds.has(player.id)}
          label={
            sendingPlayerIds.has(player.id)
              ? "Sending..."
              : addedPlayers.has(player.id)
                ? "Requested"
                : "Add"
          }
        />
      </View>

      <View style={styles.gamesContainer}>
        {player.games.map((game, idx) => (
          <Chip key={idx} label={game} size="small" style={styles.gameChip} />
        ))}
      </View>
    </Card>
  );

  return (
    <Screen scrollable={false}>
      <Header title="Find Players" showBackButton onBack={() => router.replace(backTarget as any)} />

      <Searchbar
        placeholder="Search by name..."
        onChangeText={setSearchQuery}
        value={searchQuery}
        {...androidKeyboardCompatProps}
        style={[styles.searchbar, { borderRadius: responsive.searchRadius }]}
        inputStyle={[styles.searchbarInput, { fontSize: responsive.bodySize }]}
        placeholderTextColor={colors.textSecondary}
      />

      <View style={styles.filtersContainer}>
        <Text style={[styles.filterLabel, { fontSize: responsive.captionSize }]}>GAMES</Text>
        <View style={styles.chipGroup}>
          {allGenres.map((genre) => (
            <Chip
              key={genre}
              selected={selectedGenres.includes(genre)}
              onPress={() => toggleGenre(genre)}
              style={[
                styles.filterChip,
                selectedGenres.includes(genre) && styles.filterChipActive,
              ]}
              selectedColor={colors.primary}
            >
              {genre}
            </Chip>
          ))}
        </View>
      </View>

      {filteredResults.length > 0 ? (
        <FlatList
          data={filteredResults}
          renderItem={({ item }) => renderPlayerCard(item)}
          keyExtractor={(item) => item.id}
          scrollEnabled={true}
          contentContainerStyle={styles.resultsList}
        />
      ) : (
        <View style={styles.emptyState}>
          <MaterialCommunityIcons
            name="account-search"
            size={48}
            color={colors.textSecondary}
          />
          <Text style={[styles.emptyText, { fontSize: responsive.bodySize }]}>
            {searchQuery || selectedGenres.length > 0
              ? "No players found"
              : "Search for players to get started"}
          </Text>
        </View>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  searchbar: {
    marginVertical: spacing.md,
    backgroundColor: colors.surface,
  },
  searchbarInput: {
    fontSize: 14,
    color: colors.text,
  },
  filtersContainer: {
    marginBottom: spacing.md,
  },
  filterLabel: {
    color: colors.primary,
    fontWeight: "700",
    fontSize: 12,
    textTransform: "uppercase",
    marginBottom: spacing.sm,
    letterSpacing: 0.5,
  },
  chipGroup: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  filterChip: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
  },
  filterChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterChipText: {
    fontSize: 12,
  },
  resultsList: {
    paddingBottom: spacing.lg,
  },
  playerCard: {
    marginBottom: spacing.md,
  },
  playerHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: spacing.md,
  },
  playerInfo: {
    flex: 1,
  },
  playerNameRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.xs,
  },
  playerName: {
    color: colors.text,
    fontWeight: "700",
    fontSize: 16,
    marginRight: spacing.sm,
  },
  onlineBadge: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  playerRank: {
    color: colors.primary,
    fontWeight: "600",
    fontSize: 12,
    marginBottom: spacing.xs,
  },
  mutualFriends: {
    color: colors.textSecondary,
    fontSize: 12,
  },
  gamesContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  gameChip: {
    backgroundColor: colors.surface,
  },
  chipText: {
    fontSize: 11,
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: spacing.xl,
  },
  emptyText: {
    color: colors.textSecondary,
    fontSize: 14,
    marginTop: spacing.md,
    textAlign: "center",
  },
});
