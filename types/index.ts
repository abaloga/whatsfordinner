// ─────────────────────────────────────────────────────────
// Core data models
// ─────────────────────────────────────────────────────────

export interface Ingredient {
  id: string;
  name: string;
  quantity?: string;
  unit?: string;
  /** Broad grouping for pantry organisation (e.g. "dairy", "produce") */
  category?: string;
  /** true = currently in the user's pantry */
  inPantry: boolean;
  createdAt: string; // ISO 8601
  updatedAt: string;
}

/** A measured ingredient reference within a recipe */
export interface RecipeIngredient {
  /** Optional link to a saved Ingredient for pantry cross-checking */
  ingredientId?: string;
  name: string;
  quantity?: string;
  unit?: string;
}

export interface Recipe {
  id: string;
  name: string;
  description?: string;
  ingredients: RecipeIngredient[];
  /** Ordered list of preparation steps */
  instructions: string[];
  cookTimeMinutes?: number;
  prepTimeMinutes?: number;
  servings?: number;
  tags?: string[];
  /** URI from camera or gallery — camera feature scaffold */
  imageUri?: string;
  isFavorite: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Restaurant {
  id: string;
  name: string;
  cuisine?: string;
  /** 1–4 representing $ → $$$$ */
  priceRange?: 1 | 2 | 3 | 4;
  rating?: number; // 0–5
  address?: string;
  /** Stored for map pins — maps feature scaffold */
  coordinates?: {
    latitude: number;
    longitude: number;
  };
  phoneNumber?: string;
  website?: string;
  isDeliveryAvailable: boolean;
  isTakeoutAvailable: boolean;
  isDineInAvailable: boolean;
  /** Free-text notes about the restaurant, e.g. "great for date night" */
  notes?: string;
  tags?: string[];
  isFavorite: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UserPreferences {
  dietaryRestrictions?: string[]; // e.g. ["vegetarian", "gluten-free"]
  cuisinePreferences?: string[];
  defaultServings?: number;
  notificationsEnabled: boolean;
}

export interface User {
  id: string;
  email: string;
  displayName?: string;
  /** URI from camera — camera feature scaffold */
  avatarUri?: string;
  /** Unlocked via in-app purchase — payments feature scaffold */
  isPremium: boolean;
  preferences: UserPreferences;
  createdAt: string;
}

// ─────────────────────────────────────────────────────────
// Dinner-decision flow
// ─────────────────────────────────────────────────────────

/** The three top-level choices on the Decide screen */
export type DinnerChoice = 'cook' | 'goOut' | 'generate';

/** How the suggestion engine picks a result */
export type SuggestionMode = 'guided' | 'random';

/** Transient state for the multi-step decision flow */
export interface DecisionState {
  choice?: DinnerChoice;
  suggestionMode?: SuggestionMode;
  /** Answers collected during the guided-questions flow */
  answers?: Record<string, string>;
}
