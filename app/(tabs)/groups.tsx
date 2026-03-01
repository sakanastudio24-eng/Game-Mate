import { useRouter } from "expo-router";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import React, { useEffect, useMemo, useState } from "react";
import { Alert, Image, Modal, Pressable, ScrollView, Share, StyleSheet, View } from "react-native";
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
import {
  GROUPS_PAGE_SIZE,
  homeContentPrimed,
  SUGGESTED_GROUPS,
} from "../../src/lib/content-data";
import { mockCurrentUser } from "../../src/lib/mockData";
import { useResponsive } from "../../src/lib/responsive";
import { colors, spacing } from "../../src/lib/theme";

type AISwipeItem = {
  group: (typeof SUGGESTED_GROUPS)[number];
  score: number;
  reasons: string[];
};

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

export default function GroupsScreen() {
  const router = useRouter();
  const responsive = useResponsive();
  const insets = useSafeAreaInsets();
  const safeTop = Math.max(insets.top, responsive.safeTopInset) + responsive.headerTopSpacing;
  const safeBottom = Math.max(insets.bottom, responsive.safeBottomInset);

  const initialVisible = homeContentPrimed() ? GROUPS_PAGE_SIZE + 1 : GROUPS_PAGE_SIZE;
  const [joinedGroupIds, setJoinedGroupIds] = useState<string[]>([]);
  const [deletedGroupIds, setDeletedGroupIds] = useState<string[]>([]);
  const [query, setQuery] = useState("");
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

  const visibleGroups = useMemo(
    () => discoverableGroups.slice(0, visibleCount),
    [discoverableGroups, visibleCount],
  );

  const totalOnline = SUGGESTED_GROUPS.reduce((total, group) => total + group.online, 0);

  const toggleJoin = (id: string) => {
    setJoinedGroupIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  const joinGroup = (id: string) => {
    setJoinedGroupIds((prev) => (prev.includes(id) ? prev : [...prev, id]));
  };

  const loadMoreGroups = () => {
    setVisibleCount((prev) => Math.min(prev + GROUPS_PAGE_SIZE, discoverableGroups.length));
  };

  const handleShareGroupToContacts = async (message: string) => {
    try {
      await Share.share({
        message,
      });
    } catch {
      // no-op preview fallback
    }
  };

  const handleDeleteGroup = (groupId: string) => {
    setDeletedGroupIds((prev) => (prev.includes(groupId) ? prev : [...prev, groupId]));
    setJoinedGroupIds((prev) => prev.filter((id) => id !== groupId));
  };

  const openGroupOptions = (groupId: string, groupName: string, game: string) => {
    setActiveGroupMenu({
      id: groupId,
      name: groupName,
      game,
    });
  };

  const openShareDrawer = (title: string, message: string) => {
    setShareTarget({ title, message });
  };

  const handleShareToFriends = (title: string, message: string) => {
    openShareDrawer(title, message);
  };

  const handleShareToFriendDrawer = () => {
    if (!shareTarget) return;
    router.push("/(tabs)/messages");
    Alert.alert("Friend Drawer", `Choose a friend in Messages to share "${shareTarget.title}".`);
  };

  const handleReportGroup = (groupName: string) => {
    Alert.alert("Report Submitted", `Thanks. "${groupName}" was reported for review.`);
  };

  const openAiSwipe = async () => {
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
      setAiSwipeError(error instanceof Error ? error.message : "Unable to load AI matches");
      setAiSwipeItems([]);
    } finally {
      setAiSwipeLoading(false);
    }
  };

  const handleSwipeLeft = () => {
    setAiSwipeItems((prev) => prev.slice(1));
  };

  const handleSwipeRight = () => {
    const current = aiSwipeItems[0];
    if (!current) return;
    joinGroup(current.group.id);
    setAiSwipeItems((prev) => prev.slice(1));
    Alert.alert("Joined Group", `You joined "${current.group.name}".`);
  };

  const activeAiItem = aiSwipeItems[0] ?? null;

  return (
    <View style={styles.screen}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.content, { paddingBottom: 96 + safeBottom }]}
      >
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
              value={query}
              onChangeText={setQuery}
              accessibilityLabel="Search groups"
              style={[styles.searchbar, { borderRadius: responsive.searchRadius }]}
              inputStyle={[styles.searchInput, { fontSize: responsive.bodySize }]}
              placeholderTextColor={colors.textSecondary}
            />
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
                accessibilityLabel="Open AI swipe group recommendations"
                style={({ pressed }) => [
                  styles.aiSwipeButton,
                  { minHeight: responsive.buttonHeightSmall },
                  pressed && styles.pressed,
                ]}
              >
                <MaterialCommunityIcons name="robot-outline" size={16} color={colors.text} />
                <Text style={styles.aiSwipeButtonText}>AI Swipe</Text>
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

        {visibleGroups.map((group, index) => {
          const isJoined = joinedGroupIds.includes(group.id);
          return (
            <AnimatedEntrance key={group.id} preset="card" delay={80} staggerIndex={index}>
              <View
                style={{
                  paddingHorizontal: responsive.horizontalPadding,
                  maxWidth: responsive.contentMaxWidth,
                  alignSelf: "center",
                  width: "100%",
                }}
              >
                <Pressable
                  onPress={() => router.push(`/(tabs)/group-detail?groupId=${group.id}`)}
                  accessibilityRole="button"
                  accessibilityLabel={`${group.name}, ${group.game}, ${group.members} members, ${group.online} online`}
                  accessibilityHint="Open group details"
                  style={[
                    styles.groupCard,
                    {
                      borderRadius: responsive.cardRadius,
                      padding: responsive.cardPadding,
                      width: "100%",
                    },
                    styles.cardPressable,
                  ]}
                >
                  <View style={styles.groupRow}>
                    <Image
                      source={{ uri: group.thumbnail }}
                      style={[
                        styles.groupThumb,
                        { width: groupThumbSize, height: groupThumbSize },
                      ]}
                    />

                    <View style={styles.groupInfo}>
                      <Text style={styles.groupName}>{group.name}</Text>
                      <Text style={styles.groupGame}>{group.game}</Text>
                      <Text style={styles.groupMeta}>
                        {group.members} members · {group.online} online
                      </Text>
                    </View>

                    <Pressable
                      onPress={(event) => {
                        event.stopPropagation();
                        openGroupOptions(group.id, group.name, group.game);
                      }}
                      accessibilityRole="button"
                      accessibilityLabel={`More options for ${group.name}`}
                      style={({ pressed }) => [
                        styles.groupOptionsButton,
                        {
                          minWidth: responsive.touchTargetMin,
                          minHeight: responsive.touchTargetMin,
                          borderRadius: responsive.touchTargetMin / 2,
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
                      onPress={(event) => {
                        event.stopPropagation();
                        toggleJoin(group.id);
                      }}
                      accessibilityRole="button"
                      accessibilityLabel={isJoined ? `Leave ${group.name}` : `Join ${group.name}`}
                      accessibilityState={{ selected: isJoined }}
                      style={({ pressed }) => [
                        styles.groupJoinButton,
                        { minHeight: responsive.buttonHeightSmall },
                        isJoined && styles.groupJoinedButton,
                        pressed && styles.pressed,
                      ]}
                    >
                      <Text
                        style={[
                          styles.groupJoinButtonText,
                          isJoined && styles.groupJoinedButtonText,
                        ]}
                      >
                        {isJoined ? "Joined" : "Join"}
                      </Text>
                    </Pressable>
                  </View>
                </Pressable>
              </View>
            </AnimatedEntrance>
          );
        })}

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
      </ScrollView>

      <Modal
        visible={aiSwipeVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setAiSwipeVisible(false)}
      >
        <Pressable style={styles.aiModalBackdrop} onPress={() => setAiSwipeVisible(false)}>
          <Pressable
            style={[styles.aiModalCard, { borderRadius: responsive.cardRadius }]}
            onPress={() => null}
          >
            <View style={styles.aiModalHeader}>
              <Text style={styles.aiModalTitle}>AI Group Swipe</Text>
              <Pressable
                onPress={() => setAiSwipeVisible(false)}
                accessibilityRole="button"
                accessibilityLabel="Close AI group swipe"
                style={({ pressed }) => [styles.aiModalClose, pressed && styles.pressed]}
              >
                <MaterialCommunityIcons name="close" size={18} color={colors.textSecondary} />
              </Pressable>
            </View>

            {aiSwipeLoading ? (
              <View style={styles.aiStateWrap}>
                <Text style={styles.aiStateTitle}>Loading recommendations...</Text>
                <Text style={styles.aiStateCopy}>Matching groups to your preferences.</Text>
              </View>
            ) : aiSwipeError ? (
              <View style={styles.aiStateWrap}>
                <Text style={styles.aiStateTitle}>Recommendation error</Text>
                <Text style={styles.aiStateCopy}>{aiSwipeError}</Text>
                <Pressable
                  onPress={() => void openAiSwipe()}
                  accessibilityRole="button"
                  accessibilityLabel="Retry AI recommendations"
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
              <View style={styles.aiResultWrap}>
                <Image source={{ uri: activeAiItem.group.thumbnail }} style={styles.aiGroupImage} />
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
                    accessibilityLabel={`Skip ${activeAiItem.group.name}`}
                    style={({ pressed }) => [styles.aiSkipButton, pressed && styles.pressed]}
                  >
                    <MaterialCommunityIcons name="close" size={18} color={colors.text} />
                    <Text style={styles.aiSkipButtonText}>Skip</Text>
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
              </View>
            )}
          </Pressable>
        </Pressable>
      </Modal>

      <ActionSheet
        visible={activeGroupMenu !== null}
        title={activeGroupMenu?.name ?? "Group"}
        subtitle="Choose an action"
        onClose={() => setActiveGroupMenu(null)}
        options={
          activeGroupMenu
            ? [
                {
                  id: "share",
                  label: "Share",
                  icon: "share-variant-outline",
                  onPress: () =>
                    handleShareToFriends(
                      activeGroupMenu.name,
                      `Check out this Game Mate group: ${activeGroupMenu.name} (${activeGroupMenu.game}).`,
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
    paddingHorizontal: 12,
    paddingVertical: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  aiSwipeButtonText: {
    color: colors.text,
    fontSize: 13,
    fontWeight: "800",
    marginLeft: 4,
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
