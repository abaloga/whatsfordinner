import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  SectionList,
  Modal,
  TextInput,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS } from '../../constants';
import { useIngredientStore } from '../../store/ingredientStore';
import { generateId } from '../../utils/id';
import type { Ingredient } from '../../types';

const EMPTY_FORM = { name: '', quantity: '', unit: '' };

export default function IngredientsScreen() {
  const ingredients      = useIngredientStore((s) => s.ingredients);
  const addIngredient    = useIngredientStore((s) => s.addIngredient);
  const updateIngredient = useIngredientStore((s) => s.updateIngredient);
  const deleteIngredient = useIngredientStore((s) => s.deleteIngredient);
  const togglePantry     = useIngredientStore((s) => s.togglePantry);

  // null = modal closed, 'add' = adding new, 'edit' = editing existing
  const [modalMode, setModalMode]   = useState<'add' | 'edit' | null>(null);
  const [editTarget, setEditTarget] = useState<Ingredient | null>(null);
  const [form, setForm]             = useState(EMPTY_FORM);

  const inPantry   = ingredients.filter((i) => i.inPantry);
  const outOfStock = ingredients.filter((i) => !i.inPantry);
  const sections   = [
    { title: `In Pantry (${inPantry.length})`,     data: inPantry },
    { title: `Out of Stock (${outOfStock.length})`, data: outOfStock },
  ].filter((s) => s.data.length > 0);

  function openAddModal() {
    setEditTarget(null);
    setForm(EMPTY_FORM);
    setModalMode('add');
  }

  function openEditModal(item: Ingredient) {
    setEditTarget(item);
    setForm({
      name:     item.name,
      quantity: item.quantity ?? '',
      unit:     item.unit     ?? '',
    });
    setModalMode('edit');
  }

  function closeModal() {
    setModalMode(null);
  }

  function handleSave() {
    if (!form.name.trim()) return;

    if (modalMode === 'add') {
      addIngredient({
        id:        generateId(),
        name:      form.name.trim(),
        quantity:  form.quantity.trim() || undefined,
        unit:      form.unit.trim()     || undefined,
        inPantry:  true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    } else if (modalMode === 'edit' && editTarget) {
      updateIngredient(editTarget.id, {
        name:     form.name.trim(),
        quantity: form.quantity.trim() || undefined,
        unit:     form.unit.trim()     || undefined,
      });
    }

    closeModal();
  }

  function confirmDelete(id: string, name: string) {
    Alert.alert(
      'Remove Ingredient',
      `Remove "${name}" from your pantry?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Remove', style: 'destructive', onPress: () => deleteIngredient(id) },
      ],
    );
  }

  const canSave = form.name.trim().length > 0;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>

      {/* ── Header ── */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>My Pantry</Text>
          <Text style={styles.headerSubtitle}>
            {inPantry.length} available · {outOfStock.length} out of stock
          </Text>
        </View>
        <Pressable
          style={({ pressed }) => [styles.addBtn, pressed && styles.pressed]}
          onPress={openAddModal}
        >
          <Text style={styles.addBtnText}>+ Add</Text>
        </Pressable>
      </View>

      {/* ── List or empty state ── */}
      {ingredients.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyIcon}>🥦</Text>
          <Text style={styles.emptyTitle}>Your pantry is empty</Text>
          <Text style={styles.emptyBody}>
            Track what you have on hand so the app can suggest recipes you can
            actually make tonight.
          </Text>
          <Pressable
            style={({ pressed }) => [styles.emptyBtn, pressed && styles.pressed]}
            onPress={openAddModal}
          >
            <Text style={styles.emptyBtnText}>+ Add Ingredient</Text>
          </Pressable>
        </View>
      ) : (
        <SectionList
          sections={sections}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          renderSectionHeader={({ section }) => (
            <Text style={styles.sectionHeader}>{section.title}</Text>
          )}
          renderItem={({ item }) => (
            <View style={styles.row}>
              {/* Tap the main area to toggle in-pantry status */}
              <Pressable
                style={styles.rowMain}
                onPress={() => togglePantry(item.id)}
              >
                <View style={[styles.checkbox, item.inPantry && styles.checkboxOn]} />
                <View style={styles.rowText}>
                  <Text style={styles.rowName}>{item.name}</Text>
                  {(item.quantity || item.unit) ? (
                    <Text style={styles.rowMeta}>
                      {[item.quantity, item.unit].filter(Boolean).join(' ')}
                    </Text>
                  ) : null}
                </View>
              </Pressable>

              {/* Edit button */}
              <Pressable
                style={({ pressed }) => [styles.iconBtn, pressed && styles.pressed]}
                onPress={() => openEditModal(item)}
                hitSlop={8}
              >
                <Text style={styles.editBtnText}>✏</Text>
              </Pressable>

              {/* Delete button */}
              <Pressable
                style={({ pressed }) => [styles.iconBtn, styles.deleteSeparator, pressed && styles.pressed]}
                onPress={() => confirmDelete(item.id, item.name)}
                hitSlop={8}
              >
                <Text style={styles.deleteBtnText}>✕</Text>
              </Pressable>
            </View>
          )}
          ListFooterComponent={
            <Pressable
              style={({ pressed }) => [styles.dashedAdd, pressed && styles.pressed]}
              onPress={openAddModal}
            >
              <Text style={styles.dashedAddText}>+ Add Ingredient</Text>
            </Pressable>
          }
        />
      )}

      {/* ── Add / Edit Ingredient Modal ── */}
      <Modal
        visible={modalMode !== null}
        animationType="slide"
        presentationStyle="fullScreen"
        onRequestClose={closeModal}
      >
        <SafeAreaView style={styles.modalSafe} edges={['top', 'bottom']}>

          <View style={styles.modalHeader}>
            <Pressable onPress={closeModal}>
              <Text style={styles.modalCancel}>Cancel</Text>
            </Pressable>
            <Text style={styles.modalTitle}>
              {modalMode === 'edit' ? 'Edit Ingredient' : 'Add Ingredient'}
            </Text>
            <Pressable onPress={handleSave} disabled={!canSave}>
              <Text style={[styles.modalSave, !canSave && styles.modalSaveDim]}>
                Save
              </Text>
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
                    placeholder="e.g. Olive oil"
                    placeholderTextColor={COLORS.muted}
                    value={form.name}
                    onChangeText={(v) => setForm((f) => ({ ...f, name: v }))}
                    returnKeyType="next"
                    autoFocus
                  />

                  <Text style={styles.label}>Quantity (optional)</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="e.g. 500, a pinch, half"
                    placeholderTextColor={COLORS.muted}
                    value={form.quantity}
                    onChangeText={(v) => setForm((f) => ({ ...f, quantity: v }))}
                    returnKeyType="next"
                  />

                  <Text style={styles.label}>Unit (optional)</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="e.g. ml, g, cups, tbsp"
                    placeholderTextColor={COLORS.muted}
                    value={form.unit}
                    onChangeText={(v) => setForm((f) => ({ ...f, unit: v }))}
                    returnKeyType="done"
                    onSubmitEditing={handleSave}
                  />

                  {modalMode === 'add' ? (
                    <Text style={styles.hint}>
                      Tap an ingredient in the list to toggle whether it's currently in stock.
                    </Text>
                  ) : null}
                </View>
              </TouchableWithoutFeedback>
            </ScrollView>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerTitle:    { fontSize: 24, fontWeight: 'bold', color: COLORS.text },
  headerSubtitle: { fontSize: 13, color: COLORS.textSecondary, marginTop: 2 },
  addBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  addBtnText: { color: '#fff', fontWeight: '600', fontSize: 14 },

  // Empty state
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

  // List
  list: { padding: 24 },
  sectionHeader: {
    fontSize: 11, fontWeight: '700', color: COLORS.muted,
    textTransform: 'uppercase', letterSpacing: 1,
    marginTop: 16, marginBottom: 8,
  },

  // Row
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 14,
    backgroundColor: COLORS.surface,
    marginBottom: 8,
    overflow: 'hidden',
  },
  rowMain: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
  },
  checkbox: {
    width: 22, height: 22, borderRadius: 11,
    borderWidth: 2, borderColor: COLORS.border,
    marginRight: 12, flexShrink: 0,
  },
  checkboxOn: { backgroundColor: COLORS.success, borderColor: COLORS.success },
  rowText:    { flex: 1 },
  rowName:    { fontSize: 15, fontWeight: '500', color: COLORS.text },
  rowMeta:    { fontSize: 12, color: COLORS.textSecondary, marginTop: 2 },

  // Icon buttons (edit + delete) share the same base style
  iconBtn: {
    paddingHorizontal: 14, paddingVertical: 14,
    borderLeftWidth: 1, borderLeftColor: COLORS.border,
    justifyContent: 'center', alignItems: 'center',
  },
  deleteSeparator: {},
  editBtnText:   { fontSize: 13, color: COLORS.primary },
  deleteBtnText: { fontSize: 14, color: COLORS.muted },

  // Dashed add button at bottom of list
  dashedAdd: {
    borderWidth: 2, borderStyle: 'dashed',
    borderColor: COLORS.border, borderRadius: 14,
    padding: 14, alignItems: 'center', marginTop: 4,
  },
  dashedAddText: { color: COLORS.muted, fontSize: 14 },

  // Modal
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

  // Form
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
  hint: {
    fontSize: 13, color: COLORS.muted,
    textAlign: 'center', marginTop: 8, lineHeight: 20,
  },

  pressed: { opacity: 0.7 },
});
