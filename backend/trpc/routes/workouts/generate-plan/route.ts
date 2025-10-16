import { publicProcedure } from "../../../create-context";
import { z } from "zod";
import { generateObject } from "@rork/toolkit-sdk";

const workoutInputSchema = z.object({
  age: z.number(),
  weight: z.number(),
  height: z.number(),
  experienceDuration: z.enum(['less_than_3_months', '3_to_6_months', '6_to_12_months', '1_to_2_years', 'more_than_2_years']),
  level: z.enum(['beginner', 'intermediate', 'advanced']),
  goals: z.array(z.enum(['muscle_building', 'fat_loss', 'fitness_improvement', 'strength', 'endurance', 'flexibility'])),
  daysPerWeek: z.number(),
  planDuration: z.number(),
  location: z.enum(['home', 'gym']),
  equipment: z.array(z.enum(['bodyweight', 'resistance_band', 'dumbbells', 'gym_equipment'])),
  injuries: z.array(z.enum(['cervical_disc_herniation', 'lumbar_disc_herniation', 'inguinal_hernia', 'umbilical_hernia', 'shoulder_dislocation', 'rotator_cuff_tear', 'shoulder_impingement', 'biceps_tendonitis', 'knee_osteoarthritis', 'acl_tear', 'mcl_tear', 'meniscus_tear', 'patellar_tendonitis', 'lower_back_pain', 'sciatica', 'spondylolisthesis', 'wrist_sprain', 'carpal_tunnel', 'ankle_sprain', 'achilles_tendonitis', 'plantar_fasciitis', 'tennis_elbow', 'golfers_elbow', 'hip_bursitis', 'hip_labral_tear', 'groin_strain'])),
});

const exerciseSchema = z.object({
  name: z.string(),
  nameAr: z.string(),
  sets: z.number(),
  reps: z.string(),
  restTime: z.string(),
  videoUrl: z.string(),
  notes: z.string().optional(),
});

const workoutDaySchema = z.object({
  day: z.number(),
  week: z.number(),
  dayName: z.string(),
  dayNameAr: z.string(),
  focus: z.string(),
  focusAr: z.string(),
  exercises: z.array(exerciseSchema),
  weeklyIntensity: z.string().optional(),
});



