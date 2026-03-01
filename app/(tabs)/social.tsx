import { useRouter } from "expo-router";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import React, { useMemo, useState } from "react";
import { FlatList, Image, Pressable, StyleSheet, View } from "react-native";
import { Searchbar, Text } from "react-native-paper";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AnimatedEntrance } from "../../src/components/ui/AnimatedEntrance";
import { useResponsive } from "../../src/lib/responsive";
import { colors, spacing } from "../../src/lib/theme";

type SocialTab = "friends" | "messages" | "requests";

interface FriendItem {
  id: string;
  name: string;
  game?: string;
  statusText: string;
  level: number;
  online: boolean;
  avatar: string;
}

interface MessageItem {
  id: string;
  userId: string;
  user: string;
  message: string;
  time: string;
  unread: number;
  online: boolean;
  avatar: string;
}

interface RequestItem {
  id: string;
  userId: string;
  name: string;
  mutualFriends: number;
  games: string[];
  avatar: string;
}

const onlineFriends: FriendItem[] = [
  {
    id: "1",
    name: "ProGamer92",
    game: "Playing Valorant",
    statusText: "In Competitive",
    level: 45,
    online: true,
    avatar:
      "https://images.unsplash.com/photo-1642792247757-c212e8ba9af9?w=200&h=200&fit=crop",
  },
  {
    id: "3",
    name: "EchoPlayer",
    game: "Playing CS2",
    statusText: "In Match",
    level: 38,
    online: true,
    avatar:
      "https://images.unsplash.com/photo-1572704764530-5b5da1f5a973?w=200&h=200&fit=crop",
  },
  {
    id: "4",
    name: "NovaStrike",
    game: "Playing Overwatch 2",
    statusText: "In Queue",
    level: 52,
    online: true,
    avatar:
      "https://images.unsplash.com/photo-1759701546655-d90ec831aa52?w=200&h=200&fit=crop",
  },
];

const offlineFriends: FriendItem[] = [
  {
    id: "2",
    name: "SkyWalker",
    statusText: "2 hours ago",
    level: 42,
    online: false,
    avatar:
      "https://images.unsplash.com/photo-1599220274056-a6cdbe06c2c0?w=200&h=200&fit=crop",
  },
  {
    id: "5",
    name: "PlayerEater",
    statusText: "1 day ago",
    level: 28,
    online: false,
    avatar:
      "https://images.unsplash.com/photo-1637767125552-b89f5e1ab923?w=200&h=200&fit=crop",
  },
  {
    id: "6",
    name: "NoobMaster",
    statusText: "3 days ago",
    level: 35,
    online: false,
    avatar:
      "https://images.unsplash.com/photo-1633286464918-4d78c8424b59?w=200&h=200&fit=crop",
  },
];

const messageItems: MessageItem[] = [
  {
    id: "m1",
    userId: "1",
    user: "ProGamer92",
    message: "Want to queue up?",
    time: "2m ago",
    unread: 2,
    online: true,
    avatar:
      "https://images.unsplash.com/photo-1642792247757-c212e8ba9af9?w=200&h=200&fit=crop",
  },
  {
    id: "m2",
    userId: "3",
    user: "EchoPlayer",
    message: "GG last night!",
    time: "1h ago",
    unread: 0,
    online: true,
    avatar:
      "https://images.unsplash.com/photo-1572704764530-5b5da1f5a973?w=200&h=200&fit=crop",
  },
  {
    id: "m3",
    userId: "2",
    user: "SkyWalker",
    message: "Check this strat",
    time: "3h ago",
    unread: 1,
    online: false,
    avatar:
      "https://images.unsplash.com/photo-1599220274056-a6cdbe06c2c0?w=200&h=200&fit=crop",
  },
];

