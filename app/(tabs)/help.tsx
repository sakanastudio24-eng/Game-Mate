import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import React, { useState } from "react";
import { Linking, StyleSheet, View } from "react-native";
import { Divider, List, Text } from "react-native-paper";
import { Card } from "../../src/components/ui/Card";
import { Header } from "../../src/components/ui/Header";
import { Screen } from "../../src/components/ui/Screen";
import { colors, spacing } from "../../src/lib/theme";

// HelpScreen: FAQ, support, and documentation
// Backend integration: Links to external support portal in Phase B

interface FAQItem {
  question: string;
  answer: string;
  icon: string;
}

export default function HelpScreen() {
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const faqs: FAQItem[] = [
    {
      question: "How do I create a game group?",
      answer:
        "Tap the Create button on the Groups tab. Select your game, play style, rank requirement, and description. Invite friends or make it public for matchmaking.",
      icon: "plus-circle",
    },
    {
      question: "What is matchmaking?",
      answer:
        "Matchmaking is our feature to automatically find compatible players for your group based on game, rank, play style, and region.",
      icon: "shuffle-variant",
    },
    {
      question: "How do I add friends?",
      answer:
        'Go to the Social tab and tap "Add Friends". Search for players by name or use QR codes to quickly add friends nearby.',
      icon: "account-plus",
    },
    {
      question: "What is my QR code?",
      answer:
        'Your unique QR code lets friends quickly add you without typing your name. Find it in your Profile settings under "My Code".',
      icon: "qrcode",
    },
    {
      question: "How do I report a player?",
      answer:
        'Open their profile, tap the menu icon, and select "Report". Tell us what happened and we\'ll review it within 24 hours.',
      icon: "alert-circle",
    },
    {
      question: "Can I change my game preferences?",
      answer:
        "Yes! Go to your Profile, tap Edit Profile, and update your favorite games. You can add up to 5 games.",
      icon: "gamepad-variant",
    },
  ];

  return (
    <Screen scrollable>
      <Header title="Help & Support" showBackButton />

      <View style={styles.introContainer}>
        <Text style={styles.introText}>
          Find answers to common questions and get support
        </Text>
      </View>

      <Card style={styles.faqContainer}>
        <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>

        {faqs.map((item, idx) => (
          <View key={idx}>
            <List.Item
              title={item.question}
              titleStyle={styles.questionText}
              left={() => (
                <MaterialCommunityIcons
                  name={item.icon as any}
                  size={20}
                  color={colors.primary}
                  style={styles.icon}
                />
              )}
              right={() => (
                <MaterialCommunityIcons
                  name={expandedId === idx ? "chevron-up" : "chevron-down"}
                  size={24}
                  color={colors.text}
                />
              )}
              onPress={() => setExpandedId(expandedId === idx ? null : idx)}
              style={styles.faqItem}
            />

            {expandedId === idx && (
              <View style={styles.answerContainer}>
                <Text style={styles.answerText}>{item.answer}</Text>
              </View>
            )}

            {idx < faqs.length - 1 && <Divider style={styles.divider} />}
          </View>
        ))}
      </Card>

      <Card style={styles.contactCard}>
        <Text style={styles.sectionTitle}>Still Need Help?</Text>

        <List.Item
          title="Email Support"
          description="support@gamemate.com"
          left={() => (
            <MaterialCommunityIcons
              name="email"
              size={20}
              color={colors.primary}
            />
          )}
          titleStyle={styles.contactTitle}
          onPress={() => Linking.openURL("mailto:support@gamemate.com")}
        />

        <List.Item
          title="Discord Community"
          description="Join our community server"
          left={() => (
            <MaterialCommunityIcons
              name={"discord" as any}
              size={20}
              color={colors.primary}
            />
          )}
          titleStyle={styles.contactTitle}
          onPress={() => Linking.openURL("https://discord.com")}
        />

        <List.Item
          title="Twitter"
          description="@GameMateApp"
          left={() => (
            <MaterialCommunityIcons
              name={"twitter" as any}
              size={20}
              color={colors.primary}
            />
          )}
          titleStyle={styles.contactTitle}
          onPress={() => Linking.openURL("https://twitter.com/GameMateApp")}
        />
      </Card>

      <Card style={styles.infoCard}>
        <Text style={styles.infoText}>
          Version 1.0.0{"\n"}
          Last updated: January 2025
        </Text>
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  introContainer: {
    marginBottom: spacing.lg,
  },
  introText: {
    color: colors.textSecondary,
    fontSize: 14,
    lineHeight: 20,
  },
  faqContainer: {
    marginBottom: spacing.lg,
  },
  contactCard: {
    marginBottom: spacing.lg,
  },
  infoCard: {
    alignItems: "center",
    paddingVertical: spacing.md,
  },
  sectionTitle: {
    color: colors.primary,
    fontWeight: "700",
    fontSize: 12,
    textTransform: "uppercase",
    marginBottom: spacing.md,
    letterSpacing: 0.5,
  },
  faqItem: {
    paddingVertical: spacing.md,
  },
  icon: {
    marginRight: spacing.sm,
  },
  questionText: {
    color: colors.text,
    fontSize: 14,
    fontWeight: "600",
  },
  answerContainer: {
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    marginBottom: spacing.md,
  },
  answerText: {
    color: colors.textSecondary,
    fontSize: 13,
    lineHeight: 20,
  },
  divider: {
    backgroundColor: colors.border,
  },
  contactTitle: {
    color: colors.text,
    fontSize: 14,
    fontWeight: "600",
  },
  infoText: {
    color: colors.textSecondary,
    fontSize: 12,
    textAlign: "center",
  },
});
