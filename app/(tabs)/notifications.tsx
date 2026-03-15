import { useRouter } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { FlatList, Pressable, StyleSheet, View } from "react-native";
import { Text } from "react-native-paper";
import { listNotifications, type NotificationItem } from "../../services/notifications";
import { Card } from "../../src/components/ui/Card";
import { Header } from "../../src/components/ui/Header";
import { Screen } from "../../src/components/ui/Screen";
import { useAuth } from "../../src/context/AuthContext";
import { SESSION_EXPIRED_MESSAGE, isSessionExpiredMessage } from "../../src/lib/auth-messages";
import { useResponsive } from "../../src/lib/responsive";
import { colors, spacing } from "../../src/lib/theme";

type UiNotification = NotificationItem & { id: string };

function formatTypeLabel(type: string) {
  return type
    .replace(/_/g, " ")
    .replace(/\b\w/g, (value) => value.toUpperCase());
}

function getTypeDetails(type: string) {
  const normalized = type.toLowerCase();

  if (normalized === "like") {
    return {
      icon: "thumb-up-outline",
      color: "#60A5FA",
      summary: "liked your post",
    };
  }
  if (normalized === "comment") {
    return {
      icon: "comment-text-outline",
      color: "#34D399",
      summary: "commented on your post",
    };
  }
  if (normalized === "share") {
    return {
      icon: "share-variant-outline",
      color: "#F59E0B",
      summary: "shared your post",
    };
  }
  if (normalized === "friend_request") {
    return {
      icon: "account-plus-outline",
      color: colors.primary,
      summary: "sent you a friend request",
    };
  }
  if (normalized === "friend_accept") {
    return {
      icon: "account-check-outline",
      color: "#4ADE80",
      summary: "accepted your friend request",
    };
  }
  if (normalized === "message") {
    return {
      icon: "message-outline",
      color: "#22D3EE",
      summary: "sent you a message",
    };
  }
  if (normalized === "group_invite") {
    return {
      icon: "account-group-outline",
      color: "#A78BFA",
      summary: "invited you to a group",
    };
  }

  return {
    icon: "bell-outline",
    color: colors.textSecondary,
    summary: "triggered an activity",
  };
}

function formatRelativeTime(timestamp: string) {
  const value = new Date(timestamp);
  if (Number.isNaN(value.getTime())) return "";

  const now = Date.now();
  const diffMs = Math.max(0, now - value.getTime());
  const diffMinutes = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMinutes < 1) return "Just now";
  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;

  return value.toLocaleDateString();
}

