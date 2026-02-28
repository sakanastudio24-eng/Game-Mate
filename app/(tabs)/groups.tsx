import { useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
import { FlatList, StyleSheet, View } from "react-native";
import { GroupCard } from "../../src/components/GroupCard";
import { Chip } from "../../src/components/ui/Chip";
import { Header } from "../../src/components/ui/Header";
import { Screen } from "../../src/components/ui/Screen";
import { mockGroups } from "../../src/lib/mockData";
import { colors, spacing } from "../../src/lib/theme";

// GroupsScreen: Tab 2 - Browse user's groups, create new, filter
// Backend integration: GET /api/groups endpoint in Phase B
// State: joinedGroups (local), filteredBy (ranked/casual), createModalVisible

export default function GroupsScreen() {
  const router = useRouter();
  const [joinedGroups, setJoinedGroups] = useState<string[]>([]);
  const [filterMode, setFilterMode] = useState<"all" | "ranked" | "casual">(
    "all",
  );

  // Filter groups by mode
  const filteredGroups = useMemo(() => {
    if (filterMode === "all") return mockGroups;
    return mockGroups.filter((g) => g.mode === filterMode);
  }, [filterMode]);

  const handleJoin = (groupId: string) => {
    setJoinedGroups((prev) =>
      prev.includes(groupId)
        ? prev.filter((id) => id !== groupId)
        : [...prev, groupId],
    );
  };

  return (
    <Screen scrollable={false}>
      <Header
        title="Groups"
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

      {/* Filter chips */}
      <View style={styles.filterContainer}>
        {["all", "ranked", "casual"].map((mode) => (
          <Chip
            key={mode}
            label={mode.charAt(0).toUpperCase() + mode.slice(1)}
            selected={filterMode === (mode as any)}
            onPress={() => setFilterMode(mode as any)}
            style={styles.filterChip}
            mode={filterMode === mode ? "flat" : "outlined"}
            selectedColor={colors.primary}
          />
        ))}
      </View>

      {/* Groups list */}
      <FlatList
        data={filteredGroups}
        keyExtractor={(group) => group.id}
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
        contentContainerStyle={styles.listContent}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  filterContainer: {
    flexDirection: "row",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    gap: spacing.sm,
  },
  filterChip: {
    marginRight: spacing.xs,
  },
  listContent: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
});
