import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  Modal,
  TextInput,
  Switch,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { COLORS } from '../../constants';
import { useRestaurantStore } from '../../store/restaurantStore';

// ─── Form state shape (mirrors restaurants.tsx) ───────────────────────────────

interface FormState {
  name: string;
  cuisine: string;
  notes: string;
  isDineInAvailable: boolean;
  isTakeoutAvailable: boolean;
  isDeliveryAvailable: boolean;
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function RestaurantDetailScreen() {
  const { id }           = useLocalSearchParams<{ id: string }>();
  const router           = useRouter();
  const restaurant       = useRestaurantStore(s => s.restaurants.find(r => r.id === id));
  const updateRestaurant = useRestaurantStore(s => s.updateRestaurant);

  // Edit modal state — all hooks must be called before any early return
  const [showEdit, setShowEdit] = useState(false);
  const [form, setForm]         = useState<FormState>({
    name: '', cuisine: '', notes: '',
    isDineInAvailable: true, isTakeoutAvailable: false, isDeliveryAvailable: false,
  });

  if (!restaurant) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <Pressable onPress={() => router.back()} style={styles.back}>
          <Text style={styles.backText}>← Back</Text>
        </Pressable>
        <View style={styles.notFound}>
          <Text style={styles.notFoundText}>Place not found.</Text>
        </View>
      </SafeAreaView>
    );
  }

  // ── Edit modal helpers ───────────────────────────────────────────────────

  function openEdit() {
    setForm({
      name:                restaurant.name,
      cuisine:             restaurant.cuisine             ?? '',
      notes:               restaurant.notes               ?? '',
      isDineInAvailable:   restaurant.isDineInAvailable,
      isTakeoutAvailable:  restaurant.isTakeoutAvailable,
      isDeliveryAvailable: restaurant.isDeliveryAvailable,
    });
    setShowEdit(true);
  }

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm(f => ({ ...f, [key]: value }));
  }

  function handleSave() {
    if (!form.name.trim()) return;
    updateRestaurant(restaurant.id, {
      name:                form.name.trim(),
      cuisine:             form.cuisine.trim()  || undefined,
      notes:               form.notes.trim()    || undefined,
      isDineInAvailable:   form.isDineInAvailable,
      isTakeoutAvailable:  form.isTakeoutAvailable,
      isDeliveryAvailable: form.isDeliveryAvailable,
    });
    setShowEdit(false);
  }

  const canSave = form.name.trim().length > 0;

  // ── Detail view ─────────────────────────────────────────────────────────

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scroll}>

        {/* ── Top bar: back + edit ── */}
        <View style={styles.topBar}>
          <Pressable onPress={() => router.back()} style={styles.back}>
            <Text style={styles.backText}>← Back</Text>
          </Pressable>
          <Pressable
            style={({ pressed }) => [styles.editBtn, pressed && styles.pressed]}
            onPress={openEdit}
          >
            <Text style={styles.editBtnText}>Edit</Text>
          </Pressable>
        </View>

        {/* ── Name & cuisine ── */}
        <Text style={styles.name}>{restaurant.name}</Text>
        {restaurant.cuisine ? (
          <Text style={styles.cuisine}>{restaurant.cuisine}</Text>
        ) : null}

        {/* ── Service type chips ── */}
        <View style={styles.chipRow}>
          {restaurant.isDineInAvailable && (
            <View style={[styles.chip, styles.chipOrange]}>
              <Text style={styles.chipText}>🏠 Dine-in</Text>
            </View>
          )}
          {restaurant.isTakeoutAvailable && (
            <View style={[styles.chip, styles.chipGreen]}>
              <Text style={styles.chipText}>🛍️ Takeout</Text>
            </View>
          )}
          {restaurant.isDeliveryAvailable && (
            <View style={[styles.chip, styles.chipBlue]}>
              <Text style={styles.chipText}>🛵 Delivery</Text>
            </View>
          )}
        </View>

        {/* ── Notes ── */}
        {restaurant.notes ? (
          <>
            <Text style={styles.sectionTitle}>Notes</Text>
            <View style={styles.notesCard}>
              <Text style={styles.notesText}>{restaurant.notes}</Text>
            </View>
          </>
        ) : null}

        <View style={{ height: 32 }} />
      </ScrollView>

      {/* ── Edit Place Modal ── */}
      <Modal
        visible={showEdit}
        animationType="slide"
        presentationStyle="fullScreen"
        onRequestClose={() => setShowEdit(false)}
      >
        <SafeAreaView style={styles.modalSafe} edges={['top', 'bottom']}>

          <View style={styles.modalHeader}>
            <Pressable onPress={() => setShowEdit(false)}>
              <Text style={styles.modalCancel}>Cancel</Text>
            </Pressable>
            <Text style={styles.modalTitle}>Edit Place</Text>
            <Pressable onPress={handleSave} disabled={!canSave}>
              <Text style={[styles.modalSave, !canSave && styles.modalSaveDim]}>Save</Text>
            </Pressable>
          </View>

          <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          >
            <ScrollView
              style={styles.form}
              contentContainerStyle={styles.formContent}
              keyboardShouldPersistTaps="handled"
              keyboardDismissMode="interactive"
            >
              <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <View>
                  <Text style={styles.label}>Name *</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="e.g. Bella Italia"
                    placeholderTextColor={COLORS.muted}
                    value={form.name}
                    onChangeText={v => set('name', v)}
                    returnKeyType="next"
                    autoFocus
                  />

                  <Text style={styles.label}>Cuisine (optional)</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="e.g. Italian, Thai, Burgers"
                    placeholderTextColor={COLORS.muted}
                    value={form.cuisine}
                    onChangeText={v => set('cuisine', v)}
                    returnKeyType="next"
                  />

                  <Text style={styles.label}>Notes (optional)</Text>
                  <TextInput
                    style={[styles.input, styles.inputMultiline]}
                    placeholder="e.g. Great for date night, cash only, best pizza in town"
                    placeholderTextColor={COLORS.muted}
                    value={form.notes}
                    onChangeText={v => set('notes', v)}
                    multiline
                    numberOfLines={3}
                    textAlignVertical="top"
                    returnKeyType="default"
                  />

                  <Text style={styles.label}>Available as</Text>
                  <View style={styles.toggleCard}>
                    <ToggleRow
                      label="Dine-in"
                      value={form.isDineInAvailable}
                      onValueChange={v => set('isDineInAvailable', v)}
                    />
                    <ToggleRow
                      label="Takeout"
                      value={form.isTakeoutAvailable}
                      onValueChange={v => set('isTakeoutAvailable', v)}
                      divider
                    />
                    <ToggleRow
                      label="Delivery"
                      value={form.isDeliveryAvailable}
                      onValueChange={v => set('isDeliveryAvailable', v)}
                      divider
                    />
                  </View>
                </View>
              </TouchableWithoutFeedback>
            </ScrollView>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

