# Component Catalog

Full reference for every exported component in Game Mate.

---

## App.tsx — Root

**Purpose:** Root component. Owns all navigation state, renders the active screen, and mounts the `BottomNav` and `Toaster`.

| Prop | Type | Description |
|------|------|-------------|
| — | — | No external props; this is the tree root |

### State

| Variable | Type | Default | Purpose |
|---|---|---|---|
| `currentScreen` | `string` | `'welcome'` | Active screen key |
| `screenData` | `any` | `null` | Data payload passed to child screen |
| `hasCompletedOnboarding` | `boolean` | `false` | Gates tab-bar + main app access |
| `previousScreen` | `string` | `''` | Used for dynamic back targets |

### Key Functions

| Function | Signature | Description |
|---|---|---|
| `handleNavigate` | `(screen: string, data?: any) => void` | Push a new screen, optionally with data |
| `handleBack` | `() => void` | Pop current screen using static back-map |
| `handleOnboardingNext` | `(nextScreen: string) => void` | Advance the onboarding wizard; `'main'` completes it |
| `handleCreateGroup` | `() => void` | Called when `CreateGroupScreen` submits; shows toast, returns to groups |
| `renderScreen` | `() => JSX.Element` | Selects and returns the correct screen component for `currentScreen` |

---

## BottomNav.tsx

**Purpose:** Persistent tab bar rendered over all main-app screens.

| Prop | Type | Description |
|---|---|---|
| `activeScreen` | `string` | Current screen key — highlights the matching tab |
| `onNavigate` | `(screen: string) => void` | Called when user taps a tab |

### Tab Items

| ID | Label | Icon |
|---|---|---|
| `news` | News | `Newspaper` (Lucide) |
| `groups` | Groups | `Users` (Lucide) |
| `social` | Social | `MessageCircle` (Lucide) |
| `profile` | Profile | `User` (Lucide) |

---

## WelcomeScreen.tsx

**Purpose:** First screen of the onboarding flow. Presents authentication options.

| Prop | Type | Description |
|---|---|---|
| `onNext` | `() => void` | Called when any auth method is selected/completed |

### Key Functions

| Function | Description |
|---|---|
| `handleSocialAuth(platform)` | Simulates OAuth redirect, shows connecting toast, then calls `onNext` after 2s |

---

## OnboardingEmail.tsx

**Purpose:** Step 1 of 3 in account creation. Collects user's email address.

| Prop | Type | Description |
|---|---|---|
| `onNext` | `() => void` | Called when email is valid and user taps Next |

### State

| Variable | Purpose |
|---|---|
| `email` | Controlled input value |
| `acceptEmails` | Opt-in checkbox for marketing emails |

### Validation

- `onNext` button only activates when `email.includes('@')` is true.
- Green check icon animates in when the email format is valid.

---

## OnboardingBirthdate.tsx

**Purpose:** Step 2 of 3. Collects date of birth and Terms of Service acceptance.

| Prop | Type | Description |
|---|---|---|
| `onNext` | `() => void` | Called when ToS is accepted and user taps Next |

### State

| Variable | Purpose |
|---|---|
| `birthdate` | Date string (`MM/DD/YYYY`) |
| `acceptTerms` | Required checkbox — gates the Next button |

---

## OnboardingPreferences.tsx

**Purpose:** Step 3 of 3. Collects gaming genre preferences (up to 5) and primary play style.

| Prop | Type | Description |
|---|---|---|
| `onNext` | `() => void` | Called when valid selections exist |

### State

| Variable | Purpose |
|---|---|
| `selectedGenres` | `string[]` — IDs of chosen genres (max 5) |
| `selectedPlayStyle` | `string` — ID of chosen play style |

### Key Functions

| Function | Description |
|---|---|
| `handleGenreToggle(id)` | Toggle a genre; shows toast if user tries to exceed 5 |
| `handlePlayStyleSelect(id)` | Sets the single active play style |
| `handleContinue()` | Validates selections then calls `onNext` |

### Genre Options

`fps` · `rpg` · `moba` · `battle-royale` · `mmo` · `sports` · `racing` · `strategy`

### Play Style Options

`casual` · `competitive` · `social` · `achievement`

---

## NewsScreen.tsx

**Purpose:** Main tab 1. Gaming news feed with category filtering, like, and save interactions.

| Prop | Type | Description |
|---|---|---|
| `onNavigate` | `(screen: string) => void` | Navigate to sub-screens (e.g. `'qr'`) |

