import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
  Alert,
} from 'react-native';
import { WorkoutPlan, ExerciseSet } from '@/types/workout';
import { Play, Clock, Repeat, Edit3, CheckCircle } from 'lucide-react-native';
import ExerciseLogger from './ExerciseLogger';
import { useWorkout } from '@/providers/workout-provider';

interface WorkoutPlanDisplayProps {
  plan: WorkoutPlan;
  onEdit?: () => void;
}

export default function WorkoutPlanDisplay({ plan, onEdit }: WorkoutPlanDisplayProps) {
  const [selectedWeek, setSelectedWeek] = useState<number>(1);
  const [selectedDay, setSelectedDay] = useState<number>(0);
  const [loggerVisible, setLoggerVisible] = useState<boolean>(false);
  const [selectedExerciseIndex, setSelectedExerciseIndex] = useState<number>(0);
  const { saveWorkoutLog, getLastExerciseLog } = useWorkout();

  const totalWeeks = Math.max(...plan.plan.map(d => d.week));
  const weekDays = plan.plan.filter(d => d.week === selectedWeek);
  const currentDay = weekDays[selectedDay] || plan.plan[0];

  const openVideo = (url: string) => {
    Linking.openURL(url).catch(err => {
      console.error('Failed to open video:', err);
    });
  };

  const openLogger = (exerciseIndex: number) => {
    setSelectedExerciseIndex(exerciseIndex);
    setLoggerVisible(true);
  };

  const handleSaveLog = async (sets: ExerciseSet[], notes?: string) => {
    const exercise = currentDay.exercises[selectedExerciseIndex];
    const completedSets = sets.filter(s => s.completed);
    const log = {
      id: `log_${Date.now()}`,
      workoutPlanId: plan.id,
      dayNumber: currentDay.day,
      weekNumber: currentDay.week,
      exerciseName: exercise.name,
      exerciseNameAr: exercise.nameAr,
      sets,
      date: new Date(),
      notes,
      completed: completedSets.length > 0,
    };

    try {
      await saveWorkoutLog(log);
      setLoggerVisible(false);
      Alert.alert('تم الحفظ!', 'تم حفظ سجل التمرين بنجاح');
    } catch (error) {
      console.error('Error saving log:', error);
      Alert.alert('خطأ', 'فشل في حفظ سجل التمرين');
    }
  };

  return (
    <View style={styles.container}>
      {onEdit && (
        <View style={styles.editHeader}>
          <TouchableOpacity style={styles.editButton} onPress={onEdit}>
            <Edit3 size={20} color="#fff" />
            <Text style={styles.editButtonText}>تعديل البيانات و��عادة التوليد</Text>
          </TouchableOpacity>
        </View>
      )}

      {totalWeeks > 1 && (
        <View style={styles.weeksContainer}>
          <Text style={styles.weeksTitle}>اختر الأسبوع:</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.weeksScrollContent}
          >
            {Array.from({ length: totalWeeks }, (_, i) => i + 1).map((week) => (
              <TouchableOpacity
                key={week}
                style={[styles.weekTab, selectedWeek === week && styles.weekTabSelected]}
                onPress={() => {
                  setSelectedWeek(week);
                  setSelectedDay(0);
                }}
              >
                <Text style={[styles.weekTabText, selectedWeek === week && styles.weekTabTextSelected]}>
                  الأسبوع {week}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.daysScroll}
        contentContainerStyle={styles.daysScrollContent}
      >
        {weekDays.map((day, index) => (
          <TouchableOpacity
            key={day.day}
            style={[styles.dayTab, selectedDay === index && styles.dayTabSelected]}
            onPress={() => setSelectedDay(index)}
          >
            <Text style={[styles.dayTabText, selectedDay === index && styles.dayTabTextSelected]}>
              {day.dayNameAr}
            </Text>
            <Text style={[styles.dayFocus, selectedDay === index && styles.dayFocusSelected]}>
              {day.focusAr}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView style={styles.exercisesContainer} showsVerticalScrollIndicator={false}>
        <View style={styles.dayHeader}>
          <Text style={styles.dayTitle}>{currentDay.dayNameAr}</Text>
          <Text style={styles.daySubtitle}>{currentDay.focusAr}</Text>
          {currentDay.weeklyIntensity && (
            <View style={styles.intensityBadge}>
              <Text style={styles.intensityText}>⚡ {currentDay.weeklyIntensity}</Text>
            </View>
          )}
        </View>

        {currentDay.exercises.map((exercise, index) => {
          const lastLog = getLastExerciseLog(exercise.name);
          return (
            <View key={index} style={styles.exerciseCard}>
              <View style={styles.exerciseHeader}>
                <Text style={styles.exerciseName}>{exercise.nameAr}</Text>
                <Text style={styles.exerciseNameEn}>{exercise.name}</Text>
              </View>

              <View style={styles.exerciseDetails}>
                <View style={styles.detailItem}>
                  <Repeat size={18} color="#007AFF" />
                  <Text style={styles.detailText}>
                    {exercise.sets} مجموعات × {exercise.reps} تكرار
                  </Text>
                </View>

                <View style={styles.detailItem}>
                  <Clock size={18} color="#007AFF" />
                  <Text style={styles.detailText}>راحة: {exercise.restTime}</Text>
                </View>
              </View>

              {lastLog && (
                <View style={styles.lastLogContainer}>
                  <Text style={styles.lastLogTitle}>آخر تمرين:</Text>
                  <View style={styles.lastLogSets}>
                    {lastLog.sets.filter(s => s.completed).map((set, i) => (
                      <Text key={i} style={styles.lastLogText}>
                        {set.reps} × {set.weight}kg
                      </Text>
                    ))}
                  </View>
                </View>
              )}

              {exercise.notes && (
                <View style={styles.notesContainer}>
                  <Text style={styles.notesText}>💡 {exercise.notes}</Text>
                </View>
              )}

              {exercise.injuryWarnings && exercise.injuryWarnings.length > 0 && (
                <View style={styles.injuryWarningsContainer}>
                  <Text style={styles.injuryWarningsTitle}>⚠️ تحذيرات مهمة:</Text>
                  {exercise.injuryWarnings.map((warning, i) => (
                    <Text key={i} style={styles.injuryWarningText}>• {warning}</Text>
                  ))}
                </View>
              )}

              <View style={styles.buttonRow}>
                <TouchableOpacity
                  style={styles.videoButton}
                  onPress={() => openVideo(exercise.videoUrl)}
                >
                  <Play size={20} color="#fff" fill="#fff" />
                  <Text style={styles.videoButtonText}>شاهد الفيديو</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.logButton}
                  onPress={() => openLogger(index)}
                >
                  <CheckCircle size={20} color="#fff" />
                  <Text style={styles.logButtonText}>سجل التمرين</Text>
                </TouchableOpacity>
              </View>
            </View>
          );
        })}

        <View style={styles.bottomPadding} />
      </ScrollView>

      {loggerVisible && (
        <ExerciseLogger
          exercise={currentDay.exercises[selectedExerciseIndex]}
          visible={loggerVisible}
          onClose={() => setLoggerVisible(false)}
          onSave={handleSaveLog}
          previousLog={getLastExerciseLog(currentDay.exercises[selectedExerciseIndex].name)?.sets}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  editHeader: {
    padding: 16,
    backgroundColor: '#f8f9fa',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  editButton: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    gap: 8,
  },
  editButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600' as const,
  },
  daysScroll: {
    maxHeight: 100,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  daysScrollContent: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  dayTab: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    backgroundColor: '#f5f5f5',
    minWidth: 120,
    alignItems: 'center' as const,
  },
  dayTabSelected: {
    backgroundColor: '#007AFF',
  },
  dayTabText: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: '#333',
    marginBottom: 4,
  },
  dayTabTextSelected: {
    color: '#fff',
  },
  dayFocus: {
    fontSize: 12,
    color: '#666',
  },
  dayFocusSelected: {
    color: '#fff',
    opacity: 0.9,
  },
  exercisesContainer: {
    flex: 1,
  },
  dayHeader: {
    padding: 20,
    backgroundColor: '#f8f9fa',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  dayTitle: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: '#1a1a1a',
    marginBottom: 4,
    textAlign: 'right' as const,
  },
  daySubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'right' as const,
  },
  exerciseCard: {
    margin: 16,
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  exerciseHeader: {
    marginBottom: 12,
  },
  exerciseName: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: '#1a1a1a',
    marginBottom: 4,
    textAlign: 'right' as const,
  },
  exerciseNameEn: {
    fontSize: 14,
    color: '#666',
    textAlign: 'right' as const,
  },
  exerciseDetails: {
    gap: 8,
    marginBottom: 12,
  },
  detailItem: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 8,
    justifyContent: 'flex-end' as const,
  },
  detailText: {
    fontSize: 16,
    color: '#333',
  },
  notesContainer: {
    backgroundColor: '#fff9e6',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  notesText: {
    fontSize: 14,
    color: '#856404',
    textAlign: 'right' as const,
  },
  injuryWarningsContainer: {
    backgroundColor: '#ffe6e6',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#dc3545',
  },
  injuryWarningsTitle: {
    fontSize: 15,
    fontWeight: '700' as const,
    color: '#dc3545',
    marginBottom: 8,
    textAlign: 'right' as const,
  },
  injuryWarningText: {
    fontSize: 14,
    color: '#721c24',
    textAlign: 'right' as const,
    marginBottom: 4,
    lineHeight: 20,
  },
  videoButton: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    gap: 8,
  },
  videoButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600' as const,
  },
  lastLogContainer: {
    backgroundColor: '#f0f8ff',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  lastLogTitle: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#007AFF',
    marginBottom: 6,
    textAlign: 'right' as const,
  },
  lastLogSets: {
    flexDirection: 'row' as const,
    gap: 8,
    justifyContent: 'flex-end' as const,
    flexWrap: 'wrap' as const,
  },
  lastLogText: {
    fontSize: 13,
    color: '#333',
    backgroundColor: '#fff',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 6,
  },
  buttonRow: {
    flexDirection: 'row' as const,
    gap: 12,
  },
  logButton: {
    flex: 1,
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    backgroundColor: '#34C759',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    gap: 8,
  },
  logButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600' as const,
  },
  bottomPadding: {
    height: 40,
  },
  weeksContainer: {
    backgroundColor: '#f8f9fa',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  weeksTitle: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: '#1a1a1a',
    marginBottom: 12,
    textAlign: 'right' as const,
  },
  weeksScrollContent: {
    gap: 12,
  },
  weekTab: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#e0e0e0',
    minWidth: 100,
    alignItems: 'center' as const,
  },
  weekTabSelected: {
    backgroundColor: '#34C759',
    borderColor: '#34C759',
  },
  weekTabText: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: '#333',
  },
  weekTabTextSelected: {
    color: '#fff',
  },
  intensityBadge: {
    backgroundColor: '#fff3cd',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginTop: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#ffc107',
  },
  intensityText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#856404',
    textAlign: 'right' as const,
  },
});