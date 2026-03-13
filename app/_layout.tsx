import 'react-native-gesture-handler';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useColorScheme, StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { PaperProvider } from 'react-native-paper';
import { ToastProvider } from '../src/components/ui/ToastProvider';
import { AuthProvider } from '../src/context/AuthContext';
import { useAndroidHardwareBackNavigation, useTrackRouteHistory } from '../src/lib/navigation';
import * as Sentry from '@sentry/react-native';

Sentry.init({
  dsn: 'https://a260d9a32e0282e06a5ea020d8158d27@o4511007630753792.ingest.us.sentry.io/4511007632261120',

  // Adds more context data to events (IP address, cookies, user, etc.)
  // For more information, visit: https://docs.sentry.io/platforms/react-native/data-management/data-collected/
  sendDefaultPii: true,

  // Enable Logs
  enableLogs: false,

  // uncomment the line below to enable Spotlight (https://spotlightjs.com)
  // spotlight: __DEV__,
});

export const unstable_settings = {
  anchor: '(tabs)',
};

export default Sentry.wrap(function RootLayout() {
  const colorScheme = useColorScheme();
  const theme = colorScheme === 'dark' ? DarkTheme : DefaultTheme;
  useTrackRouteHistory();
  useAndroidHardwareBackNavigation();

  return (
    <GestureHandlerRootView style={styles.root}>
      <AuthProvider>
        <PaperProvider>
          <ToastProvider>
            <ThemeProvider value={theme}>
              <Stack
                screenOptions={{
                  headerShown: false,
                  animation: 'slide_from_right',
                }}
              >
                <Stack.Screen name="index" />
                <Stack.Screen name="onboarding" options={{ animation: 'fade' }} />
                <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                <Stack.Screen
                  name="modal"
                  options={{
                    presentation: 'modal',
                    title: 'Modal',
                    headerShown: true,
                    animation: 'slide_from_bottom',
                  }}
                />
              </Stack>
              <StatusBar style="auto" />
            </ThemeProvider>
          </ToastProvider>
        </PaperProvider>
      </AuthProvider>
    </GestureHandlerRootView>
  );
});

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
});
