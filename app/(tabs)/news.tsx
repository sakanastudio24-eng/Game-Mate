import { useRouter } from "expo-router";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Alert,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  Share,
  StyleSheet,
  View,
} from "react-native";
import { Text, TextInput } from "react-native-paper";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ActionSheet } from "../../src/components/ui/ActionSheet";
import { useToast } from "../../src/components/ui/ToastProvider";
import { AUTHOR_AVATARS, NEWS_FEED, NewsFeedItem } from "../../src/lib/content-data";
import { CURRENT_USER_AVATAR } from "../../src/lib/current-user";
import { useLocalCache } from "../../src/lib/hooks/useLocalCache";
import { useOptimisticToggle } from "../../src/lib/hooks/useOptimisticToggle";
import { useResponsive } from "../../src/lib/responsive";
import { colors, spacing } from "../../src/lib/theme";

interface FeedEntry extends NewsFeedItem {
  feedId: string;
}

interface CommentItem {
  id: string;
  user: string;
  avatar: string;
  message: string;
}

const INITIAL_LOOP_COUNT = 3;
const COMMENT_AVATARS: Record<string, string> = {
  Nova: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop",
  RiftKing:
    "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop",
  Echo: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop",
  You: CURRENT_USER_AVATAR,
};

function createLoop(loopIndex: number): FeedEntry[] {
  return NEWS_FEED.map((item, index) => ({
    ...item,
    feedId: `${item.id}-${loopIndex}-${index}`,
  }));
}

