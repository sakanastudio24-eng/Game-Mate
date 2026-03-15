import { useLocalSearchParams, useRouter } from "expo-router";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { Image as ExpoImage } from "expo-image";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { FlatList, Pressable, StyleSheet, View } from "react-native";
import { Searchbar, Text } from "react-native-paper";
import { getSuggestedTags, isAbortError } from "../../src/ai/advisorClient";
import { EmptyState } from "../../src/components/ui/EmptyState";
import { FilterChipOption, FilterChips } from "../../src/components/ui/FilterChips";
import { Header } from "../../src/components/ui/Header";
import { RecentSearchList } from "../../src/components/ui/RecentSearchList";
import { Screen } from "../../src/components/ui/Screen";
import { SearchAutocompleteList } from "../../src/components/ui/SearchAutocompleteList";
import { Skeleton } from "../../src/components/ui/Skeleton";
import { NEWS_FEED, NewsFeedItem } from "../../src/lib/content-data";
import { androidKeyboardCompatProps } from "../../src/lib/androidInput";
import { useDebouncedValue } from "../../src/lib/hooks/useDebouncedValue";
import { useLocalCache } from "../../src/lib/hooks/useLocalCache";
import { useResponsive } from "../../src/lib/responsive";
import { colors, spacing } from "../../src/lib/theme";

type VideoSearchItem = NewsFeedItem;

type RankedVideoResult = {
  video: VideoSearchItem;
  baseSearchScore: number;
  aiScore: number;
  isAiPick: boolean;
};

type PagedVideoResult = RankedVideoResult & {
  listKey: string;
  pageIndex: number;
  slotIndex: number;
};

type ContinueSurface = {
  lastSearch: string;
  lastVideoId?: string;
  lastVideoTitle?: string;
};

const TOP_RESULTS_LIMIT = 10;
const AI_PICK_COUNT = 2;

const CATEGORY_FILTERS: FilterChipOption[] = [
  { id: "fyp", label: "For You" },
  { id: "esports", label: "Esports" },
  { id: "patches", label: "Patches" },
  { id: "streams", label: "Streams" },
];

