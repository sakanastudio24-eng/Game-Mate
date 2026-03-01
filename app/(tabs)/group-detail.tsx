import { useLocalSearchParams, useRouter } from "expo-router";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import React, { useState } from "react";
import { Alert, FlatList, Pressable, Share, StyleSheet, TextInput, View } from "react-native";
import { Text } from "react-native-paper";
import { ActionSheet } from "../../src/components/ui/ActionSheet";
import { Chip } from "../../src/components/ui/Chip";
import { Header } from "../../src/components/ui/Header";
import { Screen } from "../../src/components/ui/Screen";
import { androidKeyboardCompatProps } from "../../src/lib/androidInput";
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
  const normalizedGroupId = typeof groupId === "string" ? groupId : undefined;
  const resolvedGroupId =
    normalizedGroupId?.startsWith("s") ? normalizedGroupId.slice(1) : normalizedGroupId;
  const group =
    mockGroups.find((item) => item.id === normalizedGroupId || item.id === resolvedGroupId) ??
    mockGroups[0];
  const initialMembers = Array.isArray(group.members) ? group.members : [];
  const [members] = useState<string[]>(initialMembers);
  const [activeTab, setActiveTab] = useState<"home" | "events" | "chat" | "members">(
    "home",
  );
  const [groupSettingsOpen, setGroupSettingsOpen] = useState(false);
  const [chatMessage, setChatMessage] = useState("");
  const onlineCount = Math.max(1, Math.min(group.memberCount, Math.round(group.memberCount * 0.55)));
  const groupEvents = [
    {
      id: "h-ev-1",
      title: group.mode === "ranked" ? "Ranked Session" : "Casual Queue Night",
      time: "Tonight · 8:00 PM",
    },
    {
      id: "h-ev-2",
      title: "Team Check-In",
      time: "Tomorrow · 7:30 PM",
    },
  ];
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
      setMessages([
        ...messages,
        { id: Date.now().toString(), user: "You", text: chatMessage, timestamp: new Date() },
      ]);
      setChatMessage("");
    }
  };

  const handleShareGroup = async () => {
    try {
      await Share.share({
        message: `Join my group on GameMate: ${group.name} (${group.game})`,
      });
    } catch {
      // no-op
    }
  };

  const handleReportGroup = () => {
    Alert.alert("Report Submitted", `Thanks. "${group.name}" was reported for review.`);
  };

  const handleLeaveGroup = () => {
    Alert.alert("Leave Group", `Leave "${group.name}"?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Leave",
        style: "destructive",
        onPress: () => {
          router.replace("/(tabs)/groups");
        },
      },
    ]);
  };

  const renderEventRow = (event: { id: string; title: string; time: string }) => (
    <View key={event.id} style={styles.homeEventRow}>
      <MaterialCommunityIcons name="calendar-clock" size={16} color={colors.primary} />
      <View style={styles.homeEventTextWrap}>
        <Text style={styles.homeEventTitle}>{event.title}</Text>
        <Text style={styles.homeEventTime}>{event.time}</Text>
      </View>
    </View>
  );

  return (
    <Screen scrollable={false}>
      <Header
        title={group.name}
        showBackButton
        rightAction={{
          icon: "cog-outline",
          label: `${group.name} settings`,
          onPress: () => setGroupSettingsOpen(true),
        }}
      />

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
              pressed && styles.pressed,
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
          <Text style={[styles.homeName, { fontSize: responsive.sectionTitleSize }]}>
            {group.name}
          </Text>
          <Text style={[styles.homeSubtitle, { fontSize: responsive.bodySmallSize }]}>
            {group.game} · {group.mode === "ranked" ? "Competitive Squad" : "Casual Squad"}
          </Text>

          <View style={styles.homeTagRow}>
            {group.mode === "ranked" && (
              <View style={styles.homeTag}>
                <MaterialCommunityIcons name="star-outline" size={13} color={colors.primary} />
                <Text style={styles.homeTagText}>Ranked</Text>
              </View>
            )}
            {group.micRequired && (
              <View style={styles.homeTag}>
                <MaterialCommunityIcons name="microphone-outline" size={13} color={colors.primary} />
                <Text style={styles.homeTagText}>Mic Required</Text>
              </View>
            )}
            {group.minRank && (
              <View style={styles.homeTag}>
                <MaterialCommunityIcons name="signal-cellular-2" size={13} color={colors.primary} />
                <Text style={styles.homeTagText}>{group.minRank}+</Text>
              </View>
            )}
          </View>

          <View style={styles.homeInlineStats}>
            <View style={styles.homeInlineStat}>
              <Text style={styles.homeInlineStatValue}>{onlineCount}</Text>
              <Text style={styles.homeInlineStatLabel}>Online</Text>
            </View>
            <View style={styles.homeInlineStat}>
              <Text style={styles.homeInlineStatValue}>{members.length}</Text>
              <Text style={styles.homeInlineStatLabel}>Members</Text>
            </View>
          </View>

          <Text style={[styles.homeSectionTitle, { fontSize: responsive.bodySmallSize }]}>Description</Text>
          <Text style={[styles.homeBody, { fontSize: responsive.bodySmallSize }]}>
            {group.description}
          </Text>

          <Text style={[styles.homeSectionTitle, { fontSize: responsive.bodySmallSize }]}>Overview</Text>
          <Text style={[styles.homeBody, { fontSize: responsive.bodySmallSize }]}>
            {group.mode === "ranked"
              ? "Focused competitive play with coordinated sessions and clear comms."
              : "Relaxed sessions for regular play, learning, and team chemistry."}
          </Text>

          <Text style={[styles.homeSectionTitle, { fontSize: responsive.bodySmallSize }]}>Events</Text>
          <View style={styles.homeEventsList}>
            {groupEvents.map((event) => renderEventRow(event))}
          </View>
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
              placeholder="Message group..."
              placeholderTextColor={colors.textMuted}
              value={chatMessage}
              onChangeText={setChatMessage}
              {...androidKeyboardCompatProps}
              multiline
              editable
              accessibilityLabel="Group message"
            />
            <Pressable
              onPress={handleSendMessage}
              accessibilityRole="button"
              accessibilityLabel="Send message"
              style={({ pressed }) => [
                styles.sendButton,
                {
                  minWidth: responsive.touchTargetMin,
                  minHeight: responsive.touchTargetMin,
                  width: responsive.iconButtonSize,
                  height: responsive.iconButtonSize,
                  borderRadius: responsive.iconButtonSize / 2,
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
        </>
      )}

      {activeTab === "events" && (
        <View style={styles.eventsWrap}>
          <Text style={[styles.homeSectionTitle, { fontSize: responsive.bodySmallSize }]}>
            Events
          </Text>
          <View style={styles.homeEventsList}>
            {groupEvents.map((event) => renderEventRow(event))}
          </View>
        </View>
      )}

      <ActionSheet
        visible={groupSettingsOpen}
        title="Group Settings"
        subtitle={group.name}
        onClose={() => setGroupSettingsOpen(false)}
        options={[
          {
            id: "notifications",
            label: "Notifications",
            icon: "bell-outline",
            onPress: () => router.push("/(tabs)/notification-settings" as any),
          },
          {
            id: "share",
            label: "Share",
            icon: "share-variant-outline",
            onPress: () => {
              void handleShareGroup();
            },
          },
          {
            id: "report",
            label: "Report",
            icon: "flag-outline",
            onPress: handleReportGroup,
          },
          {
            id: "leave",
            label: "Leave Group",
            icon: "exit-run",
            destructive: true,
            onPress: handleLeaveGroup,
          },
        ]}
      />
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
  pressed: {
    opacity: 0.8,
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
  eventsWrap: {
    flex: 1,
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
  },
  homeName: {
    color: colors.text,
    fontWeight: "800",
    marginTop: spacing.xs,
  },
  homeSubtitle: {
    color: colors.textSecondary,
    marginTop: 2,
  },
  homeTagRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.xs,
    marginTop: spacing.sm,
  },
  homeTag: {
    borderWidth: 1,
    borderColor: "#5A5A5A",
    backgroundColor: "#151515",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 7,
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  homeTagText: {
    color: colors.text,
    fontSize: 12,
    fontWeight: "700",
    textTransform: "capitalize",
  },
  homeInlineStats: {
    flexDirection: "row",
    gap: spacing.sm,
    marginTop: spacing.md,
    marginBottom: spacing.xs,
  },
  homeInlineStat: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingVertical: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  homeInlineStatValue: {
    color: colors.text,
    fontWeight: "800",
    fontSize: 15,
  },
  homeInlineStatLabel: {
    color: colors.textSecondary,
    fontSize: 11,
    marginTop: 2,
  },
  homeSectionTitle: {
    color: colors.textSecondary,
    marginTop: spacing.md,
    lineHeight: 19,
    fontWeight: "700",
  },
  homeBody: {
    color: colors.textSecondary,
    lineHeight: 20,
  },
  homeEventsList: {
    marginTop: spacing.sm,
    gap: spacing.sm,
  },
  homeEventRow: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: "#1B1B1B",
  },
  homeEventTextWrap: {
    marginLeft: spacing.sm,
    flex: 1,
  },
  homeEventTitle: {
    color: colors.text,
    fontWeight: "700",
    fontSize: 13,
  },
  homeEventTime: {
    color: colors.textSecondary,
    fontSize: 12,
    marginTop: 2,
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
});
