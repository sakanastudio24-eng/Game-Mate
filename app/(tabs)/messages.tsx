import { useRouter } from "expo-router";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { FlatList, Pressable, StyleSheet, View } from "react-native";
import { FAB, Searchbar, Text } from "react-native-paper";
import { listThreads, type ThreadItem } from "../../services/messages";
import { Card } from "../../src/components/ui/Card";
import { Header } from "../../src/components/ui/Header";
import { Screen } from "../../src/components/ui/Screen";
import { useAuth } from "../../src/context/AuthContext";
import { androidKeyboardCompatProps } from "../../src/lib/androidInput";
import { useResponsive } from "../../src/lib/responsive";
import { colors, spacing } from "../../src/lib/theme";

interface Conversation {
  id: number;
  participantName: string;
  participantUsername: string;
  lastMessage: string;
  timestamp: string | null;
  unreadCount: number;
}

export default function MessagesScreen() {
  const router = useRouter();
  const responsive = useResponsive();
  const { accessToken, user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [threads, setThreads] = useState<ThreadItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadThreads = useCallback(
    async (refresh = false) => {
      if (!accessToken) {
        setThreads([]);
        setIsLoading(false);
        setIsRefreshing(false);
        return;
      }

      if (refresh) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }

      setError(null);
      try {
        const data = await listThreads(accessToken);
        setThreads(data);
      } catch (nextError) {
        setError(nextError instanceof Error ? nextError.message : "Unable to load conversations.");
        setThreads([]);
      } finally {
        if (refresh) {
          setIsRefreshing(false);
        } else {
          setIsLoading(false);
        }
      }
    },
    [accessToken],
  );

  useEffect(() => {
    void loadThreads();
  }, [loadThreads]);

  const conversations = useMemo<Conversation[]>(() => {
    const selfUsername = String(user?.username ?? "");
    return threads.map((thread) => {
      const peers = (thread.participants ?? []).filter((name) => name && name !== selfUsername);
      const participantUsername = peers[0] ?? "Player";
      return {
        id: thread.thread_id,
        participantName: participantUsername,
        participantUsername,
        lastMessage: thread.last_message || "No messages yet",
        timestamp: null,
        unreadCount: Math.max(0, Number(thread.unread ?? 0)),
      };
    });
  }, [threads, user?.username]);

  const filteredConversations = conversations.filter((conv) =>
    [conv.participantName, conv.lastMessage]
      .join(" ")
      .toLowerCase()
      .includes(searchQuery.toLowerCase()),
  );

  const renderConversation = (conversation: Conversation) => (
    <Card
      style={styles.conversationCard}
      onPress={() => {
        router.push({
          pathname: "/(tabs)/chat",
          params: {
            threadId: String(conversation.id),
            title: conversation.participantName,
          },
        });
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
        </View>

        <View style={styles.messageInfo}>
          <Text style={styles.participantName}>
            {conversation.participantName}
          </Text>
          <Text
            style={[styles.lastMessage, { fontSize: responsive.bodySmallSize }]}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {conversation.lastMessage}
          </Text>
        </View>

        <View style={styles.timestampContainer}>
          <Text style={[styles.timestamp, { fontSize: responsive.captionSize }]}>
            {conversation.timestamp ?? ""}
          </Text>
          {conversation.unreadCount > 0 && (
            <View style={styles.unreadBadge}>
              <Text style={[styles.unreadText, { fontSize: responsive.captionSize }]}>
                {conversation.unreadCount}
              </Text>
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
        {...androidKeyboardCompatProps}
        style={[styles.searchbar, { borderRadius: responsive.searchRadius }]}
        inputStyle={[styles.searchbarInput, { fontSize: responsive.bodySize }]}
        placeholderTextColor={colors.textSecondary}
      />

      {isLoading ? (
        <View style={styles.emptyState}>
          <MaterialCommunityIcons
            name="progress-clock"
            size={48}
            color={colors.textSecondary}
          />
          <Text style={styles.emptyText}>Loading conversations...</Text>
        </View>
      ) : error ? (
        <View style={styles.emptyState}>
          <MaterialCommunityIcons
            name="alert-circle-outline"
            size={48}
            color={colors.destructive}
          />
          <Text style={styles.emptyText}>{error}</Text>
        </View>
      ) : filteredConversations.length > 0 ? (
        <FlatList
          data={filteredConversations}
          renderItem={({ item }) => renderConversation(item)}
          keyExtractor={(item) => String(item.id)}
          scrollEnabled={true}
          contentContainerStyle={styles.conversationsList}
          refreshing={isRefreshing}
          onRefresh={() => {
            void loadThreads(true);
          }}
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
          {searchQuery ? null : (
            <Pressable
              onPress={() => {
                void loadThreads(true);
              }}
              style={styles.retryButton}
            >
              <Text style={styles.retryText}>Refresh</Text>
            </Pressable>
          )}
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
    marginVertical: spacing.md,
    backgroundColor: colors.surface,
  },
  searchbarInput: {
    fontSize: 14,
    color: colors.text,
  },
  conversationsList: {
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
  retryButton: {
    marginTop: spacing.md,
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: 10,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xs,
  },
  retryText: {
    color: colors.primary,
    fontWeight: "700",
  },
});
