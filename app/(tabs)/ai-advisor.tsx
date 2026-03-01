import { useLocalSearchParams, useRouter } from "expo-router";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { FlatList, Pressable, StyleSheet, View } from "react-native";
import { Searchbar, Text } from "react-native-paper";
import { Header } from "../../src/components/ui/Header";
import { Skeleton, SkeletonCard } from "../../src/components/ui/Skeleton";
import { Screen } from "../../src/components/ui/Screen";
import {
  AIGroupCandidate,
  AIRecommendationsResponse,
  AIUserProfile,
  getRecommendations,
  getSuggestedTags,
} from "../../src/ai/advisorClient";
import { SUGGESTED_GROUPS } from "../../src/lib/content-data";
import { mockCurrentUser } from "../../src/lib/mockData";
import { useResponsive } from "../../src/lib/responsive";
import { colors, spacing } from "../../src/lib/theme";

type RankedSearchResult = {
  group: (typeof SUGGESTED_GROUPS)[number];
  result: AIRecommendationsResponse["results"][number];
  searchScore: number;
};

type GridSearchItem = RankedSearchResult & {
  listKey: string;
};

const TOP_RESULTS_LIMIT = 10;

function mapGroupCandidate(group: (typeof SUGGESTED_GROUPS)[number]): AIGroupCandidate {
  const gameKey = group.game.toLowerCase();
  const inferredTags = gameKey.includes("valorant")
    ? ["competitive", "ranked", "mic"]
    : gameKey.includes("various")
      ? ["casual", "chill"]
      : gameKey.includes("forza")
        ? ["casual", "teamplay"]
        : ["casual", "teamplay"];

  return {
    id: group.id,
    game: group.game,
    rankMin: gameKey.includes("counter") ? "silver" : "gold",
    rankMax: gameKey.includes("counter") ? "diamond" : "platinum",
    tags: inferredTags,
    slots: Math.max(1, Math.round(group.members * 0.12)),
    micRequired: inferredTags.includes("mic"),
  };
}

function buildProfile(): AIUserProfile {
  return {
    games: mockCurrentUser.gamesPlayed,
    rank: mockCurrentUser.rank,
    mic: true,
    tags: ["casual", "teamplay"],
  };
}

function computeSearchScore(
  normalizedQuery: string,
  group: (typeof SUGGESTED_GROUPS)[number],
  result: AIRecommendationsResponse["results"][number],
): number {
  if (!normalizedQuery) return result.score;

  const groupName = group.name.toLowerCase();
  const game = group.game.toLowerCase();
  const reasons = result.reasons.join(" ").toLowerCase();
  const tokens = normalizedQuery.split(/\s+/).filter(Boolean);

  let score = result.score;
  tokens.forEach((token) => {
    if (groupName.startsWith(token)) score += 10;
    if (groupName.includes(token)) score += 6;
    if (game.includes(token)) score += 5;
    if (reasons.includes(token)) score += 3;
  });

  return score;
}

