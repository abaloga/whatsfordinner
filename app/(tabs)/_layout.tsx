import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants';

// Derive the icon name type directly from the Ionicons component so TypeScript
// catches any typos in icon names at compile time.
type IoniconName = React.ComponentProps<typeof Ionicons>['name'];

interface TabConfig {
  name: string;
  title: string;
  icon: IoniconName;
  focusedIcon: IoniconName;
}

const TABS: TabConfig[] = [
  { name: 'index',       title: 'Home',       icon: 'home-outline',        focusedIcon: 'home' },
  { name: 'recipes',     title: 'Recipes',    icon: 'book-outline',        focusedIcon: 'book' },
  { name: 'decide',      title: 'Decide',     icon: 'restaurant-outline',  focusedIcon: 'restaurant' },
  { name: 'restaurants', title: 'Places',     icon: 'map-outline',         focusedIcon: 'map' },
  { name: 'ingredients', title: 'Pantry',     icon: 'nutrition-outline',   focusedIcon: 'nutrition' },
  { name: 'profile',     title: 'Profile',    icon: 'person-outline',      focusedIcon: 'person' },
];

/**
 * TabLayout
 *
 * The bottom-tab shell that hosts all primary screens.
 *
 * Design notes:
 *  - "Decide" is in the centre position — it is the core CTA and benefits
 *    from the most accessible thumb-zone real estate.
 *  - Apple HIG recommends ≤5 tabs; at 6 we're one over. If the design
 *    evolves, consider merging Recipes + Places into a "Saved" tab with a
 *    segmented control inside.
 *  - When a tab needs an internal stack (e.g. Recipes → RecipeDetail),
 *    create a nested layout inside app/(tabs)/recipes/_layout.tsx.
 */
export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.muted,
        tabBarStyle: {
          borderTopColor: COLORS.border,
          backgroundColor: COLORS.background,
        },
      }}
    >
      {TABS.map((tab) => (
        <Tabs.Screen
          key={tab.name}
          name={tab.name}
          options={{
            title: tab.title,
            tabBarIcon: ({ focused, color, size }) => (
              <Ionicons
                name={focused ? tab.focusedIcon : tab.icon}
                size={size}
                color={color}
              />
            ),
          }}
        />
      ))}
    </Tabs>
  );
}
