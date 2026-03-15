import { useRouter } from "expo-router";
import React, { useState } from "react";
import { StyleSheet, View } from "react-native";
import { Button, Dialog, Portal, Text, TextInput } from "react-native-paper";
import { Header } from "../../src/components/ui/Header";
import { Screen } from "../../src/components/ui/Screen";
import { androidKeyboardCompatProps } from "../../src/lib/androidInput";
import { useResponsive } from "../../src/lib/responsive";
import { colors, spacing } from "../../src/lib/theme";

// AccountSettingsScreen: Change email, password, 2FA, delete account
// Backend integration: PUT /api/user/email, /api/user/password, /api/user/2fa, DELETE /api/user in Phase B

export default function AccountSettingsScreen() {
  const router = useRouter();
  const responsive = useResponsive();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [twoFAEnabled, setTwoFAEnabled] = useState(false);

  const [changeEmailDialogVisible, setChangeEmailDialogVisible] =
    useState(false);
  const [changePasswordDialogVisible, setChangePasswordDialogVisible] =
    useState(false);
  const [enable2FADialogVisible, setEnable2FADialogVisible] = useState(false);
  const [deleteAccountDialogVisible, setDeleteAccountDialogVisible] =
    useState(false);

  const handleChangeEmail = () => {
    // Mock: validate & submit
    setChangeEmailDialogVisible(false);
    setNewEmail("");
  };

  const handleChangePassword = () => {
    if (newPassword !== confirmPassword) {
      return;
    }
    // Mock: validate & submit
    setChangePasswordDialogVisible(false);
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
  };

  const handleToggle2FA = () => {
    setTwoFAEnabled(!twoFAEnabled);
    setEnable2FADialogVisible(false);
  };

  const handleDeleteAccount = () => {
    // Mock: delete account
    setDeleteAccountDialogVisible(false);
  };

  return (
    <Screen scrollable>
      <Header title="Account Settings" showBackButton onBack={() => router.replace("/(tabs)/settings")} />

      {/* Email Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <View>
            <Text style={[styles.label, { fontSize: responsive.bodySmallSize }]}>Current Email</Text>
            <Text style={[styles.value, { fontSize: responsive.bodySize + 2 }]}>user@example.com</Text>
          </View>
        </View>
        <Button
          mode="outlined"
          onPress={() => setChangeEmailDialogVisible(true)}
          labelStyle={styles.buttonLabel}
          style={styles.button}
        >
          Change Email
        </Button>
      </View>

      {/* Password Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <View>
            <Text style={[styles.label, { fontSize: responsive.bodySmallSize }]}>Password</Text>
            <Text style={[styles.value, { fontSize: responsive.bodySize + 2 }]}>••••••••</Text>
          </View>
        </View>
        <Button
          mode="outlined"
          onPress={() => setChangePasswordDialogVisible(true)}
          labelStyle={styles.buttonLabel}
          style={styles.button}
        >
          Change Password
        </Button>
      </View>

      {/* 2FA Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <View>
            <Text style={[styles.label, { fontSize: responsive.bodySmallSize }]}>Two-Factor Authentication</Text>
            <Text style={[styles.value, { fontSize: responsive.bodySize + 2 }]}>
              {twoFAEnabled ? "Enabled" : "Disabled"}
            </Text>
          </View>
        </View>
        <Button
          mode={twoFAEnabled ? "contained" : "outlined"}
          onPress={() => setEnable2FADialogVisible(true)}
          labelStyle={styles.buttonLabel}
          style={styles.button}
        >
          {twoFAEnabled ? "Disable 2FA" : "Enable 2FA"}
        </Button>
      </View>

      {/* Delete Account Section */}
      <View style={[styles.section, styles.dangerSection]}>
        <View style={styles.sectionHeader}>
          <View>
            <Text style={[styles.label, { color: colors.destructive, fontSize: responsive.bodySmallSize }]}>
              Delete Account
            </Text>
            <Text style={[styles.value, { fontSize: responsive.bodySize + 2 }]}>
              Permanently delete your account
            </Text>
          </View>
        </View>
        <Button
          mode="outlined"
          onPress={() => setDeleteAccountDialogVisible(true)}
          labelStyle={[styles.buttonLabel, { color: colors.destructive }]}
          style={styles.button}
          textColor={colors.destructive}
        >
          Delete Account
        </Button>
      </View>

      {/* Dialogs */}

      {/* Change Email Dialog */}
      <Portal>
        <Dialog
          visible={changeEmailDialogVisible}
          onDismiss={() => setChangeEmailDialogVisible(false)}
          style={styles.dialog}
        >
          <Dialog.Title style={[styles.dialogTitle, { fontSize: responsive.sectionTitleSize }]}>
            Change Email
          </Dialog.Title>
          <Dialog.Content>
            <TextInput
              label="New Email"
              value={newEmail}
              onChangeText={setNewEmail}
              keyboardType="email-address"
              {...androidKeyboardCompatProps}
              style={styles.input}
              placeholderTextColor={colors.textMuted}
              textColor={colors.text}
            />
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setChangeEmailDialogVisible(false)}>
              Cancel
            </Button>
            <Button onPress={handleChangeEmail} labelStyle={styles.buttonLabel}>
              Save
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      {/* Change Password Dialog */}
      <Portal>
        <Dialog
          visible={changePasswordDialogVisible}
          onDismiss={() => setChangePasswordDialogVisible(false)}
          style={styles.dialog}
        >
          <Dialog.Title style={[styles.dialogTitle, { fontSize: responsive.sectionTitleSize }]}>
            Change Password
          </Dialog.Title>
          <Dialog.Content>
            <TextInput
              label="Current Password"
              value={currentPassword}
              onChangeText={setCurrentPassword}
              secureTextEntry
              {...androidKeyboardCompatProps}
              style={styles.input}
              placeholderTextColor={colors.textMuted}
              textColor={colors.text}
            />
            <TextInput
              label="New Password"
              value={newPassword}
              onChangeText={setNewPassword}
              secureTextEntry
              {...androidKeyboardCompatProps}
              style={styles.input}
              placeholderTextColor={colors.textMuted}
              textColor={colors.text}
            />
            <TextInput
              label="Confirm Password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
              {...androidKeyboardCompatProps}
              style={styles.input}
              placeholderTextColor={colors.textMuted}
              textColor={colors.text}
            />
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setChangePasswordDialogVisible(false)}>
              Cancel
            </Button>
            <Button
              onPress={handleChangePassword}
              labelStyle={styles.buttonLabel}
            >
              Change
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      {/* Enable 2FA Dialog */}
      <Portal>
        <Dialog
          visible={enable2FADialogVisible}
          onDismiss={() => setEnable2FADialogVisible(false)}
          style={styles.dialog}
        >
          <Dialog.Title style={[styles.dialogTitle, { fontSize: responsive.sectionTitleSize }]}>
            {twoFAEnabled ? "Disable 2FA" : "Enable 2FA"}
          </Dialog.Title>
          <Dialog.Content>
            <View style={styles.dialogContent}>
              <Text style={[styles.dialogText, { fontSize: responsive.bodySize }]}>
                {twoFAEnabled
                  ? "Are you sure you want to disable two-factor authentication?"
                  : "Enhance your account security with two-factor authentication. You will need an authenticator app."}
              </Text>
            </View>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setEnable2FADialogVisible(false)}>
              Cancel
            </Button>
            <Button onPress={handleToggle2FA} labelStyle={styles.buttonLabel}>
              Confirm
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      {/* Delete Account Dialog */}
      <Portal>
        <Dialog
          visible={deleteAccountDialogVisible}
          onDismiss={() => setDeleteAccountDialogVisible(false)}
          style={styles.dialog}
        >
          <Dialog.Title
            style={[
              styles.dialogTitle,
              { color: colors.destructive, fontSize: responsive.sectionTitleSize },
            ]}
          >
            Delete Account
          </Dialog.Title>
          <Dialog.Content>
            <View style={styles.dialogContent}>
              <Text style={[styles.dialogText, { fontSize: responsive.bodySize }]}>
                This action is permanent and cannot be undone. All your data,
                groups, and messages will be deleted.
              </Text>
            </View>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setDeleteAccountDialogVisible(false)}>
              Cancel
            </Button>
            <Button
              onPress={handleDeleteAccount}
              labelStyle={[styles.buttonLabel, { color: colors.destructive }]}
              textColor={colors.destructive}
            >
              Delete
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </Screen>
  );
}

const styles = StyleSheet.create({
  section: {
    borderBottomWidth: 1,
    borderBottomColor: colors.card,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.md,
  },
  dangerSection: {
    backgroundColor: colors.card,
  },
  sectionHeader: {
    marginBottom: spacing.md,
  },
  label: {
    fontSize: 14,
    color: colors.textMuted,
    fontWeight: "500",
    marginBottom: spacing.xs,
  },
  value: {
    fontSize: 16,
    color: colors.text,
    fontWeight: "600",
  },
  button: {
    borderColor: colors.primary,
  },
  buttonLabel: {
    fontSize: 14,
    fontWeight: "600",
  },
  dialog: {
    backgroundColor: colors.card,
  },
  dialogTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: "700",
  },
  dialogContent: {
    alignItems: "center",
    paddingVertical: spacing.md,
  },
  dialogText: {
    color: colors.textMuted,
    fontSize: 14,
    lineHeight: 20,
    textAlign: "center",
  },
  input: {
    backgroundColor: colors.background,
    marginBottom: spacing.md,
  },
});
