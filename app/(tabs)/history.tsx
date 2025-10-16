import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Platform
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Calendar, ChevronLeft, ChevronRight, CheckCircle, X } from 'lucide-react-native';
import { useNutritionStore } from '@/providers/nutrition-provider';
import Colors from '@/constants/colors';

export default function HistoryScreen() {
  const insets = useSafeAreaInsets();
  const { getDailyLogs, unlogMeal, nutritionTargets } = useNutritionStore();
  const [selectedDate, setSelectedDate] = useState(new Date());

  const selectedDateString = selectedDate.toISOString().split('T')[0];
  const dailyLog = getDailyLogs(selectedDateString);

  const monthLogs = useMemo(() => {
    const year = selectedDate.getFullYear();
    const month = selectedDate.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    const logs: { [key: string]: { logged: number; total: number } } = {};
    
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const dateString = date.toISOString().split('T')[0];
      const dayLog = getDailyLogs(dateString);
      logs[dateString] = {
        logged: dayLog.meals.length,
        total: nutritionTargets ? Math.max(3, nutritionTargets.calories / 500) : 3 // Estimate based on calories
      };
    }
    
    return logs;
  }, [selectedDate, getDailyLogs, nutritionTargets]);

  const navigateMonth = (direction: 'prev' | 'next') => {
    setSelectedDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(newDate.getMonth() - 1);
      } else {
        newDate.setMonth(newDate.getMonth() + 1);
      }
      return newDate;
    });
  };

  const handleUnlogMeal = async (logId: string, mealName: string) => {
    const proceed = (() => {
      if (Platform.OS === 'web') {
        const hasWindow = typeof window !== 'undefined' && !!(window as unknown as { confirm?: (m: string) => boolean }).confirm;
        const confirmed = hasWindow ? (window as unknown as { confirm: (m: string) => boolean }).confirm(`هل تريد إلغاء تسجيل وجبة "${mealName}"؟`) : true;
        return confirmed;
      }
      return true;
    })();

    if (!proceed) return;

    try {
      await unlogMeal(logId);
      if (Platform.OS !== 'web') {
        Alert.alert('تم', 'تم إلغاء تسجيل الوجبة');
      }
    } catch (error) {
      console.error('خطأ في إلغاء تسجيل الوجبة:', error);
      if (Platform.OS !== 'web') {
        Alert.alert('خطأ', 'فشل في إلغاء تسجيل الوجبة');
      }
    }
  };

  const renderCalendar = () => {
    const year = selectedDate.getFullYear();
    const month = selectedDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    const days = [];
    
    // Empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(<View key={`empty-${i}`} style={styles.calendarDay} />);
    }
    
    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const dateString = date.toISOString().split('T')[0];
      const logData = monthLogs[dateString];
      const isSelected = dateString === selectedDateString;
      const isToday = dateString === new Date().toISOString().split('T')[0];
      
      days.push(
        <TouchableOpacity
          key={day}
          style={[
            styles.calendarDay,
            isSelected && styles.calendarDaySelected,
            isToday && styles.calendarDayToday
          ]}
          onPress={() => setSelectedDate(date)}
        >
          <Text style={[
            styles.calendarDayText,
            isSelected && styles.calendarDayTextSelected,
            isToday && styles.calendarDayTextToday
          ]}>
            {day}
          </Text>
          {logData.logged > 0 && (
            <View style={styles.dayIndicator}>
              <Text style={styles.dayIndicatorText}>{logData.logged}</Text>
            </View>
          )}
        </TouchableOpacity>
      );
    }
    
    return days;
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Calendar size={24} color={Colors.light.primary} />
        <Text style={styles.title}>تاريخ الوجبات</Text>
      </View>

      <View style={styles.monthSelector}>
        <TouchableOpacity onPress={() => navigateMonth('prev')}>
          <ChevronRight size={24} color={Colors.light.primary} />
        </TouchableOpacity>
        <Text style={styles.monthText}>
          {selectedDate.toLocaleDateString('ar-SA', { 
            year: 'numeric', 
            month: 'long' 
          })}
        </Text>
        <TouchableOpacity onPress={() => navigateMonth('next')}>
          <ChevronLeft size={24} color={Colors.light.primary} />
        </TouchableOpacity>
      </View>

      <View style={styles.calendar}>
        <View style={styles.weekDays}>
          {['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'].map(day => (
            <Text key={day} style={styles.weekDayText}>{day}</Text>
          ))}
        </View>
        <View style={styles.calendarGrid}>
          {renderCalendar()}
        </View>
      </View>

      <View style={styles.dailyLog}>
        <Text style={styles.dailyLogTitle}>
          {new Date(selectedDateString).toLocaleDateString('ar-SA', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })}
        </Text>

        {dailyLog.meals.length === 0 ? (
          <View style={styles.emptyDay}>
            <Text style={styles.emptyDayText}>لا توجد وجبات مسجلة لهذا اليوم</Text>
          </View>
        ) : (
          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={styles.loggedMeals}>
              {dailyLog.meals.map((log) => (
                <View key={log.id} style={styles.loggedMealItem}>
                  <View style={styles.loggedMealInfo}>
                    <CheckCircle size={20} color={Colors.light.success} />
                    <View style={styles.loggedMealDetails}>
                      <Text style={styles.loggedMealName}>{log.mealName}</Text>
                      <Text style={styles.loggedMealTime}>
                        {new Date(log.timestamp).toLocaleTimeString('ar-SA', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </Text>
                    </View>
                  </View>
                  <TouchableOpacity
                    onPress={() => handleUnlogMeal(log.id, log.mealName)}
                    style={styles.unlogButton}
                  >
                    <X size={16} color={Colors.light.error} />
                  </TouchableOpacity>
                </View>
              ))}
            </View>

            <View style={styles.dailySummary}>
              <Text style={styles.summaryTitle}>ملخص اليوم</Text>
              <View style={styles.summaryGrid}>
                <View style={styles.summaryItem}>
                  <Text style={styles.summaryValue}>{dailyLog.totalNutrition.calories}</Text>
                  <Text style={styles.summaryLabel}>سعرة</Text>
                </View>
                <View style={styles.summaryItem}>
                  <Text style={styles.summaryValue}>{dailyLog.totalNutrition.protein}</Text>
                  <Text style={styles.summaryLabel}>بروتين</Text>
                </View>
                <View style={styles.summaryItem}>
                  <Text style={styles.summaryValue}>{dailyLog.totalNutrition.carbs}</Text>
                  <Text style={styles.summaryLabel}>كربوهيدرات</Text>
                </View>
                <View style={styles.summaryItem}>
                  <Text style={styles.summaryValue}>{dailyLog.totalNutrition.fat}</Text>
                  <Text style={styles.summaryLabel}>دهون</Text>
                </View>
              </View>
            </View>
          </ScrollView>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.light.text,
  },
  monthSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  monthText: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.light.text,
  },
  calendar: {
    backgroundColor: Colors.light.gray[50],
    marginHorizontal: 20,
    borderRadius: 12,
    padding: 16,
  },
  weekDays: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 8,
  },
  weekDayText: {
    fontSize: 12,
    fontWeight: '500',
    color: Colors.light.gray[600],
    width: 32,
    textAlign: 'center',
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  calendarDay: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 2,
    borderRadius: 16,
  },
  calendarDaySelected: {
    backgroundColor: Colors.light.primary,
  },
  calendarDayToday: {
    borderWidth: 2,
    borderColor: Colors.light.primary,
  },
  calendarDayText: {
    fontSize: 14,
    color: Colors.light.text,
  },
  calendarDayTextSelected: {
    color: 'white',
    fontWeight: '600',
  },
  calendarDayTextToday: {
    fontWeight: 'bold',
  },
  dayIndicator: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: Colors.light.success,
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dayIndicatorText: {
    fontSize: 10,
    color: 'white',
    fontWeight: 'bold',
  },
  dailyLog: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  dailyLogTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.light.text,
    marginBottom: 16,
    textAlign: 'center',
  },
  emptyDay: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyDayText: {
    fontSize: 16,
    color: Colors.light.gray[500],
  },
  loggedMeals: {
    gap: 12,
  },
  loggedMealItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.light.gray[50],
    padding: 12,
    borderRadius: 8,
  },
  loggedMealInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  loggedMealDetails: {
    marginLeft: 12,
    flex: 1,
  },
  loggedMealName: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.light.text,
  },
  loggedMealTime: {
    fontSize: 12,
    color: Colors.light.gray[600],
    marginTop: 2,
  },
  unlogButton: {
    padding: 8,
  },
  dailySummary: {
    marginTop: 20,
    backgroundColor: Colors.light.primary + '10',
    borderRadius: 12,
    padding: 16,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.primary,
    textAlign: 'center',
    marginBottom: 12,
  },
  summaryGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  summaryItem: {
    alignItems: 'center',
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.light.primary,
  },
  summaryLabel: {
    fontSize: 12,
    color: Colors.light.primary,
    marginTop: 2,
  },
});