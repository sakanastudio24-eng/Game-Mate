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
  MY_GROUPS,
  SUGGESTED_GROUPS,
} from "../../src/lib/content-data";
import { useResponsive } from "../../src/lib/responsive";
import { colors, spacing } from "../../src/lib/theme";

const memberAvatars = [
  "https://images.unsplash.com/photo-1613063022614-dc11527f5ece?w=80&h=80&fit=crop",
  "https://images.unsplash.com/photo-1757773873686-2257941bbcb8?w=80&h=80&fit=crop",
  "https://images.unsplash.com/photo-1628501899963-43bb8e2423e1?w=80&h=80&fit=crop",
  "https://images.unsplash.com/photo-1622349851524-890cc3641b87?w=80&h=80&fit=crop",
];

export default function GroupsScreen() {
  const router = useRouter();
  const responsive = useResponsive();
  const insets = useSafeAreaInsets();

  const initialVisible = homeContentPrimed() ? GROUPS_PAGE_SIZE + 1 : GROUPS_PAGE_SIZE;

  const [joinedSuggested, setJoinedSuggested] = useState<string[]>([]);
  const [query, setQuery] = useState("");
  const [visibleCount, setVisibleCount] = useState(initialVisible);

  const totalOnline = MY_GROUPS.reduce((total, group) => total + group.online, 0);

  const filteredGroups = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return MY_GROUPS;
    return MY_GROUPS.filter((group) =>
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

  const filteredSuggested = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return SUGGESTED_GROUPS;
    return SUGGESTED_GROUPS.filter((group) =>
      [group.name, group.game].join(" ").toLowerCase().includes(q),
    );
  }, [query]);

  const toggleJoinSuggested = (id: string) => {
    setJoinedSuggested((prev) =>
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
        contentContainerStyle={[styles.content, { paddingBottom: 96 + insets.bottom }]}
      >
        <AnimatedEntrance>
          <View
            style={[
              styles.headerWrap,
              {
                paddingTop: insets.top + spacing.md,
                paddingHorizontal: responsive.horizontalPadding,
                maxWidth: responsive.contentMaxWidth,
                alignSelf: "center",
                width: "100%",
              },
            ]}
          >
            <View style={styles.titleRow}>
              <Text style={[styles.title, { fontSize: responsive.titleSize }]}>Groups</Text>
              <View style={styles.headerActions}>
                <Pressable
                  onPress={() => router.push("/(tabs)/discover-groups")}
                  style={({ pressed }) => [styles.iconButton, pressed && styles.pressed]}
                >
                  <MaterialCommunityIcons name="magnify" size={20} color={colors.text} />
                </Pressable>
                <Pressable
                  onPress={() => router.push("/(tabs)/qr-code")}
                  style={({ pressed }) => [styles.iconButton, pressed && styles.pressed]}
                >
                  <MaterialCommunityIcons name="qrcode" size={20} color={colors.text} />
                </Pressable>
              </View>
            </View>

            <View style={styles.statsRow}>
              <View style={styles.statPrimary}>
                <Text style={styles.statPrimaryText}>{MY_GROUPS.length} Active Groups</Text>
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
              style={styles.searchbar}
              inputStyle={styles.searchInput}
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
            <Text style={styles.sectionTitle}>My Groups</Text>
            <Pressable
              onPress={() => router.push("/(tabs)/create-group")}
              style={({ pressed }) => [styles.createButton, pressed && styles.pressed]}
            >
              <MaterialCommunityIcons name="plus" size={16} color="#1A1A1A" />
              <Text style={styles.createButtonText}>Create</Text>
            </Pressable>
          </View>
        </AnimatedEntrance>

        {visibleGroups.map((group, index) => (
          <AnimatedEntrance key={group.id} delay={120 + index * 70}>
            <Pressable
              onPress={() => router.push(`/(tabs)/group-detail?groupId=${group.id}`)}
              style={({ pressed }) => [
                styles.groupCard,
                {
                  marginHorizontal: responsive.horizontalPadding,
                  borderRadius: responsive.cardRadius,
                  maxWidth: responsive.contentMaxWidth,
                  alignSelf: "center",
                  width: "100%",
                },
                pressed && styles.pressed,
              ]}
            >
              <View style={styles.groupImageWrap}>
                <Image source={{ uri: group.thumbnail }} style={styles.groupImage} />

                {group.verified && (
                  <View style={styles.verifiedBadge}>
                    <MaterialCommunityIcons name="check-decagram" size={14} color="#1A1A1A" />
                  </View>
                )}

                <View style={styles.onlinePill}>
                  <View style={styles.onlinePulseDot} />
                  <Text style={styles.onlinePillText}>{group.online} online</Text>
                </View>
              </View>

              <View style={styles.groupBody}>
                <View style={styles.groupTopRow}>
                  <View style={styles.groupTitleWrap}>
                    <Text style={styles.groupTitle}>{group.name}</Text>
                    <Text style={styles.groupSubtitle}>{group.game}</Text>
                  </View>
                  {group.date ? <Text style={styles.groupDate}>{group.date}</Text> : null}
                </View>

                <View style={styles.memberRow}>
                  <View style={styles.avatarStack}>
                    {memberAvatars.slice(0, 4).map((avatar, i) => (
                      <Image
                        key={`${group.id}-${i}`}
                        source={{ uri: avatar }}
                        style={[styles.memberAvatar, { marginLeft: i === 0 ? 0 : -10 }]}
                      />
                    ))}
                  </View>
                  <Text style={styles.memberText}>{group.members} members</Text>
                </View>
              </View>
            </Pressable>
          </AnimatedEntrance>
        ))}

        {filteredGroups.length > visibleCount ? (
          <Pressable
            onPress={loadMoreGroups}
            style={[
              styles.loadMoreButton,
              {
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

        <AnimatedEntrance delay={260}>
          <Text
            style={[
              styles.sectionTitle,
              styles.suggestedTitle,
              {
                paddingHorizontal: responsive.horizontalPadding,
                maxWidth: responsive.contentMaxWidth,
                alignSelf: "center",
                width: "100%",
              },
            ]}
          >
            Suggested For You
          </Text>
        </AnimatedEntrance>

        {filteredSuggested.map((group, index) => {
          const isJoined = joinedSuggested.includes(group.id);
          return (
            <AnimatedEntrance key={group.id} delay={320 + index * 70}>
              <View
                style={[
                  styles.suggestedCard,
                  {
                    marginHorizontal: responsive.horizontalPadding,
                    borderRadius: responsive.cardRadius - 2,
                    maxWidth: responsive.contentMaxWidth,
                    alignSelf: "center",
                    width: "100%",
                  },
                ]}
              >
                <Image source={{ uri: group.thumbnail }} style={styles.suggestedThumb} />

                <View style={styles.suggestedInfo}>
                  <Text style={styles.suggestedName}>{group.name}</Text>
                  <Text style={styles.suggestedGame}>{group.game}</Text>
                  <Text style={styles.suggestedMeta}>
                    {group.members} members · {group.online} online
                  </Text>
                </View>

                <Pressable
                  onPress={() => toggleJoinSuggested(group.id)}
                  style={({ pressed }) => [
                    styles.joinButton,
                    isJoined ? styles.joinedButton : undefined,
                    pressed && styles.pressed,
                  ]}
                >
                  <Text style={[styles.joinButtonText, isJoined ? styles.joinedButtonText : undefined]}>
                    {isJoined ? "Joined" : "Join"}
                  </Text>
                </Pressable>
              </View>
            </AnimatedEntrance>
          );
        })}
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
    width: 42,
    height: 42,
    borderRadius: 21,
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
    overflow: "hidden",
    marginBottom: spacing.md,
  },
  groupImageWrap: {
    height: 170,
    position: "relative",
  },
  groupImage: {
    width: "100%",
    height: "100%",
  },
  verifiedBadge: {
    position: "absolute",
    right: 10,
    top: 10,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  onlinePill: {
    position: "absolute",
    left: 10,
    top: 10,
    backgroundColor: "rgba(26,26,26,0.8)",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    flexDirection: "row",
    alignItems: "center",
  },
  onlinePulseDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#4ADE80",
    marginRight: 6,
  },
  onlinePillText: {
    color: colors.text,
    fontSize: 11,
    fontWeight: "700",
  },
  groupBody: {
    padding: spacing.md,
  },
  groupTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: spacing.sm,
  },
  groupTitleWrap: {
    flex: 1,
    marginRight: spacing.sm,
  },
  groupTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: "800",
  },
  groupSubtitle: {
    color: colors.textSecondary,
    fontSize: 13,
    marginTop: 2,
  },
  groupDate: {
    color: colors.primary,
    borderColor: "rgba(255,159,102,0.25)",
    borderWidth: 1,
    backgroundColor: "rgba(255,159,102,0.12)",
    borderRadius: 999,
    overflow: "hidden",
    paddingHorizontal: 9,
    paddingVertical: 4,
    fontSize: 11,
    fontWeight: "700",
  },
  memberRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatarStack: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: spacing.sm,
  },
  memberAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: "#242424",
  },
  memberText: {
    color: colors.textSecondary,
    fontSize: 13,
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
  suggestedTitle: {
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  suggestedCard: {
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: "#242424",
    marginBottom: spacing.sm,
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
  },
  suggestedThumb: {
    width: 72,
    height: 72,
    borderRadius: 14,
    marginRight: spacing.md,
  },
  suggestedInfo: {
    flex: 1,
    marginRight: spacing.sm,
  },
  suggestedName: {
    color: colors.text,
    fontSize: 15,
    fontWeight: "700",
  },
  suggestedGame: {
    color: colors.textSecondary,
    fontSize: 12,
    marginTop: 2,
  },
  suggestedMeta: {
    color: "#4ADE80",
    fontSize: 11,
    marginTop: 4,
  },
  joinButton: {
    borderRadius: 999,
    backgroundColor: colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  joinButtonText: {
    color: "#1A1A1A",
    fontWeight: "800",
    fontSize: 12,
  },
  joinedButton: {
    backgroundColor: "#2E4E3A",
    borderWidth: 1,
    borderColor: "#4ADE80",
  },
  joinedButtonText: {
    color: "#4ADE80",
  },
  pressed: {
    opacity: 0.85,
  },
});
