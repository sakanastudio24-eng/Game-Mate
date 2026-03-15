import { useLocalSearchParams, useRouter } from "expo-router";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { FlatList, Pressable, StyleSheet, TextInput, View } from "react-native";
import { Text } from "react-native-paper";
import {
  createThread,
  getMessages,
  listThreads,
  sendMessage,
  type MessageItem,
} from "../../services/messages";
import { Header } from "../../src/components/ui/Header";
import { Screen } from "../../src/components/ui/Screen";
import { useToast } from "../../src/components/ui/ToastProvider";
import { useAuth } from "../../src/context/AuthContext";
import { androidKeyboardCompatProps } from "../../src/lib/androidInput";
import { SESSION_EXPIRED_MESSAGE, isSessionExpiredMessage } from "../../src/lib/auth-messages";
import { useResponsive } from "../../src/lib/responsive";
import { colors, spacing } from "../../src/lib/theme";

type ChatRouteParams = {
  userId?: string | string[];
  threadId?: string | string[];
  title?: string | string[];
};

function firstParam(value?: string | string[]) {
  if (Array.isArray(value)) return value[0];
  return value;
}

function parseNumericParam(value?: string | string[]) {
  const raw = firstParam(value);
  if (!raw) return null;
  const parsed = Number(raw);
  return Number.isFinite(parsed) ? parsed : null;
}

