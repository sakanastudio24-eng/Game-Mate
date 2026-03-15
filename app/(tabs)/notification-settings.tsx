import { useRouter } from "expo-router";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import React, { useCallback, useMemo } from "react";
import { StyleSheet, View } from "react-native";
import { List, Switch, Text } from "react-native-paper";
import { Card } from "../../src/components/ui/Card";
import { Chip } from "../../src/components/ui/Chip";
import { Header } from "../../src/components/ui/Header";
import { Screen } from "../../src/components/ui/Screen";
import { useLocalCache } from "../../src/lib/hooks/useLocalCache";
import { useResponsive } from "../../src/lib/responsive";
import { colors, spacing } from "../../src/lib/theme";

type NotificationToggleKey =
  | "friendRequests"
  | "groupInvites"
  | "messages"
  | "friendActivity"
  | "friendOnline"
  | "matchmaking"
  | "achievements";

type DeliveryFlow = "instant" | "batch_30m" | "hourly_digest";
type NotificationPreset = "minimal" | "balanced" | "all";
type TimeSheetPreset = "off" | "night" | "day" | "focus";

interface NotificationPreferences {
  preset: NotificationPreset;
  deliveryFlow: DeliveryFlow;
  timeSheetPreset: TimeSheetPreset;
  activeDays: string[];
  quietStart: string;
  quietEnd: string;
  settings: Record<NotificationToggleKey, boolean>;
}

const WEEK_DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const;

const NOTIFICATION_PRESET_MAP: Record<
  NotificationPreset,
  Record<NotificationToggleKey, boolean>
> = {
  minimal: {
    friendRequests: true,
    groupInvites: true,
    messages: true,
    friendActivity: false,
    friendOnline: false,
    matchmaking: true,
    achievements: false,
  },
  balanced: {
    friendRequests: true,
    groupInvites: true,
    messages: true,
    friendActivity: true,
    friendOnline: true,
    matchmaking: true,
    achievements: true,
  },
  all: {
    friendRequests: true,
    groupInvites: true,
    messages: true,
    friendActivity: true,
    friendOnline: true,
    matchmaking: true,
    achievements: true,
  },
};

const TIME_SHEET_PRESETS: Record<
  TimeSheetPreset,
  { label: string; quietStart: string; quietEnd: string; activeDays: string[] }
> = {
  off: {
    label: "Always On",
    quietStart: "00:00",
    quietEnd: "00:00",
    activeDays: [...WEEK_DAYS],
  },
  night: {
    label: "Night Focus",
    quietStart: "22:00",
    quietEnd: "08:00",
    activeDays: [...WEEK_DAYS],
  },
  day: {
    label: "Day Focus",
    quietStart: "09:00",
    quietEnd: "17:00",
    activeDays: ["Mon", "Tue", "Wed", "Thu", "Fri"],
  },
  focus: {
    label: "Weekend Focus",
    quietStart: "11:00",
    quietEnd: "18:00",
    activeDays: ["Sat", "Sun"],
  },
};

const NOTIFICATION_SECTIONS: Array<{
  title: string;
  items: Array<{
    key: NotificationToggleKey;
    title: string;
    description: string;
    icon: string;
  }>;
}> = [
  {
    title: "Social",
    items: [
      {
        key: "friendRequests",
        title: "Friend Requests",
        description: "New friend request received",
        icon: "account-plus-outline",
      },
      {
        key: "friendOnline",
        title: "Friend Online",
        description: "Your friend is now online",
        icon: "account-check-outline",
      },
      {
        key: "friendActivity",
        title: "Friend Activity",
        description: "Friends joined or created groups",
        icon: "account-group-outline",
      },
      {
        key: "messages",
        title: "Direct Messages",
        description: "You received a new message",
        icon: "message-text-outline",
      },
    ],
  },
  {
    title: "Groups",
    items: [
      {
        key: "groupInvites",
        title: "Group Invites",
        description: "You were invited to a group",
        icon: "account-multiple-plus-outline",
      },
      {
        key: "matchmaking",
        title: "Matchmaking",
        description: "Group matchmaking starts or completes",
        icon: "sword-cross",
      },
    ],
  },
  {
    title: "Achievements",
    items: [
      {
        key: "achievements",
        title: "Achievements",
        description: "You unlocked a new achievement",
        icon: "trophy-award",
      },
    ],
  },
];

