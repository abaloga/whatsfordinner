export * from './colors';

/**
 * AsyncStorage keys — must match the `name` field in each Zustand store's
 * persist configuration so keys don't collide.
 */
export const STORAGE_KEYS = {
  RECIPES: 'recipe-storage',
  RESTAURANTS: 'restaurant-storage',
  INGREDIENTS: 'ingredient-storage',
  USER: 'user-storage',
} as const;

export const APP_CONFIG = {
  name: 'WhatsForDinner',
  version: '1.0.0',
} as const;