### State

| Variable | Purpose |
|---|---|
| `activeCategory` | Filter key: `fyp` \| `esports` \| `patches` \| `streams` |
| `likedPosts` | `number[]` — IDs of liked posts |
| `savedPosts` | `number[]` — IDs of bookmarked posts |

### Post Card Actions

| Action | Icon | Behaviour |
|---|---|---|
| Like | `Heart` | Toggles `likedPosts` |
| Comment | `MessageCircle` | No-op (placeholder) |
| Bookmark | `Bookmark` | Toggles `savedPosts` |
| Share | `Share2` | Opens `ShareSheet` |

---

## GroupsScreen.tsx

**Purpose:** Main tab 2. Shows the user's active groups; navigation to create/discover groups.

| Prop | Type | Description |
|---|---|---|
| `onNavigate` | `(screen: string, data?: any) => void` | Navigate to sub-screens; passes group object for `'group-detail'` |

---

## GroupDetailScreen.tsx

**Purpose:** Full detail view for a single group: chat, member list, and events.

| Prop | Type | Description |
|---|---|---|
| `group` | `any` | Group object passed from `GroupsScreen` or `DiscoverGroupsScreen` |
| `onBack` | `() => void` | Navigate back |
| `onNavigate` | `(screen: string, data?: any) => void` | Navigate to `'user-profile'` |

### State

| Variable | Purpose |
|---|---|
| `activeTab` | `'chat'` \| `'members'` \| `'events'` |
| `chatMessage` | Controlled input for the message composer |
| `chatMessages` | Array of group chat messages |

### Key Functions

| Function | Description |
|---|---|
| `handleSendMessage()` | Appends new message to `chatMessages` and clears input |

---

## CreateGroupScreen.tsx

**Purpose:** Form for creating a new group.

| Prop | Type | Description |
|---|---|---|
| `onBack` | `() => void` | Navigate back to GroupsScreen |
| `onCreate` | `() => void` | Called on submit; App.tsx shows success toast and navigates back |

### State

| Variable | Purpose |
|---|---|
| `groupName` | Group display name |
| `game` | Selected game tag |
| `description` | Group description text |
| `privacy` | `'public'` \| `'private'` |
| `category` | Selected category tag |

---

## DiscoverGroupsScreen.tsx

**Purpose:** Browse and search public groups available to join.

| Prop | Type | Description |
|---|---|---|
| `onBack` | `() => void` | Navigate back to GroupsScreen |
| `onNavigate` | `(screen: string, data?: any) => void` | Navigate to `'group-detail'` |

### State

| Variable | Purpose |
|---|---|
| `searchQuery` | Controlled search input |
| `activeFilter` | Active category filter |
| `joinedGroups` | `number[]` — IDs of groups the user has joined |

---

## SocialScreen.tsx

**Purpose:** Main tab 3. Friends list, conversations, and friend requests.

| Prop | Type | Description |
|---|---|---|
| `onNavigate` | `(screen: string, params?: any) => void` | Navigate to `'chat'` or `'user-profile'` |

### State

| Variable | Purpose |
|---|---|
| `activeTab` | `'friends'` \| `'messages'` \| `'requests'` |

---

## ChatScreen.tsx

**Purpose:** 1-on-1 direct message thread between the current user and a friend.

| Prop | Type | Description |
|---|---|---|
| `user` | `any` | `{ user: string }` — friend's username |
| `onBack` | `() => void` | Navigate back |
| `onNavigate` | `(screen: string, data?: any) => void` | Navigate to `'user-profile'` |

### State

| Variable | Purpose |
|---|---|
| `message` | Controlled input for message composer |
| `messages` | Array of `{ id, text, sent, time, read }` |

### Key Functions

| Function | Description |
|---|---|
| `handleSend()` | Appends outgoing message to `messages`, clears input |

---

## UserProfileScreen.tsx

**Purpose:** Public profile view for another user. Shows stats, achievements, and mutual groups.

| Prop | Type | Description |
|---|---|---|
| `user` | `any` | User data object from navigation |
| `onBack` | `() => void` | Navigate back |
| `onNavigate` | `(screen: string, data?: any) => void` | Navigate to `'chat'` |

---

## ProfileScreen.tsx

**Purpose:** Main tab 4. Current user's own profile: stats, achievements, game library.

