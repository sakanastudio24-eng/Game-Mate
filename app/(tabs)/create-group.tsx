import { useRouter } from "expo-router";
import React, { useState } from "react";
import { StyleSheet, View } from "react-native";
import { SegmentedButtons, Text } from "react-native-paper";
import { Button } from "../../src/components/ui/Button";
import { Card } from "../../src/components/ui/Card";
import { Header } from "../../src/components/ui/Header";
import { Input } from "../../src/components/ui/Input";
import { Screen } from "../../src/components/ui/Screen";
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

export default function CreateGroupScreen() {
  const router = useRouter();
  const [groupName, setGroupName] = useState("");
  const [selectedGame, setSelectedGame] = useState("Valorant");
  const [mode, setMode] = useState<"ranked" | "casual">("ranked");
  const [micRequired, setMicRequired] = useState(true);
  const [minRank, setMinRank] = useState("Gold");
  const [description, setDescription] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!groupName.trim()) newErrors.groupName = "Group name required";
    if (!description.trim()) newErrors.description = "Description required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCreate = () => {
    if (validateForm()) {
      // Backend: POST /api/groups with form data
      console.log("Creating group:", {
        groupName,
        selectedGame,
        mode,
        micRequired,
        minRank,
        description,
      });
      router.back();
    }
  };

  return (
    <Screen scrollable>
      <Header title="Create Group" showBackButton />

      <Card style={styles.card}>
        <Text style={styles.label}>Group Name *</Text>
        <Input
          label="e.g. Valorant Grinders"
          value={groupName}
          onChangeText={setGroupName}
          error={!!errors.groupName}
          fullWidth
        />
        {errors.groupName && (
          <Text style={styles.error}>{errors.groupName}</Text>
        )}
      </Card>

      <Card style={styles.card}>
        <Text style={styles.label}>Game</Text>
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
        <Text style={styles.label}>Playing Style</Text>
        <SegmentedButtons
          value={mode}
          onValueChange={(value) => setMode(value as any)}
          buttons={[
            { value: "ranked", label: "Ranked" },
            { value: "casual", label: "Casual" },
          ]}
          style={styles.segmented}
        />
      </Card>

      {mode === "ranked" && (
        <Card style={styles.card}>
          <Text style={styles.label}>Minimum Rank</Text>
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
        <Text style={styles.label}>Microphone Required?</Text>
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
        <Text style={styles.label}>Description *</Text>
        <Input
          label="What is your group about?"
          value={description}
          onChangeText={setDescription}
          error={!!errors.description}
          multiline
          numberOfLines={4}
          fullWidth
        />
        {errors.description && (
          <Text style={styles.error}>{errors.description}</Text>
        )}
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
