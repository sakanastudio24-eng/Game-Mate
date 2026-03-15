import { useRouter } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { ActivityIndicator, FlatList, Image, Pressable, StyleSheet, View } from "react-native";
import { Searchbar, Text } from "react-native-paper";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  acceptConnectionRequest,
  listConnections,
  listPendingConnectionRequests,
  type ConnectionItem,
  type PendingConnectionItem,
} from "../../services/connections";
import { listThreads, type ThreadItem } from "../../services/messages";
import { AnimatedEntrance } from "../../src/components/ui/AnimatedEntrance";
import { useToast } from "../../src/components/ui/ToastProvider";
import { useAuth } from "../../src/context/AuthContext";
import { androidKeyboardCompatProps } from "../../src/lib/androidInput";
import { SESSION_EXPIRED_MESSAGE, isSessionExpiredMessage } from "../../src/lib/auth-messages";
import { useResponsive } from "../../src/lib/responsive";
import { colors, spacing } from "../../src/lib/theme";

type SocialTab = "friends" | "messages" | "requests";

interface FriendItem {
  id: string;
  userId?: number | null;
  name: string;
  game?: string;
  statusText: string;
  level: number;
  online: boolean;
  avatar: string;
}

interface RequestItem {
  id: string;
  userId: string;
  connectionId: number;
  direction: "incoming" | "outgoing";
  name: string;
  mutualFriends: number;
  games: string[];
  avatar: string;
}

