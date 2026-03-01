import { useRouter } from "expo-router";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { Image as ExpoImage } from "expo-image";
import React, { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Alert,
  Animated,
  FlatList,
  Modal,
  PanResponder,
  Pressable,
  Share,
  StyleSheet,
  View,
} from "react-native";
import { Searchbar, Text } from "react-native-paper";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  AIGroupCandidate,
  AIRecommendationsResponse,
  AIUserProfile,
  getRecommendations,
} from "../../src/ai/advisorClient";
import { AnimatedEntrance } from "../../src/components/ui/AnimatedEntrance";
import { ActionSheet } from "../../src/components/ui/ActionSheet";
import { RecentSearchList } from "../../src/components/ui/RecentSearchList";
import { Skeleton } from "../../src/components/ui/Skeleton";
import { useToast } from "../../src/components/ui/ToastProvider";
import {
  GROUPS_PAGE_SIZE,
  homeContentPrimed,
  SUGGESTED_GROUPS,
} from "../../src/lib/content-data";
import { useDebouncedValue } from "../../src/lib/hooks/useDebouncedValue";
import { useLocalCache } from "../../src/lib/hooks/useLocalCache";
import { mockCurrentUser } from "../../src/lib/mockData";
import { androidKeyboardCompatProps } from "../../src/lib/androidInput";
import { useResponsive } from "../../src/lib/responsive";
import { colors, spacing } from "../../src/lib/theme";

type AISwipeItem = {
  group: (typeof SUGGESTED_GROUPS)[number];
  score: number;
  reasons: string[];
};
type SuggestedGroup = (typeof SUGGESTED_GROUPS)[number];

const SWIPE_ACTION_THRESHOLD = 90;

function mapAiCandidate(group: (typeof SUGGESTED_GROUPS)[number]): AIGroupCandidate {
  const gameKey = group.game.toLowerCase();
  const inferredTags = gameKey.includes("counter")
    ? ["competitive", "ranked", "mic"]
    : gameKey.includes("various")
      ? ["casual", "chill", "teamplay"]
      : gameKey.includes("forza")
        ? ["casual", "learning", "teamplay"]
        : ["casual", "teamplay"];

  return {
    id: group.id,
    game: group.game,
    rankMin: gameKey.includes("counter") ? "silver" : "gold",
    rankMax: gameKey.includes("counter") ? "diamond" : "platinum",
    tags: inferredTags,
    slots: Math.max(1, Math.round(group.members * 0.1)),
    micRequired: inferredTags.includes("mic"),
  };
}

function buildAiProfile(): AIUserProfile {
  return {
    games: mockCurrentUser.gamesPlayed,
    rank: mockCurrentUser.rank,
    mic: true,
    tags: ["casual", "teamplay"],
  };
}

interface GroupDiscoverCardProps {
  group: SuggestedGroup;
  index: number;
  isJoined: boolean;
  groupThumbSize: number;
  horizontalPadding: number;
  contentMaxWidth: number;
  cardRadius: number;
  cardPadding: number;
  touchTargetMin: number;
  buttonHeightSmall: number;
  onOpenGroupDetail: (groupId: string, groupName: string) => void;
  onToggleJoin: (groupId: string, groupName: string) => void;
  onOpenGroupOptions: (groupId: string, groupName: string, game: string) => void;
}