// ─── Toggle row helper (mirrors restaurants.tsx) ──────────────────────────────

function ToggleRow({
  label,
  value,
  onValueChange,
  divider = false,
}: {
  label: string;
  value: boolean;
  onValueChange: (v: boolean) => void;
  divider?: boolean;
}) {
  return (
    <View style={[toggleStyles.row, divider && toggleStyles.divider]}>
      <Text style={toggleStyles.label}>{label}</Text>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: COLORS.border, true: COLORS.primary }}
        thumbColor="#fff"
      />
    </View>
  );
}

const toggleStyles = StyleSheet.create({
  row: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between', paddingVertical: 12,
  },
  divider: { borderTopWidth: 1, borderTopColor: COLORS.border },
  label:   { fontSize: 15, color: COLORS.text },
});

const styles = StyleSheet.create({
  safe:   { flex: 1, backgroundColor: COLORS.background },
  scroll: { padding: 24 },

  // Top bar
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  back:     { flex: 1 },
  backText: { fontSize: 15, color: COLORS.primary, fontWeight: '500' },
  editBtn: {
    borderWidth: 1.5,
    borderColor: COLORS.primary,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 7,
  },
  editBtnText: { fontSize: 14, color: COLORS.primary, fontWeight: '600' },

  notFound:     { flex: 1, alignItems: 'center', justifyContent: 'center' },
  notFoundText: { fontSize: 16, color: COLORS.muted },

  name:    { fontSize: 28, fontWeight: 'bold', color: COLORS.text, marginBottom: 6 },
  cuisine: { fontSize: 16, color: COLORS.textSecondary, marginBottom: 16 },

  chipRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap', marginBottom: 24 },
  chip:    { borderRadius: 20, paddingHorizontal: 14, paddingVertical: 8 },
  chipOrange: { backgroundColor: '#ffedd5' },
  chipGreen:  { backgroundColor: '#dcfce7' },
  chipBlue:   { backgroundColor: '#dbeafe' },
  chipText:   { fontSize: 14, fontWeight: '500', color: COLORS.text },

  sectionTitle: {
    fontSize: 13, fontWeight: '700', color: COLORS.muted,
    textTransform: 'uppercase', letterSpacing: 1,
    marginBottom: 10,
  },
  notesCard: {
    borderWidth: 1, borderColor: COLORS.border,
    borderRadius: 14, padding: 16,
    backgroundColor: COLORS.surface,
  },
  notesText: { fontSize: 15, color: COLORS.text, lineHeight: 24 },

  // ── Modal / Form ──────────────────────────────────────────────────────────

  modalSafe: { flex: 1, backgroundColor: COLORS.background },
  modalHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 16,
    paddingTop: Platform.OS === 'ios' ? 56 : 16,
    borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  modalCancel:  { fontSize: 15, color: COLORS.textSecondary },
  modalTitle:   { fontSize: 16, fontWeight: '700', color: COLORS.text },
  modalSave:    { fontSize: 15, color: COLORS.primary, fontWeight: '700' },
  modalSaveDim: { color: COLORS.muted },

  form:        { flex: 1 },
  formContent: { padding: 24 },
  label: {
    fontSize: 13, fontWeight: '600',
    color: COLORS.textSecondary, marginBottom: 6,
  },
  input: {
    borderWidth: 1, borderColor: COLORS.border, borderRadius: 10,
    paddingHorizontal: 14, paddingVertical: 12,
    fontSize: 15, color: COLORS.text,
    backgroundColor: '#fff', marginBottom: 20,
  },
  inputMultiline: { height: 88, textAlignVertical: 'top' },
  toggleCard: {
    borderWidth: 1, borderColor: COLORS.border,
    borderRadius: 12, paddingHorizontal: 16,
    backgroundColor: '#fff', marginBottom: 24,
  },

  pressed: { opacity: 0.7 },
});
