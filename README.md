# WhatsForDinner

A mobile-first app that helps you decide what to eat for dinner. Built with Expo SDK 54 and React Native 0.81.

---

## How to run

```bash
npm start
```

Then:
- Press **`i`** for iOS simulator
- Press **`a`** for Android emulator
- Scan the QR code in the **Expo Go** app on your physical device

> No Xcode or Android Studio needed to run on a physical device via Expo Go.

---

## Tech stack

| Layer | Package | Why |
|---|---|---|
| Framework | Expo SDK 54 | Managed workflow, over-the-air updates, easy device APIs |
| Navigation | expo-router 6 | File-based routing, typed routes, deep-link ready |
| State | Zustand 5 | Zero boilerplate, isolated stores, persist middleware |
| Persistence | AsyncStorage 2 | Local-first; works offline from day one |
| Language | TypeScript 5.9 | Full type safety across models and navigation |
| Styling | React Native StyleSheet | No extra deps; clear, co-located styles |

**Intentionally excluded from this scaffold** (add later):
- `react-native-reanimated` — needed for animated tab bars, shared-element transitions
- `react-native-gesture-handler` — needed for swipe gestures and drawers
- NativeWind — Tailwind-style utility classes for RN

---

## Project structure

```
whatsfordinner/
├── app/                         # expo-router screens (file = route)
│   ├── _layout.tsx              # Root Stack — wraps tabs + future modals
│   └── (tabs)/
│       ├── _layout.tsx          # Bottom Tab navigator (6 tabs)
│       ├── index.tsx            # Home — dashboard + quick links
│       ├── decide.tsx           # Decide — 3-step dinner decision flow
│       ├── recipes.tsx          # My Recipes — CRUD list
│       ├── restaurants.tsx      # Places — CRUD list
│       ├── ingredients.tsx      # My Pantry — in/out-of-stock toggle
│       └── profile.tsx          # Profile — settings, auth, premium
│
├── types/
│   └── index.ts                 # All TypeScript interfaces + flow types
├── constants/
│   ├── colors.ts                # Brand palette (single source of truth)
│   └── index.ts                 # Re-exports + storage keys + config
├── store/                       # Zustand stores (all persisted)
│   ├── recipeStore.ts
│   ├── restaurantStore.ts
│   ├── ingredientStore.ts
│   └── userStore.ts
├── services/                    # External integrations (mostly scaffolded)
│   ├── storage.ts               # Low-level AsyncStorage helpers
│   ├── auth.ts                  # Auth scaffold (not implemented)
│   ├── payments.ts              # IAP scaffold (not implemented)
│   ├── maps.ts                  # Location scaffold (not implemented)
│   └── camera.ts                # Camera scaffold (not implemented)
├── components/                  # Reusable UI components (empty, ready to grow)
├── hooks/                       # Custom React hooks (empty, ready to grow)
│
├── assets/                      # App icons, splash screen (from create-expo-app)
├── app.json                     # Expo config: scheme, plugins, bundle IDs
├── package.json                 # main = "expo-router/entry"
├── tsconfig.json
└── .npmrc                       # legacy-peer-deps=true (required for React 19 + RN)
```

---

## Architecture decisions

### expo-router over React Navigation directly
expo-router is built on React Navigation but adds file-based routing — each file in `app/` automatically becomes a route. Benefits for this app:
- **Typed routes**: `router.push('/(tabs)/decide')` is type-checked (enabled via `experiments.typedRoutes`)
- **Deep linking**: the `scheme` field in `app.json` makes every route a URL automatically
- **Less boilerplate**: no `createNativeStackNavigator<ParamList>()` setup needed

### Zustand over Redux / Context
Three concrete reasons for a solo dev:
1. **Zero boilerplate**: define store in ~15 lines, no actions/reducers/selectors to wire up
2. **Isolated stores**: each domain (recipes, restaurants, ingredients, user) is a separate store — components can subscribe to only what they need, avoiding unnecessary re-renders
3. **Built-in persistence**: one line of `persist(...)` wrapping syncs every store to AsyncStorage on every state change

