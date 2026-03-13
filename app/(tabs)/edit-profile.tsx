import { Image as ExpoImage } from "expo-image";
import React, { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, View } from "react-native";
import { Text } from "react-native-paper";
import { getMyProfile, updateMyProfile } from "../../services/profile";
import { Button } from "../../src/components/ui/Button";
import { Card } from "../../src/components/ui/Card";
import { Chip } from "../../src/components/ui/Chip";
import { Header } from "../../src/components/ui/Header";
import { Input } from "../../src/components/ui/Input";
import { useAuth } from "../../src/context/AuthContext";
import { useLocalCache } from "../../src/lib/hooks/useLocalCache";
import { useSafeBackNavigation } from "../../src/lib/navigation";
import { Screen } from "../../src/components/ui/Screen";
import { useResponsive } from "../../src/lib/responsive";
import { colors, spacing } from "../../src/lib/theme";

// EditProfileScreen: Update user profile information
// Backend integration: GET/PATCH /api/profile/me/
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
const avatarOptions = [
  "https://images.unsplash.com/photo-1579975979101-7a3c3909d659?w=300&h=300&fit=crop",
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&h=300&fit=crop",
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300&h=300&fit=crop",
  "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=300&h=300&fit=crop",
  "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=300&h=300&fit=crop",
  "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=300&h=300&fit=crop",
  "https://images.unsplash.com/photo-1519345182560-3f2917c472ef?w=300&h=300&fit=crop",
  "https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=300&h=300&fit=crop",
];

