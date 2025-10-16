import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Stack } from 'expo-router';
import { Calculator, Soup, Sandwich, UtensilsCrossed, Coffee, RotateCcw } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { z } from 'zod';
import { generateObject } from '@rork/toolkit-sdk';
import { useStorage } from '@/providers/storage';

interface MacroTotals {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

interface ParsedItem extends MacroTotals {
  name: string;
  quantity: number;
  unit: string;
}

interface ParsedMeal {
  items: ParsedItem[];
  totals: MacroTotals;
}

interface ParsedDayResult {
  breakfast?: ParsedMeal;
  lunch?: ParsedMeal;
  dinner?: ParsedMeal;
  snack?: ParsedMeal;
  total: MacroTotals;
  notes?: string;
}

function safeNumber(n: unknown): number {
  const v = typeof n === 'number' && isFinite(n) ? n : 0;
  return Math.max(0, Math.round(v));
}

export default function CaloriesScreen() {
  const insets = useSafeAreaInsets();
  const [breakfastText, setBreakfastText] = useState<string>('');
  const [lunchText, setLunchText] = useState<string>('');
  const [dinnerText, setDinnerText] = useState<string>('');
  const [snackText, setSnackText] = useState<string>('');
  const [result, setResult] = useState<ParsedDayResult | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorText, setErrorText] = useState<string | null>(null);
  const { getItem, setItem } = useStorage();

  const schema = useMemo(() => z.object({
    breakfast: z.object({
      items: z.array(z.object({
        name: z.string(),
        quantity: z.number(),
        unit: z.string(),
        calories: z.number(),
        protein: z.number(),
        carbs: z.number(),
        fat: z.number(),
      })),
      totals: z.object({
        calories: z.number(),
        protein: z.number(),
        carbs: z.number(),
        fat: z.number(),
      }),
    }).partial(),
    lunch: z.object({
      items: z.array(z.object({
        name: z.string(),
        quantity: z.number(),
        unit: z.string(),
        calories: z.number(),
        protein: z.number(),
        carbs: z.number(),
        fat: z.number(),
      })),
      totals: z.object({
        calories: z.number(),
        protein: z.number(),
        carbs: z.number(),
        fat: z.number(),
      }),
    }).partial(),
    dinner: z.object({
      items: z.array(z.object({
        name: z.string(),
        quantity: z.number(),
        unit: z.string(),
        calories: z.number(),
        protein: z.number(),
        carbs: z.number(),
        fat: z.number(),
      })),
      totals: z.object({
        calories: z.number(),
        protein: z.number(),
        carbs: z.number(),
        fat: z.number(),
      }),
    }).partial(),
    snack: z.object({
      items: z.array(z.object({
        name: z.string(),
        quantity: z.number(),
        unit: z.string(),
        calories: z.number(),
        protein: z.number(),
        carbs: z.number(),
        fat: z.number(),
      })),
      totals: z.object({
        calories: z.number(),
        protein: z.number(),
        carbs: z.number(),
        fat: z.number(),
      }),
    }).partial(),
    total: z.object({
      calories: z.number(),
      protein: z.number(),
      carbs: z.number(),
      fat: z.number(),
    }),
    notes: z.string().optional(),
  }), []);

  const loadDraft = useCallback(async () => {
    try {
      const stored = await getItem('calories_draft_v1');
      if (stored) {
        const parsed = JSON.parse(stored) as {
          breakfastText: string; lunchText: string; dinnerText: string; snackText: string; result?: ParsedDayResult;
        };
        setBreakfastText(parsed.breakfastText ?? '');
        setLunchText(parsed.lunchText ?? '');
        setDinnerText(parsed.dinnerText ?? '');
        setSnackText(parsed.snackText ?? '');
        if (parsed.result) setResult(parsed.result);
      }
    } catch (e) {
      console.log('Failed to load draft', e);
    }
  }, [getItem]);

  const saveDraft = useCallback(async (payload: {
    breakfastText: string; lunchText: string; dinnerText: string; snackText: string; result?: ParsedDayResult | null;
  }) => {
    try {
      await setItem('calories_draft_v1', JSON.stringify(payload));
    } catch (e) {
      console.log('Failed to save draft', e);
    }
  }, [setItem]);

  useEffect(() => {
    loadDraft();
  }, [loadDraft]);

  useEffect(() => {
    void saveDraft({ breakfastText, lunchText, dinnerText, snackText, result });
  }, [breakfastText, lunchText, dinnerText, snackText, result, saveDraft]);

