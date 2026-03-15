import { useLocalSearchParams, useRouter } from "expo-router";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Alert, FlatList, Pressable, StyleSheet, TextInput, View } from "react-native";
import { Text } from "react-native-paper";
import {
  getGroupDetail,
  getGroupMembers,
  inviteGroupUser,
  joinGroup,
  leaveGroup,
  promoteGroupUser,
  type GroupItem,
  type GroupMember,
} from "../../services/groups";
import { Header } from "../../src/components/ui/Header";
import { Screen } from "../../src/components/ui/Screen";
import { useToast } from "../../src/components/ui/ToastProvider";
import { useAuth } from "../../src/context/AuthContext";
import { androidKeyboardCompatProps } from "../../src/lib/androidInput";
import { SESSION_EXPIRED_MESSAGE, isSessionExpiredMessage } from "../../src/lib/auth-messages";
import { useResponsive } from "../../src/lib/responsive";
import { colors, spacing } from "../../src/lib/theme";

type GroupDetailParams = {
  groupId?: string | string[];
};

function parseGroupId(value?: string | string[]) {
  const raw = Array.isArray(value) ? value[0] : value;
  if (!raw) return null;
  const normalized = raw.startsWith("s") ? raw.slice(1) : raw;
  const id = Number(normalized);
  return Number.isFinite(id) ? id : null;
}

type GroupTab = "overview" | "members";

