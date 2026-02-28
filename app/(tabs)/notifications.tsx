import React, { useState } from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { Text, Divider } from 'react-native-paper';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { Screen } from '../../src/components/ui/Screen';
import { Header } from '../../src/components/ui/Header';
import { Card } from '../../src/components/ui/Card';
import { Button } from '../../src/components/ui/Button';
import { colors, spacing } from '../../src/lib/theme';

// NotificationsScreen: Notification center
// Backend integration: GET /api/notifications endpoint in Phase B

interface Notification {
  id: string;
  type: 'friend_request' | 'group_invite' | 'message' | 'achievement' | 'matchmaking';
  title: string;
  description: string;
  icon: string;
  timestamp: string;
  read: boolean;
  actionLabel?: string;
}

export default function NotificationsScreen() {
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      type: 'friend_request',
      title: 'New Friend Request',
      description: 'ProGamer92 sent you a friend request',
      icon: 'account-plus',
      timestamp: '2 min ago',
      read: false,
      actionLabel: 'Accept',
    },
    {
      id: '2',
      type: 'group_invite',
      title: 'Group Invite',
      description: 'SkyWalker invited you to Valorant Group',
      icon: 'people',
      timestamp: '15 min ago',
      read: false,
      actionLabel: 'Join',
    },
    {
      id: '3',
      type: 'matchmaking',
      title: 'Match Found!',
      description: 'Your matchmaking found a CS:GO group',
      icon: 'shuffle-variant',
      timestamp: '1 hour ago',
      read: false,
      actionLabel: 'View',
    },
    {
      id: '4',
      type: 'achievement',
      title: 'Achievement Unlocked',
      description: 'You unlocked "Team Player" achievement',
      icon: 'trophy',
      timestamp: '3 hours ago',
      read: true,
    },
    {
      id: '5',
      type: 'message',
      title: 'New Message',
      description: 'EchoPlayer: Sounds good! See you at 8pm',
      icon: 'message',
      timestamp: '5 hours ago',
      read: true,
    },
  ]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleNotificationAction = (id: string) => {
    setNotifications(prev =>
      prev.map(notif => (notif.id === id ? { ...notif, read: true } : notif))
    );
  };

  const handleDismiss = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const getNotificationColor = (
    type: Notification['type']
  ): string => {
    switch (type) {
      case 'friend_request':
        return colors.primary;
      case 'group_invite':
        return colors.primary;
      case 'matchmaking':
        return colors.online;
      case 'achievement':
        return '#FFD700';
      case 'message':
        return colors.primary;
      default:
        return colors.textSecondary;
    }
  };

  const renderNotification = (notification: Notification) => (
    <View key={notification.id}>
      <Card style={styles.notificationCard}>
        <View style={styles.notificationContent}>
          <View
            style={[
              styles.iconContainer,
              { backgroundColor: getNotificationColor(notification.type) + '20' },
            ]}
          >
            <MaterialCommunityIcons
              name={notification.icon as any}
              size={20}
              color={getNotificationColor(notification.type)}
            />
          </View>

          <View style={styles.textContainer}>
            <View style={styles.titleRow}>
              <Text style={styles.title}>{notification.title}</Text>
              {!notification.read && (
                <View
                  style={[
                    styles.unreadDot,
                    { backgroundColor: colors.primary },
                  ]}
                />
              )}
            </View>
            <Text style={styles.description}>{notification.description}</Text>
            <Text style={styles.timestamp}>{notification.timestamp}</Text>
          </View>

          {notification.actionLabel && (
            <Button
              mode="contained"
              size="small"
              onPress={() => handleNotificationAction(notification.id)}
              label={notification.actionLabel}
            />
          )}
        </View>

        <View style={styles.actions}>
          <MaterialCommunityIcons
            name="close"
            size={20}
            color={colors.textSecondary}
            onPress={() => handleDismiss(notification.id)}
          />
        </View>
      </Card>
    </View>
  );

  return (
    <Screen scrollable={false}>
      <Header
        title="Notifications"
        showBackButton
        onBack={() => {}}
        subtitle={unreadCount > 0 ? `${unreadCount} new` : undefined}
      />

      {notifications.length > 0 ? (
        <FlatList
          data={notifications}
          renderItem={({ item }) => renderNotification(item)}
          keyExtractor={item => item.id}
          scrollEnabled={true}
          contentContainerStyle={styles.notificationsList}
        />
      ) : (
        <View style={styles.emptyState}>
          <MaterialCommunityIcons
            name="bell-off"
            size={48}
            color={colors.textSecondary}
          />
          <Text style={styles.emptyText}>No notifications</Text>
        </View>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  notificationsList: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  notificationCard: {
    marginBottom: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.md,
  },
  notificationContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  textContainer: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  title: {
    color: colors.text,
    fontWeight: '600',
    fontSize: 14,
    flex: 1,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginLeft: spacing.sm,
  },
  description: {
    color: colors.textSecondary,
    fontSize: 13,
    marginBottom: spacing.xs,
  },
  timestamp: {
    color: colors.textSecondary,
    fontSize: 11,
  },
  actions: {
    marginLeft: spacing.md,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    color: colors.textSecondary,
    fontSize: 14,
    marginTop: spacing.md,
  },
});
