import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Restaurant } from '../types';

interface RestaurantStore {
  restaurants: Restaurant[];
  addRestaurant: (restaurant: Restaurant) => void;
  updateRestaurant: (id: string, updates: Partial<Restaurant>) => void;
  deleteRestaurant: (id: string) => void;
  toggleFavorite: (id: string) => void;
}

export const useRestaurantStore = create<RestaurantStore>()(
  persist(
    (set) => ({
      restaurants: [],

      addRestaurant: (restaurant) =>
        set((state) => ({ restaurants: [...state.restaurants, restaurant] })),

      updateRestaurant: (id, updates) =>
        set((state) => ({
          restaurants: state.restaurants.map((r) =>
            r.id === id
              ? { ...r, ...updates, updatedAt: new Date().toISOString() }
              : r,
          ),
        })),

      deleteRestaurant: (id) =>
        set((state) => ({
          restaurants: state.restaurants.filter((r) => r.id !== id),
        })),

      toggleFavorite: (id) =>
        set((state) => ({
          restaurants: state.restaurants.map((r) =>
            r.id === id ? { ...r, isFavorite: !r.isFavorite } : r,
          ),
        })),
    }),
    {
      name: 'restaurant-storage',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