function createInitialFeed(): FeedEntry[] {
  const items: FeedEntry[] = [];
  for (let loop = 0; loop < INITIAL_LOOP_COUNT; loop += 1) {
    items.push(...createLoop(loop));
  }
  return items;
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
  const responsive = useResponsive();
  const { showToast } = useToast();
  const insets = useSafeAreaInsets();
  const initialFeed = useMemo(() => createInitialFeed(), []);

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
  const [commentThreads, setCommentThreads] = useState<Record<string, CommentItem[]>>({});
  const [replyCounts, setReplyCounts] = useState<Record<string, number>>({});
  const [commentDraft, setCommentDraft] = useState("");
  const [shareTarget, setShareTarget] = useState<{
    feedId: string;
    title: string;
    message: string;
  } | null>(null);
  const [viewportHeight, setViewportHeight] = useState(responsive.height);

  const nextLoopRef = useRef(INITIAL_LOOP_COUNT);
  const appendLockRef = useRef(false);
  const commentsListRef = useRef<FlatList<CommentItem> | null>(null);

  const safeTop = Math.max(insets.top, responsive.safeTopInset) + responsive.headerTopSpacing;
  const bottomSafeInset = Math.max(insets.bottom, responsive.safeBottomInset);
  const horizontalPadding = responsive.horizontalPadding;
  const itemHeight = Math.max(viewportHeight, 1);
  const actionRailBottom = bottomSafeInset + 74;
  const actionRailRight = horizontalPadding + Math.max(16, Math.round(responsive.width * 0.05));
  const bottomMetaOffset = bottomSafeInset + 10;

  const activeComments = useMemo(() => {
    if (!commentsTarget) return [];
    return commentThreads[commentsTarget.feedId] ?? buildCommentPreview(commentsTarget);
  }, [commentThreads, commentsTarget]);

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

  const toggleLike = (feedId: string) => {
    const wasLiked = likedIds.includes(feedId);
    const undoToggle = toggleOptimisticLike(feedId);

    setLikedCache((prev) =>
      prev.includes(feedId) ? prev.filter((item) => item !== feedId) : [...prev, feedId],
    );

    if (!wasLiked) {
      showToast({
        message: "Post liked",
        actionLabel: "Undo",
        onAction: () => {
          undoToggle();
          setLikedCache((prev) => prev.filter((item) => item !== feedId));
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

    appendLockRef.current = true;
    const loop = nextLoopRef.current;
    setFeedItems((prev) => [...prev, ...createLoop(loop)]);
    nextLoopRef.current = loop + 1;

    requestAnimationFrame(() => {
      appendLockRef.current = false;
    });
  }, []);

  const openChat = (item: FeedEntry) => {
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

  const handleSystemShare = async (message: string) => {
    try {
      await Share.share({ message });
    } catch {
      // no-op
    }
  };

  const openShareDrawer = (item: FeedEntry) => {
    setSharedIds((prev) => (prev.includes(item.feedId) ? prev : [...prev, item.feedId]));
    setShareTarget({
      feedId: item.feedId,
      title: item.title,
      message: `${item.title} · ${item.author}\nhttps://gamemate.app/p/${item.id}`,
    });
  };

  const handleShareToFriendDrawer = () => {
    if (!shareTarget) return;
    router.push("/(tabs)/messages");
    Alert.alert("Share", `Choose a friend to share "${shareTarget.title}".`);
  };

  const handleReportPost = (item: FeedEntry) => {
    Alert.alert("Report Submitted", `Thanks. "${item.title}" was reported.`);
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
      <FlatList
        data={feedItems}
        keyExtractor={(item) => item.feedId}
        pagingEnabled
        decelerationRate="fast"
        disableIntervalMomentum
        snapToAlignment="start"
        showsVerticalScrollIndicator={false}
        onEndReachedThreshold={0.35}
        onEndReached={appendFeedItems}
        initialNumToRender={3}
        maxToRenderPerBatch={3}
        windowSize={4}
        removeClippedSubviews
        getItemLayout={(_, index) => ({
          length: itemHeight,
          offset: itemHeight * index,
          index,
        })}
        renderItem={({ item }) => {
          const liked = isLiked(item.feedId);

          return (
            <View style={[styles.feedItem, { height: itemHeight }]}>
              <Image
                source={{ uri: item.thumbnail }}
                style={styles.media}
                resizeMode="cover"
                accessibilityLabel={`${item.title} preview image`}
              />

              <View style={styles.topScrim} />
              <View style={styles.bottomScrim} />

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
                    <MaterialCommunityIcons name="magnify" size={16} color="#1A1A1A" />
                  </Pressable>
                  {item.duration ? (
                    <View style={styles.durationBadge}>
                      <MaterialCommunityIcons name="play" size={12} color={colors.text} />
                      <Text style={styles.durationText}>{item.duration}</Text>
                    </View>
                  ) : null}
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
                  onPress={() => toggleLike(item.feedId)}
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
                  onPress={() => openShareDrawer(item)}
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
                <View style={styles.authorRow}>
                  <Image
                    source={{ uri: AUTHOR_AVATARS[item.author] }}
                    style={styles.avatar}
                    accessibilityLabel={`${item.author} avatar`}
                  />
                  <View style={styles.authorText}>
                    <Text style={styles.author}>{item.author}</Text>
                    <Text style={styles.date}>{item.date}</Text>
                  </View>
                </View>
                <Text style={styles.title}>{truncateFeedTitle(item.title)}</Text>
                <Text style={styles.description}>
                  {item.game} · {item.category.toUpperCase()} · #{item.hashtags[0]}
                </Text>
              </View>
            </View>
          );
        }}
      />

      <Modal
        visible={commentsTarget !== null}
        transparent
        animationType="slide"
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
          <View style={styles.drawerSheet}>
            <View style={styles.drawerHandle} />
            <Text style={styles.drawerTitle}>Comments</Text>
            <Text style={styles.drawerSubtitle}>{commentsTarget?.title}</Text>
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
                removeClippedSubviews
                renderItem={({ item }) => (
                  <View style={styles.drawerComment}>
                    <Image
                      source={{ uri: item.avatar }}
                      style={styles.drawerCommentAvatar}
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
                <MaterialCommunityIcons name="send" size={20} color="#1A1A1A" />
              </Pressable>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      <ActionSheet
        visible={activePostMenu !== null}
        title={activePostMenu?.title ?? "Post"}
        subtitle="Post options"
        onClose={() => setActivePostMenu(null)}
        options={
          activePostMenu
            ? [
                {
                  id: "share",
                  label: "Share",
                  icon: "share-variant-outline",
                  onPress: () => openShareDrawer(activePostMenu),
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
              ]
            : []
        }
      />

      <ActionSheet
        visible={shareTarget !== null}
        title="Share"
        subtitle={shareTarget?.title}
        onClose={() => setShareTarget(null)}
        options={
          shareTarget
            ? [
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
                    void handleSystemShare(shareTarget.message);
                  },
                },
                {
                  id: "copy",
                  label: "Copy Link",
                  icon: "content-copy",
                  onPress: () => {
                    const link = shareTarget.message.split("\n").slice(-1)[0];
                    Alert.alert("Link Ready", link);
                  },
                },
              ]
            : []
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
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
  topScrim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.22)",
  },
  bottomScrim: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: "55%",
    backgroundColor: "rgba(0,0,0,0.50)",
  },
  topBar: {
    position: "absolute",
    left: 0,
    right: 0,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
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
  feedLabel: {
    color: colors.text,
    fontSize: 30,
    lineHeight: 36,
    fontWeight: "800",
  },
  durationBadge: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: "rgba(26,26,26,0.72)",
    borderWidth: 1,
    borderColor: colors.border,
  },
  durationText: {
    color: colors.text,
    fontSize: 12,
    fontWeight: "700",
    marginLeft: 4,
  },
  actionRail: {
    position: "absolute",
    alignItems: "center",
    gap: spacing.md,
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
  authorRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.42)",
    marginRight: spacing.sm,
  },
  authorText: {
    flex: 1,
  },
  author: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "700",
  },
  date: {
    color: colors.textSecondary,
    fontSize: 13,
    marginTop: 1,
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
  drawerRoot: {
    flex: 1,
    justifyContent: "flex-end",
  },
  drawerScrim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.42)",
  },
  drawerSheet: {
    backgroundColor: "#1F1F1F",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderTopWidth: 1,
    borderColor: colors.border,
    height: "78%",
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
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
    backgroundColor: "#242424",
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
