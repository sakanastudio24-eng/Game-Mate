import { colors } from "@/src/lib/theme";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { Tabs } from "expo-router";
import React from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useResponsive } from "../../src/lib/responsive";

export default function TabLayout() {
  const insets = useSafeAreaInsets();
  const responsive = useResponsive();
  const bottomInset = Math.max(insets.bottom, responsive.safeBottomInset);
  const iconSize = responsive.platform === "ios" ? 24 : 23;

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          borderTopWidth: 1,
          height: responsive.tabBarBaseHeight + bottomInset,
          paddingTop: responsive.platform === "ios" ? 7 : 6,
          paddingBottom: bottomInset,
        },
        tabBarHideOnKeyboard: true,
        headerShown: false,
        tabBarLabelStyle: {
          fontSize: responsive.tabBarLabelSize,
          fontWeight: "700",
        },
      }}
    >
      <Tabs.Screen
        name="news"
        options={{
          title: "Feed",
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons name="newspaper" size={iconSize} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="groups"
        options={{
          title: "Groups",
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons
              name={"account-group" as any}
              size={iconSize}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="social"
        options={{
          title: "Social",
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons name="account-multiple" size={iconSize} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons name="account" size={iconSize} color={color} />
          ),
        }}
      />
      <Tabs.Screen name="index" options={{ href: null }} />
      <Tabs.Screen name="explore" options={{ href: null }} />
      <Tabs.Screen name="account-settings" options={{ href: null }} />
      <Tabs.Screen name="chat" options={{ href: null }} />
      <Tabs.Screen name="create-group" options={{ href: null }} />
      <Tabs.Screen name="create-collection" options={{ href: null }} />
      <Tabs.Screen name="discover-groups" options={{ href: null }} />
      <Tabs.Screen name="edit-profile" options={{ href: null }} />
      <Tabs.Screen name="group-detail" options={{ href: null }} />
      <Tabs.Screen name="help" options={{ href: null }} />
      <Tabs.Screen name="matchmaking" options={{ href: null }} />
      <Tabs.Screen name="messages" options={{ href: null }} />
      <Tabs.Screen name="notification-settings" options={{ href: null }} />
      <Tabs.Screen name="notifications" options={{ href: null }} />
      <Tabs.Screen name="privacy-detail" options={{ href: null }} />
      <Tabs.Screen name="privacy-settings" options={{ href: null }} />
      <Tabs.Screen name="qr-code" options={{ href: null }} />
      <Tabs.Screen name="search-players" options={{ href: null }} />
      <Tabs.Screen name="settings" options={{ href: null }} />
      <Tabs.Screen name="user-profile" options={{ href: null }} />
    </Tabs>
  );
}
