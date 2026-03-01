import { useLocalSearchParams, useRouter } from "expo-router";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import React, { useState } from "react";
import { FlatList, Pressable, StyleSheet, TextInput, View } from "react-native";
import { Text } from "react-native-paper";
import { Card } from "../../src/components/ui/Card";
import { Chip } from "../../src/components/ui/Chip";
import { Header } from "../../src/components/ui/Header";
import { Screen } from "../../src/components/ui/Screen";
import { mockFriends, mockGroups } from "../../src/lib/mockData";
import { useResponsive } from "../../src/lib/responsive";
import { colors, spacing } from "../../src/lib/theme";

// GroupDetailScreen: Shows group details, home, events, chat, members
// Backend integration: GET /api/groups/{id}, POST /api/groups/{id}/messages in Phase B
// Tabs: home, events, chat, members

export default function GroupDetailScreen() {
  const router = useRouter();
  const responsive = useResponsive();
  const { groupId } = useLocalSearchParams<{ groupId?: string }>();
  const group = mockGroups.find((item) => item.id === groupId) ?? mockGroups[0];
  const initialMembers = Array.isArray(group.members) ? group.members : [];
  const [members, setMembers] = useState<string[]>(initialMembers);
  const [isJoined, setIsJoined] = useState(
    initialMembers.some((member) => member.toLowerCase() === "you"),
  );
  const [activeTab, setActiveTab] = useState<"home" | "events" | "chat" | "members">(
    "home",
  );
  const [chatMessage, setChatMessage] = useState("");
  const [messages, setMessages] = useState<
    Array<{ id: string; user: string; text: string; timestamp: Date }>
  >([
    {
      id: "1",
      user: "ProPlayer_X",
      text: "Who wants to ranked grind today?",
      timestamp: new Date(Date.now() - 14 * 60000),
    },
    {
      id: "2",
      user: "You",
      text: "I'm in! Let's go.",
      timestamp: new Date(Date.now() - 12 * 60000),
    },
  ]);

  const handleSendMessage = () => {
    if (chatMessage.trim()) {
      if (!isJoined) return;
      setMessages([
        ...messages,
        { id: Date.now().toString(), user: "You", text: chatMessage, timestamp: new Date() },
      ]);
      setChatMessage("");
    }
  };

  const handleJoinGroup = () => {
    if (isJoined) return;
    setIsJoined(true);
    setMembers((prev) =>
      prev.some((member) => member.toLowerCase() === "you")
        ? prev
        : [...prev, "You"],
    );
  };

  return (
    <Screen scrollable={false}>
      <Header title={group.name} showBackButton />

      {/* Group header info */}
      <Card style={styles.headerCard}>
        <View style={styles.headerRow}>
          <View>
            <Text style={[styles.gameName, { fontSize: responsive.bodySize + 2 }]}>{group.game}</Text>
            <Text style={[styles.description, { fontSize: responsive.bodySmallSize }]}>{group.description}</Text>
          </View>
          <Text style={[styles.memberCount, { fontSize: responsive.titleSize - 10 }]}>
            {group.memberCount}
          </Text>
        </View>

        <View style={styles.badges}>
          {group.mode === "ranked" && (
            <Chip
              icon="star"
              label="Ranked"
              size="small"
              style={styles.badge}
            />
          )}
          {group.micRequired && (
            <Chip
              icon="microphone"
              label="Mic Required"
              size="small"
              style={styles.badge}
            />
          )}
          {group.minRank && (
            <Chip
              label={`${group.minRank}+`}
              size="small"
              style={styles.badge}
            />
          )}
        </View>

        <Pressable
          onPress={handleJoinGroup}
          accessibilityRole="button"
          accessibilityLabel={isJoined ? `${group.name} joined` : `Join ${group.name}`}
          accessibilityState={{ selected: isJoined }}
          style={({ pressed }) => [
            styles.joinButton,
            {
              borderRadius: responsive.cardRadius - 8,
              minHeight: responsive.buttonHeightMedium,
            },
            isJoined && styles.joinedButton,
            pressed && styles.joinButtonPressed,
          ]}
        >
          <Text
            style={[
              styles.joinButtonText,
              { fontSize: responsive.bodySmallSize },
              isJoined && styles.joinedButtonText,
            ]}
          >
            {isJoined ? "Joined" : "Join Group"}
          </Text>
        </Pressable>
      </Card>

      {/* Tab selector */}
      <View style={styles.tabSelector}>
        {["home", "events", "chat", "members"].map((tab) => (
          <Pressable
            key={tab}
            onPress={() => setActiveTab(tab as any)}
            accessibilityRole="button"
            accessibilityLabel={`Show ${tab} tab`}
            accessibilityState={{ selected: activeTab === tab }}
            style={({ pressed }) => [
              styles.tabButton,
              { minHeight: responsive.buttonHeightSmall },
              activeTab === tab && styles.tabButtonActive,
              pressed && styles.joinButtonPressed,
            ]}
          >
            <Text
              style={[
                styles.tabText,
                { fontSize: responsive.captionSize },
                activeTab === tab && styles.tabTextActive,
              ]}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* Tab content */}
      {activeTab === "home" && (
        <View style={styles.homeWrap}>
          <Card style={styles.homeCard}>
            <Text style={[styles.homeTitle, { fontSize: responsive.bodySize + 2 }]}>
              Group Home
            </Text>
            <Text style={[styles.homeCopy, { fontSize: responsive.bodySmallSize }]}>
              {group.description}
            </Text>
            <View style={styles.homeStatsRow}>
              <View style={styles.homeStatPill}>
                <Text style={styles.homeStatValue}>{members.length}</Text>
                <Text style={styles.homeStatLabel}>Members</Text>
              </View>
              <View style={styles.homeStatPill}>
                <Text style={styles.homeStatValue}>{group.mode}</Text>
                <Text style={styles.homeStatLabel}>Mode</Text>
              </View>
              <View style={styles.homeStatPill}>
                <Text style={styles.homeStatValue}>{group.micRequired ? "Yes" : "No"}</Text>
                <Text style={styles.homeStatLabel}>Mic</Text>
              </View>
            </View>
            <View style={styles.homeQuickRow}>
              <Pressable
                onPress={() => setActiveTab("chat")}
                accessibilityRole="button"
                accessibilityLabel="Open group chat"
                style={({ pressed }) => [styles.homeQuickButton, pressed && styles.joinButtonPressed]}
              >
                <MaterialCommunityIcons name="message-text-outline" size={16} color="#1A1A1A" />
                <Text style={styles.homeQuickButtonText}>Open Chat</Text>
              </Pressable>
              <Pressable
                onPress={() => setActiveTab("members")}
                accessibilityRole="button"
                accessibilityLabel="Open members list"
                style={({ pressed }) => [
                  styles.homeQuickButtonSecondary,
                  pressed && styles.joinButtonPressed,
                ]}
              >
                <MaterialCommunityIcons name="account-group-outline" size={16} color={colors.text} />
                <Text style={styles.homeQuickButtonSecondaryText}>Members</Text>
              </Pressable>
            </View>
          </Card>
        </View>
      )}

      {activeTab === "members" && (
        <FlatList
          data={members}
          keyExtractor={(_, idx) => `${idx}`}
          renderItem={({ item, index }) => (
            <Pressable
              style={[styles.memberItem, { minHeight: responsive.touchTargetMin }]}
              onPress={() => {
                const matchedUser = mockFriends.find(
                  (friend) => friend.username === item || friend.name === item,
                );
                if (matchedUser) {
                  router.push(
                    `/(tabs)/user-profile?userId=${matchedUser.id}` as any,
                  );
                }
              }}
              accessibilityRole="button"
              accessibilityLabel={`${item} member profile`}
            >
              <Text style={styles.memberAvatar}>👤</Text>
              <Text style={[styles.memberName, { fontSize: responsive.bodySize }]}>{item}</Text>
              {index === 0 && (
                <Chip label="Admin" size="small" style={styles.adminBadge} />
              )}
            </Pressable>
          )}
          scrollEnabled={true}
          style={styles.tabList}
          contentContainerStyle={styles.tabListContent}
        />
      )}

      {activeTab === "chat" && (
        <>
          <FlatList
            data={messages}
            keyExtractor={(msg) => msg.id}
            renderItem={({ item }) => (
              <View
                style={[
                  styles.messageItem,
                  { borderRadius: responsive.cardRadius - 6 },
                  item.user === "You" && styles.messageItemOwn,
                ]}
              >
                <View style={styles.messageMetaRow}>
                  <Text
                    style={[
                      styles.messageUser,
                      { fontSize: responsive.captionSize },
                      item.user === "You" && styles.messageUserOwn,
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
                    { fontSize: responsive.bodySize },
                    item.user === "You" && styles.messageTextOwn,
                  ]}
                >
                  {item.text}
                </Text>
              </View>
            )}
            scrollEnabled={true}
            style={styles.chat}
            contentContainerStyle={styles.tabListContent}
          />

          <View style={styles.composer}>
            <TextInput
              style={[
                styles.input,
                {
                  borderRadius: responsive.cardRadius,
                  fontSize: responsive.bodySize,
                },
              ]}
              placeholder={isJoined ? "Message group..." : "Join group to message"}
              placeholderTextColor={colors.textMuted}
              value={chatMessage}
              onChangeText={setChatMessage}
              multiline
              editable={isJoined}
              accessibilityLabel="Group message"
            />
            <Pressable
              onPress={handleSendMessage}
              accessibilityRole="button"
              accessibilityLabel="Send message"
              accessibilityState={{ disabled: !isJoined }}
              style={({ pressed }) => [
                styles.sendButton,
                {
                  minWidth: responsive.touchTargetMin,
                  minHeight: responsive.touchTargetMin,
                  width: responsive.iconButtonSize,
                  height: responsive.iconButtonSize,
                  borderRadius: responsive.iconButtonSize / 2,
                },
                !isJoined && styles.sendButtonDisabled,
                pressed && { opacity: 0.7 },
              ]}
              disabled={!isJoined}
            >
              <MaterialCommunityIcons
                name="send"
                size={20}
                color={colors.background}
              />
            </Pressable>
          </View>
        </>
      )}

      {activeTab === "events" && (
        <View style={styles.emptyState}>
          <Text style={[styles.emptyText, { fontSize: responsive.bodySize }]}>No events scheduled</Text>
          <Text style={[styles.emptySubtext, { fontSize: responsive.bodySmallSize }]}>
            Upcoming events will appear here
          </Text>
        </View>
      )}
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
  headerCard: {
    marginBottom: spacing.lg,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: spacing.md,
  },
  gameName: {
    color: colors.text,
    fontWeight: "700",
    fontSize: 16,
    marginBottom: spacing.xs,
  },
  description: {
    color: colors.textMuted,
    fontSize: 12,
    maxWidth: 200,
  },
  memberCount: {
    color: colors.primary,
    fontWeight: "600",
    fontSize: 24,
  },
  badges: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  badge: {
    marginRight: spacing.xs,
  },
  joinButton: {
    marginTop: spacing.md,
    backgroundColor: colors.primary,
    borderRadius: 10,
    paddingVertical: spacing.sm,
    alignItems: "center",
    justifyContent: "center",
  },
  joinButtonPressed: {
    opacity: 0.8,
  },
  joinButtonText: {
    color: colors.background,
    fontWeight: "700",
    fontSize: 13,
  },
  joinedButton: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  joinedButtonText: {
    color: colors.primary,
  },
  tabSelector: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    marginBottom: spacing.md,
  },
  tabList: {
    flex: 1,
  },
  tabListContent: {
    paddingBottom: spacing.md,
  },
  tabButton: {
    flex: 1,
    paddingVertical: spacing.md,
    alignItems: "center",
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
  },
  tabButtonActive: {
    borderBottomColor: colors.primary,
  },
  tabText: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: "600",
  },
  tabTextActive: {
    color: colors.primary,
  },
  memberItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    gap: spacing.md,
  },
  memberAvatar: {
    fontSize: 24,
  },
  memberName: {
    color: colors.text,
    flex: 1,
    fontSize: 14,
  },
  adminBadge: {
    height: 24,
  },
  chat: {
    flex: 1,
    paddingHorizontal: spacing.md,
  },
  homeWrap: {
    flex: 1,
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
  },
  homeCard: {
    marginBottom: 0,
  },
  homeTitle: {
    color: colors.text,
    fontWeight: "800",
  },
  homeCopy: {
    color: colors.textSecondary,
    marginTop: spacing.xs,
    lineHeight: 19,
  },
  homeStatsRow: {
    flexDirection: "row",
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  homeStatPill: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: "#242424",
    borderRadius: 12,
    paddingVertical: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  homeStatValue: {
    color: colors.text,
    fontWeight: "800",
    fontSize: 14,
    textTransform: "capitalize",
  },
  homeStatLabel: {
    color: colors.textSecondary,
    fontSize: 11,
    marginTop: 2,
  },
  homeQuickRow: {
    flexDirection: "row",
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  homeQuickButton: {
    flex: 1,
    minHeight: 44,
    backgroundColor: colors.primary,
    borderRadius: 999,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  homeQuickButtonText: {
    color: "#1A1A1A",
    fontWeight: "800",
    fontSize: 13,
  },
  homeQuickButtonSecondary: {
    flex: 1,
    minHeight: 44,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: "#2A2A2A",
    borderRadius: 999,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  homeQuickButtonSecondaryText: {
    color: colors.text,
    fontWeight: "700",
    fontSize: 13,
  },
  messageItem: {
    backgroundColor: colors.card,
    borderRadius: 12,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    marginVertical: spacing.xs,
    maxWidth: "80%",
  },
  messageItemOwn: {
    backgroundColor: colors.primary,
    alignSelf: "flex-end",
  },
  messageUser: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: "700",
    flexShrink: 1,
  },
  messageUserOwn: {
    color: "#1A1A1A",
  },
  messageMetaRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.md,
    marginBottom: spacing.xs,
  },
  messageTime: {
    color: colors.textMuted,
    fontWeight: "600",
  },
  messageTimeOwn: {
    color: "#1A1A1A",
  },
  messageText: {
    color: colors.text,
    fontSize: 14,
  },
  messageTextOwn: {
    color: "#1A1A1A",
  },
  composer: {
    flexDirection: "row",
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  input: {
    flex: 1,
    backgroundColor: colors.card,
    color: colors.text,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 20,
    minHeight: 40,
  },
  sendButton: {
    backgroundColor: colors.primary,
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  sendButtonDisabled: {
    opacity: 0.45,
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: spacing.xl,
  },
  emptyText: {
    color: colors.textMuted,
    fontSize: 14,
    marginBottom: spacing.sm,
  },
  emptySubtext: {
    color: colors.textMuted,
    fontSize: 12,
  },
});
