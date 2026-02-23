import { useState } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { COLORS } from '../../constants';
import { useRecipeStore } from '../../store/recipeStore';
import { useRestaurantStore } from '../../store/restaurantStore';
import { useIngredientStore } from '../../store/ingredientStore';
import type { Recipe, Restaurant } from '../../types';

// ─── Types ────────────────────────────────────────────────────────────────────

type Mode     = 'cook' | 'goOut' | 'generate';
type FlowStep = 'mode' | 'questions' | 'result' | 'celebrate';
type Answers  = Record<string, string>;

interface Option {
  label: string;
  sublabel?: string;
  value: string;
  icon: string;
}

interface Question {
  key: string;
  prompt: string;
  options: Option[];
}

interface MealIdea {
  name: string;
  description: string;
  cuisine: string;
  /** 'quick' = under 30 min, 'normal' = 30–60 min, 'any' = no restriction */
  cookTime: 'quick' | 'normal' | 'any';
  /** protein category for filtering */
  protein: 'chicken' | 'beef' | 'seafood' | 'vegetarian' | 'any';
  keywords: string[];
}

type FlowResult =
  | { kind: 'recipe';      data: Recipe }
  | { kind: 'restaurant';  data: Restaurant }
  | { kind: 'meal';        data: MealIdea; pantryItems: string[] }
  | { kind: 'empty';       mode: Mode }
  | { kind: 'emptyPantry' };

// ─── Mode config ──────────────────────────────────────────────────────────────

const MODES: { id: Mode; label: string; description: string; icon: string; bg: string; border: string }[] = [
  {
    id: 'cook',
    label: 'Cook a Recipe',
    description: 'Choose from your saved recipes.',
    icon: '🍳',
    bg: '#fff7ed',
    border: '#fed7aa',
  },
  {
    id: 'goOut',
    label: 'Go Out / Order In',
    description: 'Pick from your saved places.',
    icon: '🏪',
    bg: '#eff6ff',
    border: '#bfdbfe',
  },
  {
    id: 'generate',
    label: 'Make Something New',
    description: "Get a dinner idea based on what's in your pantry.",
    icon: '✨',
    bg: '#faf5ff',
    border: '#e9d5ff',
  },
];

// ─── Questions config ─────────────────────────────────────────────────────────

const QUESTIONS: Record<Mode, Question[]> = {
  // Cook something — 3 questions
  cook: [
    {
      key: 'time',
      prompt: 'How much time do you have?',
      options: [
        { label: 'Quick',       sublabel: 'Under 30 minutes', value: 'quick',  icon: '⚡' },
        { label: 'Normal',      sublabel: '30–60 minutes',    value: 'normal', icon: '🕐' },
        { label: 'I have time', sublabel: 'No rush at all',   value: 'any',    icon: '⏳' },
      ],
    },
    {
      key: 'cuisine',
      prompt: 'Any cuisine preference?',
      options: [
        { label: 'No preference',       value: 'any',      icon: '🌍' },
        { label: 'Italian',             value: 'italian',  icon: '🍝' },
        { label: 'Asian',               value: 'asian',    icon: '🍜' },
        { label: 'Mexican',             value: 'mexican',  icon: '🌮' },
        { label: 'American',            value: 'american', icon: '🍔' },
      ],
    },
    {
      key: 'protein',
      prompt: 'Type of protein?',
      options: [
        { label: 'No preference', value: 'any',         icon: '🍽️' },
        { label: 'Chicken',       value: 'chicken',     icon: '🍗' },
        { label: 'Beef',          value: 'beef',        icon: '🥩' },
        { label: 'Seafood',       value: 'seafood',     icon: '🐟' },
        { label: 'Vegetarian',    value: 'vegetarian',  icon: '🥦' },
      ],
    },
  ],

  // Go out / order in — 2 questions
  goOut: [
    {
      key: 'service',
      prompt: 'Dining in or ordering out?',
      options: [
        { label: 'Dine-in',       value: 'dineIn',   icon: '🏠' },
        { label: 'Takeout',       value: 'takeout',  icon: '🛍️' },
        { label: 'Either works',  value: 'either',   icon: '✌️' },
      ],
    },
    {
      key: 'vibe',
      prompt: "What's the vibe tonight?",
      options: [
        { label: 'Casual',        value: 'casual',      icon: '😊' },
        { label: 'Fancy',         value: 'fancy',       icon: '✨' },
        { label: 'Fast food',     value: 'fastFood',    icon: '🍟' },
        { label: 'Fast casual',   value: 'fastCasual',  icon: '🌯' },
      ],
    },
  ],

  // Make something new — 3 questions (same structure as cook)
  generate: [
    {
      key: 'time',
      prompt: 'How much time do you have?',
      options: [
        { label: 'Quick',       sublabel: 'Under 30 minutes', value: 'quick',  icon: '⚡' },
        { label: 'Normal',      sublabel: '30–60 minutes',    value: 'normal', icon: '🕐' },
        { label: 'I have time', sublabel: 'No rush at all',   value: 'any',    icon: '⏳' },
      ],
    },
    {
      key: 'cuisine',
      prompt: 'Any cuisine preference?',
      options: [
        { label: 'Whatever works',  value: 'any',      icon: '🌍' },
        { label: 'Italian',         value: 'italian',  icon: '🍝' },
        { label: 'Asian',           value: 'asian',    icon: '🍜' },
        { label: 'Mexican',         value: 'mexican',  icon: '🌮' },
        { label: 'American',        value: 'american', icon: '🍔' },
      ],
    },
    {
      key: 'protein',
      prompt: 'Type of protein?',
      options: [
        { label: 'No preference', value: 'any',         icon: '🍽️' },
        { label: 'Chicken',       value: 'chicken',     icon: '🍗' },
        { label: 'Beef',          value: 'beef',        icon: '🥩' },
        { label: 'Seafood',       value: 'seafood',     icon: '🐟' },
        { label: 'Vegetarian',    value: 'vegetarian',  icon: '🥦' },
      ],
    },
  ],
};

