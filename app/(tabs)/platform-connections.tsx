import { useRouter } from "expo-router";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import React, { useState } from "react";
import { StyleSheet } from "react-native";
import { List, Switch, Text } from "react-native-paper";
import { Card } from "../../src/components/ui/Card";
import { Header } from "../../src/components/ui/Header";
import { Screen } from "../../src/components/ui/Screen";
import { useResponsive } from "../../src/lib/responsive";
import { colors, spacing } from "../../src/lib/theme";

export default function PlatformConnectionsScreen() {
  const router = useRouter();
  const responsive = useResponsive();
  const [connections, setConnections] = useState({
    playstation: false,
    computer: false,
    phone: true,
    switch: false,
  });
  const [syncPresence, setSyncPresence] = useState(true);

  const togglePlatform = (key: keyof typeof connections) => {
    setConnections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <Screen scrollable>
      <Header title="Platform Connections" showBackButton onBack={() => router.replace("/(tabs)/settings")} />

      <Card style={styles.section}>
        <Text
          accessibilityRole="header"
          style={[styles.sectionTitle, { fontSize: responsive.captionSize }]}
        >
          Connected Platforms
        </Text>

        <List.Item
          title="PlayStation"
          description={connections.playstation ? "Connected" : "Not connected"}
          titleStyle={[styles.listTitle, { fontSize: responsive.bodySize }]}
          left={() => <MaterialCommunityIcons name="sony-playstation" size={20} color={colors.primary} />}
          right={() => (
            <Switch
              value={connections.playstation}
              onValueChange={() => togglePlatform("playstation")}
              color={colors.primary}
              accessibilityLabel="Toggle PlayStation connection"
            />
          )}
          onPress={() => togglePlatform("playstation")}
        />

        <List.Item
          title="Computer"
          description={connections.computer ? "Connected" : "Not connected"}
          titleStyle={[styles.listTitle, { fontSize: responsive.bodySize }]}
          left={() => <MaterialCommunityIcons name="laptop" size={20} color={colors.primary} />}
          right={() => (
            <Switch
              value={connections.computer}
              onValueChange={() => togglePlatform("computer")}
              color={colors.primary}
              accessibilityLabel="Toggle Computer connection"
            />
          )}
          onPress={() => togglePlatform("computer")}
        />

        <List.Item
          title="Phone"
          description={connections.phone ? "Connected" : "Not connected"}
          titleStyle={[styles.listTitle, { fontSize: responsive.bodySize }]}
          left={() => <MaterialCommunityIcons name="cellphone" size={20} color={colors.primary} />}
          right={() => (
            <Switch
              value={connections.phone}
              onValueChange={() => togglePlatform("phone")}
              color={colors.primary}
              accessibilityLabel="Toggle Phone connection"
            />
          )}
          onPress={() => togglePlatform("phone")}
        />

        <List.Item
          title="Nintendo Switch"
          description={connections.switch ? "Connected" : "Not connected"}
          titleStyle={[styles.listTitle, { fontSize: responsive.bodySize }]}
          left={() => <MaterialCommunityIcons name="nintendo-switch" size={20} color={colors.primary} />}
          right={() => (
            <Switch
              value={connections.switch}
              onValueChange={() => togglePlatform("switch")}
              color={colors.primary}
              accessibilityLabel="Toggle Nintendo Switch connection"
            />
          )}
          onPress={() => togglePlatform("switch")}
        />
      </Card>

      <Card style={styles.section}>
        <Text
          accessibilityRole="header"
          style={[styles.sectionTitle, { fontSize: responsive.captionSize }]}
        >
          Sync
        </Text>

        <List.Item
          title="Sync Online Presence"
          description="Share your platform availability in profile and groups"
          titleStyle={[styles.listTitle, { fontSize: responsive.bodySize }]}
          left={() => <MaterialCommunityIcons name="sync" size={20} color={colors.primary} />}
          right={() => (
            <Switch
              value={syncPresence}
              onValueChange={setSyncPresence}
              color={colors.primary}
              accessibilityLabel="Toggle sync online presence"
            />
          )}
          onPress={() => setSyncPresence((prev) => !prev)}
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
    textTransform: "uppercase",
    marginBottom: spacing.md,
    letterSpacing: 0.5,
  },
  listTitle: {
    color: colors.text,
  },
});