export default function ChatScreen() {
  const router = useRouter();
  const responsive = useResponsive();
  const params = useLocalSearchParams<ChatRouteParams>();
  const { accessToken, user, expireSession } = useAuth();
  const { showToast } = useToast();
  const [activeThreadId, setActiveThreadId] = useState<number | null>(null);
  const [messages, setMessages] = useState<MessageItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [threadTitle, setThreadTitle] = useState<string | null>(firstParam(params.title) ?? null);
  const [messageInput, setMessageInput] = useState("");

  const selfUsername = String(user?.username ?? "");
  const routeThreadId = useMemo(() => parseNumericParam(params.threadId), [params.threadId]);
  const routeUserId = useMemo(() => parseNumericParam(params.userId), [params.userId]);
  const routeTitle = useMemo(() => firstParam(params.title) ?? null, [params.title]);
  const isSessionExpiredError = useMemo(() => isSessionExpiredMessage(loadError), [loadError]);

  const loadThreadMessages = useCallback(
    async (threadId: number) => {
      if (!accessToken) return;
      const payload = await getMessages(accessToken, threadId);
      setMessages(payload);

      const currentTitle = firstParam(params.title);
      if (currentTitle) {
        setThreadTitle(currentTitle);
        return;
      }

      const peer = payload.find((item) => item.sender !== selfUsername)?.sender;
      if (peer) {
        setThreadTitle(peer);
      } else {
        setThreadTitle(`Thread #${threadId}`);
      }
    },
    [accessToken, params.title, selfUsername],
  );

  const resolveDefaultThreadId = useCallback(async () => {
    if (!accessToken) return null;
    const threads = await listThreads(accessToken);
    if (!threads.length) return null;

    if (routeTitle) {
      const normalizedTarget = routeTitle.trim().toLowerCase();
      const matched = threads.find((thread) =>
        (thread.participants ?? []).some(
          (participant) =>
            participant &&
            participant !== selfUsername &&
            participant.trim().toLowerCase() === normalizedTarget,
        ),
      );
      if (matched?.thread_id) return matched.thread_id;
    }

    return threads[0]?.thread_id ?? null;
  }, [accessToken, routeTitle, selfUsername]);

  const resolveThreadAndLoad = useCallback(async () => {
    if (!accessToken) {
      setActiveThreadId(null);
      setMessages([]);
      setLoadError(SESSION_EXPIRED_MESSAGE);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setLoadError(null);

    try {
      let resolvedThreadId = routeThreadId;

      if (!resolvedThreadId && routeUserId) {
        const created = await createThread(accessToken, routeUserId);
        resolvedThreadId = created.thread_id;
      }

      if (!resolvedThreadId) {
        resolvedThreadId = await resolveDefaultThreadId();
      }

      if (!resolvedThreadId) {
        setActiveThreadId(null);
        setMessages([]);
        setThreadTitle(routeTitle ?? "No thread selected");
        setLoadError(null);
        return;
      }

      setActiveThreadId(resolvedThreadId);
      await loadThreadMessages(resolvedThreadId);
    } catch (error) {
      setActiveThreadId(null);
      setMessages([]);
      setLoadError(error instanceof Error ? error.message : "Unable to load chat.");
    } finally {
      setIsLoading(false);
    }
  }, [accessToken, loadThreadMessages, resolveDefaultThreadId, routeThreadId, routeTitle, routeUserId]);

  useEffect(() => {
    void resolveThreadAndLoad();
  }, [resolveThreadAndLoad]);

  const handleRefresh = useCallback(async () => {
    if (!activeThreadId || !accessToken) return;
    setIsRefreshing(true);
    setLoadError(null);
    try {
      await loadThreadMessages(activeThreadId);
    } catch (error) {
      setLoadError(error instanceof Error ? error.message : "Unable to refresh chat.");
    } finally {
      setIsRefreshing(false);
    }
  }, [accessToken, activeThreadId, loadThreadMessages]);

  const handleSendMessage = async () => {
    const content = messageInput.trim();
    if (!content || !activeThreadId || !accessToken || isSending) {
      return;
    }

    setIsSending(true);
    setLoadError(null);
    try {
      await sendMessage(accessToken, activeThreadId, content);
      setMessageInput("");
      await loadThreadMessages(activeThreadId);
    } catch (error) {
      const nextError = error instanceof Error ? error.message : "Unable to send message.";
      setLoadError(nextError);
      showToast({ message: nextError });
    } finally {
      setIsSending(false);
    }
  };

  const handleSessionExpiredAction = useCallback(async () => {
    try {
      await expireSession();
    } finally {
      router.replace("/login" as any);
    }
  }, [expireSession, router]);

  return (
    <Screen scrollable={false}>
      <Header
        title={threadTitle ?? "Chat"}
        showBackButton
        onBack={() => router.replace("/(tabs)/messages")}
        rightAction={{
          icon: "phone",
          onPress: () => {},
          label: `Call ${threadTitle ?? "player"}`,
        }}
      />

      {isLoading ? (
        <View style={styles.stateContainer}>
          <MaterialCommunityIcons name="progress-clock" size={44} color={colors.textSecondary} />
          <Text style={[styles.stateText, { fontSize: responsive.bodySize }]}>Loading chat...</Text>
        </View>
      ) : loadError ? (
        <View style={styles.stateContainer}>
          <View style={styles.errorStateCard}>
            <MaterialCommunityIcons name="alert-circle-outline" size={44} color={colors.destructive} />
            <Text style={[styles.stateText, { fontSize: responsive.bodySize }]}>{loadError}</Text>
            <Pressable
              style={({ pressed }) => [styles.retryButton, pressed && styles.pressed]}
              onPress={() =>
                isSessionExpiredError
                  ? void handleSessionExpiredAction()
                  : void resolveThreadAndLoad()
              }
            >
              <Text style={styles.retryText}>{isSessionExpiredError ? "Sign In" : "Retry"}</Text>
            </Pressable>
          </View>
        </View>
      ) : (
        <FlatList
          data={messages}
          keyExtractor={(item, index) => `${item.sender}-${item.created_at}-${index}`}
          renderItem={({ item }) => {
            const isOwn = item.sender === selfUsername;
            return (
              <View style={[styles.messageRow, isOwn && styles.messageRowOwn]}>
                <View
                  style={[
                    styles.messageBubble,
                    { borderRadius: responsive.cardRadius - 2 },
                    isOwn ? styles.messageBubbleOwn : styles.messageBubbleOther,
                  ]}
                >
                  <View style={styles.messageMetaRow}>
                    <Text
                      style={[
                        styles.messageAuthor,
                        { fontSize: responsive.captionSize },
                        isOwn && styles.messageAuthorOwn,
                      ]}
                    >
                      {isOwn ? "You" : item.sender}
                    </Text>
                    <Text
                      style={[
                        styles.messageTime,
                        { fontSize: responsive.captionSize },
                        isOwn && styles.messageTimeOwn,
                      ]}
                    >
                      {formatChatTime(item.created_at)}
                    </Text>
                  </View>
                  <Text
                    style={[
                      styles.messageText,
                      { fontSize: responsive.bodySize, lineHeight: Math.round(responsive.bodySize * 1.4) },
                      isOwn && styles.messageTextOwn,
                    ]}
                  >
                    {item.content}
                  </Text>
                </View>
              </View>
            );
          }}
          scrollEnabled={true}
          style={styles.messageList}
          contentContainerStyle={[
            styles.messageListContent,
            messages.length === 0 ? styles.messageListEmptyContent : undefined,
          ]}
          refreshing={isRefreshing}
          onRefresh={() => {
            void handleRefresh();
          }}
          ListEmptyComponent={
            <View style={styles.stateContainer}>
              <MaterialCommunityIcons name="message-outline" size={44} color={colors.textSecondary} />
              <Text style={[styles.stateText, { fontSize: responsive.bodySize }]}>No messages yet</Text>
            </View>
          }
        />
      )}

      {/* Message composer */}
      <View style={styles.composer}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Attach file"
          style={[
            styles.attachButton,
            {
              width: responsive.touchTargetMin,
              height: responsive.touchTargetMin,
              borderRadius: responsive.touchTargetMin / 2,
            },
          ]}
        >
          <MaterialCommunityIcons
            name="plus"
            size={20}
            color={colors.primary}
          />
        </Pressable>

        <TextInput
          style={[styles.input, { borderRadius: responsive.cardRadius, fontSize: responsive.bodySize }]}
          placeholder="Message..."
          placeholderTextColor={colors.textMuted}
          value={messageInput}
          onChangeText={setMessageInput}
          {...androidKeyboardCompatProps}
          multiline
          maxLength={500}
          accessibilityLabel="Message input"
        />

        <Pressable
          onPress={handleSendMessage}
          accessibilityRole="button"
          accessibilityLabel="Send message"
          disabled={isSending || !activeThreadId || !messageInput.trim()}
          style={({ pressed }) => [
            styles.sendButton,
            {
              width: responsive.touchTargetMin,
              height: responsive.touchTargetMin,
              borderRadius: responsive.touchTargetMin / 2,
            },
            (isSending || !activeThreadId || !messageInput.trim()) && styles.sendButtonDisabled,
            pressed && { opacity: 0.7 },
          ]}
        >
          <MaterialCommunityIcons
            name={isSending ? "progress-clock" : "send"}
            size={20}
            color={colors.background}
          />
        </Pressable>
      </View>
    </Screen>
  );
}

function formatChatTime(dateValue: string): string {
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) {
    return "";
  }
  return date.toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
  });
}