// ─── Meal ideas (dinner-appropriate only) ─────────────────────────────────────
// Breakfast / brunch dishes (omelette, shakshuka, frittata, fried rice, etc.) excluded.

const MEAL_IDEAS: MealIdea[] = [
  // Italian
  { name: 'Pasta Aglio e Olio',         description: 'Garlic, olive oil, and pasta — a classic pantry meal.',          cuisine: 'italian',  cookTime: 'quick',  protein: 'vegetarian', keywords: ['pasta', 'spaghetti', 'garlic', 'olive oil'] },
  { name: 'Spaghetti Bolognese',         description: 'Rich meat sauce over pasta.',                                    cuisine: 'italian',  cookTime: 'normal', protein: 'beef',       keywords: ['pasta', 'spaghetti', 'mince', 'beef', 'tomato'] },
  { name: 'Risotto',                     description: 'Creamy rice dish — endlessly customisable.',                     cuisine: 'italian',  cookTime: 'normal', protein: 'vegetarian', keywords: ['rice', 'arborio', 'parmesan', 'stock', 'broth'] },
  { name: 'Chicken Alfredo',             description: 'Creamy pasta with tender chicken.',                              cuisine: 'italian',  cookTime: 'normal', protein: 'chicken',    keywords: ['chicken', 'pasta', 'cream', 'parmesan', 'butter', 'garlic'] },
  { name: 'Minestrone',                  description: 'Hearty Italian vegetable soup with pasta.',                      cuisine: 'italian',  cookTime: 'normal', protein: 'vegetarian', keywords: ['pasta', 'tomato', 'onion', 'carrot', 'celery', 'beans'] },
  // Asian
  { name: 'Veggie Stir-fry with Rice',   description: 'Toss whatever veg you have in a hot pan with rice.',            cuisine: 'asian',    cookTime: 'quick',  protein: 'vegetarian', keywords: ['rice', 'broccoli', 'carrot', 'onion', 'pepper', 'vegetables'] },
  { name: 'Miso Noodle Soup',            description: 'Simple broth with noodles and any toppings you have.',          cuisine: 'asian',    cookTime: 'quick',  protein: 'vegetarian', keywords: ['noodles', 'miso', 'tofu', 'soy sauce', 'stock'] },
  { name: 'Chicken Stir-fry',            description: 'Season and fry chicken with whatever veg is on hand.',          cuisine: 'asian',    cookTime: 'quick',  protein: 'chicken',    keywords: ['chicken', 'soy sauce', 'ginger', 'garlic', 'vegetables'] },
  { name: 'Pad Thai',                    description: 'Rice noodles stir-fried with a tangy, savoury sauce.',          cuisine: 'asian',    cookTime: 'normal', protein: 'any',        keywords: ['noodles', 'rice noodles', 'soy sauce', 'lime', 'peanut', 'garlic'] },
  { name: 'Teriyaki Salmon',             description: 'Glazed salmon with a sweet soy sauce and rice.',                cuisine: 'asian',    cookTime: 'quick',  protein: 'seafood',    keywords: ['salmon', 'fish', 'soy sauce', 'rice', 'ginger', 'garlic'] },
  { name: 'Beef & Broccoli',             description: 'Classic Chinese-style beef stir-fry with broccoli.',            cuisine: 'asian',    cookTime: 'quick',  protein: 'beef',       keywords: ['beef', 'steak', 'broccoli', 'soy sauce', 'garlic', 'ginger'] },
  // Mexican
  { name: 'Chicken Tacos',               description: 'Season, cook, and wrap — done in 20 minutes.',                  cuisine: 'mexican',  cookTime: 'quick',  protein: 'chicken',    keywords: ['chicken', 'tortilla', 'lime', 'cumin', 'taco'] },
  { name: 'Bean Burritos',               description: 'Hearty and filling from pantry staples.',                        cuisine: 'mexican',  cookTime: 'quick',  protein: 'vegetarian', keywords: ['beans', 'black beans', 'tortilla', 'rice', 'cheese'] },
  { name: 'Beef Enchiladas',             description: 'Rolled tortillas with seasoned beef, smothered in sauce.',      cuisine: 'mexican',  cookTime: 'normal', protein: 'beef',       keywords: ['beef', 'mince', 'tortilla', 'tomato', 'cheese', 'cumin'] },
  { name: 'Chicken Fajitas',             description: 'Sizzling strips of chicken with peppers and onions.',           cuisine: 'mexican',  cookTime: 'quick',  protein: 'chicken',    keywords: ['chicken', 'pepper', 'onion', 'tortilla', 'cumin', 'lime'] },
  { name: 'Prawn Tacos',                 description: 'Juicy prawns with lime slaw in a tortilla.',                    cuisine: 'mexican',  cookTime: 'quick',  protein: 'seafood',    keywords: ['prawn', 'shrimp', 'tortilla', 'lime', 'cabbage'] },
  // American
  { name: 'Grilled Cheese & Tomato Soup',description: 'The ultimate comfort combo.',                                    cuisine: 'american', cookTime: 'quick',  protein: 'vegetarian', keywords: ['bread', 'cheese', 'tomato', 'butter', 'milk'] },
  { name: 'Mac & Cheese',                description: 'From-scratch or boxed — both are valid.',                       cuisine: 'american', cookTime: 'quick',  protein: 'vegetarian', keywords: ['pasta', 'macaroni', 'cheese', 'butter', 'milk'] },
  { name: 'Burger & Fries',              description: 'A classic, satisfying dinner.',                                 cuisine: 'american', cookTime: 'normal', protein: 'beef',       keywords: ['beef', 'mince', 'bun', 'bread', 'potato'] },
  { name: 'Beef Chili',                  description: 'Slow-cooked chili with beans and bold spices.',                 cuisine: 'american', cookTime: 'any',    protein: 'beef',       keywords: ['beef', 'mince', 'beans', 'tomato', 'cumin', 'onion'] },
  { name: 'BBQ Chicken',                 description: 'Smoky, sticky baked chicken — great with coleslaw.',            cuisine: 'american', cookTime: 'normal', protein: 'chicken',    keywords: ['chicken', 'bbq', 'onion', 'garlic', 'paprika'] },
  { name: 'Fish & Chips',                description: 'Crispy battered fish with chunky chips.',                       cuisine: 'american', cookTime: 'normal', protein: 'seafood',    keywords: ['fish', 'cod', 'potato', 'flour', 'oil'] },
  // Any cuisine
  { name: 'Grain Bowl',                  description: 'Grains + veg + protein + sauce.',                               cuisine: 'any',      cookTime: 'normal', protein: 'vegetarian', keywords: ['rice', 'quinoa', 'chickpea', 'avocado', 'lemon'] },
  { name: 'Soup from Scratch',           description: 'Throw everything in a pot and simmer.',                         cuisine: 'any',      cookTime: 'any',    protein: 'vegetarian', keywords: ['stock', 'broth', 'carrot', 'onion', 'celery', 'potato'] },
  { name: 'Chicken & Rice',              description: 'Simple, satisfying, and uses what you already have.',           cuisine: 'any',      cookTime: 'normal', protein: 'chicken',    keywords: ['chicken', 'rice', 'stock', 'garlic', 'onion'] },
  { name: 'Pasta with Whatever You Have',description: 'Pasta is the perfect base for any fridge clean-out.',           cuisine: 'any',      cookTime: 'quick',  protein: 'vegetarian', keywords: ['pasta', 'tomato', 'garlic', 'cheese', 'olive oil'] },
  { name: 'Butter Chicken',              description: 'Creamy, mildly spiced tomato sauce with tender chicken.',       cuisine: 'any',      cookTime: 'normal', protein: 'chicken',    keywords: ['chicken', 'tomato', 'cream', 'butter', 'garlic', 'ginger'] },
  { name: 'Roast Chicken & Vegetables',  description: 'Whole roast chicken with seasonal roasted veg.',               cuisine: 'any',      cookTime: 'any',    protein: 'chicken',    keywords: ['chicken', 'potato', 'carrot', 'onion', 'garlic', 'olive oil'] },
  { name: 'Salmon & Asparagus',          description: 'Simple baked salmon with lemon and asparagus.',                cuisine: 'any',      cookTime: 'quick',  protein: 'seafood',    keywords: ['salmon', 'fish', 'asparagus', 'lemon', 'olive oil', 'garlic'] },
  { name: 'Beef Stir-fry',               description: 'Quick beef and veg stir-fry over noodles or rice.',            cuisine: 'any',      cookTime: 'quick',  protein: 'beef',       keywords: ['beef', 'steak', 'soy sauce', 'ginger', 'garlic', 'onion'] },
];

