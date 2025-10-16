import createContextHook from '@nkzw/create-context-hook';
import { useState, useCallback, useMemo } from 'react';
import { UserProfile, NutritionTargets, DailyMealPlan, MealLog, DailyLog, Meal } from '@/types/nutrition';
import { useStorage } from '@/providers/storage';

export const [NutritionProvider, useNutritionStore] = createContextHook(() => {
  const { getItem, setItem } = useStorage();
  const [userProfile, setUserProfileState] = useState<UserProfile | null>(null);
  const [nutritionTargets, setNutritionTargets] = useState<NutritionTargets | null>(null);
  const [currentMealPlan, setCurrentMealPlanState] = useState<DailyMealPlan | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [mealLogs, setMealLogs] = useState<MealLog[]>([]);
  const [selectedDate, setSelectedDateState] = useState<string>(new Date().toISOString().split('T')[0]);

  const calculateNutritionTargets = useCallback((profile: UserProfile): NutritionTargets => {
    if (!profile?.age || !profile?.weight || !profile?.height) {
      console.error('بيانات الملف الشخصي غير مكتملة:', profile);
      throw new Error('Invalid profile data');
    }

    let bmr: number;
    if (profile.gender === 'male') {
      bmr = 10 * profile.weight + 6.25 * profile.height - 5 * profile.age + 5;
    } else {
      bmr = 10 * profile.weight + 6.25 * profile.height - 5 * profile.age - 161;
    }

    const activityMultipliers = {
      sedentary: 1.2,
      light: 1.375,
      moderate: 1.55,
      active: 1.725,
      very_active: 1.9,
    } as const;

    const tdee = bmr * activityMultipliers[profile.activityLevel];

    let calories = tdee;
    if (profile.goal === 'lose') {
      const mode = profile.weightLossMode ?? 'standard';
      if (mode === 'aggressive') {
        calories = Math.round(tdee * 0.70);
      } else {
        calories = Math.round(tdee - 500);
      }
    } else if (profile.goal === 'gain') {
      calories = Math.round(tdee + 500);
    } else {
      calories = Math.round(tdee);
    }

    let proteinPercent = 0.25;
    let fatPercent = 0.30;
    let carbsPercent = 0.45;

    if (profile.dietType === 'keto') {
      proteinPercent = 0.25;
      fatPercent = 0.70;
      carbsPercent = 0.05;
    } else if (profile.dietType === 'low_carb') {
      proteinPercent = 0.30;
      fatPercent = 0.50;
      carbsPercent = 0.20;
    } else if (profile.dietType === 'high_protein') {
      proteinPercent = 0.40;
      fatPercent = 0.25;
      carbsPercent = 0.35;
    } else if (profile.dietType === 'low_fat') {
      proteinPercent = 0.30;
      fatPercent = 0.20;
      carbsPercent = 0.50;
    } else if (profile.dietType === 'balanced') {
      proteinPercent = 0.25;
      fatPercent = 0.30;
      carbsPercent = 0.45;
    } else if (profile.dietType === 'intermittent_fasting') {
      proteinPercent = 0.30;
      fatPercent = 0.30;
      carbsPercent = 0.40;
    } else if (profile.dietType === 'mediterranean') {
      proteinPercent = 0.20;
      fatPercent = 0.35;
      carbsPercent = 0.45;
    } else if (profile.dietType === 'paleo') {
      proteinPercent = 0.30;
      fatPercent = 0.40;
      carbsPercent = 0.30;
    } else if (profile.dietType === 'vegan') {
      proteinPercent = 0.20;
      fatPercent = 0.25;
      carbsPercent = 0.55;
    } else if (profile.dietType === 'vegetarian') {
      proteinPercent = 0.25;
      fatPercent = 0.30;
      carbsPercent = 0.45;
    }

    let proteinGrams: number;
    if (typeof profile.bodyFatPercent === 'number' && profile.bodyFatPercent > 0 && profile.bodyFatPercent < 60) {
      const lbm = profile.weight * (1 - profile.bodyFatPercent / 100);
      const multiplier = profile.goal === 'lose' && (profile.weightLossMode ?? 'standard') === 'aggressive' ? 2.2 : 1.8;
      proteinGrams = Math.round(lbm * multiplier);
    } else {
      proteinGrams = Math.round((calories * proteinPercent) / 4);
    }

    const remainingCals = Math.max(0, calories - proteinGrams * 4);
    const fatCalsShare = fatPercent / (fatPercent + carbsPercent);
    const carbsCalsShare = carbsPercent / (fatPercent + carbsPercent);
    const fat = Math.round((remainingCals * fatCalsShare) / 9);
    const carbs = Math.round((remainingCals * carbsCalsShare) / 4);
    const fiber = Math.max(25, (calories / 1000) * 14);

    return {
      calories: Math.round(calories),
      protein: proteinGrams,
      carbs,
      fat,
      fiber: Math.round(fiber),
    };
  }, []);

  const saveSelectedDate = useCallback(async (date: string) => {
    try {
      await setItem('selectedDate', date);
      console.log('تم حفظ التاريخ المحدد:', date);
    } catch (error) {
      console.error('خطأ في حفظ التاريخ المحدد:', error);
    }
  }, [setItem]);

  const saveUserProfile = useCallback(async (profile: UserProfile) => {
    try {
      if (!profile || typeof profile !== 'object') {
        console.error('Invalid profile data for saving');
        return;
      }
      await setItem('userProfile', JSON.stringify(profile));
    } catch (error) {
      console.error('Error saving user profile:', error);
    }
  }, [setItem]);

  const setUserProfile = useCallback((profile: UserProfile | null) => {
    if (!profile) {
      setUserProfileState(null);
      setNutritionTargets(null);
      return;
    }

    if (typeof profile !== 'object') {
      console.error('Invalid profile data');
      return;
    }

    const targets = calculateNutritionTargets(profile);
    setUserProfileState(profile);
    setNutritionTargets(targets);
    saveUserProfile(profile);
  }, [calculateNutritionTargets, saveUserProfile]);

  const loadMealPlanForDate = useCallback(async (date: string) => {
    try {
      const key = `mealPlan:${date}`;
      const storedMealPlan = await getItem(key);
      if (storedMealPlan && storedMealPlan.trim()) {
        const mealPlan = JSON.parse(storedMealPlan) as DailyMealPlan;
        if (mealPlan && typeof mealPlan === 'object' && mealPlan.meals) {
          console.log('تم تحميل خطة الوجبات للتاريخ', date, ':', mealPlan.meals.length, 'وجبات');
          setCurrentMealPlanState(mealPlan);
          return mealPlan;
        }
      } else {
        console.log('لا توجد خطة وجبات محفوظة للتاريخ', date);
        setCurrentMealPlanState(null);
      }
    } catch (error) {
      console.error('خطأ في تحميل خطة الوجبات لتاريخ محدد:', error);
    }
    return null;
  }, [getItem]);

  const setSelectedDate = useCallback(async (date: string) => {
    setSelectedDateState(date);
    await saveSelectedDate(date);
    await loadMealPlanForDate(date);
  }, [loadMealPlanForDate, saveSelectedDate]);

  const navigateDay = useCallback(async (offset: number) => {
    const current = new Date(selectedDate);
    current.setDate(current.getDate() + offset);
    const next = current.toISOString().split('T')[0];
    await setSelectedDate(next);
  }, [selectedDate, setSelectedDate]);

  const loadUserProfile = useCallback(async () => {
    try {
      console.log('بدء تحميل الملف الشخصي...');
      const stored = await getItem('userProfile');
      if (stored && stored.trim()) {
        const profile = JSON.parse(stored) as UserProfile;
        if (profile && typeof profile === 'object') {
          console.log('تم تحميل الملف الشخصي:', profile);
          const targets = calculateNutritionTargets(profile);
          console.log('تم حساب الأهداف الغذائية:', targets);
          setUserProfileState(profile);
          setNutritionTargets(targets);
        }
      } else {
        console.log('لا يوجد ملف شخصي محفوظ');
      }
      
      const storedSelectedDate = await getItem('selectedDate');
      if (storedSelectedDate && storedSelectedDate.trim()) {
        setSelectedDateState(storedSelectedDate);
        console.log('تم تحميل التاريخ المحدد:', storedSelectedDate);
      }

      await loadMealPlanForDate(storedSelectedDate && storedSelectedDate.trim() ? storedSelectedDate : selectedDate);

      const storedLogs = await getItem('mealLogs');
      if (storedLogs && storedLogs.trim()) {
        const logs = JSON.parse(storedLogs) as MealLog[];
        if (Array.isArray(logs)) {
          console.log('تم تحميل سجل الوجبات:', logs.length, 'سجل');
          setMealLogs(logs);
        }
      }
    } catch (error) {
      console.error('Error loading user profile:', error);
    }
  }, [getItem, calculateNutritionTargets]);

  const setCurrentMealPlan = useCallback(async (mealPlan: DailyMealPlan | null) => {
    console.log('تحديث خطة الوجبات:', mealPlan ? `${mealPlan.meals?.length || 0} وجبات` : 'null');
    setCurrentMealPlanState(mealPlan);
    if (mealPlan) {
      try {
        const datedMealPlan: DailyMealPlan = { ...mealPlan, date: selectedDate };
        const key = `mealPlan:${selectedDate}`;
        await setItem(key, JSON.stringify(datedMealPlan));
        await setItem('selectedDate', selectedDate);
        console.log('تم حفظ خطة الوجبات في التخزين للتاريخ', selectedDate);
      } catch (error) {
        console.error('خطأ في حفظ خطة الوجبات:', error);
      }
    }
  }, [setItem, selectedDate]);

  const logMeal = useCallback(async (meal: Meal) => {
    const now = new Date();
    const dateToLog = selectedDate ?? now.toISOString().split('T')[0];
    const timestamp = now.toISOString();

    const mealLog: MealLog = {
      id: `${meal.id}-${timestamp}`,
      mealId: meal.id,
      mealName: meal.name,
      mealType: meal.type,
      date: dateToLog,
      timestamp,
      nutrition: meal.nutrition,
    };

    const updatedLogs = [...mealLogs, mealLog];
    setMealLogs(updatedLogs);

    try {
      await setItem('mealLogs', JSON.stringify(updatedLogs));
      console.log('تم تسجيل الوجبة في تاريخ', dateToLog, ':', meal.name);
    } catch (error) {
      console.error('خطأ في حفظ سجل الوجبة:', error);
    }
  }, [mealLogs, selectedDate, setItem]);

  const unlogMeal = useCallback(async (logId: string) => {
    const updatedLogs = mealLogs.filter(log => log.id !== logId);
    setMealLogs(updatedLogs);

    try {
      await setItem('mealLogs', JSON.stringify(updatedLogs));
      console.log('تم إلغاء تسجيل الوجبة:', logId);
    } catch (error) {
      console.error('خطأ في حذف سجل الوجبة:', error);
    }
  }, [mealLogs, setItem]);

  const getDailyLogs = useCallback((date: string): DailyLog => {
    const dayLogs = mealLogs.filter(log => log.date === date);
    const totalNutrition = dayLogs.reduce(
      (acc, log) => ({
        calories: acc.calories + log.nutrition.calories,
        protein: acc.protein + log.nutrition.protein,
        carbs: acc.carbs + log.nutrition.carbs,
        fat: acc.fat + log.nutrition.fat,
        fiber: acc.fiber + log.nutrition.fiber,
      }),
      { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 }
    );

    return {
      date,
      meals: dayLogs,
      totalNutrition,
    };
  }, [mealLogs]);

  const isMealLoggedToday = useCallback((mealId: string): boolean => {
    const date = selectedDate ?? new Date().toISOString().split('T')[0];
    return mealLogs.some(log => log.mealId === mealId && log.date === date);
  }, [mealLogs, selectedDate]);

  const validateMacros = useCallback((targets: NutritionTargets): { valid: boolean; message?: string; corrected?: NutritionTargets } => {
    const proteinCals = targets.protein * 4;
    const carbsCals = targets.carbs * 4;
    const fatCals = targets.fat * 9;
    const totalMacroCals = proteinCals + carbsCals + fatCals;

    const tolerance = 50;
    const diff = Math.abs(totalMacroCals - targets.calories);

    if (diff > tolerance) {
      const proteinPercent = proteinCals / totalMacroCals;
      const carbsPercent = carbsCals / totalMacroCals;
      const fatPercent = fatCals / totalMacroCals;

      const correctedProtein = Math.round((targets.calories * proteinPercent) / 4);
      const correctedCarbs = Math.round((targets.calories * carbsPercent) / 4);
      const correctedFat = Math.round((targets.fat * fatPercent) / 9);

      return {
        valid: false,
        message: `السعرات الحرارية (${targets.calories}) لا تتوافق مع الماكروز (${Math.round(totalMacroCals)}). يجب أن تكون:
البروتين: ${correctedProtein}جم
الكربوهيدرات: ${correctedCarbs}جم
الدهون: ${correctedFat}جم`,
        corrected: {
          calories: targets.calories,
          protein: correctedProtein,
          carbs: correctedCarbs,
          fat: correctedFat,
          fiber: targets.fiber
        }
      };
    }

    return { valid: true };
  }, []);

  const updateNutritionTargets = useCallback((targets: NutritionTargets) => {
    setNutritionTargets(targets);
  }, []);

  return useMemo(() => ({
    userProfile,
    nutritionTargets,
    currentMealPlan,
    isGenerating,
    mealLogs,
    selectedDate,
    setSelectedDate,
    navigateDay,
    setUserProfile,
    calculateNutritionTargets,
    setCurrentMealPlan,
    setIsGenerating,
    loadUserProfile,
    saveUserProfile,
    updateNutritionTargets,
    validateMacros,
    logMeal,
    unlogMeal,
    getDailyLogs,
    isMealLoggedToday,
  }), [
    userProfile,
    nutritionTargets,
    currentMealPlan,
    isGenerating,
    mealLogs,
    selectedDate,
    setSelectedDate,
    navigateDay,
    setUserProfile,
    calculateNutritionTargets,
    setCurrentMealPlan,
    loadUserProfile,
    saveUserProfile,
    updateNutritionTargets,
    validateMacros,
    logMeal,
    unlogMeal,
    getDailyLogs,
    isMealLoggedToday,
  ]);
});