export default function NotificationsScreen() {
  const router = useRouter();
  const responsive = useResponsive();
  const { accessToken } = useAuth();
  const [notifications, setNotifications] = useState<UiNotification[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const isSessionExpiredError = isSessionExpiredMessage(loadError);

  const fetchNotifications = useCallback(
    async (refresh = false) => {
      if (!accessToken) {
        setNotifications([]);
        setLoadError(SESSION_EXPIRED_MESSAGE);
        setIsLoading(false);
        setIsRefreshing(false);
        return;
      }

      if (refresh) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }

      setLoadError(null);
      try {
        const data = await listNotifications(accessToken);
        const mapped = data.map((item, index) => ({
          ...item,
          id: `${item.created_at}-${item.actor}-${item.type}-${index}`,
        }));
        setNotifications(mapped);
      } catch (error) {
        setNotifications([]);
        setLoadError(error instanceof Error ? error.message : "Unable to load notifications.");
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
    void fetchNotifications();
  }, [fetchNotifications]);

  useFocusEffect(
    useCallback(() => {
      void fetchNotifications();
      return undefined;
    }, [fetchNotifications]),
  );

  const unreadCount = useMemo(
    () => notifications.filter((notification) => !notification.is_read).length,
    [notifications],
  );

  const markRead = useCallback((id: string) => {
    setNotifications((prev) =>
      prev.map((notification) =>
        notification.id === id ? { ...notification, is_read: true } : notification,
      ),
    );
  }, []);

  const onNotificationPress = useCallback(
    (notification: UiNotification) => {
      markRead(notification.id);

      const type = notification.type.toLowerCase();
      if (type === "message") {
        router.push("/(tabs)/messages");
        return;
      }
      if (type.startsWith("friend")) {
        router.push("/(tabs)/social");
        return;
      }
      if (type.startsWith("group")) {
        router.push("/(tabs)/groups");
        return;
      }

      if (notification.post_id) {
        router.push({
          pathname: "/(tabs)/news",
          params: { postId: String(notification.post_id) },
        });
        return;
      }

      router.push("/(tabs)/news");
    },
    [markRead, router],
  );

  const renderNotification = useCallback(
    ({ item }: { item: UiNotification }) => {
      const details = getTypeDetails(item.type);
      return (
        <Pressable
          onPress={() => onNotificationPress(item)}
          style={({ pressed }) => [pressed && styles.pressed]}
          accessibilityRole="button"
          accessibilityLabel={`Notification from ${item.actor}`}
          accessibilityHint="Open related activity"
        >
          <Card style={styles.notificationCard}>
            <View style={styles.notificationContent}>
              <View
                style={[
                  styles.iconContainer,
                  {
                    width: responsive.iconButtonSize,
                    height: responsive.iconButtonSize,
                    borderRadius: responsive.searchRadius - 2,
                    backgroundColor: `${details.color}20`,
                  },
                ]}
              >
                <MaterialCommunityIcons
                  name={details.icon as any}
                  size={20}
                  color={details.color}
                />
              </View>

              <View style={styles.textContainer}>
                <View style={styles.titleRow}>
                  <Text style={[styles.actorName, { fontSize: responsive.bodySize }]}>
                    {item.actor}
                  </Text>
                  {!item.is_read ? <View style={styles.unreadDot} /> : null}
                </View>
                <Text style={[styles.summaryText, { fontSize: responsive.bodySmallSize }]}>
                  {details.summary}
                </Text>
                <Text style={[styles.typeText, { fontSize: responsive.captionSize }]}>
                  {formatTypeLabel(item.type)}
                </Text>
                <Text style={[styles.timestampText, { fontSize: responsive.captionSize }]}>
                  {formatRelativeTime(item.created_at)}
                </Text>
              </View>

              <MaterialCommunityIcons
                name="chevron-right"
                size={18}
                color={colors.textSecondary}
              />
            </View>
          </Card>
        </Pressable>
      );
    },
    [onNotificationPress, responsive.bodySize, responsive.bodySmallSize, responsive.captionSize, responsive.iconButtonSize, responsive.searchRadius],
  );

  return (
    <Screen scrollable={false}>
      <Header
        title="Notifications"
        showBackButton
        subtitle={unreadCount > 0 ? `${unreadCount} new` : undefined}
      />

      {isLoading ? (
        <View style={styles.stateContainer}>
          <MaterialCommunityIcons name="progress-clock" size={48} color={colors.textSecondary} />
          <Text style={styles.stateText}>Loading notifications...</Text>
        </View>
      ) : loadError ? (
        <View style={styles.stateContainer}>
          <MaterialCommunityIcons name="alert-circle-outline" size={48} color={colors.destructive} />
          <Text style={styles.stateText}>{loadError}</Text>
          <Pressable
            onPress={() => {
              if (isSessionExpiredError) {
                router.replace("/login" as any);
                return;
              }
              void fetchNotifications();
            }}
            style={styles.retryButton}
          >
            <Text style={styles.retryText}>{isSessionExpiredError ? "Sign In" : "Retry"}</Text>
          </Pressable>
        </View>
      ) : notifications.length > 0 ? (
        <FlatList
          data={notifications}
          renderItem={renderNotification}
          keyExtractor={(item) => item.id}
          refreshing={isRefreshing}
          onRefresh={() => {
            void fetchNotifications(true);
          }}
          contentContainerStyle={styles.notificationsList}
        />
      ) : (
        <View style={styles.stateContainer}>
          <MaterialCommunityIcons name="bell-off-outline" size={48} color={colors.textSecondary} />
          <Text style={styles.stateText}>No notifications</Text>
        </View>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  notificationsList: {
    paddingVertical: spacing.md,
  },
  notificationCard: {
    marginBottom: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.md,
  },
  notificationContent: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.md,
  },
  iconContainer: {
    justifyContent: "center",
    alignItems: "center",
    flexShrink: 0,
  },
  textContainer: {
    flex: 1,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.xs,
    gap: spacing.xs,
  },
  actorName: {
    color: colors.text,
    fontWeight: "700",
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
  },
  summaryText: {
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  typeText: {
    color: colors.primary,
    marginBottom: spacing.xs,
    fontWeight: "700",
    textTransform: "uppercase",
  },
  timestampText: {
    color: colors.textSecondary,
  },
  stateContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
  },
  stateText: {
    color: colors.textSecondary,
    textAlign: "center",
  },
  retryButton: {
    marginTop: spacing.sm,
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
  pressed: {
    opacity: 0.75,
  },
});