// ─── Filtering helpers ────────────────────────────────────────────────────────

const MEAT_KEYWORDS = ['beef', 'chicken', 'pork', 'lamb', 'mince', 'steak', 'fish',
  'salmon', 'tuna', 'cod', 'shrimp', 'prawn', 'turkey', 'duck', 'seafood'];

function recipeMatchesTime(recipe: Recipe, time: string): boolean {
  if (time === 'any') return true;
  const minutes = recipe.cookTimeMinutes;
  if (minutes == null) return true; // unknown time — don't exclude
  if (time === 'quick')  return minutes <= 30;
  if (time === 'normal') return minutes <= 60;
  return true;
}

function recipeMatchesCuisine(recipe: Recipe, cuisine: string): boolean {
  if (cuisine === 'any') return true;
  const haystack = [
    recipe.name,
    recipe.description ?? '',
    ...(recipe.tags ?? []),
  ].join(' ').toLowerCase();
  return haystack.includes(cuisine);
}

function recipeMatchesProtein(recipe: Recipe, protein: string): boolean {
  if (protein === 'any') return true;
  const ingNames = recipe.ingredients.map(i => i.name.toLowerCase());
  const haystack = [recipe.name, recipe.description ?? '', ...ingNames].join(' ').toLowerCase();
  if (protein === 'vegetarian') {
    return !MEAT_KEYWORDS.some(k => haystack.includes(k));
  }
  const proteinKeywords: Record<string, string[]> = {
    chicken: ['chicken'],
    beef:    ['beef', 'mince', 'steak', 'ground beef', 'brisket'],
    seafood: ['fish', 'salmon', 'tuna', 'shrimp', 'prawn', 'seafood', 'cod', 'tilapia', 'squid'],
  };
  return (proteinKeywords[protein] ?? [protein]).some(k => haystack.includes(k));
}

