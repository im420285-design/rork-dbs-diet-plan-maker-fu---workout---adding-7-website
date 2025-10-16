import { UserProfile, NutritionTargets, Meal, DailyMealPlan } from '@/types/nutrition';
import { generateObject } from '@rork/toolkit-sdk';
import { z } from 'zod';

function normalizeTargets(t: NutritionTargets): NutritionTargets {
  const proteinCals = t.protein * 4;
  const carbsCals = t.carbs * 4;
  const fatCals = t.fat * 9;
  const macroCals = proteinCals + carbsCals + fatCals;
  if (macroCals === 0) return t;
  const scale = t.calories / macroCals;
  const protein = Math.round(t.protein * scale);
  const carbs = Math.round(t.carbs * scale);
  const fat = Math.round(t.fat * scale);
  return { 
    calories: Math.round(t.calories), 
    protein, 
    carbs, 
    fat, 
    fiber: Math.round(t.fiber) 
  };
}

export async function generateDailyMealPlan(
  profile: UserProfile,
  targets: NutritionTargets
): Promise<DailyMealPlan> {
  try {
    console.log('بدء توليد خطة الوجبات عبر الذكاء الاصطناعي...');
    console.log('الملف الشخصي:', profile);
    console.log('الأهداف الغذائية (قبل التطبيع):', targets);

    const normalizedTargets = normalizeTargets(targets);
    console.log('الأهداف الغذائية (بعد التطبيع):', normalizedTargets);

    const prompt = `
أنت خبير تغذية متخصص في إعداد خطط وجبات صحية ومتوازنة. يجب أن تولد خطة وجبات يومية مخصصة للمستخدم بناءً على معلوماته الشخصية وأهدافه الغذائية.

معلومات المستخدم:
- العمر: ${profile.age} سنة
- الوزن: ${profile.weight} كيلو
- الطول: ${profile.height} سم
- الجنس: ${profile.gender === 'male' ? 'ذكر' : 'أنثى'}
- مستوى النشاط: ${profile.activityLevel}
- الهدف: ${profile.goal}
- عدد الوجبات اليومية: ${profile.mealsPerDay}
- القيود الغذائية: ${profile.dietaryRestrictions.join(', ') || 'لا توجد'}
- الحساسية: ${profile.allergies.join(', ') || 'لا توجد'}
- الحالات الصحية: ${profile.healthConditions.join(', ') || 'لا توجد'}
- الأطعمة غير المرغوبة: ${profile.dislikedFoods.join(', ') || 'لا توجد'}
- المطابخ المفضلة: ${profile.preferredCuisines.join(', ') || 'لا توجد'}
- نوع الدايت: ${profile.dietType || 'عادي متوازن'}

الأهداف الغذائية اليومية:
- السعرات الحرارية: ${normalizedTargets.calories}
- البروتين: ${normalizedTargets.protein} جرام
- الكربوهيدرات: ${normalizedTargets.carbs} جرام
- الدهون: ${normalizedTargets.fat} جرام
- الألياف: ${normalizedTargets.fiber} جرام

تعليمات مهمة جداً:
1. أنشئ وجبات عربية أصيلة ومتنوعة من المطابخ المختلفة
2. **مهم جداً**: احسب القيم الغذائية لكل وجبة بدقة شديدة بناءً على المكونات الفعلية
3. **مهم جداً**: تأكد أن مجموع السعرات من الماكروز يساوي السعرات المحددة:
   - البروتين: 1 جرام = 4 سعرات
   - الكربوهيدرات: 1 جرام = 4 سعرات
   - الدهون: 1 جرام = 9 سعرات
4. وزع السعرات والماكروز بين الوجبات بهذه النسب:
   - الفطور: 30% من الإجمالي
   - الغداء: 40% من الإجمالي
   - العشاء: 25% من الإجمالي
   - السناك: 5% من الإجمالي (إن وجد)
5. تجنب الأطعمة المحظورة والحساسية
6. راعي الحالات الصحية (مثل السكري، ضغط الدم، إلخ)
7. استخدم وصفات بسيطة وسهلة التحضير
8. أضف أوقات التحضير الواقعية
9. ضمن تنوع الوجبات والمكونات
10. **مهم**: اجعل القيم الغذائية واقعية ومتوافقة مع المكونات

مثال على حساب الماكروز:
- إذا كانت وجبة تحتوي على 30جم بروتين، 40جم كربوهيدرات، 15جم دهون
- السعرات = (30×4) + (40×4) + (15×9) = 120 + 160 + 135 = 415 سعرة

أنشئ خطة وجبات يومية كاملة مع تفاصيل كل وجبة.
`;

    const messages = [
      {
        role: "user" as const,
        content: prompt,
      },
    ];

    const result = await generateObject({
      messages,
      schema: z.object({
        id: z.string(),
        date: z.string(),
        meals: z.array(
          z.object({
            id: z.string(),
            name: z.string(),
            type: z.enum(["breakfast", "lunch", "dinner", "snack"]),
            ingredients: z.array(z.string()),
            instructions: z.array(z.string()),
            nutrition: z.object({
              calories: z.number(),
              protein: z.number(),
              carbs: z.number(),
              fat: z.number(),
              fiber: z.number(),
            }),
            prepTime: z.number(),
            servings: z.number(),
          })
        ),
        totalNutrition: z.object({
          calories: z.number(),
          protein: z.number(),
          carbs: z.number(),
          fat: z.number(),
          fiber: z.number(),
        }),
      }),
    });

    console.log('تم توليد خطة الوجبات بنجاح:', result);

    const orderedMeals = [...result.meals].sort((a, b) => {
      const order: Record<Meal['type'], number> = { breakfast: 0, lunch: 1, dinner: 2, snack: 3 };
      return (order[a.type] ?? 9) - (order[b.type] ?? 9);
    });

    const validatedMeals = orderedMeals.map((meal) => {
      const nutrition = meal.nutrition || { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 };
      const calculatedCals = nutrition.protein * 4 + nutrition.carbs * 4 + nutrition.fat * 9;
      const diff = Math.abs(calculatedCals - nutrition.calories);
      
      if (diff > 50) {
        console.warn(`تحذير: وجبة ${meal.name} - السعرات المحسوبة (${Math.round(calculatedCals)}) لا تتطابق مع السعرات المحددة (${nutrition.calories})`);
        return {
          ...meal,
          servings: meal.servings ?? 1,
          prepTime: meal.prepTime ?? 15,
          nutrition: {
            ...nutrition,
            calories: Math.round(calculatedCals),
          },
        } as Meal;
      }
      
      return {
        ...meal,
        servings: meal.servings ?? 1,
        prepTime: meal.prepTime ?? 15,
        nutrition,
      } as Meal;
    });

    const sum = validatedMeals.reduce(
      (acc, m) => ({
        calories: acc.calories + (m.nutrition?.calories ?? 0),
        protein: acc.protein + (m.nutrition?.protein ?? 0),
        carbs: acc.carbs + (m.nutrition?.carbs ?? 0),
        fat: acc.fat + (m.nutrition?.fat ?? 0),
        fiber: acc.fiber + (m.nutrition?.fiber ?? 0),
      }),
      { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 }
    );

    console.log('مجموع القيم الغذائية من الوجبات:', sum);
    console.log('الأهداف المطلوبة:', normalizedTargets);

    const deltas = {
      calories: normalizedTargets.calories - sum.calories,
      protein: normalizedTargets.protein - sum.protein,
      carbs: normalizedTargets.carbs - sum.carbs,
      fat: normalizedTargets.fat - sum.fat,
      fiber: normalizedTargets.fiber - sum.fiber,
    } as const;

    console.log('الفروقات التي سيتم تعديلها:', deltas);

    const adjustedMeals = [...validatedMeals];
    const lastIdx = adjustedMeals.length - 1;
    if (lastIdx >= 0 && (Math.abs(deltas.calories) > 5 || Math.abs(deltas.protein) > 2 || Math.abs(deltas.carbs) > 2 || Math.abs(deltas.fat) > 1)) {
      const last = adjustedMeals[lastIdx];
      adjustedMeals[lastIdx] = {
        ...last,
        nutrition: {
          calories: (last.nutrition?.calories ?? 0) + deltas.calories,
          protein: (last.nutrition?.protein ?? 0) + deltas.protein,
          carbs: (last.nutrition?.carbs ?? 0) + deltas.carbs,
          fat: (last.nutrition?.fat ?? 0) + deltas.fat,
          fiber: (last.nutrition?.fiber ?? 0) + deltas.fiber,
        },
      } as Meal;
      console.log(`تم تعديل وجبة ${last.name} لتطابق الأهداف`);
    }

    const finalTotals = adjustedMeals.reduce(
      (acc, m) => ({
        calories: acc.calories + (m.nutrition?.calories ?? 0),
        protein: acc.protein + (m.nutrition?.protein ?? 0),
        carbs: acc.carbs + (m.nutrition?.carbs ?? 0),
        fat: acc.fat + (m.nutrition?.fat ?? 0),
        fiber: acc.fat + (m.nutrition?.fiber ?? 0),
      }),
      { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 }
    );

    const adjustedMealPlan: DailyMealPlan = {
      id: result.id,
      date: result.date,
      meals: adjustedMeals,
      totalNutrition: finalTotals,
    };

    console.log('تم ضبط الماكروز وتنسيقها بدقة:', adjustedMealPlan.totalNutrition);

    return adjustedMealPlan;
  } catch (error) {
    console.error('خطأ في توليد خطة الوجبات:', error);
    if (error instanceof Error) {
      throw new Error(`فشل في توليد خطة الوجبات: ${error.message}`);
    }
    throw new Error('فشل في توليد خطة الوجبات. يرجى المحاولة مرة أخرى.');
  }
}

