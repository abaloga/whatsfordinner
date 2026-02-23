import { View, Text, StyleSheet, Pressable, ScrollView, Switch, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS } from '../../constants';
import { useUserStore } from '../../store/userStore';
import { seedTestData } from '../../services/seedData';

interface RowProps {
  label: string;
  value?: string;
  onPress?: () => void;
}

function SettingRow({ label, value, onPress }: RowProps) {
  return (
    <Pressable
      style={({ pressed }) => [styles.row, pressed && onPress && styles.pressed]}
      onPress={onPress}
      disabled={!onPress}
    >
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value ?? '›'}</Text>
    </Pressable>
  );
}

/**
 * ProfileScreen — account info and app settings.
 *
 * Scaffold notes:
 *   - Auth section populates once auth is implemented in services/auth.ts.
 *   - Premium section ties into services/payments.ts.
 *   - Notification toggle writes directly to the user store.
 */
export default function ProfileScreen() {
  const user = useUserStore((s) => s.user);
  const updatePreferences = useUserStore((s) => s.updatePreferences);
  const logout = useUserStore((s) => s.logout);

  const initials = user?.displayName?.[0]?.toUpperCase() ?? '?';

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView>
        {/* ── Avatar ── */}
        <View style={styles.avatar}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarInitial}>{initials}</Text>
          </View>
          <Text style={styles.displayName}>{user?.displayName ?? 'Guest'}</Text>
          <Text style={styles.email}>{user?.email ?? 'Not signed in'}</Text>
          {user?.isPremium && (
            <View style={styles.premiumBadge}>
              <Text style={styles.premiumText}>★ Premium</Text>
            </View>
          )}
        </View>

        <View style={styles.sections}>
          {/* ── Account ── */}
          <Text style={styles.sectionTitle}>Account</Text>
          <SettingRow
            label="Sign In"
            value="Coming soon ›"
            onPress={() => { /* TODO: router.push('/login') */ }}
          />
          <SettingRow
            label="Create Account"
            value="Coming soon ›"
            onPress={() => { /* TODO: router.push('/sign-up') */ }}
          />

          {/* ── Premium ── */}
          <Text style={styles.sectionTitle}>Premium</Text>
          <SettingRow
            label="Upgrade to Premium"
            value="Coming soon ›"
            onPress={() => { /* TODO: open paywall */ }}
          />

          {/* ── Preferences ── */}
          <Text style={styles.sectionTitle}>Preferences</Text>
          <SettingRow
            label="Dietary Restrictions"
            value="None ›"
            onPress={() => { /* TODO */ }}
          />
          <SettingRow
            label="Cuisine Preferences"
            value="All ›"
            onPress={() => { /* TODO */ }}
          />
          <View style={[styles.row, styles.switchRow]}>
            <Text style={styles.rowLabel}>Notifications</Text>
            <Switch
              value={user?.preferences.notificationsEnabled ?? false}
              onValueChange={(v) => updatePreferences({ notificationsEnabled: v })}
              trackColor={{ false: COLORS.border, true: COLORS.primary }}
            />
          </View>

          {/* ── Developer ── */}
          <Text style={styles.sectionTitle}>Developer</Text>
          <Pressable
            style={({ pressed }) => [styles.seedBtn, pressed && styles.pressed]}
            onPress={() => {
              seedTestData();
              Alert.alert(
                'Test Data Seeded',
                '5 recipes, 4 places, and 8 pantry ingredients have been added.',
                [{ text: 'OK' }],
              );
            }}
          >
            <Text style={styles.seedBtnText}>Seed Test Data</Text>
          </Pressable>

          {/* ── About ── */}
          <Text style={styles.sectionTitle}>About</Text>
          <SettingRow label="Version" value="1.0.0" />
          <SettingRow label="Privacy Policy" value="›" onPress={() => {}} />
          <SettingRow label="Terms of Service" value="›" onPress={() => {}} />

          {/* ── Sign out ── */}
          {user && (
            <Pressable
              style={({ pressed }) => [styles.signOutButton, pressed && styles.pressed]}
              onPress={logout}
            >
              <Text style={styles.signOutText}>Sign Out</Text>
            </Pressable>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },

  avatar: {
    alignItems: 'center',
    paddingTop: 32,
    paddingBottom: 24,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  avatarCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  avatarInitial: { color: '#fff', fontSize: 32, fontWeight: 'bold' },
  displayName: { fontSize: 18, fontWeight: '700', color: COLORS.text },
  email: { fontSize: 13, color: COLORS.textSecondary, marginTop: 2 },
  premiumBadge: {
    marginTop: 8,
    backgroundColor: '#fef3c7',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  premiumText: { fontSize: 12, fontWeight: '600', color: '#92400e' },

  sections: { padding: 24 },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.muted,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginTop: 24,
    marginBottom: 8,
  },

  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  switchRow: { paddingVertical: 10 },
  rowLabel: { fontSize: 15, color: COLORS.text },
  rowValue: { fontSize: 14, color: COLORS.muted },

  seedBtn: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    marginBottom: 8,
  },
  seedBtnText: { color: COLORS.textSecondary, fontWeight: '600', fontSize: 15 },

  signOutButton: {
    marginTop: 32,
    borderWidth: 1,
    borderColor: '#fecaca',
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
  },
  signOutText: { color: COLORS.danger, fontWeight: '600', fontSize: 15 },

  pressed: { opacity: 0.72 },
});