function restaurantMatchesVibe(restaurant: Restaurant, vibe: string): boolean {
  const text = [restaurant.name, restaurant.cuisine ?? '', restaurant.notes ?? '']
    .join(' ').toLowerCase();
  switch (vibe) {
    case 'fancy':      return /fancy|fine|upscal|pric[ey]|elegant/.test(text);
    case 'casual':     return /casual|cheap|easy|laid.back|relaxed/.test(text);
    case 'fastFood':   return /fast|burger|fried|chain|quick/.test(text);
    case 'fastCasual': return /casual|burrito|wrap|bowl|taco/.test(text);
    default:           return true;
  }
}

function mealMatchesTime(idea: MealIdea, time: string): boolean {
  if (time === 'any' || idea.cookTime === 'any') return true;
  if (time === 'quick')  return idea.cookTime === 'quick';
  if (time === 'normal') return idea.cookTime === 'quick' || idea.cookTime === 'normal';
  return true;
}

function mealMatchesCuisine(idea: MealIdea, cuisine: string): boolean {
  if (cuisine === 'any') return true;
  return idea.cuisine === cuisine || idea.cuisine === 'any';
}

function mealMatchesProtein(idea: MealIdea, protein: string): boolean {
  if (protein === 'any' || idea.protein === 'any') return true;
  return idea.protein === protein;
}

// ─── Suggestion engine ────────────────────────────────────────────────────────

function pickRandom<T>(arr: T[]): T | null {
  if (arr.length === 0) return null;
  return arr[Math.floor(Math.random() * arr.length)];
}

function scoreMeal(idea: MealIdea, pantryLower: string[]): number {
  return idea.keywords.filter(k =>
    pantryLower.some(p => p.includes(k) || k.includes(p)),
  ).length;
}

const MIN_GENERATE_POOL = 6;

function addUnique(pool: MealIdea[], candidates: MealIdea[], target: number) {
  const seen = new Set(pool.map(m => m.name));
  for (const m of candidates) {
    if (!seen.has(m.name)) { pool.push(m); seen.add(m.name); }
    if (pool.length >= target) break;
  }
}

