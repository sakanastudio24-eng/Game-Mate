import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { Text } from "react-native-paper";
import { Button } from "../../src/components/ui/Button";
import { Card } from "../../src/components/ui/Card";
import { Chip } from "../../src/components/ui/Chip";
import { Header } from "../../src/components/ui/Header";
import { Input } from "../../src/components/ui/Input";
import { Screen } from "../../src/components/ui/Screen";
import { mockCurrentUser } from "../../src/lib/mockData";
import { useResponsive } from "../../src/lib/responsive";
import { colors, spacing } from "../../src/lib/theme";

// EditProfileScreen: Update user profile information
// Backend integration: PATCH /api/me endpoint in Phase B
// Fields: username, bio, avatar, games

const availableGames = [
  "Valorant",
  "League of Legends",
  "CS2",
  "Overwatch 2",
  "Apex Legends",
  "Fortnite",
  "Dota 2",
  "PUBG",
];
const avatars = ["🎮", "🎯", "🎪", "🧙", "⚔️", "🛡️", "🚀", "🔥"];

export default function EditProfileScreen() {
  const router = useRouter();
  const responsive = useResponsive();
  const [username, setUsername] = useState(mockCurrentUser.username);
  const [bio, setBio] = useState(mockCurrentUser.bio || "");
  const [avatar, setAvatar] = useState(mockCurrentUser.avatar || "🎮");
  const [selectedGames, setSelectedGames] = useState<string[]>(
    mockCurrentUser.gamesPlayed,
  );

  const handleGameToggle = (game: string) => {
    setSelectedGames((prev) =>
      prev.includes(game)
        ? prev.filter((g) => g !== game)
        : [...prev, game].slice(0, 5),
    );
  };

  const handleSave = () => {
    // Mock: close screen until API wiring is added in a later phase.
    router.back();
  };

  return (
    <Screen scrollable>
      <Header title="Edit Profile" showBackButton />

      {/* Avatar selector */}
      <Card style={styles.avatarCard}>
        <Text style={[styles.sectionTitle, { fontSize: responsive.bodySize }]}>Profile Picture</Text>
        <View style={styles.avatarDisplay}>
          <Text style={[styles.avatarLarge, { fontSize: responsive.titleSize * 2 }]}>{avatar}</Text>
        </View>

        <View style={styles.avatarGrid}>
          {avatars.map((ava) => (
            <Pressable
              key={ava}
              onPress={() => setAvatar(ava)}
              style={[
                styles.avatarOption,
                {
                  width: responsive.iconButtonSize + 14,
                  height: responsive.iconButtonSize + 14,
                  borderRadius: (responsive.iconButtonSize + 14) / 2,
                },
                avatar === ava && styles.avatarOptionSelected,
              ]}
            >
              <Text style={[styles.avatarOptionText, { fontSize: responsive.titleSize - 2 }]}>{ava}</Text>
            </Pressable>
          ))}
        </View>
      </Card>

      {/* Username */}
      <Input
        label="Username"
        value={username}
        onChangeText={setUsername}
        placeholder="Your username"
        fullWidth
      />

      {/* Bio */}
      <Input
        label="Bio"
        value={bio}
        onChangeText={setBio}
        placeholder="Tell us about yourself"
        multiline
        numberOfLines={3}
        fullWidth
      />

      {/* Games */}
      <Card style={styles.gameCard}>
        <Text style={[styles.sectionTitle, { fontSize: responsive.bodySize }]}>
          Favorite Games (up to 5)
        </Text>
        <View style={styles.gamesList}>
          {availableGames.map((game) => (
            <Chip
              key={game}
              label={game}
              selected={selectedGames.includes(game)}
              onPress={() => handleGameToggle(game)}
            />
          ))}
        </View>
      </Card>

      {/* Action buttons */}
      <View style={styles.actions}>
        <Button variant="primary" onPress={handleSave} fullWidth size="large">
          Save Changes
        </Button>

        <Button variant="secondary" fullWidth size="large" onPress={() => router.back()}>
          Cancel
        </Button>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  avatarCard: {
    marginBottom: spacing.lg,
    alignItems: "center",
  },
  sectionTitle: {
    color: colors.text,
    fontWeight: "700",
    fontSize: 14,
    marginBottom: spacing.md,
  },
  avatarDisplay: {
    marginBottom: spacing.lg,
  },
  avatarLarge: {
    fontSize: 80,
  },
  avatarGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: spacing.md,
  },
  avatarOption: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.card,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: colors.border,
  },
  avatarOptionSelected: {
    borderColor: colors.primary,
    borderWidth: 3,
  },
  avatarOptionText: {
    fontSize: 32,
  },
  gameCard: {
    marginBottom: spacing.lg,
    marginTop: spacing.lg,
  },
  gamesList: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  actions: {
    gap: spacing.sm,
    marginBottom: spacing.xl,
  },
});
