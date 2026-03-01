import { useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
import { FlatList, Pressable, StyleSheet, View } from "react-native";
import { Searchbar, Text } from "react-native-paper";
import { Header } from "../../src/components/ui/Header";
import { Screen } from "../../src/components/ui/Screen";
import { colors, spacing } from "../../src/lib/theme";

interface RouteItem {
  id: string;
  label: string;
  path: string;
  group: "core" | "groups" | "social" | "settings" | "system";
}

const ROUTES: RouteItem[] = [
  { id: "news", label: "News", path: "/(tabs)/news", group: "core" },
  { id: "groups", label: "Groups", path: "/(tabs)/groups", group: "core" },
  { id: "social", label: "Social", path: "/(tabs)/social", group: "core" },
  { id: "profile", label: "Profile", path: "/(tabs)/profile", group: "core" },

  { id: "group-detail", label: "Group Detail", path: "/(tabs)/group-detail", group: "groups" },
  { id: "discover-groups", label: "Discover Groups", path: "/(tabs)/discover-groups", group: "groups" },
  { id: "create-group", label: "Create Group", path: "/(tabs)/create-group", group: "groups" },
  { id: "matchmaking", label: "Matchmaking", path: "/(tabs)/matchmaking", group: "groups" },

  { id: "messages", label: "Messages", path: "/(tabs)/messages", group: "social" },
  { id: "chat", label: "Chat", path: "/(tabs)/chat", group: "social" },
  { id: "search-players", label: "Search Players", path: "/(tabs)/search-players", group: "social" },
  { id: "user-profile", label: "User Profile", path: "/(tabs)/user-profile", group: "social" },
  { id: "notifications", label: "Notifications", path: "/(tabs)/notifications", group: "social" },

  { id: "settings", label: "Settings", path: "/(tabs)/settings", group: "settings" },
  { id: "account-settings", label: "Account Settings", path: "/(tabs)/account-settings", group: "settings" },
  { id: "notification-settings", label: "Notification Settings", path: "/(tabs)/notification-settings", group: "settings" },
  { id: "privacy-settings", label: "Privacy Settings", path: "/(tabs)/privacy-settings", group: "settings" },
  { id: "privacy-detail", label: "Privacy Details", path: "/(tabs)/privacy-detail", group: "settings" },
  { id: "help", label: "Help", path: "/(tabs)/help", group: "settings" },
  { id: "edit-profile", label: "Edit Profile", path: "/(tabs)/edit-profile", group: "settings" },
  { id: "qr-code", label: "QR Code", path: "/(tabs)/qr-code", group: "settings" },

  { id: "onboarding", label: "Onboarding", path: "/onboarding", group: "system" },
  { id: "modal", label: "Modal", path: "/modal", group: "system" },
];

export default function ExploreScreen() {
  const router = useRouter();
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return ROUTES;
    return ROUTES.filter((route) =>
      [route.label, route.path, route.group].join(" ").toLowerCase().includes(q),
    );
  }, [query]);

  return (
    <Screen scrollable={false}>
      <Header title="Site Map" subtitle="Preview every route" showBackButton />

      <Searchbar
        placeholder="Search routes..."
        value={query}
        onChangeText={setQuery}
        style={styles.searchbar}
        inputStyle={styles.searchInput}
        placeholderTextColor={colors.textSecondary}
      />

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <Pressable
            onPress={() => router.push(item.path as any)}
            style={({ pressed }) => [styles.routeCard, pressed && styles.routeCardPressed]}
          >
            <View style={styles.routeTop}>
              <Text style={styles.routeLabel}>{item.label}</Text>
              <Text style={styles.routeGroup}>{item.group.toUpperCase()}</Text>
            </View>
            <Text style={styles.routePath}>{item.path}</Text>
          </Pressable>
        )}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No routes match your search</Text>
          </View>
        }
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  searchbar: {
    marginHorizontal: spacing.md,
    marginTop: spacing.md,
    marginBottom: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  searchInput: {
    color: colors.text,
    fontSize: 14,
  },
  listContent: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.xl,
  },
  routeCard: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  routeCardPressed: {
    opacity: 0.8,
  },
  routeTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.xs,
  },
  routeLabel: {
    color: colors.text,
    fontWeight: "700",
    fontSize: 14,
  },
  routeGroup: {
    color: colors.primary,
    fontSize: 11,
    fontWeight: "700",
  },
  routePath: {
    color: colors.textSecondary,
    fontSize: 12,
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: spacing.xl,
  },
  emptyText: {
    color: colors.textSecondary,
  },
});
