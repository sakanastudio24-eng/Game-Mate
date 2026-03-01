import { useRouter } from "expo-router";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import React, { useState } from "react";
import { Image, Pressable, ScrollView, StyleSheet, View } from "react-native";
import { Text } from "react-native-paper";
import { colors, spacing } from "../../src/lib/theme";

interface GroupCardData {
  id: string;
  name: string;
  game: string;
  date?: string;
  members: number;
  online: number;
  thumbnail: string;
  verified: boolean;
}

interface SuggestedGroupData {
  id: string;
  name: string;
  game: string;
  members: number;
  online: number;
  thumbnail: string;
}

const memberAvatars = [
  "https://images.unsplash.com/photo-1613063022614-dc11527f5ece?w=80&h=80&fit=crop",
  "https://images.unsplash.com/photo-1757773873686-2257941bbcb8?w=80&h=80&fit=crop",
  "https://images.unsplash.com/photo-1628501899963-43bb8e2423e1?w=80&h=80&fit=crop",
  "https://images.unsplash.com/photo-1622349851524-890cc3641b87?w=80&h=80&fit=crop",
];

const myGroups: GroupCardData[] = [
  {
    id: "1",
    name: "Disco 2024 Tournament",
    game: "Overwatch",
    date: "Aug 25, 2026",
    members: 12,
    online: 8,
    thumbnail:
      "https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=700&q=80",
    verified: true,
  },
  {
    id: "2",
    name: "Arc Raiders Squad",
    game: "Arc Raiders",
    members: 8,
    online: 3,
    thumbnail:
      "https://images.unsplash.com/photo-1552820728-8b83bb6b773f?w=700&q=80",
    verified: false,
  },
  {
    id: "3",
    name: "Valorant Grinders",
    game: "Valorant",
    members: 24,
    online: 15,
    thumbnail:
      "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=700&q=80",
    verified: true,
  },
];

const suggested: SuggestedGroupData[] = [
  {
    id: "s1",
    name: "CS2 Pro League",
    game: "Counter-Strike 2",
    members: 156,
    online: 89,
    thumbnail:
      "https://images.unsplash.com/photo-1511512578047-dfb367046420?w=400&q=80",
  },
  {
    id: "s2",
    name: "Chill Gaming Nights",
    game: "Various",
    members: 45,
    online: 12,
    thumbnail:
      "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=400&q=80",
  },
];

