# Xcode / SwiftUI Migration Guide

This document provides a complete reference for porting Game Mate from React (web) to a native iOS app using **SwiftUI** in **Xcode**. Each section maps React patterns, components, and design tokens to their closest SwiftUI equivalents.

---

## Prerequisites

| Requirement | Version |
|---|---|
| Xcode | 15.0+ |
| iOS Deployment Target | 17.0+ |
| Swift | 5.9+ |
| SwiftUI | 5.0+ |

---

## 1. Project Setup in Xcode

```
1. Open Xcode → File → New → App
2. Product Name: GameMate
3. Interface: SwiftUI
4. Language: Swift
5. Include Tests: Yes (recommended)
```

### Recommended folder structure

```
GameMate/
├── App/
│   └── GameMateApp.swift          # @main entry, equivalent to src/app/App.tsx
├── Navigation/
│   └── AppRouter.swift            # Navigation coordinator
├── Screens/
│   ├── Onboarding/
│   │   ├── WelcomeView.swift
│   │   ├── OnboardingEmailView.swift
│   │   ├── OnboardingBirthdateView.swift
│   │   └── OnboardingPreferencesView.swift
│   ├── News/
│   │   └── NewsView.swift
│   ├── Groups/
│   │   ├── GroupsView.swift
│   │   ├── GroupDetailView.swift
│   │   ├── CreateGroupView.swift
│   │   └── DiscoverGroupsView.swift
│   ├── Social/
│   │   ├── SocialView.swift
│   │   ├── ChatView.swift
│   │   └── UserProfileView.swift
│   ├── Profile/
│   │   ├── ProfileView.swift
│   │   └── EditProfileView.swift
│   ├── QRCode/
│   │   └── QRCodeView.swift
│   └── Settings/
│       ├── SettingsView.swift
│       ├── AccountSettingsView.swift
│       ├── AppearanceSettingsView.swift
│       ├── NotificationSettingsView.swift
│       ├── PrivacySettingsView.swift
│       ├── LanguageSettingsView.swift
│       ├── HelpSupportView.swift
│       ├── BlockedUsersView.swift
│       ├── ChangeEmailView.swift
│       ├── ChangePasswordView.swift
│       └── VerifyPhoneView.swift
├── Components/
│   ├── ToggleSwitch.swift
│   ├── AvatarView.swift
│   └── ToastView.swift
├── Models/
│   ├── User.swift
│   ├── Group.swift
│   ├── Message.swift
│   └── NewsItem.swift
├── Assets.xcassets/
│   └── Colors/                    # Named color assets (see section 3)
└── Resources/
    └── Fonts/
```

---

## 2. Navigation Architecture

### React (current)

```tsx
// App.tsx — flat state machine
const [currentScreen, setCurrentScreen] = useState('welcome');
const handleNavigate = (screen: string) => setCurrentScreen(screen);
```

### SwiftUI equivalent

Use `NavigationStack` for stack navigation and `TabView` for the main tab bar.

```swift
// AppRouter.swift
import SwiftUI

enum AppRoute: Hashable {
    case groupDetail(Group)
    case createGroup
    case discoverGroups
    case chat(User)
    case userProfile(User)
    case editProfile
    case qrCode
    case settings
    case accountSettings
    case changeEmail
    case changePassword
    case verifyPhone
    case privacySettings
    case blockedUsers
    case notificationSettings
    case appearanceSettings
    case languageSettings
    case helpSupport
}

// GameMateApp.swift
@main
struct GameMateApp: App {
    @State private var hasCompletedOnboarding = false

    var body: some Scene {
        WindowGroup {
            if hasCompletedOnboarding {
                MainTabView()
            } else {
                OnboardingFlow(onComplete: { hasCompletedOnboarding = true })
            }
        }
    }
}

// MainTabView.swift — replaces BottomNav
struct MainTabView: View {
    var body: some View {
        TabView {
            NavigationStack { NewsView() }
                .tabItem { Label("News", systemImage: "newspaper") }

            NavigationStack { GroupsView() }
                .tabItem { Label("Groups", systemImage: "person.3") }

            NavigationStack { SocialView() }
                .tabItem { Label("Social", systemImage: "message") }

            NavigationStack { ProfileView() }
                .tabItem { Label("Profile", systemImage: "person") }
        }
        .tint(Color.gamePrimary)        // #FF9F66
        .preferredColorScheme(.dark)
    }
}
```

### Onboarding flow

