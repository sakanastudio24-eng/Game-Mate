import React, { useState } from "react";
import { FlatList, StyleSheet, View } from "react-native";
import { Chip } from "react-native-paper";
import { FriendCard } from "../../src/components/FriendCard";
import { Header } from "../../src/components/ui/Header";
import { Screen } from "../../src/components/ui/Screen";
import { mockFriends, mockSuggestedUsers } from "../../src/lib/mockData";
import { colors, spacing } from "../../src/lib/theme";

// SocialScreen: Tab 3 - Friends, suggested users, requests
// Backend integration: GET /api/friends, /api/friends/suggested endpoints in Phase B
// State: followingFriends, followingSuggested (local)

export default function SocialScreen() {
  const [activeTab, setActiveTab] = useState<"friends" | "suggested">(
    "friends",
  );
  const [followingFriends, setFollowingFriends] = useState<string[]>([]);
  const [followingSuggested, setFollowingSuggested] = useState<string[]>([]);

  const handleFollowFriend = (userId: string) => {
    setFollowingFriends((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId],
    );
  };

  const handleFollowSuggested = (userId: string) => {
    setFollowingSuggested((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId],
    );
  };

  const data = activeTab === "friends" ? mockFriends : mockSuggestedUsers;
  const following =
    activeTab === "friends" ? followingFriends : followingSuggested;
  const handleFollow =
    activeTab === "friends" ? handleFollowFriend : handleFollowSuggested;

  return (
    <Screen scrollable={false}>
      <Header title="Social" />

      {/* Tabs */}
      <View style={styles.tabContainer}>
        {(["friends", "suggested"] as const).map((tab) => (
          <Chip
            key={tab}
            label={tab === "friends" ? "Friends" : "Suggested"}
            selected={activeTab === tab}
            onPress={() => setActiveTab(tab)}
            style={styles.tabChip}
            mode={activeTab === tab ? "flat" : "outlined"}
            selectedColor={colors.primary}
          />
        ))}
      </View>

      {/* Friends/Suggested list */}
      <FlatList
        data={data}
        keyExtractor={(user) => user.id}
        renderItem={({ item }) => (
          <FriendCard
            friend={item}
            isFollowing={following.includes(item.id)}
            onFollow={() => handleFollow(item.id)}
          />
        )}
        contentContainerStyle={styles.listContent}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  tabContainer: {
    flexDirection: "row",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    gap: spacing.sm,
  },
  tabChip: {
    marginRight: spacing.xs,
  },
  listContent: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
});
