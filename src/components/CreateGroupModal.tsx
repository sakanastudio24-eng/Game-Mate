import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import React, { useState } from "react";
import { Modal, Pressable, ScrollView, StyleSheet, View } from "react-native";
import { Chip, Text } from "react-native-paper";
import { Button } from "../../src/components/ui/Button";
import { Card } from "../../src/components/ui/Card";
import { Input } from "../../src/components/ui/Input";
import { colors, spacing } from "../../src/lib/theme";

// CreateGroupModal: Form to create new group
// Backend integration: POST /api/groups endpoint in Phase B

interface CreateGroupModalProps {
  isVisible: boolean;
  onClose: () => void;
  onCreate: (groupData: any) => void;
}

export function CreateGroupModal({
  isVisible,
  onClose,
  onCreate,
}: CreateGroupModalProps) {
  const [groupName, setGroupName] = useState("");
  const [game, setGame] = useState("");
  const [mode, setMode] = useState<"ranked" | "casual">("ranked");
  const [micRequired, setMicRequired] = useState(true);
  const [description, setDescription] = useState("");

  const handleCreate = () => {
    if (groupName && game) {
      onCreate({ groupName, game, mode, micRequired, description });
      setGroupName("");
      setGame("");
      setMode("ranked");
      setMicRequired(true);
      setDescription("");
      onClose();
    }
  };

  const games = [
    "Valorant",
    "League of Legends",
    "CS2",
    "Overwatch 2",
    "Apex Legends",
    "Fortnite",
  ];

  return (
    <Modal visible={isVisible} animationType="slide" transparent={false}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Pressable onPress={onClose}>
            <MaterialCommunityIcons
              name="close"
              size={24}
              color={colors.text}
            />
          </Pressable>
          <Text style={styles.title}>Create Group</Text>
          <View style={{ width: 24 }} />
        </View>

        <ScrollView contentContainerStyle={styles.content}>
          {/* Group name */}
          <Input
            label="Group Name"
            value={groupName}
            onChangeText={setGroupName}
            placeholder="Valorant Grinders"
            fullWidth
          />

          {/* Game selection */}
          <Text style={styles.label}>Select Game</Text>
          <View style={styles.gameList}>
            {games.map((g) => (
              <Chip
                key={g}
                label={g}
                selected={game === g}
                onPress={() => setGame(g)}
                mode={game === g ? "flat" : "outlined"}
                selectedColor={colors.primary}
                style={styles.gameChip}
              />
            ))}
          </View>

          {/* Mode selection */}
          <Text style={styles.label}>Game Mode</Text>
          <View style={styles.modeContainer}>
            {["ranked", "casual"].map((m) => (
              <Pressable
                key={m}
                onPress={() => setMode(m as any)}
                style={[
                  styles.modeButton,
                  mode === m && styles.modeButtonActive,
                ]}
              >
                <Text
                  style={[styles.modeText, mode === m && styles.modeTextActive]}
                >
                  {m === "ranked" ? "⭐ Ranked" : "😄 Casual"}
                </Text>
              </Pressable>
            ))}
          </View>

          {/* Mic requirement */}
          <Card style={styles.micCard}>
            <View style={styles.micRow}>
              <Text style={styles.micLabel}>Microphone Required</Text>
              <Pressable
                onPress={() => setMicRequired(!micRequired)}
                style={[styles.toggle, micRequired && styles.toggleActive]}
              >
                <View
                  style={[
                    styles.toggleIndicator,
                    micRequired && styles.toggleIndicatorActive,
                  ]}
                />
              </Pressable>
            </View>
          </Card>

          {/* Description */}
          <Input
            label="Group Description"
            value={description}
            onChangeText={setDescription}
            placeholder="What should members know about this group?"
            multiline
            numberOfLines={3}
            fullWidth
          />

          {/* Create button */}
          <Button
            variant="primary"
            onPress={handleCreate}
            fullWidth
            size="large"
            disabled={!groupName || !game}
            style={styles.createButton}
          >
            Create Group
          </Button>
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingTop: 40,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: {
    color: colors.text,
    fontWeight: "700",
    fontSize: 18,
  },
  content: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.lg,
  },
  label: {
    color: colors.text,
    fontWeight: "600",
    fontSize: 14,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  gameList: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  gameChip: {
    marginRight: spacing.xs,
  },
  modeContainer: {
    flexDirection: "row",
    gap: spacing.md,
  },
  modeButton: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: 12,
    alignItems: "center",
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
  },
  modeButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  modeText: {
    color: colors.text,
    fontWeight: "600",
    fontSize: 14,
  },
  modeTextActive: {
    color: colors.background,
  },
  micCard: {
    marginTop: spacing.lg,
    marginBottom: spacing.lg,
  },
  micRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  micLabel: {
    color: colors.text,
    fontWeight: "600",
    fontSize: 14,
  },
  toggle: {
    width: 50,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.card,
    justifyContent: "center",
    paddingHorizontal: 3,
  },
  toggleActive: {
    backgroundColor: colors.primary,
  },
  toggleIndicator: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.border,
  },
  toggleIndicatorActive: {
    backgroundColor: colors.background,
    alignSelf: "flex-end",
  },
  createButton: {
    marginTop: spacing.lg,
    marginBottom: spacing.xl,
  },
});
