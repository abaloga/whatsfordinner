/**
 * Developer utility — seed the app with test data.
 *
 * Call seedTestData() from the Profile screen (or any component) to populate
 * all three stores with realistic sample records for manual testing.
 *
 * Uses Zustand's getState() so it works outside React components.
 * Safe to call multiple times — it just appends; it does not clear existing data.
 */

import { useRecipeStore } from '../store/recipeStore';
import { useRestaurantStore } from '../store/restaurantStore';
import { useIngredientStore } from '../store/ingredientStore';
import { generateId } from '../utils/id';

const NOW = new Date().toISOString();

export function seedTestData(): void {
  seedRecipes();
  seedRestaurants();
  seedIngredients();
}

// ─── Recipes ──────────────────────────────────────────────────────────────────

function seedRecipes() {
  const { addRecipe } = useRecipeStore.getState();

  addRecipe({
    id: generateId(),
    name: 'Spaghetti Bolognese',
    description: 'A rich and hearty Italian meat sauce served over spaghetti.',
    ingredients: [
      { name: 'Ground beef',   quantity: '500', unit: 'g' },
      { name: 'Pasta',         quantity: '400', unit: 'g' },
      { name: 'Tomato sauce',  quantity: '400', unit: 'ml' },
      { name: 'Onion',         quantity: '1',   unit: 'large' },
      { name: 'Garlic',        quantity: '3',   unit: 'cloves' },
    ],
    instructions: [
      'Brown the ground beef in a large pan with diced onion and garlic.',
      'Add tomato sauce and simmer for 20 minutes.',
      'Cook pasta according to package instructions and serve with the sauce.',
    ],
    cookTimeMinutes: 45,
    servings: 4,
    tags: ['italian', 'hearty'],
    isFavorite: false,
    createdAt: NOW,
    updatedAt: NOW,
  });

  addRecipe({
    id: generateId(),
    name: 'Chicken Stir Fry',
    description: 'A quick and healthy Asian-inspired stir fry with tender chicken and crisp vegetables.',
    ingredients: [
      { name: 'Chicken breast', quantity: '400', unit: 'g' },
      { name: 'Broccoli',       quantity: '200', unit: 'g' },
      { name: 'Soy sauce',      quantity: '3',   unit: 'tbsp' },
      { name: 'Rice',           quantity: '300', unit: 'g' },
      { name: 'Garlic',         quantity: '2',   unit: 'cloves' },
    ],
    instructions: [
      'Cook rice according to package instructions.',
      'Slice chicken and stir-fry in a hot wok with garlic for 5 minutes.',
      'Add broccoli and soy sauce, cook for another 5 minutes and serve over rice.',
    ],
    cookTimeMinutes: 20,
    servings: 2,
    tags: ['asian', 'quick'],
    isFavorite: false,
    createdAt: NOW,
    updatedAt: NOW,
  });

  addRecipe({
    id: generateId(),
    name: 'Avocado Toast',
    description: 'Simple, nutritious, and endlessly customisable.',
    ingredients: [
      { name: 'Bread',    quantity: '2',  unit: 'slices' },
      { name: 'Avocado',  quantity: '1',  unit: 'ripe' },
      { name: 'Eggs',     quantity: '2' },
      { name: 'Salt',     quantity: 'a pinch' },
      { name: 'Pepper',   quantity: 'a pinch' },
    ],
    instructions: [
      'Toast the bread. Mash the avocado with salt and pepper.',
      'Fry or poach the eggs to your liking.',
      'Spread avocado on toast and top with eggs.',
    ],
    cookTimeMinutes: 10,
    servings: 1,
    tags: ['quick', 'light'],
    isFavorite: false,
    createdAt: NOW,
    updatedAt: NOW,
  });

  addRecipe({
    id: generateId(),
    name: 'Beef Tacos',
    description: 'Crowd-pleasing tacos loaded with seasoned beef and fresh toppings.',
    ingredients: [
      { name: 'Ground beef',  quantity: '500', unit: 'g' },
      { name: 'Taco shells',  quantity: '8' },
      { name: 'Cheese',       quantity: '100', unit: 'g' },
      { name: 'Lettuce',      quantity: '1',   unit: 'cup' },
      { name: 'Salsa',        quantity: '4',   unit: 'tbsp' },
    ],
    instructions: [
      'Brown the ground beef in a pan with taco seasoning.',
      'Warm taco shells in the oven for 5 minutes.',
      'Fill shells with beef and top with cheese, lettuce, and salsa.',
    ],
    cookTimeMinutes: 25,
    servings: 4,
    tags: ['mexican', 'casual'],
    isFavorite: false,
    createdAt: NOW,
    updatedAt: NOW,
  });

  addRecipe({
    id: generateId(),
    name: 'Grilled Salmon',
    description: 'Elegant and healthy grilled salmon with lemon and asparagus.',
    ingredients: [
      { name: 'Salmon',     quantity: '2',  unit: 'fillets' },
      { name: 'Lemon',      quantity: '1' },
      { name: 'Garlic',     quantity: '2',  unit: 'cloves' },
      { name: 'Olive oil',  quantity: '2',  unit: 'tbsp' },
      { name: 'Asparagus',  quantity: '200', unit: 'g' },
    ],
    instructions: [
      'Marinate salmon in olive oil, lemon juice, and garlic for 10 minutes.',
      'Grill salmon for 4–5 minutes per side.',
      'Grill asparagus alongside and serve together.',
    ],
    cookTimeMinutes: 30,
    servings: 2,
    tags: ['healthy', 'fancy'],
    isFavorite: false,
    createdAt: NOW,
    updatedAt: NOW,
  });
}