const initialRequests: RequestItem[] = [
  {
    id: "r1",
    userId: "4",
    name: "NovaStrike",
    mutualFriends: 5,
    games: ["Overwatch 2", "CS2"],
    avatar:
      "https://images.unsplash.com/photo-1613063022614-dc11527f5ece?w=200&h=200&fit=crop",
  },
  {
    id: "r2",
    userId: "1",
    name: "ProGamer92",
    mutualFriends: 3,
    games: ["Valorant"],
    avatar:
      "https://images.unsplash.com/photo-1628501899963-43bb8e2423e1?w=200&h=200&fit=crop",
  },
];

export default function SocialScreen() {
  const router = useRouter();
  const responsive = useResponsive();
  const insets = useSafeAreaInsets();
  const safeTop = Math.max(insets.top, responsive.safeTopInset) + responsive.headerTopSpacing;
  const safeBottom = Math.max(insets.bottom, responsive.safeBottomInset);
  const [activeTab, setActiveTab] = useState<SocialTab>("friends");
  const [search, setSearch] = useState("");
  const [requests, setRequests] = useState<RequestItem[]>(initialRequests);
  const profileAvatarSize = responsive.isSmallPhone ? 48 : responsive.isLargePhone ? 58 : 54;
  const actionCircleSize = Math.max(responsive.touchTargetMin, 42);

  const filteredOnline = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return onlineFriends;
    return onlineFriends.filter((friend) => friend.name.toLowerCase().includes(q));
  }, [search]);

  const filteredOffline = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return offlineFriends;
    return offlineFriends.filter((friend) => friend.name.toLowerCase().includes(q));
  }, [search]);

  const filteredMessages = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return messageItems;
    return messageItems.filter((message) =>
      [message.user, message.message].join(" ").toLowerCase().includes(q),
    );
  }, [search]);

  const filteredRequests = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return requests;
    return requests.filter((request) =>
      [request.name, request.games.join(" ")].join(" ").toLowerCase().includes(q),
    );
  }, [requests, search]);

  const handleAcceptRequest = (requestId: string) => {
    setRequests((prev) => prev.filter((request) => request.id !== requestId));
  };

  const handleDeclineRequest = (requestId: string) => {
    setRequests((prev) => prev.filter((request) => request.id !== requestId));
  };

  const searchPlaceholder =
    activeTab === "friends"
      ? "Search friends..."
      : activeTab === "messages"
        ? "Search messages..."
        : "Search requests...";

  return (
    <View style={styles.screen}>
      <AnimatedEntrance preset="screen">
        <View
          style={[
            styles.headerWrap,
            {
              paddingTop: safeTop,
              paddingHorizontal: responsive.horizontalPadding,
              maxWidth: responsive.contentMaxWidth,
              alignSelf: "center",
              width: "100%",
            },
          ]}
        >
          <View style={styles.titleRow}>
            <Text
              accessibilityRole="header"
              style={[
                styles.title,
                {
                  fontSize: responsive.headerTitleSize + 8,
                  lineHeight: Math.round((responsive.headerTitleSize + 8) * 1.14),
                },
              ]}
            >
              Social
            </Text>

            <View style={styles.headerActions}>
              <Pressable
                onPress={() => router.push("/(tabs)/search-players")}
                accessibilityRole="button"
                accessibilityLabel="Find players"
                style={({ pressed }) => [
                  styles.iconButton,
                  {
                    width: responsive.iconButtonSize,
                    height: responsive.iconButtonSize,
                    borderRadius: responsive.iconButtonSize / 2,
                  },
                  pressed && styles.pressed,
                ]}
              >
                <MaterialCommunityIcons name="account-plus-outline" size={20} color={colors.text} />
              </Pressable>

              <Pressable
                onPress={() => router.push("/(tabs)/qr-code")}
                accessibilityRole="button"
                accessibilityLabel="Open QR code"
                style={({ pressed }) => [
                  styles.iconButton,
                  {
                    width: responsive.iconButtonSize,
                    height: responsive.iconButtonSize,
                    borderRadius: responsive.iconButtonSize / 2,
                  },
                  pressed && styles.pressed,
                ]}
              >
                <MaterialCommunityIcons name="qrcode" size={20} color={colors.text} />
              </Pressable>
            </View>
          </View>

          <View style={styles.tabRow}>
            {(
              [
                { id: "friends", label: "Friends" },
                { id: "messages", label: "Messages" },
                { id: "requests", label: `Requests (${requests.length})` },
              ] as const
            ).map((tab) => {
              const selected = activeTab === tab.id;
              return (
                <Pressable
                  key={tab.id}
                  onPress={() => setActiveTab(tab.id)}
                  accessibilityRole="button"
                  accessibilityLabel={`Show ${tab.label}`}
                  accessibilityState={{ selected }}
                  style={[
                    styles.tabButton,
                    {
                      borderRadius: responsive.cardRadius - 6,
                      paddingVertical: Math.max(9, responsive.cardPadding - 2),
                      minHeight: responsive.buttonHeightSmall,
                    },
                    selected ? styles.tabButtonActive : undefined,
                  ]}
                >
                  <Text
                    style={[
                      styles.tabText,
                      { fontSize: responsive.bodySmallSize },
                      selected ? styles.tabTextActive : undefined,
                    ]}
                  >
                    {tab.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <Searchbar
            placeholder={searchPlaceholder}
            value={search}
            onChangeText={setSearch}
            accessibilityLabel={searchPlaceholder}
            style={[styles.searchbar, { borderRadius: responsive.searchRadius }]}
            inputStyle={[styles.searchInput, { fontSize: responsive.bodySize }]}
            iconColor={colors.textSecondary}
            placeholderTextColor={colors.textSecondary}
          />
        </View>
      </AnimatedEntrance>

      {activeTab === "friends" && (
        <FlatList
          data={[...filteredOnline, ...filteredOffline]}
          keyExtractor={(item) => item.id}
          ListHeaderComponent={
            <View
              style={{
                paddingHorizontal: responsive.horizontalPadding,
                maxWidth: responsive.contentMaxWidth,
                alignSelf: "center",
                width: "100%",
              }}
            >
              <View style={styles.sectionLabelRow}>
                <Text style={styles.sectionLabel}>Online</Text>
                <Text style={styles.sectionCount}>{filteredOnline.length}</Text>
              </View>
            </View>
          }
          renderItem={({ item, index }) => {
            const isOnline = item.online;
            const firstOfflineIndex = filteredOnline.length;
            const showOfflineTitle = !isOnline && index === firstOfflineIndex;

            return (
              <AnimatedEntrance preset="card" delay={80} staggerIndex={index}>
                <View
                  style={{
                    paddingHorizontal: responsive.horizontalPadding,
                    maxWidth: responsive.contentMaxWidth,
                    alignSelf: "center",
                    width: "100%",
                  }}
                >
                  {showOfflineTitle ? (
                    <View style={styles.offlineHeader}>
                      <Text style={styles.sectionLabel}>Offline</Text>
                      <Text style={styles.sectionCountMuted}>{filteredOffline.length}</Text>
                    </View>
                  ) : null}

                  <Pressable
                    onPress={() =>
                      router.push({
                        pathname: "/(tabs)/user-profile",
                        params: {
                          userId: item.id,
                          name: item.name,
                          avatar: item.avatar,
                          status: item.online ? "online" : "offline",
                          currentGame: item.game?.replace("Playing ", ""),
                          level: String(item.level),
                        },
                      })
                    }
                    accessibilityRole="button"
                    accessibilityLabel={`${item.name}, level ${item.level}, ${isOnline ? item.game : item.statusText}`}
                    accessibilityHint="Open player profile"
                    style={({ pressed }) => [
                      styles.friendCard,
                      {
                        borderRadius: responsive.cardRadius,
                        padding: responsive.cardPadding,
                      },
                      !isOnline ? styles.friendCardOffline : undefined,
                      pressed && styles.pressed,
                    ]}
                  >
                    <View style={styles.friendAvatarWrap}>
                      <Image
                        source={{ uri: item.avatar }}
                        style={[
                          styles.friendAvatar,
                          {
                            width: profileAvatarSize,
                            height: profileAvatarSize,
                            borderRadius: profileAvatarSize / 2,
                          },
                        ]}
                      />
                      {isOnline ? <View style={styles.friendOnlineDot} /> : null}
                    </View>

                    <View style={styles.friendInfo}>
                      <View style={styles.friendTopRow}>
                        <Text style={styles.friendName}>{item.name}</Text>
                        <Text style={styles.levelBadge}>Lvl {item.level}</Text>
                      </View>
                      <Text style={styles.friendPrimaryStatus}>{isOnline ? item.game : item.statusText}</Text>
                      {isOnline ? <Text style={styles.friendSecondaryStatus}>{item.statusText}</Text> : null}
                    </View>

                    {isOnline ? (
                      <Pressable
                        onPress={(event) => {
                          event.stopPropagation();
                          router.push(`/(tabs)/chat?userId=${item.id}`);
                        }}
                        accessibilityRole="button"
                        accessibilityLabel={`Message ${item.name}`}
                        style={({ pressed }) => [
                          styles.chatButton,
                          {
                            width: actionCircleSize,
                            height: actionCircleSize,
                            borderRadius: actionCircleSize / 2,
                          },
                          pressed && styles.pressed,
                        ]}
                      >
                        <MaterialCommunityIcons name="message-outline" size={19} color="#1A1A1A" />
                      </Pressable>
                    ) : null}
                  </Pressable>
                </View>
              </AnimatedEntrance>
            );
          }}
          contentContainerStyle={[styles.listContent, { paddingBottom: 96 + safeBottom }]}
          showsVerticalScrollIndicator={false}
        />
      )}

      {activeTab === "messages" && (
        <FlatList
          data={filteredMessages}
          keyExtractor={(item) => item.id}
          renderItem={({ item, index }) => (
            <AnimatedEntrance preset="card" delay={80} staggerIndex={index}>
              <View
                style={{
                  paddingHorizontal: responsive.horizontalPadding,
                  maxWidth: responsive.contentMaxWidth,
                  alignSelf: "center",
                  width: "100%",
                }}
              >
                <Pressable
                  onPress={() => router.push(`/(tabs)/chat?userId=${item.userId}`)}
                  accessibilityRole="button"
                  accessibilityLabel={`Open chat with ${item.user}. ${item.message}`}
                  style={({ pressed }) => [
                    styles.messageCard,
                    {
                      borderRadius: responsive.cardRadius,
                      padding: responsive.cardPadding,
                    },
                    pressed && styles.pressed,
                  ]}
                >
                  <View style={styles.messageAvatarWrap}>
                    <Image
                      source={{ uri: item.avatar }}
                      style={[
                        styles.messageAvatar,
                        {
                          width: profileAvatarSize,
                          height: profileAvatarSize,
                          borderRadius: profileAvatarSize / 2,
                        },
                      ]}
                    />
                    {item.online ? <View style={styles.friendOnlineDot} /> : null}
                  </View>

                  <View style={styles.messageInfo}>
                    <View style={styles.messageTopRow}>
                      <Text style={styles.messageUser}>{item.user}</Text>
                      <Text style={styles.messageTime}>{item.time}</Text>
                    </View>
                    <Text style={styles.messagePreview} numberOfLines={1}>
                      {item.message}
                    </Text>
                  </View>

                  {item.unread > 0 ? (
                    <View style={styles.unreadBadge}>
                      <Text style={styles.unreadText}>{item.unread}</Text>
                    </View>
                  ) : null}
                </Pressable>
              </View>
            </AnimatedEntrance>
          )}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Text style={styles.emptyTitle}>No messages found</Text>
              <Text style={styles.emptyCopy}>Try another search keyword.</Text>
            </View>
          }
          contentContainerStyle={[styles.listContent, { paddingBottom: 96 + safeBottom }]}
          showsVerticalScrollIndicator={false}
        />
      )}

      {activeTab === "requests" && (
        <FlatList
          data={filteredRequests}
          keyExtractor={(item) => item.id}
          renderItem={({ item, index }) => (
            <AnimatedEntrance preset="card" delay={80} staggerIndex={index}>
              <View
                style={{
                  paddingHorizontal: responsive.horizontalPadding,
                  maxWidth: responsive.contentMaxWidth,
                  alignSelf: "center",
                  width: "100%",
                }}
              >
                <View
                  style={[
                    styles.requestCard,
                    {
                      borderRadius: responsive.cardRadius,
                      padding: responsive.cardPadding,
                    },
                  ]}
                >
                  <Pressable
                    onPress={() =>
                      router.push({
                        pathname: "/(tabs)/user-profile",
                        params: {
                          userId: item.userId,
                          name: item.name,
                          avatar: item.avatar,
                          status: "online",
                        },
                      })
                    }
                    accessibilityRole="button"
                    accessibilityLabel={`Open profile for ${item.name}`}
                    style={({ pressed }) => [styles.requestTop, pressed && styles.pressed]}
                  >
                    <Image source={{ uri: item.avatar }} style={styles.requestAvatar} />
                    <View style={styles.requestInfo}>
                      <Text style={styles.requestName}>{item.name}</Text>
                      <Text style={styles.requestMeta}>{item.mutualFriends} mutual friends</Text>
                      <Text style={styles.requestGames}>{item.games.join(" · ")}</Text>
                    </View>
                  </Pressable>

                  <View style={styles.requestActions}>
                    <Pressable
                      onPress={() => handleAcceptRequest(item.id)}
                      accessibilityRole="button"
                      accessibilityLabel={`Accept request from ${item.name}`}
                      style={({ pressed }) => [
                        styles.acceptButton,
                        { minHeight: responsive.buttonHeightSmall, minWidth: responsive.touchTargetMin },
                        pressed && styles.pressed,
                      ]}
                    >
                      <Text style={styles.acceptText}>Accept</Text>
                    </Pressable>
                    <Pressable
                      onPress={() => handleDeclineRequest(item.id)}
                      accessibilityRole="button"
                      accessibilityLabel={`Decline request from ${item.name}`}
                      style={({ pressed }) => [
                        styles.declineButton,
                        { minHeight: responsive.buttonHeightSmall, minWidth: responsive.touchTargetMin },
                        pressed && styles.pressed,
                      ]}
                    >
                      <Text style={styles.declineText}>Decline</Text>
                    </Pressable>
                  </View>
                </View>
              </View>
            </AnimatedEntrance>
          )}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Text style={styles.emptyTitle}>No pending requests</Text>
              <Text style={styles.emptyCopy}>New friend invites will appear here.</Text>
            </View>
          }
          contentContainerStyle={[styles.listContent, { paddingBottom: 96 + safeBottom }]}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  headerWrap: {
    paddingTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.md,
  },
  title: {
    color: colors.text,
    fontWeight: "800",
  },
  headerActions: {
    flexDirection: "row",
  },
  iconButton: {
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: "#242424",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: spacing.sm,
  },
  tabRow: {
    flexDirection: "row",
    marginBottom: spacing.md,
  },
  tabButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: "#242424",
    borderRadius: 12,
    paddingVertical: 10,
    marginRight: 8,
    alignItems: "center",
  },
  tabButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  tabText: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: "800",
  },
  tabTextActive: {
    color: "#1A1A1A",
  },
  searchbar: {
    backgroundColor: "#242424",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.sm,
  },
  searchInput: {
    color: colors.text,
    fontSize: 14,
  },
  sectionLabelRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  sectionLabel: {
    color: colors.text,
    fontWeight: "800",
    fontSize: 18,
    marginRight: 8,
  },
  sectionCount: {
    color: "#4ADE80",
    backgroundColor: "rgba(74,222,128,0.12)",
    borderWidth: 1,
    borderColor: "rgba(74,222,128,0.3)",
    borderRadius: 999,
    overflow: "hidden",
    paddingHorizontal: 8,
    paddingVertical: 2,
    fontWeight: "700",
    fontSize: 12,
  },
  sectionCountMuted: {
    color: colors.textSecondary,
    backgroundColor: "#242424",
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 999,
    overflow: "hidden",
    paddingHorizontal: 8,
    paddingVertical: 2,
    fontWeight: "700",
    fontSize: 12,
  },
  offlineHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: spacing.sm,
    marginBottom: spacing.sm,
  },
  listContent: {
    paddingBottom: 110,
  },
  friendCard: {
    backgroundColor: "#242424",
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  friendCardOffline: {
    opacity: 0.6,
  },
  friendAvatarWrap: {
    position: "relative",
    marginRight: spacing.md,
  },
  friendAvatar: {
    width: 54,
    height: 54,
    borderRadius: 27,
    borderWidth: 2,
    borderColor: "#444",
  },
  friendOnlineDot: {
    position: "absolute",
    right: 0,
    bottom: 0,
    width: 13,
    height: 13,
    borderRadius: 7,
    borderWidth: 2,
    borderColor: "#242424",
    backgroundColor: "#4ADE80",
  },
  friendInfo: {
    flex: 1,
    marginRight: spacing.sm,
  },
  friendTopRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 2,
  },
  friendName: {
    color: colors.text,
    fontSize: 15,
    fontWeight: "800",
    marginRight: 8,
  },
  levelBadge: {
    color: colors.textSecondary,
    fontSize: 11,
    borderWidth: 1,
    borderColor: "#444",
    borderRadius: 999,
    overflow: "hidden",
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  friendPrimaryStatus: {
    color: colors.textSecondary,
    fontSize: 13,
  },
  friendSecondaryStatus: {
    color: "#4ADE80",
    fontSize: 11,
    marginTop: 2,
    fontWeight: "600",
  },
  chatButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  messageCard: {
    backgroundColor: "#242424",
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  messageAvatarWrap: {
    position: "relative",
    marginRight: spacing.md,
  },
  messageAvatar: {
    width: 54,
    height: 54,
    borderRadius: 27,
    borderWidth: 1,
    borderColor: "#444",
  },
  messageInfo: {
    flex: 1,
  },
  messageTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 2,
  },
  messageUser: {
    color: colors.text,
    fontSize: 15,
    fontWeight: "800",
  },
  messageTime: {
    color: colors.textSecondary,
    fontSize: 11,
  },
  messagePreview: {
    color: colors.textSecondary,
    fontSize: 13,
  },
  unreadBadge: {
    marginLeft: spacing.sm,
    minWidth: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 6,
  },
  unreadText: {
    color: "#1A1A1A",
    fontSize: 12,
    fontWeight: "800",
  },
  requestCard: {
    backgroundColor: "#242424",
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    padding: 12,
    marginBottom: spacing.sm,
  },
  requestTop: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  requestAvatar: {
    width: 54,
    height: 54,
    borderRadius: 27,
    marginRight: spacing.md,
    borderWidth: 1,
    borderColor: "#444",
  },
  requestInfo: {
    flex: 1,
  },
  requestName: {
    color: colors.text,
    fontSize: 15,
    fontWeight: "800",
  },
  requestMeta: {
    color: colors.textSecondary,
    fontSize: 12,
    marginTop: 2,
  },
  requestGames: {
    color: colors.primary,
    fontSize: 12,
    marginTop: 4,
  },
  requestActions: {
    flexDirection: "row",
  },
  acceptButton: {
    flex: 1,
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 10,
    alignItems: "center",
    marginRight: spacing.sm,
  },
  acceptText: {
    color: "#1A1A1A",
    fontWeight: "800",
  },
  declineButton: {
    flex: 1,
    backgroundColor: "#333",
    borderWidth: 1,
    borderColor: "#444",
    borderRadius: 12,
    paddingVertical: 10,
    alignItems: "center",
  },
  declineText: {
    color: colors.text,
    fontWeight: "700",
  },
  emptyState: {
    alignItems: "center",
    marginTop: 40,
  },
  emptyTitle: {
    color: colors.text,
    fontWeight: "700",
    fontSize: 16,
  },
  emptyCopy: {
    marginTop: 4,
    color: colors.textSecondary,
  },
  pressed: {
    opacity: 0.85,
  },
});
