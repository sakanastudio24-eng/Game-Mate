import { useLocalSearchParams, useRouter } from "expo-router";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
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

export default function AIAdvisorScreen() {
  const router = useRouter();
  const responsive = useResponsive();
  const params = useLocalSearchParams<{ source?: string }>();

  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<AIRecommendationsResponse["results"]>([]);
  const [suggestedTags, setSuggestedTags] = useState<string[]>([]);

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

  const joined = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    const matched = results
      .map((result) => {
        const group = SUGGESTED_GROUPS.find((item) => item.id === result.groupId);
        if (!group) return null;
        return { group, result };
      })
      .filter((item): item is { group: (typeof SUGGESTED_GROUPS)[number]; result: AIRecommendationsResponse["results"][number] } => Boolean(item));

    if (!normalized) return matched;

    return matched.filter(({ group, result }) => {
      const haystack = `${group.name} ${group.game} ${result.reasons.join(" ")}`.toLowerCase();
      return haystack.includes(normalized);
    });
  }, [query, results]);

  return (
    <Screen scrollable>
      <Header
        title="Search"
        subtitle={typeof params.source === "string" ? `Source: ${params.source}` : "Recommendations"}
        showBackButton
      />

      <View style={styles.section}>
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

      {loading ? (
        <View style={styles.skeletonStack}>
          <View style={styles.loadingHeader}>
            <Skeleton width="44%" height={16} />
            <Skeleton width="70%" height={12} style={styles.loadingHeaderCopy} />
          </View>
          <SkeletonCard />
          <SkeletonCard />
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
      ) : joined.length === 0 ? (
        <View style={styles.stateBox}>
          <Text style={styles.stateTitle}>No matches found</Text>
          <Text style={styles.stateCopy}>Try a broader search or refresh recommendations.</Text>
        </View>
      ) : (
        joined.map(({ group, result }) => (
          <Pressable
            key={group.id}
            onPress={() => router.push(`/(tabs)/group-detail?groupId=${group.id}`)}
            accessibilityRole="button"
            accessibilityLabel={`${group.name}, match score ${result.score}`}
            style={({ pressed }) => [styles.card, pressed && styles.pressed]}
          >
            <View style={styles.cardTop}>
              <Text style={styles.cardTitle}>{group.name}</Text>
              <View style={styles.scorePill}>
                <Text style={styles.scoreText}>{result.score}% Match</Text>
              </View>
            </View>
            <Text style={styles.cardGame}>{group.game}</Text>
            <View style={styles.reasonWrap}>
              {result.reasons.map((reason) => (
                <View key={`${group.id}-${reason}`} style={styles.reasonChip}>
                  <MaterialCommunityIcons
                    name={"star-four-points" as any}
                    size={12}
                    color={colors.primary}
                  />
                  <Text style={styles.reasonText}>{reason}</Text>
                </View>
              ))}
            </View>
          </Pressable>
        ))
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  section: {
    marginTop: spacing.md,
    marginBottom: spacing.md,
  },
  skeletonStack: {
    gap: spacing.sm,
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
    marginTop: spacing.sm,
    alignSelf: "flex-start",
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
  card: {
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: "#242424",
    borderRadius: 16,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  cardTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  cardTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "800",
    flex: 1,
    marginRight: spacing.sm,
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
    alignSelf: "flex-start",
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: "#1F1F1F",
    paddingHorizontal: 9,
    paddingVertical: 4,
  },
  reasonText: {
    marginLeft: 5,
    color: colors.text,
    fontSize: 12,
    fontWeight: "600",
  },
  pressed: {
    opacity: 0.78,
  },
});
