import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Low-level storage helpers.
 *
 * Most state is managed by Zustand's persist middleware (which calls
 * AsyncStorage internally). Use this module for one-off reads/writes
 * that don't belong in a store — e.g. onboarding flags, cache timestamps.
 */
export const storage = {
  get: async <T>(key: string): Promise<T | null> => {
    try {
      const raw = await AsyncStorage.getItem(key);
      return raw ? (JSON.parse(raw) as T) : null;
    } catch {
      return null;
    }
  },

  set: async <T>(key: string, value: T): Promise<void> => {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  },

  remove: async (key: string): Promise<void> => {
    await AsyncStorage.removeItem(key);
  },

  clear: async (): Promise<void> => {
    await AsyncStorage.clear();
  },
};
