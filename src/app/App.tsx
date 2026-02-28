import { useState } from 'react';
import { AnimatePresence } from 'motion/react';
/**
 * Screen component imports — each file is a self-contained screen.
 * See docs/COMPONENTS.md for full prop & state reference.
 * See docs/FLOWS.md for navigation paths between screens.
 */
import { WelcomeScreen } from './components/WelcomeScreen';
import { OnboardingEmail } from './components/OnboardingEmail';
import { OnboardingBirthdate } from './components/OnboardingBirthdate';
import { OnboardingPreferences } from './components/OnboardingPreferences';
import { NewsScreen } from './components/NewsScreen';
import { GroupsScreen } from './components/GroupsScreen';
import { GroupDetailScreen } from './components/GroupDetailScreen';
import { CreateGroupScreen } from './components/CreateGroupScreen';
import { DiscoverGroupsScreen } from './components/DiscoverGroupsScreen';
import { SocialScreen } from './components/SocialScreen';
import { ProfileScreen } from './components/ProfileScreen';
import { UserProfileScreen } from './components/UserProfileScreen';
import { EditProfileScreen } from './components/EditProfileScreen';
import { ChatScreen } from './components/ChatScreen';
import { QRCodeScreen } from './components/QRCodeScreen';
import { SettingsScreen } from './components/SettingsScreen';
import { AccountSettingsScreen } from './components/AccountSettingsScreen';
import { NotificationSettingsScreen } from './components/NotificationSettingsScreen';
import { PrivacySettingsScreen } from './components/PrivacySettingsScreen';
import { AppearanceSettingsScreen } from './components/AppearanceSettingsScreen';
import { HelpSupportScreen } from './components/HelpSupportScreen';
import { ChangeEmailScreen } from './components/ChangeEmailScreen';
import { ChangePasswordScreen } from './components/ChangePasswordScreen';
import { BlockedUsersScreen } from './components/BlockedUsersScreen';
import { LanguageSettingsScreen } from './components/LanguageSettingsScreen';
import { VerifyPhoneScreen } from './components/VerifyPhoneScreen';
import { BottomNav } from './components/BottomNav';
import { toast, Toaster } from 'sonner';

