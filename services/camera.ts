/**
 * camera.ts — Camera and image picker scaffold.
 *
 * Implementation steps when building this out:
 *   1. npx expo install expo-camera expo-image-picker
 *   2. Add "expo-camera" to plugins in app.json
 *   3. Request camera / media-library permissions before use
 *   4. For ingredient scanning: send the image to a vision API
 *      (e.g. Google Vision, OpenAI Vision) to extract ingredient names
 *
 * Usage in the app:
 *   - Recipe photos   → Recipe.imageUri
 *   - Profile avatar  → User.avatarUri
 *   - Ingredient scan → populates IngredientsScreen automatically
 */

export interface ImageResult {
  uri: string;
  width: number;
  height: number;
  base64?: string;
}

export const cameraService = {
  takePicture: async (): Promise<ImageResult> => {
    throw new Error('cameraService.takePicture — not implemented yet');
  },

  pickFromGallery: async (): Promise<ImageResult> => {
    throw new Error('cameraService.pickFromGallery — not implemented yet');
  },

  /**
   * Capture an image and extract a list of ingredient names via OCR or
   * barcode scanning. Returns partial Ingredient objects for the user to
   * confirm before they are added to the pantry.
   */
  scanIngredients: async (): Promise<Array<{ name: string }>> => {
    throw new Error('cameraService.scanIngredients — not implemented yet');
  },
};
