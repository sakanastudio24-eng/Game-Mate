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
              <Text
                style={[
                  styles.messageText,
                  { fontSize: responsive.bodySize, lineHeight: Math.round(responsive.bodySize * 1.4) },
                  item.user === "You" && styles.messageTextOwn,
                ]}
              >
                {item.text}
              </Text>
              <Text style={[styles.messageTime, { fontSize: responsive.captionSize }]}>
                {getTimeAgo(item.timestamp)}
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
          style={[
            styles.attachButton,
            {
              width: responsive.iconButtonSize - 4,
              height: responsive.iconButtonSize - 4,
              borderRadius: (responsive.iconButtonSize - 4) / 2,
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
        />

        <Pressable
          onPress={handleSendMessage}
          style={({ pressed }) => [
            styles.sendButton,
            {
              width: responsive.iconButtonSize - 4,
              height: responsive.iconButtonSize - 4,
              borderRadius: (responsive.iconButtonSize - 4) / 2,
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

function getTimeAgo(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);

  if (diffMins < 1) return "now";
  if (diffMins < 60) return `${diffMins}m ago`;
  return `${Math.floor(diffMins / 60)}h ago`;
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
  messageTime: {
    color: colors.textMuted,
    fontSize: 10,
    marginTop: spacing.xs,
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