export default function GroupDetailScreen() {
  const router = useRouter();
  const responsive = useResponsive();
  const params = useLocalSearchParams<GroupDetailParams>();
  const { accessToken, user, expireSession } = useAuth();
  const { showToast } = useToast();
  const [group, setGroup] = useState<GroupItem | null>(null);
  const [members, setMembers] = useState<GroupMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isSubmittingMembership, setIsSubmittingMembership] = useState(false);
  const [isSubmittingOwnerAction, setIsSubmittingOwnerAction] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const isSessionExpiredError = isSessionExpiredMessage(loadError);
  const [activeTab, setActiveTab] = useState<GroupTab>("overview");
  const [inviteInput, setInviteInput] = useState("");
  const [promoteInput, setPromoteInput] = useState("");
  const groupId = useMemo(() => parseGroupId(params.groupId), [params.groupId]);

  const isOwner = group?.owner?.username === user?.username;
  const isMember = useMemo(() => {
    const selfUsername = String(user?.username ?? "");
    if (!selfUsername) return false;
    return members.some((member) => member.username === selfUsername) || Boolean(isOwner);
  }, [isOwner, members, user?.username]);

  const loadGroup = useCallback(
    async (refresh = false) => {
      if (!accessToken) {
        setIsLoading(false);
        setLoadError(SESSION_EXPIRED_MESSAGE);
        return;
      }
      if (!groupId) {
        setIsLoading(false);
        setLoadError("Invalid group.");
        return;
      }

      if (refresh) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }

      setLoadError(null);
      try {
        const [groupDetail, memberRows] = await Promise.all([
          getGroupDetail(accessToken, groupId),
          getGroupMembers(accessToken, groupId),
        ]);
        setGroup(groupDetail);
        setMembers(memberRows);
      } catch (error) {
        setGroup(null);
        setMembers([]);
        setLoadError(error instanceof Error ? error.message : "Unable to load group.");
      } finally {
        if (refresh) {
          setIsRefreshing(false);
        } else {
          setIsLoading(false);
        }
      }
    },
    [accessToken, groupId],
  );

  useEffect(() => {
    void loadGroup();
  }, [loadGroup]);

  const handleJoin = useCallback(async () => {
    if (!accessToken || !groupId || !group || isSubmittingMembership) return;
    setIsSubmittingMembership(true);
    try {
      const result = await joinGroup(accessToken, groupId);
      showToast({ message: result.message ?? `${group.name} joined` });
      await loadGroup(true);
    } catch (error) {
      showToast({
        message: error instanceof Error ? error.message : "Unable to join this group.",
      });
    } finally {
      setIsSubmittingMembership(false);
    }
  }, [accessToken, group, groupId, isSubmittingMembership, loadGroup, showToast]);

  const handleLeave = useCallback(async () => {
    if (!accessToken || !groupId || !group || isSubmittingMembership) return;
    setIsSubmittingMembership(true);
    try {
      const result = await leaveGroup(accessToken, groupId);
      showToast({ message: result.message ?? "Group left." });
      await loadGroup(true);
      router.replace("/(tabs)/groups");
    } catch (error) {
      showToast({
        message: error instanceof Error ? error.message : "Unable to leave this group.",
      });
    } finally {
      setIsSubmittingMembership(false);
    }
  }, [accessToken, group, groupId, isSubmittingMembership, loadGroup, router, showToast]);

  const askLeaveGroup = useCallback(() => {
    if (!group) return;
    Alert.alert("Leave Group", `Leave "${group.name}"?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Leave",
        style: "destructive",
        onPress: () => {
          void handleLeave();
        },
      },
    ]);
  }, [group, handleLeave]);

  const handleInvite = useCallback(async () => {
    const normalized = inviteInput.trim();
    if (!accessToken || !groupId || !isOwner || !normalized || isSubmittingOwnerAction) {
      return;
    }
    setIsSubmittingOwnerAction(true);
    try {
      const result = await inviteGroupUser(accessToken, groupId, normalized);
      showToast({ message: result.message ?? "User invited successfully." });
      setInviteInput("");
      await loadGroup(true);
    } catch (error) {
      showToast({
        message: error instanceof Error ? error.message : "Unable to invite user.",
      });
    } finally {
      setIsSubmittingOwnerAction(false);
    }
  }, [accessToken, groupId, inviteInput, isOwner, isSubmittingOwnerAction, loadGroup, showToast]);

  const handlePromote = useCallback(async () => {
    const normalized = promoteInput.trim();
    if (!accessToken || !groupId || !isOwner || !normalized || isSubmittingOwnerAction) {
      return;
    }
    setIsSubmittingOwnerAction(true);
    try {
      const result = await promoteGroupUser(accessToken, groupId, normalized);
      showToast({ message: result.message ?? "User promoted to admin." });
      setPromoteInput("");
      await loadGroup(true);
    } catch (error) {
      showToast({
        message: error instanceof Error ? error.message : "Unable to promote user.",
      });
    } finally {
      setIsSubmittingOwnerAction(false);
    }
  }, [accessToken, groupId, isOwner, isSubmittingOwnerAction, loadGroup, promoteInput, showToast]);

  const tabButtons: Array<{ key: GroupTab; label: string }> = [
    { key: "overview", label: "Overview" },
    { key: "members", label: `Members (${members.length})` },
  ];

  return (
    <Screen scrollable={false}>
      <Header title={group?.name ?? "Group"} showBackButton />

      <View style={styles.tabSelector}>
        {tabButtons.map((tab) => (
          <Pressable
            key={tab.key}
            onPress={() => setActiveTab(tab.key)}
            style={({ pressed }) => [
              styles.tabButton,
              activeTab === tab.key && styles.tabButtonActive,
              pressed && styles.pressed,
            ]}
          >
            <Text style={[styles.tabText, activeTab === tab.key && styles.tabTextActive]}>
              {tab.label}
            </Text>
          </Pressable>
        ))}
      </View>

      {isLoading ? (
        <View style={styles.stateContainer}>
          <MaterialCommunityIcons name="progress-clock" size={44} color={colors.textSecondary} />
          <Text style={styles.stateText}>Loading group...</Text>
        </View>
      ) : loadError ? (
        <View style={styles.stateContainer}>
          <MaterialCommunityIcons name="alert-circle-outline" size={44} color={colors.destructive} />
          <Text style={styles.stateText}>{loadError}</Text>
          <Pressable
            onPress={() => {
              if (isSessionExpiredError) {
                void expireSession().finally(() => {
                  router.replace("/login" as any);
                });
                return;
              }
              void loadGroup();
            }}
            style={styles.retryButton}
          >
            <Text style={styles.retryText}>{isSessionExpiredError ? "Sign In" : "Retry"}</Text>
          </Pressable>
        </View>
      ) : !group ? (
        <View style={styles.stateContainer}>
          <MaterialCommunityIcons name="account-group-outline" size={44} color={colors.textSecondary} />
          <Text style={styles.stateText}>Group unavailable.</Text>
        </View>
      ) : activeTab === "overview" ? (
        <View style={styles.contentWrap}>
          <Text style={[styles.groupName, { fontSize: responsive.sectionTitleSize }]}>{group.name}</Text>
          <Text style={[styles.groupSubtitle, { fontSize: responsive.bodySmallSize }]}>
            {group.is_private ? "Private group" : "Public group"} · Owner: {group.owner.username}
          </Text>

          <View style={styles.statRow}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{members.length}</Text>
              <Text style={styles.statLabel}>Members</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{group.member_count}</Text>
              <Text style={styles.statLabel}>Total</Text>
            </View>
          </View>

          <Text style={[styles.sectionTitle, { fontSize: responsive.bodySize }]}>Description</Text>
          <Text style={[styles.groupDescription, { fontSize: responsive.bodySmallSize }]}>
            {group.description?.trim().length ? group.description : "No description provided yet."}
          </Text>

          <View style={styles.actionRow}>
            {isOwner ? (
              <View style={styles.ownerBadge}>
                <MaterialCommunityIcons name="shield-account" size={16} color={colors.primary} />
                <Text style={styles.ownerBadgeText}>You are owner</Text>
              </View>
            ) : isMember ? (
              <Pressable
                onPress={askLeaveGroup}
                disabled={isSubmittingMembership}
                style={({ pressed }) => [
                  styles.leaveButton,
                  isSubmittingMembership && styles.disabledButton,
                  pressed && styles.pressed,
                ]}
              >
                <Text style={styles.leaveButtonText}>{isSubmittingMembership ? "Leaving..." : "Leave Group"}</Text>
              </Pressable>
            ) : (
              group.is_private ? (
                <View style={styles.privateBadge}>
                  <MaterialCommunityIcons name="lock-outline" size={16} color={colors.textSecondary} />
                  <Text style={styles.privateBadgeText}>Invite required</Text>
                </View>
              ) : (
                <Pressable
                  onPress={() => void handleJoin()}
                  disabled={isSubmittingMembership}
                  style={({ pressed }) => [
                    styles.joinButton,
                    isSubmittingMembership && styles.disabledButton,
                    pressed && styles.pressed,
                  ]}
                >
                  <Text style={styles.joinButtonText}>{isSubmittingMembership ? "Joining..." : "Join Group"}</Text>
                </Pressable>
              )
            )}

            <Pressable
              onPress={() => {
                void loadGroup(true);
              }}
              style={({ pressed }) => [styles.refreshButton, pressed && styles.pressed]}
            >
              <MaterialCommunityIcons name="refresh" size={16} color={colors.text} />
              <Text style={styles.refreshButtonText}>Refresh</Text>
            </Pressable>
          </View>
        </View>
      ) : (
        <FlatList
          data={members}
          keyExtractor={(item) => `${item.user_id}`}
          onRefresh={() => {
            void loadGroup(true);
          }}
          refreshing={isRefreshing}
          ListHeaderComponent={
            isOwner ? (
              <View style={styles.ownerTools}>
                <Text style={[styles.sectionTitle, { fontSize: responsive.bodySize }]}>Owner Tools</Text>
                <View style={styles.ownerFormRow}>
                  <TextInput
                    style={[styles.ownerInput, { fontSize: responsive.bodySmallSize }]}
                    placeholder="Invite by username or email"
                    placeholderTextColor={colors.textMuted}
                    value={inviteInput}
                    onChangeText={setInviteInput}
                    {...androidKeyboardCompatProps}
                    autoCapitalize="none"
                  />
                  <Pressable
                    onPress={() => {
                      void handleInvite();
                    }}
                    disabled={isSubmittingOwnerAction || inviteInput.trim().length === 0}
                    style={({ pressed }) => [
                      styles.ownerActionButton,
                      (isSubmittingOwnerAction || inviteInput.trim().length === 0) && styles.disabledButton,
                      pressed && styles.pressed,
                    ]}
                  >
                    <Text style={styles.ownerActionButtonText}>Invite</Text>
                  </Pressable>
                </View>

                <View style={styles.ownerFormRow}>
                  <TextInput
                    style={[styles.ownerInput, { fontSize: responsive.bodySmallSize }]}
                    placeholder="Promote username to admin"
                    placeholderTextColor={colors.textMuted}
                    value={promoteInput}
                    onChangeText={setPromoteInput}
                    {...androidKeyboardCompatProps}
                    autoCapitalize="none"
                  />
                  <Pressable
                    onPress={() => {
                      void handlePromote();
                    }}
                    disabled={isSubmittingOwnerAction || promoteInput.trim().length === 0}
                    style={({ pressed }) => [
                      styles.ownerActionButton,
                      (isSubmittingOwnerAction || promoteInput.trim().length === 0) && styles.disabledButton,
                      pressed && styles.pressed,
                    ]}
                  >
                    <Text style={styles.ownerActionButtonText}>Promote</Text>
                  </Pressable>
                </View>
              </View>
            ) : null
          }
          renderItem={({ item }) => (
            <Pressable
              style={styles.memberItem}
              onPress={() =>
                router.push({
                  pathname: "/(tabs)/user-profile",
                  params: {
                    userId: String(item.user_id),
                    name: item.username,
                  },
                })
              }
            >
              <View style={styles.memberAvatar}>
                <MaterialCommunityIcons name="account" size={18} color={colors.primary} />
              </View>
              <View style={styles.memberInfo}>
                <Text style={[styles.memberName, { fontSize: responsive.bodySize }]}>{item.username}</Text>
                <Text style={[styles.memberMeta, { fontSize: responsive.captionSize }]}>
                  {item.role.charAt(0).toUpperCase() + item.role.slice(1)}
                </Text>
              </View>
              {item.role === "owner" ? (
                <View style={styles.roleBadge}>
                  <Text style={styles.roleBadgeText}>Owner</Text>
                </View>
              ) : item.role === "admin" ? (
                <View style={styles.roleBadge}>
                  <Text style={styles.roleBadgeText}>Admin</Text>
                </View>
              ) : null}
            </Pressable>
          )}
          ListEmptyComponent={
            <View style={styles.stateContainer}>
              <MaterialCommunityIcons name="account-group-outline" size={44} color={colors.textSecondary} />
              <Text style={styles.stateText}>No members found.</Text>
            </View>
          }
          contentContainerStyle={styles.membersContent}
        />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  pressed: {
    opacity: 0.8,
  },
  tabSelector: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    marginBottom: spacing.md,
  },
  tabButton: {
    flex: 1,
    alignItems: "center",
    paddingVertical: spacing.sm,
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
  },
  tabButtonActive: {
    borderBottomColor: colors.primary,
  },
  tabText: {
    color: colors.textMuted,
    fontWeight: "600",
  },
  tabTextActive: {
    color: colors.primary,
  },
  stateContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
  },
  stateText: {
    color: colors.textSecondary,
    textAlign: "center",
  },
  retryButton: {
    marginTop: spacing.sm,
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: 10,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xs,
  },
  retryText: {
    color: colors.primary,
    fontWeight: "700",
  },
  contentWrap: {
    flex: 1,
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
  },
  groupName: {
    color: colors.text,
    fontWeight: "800",
  },
  groupSubtitle: {
    color: colors.textSecondary,
    marginTop: 4,
  },
  statRow: {
    flexDirection: "row",
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  statItem: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    alignItems: "center",
    paddingVertical: spacing.sm,
  },
  statValue: {
    color: colors.text,
    fontWeight: "800",
    fontSize: 16,
  },
  statLabel: {
    color: colors.textSecondary,
    fontSize: 12,
    marginTop: 2,
  },
  sectionTitle: {
    color: colors.textSecondary,
    fontWeight: "700",
    marginTop: spacing.md,
  },
  groupDescription: {
    color: colors.textSecondary,
    marginTop: spacing.xs,
    lineHeight: 20,
  },
  actionRow: {
    marginTop: spacing.lg,
    flexDirection: "row",
    gap: spacing.sm,
    alignItems: "center",
  },
  joinButton: {
    flex: 1,
    minHeight: 42,
    borderRadius: 12,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  joinButtonText: {
    color: "#1A1A1A",
    fontWeight: "800",
  },
  leaveButton: {
    flex: 1,
    minHeight: 42,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.destructive,
    alignItems: "center",
    justifyContent: "center",
  },
  leaveButtonText: {
    color: colors.destructive,
    fontWeight: "700",
  },
  disabledButton: {
    opacity: 0.5,
  },
  privateBadge: {
    flex: 1,
    minHeight: 42,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: spacing.xs,
  },
  privateBadgeText: {
    color: colors.textSecondary,
    fontWeight: "700",
  },
  ownerBadge: {
    flex: 1,
    minHeight: 42,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: spacing.xs,
  },
  ownerBadgeText: {
    color: colors.primary,
    fontWeight: "700",
  },
  refreshButton: {
    minHeight: 42,
    paddingHorizontal: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: spacing.xs,
  },
  refreshButtonText: {
    color: colors.text,
    fontWeight: "600",
  },
  ownerTools: {
    paddingBottom: spacing.md,
  },
  ownerFormRow: {
    flexDirection: "row",
    gap: spacing.sm,
    marginTop: spacing.sm,
    alignItems: "center",
  },
  ownerInput: {
    flex: 1,
    minHeight: 40,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    color: colors.text,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  ownerActionButton: {
    minWidth: 92,
    minHeight: 40,
    borderRadius: 10,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.md,
  },
  ownerActionButtonText: {
    color: "#1A1A1A",
    fontWeight: "800",
    fontSize: 12,
    textTransform: "uppercase",
  },
  membersContent: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
    flexGrow: 1,
  },
  memberItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  memberAvatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.surface,
  },
  memberInfo: {
    flex: 1,
  },
  memberName: {
    color: colors.text,
    fontWeight: "600",
  },
  memberMeta: {
    color: colors.textSecondary,
    marginTop: 2,
  },
  roleBadge: {
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: 999,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
  },
  roleBadgeText: {
    color: colors.primary,
    fontWeight: "700",
    fontSize: 11,
  },
});
