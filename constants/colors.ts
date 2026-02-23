/**
 * App colour palette — single source of truth.
 *
 * All components should import from here rather than hard-coding hex values
 * inline. This makes it trivial to add a dark-mode theme in the future.
 */
export const COLORS = {
  // Brand
  primary: '#F97316',       // orange-500
  primaryLight: '#FFEDD5',  // orange-100

  // Backgrounds
  background: '#FFFFFF',
  surface: '#F9FAFB',       // gray-50

  // Typography
  text: '#111827',          // gray-900
  textSecondary: '#4B5563', // gray-600
  muted: '#9CA3AF',         // gray-400

  // Borders
  border: '#E5E7EB',        // gray-200

  // Semantic colours
  danger: '#EF4444',        // red-500
  success: '#22C55E',       // green-500
  warning: '#F59E0B',       // amber-500
  info: '#3B82F6',          // blue-500
} as const;

export type ColorKey = keyof typeof COLORS;
