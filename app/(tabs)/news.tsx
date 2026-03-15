import { useLocalSearchParams, useRouter } from "expo-router";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { Image as ExpoImage } from "expo-image";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Modal,
  PanResponder,
  Platform,
  Pressable,
  Share,
  StyleSheet,
  type ViewToken,
  View,
} from "react-native";
import { Text, TextInput } from "react-native-paper";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  explainFeedPost,
  likePost,
  listFeedPage,
  sharePost,
  skipPost,
  type FeedMeta,
  type PostItem,
} from "../../services/posts";
import { ActionSheet } from "../../src/components/ui/ActionSheet";
import { useToast } from "../../src/components/ui/ToastProvider";
import { Button } from "../../src/components/ui/Button";
import { androidKeyboardCompatProps } from "../../src/lib/androidInput";
import { SESSION_EXPIRED_MESSAGE, isSessionExpiredMessage } from "../../src/lib/auth-messages";
import { AUTHOR_AVATARS, NEWS_FEED, NewsFeedItem } from "../../src/lib/content-data";
import { CURRENT_USER_AVATAR } from "../../src/lib/current-user";
import { useAuth } from "../../src/context/AuthContext";
import { useLocalCache } from "../../src/lib/hooks/useLocalCache";
import { useOptimisticToggle } from "../../src/lib/hooks/useOptimisticToggle";
import { useResponsive } from "../../src/lib/responsive";
import { colors, spacing } from "../../src/lib/theme";

interface FeedSeed extends NewsFeedItem {
  creator?: string;
  createdAtIso?: string;
  feedMeta?: FeedMeta;
  backendPostId?: number;
  description?: string;
  caption?: string;
  source?: string;
  whyReasons?: string[];
}

interface FeedEntry extends FeedSeed {
  feedId: string;
}

interface CommentItem {
  id: string;
  user: string;
  avatar: string;
  message: string;
}

interface ExplainPayload {
  reasons?: string[];
  signals?: Record<string, number>;
}

const INITIAL_LOOP_COUNT = 3;
const DOUBLE_TAP_WINDOW_MS = 320;
const PASSIVE_SKIP_MAX_VISIBLE_MS = 1800;
const COMMENT_AVATARS: Record<string, string> = {
  Nova: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop",
  RiftKing:
    "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop",
  Echo: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop",
  You: CURRENT_USER_AVATAR,
};

const THUMBNAIL_FALLBACK =
  "https://images.unsplash.com/photo-1511512578047-dfb367046420?w=600&q=80";

const FEED_REASON_LABELS: Record<string, string> = {
  popular: "Popular with players",
  shared: "Shared by the community",
  recent: "Recently posted",
  game_interest: "Matches your game interests",
  friend_post: "From people you follow",
  creator_diversity: "Diversified creator mix",
  content_diversity: "Diversified content mix",
  freshness_boost: "Fresh content",
};