function compactNumber(value: number): string {
  if (value >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(1)}M`;
  }
  if (value >= 1000) {
    return `${(value / 1000).toFixed(1)}K`;
  }
  return String(value);
}

function normalizedDate(dateText: string, fallbackIndex: number): number {
  const parsed = Date.parse(dateText);
  if (Number.isNaN(parsed)) {
    return Date.now() - fallbackIndex * 86_400_000;
  }
  return parsed;
}

function normalizeTokens(value: string): string[] {
  return value
    .toLowerCase()
    .split(/\s+/)
    .map((token) => token.trim())
    .filter(Boolean);
}

function abortableDelay(ms: number, signal?: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      signal?.removeEventListener("abort", onAbort);
      resolve();
    }, ms);
    const onAbort = () => {
      clearTimeout(timer);
      reject(new Error("Aborted"));
    };

    if (signal) {
      signal.addEventListener("abort", onAbort, { once: true });
    }
  });
}

export default function AIAdvisorScreen() {
  const router = useRouter();
  const responsive = useResponsive();
  const params = useLocalSearchParams<{ source?: string }>();

  const [queryInput, setQueryInput] = useState("");
  const debouncedQuery = useDebouncedValue(queryInput, 280);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [suggestedTags, setSuggestedTags] = useState<string[]>([]);
  const [pageCount, setPageCount] = useState(1);
  const [refreshTick, setRefreshTick] = useState(0);
  const forceRefreshRef = useRef(false);

  const {
    value: recentSearches,
    setValue: setRecentSearches,
    clear: clearRecentSearches,
  } = useLocalCache<string[]>("search:video-recents", []);

  const {
    value: selectedCategoryFilters,
    setValue: setSelectedCategoryFilters,
  } = useLocalCache<string[]>("search:video-filters", []);

  const {
    value: continueSurface,
    setValue: setContinueSurface,
  } = useLocalCache<ContinueSurface>("search:continue-surface", {
    lastSearch: "",
  });

  const maxLikes = useMemo(
    () => NEWS_FEED.reduce((max, item) => Math.max(max, item.likes), 1),
    [],
  );

  const maxComments = useMemo(
    () => NEWS_FEED.reduce((max, item) => Math.max(max, item.comments), 1),
    [],
  );

  const freshnessById = useMemo(() => {
    const ordered = NEWS_FEED.map((item, index) => ({
      id: item.id,
      score: normalizedDate(item.date, index),
    })).sort((a, b) => b.score - a.score);

    const divisor = Math.max(1, ordered.length - 1);
    const map = new Map<string, number>();
    ordered.forEach((entry, index) => {
      map.set(entry.id, 1 - index / divisor);
    });
    return map;
  }, []);

  const filteredVideos = useMemo(() => {
    if (selectedCategoryFilters.length === 0) {
      return NEWS_FEED;
    }

    return NEWS_FEED.filter((video) =>
      selectedCategoryFilters.includes(video.category),
    );
  }, [selectedCategoryFilters]);

  const autocompleteItems = useMemo(() => {
    const q = queryInput.trim().toLowerCase();
    if (!q) return [];

    const pool = new Set<string>();

    recentSearches.forEach((item) => {
      if (item.toLowerCase().includes(q)) pool.add(item);
    });

    NEWS_FEED.forEach((video) => {
      if (video.title.toLowerCase().includes(q)) pool.add(video.title);
      if (video.author.toLowerCase().includes(q)) pool.add(video.author);
      if (video.category.toLowerCase().includes(q)) pool.add(video.category.toUpperCase());
    });

    return [...pool].slice(0, 6);
  }, [queryInput, recentSearches]);

  const addRecentSearch = useCallback(
    (value: string) => {
      const cleaned = value.trim();
      if (!cleaned) return;

      setRecentSearches((previous) => {
        const withoutMatch = previous.filter(
          (item) => item.toLowerCase() !== cleaned.toLowerCase(),
        );
        return [cleaned, ...withoutMatch].slice(0, 8);
      });
    },
    [setRecentSearches],
  );

  useEffect(() => {
    const controller = new AbortController();
    const forceRefresh = forceRefreshRef.current;
    forceRefreshRef.current = false;
    setLoading(true);
    setError(null);

    const run = async () => {
      try {
        await abortableDelay(200, controller.signal);

        if (!debouncedQuery.trim()) {
          setSuggestedTags([]);
          return;
        }

        const response = await getSuggestedTags(debouncedQuery, {
          signal: controller.signal,
          forceRefresh,
        });
        setSuggestedTags(response.tags);
      } catch (err) {
        if (isAbortError(err)) return;
        setError("Unable to refresh video search results.");
        setSuggestedTags([]);
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    void run();

    return () => {
      controller.abort();
    };
  }, [debouncedQuery, refreshTick]);

  useEffect(() => {
    if (!debouncedQuery.trim()) return;
    addRecentSearch(debouncedQuery);
    setContinueSurface((previous) => ({
      ...previous,
      lastSearch: debouncedQuery.trim(),
    }));
  }, [addRecentSearch, debouncedQuery, setContinueSurface]);

  const rankedTopTen = useMemo(() => {
    const queryTokens = normalizeTokens(debouncedQuery);
    const normalizedSuggestedTags = suggestedTags.map((tag) => tag.toLowerCase());

    const ranked = filteredVideos.map((video, index) => {
      const title = video.title.toLowerCase();
      const author = video.author.toLowerCase();
      const category = video.category.toLowerCase();
      const likesNorm = video.likes / maxLikes;
      const commentsNorm = video.comments / maxComments;
      const freshnessNorm = freshnessById.get(video.id) ?? Math.max(0, 1 - index * 0.1);

      let baseSearchScore = 10 + likesNorm * 6 + commentsNorm * 4;

      queryTokens.forEach((token) => {
        if (title.startsWith(token)) {
          baseSearchScore += 12;
        } else if (title.includes(token)) {
          baseSearchScore += 8;
        }

        if (author.includes(token)) {
          baseSearchScore += 5;
        }
      });

      const categoryMatchesToken = queryTokens.some((token) => category.includes(token));
      const categoryMatchesTag = normalizedSuggestedTags.some((tag) => category.includes(tag));
      if (categoryMatchesToken || categoryMatchesTag) {
        baseSearchScore += 4;
      }

      const queryIntentBoost = normalizedSuggestedTags
        .filter((tag) => `${title} ${author} ${category}`.includes(tag))
        .length;

      const aiScore =
        baseSearchScore +
        likesNorm * 3 +
        commentsNorm * 3 +
        freshnessNorm * 8 +
        Math.min(10, queryIntentBoost * 3);

      return {
        video,
        baseSearchScore,
        aiScore,
        isAiPick: false,
      } satisfies RankedVideoResult;
    });

    const topAi = [...ranked]
      .sort((a, b) => b.aiScore - a.aiScore)
      .slice(0, AI_PICK_COUNT)
      .map((item) => ({ ...item, isAiPick: true }));

    const aiIds = new Set(topAi.map((item) => item.video.id));

    const restSearch = ranked
      .filter((item) => !aiIds.has(item.video.id))
      .sort((a, b) => b.baseSearchScore - a.baseSearchScore)
      .slice(0, TOP_RESULTS_LIMIT - AI_PICK_COUNT);

    return [...topAi, ...restSearch];
  }, [debouncedQuery, filteredVideos, freshnessById, maxComments, maxLikes, suggestedTags]);

  useEffect(() => {
    setPageCount(1);
  }, [debouncedQuery, rankedTopTen, selectedCategoryFilters]);

  const pagedResults = useMemo(() => {
    if (rankedTopTen.length === 0) {
      return [];
    }

    const pages: PagedVideoResult[] = [];
    for (let page = 0; page < pageCount; page += 1) {
      rankedTopTen.forEach((item, slotIndex) => {
        pages.push({
          ...item,
          pageIndex: page,
          slotIndex,
          listKey: `${item.video.id}-${page}-${slotIndex}`,
        });
      });
    }
    return pages;
  }, [pageCount, rankedTopTen]);

  const handleEndReached = () => {
    if (!loading && !error && rankedTopTen.length > 0) {
      setPageCount((prev) => prev + 1);
    }
  };

  const toggleCategoryFilter = (filterId: string) => {
    setSelectedCategoryFilters((previous) =>
      previous.includes(filterId)
        ? previous.filter((item) => item !== filterId)
        : [...previous, filterId],
    );
  };

  const openVideo = (item: PagedVideoResult) => {
    setContinueSurface((previous) => ({
      ...previous,
      lastVideoId: item.video.id,
      lastVideoTitle: item.video.title,
      lastSearch: debouncedQuery.trim() || previous.lastSearch,
    }));

    router.push({
      pathname: "/(tabs)/news",
      params: {
        focusVideoId: item.video.id,
        focusFrom: "search",
      },
    } as any);
  };

  return (
    <Screen scrollable={false}>
      <Header
        title="Search"
        subtitle={typeof params.source === "string" ? `Source: ${params.source}` : "Video search"}
        showBackButton
        onBack={() => router.replace("/(tabs)/news")}
      />

      <View style={styles.fixedSearchWrap}>
        <Searchbar
          placeholder="Search videos..."
          value={queryInput}
          onChangeText={setQueryInput}
          {...androidKeyboardCompatProps}
          accessibilityLabel="Search videos"
          style={[styles.searchbar, { borderRadius: responsive.searchRadius }]}
          inputStyle={[styles.searchInput, { fontSize: responsive.bodySize }]}
          placeholderTextColor={colors.textSecondary}
        />

        {queryInput.trim().length > 0 ? (
          <SearchAutocompleteList items={autocompleteItems} onSelect={setQueryInput} />
        ) : null}

        {queryInput.trim().length === 0 ? (
          <RecentSearchList
            items={recentSearches}
            onSelect={setQueryInput}
            onClear={clearRecentSearches}
          />
        ) : null}

        <View style={styles.filterWrap}>
          <FilterChips
            options={CATEGORY_FILTERS}
            selectedIds={selectedCategoryFilters}
            onToggle={toggleCategoryFilter}
            accessibilityLabelPrefix="Filter videos by"
          />
        </View>

        {suggestedTags.length > 0 ? (
          <View style={styles.tagsRow}>
            {suggestedTags.map((tag) => (
              <View key={tag} style={styles.tagChip}>
                <Text style={styles.tagChipText}>#{tag}</Text>
              </View>
            ))}
          </View>
        ) : null}

        {(continueSurface.lastSearch || continueSurface.lastVideoTitle) ? (
          <View style={styles.continueRow}>
            {continueSurface.lastSearch ? (
              <Pressable
                onPress={() => setQueryInput(continueSurface.lastSearch)}
                accessibilityRole="button"
                accessibilityLabel={`Continue search ${continueSurface.lastSearch}`}
                style={({ pressed }) => [styles.continuePill, pressed && styles.pressed]}
              >
                <MaterialCommunityIcons name="history" size={13} color={colors.primary} />
                <Text style={styles.continuePillText} numberOfLines={1}>
                  Continue: {continueSurface.lastSearch}
                </Text>
              </Pressable>
            ) : null}

            {continueSurface.lastVideoTitle ? (
              <View style={styles.continuePillMuted}>
                <MaterialCommunityIcons name="play-circle-outline" size={13} color={colors.textSecondary} />
                <Text style={styles.continueMutedText} numberOfLines={1}>
                  Last video: {continueSurface.lastVideoTitle}
                </Text>
              </View>
            ) : null}
          </View>
        ) : null}

        <View style={styles.searchMetaRow}>
          <Text style={styles.resultLabel}>Top {TOP_RESULTS_LIMIT} Video Results</Text>
          <Pressable
            onPress={() => {
              forceRefreshRef.current = true;
              setRefreshTick((prev) => prev + 1);
            }}
            accessibilityRole="button"
            accessibilityLabel="Refresh video results"
            style={({ pressed }) => [styles.refreshButton, pressed && styles.pressed]}
          >
            <MaterialCommunityIcons name="refresh" size={16} color="#1A1A1A" />
            <Text style={styles.refreshButtonText}>Refresh</Text>
          </Pressable>
        </View>
      </View>

      {loading ? (
        <View style={styles.skeletonStack}>
          <View style={styles.skeletonGridRow}>
            <View style={styles.skeletonGridItem}>
              <View style={styles.skeletonCard}>
                <Skeleton width="100%" height={122} borderRadius={12} />
                <Skeleton width="72%" height={12} style={styles.skeletonGap} />
                <Skeleton width="52%" height={10} style={styles.skeletonGapSm} />
                <View style={styles.skeletonStatsRow}>
                  <Skeleton width="30%" height={10} />
                  <Skeleton width="24%" height={10} />
                </View>
              </View>
            </View>
            <View style={styles.skeletonGridItem}>
              <View style={styles.skeletonCard}>
                <Skeleton width="100%" height={122} borderRadius={12} />
                <Skeleton width="72%" height={12} style={styles.skeletonGap} />
                <Skeleton width="52%" height={10} style={styles.skeletonGapSm} />
                <View style={styles.skeletonStatsRow}>
                  <Skeleton width="30%" height={10} />
                  <Skeleton width="24%" height={10} />
                </View>
              </View>
            </View>
          </View>
          <View style={styles.skeletonGridRow}>
            <View style={styles.skeletonGridItem}>
              <View style={styles.skeletonCard}>
                <Skeleton width="100%" height={122} borderRadius={12} />
                <Skeleton width="72%" height={12} style={styles.skeletonGap} />
                <Skeleton width="52%" height={10} style={styles.skeletonGapSm} />
                <View style={styles.skeletonStatsRow}>
                  <Skeleton width="30%" height={10} />
                  <Skeleton width="24%" height={10} />
                </View>
              </View>
            </View>
            <View style={styles.skeletonGridItem}>
              <View style={styles.skeletonCard}>
                <Skeleton width="100%" height={122} borderRadius={12} />
                <Skeleton width="72%" height={12} style={styles.skeletonGap} />
                <Skeleton width="52%" height={10} style={styles.skeletonGapSm} />
                <View style={styles.skeletonStatsRow}>
                  <Skeleton width="30%" height={10} />
                  <Skeleton width="24%" height={10} />
                </View>
              </View>
            </View>
          </View>
        </View>
      ) : error ? (
        <EmptyState
          title="Video search error"
          description={error}
          suggestion="Tap refresh and try again."
          icon="alert-circle-outline"
        />
      ) : rankedTopTen.length === 0 ? (
        <EmptyState
          title="No videos found"
          description="No results matched your current search and filters."
          suggestion="Try: ranked duo, no mic, chill, scrim."
          icon="magnify-close"
        />
      ) : (
        <FlatList
          data={pagedResults}
          keyExtractor={(item) => item.listKey}
          numColumns={2}
          initialNumToRender={4}
          maxToRenderPerBatch={6}
          windowSize={6}
          updateCellsBatchingPeriod={50}
          onEndReachedThreshold={0.45}
          onEndReached={handleEndReached}
          removeClippedSubviews
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.gridContent}
          columnWrapperStyle={styles.gridRow}
          renderItem={({ item }) => {
            const showAiBadge =
              item.pageIndex === 0 && item.slotIndex < AI_PICK_COUNT && item.isAiPick;

            return (
              <Pressable
                onPress={() => openVideo(item)}
                accessibilityRole="button"
                accessibilityLabel={`Open video ${item.video.title}`}
                style={({ pressed }) => [styles.videoCard, pressed && styles.pressed]}
              >
                <View style={styles.mediaWrap}>
                  <ExpoImage
                    source={{ uri: item.video.thumbnail }}
                    style={styles.media}
                    contentFit="cover"
                    cachePolicy="memory-disk"
                    accessibilityLabel={`${item.video.title} thumbnail`}
                  />

                  {item.video.duration ? (
                    <View style={styles.durationPill}>
                      <MaterialCommunityIcons name="play" size={10} color={colors.text} />
                      <Text style={styles.durationText}>{item.video.duration}</Text>
                    </View>
                  ) : null}

                  {showAiBadge ? (
                    <View style={styles.aiBadge}>
                      <MaterialCommunityIcons name={"star-four-points" as any} size={11} color="#1A1A1A" />
                      <Text style={styles.aiBadgeText}>AI Pick</Text>
                    </View>
                  ) : null}
                </View>

                <Text style={styles.cardTitle} numberOfLines={2}>
                  {item.video.title}
                </Text>

                <Text style={styles.cardMeta} numberOfLines={1}>
                  {item.video.author} · {item.video.date}
                </Text>

                <View style={styles.statRow}>
                  <View style={styles.statInline}>
                    <MaterialCommunityIcons
                      name="heart-outline"
                      size={13}
                      color={colors.textSecondary}
                    />
                    <Text style={styles.statText}>{compactNumber(item.video.likes)}</Text>
                  </View>
                  <View style={styles.statInline}>
                    <MaterialCommunityIcons
                      name="message-outline"
                      size={13}
                      color={colors.textSecondary}
                    />
                    <Text style={styles.statText}>{compactNumber(item.video.comments)}</Text>
                  </View>
                </View>
              </Pressable>
            );
          }}
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
  searchbar: {
    backgroundColor: "#242424",
    borderWidth: 1,
    borderColor: colors.border,
  },
  searchInput: {
    color: colors.text,
  },
  filterWrap: {
    marginTop: spacing.sm,
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
  continueRow: {
    marginTop: spacing.sm,
    gap: spacing.xs,
  },
  continuePill: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.primary,
    backgroundColor: "rgba(255,159,102,0.15)",
    paddingHorizontal: 10,
    paddingVertical: 6,
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    maxWidth: "100%",
  },
  continuePillText: {
    marginLeft: 6,
    color: colors.primary,
    fontSize: 12,
    fontWeight: "700",
    maxWidth: "92%",
  },
  continuePillMuted: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: "#242424",
    paddingHorizontal: 10,
    paddingVertical: 6,
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    maxWidth: "100%",
  },
  continueMutedText: {
    marginLeft: 6,
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: "700",
    maxWidth: "92%",
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
  skeletonCard: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    backgroundColor: "#242424",
    padding: spacing.sm,
  },
  skeletonGap: {
    marginTop: spacing.sm,
  },
  skeletonGapSm: {
    marginTop: spacing.xs,
  },
  skeletonStatsRow: {
    marginTop: spacing.sm,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  gridContent: {
    paddingBottom: spacing.lg,
  },
  gridRow: {
    justifyContent: "space-between",
    marginBottom: spacing.sm,
  },
  videoCard: {
    width: "48.5%",
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: "#242424",
    borderRadius: 14,
    padding: spacing.sm,
  },
  mediaWrap: {
    borderRadius: 10,
    overflow: "hidden",
    position: "relative",
  },
  media: {
    width: "100%",
    height: 122,
  },
  durationPill: {
    position: "absolute",
    right: 8,
    bottom: 8,
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 999,
    backgroundColor: "rgba(26,26,26,0.75)",
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 6,
    paddingVertical: 3,
  },
  durationText: {
    color: colors.text,
    marginLeft: 4,
    fontSize: 11,
    fontWeight: "700",
  },
  aiBadge: {
    position: "absolute",
    left: 8,
    top: 8,
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 999,
    paddingHorizontal: 7,
    paddingVertical: 4,
    backgroundColor: colors.primary,
  },
  aiBadgeText: {
    marginLeft: 4,
    color: "#1A1A1A",
    fontSize: 11,
    fontWeight: "800",
  },
  cardTitle: {
    marginTop: spacing.sm,
    color: colors.text,
    fontSize: 13,
    fontWeight: "800",
    lineHeight: 18,
  },
  cardMeta: {
    marginTop: 4,
    color: colors.textSecondary,
    fontSize: 11,
  },
  statRow: {
    marginTop: spacing.xs,
    flexDirection: "row",
    gap: spacing.sm,
  },
  statInline: {
    flexDirection: "row",
    alignItems: "center",
  },
  statText: {
    marginLeft: 4,
    color: colors.textSecondary,
    fontSize: 11,
    fontWeight: "700",
  },
  pressed: {
    opacity: 0.78,
  },
});