| Prop | Type | Description |
|---|---|---|
| `onNavigate` | `(screen: string) => void` | Navigate to `'settings'`, `'edit-profile'`, `'qr'` |

---

## EditProfileScreen.tsx

**Purpose:** Form to update the current user's profile information.

| Prop | Type | Description |
|---|---|---|
| `onBack` | `() => void` | Navigate back to ProfileScreen |

### State

| Variable | Purpose |
|---|---|
| `formData` | Object: `{ username, bio, email, favoriteGame, region, playStyle }` |

### Key Functions

| Function | Description |
|---|---|
| `handleSave()` | Shows success toast, then calls `onBack` after 500ms |

---

## QRCodeScreen.tsx

**Purpose:** Display the user's QR code for sharing their profile link; secondary scan tab.

| Prop | Type | Description |
|---|---|---|
| `onBack` | `() => void` | Navigate back |

### State

| Variable | Purpose |
|---|---|
| `activeTab` | `'mycode'` \| `'scan'` |
| `qrColor` | Accent colour for QR pattern: one of 5 preset hex values |

### Key Functions

| Function | Description |
|---|---|
| `handleCopy()` | Writes `profileUrl` to clipboard, shows toast |

---

## ShareSheet.tsx

**Purpose:** Bottom sheet modal for sharing content to friends or external platforms.

| Prop | Type | Description |
|---|---|---|
| `isOpen` | `boolean` | Controls sheet visibility |
| `onClose` | `() => void` | Called to dismiss the sheet |
| `content` | `{ title: string; type: 'post'\|'group'\|'profile'; url?: string }` | Content being shared |

### Share Options

| Option | Action |
|---|---|
| Send Message | Shows toast (placeholder) |
| Share QR Code | Shows toast (placeholder) |
| Copy Link | `navigator.clipboard.writeText(url)` |
| Share Link | `navigator.share(...)` if supported |

---

## SettingsScreen.tsx

**Purpose:** Settings navigation hub grouped into Account, Preferences, and Support sections.

| Prop | Type | Description |
|---|---|---|
| `onBack` | `() => void` | Navigate back to ProfileScreen |
| `onNavigate` | `(screen: string) => void` | Navigate into a settings sub-screen |

---

## AccountSettingsScreen.tsx

**Purpose:** Email, phone, password, 2FA, connected accounts, and data/privacy actions.

| Prop | Type | Description |
|---|---|---|
| `onBack` | `() => void` | Navigate back |
| `onNavigate` | `(screen: string) => void` | Navigate to `change-email`, `change-password`, `verify-phone` |

### State

| Variable | Purpose |
|---|---|
| `twoFactorEnabled` | Toggle state for 2FA switch |

---

## NotificationSettingsScreen.tsx

**Purpose:** Fine-grained notification preference toggles.

| Prop | Type | Description |
|---|---|---|
| `onBack` | `() => void` | Navigate back |
| `onNavigate` | `(screen: string) => void` | (unused, reserved) |

### Settings Object Keys

`pushEnabled` · `messages` · `messageSound` · `groupInvites` · `groupEvents` · `friendRequests` · `friendOnline` · `tournamentReminders` · `matchStarting` · `emailNotifications` · `vibration`

---

## PrivacySettingsScreen.tsx

**Purpose:** Profile visibility toggles and access to blocked users management.

| Prop | Type | Description |
|---|---|---|
| `onBack` | `() => void` | Navigate back |
| `onNavigate` | `(screen: string) => void` | Navigate to `'blocked-users'` |

### Settings Object Keys

`publicProfile` · `showOnlineStatus` · `showActivity` · `allowFriendRequests` · `showGroups` · `showAchievements` · `showStats`

---

## AppearanceSettingsScreen.tsx

**Purpose:** Theme (dark/light/auto) and accent colour selection.

| Prop | Type | Description |
|---|---|---|
| `onBack` | `() => void` | Navigate back |
| `onNavigate` | `(screen: string) => void` | (unused, reserved) |

### State

| Variable | Options |
|---|---|
| `theme` | `'dark'` \| `'light'` \| `'auto'` |
| `accentColor` | One of 6 preset hex values |

---

## LanguageSettingsScreen.tsx

**Purpose:** App language selection (12 supported languages).

| Prop | Type | Description |
|---|---|---|
| `onBack` | `() => void` | Navigate back |
| `onNavigate` | `(screen: string) => void` | (unused, reserved) |

### State

| Variable | Default |
|---|---|
| `selectedLanguage` | `'en'` |