```swift
// OnboardingFlow.swift — replaces the onboarding switch in App.tsx
struct OnboardingFlow: View {
    let onComplete: () -> Void
    @State private var step = 0

    var body: some View {
        switch step {
        case 0: WelcomeView(onNext: { step = 1 })
        case 1: OnboardingEmailView(onNext: { step = 2 })
        case 2: OnboardingBirthdateView(onNext: { step = 3 })
        case 3: OnboardingPreferencesView(onNext: onComplete)
        default: WelcomeView(onNext: { step = 1 })
        }
    }
}
```

---

## 3. Color Palette — Assets.xcassets

Create a **Color Set** in `Assets.xcassets` for each token. Set "Any Appearance" to the dark value (app is dark-first).

| Asset Name       | Any / Dark Hex | Light Hex (Onboarding) |
|------------------|----------------|------------------------|
| `GamePrimary`    | `#FF9F66`      | `#FF9F66`              |
| `GamePrimaryDark`| `#FF7733`      | `#FF7733`              |
| `GameBackground` | `#1A1A1A`      | `#F5F5F5`              |
| `GameSurface`    | `#2A2A2A`      | `#E8E8E8`              |
| `GameSurfaceAlt` | `#3A3A3A`      | `#D0D0D0`              |
| `GameText`       | `#F5F5F5`      | `#1A1A1A`              |
| `GameTextSub`    | `#A0A0A0`      | `#A0A0A0`              |
| `GameSuccess`    | `#66FF9F`      | `#66FF9F`              |
| `GameInfo`       | `#66BAFF`      | `#66BAFF`              |
| `GameDanger`     | `#FF6B6B`      | `#FF6B6B`              |
| `GameGold`       | `#FFD700`      | `#FFD700`              |

```swift
// Color+Extension.swift
import SwiftUI

extension Color {
    static let gamePrimary     = Color("GamePrimary")
    static let gamePrimaryDark = Color("GamePrimaryDark")
    static let gameBackground  = Color("GameBackground")
    static let gameSurface     = Color("GameSurface")
    static let gameSurfaceAlt  = Color("GameSurfaceAlt")
    static let gameText        = Color("GameText")
    static let gameTextSub     = Color("GameTextSub")
    static let gameSuccess     = Color("GameSuccess")
    static let gameInfo        = Color("GameInfo")
    static let gameDanger      = Color("GameDanger")
    static let gameGold        = Color("GameGold")
}
```

---

## 4. Component Mapping

### React Component → SwiftUI View

| React Component | SwiftUI Equivalent | Notes |
|---|---|---|
| `<motion.div>` | `View` + `.animation()` | See animation section |
| `<motion.button whileTap>` | `Button` + `.buttonStyle(.plain)` + `@GestureState` | Or use `.scaleEffect` on tap |
| `<AnimatePresence>` | `.transition()` + `withAnimation {}` | |
| `<img>` | `AsyncImage(url:)` | Async image loading built-in |
| `<input type="text">` | `TextField` | |
| `<input type="password">` | `SecureField` | |
| `<textarea>` | `TextEditor` | Add `.scrollContentBackground(.hidden)` |
| `<select>` | `Picker` with `.menu` style | |
| `toast (sonner)` | Custom `ToastView` + `@State isShowing` | Or use a package like `AlertToast` |
| `BottomNav` | `TabView` | |
| Toggle switch | `Toggle` or custom `ToggleSwitchView` | See below |
| Horizontal scroll | `ScrollView(.horizontal)` + `HStack` | |

### Toggle Switch

```swift
// ToggleSwitchView.swift — matches the animated toggle in settings screens
struct ToggleSwitchView: View {
    @Binding var isOn: Bool

    var body: some View {
        Toggle("", isOn: $isOn)
            .labelsHidden()
            .tint(Color.gameSuccess)          // #66FF9F when on
    }
}
```

### Avatar with Online Indicator

```swift
// AvatarView.swift
struct AvatarView: View {
    let url: URL?
    let size: CGFloat
    var isOnline: Bool = false

    var body: some View {
        ZStack(alignment: .bottomTrailing) {
            AsyncImage(url: url) { image in
                image.resizable().scaledToFill()
            } placeholder: {
                Color.gameSurface
            }
            .frame(width: size, height: size)
            .clipShape(Circle())

            if isOnline {
                Circle()
                    .fill(Color.gameSuccess)
                    .frame(width: size * 0.22, height: size * 0.22)
                    .overlay(Circle().stroke(Color.gameSurface, lineWidth: 2))
            }
        }
    }
}
```

---

## 5. Animation Mapping

### Motion → SwiftUI

