import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Image,
} from 'react-native';
import { User, Activity, Target, AlertCircle } from 'lucide-react-native';
import { UserProfile } from '@/types/nutrition';
import { useNutritionStore } from '@/providers/nutrition-provider';
import Colors from '@/constants/colors';

interface Props {
  onComplete: () => void;
  initialData?: UserProfile | null;
}

export default function UserProfileForm({ onComplete, initialData }: Props) {
  const { setUserProfile } = useNutritionStore();
  const [formData, setFormData] = useState<Partial<UserProfile>>(initialData || {
    age: undefined,
    weight: undefined,
    height: undefined,
    gender: 'male',
    activityLevel: 'moderate',
    goal: 'maintain',
    weightLossMode: 'standard',
    bodyFatPercent: undefined,
    mealsPerDay: 3,
    dietaryRestrictions: [],
    allergies: [],
    healthConditions: [],
    dislikedFoods: [],
    preferredCuisines: [],
    dietType: undefined
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.age || formData.age < 16 || formData.age > 100) {
      newErrors.age = 'يرجى إدخال عمر صحيح (16-100 سنة)';
    }
    if (!formData.weight || formData.weight < 30 || formData.weight > 300) {
      newErrors.weight = 'يرجى إدخال وزن صحيح (30-300 كيلو)';
    }
    if (!formData.height || formData.height < 120 || formData.height > 250) {
      newErrors.height = 'يرجى إدخال طول صحيح (120-250 سم)';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validateForm()) {
      console.log('خطأ: يرجى تصحيح الأخطاء المذكورة');
      return;
    }

    const profile: UserProfile = {
      age: formData.age!,
      weight: formData.weight!,
      height: formData.height!,
      gender: formData.gender!,
      activityLevel: formData.activityLevel!,
      goal: formData.goal!,
      mealsPerDay: formData.mealsPerDay!,
      weightLossMode: formData.weightLossMode,
      bodyFatPercent: formData.bodyFatPercent,
      dietaryRestrictions: formData.dietaryRestrictions!,
      allergies: formData.allergies!,
      healthConditions: formData.healthConditions!,
      dislikedFoods: formData.dislikedFoods!,
      preferredCuisines: formData.preferredCuisines!,
      dietType: formData.dietType
    };

    setUserProfile(profile);
    onComplete();
  };

  const OptionButton = ({ 
    title, 
    selected, 
    onPress 
  }: { 
    title: string; 
    selected: boolean; 
    onPress: () => void; 
  }) => (
    <TouchableOpacity
      style={[styles.optionButton, selected && styles.optionButtonSelected]}
      onPress={onPress}
    >
      <Text style={[styles.optionText, selected && styles.optionTextSelected]}>
        {title}
      </Text>
    </TouchableOpacity>
  );

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <User size={32} color={Colors.light.primary} />
        <Text style={styles.title}>{initialData ? 'تعديل الملف الشخصي' : 'إعداد الملف الشخصي'}</Text>
        <Text style={styles.subtitle}>
          {initialData ? 'عدّل بياناتك حسب احتياجاتك' : 'أدخل بياناتك لحساب احتياجاتك الغذائية'}
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>المعلومات الأساسية</Text>
        
        <View style={styles.inputGroup}>
          <Text style={styles.label}>العمر (سنة)</Text>
          <TextInput
            style={[styles.input, errors.age && styles.inputError]}
            value={formData.age?.toString() || ''}
            onChangeText={(text) => setFormData({ ...formData, age: parseInt(text) || undefined })}
            keyboardType="numeric"
            placeholder="25"
          />
          {errors.age && (
            <View style={styles.errorContainer}>
              <AlertCircle size={16} color={Colors.light.error} />
              <Text style={styles.errorText}>{errors.age}</Text>
            </View>
          )}
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>الوزن (كيلو)</Text>
          <TextInput
            style={[styles.input, errors.weight && styles.inputError]}
            value={formData.weight?.toString() || ''}
            onChangeText={(text) => setFormData({ ...formData, weight: parseFloat(text) || undefined })}
            keyboardType="numeric"
            placeholder="70"
          />
          {errors.weight && (
            <View style={styles.errorContainer}>
              <AlertCircle size={16} color={Colors.light.error} />
              <Text style={styles.errorText}>{errors.weight}</Text>
            </View>
          )}
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>الطول (سم)</Text>
          <TextInput
            style={[styles.input, errors.height && styles.inputError]}
            value={formData.height?.toString() || ''}
            onChangeText={(text) => setFormData({ ...formData, height: parseInt(text) || undefined })}
            keyboardType="numeric"
            placeholder="170"
          />
          {errors.height && (
            <View style={styles.errorContainer}>
              <AlertCircle size={16} color={Colors.light.error} />
              <Text style={styles.errorText}>{errors.height}</Text>
            </View>
          )}
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>الجنس</Text>
          <View style={styles.optionsRow}>
            <OptionButton
              title="ذكر"
              selected={formData.gender === 'male'}
              onPress={() => setFormData({ ...formData, gender: 'male' })}
            />
            <OptionButton
              title="أنثى"
              selected={formData.gender === 'female'}
              onPress={() => setFormData({ ...formData, gender: 'female' })}
            />
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          <Activity size={20} color={Colors.light.primary} /> مستوى النشاط
        </Text>
        
        <View style={styles.optionsColumn}>
          <OptionButton
            title="قليل الحركة (مكتبي)"
            selected={formData.activityLevel === 'sedentary'}
            onPress={() => setFormData({ ...formData, activityLevel: 'sedentary' })}
          />
          <OptionButton
            title="نشاط خفيف (1-3 أيام/أسبوع)"
            selected={formData.activityLevel === 'light'}
            onPress={() => setFormData({ ...formData, activityLevel: 'light' })}
          />
          <OptionButton
            title="نشاط متوسط (3-5 أيام/أسبوع)"
            selected={formData.activityLevel === 'moderate'}
            onPress={() => setFormData({ ...formData, activityLevel: 'moderate' })}
          />
          <OptionButton
            title="نشاط عالي (6-7 أيام/أسبوع)"
            selected={formData.activityLevel === 'active'}
            onPress={() => setFormData({ ...formData, activityLevel: 'active' })}
          />
          <OptionButton
            title="نشاط عالي جداً (رياضي)"
            selected={formData.activityLevel === 'very_active'}
            onPress={() => setFormData({ ...formData, activityLevel: 'very_active' })}
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          <Target size={20} color={Colors.light.primary} /> الهدف
        </Text>
        
        <View style={styles.optionsColumn}>
          <OptionButton
            title="فقدان الوزن"
            selected={formData.goal === 'lose'}
            onPress={() => setFormData({ ...formData, goal: 'lose' })}
          />
          {formData.goal === 'lose' && (
            <View style={styles.optionsRow}>
              <OptionButton
                title="تقليدي"
                selected={(formData.weightLossMode ?? 'standard') === 'standard'}
                onPress={() => setFormData({ ...formData, weightLossMode: 'standard' })}
              />
              <OptionButton
                title="عجز أعلى (أسرع)"
                selected={formData.weightLossMode === 'aggressive'}
                onPress={() => setFormData({ ...formData, weightLossMode: 'aggressive' })}
              />
            </View>
          )}
          <OptionButton
            title="الحفاظ على الوزن"
            selected={formData.goal === 'maintain'}
            onPress={() => setFormData({ ...formData, goal: 'maintain' })}
          />
          <OptionButton
            title="زيادة الوزن"
            selected={formData.goal === 'gain'}
            onPress={() => setFormData({ ...formData, goal: 'gain' })}
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>عدد الوجبات اليومية</Text>
        
        <View style={styles.optionsRow}>
          {[2, 3, 4, 5, 6].map((num) => (
            <OptionButton
              key={num}
              title={num.toString()}
              selected={formData.mealsPerDay === num}
              onPress={() => setFormData({ ...formData, mealsPerDay: num })}
            />
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>نسبة دهون الجسم (اختياري)</Text>
        <Text style={styles.helperText}>استخدم الصورة لتقدير النسبة ثم أدخلها أو اختر من السريع</Text>
        <Image
          testID="bodyFatImage"
          source={{ uri: 'https://pub-e001eb4506b145aa938b5d3badbff6a5.r2.dev/attachments/txqcekzf60ch0kqmn8e72' }}
          style={styles.bodyfatImage}
          resizeMode="contain"
        />
        <View style={styles.optionsRow}>
          {[8,10,15,20,25,30,35,40].map((bf) => (
            <OptionButton
              key={`bf-${bf}`}
              title={`${bf}%`}
              selected={formData.bodyFatPercent === bf}
              onPress={() => setFormData({ ...formData, bodyFatPercent: bf })}
            />
          ))}
        </View>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>أدخل النسبة يدوياً (٪)</Text>
          <TextInput
            testID="bodyFatInput"
            style={styles.input}
            value={formData.bodyFatPercent?.toString() ?? ''}
            onChangeText={(t) => setFormData({ ...formData, bodyFatPercent: t ? Math.min(60, Math.max(3, parseFloat(t))) : undefined })}
            keyboardType="numeric"
            placeholder="مثال: 22"
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>نوع الدايت (اختياري)</Text>
        
        <View style={styles.optionsColumn}>
          <OptionButton
            title="دايت عادي متوازن"
            selected={formData.dietType === 'balanced'}
            onPress={() => setFormData({ ...formData, dietType: 'balanced' })}
          />
          <OptionButton
            title="كيتو (منخفض الكربوهيدرات)"
            selected={formData.dietType === 'keto'}
            onPress={() => setFormData({ ...formData, dietType: 'keto' })}
          />
          <OptionButton
            title="صيام متقطع"
            selected={formData.dietType === 'intermittent_fasting'}
            onPress={() => setFormData({ ...formData, dietType: 'intermittent_fasting' })}
          />
          <OptionButton
            title="منخفض الدهون"
            selected={formData.dietType === 'low_fat'}
            onPress={() => setFormData({ ...formData, dietType: 'low_fat' })}
          />
          <OptionButton
            title="عالي البروتين"
            selected={formData.dietType === 'high_protein'}
            onPress={() => setFormData({ ...formData, dietType: 'high_protein' })}
          />
          <OptionButton
            title="نباتي"
            selected={formData.dietType === 'vegetarian'}
            onPress={() => setFormData({ ...formData, dietType: 'vegetarian' })}
          />
          <OptionButton
            title="نباتي صرف (فيجان)"
            selected={formData.dietType === 'vegan'}
            onPress={() => setFormData({ ...formData, dietType: 'vegan' })}
          />
          <OptionButton
            title="باليو"
            selected={formData.dietType === 'paleo'}
            onPress={() => setFormData({ ...formData, dietType: 'paleo' })}
          />
          <OptionButton
            title="البحر الأبيض المتوسط"
            selected={formData.dietType === 'mediterranean'}
            onPress={() => setFormData({ ...formData, dietType: 'mediterranean' })}
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>التفضيلات الغذائية</Text>
        
        <View style={styles.inputGroup}>
          <Text style={styles.label}>الحالات الصحية (اختياري)</Text>
          <View style={styles.tagsContainer}>
            {['السكري نوع أول', 'السكري نوع ثاني', 'ضغط الدم المرتفع', 'ضغط الدم المنخفض', 'أمراض القلب', 'الكوليسترول المرتفع', 'حساسية الجلوتين', 'القولون العصبي', 'الكلى', 'الكبد الدهني', 'النقرس', 'فقر الدم', 'الغدة الدرقية'].map((condition) => (
              <TouchableOpacity
                key={condition}
                style={[
                  styles.tagButton,
                  formData.healthConditions?.includes(condition) && styles.tagButtonSelected
                ]}
                onPress={() => {
                  const current = formData.healthConditions || [];
                  const updated = current.includes(condition)
                    ? current.filter(c => c !== condition)
                    : [...current, condition];
                  setFormData({ ...formData, healthConditions: updated });
                }}
              >
                <Text style={[
                  styles.tagText,
                  formData.healthConditions?.includes(condition) && styles.tagTextSelected
                ]}>
                  {condition}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>أطعمة لا تحبها (اختياري)</Text>
          <View style={styles.tagsContainer}>
            {['السمك', 'الجمبري', 'اللحم الأحمر', 'لحم الضأن', 'الدجاج', 'البيض', 'منتجات الألبان', 'الجبن', 'المكسرات', 'البقوليات', 'الخضار الورقية', 'البروكلي', 'القرنبيط', 'الباذنجان', 'الفلفل الحار', 'البصل', 'الثوم', 'الطماطم', 'الفطر', 'الزيتون'].map((food) => (
              <TouchableOpacity
                key={food}
                style={[
                  styles.tagButton,
                  formData.dislikedFoods?.includes(food) && styles.tagButtonSelected
                ]}
                onPress={() => {
                  const current = formData.dislikedFoods || [];
                  const updated = current.includes(food)
                    ? current.filter(f => f !== food)
                    : [...current, food];
                  setFormData({ ...formData, dislikedFoods: updated });
                }}
              >
                <Text style={[
                  styles.tagText,
                  formData.dislikedFoods?.includes(food) && styles.tagTextSelected
                ]}>
                  {food}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>المطابخ المفضلة (اختياري)</Text>
          <View style={styles.tagsContainer}>
            {['المطبخ المصري', 'المطبخ الشامي', 'المطبخ الخليجي', 'المطبخ المغربي', 'المطبخ التركي', 'المطبخ اللبناني', 'المطبخ السوري', 'المطبخ العراقي', 'المطبخ اليمني', 'المطبخ السوداني', 'المطبخ الهندي', 'المطبخ الآسيوي'].map((cuisine) => (
              <TouchableOpacity
                key={cuisine}
                style={[
                  styles.tagButton,
                  formData.preferredCuisines?.includes(cuisine) && styles.tagButtonSelected
                ]}
                onPress={() => {
                  const current = formData.preferredCuisines || [];
                  const updated = current.includes(cuisine)
                    ? current.filter(c => c !== cuisine)
                    : [...current, cuisine];
                  setFormData({ ...formData, preferredCuisines: updated });
                }}
              >
                <Text style={[
                  styles.tagText,
                  formData.preferredCuisines?.includes(cuisine) && styles.tagTextSelected
                ]}>
                  {cuisine}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>

      <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
        <Text testID="submitProfile" style={styles.submitButtonText}>{initialData ? 'حفظ التعديلات' : 'حساب الاحتياجات الغذائية'}</Text>
      </TouchableOpacity>

      <View style={styles.bottomSpacing} />
    </ScrollView>
  );
}

const imageHeight = 260 as const;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  header: {
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 30,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.light.text,
    marginTop: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: Colors.light.gray[500],
    marginTop: 8,
    textAlign: 'center',
  },
  section: {
    marginHorizontal: 20,
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.light.text,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.light.text,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: Colors.light.gray[300],
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: Colors.light.background,
  },
  inputError: {
    borderColor: Colors.light.error,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  errorText: {
    color: Colors.light.error,
    fontSize: 14,
    marginLeft: 4,
  },
  optionsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  optionsColumn: {
    gap: 12,
  },
  optionButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.light.gray[300],
    backgroundColor: Colors.light.background,
    alignItems: 'center',
  },
  optionButtonSelected: {
    borderColor: Colors.light.primary,
    backgroundColor: Colors.light.primary + '10',
  },
  optionText: {
    fontSize: 14,
    color: Colors.light.gray[600],
    textAlign: 'center',
  },
  optionTextSelected: {
    color: Colors.light.primary,
    fontWeight: '600',
  },
  helperText: {
    fontSize: 13,
    color: Colors.light.gray[500],
    marginBottom: 8,
  },
  bodyfatImage: {
    width: '100%',
    height: imageHeight,
    borderRadius: 12,
    marginBottom: 12,
    backgroundColor: Colors.light.gray[100],
  },
  submitButton: {
    marginHorizontal: 20,
    backgroundColor: Colors.light.primary,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  submitButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  bottomSpacing: {
    height: 40,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tagButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.light.gray[300],
    backgroundColor: Colors.light.background,
  },
  tagButtonSelected: {
    borderColor: Colors.light.primary,
    backgroundColor: Colors.light.primary + '20',
  },
  tagText: {
    fontSize: 12,
    color: Colors.light.gray[600],
  },
  tagTextSelected: {
    color: Colors.light.primary,
    fontWeight: '600',
  },
});