const INITIAL_PREFERENCES: NotificationPreferences = {
  preset: "balanced",
  deliveryFlow: "instant",
  timeSheetPreset: "off",
  activeDays: [...WEEK_DAYS],
  quietStart: "00:00",
  quietEnd: "00:00",
  settings: { ...NOTIFICATION_PRESET_MAP.balanced },
};

export default function NotificationSettingsScreen() {
  const router = useRouter();
  const responsive = useResponsive();
  const { value: notifPrefs, setValue: setNotifPrefs } = useLocalCache<NotificationPreferences>(
    "settings:notification-preferences:v2",
    INITIAL_PREFERENCES,
  );

  const toggleSetting = useCallback(
    (key: NotificationToggleKey) => {
      setNotifPrefs((previous) => ({
        ...previous,
        preset: "balanced",
        settings: {
          ...previous.settings,
          [key]: !previous.settings[key],
        },
      }));
    },
    [setNotifPrefs],
  );

  const applyPreset = useCallback(
    (preset: NotificationPreset) => {
      setNotifPrefs((previous) => ({
        ...previous,
        preset,
        settings: { ...NOTIFICATION_PRESET_MAP[preset] },
      }));
    },
    [setNotifPrefs],
  );

  const applyDeliveryFlow = useCallback(
    (deliveryFlow: DeliveryFlow) => {
      setNotifPrefs((previous) => ({
        ...previous,
        deliveryFlow,
      }));
    },
    [setNotifPrefs],
  );

  const applyTimeSheetPreset = useCallback(
    (preset: TimeSheetPreset) => {
      const config = TIME_SHEET_PRESETS[preset];
      setNotifPrefs((previous) => ({
        ...previous,
        timeSheetPreset: preset,
        quietStart: config.quietStart,
        quietEnd: config.quietEnd,
        activeDays: [...config.activeDays],
      }));
    },
    [setNotifPrefs],
  );

  const toggleDay = useCallback(
    (day: string) => {
      setNotifPrefs((previous) => {
        const hasDay = previous.activeDays.includes(day);
        const nextDays = hasDay
          ? previous.activeDays.filter((item) => item !== day)
          : [...previous.activeDays, day];
        return {
          ...previous,
          timeSheetPreset: "focus",
          activeDays: nextDays,
        };
      });
    },
    [setNotifPrefs],
  );

  const flowSummary = useMemo(() => {
    if (notifPrefs.deliveryFlow === "instant") return "Instant delivery";
    if (notifPrefs.deliveryFlow === "batch_30m") return "Batch every 30 minutes";
    return "Hourly digest";
  }, [notifPrefs.deliveryFlow]);

  const timeSheetSummary = useMemo(() => {
    if (notifPrefs.timeSheetPreset === "off") {
      return "Notifications can arrive any time.";
    }
    const dayLabel = notifPrefs.activeDays.length
      ? notifPrefs.activeDays.join(", ")
      : "No days selected";
    return `Quiet hours ${notifPrefs.quietStart}-${notifPrefs.quietEnd} on ${dayLabel}.`;
  }, [notifPrefs.activeDays, notifPrefs.quietEnd, notifPrefs.quietStart, notifPrefs.timeSheetPreset]);

  return (
    <Screen scrollable>
      <Header title="Notifications" showBackButton onBack={() => router.replace("/(tabs)/settings")} />

      <Card style={styles.section}>
        <Text accessibilityRole="header" style={[styles.sectionTitle, { fontSize: responsive.captionSize }]}>
          Presets
        </Text>
        <Text style={[styles.sectionCopy, { fontSize: responsive.bodySmallSize }]}>
          Pick a base notification profile, then fine-tune below.
        </Text>
        <View style={styles.chipRow}>
          {(["minimal", "balanced", "all"] as NotificationPreset[]).map((preset) => (
            <Chip
              key={preset}
              label={preset === "all" ? "All Alerts" : preset[0].toUpperCase() + preset.slice(1)}
              selected={notifPrefs.preset === preset}
              onPress={() => applyPreset(preset)}
              style={styles.controlChip}
              accessibilityLabel={`Notification preset ${preset}`}
            />
          ))}
        </View>
      </Card>

      <Card style={styles.section}>
        <Text accessibilityRole="header" style={[styles.sectionTitle, { fontSize: responsive.captionSize }]}>
          Delivery Flow
        </Text>
        <Text style={[styles.sectionCopy, { fontSize: responsive.bodySmallSize }]}>{flowSummary}</Text>
        <View style={styles.chipRow}>
          <Chip
            label="Instant"
            selected={notifPrefs.deliveryFlow === "instant"}
            onPress={() => applyDeliveryFlow("instant")}
            style={styles.controlChip}
            accessibilityLabel="Instant notification flow"
          />
          <Chip
            label="30m Batch"
            selected={notifPrefs.deliveryFlow === "batch_30m"}
            onPress={() => applyDeliveryFlow("batch_30m")}
            style={styles.controlChip}
            accessibilityLabel="30 minute batch notification flow"
          />
          <Chip
            label="Hourly Digest"
            selected={notifPrefs.deliveryFlow === "hourly_digest"}
            onPress={() => applyDeliveryFlow("hourly_digest")}
            style={styles.controlChip}
            accessibilityLabel="Hourly digest notification flow"
          />
        </View>
      </Card>

      <Card style={styles.section}>
        <Text accessibilityRole="header" style={[styles.sectionTitle, { fontSize: responsive.captionSize }]}>
          Time Sheet
        </Text>
        <Text style={[styles.sectionCopy, { fontSize: responsive.bodySmallSize }]}>{timeSheetSummary}</Text>

        <View style={styles.chipRow}>
          {(["off", "night", "day", "focus"] as TimeSheetPreset[]).map((preset) => (
            <Chip
              key={preset}
              label={TIME_SHEET_PRESETS[preset].label}
              selected={notifPrefs.timeSheetPreset === preset}
              onPress={() => applyTimeSheetPreset(preset)}
              size="small"
              style={styles.controlChip}
              accessibilityLabel={`${TIME_SHEET_PRESETS[preset].label} time sheet preset`}
            />
          ))}
        </View>

        <Text style={[styles.subTitle, { fontSize: responsive.captionSize }]}>Active Days</Text>
        <View style={styles.chipRow}>
          {WEEK_DAYS.map((day) => (
            <Chip
              key={day}
              label={day}
              selected={notifPrefs.activeDays.includes(day)}
              onPress={() => toggleDay(day)}
              size="small"
              style={styles.dayChip}
              accessibilityLabel={`${day} notification active day`}
            />
          ))}
        </View>
      </Card>

      {NOTIFICATION_SECTIONS.map((section) => (
        <Card key={section.title} style={styles.section}>
          <Text accessibilityRole="header" style={[styles.sectionTitle, { fontSize: responsive.captionSize }]}>
            {section.title}
          </Text>

          {section.items.map((item) => (
            <List.Item
              key={item.key}
              title={item.title}
              description={item.description}
              titleStyle={[styles.listTitle, { fontSize: responsive.bodySize }]}
              left={() => (
                <MaterialCommunityIcons
                  name={item.icon as any}
                  size={20}
                  color={colors.primary}
                  style={styles.listIcon}
                />
              )}
              right={() => (
                <Switch
                  value={notifPrefs.settings[item.key]}
                  onValueChange={() => toggleSetting(item.key)}
                  color={colors.primary}
                  accessibilityLabel={`${item.title} notifications`}
                />
              )}
              onPress={() => toggleSetting(item.key)}
            />
          ))}
        </Card>
      ))}
    </Screen>
  );
}

const styles = StyleSheet.create({
  section: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    color: colors.primary,
    fontWeight: "700",
    fontSize: 12,
    textTransform: "uppercase",
    marginBottom: spacing.xs,
    letterSpacing: 0.5,
  },
  subTitle: {
    color: colors.textSecondary,
    fontWeight: "700",
    fontSize: 11,
    textTransform: "uppercase",
    marginTop: spacing.sm,
    marginBottom: spacing.xs,
  },
  sectionCopy: {
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.xs,
    marginBottom: spacing.xs,
  },
  controlChip: {
    marginBottom: spacing.xs,
  },
  dayChip: {
    minWidth: 52,
    alignItems: "center",
  },
  listTitle: {
    color: colors.text,
    fontSize: 14,
  },
  listIcon: {
    marginTop: 2,
  },
});
