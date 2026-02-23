/**
 * auth.ts — Authentication service scaffold.
 *
 * Implementation options (choose one when you're ready):
 *   - Supabase  → npx expo install @supabase/supabase-js
 *   - Firebase  → npx expo install @react-native-firebase/auth
 *   - Custom API → standard fetch with JWT tokens
 *
 * When implemented, call:
 *   useUserStore.getState().setUser(user)   — on successful login
 *   useUserStore.getState().logout()        — on sign-out
 *
 * For navigation after login, use expo-router:
 *   router.replace('/(tabs)')
 */

export interface AuthCredentials {
  email: string;
  password: string;
}

export interface AuthResult {
  userId: string;
  email: string;
  displayName?: string;
  token: string;
}

export const authService = {
  login: async (_credentials: AuthCredentials): Promise<AuthResult> => {
    throw new Error('authService.login — not implemented yet');
  },

  signup: async (
    _credentials: AuthCredentials,
    _displayName: string,
  ): Promise<AuthResult> => {
    throw new Error('authService.signup — not implemented yet');
  },

  logout: async (): Promise<void> => {
    throw new Error('authService.logout — not implemented yet');
  },

  resetPassword: async (_email: string): Promise<void> => {
    throw new Error('authService.resetPassword — not implemented yet');
  },

  /** Called on app launch to restore a persisted session */
  restoreSession: async (): Promise<AuthResult | null> => {
    return null;
  },
};