const GroupDiscoverCard = memo(function GroupDiscoverCard({
  group,
  index,
  isJoined,
  groupThumbSize,
  horizontalPadding,
  contentMaxWidth,
  cardRadius,
  cardPadding,
  touchTargetMin,
  buttonHeightSmall,
  onOpenGroupDetail,
  onToggleJoin,
  onOpenGroupOptions,
}: GroupDiscoverCardProps) {
  const handleOpen = useCallback(() => {
    onOpenGroupDetail(group.id, group.name);
  }, [group.id, group.name, onOpenGroupDetail]);

  const handleJoinToggle = useCallback(
    (event: any) => {
      event.stopPropagation();
      onToggleJoin(group.id, group.name);
    },
    [group.id, group.name, onToggleJoin],
  );

  const handleOpenOptions = useCallback(
    (event: any) => {
      event.stopPropagation();
      onOpenGroupOptions(group.id, group.name, group.game);
    },
    [group.game, group.id, group.name, onOpenGroupOptions],
  );

  return (
    <AnimatedEntrance preset="card" delay={80} staggerIndex={index}>
      <View
        style={{
          paddingHorizontal: horizontalPadding,
          maxWidth: contentMaxWidth,
          alignSelf: "center",
          width: "100%",
        }}
      >
        <Pressable
          onPress={handleOpen}
          accessibilityRole="button"
          accessibilityLabel={`${group.name}, ${group.game}, ${group.members} members, ${group.online} online`}
          accessibilityHint="Open group details"
          style={[
            styles.groupCard,
            {
              borderRadius: cardRadius,
              padding: cardPadding,
              width: "100%",
            },
            styles.cardPressable,
          ]}
        >
          <View style={styles.groupRow}>
            <ExpoImage
              source={{ uri: group.thumbnail }}
              style={[styles.groupThumb, { width: groupThumbSize, height: groupThumbSize }]}
              contentFit="cover"
              cachePolicy="memory-disk"
            />

            <View style={styles.groupInfo}>
              <Text style={styles.groupName}>{group.name}</Text>
              <Text style={styles.groupGame}>{group.game}</Text>
              <Text style={styles.groupMeta}>
                {group.members} members · {group.online} online
              </Text>
            </View>

            <Pressable
              onPress={handleOpenOptions}
              accessibilityRole="button"
              accessibilityLabel={`More options for ${group.name}`}
              style={({ pressed }) => [
                styles.groupOptionsButton,
                {
                  minWidth: touchTargetMin,
                  minHeight: touchTargetMin,
                  borderRadius: touchTargetMin / 2,
                },
                pressed && styles.pressed,
              ]}
              hitSlop={4}
            >
              <MaterialCommunityIcons
                name="dots-vertical"
                size={20}
                color={colors.textSecondary}
              />
            </Pressable>
          </View>

          <View style={styles.groupActionRow}>
            <Pressable
              onPress={handleJoinToggle}
              accessibilityRole="button"
              accessibilityLabel={isJoined ? `Leave ${group.name}` : `Join ${group.name}`}
              accessibilityState={{ selected: isJoined }}
              style={({ pressed }) => [
                styles.groupJoinButton,
                { minHeight: buttonHeightSmall },
                isJoined && styles.groupJoinedButton,
                pressed && styles.pressed,
              ]}
            >
              <Text style={[styles.groupJoinButtonText, isJoined && styles.groupJoinedButtonText]}>
                {isJoined ? "Joined" : "Join"}
              </Text>
            </Pressable>
          </View>
        </Pressable>
      </View>
    </AnimatedEntrance>
  );
});

