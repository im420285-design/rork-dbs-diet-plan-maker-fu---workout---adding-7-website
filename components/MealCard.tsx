import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Platform
} from 'react-native';
import { 
  Clock, 
  Users, 
  Zap, 
  Beef, 
  Wheat, 
  Droplets, 
  ChevronDown,
  ChevronUp,
  RefreshCw,
  CheckCircle,
  Circle
} from 'lucide-react-native';
import { Meal } from '@/types/nutrition';
import { useNutritionStore } from '@/providers/nutrition-provider';
import { regenerateMeal } from '@/services/meal-generator';
import Colors from '@/constants/colors';

interface Props {
  meal: Meal;
}

export default function MealCard({ meal }: Props) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const { userProfile, nutritionTargets, currentMealPlan, setCurrentMealPlan, logMeal, unlogMeal, isMealLoggedToday, mealLogs, selectedDate } = useNutritionStore();

  const mealTypeLabels = {
    breakfast: 'إفطار',
    lunch: 'غداء',
    dinner: 'عشاء',
    snack: 'وجبة خفيفة'
  };

  const mealTypeColors = {
    breakfast: '#FF6B35',
    lunch: '#4FD1C7',
    dinner: '#9F7AEA',
    snack: '#48BB78'
  };

  const isLogged = isMealLoggedToday(meal.id);

  const handleRegenerateMeal = async () => {
    if (!userProfile || !nutritionTargets || !currentMealPlan) {
      Alert.alert('خطأ', 'بيانات المستخدم غير متوفرة');
      return;
    }

    const proceed = (() => {
      if (Platform.OS === 'web') {
        const hasWindow = typeof window !== 'undefined' && !!(window as unknown as { confirm?: (m: string) => boolean }).confirm;
        const confirmed = hasWindow ? (window as unknown as { confirm: (m: string) => boolean }).confirm(`هل تريد استبدال وجبة "${meal.name}" بوجبة جديدة؟`) : true;
        return confirmed;
      }
      return true;
    })();

    if (!proceed) {
      return;
    }

    setIsRegenerating(true);
    try {
      console.log('بدء إعادة توليد الوجبة:', meal.name);
      const newMeal = await regenerateMeal(meal, nutritionTargets, userProfile);

      const updatedMeals = currentMealPlan.meals.map(m => (m.id === meal.id ? newMeal : m));

      const totalNutrition = updatedMeals.reduce(
        (acc, m) => ({
          calories: acc.calories + (m.nutrition?.calories ?? 0),
          protein: acc.protein + (m.nutrition?.protein ?? 0),
          carbs: acc.carbs + (m.nutrition?.carbs ?? 0),
          fat: acc.fat + (m.nutrition?.fat ?? 0),
          fiber: acc.fiber + (m.nutrition?.fiber ?? 0),
        }),
        { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 }
      );

      const updatedMealPlan = {
        ...currentMealPlan,
        meals: updatedMeals,
        totalNutrition,
      };

      setCurrentMealPlan(updatedMealPlan);
      if (Platform.OS !== 'web') {
        Alert.alert('نجاح', 'تم إعادة توليد الوجبة بنجاح!');
      }
    } catch (error) {
      console.error('خطأ في إعادة توليد الوجبة:', error);
      const errorMessage = error instanceof Error ? error.message : 'حدث خطأ غير متوقع';
      if (Platform.OS !== 'web') {
        Alert.alert('خطأ', errorMessage);
      }
    } finally {
      setIsRegenerating(false);
    }
  };

  const handleToggleMealLog = async () => {
    if (isLogged) {
      const date = selectedDate ?? new Date().toISOString().split('T')[0];
      const logEntry = mealLogs.find(log => log.mealId === meal.id && log.date === date);
      if (logEntry) {
        await unlogMeal(logEntry.id);
        if (Platform.OS !== 'web') {
          Alert.alert('تم', 'تم إلغاء تسجيل الوجبة');
        }
      }
    } else {
      await logMeal(meal);
      if (Platform.OS !== 'web') {
        Alert.alert('تم', 'تم تسجيل تناول الوجبة!');
      }
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.mealTypeContainer}>
          <View 
            style={[
              styles.mealTypeBadge, 
              { backgroundColor: mealTypeColors[meal.type] + '20' }
            ]}
          >
            <Text 
              style={[
                styles.mealTypeText, 
                { color: mealTypeColors[meal.type] }
              ]}
            >
              {mealTypeLabels[meal.type]}
            </Text>
          </View>
        </View>
        
        <View style={styles.headerActions}>
          <TouchableOpacity 
            testID="regenerate-meal-button"
            style={styles.regenerateButton}
            onPress={handleRegenerateMeal}
            disabled={isRegenerating}
          >
            {isRegenerating ? (
              <ActivityIndicator size="small" color={Colors.light.primary} />
            ) : (
              <RefreshCw size={20} color={Colors.light.primary} />
            )}
          </TouchableOpacity>

          <TouchableOpacity 
            testID="log-meal-button"
            style={[styles.logButton, isLogged && styles.logButtonLogged]}
            onPress={handleToggleMealLog}
          >
            {isLogged ? (
              <CheckCircle size={20} color={Colors.light.success} />
            ) : (
              <Circle size={20} color={Colors.light.gray[400]} />
            )}
          </TouchableOpacity>
        </View>
      </View>

      <Text style={styles.mealName}>{meal.name}</Text>

      <View style={styles.quickInfo}>
        <View style={styles.infoItem}>
          <Clock size={16} color={Colors.light.gray[500]} />
          <Text style={styles.infoText}>{meal.prepTime || 0} دقيقة</Text>
        </View>
        <View style={styles.infoItem}>
          <Users size={16} color={Colors.light.gray[500]} />
          <Text style={styles.infoText}>{meal.servings || 1} حصة</Text>
        </View>
        <View style={styles.infoItem}>
          <Zap size={16} color={Colors.light.primary} />
          <Text style={[styles.infoText, { color: Colors.light.primary }]}>
            {meal.nutrition?.calories || 0} سعرة
          </Text>
        </View>
      </View>

      <View style={styles.nutritionSummary}>
        <View style={styles.nutritionItem}>
          <Beef size={14} color={Colors.light.error} />
          <Text style={styles.nutritionText}>{meal.nutrition?.protein || 0}جم</Text>
        </View>
        <View style={styles.nutritionItem}>
          <Wheat size={14} color={Colors.light.warning} />
          <Text style={styles.nutritionText}>{meal.nutrition?.carbs || 0}جم</Text>
        </View>
        <View style={styles.nutritionItem}>
          <Droplets size={14} color={Colors.light.secondary} />
          <Text style={styles.nutritionText}>{meal.nutrition?.fat || 0}جم</Text>
        </View>
      </View>

      <TouchableOpacity 
        style={styles.expandButton}
        onPress={() => setIsExpanded(!isExpanded)}
      >
        <Text style={styles.expandButtonText}>
          {isExpanded ? 'إخفاء التفاصيل' : 'عرض التفاصيل'}
        </Text>
        {isExpanded ? (
          <ChevronUp size={16} color={Colors.light.primary} />
        ) : (
          <ChevronDown size={16} color={Colors.light.primary} />
        )}
      </TouchableOpacity>

      {isExpanded && (
        <View style={styles.expandedContent}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>المكونات:</Text>
            {meal.ingredients && Array.isArray(meal.ingredients) && meal.ingredients.length > 0 ? meal.ingredients.map((ingredient, index) => (
              <Text key={index} style={styles.listItem}>• {ingredient}</Text>
            )) : (
              <Text style={styles.listItem}>لا توجد معلومات عن المكونات</Text>
            )}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>طريقة التحضير:</Text>
            {meal.instructions && Array.isArray(meal.instructions) && meal.instructions.length > 0 ? meal.instructions.map((instruction, index) => (
              <Text key={index} style={styles.listItem}>
                {index + 1}. {instruction}
              </Text>
            )) : (
              <Text style={styles.listItem}>لا توجد معلومات عن طريقة التحضير</Text>
            )}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>القيم الغذائية التفصيلية:</Text>
            <View style={styles.detailedNutrition}>
              <View style={styles.nutritionRow}>
                <Text style={styles.nutritionLabel}>السعرات الحرارية:</Text>
                <Text style={styles.nutritionValue}>{meal.nutrition?.calories || 0} سعرة</Text>
              </View>
              <View style={styles.nutritionRow}>
                <Text style={styles.nutritionLabel}>البروتين:</Text>
                <Text style={styles.nutritionValue}>{meal.nutrition?.protein || 0} جرام</Text>
              </View>
              <View style={styles.nutritionRow}>
                <Text style={styles.nutritionLabel}>الكربوهيدرات:</Text>
                <Text style={styles.nutritionValue}>{meal.nutrition?.carbs || 0} جرام</Text>
              </View>
              <View style={styles.nutritionRow}>
                <Text style={styles.nutritionLabel}>الدهون:</Text>
                <Text style={styles.nutritionValue}>{meal.nutrition?.fat || 0} جرام</Text>
              </View>
              <View style={styles.nutritionRow}>
                <Text style={styles.nutritionLabel}>الألياف:</Text>
                <Text style={styles.nutritionValue}>{meal.nutrition?.fiber || 0} جرام</Text>
              </View>
            </View>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.light.background,
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 20,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  mealTypeContainer: {
    flex: 1,
  },
  mealTypeBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  mealTypeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  regenerateButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: Colors.light.primary + '10',
  },
  logButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: Colors.light.gray[100],
  },
  logButtonLogged: {
    backgroundColor: Colors.light.success + '20',
  },
  mealName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.light.text,
    marginBottom: 12,
  },
  quickInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  infoText: {
    fontSize: 12,
    color: Colors.light.gray[600],
  },
  nutritionSummary: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 12,
    backgroundColor: Colors.light.gray[50],
    borderRadius: 8,
    marginBottom: 12,
  },
  nutritionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  nutritionText: {
    fontSize: 12,
    fontWeight: '500',
    color: Colors.light.text,
  },
  expandButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 8,
  },
  expandButtonText: {
    fontSize: 14,
    color: Colors.light.primary,
    fontWeight: '500',
  },
  expandedContent: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.light.gray[200],
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.text,
    marginBottom: 8,
  },
  listItem: {
    fontSize: 14,
    color: Colors.light.gray[700],
    lineHeight: 20,
    marginBottom: 4,
  },
  detailedNutrition: {
    backgroundColor: Colors.light.gray[50],
    borderRadius: 8,
    padding: 12,
  },
  nutritionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  nutritionLabel: {
    fontSize: 14,
    color: Colors.light.gray[600],
  },
  nutritionValue: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.light.text,
  },
});