export default function App() {
  /** Key of the currently rendered screen. Maps to a case in renderScreen(). */
  const [currentScreen, setCurrentScreen] = useState<string>('welcome');

  /** Optional data payload passed to the active screen (e.g. a group object or user object). */
  const [screenData, setScreenData] = useState<any>(null);

  /** Gates tab-bar rendering and main-app access. Set to true after onboarding completes. */
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);

  /** Tracks the screen navigated FROM — used for dynamic back targets (e.g. user-profile can come from multiple places). */
  const [previousScreen, setPreviousScreen] = useState<string>('');

  /**
   * Navigate forward to a new screen.
   * @param screen - Target screen key (must match a case in renderScreen)
   * @param data - Optional payload passed as props to the target screen
   * @iosEquivalent navigationPath.append(AppRoute.someScreen(data))
   */
  const handleNavigate = (screen: string, data?: any) => {
    setPreviousScreen(currentScreen);
    setCurrentScreen(screen);
    setScreenData(data);
  };

  /**
   * Navigate back using a static back-destination map.
   * Falls back to 'news' for any unmapped screen.
   * Clears screenData on every back navigation.
   * @iosEquivalent navigationPath.removeLast() / dismiss()
   */
  const handleBack = () => {
    // Static map: currentScreen → where "back" goes
    const backScreens: { [key: string]: string } = {
      'group-detail': 'groups',
      'create-group': 'groups',
      'discover-groups': 'groups',
      'user-profile': previousScreen || 'social',
      'edit-profile': 'profile',
      'chat': 'social',
      'settings': 'profile',
      'account-settings': 'settings',
      'notification-settings': 'settings',
      'privacy-settings': 'settings',
      'appearance-settings': 'settings',
      'help-support': 'settings',
      'language-settings': 'settings',
      'change-email': 'account-settings',
      'change-password': 'account-settings',
      'verify-phone': 'account-settings',
      'blocked-users': 'privacy-settings',
      'qr': previousScreen || 'news'
    };

    const backTo = backScreens[currentScreen] || 'news';
    setCurrentScreen(backTo);
    setScreenData(null);
  };

  /**
   * Advance the onboarding wizard one step.
   * When nextScreen === 'main', marks onboarding complete and navigates to news.
   * @param nextScreen - Next onboarding step key, or 'main' to finish onboarding
   */
  const handleOnboardingNext = (nextScreen: string) => {
    if (nextScreen === 'main') {
      setHasCompletedOnboarding(true);
      setCurrentScreen('news');
      toast.success('Welcome to Game Mate!', {
        description: 'Start connecting with gamers and join groups',
        duration: 3000
      });
    } else {
      setCurrentScreen(nextScreen);
    }
  };

  /**
   * Callback fired when CreateGroupScreen successfully submits.
   * Shows a success toast and navigates back to GroupsScreen.
   */
  const handleCreateGroup = () => {
    toast.success('Group created successfully!', {
      description: 'Your group is now live',
      duration: 2000
    });
    setCurrentScreen('groups');
  };

  /**
   * Pure render function — selects the correct screen component for currentScreen.
   * Onboarding screens are rendered when hasCompletedOnboarding === false.
   * Main app screens are rendered after onboarding is complete.
   * @returns JSX for the active screen, with all required props injected
   */
  const renderScreen = () => {
    // Onboarding flow
    if (!hasCompletedOnboarding) {
      switch (currentScreen) {
        case 'welcome':
          return <WelcomeScreen key="welcome" onNext={() => handleOnboardingNext('email')} />;
        case 'email':
          return <OnboardingEmail key="email" onNext={() => handleOnboardingNext('birthdate')} />;
        case 'birthdate':
          return <OnboardingBirthdate key="birthdate" onNext={() => handleOnboardingNext('preferences')} />;
        case 'preferences':
          return <OnboardingPreferences key="preferences" onNext={() => handleOnboardingNext('main')} />;
        default:
          return <WelcomeScreen key="welcome" onNext={() => handleOnboardingNext('email')} />;
      }
    }

    // Main app screens
    switch (currentScreen) {
      case 'news':
        return <NewsScreen key="news" onNavigate={handleNavigate} />;
      case 'groups':
        return <GroupsScreen key="groups" onNavigate={handleNavigate} />;
      case 'group-detail':
        return (
          <GroupDetailScreen
            key="group-detail"
            group={screenData}
            onBack={handleBack}
            onNavigate={handleNavigate}
          />
        );
      case 'create-group':
        return (
          <CreateGroupScreen
            key="create-group"
            onBack={handleBack}
            onCreate={handleCreateGroup}
          />
        );
      case 'discover-groups':
        return (
          <DiscoverGroupsScreen
            key="discover-groups"
            onBack={handleBack}
            onNavigate={handleNavigate}
          />
        );
      case 'social':
        return <SocialScreen key="social" onNavigate={handleNavigate} />;
      case 'profile':
        return <ProfileScreen key="profile" onNavigate={handleNavigate} />;
      case 'user-profile':
        return (
          <UserProfileScreen
            key="user-profile"
            user={screenData}
            onBack={handleBack}
            onNavigate={handleNavigate}
          />
        );
      case 'edit-profile':
        return <EditProfileScreen key="edit-profile" onBack={handleBack} />;
      case 'chat':
        return (
          <ChatScreen
            key="chat"
            user={screenData}
            onBack={handleBack}
            onNavigate={handleNavigate}
          />
        );
      case 'qr':
        return <QRCodeScreen key="qr" onBack={handleBack} />;
      case 'settings':
        return <SettingsScreen key="settings" onBack={handleBack} onNavigate={handleNavigate} />;
      case 'account-settings':
        return <AccountSettingsScreen key="account-settings" onBack={handleBack} onNavigate={handleNavigate} />;
      case 'notification-settings':
        return <NotificationSettingsScreen key="notification-settings" onBack={handleBack} onNavigate={handleNavigate} />;
      case 'privacy-settings':
        return <PrivacySettingsScreen key="privacy-settings" onBack={handleBack} onNavigate={handleNavigate} />;
      case 'appearance-settings':
        return <AppearanceSettingsScreen key="appearance-settings" onBack={handleBack} onNavigate={handleNavigate} />;
      case 'help-support':
        return <HelpSupportScreen key="help-support" onBack={handleBack} onNavigate={handleNavigate} />;
      case 'change-email':
        return <ChangeEmailScreen key="change-email" onBack={handleBack} onNavigate={handleNavigate} />;
      case 'change-password':
        return <ChangePasswordScreen key="change-password" onBack={handleBack} onNavigate={handleNavigate} />;
      case 'blocked-users':
        return <BlockedUsersScreen key="blocked-users" onBack={handleBack} onNavigate={handleNavigate} />;
      case 'language-settings':
        return <LanguageSettingsScreen key="language-settings" onBack={handleBack} onNavigate={handleNavigate} />;
      case 'verify-phone':
        return <VerifyPhoneScreen key="verify-phone" onBack={handleBack} onNavigate={handleNavigate} />;
      default:
        return <NewsScreen key="news" onNavigate={handleNavigate} />;
    }
  };

  /**
   * Determines whether the BottomNav tab bar should be visible.
   * Hidden during onboarding and on all non-tab sub-screens.
   */
  const showBottomNav =
    hasCompletedOnboarding &&
    ![
      'qr', 'group-detail', 'create-group', 'discover-groups', 
      'user-profile', 'edit-profile', 'chat', 'settings',
      'account-settings', 'notification-settings', 'privacy-settings',
      'appearance-settings', 'help-support', 'change-email', 'change-password',
      'blocked-users', 'language-settings', 'verify-phone'
    ].includes(currentScreen);

  return (
    <div className="min-h-screen bg-[#1A1A1A] overflow-x-hidden">
      {/* Global toast provider — dark-themed to match the app */}
      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            background: '#2A2A2A',
            color: '#F5F5F5',
            border: '1px solid #3A3A3A'
          },
          className: 'toast'
        }}
      />
      
      {/* AnimatePresence enables enter/exit animations on screen changes */}
      <AnimatePresence mode="wait">
        <div key={currentScreen}>
          {renderScreen()}
        </div>
      </AnimatePresence>

      {/* BottomNav is conditionally rendered — not shown on sub-screens */}
      {showBottomNav && <BottomNav activeScreen={currentScreen} onNavigate={handleNavigate} />}
    </div>
  );
}