  const onClear = useCallback(() => {
    setBreakfastText('');
    setLunchText('');
    setDinnerText('');
    setSnackText('');
    setResult(null);
    setErrorText(null);
  }, []);

  const handleCalculate = useCallback(async () => {
    setIsLoading(true);
    setErrorText(null);
    try {
      const userInput = {
        breakfast: breakfastText.trim(),
        lunch: lunchText.trim(),
        dinner: dinnerText.trim(),
        snack: snackText.trim(),
      };

      const messages = [
        { role: 'user' as const, content: [
          { type: 'text' as const, text: 'حلّل نصوص وجبات اليوم بالعربية. المطلوب استخراج كل بند كطعام مع الكمية والوحدة ثم تقدير السعرات والماكروز. اعتمد على تقديرات غذائية عامة وليست من جدول ثابت لديك. أعد نتيجة منظمة.' },
          { type: 'text' as const, text: `فطور: ${userInput.breakfast || '—'}` },
          { type: 'text' as const, text: `غداء: ${userInput.lunch || '—'}` },
          { type: 'text' as const, text: `عشاء: ${userInput.dinner || '—'}` },
          { type: 'text' as const, text: `سناك: ${userInput.snack || '—'}` },
          { type: 'text' as const, text: 'إذا لم تُذكر وجبة اتركها فارغة. احسب الإجمالي اليومي من مجموع الوجبات.' },
        ] },
      ];

      const parsed = await generateObject({
        messages,
        schema,
      });

      const total: MacroTotals = {
        calories: safeNumber(parsed.total?.calories),
        protein: safeNumber(parsed.total?.protein),
        carbs: safeNumber(parsed.total?.carbs),
        fat: safeNumber(parsed.total?.fat),
      };

      const normalized: ParsedDayResult = {
        breakfast: parsed.breakfast ? {
          items: (parsed.breakfast.items ?? []).map((it: any) => ({
            name: String(it?.name ?? ''),
            quantity: Number(it?.quantity ?? 0),
            unit: String(it?.unit ?? ''),
            calories: safeNumber(it?.calories),
            protein: safeNumber(it?.protein),
            carbs: safeNumber(it?.carbs),
            fat: safeNumber(it?.fat),
          })),
          totals: {
            calories: safeNumber(parsed.breakfast.totals?.calories),
            protein: safeNumber(parsed.breakfast.totals?.protein),
            carbs: safeNumber(parsed.breakfast.totals?.carbs),
            fat: safeNumber(parsed.breakfast.totals?.fat),
          }
        } : undefined,
        lunch: parsed.lunch ? {
          items: (parsed.lunch.items ?? []).map((it: any) => ({
            name: String(it?.name ?? ''),
            quantity: Number(it?.quantity ?? 0),
            unit: String(it?.unit ?? ''),
            calories: safeNumber(it?.calories),
            protein: safeNumber(it?.protein),
            carbs: safeNumber(it?.carbs),
            fat: safeNumber(it?.fat),
          })),
          totals: {
            calories: safeNumber(parsed.lunch.totals?.calories),
            protein: safeNumber(parsed.lunch.totals?.protein),
            carbs: safeNumber(parsed.lunch.totals?.carbs),
            fat: safeNumber(parsed.lunch.totals?.fat),
          }
        } : undefined,
        dinner: parsed.dinner ? {
          items: (parsed.dinner.items ?? []).map((it: any) => ({
            name: String(it?.name ?? ''),
            quantity: Number(it?.quantity ?? 0),
            unit: String(it?.unit ?? ''),
            calories: safeNumber(it?.calories),
            protein: safeNumber(it?.protein),
            carbs: safeNumber(it?.carbs),
            fat: safeNumber(it?.fat),
          })),
          totals: {
            calories: safeNumber(parsed.dinner.totals?.calories),
            protein: safeNumber(parsed.dinner.totals?.protein),
            carbs: safeNumber(parsed.dinner.totals?.carbs),
            fat: safeNumber(parsed.dinner.totals?.fat),
          }
        } : undefined,
        snack: parsed.snack ? {
          items: (parsed.snack.items ?? []).map((it: any) => ({
            name: String(it?.name ?? ''),
            quantity: Number(it?.quantity ?? 0),
            unit: String(it?.unit ?? ''),
            calories: safeNumber(it?.calories),
            protein: safeNumber(it?.protein),
            carbs: safeNumber(it?.carbs),
            fat: safeNumber(it?.fat),
          })),
          totals: {
            calories: safeNumber(parsed.snack.totals?.calories),
            protein: safeNumber(parsed.snack.totals?.protein),
            carbs: safeNumber(parsed.snack.totals?.carbs),
            fat: safeNumber(parsed.snack.totals?.fat),
          }
        } : undefined,
        total,
        notes: typeof parsed.notes === 'string' ? parsed.notes : undefined,
      };

      setResult(normalized);
    } catch (err: any) {
      console.error('AI parse failed', err);
      setErrorText('حدث خطأ أثناء التحليل. حاول مرة أخرى.');
    } finally {
      setIsLoading(false);
    }
  }, [breakfastText, lunchText, dinnerText, snackText, schema]);

