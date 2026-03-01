# Game Mate

**Game Mate** is a mobile-first gaming group manager built with React + TypeScript + Tailwind CSS v4. It provides a full onboarding flow, social features, group management, real-time chat, QR code sharing, news feed, and a comprehensive settings suite — all styled around an orange (`#FF9F66`), off-black (`#1A1A1A`), and off-white (`#F5F5F5`) palette.

---

## Table of Contents

- [Project Overview](#project-overview)
- [Tech Stack](#tech-stack)
- [Color Palette](#color-palette)
- [Folder Structure](#folder-structure)
- [Screen Inventory](#screen-inventory)
- [Navigation Architecture](#navigation-architecture)
- [Running Locally](#running-locally)
- [Xcode / SwiftUI Migration Notes](#xcode--swiftui-migration-notes)
- [Documentation Index](#documentation-index)

---

## Project Overview

| Attribute       | Value                                      |
|-----------------|--------------------------------------------|
| App Name        | Game Mate                                  |
| Platform Target | Mobile-first web (iOS / Android PWA-ready) |
| Framework       | React 18 + TypeScript                      |
| Styling         | Tailwind CSS v4                            |
| Animation       | Motion (motion/react)                      |
| Icons           | Lucide React + @phosphor-icons/react        |
| Toast / Alerts  | Sonner                                     |
| Version         | 1.0.0                                      |

---

## Tech Stack

```
React 18          — UI component framework
TypeScript        — Static typing
Tailwind CSS v4   — Utility-first styling
motion/react      — Declarative animations (formerly Framer Motion)
lucide-react      — Icon library (primary)
@phosphor-icons/react — Icon library (gaming-specific icons)
sonner            — Toast notification system
```

---

## Color Palette

| Token         | Hex       | Usage                                    |
|---------------|-----------|------------------------------------------|
| Primary       | `#FF9F66` | Accent, CTAs, active states              |
| Primary Dark  | `#FF7733` | Gradient end, pressed states             |
| Background    | `#1A1A1A` | Main app background (dark theme)         |
| Surface       | `#2A2A2A` | Cards, sheets, input backgrounds         |
| Surface Alt   | `#3A3A3A` | Borders, dividers, secondary surfaces    |
| Text Primary  | `#F5F5F5` | Primary text on dark backgrounds         |
| Text Secondary| `#A0A0A0` | Subtitles, labels, hints                 |
| Onboarding BG | `#F5F5F5` | Light background for onboarding screens  |
| Success       | `#66FF9F` | Online indicators, verified status       |
| Info          | `#66BAFF` | Informational banners, links             |
| Danger        | `#FF6B6B` | Destructive actions, error states        |
| Gold          | `#FFD700` | Legendary achievements, tournament wins  |

### Xcode Assets.xcassets (SwiftUI Color Set)

```swift
// Add these to your Assets.xcassets as named colors
extension Color {
    static let gamePrimary     = Color(hex: "#FF9F66")
    static let gamePrimaryDark = Color(hex: "#FF7733")
    static let gameBackground  = Color(hex: "#1A1A1A")
    static let gameSurface     = Color(hex: "#2A2A2A")
    static let gameSurfaceAlt  = Color(hex: "#3A3A3A")
    static let gameText        = Color(hex: "#F5F5F5")
    static let gameTextSub     = Color(hex: "#A0A0A0")
    static let gameSuccess     = Color(hex: "#66FF9F")
    static let gameInfo        = Color(hex: "#66BAFF")
    static let gameDanger      = Color(hex: "#FF6B6B")
}
```

---

## Folder Structure

```
/
├── src/
│   ├── app/
│   │   ├── App.tsx                      # Root component — navigation state machine
│   │   ├── components/
│   │   │   ├── — ONBOARDING —
│   │   │   ├── WelcomeScreen.tsx         # Auth provider selection (Google/Steam/PS/Xbox)
│   │   │   ├── OnboardingEmail.tsx       # Email collection step
│   │   │   ├── OnboardingBirthdate.tsx   # Date of birth + ToS acceptance
│   │   │   ├── OnboardingPreferences.tsx # Genre & play style selection
│   │   │   │
│   │   │   ├── — MAIN TABS —
│   │   │   ├── NewsScreen.tsx            # Gaming news feed
│   │   │   ├── GroupsScreen.tsx          # My groups list
│   │   │   ├── SocialScreen.tsx          # Friends, messages, requests
│   │   │   ├── ProfileScreen.tsx         # My profile
│   │   │   │
│   │   │   ├── — GROUPS —
│   │   │   ├── GroupDetailScreen.tsx     # Group chat, members, events
│   │   │   ├── CreateGroupScreen.tsx     # New group creation form
│   │   │   ├── DiscoverGroupsScreen.tsx  # Browse & search public groups
│   │   │   │
│   │   │   ├── — SOCIAL —
│   │   │   ├── ChatScreen.tsx            # 1-on-1 direct message chat
│   │   │   ├── UserProfileScreen.tsx     # Other users' public profiles
│   │   │   ├── ShareSheet.tsx            # Bottom sheet for sharing content
│   │   │   ├── QRCodeScreen.tsx          # QR code display & scanner
│   │   │   │
│   │   │   ├── — PROFILE —
│   │   │   ├── EditProfileScreen.tsx     # Profile editing form
│   │   │   │
│   │   │   ├── — SETTINGS —
│   │   │   ├── SettingsScreen.tsx              # Settings hub
│   │   │   ├── AccountSettingsScreen.tsx       # Email, phone, password, 2FA
│   │   │   ├── AppearanceSettingsScreen.tsx    # Theme & accent colour
│   │   │   ├── NotificationSettingsScreen.tsx  # Push & in-app notification controls
│   │   │   ├── PrivacySettingsScreen.tsx       # Visibility & blocked users
│   │   │   ├── LanguageSettingsScreen.tsx      # App language selection
│   │   │   ├── HelpSupportScreen.tsx           # FAQ, support channels, about
│   │   │   ├── BlockedUsersScreen.tsx          # Manage blocked accounts
│   │   │   ├── ChangeEmailScreen.tsx           # Multi-step email change flow
│   │   │   ├── ChangePasswordScreen.tsx        # Password change with strength meter
│   │   │   ├── VerifyPhoneScreen.tsx           # SMS verification flow
│   │   │   │
│   │   │   ├── — NAVIGATION —
│   │   │   └── BottomNav.tsx             # Persistent tab bar (News/Groups/Social/Profile)
│   │   │
│   │   └── utils/
│   │       └── toasts.tsx               # Centralised toast notification helpers
│   │
│   └── styles/
│       ├── theme.css                    # CSS tokens / design system
│       └── fonts.css                   # Font imports
│
├── docs/
│   ├── ARCHITECTURE.md                  # Architecture overview
│   ├── FLOWS.md                         # Screen navigation flows
│   ├── COMPONENTS.md                    # Full component catalog
│   └── XCODE_MIGRATION.md               # iOS / SwiftUI porting guide
│
└── README.md                            # This file
```

---

## Screen Inventory

| Screen                   | File                            | Route Key              | Tab |
|--------------------------|---------------------------------|------------------------|-----|
| Welcome / Auth           | WelcomeScreen.tsx               | `welcome`              | —   |
| Email Onboarding         | OnboardingEmail.tsx             | `email`                | —   |
| Birthdate Onboarding     | OnboardingBirthdate.tsx         | `birthdate`            | —   |
| Preferences Onboarding   | OnboardingPreferences.tsx       | `preferences`          | —   |
| News Feed                | NewsScreen.tsx                  | `news`                 | 1   |
| My Groups                | GroupsScreen.tsx                | `groups`               | 2   |
| Group Detail             | GroupDetailScreen.tsx           | `group-detail`         | —   |
| Create Group             | CreateGroupScreen.tsx           | `create-group`         | —   |
| Discover Groups          | DiscoverGroupsScreen.tsx        | `discover-groups`      | —   |
| Social / Friends         | SocialScreen.tsx                | `social`               | 3   |
| Direct Chat              | ChatScreen.tsx                  | `chat`                 | —   |
| User Profile (other)     | UserProfileScreen.tsx           | `user-profile`         | —   |
| My Profile               | ProfileScreen.tsx               | `profile`              | 4   |
| Edit Profile             | EditProfileScreen.tsx           | `edit-profile`         | —   |
| QR Code                  | QRCodeScreen.tsx                | `qr`                   | —   |
| Share Sheet              | ShareSheet.tsx                  | modal overlay          | —   |
| Settings                 | SettingsScreen.tsx              | `settings`             | —   |
| Account Settings         | AccountSettingsScreen.tsx       | `account-settings`     | —   |
| Appearance               | AppearanceSettingsScreen.tsx    | `appearance-settings`  | —   |
| Notifications            | NotificationSettingsScreen.tsx  | `notification-settings`| —   |
| Privacy & Security       | PrivacySettingsScreen.tsx       | `privacy-settings`     | —   |
| Language                 | LanguageSettingsScreen.tsx      | `language-settings`    | —   |
| Help & Support           | HelpSupportScreen.tsx           | `help-support`         | —   |
| Blocked Users            | BlockedUsersScreen.tsx          | `blocked-users`        | —   |
| Change Email             | ChangeEmailScreen.tsx           | `change-email`         | —   |
| Change Password          | ChangePasswordScreen.tsx        | `change-password`      | —   |
| Verify Phone             | VerifyPhoneScreen.tsx           | `verify-phone`         | —   |

---

## Navigation Architecture

Navigation is managed as a **flat state machine** in `App.tsx`. A `currentScreen` string key selects which component to render. `AnimatePresence` from `motion/react` handles animated transitions.

```
WelcomeScreen
  └─▶ OnboardingEmail
        └─▶ OnboardingBirthdate
              └─▶ OnboardingPreferences
                    └─▶ [Main App — hasCompletedOnboarding = true]
                          ├─▶ NewsScreen (default tab)
                          ├─▶ GroupsScreen
                          │     ├─▶ GroupDetailScreen
                          │     ├─▶ CreateGroupScreen
                          │     └─▶ DiscoverGroupsScreen
                          ├─▶ SocialScreen
                          │     ├─▶ ChatScreen
                          │     └─▶ UserProfileScreen
                          └─▶ ProfileScreen
                                ├─▶ EditProfileScreen
                                ├─▶ QRCodeScreen
                                └─▶ SettingsScreen
                                      ├─▶ AccountSettingsScreen
                                      │     ├─▶ ChangeEmailScreen
                                      │     ├─▶ ChangePasswordScreen
                                      │     └─▶ VerifyPhoneScreen
                                      ├─▶ NotificationSettingsScreen
                                      ├─▶ PrivacySettingsScreen
                                      │     └─▶ BlockedUsersScreen
                                      ├─▶ AppearanceSettingsScreen
                                      ├─▶ LanguageSettingsScreen
                                      └─▶ HelpSupportScreen
```

---

## Running Locally

```bash
# Install dependencies
npm install

# Start the dev server
npm run start

# Quick Android bundle validation
npx expo export:embed --eager --platform android --dev false
```

---

## Xcode / SwiftUI Migration Notes

See [`docs/XCODE_MIGRATION.md`](docs/XCODE_MIGRATION.md) for a full component-by-component mapping to SwiftUI views, including:

- `TabView` replacement for `BottomNav`
- `NavigationStack` replacement for the flat state machine
- `Motion` animation → SwiftUI `.animation()` / Core Animation equivalents
- Color asset configuration for `Assets.xcassets`
- Data model (`Codable` struct) suggestions for each screen

---

## Documentation Index

| File                          | Contents                                     |
|-------------------------------|----------------------------------------------|
| `README.md`                   | Project overview, setup, structure (this file)|
| `docs/ARCHITECTURE.md`        | State management, animation, theming patterns |
| `docs/FLOWS.md`               | Detailed screen-by-screen navigation flows    |
| `docs/COMPONENTS.md`          | Full component prop catalog                   |
| `docs/DESIGN_SYSTEM_MOBILE.md`| iPhone + Android layout and typography system |
| `docs/MOBILE_WORKFLOW_NOTES.md` | Build checklist, postmortem, optimization log |
| `docs/XCODE_MIGRATION.md`     | iOS / SwiftUI porting reference               |
