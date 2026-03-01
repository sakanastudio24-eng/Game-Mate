import { useRouter } from "expo-router";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import React, { useMemo, useState } from "react";
import { FlatList, Pressable, StyleSheet, View } from "react-native";
import { Searchbar, Text } from "react-native-paper";
import { FriendCard } from "../../src/components/FriendCard";
import { Card } from "../../src/components/ui/Card";
import { Header } from "../../src/components/ui/Header";
import { Screen } from "../../src/components/ui/Screen";
import { mockFriends, mockSuggestedUsers } from "../../src/lib/mockData";
import { colors, spacing } from "../../src/lib/theme";

type SocialTab = "friends" | "messages" | "requests";

interface Conversation {
  id: string;
  userId: string;
  user: string;
  message: string;
  time: string;
  unread: number;
}

interface FriendRequest {
  id: string;
  name: string;
  userId: string;
  mutualFriends: number;
  games: string[];
}

const conversations: Conversation[] = [
  {
    id: "c1",
    userId: "1",
    user: "ProGamer92",
    message: "Ranked queue in 10?",
    time: "2m ago",
    unread: 2,
  },
  {
    id: "c2",
    userId: "3",
    user: "EchoPlayer",
    message: "GG last match",
    time: "1h ago",
    unread: 0,
  },
  {
    id: "c3",
    userId: "2",
    user: "SkyWalker",
    message: "Need one more for group event",
    time: "3h ago",
    unread: 1,
  },
];

const requestsSeed: FriendRequest[] = [
  {
    id: "r1",
    name: "NovaStrike",
    userId: "4",
    mutualFriends: 3,
    games: ["Overwatch 2", "Apex Legends"],
  },
  {
    id: "r2",
    name: "TacticalFox",
    userId: "5",
    mutualFriends: 1,
    games: ["CS2"],
  },
];

