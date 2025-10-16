import createContextHook from '@nkzw/create-context-hook';
import { useState, useEffect, useCallback, useMemo } from 'react';
import { WorkoutPlan, WorkoutLog } from '@/types/workout';
import AsyncStorage from '@react-native-async-storage/async-storage';

const WORKOUT_STORAGE_KEY = 'workout_plans';
const WORKOUT_LOGS_KEY = 'workout_logs';

export const [WorkoutProvider, useWorkout] = createContextHook(() => {
  const [workoutPlans, setWorkoutPlans] = useState<WorkoutPlan[]>([]);
  const [currentPlan, setCurrentPlan] = useState<WorkoutPlan | null>(null);
  const [workoutLogs, setWorkoutLogs] = useState<WorkoutLog[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const loadWorkoutPlans = useCallback(async () => {
    try {
      const stored = await AsyncStorage.getItem(WORKOUT_STORAGE_KEY);
      if (stored) {
        const plans = JSON.parse(stored);
        setWorkoutPlans(plans);
        if (plans.length > 0) {
          setCurrentPlan(plans[0]);
        }
      }

      const logsStored = await AsyncStorage.getItem(WORKOUT_LOGS_KEY);
      if (logsStored) {
        setWorkoutLogs(JSON.parse(logsStored));
      }
    } catch (error) {
      console.error('Error loading workout plans:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const saveWorkoutPlan = useCallback(async (plan: WorkoutPlan) => {
    try {
      const updatedPlans = [plan, ...workoutPlans];
      await AsyncStorage.setItem(WORKOUT_STORAGE_KEY, JSON.stringify(updatedPlans));
      setWorkoutPlans(updatedPlans);
      setCurrentPlan(plan);
    } catch (error) {
      console.error('Error saving workout plan:', error);
      throw error;
    }
  }, [workoutPlans]);

  const deleteWorkoutPlan = useCallback(async (planId: string) => {
    try {
      const updatedPlans = workoutPlans.filter(p => p.id !== planId);
      await AsyncStorage.setItem(WORKOUT_STORAGE_KEY, JSON.stringify(updatedPlans));
      setWorkoutPlans(updatedPlans);
      if (currentPlan?.id === planId) {
        setCurrentPlan(updatedPlans.length > 0 ? updatedPlans[0] : null);
      }
    } catch (error) {
      console.error('Error deleting workout plan:', error);
      throw error;
    }
  }, [workoutPlans, currentPlan]);

  const selectWorkoutPlan = useCallback((planId: string) => {
    const plan = workoutPlans.find(p => p.id === planId);
    if (plan) {
      setCurrentPlan(plan);
    }
  }, [workoutPlans]);

  const saveWorkoutLog = useCallback(async (log: WorkoutLog) => {
    try {
      const updatedLogs = [log, ...workoutLogs];
      await AsyncStorage.setItem(WORKOUT_LOGS_KEY, JSON.stringify(updatedLogs));
      setWorkoutLogs(updatedLogs);
    } catch (error) {
      console.error('Error saving workout log:', error);
      throw error;
    }
  }, [workoutLogs]);

  const getExerciseLogs = useCallback((exerciseName: string, limit: number = 5) => {
    return workoutLogs
      .filter(log => log.exerciseName === exerciseName)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, limit);
  }, [workoutLogs]);

  const getLastExerciseLog = useCallback((exerciseName: string) => {
    const logs = workoutLogs
      .filter(log => log.exerciseName === exerciseName)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    return logs.length > 0 ? logs[0] : null;
  }, [workoutLogs]);

  const getWorkoutStats = useCallback(() => {
    const totalWorkouts = workoutLogs.filter(log => log.completed).length;
    const totalSets = workoutLogs.reduce((sum, log) => sum + log.sets.filter(s => s.completed).length, 0);
    const totalReps = workoutLogs.reduce((sum, log) => 
      sum + log.sets.filter(s => s.completed).reduce((s, set) => s + set.reps, 0), 0
    );
    const totalWeight = workoutLogs.reduce((sum, log) => 
      sum + log.sets.filter(s => s.completed).reduce((s, set) => s + (set.reps * set.weight), 0), 0
    );
    const completedExercises = workoutLogs.filter(log => log.completed).length;

    const weeklyStatsMap = new Map<number, { completed: number; total: number }>();
    workoutLogs.forEach(log => {
      const week = log.weekNumber;
      if (!weeklyStatsMap.has(week)) {
        weeklyStatsMap.set(week, { completed: 0, total: 0 });
      }
      const stats = weeklyStatsMap.get(week)!;
      stats.total++;
      if (log.completed) {
        stats.completed++;
      }
    });

    const weeklyStats = Array.from(weeklyStatsMap.entries()).map(([week, stats]) => ({
      week,
      completedExercises: stats.completed,
      totalExercises: stats.total,
      completionRate: stats.total > 0 ? (stats.completed / stats.total) * 100 : 0,
    })).sort((a, b) => a.week - b.week);

    return {
      totalWorkouts,
      totalSets,
      totalReps,
      totalWeight,
      completedExercises,
      weeklyStats,
    };
  }, [workoutLogs]);

  const getExerciseProgress = useCallback((exerciseName: string) => {
    const exerciseLogs = workoutLogs
      .filter(log => log.exerciseName === exerciseName && log.completed)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    const history = exerciseLogs.map(log => {
      const completedSets = log.sets.filter(s => s.completed);
      const maxWeight = Math.max(...completedSets.map(s => s.weight), 0);
      const totalVolume = completedSets.reduce((sum, s) => sum + (s.reps * s.weight), 0);
      const avgReps = completedSets.length > 0 
        ? completedSets.reduce((sum, s) => sum + s.reps, 0) / completedSets.length 
        : 0;

      return {
        date: log.date,
        maxWeight,
        totalVolume,
        sets: completedSets.length,
        avgReps: Math.round(avgReps),
      };
    });

    return {
      exerciseName,
      exerciseNameAr: exerciseLogs[0]?.exerciseNameAr || '',
      history,
    };
  }, [workoutLogs]);

  useEffect(() => {
    loadWorkoutPlans();
  }, [loadWorkoutPlans]);

  return useMemo(() => ({
    workoutPlans,
    currentPlan,
    workoutLogs,
    isLoading,
    saveWorkoutPlan,
    deleteWorkoutPlan,
    selectWorkoutPlan,
    saveWorkoutLog,
    getExerciseLogs,
    getLastExerciseLog,
    getWorkoutStats,
    getExerciseProgress,
  }), [workoutPlans, currentPlan, workoutLogs, isLoading, saveWorkoutPlan, deleteWorkoutPlan, selectWorkoutPlan, saveWorkoutLog, getExerciseLogs, getLastExerciseLog, getWorkoutStats, getExerciseProgress]);
});
