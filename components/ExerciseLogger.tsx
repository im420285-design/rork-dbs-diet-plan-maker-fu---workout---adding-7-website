import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Modal,
  ScrollView,
  Alert,
} from 'react-native';
import { Exercise, ExerciseSet } from '@/types/workout';
import { Check, X, Plus, Minus } from 'lucide-react-native';

interface ExerciseLoggerProps {
  exercise: Exercise;
  visible: boolean;
  onClose: () => void;
  onSave: (sets: ExerciseSet[], notes?: string) => void;
  previousLog?: ExerciseSet[];
}

export default function ExerciseLogger({
  exercise,
  visible,
  onClose,
  onSave,
  previousLog,
}: ExerciseLoggerProps) {
  const [sets, setSets] = useState<ExerciseSet[]>(() => {
    const initialSets: ExerciseSet[] = [];
    for (let i = 0; i < exercise.sets; i++) {
      initialSets.push({
        setNumber: i + 1,
        reps: previousLog?.[i]?.reps || 0,
        weight: previousLog?.[i]?.weight || 0,
        completed: false,
      });
    }
    return initialSets;
  });
  const [notes, setNotes] = useState<string>('');

  const updateSet = (index: number, field: 'reps' | 'weight', value: number) => {
    const newSets = [...sets];
    newSets[index] = { ...newSets[index], [field]: value };
    setSets(newSets);
  };

  const toggleSetCompleted = (index: number) => {
    const newSets = [...sets];
    newSets[index] = { ...newSets[index], completed: !newSets[index].completed };
    setSets(newSets);
  };

  const handleSave = () => {
    const completedSets = sets.filter(s => s.completed);
    if (completedSets.length === 0) {
      Alert.alert('تنبيه', 'يرجى إكمال مجموعة واحدة على الأقل');
      return;
    }
    onSave(sets, notes);
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={true}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.header}>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <X size={24} color="#333" />
            </TouchableOpacity>
            <View style={styles.headerText}>
              <Text style={styles.title}>{exercise.nameAr}</Text>
              <Text style={styles.subtitle}>{exercise.name}</Text>
            </View>
          </View>

          <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
            {previousLog && previousLog.length > 0 && (
              <View style={styles.previousLogContainer}>
                <Text style={styles.previousLogTitle}>📊 آخر تمرين:</Text>
                <View style={styles.previousLogRow}>
                  {previousLog.map((set, index) => (
                    <Text key={index} style={styles.previousLogText}>
                      {set.reps} × {set.weight}kg
                    </Text>
                  ))}
                </View>
              </View>
            )}

            <View style={styles.setsContainer}>
              {sets.map((set, index) => (
                <View key={index} style={styles.setRow}>
                  <TouchableOpacity
                    style={[styles.checkButton, set.completed && styles.checkButtonCompleted]}
                    onPress={() => toggleSetCompleted(index)}
                  >
                    {set.completed && <Check size={20} color="#fff" />}
                  </TouchableOpacity>

                  <Text style={styles.setNumber}>المجموعة {set.setNumber}</Text>

                  <View style={styles.inputGroup}>
                    <View style={styles.inputContainer}>
                      <Text style={styles.inputLabel}>التكرارات</Text>
                      <View style={styles.inputRow}>
                        <TouchableOpacity
                          style={styles.incrementButton}
                          onPress={() => updateSet(index, 'reps', Math.max(0, set.reps - 1))}
                        >
                          <Minus size={16} color="#007AFF" />
                        </TouchableOpacity>
                        <TextInput
                          style={styles.input}
                          value={set.reps.toString()}
                          onChangeText={(text) => {
                            const value = parseInt(text) || 0;
                            updateSet(index, 'reps', value);
                          }}
                          keyboardType="numeric"
                        />
                        <TouchableOpacity
                          style={styles.incrementButton}
                          onPress={() => updateSet(index, 'reps', set.reps + 1)}
                        >
                          <Plus size={16} color="#007AFF" />
                        </TouchableOpacity>
                      </View>
                    </View>

                    <View style={styles.inputContainer}>
                      <Text style={styles.inputLabel}>الوزن (kg)</Text>
                      <View style={styles.inputRow}>
                        <TouchableOpacity
                          style={styles.incrementButton}
                          onPress={() => updateSet(index, 'weight', Math.max(0, set.weight - 2.5))}
                        >
                          <Minus size={16} color="#007AFF" />
                        </TouchableOpacity>
                        <TextInput
                          style={styles.input}
                          value={set.weight.toString()}
                          onChangeText={(text) => {
                            const value = parseFloat(text) || 0;
                            updateSet(index, 'weight', value);
                          }}
                          keyboardType="numeric"
                        />
                        <TouchableOpacity
                          style={styles.incrementButton}
                          onPress={() => updateSet(index, 'weight', set.weight + 2.5)}
                        >
                          <Plus size={16} color="#007AFF" />
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                </View>
              ))}
            </View>

            <View style={styles.notesContainer}>
              <Text style={styles.notesLabel}>ملاحظات (اختياري)</Text>
              <TextInput
                style={styles.notesInput}
                value={notes}
                onChangeText={setNotes}
                placeholder="أضف ملاحظات عن التمرين..."
                placeholderTextColor="#999"
                multiline
                textAlign="right"
              />
            </View>
          </ScrollView>

          <View style={styles.footer}>
            <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
              <Text style={styles.saveButtonText}>حفظ التمرين</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end' as const,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
    paddingBottom: 20,
  },
  header: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  closeButton: {
    padding: 8,
  },
  headerText: {
    flex: 1,
    alignItems: 'flex-end' as const,
    marginRight: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: '#1a1a1a',
    textAlign: 'right' as const,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
    textAlign: 'right' as const,
  },
  scrollContent: {
    flex: 1,
    padding: 20,
  },
  previousLogContainer: {
    backgroundColor: '#f0f8ff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  previousLogTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#007AFF',
    marginBottom: 8,
    textAlign: 'right' as const,
  },
  previousLogRow: {
    flexDirection: 'row' as const,
    gap: 12,
    justifyContent: 'flex-end' as const,
    flexWrap: 'wrap' as const,
  },
  previousLogText: {
    fontSize: 14,
    color: '#333',
    backgroundColor: '#fff',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  setsContainer: {
    gap: 16,
  },
  setRow: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 12,
    gap: 12,
  },
  checkButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#007AFF',
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  checkButtonCompleted: {
    backgroundColor: '#007AFF',
  },
  setNumber: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#333',
    minWidth: 80,
    textAlign: 'right' as const,
  },
  inputGroup: {
    flex: 1,
    flexDirection: 'row' as const,
    gap: 12,
  },
  inputContainer: {
    flex: 1,
  },
  inputLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 6,
    textAlign: 'center' as const,
  },
  inputRow: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 4,
  },
  input: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 14,
    fontSize: 18,
    fontWeight: '700' as const,
    color: '#1a1a1a',
    textAlign: 'center' as const,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    minHeight: 44,
  },
  incrementButton: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#fff',
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    borderWidth: 1,
    borderColor: '#007AFF',
  },
  notesContainer: {
    marginTop: 20,
  },
  notesLabel: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#333',
    marginBottom: 8,
    textAlign: 'right' as const,
  },
  notesInput: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#1a1a1a',
    minHeight: 100,
    textAlignVertical: 'top' as const,
  },
  footer: {
    padding: 20,
    paddingTop: 12,
  },
  saveButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center' as const,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700' as const,
  },
});