export default function SocialScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<SocialTab>("friends");
  const [searchQuery, setSearchQuery] = useState("");
  const [following, setFollowing] = useState<string[]>([]);
  const [requests, setRequests] = useState<FriendRequest[]>(requestsSeed);

  const allFriends = [...mockFriends, ...mockSuggestedUsers];

  const filteredFriends = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return allFriends.filter((friend) => {
      if (!q) return true;
      return [friend.name, friend.username, friend.currentGame]
        .join(" ")
        .toLowerCase()
        .includes(q);
    });
  }, [allFriends, searchQuery]);

  const handleFollow = (userId: string) => {
    setFollowing((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId],
    );
  };

  const handleAcceptRequest = (requestId: string) => {
    setRequests((prev) => prev.filter((request) => request.id !== requestId));
  };

  const handleDeclineRequest = (requestId: string) => {
    setRequests((prev) => prev.filter((request) => request.id !== requestId));
  };

  return (
    <Screen scrollable={false} padded={false}>
      <Header
        title="Social"
        subtitle="Friend zone and direct connects"
        rightAction={{
          icon: "account-plus",
          onPress: () => router.push("/(tabs)/search-players" as any),
        }}
      />

      <View style={styles.topSection}>
        <View style={styles.tabRow}>
          {([
            { id: "friends", label: "Friends" },
            { id: "messages", label: "Messages" },
            { id: "requests", label: `Requests (${requests.length})` },
          ] as const).map((tab) => (
            <Pressable
              key={tab.id}
              onPress={() => setActiveTab(tab.id)}
              style={[styles.tabButton, activeTab === tab.id && styles.tabButtonActive]}
            >
              <Text
                style={[
                  styles.tabText,
                  activeTab === tab.id && styles.tabTextActive,
                ]}
              >
                {tab.label}
              </Text>
            </Pressable>
          ))}
        </View>

        {activeTab === "friends" && (
          <Searchbar
            placeholder="Search friends..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            style={styles.searchbar}
            inputStyle={styles.searchInput}
            placeholderTextColor={colors.textMuted}
          />
        )}
      </View>

      {activeTab === "friends" && (
        <FlatList
          data={filteredFriends}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <FriendCard
              friend={item}
              isFollowing={following.includes(item.id)}
              onFollow={() => handleFollow(item.id)}
              onPress={() =>
                router.push(`/(tabs)/user-profile?userId=${item.id}` as any)
              }
            />
          )}
          contentContainerStyle={styles.listContent}
        />
      )}

      {activeTab === "messages" && (
        <FlatList
          data={conversations}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <Card
              style={styles.messageCard}
              onPress={() =>
                router.push(`/(tabs)/chat?userId=${item.userId}` as any)
              }
            >
              <View style={styles.messageRow}>
                <View style={styles.messageLeft}>
                  <View style={styles.messageAvatar}>
                    <MaterialCommunityIcons
                      name="account"
                      size={24}
                      color={colors.primary}
                    />
                  </View>
                  <View style={styles.messageInfo}>
                    <Text style={styles.messageUser}>{item.user}</Text>
                    <Text style={styles.messagePreview} numberOfLines={1}>
                      {item.message}
                    </Text>
                  </View>
                </View>
                <View style={styles.messageRight}>
                  <Text style={styles.messageTime}>{item.time}</Text>
                  {item.unread > 0 && (
                    <View style={styles.unreadBadge}>
                      <Text style={styles.unreadText}>{item.unread}</Text>
                    </View>
                  )}
                </View>
              </View>
            </Card>
          )}
        />
      )}

      {activeTab === "requests" && (
        <FlatList
          data={requests}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <Card style={styles.requestCard}>
              <View style={styles.requestTop}>
                <View style={styles.requestLeft}>
                  <View style={styles.messageAvatar}>
                    <MaterialCommunityIcons
                      name="account-plus"
                      size={22}
                      color={colors.primary}
                    />
                  </View>
                  <View style={styles.requestInfo}>
                    <Text style={styles.requestName}>{item.name}</Text>
                    <Text style={styles.requestMeta}>
                      {item.mutualFriends} mutual friends
                    </Text>
                    <Text style={styles.requestGames}>{item.games.join(" • ")}</Text>
                  </View>
                </View>
              </View>
              <View style={styles.requestActions}>
                <Pressable
                  style={styles.acceptBtn}
                  onPress={() => handleAcceptRequest(item.id)}
                >
                  <Text style={styles.acceptBtnText}>Accept</Text>
                </Pressable>
                <Pressable
                  style={styles.declineBtn}
                  onPress={() => handleDeclineRequest(item.id)}
                >
                  <Text style={styles.declineBtnText}>Decline</Text>
                </Pressable>
              </View>
            </Card>
          )}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>No pending friend requests</Text>
            </View>
          }
        />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  topSection: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
  },
  tabRow: {
    flexDirection: "row",
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  tabButton: {
    flex: 1,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    paddingVertical: spacing.sm,
    alignItems: "center",
  },
  tabButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  tabText: {
    color: colors.textMuted,
    fontWeight: "700",
    fontSize: 12,
  },
  tabTextActive: {
    color: colors.background,
  },
  searchbar: {
    backgroundColor: colors.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.xs,
  },
  searchInput: {
    color: colors.text,
    fontSize: 14,
  },
  listContent: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.xl,
  },
  messageCard: {
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  messageRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  messageLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  messageAvatar: {
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
  messageInfo: {
    flex: 1,
  },
  messageUser: {
    color: colors.text,
    fontWeight: "700",
    fontSize: 14,
  },
  messagePreview: {
    color: colors.textMuted,
    marginTop: 2,
    fontSize: 12,
  },
  messageRight: {
    alignItems: "flex-end",
    marginLeft: spacing.md,
  },
  messageTime: {
    color: colors.textMuted,
    fontSize: 11,
  },
  unreadBadge: {
    marginTop: spacing.xs,
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  unreadText: {
    color: colors.background,
    fontWeight: "700",
    fontSize: 11,
  },
  requestCard: {
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  requestTop: {
    marginBottom: spacing.md,
  },
  requestLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  requestInfo: {
    flex: 1,
  },
  requestName: {
    color: colors.text,
    fontWeight: "700",
    fontSize: 14,
  },
  requestMeta: {
    color: colors.textMuted,
    fontSize: 12,
    marginTop: 2,
  },
  requestGames: {
    color: colors.primary,
    fontSize: 12,
    marginTop: 3,
  },
  requestActions: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  acceptBtn: {
    flex: 1,
    backgroundColor: colors.primary,
    borderRadius: 10,
    paddingVertical: spacing.sm,
    alignItems: "center",
  },
  acceptBtnText: {
    color: colors.background,
    fontWeight: "700",
  },
  declineBtn: {
    flex: 1,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingVertical: spacing.sm,
    alignItems: "center",
  },
  declineBtnText: {
    color: colors.text,
    fontWeight: "700",
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: spacing.xl,
  },
  emptyText: {
    color: colors.textMuted,
  },
});
