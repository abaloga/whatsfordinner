import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

/**
 * RootLayout
 *
 * The outermost layout in expo-router. Every file under app/ is nested
 * inside this component. It renders a Stack navigator so that screens
 * outside the tab bar (e.g. auth screens, modal details) can be pushed
 * on top of the tabs later.
 *
 * expo-router automatically wraps the entire tree in SafeAreaProvider,
 * so individual screens can use SafeAreaView / useSafeAreaInsets without
 * adding a provider themselves.
 */
export default function RootLayout() {
  return (
    <>
      <StatusBar style="auto" />
      <Stack screenOptions={{ headerShown: false }}>
        {/* The (tabs) group renders the bottom tab navigator */}
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />

        {/* ── Future screens to push on top of tabs ── */}
        {/* <Stack.Screen name="login"    options={{ presentation: 'modal' }} /> */}
        {/* <Stack.Screen name="sign-up"  options={{ presentation: 'modal' }} /> */}
        {/* <Stack.Screen name="recipe/[id]" /> */}
      </Stack>
    </>
  );
}