export default function GroupsScreen() {
  const router = useRouter();
  const [joinedSuggested, setJoinedSuggested] = useState<string[]>([]);

  const totalOnline = myGroups.reduce((total, group) => total + group.online, 0);

  const toggleJoinSuggested = (id: string) => {
    setJoinedSuggested((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  return (
    <View style={styles.screen}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <View style={styles.headerWrap}>
          <View style={styles.titleRow}>
            <Text style={styles.title}>Groups</Text>
            <View style={styles.headerActions}>
              <Pressable
                onPress={() => router.push("/(tabs)/discover-groups")}
                style={({ pressed }) => [styles.iconButton, pressed && styles.pressed]}
              >
                <MaterialCommunityIcons name="magnify" size={20} color={colors.text} />
              </Pressable>
              <Pressable
                onPress={() => router.push("/(tabs)/qr-code")}
                style={({ pressed }) => [styles.iconButton, pressed && styles.pressed]}
              >
                <MaterialCommunityIcons name="qrcode" size={20} color={colors.text} />
              </Pressable>
            </View>
          </View>

          <View style={styles.statsRow}>
            <View style={styles.statPrimary}>
              <Text style={styles.statPrimaryText}>{myGroups.length} Active Groups</Text>
            </View>
            <View style={styles.statSecondary}>
              <View style={styles.onlineDot} />
              <Text style={styles.statSecondaryText}>{totalOnline} Online</Text>
            </View>
          </View>
        </View>

        <View style={styles.sectionHead}>
          <Text style={styles.sectionTitle}>My Groups</Text>
          <Pressable
            onPress={() => router.push("/(tabs)/create-group")}
            style={({ pressed }) => [styles.createButton, pressed && styles.pressed]}
          >
            <MaterialCommunityIcons name="plus" size={16} color="#1A1A1A" />
            <Text style={styles.createButtonText}>Create</Text>
          </Pressable>
        </View>

        {myGroups.map((group) => (
          <Pressable
            key={group.id}
            onPress={() => router.push(`/(tabs)/group-detail?groupId=${group.id}`)}
            style={({ pressed }) => [styles.groupCard, pressed && styles.pressed]}
          >
            <View style={styles.groupImageWrap}>
              <Image source={{ uri: group.thumbnail }} style={styles.groupImage} />

              {group.verified && (
                <View style={styles.verifiedBadge}>
                  <MaterialCommunityIcons name="check-decagram" size={14} color="#1A1A1A" />
                </View>
              )}

              <View style={styles.onlinePill}>
                <View style={styles.onlinePulseDot} />
                <Text style={styles.onlinePillText}>{group.online} online</Text>
              </View>
            </View>

            <View style={styles.groupBody}>
              <View style={styles.groupTopRow}>
                <View style={styles.groupTitleWrap}>
                  <Text style={styles.groupTitle}>{group.name}</Text>
                  <Text style={styles.groupSubtitle}>{group.game}</Text>
                </View>
                {group.date ? <Text style={styles.groupDate}>{group.date}</Text> : null}
              </View>

              <View style={styles.memberRow}>
                <View style={styles.avatarStack}>
                  {memberAvatars.slice(0, 4).map((avatar, index) => (
                    <Image
                      key={`${group.id}-${index}`}
                      source={{ uri: avatar }}
                      style={[styles.memberAvatar, { marginLeft: index === 0 ? 0 : -10 }]}
                    />
                  ))}
                </View>
                <Text style={styles.memberText}>{group.members} members</Text>
              </View>
            </View>
          </Pressable>
        ))}

        <Text style={[styles.sectionTitle, styles.suggestedTitle]}>Suggested For You</Text>

        {suggested.map((group) => {
          const isJoined = joinedSuggested.includes(group.id);
          return (
            <View key={group.id} style={styles.suggestedCard}>
              <Image source={{ uri: group.thumbnail }} style={styles.suggestedThumb} />

              <View style={styles.suggestedInfo}>
                <Text style={styles.suggestedName}>{group.name}</Text>
                <Text style={styles.suggestedGame}>{group.game}</Text>
                <Text style={styles.suggestedMeta}>
                  {group.members} members · {group.online} online
                </Text>
              </View>

              <Pressable
                onPress={() => toggleJoinSuggested(group.id)}
                style={({ pressed }) => [
                  styles.joinButton,
                  isJoined ? styles.joinedButton : undefined,
                  pressed && styles.pressed,
                ]}
              >
                <Text style={[styles.joinButtonText, isJoined ? styles.joinedButtonText : undefined]}>
                  {isJoined ? "Joined" : "Join"}
                </Text>
              </Pressable>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.lg,
    paddingBottom: 110,
  },
  headerWrap: {
    marginBottom: spacing.md,
  },
  titleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.md,
  },
  title: {
    color: colors.text,
    fontSize: 36,
    fontWeight: "800",
  },
  headerActions: {
    flexDirection: "row",
  },
  iconButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: "#242424",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: spacing.sm,
  },
  statsRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  statPrimary: {
    backgroundColor: colors.primary,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 8,
    marginRight: spacing.sm,
  },
  statPrimaryText: {
    color: "#1A1A1A",
    fontWeight: "800",
    fontSize: 12,
  },
  statSecondary: {
    backgroundColor: "#242424",
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.border,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  onlineDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#4ADE80",
    marginRight: 6,
  },
  statSecondaryText: {
    color: "#4ADE80",
    fontSize: 12,
    fontWeight: "700",
  },
  sectionHead: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 21,
    fontWeight: "800",
  },
  createButton: {
    backgroundColor: colors.primary,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
    flexDirection: "row",
    alignItems: "center",
  },
  createButtonText: {
    color: "#1A1A1A",
    fontSize: 13,
    fontWeight: "800",
    marginLeft: 4,
  },
  groupCard: {
    borderRadius: 22,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: "#242424",
    overflow: "hidden",
    marginBottom: spacing.md,
  },
  groupImageWrap: {
    height: 170,
    position: "relative",
  },
  groupImage: {
    width: "100%",
    height: "100%",
  },
  verifiedBadge: {
    position: "absolute",
    right: 10,
    top: 10,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  onlinePill: {
    position: "absolute",
    left: 10,
    top: 10,
    backgroundColor: "rgba(26,26,26,0.8)",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    flexDirection: "row",
    alignItems: "center",
  },
  onlinePulseDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#4ADE80",
    marginRight: 6,
  },
  onlinePillText: {
    color: colors.text,
    fontSize: 11,
    fontWeight: "700",
  },
  groupBody: {
    padding: spacing.md,
  },
  groupTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: spacing.sm,
  },
  groupTitleWrap: {
    flex: 1,
    marginRight: spacing.sm,
  },
  groupTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: "800",
  },
  groupSubtitle: {
    color: colors.textSecondary,
    fontSize: 13,
    marginTop: 2,
  },
  groupDate: {
    color: colors.primary,
    borderColor: "rgba(255,159,102,0.25)",
    borderWidth: 1,
    backgroundColor: "rgba(255,159,102,0.12)",
    borderRadius: 999,
    overflow: "hidden",
    paddingHorizontal: 9,
    paddingVertical: 4,
    fontSize: 11,
    fontWeight: "700",
  },
  memberRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatarStack: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: spacing.sm,
  },
  memberAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: "#242424",
  },
  memberText: {
    color: colors.textSecondary,
    fontSize: 13,
  },
  suggestedTitle: {
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  suggestedCard: {
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: "#242424",
    marginBottom: spacing.sm,
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
  },
  suggestedThumb: {
    width: 72,
    height: 72,
    borderRadius: 14,
    marginRight: spacing.md,
  },
  suggestedInfo: {
    flex: 1,
    marginRight: spacing.sm,
  },
  suggestedName: {
    color: colors.text,
    fontSize: 15,
    fontWeight: "700",
  },
  suggestedGame: {
    color: colors.textSecondary,
    fontSize: 12,
    marginTop: 2,
  },
  suggestedMeta: {
    color: "#4ADE80",
    fontSize: 11,
    marginTop: 4,
  },
  joinButton: {
    borderRadius: 999,
    backgroundColor: colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  joinButtonText: {
    color: "#1A1A1A",
    fontWeight: "800",
    fontSize: 12,
  },
  joinedButton: {
    backgroundColor: "#2E4E3A",
    borderWidth: 1,
    borderColor: "#4ADE80",
  },
  joinedButtonText: {
    color: "#4ADE80",
  },
  pressed: {
    opacity: 0.85,
  },
});
