import { useLocalSearchParams } from "expo-router";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import React, { useState } from "react";
import { FlatList, Pressable, StyleSheet, TextInput, View } from "react-native";
import { Text } from "react-native-paper";
import { Header } from "../../src/components/ui/Header";
import { Screen } from "../../src/components/ui/Screen";
import { mockFriends } from "../../src/lib/mockData";
import { useResponsive } from "../../src/lib/responsive";
import { colors, spacing } from "../../src/lib/theme";

// ChatScreen: Direct messages with a friend
// Backend integration: GET /api/messages/{friendId}, POST /api/messages endpoint in Phase B
// State: messages (local), messageInput

export default function ChatScreen() {
  const responsive = useResponsive();
  const { userId } = useLocalSearchParams<{ userId?: string }>();
  const friend = mockFriends.find((item) => item.id === userId) ?? mockFriends[0];
  const [messages, setMessages] = useState<
    Array<{ id: string; user: string; text: string; timestamp: Date }>
  >([
    {
      id: "1",
      user: friend.username,
      text: "Hey! You free to play?",
      timestamp: new Date(Date.now() - 10 * 60000),
    },
    {
      id: "2",
      user: "You",
      text: "Yeah let me load in",
      timestamp: new Date(Date.now() - 9 * 60000),
    },
    {
      id: "3",
      user: friend.username,
      text: "Cool, creating a lobby",
      timestamp: new Date(Date.now() - 5 * 60000),
    },
  ]);
  const [messageInput, setMessageInput] = useState("");

  const handleSendMessage = () => {
    if (messageInput.trim()) {
      setMessages([
        ...messages,
        {
          id: Date.now().toString(),
          user: "You",
          text: messageInput,
          timestamp: new Date(),
        },
      ]);
      setMessageInput("");
    }
  };

  return (
    <Screen scrollable={false}>
      <Header
        title={friend.username}
        showBackButton
        rightAction={{
          icon: "phone",
          onPress: () => {},
          label: `Call ${friend.username}`,
        }}
      />

      {/* Messages list */}
      <FlatList
        data={messages}
        keyExtractor={(msg) => msg.id}
        renderItem={({ item }) => (
          <View
            style={[
              styles.messageRow,
              item.user === "You" && styles.messageRowOwn,
            ]}
          >
            <View
              style={[
                styles.messageBubble,
                { borderRadius: responsive.cardRadius - 2 },
                item.user === "You"
                  ? styles.messageBubbleOwn
                  : styles.messageBubbleOther,
              ]}
            >
              <View style={styles.messageMetaRow}>
                <Text
                  style={[
                    styles.messageAuthor,
                    { fontSize: responsive.captionSize },
                    item.user === "You" && styles.messageAuthorOwn,
                  ]}
                >
                  {item.user}
                </Text>
                <Text
                  style={[
                    styles.messageTime,
                    { fontSize: responsive.captionSize },
                    item.user === "You" && styles.messageTimeOwn,
                  ]}
                >
                  {formatChatTime(item.timestamp)}
                </Text>
              </View>
              <Text
                style={[
                  styles.messageText,
                  { fontSize: responsive.bodySize, lineHeight: Math.round(responsive.bodySize * 1.4) },
                  item.user === "You" && styles.messageTextOwn,
                ]}
              >
                {item.text}
              </Text>
            </View>
          </View>
        )}
        scrollEnabled={true}
        style={styles.messageList}
        contentContainerStyle={styles.messageListContent}
      />

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
          multiline
          maxLength={500}
          accessibilityLabel="Message input"
        />

        <Pressable
          onPress={handleSendMessage}
          accessibilityRole="button"
          accessibilityLabel="Send message"
          style={({ pressed }) => [
            styles.sendButton,
            {
              width: responsive.touchTargetMin,
              height: responsive.touchTargetMin,
              borderRadius: responsive.touchTargetMin / 2,
            },
            pressed && { opacity: 0.7 },
          ]}
        >
          <MaterialCommunityIcons
            name="send"
            size={20}
            color={colors.background}
          />
        </Pressable>
      </View>
    </Screen>
  );
}

function formatChatTime(date: Date): string {
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
    alignItems: "flex-end",
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
    paddingVertical: spacing.sm,
    borderRadius: 20,
    maxHeight: 100,
    minHeight: 36,
  },
  sendButton: {
    backgroundColor: colors.primary,
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
  },
});
