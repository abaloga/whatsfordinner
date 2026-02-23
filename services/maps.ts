/**
 * maps.ts — Location and mapping service scaffold.
 *
 * Implementation steps when building this out:
 *   1. npx expo install expo-location
 *   2. Add "expo-location" to the plugins array in app.json
 *   3. Request permissions before calling getCurrentLocation()
 *   4. For map display: npx expo install react-native-maps
 *   5. For restaurant search: integrate Google Places API or Foursquare
 *
 * The Restaurant.coordinates field in types/index.ts is already typed
 * to hold lat/lng for map pins.
 */

export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface PlaceSuggestion {
  placeId: string;
  name: string;
  address: string;
  coordinates: Coordinates;
  rating?: number;
}

export const mapsService = {
  getCurrentLocation: async (): Promise<Coordinates> => {
    throw new Error('mapsService.getCurrentLocation — not implemented yet');
  },

  searchNearbyRestaurants: async (
    _coordinates: Coordinates,
    _query: string,
  ): Promise<PlaceSuggestion[]> => {
    throw new Error('mapsService.searchNearbyRestaurants — not implemented yet');
  },

  /** Deep-links to Apple Maps / Google Maps */
  getDirections: async (
    _from: Coordinates,
    _to: Coordinates,
  ): Promise<{ url: string }> => {
    throw new Error('mapsService.getDirections — not implemented yet');
  },
};
