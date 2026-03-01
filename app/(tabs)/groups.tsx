import { useRouter } from "expo-router";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import React, { useEffect, useMemo, useState } from "react";
import { Image, Pressable, ScrollView, StyleSheet, View } from "react-native";
import { Searchbar, Text } from "react-native-paper";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AnimatedEntrance } from "../../src/components/ui/AnimatedEntrance";
import {
  GROUPS_PAGE_SIZE,
  homeContentPrimed,
  SUGGESTED_GROUPS,
} from "../../src/lib/content-data";
import { useResponsive } from "../../src/lib/responsive";
import { colors, spacing } from "../../src/lib/theme";

export default function GroupsScreen() {
  const router = useRouter();
  const responsive = useResponsive();
  const insets = useSafeAreaInsets();
  const safeTop = Math.max(insets.top, responsive.safeTopInset) + responsive.headerTopSpacing;
  const safeBottom = Math.max(insets.bottom, responsive.safeBottomInset);

  const initialVisible = homeContentPrimed() ? GROUPS_PAGE_SIZE + 1 : GROUPS_PAGE_SIZE;
  const [joinedGroupIds, setJoinedGroupIds] = useState<string[]>([]);
  const [query, setQuery] = useState("");
  const [visibleCount, setVisibleCount] = useState(initialVisible);

  const filteredGroups = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return SUGGESTED_GROUPS;
    return SUGGESTED_GROUPS.filter((group) =>
      [group.name, group.game].join(" ").toLowerCase().includes(q),
    );
  }, [query]);

  useEffect(() => {
    setVisibleCount(initialVisible);
  }, [query, initialVisible]);

  const visibleGroups = useMemo(
    () => filteredGroups.slice(0, visibleCount),
    [filteredGroups, visibleCount],
  );

  const totalOnline = SUGGESTED_GROUPS.reduce((total, group) => total + group.online, 0);

  const toggleJoin = (id: string) => {
    setJoinedGroupIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  const loadMoreGroups = () => {
    setVisibleCount((prev) => Math.min(prev + GROUPS_PAGE_SIZE, filteredGroups.length));
  };

  return (
    <View style={styles.screen}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.content, { paddingBottom: 96 + safeBottom }]}
      >
        <AnimatedEntrance>
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
                <Text style={styles.statPrimaryText}>{SUGGESTED_GROUPS.length} Discoverable</Text>
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
              style={[styles.searchbar, { borderRadius: responsive.searchRadius }]}
              inputStyle={[styles.searchInput, { fontSize: responsive.bodySize }]}
              placeholderTextColor={colors.textSecondary}
            />
          </View>
        </AnimatedEntrance>

        <AnimatedEntrance delay={80}>
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
            <Pressable
              onPress={() => router.push("/(tabs)/create-group")}
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
        </AnimatedEntrance>

        {visibleGroups.map((group, index) => {
          const isJoined = joinedGroupIds.includes(group.id);
          return (
            <AnimatedEntrance key={group.id} delay={120 + index * 70}>
              <View
                style={[
                  styles.groupCard,
                  {
                    marginHorizontal: responsive.horizontalPadding,
                    borderRadius: responsive.cardRadius,
                    padding: responsive.cardPadding,
                    maxWidth: responsive.contentMaxWidth,
                    alignSelf: "center",
                    width: "100%",
                  },
                ]}
              >
                <View style={styles.groupRow}>
                  <Image source={{ uri: group.thumbnail }} style={styles.groupThumb} />

                  <View style={styles.groupInfo}>
                    <Text style={styles.groupName}>{group.name}</Text>
                    <Text style={styles.groupGame}>{group.game}</Text>
                    <Text style={styles.groupMeta}>
                      {group.members} members · {group.online} online
                    </Text>
                  </View>
                </View>

                <View style={styles.groupActionRow}>
                  <Pressable
                    onPress={() => toggleJoin(group.id)}
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

                  <Pressable
                    onPress={() => router.push(`/(tabs)/group-detail?groupId=${group.id}`)}
                    style={({ pressed }) => [
                      styles.groupViewButton,
                      { minHeight: responsive.buttonHeightSmall, minWidth: responsive.touchTargetMin + 16 },
                      pressed && styles.pressed,
                    ]}
                  >
                    <Text style={styles.groupViewButtonText}>Open</Text>
                  </Pressable>
                </View>
              </View>
            </AnimatedEntrance>
          );
        })}

        {filteredGroups.length > visibleCount ? (
          <Pressable
            onPress={loadMoreGroups}
            style={[
              styles.loadMoreButton,
              {
                minHeight: responsive.buttonHeightMedium,
                marginHorizontal: responsive.horizontalPadding,
                maxWidth: responsive.contentMaxWidth,
                alignSelf: "center",
                width: "100%",
              },
            ]}
          >
            <Text style={styles.loadMoreText}>Load More Groups</Text>
          </Pressable>
        ) : null}

        {filteredGroups.length === 0 ? (
          <View
            style={[
              styles.emptyState,
              {
                marginHorizontal: responsive.horizontalPadding,
                maxWidth: responsive.contentMaxWidth,
                alignSelf: "center",
                width: "100%",
              },
            ]}
          >
            <Text style={styles.emptyTitle}>No groups found</Text>
            <Text style={styles.emptyCopy}>Try another search phrase.</Text>
          </View>
        ) : null}
      </ScrollView>
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
    justifyContent: "space-between",
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
  groupViewButton: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: "#2A2A2A",
    paddingHorizontal: 14,
    paddingVertical: 9,
    alignItems: "center",
    justifyContent: "center",
  },
  groupViewButtonText: {
    color: colors.text,
    fontWeight: "700",
    fontSize: 12,
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
  pressed: {
    opacity: 0.85,
  },
});
