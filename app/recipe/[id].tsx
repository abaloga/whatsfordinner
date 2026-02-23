import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { COLORS } from '../../constants';
import { useRecipeStore } from '../../store/recipeStore';
import type { RecipeIngredient } from '../../types';

// ─── Form state shapes (mirrors recipes.tsx) ──────────────────────────────────

interface BasicFields {
  name: string;
  description: string;
  cookTimeMinutes: string; // stored as string; parsed to number on save
  tags: string;            // comma-separated; split to array on save
}

interface IngredientDraft {
  name: string;
  quantity: string;
  unit: string;
}

const EMPTY_ING: IngredientDraft = { name: '', quantity: '', unit: '' };

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function RecipeDetailScreen() {
  const { id }       = useLocalSearchParams<{ id: string }>();
  const router       = useRouter();
  const recipe       = useRecipeStore(s => s.recipes.find(r => r.id === id));
  const updateRecipe = useRecipeStore(s => s.updateRecipe);

  // Edit modal state — all hooks must be called before any early return
  const [showEdit, setShowEdit]     = useState(false);
  const [basic, setBasic]           = useState<BasicFields>({ name: '', description: '', cookTimeMinutes: '', tags: '' });
  const [ingList, setIngList]       = useState<RecipeIngredient[]>([]);
  const [ingDraft, setIngDraft]     = useState<IngredientDraft>(EMPTY_ING);
  const [steps, setSteps]           = useState<string[]>([]);
  const [stepDraft, setStepDraft]   = useState('');

  if (!recipe) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <Pressable onPress={() => router.back()} style={styles.back}>
          <Text style={styles.backText}>← Back</Text>
        </Pressable>
        <View style={styles.notFound}>
          <Text style={styles.notFoundText}>Recipe not found.</Text>
        </View>
      </SafeAreaView>
    );
  }

  // ── Edit modal helpers ───────────────────────────────────────────────────

  function openEdit() {
    setBasic({
      name:            recipe.name,
      description:     recipe.description ?? '',
      cookTimeMinutes: recipe.cookTimeMinutes?.toString() ?? '',
      tags:            (recipe.tags ?? []).join(', '),
    });
    setIngList(recipe.ingredients.map(i => ({
      name:     i.name,
      quantity: i.quantity,
      unit:     i.unit,
    })));
    setIngDraft(EMPTY_ING);
    setSteps([...recipe.instructions]);
    setStepDraft('');
    setShowEdit(true);
  }

  function setField<K extends keyof BasicFields>(key: K, value: string) {
    setBasic(b => ({ ...b, [key]: value }));
  }

  function addIngredient() {
    if (!ingDraft.name.trim()) return;
    setIngList(list => [
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
    setIngList(list => list.filter((_, i) => i !== index));
  }

  function addStep() {
    if (!stepDraft.trim()) return;
    setSteps(s => [...s, stepDraft.trim()]);
    setStepDraft('');
  }

  function removeStep(index: number) {
    setSteps(s => s.filter((_, i) => i !== index));
  }

  function handleSave() {
    if (!basic.name.trim()) return;

    const tags = basic.tags
      .split(',')
      .map(t => t.trim())
      .filter(Boolean);

    const cookMinRaw = parseInt(basic.cookTimeMinutes, 10);
    const cookTimeMinutes = Number.isNaN(cookMinRaw) ? undefined : cookMinRaw;

    updateRecipe(recipe.id, {
      name:             basic.name.trim(),
      description:      basic.description.trim() || undefined,
      ingredients:      ingList,
      instructions:     steps,
      cookTimeMinutes,
      tags:             tags.length ? tags : undefined,
    });

    setShowEdit(false);
  }

  const canSave    = basic.name.trim().length > 0;
  const canAddIng  = ingDraft.name.trim().length > 0;
  const canAddStep = stepDraft.trim().length > 0;

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

        {/* ── Title & description ── */}
        <Text style={styles.name}>{recipe.name}</Text>
        {recipe.description ? (
          <Text style={styles.description}>{recipe.description}</Text>
        ) : null}

        {/* ── Meta chips ── */}
        <View style={styles.metaRow}>
          {recipe.cookTimeMinutes ? (
            <View style={styles.metaChip}>
              <Text style={styles.metaChipText}>⏱ {recipe.cookTimeMinutes} min</Text>
            </View>
          ) : null}
          {recipe.servings ? (
            <View style={styles.metaChip}>
              <Text style={styles.metaChipText}>👥 Serves {recipe.servings}</Text>
            </View>
          ) : null}
          {recipe.ingredients.length > 0 ? (
            <View style={styles.metaChip}>
              <Text style={styles.metaChipText}>
                🥄 {recipe.ingredients.length} ingredient{recipe.ingredients.length !== 1 ? 's' : ''}
              </Text>
            </View>
          ) : null}
        </View>

        {/* ── Tags ── */}
        {recipe.tags && recipe.tags.length > 0 ? (
          <View style={styles.tagRow}>
            {recipe.tags.map(tag => (
              <View key={tag} style={styles.tag}>
                <Text style={styles.tagText}>{tag}</Text>
              </View>
            ))}
          </View>
        ) : null}

        {/* ── Ingredients ── */}
        {recipe.ingredients.length > 0 ? (
          <>
            <Text style={styles.sectionTitle}>Ingredients</Text>
            {recipe.ingredients.map((ing, i) => (
              <View key={i} style={styles.ingredientRow}>
                <View style={styles.bullet} />
                <Text style={styles.ingredientText}>
                  {[ing.quantity, ing.unit, ing.name].filter(Boolean).join(' ')}
                </Text>
              </View>
            ))}
          </>
        ) : null}

        {/* ── Instructions ── */}
        {recipe.instructions.length > 0 ? (
          <>
            <Text style={styles.sectionTitle}>Instructions</Text>
            {recipe.instructions.map((step, i) => (
              <View key={i} style={styles.stepRow}>
                <View style={styles.stepBadge}>
                  <Text style={styles.stepBadgeText}>{i + 1}</Text>
                </View>
                <Text style={styles.stepText}>{step}</Text>
              </View>
            ))}
          </>
        ) : null}

        <View style={{ height: 32 }} />
      </ScrollView>

      {/* ── Edit Recipe Modal ── */}
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
            <Text style={styles.modalTitle}>Edit Recipe</Text>
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

                  {/* ── About ── */}
                  <Text style={styles.formSectionTitle}>About</Text>

                  <Text style={styles.label}>Name *</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="e.g. Spaghetti Bolognese"
                    placeholderTextColor={COLORS.muted}
                    value={basic.name}
                    onChangeText={v => setField('name', v)}
                    returnKeyType="next"
                    autoFocus
                  />

                  <Text style={styles.label}>Description (optional)</Text>
                  <TextInput
                    style={[styles.input, styles.inputMultiline]}
                    placeholder="A quick note about this dish…"
                    placeholderTextColor={COLORS.muted}
                    value={basic.description}
                    onChangeText={v => setField('description', v)}
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
                        onChangeText={v => setField('cookTimeMinutes', v)}
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
                        onChangeText={v => setField('tags', v)}
                        returnKeyType="next"
                        autoCapitalize="none"
                      />
                    </View>
                  </View>

                  {/* ── Ingredients ── */}
                  <Text style={styles.formSectionTitle}>Ingredients</Text>

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

                  <View style={styles.addRow}>
                    <TextInput
                      style={[styles.input, styles.addRowIngName]}
                      placeholder="Ingredient"
                      placeholderTextColor={COLORS.muted}
                      value={ingDraft.name}
                      onChangeText={v => setIngDraft(d => ({ ...d, name: v }))}
                      returnKeyType="next"
                    />
                    <TextInput
                      style={[styles.input, styles.addRowSmall]}
                      placeholder="Qty"
                      placeholderTextColor={COLORS.muted}
                      value={ingDraft.quantity}
                      onChangeText={v => setIngDraft(d => ({ ...d, quantity: v }))}
                      returnKeyType="next"
                    />
                    <TextInput
                      style={[styles.input, styles.addRowSmall]}
                      placeholder="Unit"
                      placeholderTextColor={COLORS.muted}
                      value={ingDraft.unit}
                      onChangeText={v => setIngDraft(d => ({ ...d, unit: v }))}
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

                  {/* ── Instructions ── */}
                  <Text style={styles.formSectionTitle}>Instructions</Text>

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

  name: { fontSize: 28, fontWeight: 'bold', color: COLORS.text, marginBottom: 8 },
  description: {
    fontSize: 15, color: COLORS.textSecondary, lineHeight: 24,
    marginBottom: 16,
  },

  metaRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap', marginBottom: 12 },
  metaChip: {
    backgroundColor: COLORS.surface,
    borderWidth: 1, borderColor: COLORS.border,
    borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6,
  },
  metaChipText: { fontSize: 13, color: COLORS.textSecondary },

  tagRow: { flexDirection: 'row', gap: 6, flexWrap: 'wrap', marginBottom: 24 },
  tag:    { backgroundColor: '#fff7ed', borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4 },
  tagText:{ fontSize: 12, fontWeight: '600', color: COLORS.primary },

  sectionTitle: {
    fontSize: 13, fontWeight: '700', color: COLORS.muted,
    textTransform: 'uppercase', letterSpacing: 1,
    marginTop: 24, marginBottom: 12,
  },

  ingredientRow: {
    flexDirection: 'row', alignItems: 'flex-start',
    paddingVertical: 10,
    borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  bullet: {
    width: 6, height: 6, borderRadius: 3,
    backgroundColor: COLORS.primary,
    marginTop: 6, marginRight: 12, flexShrink: 0,
  },
  ingredientText: { fontSize: 15, color: COLORS.text, flex: 1 },

  stepRow: {
    flexDirection: 'row', alignItems: 'flex-start',
    marginBottom: 16,
  },
  stepBadge: {
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: COLORS.primary,
    alignItems: 'center', justifyContent: 'center',
    marginRight: 12, flexShrink: 0, marginTop: 1,
  },
  stepBadgeText: { fontSize: 13, fontWeight: '700', color: '#fff' },
  stepText: { fontSize: 15, color: COLORS.text, flex: 1, lineHeight: 22 },

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

  formSectionTitle: {
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

  row2:  { flexDirection: 'row' },
  flex1: { flex: 1 },

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

  addRow:       { flexDirection: 'row', alignItems: 'flex-start', gap: 8, marginBottom: 16 },
  addRowIngName:{ flex: 2, marginBottom: 0 },
  addRowSmall:  { width: 64, marginBottom: 0 },
  addRowBtn: {
    width: 44, height: 46,
    backgroundColor: COLORS.primary,
    borderRadius: 10,
    alignItems: 'center', justifyContent: 'center',
    flexShrink: 0,
  },
  addRowBtnDim:  { backgroundColor: COLORS.border },
  addRowBtnText: { fontSize: 22, color: '#fff', fontWeight: '300', lineHeight: 28 },

  pressed: { opacity: 0.7 },
});