### Supported Languages

`en` · `es` · `fr` · `de` · `it` · `pt` · `ru` · `ja` · `ko` · `zh` · `ar` · `hi`

---

## HelpSupportScreen.tsx

**Purpose:** FAQ, support channels (email/chat/help centre/bug report), community links, and app info.

| Prop | Type | Description |
|---|---|---|
| `onBack` | `() => void` | Navigate back |
| `onNavigate` | `(screen: string) => void` | (unused, reserved) |

---

## BlockedUsersScreen.tsx

**Purpose:** List of blocked users with search and unblock capability.

| Prop | Type | Description |
|---|---|---|
| `onBack` | `() => void` | Navigate back |
| `onNavigate` | `(screen: string) => void` | (unused, reserved) |

### State

| Variable | Purpose |
|---|---|
| `searchQuery` | Filter the blocked users list |
| `blockedUsers` | Array of blocked user objects |

### Key Functions

| Function | Description |
|---|---|
| `handleUnblock(userId, username)` | Removes user from `blockedUsers`, shows toast |

---

## ChangeEmailScreen.tsx

**Purpose:** Two-step flow to change account email: password verification then new email entry.

| Prop | Type | Description |
|---|---|---|
| `onBack` | `() => void` | Navigate back |
| `onNavigate` | `(screen: string) => void` | (unused, reserved) |

### State

| Variable | Purpose |
|---|---|
| `step` | `'verify'` \| `'new'` |
| `password` | Current password input |
| `newEmail` | New email address |
| `code` | Verification code sent to new email |

---

## ChangePasswordScreen.tsx

**Purpose:** Change account password with real-time strength meter.

| Prop | Type | Description |
|---|---|---|
| `onBack` | `() => void` | Navigate back |
| `onNavigate` | `(screen: string) => void` | (unused, reserved) |

### State

| Variable | Purpose |
|---|---|
| `currentPassword` | Existing password |
| `newPassword` | New password (drives strength meter) |
| `confirmPassword` | Must match `newPassword` |
| `showCurrent/New/Confirm` | Visibility toggles for each field |

### Key Functions

| Function | Returns | Description |
|---|---|---|
| `passwordStrength(password)` | `{ label, strength: 0–4, color }` | Computes strength level for the progress bar |

---

## VerifyPhoneScreen.tsx

**Purpose:** Two-step SMS verification: enter phone number, then 6-digit code.

| Prop | Type | Description |
|---|---|---|
| `onBack` | `() => void` | Navigate back |
| `onNavigate` | `(screen: string) => void` | (unused, reserved) |

### State

| Variable | Purpose |
|---|---|
| `step` | `'phone'` \| `'verify'` |
| `phoneNumber` | Entered number (min 10 digits) |
| `code` | 6-digit verification code |
| `countryCode` | Dial prefix (default `'+1'`) |

---

## utils/toasts.tsx

**Purpose:** Centralised toast helper library. All functions wrap `sonner`'s `toast` with icon, message, and duration.

| Export | When to use |
|---|---|
| `showSuccessToast(msg, desc?)` | Generic success confirmation |
| `showErrorToast(msg, desc?)` | Generic error |
| `showWarningToast(msg, desc?)` | Warning / caution |
| `showInfoToast(msg, desc?)` | Informational message |
| `showWelcomeToast()` | Post-onboarding welcome |
| `showGroupCreatedToast()` | After creating a group |
| `showProfileUpdatedToast()` | After saving profile |
| `showFriendRequestSentToast()` | After sending a friend request |
| `showGroupJoinedToast(name)` | After joining a group |
| `showConnectedToast(platform)` | After OAuth connection |
| `showLinkCopiedToast()` | After copying any link |
| `showProfileLinkCopiedToast()` | After copying profile QR link |
| `showQRDownloadedToast()` | After downloading QR image |
| `showDataExportToast()` | After initiating data export |
| `showSharedToast(name)` | After sharing to a friend |
| `show2FAToast(enabled)` | After toggling 2FA |
| `showPasswordChangedToast()` | After successful password change |
| `showEmailVerificationToast()` | After sending email verification |
| `showEmailChangedToast()` | After confirming email change |
| `showPhoneVerificationToast()` | After sending SMS code |
| `showPhoneVerifiedToast()` | After successful SMS verification |
| `showAccentColorUpdatedToast()` | After changing accent colour |
| `showConnectingToast(platform)` | While initiating OAuth |
