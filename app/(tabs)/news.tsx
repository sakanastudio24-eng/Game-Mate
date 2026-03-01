import { useRouter } from "expo-router";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import React, { useCallback, useRef, useState } from "react";
import { Alert, FlatList, Image, Pressable, Share, StyleSheet, View } from "react-native";
import { Text } from "react-native-paper";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ActionSheet } from "../../src/components/ui/ActionSheet";
import { AUTHOR_AVATARS, NEWS_FEED, NewsFeedItem } from "../../src/lib/content-data";
import { useResponsive } from "../../src/lib/responsive";
import { colors, spacing } from "../../src/lib/theme";

interface FeedEntry extends NewsFeedItem {
  feedId: string;
}

const INITIAL_LOOP_COUNT = 3;

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

export default function NewsScreen() {
  const router = useRouter();
  const responsive = useResponsive();
  const insets = useSafeAreaInsets();

  const [feedItems, setFeedItems] = useState<FeedEntry[]>(() => createInitialFeed());
  const [likedIds, setLikedIds] = useState<string[]>([]);
  const [savedIds, setSavedIds] = useState<string[]>([]);
  const [activePostMenu, setActivePostMenu] = useState<FeedEntry | null>(null);
  const [shareTarget, setShareTarget] = useState<{ title: string; message: string } | null>(null);
  const [viewportHeight, setViewportHeight] = useState(responsive.height);

  const nextLoopRef = useRef(INITIAL_LOOP_COUNT);
  const appendLockRef = useRef(false);

  const safeTop = Math.max(insets.top, responsive.safeTopInset) + responsive.headerTopSpacing;
  const tabClearance = Math.max(insets.bottom, responsive.safeBottomInset) + responsive.tabBarBaseHeight;
  const horizontalPadding = responsive.horizontalPadding;
  const itemHeight = Math.max(viewportHeight, 1);

  const isLiked = useCallback(
    (feedId: string) => likedIds.includes(feedId),
    [likedIds],
  );

  const isSaved = useCallback(
    (feedId: string) => savedIds.includes(feedId),
    [savedIds],
  );

  const toggleLike = (feedId: string) => {
    setLikedIds((prev) =>
      prev.includes(feedId) ? prev.filter((item) => item !== feedId) : [...prev, feedId],
    );
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
    router.push("/(tabs)/messages");
    Alert.alert("Comments", `Opening comments for "${item.title}".`);
  };

  const handleSystemShare = async (message: string) => {
    try {
      await Share.share({ message });
    } catch {
      // no-op
    }
  };

  const openShareDrawer = (item: FeedEntry) => {
    setShareTarget({
      title: item.title,
      message: `${item.title} · ${item.author}`,
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
                {item.duration ? (
                  <View style={styles.durationBadge}>
                    <MaterialCommunityIcons name="play" size={12} color={colors.text} />
                    <Text style={styles.durationText}>{item.duration}</Text>
                  </View>
                ) : null}
              </View>

              <View
                style={[
                  styles.actionRail,
                  {
                    right: horizontalPadding,
                    bottom: tabClearance + spacing.xxl + 36,
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
                    size={26}
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
                  <MaterialCommunityIcons name="message-outline" size={26} color={colors.text} />
                  <Text style={styles.railCount}>{compactNumber(item.comments)}</Text>
                </Pressable>

                <Pressable
                  onPress={() => setActivePostMenu(item)}
                  accessibilityRole="button"
                  accessibilityLabel={`More options for ${item.title}`}
                  style={({ pressed }) => [styles.railButton, pressed && styles.pressed]}
                >
                  <MaterialCommunityIcons name="dots-horizontal" size={26} color={colors.text} />
                </Pressable>
              </View>

              <View
                style={[
                  styles.bottomMeta,
                  {
                    bottom: tabClearance + spacing.md,
                    left: horizontalPadding,
                    right: horizontalPadding + 76,
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
                <Text style={styles.title}>{item.title}</Text>
                <Text style={styles.description}>
                  {item.type === "video" ? "Live clip and highlights" : "Editorial update"} ·{" "}
                  {item.category.toUpperCase()}
                </Text>
              </View>
            </View>
          );
        }}
      />

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
    minWidth: 48,
    minHeight: 48,
    alignItems: "center",
    justifyContent: "center",
  },
  railCount: {
    color: colors.text,
    fontSize: 12,
    fontWeight: "700",
    marginTop: 2,
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
    fontSize: 14,
    lineHeight: 20,
    marginTop: spacing.xs,
  },
  pressed: {
    opacity: 0.72,
  },
});
