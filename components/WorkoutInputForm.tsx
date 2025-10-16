import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  TextInput,
  Platform,
} from 'react-native';
import {
  WorkoutInput,
  FitnessLevel,
  WorkoutGoal,
  WorkoutLocation,
  Equipment,
  Injury,
  ExperienceDuration,
  PlanDuration,
} from '@/types/workout';
import {
  User,
  Scale,
  Ruler,
  Target,
  Activity as ActivityIcon,
  Dumbbell,
  Home,
  Building2,
  CalendarDays,
  Clock,
  Sparkles,
  ShieldAlert,
} from 'lucide-react-native';

interface WorkoutInputFormProps {
  onSubmit: (input: WorkoutInput) => void;
  isLoading?: boolean;
  initialData?: WorkoutInput;
}

export default function WorkoutInputForm({ onSubmit, isLoading, initialData }: WorkoutInputFormProps) {
  const [age, setAge] = useState<number>(25);
  const [weight, setWeight] = useState<number>(70);
  const [height, setHeight] = useState<number>(170);
  const [experienceDuration, setExperienceDuration] = useState<ExperienceDuration>('less_than_3_months');
  const [level, setLevel] = useState<FitnessLevel>('beginner');
  const [goals, setGoals] = useState<WorkoutGoal[]>([]);
  const [daysPerWeek, setDaysPerWeek] = useState<number>(3);
  const [planDuration, setPlanDuration] = useState<PlanDuration>(1);
  const [location, setLocation] = useState<WorkoutLocation>('gym');
  const [equipment, setEquipment] = useState<Equipment[]>(['bodyweight']);
  const [injuries, setInjuries] = useState<Injury[]>([]);

  useEffect(() => {
    if (initialData) {
      setAge(initialData.age);
      setWeight(initialData.weight);
      setHeight(initialData.height);
      setExperienceDuration(initialData.experienceDuration);
      setLevel(initialData.level);
      setGoals(initialData.goals);
      setDaysPerWeek(initialData.daysPerWeek);
      setPlanDuration(initialData.planDuration);
      setLocation(initialData.location);
      setEquipment(initialData.equipment);
      setInjuries(initialData.injuries);
    }
  }, [initialData]);

  const toggleGoal = (goal: WorkoutGoal) => {
    console.log('[WorkoutInputForm] toggleGoal', goal);
    if (goals.includes(goal)) {
      setGoals(goals.filter((g) => g !== goal));
    } else {
      setGoals([...goals, goal]);
    }
  };

  const toggleEquipment = (item: Equipment) => {
    console.log('[WorkoutInputForm] toggleEquipment', item);
    if (equipment.includes(item)) {
      setEquipment(equipment.filter((e) => e !== item));
    } else {
      setEquipment([...equipment, item]);
    }
  };

  const toggleInjury = (injury: Injury) => {
    console.log('[WorkoutInputForm] toggleInjury', injury);
    if (injuries.includes(injury)) {
      setInjuries(injuries.filter((i) => i !== injury));
    } else {
      setInjuries([...injuries, injury]);
    }
  };

  const handleSubmit = () => {
    console.log('[WorkoutInputForm] submit pressed');
    if (goals.length === 0) {
      alert('يرجى اختيار هدف واحد على الأقل');
      return;
    }
    if (equipment.length === 0) {
      alert('يرجى اختيار أداة واحدة على الأقل');
      return;
    }

    const input: WorkoutInput = {
      age,
      weight,
      height,
      experienceDuration,
      level,
      goals,
      daysPerWeek,
      planDuration,
      location,
      equipment,
      injuries,
    };
    console.log('[WorkoutInputForm] submit input', input);
    onSubmit(input);
  };

  const expOptions = useMemo(
    () => [
      { key: 'less_than_3_months', label: 'أقل من 3 شهور' },
      { key: '3_to_6_months', label: 'من 3 إلى 6 شهور' },
      { key: '6_to_12_months', label: 'من 6 إلى 12 شهر' },
      { key: '1_to_2_years', label: 'من سنة إلى سنتين' },
      { key: 'more_than_2_years', label: 'أكثر من سنتين' },
    ],
    []
  );

  const goalOptions = useMemo(
    () => [
      { key: 'muscle_building', label: 'بناء كتلة عضلية' },
      { key: 'fat_loss', label: 'حرق الدهون' },
      { key: 'fitness_improvement', label: 'تحسين اللياقة العامة' },
      { key: 'strength', label: 'زيادة القوة' },
      { key: 'endurance', label: 'تحسين التحمل' },
      { key: 'flexibility', label: 'زيادة المرونة' },
    ],
    []
  );

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false} testID="workout-input-scroll">
      <View style={styles.hero}>
        <View style={styles.heroBadge}>
          <Sparkles size={18} color="#fff" />
          <Text style={styles.heroBadgeText}>جاهز لبرنامج مصمم لك</Text>
        </View>
        <Text style={styles.heroTitle}>لنبدأ نبني برنامج تمرينك</Text>
        <Text style={styles.heroSubtitle}>املأ البيانات التالية للحصول على خطة دقيقة تناسب هدفك ومستواك</Text>
      </View>

      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <User size={18} color="#007AFF" />
          <Text style={styles.cardTitle}>البيانات الأساسية</Text>
        </View>
        <View style={styles.row}>
          <View style={styles.inputCol}>
            <Text style={styles.label}>العمر</Text>
            <View style={styles.inputWithActions}>
              <TouchableOpacity
                testID="age-decrement"
                style={styles.roundBtn}
                onPress={() => setAge((v) => Math.max(1, v - 1))}
              >
                <Text style={styles.roundBtnText}>-</Text>
              </TouchableOpacity>
              <TextInput
                testID="age-input"
                style={styles.textInput}
                value={age.toString()}
                onChangeText={(text) => {
                  const num = parseInt(text, 10);
                  if (!Number.isNaN(num) && num > 0 && num <= 120) {
                    setAge(num);
                  } else if (text === '') {
                    setAge(0);
                  }
                }}
                keyboardType="numeric"
                placeholder="أدخل العمر"
                placeholderTextColor="#999"
              />
              <TouchableOpacity
                testID="age-increment"
                style={styles.roundBtn}
                onPress={() => setAge((v) => Math.min(120, v + 1))}
              >
                <Text style={styles.roundBtnText}>+</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>الوزن (كجم)</Text>
          <View style={styles.inputWithIcon}>
            <Scale size={18} color="#999" />
            <TextInput
              testID="weight-input"
              style={[styles.textInput, styles.flex]}
              value={weight.toString()}
              onChangeText={(text) => {
                const num = parseInt(text, 10);
                if (!Number.isNaN(num) && num > 0 && num <= 300) {
                  setWeight(num);
                } else if (text === '') {
                  setWeight(0);
                }
              }}
              keyboardType="numeric"
              placeholder="أدخل الوزن"
              placeholderTextColor="#999"
            />
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>الطول (سم)</Text>
          <View style={styles.inputWithIcon}>
            <Ruler size={18} color="#999" />
            <TextInput
              testID="height-input"
              style={[styles.textInput, styles.flex]}
              value={height.toString()}
              onChangeText={(text) => {
                const num = parseInt(text, 10);
                if (!Number.isNaN(num) && num > 0 && num <= 250) {
                  setHeight(num);
                } else if (text === '') {
                  setHeight(0);
                }
              }}
              keyboardType="numeric"
              placeholder="أدخل الطول"
              placeholderTextColor="#999"
            />
          </View>
        </View>
      </View>

      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Clock size={18} color="#007AFF" />
          <Text style={styles.cardTitle}>الخبرة والمستوى</Text>
        </View>
        <View style={styles.segmented}>
          {expOptions.map(({ key, label }) => {
            const active = experienceDuration === (key as ExperienceDuration);
            return (
              <TouchableOpacity
                key={key}
                testID={`exp-${key}`}
                style={[styles.segment, active && styles.segmentActive]}
                onPress={() => setExperienceDuration(key as ExperienceDuration)}
              >
                <Text style={[styles.segmentText, active && styles.segmentTextActive]}>{label}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
        <View style={styles.levelRow}>
          {([
            { key: 'beginner', label: 'مبتدئ' },
            { key: 'intermediate', label: 'متوسط' },
            { key: 'advanced', label: 'متقدم' },
          ] as { key: FitnessLevel; label: string }[]).map(({ key, label }) => {
            const active = level === key;
            return (
              <TouchableOpacity
                key={key}
                testID={`level-${key}`}
                style={[styles.levelPill, active && styles.levelPillActive]}
                onPress={() => setLevel(key)}
              >
                <ActivityIcon size={16} color={active ? '#fff' : '#007AFF'} />
                <Text style={[styles.levelPillText, active && styles.levelPillTextActive]}>{label}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
        <Text style={styles.levelHint} testID="level-hint">
          مبتدئ: أقل من سنة إلى سنتين تمرين • متوسط: من سنة إلى 3 أو 4 سنين تمرين • متقدم: أكثر من 4 سنين تمرين
        </Text>
      </View>

      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Target size={18} color="#007AFF" />
          <Text style={styles.cardTitle}>الأهداف</Text>
        </View>
        <View style={styles.chipsWrap}>
          {goalOptions.map(({ key, label }) => {
            const active = goals.includes(key as WorkoutGoal);
            return (
              <TouchableOpacity
                key={key}
                testID={`goal-${key}`}
                style={[styles.chip, active && styles.chipActive]}
                onPress={() => toggleGoal(key as WorkoutGoal)}
              >
                <Text style={[styles.chipText, active && styles.chipTextActive]}>{label}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <CalendarDays size={18} color="#007AFF" />
          <Text style={styles.cardTitle}>التردد والمدة</Text>
        </View>
        <Text style={styles.label}>عدد أيام التمرين أسبوعياً</Text>
        <View style={styles.rowWrap}>
          {[3, 4, 5, 6].map((num) => {
            const active = daysPerWeek === num;
            return (
              <TouchableOpacity
                key={num}
                testID={`days-${num}`}
                style={[styles.square, active && styles.squareActive]}
                onPress={() => setDaysPerWeek(num)}
              >
                <Text style={[styles.squareText, active && styles.squareTextActive]}>{num} أيام</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <Text style={[styles.label, { marginTop: 16 }]}>مدة البرنامج</Text>
        <View style={styles.rowWrap}>
          {[1, 2, 3].map((duration) => {
            const active = planDuration === duration;
            return (
              <TouchableOpacity
                key={duration}
                testID={`duration-${duration}`}
                style={[styles.square, active && styles.squareActive]}
                onPress={() => setPlanDuration(duration as PlanDuration)}
              >
                <Text style={[styles.squareText, active && styles.squareTextActive]}>
                  {duration} {duration === 1 ? 'شهر' : 'شهور'}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      <View style={styles.card}>
        <View style={styles.cardHeader}>
          {location === 'home' ? <Home size={18} color="#007AFF" /> : <Building2 size={18} color="#007AFF" />}
          <Text style={styles.cardTitle}>مكان التمرين</Text>
        </View>
        <View style={styles.levelRow}>
          {([
            { key: 'home', label: 'البيت' },
            { key: 'gym', label: 'الجيم' },
          ] as { key: WorkoutLocation; label: string }[]).map(({ key, label }) => {
            const active = location === key;
            return (
              <TouchableOpacity
                key={key}
                testID={`location-${key}`}
                style={[styles.levelPill, active && styles.levelPillActive]}
                onPress={() => setLocation(key)}
              >
                <Text style={[styles.levelPillText, active && styles.levelPillTextActive]}>{label}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Dumbbell size={18} color="#007AFF" />
          <Text style={styles.cardTitle}>الأدوات المتوفرة</Text>
        </View>
        <View style={styles.chipsWrap}>
          {([
            { key: 'bodyweight', label: 'وزن الجسم' },
            { key: 'resistance_band', label: 'حبل مقاومة' },
            { key: 'dumbbells', label: 'دامبل' },
            { key: 'gym_equipment', label: 'أجهزة الجيم' },
          ] as { key: Equipment; label: string }[]).map(({ key, label }) => {
            const active = equipment.includes(key);
            return (
              <TouchableOpacity
                key={key}
                testID={`equip-${key}`}
                style={[styles.chip, active && styles.chipActive]}
                onPress={() => toggleEquipment(key)}
              >
                <Text style={[styles.chipText, active && styles.chipTextActive]}>{label}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <ShieldAlert size={18} color="#FF3B30" />
          <Text style={styles.cardTitle}>الإصابات (اختياري)</Text>
        </View>
        <View style={styles.injuryGroups}>
          <View style={styles.injuryCategory}>
            <Text style={styles.injuryCategoryTitle}>🦴 العمود الفقري والظهر</Text>
            <View style={styles.chipsWrap}>
              {[
                { key: 'cervical_disc_herniation', label: 'انزلاق غضروف فقرات عنقية' },
                { key: 'lumbar_disc_herniation', label: 'انزلاق غضروف فقرات قطنية' },
                { key: 'lower_back_pain', label: 'ألم أسفل الظهر' },
                { key: 'sciatica', label: 'عرق النسا' },
                { key: 'spondylolisthesis', label: 'انزلاق الفقرات' },
              ].map(({ key, label }) => {
                const active = injuries.includes(key as Injury);
                return (
                  <TouchableOpacity
                    key={key}
                    testID={`inj-${key}`}
                    style={[styles.chip, active && styles.chipActive]}
                    onPress={() => toggleInjury(key as Injury)}
                  >
                    <Text style={[styles.chipText, active && styles.chipTextActive]}>{label}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          <View style={styles.injuryCategory}>
            <Text style={styles.injuryCategoryTitle}>💪 الكتف والذراع</Text>
            <View style={styles.chipsWrap}>
              {[
                { key: 'shoulder_dislocation', label: 'خلع كتف' },
                { key: 'rotator_cuff_tear', label: 'تمزق الكفة المدورة' },
                { key: 'shoulder_impingement', label: 'متلازمة اصطدام الكتف' },
                { key: 'biceps_tendonitis', label: 'التهاب وتر العضلة ذات الرأسين' },
              ].map(({ key, label }) => {
                const active = injuries.includes(key as Injury);
                return (
                  <TouchableOpacity
                    key={key}
                    testID={`inj-${key}`}
                    style={[styles.chip, active && styles.chipActive]}
                    onPress={() => toggleInjury(key as Injury)}
                  >
                    <Text style={[styles.chipText, active && styles.chipTextActive]}>{label}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          <View style={styles.injuryCategory}>
            <Text style={styles.injuryCategoryTitle}>🦵 الركبة</Text>
            <View style={styles.chipsWrap}>
              {[
                { key: 'knee_osteoarthritis', label: 'خشونة الركبة' },
                { key: 'acl_tear', label: 'قطع الرباط الصليبي الأمامي' },
                { key: 'mcl_tear', label: 'قطع الرباط الجانبي الإنسي' },
                { key: 'meniscus_tear', label: 'تمزق الغضروف الهلالي' },
                { key: 'patellar_tendonitis', label: 'التهاب وتر الرضفة' },
              ].map(({ key, label }) => {
                const active = injuries.includes(key as Injury);
                return (
                  <TouchableOpacity
                    key={key}
                    testID={`inj-${key}`}
                    style={[styles.chip, active && styles.chipActive]}
                    onPress={() => toggleInjury(key as Injury)}
                  >
                    <Text style={[styles.chipText, active && styles.chipTextActive]}>{label}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          <View style={styles.injuryCategory}>
            <Text style={styles.injuryCategoryTitle}>🤲 المعصم والكوع</Text>
            <View style={styles.chipsWrap}>
              {[
                { key: 'wrist_sprain', label: 'التواء المعصم' },
                { key: 'carpal_tunnel', label: 'متلازمة النفق الرسغي' },
                { key: 'tennis_elbow', label: 'مرفق التنس' },
                { key: 'golfers_elbow', label: 'مرفق لاعب الجولف' },
              ].map(({ key, label }) => {
                const active = injuries.includes(key as Injury);
                return (
                  <TouchableOpacity
                    key={key}
                    testID={`inj-${key}`}
                    style={[styles.chip, active && styles.chipActive]}
                    onPress={() => toggleInjury(key as Injury)}
                  >
                    <Text style={[styles.chipText, active && styles.chipTextActive]}>{label}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          <View style={styles.injuryCategory}>
            <Text style={styles.injuryCategoryTitle}>🦶 الكاحل والقدم</Text>
            <View style={styles.chipsWrap}>
              {[
                { key: 'ankle_sprain', label: 'التواء الكاحل' },
                { key: 'achilles_tendonitis', label: 'التهاب وتر أخيل' },
                { key: 'plantar_fasciitis', label: 'التهاب اللفافة الأخمصية' },
              ].map(({ key, label }) => {
                const active = injuries.includes(key as Injury);
                return (
                  <TouchableOpacity
                    key={key}
                    testID={`inj-${key}`}
                    style={[styles.chip, active && styles.chipActive]}
                    onPress={() => toggleInjury(key as Injury)}
                  >
                    <Text style={[styles.chipText, active && styles.chipTextActive]}>{label}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          <View style={styles.injuryCategory}>
            <Text style={styles.injuryCategoryTitle}>🏋️ الورك والبطن</Text>
            <View style={styles.chipsWrap}>
              {[
                { key: 'hip_bursitis', label: 'التهاب الجراب الوركي' },
                { key: 'hip_labral_tear', label: 'تمزق الشفا الوركي' },
                { key: 'groin_strain', label: 'شد عضلي في الفخذ' },
                { key: 'inguinal_hernia', label: 'فتق أربي' },
                { key: 'umbilical_hernia', label: 'فتق سري' },
              ].map(({ key, label }) => {
                const active = injuries.includes(key as Injury);
                return (
                  <TouchableOpacity
                    key={key}
                    testID={`inj-${key}`}
                    style={[styles.chip, active && styles.chipActive]}
                    onPress={() => toggleInjury(key as Injury)}
                  >
                    <Text style={[styles.chipText, active && styles.chipTextActive]}>{label}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </View>
      </View>

      <TouchableOpacity
        testID="submit-generate-plan"
        style={[styles.submitButton, isLoading && styles.submitButtonDisabled]}
        onPress={handleSubmit}
        disabled={isLoading || goals.length === 0 || equipment.length === 0}
      >
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator color="#fff" />
            <Text style={styles.loadingText}>قد يستغرق بعض الدقائق...</Text>
          </View>
        ) : (
          <View style={styles.submitInner}>
            <Dumbbell size={18} color="#fff" />
            <Text style={styles.submitButtonText}>{initialData ? 'تحديث برنامج التمرين' : 'توليد برنامج التمرين'}</Text>
          </View>
        )}
      </TouchableOpacity>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#F7F8FA',
  },
  hero: {
    marginBottom: 16,
    alignItems: 'flex-end',
    gap: 8,
  },
  heroBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#007AFF',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  heroBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700' as const,
  },
  heroTitle: {
    fontSize: 22,
    fontWeight: '800' as const,
    color: '#0A0A0A',
    textAlign: 'right' as const,
  },
  heroSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'right' as const,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOpacity: 0.08,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 4 },
      },
      android: { elevation: 2 },
      default: { boxShadow: '0 6px 20px rgba(0,0,0,0.06)' } as unknown as {},
    }),
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '800' as const,
    color: '#111827',
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  row3: {
    flexDirection: 'row',
    gap: 12,
  },
  inputGroup: {
    marginTop: 12,
  },
  rowWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap' as const,
    gap: 10,
  },
  inputCol: {
    flex: 1,
  },
  label: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: '#1F2937',
    marginBottom: 8,
    textAlign: 'right' as const,
  },
  textInput: {
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    color: '#111827',
    textAlign: 'right' as const,
    borderWidth: 2,
    borderColor: '#F3F4F6',
    flexGrow: 0,
  },
  inputWithActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  inputWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    paddingHorizontal: 12,
  },
  roundBtn: {
    width: 40,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  roundBtnText: {
    fontSize: 20,
    fontWeight: '800' as const,
    color: '#111827',
  },
  segmented: {
    gap: 8,
  },
  segment: {
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    borderWidth: 2,
    borderColor: '#F3F4F6',
    alignItems: 'center',
  },
  segmentActive: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  segmentText: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: '#111827',
  },
  segmentTextActive: {
    color: '#fff',
  },
  levelRow: {
    marginTop: 12,
    flexDirection: 'row',
    gap: 8,
  },
  levelPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 999,
    backgroundColor: '#F3F4F6',
  },
  levelPillActive: {
    backgroundColor: '#007AFF',
  },
  levelPillText: {
    color: '#007AFF',
    fontWeight: '700' as const,
  },
  levelPillTextActive: {
    color: '#fff',
  },
  levelHint: {
    marginTop: 8,
    color: '#6B7280',
    fontSize: 12,
    textAlign: 'right' as const,
  },
  chipsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap' as const,
    gap: 8,
  },
  chip: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 999,
    backgroundColor: '#F3F4F6',
  },
  chipActive: {
    backgroundColor: '#111827',
  },
  chipText: {
    color: '#111827',
    fontWeight: '700' as const,
    fontSize: 14,
  },
  chipTextActive: {
    color: '#fff',
  },
  square: {
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
  },
  squareActive: {
    backgroundColor: '#007AFF',
  },
  squareText: {
    color: '#111827',
    fontWeight: '700' as const,
  },
  squareTextActive: {
    color: '#fff',
  },
  submitButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  submitInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '800' as const,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  loadingText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700' as const,
  },
  injuryGroups: {
    gap: 16,
  },
  injuryCategory: {
    gap: 8,
  },
  injuryCategoryTitle: {
    fontSize: 14,
    fontWeight: '800' as const,
    color: '#007AFF',
    textAlign: 'right' as const,
  },
  flex: { flex: 1 },
});