export default function EditProfileScreen() {
  const safeBack = useSafeBackNavigation();
  const responsive = useResponsive();
  const { accessToken, user } = useAuth();
  const profileCacheKey = `profile:me:${user?.id ?? "anon"}`;
  const {
    value: cachedProfile,
    setValue: setCachedProfile,
    hydrated: profileCacheHydrated,
  } = useLocalCache(profileCacheKey, {
    bio: "",
    avatar_url: "",
    favorite_games: [] as string[],
  });
  const [username] = useState(user?.username ?? "Player");
  const [bio, setBio] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string>("");
  const [selectedGames, setSelectedGames] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const loadProfile = useCallback(async () => {
    if (!accessToken) {
      setLoading(false);
      setError("Sign in again to edit your profile.");
      return;
    }

    setLoading(true);
    setError("");
    try {
      const profile = await getMyProfile(accessToken);
      setBio(profile.bio || "");
      setSelectedGames(profile.favorite_games || []);
      setAvatarUrl(profile.avatar_url || "");
      setCachedProfile(profile);
    } catch (fetchError) {
      setError(fetchError instanceof Error ? fetchError.message : "Unable to load profile.");
    } finally {
      setLoading(false);
    }
  }, [accessToken, setCachedProfile]);

  useEffect(() => {
    if (!profileCacheHydrated) return;
    setBio(cachedProfile.bio || "");
    setSelectedGames(cachedProfile.favorite_games || []);
    setAvatarUrl(cachedProfile.avatar_url || "");
    if (
      cachedProfile.bio ||
      cachedProfile.avatar_url ||
      (cachedProfile.favorite_games && cachedProfile.favorite_games.length > 0)
    ) {
      setLoading(false);
    }
  }, [profileCacheHydrated, cachedProfile.bio, cachedProfile.avatar_url, cachedProfile.favorite_games]);

  useEffect(() => {
    void loadProfile();
  }, [loadProfile, profileCacheKey]);

  const handleGameToggle = (game: string) => {
    setSelectedGames((prev) =>
      prev.includes(game)
        ? prev.filter((g) => g !== game)
        : [...prev, game].slice(0, 10),
    );
  };

  const handleSave = async () => {
    if (!accessToken) {
      setError("Sign in again to edit your profile.");
      return;
    }

    setSaving(true);
    setError("");
    try {
      const updatedProfile = await updateMyProfile(accessToken, {
        bio: bio.trim(),
        avatar_url: avatarUrl.trim(),
        favorite_games: selectedGames,
      });
      setCachedProfile(updatedProfile);
      safeBack();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Unable to save profile.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Screen scrollable>
      <Header title="Edit Profile" showBackButton />

      {loading ? (
        <View style={styles.loadingWrap}>
          <ActivityIndicator color={colors.primary} />
          <Text style={styles.loadingText}>Loading profile...</Text>
        </View>
      ) : null}

      {!loading && error ? (
        <View style={styles.errorRow}>
          <Text style={styles.errorText}>{error}</Text>
          <Pressable
            onPress={() => {
              void loadProfile();
            }}
            accessibilityRole="button"
            accessibilityLabel="Retry loading profile"
            style={({ pressed }) => [styles.retryButton, pressed && styles.pressed]}
          >
            <Text style={styles.retryText}>Retry</Text>
          </Pressable>
        </View>
      ) : null}

      {/* Avatar selector */}
      <Card style={styles.avatarCard}>
        <Text
          accessibilityRole="header"
          style={[styles.sectionTitle, { fontSize: responsive.bodySize }]}
        >
          Profile Picture
        </Text>
        <View style={styles.avatarDisplay}>
          <ExpoImage
            source={{ uri: avatarUrl || avatarOptions[0] }}
            style={styles.avatarLargeImage}
            contentFit="cover"
          />
        </View>

        <View style={styles.avatarGrid}>
          {avatarOptions.map((avatar) => (
            <Pressable
              key={avatar}
              onPress={() => setAvatarUrl(avatar)}
              accessibilityRole="button"
              accessibilityLabel="Select avatar image"
              accessibilityState={{ selected: avatarUrl === avatar }}
              style={[
                styles.avatarOption,
                {
                  width: responsive.iconButtonSize + 14,
                  height: responsive.iconButtonSize + 14,
                  borderRadius: (responsive.iconButtonSize + 14) / 2,
                },
                avatarUrl === avatar && styles.avatarOptionSelected,
              ]}
            >
              <ExpoImage
                source={{ uri: avatar }}
                style={styles.avatarOptionImage}
                contentFit="cover"
              />
            </Pressable>
          ))}
        </View>
      </Card>

      <Input
        label="Avatar URL (optional)"
        accessibilityLabel="Avatar URL"
        value={avatarUrl}
        onChangeText={setAvatarUrl}
        placeholder="https://example.com/avatar.png"
        autoCapitalize="none"
        autoCorrect={false}
        autoComplete="off"
        keyboardType="url"
        fullWidth
      />

      {/* Username */}
      <Input
        label="Username"
        accessibilityLabel="Username"
        value={username}
        editable={false}
        placeholder="Your username"
        fullWidth
      />

      {/* Bio */}
      <Input
        label="Bio"
        accessibilityLabel="Bio"
        value={bio}
        onChangeText={setBio}
        placeholder="Tell us about yourself"
        multiline
        numberOfLines={3}
        fullWidth
      />

      {/* Games */}
      <Card style={styles.gameCard}>
        <Text
          accessibilityRole="header"
          style={[styles.sectionTitle, { fontSize: responsive.bodySize }]}
        >
          Favorite Games / Interests (up to 10)
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
        <Button variant="primary" onPress={handleSave} fullWidth size="large" loading={saving} disabled={saving || loading}>
          Save Changes
        </Button>

        <Button variant="secondary" fullWidth size="large" onPress={safeBack} disabled={saving}>
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
  avatarLargeImage: {
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 2,
    borderColor: colors.primary,
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
  avatarOptionImage: {
    width: "100%",
    height: "100%",
    borderRadius: 999,
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
  loadingWrap: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: spacing.lg,
    gap: spacing.sm,
  },
  loadingText: {
    color: colors.textSecondary,
    fontSize: 13,
  },
  errorRow: {
    marginBottom: spacing.sm,
  },
  errorText: {
    color: colors.destructive,
    fontSize: 12,
  },
  retryButton: {
    borderWidth: 1,
    borderColor: colors.destructive,
    borderRadius: 8,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    alignSelf: "flex-start",
    marginTop: spacing.xs,
  },
  retryText: {
    color: colors.destructive,
    fontWeight: "700",
    fontSize: 11,
  },
  pressed: {
    opacity: 0.8,
  },
});