export const generateWorkoutPlanProcedure = publicProcedure
  .input(workoutInputSchema)
  .mutation(async ({ input }) => {
    console.log('Generating workout plan with AI on backend...');
    console.log('Input:', input);

    const levelMap = {
      beginner: 'مبتدئ',
      intermediate: 'متوسط',
      advanced: 'متقدم'
    };

    const goalMap = {
      muscle_building: 'بناء كتلة عضلية',
      fat_loss: 'حرق الدهون',
      fitness_improvement: 'تحسين اللياقة العامة',
      strength: 'زيادة القوة',
      endurance: 'تحسين التحمل',
      flexibility: 'زيادة المرونة'
    };

    const locationMap = {
      home: 'البيت',
      gym: 'الجيم'
    };

    const equipmentMap = {
      bodyweight: 'وزن الجسم',
      resistance_band: 'حبل مقاومة',
      dumbbells: 'دامبل',
      gym_equipment: 'أجهزة الجيم'
    };

    const experienceDurationMap = {
      less_than_3_months: 'أقل من 3 شهور',
      '3_to_6_months': 'من 3 إلى 6 شهور',
      '6_to_12_months': 'من 6 إلى 12 شهر',
      '1_to_2_years': 'من سنة إلى سنتين',
      more_than_2_years: 'أكثر من سنتين'
    };

    const injuryMap: Record<string, string> = {
      cervical_disc_herniation: 'انزلاق غضروف فقرات عنقية',
      lumbar_disc_herniation: 'انزلاق غضروف فقرات قطنية',
      inguinal_hernia: 'فتق أربي',
      umbilical_hernia: 'فتق سري',
      shoulder_dislocation: 'خلع كتف',
      rotator_cuff_tear: 'تمزق الكفة المدورة',
      shoulder_impingement: 'متلازمة اصطدام الكتف',
      biceps_tendonitis: 'التهاب وتر العضلة ذات الرأسين',
      knee_osteoarthritis: 'خشونة الركبة',
      acl_tear: 'قطع الرباط الصليبي الأمامي',
      mcl_tear: 'قطع الرباط الجانبي الإنسي',
      meniscus_tear: 'تمزق الغضروف الهلالي',
      patellar_tendonitis: 'التهاب وتر الرضفة',
      lower_back_pain: 'ألم أسفل الظهر',
      sciatica: 'عرق النسا',
      spondylolisthesis: 'انزلاق الفقرات',
      wrist_sprain: 'التواء المعصم',
      carpal_tunnel: 'متلازمة النفق الرسغي',
      ankle_sprain: 'التواء الكاحل',
      achilles_tendonitis: 'التهاب وتر أخيل',
      plantar_fasciitis: 'التهاب اللفافة الأخمصية',
      tennis_elbow: 'مرفق التنس',
      golfers_elbow: 'مرفق لاعب الجولف',
      hip_bursitis: 'التهاب الجراب الوركي',
      hip_labral_tear: 'تمزق الشفا الوركي',
      groin_strain: 'شد عضلي في الفخذ'
    };

    const bmi = (input.weight / ((input.height / 100) ** 2)).toFixed(1);
    const goalsText = input.goals.map(g => goalMap[g]).join(' و ');
    const equipmentText = input.equipment.map(e => equipmentMap[e]).join('، ');
    const injuriesText = input.injuries.length > 0 ? input.injuries.map(i => injuryMap[i]).join('، ') : 'لا توجد إصابات';
    
    const totalWeeks = input.planDuration * 4;
    const totalDays = totalWeeks * input.daysPerWeek;

    let intensityInstructions = '3. التدرج في الحمل التدريبي:\n';
    intensityInstructions += '   - الأسبوع 1-2: حمل متوسط (60-70%)\n';
    intensityInstructions += '   - الأسبوع 3-4: حمل متوسط-عالي (70-80%)\n';
    
    if (totalWeeks >= 8) {
      intensityInstructions += '   - الأسبوع 5-6: حمل عالي (80-85%)\n';
      intensityInstructions += '   - الأسبوع 7-8: حمل عالي جداً (85-90%)\n';
    }
    
    if (totalWeeks >= 12) {
      intensityInstructions += '   - الأسبوع 9-10: استشفاء نشط (65-75%)\n';
      intensityInstructions += '   - الأسبوع 11-12: حمل عالي نهائي (80-90%)\n';
    }
    
    const prompt = `أنت مدرب رياضي محترف متخصص في إنشاء برامج تمرين مخصصة طويلة المدى.

معلومات المتدرب:
- العمر: ${input.age} سنة
- الوزن: ${input.weight} كجم
- الطول: ${input.height} سم
- مؤشر كتلة الجسم (BMI): ${bmi}
- مدة الخبرة: ${experienceDurationMap[input.experienceDuration]}
- المستوى: ${levelMap[input.level]}

أهداف البرنامج:
- الأهداف: ${goalsText}
- عدد الأيام في الأسبوع: ${input.daysPerWeek} أيام
- مدة البرنامج: ${input.planDuration} ${input.planDuration === 1 ? 'شهر' : 'شهور'} = ${totalWeeks} أسابيع

الإمكانيات المتاحة:
- مكان التمرين: ${locationMap[input.location]}
- الأدوات المتوفرة: ${equipmentText}

الإصابات: ${injuriesText}

⚠️ تعليمات إلزامية - لا يمكن تجاوزها:

1. العدد الإجمالي الإلزامي:
   ✅ يجب إنشاء ${totalDays} يوم تمرين بالضبط (${totalWeeks} أسابيع × ${input.daysPerWeek} أيام)
   ✅ لا تتوقف عند أسبوعين - يجب إكمال ${totalWeeks} أسابيع كاملة
   ✅ مثال البنية: الأسبوع 1 (${input.daysPerWeek} أيام), الأسبوع 2 (${input.daysPerWeek} أيام), ... حتى الأسبوع ${totalWeeks}

2. هيكل كل أسبوع:
   - كل أسبوع يحتوي على ${input.daysPerWeek} أيام تمرين بالضبط
   - كل يوم يحتوي على 6-8 تمارين متنوعة
   - day: رقم اليوم في الأسبوع (1 إلى ${input.daysPerWeek})
   - week: رقم الأسبوع (1 إلى ${totalWeeks})

${intensityInstructions}

4. قواعد الإصابات:
   - تجنب تماماً أي تمرين يؤثر على الإصابات المذكورة
   - اختر بدائل آمنة فقط

5. معايير التمارين:
   - مناسبة للمستوى والعمر
   - تستخدم الأدوات المتوفرة فقط
   - متوازنة بين جميع العضلات

أنشئ ${totalDays} يوم تمرين بالشكل التالي:

{
  "plan": [
    {
      "day": 1,
      "week": 1,
      "dayName": "Week 1 - Day 1",
      "dayNameAr": "الأسبوع 1 - اليوم 1",
      "focus": "Upper Body",
      "focusAr": "الجزء العلوي",
      "weeklyIntensity": "60-70% - أسبوع تأسيسي",
      "exercises": [...]
    },
    ... (استمر حتى اليوم ${totalDays})
  ]
}`;

    const messages = [
      {
        role: "user" as const,
        content: prompt,
      },
    ];

    try {
      const result = await generateObject({
        messages,
        schema: z.object({
          plan: z.array(workoutDaySchema),
        }),
      });

      console.log('Workout plan generated successfully:', result);

      return {
        id: `workout_${Date.now()}`,
        input,
        plan: result.plan,
        createdAt: new Date(),
      };
    } catch (error) {
      console.error('Error generating workout plan:', error);
      throw new Error('فشل في توليد برنامج التمرين. يرجى المحاولة مرة أخرى.');
    }
  });
