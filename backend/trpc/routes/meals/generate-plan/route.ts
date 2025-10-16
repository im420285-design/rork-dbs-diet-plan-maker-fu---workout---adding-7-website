import { publicProcedure } from "../../../create-context";
import { z } from "zod";
import { generateObject } from "@rork/toolkit-sdk";

const userProfileSchema = z.object({
  age: z.number(),
  weight: z.number(),
  height: z.number(),
  gender: z.enum(['male', 'female']),
  activityLevel: z.enum(['sedentary', 'light', 'moderate', 'active', 'very_active']),
  goal: z.enum(['lose', 'maintain', 'gain']),
  mealsPerDay: z.number(),
  dietaryRestrictions: z.array(z.string()),
  allergies: z.array(z.string()),
  healthConditions: z.array(z.string()),
  dislikedFoods: z.array(z.string()),
  preferredCuisines: z.array(z.string()),
  dietType: z.enum(['keto', 'low_carb', 'high_protein', 'balanced', 'intermittent_fasting', 'mediterranean', 'paleo', 'vegan']).optional(),
});

const nutritionTargetsSchema = z.object({
  calories: z.number(),
  protein: z.number(),
  carbs: z.number(),
  fat: z.number(),
  fiber: z.number(),
});

const mealSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: z.enum(['breakfast', 'lunch', 'dinner', 'snack']),
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
});

const dailyMealPlanSchema = z.object({
  id: z.string(),
  date: z.string(),
  meals: z.array(mealSchema),
  totalNutrition: z.object({
    calories: z.number(),
    protein: z.number(),
    carbs: z.number(),
    fat: z.number(),
    fiber: z.number(),
  }),
});

export const generatePlanProcedure = publicProcedure
  .input(z.object({
    profile: userProfileSchema,
    targets: nutritionTargetsSchema,
  }))
  .mutation(async ({ input }) => {
    console.log('بدء توليد خطة الوجبات باستخدام الذكاء الاصطناعي...');
    console.log('الملف الشخصي:', input.profile);
    console.log('الأهداف الغذائية:', input.targets);

    try {
      const prompt = `
أنت خبير تغذية متخصص في إعداد خطط وجبات صحية ومتوازنة. يجب أن تولد خطة وجبات يومية مخصصة للمستخدم بناءً على معلوماته الشخصية وأهدافه الغذائية.

معلومات المستخدم:
- العمر: ${input.profile.age} سنة
- الوزن: ${input.profile.weight} كيلو
- الطول: ${input.profile.height} سم
- الجنس: ${input.profile.gender === 'male' ? 'ذكر' : 'أنثى'}
- مستوى النشاط: ${input.profile.activityLevel}
- الهدف: ${input.profile.goal}
- عدد الوجبات اليومية: ${input.profile.mealsPerDay}
- القيود الغذائية: ${input.profile.dietaryRestrictions.join(', ') || 'لا توجد'}
- الحساسية: ${input.profile.allergies.join(', ') || 'لا توجد'}
- الحالات الصحية: ${input.profile.healthConditions.join(', ') || 'لا توجد'}
- الأطعمة غير المرغوبة: ${input.profile.dislikedFoods.join(', ') || 'لا توجد'}
- المطابخ المفضلة: ${input.profile.preferredCuisines.join(', ') || 'لا توجد'}
- نوع الدايت: ${input.profile.dietType || 'عادي متوازن'}

الأهداف الغذائية اليومية:
- السعرات الحرارية: ${input.targets.calories}
- البروتين: ${input.targets.protein} جرام
- الكربوهيدرات: ${input.targets.carbs} جرام
- الدهون: ${input.targets.fat} جرام
- الألياف: ${input.targets.fiber} جرام

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
        schema: dailyMealPlanSchema,
      });

      console.log('تم توليد خطة الوجبات بنجاح باستخدام الذكاء الاصطناعي:', result);
      return result;
    } catch (error) {
      console.error('خطأ في توليد خطة الوجبات:', error);
      throw new Error('فشل في توليد خطة الوجبات. يرجى المحاولة مرة أخرى.');
    }
  });