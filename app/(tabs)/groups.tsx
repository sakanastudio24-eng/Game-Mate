import { useRouter } from "expo-router";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import React, { useMemo, useState } from "react";
import { FlatList, Pressable, StyleSheet, View } from "react-native";
import { Searchbar, Text } from "react-native-paper";
import { GroupCard } from "../../src/components/GroupCard";
import { Card } from "../../src/components/ui/Card";
import { Chip } from "../../src/components/ui/Chip";
import { Header } from "../../src/components/ui/Header";
import { Screen } from "../../src/components/ui/Screen";
import { mockGroups } from "../../src/lib/mockData";
import { colors, spacing } from "../../src/lib/theme";

export default function GroupsScreen() {
  const router = useRouter();
  const [joinedGroups, setJoinedGroups] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterMode, setFilterMode] = useState<"all" | "ranked" | "casual">(
    "all",
  );

  const filteredGroups = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return mockGroups.filter((group) => {
      if (filterMode !== "all" && group.mode !== filterMode) return false;
      if (!q) return true;
      return [group.name, group.game, group.description]
        .join(" ")
        .toLowerCase()
        .includes(q);
    });
  }, [filterMode, searchQuery]);

  const onlineEstimate = mockGroups.reduce(
    (acc, group) => acc + Math.ceil(group.memberCount * 0.5),
    0,
  );

  const handleJoin = (groupId: string) => {
    setJoinedGroups((prev) =>
      prev.includes(groupId)
        ? prev.filter((id) => id !== groupId)
        : [...prev, groupId],
    );
  };

  const suggestedGroups = useMemo(
    () =>
      mockGroups.filter((group) => !joinedGroups.includes(group.id)).slice(0, 2),
    [joinedGroups],
  );

  return (
    <Screen scrollable={false} padded={false}>
      <Header
        title="Groups"
        subtitle="Squads, events, and communities"
        rightAction={{
          icon: "plus",
          onPress: () => router.push("/(tabs)/create-group" as any),
          label: "Create",
        }}
        rightAction2={{
          icon: "compass-outline",
          onPress: () => router.push("/(tabs)/discover-groups" as any),
          label: "Discover",
        }}
      />

      <View style={styles.topSection}>
        <View style={styles.statsRow}>
          <View style={styles.pillPrimary}>
            <Text style={styles.pillPrimaryText}>{mockGroups.length} Active Groups</Text>
          </View>
          <View style={styles.pillSecondary}>
            <View style={styles.onlineDot} />
            <Text style={styles.pillSecondaryText}>{onlineEstimate} Online</Text>
          </View>
        </View>

        <Searchbar
          placeholder="Search groups..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          style={styles.searchbar}
          inputStyle={styles.searchInput}
          placeholderTextColor={colors.textMuted}
        />

        <View style={styles.filterContainer}>
          {(["all", "ranked", "casual"] as const).map((mode) => (
            <Chip
              key={mode}
              label={mode.charAt(0).toUpperCase() + mode.slice(1)}
              selected={filterMode === mode}
              onPress={() => setFilterMode(mode)}
              style={styles.filterChip}
              mode={filterMode === mode ? "flat" : "outlined"}
              selectedColor={colors.primary}
            />
          ))}
        </View>
      </View>

      <FlatList
        data={filteredGroups}
        keyExtractor={(group) => group.id}
        ListHeaderComponent={
          <Text style={styles.sectionTitle}>My Groups</Text>
        }
        renderItem={({ item }) => (
          <GroupCard
            group={item}
            isJoined={joinedGroups.includes(item.id)}
            onJoin={() => handleJoin(item.id)}
            onPress={() =>
              router.push(`/(tabs)/group-detail?groupId=${item.id}` as any)
            }
          />
        )}
        ListFooterComponent={
          <View>
            <Text style={styles.sectionTitle}>Suggested For You</Text>
            {suggestedGroups.map((group) => (
              <Card key={group.id} style={styles.suggestedCard} onPress={() => router.push(`/(tabs)/group-detail?groupId=${group.id}` as any)}>
                <View style={styles.suggestedRow}>
                  <View style={styles.suggestedLeft}>
                    <View style={styles.suggestedIconWrap}>
                      <MaterialCommunityIcons
                        name="account-group"
                        size={20}
                        color={colors.primary}
                      />
                    </View>
                    <View style={styles.suggestedInfo}>
                      <Text style={styles.suggestedName}>{group.name}</Text>
                      <Text style={styles.suggestedMeta}>
                        {group.game} • {group.memberCount} members
                      </Text>
                    </View>
                  </View>
                  <Pressable
                    style={styles.joinQuickBtn}
                    onPress={(event) => {
                      event.stopPropagation();
                      handleJoin(group.id);
                    }}
                  >
                    <Text style={styles.joinQuickText}>
                      {joinedGroups.includes(group.id) ? "Joined" : "Join"}
                    </Text>
                  </Pressable>
                </View>
              </Card>
            ))}
            <View style={styles.spacer} />
          </View>
        }
        contentContainerStyle={styles.listContent}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  topSection: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
  statsRow: {
    flexDirection: "row",
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  pillPrimary: {
    backgroundColor: colors.primary,
    borderRadius: 999,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  pillPrimaryText: {
    color: colors.background,
    fontWeight: "700",
    fontSize: 12,
  },
  pillSecondary: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 999,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
  onlineDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.online,
  },
  pillSecondaryText: {
    color: colors.online,
    fontWeight: "700",
    fontSize: 12,
  },
  searchbar: {
    backgroundColor: colors.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
  },
  searchInput: {
    color: colors.text,
    fontSize: 14,
  },
  filterContainer: {
    flexDirection: "row",
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  filterChip: {
    marginRight: spacing.xs,
  },
  listContent: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
  },
  sectionTitle: {
    color: colors.text,
    fontWeight: "700",
    fontSize: 18,
    marginBottom: spacing.md,
    marginTop: spacing.md,
  },
  suggestedCard: {
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  suggestedRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: spacing.sm,
  },
  suggestedLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  suggestedIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    marginRight: spacing.md,
  },
  suggestedInfo: {
    flex: 1,
  },
  suggestedName: {
    color: colors.text,
    fontWeight: "700",
    fontSize: 14,
  },
  suggestedMeta: {
    color: colors.textMuted,
    fontSize: 12,
    marginTop: 2,
  },
  joinQuickBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 999,
  },
  joinQuickText: {
    color: colors.background,
    fontWeight: "700",
    fontSize: 12,
  },
  spacer: {
    height: spacing.xl,
  },
});
