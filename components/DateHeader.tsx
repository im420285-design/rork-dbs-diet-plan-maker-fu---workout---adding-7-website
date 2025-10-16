import React, { useMemo, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, Platform, ScrollView } from 'react-native';
import { ChevronLeft, ChevronRight, Calendar, X } from 'lucide-react-native';
import Colors from '@/constants/colors';

interface Props {
  dateISO: string;
  onPrevDay: () => void;
  onNextDay: () => void;
  onPickDate: (dateISO: string) => void;
}

export default function DateHeader({ dateISO, onPrevDay, onNextDay, onPickDate }: Props) {
  const [open, setOpen] = useState(false);
  const selected = useMemo(() => new Date(dateISO), [dateISO]);
  const [pickerMonth, setPickerMonth] = useState<number>(selected.getMonth());
  const [pickerYear, setPickerYear] = useState<number>(selected.getFullYear());

  const monthLabel = useMemo(() => {
    const ref = new Date(pickerYear, pickerMonth, 1);
    return ref.toLocaleDateString('ar-SA', { month: 'long', year: 'numeric' });
  }, [pickerMonth, pickerYear]);

  const grid = useMemo(() => {
    const firstDay = new Date(pickerYear, pickerMonth, 1);
    const startWeekday = (firstDay.getDay() + 6) % 7;
    const daysInMonth = new Date(pickerYear, pickerMonth + 1, 0).getDate();
    const cells: { label: string; iso?: string; current: boolean }[] = [];
    for (let i = 0; i < startWeekday; i++) cells.push({ label: '', current: false });
    for (let d = 1; d <= daysInMonth; d++) {
      const iso = new Date(pickerYear, pickerMonth, d).toISOString().split('T')[0];
      cells.push({ label: String(d), iso, current: true });
    }
    return cells;
  }, [pickerMonth, pickerYear]);

  const isSameDay = (a: Date, b: Date) => a.toISOString().split('T')[0] === b.toISOString().split('T')[0];

  return (
    <View style={styles.wrapper} testID="date-header">
      <TouchableOpacity onPress={onPrevDay} style={styles.navBtn} testID="prev-day">
        <ChevronRight size={18} color={Colors.light.primary} />
      </TouchableOpacity>
      <TouchableOpacity style={styles.center} onPress={() => { setOpen(true); setPickerMonth(selected.getMonth()); setPickerYear(selected.getFullYear()); }} testID="open-picker">
        <View style={styles.headerIcon}><Calendar size={18} color={Colors.light.primary} /></View>
        <Text style={styles.title} numberOfLines={1}>
          {selected.toLocaleDateString('ar-SA', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={onNextDay} style={styles.navBtn} testID="next-day">
        <ChevronLeft size={18} color={Colors.light.primary} />
      </TouchableOpacity>

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <View style={styles.overlay}>
          <View style={styles.sheet}>
            <View style={styles.sheetHeader}>
              <TouchableOpacity style={styles.iconBtn} onPress={() => setOpen(false)} testID="close-picker">
                <X size={22} color={Colors.light.text} />
              </TouchableOpacity>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <TouchableOpacity style={styles.iconBtn} onPress={() => {
                  const m = pickerMonth - 1; if (m < 0) { setPickerMonth(11); setPickerYear(pickerYear - 1); } else { setPickerMonth(m); }
                }} testID="prev-month">
                  <ChevronRight size={18} color={Colors.light.text} />
                </TouchableOpacity>
                <Text style={styles.monthLabel}>{monthLabel}</Text>
                <TouchableOpacity style={styles.iconBtn} onPress={() => {
                  const m = pickerMonth + 1; if (m > 11) { setPickerMonth(0); setPickerYear(pickerYear + 1); } else { setPickerMonth(m); }
                }} testID="next-month">
                  <ChevronLeft size={18} color={Colors.light.text} />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.weekHeader}>
              {['الإثنين','الثلاثاء','الأربعاء','الخميس','الجمعة','السبت','الأحد'].map((w) => (
                <Text key={w} style={styles.weekCell}>{w.slice(0,2)}</Text>
              ))}
            </View>

            <ScrollView style={{ maxHeight: 320 }}>
              <View style={styles.grid}>
                {grid.map((c, idx) => {
                  const isSelected = c.iso ? isSameDay(new Date(c.iso), selected) : false;
                  return (
                    <TouchableOpacity
                      key={idx}
                      style={[styles.dayCell, !c.current && styles.dayCellEmpty, isSelected && styles.daySelected]}
                      disabled={!c.current}
                      onPress={() => { if (c.iso) { onPickDate(c.iso); setOpen(false); } }}
                      testID={c.iso ? `pick-${c.iso}` : `empty-${idx}`}
                    >
                      <Text style={[styles.dayText, isSelected && styles.dayTextSelected]}>{c.label}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.gray[200],
  },
  navBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.light.primary + '10',
  },
  center: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
    justifyContent: 'center',
  },
  headerIcon: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: Colors.light.primary + '15',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 14,
    color: Colors.light.text,
    fontWeight: '600',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 20,
  },
  sheet: {
    backgroundColor: Colors.light.background,
    borderRadius: 16,
    padding: 16,
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.light.gray[100],
  },
  monthLabel: {
    fontSize: 16,
    color: Colors.light.text,
    fontWeight: '700',
  },
  weekHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
    marginBottom: 8,
  },
  weekCell: {
    width: `${100/7}%` as const,
    textAlign: 'center',
    color: Colors.light.gray[600],
    fontSize: 12,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayCell: {
    width: `${100/7}%` as const,
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 4,
    borderRadius: 12,
    backgroundColor: Colors.light.gray[50],
  },
  dayCellEmpty: {
    backgroundColor: 'transparent',
  },
  daySelected: {
    backgroundColor: Colors.light.primary + '20',
  },
  dayText: {
    fontSize: 14,
    color: Colors.light.text,
  },
  dayTextSelected: {
    color: Colors.light.primary,
    fontWeight: '700',
  },
});
