import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity
} from 'react-native';

import { UtensilsCrossed } from 'lucide-react-native';
import { useNutritionStore } from '@/providers/nutrition-provider';
import MealCard from '@/components/MealCard';
import { Meal } from '@/types/nutrition';
import Colors from '@/constants/colors';
import DateHeader from '@/components/DateHeader';

export default function MealsScreen() {
  const { currentMealPlan, selectedDate, navigateDay, setSelectedDate } = useNutritionStore();

  if (!currentMealPlan || !currentMealPlan.meals || !Array.isArray(currentMealPlan.meals) || currentMealPlan.meals.length === 0) {
    return (
      <View style={styles.container}>
        <DateHeader
          dateISO={selectedDate}
          onPrevDay={() => { void navigateDay(-1); }}
          onNextDay={() => { void navigateDay(1); }}
          onPickDate={(d) => { void setSelectedDate(d); }}
        />
        <View style={styles.emptyState}>
          <UtensilsCrossed size={64} color={Colors.light.gray[400]} />
          <Text style={styles.emptyTitle}>لا توجد وجبات لهذا اليوم</Text>
          <Text style={styles.emptySubtitle}>
            استخدم التاريخ أعلاه للتنقل بين الأيام. إن لم توجد خطة، أنشئها من الصفحة الرئيسية.
          </Text>
        </View>
      </View>
    );
  }

  const meals = currentMealPlan?.meals || [];
  const mealsByType = {
    breakfast: meals.filter((meal) => meal.type === 'breakfast'),
    lunch: meals.filter((meal) => meal.type === 'lunch'),
    dinner: meals.filter((meal) => meal.type === 'dinner'),
    snack: meals.filter((meal) => meal.type === 'snack')
  };

  return (
    <View style={styles.container}>
      <DateHeader
        dateISO={selectedDate}
        onPrevDay={() => { void navigateDay(-1); }}
        onNextDay={() => { void navigateDay(1); }}
        onPickDate={(d) => { void setSelectedDate(d); }}
      />

      <View style={styles.nutritionSummary}>
        <Text style={styles.summaryTitle}>الإجمالي اليومي</Text>
        <View style={styles.summaryRow}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryValue}>{currentMealPlan.totalNutrition?.calories || 0}</Text>
            <Text style={styles.summaryLabel}>سعرة</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryValue}>{currentMealPlan.totalNutrition?.protein || 0}</Text>
            <Text style={styles.summaryLabel}>بروتين</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryValue}>{currentMealPlan.totalNutrition?.carbs || 0}</Text>
            <Text style={styles.summaryLabel}>كربوهيدرات</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryValue}>{currentMealPlan.totalNutrition?.fat || 0}</Text>
            <Text style={styles.summaryLabel}>دهون</Text>
          </View>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} style={styles.mealsContainer}>
        {mealsByType.breakfast && mealsByType.breakfast.length > 0 && mealsByType.breakfast.map((meal: Meal) => (
          <MealCard
            key={meal.id}
            meal={meal}
          />
        ))}
        
        {mealsByType.lunch && mealsByType.lunch.length > 0 && mealsByType.lunch.map((meal: Meal) => (
          <MealCard
            key={meal.id}
            meal={meal}
          />
        ))}
        
        {mealsByType.dinner && mealsByType.dinner.length > 0 && mealsByType.dinner.map((meal: Meal) => (
          <MealCard
            key={meal.id}
            meal={meal}
          />
        ))}
        
        {mealsByType.snack && mealsByType.snack.length > 0 && mealsByType.snack.map((meal: Meal) => (
          <MealCard
            key={meal.id}
            meal={meal}
          />
        ))}

        <View style={styles.bottomSpacing} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  nutritionSummary: {
    backgroundColor: Colors.light.gray[50],
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  summaryTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.light.text,
    textAlign: 'center',
    marginBottom: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  summaryItem: {
    alignItems: 'center',
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.light.primary,
  },
  summaryLabel: {
    fontSize: 10,
    color: Colors.light.gray[600],
    marginTop: 2,
  },
  mealsContainer: {
    flex: 1,
    paddingTop: 16,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.light.gray[600],
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: Colors.light.gray[500],
    textAlign: 'center',
    lineHeight: 22,
  },
  bottomSpacing: {
    height: 40,
  },
});