function formatReasonLabel(reason: string): string {
  if (FEED_REASON_LABELS[reason]) return FEED_REASON_LABELS[reason];
  return reason
    .replace(/_/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function getPostAuthor(post: PostItem): string {
  if (typeof post.creator === "string" && post.creator.trim()) {
    return post.creator.trim();
  }
  if (
    post.creator &&
    typeof post.creator === "object" &&
    "username" in post.creator &&
    typeof post.creator.username === "string" &&
    post.creator.username.trim()
  ) {
    return post.creator.username.trim();
  }
  return "GameMate";
}

function toDisplayDate(isoDate: string): string {
  const value = new Date(isoDate);
  if (Number.isNaN(value.getTime())) return "Recently";
  return value.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function toThumbnail(post: PostItem, index: number): string {
  const candidate = (post.video_url ?? "").trim();
  const isImageUrl = /\.(png|jpe?g|webp|gif|bmp|avif)(\?.*)?$/i.test(candidate);
  if (candidate.startsWith("http") && isImageUrl) return candidate;
  return NEWS_FEED[index % NEWS_FEED.length]?.thumbnail ?? THUMBNAIL_FALLBACK;
}

function toCategory(post: PostItem): NewsFeedItem["category"] {
  const source = post.feed_meta?.source ?? "";
  if (source.includes("tournament")) return "esports";
  if (source.includes("stream")) return "streams";
  if (source.includes("patch") || source.includes("update")) return "patches";
  return "fyp";
}

function toWhyReasons(post: PostItem): string[] {
  const rawReasons = post.feed_meta?.reasons ?? [];
  const mapped = rawReasons
    .map((reason) => FEED_REASON_LABELS[reason] || "")
    .filter(Boolean);
  const unique = Array.from(new Set(mapped));
  return unique.slice(0, 3);
}

function mapPostToNewsItem(post: PostItem, index: number): FeedSeed {
  const signals = post.feed_meta?.signals ?? {};
  const title = (post.title ?? "").trim() || "Untitled";
  const description = (post.description ?? "").trim();
  const creator = getPostAuthor(post);
  const hashtags = Array.from(
    new Set(
      (description.match(/#([\w-]+)/g) ?? [])
        .map((value) => value.replace("#", "").trim().toLowerCase())
        .filter(Boolean),
    ),
  );

  return {
    id: String(post.id),
    backendPostId: post.id,
    type: "video",
    title,
    author: creator,
    creator,
    date: toDisplayDate(post.created_at),
    createdAtIso: post.created_at,
    game: post.game?.trim() || "General",
    hashtags: hashtags.length ? hashtags.slice(0, 3) : ["feed"],
    duration: NEWS_FEED[index % NEWS_FEED.length]?.duration,
    thumbnail: toThumbnail(post, index),
    likes: Number(signals.likes ?? 0),
    comments: Number(signals.comments ?? 0),
    shares: Number(signals.shares ?? 0),
    category: toCategory(post),
    description,
    feedMeta: post.feed_meta,
    caption: description,
    source: post.feed_meta?.source,
    whyReasons: toWhyReasons(post),
  };
}

function createLoop(seed: FeedSeed[], loopIndex: number, loopLabel = "loop"): FeedEntry[] {
  return seed.map((item, index) => ({
    ...item,
    feedId: `${item.id}-${loopLabel}-${loopIndex}-${index}`,
  }));
}

function createInitialFeed(seed: FeedSeed[]): FeedEntry[] {
  const items: FeedEntry[] = [];
  for (let loop = 0; loop < INITIAL_LOOP_COUNT; loop += 1) {
    items.push(...createLoop(seed, loop, "loop"));
  }
  return items;
}

function shuffleFeedSeed(seed: FeedSeed[], previousFirstId?: string): FeedSeed[] {
  if (seed.length <= 1) return seed;
  const shuffled = [...seed];

  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [shuffled[index], shuffled[randomIndex]] = [shuffled[randomIndex], shuffled[index]];
  }

  if (previousFirstId && shuffled[0]?.id === previousFirstId && shuffled.length > 1) {
    [shuffled[0], shuffled[1]] = [shuffled[1], shuffled[0]];
  }

  return shuffled;
}

function compactNumber(value: number): string {
  if (value >= 1000) {
    return `${(value / 1000).toFixed(1)}k`;
  }
  return String(value);
}

function truncateFeedTitle(title: string, maxWords = 6): string {
  const words = title.trim().split(/\s+/).filter(Boolean);
  if (words.length <= maxWords) return title;
  return `${words.slice(0, maxWords).join(" ")}...`;
}

function buildCommentPreview(item: FeedEntry): CommentItem[] {
  if (item.id === "viral-1") {
    return [
      {
        id: `${item.feedId}-c1`,
        user: "Nova",
        avatar: COMMENT_AVATARS.Nova,
        message: "That final swing was filthy.",
      },
      {
        id: `${item.feedId}-c2`,
        user: "RiftKing",
        avatar: COMMENT_AVATARS.RiftKing,
        message: "No way they all lined up like that.",
      },
      {
        id: `${item.feedId}-c3`,
        user: "Echo",
        avatar: COMMENT_AVATARS.Echo,
        message: "Crosshair placement stayed perfect the whole round.",
      },
      {
        id: `${item.feedId}-c4`,
        user: "Nova",
        avatar: COMMENT_AVATARS.Nova,
        message: "Clip this for the squad chat immediately.",
      },
      {
        id: `${item.feedId}-c5`,
        user: "RiftKing",
        avatar: COMMENT_AVATARS.RiftKing,
        message: "That third kill was all sound cue discipline.",
      },
      {
        id: `${item.feedId}-c6`,
        user: "Echo",
        avatar: COMMENT_AVATARS.Echo,
        message: "You can feel the panic from the other team.",
      },
      {
        id: `${item.feedId}-c7`,
        user: "Nova",
        avatar: COMMENT_AVATARS.Nova,
        message: "This deserves the top slot today.",
      },
      {
        id: `${item.feedId}-c8`,
        user: "RiftKing",
        avatar: COMMENT_AVATARS.RiftKing,
        message: "Last bullet finish made it even colder.",
      },
      {
        id: `${item.feedId}-c9`,
        user: "Echo",
        avatar: COMMENT_AVATARS.Echo,
        message: "Please post the comms audio next.",
      },
      {
        id: `${item.feedId}-c10`,
        user: "Nova",
        avatar: COMMENT_AVATARS.Nova,
        message: "I watched this five times already.",
      },
    ];
  }

  return [
    {
      id: `${item.feedId}-c1`,
      user: "Nova",
      avatar: COMMENT_AVATARS.Nova,
      message: `This ${item.type === "video" ? "clip" : "post"} is clean. Need more like this.`,
    },
    {
      id: `${item.feedId}-c2`,
      user: "RiftKing",
      avatar: COMMENT_AVATARS.RiftKing,
      message: "Queueing this with my group tonight.",
    },
    {
      id: `${item.feedId}-c3`,
      user: "Echo",
      avatar: COMMENT_AVATARS.Echo,
      message: "Drop your setup details in the next one.",
    },
  ];
}

export default function NewsScreen() {
  const router = useRouter();
  const { accessToken, loading: authLoading, expireSession } = useAuth();
  const params = useLocalSearchParams<{
    focusVideoId?: string;
    focusFrom?: string;
    searchOrder?: string;
    refresh?: string;
    createdTitle?: string;
  }>();
  const responsive = useResponsive();
  const { showToast } = useToast();
  const insets = useSafeAreaInsets();
  const initialFeedSeed = useMemo(
    () => NEWS_FEED.map((item) => ({ ...item, description: "", caption: "", source: "seed" })),
    [],
  );
  const initialFeed = useMemo(() => createInitialFeed(initialFeedSeed), [initialFeedSeed]);
  const [isFeedLoading, setIsFeedLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isPaginating, setIsPaginating] = useState(false);
  const [feedError, setFeedError] = useState<string | null>(null);

  const { value: feedItems, setValue: setFeedItems } = useLocalCache<FeedEntry[]>(
    "news:cached-feed-items",
    initialFeed,
  );
  const { value: savedIds, setValue: setSavedIds } = useLocalCache<string[]>(
    "news:saved-ids",
    [],
  );
  const { value: likedCache, setValue: setLikedCache } = useLocalCache<string[]>(
    "news:liked-ids",
    [],
  );
  const { value: sharedIds, setValue: setSharedIds } = useLocalCache<string[]>(
    "news:shared-ids",
    [],
  );
  const {
    selectedIds: likedIds,
    setSelectedIds: setLikedIds,
    isSelected: isLiked,
    toggle: toggleOptimisticLike,
  } = useOptimisticToggle([]);
  const [activePostMenu, setActivePostMenu] = useState<FeedEntry | null>(null);
  const [commentsTarget, setCommentsTarget] = useState<FeedEntry | null>(null);
  const [whyTarget, setWhyTarget] = useState<FeedEntry | null>(null);
  const [whyLoading, setWhyLoading] = useState(false);
  const [whyError, setWhyError] = useState<string | null>(null);
  const [whyReasons, setWhyReasons] = useState<string[]>([]);
  const [whySignals, setWhySignals] = useState<Record<string, number>>({});
  const [commentThreads, setCommentThreads] = useState<Record<string, CommentItem[]>>({});
  const [replyCounts, setReplyCounts] = useState<Record<string, number>>({});
  const [commentDraft, setCommentDraft] = useState("");
  const [shareTarget, setShareTarget] = useState<FeedEntry | null>(null);
  const [viewportHeight, setViewportHeight] = useState(responsive.height);
  const commentsSheetTranslateY = useRef(new Animated.Value(0)).current;

  const nextLoopRef = useRef(INITIAL_LOOP_COUNT);
  const nextPageUrlRef = useRef<string | null>(null);
  const pageIndexRef = useRef(1);
  const paginationEnabledRef = useRef(false);
  const feedSeedRef = useRef<FeedSeed[]>(initialFeedSeed);
  const appendLockRef = useRef(false);
  const handledFocusVideoIdRef = useRef<string | null>(null);
  const handledRefreshKeyRef = useRef<string | null>(null);
  const handledCreateSuccessKeyRef = useRef<string | null>(null);
  const feedListRef = useRef<FlatList<FeedEntry> | null>(null);
  const commentsListRef = useRef<FlatList<CommentItem> | null>(null);
  const lastMediaTapRef = useRef<{ feedId: string; at: number } | null>(null);
  const visibleSinceRef = useRef<Record<string, number>>({});
  const passiveSkippedIdsRef = useRef<Set<string>>(new Set());
  const engagedFeedIdsRef = useRef<Set<string>>(new Set());

  const safeTop = Math.max(insets.top, responsive.safeTopInset) + responsive.headerTopSpacing;
  const bottomSafeInset = Math.max(insets.bottom, responsive.safeBottomInset);
  const horizontalPadding = responsive.horizontalPadding;
  const itemHeight = Math.max(viewportHeight, 1);
  const actionRailBottom = bottomSafeInset + 74;
  const actionRailRight = Math.max(8, Math.round(horizontalPadding * 0.4));
  const bottomMetaOffset = bottomSafeInset + 10;
  const focusVideoId = typeof params.focusVideoId === "string" ? params.focusVideoId : "";
  const focusFrom = typeof params.focusFrom === "string" ? params.focusFrom : "";
  const createdTitle = typeof params.createdTitle === "string" ? params.createdTitle : "";
  const refreshParam = typeof params.refresh === "string" ? params.refresh : "";
  const searchOrderParam = typeof params.searchOrder === "string" ? params.searchOrder : "";
  const orderedSearchIds = useMemo(
    () =>
      searchOrderParam
        .split(",")
        .map((value) => value.trim())
        .filter(Boolean),
    [searchOrderParam],
  );
  const isSearchPlaybackMode = focusFrom === "search" && orderedSearchIds.length > 0;
  const searchPlaybackItems = useMemo(() => {
    if (!isSearchPlaybackMode) return [];

    const seedById = new Map(initialFeedSeed.map((item) => [item.id, item]));
    return orderedSearchIds
      .map((id, index) => {
        const item = seedById.get(id);
        if (!item) return null;
        return {
          ...item,
          feedId: `${item.id}-search-${index}`,
        } satisfies FeedEntry;
      })
      .filter(Boolean) as FeedEntry[];
  }, [initialFeedSeed, isSearchPlaybackMode, orderedSearchIds]);
  const visibleFeedItems = isSearchPlaybackMode ? searchPlaybackItems : feedItems;

  const activeComments = useMemo(() => {
    if (!commentsTarget) return [];
    return commentThreads[commentsTarget.feedId] ?? buildCommentPreview(commentsTarget);
  }, [commentThreads, commentsTarget]);

  const viewabilityConfig = useMemo(
    () => ({
      itemVisiblePercentThreshold: 80,
    }),
    [],
  );

  const onViewableItemsChanged = useRef(
    ({ changed }: { changed: Array<ViewToken & { item: FeedEntry }> }) => {
      for (const change of changed) {
        const feedId = change.item?.feedId;
        if (!feedId) continue;

        if (change.isViewable) {
          visibleSinceRef.current[feedId] = Date.now();
          continue;
        }

        const seenAt = visibleSinceRef.current[feedId];
        delete visibleSinceRef.current[feedId];
        if (!seenAt) continue;

        const visibleForMs = Date.now() - seenAt;
        if (
          visibleForMs <= PASSIVE_SKIP_MAX_VISIBLE_MS &&
          !engagedFeedIdsRef.current.has(feedId) &&
          !passiveSkippedIdsRef.current.has(feedId)
        ) {
          // Weak signal only. Keep local for future ranking/analytics use.
          passiveSkippedIdsRef.current.add(feedId);
        }
      }
    },
  ).current;

  const isSaved = useCallback(
    (feedId: string) => savedIds.includes(feedId),
    [savedIds],
  );
  const isShared = useCallback(
    (feedId: string) => sharedIds.includes(feedId),
    [sharedIds],
  );

  useEffect(() => {
    setLikedIds(likedCache);
  }, [likedCache, setLikedIds]);

  useEffect(() => {
    if (!focusVideoId || visibleFeedItems.length === 0 || itemHeight <= 1) return;
    if (handledFocusVideoIdRef.current === focusVideoId) return;
    const focusIndex = visibleFeedItems.findIndex((item) => item.id === focusVideoId);
    if (focusIndex < 0) return;
    handledFocusVideoIdRef.current = focusVideoId;

    requestAnimationFrame(() => {
      feedListRef.current?.scrollToIndex({
        index: focusIndex,
        animated: true,
        viewPosition: 0,
      });
    });
  }, [focusVideoId, itemHeight, visibleFeedItems]);

  const markEngaged = useCallback((feedId: string) => {
    engagedFeedIdsRef.current.add(feedId);
  }, []);

  const openCreatorProfile = useCallback(
    (item: FeedEntry) => {
      router.push({
        pathname: "/(tabs)/user-profile",
        params: {
          userId: String(item.id),
          name: item.author,
          avatar: AUTHOR_AVATARS[item.author] || CURRENT_USER_AVATAR,
          status: "online",
          currentGame: item.game,
          source: "feed",
        },
      });
    },
    [router],
  );

  const toggleLike = async (item: FeedEntry, likeOnly = false) => {
    const wasLiked = likedIds.includes(item.feedId);
    if (likeOnly && wasLiked) return;

    const undoToggle = toggleOptimisticLike(item.feedId);
    markEngaged(item.feedId);

    setLikedCache((prev) =>
      prev.includes(item.feedId)
        ? prev.filter((value) => value !== item.feedId)
        : [...prev, item.feedId],
    );

    if (!wasLiked && accessToken && item.backendPostId) {
      try {
        await likePost(accessToken, item.backendPostId);
      } catch {
        undoToggle();
        setLikedCache((prev) => prev.filter((value) => value !== item.feedId));
        showToast({ message: "Unable to like post right now." });
        return;
      }
    }

    if (!wasLiked) {
      showToast({
        message: "Post liked",
        actionLabel: "Undo",
        onAction: () => {
          undoToggle();
          setLikedCache((prev) => prev.filter((value) => value !== item.feedId));
        },
      });
    }
  };

  const toggleSave = (feedId: string) => {
    setSavedIds((prev) =>
      prev.includes(feedId) ? prev.filter((item) => item !== feedId) : [...prev, feedId],
    );
  };

  const appendFeedItems = useCallback(() => {
    if (appendLockRef.current) return;

    // If backend pagination is available, use it first.
    if (paginationEnabledRef.current && nextPageUrlRef.current && accessToken) {
      appendLockRef.current = true;
      setIsPaginating(true);
      setFeedError(null);

      void listFeedPage(accessToken, nextPageUrlRef.current)
        .then((page) => {
          const mapped = page.results.map(mapPostToNewsItem);
          nextPageUrlRef.current = page.next;
          paginationEnabledRef.current = page.paginationEnabled;
          const pageKey = pageIndexRef.current;
          pageIndexRef.current += 1;
          setFeedItems((prev) => [...prev, ...createLoop(mapped, pageKey, "page")]);
        })
        .catch((error) => {
          setFeedError(error instanceof Error ? error.message : "Unable to load more posts.");
        })
        .finally(() => {
          appendLockRef.current = false;
          setIsPaginating(false);
        });
      return;
    }

    // Fallback: repeat current seed in loop mode for infinite preview.
    if (feedSeedRef.current.length === 0) return;
    appendLockRef.current = true;
    const loop = nextLoopRef.current;
    setFeedItems((prev) => [...prev, ...createLoop(feedSeedRef.current, loop, "loop")]);
    nextLoopRef.current = loop + 1;

    requestAnimationFrame(() => {
      appendLockRef.current = false;
    });
  }, [accessToken, setFeedItems]);

  const fetchBackendFeed = useCallback(async (mode: "initial" | "refresh" = "initial") => {
    if (authLoading) {
      if (mode !== "refresh") {
        setIsFeedLoading(true);
      }
      return;
    }

    if (!accessToken) {
      setIsFeedLoading(false);
      setFeedError(SESSION_EXPIRED_MESSAGE);
      return;
    }

    if (mode === "refresh") {
      setIsRefreshing(true);
    } else {
      setIsFeedLoading(true);
    }
    setFeedError(null);

    try {
      const page = await listFeedPage(accessToken);
      const posts = page.results;
      const mapped = posts.map(mapPostToNewsItem);
      const shuffled = mode === "refresh" ? shuffleFeedSeed(mapped, feedSeedRef.current[0]?.id) : mapped;

      paginationEnabledRef.current = page.paginationEnabled;
      nextPageUrlRef.current = page.next;
      pageIndexRef.current = 1;

      if (page.paginationEnabled) {
        // Backend controls list size/order via pages.
        feedSeedRef.current = shuffled;
        nextLoopRef.current = 1;
        setFeedItems(createLoop(shuffled, 0, "page"));
        return;
      }

      feedSeedRef.current = shuffled;
      if (shuffled.length === 0) {
        nextLoopRef.current = 0;
        setFeedItems([]);
        return;
      }

      nextLoopRef.current = INITIAL_LOOP_COUNT;
      setFeedItems(createInitialFeed(shuffled));
    } catch (error) {
      setFeedError(error instanceof Error ? error.message : "Unable to load feed.");
    } finally {
      if (mode === "refresh") {
        setIsRefreshing(false);
      } else {
        setIsFeedLoading(false);
      }
    }
  }, [accessToken, authLoading, setFeedItems]);

  useEffect(() => {
    if (isSearchPlaybackMode) {
      setIsFeedLoading(false);
      setIsRefreshing(false);
      setIsPaginating(false);
      setFeedError(null);
      return;
    }
    if (authLoading) return;
    void fetchBackendFeed();
  }, [authLoading, fetchBackendFeed, isSearchPlaybackMode]);

  const requiresSignInRecovery = useMemo(() => {
    return !accessToken || isSessionExpiredMessage(feedError);
  }, [accessToken, feedError]);

  const handleFeedRecovery = useCallback(() => {
    if (requiresSignInRecovery) {
      void expireSession().finally(() => {
        router.replace("/login" as any);
      });
      return;
    }
    void fetchBackendFeed("refresh");
  }, [expireSession, fetchBackendFeed, requiresSignInRecovery, router]);

  useEffect(() => {
    if (refreshParam !== "1") return;
    if (isSearchPlaybackMode) return;
    const refreshKey = `${refreshParam}:${focusVideoId || "none"}`;
    if (handledRefreshKeyRef.current === refreshKey) return;
    handledRefreshKeyRef.current = refreshKey;
    void fetchBackendFeed("refresh");
  }, [fetchBackendFeed, focusVideoId, isSearchPlaybackMode, refreshParam]);

  useEffect(() => {
    if (focusFrom !== "create") return;
    const key = `${focusFrom}:${focusVideoId || "none"}:${createdTitle || "untitled"}`;
    if (handledCreateSuccessKeyRef.current === key) return;
    handledCreateSuccessKeyRef.current = key;
    showToast({
      message: createdTitle ? `Published: ${createdTitle}` : "Post published",
    });
  }, [createdTitle, focusFrom, focusVideoId, showToast]);

  const openChat = (item: FeedEntry) => {
    markEngaged(item.feedId);
    setCommentDraft("");
    setCommentsTarget(item);
    setCommentThreads((prev) => {
      if (prev[item.feedId]) return prev;
      return {
        ...prev,
        [item.feedId]: buildCommentPreview(item),
      };
    });
  };

  const closeCommentsDrawer = () => {
    setCommentDraft("");
    setCommentsTarget(null);
  };

  const resetCommentsDrawerPosition = useCallback(() => {
    commentsSheetTranslateY.stopAnimation();
    commentsSheetTranslateY.setValue(0);
  }, [commentsSheetTranslateY]);

  useEffect(() => {
    if (commentsTarget) {
      resetCommentsDrawerPosition();
    }
  }, [commentsTarget, resetCommentsDrawerPosition]);

  const closeCommentsDrawerWithGesture = useCallback(() => {
    Animated.timing(commentsSheetTranslateY, {
      toValue: Math.max(viewportHeight, 360),
      duration: 180,
      useNativeDriver: true,
    }).start(() => {
      closeCommentsDrawer();
      resetCommentsDrawerPosition();
    });
  }, [closeCommentsDrawer, commentsSheetTranslateY, resetCommentsDrawerPosition, viewportHeight]);

  const commentsDrawerPanResponder = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: (_, gestureState) =>
          gestureState.dy > 8 && Math.abs(gestureState.dy) > Math.abs(gestureState.dx),
        onPanResponderMove: (_, gestureState) => {
          commentsSheetTranslateY.setValue(Math.max(0, gestureState.dy));
        },
        onPanResponderTerminationRequest: () => false,
        onPanResponderRelease: (_, gestureState) => {
          if (gestureState.dy > 120 || gestureState.vy > 1.15) {
            closeCommentsDrawerWithGesture();
            return;
          }

          Animated.spring(commentsSheetTranslateY, {
            toValue: 0,
            useNativeDriver: true,
            tension: 90,
            friction: 12,
          }).start();
        },
        onPanResponderTerminate: () => {
          Animated.spring(commentsSheetTranslateY, {
            toValue: 0,
            useNativeDriver: true,
            tension: 90,
            friction: 12,
          }).start();
        },
      }),
    [closeCommentsDrawerWithGesture, commentsSheetTranslateY],
  );

  const handleSubmitComment = () => {
    if (!commentsTarget) return;
    const nextComment = commentDraft.trim();
    if (!nextComment) return;

    const feedId = commentsTarget.feedId;
    const newThreadComment: CommentItem = {
      id: `${feedId}-u-${Date.now()}`,
      user: "You",
      avatar: CURRENT_USER_AVATAR,
      message: nextComment,
    };

    setCommentThreads((prev) => ({
      ...prev,
      [feedId]: [...(prev[feedId] ?? buildCommentPreview(commentsTarget)), newThreadComment],
    }));
    setReplyCounts((prev) => ({
      ...prev,
      [feedId]: (prev[feedId] ?? 0) + 1,
    }));
    setCommentDraft("");

    requestAnimationFrame(() => {
      commentsListRef.current?.scrollToEnd({ animated: true });
    });
  };

  const registerShareSuccess = async (item: FeedEntry) => {
    if (sharedIds.includes(item.feedId)) return true;
    markEngaged(item.feedId);

    if (accessToken && item.backendPostId) {
      try {
        await sharePost(accessToken, item.backendPostId);
      } catch {
        showToast({ message: "Unable to record share right now." });
        return false;
      }
    }

    setSharedIds((prev) => (prev.includes(item.feedId) ? prev : [...prev, item.feedId]));
    showToast({ message: "Shared successfully." });
    return true;
  };

  const handleSystemShare = async (item: FeedEntry) => {
    const message = `${item.title} · ${item.author}\nhttps://gamemate.app/p/${item.id}`;
    try {
      const result = await Share.share({ message });
      if (result.action === Share.sharedAction) {
        await registerShareSuccess(item);
      }
    } catch {
      // no-op
    }
  };

  const openShareDrawer = async (item: FeedEntry) => {
    setShareTarget(item);
  };

  const handleNotInterested = async (item: FeedEntry, index: number) => {
    markEngaged(item.feedId);
    if (accessToken && item.backendPostId) {
      try {
        await skipPost(accessToken, item.backendPostId);
      } catch {
        showToast({ message: "Unable to skip post right now." });
        return;
      }
    }

    let nextLength = 0;
    if (isSearchPlaybackMode) {
      showToast({ message: "End of search results reached." });
      return;
    }

    setFeedItems((prev) => {
      const next = prev.filter((entry) => entry.feedId !== item.feedId);
      nextLength = next.length;
      return next;
    });
    showToast({ message: "We will show less like this." });

    requestAnimationFrame(() => {
      if (nextLength < 5) {
        appendFeedItems();
      }
      if (nextLength > 0) {
        const nextIndex = Math.min(index, nextLength - 1);
        feedListRef.current?.scrollToIndex({ index: nextIndex, animated: true, viewPosition: 0 });
      }
    });
  };

  const handleShareToFriendDrawer = () => {
    if (!shareTarget) return;
    router.push("/(tabs)/messages");
    Alert.alert("Share", `Choose a friend to share "${shareTarget.title}".`);
  };

  const handleMediaTap = (item: FeedEntry) => {
    const now = Date.now();
    const lastTap = lastMediaTapRef.current;
    if (lastTap && lastTap.feedId === item.feedId && now - lastTap.at <= DOUBLE_TAP_WINDOW_MS) {
      lastMediaTapRef.current = null;
      void toggleLike(item, true);
      return;
    }
    lastMediaTapRef.current = { feedId: item.feedId, at: now };
  };

  const handleReportPost = (item: FeedEntry) => {
    Alert.alert("Report Submitted", `Thanks. "${item.title}" was reported.`);
  };

  const openWhyThis = async (item: FeedEntry) => {
    setWhyTarget(item);
    setWhyLoading(true);
    setWhyError(null);
    setWhySignals({});

    if (!accessToken || !item.backendPostId) {
      setWhyReasons(item.whyReasons && item.whyReasons.length ? item.whyReasons : ["Recently posted"]);
      setWhyLoading(false);
      return;
    }

    try {
      const payload = await explainFeedPost(accessToken, item.backendPostId);
      const data =
        payload && typeof payload === "object" && "data" in payload
          ? ((payload as { data?: ExplainPayload }).data ?? {})
          : (payload as ExplainPayload);
      const reasons = (data.reasons ?? []).map(formatReasonLabel);
      setWhyReasons(reasons.length ? reasons : ["Recently posted"]);
      setWhySignals(data.signals ?? {});
    } catch (error) {
      setWhyError(error instanceof Error ? error.message : "Unable to load explain details.");
      setWhyReasons(item.whyReasons && item.whyReasons.length ? item.whyReasons : ["Recently posted"]);
    } finally {
      setWhyLoading(false);
    }
  };

  const closeWhyThis = () => {
    setWhyTarget(null);
    setWhyError(null);
    setWhyReasons([]);
    setWhySignals({});
  };

  return (
    <View
      style={styles.screen}
      onLayout={(event) => {
        const nextHeight = Math.round(event.nativeEvent.layout.height);
        if (nextHeight > 0 && nextHeight !== viewportHeight) {
          setViewportHeight(nextHeight);
        }
      }}
    >
      {isFeedLoading && visibleFeedItems.length === 0 ? (
        <View style={styles.centerState}>
          <Text style={styles.stateTitle}>Loading feed...</Text>
          <Text style={styles.stateText}>Fetching your latest posts and recommendations.</Text>
        </View>
      ) : null}

      {!isFeedLoading && visibleFeedItems.length === 0 ? (
        <View style={styles.centerState}>
          <Text style={styles.stateTitle}>No feed posts yet</Text>
          <Text style={styles.stateText}>
            {feedError || "Your feed is empty right now. Pull in content by creating posts first."}
          </Text>
          <View style={styles.stateActions}>
            <Button
              variant="primary"
              onPress={handleFeedRecovery}
              size="medium"
            >
              {requiresSignInRecovery ? "Sign In" : "Retry"}
            </Button>
            {requiresSignInRecovery ? (
              <Button variant="secondary" onPress={() => void fetchBackendFeed("refresh")} size="medium">
                Retry
              </Button>
            ) : null}
          </View>
        </View>
      ) : null}

      {!isFeedLoading && visibleFeedItems.length > 0 && feedError ? (
        <View style={styles.errorBanner}>
          <Text style={styles.errorBannerText} numberOfLines={2}>
            {feedError}
          </Text>
          <Pressable
            onPress={handleFeedRecovery}
            accessibilityRole="button"
            accessibilityLabel={requiresSignInRecovery ? "Open sign in" : "Retry feed refresh"}
            style={({ pressed }) => [styles.errorRetryButton, pressed && styles.pressed]}
          >
            <Text style={styles.errorRetryText}>{requiresSignInRecovery ? "Sign In" : "Retry"}</Text>
          </Pressable>
        </View>
      ) : null}

      <FlatList
        ref={feedListRef}
        data={visibleFeedItems}
        keyExtractor={(item) => item.feedId}
        pagingEnabled
        decelerationRate="fast"
        disableIntervalMomentum
        snapToAlignment="start"
        showsVerticalScrollIndicator={false}
        onEndReachedThreshold={0.35}
        onEndReached={isSearchPlaybackMode ? undefined : appendFeedItems}
        refreshing={isSearchPlaybackMode ? false : isRefreshing}
        onRefresh={() => {
          if (isSearchPlaybackMode) return;
          void fetchBackendFeed("refresh");
        }}
        initialNumToRender={3}
        maxToRenderPerBatch={3}
        windowSize={4}
        updateCellsBatchingPeriod={50}
        removeClippedSubviews
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        ListFooterComponent={
          !isSearchPlaybackMode && isPaginating ? (
            <View style={styles.paginationFooter}>
              <Text style={styles.paginationFooterText}>Loading more...</Text>
            </View>
          ) : null
        }
        getItemLayout={(_, index) => ({
          length: itemHeight,
          offset: itemHeight * index,
          index,
        })}
        onScrollToIndexFailed={(info) => {
          setTimeout(() => {
            feedListRef.current?.scrollToIndex({
              index: Math.min(info.index, visibleFeedItems.length - 1),
              animated: true,
              viewPosition: 0,
            });
          }, 80);
        }}
        renderItem={({ item }) => {
          const liked = isLiked(item.feedId);

          return (
            <View style={[styles.feedItem, { height: itemHeight }]}>
              <ExpoImage
                source={{ uri: item.thumbnail }}
                style={styles.media}
                contentFit="cover"
                cachePolicy="memory-disk"
                accessibilityLabel={`${item.title} preview image`}
              />
              <Pressable
                style={styles.mediaTapZone}
                onPress={() => handleMediaTap(item)}
                accessibilityRole="button"
                accessibilityLabel={`Open ${item.title}. Double tap to like.`}
              />

              <View style={[styles.topBar, { top: safeTop, paddingHorizontal: horizontalPadding }]}>
                <Text accessibilityRole="header" style={styles.feedLabel}>
                  Feed
                </Text>
                <View style={styles.topBarActions}>
                  <Pressable
                    onPress={() =>
                      router.push({
                        pathname: "/(tabs)/ai-advisor",
                        params: { source: "feed" },
                      } as any)
                    }
                    accessibilityRole="button"
                    accessibilityLabel="Open recommendations search"
                    style={({ pressed }) => [styles.advisorButton, pressed && styles.pressed]}
                  >
                    <MaterialCommunityIcons name="magnify" size={16} color={colors.onPrimary} />
                  </Pressable>
                  <Pressable
                    onPress={() => {
                      void openWhyThis(item);
                    }}
                    accessibilityRole="button"
                    accessibilityLabel={`Why this post appeared: ${item.title}`}
                    style={({ pressed }) => [styles.infoButton, pressed && styles.pressed]}
                  >
                    <MaterialCommunityIcons name="information-outline" size={16} color={colors.onPrimary} />
                  </Pressable>
                </View>
              </View>

              <View
                style={[
                  styles.actionRail,
                  {
                    right: actionRailRight,
                    bottom: actionRailBottom,
                  },
                ]}
              >
                <Pressable
                  onPress={() => openCreatorProfile(item)}
                  accessibilityRole="button"
                  accessibilityLabel={`Open profile for ${item.author}`}
                  style={({ pressed }) => [styles.profileRailButton, pressed && styles.pressed]}
                >
                  <ExpoImage
                    source={{ uri: AUTHOR_AVATARS[item.author] || CURRENT_USER_AVATAR }}
                    style={styles.profileRailAvatar}
                    contentFit="cover"
                    cachePolicy="memory-disk"
                    accessibilityLabel={`${item.author} avatar`}
                  />
                </Pressable>

                <Pressable
                  onPress={() => {
                    void toggleLike(item);
                  }}
                  accessibilityRole="button"
                  accessibilityLabel={liked ? `Unlike ${item.title}` : `Like ${item.title}`}
                  accessibilityState={{ selected: liked }}
                  style={({ pressed }) => [styles.railButton, pressed && styles.pressed]}
                >
                  <MaterialCommunityIcons
                    name={liked ? "heart" : "heart-outline"}
                    size={32}
                    color={liked ? colors.destructive : colors.text}
                  />
                  <Text style={styles.railCount}>{compactNumber(item.likes + (liked ? 1 : 0))}</Text>
                </Pressable>

                <Pressable
                  onPress={() => openChat(item)}
                  accessibilityRole="button"
                  accessibilityLabel={`Open comments for ${item.title}`}
                  style={({ pressed }) => [styles.railButton, pressed && styles.pressed]}
                >
                  <MaterialCommunityIcons name="message-outline" size={32} color={colors.text} />
                  <Text style={styles.railCount}>
                    {compactNumber(item.comments + (replyCounts[item.feedId] ?? 0))}
                  </Text>
                </Pressable>

                <Pressable
                  onPress={() => {
                    void openShareDrawer(item);
                  }}
                  accessibilityRole="button"
                  accessibilityLabel={`Share ${item.title}`}
                  style={({ pressed }) => [styles.railButton, pressed && styles.pressed]}
                >
                  <MaterialCommunityIcons name="share-variant-outline" size={32} color={colors.text} />
                  <Text style={styles.railCount}>
                    {compactNumber(item.shares + (isShared(item.feedId) ? 1 : 0))}
                  </Text>
                </Pressable>

                <Pressable
                  onPress={() => setActivePostMenu(item)}
                  accessibilityRole="button"
                  accessibilityLabel={`More options for ${item.title}`}
                  style={({ pressed }) => [styles.railButton, pressed && styles.pressed]}
                >
                  <MaterialCommunityIcons name="dots-horizontal" size={32} color={colors.text} />
                </Pressable>
              </View>

              <View
                style={[
                  styles.bottomMeta,
                  {
                    bottom: bottomMetaOffset,
                    left: horizontalPadding,
                    right: horizontalPadding + 90,
                  },
                ]}
              >
                <Text style={styles.title}>{truncateFeedTitle(item.title)}</Text>
                <Text style={styles.description}>{item.caption || item.description || "No description yet."}</Text>
              </View>
            </View>
          );
        }}
      />

      {commentsTarget ? (
        <Modal
          visible
          transparent
          animationType="slide"
          statusBarTranslucent
          onRequestClose={closeCommentsDrawer}
        >
          <KeyboardAvoidingView
            style={styles.drawerRoot}
            behavior={Platform.OS === "ios" ? "padding" : undefined}
          >
            <Pressable
              style={styles.drawerScrim}
              onPress={closeCommentsDrawer}
              accessibilityRole="button"
              accessibilityLabel="Close comments drawer"
            />
            <Animated.View
              style={[
                styles.drawerSheet,
                {
                  paddingBottom: bottomSafeInset + spacing.xs,
                  transform: [{ translateY: commentsSheetTranslateY }],
                },
              ]}
            >
              <View style={styles.drawerDragArea} {...commentsDrawerPanResponder.panHandlers}>
                <View style={styles.drawerHandle} />
                <Text style={styles.drawerTitle}>Comments</Text>
                <Text style={styles.drawerSubtitle}>{commentsTarget.title}</Text>
              </View>
              <View style={styles.drawerListWrap}>
                <FlatList
                  ref={commentsListRef}
                  data={activeComments}
                  keyExtractor={(item) => item.id}
                  contentContainerStyle={styles.drawerListContent}
                  showsVerticalScrollIndicator
                  keyboardShouldPersistTaps="handled"
                  initialNumToRender={8}
                  maxToRenderPerBatch={10}
                  windowSize={5}
                  updateCellsBatchingPeriod={50}
                  removeClippedSubviews
                  renderItem={({ item }) => (
                    <View style={styles.drawerComment}>
                      <ExpoImage
                        source={{ uri: item.avatar }}
                        style={styles.drawerCommentAvatar}
                        contentFit="cover"
                        cachePolicy="memory-disk"
                        accessibilityLabel={`${item.user} profile picture`}
                      />
                      <View style={styles.drawerCommentBody}>
                        <Text style={styles.drawerUser}>{item.user}</Text>
                        <Text style={styles.drawerMessage}>{item.message}</Text>
                      </View>
                    </View>
                  )}
                />
              </View>
              <View style={styles.drawerComposer}>
                <TextInput
                  value={commentDraft}
                  onChangeText={setCommentDraft}
                  placeholder="Reply to this post..."
                  accessibilityLabel="Write a reply"
                  mode="flat"
                  {...androidKeyboardCompatProps}
                  style={styles.drawerInput}
                  contentStyle={styles.drawerInputContent}
                  textColor={colors.text}
                  placeholderTextColor={colors.textSecondary}
                  underlineColor={colors.border}
                  activeUnderlineColor={colors.primary}
                  returnKeyType="send"
                  onSubmitEditing={handleSubmitComment}
                  blurOnSubmit={false}
                />
                <Pressable
                  onPress={handleSubmitComment}
                  accessibilityRole="button"
                  accessibilityLabel="Send reply"
                  disabled={!commentDraft.trim()}
                  style={({ pressed }) => [
                    styles.drawerSendButton,
                    !commentDraft.trim() && styles.drawerSendButtonDisabled,
                    pressed && styles.pressed,
                  ]}
                >
                  <MaterialCommunityIcons name="send" size={20} color={colors.onPrimary} />
                </Pressable>
              </View>
            </Animated.View>
          </KeyboardAvoidingView>
        </Modal>
      ) : null}

      {activePostMenu ? (
        <ActionSheet
          visible
          title={activePostMenu.title}
          subtitle="Post options"
          onClose={() => setActivePostMenu(null)}
          options={[
            {
              id: "why",
              label: "Why this appeared",
              icon: "information-outline",
              onPress: () => {
                void openWhyThis(activePostMenu);
              },
            },
            {
              id: "share",
              label: "Share",
              icon: "share-variant-outline",
              onPress: () => {
                void openShareDrawer(activePostMenu);
              },
            },
            {
              id: "not_interested",
              label: "Not interested",
              icon: "skip-next-outline",
              onPress: () => {
                const index = feedItems.findIndex((entry) => entry.feedId === activePostMenu.feedId);
                void handleNotInterested(activePostMenu, Math.max(index, 0));
              },
            },
            {
              id: "save",
              label: isSaved(activePostMenu.feedId) ? "Remove from Saved" : "Save Post",
              icon: isSaved(activePostMenu.feedId)
                ? "bookmark-remove-outline"
                : "bookmark-outline",
              onPress: () => toggleSave(activePostMenu.feedId),
            },
            {
              id: "report",
              label: "Report",
              icon: "flag-outline",
              destructive: true,
              onPress: () => handleReportPost(activePostMenu),
            },
          ]}
        />
      ) : null}

      {shareTarget ? (
        <ActionSheet
          visible
          title="Share"
          subtitle={shareTarget.title}
          onClose={() => setShareTarget(null)}
          options={[
            {
              id: "friends",
              label: "Share to Friends Drawer",
              icon: "account-group-outline",
              onPress: handleShareToFriendDrawer,
            },
            {
              id: "contacts",
              label: "Share to Contacts",
              icon: "account-box-outline",
              onPress: () => {
                void handleSystemShare(shareTarget);
              },
            },
            {
              id: "copy",
              label: "Copy Link",
              icon: "content-copy",
              onPress: () => {
                const link = `https://gamemate.app/p/${shareTarget.id}`;
                Alert.alert("Link Ready", link);
              },
            },
          ]}
        />
      ) : null}

      {whyTarget ? (
        <Modal visible transparent animationType="slide" statusBarTranslucent onRequestClose={closeWhyThis}>
          <View style={styles.whyRoot}>
            <Pressable
              style={styles.whyScrim}
              onPress={closeWhyThis}
              accessibilityRole="button"
              accessibilityLabel="Close why this appeared"
            />
            <View style={styles.whySheet}>
              <View style={styles.whyHandle} />
              <Text style={styles.whyTitle}>Why this appeared</Text>
              <Text style={styles.whySubtitle}>{whyTarget.title}</Text>

              {whyLoading ? (
                <View style={styles.whyLoadingWrap}>
                  <ActivityIndicator color={colors.primary} />
                  <Text style={styles.whyLoadingText}>Loading reasons...</Text>
                </View>
              ) : null}

              {!whyLoading && whyError ? <Text style={styles.whyErrorText}>{whyError}</Text> : null}

              {!whyLoading ? (
                <View style={styles.whyReasonsWrap}>
                  {whyReasons.map((reason, reasonIndex) => (
                    <View key={`${reason}-${reasonIndex}`} style={styles.whyReasonRow}>
                      <MaterialCommunityIcons
                        name="check-circle-outline"
                        size={16}
                        color={colors.primary}
                      />
                      <Text style={styles.whyReasonLabel}>{reason}</Text>
                    </View>
                  ))}
                </View>
              ) : null}

              {!whyLoading &&
              (Number(whySignals.likes ?? 0) > 0 ||
                Number(whySignals.comments ?? 0) > 0 ||
                Number(whySignals.shares ?? 0) > 0) ? (
                <View style={styles.whySignalsWrap}>
                  <Text style={styles.whySignalsTitle}>Community activity</Text>
                  <Text style={styles.whySignalsText}>
                    {compactNumber(Number(whySignals.likes ?? 0))} likes ·{" "}
                    {compactNumber(Number(whySignals.comments ?? 0))} comments ·{" "}
                    {compactNumber(Number(whySignals.shares ?? 0))} shares
                  </Text>
                </View>
              ) : null}
            </View>
          </View>
        </Modal>
      ) : null}

    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  centerState: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 20,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
    backgroundColor: colors.background,
  },
  stateTitle: {
    color: colors.text,
    fontSize: 20,
    fontWeight: "800",
    textAlign: "center",
  },
  stateText: {
    color: colors.textSecondary,
    fontSize: 14,
    lineHeight: 20,
    textAlign: "center",
    maxWidth: 320,
  },
  stateActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  errorBanner: {
    position: "absolute",
    top: 58,
    left: spacing.md,
    right: spacing.md,
    zIndex: 30,
    backgroundColor: "rgba(195,45,45,0.92)",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.22)",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.sm,
  },
  errorBannerText: {
    flex: 1,
    color: colors.text,
    fontSize: 13,
    fontWeight: "700",
  },
  errorRetryButton: {
    backgroundColor: "rgba(255,255,255,0.92)",
    borderRadius: 999,
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: 6,
  },
  errorRetryText: {
    color: colors.onPrimary,
    fontSize: 12,
    fontWeight: "800",
  },
  paginationFooter: {
    paddingVertical: spacing.md,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(15,15,15,0.72)",
  },
  paginationFooterText: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: "700",
  },
  feedItem: {
    width: "100%",
    backgroundColor: colors.background,
  },
  media: {
    ...StyleSheet.absoluteFillObject,
    width: "100%",
    height: "100%",
  },
  mediaTapZone: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1,
  },
  topBar: {
    position: "absolute",
    left: 0,
    right: 0,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    zIndex: 6,
    elevation: 6,
  },
  topBarActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
  advisorButton: {
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.primary,
    backgroundColor: colors.primary,
    width: 34,
    height: 34,
  },
  infoButton: {
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.primary,
    backgroundColor: colors.primary,
    width: 34,
    height: 34,
  },
  feedLabel: {
    color: colors.text,
    fontSize: 30,
    lineHeight: 36,
    fontWeight: "800",
  },
  actionRail: {
    position: "absolute",
    alignItems: "center",
    gap: spacing.md,
    zIndex: 5,
  },
  profileRailButton: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: "center",
    justifyContent: "center",
  },
  profileRailAvatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.65)",
  },
  railButton: {
    minWidth: 60,
    minHeight: 60,
    alignItems: "center",
    justifyContent: "center",
  },
  railCount: {
    color: colors.text,
    fontSize: 14,
    fontWeight: "700",
    marginTop: 2,
    textShadowColor: "rgba(0,0,0,0.45)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  bottomMeta: {
    position: "absolute",
  },
  title: {
    color: colors.text,
    fontSize: 28,
    lineHeight: 32,
    fontWeight: "800",
    marginTop: spacing.sm,
  },
  description: {
    color: colors.textSecondary,
    fontSize: 15,
    lineHeight: 22,
    marginTop: spacing.xs,
  },
  whyRoot: {
    flex: 1,
    justifyContent: "flex-end",
  },
  whyScrim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.42)",
  },
  whySheet: {
    backgroundColor: colors.surfaceOverlay,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderTopWidth: 1,
    borderColor: colors.border,
    minHeight: "46%",
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    paddingBottom: spacing.lg,
  },
  whyHandle: {
    width: 44,
    height: 5,
    borderRadius: 999,
    backgroundColor: "#5A5A5A",
    alignSelf: "center",
    marginBottom: spacing.sm,
  },
  whyTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: "800",
  },
  whySubtitle: {
    color: colors.textSecondary,
    fontSize: 13,
    marginTop: 2,
    marginBottom: spacing.md,
  },
  whyLoadingWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  whyLoadingText: {
    color: colors.textSecondary,
    fontSize: 13,
  },
  whyErrorText: {
    color: colors.destructive,
    fontSize: 12,
    marginBottom: spacing.sm,
  },
  whyReasonsWrap: {
    gap: spacing.xs,
  },
  whyReasonRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    paddingVertical: 2,
  },
  whyReasonLabel: {
    color: colors.text,
    fontSize: 14,
    lineHeight: 20,
    flex: 1,
  },
  whySignalsWrap: {
    marginTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.1)",
    paddingTop: spacing.sm,
  },
  whySignalsTitle: {
    color: colors.text,
    fontSize: 13,
    fontWeight: "700",
    marginBottom: 2,
  },
  whySignalsText: {
    color: colors.textSecondary,
    fontSize: 12,
  },
  drawerRoot: {
    flex: 1,
    justifyContent: "flex-end",
  },
  drawerScrim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.42)",
  },
  drawerSheet: {
    backgroundColor: colors.surfaceOverlay,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderTopWidth: 1,
    borderColor: colors.border,
    height: "78%",
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
  },
  drawerDragArea: {
    paddingBottom: spacing.xs,
  },
  drawerHandle: {
    width: 44,
    height: 5,
    borderRadius: 999,
    backgroundColor: "#5A5A5A",
    alignSelf: "center",
    marginBottom: spacing.sm,
  },
  drawerTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: "800",
  },
  drawerSubtitle: {
    color: colors.textSecondary,
    fontSize: 13,
    marginTop: 2,
    marginBottom: spacing.sm,
  },
  drawerListWrap: {
    flex: 1,
    marginBottom: spacing.xs,
  },
  drawerListContent: {
    paddingBottom: spacing.sm,
  },
  drawerComment: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingHorizontal: spacing.xs,
    paddingVertical: spacing.sm + 2,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.08)",
  },
  drawerCommentAvatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    marginRight: spacing.sm,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.25)",
  },
  drawerCommentBody: {
    flex: 1,
  },
  drawerUser: {
    color: colors.text,
    fontSize: 14,
    fontWeight: "700",
  },
  drawerMessage: {
    color: colors.textSecondary,
    fontSize: 14,
    marginTop: 2,
    lineHeight: 20,
  },
  drawerComposer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: spacing.md,
    gap: spacing.sm,
  },
  drawerInput: {
    flex: 1,
    minHeight: 54,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    backgroundColor: colors.surfaceRaised,
  },
  drawerInputContent: {
    fontSize: 14,
    minHeight: 52,
    paddingHorizontal: 10,
  },
  drawerSendButton: {
    width: 54,
    height: 54,
    borderRadius: 27,
    borderWidth: 1,
    borderColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.primary,
  },
  drawerSendButtonDisabled: {
    opacity: 0.5,
  },
  pressed: {
    opacity: 0.72,
  },
});
