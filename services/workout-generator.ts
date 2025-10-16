import { WorkoutInput, WorkoutPlan, WorkoutDay } from '@/types/workout';
import { generateObject } from '@rork/toolkit-sdk';
import { z } from 'zod';

const exerciseSchema = z.object({
  name: z.string(),
  nameAr: z.string(),
  sets: z.number(),
  reps: z.string(),
  restTime: z.string(),
  videoUrl: z.string(),
  notes: z.string().optional(),
  injuryWarnings: z.array(z.string()).optional(),
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

export async function generateWorkoutPlan(input: WorkoutInput): Promise<WorkoutPlan> {
  console.log('Generating workout plan directly with AI...');
  console.log('Input:', input);

  const experienceDurationMap = {
    less_than_3_months: 'أقل من 3 شهور',
    '3_to_6_months': 'من 3 إلى 6 شهور',
    '6_to_12_months': 'من 6 إلى 12 شهر',
    '1_to_2_years': 'من سنة إلى سنتين',
    more_than_2_years: 'أكثر من سنتين'
  };

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

  const injuryInstructions = input.injuries.length > 0 ? `
الإصابات الموجودة: ${injuriesText}

تعليمات مهمة جداً للإصابات - يجب تجنب التمارين التالية تماماً:

1. انزلاق غضروف فقرات عنقية:
   - تجنب: تمارين الرقبة المباشرة، الضغط على الرأس، الأوزان فوق الرأس، Overhead Press، Military Press
   - تحذيرات: تجنب الضغط على الفقرات العنقية، حافظ على وضعية الرقبة محايدة

2. انزلاق غضروف فقرات قطنية:
   - تجنب: Deadlift، Romanian Deadlift، Good Morning، تمارين الانحناء الأمامي، Bent Over Row
   - تحذيرات: تجنب الانحناء من الخصر، لا تحمل أوزان ثقيلة من الأرض

3. فتق أربي:
   - تجنب: تمارين البطن السفلية، Leg Raises، Hanging Leg Raises، السكوات العميقة، الضغط على البطن
   - تحذيرات: تجنب زيادة الضغط داخل البطن، لا تحبس النفس أثناء التمرين

4. فتق سري:
   - تجنب: Plank، تمارين البطن المباشرة، الأوزان الثقيلة، الضغط على منطقة السرة
   - تحذيرات: تجنب التمارين التي تضغط على جدار البطن

5. خلع كتف:
   - تجنب: Bench Press، Overhead Press، Dips، Pull-ups، الحركات الواسعة للكتف
   - تحذيرات: تجنب الحركات التي تضع الكتف في وضع غير مستقر

6. تمزق الكفة المدورة:
   - تجنب: Overhead Press، Lateral Raises بأوزان ثقيلة، Behind the Neck Press، Upright Row
   - تحذيرات: تجنب رفع الذراع فوق مستوى الكتف بأوزان

7. متلازمة اصطدام الكتف:
   - تجنب: Overhead Press، Behind the Neck Press، Upright Row، Dips
   - تحذيرات: تجنب الحركات التي تضيق المساحة تحت الأخرم

8. التهاب وتر العضلة ذات الرأسين:
   - تجنب: Bicep Curls بأوزان ثقيلة، Chin-ups، Pull-ups، Preacher Curls
   - تحذيرات: قلل الحمل على وتر البايسبس

9. خشونة الركبة:
   - تجنب: Deep Squats، Lunges العميقة، Leg Press بزوايا حادة، الجري الطويل، القفز
   - تحذيرات: تجنب ثني الركبة أكثر من 90 درجة، قلل الضغط على المفصل

10. قطع الرباط الصليبي الأمامي:
    - تجنب: القفز، الحركات الدورانية، التوقف المفاجئ، Lunges، Box Jumps
    - تحذيرات: تجنب الحركات التي تضع ضغط دوراني على الركبة

11. قطع الرباط الجانبي الإنسي:
    - تجنب: الحركات الجانبية، Side Lunges، الحركات الدورانية للركبة
    - تحذيرات: تجنب الضغط الجانبي على الركبة

12. ت��زق الغضروف الهلالي:
    - تجنب: Deep Squats، Lunges العميقة، الحركات الدورانية، القفز
    - تحذيرات: تجنب الالتواء والدوران مع الركبة مثنية

13. التهاب وتر الرضفة:
    - تجنب: القفز، Leg Extensions، Deep Squats، الجري
    - تحذيرات: قلل الضغط على وتر الرضفة

14. ألم أسفل الظهر:
    - تجنب: Deadlift، Good Morning، Bent Over Row، تمارين الانحناء
    - تحذيرات: حافظ على استقامة الظهر، تجنب الأوزان الثقيلة

15. عرق النسا:
    - تجنب: Deadlift، Leg Press الثقيل، تمارين الانحناء، اللف العمودي
    - تحذيرات: تجنب الضغط على العصب الوركي

16. انزلاق الفقرات:
    - تجنب: تمارين تمديد الظهر، Hyperextensions، الأوزان الثقيلة على الظهر
    - تحذيرات: تجنب تمديد الظهر الزائد

17. التواء المعصم:
    - تجنب: Push-ups، Bench Press، Wrist Curls، الضغط المباشر على المعصم
    - تحذيرات: استخدم دعامات المعصم، تجنب الثني الزائد

18. متلازمة النفق الرسغي:
    - تجنب: تمارين المعصم المباشرة، الضغط المطول على المعصم
    - تحذيرات: تجنب الضغط على العصب المتوسط

19. التواء الكاحل:
    - تجنب: الجري، القفز، Calf Raises بأوزان ثقيلة، الحركات الجانبية
    - تحذيرات: تجنب الحركات المفاجئة للكاحل

20. التهاب وتر أخيل:
    - تجنب: Calf Raises، الجري، القفز، Box Jumps
    - تحذيرات: قلل الضغط على وتر أخيل

21. التهاب اللفافة الأخمصية:
    - تجنب: الجري الطويل، القفز، الوقوف لفترات طويلة
    - تحذيرات: تجنب الضغط الزائد على باطن القدم

22. مرفق التنس:
    - تجنب: Tricep Extensions، Overhead Press، تمارين الساعد المباشرة
    - تحذيرات: قلل الضغط على الأوتار الخارجية للكوع

23. مرفق لاعب الجولف:
    - تجنب: Bicep Curls بأوزان ثقيلة، Wrist Curls، Pull-ups
    - تحذيرات: قلل الضغط على الأوتار الداخلية للكوع

24. التهاب الجراب الوركي:
    - تجنب: Side Lunges، الحركات الجانبية، الاستلقاء على الجانب المصاب
    - تحذيرات: تجنب الضغط على الجراب الوركي

25. تمزق الشفا الوركي:
    - تجنب: Deep Squats، الحركات الدورانية للورك، Lunges العميقة
    - تحذيرات: تجنب الحركات التي تضع الورك في أقصى نطاق حركة

26. شد عضلي في الفخذ:
    - تجنب: Sprints، الحركات الجانبية السريعة، Side Lunges
    - تحذيرات: تجنب التمدد الزائد للعضلات الداخلية للفخذ

مهم جداً: 
- لكل تمرين تختاره، أضف في حقل "injuryWarnings" التحذيرات المحددة المتعلقة بإصابات المستخدم
- إذا كان التمرين يؤثر على منطقة مصابة، لا تضعه في البرنامج نهائياً
- اختر بدائل آمنة تحقق نفس الهدف دون الضغط على المنطقة المصابة` : 'لا توجد إصابات';

  const totalDays = totalWeeks * input.daysPerWeek;
  
  const prompt = `أنت مدرب رياضي محترف متخصص في إنشاء برامج تمرين مخصصة طويلة المدى مع تدرج الحمل التدريبي.

معلومات المتدرب:
- العمر: ${input.age} سنة
- الوزن: ${input.weight} كجم
- الطول: ${input.height} سم
- مؤشر كتلة الجسم (BMI): ${bmi}
- مدة الخبرة في التمرين: ${experienceDurationMap[input.experienceDuration]}
- المستوى: ${levelMap[input.level]}

أهداف البرنامج:
- الأهداف: ${goalsText}
- عدد الأيام في الأسبوع: ${input.daysPerWeek} أيام
- مدة البرنامج: ${input.planDuration} ${input.planDuration === 1 ? 'شهر' : 'شهور'} = ${totalWeeks} أسابيع كاملة

الإمكانيات المتاحة:
- مكان التمرين: ${locationMap[input.location]}
- الأدوات المتوفرة: ${equipmentText}

${injuryInstructions}

⚠️ تعليمات إلزامية - يجب الالتزام بها 100%:

1. العدد الإجمالي الإلزامي للأيام:
   ✅ يجب إنشاء ${totalDays} يوم تمرين بالضبط
   ✅ ${totalWeeks} أسابيع × ${input.daysPerWeek} أيام = ${totalDays} يوم إجمالي
   ✅ لا تتوقف عند أسبوعين فقط - استمر حتى الأسبوع ${totalWeeks}
   ✅ كل أسبوع يحتوي على ${input.daysPerWeek} أيام تمرين بالضبط
   ✅ هيكل البرنامج: الأسبوع 1 (${input.daysPerWeek} أيام), الأسبوع 2 (${input.daysPerWeek} أيام), ... حتى الأسبوع ${totalWeeks}

2. هيكل كل يوم:
   - كل يوم يجب أن يحتوي على 6-8 تمارين متنوعة وفعالة (يمكن زيادة العدد في الأسابيع المتقدمة للتدرج)
   - day: رقم اليوم داخل الأسبوع (يتراوح من 1 إلى ${input.daysPerWeek})
   - week: رقم الأسبوع (يتراوح من 1 إلى ${totalWeeks})

2. التدرج في الحمل التدريبي (Progressive Overload):
   - الأسبوع 1-2: حمل تدريبي متوسط (60-70% من الشدة القصوى)
   - الأسبوع 3-4: زيادة الحمل (70-80% من الشدة القصوى)
   ${totalWeeks >= 8 ? '- الأسبوع 5-6: حمل تدريبي عالي (80-85% من الشدة القصوى)' : ''}
   ${totalWeeks >= 8 ? '- الأسبوع 7-8: ذروة الحمل (85-90% من الشدة القصوى)' : ''}
   ${totalWeeks >= 12 ? '- الأسبوع 9-10: تقليل الحمل للاستشفاء (65-75%)' : ''}
   ${totalWeeks >= 12 ? '- الأسبوع 11-12: العودة للحمل العالي (80-90%)' : ''}
   - في كل أسبوع، أضف حقل "weeklyIntensity" يوضح مستوى الشدة للأسبوع

3. كيفية تطبيق التدرج:
   - زيادة عدد المجموعات تدريجياً (مثلاً: من 3 إلى 4 إلى 5)
   - زيادة عدد التكرارات (مثلاً: من 8-10 إلى 10-12 إلى 12-15)
   - تقليل وقت الراحة تدريجياً (مثلاً: من 90 ثانية إلى 60 ثانية)
   - إضافة تمارين أكثر تحدياً في الأسابيع المتقدمة

4. توزيع التمارين:
   - راعي الأهداف المتعددة في توزيع التمارين
   - إذا كان الهدف بناء عضلات وحرق دهون: اجمع بين تمارين القوة (70%) والكارديو (30%)
   - إذا كان الهدف القوة والتحمل: اجمع بين تمارين الأوزان الثقيلة والتكرارات العالية
   - وزع التمارين بشكل متوازن على جميع العضلات

5. معايير اختيار التمارين:
   - اختر تمارين مناسبة للعمر والمستوى والخبرة
   - راعي مؤشر كتلة الجسم في اختيار التمارين
   - استخدم الأدوات المتوفرة فقط
   - تجنب تماماً التمارين المحظورة بسبب الإصابات

6. عدد المجموعات والتكرارات حسب المستوى والأسبوع:
   - مبتدئ (أسابيع أولى): 2-3 مجموعات، 8-10 تكرار، راحة 90 ثانية، 6 تمارين
   - مبتدئ (أسابيع متقدمة): 3-4 مجموعات، 10-12 تكرار، راحة 75 ثانية، 6-7 تمارين
   - متوسط (أسابيع أولى): 3-4 مجموعات، 10-12 تكرار، راحة 75 ثانية، 6-7 تمارين
   - متوسط (أسابيع متقدمة): 4-5 مجموعات، 12-15 تكرار، راحة 60 ثانية، 7-8 تمارين
   - متقدم (أسابيع أولى): 4-5 مجموعات، 12-15 تكرار، راحة 60 ثانية، 7 تمارين
   - متقدم (أسابيع متقدمة): 5-6 مجموعات، 15-20 تكرار، راحة 45 ثانية، 8 تمارين

7. التحذيرات الخاصة بالإصابات (مهم جداً جداً):
   - راجع قائمة الإصابات بدقة شديدة: ${injuriesText}
   - لكل تمرين تختاره، تأكد أنه لا يؤثر على أي إصابة موجودة
   - إ��ا كان التمرين يؤثر على منطقة مصابة، لا تضعه في البرنامج نهائياً - اختر بديل آمن
   - أضف في حقل "injuryWarnings" التحذيرات المحددة المتعلقة بإصابات المستخدم فقط
   - إذا لم يكن للتمرين علاقة بالإصابات الموجودة، اترك الحقل فارغاً
   - مثال: إذا كان لديه خشونة في الركبة، لا تضع Deep Squats أو Lunges العميقة - استخدم Wall Sits أو Leg Press بزاوية محدودة
   - مثال: إذا كان لديه انزلاق غضروف قطني، لا تضع Deadlift أو Bent Over Row - استخدم Seated Cable Row أو Machine Row
   - أضف تحذير مثل:
     * "تحذير: لديك انزلاق غضروف قطني - تجنب الانحناء الزائد وحافظ على استقامة الظهر"
     * "تحذير: لديك خشونة في الركبة - لا تثني الركبة أكثر من 90 درجة"
   - إذا لم يكن للتمرين علاقة بالإصابات، اترك الحقل فارغاً أو لا تضفه

8. روابط الفيديو (مهم جداً جداً - يجب التأكد من صحة الروابط):
   - استخدم فقط الروابط المؤكدة والمعروفة من القائمة التالية:
   
   تمارين الصدر والذراعين:
   - Push-ups: https://www.youtube.com/watch?v=IODxDxX7oi4
   - Bench Press: https://www.youtube.com/watch?v=rT7DgCr-3pg
   - Dumbbell Chest Press: https://www.youtube.com/watch?v=VmB1G1K7v94
   - Chest Fly: https://www.youtube.com/watch?v=eozdVDA78K0
   - Incline Bench Press: https://www.youtube.com/watch?v=DbFgADa2PL8
   - Dips: https://www.youtube.com/watch?v=6kALZikXxLc
   
   تمارين الظهر:
   - Pull-ups: https://www.youtube.com/watch?v=eGo4IYlbE5g
   - Dumbbell Rows: https://www.youtube.com/watch?v=roCP6wCXPqo
   - Lat Pulldown: https://www.youtube.com/watch?v=CAwf7n6Luuc
   - Seated Cable Row: https://www.youtube.com/watch?v=GZbfZ033f74
   - Deadlift: https://www.youtube.com/watch?v=op9kVnSso6Q
   - Face Pulls: https://www.youtube.com/watch?v=rep-qVOkqgk
   
   تمارين الأكتاف:
   - Shoulder Press: https://www.youtube.com/watch?v=qEwKCR5JCog
   - Lateral Raises: https://www.youtube.com/watch?v=3VcKaXpzqRo
   - Front Raises: https://www.youtube.com/watch?v=2yjwXTZQDDI
   - Rear Delt Fly: https://www.youtube.com/watch?v=EA7u4Q_8HQ0
   
   تمارين الذراعين:
   - Bicep Curls: https://www.youtube.com/watch?v=ykJmrZ5v0Oo
   - Hammer Curls: https://www.youtube.com/watch?v=zC3nLlEvin4
   - Tricep Extensions: https://www.youtube.com/watch?v=_gsUck-7M74
   - Tricep Dips: https://www.youtube.com/watch?v=6kALZikXxLc
   
   تمارين الأرجل:
   - Squats: https://www.youtube.com/watch?v=aclHkVaku9U
   - Lunges: https://www.youtube.com/watch?v=QOVaHwm-Q6U
   - Leg Press: https://www.youtube.com/watch?v=IZxyjW7MPJQ
   - Romanian Deadlift: https://www.youtube.com/watch?v=2SHsk9AzdjA
   - Leg Curls: https://www.youtube.com/watch?v=ELOCsoDSmrg
   - Leg Extensions: https://www.youtube.com/watch?v=YyvSfVjQeL0
   - Calf Raises: https://www.youtube.com/watch?v=gwLzBJYoWlI
   
   تمارين البطن:
   - Plank: https://www.youtube.com/watch?v=pSHjTRCQxIw
   - Crunches: https://www.youtube.com/watch?v=Xyd_fa5zoEU
   - Russian Twists: https://www.youtube.com/watch?v=wkD8rjkodUI
   - Mountain Climbers: https://www.youtube.com/watch?v=nmwgirgXLYM
   - Bicycle Crunches: https://www.youtube.com/watch?v=9FGilxCbdz8
   
   تمارين وزن الجسم:
   - Burpees: https://www.youtube.com/watch?v=TU8QYVW0gDU
   - Jumping Jacks: https://www.youtube.com/watch?v=c4DAnQ6DtF8
   - High Knees: https://www.youtube.com/watch?v=8opcQdC-V-U
   
   - لا تخترع روابط - استخدم فقط الروابط من القائمة أعلاه
   - إذا لم تجد التمرين في القائمة، استخدم رابط مشابه من نفس فئة العضلة

9. ملاحظات إضافية:
   - أضف ملاحظات مفيدة لكل تمرين في حقل "notes"
   - مثل: "حافظ على استقامة الظهر"، "تنفس بشكل صحيح"، "ركز على الانقباض العضلي"

أنشئ البرنامج بالشكل التالي (مثال لأول يومين فقط - يجب إنشاء جميع الأيام):

{
  "plan": [
    {
      "day": 1,
      "week": 1,
      "dayName": "Week 1 - Day 1",
      "dayNameAr": "الأسبوع 1 - اليوم 1",
      "focus": "Upper Body - Moderate Intensity",
      "focusAr": "الجزء العلوي - شدة متوسطة",
      "weeklyIntensity": "60-70% من الشدة القصوى - أسبوع تأسيسي",
      "exercises": [
        {
          "name": "Push-ups",
          "nameAr": "تمرين الضغط",
          "sets": 3,
          "reps": "8-10",
          "restTime": "90 ثانية",
          "videoUrl": "https://www.youtube.com/watch?v=IODxDxX7oi4",
          "notes": "حافظ على استقامة الظهر والجسم في خط مستقيم",
          "injuryWarnings": ["تحذير: لديك التواء في المعصم - استخدم دعامات المعصم أو قم بالتمرين على قبضة اليد"]
        },
        {
          "name": "Dumbbell Rows",
          "nameAr": "تمرين السحب بالدامبل",
          "sets": 3,
          "reps": "10-12",
          "restTime": "90 ثانية",
          "videoUrl": "https://www.youtube.com/watch?v=roCP6wCXPqo",
          "notes": "اسحب الدامبل نحو الورك وليس نحو الكتف"
        }
      ]
    },
    {
      "day": 2,
      "week": 1,
      "dayName": "Week 1 - Day 2",
      "dayNameAr": "الأسبوع 1 - اليوم 2",
      "focus": "Lower Body - Moderate Intensity",
      "focusAr": "الجزء السفلي - شدة متوسطة",
      "weeklyIntensity": "60-70% من الشدة القصوى - أسبوع تأسيسي",
      "exercises": [
        {
          "name": "Bodyweight Squats",
          "nameAr": "سكوات بوزن الجسم",
          "sets": 3,
          "reps": "12-15",
          "restTime": "90 ثانية",
          "videoUrl": "https://www.youtube.com/watch?v=aclHkVaku9U",
          "notes": "انزل حتى تصبح الفخذان موازيتان للأرض",
          "injuryWarnings": ["تحذير: لديك خشونة في الركبة - لا تنزل أكثر من 90 درجة، توقف عند الموازاة"]
        }
      ]
    }
  ]
}

⚠️ مهم جداً جداً: 
- يجب إنشاء جميع الـ ${totalDays} يوم (${totalWeeks} أسابيع × ${input.daysPerWeek} أيام)
- لا تتوقف عند أسبوعين - استمر حتى الأسبوع ${totalWeeks}
- تأكد من أن آخر يوم في المصفوفة هو: {"day": ${input.daysPerWeek}, "week": ${totalWeeks}}
- مع التدرج الصحيح في الحمل التدريبي لكل أسبوع.`;

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
      plan: result.plan as WorkoutDay[],
      createdAt: new Date(),
    };
  } catch (error) {
    console.error('Error generating workout plan:', error);
    throw new Error('فشل في توليد برنامج التمرين. يرجى المحاولة مرة أخرى.');
  }
}
