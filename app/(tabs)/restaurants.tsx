import { useState } from 'react';
import { useRouter } from 'expo-router';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  FlatList,
  Modal,
  TextInput,
  Alert,
  ScrollView,
  Switch,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS } from '../../constants';
import { useRestaurantStore } from '../../store/restaurantStore';
import { generateId } from '../../utils/id';

interface FormState {
  name: string;
  cuisine: string;
  notes: string;
  isDineInAvailable: boolean;
  isTakeoutAvailable: boolean;
  isDeliveryAvailable: boolean;
}

const EMPTY_FORM: FormState = {
  name: '',
  cuisine: '',
  notes: '',
  isDineInAvailable: true,
  isTakeoutAvailable: false,
  isDeliveryAvailable: false,
};

export default function RestaurantsScreen() {
  const router          = useRouter();
  const restaurants     = useRestaurantStore((s) => s.restaurants);
  const addRestaurant   = useRestaurantStore((s) => s.addRestaurant);
  const deleteRestaurant = useRestaurantStore((s) => s.deleteRestaurant);

  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function openModal() {
    setForm(EMPTY_FORM);
    setShowModal(true);
  }

  function handleSave() {
    if (!form.name.trim()) return;
    addRestaurant({
      id: generateId(),
      name:               form.name.trim(),
      cuisine:            form.cuisine.trim()  || undefined,
      notes:              form.notes.trim()    || undefined,
      isDineInAvailable:  form.isDineInAvailable,
      isTakeoutAvailable: form.isTakeoutAvailable,
      isDeliveryAvailable:form.isDeliveryAvailable,
      isFavorite: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    setShowModal(false);
  }

  function confirmDelete(id: string, name: string) {
    Alert.alert(
      'Remove Place',
      `Remove "${name}" from your saved places?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Remove', style: 'destructive', onPress: () => deleteRestaurant(id) },
      ],
    );
  }

  const canSave = form.name.trim().length > 0;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>

      {/* ── Header ── */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Places</Text>
          <Text style={styles.headerSubtitle}>{restaurants.length} saved</Text>
        </View>
        <Pressable
          style={({ pressed }) => [styles.addBtn, pressed && styles.pressed]}
          onPress={openModal}
        >
          <Text style={styles.addBtnText}>+ Add</Text>
        </Pressable>
      </View>

      {/* ── List or empty state ── */}
      {restaurants.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyIcon}>🗺️</Text>
          <Text style={styles.emptyTitle}>No places saved yet</Text>
          <Text style={styles.emptyBody}>
            Save your favourite restaurants, takeaways, and date-night spots so
            they show up in your dinner decision flow.
          </Text>
          <Pressable
            style={({ pressed }) => [styles.emptyBtn, pressed && styles.pressed]}
            onPress={openModal}
          >
            <Text style={styles.emptyBtnText}>+ Add Place</Text>
          </Pressable>
        </View>
      ) : (
        <FlatList
          data={restaurants}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <Pressable
              style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
              onPress={() => router.push({ pathname: '/restaurant/[id]', params: { id: item.id } })}
            >
              {/* Card top row: name + delete */}
              <View style={styles.cardHeader}>
                <Text style={styles.cardName} numberOfLines={1}>{item.name}</Text>
                <Pressable
                  style={({ pressed }) => [styles.deleteBtn, pressed && styles.pressed]}
                  onPress={() => confirmDelete(item.id, item.name)}
                  hitSlop={8}
                >
                  <Text style={styles.deleteBtnText}>✕</Text>
                </Pressable>
              </View>

              {item.cuisine ? (
                <Text style={styles.cardCuisine}>{item.cuisine}</Text>
              ) : null}

              {item.notes ? (
                <Text style={styles.cardNotes} numberOfLines={2}>{item.notes}</Text>
              ) : null}

              {/* Service chips */}
              <View style={styles.chips}>
                {item.isDineInAvailable && (
                  <View style={[styles.chip, styles.chipOrange]}>
                    <Text style={styles.chipText}>Dine-in</Text>
                  </View>
                )}
                {item.isTakeoutAvailable && (
                  <View style={[styles.chip, styles.chipGreen]}>
                    <Text style={styles.chipText}>Takeout</Text>
                  </View>
                )}
                {item.isDeliveryAvailable && (
                  <View style={[styles.chip, styles.chipBlue]}>
                    <Text style={styles.chipText}>Delivery</Text>
                  </View>
                )}
              </View>
            </Pressable>
          )}
          ListFooterComponent={
            <Pressable
              style={({ pressed }) => [styles.dashedAdd, pressed && styles.pressed]}
              onPress={openModal}
            >
              <Text style={styles.dashedAddText}>+ Add Place</Text>
            </Pressable>
          }
        />
      )}

      {/* ── Add Place Modal ── */}
      <Modal
        visible={showModal}
        animationType="slide"
        presentationStyle="fullScreen"
        onRequestClose={() => setShowModal(false)}
      >
        <SafeAreaView style={styles.modalSafe} edges={['top', 'bottom']}>

          <View style={styles.modalHeader}>
            <Pressable onPress={() => setShowModal(false)}>
              <Text style={styles.modalCancel}>Cancel</Text>
            </Pressable>
            <Text style={styles.modalTitle}>Add Place</Text>
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
              onChangeText={(v) => set('name', v)}
              returnKeyType="next"
              autoFocus
            />

            <Text style={styles.label}>Cuisine (optional)</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Italian, Thai, Burgers"
              placeholderTextColor={COLORS.muted}
              value={form.cuisine}
              onChangeText={(v) => set('cuisine', v)}
              returnKeyType="next"
            />

            <Text style={styles.label}>Notes (optional)</Text>
            <TextInput
              style={[styles.input, styles.inputMultiline]}
              placeholder="e.g. Great for date night, cash only, best pizza in town"
              placeholderTextColor={COLORS.muted}
              value={form.notes}
              onChangeText={(v) => set('notes', v)}
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
                onValueChange={(v) => set('isDineInAvailable', v)}
              />
              <ToggleRow
                label="Takeout"
                value={form.isTakeoutAvailable}
                onValueChange={(v) => set('isTakeoutAvailable', v)}
                divider
              />
              <ToggleRow
                label="Delivery"
                value={form.isDeliveryAvailable}
                onValueChange={(v) => set('isDeliveryAvailable', v)}
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

// Small helper to keep the toggle rows DRY
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
  label: { fontSize: 15, color: COLORS.text },
});

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },

  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    padding: 24, paddingBottom: 16,
    borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  headerTitle:    { fontSize: 24, fontWeight: 'bold', color: COLORS.text },
  headerSubtitle: { fontSize: 13, color: COLORS.textSecondary, marginTop: 2 },
  addBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: 20, paddingHorizontal: 16, paddingVertical: 8,
  },
  addBtnText: { color: '#fff', fontWeight: '600', fontSize: 14 },

  empty:     { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
  emptyIcon: { fontSize: 48, marginBottom: 16 },
  emptyTitle:{ fontSize: 18, fontWeight: '600', color: COLORS.text },
  emptyBody: {
    fontSize: 14, color: COLORS.textSecondary,
    textAlign: 'center', marginTop: 8, marginBottom: 24, lineHeight: 22,
  },
  emptyBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: 14, paddingHorizontal: 24, paddingVertical: 12,
  },
  emptyBtnText: { color: '#fff', fontWeight: '600', fontSize: 15 },

  list: { padding: 24, gap: 12 },

  card: {
    borderWidth: 1, borderColor: COLORS.border,
    borderRadius: 16, padding: 16,
    backgroundColor: COLORS.surface,
  },
  cardPressed: { opacity: 0.75 },
  cardHeader: {
    flexDirection: 'row', alignItems: 'flex-start',
    justifyContent: 'space-between', marginBottom: 4,
  },
  cardName:    { fontSize: 17, fontWeight: '700', color: COLORS.text, flex: 1, marginRight: 8 },
  cardCuisine: { fontSize: 13, color: COLORS.textSecondary, marginBottom: 6 },
  cardNotes:   { fontSize: 13, color: COLORS.textSecondary, marginBottom: 10, lineHeight: 18 },
  deleteBtn:   { padding: 4 },
  deleteBtnText: { fontSize: 14, color: COLORS.muted },

  chips: { flexDirection: 'row', gap: 6, flexWrap: 'wrap' },
  chip:  { borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4 },
  chipOrange: { backgroundColor: '#ffedd5' },
  chipGreen:  { backgroundColor: '#dcfce7' },
  chipBlue:   { backgroundColor: '#dbeafe' },
  chipText:   { fontSize: 12, fontWeight: '500', color: COLORS.text },

  dashedAdd: {
    borderWidth: 2, borderStyle: 'dashed',
    borderColor: COLORS.border, borderRadius: 16,
    padding: 16, alignItems: 'center',
  },
  dashedAddText: { color: COLORS.muted, fontSize: 14 },

  modalSafe: { flex: 1, backgroundColor: COLORS.background },
  modalHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 16,
    paddingTop: Platform.OS === 'ios' ? 56 : 16,
    borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  modalCancel: { fontSize: 15, color: COLORS.textSecondary },
  modalTitle:  { fontSize: 16, fontWeight: '700', color: COLORS.text },
  modalSave:   { fontSize: 15, color: COLORS.primary, fontWeight: '700' },
  modalSaveDim:{ color: COLORS.muted },

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
