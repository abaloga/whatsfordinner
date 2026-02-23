import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Ingredient } from '../types';

interface IngredientStore {
  ingredients: Ingredient[];
  addIngredient: (ingredient: Ingredient) => void;
  updateIngredient: (id: string, updates: Partial<Ingredient>) => void;
  deleteIngredient: (id: string) => void;
  /** Toggle whether an ingredient is currently in the pantry */
  togglePantry: (id: string) => void;
}

export const useIngredientStore = create<IngredientStore>()(
  persist(
    (set) => ({
      ingredients: [],

      addIngredient: (ingredient) =>
        set((state) => ({ ingredients: [...state.ingredients, ingredient] })),

      updateIngredient: (id, updates) =>
        set((state) => ({
          ingredients: state.ingredients.map((i) =>
            i.id === id
              ? { ...i, ...updates, updatedAt: new Date().toISOString() }
              : i,
          ),
        })),

      deleteIngredient: (id) =>
        set((state) => ({
          ingredients: state.ingredients.filter((i) => i.id !== id),
        })),

      togglePantry: (id) =>
        set((state) => ({
          ingredients: state.ingredients.map((i) =>
            i.id === id
              ? { ...i, inPantry: !i.inPantry, updatedAt: new Date().toISOString() }
              : i,
          ),
        })),
    }),
    {
      name: 'ingredient-storage',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
