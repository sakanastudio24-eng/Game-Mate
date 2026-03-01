# GameMate Android Build & Deployment Guide

> Scope note: This guide is Android-only.  
> iOS has **not** been tested in this project due to limited capability.

## Current Status

✅ **Tab Navigation Fixed** - All 5 main tabs now properly wired (News, Groups, Social, Messages, Profile)  
✅ **UI Components Complete** - 31 screens built and functional  
✅ **EAS Configuration Ready** - Build configuration created  
⚠️ **Local Build Not Possible** - Java runtime & Android SDK not installed on development machine

---

## Building for Android

### Option 1: Cloud Build via EAS (Recommended)

EAS Build compiles your app in the cloud without requiring local Android SDK/NDK/Java setup.

```bash
# Log in to Expo
npx eas login

# Build for production
npx eas build --platform android

# Output will be stored in EAS dashboard
# You can download the APK or AAB from: https://expo.dev/builds
```

**First-time setup will ask for:**

- Email for Expo account
- Android Application ID (suggestion: `com.yourcompany.gamemate`)
- Keystore generation (Expo manages this for you)

**Build types supported:**

- **Preview** (internal testing): `npx eas build --platform android --profile preview`
- **Production** (app stores): `npx eas build --platform android --profile production`
- **Development** (testing): `npx eas build --platform android --profile development`

---

### Option 2: Install Local Android Development Environment

If you want to build locally, install:

```bash
# Install Homebrew (if not already installed)
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Install Java (required for Android build)
brew install openjdk

# Install Android SDK
brew install android-sdk

# Set Android SDK environment variables
export ANDROID_HOME=/usr/local/android-sdk
export PATH=$PATH:$ANDROID_HOME/tools:$ANDROID_HOME/platform-tools
# Add to ~/.zshrc to persist

# Then run
npm run android
```

---

## Step-by-Step Cloud Build Instructions

### 1. Create Expo Account & Login

```bash
npx eas login
# Enter your email and password (or create new account)
```

### 2. Run Build Command

```bash
cd /Users/zech/Downloads/The-Big-One/GameMate

# Build for production
npx eas build --platform android

# Or specifically
npx eas build --platform android --profile production
```

### 3. Follow the Prompts

The EAS CLI will ask:

- Application ID: `com.zech1v1.gamemate`
- Generate new keystore? Yes (first time only)
- Store credentials? Yes

### 4. Monitor the Build

The CLI will show:

```
✔ Build queued
✔ Build started in EAS
Waiting for build to complete...
```

You can also watch live at: `https://expo.dev/builds`

### 5. Download APK

Once complete:

- APK will be available to download
- Test on physical Android device or emulator
- Share via ADB, email, or upload to Google Play

---

## Building for Both Platforms (iOS + Android)

This command is listed for reference only. Current project validation is Android-first, and iOS is not tested.

```bash
# Build both simultaneously
npx eas build --platform all

# Specify profile
npx eas build --platform all --profile production
```

---

## Submitting to Google Play Store

### Prerequisites

1. Google Play Developer Account ($25 one-time fee)
2. App signed with keystore (EAS handles this)
3. Store listing information (title, description, screenshots, etc.)

### Steps

```bash
# Create app bundle instead of APK
npx eas build --platform android --profile production
# Select "App Bundle (AAB)" when prompted

# Configure submission in eas.json (add to submit section)
# Then submit directly
npx eas submit --platform android --build-id <BUILD_ID>
```

---

## Distribution Options

### Internal Testing (Recommended for Beta)

```bash
# Build for internal testing
npx eas build --platform android --profile preview

# Share APK link with testers
# Download from EAS dashboard
```

### Public Release (Google Play)

```bash
# Build production AAB
npx eas build --platform android --profile production

# Submit to Play Store
npx eas submit --platform android --build-id <BUILD_ID>
```

### Direct APK Distribution

```bash
# Build APK for direct installation
npx eas build --platform android

# Share APK file with users
# They can install via adb or email
adb install GameMate.apk
```

---

## Troubleshooting

### "Unable to locate Java Runtime"

This means local build environment is not set up. Use cloud build instead:

```bash
npx eas build --platform android # Uses EAS cloud
```

### "Not logged in to Expo"

```bash
npx eas login
# or
npx eas register # If you don't have an account
```

### Build Failed with Gradle Error

Check the EAS dashboard for detailed logs: `https://expo.dev/builds`

