import { useState } from 'react';
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
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { COLORS } from '../../constants';
import { useRecipeStore } from '../../store/recipeStore';
import { generateId } from '../../utils/id';
import type { RecipeIngredient } from '../../types';

// ─── Form state shapes ───────────────────────────────────────────────────────

interface BasicFields {
  name: string;
  description: string;
  cookTimeMinutes: string; // kept as string; parsed to number on save
  tags: string;            // comma-separated; split to array on save
}

interface IngredientDraft {
  name: string;
  quantity: string;
  unit: string;
}

const EMPTY_BASIC: BasicFields   = { name: '', description: '', cookTimeMinutes: '', tags: '' };
const EMPTY_ING: IngredientDraft = { name: '', quantity: '', unit: '' };

// ─── Screen ──────────────────────────────────────────────────────────────────

export default function RecipesScreen() {
  const router        = useRouter();
  const recipes       = useRecipeStore((s) => s.recipes);
  const addRecipe     = useRecipeStore((s) => s.addRecipe);
  const deleteRecipe  = useRecipeStore((s) => s.deleteRecipe);

  const [showModal, setShowModal] = useState(false);

  // Basic text fields
  const [basic, setBasic] = useState<BasicFields>(EMPTY_BASIC);

  // Dynamic ingredient list being built inside the form
  const [ingList, setIngList] = useState<RecipeIngredient[]>([]);
  const [ingDraft, setIngDraft] = useState<IngredientDraft>(EMPTY_ING);

  // Dynamic instruction list
  const [steps, setSteps] = useState<string[]>([]);
  const [stepDraft, setStepDraft] = useState('');

  // ── Helpers ──────────────────────────────────────────────────────────────

  function openModal() {
    setBasic(EMPTY_BASIC);
    setIngList([]);
    setIngDraft(EMPTY_ING);
    setSteps([]);
    setStepDraft('');
    setShowModal(true);
  }

  function setField<K extends keyof BasicFields>(key: K, value: string) {
    setBasic((b) => ({ ...b, [key]: value }));
  }

  function addIngredient() {
    if (!ingDraft.name.trim()) return;
    setIngList((list) => [
      ...list,
      {
        name:     ingDraft.name.trim(),
        quantity: ingDraft.quantity.trim() || undefined,
        unit:     ingDraft.unit.trim()     || undefined,
      },
    ]);
    setIngDraft(EMPTY_ING);
  }

  function removeIngredient(index: number) {
    setIngList((list) => list.filter((_, i) => i !== index));
  }

  function addStep() {
    if (!stepDraft.trim()) return;
    setSteps((s) => [...s, stepDraft.trim()]);
    setStepDraft('');
  }

  function removeStep(index: number) {
    setSteps((s) => s.filter((_, i) => i !== index));
  }

  function handleSave() {
    if (!basic.name.trim()) return;

    const tags = basic.tags
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    const cookMinRaw = parseInt(basic.cookTimeMinutes, 10);
    const cookTimeMinutes = Number.isNaN(cookMinRaw) ? undefined : cookMinRaw;

    addRecipe({
      id: generateId(),
      name:             basic.name.trim(),
      description:      basic.description.trim() || undefined,
      ingredients:      ingList,
      instructions:     steps,
      cookTimeMinutes,
      tags:             tags.length ? tags : undefined,
      isFavorite:       false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    setShowModal(false);
  }

  function confirmDelete(id: string, name: string) {
    Alert.alert(
      'Delete Recipe',
      `Delete "${name}"? This cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => deleteRecipe(id) },
      ],
    );
  }

  const canSave       = basic.name.trim().length > 0;
  const canAddIng     = ingDraft.name.trim().length > 0;
  const canAddStep    = stepDraft.trim().length > 0;

  // ── Render ───────────────────────────────────────────────────────────────

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>

      {/* ── Header ── */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>My Recipes</Text>
          <Text style={styles.headerSubtitle}>{recipes.length} saved</Text>
        </View>
        <Pressable
          style={({ pressed }) => [styles.addBtn, pressed && styles.pressed]}
          onPress={openModal}
        >
          <Text style={styles.addBtnText}>+ Add</Text>
        </Pressable>
      </View>

      {/* ── List or empty state ── */}
      {recipes.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyIcon}>📖</Text>
          <Text style={styles.emptyTitle}>No recipes yet</Text>
          <Text style={styles.emptyBody}>
            Save your go-to dishes so they appear as options when you decide
            what to cook tonight.
          </Text>
          <Pressable
            style={({ pressed }) => [styles.emptyBtn, pressed && styles.pressed]}
            onPress={openModal}
          >
            <Text style={styles.emptyBtnText}>+ Add Recipe</Text>
          </Pressable>
        </View>
      ) : (
        <FlatList
          data={recipes}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <Pressable
              style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
              onPress={() => router.push({ pathname: '/recipe/[id]', params: { id: item.id } })}
            >
              {/* Card header: name + delete */}
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

              {item.description ? (
                <Text style={styles.cardDesc} numberOfLines={2}>{item.description}</Text>
              ) : null}

              {/* Tags */}
              {item.tags && item.tags.length > 0 ? (
                <View style={styles.tagRow}>
                  {item.tags.slice(0, 4).map((tag, i) => (
                    <View key={i} style={styles.tag}>
                      <Text style={styles.tagText}>{tag}</Text>
                    </View>
                  ))}
                  {item.tags.length > 4 ? (
                    <Text style={styles.tagMore}>+{item.tags.length - 4}</Text>
                  ) : null}
                </View>
              ) : null}

              {/* Meta row: cook time + ingredient count */}
              <View style={styles.meta}>
                {item.cookTimeMinutes ? (
                  <Text style={styles.metaText}>⏱ {item.cookTimeMinutes} min</Text>
                ) : null}
                {item.ingredients.length > 0 ? (
                  <Text style={styles.metaText}>
                    🥄 {item.ingredients.length} ingredient{item.ingredients.length !== 1 ? 's' : ''}
                  </Text>
                ) : null}
                {item.instructions.length > 0 ? (
                  <Text style={styles.metaText}>
                    📋 {item.instructions.length} step{item.instructions.length !== 1 ? 's' : ''}
                  </Text>
                ) : null}
              </View>
            </Pressable>
          )}
          ListFooterComponent={
            <Pressable
              style={({ pressed }) => [styles.dashedAdd, pressed && styles.pressed]}
              onPress={openModal}
            >
              <Text style={styles.dashedAddText}>+ Add Recipe</Text>
            </Pressable>
          }
        />
      )}

      {/* ── Add Recipe Modal ── */}
      <Modal
        visible={showModal}
        animationType="slide"
        presentationStyle="fullScreen"
        onRequestClose={() => setShowModal(false)}
      >
        <SafeAreaView style={styles.modalSafe} edges={['top', 'bottom']}>

          {/* Modal header */}
          <View style={styles.modalHeader}>
            <Pressable onPress={() => setShowModal(false)}>
              <Text style={styles.modalCancel}>Cancel</Text>
            </Pressable>
            <Text style={styles.modalTitle}>Add Recipe</Text>
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

            {/* ── Section: About ── */}
            <Text style={styles.sectionTitle}>About</Text>

            <Text style={styles.label}>Name *</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Spaghetti Bolognese"
              placeholderTextColor={COLORS.muted}
              value={basic.name}
              onChangeText={(v) => setField('name', v)}
              returnKeyType="next"
              autoFocus
            />

            <Text style={styles.label}>Description (optional)</Text>
            <TextInput
              style={[styles.input, styles.inputMultiline]}
              placeholder="A quick note about this dish…"
              placeholderTextColor={COLORS.muted}
              value={basic.description}
              onChangeText={(v) => setField('description', v)}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />

            <View style={styles.row2}>
              <View style={styles.flex1}>
                <Text style={styles.label}>Cook time (min)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g. 30"
                  placeholderTextColor={COLORS.muted}
                  value={basic.cookTimeMinutes}
                  onChangeText={(v) => setField('cookTimeMinutes', v)}
                  keyboardType="number-pad"
                  returnKeyType="next"
                />
              </View>
              <View style={[styles.flex1, { marginLeft: 12 }]}>
                <Text style={styles.label}>Tags (comma-separated)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g. quick, vegetarian"
                  placeholderTextColor={COLORS.muted}
                  value={basic.tags}
                  onChangeText={(v) => setField('tags', v)}
                  returnKeyType="next"
                  autoCapitalize="none"
                />
              </View>
            </View>

            {/* ── Section: Ingredients ── */}
            <Text style={styles.sectionTitle}>Ingredients</Text>

            {/* Added ingredients */}
            {ingList.map((ing, i) => (
              <View key={i} style={styles.listItem}>
                <Text style={styles.listItemText} numberOfLines={1}>
                  {[ing.quantity, ing.unit, ing.name].filter(Boolean).join(' ')}
                </Text>
                <Pressable onPress={() => removeIngredient(i)} hitSlop={8}>
                  <Text style={styles.removeText}>✕</Text>
                </Pressable>
              </View>
            ))}

            {/* Ingredient input row */}
            <View style={styles.addRow}>
              <TextInput
                style={[styles.input, styles.addRowIngName]}
                placeholder="Ingredient"
                placeholderTextColor={COLORS.muted}
                value={ingDraft.name}
                onChangeText={(v) => setIngDraft((d) => ({ ...d, name: v }))}
                returnKeyType="next"
              />
              <TextInput
                style={[styles.input, styles.addRowSmall]}
                placeholder="Qty"
                placeholderTextColor={COLORS.muted}
                value={ingDraft.quantity}
                onChangeText={(v) => setIngDraft((d) => ({ ...d, quantity: v }))}
                returnKeyType="next"
              />
              <TextInput
                style={[styles.input, styles.addRowSmall]}
                placeholder="Unit"
                placeholderTextColor={COLORS.muted}
                value={ingDraft.unit}
                onChangeText={(v) => setIngDraft((d) => ({ ...d, unit: v }))}
                returnKeyType="done"
                onSubmitEditing={addIngredient}
              />
              <Pressable
                style={[styles.addRowBtn, !canAddIng && styles.addRowBtnDim]}
                onPress={addIngredient}
                disabled={!canAddIng}
              >
                <Text style={styles.addRowBtnText}>+</Text>
              </Pressable>
            </View>

            {/* ── Section: Instructions ── */}
            <Text style={styles.sectionTitle}>Instructions</Text>

            {/* Added steps */}
            {steps.map((step, i) => (
              <View key={i} style={styles.listItem}>
                <View style={styles.stepNum}>
                  <Text style={styles.stepNumText}>{i + 1}</Text>
                </View>
                <Text style={[styles.listItemText, styles.flex1]} numberOfLines={3}>
                  {step}
                </Text>
                <Pressable onPress={() => removeStep(i)} hitSlop={8}>
                  <Text style={styles.removeText}>✕</Text>
                </Pressable>
              </View>
            ))}

            {/* Instruction input row */}
            <View style={styles.addRow}>
              <TextInput
                style={[styles.input, styles.flex1]}
                placeholder={`Step ${steps.length + 1} description`}
                placeholderTextColor={COLORS.muted}
                value={stepDraft}
                onChangeText={setStepDraft}
                returnKeyType="done"
                onSubmitEditing={addStep}
                multiline
              />
              <Pressable
                style={[styles.addRowBtn, !canAddStep && styles.addRowBtnDim]}
                onPress={addStep}
                disabled={!canAddStep}
              >
                <Text style={styles.addRowBtnText}>+</Text>
              </Pressable>
            </View>

            {/* Bottom breathing room so keyboard doesn't cover Save */}
            <View style={{ height: 40 }} />

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

  // Recipe card
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
  cardName: { fontSize: 17, fontWeight: '700', color: COLORS.text, flex: 1, marginRight: 8 },
  cardDesc: { fontSize: 13, color: COLORS.textSecondary, marginBottom: 10, lineHeight: 18 },
  deleteBtn: { padding: 4 },
  deleteBtnText: { fontSize: 14, color: COLORS.muted },

  tagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 10 },
  tag:    { backgroundColor: '#ffedd5', borderRadius: 20, paddingHorizontal: 10, paddingVertical: 3 },
  tagText:{ fontSize: 12, fontWeight: '500', color: COLORS.primary },
  tagMore:{ fontSize: 12, color: COLORS.muted, alignSelf: 'center' },

  meta:    { flexDirection: 'row', gap: 12, flexWrap: 'wrap' },
  metaText:{ fontSize: 12, color: COLORS.muted },

  dashedAdd: {
    borderWidth: 2, borderStyle: 'dashed',
    borderColor: COLORS.border, borderRadius: 16,
    padding: 16, alignItems: 'center',
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
  modalCancel: { fontSize: 15, color: COLORS.textSecondary },
  modalTitle:  { fontSize: 16, fontWeight: '700', color: COLORS.text },
  modalSave:   { fontSize: 15, color: COLORS.primary, fontWeight: '700' },
  modalSaveDim:{ color: COLORS.muted },

  form:        { flex: 1 },
  formContent: { padding: 24 },

  sectionTitle: {
    fontSize: 13, fontWeight: '700',
    color: COLORS.textSecondary, textTransform: 'uppercase',
    letterSpacing: 1, marginBottom: 12, marginTop: 8,
  },
  label: {
    fontSize: 13, fontWeight: '600',
    color: COLORS.textSecondary, marginBottom: 6,
  },
  input: {
    borderWidth: 1, borderColor: COLORS.border, borderRadius: 10,
    paddingHorizontal: 14, paddingVertical: 12,
    fontSize: 15, color: COLORS.text,
    backgroundColor: '#fff', marginBottom: 16,
  },
  inputMultiline: { height: 80, textAlignVertical: 'top' },

  // Two-column layout for cook time + tags
  row2:  { flexDirection: 'row' },
  flex1: { flex: 1 },

  // Added items list
  listItem: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#fff',
    borderWidth: 1, borderColor: COLORS.border,
    borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10,
    marginBottom: 6,
  },
  listItemText: { flex: 1, fontSize: 14, color: COLORS.text, marginRight: 8 },
  removeText:   { fontSize: 14, color: COLORS.muted },

  stepNum: {
    width: 22, height: 22, borderRadius: 11,
    backgroundColor: COLORS.primary,
    alignItems: 'center', justifyContent: 'center',
    marginRight: 10, flexShrink: 0,
  },
  stepNumText: { fontSize: 12, fontWeight: '700', color: '#fff' },

  // Ingredient / step add row
  addRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, marginBottom: 16 },
  addRowIngName: { flex: 2, marginBottom: 0 },
  addRowSmall:   { width: 64, marginBottom: 0 },
  addRowBtn: {
    width: 44, height: 46,
    backgroundColor: COLORS.primary,
    borderRadius: 10,
    alignItems: 'center', justifyContent: 'center',
    flexShrink: 0,
  },
  addRowBtnDim: { backgroundColor: COLORS.border },
  addRowBtnText:{ fontSize: 22, color: '#fff', fontWeight: '300', lineHeight: 28 },

  pressed: { opacity: 0.7 },
});