function buildResult(
  mode: Mode,
  answers: Answers,
  recipes: Recipe[],
  restaurants: Restaurant[],
  pantryItems: string[],
  excludeKey?: string,
): FlowResult {
  // ── Cook ──────────────────────────────────────────────────────────────────
  if (mode === 'cook') {
    const { time = 'any', cuisine = 'any', protein = 'any' } = answers;

    // Apply all three filters
    let pool = recipes.filter(r =>
      recipeMatchesTime(r, time) &&
      recipeMatchesCuisine(r, cuisine) &&
      recipeMatchesProtein(r, protein),
    );

    // Fallback 1: drop protein
    if (pool.length === 0) {
      pool = recipes.filter(r =>
        recipeMatchesTime(r, time) && recipeMatchesCuisine(r, cuisine),
      );
    }

    // Fallback 2: drop cuisine too
    if (pool.length === 0) {
      pool = recipes.filter(r => recipeMatchesTime(r, time));
    }

    // Fallback 3: drop all filters
    if (pool.length === 0) pool = [...recipes];

    if (excludeKey && pool.length > 1) pool = pool.filter(r => r.id !== excludeKey);
    const picked = pickRandom(pool);
    return picked ? { kind: 'recipe', data: picked } : { kind: 'empty', mode };
  }

  // ── Go out ────────────────────────────────────────────────────────────────
  if (mode === 'goOut') {
    const { service = 'either', vibe } = answers;

    let pool = [...restaurants];
    if (service === 'dineIn')  pool = pool.filter(r => r.isDineInAvailable);
    if (service === 'takeout') pool = pool.filter(r => r.isTakeoutAvailable || r.isDeliveryAvailable);
    // 'either' → no filter

    // Vibe filter is soft — only apply if it still leaves results
    if (vibe) {
      const vibeFiltered = pool.filter(r => restaurantMatchesVibe(r, vibe));
      if (vibeFiltered.length > 0) pool = vibeFiltered;
    }

    if (excludeKey && pool.length > 1) pool = pool.filter(r => r.id !== excludeKey);
    const picked = pickRandom(pool);
    return picked ? { kind: 'restaurant', data: picked } : { kind: 'empty', mode };
  }

  // ── Generate ──────────────────────────────────────────────────────────────
  const { time = 'any', cuisine = 'any', protein = 'any' } = answers;
  const pantryLow = pantryItems.map(p => p.toLowerCase());

  // Step 1: all three filters
  let pool = MEAL_IDEAS.filter(m =>
    mealMatchesTime(m, time) && mealMatchesCuisine(m, cuisine) && mealMatchesProtein(m, protein),
  );

  // Step 2: relax protein filter
  if (pool.length < MIN_GENERATE_POOL) {
    addUnique(pool, MEAL_IDEAS.filter(m =>
      mealMatchesTime(m, time) && mealMatchesCuisine(m, cuisine),
    ), MIN_GENERATE_POOL);
  }

  // Step 3: relax time filter (keep cuisine)
  if (pool.length < MIN_GENERATE_POOL) {
    addUnique(pool, MEAL_IDEAS.filter(m => mealMatchesCuisine(m, cuisine)), MIN_GENERATE_POOL);
  }

  // Step 4: relax everything
  if (pool.length < MIN_GENERATE_POOL) {
    addUnique(pool, MEAL_IDEAS, MIN_GENERATE_POOL);
  }

  if (excludeKey && pool.length > 1) pool = pool.filter(m => m.name !== excludeKey);

  const scored   = pool.map(m => ({ idea: m, score: scoreMeal(m, pantryLow) }))
                       .sort((a, b) => b.score - a.score);
  const topScore = scored[0].score;
  const topTier  = topScore > 0 ? scored.filter(s => s.score === topScore) : scored;
  const picked   = pickRandom(topTier.map(s => s.idea));

  return picked
    ? { kind: 'meal', data: picked, pantryItems }
    : { kind: 'empty', mode };
}

