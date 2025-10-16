import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { WorkoutLog } from '@/types/workout';
import { Calendar, TrendingUp, Dumbbell, BarChart3, Activity } from 'lucide-react-native';
import { useWorkout } from '@/providers/workout-provider';

interface WorkoutHistoryProps {
  logs: WorkoutLog[];
}

export default function WorkoutHistory({ logs }: WorkoutHistoryProps) {
  const [selectedView, setSelectedView] = useState<'history' | 'stats'>('history');
  const { getWorkoutStats } = useWorkout();
  const workoutStats = getWorkoutStats();

  const groupedLogs = useMemo(() => {
    const groups: { [key: string]: WorkoutLog[] } = {};
    
    logs.forEach(log => {
      const date = new Date(log.date);
      const dateKey = date.toLocaleDateString('ar-EG', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
      
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(log);
    });
    
    return groups;
  }, [logs]);

  const historyStats = useMemo(() => {
    const totalWorkouts = logs.length;
    const totalSets = logs.reduce((sum, log) => sum + log.sets.filter(s => s.completed).length, 0);
    const totalReps = logs.reduce((sum, log) => 
      sum + log.sets.filter(s => s.completed).reduce((s, set) => s + set.reps, 0), 0
    );
    const totalWeight = logs.reduce((sum, log) => 
      sum + log.sets.filter(s => s.completed).reduce((s, set) => s + (set.reps * set.weight), 0), 0
    );

    return { totalWorkouts, totalSets, totalReps, totalWeight };
  }, [logs]);

  if (logs.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Dumbbell size={64} color="#ccc" />
        <Text style={styles.emptyText}>لا توجد سجلات تمارين بعد</Text>
        <Text style={styles.emptySubtext}>ابدأ بتسجيل تماrinك لمتابعة تقدمك</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.tabsContainer}>
        <TouchableOpacity
          style={[styles.tab, selectedView === 'history' && styles.tabActive]}
          onPress={() => setSelectedView('history')}
        >
          <Activity size={20} color={selectedView === 'history' ? '#007AFF' : '#666'} />
          <Text style={[styles.tabText, selectedView === 'history' && styles.tabTextActive]}>
            السجل
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, selectedView === 'stats' && styles.tabActive]}
          onPress={() => setSelectedView('stats')}
        >
          <BarChart3 size={20} color={selectedView === 'stats' ? '#007AFF' : '#666'} />
          <Text style={[styles.tabText, selectedView === 'stats' && styles.tabTextActive]}>
            الإحصائيات
          </Text>
        </TouchableOpacity>
      </View>

      {selectedView === 'stats' && (
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <View style={styles.statsSection}>
            <Text style={styles.sectionTitle}>📊 الإحصائيات العامة</Text>
            <View style={styles.statsGrid}>
              <View style={styles.statCard}>
                <Dumbbell size={24} color="#007AFF" />
                <Text style={styles.statValue}>{workoutStats.totalWorkouts}</Text>
                <Text style={styles.statLabel}>تمرين مكتمل</Text>
              </View>
              <View style={styles.statCard}>
                <TrendingUp size={24} color="#34C759" />
                <Text style={styles.statValue}>{workoutStats.totalSets}</Text>
                <Text style={styles.statLabel}>مجموعة</Text>
              </View>
              <View style={styles.statCard}>
                <Calendar size={24} color="#FF9500" />
                <Text style={styles.statValue}>{workoutStats.totalReps}</Text>
                <Text style={styles.statLabel}>تكرار</Text>
              </View>
              <View style={styles.statCard}>
                <TrendingUp size={24} color="#FF3B30" />
                <Text style={styles.statValue}>{Math.round(workoutStats.totalWeight)}</Text>
                <Text style={styles.statLabel}>كجم إجمالي</Text>
              </View>
            </View>
          </View>

          {workoutStats.weeklyStats.length > 0 && (
            <View style={styles.statsSection}>
              <Text style={styles.sectionTitle}>📈 الإحصائيات الأسبوعية</Text>
              {workoutStats.weeklyStats.map((weekStat) => (
                <View key={weekStat.week} style={styles.weekStatCard}>
                  <View style={styles.weekStatHeader}>
                    <Text style={styles.weekStatTitle}>الأسبوع {weekStat.week}</Text>
                    <Text style={styles.weekStatCompletion}>
                      {Math.round(weekStat.completionRate)}% مكتمل
                    </Text>
                  </View>
                  <View style={styles.progressBarContainer}>
                    <View 
                      style={[
                        styles.progressBar, 
                        { width: `${weekStat.completionRate}%` }
                      ]} 
                    />
                  </View>
                  <Text style={styles.weekStatDetails}>
                    {weekStat.completedExercises} من {weekStat.totalExercises} تمرين
                  </Text>
                </View>
              ))}
            </View>
          )}

          <View style={styles.bottomPadding} />
        </ScrollView>
      )}

      {selectedView === 'history' && (
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Dumbbell size={24} color="#007AFF" />
          <Text style={styles.statValue}>{historyStats.totalWorkouts}</Text>
          <Text style={styles.statLabel}>ت��رين</Text>
        </View>

        <View style={styles.statCard}>
          <TrendingUp size={24} color="#34C759" />
          <Text style={styles.statValue}>{historyStats.totalSets}</Text>
          <Text style={styles.statLabel}>مجموعة</Text>
        </View>

        <View style={styles.statCard}>
          <Calendar size={24} color="#FF9500" />
          <Text style={styles.statValue}>{historyStats.totalReps}</Text>
          <Text style={styles.statLabel}>تكرار</Text>
        </View>

        <View style={styles.statCard}>
          <TrendingUp size={24} color="#FF3B30" />
          <Text style={styles.statValue}>{Math.round(historyStats.totalWeight)}</Text>
          <Text style={styles.statLabel}>كجم إجمالي</Text>
        </View>
      </View>

      <View style={styles.historyContainer}>
        {Object.entries(groupedLogs).map(([date, dayLogs]) => (
          <View key={date} style={styles.dateGroup}>
            <View style={styles.dateHeader}>
              <Calendar size={18} color="#007AFF" />
              <Text style={styles.dateText}>{date}</Text>
            </View>

            {dayLogs.map((log) => (
              <View key={log.id} style={styles.logCard}>
                <View style={styles.logHeader}>
                  <Text style={styles.exerciseName}>{log.exerciseNameAr}</Text>
                  <Text style={styles.exerciseNameEn}>{log.exerciseName}</Text>
                </View>

                <View style={styles.setsContainer}>
                  {log.sets.filter(s => s.completed).map((set, index) => (
                    <View key={index} style={styles.setChip}>
                      <Text style={styles.setChipText}>
                        {set.reps} × {set.weight}kg
                      </Text>
                    </View>
                  ))}
                </View>

                {log.notes && (
                  <View style={styles.notesContainer}>
                    <Text style={styles.notesText}>📝 {log.notes}</Text>
                  </View>
                )}

                <View style={styles.logFooter}>
                  <Text style={styles.logTime}>
                    {new Date(log.date).toLocaleTimeString('ar-EG', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </Text>
                  <Text style={styles.logDay}>اليوم {log.dayNumber}</Text>
                </View>
              </View>
            ))}
          </View>
        ))}
      </View>

          <View style={styles.bottomPadding} />
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollView: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  tabsContainer: {
    flexDirection: 'row' as const,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  tab: {
    flex: 1,
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    gap: 8,
    paddingVertical: 16,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: '#007AFF',
  },
  tabText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#666',
  },
  tabTextActive: {
    color: '#007AFF',
  },
  statsSection: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: '#1a1a1a',
    marginBottom: 16,
    textAlign: 'right' as const,
  },
  statsGrid: {
    flexDirection: 'row' as const,
    flexWrap: 'wrap' as const,
    gap: 12,
  },
  weekStatCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  weekStatHeader: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
    marginBottom: 12,
  },
  weekStatTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: '#1a1a1a',
  },
  weekStatCompletion: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#34C759',
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    overflow: 'hidden' as const,
    marginBottom: 8,
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#34C759',
    borderRadius: 4,
  },
  weekStatDetails: {
    fontSize: 14,
    color: '#666',
    textAlign: 'right' as const,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    padding: 40,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: '#666',
    marginTop: 20,
    textAlign: 'center' as const,
  },
  emptySubtext: {
    fontSize: 16,
    color: '#999',
    marginTop: 8,
    textAlign: 'center' as const,
  },
  statsContainer: {
    flexDirection: 'row' as const,
    flexWrap: 'wrap' as const,
    padding: 16,
    gap: 12,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 16,
    alignItems: 'center' as const,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  statValue: {
    fontSize: 28,
    fontWeight: '700' as const,
    color: '#1a1a1a',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  historyContainer: {
    padding: 16,
    paddingTop: 0,
  },
  dateGroup: {
    marginBottom: 24,
  },
  dateHeader: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 8,
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  dateText: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: '#007AFF',
  },
  logCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  logHeader: {
    marginBottom: 12,
  },
  exerciseName: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: '#1a1a1a',
    marginBottom: 4,
    textAlign: 'right' as const,
  },
  exerciseNameEn: {
    fontSize: 13,
    color: '#666',
    textAlign: 'right' as const,
  },
  setsContainer: {
    flexDirection: 'row' as const,
    flexWrap: 'wrap' as const,
    gap: 8,
    marginBottom: 12,
    justifyContent: 'flex-end' as const,
  },
  setChip: {
    backgroundColor: '#f0f8ff',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#007AFF',
  },
  setChipText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#007AFF',
  },
  notesContainer: {
    backgroundColor: '#fff9e6',
    padding: 10,
    borderRadius: 8,
    marginBottom: 12,
  },
  notesText: {
    fontSize: 13,
    color: '#856404',
    textAlign: 'right' as const,
  },
  logFooter: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  logTime: {
    fontSize: 13,
    color: '#999',
  },
  logDay: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: '#007AFF',
  },
  bottomPadding: {
    height: 40,
  },
});