### Local-first / AsyncStorage
All data starts on-device. The app is fully functional offline from day one. When a backend is added (e.g. Supabase for auth, a Postgres DB for cloud sync), the store actions can be extended to also call the server — component code stays unchanged.

### StyleSheet over NativeWind
NativeWind is excluded from the initial scaffold because:
- NativeWind v4 requires additional Metro and Babel config that can be fragile to set up
- For a beginner, StyleSheet is more transparent — you can see exactly what CSS property you're setting
- It can be added later once the core screens are working

### Scaffold services for auth / payments / maps / camera
Each service file defines the TypeScript interface for its feature and documents exactly which library to install and how. This means:
1. TypeScript catches call-site mismatches before the feature ships
2. The implementation path is documented alongside the stub
3. There's no dead code to delete — just fill in the function bodies

### Navigation structure
```
RootLayout (Stack — app/_layout.tsx)
└── (tabs) → TabLayout (Tabs — app/(tabs)/_layout.tsx)
    ├── index       Home
    ├── recipes     My Recipes
    ├── decide      Decide ← centre tab, primary CTA
    ├── restaurants Places
    ├── ingredients My Pantry
    └── profile     Profile
```

When a tab needs an internal stack (e.g. Recipes → RecipeDetail → EditRecipe), add a `_layout.tsx` inside `app/(tabs)/recipes/` and move `recipes.tsx` to `app/(tabs)/recipes/index.tsx`.

---

## Implementing features

### Adding a new screen
1. Create `app/my-screen.tsx` (or `app/(tabs)/my-screen.tsx` for a tab)
2. If it needs URL params: `app/recipe/[id].tsx` (expo-router handles the typing)
3. Navigate to it: `router.push('/my-screen')` or `router.push('/recipe/123')`

### Authentication
1. Pick a provider: [Supabase](https://supabase.com) is recommended for solo devs (free tier, good RN SDK)
2. `npx expo install @supabase/supabase-js`
3. Implement `services/auth.ts`
4. In `app/_layout.tsx`, read `useUserStore(s => s.isAuthenticated)` and conditionally show a login screen:
   ```tsx
   const isAuthenticated = useUserStore(s => s.isAuthenticated);
   if (!isAuthenticated) return <Redirect href="/login" />;
   ```

### Payments / Premium tier
1. `npx expo install react-native-purchases` ([RevenueCat](https://www.revenuecat.com))
2. Implement `services/payments.ts`
3. Gate premium features: `if (!user.isPremium) return <Paywall />;`

### Maps & restaurant search
1. `npx expo install expo-location`
2. Add `"expo-location"` to `plugins` in `app.json`
3. Implement `services/maps.ts`

### Camera & ingredient scanning
1. `npx expo install expo-camera expo-image-picker`
2. Add `"expo-camera"` to `plugins` in `app.json`
3. Implement `services/camera.ts`

### Suggestion engine (Decide screen)
The three-step flow in `app/(tabs)/decide.tsx` is interactive but step 3 is a placeholder. When implementing:
- **Guided mode**: render a series of `Question → Answer` cards that filter the store data by the answers collected in `DecisionState.answers`
- **Random mode**: `recipes[Math.floor(Math.random() * recipes.length)]`
- **Generate from pantry**: cross-reference `ingredientStore.ingredients.filter(i => i.inPantry)` against recipe ingredient lists, or send the list to an LLM API

---

## Before releasing to App Store / Play Store

- [ ] Replace placeholder bundle IDs in `app.json` (`ios.bundleIdentifier`, `android.package`)
- [ ] Add real icon (`assets/icon.png` 1024×1024) and splash (`assets/splash-icon.png`)
- [ ] Run `npx expo prebuild` to generate native iOS/Android projects
- [ ] Store API keys with `expo-constants` + EAS Secrets (never commit keys to git)
- [ ] Add error tracking: `npx expo install @sentry/react-native`
