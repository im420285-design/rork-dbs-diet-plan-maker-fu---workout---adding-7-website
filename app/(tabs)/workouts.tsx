import React, { useState } from 'react';
import { View, StyleSheet, Alert, TouchableOpacity, Modal } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Stack } from 'expo-router';
import WorkoutInputForm from '@/components/WorkoutInputForm';
import WorkoutPlanDisplay from '@/components/WorkoutPlanDisplay';
import WorkoutHistory from '@/components/WorkoutHistory';
import WorkoutPlansManager from '@/components/WorkoutPlansManager';
import { useWorkout } from '@/providers/workout-provider';
import { WorkoutInput } from '@/types/workout';
import { generateWorkoutPlan } from '@/services/workout-generator';
import { History, Dumbbell, FolderOpen } from 'lucide-react-native';

export default function WorkoutsScreen() {
  const { currentPlan, saveWorkoutPlan, workoutLogs, workoutPlans, selectWorkoutPlan, deleteWorkoutPlan } = useWorkout();
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [showHistory, setShowHistory] = useState<boolean>(false);
  const [showPlansManager, setShowPlansManager] = useState<boolean>(false);
  const insets = useSafeAreaInsets();

  const handleGeneratePlan = async (input: WorkoutInput) => {
    console.log('Generating workout plan with input:', input);
    setIsGenerating(true);

    try {
      const result = await generateWorkoutPlan(input);
      console.log('Workout plan generated:', result);

      await saveWorkoutPlan(result);
      setIsEditing(false);

      Alert.alert('نجح!', 'تم توليد برنامج التمرين بنجاح');
    } catch (error) {
      console.error('Error generating workout plan:', error);
      Alert.alert('خطأ', 'فشل في توليد برنامج التمرين. يرجى المحاولة مرة أخرى.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleEditPlan = () => {
    setIsEditing(true);
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <Stack.Screen
        options={{
          title: showHistory ? 'تاريخ التمارين' : 'برنامج التمرين',
          headerStyle: {
            backgroundColor: '#007AFF',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: '700' as const,
          },
          headerRight: () => (
            <View style={styles.headerButtons}>
              {!showHistory && workoutPlans.length > 0 && (
                <TouchableOpacity
                  style={styles.headerButton}
                  onPress={() => setShowPlansManager(true)}
                >
                  <FolderOpen size={24} color="#fff" />
                </TouchableOpacity>
              )}
              <TouchableOpacity
                style={styles.headerButton}
                onPress={() => setShowHistory(!showHistory)}
              >
                {showHistory ? (
                  <Dumbbell size={24} color="#fff" />
                ) : (
                  <History size={24} color="#fff" />
                )}
              </TouchableOpacity>
            </View>
          ),
        }}
      />

      {showHistory ? (
        <WorkoutHistory logs={workoutLogs} />
      ) : !currentPlan || isEditing ? (
        <WorkoutInputForm 
          onSubmit={handleGeneratePlan} 
          isLoading={isGenerating}
          initialData={currentPlan?.input}
        />
      ) : (
        <WorkoutPlanDisplay plan={currentPlan} onEdit={handleEditPlan} />
      )}

      <Modal
        visible={showPlansManager}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <WorkoutPlansManager
          plans={workoutPlans}
          currentPlanId={currentPlan?.id || null}
          onSelectPlan={selectWorkoutPlan}
          onDeletePlan={deleteWorkoutPlan}
          onClose={() => setShowPlansManager(false)}
        />
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  headerButtons: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 8,
  },
  headerButton: {
    padding: 8,
    marginRight: 8,
  },
});