/**
 * @module toasts
 * @description Centralised toast notification helper library for Game Mate.
 *
 * All functions wrap Sonner's `toast` with:
 *   - A semantically appropriate icon (Lucide)
 *   - A consistent display duration
 *   - Optional description text
 *
 * Import specific functions rather than calling `toast` directly in screens.
 * This keeps toast appearance consistent across the app and makes it easy
 * to globally change icons, durations, or styling in one place.
 *
 * Usage:
 *   import { showSuccessToast, showErrorToast } from '../utils/toasts';
 *   showSuccessToast('Profile saved', 'Your changes are live');
 *
 * @iosEquivalent Custom ToastView.swift + AlertToast package
 * @see docs/COMPONENTS.md — utils/toasts.tsx section
 */
import { toast } from 'sonner';
import { CheckCircle, XCircle, Info, AlertTriangle, Gamepad2, Shield, Mail, Phone, Link as LinkIcon, Download, Share2, Crown, UserCheck } from 'lucide-react';

// ─── Success Toasts ────────────────────────────────────────────────────────

/** Generic success confirmation with optional description */
export const showSuccessToast = (message: string, description?: string) => {
  toast.success(message, {
    description,
    icon: <CheckCircle className="w-5 h-5" />
  });
};

/** Shown immediately after onboarding completes — first main-app entry */
export const showWelcomeToast = () => {
  toast.success('Welcome to Game Mate!', {
    description: 'Start connecting with gamers and join groups',
    duration: 3000,
    icon: <Gamepad2 className="w-5 h-5" />
  });
};

/** Shown after CreateGroupScreen submits successfully */
export const showGroupCreatedToast = () => {
  toast.success('Group created successfully!', {
    description: 'Your group is now live',
    duration: 2000,
    icon: <Crown className="w-5 h-5" />
  });
};

/** Shown after EditProfileScreen saves */
export const showProfileUpdatedToast = () => {
  toast.success('Profile updated successfully!', {
    duration: 2000,
    icon: <CheckCircle className="w-5 h-5" />
  });
};

/** Shown after tapping "Add Friend" on a user profile */
export const showFriendRequestSentToast = () => {
  toast.success('Friend request sent!', {
    duration: 2000,
    icon: <UserCheck className="w-5 h-5" />
  });
};

/** Shown after joining a public group from DiscoverGroupsScreen */
export const showGroupJoinedToast = (groupName: string) => {
  toast.success(`Joined ${groupName}!`, {
    description: 'You can now access group features',
    duration: 2000,
    icon: <CheckCircle className="w-5 h-5" />
  });
};

/** Shown after a platform (Discord, Steam, etc.) is connected in AccountSettingsScreen */
export const showConnectedToast = (platform: string) => {
  toast.success(`${platform} connected!`, {
    duration: 2000,
    icon: <CheckCircle className="w-5 h-5" />
  });
};

// ─── Link & Copy Toasts ────────────────────────────────────────────────────

/** Shown after copying any URL to clipboard */
export const showLinkCopiedToast = () => {
  toast.success('Link copied to clipboard!', {
    duration: 2000,
    icon: <LinkIcon className="w-5 h-5" />
  });
};

/** Shown after copying the QR code profile link */
export const showProfileLinkCopiedToast = () => {
  toast.success('Profile link copied!', {
    duration: 2000,
    icon: <LinkIcon className="w-5 h-5" />
  });
};

// ─── Download Toasts ──────────────────────────────────────────────────────

/** Shown after the user taps "Save" on the QR code */
export const showQRDownloadedToast = () => {
  toast.success('QR code downloaded!', {
    duration: 2000,
    icon: <Download className="w-5 h-5" />
  });
};

/** Shown after initiating data export in AccountSettingsScreen */
export const showDataExportToast = () => {
  toast.success('Data export started!', {
    icon: <Download className="w-5 h-5" />
  });
};

// ─── Share Toasts ─────────────────────────────────────────────────────────

/** Shown after sharing content to a specific friend via ShareSheet */
export const showSharedToast = (name: string) => {
  toast.success(`Shared with ${name}!`, {
    duration: 2000,
    icon: <Share2 className="w-5 h-5" />
  });
};

// ─── Security Toasts ──────────────────────────────────────────────────────

/** Shown when the 2FA toggle changes in AccountSettingsScreen */
export const show2FAToast = (enabled: boolean) => {
  toast.success(enabled ? '2FA enabled!' : '2FA disabled', {
    duration: 2000,
    icon: <Shield className="w-5 h-5" />
  });
};

/** Shown after a successful password change in ChangePasswordScreen */
export const showPasswordChangedToast = () => {
  toast.success('Password changed successfully!', {
    description: 'Your password has been updated',
    duration: 3000,
    icon: <Shield className="w-5 h-5" />
  });
};

// ─── Email & Phone Toasts ─────────────────────────────────────────────────

/** Shown after the verification code is sent to a new email in ChangeEmailScreen */
export const showEmailVerificationToast = () => {
  toast.success('Verification code sent!', {
    description: 'Check your new email inbox',
    duration: 3000,
    icon: <Mail className="w-5 h-5" />
  });
};

/** Shown after the email change is confirmed */
export const showEmailChangedToast = () => {
  toast.success('Email changed successfully!', {
    description: 'Your email has been updated',
    duration: 3000,
    icon: <Mail className="w-5 h-5" />
  });
};

/** Shown after the SMS code is sent in VerifyPhoneScreen step 1 */
export const showPhoneVerificationToast = () => {
  toast.success('Verification code sent!', {
    description: 'Check your SMS messages',
    duration: 3000,
    icon: <Phone className="w-5 h-5" />
  });
};

/** Shown after the OTP is verified in VerifyPhoneScreen step 2 */
export const showPhoneVerifiedToast = () => {
  toast.success('Phone verified successfully!', {
    description: 'Your phone number has been verified',
    duration: 3000,
    icon: <Phone className="w-5 h-5" />
  });
};

// ─── Settings Toasts ──────────────────────────────────────────────────────

/** Shown after selecting a new accent colour in AppearanceSettingsScreen */
export const showAccentColorUpdatedToast = () => {
  toast.success('Accent color updated!', {
    duration: 1500,
    icon: <CheckCircle className="w-5 h-5" />
  });
};

/** Shown while initiating an OAuth connection from WelcomeScreen */
export const showConnectingToast = (platform: string) => {
  toast.success(`Connecting to ${platform}...`, {
    description: 'This will redirect you to sign in',
    duration: 2500,
    icon: <Info className="w-5 h-5" />
  });
};

// ─── Error / Warning / Info Toasts ───────────────────────────────────────

/** Generic error toast — use for API failures, validation errors */
export const showErrorToast = (message: string, description?: string) => {
  toast.error(message, {
    description,
    icon: <XCircle className="w-5 h-5" />
  });
};

/** Warning-level toast — use for non-blocking cautions */
export const showWarningToast = (message: string, description?: string) => {
  toast.error(message, {
    description,
    icon: <AlertTriangle className="w-5 h-5" />
  });
};

/** Informational toast — use for tips, confirmations, neutral messages */
export const showInfoToast = (message: string, description?: string) => {
  toast.info(message, {
    description,
    icon: <Info className="w-5 h-5" />
  });
};