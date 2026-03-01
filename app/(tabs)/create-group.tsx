import React, { useState } from "react";
import { StyleSheet, View } from "react-native";
import { SegmentedButtons, Text } from "react-native-paper";
import { Button } from "../../src/components/ui/Button";
import { Card } from "../../src/components/ui/Card";
import { Header } from "../../src/components/ui/Header";
import { Input } from "../../src/components/ui/Input";
import { useSafeBackNavigation } from "../../src/lib/navigation";
import { Screen } from "../../src/components/ui/Screen";
import { useResponsive } from "../../src/lib/responsive";
import { colors, spacing } from "../../src/lib/theme";

// CreateGroupScreen: Modal form to create a new group
// Backend integration: POST /api/groups endpoint in Phase B
// State: form fields (game, mode, micRequired, minRank, maxRank), validation

const games = [
  "Valorant",
  "League of Legends",
  "CS2",
  "Overwatch",
  "Apex Legends",
  "Minecraft",
];
const ranks = ["Bronze", "Silver", "Gold", "Platinum", "Diamond", "Radiant"];
const mediaSources = ["None", "Upload", "Camera"];

export default function CreateGroupScreen() {
  const safeBack = useSafeBackNavigation();
  const responsive = useResponsive();
  const [groupName, setGroupName] = useState("");
  const [selectedGame, setSelectedGame] = useState("Valorant");
  const [mode, setMode] = useState<"ranked" | "casual">("ranked");
  const [micRequired, setMicRequired] = useState(true);
  const [minRank, setMinRank] = useState("Gold");
  const [description, setDescription] = useState("");
  const [mediaSource, setMediaSource] = useState("Upload");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!groupName.trim()) {
      newErrors.groupName = "Enter a group name so players can identify your group.";
    }
    if (!description.trim()) {
      newErrors.description = "Add a short description so players know what this group is for.";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCreate = () => {
    if (validateForm()) {
      // Backend: POST /api/groups with form data.
      safeBack();
    }
  };

  return (
    <Screen scrollable>
      <Header title="Create Group" showBackButton />

      <Card style={styles.card}>
        <Text style={[styles.label, { fontSize: responsive.bodySize }]}>Group Name *</Text>
        <Input
          label="Group Name"
          placeholder="e.g. Diamond Valorant Night Squad"
          accessibilityLabel="Group name"
          value={groupName}
          onChangeText={setGroupName}
          error={!!errors.groupName}
          errorText={errors.groupName}
          fullWidth
        />
      </Card>

      <Card style={styles.card}>
        <Text style={[styles.label, { fontSize: responsive.bodySize }]}>Game</Text>
        <View style={styles.gameList}>
          {games.map((game) => (
            <Button
              key={game}
              variant={selectedGame === game ? "primary" : "secondary"}
              onPress={() => setSelectedGame(game)}
              size="small"
              style={styles.gameButton}
            >
              {game}
            </Button>
          ))}
        </View>
      </Card>

      <Card style={styles.card}>
        <Text style={[styles.label, { fontSize: responsive.bodySize }]}>Playing Style</Text>
        <SegmentedButtons
          value={mode}
          onValueChange={(value) => setMode(value as "ranked" | "casual")}
          buttons={[
            { value: "ranked", label: "Ranked" },
            { value: "casual", label: "Casual" },
          ]}
          style={styles.segmented}
        />
      </Card>

      {mode === "ranked" && (
        <Card style={styles.card}>
          <Text style={[styles.label, { fontSize: responsive.bodySize }]}>Minimum Rank</Text>
          <View style={styles.rankList}>
            {ranks.map((rank) => (
              <Button
                key={rank}
                variant={minRank === rank ? "primary" : "secondary"}
                onPress={() => setMinRank(rank)}
                size="small"
                style={styles.rankButton}
              >
                {rank}
              </Button>
            ))}
          </View>
        </Card>
      )}

      <Card style={styles.card}>
        <Text style={[styles.label, { fontSize: responsive.bodySize }]}>Microphone Required?</Text>
        <SegmentedButtons
          value={micRequired ? "yes" : "no"}
          onValueChange={(value) => setMicRequired(value === "yes")}
          buttons={[
            { value: "yes", label: "Yes" },
            { value: "no", label: "No" },
          ]}
          style={styles.segmented}
        />
      </Card>

      <Card style={styles.card}>
        <Text style={[styles.label, { fontSize: responsive.bodySize }]}>Description *</Text>
        <Input
          label="Description"
          placeholder="What is your group about?"
          accessibilityLabel="Group description"
          value={description}
          onChangeText={setDescription}
          error={!!errors.description}
          errorText={errors.description}
          multiline
          numberOfLines={4}
          fullWidth
        />
      </Card>

      <Card style={styles.card}>
        <Text style={[styles.label, { fontSize: responsive.bodySize }]}>Group Media Upload</Text>
        <View style={styles.gameList}>
          {mediaSources.map((source) => (
            <Button
              key={source}
              variant={mediaSource === source ? "primary" : "secondary"}
              onPress={() => setMediaSource(source)}
              size="small"
              style={styles.gameButton}
            >
              {source}
            </Button>
          ))}
        </View>
      </Card>

      <Button
        variant="primary"
        fullWidth
        size="large"
        onPress={handleCreate}
        style={styles.createButton}
      >
        Create Group
      </Button>
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: spacing.lg,
  },
  label: {
    color: colors.text,
    fontWeight: "600",
    fontSize: 14,
    marginBottom: spacing.md,
  },
  error: {
    color: colors.destructive,
    fontSize: 12,
    marginTop: spacing.xs,
  },
  gameList: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  gameButton: {
    marginRight: spacing.xs,
  },
  segmented: {
    marginBottom: spacing.md,
  },
  rankList: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  rankButton: {
    marginRight: spacing.xs,
  },
  createButton: {
    marginBottom: spacing.xl,
  },
});
