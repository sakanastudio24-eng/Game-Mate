import { useRouter } from "expo-router";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import React, { useState } from "react";
import { FlatList, StyleSheet, View } from "react-native";
import { FAB, Searchbar, Text } from "react-native-paper";
import { Card } from "../../src/components/ui/Card";
import { Header } from "../../src/components/ui/Header";
import { Screen } from "../../src/components/ui/Screen";
import { mockFriends } from "../../src/lib/mockData";
import { colors, spacing } from "../../src/lib/theme";

// MessagesScreen: Conversation list
// Backend integration: GET /api/messages/conversations endpoint in Phase B

interface Conversation {
  id: string;
  participantName: string;
  participantImage?: string;
  lastMessage: string;
  timestamp: string;
  unreadCount: number;
  onlineStatus: boolean;
}

export default function MessagesScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");

  const conversations: Conversation[] = [
    {
      id: "1",
      participantName: "ProGamer92",
      lastMessage: "Let's queue up later",
      timestamp: "2 min ago",
      unreadCount: 3,
      onlineStatus: true,
    },
    {
      id: "2",
      participantName: "SkyWalker",
      lastMessage: "Sounds good, see you tomorrow",
      timestamp: "1 hour ago",
      unreadCount: 0,
      onlineStatus: false,
    },
    {
      id: "3",
      participantName: "EchoPlayer",
      lastMessage: "Group match is starting in 5 mins",
      timestamp: "5 min ago",
      unreadCount: 1,
      onlineStatus: true,
    },
    {
      id: "4",
      participantName: "NovaStrike",
      lastMessage: "Thanks for the invite!",
      timestamp: "3 hours ago",
      unreadCount: 0,
      onlineStatus: true,
    },
  ];

  const filteredConversations = conversations.filter((conv) =>
    conv.participantName.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const renderConversation = (conversation: Conversation) => (
    <Card
      style={styles.conversationCard}
      key={conversation.id}
      onPress={() => {
        const matchedFriend = mockFriends.find(
          (friend) =>
            friend.name === conversation.participantName ||
            friend.username === conversation.participantName,
        );
        if (matchedFriend) {
          router.push(`/(tabs)/chat?userId=${matchedFriend.id}` as any);
        } else {
          router.push("/(tabs)/chat" as any);
        }
      }}
    >
      <View style={styles.conversationContent}>
        <View style={styles.avatarContainer}>
          <View style={styles.avatar}>
            <MaterialCommunityIcons
              name="account-circle"
              size={48}
              color={colors.primary}
            />
          </View>
          {conversation.onlineStatus && (
            <View
              style={[styles.onlineBadge, { backgroundColor: colors.online }]}
            />
          )}
        </View>

        <View style={styles.messageInfo}>
          <Text style={styles.participantName}>
            {conversation.participantName}
          </Text>
          <Text
            style={styles.lastMessage}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {conversation.lastMessage}
          </Text>
        </View>

        <View style={styles.timestampContainer}>
          <Text style={styles.timestamp}>{conversation.timestamp}</Text>
          {conversation.unreadCount > 0 && (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadText}>{conversation.unreadCount}</Text>
            </View>
          )}
        </View>
      </View>
    </Card>
  );

  return (
    <Screen scrollable={false}>
      <Header title="Messages" showBackButton />

      <Searchbar
        placeholder="Search conversations..."
        onChangeText={setSearchQuery}
        value={searchQuery}
        style={styles.searchbar}
        inputStyle={styles.searchbarInput}
        placeholderTextColor={colors.textSecondary}
      />

      {filteredConversations.length > 0 ? (
        <FlatList
          data={filteredConversations}
          renderItem={({ item }) => renderConversation(item)}
          keyExtractor={(item) => item.id}
          scrollEnabled={true}
          contentContainerStyle={styles.conversationsList}
        />
      ) : (
        <View style={styles.emptyState}>
          <MaterialCommunityIcons
            name="message"
            size={48}
            color={colors.textSecondary}
          />
          <Text style={styles.emptyText}>
            {searchQuery ? "No conversations found" : "No messages yet"}
          </Text>
        </View>
      )}

      <FAB
        icon="pencil"
        onPress={() => router.push("/(tabs)/search-players" as any)}
        style={styles.fab}
        color={colors.background}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  searchbar: {
    margin: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: 8,
  },
  searchbarInput: {
    fontSize: 14,
    color: colors.text,
  },
  conversationsList: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.xl,
  },
  conversationCard: {
    marginBottom: spacing.md,
  },
  conversationContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatarContainer: {
    position: "relative",
    marginRight: spacing.md,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.surface,
  },
  onlineBadge: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: colors.background,
  },
  messageInfo: {
    flex: 1,
  },
  participantName: {
    color: colors.text,
    fontWeight: "600",
    fontSize: 14,
    marginBottom: spacing.xs,
  },
  lastMessage: {
    color: colors.textSecondary,
    fontSize: 12,
  },
  timestampContainer: {
    alignItems: "flex-end",
  },
  timestamp: {
    color: colors.textSecondary,
    fontSize: 11,
    marginBottom: spacing.sm,
  },
  unreadBadge: {
    backgroundColor: colors.primary,
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  unreadText: {
    color: colors.background,
    fontSize: 11,
    fontWeight: "700",
  },
  fab: {
    position: "absolute",
    right: spacing.lg,
    bottom: spacing.lg,
    backgroundColor: colors.primary,
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyText: {
    color: colors.textSecondary,
    fontSize: 14,
    marginTop: spacing.md,
  },
});
