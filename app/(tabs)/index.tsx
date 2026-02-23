import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { COLORS } from '../../constants';

export default function HomeScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scroll}>
        {/* ── Hero ── */}
        <View style={styles.hero}>
          <Text style={styles.heroTitle}>WhatsForDinner?</Text>
          <Text style={styles.heroSubtitle}>Let's figure out your next meal.</Text>
        </View>

        {/* ── Primary CTA ── */}
        <Pressable
          style={({ pressed }) => [styles.ctaButton, pressed && styles.pressed]}
          onPress={() => router.push('/(tabs)/decide')}
        >
          <Text style={styles.ctaText}>What's for dinner?</Text>
          <Text style={styles.ctaSubtext}>Start the decision flow</Text>
        </Pressable>

        {/* ── Quick-access cards ── */}
        <Text style={styles.sectionTitle}>Quick access</Text>

        <View style={styles.row}>
          <Pressable
            style={({ pressed }) => [styles.card, styles.cardOrange, pressed && styles.pressed]}
            onPress={() => router.push('/(tabs)/recipes')}
          >
            <Text style={styles.cardIcon}>📖</Text>
            <Text style={styles.cardTitle}>My Recipes</Text>
            <Text style={styles.cardSubtitle}>Saved dishes</Text>
          </Pressable>

          <Pressable
            style={({ pressed }) => [styles.card, styles.cardBlue, pressed && styles.pressed]}
            onPress={() => router.push('/(tabs)/restaurants')}
          >
            <Text style={styles.cardIcon}>🗺️</Text>
            <Text style={styles.cardTitle}>Places</Text>
            <Text style={styles.cardSubtitle}>Go out / order in</Text>
          </Pressable>
        </View>

        <Pressable
          style={({ pressed }) => [styles.wideCard, styles.cardGreen, pressed && styles.pressed]}
          onPress={() => router.push('/(tabs)/ingredients')}
        >
          <Text style={styles.cardIcon}>🥦</Text>
          <Text style={styles.cardTitle}>My Pantry</Text>
          <Text style={styles.cardSubtitle}>Manage your available ingredients</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  scroll: { padding: 24 },

  hero: {
    backgroundColor: COLORS.primary,
    borderRadius: 20,
    padding: 24,
    marginBottom: 16,
  },
  heroTitle: { color: '#fff', fontSize: 28, fontWeight: 'bold' },
  heroSubtitle: { color: '#ffe8d6', fontSize: 14, marginTop: 4 },

  ctaButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
  },
  ctaText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  ctaSubtext: { color: '#ffe8d6', fontSize: 13, marginTop: 2 },

  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 12,
  },

  row: { flexDirection: 'row', gap: 12, marginBottom: 12 },

  card: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
  },
  wideCard: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
  },
  cardOrange: { backgroundColor: '#fff7ed', borderColor: '#fed7aa' },
  cardBlue: { backgroundColor: '#eff6ff', borderColor: '#bfdbfe' },
  cardGreen: { backgroundColor: '#f0fdf4', borderColor: '#bbf7d0' },

  cardIcon: { fontSize: 24 },
  cardTitle: { fontSize: 15, fontWeight: '600', color: COLORS.text, marginTop: 8 },
  cardSubtitle: { fontSize: 12, color: COLORS.textSecondary, marginTop: 2 },

  pressed: { opacity: 0.75 },
});