  const SummaryCard = useMemo(() => function SummaryCardInner({ title, totals }: { title: string; totals?: MacroTotals }) {
    if (!totals) return null;
    return (
      <View style={styles.summaryCard} testID={`summary-${title}`}>
        <Text style={styles.summaryTitle}>{title}</Text>
        <View style={styles.summaryRow}>
          <View style={styles.summaryItem}><Text style={styles.summaryValue}>{totals.calories}</Text><Text style={styles.summaryLabel}>سعرة</Text></View>
          <View style={styles.summaryItem}><Text style={styles.summaryValue}>{totals.protein}</Text><Text style={styles.summaryLabel}>بروتين</Text></View>
          <View style={styles.summaryItem}><Text style={styles.summaryValue}>{totals.carbs}</Text><Text style={styles.summaryLabel}>كربوهيدرات</Text></View>
          <View style={styles.summaryItem}><Text style={styles.summaryValue}>{totals.fat}</Text><Text style={styles.summaryLabel}>دهون</Text></View>
        </View>
      </View>
    );
  }, []);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <Stack.Screen options={{ title: 'احسب سعرات اليوم' }} />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.headerCard} testID="header-card">
          <View style={styles.headerIcon}><Calculator size={24} color={Colors.light.primary} /></View>
          <View style={{ flex: 1 }}>
            <Text style={styles.headerTitle}>اكتب ماذا أكلت اليوم</Text>
            <Text style={styles.headerSubtitle}>اكتب بأسلوبك الحر لكل وجبة وسنحسب لك السعرات والماكروز</Text>
          </View>
          <TouchableOpacity style={styles.clearBtn} onPress={onClear} testID="clear-btn">
            <RotateCcw size={18} color={Colors.light.primary} />
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}><Coffee size={18} color={Colors.light.primary} /><Text style={styles.sectionTitle}>الفطور</Text></View>
          <TextInput
            testID="breakfast-input"
            style={styles.input}
            placeholder="مثال: 2 بيض + 1 توست أسمر + 10 جم زبدة فول سوداني"
            placeholderTextColor={Colors.light.gray[400]}
            value={breakfastText}
            onChangeText={setBreakfastText}
            multiline
          />
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}><UtensilsCrossed size={18} color={Colors.light.primary} /><Text style={styles.sectionTitle}>الغداء</Text></View>
          <TextInput
            testID="lunch-input"
            style={styles.input}
            placeholder="مثال: 200 جم صدور فراخ + 200 جم رز مطبوخ + سلطة"
            placeholderTextColor={Colors.light.gray[400]}
            value={lunchText}
            onChangeText={setLunchText}
            multiline
          />
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}><Soup size={18} color={Colors.light.primary} /><Text style={styles.sectionTitle}>العشاء</Text></View>
          <TextInput
            testID="dinner-input"
            style={styles.input}
            placeholder="مثال: علبة زبادي لايت + تفاحة + شوفان 40 جم"
            placeholderTextColor={Colors.light.gray[400]}
            value={dinnerText}
            onChangeText={setDinnerText}
            multiline
          />
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}><Sandwich size={18} color={Colors.light.primary} /><Text style={styles.sectionTitle}>سناك</Text></View>
          <TextInput
            testID="snack-input"
            style={styles.input}
            placeholder="مثال: حفنة مكسرات 30 جم + موزة"
            placeholderTextColor={Colors.light.gray[400]}
            value={snackText}
            onChangeText={setSnackText}
            multiline
          />
        </View>

        {errorText ? (
          <View style={styles.errorBox} testID="error-box"><Text style={styles.errorText}>{errorText}</Text></View>
        ) : null}

        <TouchableOpacity
          testID="calculate-btn"
          style={[styles.calculateBtn, isLoading && { opacity: 0.7 }]}
          onPress={handleCalculate}
          disabled={isLoading}
        >
          {isLoading ? <ActivityIndicator color="#fff" /> : <Text style={styles.calculateText}>احسب السعرات والماكروز</Text>}
        </TouchableOpacity>

        {result ? (
          <View style={styles.results} testID="results">
            <SummaryCard title="الإجمالي اليومي" totals={result.total} />
            <SummaryCard title="الفطور" totals={result.breakfast?.totals} />
            <SummaryCard title="الغداء" totals={result.lunch?.totals} />
            <SummaryCard title="العشاء" totals={result.dinner?.totals} />
            <SummaryCard title="السناك" totals={result.snack?.totals} />

            {(['breakfast','lunch','dinner','snack'] as const).map((key) => {
              const meal = result[key];
              if (!meal || !meal.items || meal.items.length === 0) return null;
              return (
                <View key={key} style={styles.itemsBlock}>
                  <Text style={styles.itemsTitle}>
                    {key === 'breakfast' ? 'تفاصيل الفطور' : key === 'lunch' ? 'تفاصيل الغداء' : key === 'dinner' ? 'تفاصيل العشاء' : 'تفاصيل السناك'}
                  </Text>
                  {meal.items.map((it, idx) => (
                    <View key={`${key}-${idx}`} style={styles.itemRow}>
                      <Text style={styles.itemName}>{it.name} — {it.quantity} {it.unit}</Text>
                      <Text style={styles.itemMacros}>{it.calories}سع | {it.protein}ب | {it.carbs}ك | {it.fat}د</Text>
                    </View>
                  ))}
                </View>
              );
            })}
          </View>
        ) : null}

        <View style={{ height: 60 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.light.background },
  content: { padding: 16 },
  headerCard: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: Colors.light.gray[50], borderRadius: 16, padding: 16,
    borderWidth: 1, borderColor: Colors.light.gray[200],
  },
  headerIcon: {
    width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.light.primary + '20',
    alignItems: 'center', justifyContent: 'center',
  },
  headerTitle: { fontSize: 16, fontWeight: '700', color: Colors.light.text },
  headerSubtitle: { fontSize: 12, color: Colors.light.gray[600], marginTop: 4 },
  clearBtn: { padding: 8, borderRadius: 10, backgroundColor: Colors.light.gray[100] },

  section: { marginTop: 16 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  sectionTitle: { fontSize: 14, fontWeight: '600', color: Colors.light.text },
  input: {
    minHeight: 64, borderRadius: 12, borderWidth: 1, borderColor: Colors.light.gray[200],
    padding: 12, backgroundColor: '#fff', color: Colors.light.text,
  },

  calculateBtn: {
    marginTop: 20, backgroundColor: Colors.light.primary, borderRadius: 14,
    alignItems: 'center', justifyContent: 'center', paddingVertical: 14,
  },
  calculateText: { color: '#fff', fontSize: 16, fontWeight: '700' },

  errorBox: { marginTop: 12, backgroundColor: '#FEE2E2', borderColor: '#FCA5A5', borderWidth: 1, padding: 12, borderRadius: 12 },
  errorText: { color: '#B91C1C', fontSize: 13 },

  results: { marginTop: 24 },
  summaryCard: { backgroundColor: Colors.light.gray[50], borderRadius: 12, padding: 12, borderWidth: 1, borderColor: Colors.light.gray[200], marginBottom: 12 },
  summaryTitle: { fontSize: 14, fontWeight: '700', color: Colors.light.text, marginBottom: 10, textAlign: 'center' },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-around' },
  summaryItem: { alignItems: 'center' },
  summaryValue: { fontSize: 16, fontWeight: '800', color: Colors.light.primary },
  summaryLabel: { fontSize: 10, color: Colors.light.gray[600], marginTop: 2 },

  itemsBlock: { backgroundColor: '#fff', borderRadius: 12, borderWidth: 1, borderColor: Colors.light.gray[200], marginBottom: 12 },
  itemsTitle: { fontSize: 13, fontWeight: '700', color: Colors.light.text, paddingHorizontal: 12, paddingTop: 10, paddingBottom: 6 },
  itemRow: { paddingHorizontal: 12, paddingVertical: 10, borderTopWidth: 1, borderTopColor: Colors.light.gray[100] },
  itemName: { fontSize: 13, color: Colors.light.text },
  itemMacros: { fontSize: 12, color: Colors.light.gray[600], marginTop: 4 },
});