# Screen Navigation Flows

This document describes every user-facing navigation path in Game Mate, including what triggers each transition, what data (if any) is passed, and what the expected back-navigation destination is.

---

## 1. Onboarding Flow

A linear 4-step wizard gated by `hasCompletedOnboarding === false`. Once the user completes step 4, `hasCompletedOnboarding` is set to `true`, the BottomNav becomes visible, and the app navigates to `NewsScreen`.

```
WelcomeScreen
  ↓  (Google / Steam / PlayStation / Xbox button OR "Continue with Email")
OnboardingEmail
  ↓  (valid email entered → "Next" circle button)
OnboardingBirthdate
  ↓  (date entered + ToS accepted → "Next" circle button)
OnboardingPreferences
  ↓  (≥1 genre + 1 play style selected → "Next" circle button)
NewsScreen  ←── hasCompletedOnboarding = true, BottomNav mounts
```

### Step progress indicators

Each onboarding screen shows 3 animated `h-1` bars. Active bars are orange (`#FF9F66`); upcoming bars are grey (`#D0D0D0`).

| Screen             | Step | Bars filled |
|--------------------|------|-------------|
| OnboardingEmail    | 1/3  | 1           |
| OnboardingBirthdate| 2/3  | 2           |
| OnboardingPreferences | 3/3 | 3          |

---

## 2. Main Tab Navigation

The `BottomNav` is always visible in the main app (unless on a sub-screen). Tapping a tab sets `currentScreen` directly.

```
BottomNav tabs:
  [News]  [Groups]  [Social]  [Profile]
     ↓        ↓         ↓         ↓
 NewsScreen  GroupsScreen  SocialScreen  ProfileScreen
```

---

## 3. News Tab

```
NewsScreen
  ├─▶ QRCodeScreen          (QR icon in header)
  │     └── back → NewsScreen
  │
  └─▶ ShareSheet (modal)   (Share icon on any news card)
        └── dismiss → NewsScreen
```

**Category filter:** `fyp | esports | patches | streams` — filters the visible post list in-place (no navigation).

**Post interactions (in-place, no navigation):**
- Heart / Like — toggles `likedPosts` local state
- Bookmark / Save — toggles `savedPosts` local state

---

## 4. Groups Tab

```
GroupsScreen
  ├─▶ CreateGroupScreen     (+ FAB button)
  │     └── back → GroupsScreen
  │     └── onCreate() → GroupsScreen (toast shown)
  │
  ├─▶ DiscoverGroupsScreen  ("Discover" button in header)
  │     ├── back → GroupsScreen
  │     └─▶ GroupDetailScreen  (tap a discovered group)
  │               └── back → DiscoverGroupsScreen
  │
  └─▶ GroupDetailScreen     (tap a group card)
        ├── back → GroupsScreen
        ├─▶ UserProfileScreen   (tap a member avatar)
        │     └── back → GroupDetailScreen
        └─▶ ShareSheet (modal)  (Share icon in header)
              └── dismiss → GroupDetailScreen
```

**GroupDetailScreen internal tabs (no navigation):**
- `chat` — Group chat feed + send message input
- `members` — Member list with role badges (Admin / Mod)
- `events` — Upcoming event cards with join CTA

---

## 5. Social Tab

```
SocialScreen
  ├─▶ QRCodeScreen          (QR icon in header)
  │     └── back → SocialScreen
  │
  ├─▶ ChatScreen            (tap a friend / conversation row)
  │     ├── back → SocialScreen
  │     └─▶ UserProfileScreen  (tap friend avatar in chat header)
  │               └── back → ChatScreen
  │
  └─▶ UserProfileScreen     (tap a friend in friend list)
        ├── back → SocialScreen
        └─▶ ChatScreen         (Message button on their profile)
              └── back → UserProfileScreen
```