export default function SocialScreen() {
  const router = useRouter();
  const responsive = useResponsive();
  const { accessToken, user, expireSession } = useAuth();
  const { showToast } = useToast();
  const insets = useSafeAreaInsets();
  const safeTop = Math.max(insets.top, responsive.safeTopInset) + responsive.headerTopSpacing;
  const safeBottom = Math.max(insets.bottom, responsive.safeBottomInset);
  const [activeTab, setActiveTab] = useState<SocialTab>("friends");
  const [search, setSearch] = useState("");
  const [friends, setFriends] = useState<FriendItem[]>([]);
  const [requests, setRequests] = useState<RequestItem[]>([]);
  const [threads, setThreads] = useState<ThreadItem[]>([]);
  const [isFriendsLoading, setIsFriendsLoading] = useState(false);
  const [isRequestsLoading, setIsRequestsLoading] = useState(false);
  const [isThreadsLoading, setIsThreadsLoading] = useState(false);
  const [acceptingRequestIds, setAcceptingRequestIds] = useState<Set<number>>(new Set());
  const [socialError, setSocialError] = useState<string | null>(null);
  const isSessionExpiredError = isSessionExpiredMessage(socialError);
  const profileAvatarSize = responsive.isSmallPhone ? 48 : responsive.isLargePhone ? 58 : 54;
  const actionCircleSize = Math.max(responsive.touchTargetMin, 42);

  const createAvatarUrl = useCallback((name: string) => {
    const encodedName = encodeURIComponent(name || "Player");
    return `https://ui-avatars.com/api/?name=${encodedName}&background=1f2937&color=ffffff&size=128`;
  }, []);

  const toFriendItem = useCallback(
    (connection: ConnectionItem): FriendItem => {
      const selfUsername = String(user?.username ?? "");
      const isSender = connection.sender === selfUsername;
      const peerName =
        isSender ? connection.receiver : connection.sender;
      const peerUserId = isSender ? connection.receiver_id : connection.sender_id;
      return {
        id: String(peerUserId ?? `friend-${connection.id}`),
        userId: peerUserId ?? null,
        name: peerName,
        statusText: "Connected",
        level: 1,
        online: false,
        avatar: createAvatarUrl(peerName),
      };
    },
    [createAvatarUrl, user?.username],
  );

  const toRequestItem = useCallback(
    (item: PendingConnectionItem): RequestItem => {
      const selfUsername = String(user?.username ?? "");
      const direction =
        item.direction ||
        (item.receiver === selfUsername ? "incoming" : "outgoing");
      const name = direction === "incoming" ? item.sender : item.receiver;
      return {
        id: `request-${item.id}`,
        userId: name,
        connectionId: item.id,
        direction,
        name,
        mutualFriends: 0,
        games: [direction === "incoming" ? "Incoming request" : "Pending approval"],
        avatar: createAvatarUrl(name),
      };
    },
    [createAvatarUrl, user?.username],
  );

  const loadFriends = useCallback(async () => {
    if (!accessToken) {
      setFriends([]);
      setIsFriendsLoading(false);
      setSocialError(SESSION_EXPIRED_MESSAGE);
      return;
    }
    setIsFriendsLoading(true);
    try {
      const rows = await listConnections(accessToken);
      setFriends(rows.map(toFriendItem));
      setSocialError(null);
    } catch (error) {
      setFriends([]);
      setSocialError(error instanceof Error ? error.message : "Unable to load friends.");
    } finally {
      setIsFriendsLoading(false);
    }
  }, [accessToken, toFriendItem]);

  const loadPendingRequests = useCallback(async () => {
    if (!accessToken) {
      setRequests([]);
      setIsRequestsLoading(false);
      setSocialError(SESSION_EXPIRED_MESSAGE);
      return;
    }
    setIsRequestsLoading(true);
    try {
      const rows = await listPendingConnectionRequests(accessToken);
      setRequests(rows.map(toRequestItem));
      setSocialError(null);
    } catch (error) {
      setRequests([]);
      setSocialError(error instanceof Error ? error.message : "Unable to load requests.");
    } finally {
      setIsRequestsLoading(false);
    }
  }, [accessToken, toRequestItem]);

  const loadThreads = useCallback(async () => {
    if (!accessToken) {
      setThreads([]);
      setIsThreadsLoading(false);
      setSocialError(SESSION_EXPIRED_MESSAGE);
      return;
    }
    setIsThreadsLoading(true);
    try {
      const rows = await listThreads(accessToken);
      setThreads(rows);
      setSocialError(null);
    } catch (error) {
      setThreads([]);
      setSocialError(error instanceof Error ? error.message : "Unable to load messages.");
    } finally {
      setIsThreadsLoading(false);
    }
  }, [accessToken]);

  useEffect(() => {
    void loadFriends();
    void loadPendingRequests();
    void loadThreads();
  }, [loadFriends, loadPendingRequests, loadThreads]);

  useFocusEffect(
    useCallback(() => {
      void loadFriends();
      void loadPendingRequests();
      void loadThreads();
      return undefined;
    }, [loadFriends, loadPendingRequests, loadThreads]),
  );

  const filteredOnline = useMemo(() => {
    const source = accessToken ? friends : [];
    const q = search.trim().toLowerCase();
    const online = source.filter((friend) => friend.online);
    if (!q) return online;
    return online.filter((friend) => friend.name.toLowerCase().includes(q));
  }, [accessToken, friends, search]);

  const filteredOffline = useMemo(() => {
    const source = accessToken ? friends : [];
    const q = search.trim().toLowerCase();
    const offline = source.filter((friend) => !friend.online);
    if (!q) return offline;
    return offline.filter((friend) => friend.name.toLowerCase().includes(q));
  }, [accessToken, friends, search]);

  const filteredMessages = useMemo(() => {
    const selfUsername = String(user?.username ?? "");
    const liveMessages = threads.map((thread) => {
      const peerName =
        (thread.participants ?? []).find(
          (participant) => participant && participant !== selfUsername,
        ) ?? "Player";
      return {
        id: `thread-${thread.thread_id}`,
        userId: "",
        user: peerName,
        message: thread.last_message || "No messages yet",
        time: "",
        unread: Math.max(0, Number(thread.unread ?? 0)),
        online: false,
        avatar: createAvatarUrl(peerName),
      };
    });
    const q = search.trim().toLowerCase();
    if (!q) return liveMessages;
    return liveMessages.filter((message) =>
      [message.user, message.message].join(" ").toLowerCase().includes(q),
    );
  }, [createAvatarUrl, search, threads, user?.username]);

  const filteredRequests = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return requests;
    return requests.filter((request) =>
      [request.name, request.games.join(" ")].join(" ").toLowerCase().includes(q),
    );
  }, [requests, search]);

  const handleAcceptRequest = async (requestId: string) => {
    if (!accessToken) return;
    const target = requests.find((request) => request.id === requestId);
    if (!target) return;
    if (target.direction !== "incoming") {
      showToast({ message: "Only incoming requests can be accepted." });
      return;
    }

    setAcceptingRequestIds((prev) => new Set(prev).add(target.connectionId));
    try {
      await acceptConnectionRequest(accessToken, target.connectionId);
      setRequests((prev) => prev.filter((request) => request.id !== requestId));
      showToast({ message: `Accepted ${target.name}` });
      void loadFriends();
      void loadPendingRequests();
    } catch (error) {
      showToast({
        message: error instanceof Error ? error.message : "Unable to accept request right now.",
      });
    } finally {
      setAcceptingRequestIds((prev) => {
        const next = new Set(prev);
        next.delete(target.connectionId);
        return next;
      });
    }
  };

  const handleDeclineRequest = (requestId: string) => {
    setRequests((prev) => prev.filter((request) => request.id !== requestId));
    showToast({ message: "Request hidden for now." });
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
                onPress={() =>
                  router.push({
                    pathname: "/(tabs)/search-players",
                    params: { source: "social" },
                  } as any)
                }
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
                onPress={() =>
                  router.push({
                    pathname: "/(tabs)/qr-code",
                    params: { source: "social" },
                  } as any)
                }
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
            ).map((tab, index) => {
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
                    index > 0 ? styles.tabButtonSpacing : undefined,
                    {
                      borderRadius: responsive.cardRadius - 6,
                      paddingVertical: Math.max(9, responsive.cardPadding - 2),
                      minHeight: responsive.buttonHeightSmall,
                    },
                    selected ? styles.tabButtonActive : undefined,
                  ]}
                >
                  <Text
                    numberOfLines={1}
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
            {...androidKeyboardCompatProps}
            accessibilityLabel={searchPlaceholder}
            style={[styles.searchbar, { borderRadius: responsive.searchRadius }]}
            inputStyle={[styles.searchInput, { fontSize: responsive.bodySize }]}
            iconColor={colors.textSecondary}
            placeholderTextColor={colors.textSecondary}
          />
        </View>
      </AnimatedEntrance>

      {activeTab === "friends" && (
        isFriendsLoading ? (
          <View style={styles.loadingState}>
            <ActivityIndicator color={colors.primary} />
            <Text style={styles.loadingText}>Loading friends...</Text>
          </View>
        ) : (
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
                          source: "social",
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
                          if (typeof item.userId === "number" && Number.isFinite(item.userId)) {
                            router.push(`/(tabs)/chat?userId=${item.userId}&title=${encodeURIComponent(item.name)}`);
                          } else {
                            router.push(`/(tabs)/chat?title=${encodeURIComponent(item.name)}`);
                          }
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
        )
      )}

      {activeTab === "messages" && (
        isThreadsLoading ? (
          <View style={styles.loadingState}>
            <ActivityIndicator color={colors.primary} />
            <Text style={styles.loadingText}>Loading messages...</Text>
          </View>
        ) : (
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
                    onPress={() =>
                      router.push(`/(tabs)/chat?title=${encodeURIComponent(item.user)}`)
                    }
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
                <Text style={styles.emptyTitle}>
                  {search.trim() ? "No messages found" : "No conversations yet"}
                </Text>
                <Text style={styles.emptyCopy}>
                  {search.trim()
                    ? "Try another search keyword."
                    : "Accepted connections and shared chats will appear here."}
                </Text>
              </View>
            }
            contentContainerStyle={[styles.listContent, { paddingBottom: 96 + safeBottom }]}
            showsVerticalScrollIndicator={false}
          />
        )
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
                          source: "social",
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
                      onPress={() => {
                        void handleAcceptRequest(item.id);
                      }}
                      accessibilityRole="button"
                      accessibilityLabel={`Accept request from ${item.name}`}
                      disabled={item.direction !== "incoming" || acceptingRequestIds.has(item.connectionId)}
                      style={({ pressed }) => [
                        styles.acceptButton,
                        { minHeight: responsive.buttonHeightSmall, minWidth: responsive.touchTargetMin },
                        item.direction !== "incoming" ? styles.acceptButtonDisabled : undefined,
                        pressed && styles.pressed,
                      ]}
                    >
                      <Text style={styles.acceptText}>
                        {acceptingRequestIds.has(item.connectionId)
                          ? "Accepting..."
                          : item.direction === "incoming"
                            ? "Accept"
                            : "Pending"}
                      </Text>
                    </Pressable>
                    <Pressable
                      onPress={() => handleDeclineRequest(item.id)}
                      accessibilityRole="button"
                      accessibilityLabel={`Hide request from ${item.name}`}
                      style={({ pressed }) => [
                        styles.declineButton,
                        { minHeight: responsive.buttonHeightSmall, minWidth: responsive.touchTargetMin },
                        pressed && styles.pressed,
                      ]}
                    >
                      <Text style={styles.declineText}>
                        {item.direction === "incoming" ? "Later" : "Hide"}
                      </Text>
                    </Pressable>
                  </View>
                </View>
              </View>
            </AnimatedEntrance>
          )}
          ListEmptyComponent={
            isRequestsLoading ? (
              <View style={styles.loadingState}>
                <ActivityIndicator color={colors.primary} />
                <Text style={styles.loadingText}>Loading requests...</Text>
              </View>
            ) : (
              <View style={styles.emptyState}>
                <Text style={styles.emptyTitle}>No pending requests</Text>
                <Text style={styles.emptyCopy}>New friend invites will appear here.</Text>
              </View>
            )
          }
          contentContainerStyle={[styles.listContent, { paddingBottom: 96 + safeBottom }]}
          showsVerticalScrollIndicator={false}
        />
      )}
      {socialError ? (
        <View style={styles.errorBanner}>
          <Text style={styles.errorText}>{socialError}</Text>
          <Pressable
            onPress={() => {
              if (isSessionExpiredError) {
                void expireSession().finally(() => {
                  router.replace("/login" as any);
                });
                return;
              }
              void loadFriends();
              void loadPendingRequests();
              void loadThreads();
            }}
            accessibilityRole="button"
            accessibilityLabel={isSessionExpiredError ? "Sign in again" : "Retry loading social data"}
            style={({ pressed }) => [styles.errorRetryButton, pressed && styles.pressed]}
          >
            <Text style={styles.errorRetryText}>{isSessionExpiredError ? "Sign In" : "Retry"}</Text>
          </Pressable>
        </View>
      ) : null}
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
    alignItems: "center",
    justifyContent: "center",
  },
  tabButtonSpacing: {
    marginLeft: 8,
  },
  tabButton: {
    width: "31.5%",
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: "#242424",
    borderRadius: 12,
    paddingVertical: 10,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 10,
  },
  tabButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  tabText: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: "800",
    textAlign: "center",
    width: "100%",
    includeFontPadding: false,
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
  loadingState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: spacing.sm,
  },
  loadingText: {
    color: colors.textSecondary,
    fontSize: 13,
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
  acceptButtonDisabled: {
    backgroundColor: "#454545",
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
  errorBanner: {
    position: "absolute",
    left: spacing.md,
    right: spacing.md,
    bottom: spacing.md,
    backgroundColor: "#2A1D1D",
    borderWidth: 1,
    borderColor: colors.destructive,
    borderRadius: 10,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  errorText: {
    color: colors.destructive,
    fontWeight: "600",
    fontSize: 12,
    textAlign: "center",
  },
  errorRetryButton: {
    alignSelf: "center",
    marginTop: spacing.xs,
    borderWidth: 1,
    borderColor: colors.destructive,
    borderRadius: 8,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  errorRetryText: {
    color: colors.destructive,
    fontWeight: "700",
    fontSize: 11,
  },
  pressed: {
    opacity: 0.85,
  },
});