const styles = StyleSheet.create({
  messageList: {
    flex: 1,
  },
  messageListContent: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
  },
  messageListEmptyContent: {
    flexGrow: 1,
  },
  messageRow: {
    marginVertical: spacing.xs,
    flexDirection: "row",
    justifyContent: "flex-start",
  },
  messageRowOwn: {
    justifyContent: "flex-end",
  },
  messageBubble: {
    maxWidth: "75%",
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: 16,
  },
  messageBubbleOther: {
    backgroundColor: colors.card,
  },
  messageBubbleOwn: {
    backgroundColor: colors.primary,
  },
  messageText: {
    color: colors.text,
    fontSize: 14,
    lineHeight: 20,
  },
  messageTextOwn: {
    color: colors.background,
  },
  messageMetaRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.xs,
    gap: spacing.md,
  },
  messageAuthor: {
    color: colors.textSecondary,
    fontWeight: "700",
    flexShrink: 1,
  },
  messageAuthorOwn: {
    color: "#1A1A1A",
  },
  messageTime: {
    color: colors.textMuted,
    fontWeight: "600",
  },
  messageTimeOwn: {
    color: "#1A1A1A",
  },
  composer: {
    flexDirection: "row",
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    alignItems: "center",
  },
  attachButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.card,
    justifyContent: "center",
    alignItems: "center",
  },
  input: {
    flex: 1,
    backgroundColor: colors.card,
    color: colors.text,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    paddingBottom: spacing.sm,
    borderRadius: 20,
    maxHeight: 100,
    minHeight: 44,
    lineHeight: 20,
    textAlignVertical: "top",
  },
  sendButton: {
    backgroundColor: colors.primary,
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
  },
  sendButtonDisabled: {
    opacity: 0.45,
  },
  stateContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
  },
  errorStateCard: {
    width: "100%",
    borderWidth: 1,
    borderColor: `${colors.destructive}66`,
    backgroundColor: colors.surface,
    borderRadius: 14,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    alignItems: "center",
    gap: spacing.sm,
  },
  stateText: {
    color: colors.textSecondary,
    textAlign: "center",
  },
  retryButton: {
    marginTop: spacing.sm,
    backgroundColor: colors.primary,
    borderRadius: 10,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xs + 2,
  },
  retryText: {
    color: "#1A1A1A",
    fontWeight: "700",
  },
  pressed: {
    opacity: 0.78,
  },
});