function getResultName(result: FlowResult): string {
  if (result.kind === 'recipe')     return result.data.name;
  if (result.kind === 'restaurant') return result.data.name;
  if (result.kind === 'meal')       return result.data.name;
  return '';
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function DecideScreen() {
  const router      = useRouter();
  const recipes     = useRecipeStore(s => s.recipes);
  const restaurants = useRestaurantStore(s => s.restaurants);
  const ingredients = useIngredientStore(s => s.ingredients);
  const pantryItems = ingredients.filter(i => i.inPantry).map(i => i.name);

  const [step,    setStep]    = useState<FlowStep>('mode');
  const [mode,    setMode]    = useState<Mode | null>(null);
  const [answers, setAnswers] = useState<Answers>({});
  const [qIndex,  setQIndex]  = useState(0);
  const [result,  setResult]  = useState<FlowResult | null>(null);

  function reset() {
    setStep('mode');
    setMode(null);
    setAnswers({});
    setQIndex(0);
    setResult(null);
  }

  function chooseMode(m: Mode) {
    setMode(m);
    if (m === 'generate' && pantryItems.length === 0) {
      setResult({ kind: 'emptyPantry' });
      setStep('result');
      return;
    }
    setAnswers({});
    setQIndex(0);
    setStep('questions');
  }

  function answerQuestion(key: string, value: string) {
    const newAnswers = { ...answers, [key]: value };
    setAnswers(newAnswers);
    const questions = QUESTIONS[mode!];
    if (qIndex + 1 >= questions.length) {
      const r = buildResult(mode!, newAnswers, recipes, restaurants, pantryItems);
      setResult(r);
      setStep('result');
    } else {
      setQIndex(qIndex + 1);
    }
  }

  function tryAgain() {
    const excludeKey =
      result?.kind === 'recipe'     ? result.data.id   :
      result?.kind === 'restaurant' ? result.data.id   :
      result?.kind === 'meal'       ? result.data.name :
      undefined;
    const r = buildResult(mode!, answers, recipes, restaurants, pantryItems, excludeKey);
    setResult(r);
  }

  function confirmResult() {
    setStep('celebrate');
  }

  // ── Step: mode ────────────────────────────────────────────────────────────
  if (step === 'mode') {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <ScrollView contentContainerStyle={styles.scroll}>
          <Text style={styles.title}>What's for dinner?</Text>
          <Text style={styles.subtitle}>How are you feeling tonight?</Text>

          {MODES.map(m => (
            <Pressable
              key={m.id}
              style={({ pressed }) => [
                styles.modeCard,
                { backgroundColor: m.bg, borderColor: m.border },
                pressed && styles.pressed,
              ]}
              onPress={() => chooseMode(m.id)}
            >
              <Text style={styles.modeIcon}>{m.icon}</Text>
              <View style={styles.modeBody}>
                <Text style={styles.modeLabel}>{m.label}</Text>
                <Text style={styles.modeDesc}>{m.description}</Text>
              </View>
              <Text style={styles.chevron}>›</Text>
            </Pressable>
          ))}
        </ScrollView>
      </SafeAreaView>
    );
  }

  // ── Step: questions ───────────────────────────────────────────────────────
  if (step === 'questions' && mode) {
    const questions = QUESTIONS[mode];
    const q         = questions[qIndex];
    const total     = questions.length;

    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
        >
          {/* Back */}
          <Pressable
            onPress={() => {
              if (qIndex === 0) { setStep('mode'); }
              else { setQIndex(qIndex - 1); }
            }}
            style={styles.back}
          >
            <Text style={styles.backText}>← Back</Text>
          </Pressable>

          {/* Progress */}
          <View style={styles.progressRow}>
            <View style={styles.progressDots}>
              {questions.map((_, i) => (
                <View key={i} style={[styles.dot, i === qIndex && styles.dotActive]} />
              ))}
            </View>
            <Text style={styles.progressLabel}>
              Step {qIndex + 1} of {total}
            </Text>
          </View>

          <Text style={styles.title}>{q.prompt}</Text>

          <View style={styles.optionList}>
            {q.options.map(opt => (
              <Pressable
                key={opt.value}
                style={({ pressed }) => [
                  styles.optionBtn,
                  pressed && styles.optionBtnPressed,
                ]}
                onPress={() => answerQuestion(q.key, opt.value)}
              >
                <Text style={styles.optionIcon}>{opt.icon}</Text>
                <View style={styles.optionTextBlock}>
                  <Text style={styles.optionLabel}>{opt.label}</Text>
                  {opt.sublabel ? (
                    <Text style={styles.optionSublabel}>{opt.sublabel}</Text>
                  ) : null}
                </View>
                <Text style={styles.optionChevron}>›</Text>
              </Pressable>
            ))}
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // ── Step: result ──────────────────────────────────────────────────────────
  if (step === 'result' && result) {
    const hasContent = result.kind !== 'empty' && result.kind !== 'emptyPantry';
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <ScrollView contentContainerStyle={styles.scroll}>
          <Pressable onPress={reset} style={styles.back}>
            <Text style={styles.backText}>← Start Over</Text>
          </Pressable>

          {result.kind === 'recipe'      && <RecipeResult     recipe={result.data} />}
          {result.kind === 'restaurant'  && <RestaurantResult restaurant={result.data} />}
          {result.kind === 'meal'        && <MealResult       idea={result.data} pantryItems={result.pantryItems} />}
          {result.kind === 'empty'       && <EmptyResult      mode={result.mode} />}
          {result.kind === 'emptyPantry' && <EmptyPantryResult />}

          {hasContent && (
            <View style={styles.actionRow}>
              <Pressable
                style={({ pressed }) => [styles.tryAgainBtn, pressed && styles.pressed]}
                onPress={tryAgain}
              >
                <Text style={styles.tryAgainText}>Not feeling it — try again</Text>
              </Pressable>
              <Pressable
                style={({ pressed }) => [styles.confirmBtn, pressed && styles.pressed]}
                onPress={confirmResult}
              >
                <Text style={styles.confirmText}>Let's do it!</Text>
              </Pressable>
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    );
  }

  // ── Step: celebrate ───────────────────────────────────────────────────────
  if (step === 'celebrate' && result) {
    const name = getResultName(result);
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.celebrateContainer}>
          <Text style={styles.celebrateEmoji}>🎉</Text>
          <Text style={styles.celebrateHeading}>Enjoy your dinner!</Text>
          <View style={styles.celebrateNameCard}>
            <Text style={styles.celebrateName}>{name}</Text>
          </View>
          <Text style={styles.celebrateBody}>
            Great choice. Time to make it happen!
          </Text>
          <Pressable
            style={({ pressed }) => [styles.doneBtn, pressed && styles.pressed]}
            onPress={() => { reset(); router.replace('/'); }}
          >
            <Text style={styles.doneBtnText}>Done  🍽️</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return null;
}

// ─── Result sub-components ────────────────────────────────────────────────────

function RecipeResult({ recipe }: { recipe: Recipe }) {
  return (
    <View style={res.card}>
      <Text style={res.badge}>Cook a Recipe</Text>
      <Text style={res.name}>{recipe.name}</Text>
      {recipe.description ? <Text style={res.body}>{recipe.description}</Text> : null}
      <View style={res.metaRow}>
        {recipe.cookTimeMinutes ? (
          <Text style={res.meta}>⏱ {recipe.cookTimeMinutes} min</Text>
        ) : null}
        {recipe.ingredients.length > 0 ? (
          <Text style={res.meta}>🥄 {recipe.ingredients.length} ingredients</Text>
        ) : null}
        {recipe.servings ? (
          <Text style={res.meta}>👥 Serves {recipe.servings}</Text>
        ) : null}
      </View>
      {recipe.tags && recipe.tags.length > 0 ? (
        <View style={res.chips}>
          {recipe.tags.map(t => (
            <View key={t} style={[res.chip, { backgroundColor: '#fff7ed' }]}>
              <Text style={res.chipText}>{t}</Text>
            </View>
          ))}
        </View>
      ) : null}
    </View>
  );
}

function RestaurantResult({ restaurant }: { restaurant: Restaurant }) {
  return (
    <View style={res.card}>
      <Text style={res.badge}>Go Out / Order In</Text>
      <Text style={res.name}>{restaurant.name}</Text>
      {restaurant.cuisine ? <Text style={res.body}>{restaurant.cuisine}</Text> : null}
      {restaurant.notes   ? <Text style={res.italic}>{restaurant.notes}</Text> : null}
      <View style={res.chips}>
        {restaurant.isDineInAvailable && (
          <View style={[res.chip, { backgroundColor: '#ffedd5' }]}>
            <Text style={res.chipText}>Dine-in</Text>
          </View>
        )}
        {restaurant.isTakeoutAvailable && (
          <View style={[res.chip, { backgroundColor: '#dcfce7' }]}>
            <Text style={res.chipText}>Takeout</Text>
          </View>
        )}
        {restaurant.isDeliveryAvailable && (
          <View style={[res.chip, { backgroundColor: '#dbeafe' }]}>
            <Text style={res.chipText}>Delivery</Text>
          </View>
        )}
      </View>
    </View>
  );
}

function MealResult({ idea, pantryItems }: { idea: MealIdea; pantryItems: string[] }) {
  const preview = pantryItems.slice(0, 6);
  const extra   = pantryItems.length - preview.length;
  return (
    <View style={res.card}>
      <Text style={res.badge}>Generated Idea</Text>
      <Text style={res.name}>{idea.name}</Text>
      <Text style={res.body}>{idea.description}</Text>
      <Text style={res.pantryLabel}>Using from your pantry:</Text>
      <Text style={res.pantryItems}>
        {preview.join(', ')}{extra > 0 ? ` + ${extra} more` : ''}
      </Text>
    </View>
  );
}

function EmptyResult({ mode }: { mode: Mode }) {
  const router = useRouter();
  const config = {
    cook: {
      icon: '📖',
      title: 'No recipes saved yet!',
      body: "Add some recipes first and come back to find tonight's dinner.",
      cta: 'Go to Recipes',
      route: '/(tabs)/recipes' as const,
    },
    goOut: {
      icon: '🗺️',
      title: 'No places saved yet!',
      body: 'Add a few favourite restaurants or takeaways and come back.',
      cta: 'Go to Places',
      route: '/(tabs)/restaurants' as const,
    },
    generate: {
      icon: '🤔',
      title: "Couldn't find a match!",
      body: 'Try again with different options.',
      cta: null,
      route: null,
    },
  }[mode];

  return (
    <View style={res.empty}>
      <Text style={res.emptyIcon}>{config.icon}</Text>
      <Text style={res.emptyTitle}>{config.title}</Text>
      <Text style={res.emptyBody}>{config.body}</Text>
      {config.route ? (
        <Pressable
          style={({ pressed }) => [res.emptyBtn, pressed && styles.pressed]}
          onPress={() => router.push(config.route as any)}
        >
          <Text style={res.emptyBtnText}>{config.cta}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

function EmptyPantryResult() {
  const router = useRouter();
  return (
    <View style={res.empty}>
      <Text style={res.emptyIcon}>🥦</Text>
      <Text style={res.emptyTitle}>Your pantry is empty!</Text>
      <Text style={res.emptyBody}>
        Add some ingredients to your pantry first and we'll suggest a meal based on what you have.
      </Text>
      <Pressable
        style={({ pressed }) => [res.emptyBtn, pressed && styles.pressed]}
        onPress={() => router.push('/(tabs)/ingredients' as any)}
      >
        <Text style={res.emptyBtnText}>Add Pantry Items</Text>
      </Pressable>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safe:   { flex: 1, backgroundColor: COLORS.background },
  scroll: { padding: 24, paddingBottom: 48 },

  title:    { fontSize: 26, fontWeight: 'bold', color: COLORS.text, marginBottom: 24 },
  subtitle: { fontSize: 14, color: COLORS.textSecondary, marginBottom: 28, marginTop: -16 },

  back:     { marginBottom: 24 },
  backText: { fontSize: 15, color: COLORS.primary, fontWeight: '500' },

  // Mode selection cards
  modeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderRadius: 18,
    padding: 18,
    marginBottom: 14,
  },
  modeIcon:  { fontSize: 32, marginRight: 16 },
  modeBody:  { flex: 1 },
  modeLabel: { fontSize: 17, fontWeight: '600', color: COLORS.text },
  modeDesc:  { fontSize: 13, color: COLORS.textSecondary, marginTop: 3 },
  chevron:   { fontSize: 22, color: COLORS.muted, marginLeft: 8 },

  // Progress indicator
  progressRow:  { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 },
  progressDots: { flexDirection: 'row', gap: 6 },
  dot:          { width: 8, height: 8, borderRadius: 4, backgroundColor: COLORS.border },
  dotActive:    { backgroundColor: COLORS.primary, width: 20, borderRadius: 4 },
  progressLabel:{ fontSize: 13, fontWeight: '600', color: COLORS.muted },

  // Answer option buttons — large and tappable
  optionList: { gap: 10 },
  optionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderRadius: 16,
    paddingHorizontal: 18,
    paddingVertical: 18,
    backgroundColor: COLORS.surface,
  },
  optionBtnPressed: {
    borderColor: COLORS.primary,
    backgroundColor: '#fff7ed',
  },
  optionIcon:       { fontSize: 26, marginRight: 14, flexShrink: 0 },
  optionTextBlock:  { flex: 1 },
  optionLabel:      { fontSize: 17, fontWeight: '600', color: COLORS.text },
  optionSublabel:   { fontSize: 13, color: COLORS.textSecondary, marginTop: 2 },
  optionChevron:    { fontSize: 20, color: COLORS.muted, marginLeft: 8 },

  // Result action buttons
  actionRow: { gap: 12, marginTop: 8 },
  tryAgainBtn: {
    borderWidth: 2,
    borderColor: COLORS.border,
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
  },
  tryAgainText: { fontSize: 15, fontWeight: '500', color: COLORS.textSecondary },
  confirmBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
  },
  confirmText: { fontSize: 16, fontWeight: '700', color: '#fff' },

  // Celebrate
  celebrateContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
  celebrateEmoji:     { fontSize: 72, marginBottom: 16 },
  celebrateHeading:   { fontSize: 28, fontWeight: 'bold', color: COLORS.text, textAlign: 'center' },
  celebrateNameCard: {
    marginTop: 20, marginBottom: 16,
    borderWidth: 2, borderColor: COLORS.primary,
    borderRadius: 20, paddingHorizontal: 28, paddingVertical: 18,
    backgroundColor: '#fff7ed', alignItems: 'center',
  },
  celebrateName: { fontSize: 22, fontWeight: '700', color: COLORS.primary, textAlign: 'center' },
  celebrateBody: { fontSize: 15, color: COLORS.textSecondary, textAlign: 'center', marginBottom: 36, lineHeight: 22 },
  doneBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: 16, paddingHorizontal: 40, paddingVertical: 18,
  },
  doneBtnText: { fontSize: 17, fontWeight: '700', color: '#fff' },

  pressed: { opacity: 0.72 },
});

const res = StyleSheet.create({
  card: {
    borderWidth: 1, borderColor: COLORS.border,
    borderRadius: 20, padding: 24,
    backgroundColor: COLORS.surface, marginBottom: 24,
  },
  badge: {
    fontSize: 11, fontWeight: '700', color: COLORS.primary,
    textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10,
  },
  name:   { fontSize: 24, fontWeight: 'bold', color: COLORS.text, marginBottom: 8 },
  body:   { fontSize: 14, color: COLORS.textSecondary, lineHeight: 22, marginBottom: 14 },
  italic: { fontSize: 13, color: COLORS.textSecondary, lineHeight: 20, marginBottom: 12, fontStyle: 'italic' },

  metaRow: { flexDirection: 'row', gap: 16, flexWrap: 'wrap', marginBottom: 12 },
  meta:    { fontSize: 13, color: COLORS.textSecondary },

  chips:    { flexDirection: 'row', gap: 6, flexWrap: 'wrap', marginTop: 4 },
  chip:     { borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4 },
  chipText: { fontSize: 12, fontWeight: '500', color: COLORS.text },

  pantryLabel: {
    fontSize: 11, fontWeight: '700', color: COLORS.muted,
    textTransform: 'uppercase', letterSpacing: 0.5, marginTop: 4, marginBottom: 4,
  },
  pantryItems: { fontSize: 14, color: COLORS.text, lineHeight: 22 },

  empty:      { alignItems: 'center', paddingVertical: 32 },
  emptyIcon:  { fontSize: 56, marginBottom: 16 },
  emptyTitle: { fontSize: 20, fontWeight: '600', color: COLORS.text, marginBottom: 8 },
  emptyBody:  {
    fontSize: 14, color: COLORS.textSecondary,
    textAlign: 'center', lineHeight: 22, marginBottom: 28, paddingHorizontal: 16,
  },
  emptyBtn:     { backgroundColor: COLORS.primary, borderRadius: 14, paddingHorizontal: 28, paddingVertical: 14 },
  emptyBtnText: { color: '#fff', fontWeight: '600', fontSize: 15 },
});
