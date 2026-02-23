/**
 * Generate a simple unique ID for local-only records.
 * Combines a millisecond timestamp with a random base-36 suffix —
 * collision-resistant enough for a single-device offline app.
 *
 * If you later add cloud sync, swap this for a proper UUID library:
 *   npx expo install expo-crypto
 *   import * as Crypto from 'expo-crypto';
 *   Crypto.randomUUID();
 */
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}
