import { Link } from "expo-router";
import { StyleSheet, Text, View } from "react-native";
import { colors, spacing } from "../src/lib/theme";

export default function ModalScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Modal</Text>
      <Link href={"/(tabs)/news" as any} dismissTo style={styles.link}>
        Back to Home
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.md,
    backgroundColor: colors.background,
  },
  title: {
    color: colors.text,
    fontSize: 20,
    fontWeight: "700",
  },
  link: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: "600",
  },
});