| Motion (React) | SwiftUI |
|---|---|
| `initial={{ opacity: 0 }} animate={{ opacity: 1 }}` | `.opacity(0).onAppear { withAnimation { opacity = 1 } }` |
| `initial={{ x: '100%' }} animate={{ x: 0 }}` | `.transition(.move(edge: .trailing))` |
| `initial={{ y: 30 }} animate={{ y: 0 }}` | `.offset(y: 30).onAppear { withAnimation { offset = 0 } }` |
| `whileHover={{ scale: 1.05 }}` | Not applicable on iOS (no hover) |
| `whileTap={{ scale: 0.95 }}` | `.scaleEffect(isPressed ? 0.95 : 1)` + `@GestureState` |
| `transition={{ type: 'spring', damping: 30 }}` | `.animation(.spring(dampingFraction: 0.7), value: ...)` |
| `transition={{ delay: 0.1 }}` | `.animation(.easeOut.delay(0.1), value: ...)` |
| Staggered list | `ForEach` with `.animation(.easeOut.delay(Double(index) * 0.05))` |

### Spring scale tap effect

```swift
struct ScaleTapButton<Content: View>: View {
    let action: () -> Void
    let content: Content

    @GestureState private var isPressed = false

    init(action: @escaping () -> Void, @ViewBuilder content: () -> Content) {
        self.action = action
        self.content = content()
    }

    var body: some View {
        content
            .scaleEffect(isPressed ? 0.95 : 1.0)
            .animation(.spring(response: 0.2, dampingFraction: 0.6), value: isPressed)
            .gesture(
                DragGesture(minimumDistance: 0)
                    .updating($isPressed) { _, state, _ in state = true }
                    .onEnded { _ in action() }
            )
    }
}
```

---

## 6. Data Models

Replace each screen's static mock data with `Codable` Swift structs:

```swift
// Models/User.swift
struct User: Identifiable, Codable, Hashable {
    let id: UUID
    var username: String
    var bio: String
    var avatarURL: URL?
    var level: Int
    var isOnline: Bool
    var currentGame: String?
    var stats: UserStats
}

struct UserStats: Codable {
    var groups: Int
    var events: Int
    var wins: Int
    var hoursPlayed: Int
}

// Models/Group.swift
struct Group: Identifiable, Codable, Hashable {
    let id: UUID
    var name: String
    var game: String
    var description: String
    var privacy: GroupPrivacy
    var category: String
    var memberCount: Int
    var onlineCount: Int
    var thumbnailURL: URL?
    var isVerified: Bool
}

enum GroupPrivacy: String, Codable {
    case `public`, `private`
}

// Models/Message.swift
struct Message: Identifiable, Codable {
    let id: UUID
    var text: String
    var isSent: Bool            // true = from current user
    var timestamp: Date
    var isRead: Bool
}

// Models/NewsItem.swift
struct NewsItem: Identifiable, Codable {
    let id: UUID
    var type: PostType
    var title: String
    var author: String
    var authorAvatarURL: URL?
    var coverImageURL: URL?
    var timeAgo: String
    var likes: Int
    var comments: Int
}

enum PostType: String, Codable {
    case video, article, update
}
```

---

## 7. QR Code Generation

In React, the QR code is rendered using an inline SVG generator. In SwiftUI, use `CoreImage`:

```swift
import CoreImage.CIFilterBuiltins

extension String {
    /// Generates a QR code UIImage for the given string
    func qrCodeImage(color: UIColor = .white, background: UIColor = .black) -> UIImage? {
        let context = CIContext()
        let filter = CIFilter.qrCodeGenerator()
        filter.message = Data(self.utf8)
        filter.correctionLevel = "M"

        guard let outputImage = filter.outputImage else { return nil }

        // Colour the QR code
        let colorFilter = CIFilter.falseColor()
        colorFilter.inputImage = outputImage
        colorFilter.color0 = CIColor(color: background)
        colorFilter.color1 = CIColor(color: color)

        guard let colored = colorFilter.outputImage,
              let cgImage = context.createCGImage(colored, from: colored.extent)
        else { return nil }

        return UIImage(cgImage: cgImage)
    }
}

// Usage in QRCodeView.swift
Image(uiImage: profileURL.qrCodeImage(color: UIColor(Color.gamePrimary)) ?? UIImage())
    .interpolation(.none)
    .resizable()
    .scaledToFit()
    .frame(width: 220, height: 220)
```

---

## 8. Notification Permissions (iOS)

`NotificationSettingsScreen` mirrors iOS system notification preferences. In the native app, request permissions before showing the toggle:

```swift
import UserNotifications

class NotificationManager {
    static func requestPermission() async -> Bool {
        let center = UNUserNotificationCenter.current()
        do {
            return try await center.requestAuthorization(options: [.alert, .sound, .badge])
        } catch {
            return false
        }
    }

    static func openSystemSettings() {
        if let url = URL(string: UIApplication.openSettingsURLString) {
            UIApplication.shared.open(url)
        }
    }
}
```

