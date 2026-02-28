import React, { useState } from "react";
import { StyleSheet } from "react-native";
import { List, Switch, Text } from "react-native-paper";
import { Card } from "../../src/components/ui/Card";
import { Header } from "../../src/components/ui/Header";
import { Screen } from "../../src/components/ui/Screen";
import { colors, spacing } from "../../src/lib/theme";

// NotificationSettingsScreen: Push notification preferences
// Backend integration: PATCH /api/me/notifications endpoint in Phase B

export default function NotificationSettingsScreen() {
  const [notifSettings, setNotifSettings] = useState({
    friendRequests: true,
    groupInvites: true,
    messages: true,
    friendActivity: true,
    friendOnline: true,
    matchmaking: true,
    achievements: true,
  });

  const toggleSetting = (key: keyof typeof notifSettings) => {
    setNotifSettings((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <Screen scrollable>
      <Header title="Notifications" showBackButton onBack={() => {}} />

      <Card style={styles.section}>
        <Text style={styles.sectionTitle}>Social</Text>

        <List.Item
          title="Friend Requests"
          description="New friend request received"
          right={() => (
            <Switch
              value={notifSettings.friendRequests}
              onValueChange={() => toggleSetting("friendRequests")}
              color={colors.primary}
            />
          )}
          titleStyle={styles.listTitle}
          onPress={() => toggleSetting("friendRequests")}
        />

        <List.Item
          title="Friend Online"
          description="Your friend is now online"
          right={() => (
            <Switch
              value={notifSettings.friendOnline}
              onValueChange={() => toggleSetting("friendOnline")}
              color={colors.primary}
            />
          )}
          titleStyle={styles.listTitle}
          onPress={() => toggleSetting("friendOnline")}
        />

        <List.Item
          title="Friend Activity"
          description="Friends joined or created groups"
          right={() => (
            <Switch
              value={notifSettings.friendActivity}
              onValueChange={() => toggleSetting("friendActivity")}
              color={colors.primary}
            />
          )}
          titleStyle={styles.listTitle}
          onPress={() => toggleSetting("friendActivity")}
        />

        <List.Item
          title="Direct Messages"
          description="You received a new message"
          right={() => (
            <Switch
              value={notifSettings.messages}
              onValueChange={() => toggleSetting("messages")}
              color={colors.primary}
            />
          )}
          titleStyle={styles.listTitle}
          onPress={() => toggleSetting("messages")}
        />
      </Card>

      <Card style={styles.section}>
        <Text style={styles.sectionTitle}>Groups</Text>

        <List.Item
          title="Group Invites"
          description="You were invited to a group"
          right={() => (
            <Switch
              value={notifSettings.groupInvites}
              onValueChange={() => toggleSetting("groupInvites")}
              color={colors.primary}
            />
          )}
          titleStyle={styles.listTitle}
          onPress={() => toggleSetting("groupInvites")}
        />

        <List.Item
          title="Matchmaking"
          description="Group matchmaking starts or completes"
          right={() => (
            <Switch
              value={notifSettings.matchmaking}
              onValueChange={() => toggleSetting("matchmaking")}
              color={colors.primary}
            />
          )}
          titleStyle={styles.listTitle}
          onPress={() => toggleSetting("matchmaking")}
        />
      </Card>

      <Card style={styles.section}>
        <Text style={styles.sectionTitle}>Achievements</Text>

        <List.Item
          title="Achievements"
          description="You unlocked a new achievement"
          right={() => (
            <Switch
              value={notifSettings.achievements}
              onValueChange={() => toggleSetting("achievements")}
              color={colors.primary}
            />
          )}
          titleStyle={styles.listTitle}
          onPress={() => toggleSetting("achievements")}
        />
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  section: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    color: colors.primary,
    fontWeight: "700",
    fontSize: 12,
    textTransform: "uppercase",
    marginBottom: spacing.md,
    letterSpacing: 0.5,
  },
  listTitle: {
    color: colors.text,
    fontSize: 14,
  },
});
