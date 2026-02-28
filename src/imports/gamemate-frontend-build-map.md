GameMate v0 (React Native) — Frontend Build Map

You’re building this as a portfolio + InkVein prep app: clean UI, strong interaction patterns, minimal backend at first.

v0 Scope
In

Expo + React Native (TypeScript)

Expo Router navigation

Auth/onboarding screens (UI only first, wire later)

Feed UI (mock posts)

Groups UI (create, browse, join)

Social UI (friends, suggested)

Profile UI (settings, QR placeholder)

Dark theme (red/off-white accents)

Out (for v0)

Real matchmaking algorithm (keep simple heuristic)

SMS verification (later)

Real-time chat (later)

Video upload pipeline (later)

Recommended Stack

Expo (fast iteration)

expo-router (file-based routing)

@expo/vector-icons (icons)

Optional later: Zustand (state), Supabase (auth + DB)

Folder Structure

Create this:

app/
  _layout.tsx
  (auth)/
    login.tsx
  (onboarding)/
    username.tsx
  (tabs)/
    _layout.tsx
    feed.tsx
    groups.tsx
    social.tsx
    profile.tsx


src/
  lib/
    theme.ts
  components/
    Screen.tsx
    ui/
      Button.tsx
      Input.tsx
      Card.tsx
Starter Files (Copy/Paste)
1) app/_layout.tsx
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";


export default function RootLayout() {
  return (
    <>
      <StatusBar style="light" />
      <Stack screenOptions={{ headerShown: false }} />
    </>
  );
}
2) app/(tabs)/_layout.tsx
import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";


export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: "#0f0f0f",
          borderTopColor: "#1a1a1a",
        },
        tabBarActiveTintColor: "#b11226",
        tabBarInactiveTintColor: "#888",
      }}
    >
      <Tabs.Screen
        name="feed"
        options={{
          title: "Feed",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="groups"
        options={{
          title: "Groups",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="people-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="social"

Install icons if needed:

npm install @expo/vector-icons
3) src/lib/theme.ts
export const theme = {
  colors: {
    background: "#0f0f0f",
    surface: "#171717",
    primary: "#b11226",
    accent: "#f5f5f5",
    muted: "#888",
    border: "#222",
  },
  radius: {
    sm: 8,
    md: 14,
    lg: 20,
  },
};
4) src/components/Screen.tsx
import { View, StyleSheet } from "react-native";
import { ReactNode } from "react";
import { theme } from "../lib/theme";


export default function Screen({ children }: { children: ReactNode }) {
  return <View style={styles.container}>{children}</View>;
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    padding: 16,
  },
});
5) src/components/ui/Button.tsx
import { Pressable, Text, StyleSheet } from "react-native";
import { theme } from "../../lib/theme";


export default function Button({
  title,
  onPress,
}: {
  title: string;
  onPress?: () => void;
}) {
  return (
    <Pressable style={styles.button} onPress={onPress}>
      <Text style={styles.text}>{title}</Text>
    </Pressable>
  );
}


const styles = StyleSheet.create({
  button: {
    backgroundColor: theme.colors.primary,
    paddingVertical: 14,
    borderRadius: theme.radius.md,
    alignItems: "center",
    marginVertical: 8,
  },
  text: {
    color: theme.colors.accent,
    fontWeight: "600",
    fontSize: 16,
  },
});
6) Screen placeholders (copy for each tab)

app/(tabs)/feed.tsx

import { Text } from "react-native";
import Screen from "../../src/components/Screen";


export default function Feed() {
  return (
    <Screen>
      <Text style={{ color: "white", fontSize: 22 }}>Feed Screen</Text>
    </Screen>
  );
}

Create the same for:

groups.tsx

social.tsx

profile.tsx

Build Order (Do This In Phases)
Phase A — Foundation (today)

Router skeleton (tabs + screens)

Theme tokens

UI primitives (Button, Input, Card)

Phase B — Navigation + Layout polish

Header component per screen

Safe areas + consistent spacing

Empty states (no groups yet, no friends yet)

Phase C — Onboarding (UI)

Login screen (Google button placeholder)

Username screen

Game interest picker (chips)

Phase D — Feed (mock)

Post card component

Like/comment UI (local state)

Hashtag chips

Phase E — Groups (mock)

Group list + filters (ranked/casual)

Create group modal

Join group button

“Group card” with participants

Phase F — Social (mock)

Friends list

Suggested list

Follow/unfollow toggle

Phase G — Profile

Stats: groups joined/completed

Settings list

QR placeholder

v0 Matching Heuristic (Simple, Not “Algorithm-heavy”)

Score groups by:

Same game (+3)

Same mode (ranked/casual) (+2)

Same mic preference (+1)

Rank proximity (+0–3)

Sort by score

Definition of Done (v0)

App opens on iOS + Android (or iOS + web for now)

All tabs navigable

Group create → group appears in list

Join group updates participant count (local)

Clean empty states

Screens look coherent and intentional

Portfolio Screenshot Checklist

Take these once UI looks clean:

Home/Feed overview

Groups list

Create group modal

Social list

Profile/settings

Add a small caption later: “Built with Expo Router + React Native TS; designed for scalable group collaboration patterns (InkVein prep).”

Done — I put the whole GameMate v0 canvas (build map + folder structure + all starter files) into a canvas doc titled:

“GameMate (GameGroup) v0 — Frontend Build Map + Starter Files”

Use it as your single source of truth while you build.

If you want, tell me what you’re testing on right now:

iPhone Expo Go

iOS Simulator

Web

…and I’ll give you the exact next “Phase B” tasks (header + safe areas + empty states) tailored to that device.