---

## 9. OAuth / Auth Providers

The `WelcomeScreen` lists Google, Steam, PlayStation, and Xbox as auth options. For native iOS:

| Provider | iOS SDK |
|---|---|
| Google | `GoogleSignIn-iOS` (SPM package) |
| Apple Sign In | `AuthenticationServices` (built-in) |
| Steam / Xbox / PlayStation | OAuth via `ASWebAuthenticationSession` |

```swift
// AuthService.swift — ASWebAuthenticationSession example for Steam
import AuthenticationServices

class AuthService: NSObject, ASWebAuthenticationPresentationContextProviding {
    func signInWithSteam() async throws -> String {
        let steamOAuthURL = URL(string: "https://steamcommunity.com/openid/login?...")!
        let callbackScheme = "gamemate"

        return try await withCheckedThrowingContinuation { continuation in
            let session = ASWebAuthenticationSession(url: steamOAuthURL, callbackURLScheme: callbackScheme) { url, error in
                if let error { continuation.resume(throwing: error); return }
                // Parse token from callback URL
                continuation.resume(returning: url?.absoluteString ?? "")
            }
            session.presentationContextProvider = self
            session.start()
        }
    }

    func presentationAnchor(for session: ASWebAuthenticationSession) -> ASPresentationAnchor {
        UIApplication.shared.connectedScenes
            .compactMap { $0 as? UIWindowScene }
            .first?.windows.first ?? ASPresentationAnchor()
    }
}
```

---

## 10. Haptic Feedback

React uses `motion/react`'s `whileTap` for visual press feedback. iOS should also add haptic feedback:

```swift
// HapticManager.swift
import UIKit

struct HapticManager {
    /// Light tap — use on standard button taps
    static func impact(_ style: UIImpactFeedbackGenerator.FeedbackStyle = .light) {
        UIImpactFeedbackGenerator(style: style).impactOccurred()
    }

    /// Use on success toasts / confirmations
    static func success() {
        UINotificationFeedbackGenerator().notificationOccurred(.success)
    }

    /// Use on error toasts
    static func error() {
        UINotificationFeedbackGenerator().notificationOccurred(.error)
    }
}

// Usage
Button("Create Group") {
    HapticManager.impact(.medium)
    viewModel.createGroup()
}
```

---

## 11. Screen-by-Screen Migration Notes

| Screen | Key SwiftUI Notes |
|---|---|
| `WelcomeScreen` | Use `VStack` + `Spacer()`. Background blobs → `Circle().blur(radius: 80)`. Logo animation → `.rotationEffect` + `.scaleEffect` on appear |
| `OnboardingEmail` | `TextField("Email", text: $email)` + `.keyboardType(.emailAddress)` |
| `OnboardingBirthdate` | `DatePicker` in `.graphical` or `.wheels` mode |
| `OnboardingPreferences` | `LazyVGrid` for genre chips; `VStack` for play style rows |
| `NewsScreen` | `ScrollView` + `LazyVStack` for the feed |
| `GroupsScreen` | `ScrollView` + `LazyVStack`; FAB via `overlay(alignment: .bottomTrailing)` |
| `GroupDetailScreen` | Custom `Picker`-style tab bar at top + `TabView(.page)` for content |
| `SocialScreen` | `Picker` for tabs; `List` for friends |
| `ChatScreen` | `ScrollViewReader` for auto-scroll; `safeAreaInset(edge: .bottom)` for composer |
| `ProfileScreen` | `ScrollView` + `LazyHGrid` for game library |
| `QRCodeScreen` | CoreImage QR generation (see section 7) |
| `SettingsScreen` | `List` with `Section` grouping — native feel |
| `NotificationSettingsScreen` | `Toggle` bound to `UNUserNotificationCenter` settings |
| `LanguageSettingsScreen` | `List` + system locale picker or `Locale.availableIdentifiers` |

---

## 12. Swift Package Dependencies

Add these via **File → Add Package Dependencies** in Xcode:

```
// Recommended packages
https://github.com/google/GoogleSignIn-iOS          // Google Sign-In
https://github.com/SDWebImage/SDWebImageSwiftUI      // Async image with caching
https://github.com/siteline/swiftui-introspect       // UIKit access for SwiftUI tweaks
https://github.com/nicklockwood/SwiftyJSON           // JSON parsing (optional)
```

For toast notifications (equivalent to Sonner):

```
https://github.com/elai950/AlertToast               // AlertToast
```