Common fixes:

- Update package dependencies: `npm install --force`
- Clear build cache: `npx eas build --platform android --clear-cache`
- Check app.json for valid configuration

### Expo Go Runtime Overlay Can Cause Device Lockups

When using Expo Go performance monitor overlays or draw-over-app UI on Android, some devices can enter a temporary stuck state when entering/exiting the app (keyboard input blocked, app swipe-away feels frozen).

Recommended practice:
- Turn overlay/performance monitor off before backgrounding or swiping away the app.
- If it happens, press Home, fully close Expo Go, then restart with `npx expo start -c`.

### Keystore Issues

EAS manages keystores automatically on first build. Don't delete or share `keystore.json` if it appears locally.

---

## Testing the APK

### On Physical Device (Android 5.0+)

1. Download APK from EAS
2. Transfer to Android device or email yourself
3. Open file in device file manager
4. Tap "Install"
5. Launch "GameMate" from app drawer

### On Android Emulator

```bash
# Using Android Studio emulator
adb install GameMate.apk

# Or if you have local build
npx expo run:android
```

### Download APK File

```bash
# Get build ID from previous build
npx eas build:list

# Download specific build
eas build:download --id <BUILD_ID>
```

---

## Current App Configuration

**App Name:** GameMate  
**Bundle ID:** com.zech1v1.gamemate  
**Version:** 1.0.0  
**Min Android:** API 21 (Android 5.0)  
**React Native:** 0.75.2  
**Expo:** 54.0.0

---

## Next Steps After Building

1. **Test on Android device** - Verify all 31 screens work correctly
2. **Connect backend APIs** - Replace mock data with real API calls
3. **Add push notifications** - Implement Expo notifications
4. **Configure app store listing** - Create title, description, screenshots, pricing
5. **Set up app signing** - Generate signing certificate for Play Store
6. **Create store assets:**
   - App icon (512x512 PNG)
   - Feature graphic (1024x500 PNG)
   - Screenshots (4-5 min, up to 8)
   - Description (max 4000 characters)
   - Privacy policy URL
   - Support email

7. **Final review** - Ensure all screens, navigation, and functionality work perfectly
8. **Beta testing** - Release as "Closed track" for internal testers first
9. **Full release** - Launch to "Production" track

---

## Git Commits for Deployment

```
✅ 223b066 - fix(navigation): wire up 5 main tabs
✅ fe42e46 - config: add eas.json for Expo cloud builds
✅ 38ec028 - docs: build status guide
✅ 554ec09 - phase-c screens
✅ db27930 - ui library & theme
✅ 06fa2ef - phase-a,b: main screens & navigation
```

All work is backed up to https://github.com/sakanastudio24-eng/Game-Mate

---

## Commands Quick Reference

```bash
# Development
npm start                  # Start dev server
npm run android           # Run on Android
npm run ios               # Run on iOS (not tested in this project)

# Building
npx eas build --platform android           # Cloud build
npx eas build --platform android --local   # Local build (requires Java)
npx eas build --platform all               # iOS + Android

# Testing
npx expo run:android      # Run on emulator
npx expo run:ios          # Run on iPhone simulator (not tested in this project)

# Submitting
npx eas submit --platform android --build-id <ID>

# Debugging
npm run lint             # Check for errors
npx expo-doctor          # Check project health
npx eas build:list       # Show build history
```

---

## Production Checklist

- [ ] All 31 screens tested on real Android device
- [ ] Navigation working between all tabs and screens
- [ ] No console errors or warnings
- [ ] Backend APIs integrated and tested
- [ ] Push notifications configured
- [ ] App icons and splash screens created
- [ ] Release notes written
- [ ] Privacy policy created and linked
- [ ] App signing certificate generated
- [ ] Beta testing completed with 5+ external users
- [ ] Google Play Store account created
- [ ] Store listing completed with all assets
- [ ] Build version updated (1.0.0 → 1.0.1, etc.)
- [ ] Final code review complete
- [ ] APK/AAB size optimized
- [ ] App submitted to Play Store

**Estimated time to Play Store:** 2-3 weeks (including review time)

---

## Support

- **Expo Docs:** https://docs.expo.dev
- **EAS Docs:** https://docs.expo.dev/eas
- **Android Docs:** https://developer.android.com
- **Slack:** Ask questions in Expo Slack #expo channel