export default function AIAdvisorScreen() {
  const router = useRouter();
  const responsive = useResponsive();
  const params = useLocalSearchParams<{ source?: string }>();

  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<AIRecommendationsResponse["results"]>([]);
  const [suggestedTags, setSuggestedTags] = useState<string[]>([]);
  const [pageCount, setPageCount] = useState(1);

  const candidates = useMemo(() => SUGGESTED_GROUPS.map(mapGroupCandidate), []);

  const loadRecommendations = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await getRecommendations({
        userProfile: buildProfile(),
        groups: candidates,
      });
      setResults(response.results);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to load recommendations");
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, [candidates]);

  useEffect(() => {
    void loadRecommendations();
  }, [loadRecommendations]);

  useEffect(() => {
    let isCancelled = false;

    const run = async () => {
      if (!query.trim()) {
        setSuggestedTags([]);
        return;
      }
      const res = await getSuggestedTags(query);
      if (!isCancelled) setSuggestedTags(res.tags);
    };

    void run();
    return () => {
      isCancelled = true;
    };
  }, [query]);

  const rankedTopResults = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    const mapped = results
      .map((result) => {
        const group = SUGGESTED_GROUPS.find((item) => item.id === result.groupId);
        if (!group) return null;
        const searchScore = computeSearchScore(normalized, group, result);
        return { group, result, searchScore };
      })
      .filter((item): item is RankedSearchResult => Boolean(item));

    const filtered = normalized
      ? mapped.filter(({ group, result }) => {
          const haystack = `${group.name} ${group.game} ${result.reasons.join(" ")}`.toLowerCase();
          return haystack.includes(normalized);
        })
      : mapped;

    return filtered
      .sort((a, b) => {
        if (b.searchScore !== a.searchScore) return b.searchScore - a.searchScore;
        return b.result.score - a.result.score;
      })
      .slice(0, TOP_RESULTS_LIMIT);
  }, [query, results]);

  useEffect(() => {
    setPageCount(1);
  }, [query, rankedTopResults.length]);

  const gridItems = useMemo(() => {
    if (rankedTopResults.length === 0) return [];

    const items: GridSearchItem[] = [];
    for (let page = 0; page < pageCount; page += 1) {
      rankedTopResults.forEach((item, index) => {
        items.push({
          ...item,
          listKey: `${item.group.id}-p${page}-i${index}`,
        });
      });
    }
    return items;
  }, [pageCount, rankedTopResults]);

  const handleEndReached = () => {
    if (!loading && !error && rankedTopResults.length > 0) {
      setPageCount((prev) => prev + 1);
    }
  };

  return (
    <Screen scrollable={false}>
      <Header
        title="Search"
        subtitle={typeof params.source === "string" ? `Source: ${params.source}` : "Recommendations"}
        showBackButton
      />

      <View style={styles.fixedSearchWrap}>
        <Searchbar
          placeholder="Search recommendations..."
          value={query}
          onChangeText={setQuery}
          accessibilityLabel="Search recommendations"
          style={[styles.searchbar, { borderRadius: responsive.searchRadius }]}
          inputStyle={[styles.searchInput, { fontSize: responsive.bodySize }]}
          placeholderTextColor={colors.textSecondary}
        />

        {suggestedTags.length > 0 ? (
          <View style={styles.tagsRow}>
            {suggestedTags.map((tag) => (
              <View key={tag} style={styles.tagChip}>
                <Text style={styles.tagChipText}>#{tag}</Text>
              </View>
            ))}
          </View>
        ) : null}

        <View style={styles.searchMetaRow}>
          <Text style={styles.resultLabel}>Top {TOP_RESULTS_LIMIT} Results</Text>
          <Pressable
            onPress={() => void loadRecommendations()}
            accessibilityRole="button"
            accessibilityLabel="Refresh recommendations"
            style={({ pressed }) => [styles.refreshButton, pressed && styles.pressed]}
          >
            <MaterialCommunityIcons name="refresh" size={16} color="#1A1A1A" />
            <Text style={styles.refreshButtonText}>Refresh</Text>
          </Pressable>
        </View>
      </View>

      {loading ? (
        <View style={styles.skeletonStack}>
          <View style={styles.loadingHeader}>
            <Skeleton width="44%" height={16} />
            <Skeleton width="70%" height={12} style={styles.loadingHeaderCopy} />
          </View>
          <View style={styles.skeletonGridRow}>
            <View style={styles.skeletonGridItem}>
              <SkeletonCard />
            </View>
            <View style={styles.skeletonGridItem}>
              <SkeletonCard />
            </View>
          </View>
          <View style={styles.skeletonGridRow}>
            <View style={styles.skeletonGridItem}>
              <SkeletonCard />
            </View>
            <View style={styles.skeletonGridItem}>
              <SkeletonCard />
            </View>
          </View>
        </View>
      ) : error ? (
        <View style={styles.stateBox}>
          <Text style={styles.stateTitle}>Recommendation error</Text>
          <Text style={styles.stateCopy}>{error}</Text>
          <Pressable
            onPress={() => void loadRecommendations()}
            accessibilityRole="button"
            accessibilityLabel="Retry loading recommendations"
            style={({ pressed }) => [styles.retryButton, pressed && styles.pressed]}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </Pressable>
        </View>
      ) : rankedTopResults.length === 0 ? (
        <View style={styles.stateBox}>
          <Text style={styles.stateTitle}>No matches found</Text>
          <Text style={styles.stateCopy}>Try a broader search or refresh recommendations.</Text>
        </View>
      ) : (
        <FlatList
          data={gridItems}
          keyExtractor={(item) => item.listKey}
          numColumns={2}
          onEndReachedThreshold={0.4}
          onEndReached={handleEndReached}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.gridContent}
          columnWrapperStyle={styles.gridRow}
          renderItem={({ item }) => (
            <Pressable
              onPress={() => router.push(`/(tabs)/group-detail?groupId=${item.group.id}`)}
              accessibilityRole="button"
              accessibilityLabel={`${item.group.name}, match score ${item.result.score}`}
              style={({ pressed }) => [styles.gridCard, pressed && styles.pressed]}
            >
              <View style={styles.cardTop}>
                <Text style={styles.cardTitle} numberOfLines={2}>
                  {item.group.name}
                </Text>
                <View style={styles.scorePill}>
                  <Text style={styles.scoreText}>{item.result.score}%</Text>
                </View>
              </View>
              <Text style={styles.cardGame}>{item.group.game}</Text>
              <View style={styles.reasonWrap}>
                {item.result.reasons.slice(0, 2).map((reason) => (
                  <View key={`${item.listKey}-${reason}`} style={styles.reasonChip}>
                    <MaterialCommunityIcons
                      name={"star-four-points" as any}
                      size={11}
                      color={colors.primary}
                    />
                    <Text style={styles.reasonText} numberOfLines={1}>
                      {reason}
                    </Text>
                  </View>
                ))}
              </View>
            </Pressable>
          )}
        />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  fixedSearchWrap: {
    marginTop: spacing.md,
    marginBottom: spacing.md,
  },
  skeletonStack: {
    gap: spacing.sm,
    flex: 1,
  },
  skeletonGridRow: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  skeletonGridItem: {
    flex: 1,
  },
  loadingHeader: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    backgroundColor: "#242424",
    padding: spacing.md,
  },
  loadingHeaderCopy: {
    marginTop: 8,
  },
  searchbar: {
    backgroundColor: "#242424",
    borderWidth: 1,
    borderColor: colors.border,
  },
  searchInput: {
    color: colors.text,
  },
  tagsRow: {
    marginTop: spacing.sm,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.xs,
  },
  searchMetaRow: {
    marginTop: spacing.sm,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  resultLabel: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: "700",
  },
  tagChip: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: "#242424",
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  tagChipText: {
    color: colors.textSecondary,
    fontSize: 11,
    fontWeight: "700",
  },
  refreshButton: {
    borderRadius: 999,
    backgroundColor: colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 8,
    flexDirection: "row",
    alignItems: "center",
  },
  refreshButtonText: {
    color: "#1A1A1A",
    fontWeight: "800",
    marginLeft: 6,
    fontSize: 13,
  },
  stateBox: {
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: "#242424",
    borderRadius: 14,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  stateTitle: {
    color: colors.text,
    fontWeight: "800",
    fontSize: 16,
  },
  stateCopy: {
    color: colors.textSecondary,
    marginTop: 4,
    lineHeight: 20,
  },
  retryButton: {
    marginTop: spacing.sm,
    alignSelf: "flex-start",
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 7,
    backgroundColor: "#1F1F1F",
  },
  retryButtonText: {
    color: colors.text,
    fontWeight: "700",
    fontSize: 12,
  },
  gridContent: {
    paddingBottom: spacing.lg,
  },
  gridRow: {
    justifyContent: "space-between",
    marginBottom: spacing.sm,
  },
  gridCard: {
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: "#242424",
    borderRadius: 16,
    padding: spacing.md,
    width: "48.5%",
    minHeight: 152,
  },
  cardTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  cardTitle: {
    color: colors.text,
    fontSize: 14,
    fontWeight: "800",
    flex: 1,
    marginRight: spacing.xs,
  },
  scorePill: {
    borderRadius: 999,
    backgroundColor: "rgba(255,159,102,0.2)",
    borderWidth: 1,
    borderColor: colors.primary,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  scoreText: {
    color: colors.primary,
    fontWeight: "800",
    fontSize: 12,
  },
  cardGame: {
    color: colors.textSecondary,
    marginTop: 3,
    fontSize: 12,
  },
  reasonWrap: {
    marginTop: spacing.sm,
    gap: spacing.xs,
  },
  reasonChip: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: "#1F1F1F",
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  reasonText: {
    marginLeft: 4,
    color: colors.text,
    fontSize: 11,
    fontWeight: "600",
  },
  pressed: {
    opacity: 0.78,
  },
});