export default function GroupsScreen() {
  const router = useRouter();
  const responsive = useResponsive();
  const { showToast } = useToast();
  const insets = useSafeAreaInsets();
  const safeTop = Math.max(insets.top, responsive.safeTopInset) + responsive.headerTopSpacing;
  const safeBottom = Math.max(insets.bottom, responsive.safeBottomInset);

  const initialVisible = homeContentPrimed() ? GROUPS_PAGE_SIZE + 1 : GROUPS_PAGE_SIZE;
  const {
    value: joinedGroupIds,
    setValue: setJoinedGroupIds,
  } = useLocalCache<string[]>("groups:joined-ids", []);
  const {
    value: deletedGroupIds,
    setValue: setDeletedGroupIds,
  } = useLocalCache<string[]>("groups:deleted-ids", []);
  const {
    value: recentSearches,
    setValue: setRecentSearches,
    clear: clearRecentSearches,
  } = useLocalCache<string[]>("groups:recent-searches", []);
  const {
    value: lastOpenedGroup,
    setValue: setLastOpenedGroup,
  } = useLocalCache<{ id?: string; name?: string }>("groups:last-opened", {});
  const [queryInput, setQueryInput] = useState("");
  const query = useDebouncedValue(queryInput, 260);
  const [visibleCount, setVisibleCount] = useState(initialVisible);
  const [activeGroupMenu, setActiveGroupMenu] = useState<{
    id: string;
    name: string;
    game: string;
  } | null>(null);
  const [shareTarget, setShareTarget] = useState<{ title: string; message: string } | null>(null);
  const [aiSwipeVisible, setAiSwipeVisible] = useState(false);
  const [aiSwipeLoading, setAiSwipeLoading] = useState(false);
  const [aiSwipeError, setAiSwipeError] = useState<string | null>(null);
  const [aiSwipeItems, setAiSwipeItems] = useState<AISwipeItem[]>([]);
  const groupThumbSize = responsive.isSmallPhone ? 66 : responsive.isLargePhone ? 86 : 78;
  const swipeX = useRef(new Animated.Value(0)).current;

  const filteredGroups = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return SUGGESTED_GROUPS;
    return SUGGESTED_GROUPS.filter((group) =>
      [group.name, group.game].join(" ").toLowerCase().includes(q),
    );
  }, [query]);

  const discoverableGroups = useMemo(
    () =>
      filteredGroups.filter(
        (group) => !joinedGroupIds.includes(group.id) && !deletedGroupIds.includes(group.id),
      ),
    [deletedGroupIds, filteredGroups, joinedGroupIds],
  );

  useEffect(() => {
    setVisibleCount(initialVisible);
  }, [query, initialVisible]);

  useEffect(() => {
    const cleaned = query.trim();
    if (!cleaned) return;
    setRecentSearches((previous) => {
      const withoutMatch = previous.filter(
        (item) => item.toLowerCase() !== cleaned.toLowerCase(),
      );
      return [cleaned, ...withoutMatch].slice(0, 8);
    });
  }, [query, setRecentSearches]);

  const visibleGroups = useMemo(
    () => discoverableGroups.slice(0, visibleCount),
    [discoverableGroups, visibleCount],
  );

  const totalOnline = SUGGESTED_GROUPS.reduce((total, group) => total + group.online, 0);

  const toggleJoin = useCallback((id: string, groupName: string) => {
    const wasJoined = joinedGroupIds.includes(id);
    setJoinedGroupIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );

    if (!wasJoined) {
      showToast({
        message: `${groupName} joined`,
        actionLabel: "Undo",
        onAction: () => {
          setJoinedGroupIds((prev) => prev.filter((item) => item !== id));
        },
      });
    }
  }, [joinedGroupIds, setJoinedGroupIds, showToast]);

  const joinGroup = useCallback((id: string, groupName: string) => {
    const wasJoined = joinedGroupIds.includes(id);
    setJoinedGroupIds((prev) => (prev.includes(id) ? prev : [...prev, id]));
    if (!wasJoined) {
      showToast({
        message: `${groupName} joined`,
        actionLabel: "Undo",
        onAction: () => {
          setJoinedGroupIds((prev) => prev.filter((item) => item !== id));
        },
      });
    }
  }, [joinedGroupIds, setJoinedGroupIds, showToast]);

  const loadMoreGroups = useCallback(() => {
    setVisibleCount((prev) => Math.min(prev + GROUPS_PAGE_SIZE, discoverableGroups.length));
  }, [discoverableGroups.length]);

  const handleShareGroupToContacts = async (message: string) => {
    try {
      await Share.share({
        message,
      });
    } catch {
      // no-op preview fallback
    }
  };

  const handleDeleteGroup = useCallback((groupId: string) => {
    setDeletedGroupIds((prev) => (prev.includes(groupId) ? prev : [...prev, groupId]));
    setJoinedGroupIds((prev) => prev.filter((id) => id !== groupId));
  }, [setDeletedGroupIds, setJoinedGroupIds]);

  const openGroupDetail = useCallback((groupId: string, groupName: string) => {
    setLastOpenedGroup({
      id: groupId,
      name: groupName,
    });
    router.push(`/(tabs)/group-detail?groupId=${groupId}`);
  }, [router, setLastOpenedGroup]);

  const openGroupOptions = useCallback((groupId: string, groupName: string, game: string) => {
    setActiveGroupMenu({
      id: groupId,
      name: groupName,
      game,
    });
  }, []);

  const openShareDrawer = useCallback((title: string, message: string) => {
    setShareTarget({ title, message });
  }, []);

  const handleShareToFriends = useCallback((title: string, message: string) => {
    openShareDrawer(title, message);
  }, [openShareDrawer]);

  const handleShareToFriendDrawer = () => {
    if (!shareTarget) return;
    router.push("/(tabs)/messages");
    Alert.alert("Friend Drawer", `Choose a friend in Messages to share "${shareTarget.title}".`);
  };

  const handleReportGroup = useCallback((groupName: string) => {
    Alert.alert("Report Submitted", `Thanks. "${groupName}" was reported for review.`);
  }, []);

  const openAiSwipe = useCallback(async () => {
    setAiSwipeVisible(true);
    setAiSwipeLoading(true);
    setAiSwipeError(null);

    const targetGroups = discoverableGroups.slice(0, 50);
    if (targetGroups.length === 0) {
      setAiSwipeItems([]);
      setAiSwipeLoading(false);
      return;
    }

    try {
      const response = await getRecommendations({
        userProfile: buildAiProfile(),
        groups: targetGroups.map(mapAiCandidate),
      });

      const scoreMap = new Map<string, AIRecommendationsResponse["results"][number]>(
        response.results.map((item) => [item.groupId, item]),
      );

      const ranked: AISwipeItem[] = targetGroups
        .map((group) => {
          const rec = scoreMap.get(group.id);
          return {
            group,
            score: rec?.score ?? 0,
            reasons: rec?.reasons?.slice(0, 3) ?? ["Profile fit pending"],
          };
        })
        .sort((a, b) => b.score - a.score);

      setAiSwipeItems(ranked);
    } catch (error) {
      setAiSwipeError(error instanceof Error ? error.message : "Unable to load matches");
      setAiSwipeItems([]);
    } finally {
      setAiSwipeLoading(false);
    }
  }, [discoverableGroups]);

  const handleSwipeLeft = useCallback(() => {
    const current = aiSwipeItems[0];
    if (!current) return;
    Animated.timing(swipeX, {
      toValue: -Math.max(responsive.width, 320),
      duration: 180,
      useNativeDriver: true,
    }).start(() => {
      setAiSwipeItems((prev) => prev.slice(1));
      swipeX.setValue(0);
    });
  }, [aiSwipeItems, responsive.width, swipeX]);

  const handleSwipeRight = useCallback(() => {
    const current = aiSwipeItems[0];
    if (!current) return;
    Animated.timing(swipeX, {
      toValue: Math.max(responsive.width, 320),
      duration: 180,
      useNativeDriver: true,
    }).start(() => {
      joinGroup(current.group.id, current.group.name);
      setAiSwipeItems((prev) => prev.slice(1));
      swipeX.setValue(0);
    });
  }, [aiSwipeItems, joinGroup, responsive.width, swipeX]);

  const listHeader = useMemo(
    () => (
      <>
        <AnimatedEntrance preset="screen">
          <View
            style={[
              styles.headerWrap,
              {
                paddingTop: safeTop,
                paddingHorizontal: responsive.horizontalPadding,
                maxWidth: responsive.contentMaxWidth,
                alignSelf: "center",
                width: "100%",
              },
            ]}
          >
            <View style={styles.titleRow}>
              <Text
                accessibilityRole="header"
                style={[
                  styles.title,
                  {
                    fontSize: responsive.headerTitleSize + 8,
                    lineHeight: Math.round((responsive.headerTitleSize + 8) * 1.14),
                  },
                ]}
              >
                Groups
              </Text>
              <View style={styles.headerActions}>
                <Pressable
                  onPress={() => router.push("/(tabs)/discover-groups")}
                  accessibilityRole="button"
                  accessibilityLabel="Search groups"
                  style={({ pressed }) => [
                    styles.iconButton,
                    {
                      minWidth: responsive.touchTargetMin,
                      minHeight: responsive.touchTargetMin,
                      width: responsive.iconButtonSize,
                      height: responsive.iconButtonSize,
                      borderRadius: responsive.iconButtonSize / 2,
                    },
                    pressed && styles.pressed,
                  ]}
                  hitSlop={4}
                >
                  <MaterialCommunityIcons name="magnify" size={20} color={colors.text} />
                </Pressable>
                <Pressable
                  onPress={() => router.push("/(tabs)/qr-code")}
                  accessibilityRole="button"
                  accessibilityLabel="Open QR code"
                  style={({ pressed }) => [
                    styles.iconButton,
                    {
                      minWidth: responsive.touchTargetMin,
                      minHeight: responsive.touchTargetMin,
                      width: responsive.iconButtonSize,
                      height: responsive.iconButtonSize,
                      borderRadius: responsive.iconButtonSize / 2,
                    },
                    pressed && styles.pressed,
                  ]}
                  hitSlop={4}
                >
                  <MaterialCommunityIcons name="qrcode" size={20} color={colors.text} />
                </Pressable>
              </View>
            </View>

            <View style={styles.statsRow}>
              <View style={styles.statPrimary}>
                <Text style={styles.statPrimaryText}>{discoverableGroups.length} Discoverable</Text>
              </View>
              <View style={styles.statSecondary}>
                <View style={styles.onlineDot} />
                <Text style={styles.statSecondaryText}>{totalOnline} Online</Text>
              </View>
            </View>

            <Searchbar
              placeholder="Search groups..."
              value={queryInput}
              onChangeText={setQueryInput}
              {...androidKeyboardCompatProps}
              accessibilityLabel="Search groups"
              style={[styles.searchbar, { borderRadius: responsive.searchRadius }]}
              inputStyle={[styles.searchInput, { fontSize: responsive.bodySize }]}
              placeholderTextColor={colors.textSecondary}
            />

            {queryInput.trim().length === 0 ? (
              <RecentSearchList
                items={recentSearches}
                onSelect={setQueryInput}
                onClear={clearRecentSearches}
              />
            ) : null}

            {lastOpenedGroup.id ? (
              <Pressable
                onPress={() =>
                  openGroupDetail(
                    lastOpenedGroup.id ?? SUGGESTED_GROUPS[0].id,
                    lastOpenedGroup.name ?? "Last Group",
                  )
                }
                accessibilityRole="button"
                accessibilityLabel={`Continue with ${lastOpenedGroup.name ?? "last group"}`}
                style={({ pressed }) => [styles.continuePill, pressed && styles.pressed]}
              >
                <MaterialCommunityIcons name="history" size={14} color={colors.primary} />
                <Text style={styles.continuePillText} numberOfLines={1}>
                  Continue: {lastOpenedGroup.name ?? "Last Group"}
                </Text>
              </Pressable>
            ) : null}
          </View>
        </AnimatedEntrance>

        <AnimatedEntrance preset="section" delay={60}>
          <View
            style={[
              styles.sectionHead,
              {
                paddingHorizontal: responsive.horizontalPadding,
                maxWidth: responsive.contentMaxWidth,
                alignSelf: "center",
                width: "100%",
              },
            ]}
          >
            <Text style={[styles.sectionTitle, { fontSize: responsive.sectionTitleSize }]}>Discover Groups</Text>
            <View style={styles.sectionActions}>
              <Pressable
                onPress={openAiSwipe}
                accessibilityRole="button"
                accessibilityLabel="Open swipe group recommendations"
                style={({ pressed }) => [
                  styles.aiSwipeButton,
                  { minHeight: responsive.buttonHeightSmall },
                  pressed && styles.pressed,
                ]}
              >
                <MaterialCommunityIcons name="card-multiple-outline" size={18} color={colors.text} />
              </Pressable>
              <Pressable
                onPress={() => router.push("/(tabs)/create-group")}
                accessibilityRole="button"
                accessibilityLabel="Create a new group"
                style={({ pressed }) => [
                  styles.createButton,
                  { minHeight: responsive.buttonHeightSmall },
                  pressed && styles.pressed,
                ]}
              >
                <MaterialCommunityIcons name="plus" size={16} color="#1A1A1A" />
                <Text style={styles.createButtonText}>Create</Text>
              </Pressable>
            </View>
          </View>
        </AnimatedEntrance>
      </>
    ),
    [
      clearRecentSearches,
      discoverableGroups.length,
      lastOpenedGroup.id,
      lastOpenedGroup.name,
      openAiSwipe,
      openGroupDetail,
      queryInput,
      recentSearches,
      responsive.bodySize,
      responsive.buttonHeightSmall,
      responsive.contentMaxWidth,
      responsive.headerTitleSize,
      responsive.horizontalPadding,
      responsive.iconButtonSize,
      responsive.searchRadius,
      responsive.sectionTitleSize,
      responsive.touchTargetMin,
      router,
      safeTop,
      totalOnline,
    ],
  );

  const listFooter = useMemo(
    () => (
      <>
        {discoverableGroups.length > visibleCount ? (
          <View
            style={{
              paddingHorizontal: responsive.horizontalPadding,
              maxWidth: responsive.contentMaxWidth,
              alignSelf: "center",
              width: "100%",
            }}
          >
            <Pressable
              onPress={loadMoreGroups}
              accessibilityRole="button"
              accessibilityLabel="Load more groups"
              style={[
                styles.loadMoreButton,
                {
                  minHeight: responsive.buttonHeightMedium,
                  width: "100%",
                },
              ]}
            >
              <Text style={styles.loadMoreText}>Load More Groups</Text>
            </Pressable>
          </View>
        ) : null}

        {discoverableGroups.length === 0 ? (
          <View
            style={{
              paddingHorizontal: responsive.horizontalPadding,
              maxWidth: responsive.contentMaxWidth,
              alignSelf: "center",
              width: "100%",
            }}
          >
            <View style={styles.emptyState}>
              <Text style={styles.emptyTitle}>No groups available</Text>
              <Text style={styles.emptyCopy}>Joined groups are now in your profile.</Text>
            </View>
          </View>
        ) : null}
      </>
    ),
    [
      discoverableGroups.length,
      loadMoreGroups,
      responsive.buttonHeightMedium,
      responsive.contentMaxWidth,
      responsive.horizontalPadding,
      visibleCount,
    ],
  );

  const renderGroupItem = useCallback(
    ({ item, index }: { item: SuggestedGroup; index: number }) => (
      <GroupDiscoverCard
        group={item}
        index={index}
        isJoined={joinedGroupIds.includes(item.id)}
        groupThumbSize={groupThumbSize}
        horizontalPadding={responsive.horizontalPadding}
        contentMaxWidth={responsive.contentMaxWidth}
        cardRadius={responsive.cardRadius}
        cardPadding={responsive.cardPadding}
        touchTargetMin={responsive.touchTargetMin}
        buttonHeightSmall={responsive.buttonHeightSmall}
        onOpenGroupDetail={openGroupDetail}
        onToggleJoin={toggleJoin}
        onOpenGroupOptions={openGroupOptions}
      />
    ),
    [
      groupThumbSize,
      joinedGroupIds,
      openGroupDetail,
      openGroupOptions,
      responsive.buttonHeightSmall,
      responsive.cardPadding,
      responsive.cardRadius,
      responsive.contentMaxWidth,
      responsive.horizontalPadding,
      responsive.touchTargetMin,
      toggleJoin,
    ],
  );

  const activeAiItem = aiSwipeItems[0] ?? null;
  const rightGlowOpacity = swipeX.interpolate({
    inputRange: [0, SWIPE_ACTION_THRESHOLD * 0.5, SWIPE_ACTION_THRESHOLD * 2],
    outputRange: [0, 0.16, 0.42],
    extrapolate: "clamp",
  });
  const leftGlowOpacity = swipeX.interpolate({
    inputRange: [-SWIPE_ACTION_THRESHOLD * 2, -SWIPE_ACTION_THRESHOLD * 0.5, 0],
    outputRange: [0.42, 0.16, 0],
    extrapolate: "clamp",
  });
  const cardRotation = swipeX.interpolate({
    inputRange: [-180, 0, 180],
    outputRange: ["-8deg", "0deg", "8deg"],
    extrapolate: "clamp",
  });
  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => false,
        onMoveShouldSetPanResponder: (_, gesture) =>
          Math.abs(gesture.dx) > Math.abs(gesture.dy) && Math.abs(gesture.dx) > 8,
        onPanResponderTerminationRequest: () => true,
        onShouldBlockNativeResponder: () => false,
        onPanResponderMove: (_, gesture) => {
          swipeX.setValue(gesture.dx);
        },
        onPanResponderRelease: (_, gesture) => {
          if (gesture.dx >= SWIPE_ACTION_THRESHOLD) {
            handleSwipeRight();
            return;
          }
          if (gesture.dx <= -SWIPE_ACTION_THRESHOLD) {
            handleSwipeLeft();
            return;
          }
          Animated.spring(swipeX, {
            toValue: 0,
            useNativeDriver: true,
            bounciness: 6,
          }).start();
        },
      }),
    [handleSwipeLeft, handleSwipeRight, swipeX],
  );

  useEffect(() => {
    if (!aiSwipeVisible || !activeAiItem) {
      swipeX.setValue(0);
    }
  }, [activeAiItem, aiSwipeVisible, swipeX]);

  return (
    <View style={styles.screen}>
      <FlatList
        data={visibleGroups}
        keyExtractor={(item) => item.id}
        renderItem={renderGroupItem}
        ListHeaderComponent={listHeader}
        ListFooterComponent={listFooter}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.content, { paddingBottom: 96 + safeBottom }]}
        removeClippedSubviews
        initialNumToRender={8}
        maxToRenderPerBatch={8}
        windowSize={7}
        updateCellsBatchingPeriod={50}
      />

      {aiSwipeVisible ? (
        <Modal
          visible
          transparent
          animationType="fade"
          onRequestClose={() => setAiSwipeVisible(false)}
        >
          <Pressable style={styles.aiModalBackdrop} onPress={() => setAiSwipeVisible(false)}>
            <Animated.View pointerEvents="none" style={[styles.swipeScreenGlowLeft, { opacity: leftGlowOpacity }]} />
            <Animated.View pointerEvents="none" style={[styles.swipeScreenGlowRight, { opacity: rightGlowOpacity }]} />
            <Pressable
              style={[styles.aiModalCard, { borderRadius: responsive.cardRadius }]}
              onPress={() => null}
            >
              <View style={styles.aiModalHeader}>
                <Text style={styles.aiModalTitle}>Group Swipe</Text>
                <Pressable
                  onPress={() => setAiSwipeVisible(false)}
                  accessibilityRole="button"
                  accessibilityLabel="Close group swipe"
                  style={({ pressed }) => [styles.aiModalClose, pressed && styles.pressed]}
                >
                  <MaterialCommunityIcons name="close" size={18} color={colors.textSecondary} />
                </Pressable>
              </View>

              {aiSwipeLoading ? (
                <View style={styles.aiLoadingWrap}>
                  <Skeleton width="45%" height={16} />
                  <Skeleton width="75%" height={12} style={styles.aiLoadingCopy} />
                  <Skeleton width="100%" height={168} borderRadius={14} style={styles.aiLoadingImage} />
                  <View style={styles.aiLoadingRow}>
                    <Skeleton width="47%" height={44} borderRadius={999} />
                    <Skeleton width="47%" height={44} borderRadius={999} />
                  </View>
                </View>
              ) : aiSwipeError ? (
                <View style={styles.aiStateWrap}>
                  <Text style={styles.aiStateTitle}>Recommendation error</Text>
                  <Text style={styles.aiStateCopy}>{aiSwipeError}</Text>
                  <Pressable
                    onPress={() => void openAiSwipe()}
                    accessibilityRole="button"
                    accessibilityLabel="Retry recommendations"
                    style={({ pressed }) => [styles.aiRetryButton, pressed && styles.pressed]}
                  >
                    <Text style={styles.aiRetryButtonText}>Retry</Text>
                  </Pressable>
                </View>
              ) : !activeAiItem ? (
                <View style={styles.aiStateWrap}>
                  <Text style={styles.aiStateTitle}>No more groups</Text>
                  <Text style={styles.aiStateCopy}>Refresh later for more recommendations.</Text>
                </View>
              ) : (
                <Animated.View
                  style={[
                    styles.aiResultWrap,
                    {
                      transform: [{ translateX: swipeX }, { rotate: cardRotation }],
                    },
                  ]}
                  {...panResponder.panHandlers}
                >
                  <ExpoImage
                    source={{ uri: activeAiItem.group.thumbnail }}
                    style={styles.aiGroupImage}
                    contentFit="cover"
                    cachePolicy="memory-disk"
                  />
                  <View style={styles.aiTitleRow}>
                    <Text style={styles.aiGroupName}>{activeAiItem.group.name}</Text>
                    <View style={styles.aiScorePill}>
                      <Text style={styles.aiScoreText}>{activeAiItem.score}%</Text>
                    </View>
                  </View>
                  <Text style={styles.aiGroupMeta}>
                    {activeAiItem.group.game} · {activeAiItem.group.members} members ·{" "}
                    {activeAiItem.group.online} online
                  </Text>
                  <Text style={styles.swipeHint}>Swipe left to pass, swipe right to join</Text>
                  <View style={styles.aiReasonWrap}>
                    {activeAiItem.reasons.map((reason) => (
                      <View key={`${activeAiItem.group.id}-${reason}`} style={styles.aiReasonChip}>
                        <MaterialCommunityIcons
                          name={"star-four-points" as any}
                          size={12}
                          color={colors.primary}
                        />
                        <Text style={styles.aiReasonText}>{reason}</Text>
                      </View>
                    ))}
                  </View>
                  <View style={styles.aiActionsRow}>
                      <Pressable
                        onPress={handleSwipeLeft}
                        accessibilityRole="button"
                        accessibilityLabel={`Pass on ${activeAiItem.group.name}`}
                        style={({ pressed }) => [styles.aiSkipButton, pressed && styles.pressed]}
                      >
                        <MaterialCommunityIcons name="close" size={18} color={colors.text} />
                        <Text style={styles.aiSkipButtonText}>Pass</Text>
                      </Pressable>
                      <Pressable
                        onPress={handleSwipeRight}
                      accessibilityRole="button"
                      accessibilityLabel={`Join ${activeAiItem.group.name}`}
                      style={({ pressed }) => [styles.aiJoinButton, pressed && styles.pressed]}
                    >
                      <MaterialCommunityIcons name="check" size={18} color="#1A1A1A" />
                        <Text style={styles.aiJoinButtonText}>Join</Text>
                      </Pressable>
                    </View>
                </Animated.View>
              )}
            </Pressable>
          </Pressable>
        </Modal>
      ) : null}

      {activeGroupMenu ? (
        <ActionSheet
          visible
          title={activeGroupMenu.name}
          subtitle="Choose an action"
          onClose={() => setActiveGroupMenu(null)}
          options={[
            {
              id: "share",
              label: "Share",
              icon: "share-variant-outline",
              onPress: () =>
                handleShareToFriends(
                  activeGroupMenu.name,
                  `Check out this Game Mate group: ${activeGroupMenu.name} (${activeGroupMenu.game}).\nhttps://gamemate.app/g/${activeGroupMenu.id}`,
                ),
            },
            {
              id: "report",
              label: "Report",
              icon: "flag-outline",
              onPress: () => handleReportGroup(activeGroupMenu.name),
            },
            {
              id: "delete",
              label: "Delete",
              icon: "trash-can-outline",
              destructive: true,
              onPress: () => handleDeleteGroup(activeGroupMenu.id),
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
                void handleShareGroupToContacts(shareTarget.message);
              },
            },
            {
              id: "system",
              label: "More Share Options",
              icon: "dots-horizontal-circle-outline",
              onPress: () => {
                void handleShareGroupToContacts(shareTarget.message);
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
          ]}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    paddingTop: spacing.lg,
    paddingBottom: 110,
  },
  headerWrap: {
    marginBottom: spacing.md,
  },
  titleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.md,
  },
  title: {
    color: colors.text,
    fontWeight: "800",
  },
  headerActions: {
    flexDirection: "row",
  },
  iconButton: {
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: "#242424",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: spacing.sm,
  },
  statsRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.md,
  },
  statPrimary: {
    backgroundColor: colors.primary,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 8,
    marginRight: spacing.sm,
  },
  statPrimaryText: {
    color: "#1A1A1A",
    fontWeight: "800",
    fontSize: 12,
  },
  statSecondary: {
    backgroundColor: "#242424",
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.border,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  onlineDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#4ADE80",
    marginRight: 6,
  },
  statSecondaryText: {
    color: "#4ADE80",
    fontSize: 12,
    fontWeight: "700",
  },
  searchbar: {
    backgroundColor: "#242424",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
  },
  searchInput: {
    color: colors.text,
    fontSize: 14,
  },
  continuePill: {
    marginTop: spacing.sm,
    alignSelf: "flex-start",
    maxWidth: "100%",
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.primary,
    backgroundColor: "rgba(255,159,102,0.12)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    flexDirection: "row",
    alignItems: "center",
  },
  continuePillText: {
    marginLeft: 6,
    color: colors.primary,
    fontSize: 12,
    fontWeight: "700",
    maxWidth: "92%",
  },
  sectionHead: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 21,
    fontWeight: "800",
  },
  sectionActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
  aiSwipeButton: {
    backgroundColor: "#242424",
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.border,
    width: 42,
    height: 42,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  createButton: {
    backgroundColor: colors.primary,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  createButtonText: {
    color: "#1A1A1A",
    fontSize: 13,
    fontWeight: "800",
    marginLeft: 4,
  },
  groupCard: {
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: "#242424",
    marginBottom: spacing.sm,
  },
  cardPressable: {
    overflow: "hidden",
  },
  groupRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  groupThumb: {
    width: 78,
    height: 78,
    borderRadius: 14,
    marginRight: spacing.md,
  },
  groupInfo: {
    flex: 1,
  },
  groupName: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "800",
  },
  groupGame: {
    color: colors.textSecondary,
    fontSize: 13,
    marginTop: 2,
  },
  groupMeta: {
    color: "#4ADE80",
    fontSize: 11,
    marginTop: 4,
  },
  groupActionRow: {
    marginTop: spacing.md,
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "center",
    gap: spacing.sm,
  },
  groupJoinButton: {
    flex: 1,
    borderRadius: 999,
    backgroundColor: colors.primary,
    paddingVertical: 9,
    alignItems: "center",
    justifyContent: "center",
  },
  groupJoinButtonText: {
    color: "#1A1A1A",
    fontWeight: "800",
    fontSize: 12,
  },
  groupJoinedButton: {
    backgroundColor: "#2E4E3A",
    borderWidth: 1,
    borderColor: "#4ADE80",
  },
  groupJoinedButtonText: {
    color: "#4ADE80",
  },
  groupOptionsButton: {
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: "#2A2A2A",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: spacing.sm,
  },
  loadMoreButton: {
    marginTop: spacing.xs,
    backgroundColor: "#242424",
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: "center",
  },
  loadMoreText: {
    color: colors.text,
    fontWeight: "700",
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 48,
  },
  emptyTitle: {
    color: colors.text,
    fontWeight: "700",
    fontSize: 16,
  },
  emptyCopy: {
    marginTop: 4,
    color: colors.textSecondary,
  },
  aiModalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.55)",
    justifyContent: "center",
    paddingHorizontal: spacing.md,
    position: "relative",
  },
  swipeScreenGlowLeft: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: "50%",
    backgroundColor: "rgba(255,88,88,0.45)",
  },
  swipeScreenGlowRight: {
    position: "absolute",
    right: 0,
    top: 0,
    bottom: 0,
    width: "50%",
    backgroundColor: "rgba(74,222,128,0.42)",
  },
  aiModalCard: {
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: "#1E1E1E",
    padding: spacing.md,
  },
  aiModalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.sm,
  },
  aiModalTitle: {
    color: colors.text,
    fontWeight: "800",
    fontSize: 19,
  },
  aiModalClose: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: "#242424",
    alignItems: "center",
    justifyContent: "center",
  },
  aiStateWrap: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    backgroundColor: "#242424",
    padding: spacing.md,
  },
  aiLoadingWrap: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    backgroundColor: "#242424",
    padding: spacing.md,
  },
  aiLoadingCopy: {
    marginTop: 8,
  },
  aiLoadingImage: {
    marginTop: spacing.sm,
  },
  aiLoadingRow: {
    marginTop: spacing.sm,
    flexDirection: "row",
    justifyContent: "space-between",
    gap: spacing.sm,
  },
  aiStateTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "800",
  },
  aiStateCopy: {
    color: colors.textSecondary,
    marginTop: 4,
    lineHeight: 20,
  },
  aiRetryButton: {
    marginTop: spacing.sm,
    alignSelf: "flex-start",
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: "#2A2A2A",
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  aiRetryButtonText: {
    color: colors.text,
    fontWeight: "700",
    fontSize: 12,
  },
  aiResultWrap: {
    gap: spacing.sm,
  },
  swipeHint: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: "600",
  },
  aiGroupImage: {
    width: "100%",
    height: 168,
    borderRadius: 14,
  },
  aiTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  aiGroupName: {
    color: colors.text,
    fontWeight: "800",
    fontSize: 17,
    flex: 1,
    marginRight: spacing.sm,
  },
  aiGroupMeta: {
    color: colors.textSecondary,
    fontSize: 13,
  },
  aiScorePill: {
    borderRadius: 999,
    backgroundColor: "rgba(255,159,102,0.2)",
    borderWidth: 1,
    borderColor: colors.primary,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  aiScoreText: {
    color: colors.primary,
    fontWeight: "800",
    fontSize: 12,
  },
  aiReasonWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.xs,
  },
  aiReasonChip: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: "#2A2A2A",
    paddingHorizontal: 10,
    paddingVertical: 6,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  aiReasonText: {
    color: colors.textSecondary,
    fontSize: 11,
    fontWeight: "700",
  },
  aiActionsRow: {
    flexDirection: "row",
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  aiSkipButton: {
    flex: 1,
    minHeight: 46,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: "#2A2A2A",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 6,
  },
  aiSkipButtonText: {
    color: colors.text,
    fontWeight: "700",
    fontSize: 13,
  },
  aiJoinButton: {
    flex: 1,
    minHeight: 46,
    borderRadius: 999,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 6,
  },
  aiJoinButtonText: {
    color: "#1A1A1A",
    fontWeight: "800",
    fontSize: 13,
  },
  pressed: {
    opacity: 0.85,
  },
});