export async function regenerateMeal(
  meal: Meal,
  targets: NutritionTargets,
  profile: UserProfile
): Promise<Meal> {
  try {
    console.log('بدء إعادة توليد وجبة واحدة:', meal.name);

    // Calculate target nutrition for this meal type
    const mealTypeRatios = {
      breakfast: 0.30,
      lunch: 0.40,
      dinner: 0.25,
      snack: 0.05
    };

    const ratio = mealTypeRatios[meal.type];
    const targetCalories = Math.round(targets.calories * ratio);
    const targetProtein = Math.round(targets.protein * ratio);
    const targetCarbs = Math.round(targets.carbs * ratio);
    const targetFat = Math.round(targets.fat * ratio);
    const targetFiber = Math.round(targets.fiber * ratio);

    const prompt = `
أنت خبير تغذية متخصص. أعد توليد وجبة ${meal.type === 'breakfast' ? 'إفطار' : meal.type === 'lunch' ? 'غداء' : meal.type === 'dinner' ? 'عشاء' : 'وجبة خفيفة'} جديدة بديلة للوجبة الحالية.

الوجبة الحالية التي تريد استبدالها:
- الاسم: ${meal.name}
- المكونات: ${meal.ingredients.join(', ')}
- الطريقة: ${meal.instructions.join(', ')}

معلومات المستخدم:
- العمر: ${profile.age} سنة
- الوزن: ${profile.weight} كيلو
- الطول: ${profile.height} سم
- الجنس: ${profile.gender === 'male' ? 'ذكر' : 'أنثى'}
- مستوى النشاط: ${profile.activityLevel}
- الهدف: ${profile.goal}
- القيود الغذائية: ${profile.dietaryRestrictions.join(', ') || 'لا توجد'}
- الحساسية: ${profile.allergies.join(', ') || 'لا توجد'}
- الحالات الصحية: ${profile.healthConditions.join(', ') || 'لا توجد'}
- الأطعمة غير المرغوبة: ${profile.dislikedFoods.join(', ') || 'لا توجد'}
- المطابخ المفضلة: ${profile.preferredCuisines.join(', ') || 'لا توجد'}
- نوع الدايت: ${profile.dietType || 'عادي متوازن'}

الأهداف الغذائية للوجبة الجديدة:
- السعرات الحرارية: ${targetCalories}
- البروتين: ${targetProtein} جرام
- الكربوهيدرات: ${targetCarbs} جرام
- الدهون: ${targetFat} جرام
- الألياف: ${targetFiber} جرام

تعليمات مهمة:
1. أنشئ وجبة عربية أصيلة مختلفة تماماً عن الوجبة الحالية
2. احسب القيم الغذائية بدقة شديدة بناءً على المكونات الفعلية
3. تأكد أن مجموع السعرات من الماكروز يساوي السعرات المحددة
4. تجنب الأطعمة المحظورة والحساسية
5. راعي الحالات الصحية
6. استخدم وصفة بسيطة وسهلة التحضير
7. أضف وقت تحضير واقعي
8. ضمن أن تكون الوجبة متنوعة ومغرية

أنشئ وجبة جديدة كاملة مع جميع التفاصيل.
`;

    const messages = [
      {
        role: "user" as const,
        content: prompt,
      },
    ];

    const result = await generateObject({
      messages,
      schema: z.object({
        id: z.string(),
        name: z.string(),
        type: z.enum(["breakfast", "lunch", "dinner", "snack"]),
        ingredients: z.array(z.string()),
        instructions: z.array(z.string()),
        nutrition: z.object({
          calories: z.number(),
          protein: z.number(),
          carbs: z.number(),
          fat: z.number(),
          fiber: z.number(),
        }),
        prepTime: z.number(),
        servings: z.number(),
      }),
    });

    console.log('تم إعادة توليد الوجبة بنجاح:', result.name);

    // Validate and adjust nutrition if needed
    const nutrition = result.nutrition;
    const calculatedCals = nutrition.protein * 4 + nutrition.carbs * 4 + nutrition.fat * 9;
    const diff = Math.abs(calculatedCals - nutrition.calories);

    if (diff > 50) {
      console.warn(`تحذير: الوجبة الجديدة - السعرات المحسوبة (${Math.round(calculatedCals)}) لا تتطابق مع السعرات المحددة (${nutrition.calories})`);
      return {
        ...result,
        nutrition: {
          ...nutrition,
          calories: Math.round(calculatedCals),
        },
      } as Meal;
    }

    return {
      ...result,
      servings: result.servings ?? 1,
      prepTime: result.prepTime ?? 15,
    } as Meal;
  } catch (error) {
    console.error('خطأ في إعادة توليد الوجبة:', error);
    if (error instanceof Error) {
      throw new Error(`فشل في إعادة توليد الوجبة: ${error.message}`);
    }
    throw new Error('فشل في إعادة توليد الوجبة. يرجى المحاولة مرة أخرى.');
  }
}