// ─── Restaurants / Places ─────────────────────────────────────────────────────

function seedRestaurants() {
  const { addRestaurant } = useRestaurantStore.getState();

  addRestaurant({
    id: generateId(),
    name: "Mario's Italian Kitchen",
    cuisine: 'Italian',
    notes: 'Great for date night — cosy atmosphere and excellent pasta.',
    isDineInAvailable: true,
    isTakeoutAvailable: false,
    isDeliveryAvailable: false,
    isFavorite: false,
    createdAt: NOW,
    updatedAt: NOW,
  });

  addRestaurant({
    id: generateId(),
    name: 'Lucky Dragon',
    cuisine: 'Chinese',
    notes: 'Best takeout in town. Fast delivery, generous portions.',
    isDineInAvailable: false,
    isTakeoutAvailable: true,
    isDeliveryAvailable: true,
    isFavorite: false,
    createdAt: NOW,
    updatedAt: NOW,
  });

  addRestaurant({
    id: generateId(),
    name: 'The Burger Joint',
    cuisine: 'American',
    notes: 'Casual and cheap. Good smash burgers and thick shakes.',
    isDineInAvailable: true,
    isTakeoutAvailable: true,
    isDeliveryAvailable: false,
    isFavorite: false,
    createdAt: NOW,
    updatedAt: NOW,
  });

  addRestaurant({
    id: generateId(),
    name: 'Sakura Sushi',
    cuisine: 'Japanese',
    notes: 'Very fresh fish, a bit pricey but worth it for a treat.',
    isDineInAvailable: true,
    isTakeoutAvailable: false,
    isDeliveryAvailable: false,
    isFavorite: false,
    createdAt: NOW,
    updatedAt: NOW,
  });
}

// ─── Pantry ingredients ───────────────────────────────────────────────────────

function seedIngredients() {
  const { addIngredient } = useIngredientStore.getState();

  const names = [
    'Chicken breast',
    'Pasta',
    'Garlic',
    'Onion',
    'Olive oil',
    'Eggs',
    'Rice',
    'Tomato sauce',
  ];

  for (const name of names) {
    addIngredient({
      id: generateId(),
      name,
      inPantry: true,
      createdAt: NOW,
      updatedAt: NOW,
    });
  }
}