**SocialScreen internal tabs (no navigation):**
- `friends` — Online / offline friend list with status and game indicator
- `messages` — Recent conversation list
- `requests` — Incoming friend requests with Accept / Decline

---

## 6. Profile Tab

```
ProfileScreen
  ├─▶ QRCodeScreen          (QR icon in header)
  │     └── back → ProfileScreen
  │
  ├─▶ EditProfileScreen     (Edit icon / button)
  │     └── back → ProfileScreen
  │
  └─▶ SettingsScreen        (Settings icon in header)
        ├── back → ProfileScreen
        │
        ├─▶ EditProfileScreen          (Edit Profile row)
        │     └── back → ProfileScreen
        │
        ├─▶ AccountSettingsScreen      (Account Settings row)
        │     ├── back → SettingsScreen
        │     ├─▶ ChangeEmailScreen    (Change Email button)
        │     │     └── back → AccountSettingsScreen
        │     ├─▶ ChangePasswordScreen (Change Password button)
        │     │     └── back → AccountSettingsScreen
        │     └─▶ VerifyPhoneScreen    (Verify Phone button)
        │           └── back → AccountSettingsScreen
        │
        ├─▶ PrivacySettingsScreen      (Privacy & Security row)
        │     ├── back → SettingsScreen
        │     └─▶ BlockedUsersScreen   (Blocked Users button)
        │           └── back → PrivacySettingsScreen
        │
        ├─▶ NotificationSettingsScreen (Notifications row)
        │     └── back → SettingsScreen
        │
        ├─▶ AppearanceSettingsScreen   (Appearance row)
        │     └── back → SettingsScreen
        │
        ├─▶ LanguageSettingsScreen     (Language row)
        │     └── back → SettingsScreen
        │
        └─▶ HelpSupportScreen          (Help & Support row)
              └── back → SettingsScreen
```

---

## 7. QRCodeScreen Internal Flow

```
QRCodeScreen
  ├── Tab: mycode — Shows current user's QR code + link
  │     ├── Colour picker → updates QR accent colour (in-place)
  │     ├── Copy Link button → copies URL to clipboard
  │     └── Download / Share buttons → system actions
  └── Tab: scan — Camera scanner UI (placeholder)
```

---

## 8. ChangeEmailScreen Internal Flow (Multi-step)

```
ChangeEmailScreen
  ├── Step 1: verify  — Enter current password
  │     ↓ (valid password)
  └── Step 2: new     — Enter new email + confirmation code
        ↓ (code matches)
        → back to AccountSettingsScreen (toast shown)
```

---

## 9. VerifyPhoneScreen Internal Flow

```
VerifyPhoneScreen
  ├── Step 1: phone  — Enter country code + phone number
  │     ↓ (phone ≥ 10 digits, submit)
  └── Step 2: verify — Enter 6-digit SMS code
        ↓ (code matches)
        → back to AccountSettingsScreen (toast shown)
```

---

## 10. Data Passed Between Screens

| Transition                     | Data passed (`screenData`)            |
|--------------------------------|---------------------------------------|
| GroupsScreen → GroupDetailScreen | Full group object `{ id, name, game, members, ... }` |
| SocialScreen → ChatScreen       | `{ user: string }` — friend's username |
| SocialScreen → UserProfileScreen| User object `{ name, avatar, ... }`   |
| ChatScreen → UserProfileScreen  | Same user object as ChatScreen        |
| GroupDetailScreen → UserProfileScreen | Member object |

Back navigation clears `screenData` to `null`.

---

## 11. ShareSheet (Global Overlay)

`ShareSheet` is not a "screen" — it's an overlay rendered in whichever screen opens it. It is passed:

```tsx
<ShareSheet
  isOpen={shareOpen}
  onClose={() => setShareOpen(false)}
  content={{ title: string, type: 'post' | 'group' | 'profile', url?: string }}
/>
```

It renders over the current screen (z-index 50) with a blurred backdrop.
