import { useLocalSearchParams } from "expo-router";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import React from "react";
import { Alert, Image, Pressable, StyleSheet, View } from "react-native";
import { Text } from "react-native-paper";
import { Header } from "../../src/components/ui/Header";
import { Screen } from "../../src/components/ui/Screen";
import { useResponsive } from "../../src/lib/responsive";
import { colors, spacing } from "../../src/lib/theme";

export default function VideoPreviewScreen() {
  const responsive = useResponsive();
  const params = useLocalSearchParams<{
    videoId?: string;
    title?: string;
    image?: string;
    duration?: string;
    views?: string;
  }>();

  const title = typeof params.title === "string" ? params.title : "Video Preview";
  const image =
    typeof params.image === "string"
      ? params.image
      : "https://images.unsplash.com/photo-1542751110-97427bbecf20?w=700&q=80";
  const duration = typeof params.duration === "string" ? params.duration : "0:00";
  const views = typeof params.views === "string" ? params.views : "0";

  return (
    <Screen scrollable>
      <Header title="Video Preview" subtitle="Creator tools" showBackButton />

      <View style={styles.heroCard}>
        <Image source={{ uri: image }} style={styles.heroImage} accessibilityLabel={`${title} preview`} />
        <View style={styles.playOverlay}>
          <View style={styles.playButton}>
            <MaterialCommunityIcons name="play" size={30} color="#1A1A1A" />
          </View>
        </View>
        <View style={styles.heroBadge}>
          <MaterialCommunityIcons name="eye-outline" size={14} color={colors.text} />
          <Text style={styles.heroBadgeText}>{views} views</Text>
          <Text style={styles.heroBadgeDot}>•</Text>
          <Text style={styles.heroBadgeText}>{duration}</Text>
        </View>
      </View>

      <Text style={[styles.title, { fontSize: responsive.sectionTitleSize }]}>{title}</Text>
      <Text style={[styles.subtitle, { fontSize: responsive.bodySize }]}>Manage this clip with quick premium tools.</Text>

      <View style={styles.toolsRow}>
        <Pressable
          onPress={() => Alert.alert("Preview", "Playback preview starts in next integration.")}
          accessibilityRole="button"
          accessibilityLabel="Play preview"
          style={({ pressed }) => [styles.toolButtonPrimary, pressed && styles.pressed]}
        >
          <MaterialCommunityIcons name="play-circle-outline" size={18} color="#1A1A1A" />
          <Text style={styles.toolButtonPrimaryText}>Play Preview</Text>
        </Pressable>

        <Pressable
          onPress={() => Alert.alert("Trim", "Trim and clip editing is coming next.")}
          accessibilityRole="button"
          accessibilityLabel="Trim video"
          style={({ pressed }) => [styles.toolButton, pressed && styles.pressed]}
        >
          <MaterialCommunityIcons name="content-cut" size={18} color={colors.primary} />
          <Text style={styles.toolButtonText}>Trim</Text>
        </Pressable>

        <Pressable
          onPress={() => Alert.alert("Share", "Share tools are ready for next integration.")}
          accessibilityRole="button"
          accessibilityLabel="Share video"
          style={({ pressed }) => [styles.toolButton, pressed && styles.pressed]}
        >
          <MaterialCommunityIcons name="share-variant-outline" size={18} color={colors.primary} />
          <Text style={styles.toolButtonText}>Share</Text>
        </Pressable>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  heroCard: {
    marginTop: spacing.md,
    borderRadius: 18,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: "#242424",
  },
  heroImage: {
    width: "100%",
    aspectRatio: 0.66,
  },
  playOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
  },
  playButton: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  heroBadge: {
    position: "absolute",
    right: 10,
    top: 10,
    borderRadius: 999,
    backgroundColor: "rgba(26,26,26,0.75)",
    borderWidth: 1,
    borderColor: colors.border,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  heroBadgeText: {
    color: colors.text,
    fontSize: 12,
    fontWeight: "700",
    marginLeft: 4,
  },
  heroBadgeDot: {
    color: colors.textSecondary,
    marginHorizontal: 6,
  },
  title: {
    color: colors.text,
    fontWeight: "800",
    marginTop: spacing.md,
  },
  subtitle: {
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  toolsRow: {
    marginTop: spacing.md,
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  toolButtonPrimary: {
    minHeight: 52,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.primary,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
  },
  toolButtonPrimaryText: {
    color: "#1A1A1A",
    fontWeight: "800",
    fontSize: 15,
    marginLeft: 6,
  },
  toolButton: {
    minHeight: 52,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: "#242424",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
  },
  toolButtonText: {
    color: colors.text,
    fontWeight: "700",
    fontSize: 15,
    marginLeft: 6,
  },
  pressed: {
    opacity: 0.8,
  },
});
