import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  TextInput,
  Modal,
  Alert
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Sparkles, Edit2, X } from 'lucide-react-native';
import { useNutritionStore } from '@/providers/nutrition-provider';
import { generateDailyMealPlan } from '@/services/meal-generator';
import UserProfileForm from '@/components/UserProfileForm';
import NutritionTargets from '@/components/NutritionTargets';
import Colors from '@/constants/colors';
import { NutritionTargets as NutritionTargetsType } from '@/types/nutrition';

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const { 
    userProfile, 
    nutritionTargets, 
    currentMealPlan,
    isGenerating,
    setCurrentMealPlan,
    setIsGenerating,
    loadUserProfile,
    updateNutritionTargets,
    validateMacros
  } = useNutritionStore();
  
  const [showForm, setShowForm] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editedTargets, setEditedTargets] = useState<NutritionTargetsType | null>(null);
  const [validationError, setValidationError] = useState<string>('');

  useEffect(() => {
    loadUserProfile();
  }, [loadUserProfile]);

  useEffect(() => {
    if (!userProfile) {
      setShowForm(true);
    } else {
      setShowForm(false);
    }
  }, [userProfile]);

  useEffect(() => {
    if (nutritionTargets) {
      setEditedTargets(nutritionTargets);
    }
  }, [nutritionTargets]);

  const handleGenerateMealPlan = async () => {
    if (!userProfile || !nutritionTargets) {
      Alert.alert('تنبيه', 'يرجى إعداد الملف الشخصي أولاً');
      return;
    }

    setIsGenerating(true);
    try {
      console.log('بدء توليد خطة الوجبات...');
      const mealPlan = await generateDailyMealPlan(userProfile, nutritionTargets);
      console.log('تم توليد الخطة بنجاح');
      setCurrentMealPlan(mealPlan);
      Alert.alert('نجاح', 'تم توليد خطة الوجب��ت بنجاح!');
    } catch (error) {
      console.error('خطأ في توليد الوجبات:', error);
      const errorMessage = error instanceof Error ? error.message : 'حدث خطأ غير متوقع';
      Alert.alert('خطأ', errorMessage);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveTargets = () => {
    if (editedTargets) {
      const validation = validateMacros(editedTargets);
      
      if (!validation.valid && validation.corrected) {
        Alert.alert(
          'تعديل الماكروز',
          validation.message || 'الماكروز غير متوافقة مع السعرات',
          [
            {
              text: 'إلغاء',
              style: 'cancel'
            },
            {
              text: 'تصحيح تلقائي',
              onPress: () => {
                if (validation.corrected) {
                  setEditedTargets(validation.corrected);
                  updateNutritionTargets(validation.corrected);
                  setValidationError('');
                  setShowEditModal(false);
                }
              }
            }
          ]
        );
        return;
      }
      
      updateNutritionTargets(editedTargets);
      setValidationError('');
      setShowEditModal(false);
    }
  };

  const handleCaloriesChange = (text: string) => {
    const calories = parseInt(text) || 0;
    if (editedTargets) {
      const proteinCals = editedTargets.protein * 4;
      const carbsCals = editedTargets.carbs * 4;
      const fatCals = editedTargets.fat * 9;
      const totalMacroCals = proteinCals + carbsCals + fatCals;

      if (totalMacroCals > 0) {
        const proteinPercent = proteinCals / totalMacroCals;
        const carbsPercent = carbsCals / totalMacroCals;
        const fatPercent = fatCals / totalMacroCals;

        const newProtein = Math.round((calories * proteinPercent) / 4);
        const newCarbs = Math.round((calories * carbsPercent) / 4);
        const newFat = Math.round((calories * fatPercent) / 9);

        setEditedTargets({
          ...editedTargets,
          calories,
          protein: newProtein,
          carbs: newCarbs,
          fat: newFat
        });
      } else {
        setEditedTargets({ ...editedTargets, calories });
      }
    }
  };

  const handleMacroChange = (macro: 'protein' | 'carbs' | 'fat', text: string) => {
    const value = parseInt(text) || 0;
    if (editedTargets) {
      const updated = { ...editedTargets, [macro]: value };
      
      const proteinCals = updated.protein * 4;
      const carbsCals = updated.carbs * 4;
      const fatCals = updated.fat * 9;
      const totalMacroCals = proteinCals + carbsCals + fatCals;

      const suggestedCalories = Math.round(totalMacroCals);
      
      if (Math.abs(suggestedCalories - updated.calories) > 50) {
        setValidationError(`تنبيه: مجموع الماكروز يساوي ${suggestedCalories} سعرة، بينما السعرات المحددة ${updated.calories}`);
      } else {
        setValidationError('');
      }
      
      setEditedTargets(updated);
    }
  };

  if (showForm) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <UserProfileForm onComplete={() => setShowForm(false)} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Image 
            source={{ uri: 'https://pub-e001eb4506b145aa938b5d3badbff6a5.r2.dev/attachments/1xxbvwi4e2zpldw41rzdp' }}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.title}>DBS Diet Plan</Text>
          <Text style={styles.subtitle}>
            وجبات عربية صحية ومتوازنة بالذكاء الاصطناعي
          </Text>
        </View>

        {nutritionTargets && (
          <View>
            <View style={styles.targetsHeader}>
              <Text style={styles.targetsTitle}>احتياجاتك اليومية</Text>
              <TouchableOpacity 
                style={styles.editTargetsButton}
                onPress={() => setShowEditModal(true)}
              >
                <Edit2 size={18} color={Colors.light.primary} />
                <Text style={styles.editTargetsText}>تعديل</Text>
              </TouchableOpacity>
            </View>
            <NutritionTargets targets={nutritionTargets} />
          </View>
        )}

        <View style={styles.actionSection}>
          {currentMealPlan ? (
            <View style={styles.mealPlanSummary}>
              <Text style={styles.mealPlanTitle}>خطة وجباتك اليومية جاهزة!</Text>
              <Text style={styles.mealPlanSubtitle}>
                {currentMealPlan.meals?.length || 0} وجبات متوازنة
              </Text>
              <View style={styles.mealPlanStats}>
                <Text style={styles.statText}>
                  إجمالي السعرات: {currentMealPlan.totalNutrition?.calories || 0}
                </Text>
                <Text style={styles.statText}>
                  البروتين: {currentMealPlan.totalNutrition?.protein || 0}جم
                </Text>
              </View>
            </View>
          ) : (
            <View style={styles.welcomeSection}>
              <Text style={styles.welcomeTitle}>مرحباً بك!</Text>
              <Text style={styles.welcomeText}>
                اضغط على الزر أدناه لتوليد خطة وجبات مخصصة لك
              </Text>
            </View>
          )}

          <TouchableOpacity
            style={[styles.generateButton, isGenerating && styles.generateButtonDisabled]}
            onPress={handleGenerateMealPlan}
            disabled={isGenerating}
            activeOpacity={0.8}
          >
            {isGenerating ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" color="white" />
                <Text style={styles.generateButtonText}>جاري التوليد... (قد يستغرق دقيقة)</Text>
              </View>
            ) : (
              <View style={styles.buttonContent}>
                <Sparkles size={20} color="white" />
                <Text style={styles.generateButtonText}>
                  {currentMealPlan ? 'توليد خطة جديدة' : 'توليد خطة الوجبات'}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.featuresSection}>
          <Text style={styles.featuresTitle}>مميزات التطبيق</Text>
          <View style={styles.featuresList}>
            <View style={styles.featureItem}>
              <Text style={styles.featureIcon}>🍽️</Text>
              <Text style={styles.featureText}>وجبات عربية أصيلة ومتنوعة</Text>
            </View>
            <View style={styles.featureItem}>
              <Text style={styles.featureIcon}>⚖️</Text>
              <Text style={styles.featureText}>حساب دقيق للسعرات والماكروز</Text>
            </View>
            <View style={styles.featureItem}>
              <Text style={styles.featureIcon}>🔄</Text>
              <Text style={styles.featureText}>إمكانية تغيير أي وجبة</Text>
            </View>
            <View style={styles.featureItem}>
              <Text style={styles.featureIcon}>🎯</Text>
              <Text style={styles.featureText}>مخصص حسب أهدافك الصحية</Text>
            </View>
            <View style={styles.featureItem}>
              <Text style={styles.featureIcon}>🏥</Text>
              <Text style={styles.featureText}>يراعي الحالات الصحية (السكري، الضغط)</Text>
            </View>
            <View style={styles.featureItem}>
              <Text style={styles.featureIcon}>❌</Text>
              <Text style={styles.featureText}>يتجنب الأطعمة غير المرغوبة</Text>
            </View>
            <View style={styles.featureItem}>
              <Text style={styles.featureIcon}>🌍</Text>
              <Text style={styles.featureText}>مطابخ عربية متنوعة حسب تفضيلاتك</Text>
            </View>
          </View>
        </View>

        <View style={styles.bottomSpacing} />
      </ScrollView>

      <Modal
        visible={showEditModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowEditModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>تعديل الأهداف الغذائية</Text>
              <TouchableOpacity onPress={() => setShowEditModal(false)}>
                <X size={24} color={Colors.light.text} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {validationError ? (
                <View style={styles.validationError}>
                  <Text style={styles.validationErrorText}>{validationError}</Text>
                </View>
              ) : null}

              <View style={styles.modalInputGroup}>
                <Text style={styles.modalLabel}>السعرات الحرارية</Text>
                <TextInput
                  style={styles.modalInput}
                  value={editedTargets?.calories.toString() || ''}
                  onChangeText={handleCaloriesChange}
                  keyboardType="numeric"
                  placeholder="2000"
                />
                <Text style={styles.modalHint}>تغيير السعرات سيعدل الماكروز تلقائياً</Text>
              </View>

              <View style={styles.modalInputGroup}>
                <Text style={styles.modalLabel}>البروتين (جرام)</Text>
                <TextInput
                  style={styles.modalInput}
                  value={editedTargets?.protein.toString() || ''}
                  onChangeText={(text) => handleMacroChange('protein', text)}
                  keyboardType="numeric"
                  placeholder="150"
                />
                <Text style={styles.modalHint}>
                  {editedTargets ? `${Math.round((editedTargets.protein * 4 / editedTargets.calories) * 100)}% من السعرات` : ''}
                </Text>
              </View>

              <View style={styles.modalInputGroup}>
                <Text style={styles.modalLabel}>الكربوهيدرات (جرام)</Text>
                <TextInput
                  style={styles.modalInput}
                  value={editedTargets?.carbs.toString() || ''}
                  onChangeText={(text) => handleMacroChange('carbs', text)}
                  keyboardType="numeric"
                  placeholder="200"
                />
                <Text style={styles.modalHint}>
                  {editedTargets ? `${Math.round((editedTargets.carbs * 4 / editedTargets.calories) * 100)}% من السعرات` : ''}
                </Text>
              </View>

              <View style={styles.modalInputGroup}>
                <Text style={styles.modalLabel}>الدهون (جرام)</Text>
                <TextInput
                  style={styles.modalInput}
                  value={editedTargets?.fat.toString() || ''}
                  onChangeText={(text) => handleMacroChange('fat', text)}
                  keyboardType="numeric"
                  placeholder="65"
                />
                <Text style={styles.modalHint}>
                  {editedTargets ? `${Math.round((editedTargets.fat * 9 / editedTargets.calories) * 100)}% من السعرات` : ''}
                </Text>
              </View>

              <View style={styles.modalInputGroup}>
                <Text style={styles.modalLabel}>الألياف (جرام)</Text>
                <TextInput
                  style={styles.modalInput}
                  value={editedTargets?.fiber.toString() || ''}
                  onChangeText={(text) => setEditedTargets(prev => prev ? {...prev, fiber: parseInt(text) || 0} : null)}
                  keyboardType="numeric"
                  placeholder="30"
                />
              </View>

              <TouchableOpacity 
                style={styles.modalSaveButton}
                onPress={handleSaveTargets}
              >
                <Text style={styles.modalSaveButtonText}>حفظ التعديلات</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

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
  logo: {
    width: 120,
    height: 120,
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.light.text,
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.light.gray[500],
    textAlign: 'center',
    lineHeight: 22,
  },
  actionSection: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  mealPlanSummary: {
    backgroundColor: Colors.light.success + '10',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    alignItems: 'center',
  },
  mealPlanTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.light.success,
    textAlign: 'center',
    marginBottom: 8,
  },
  mealPlanSubtitle: {
    fontSize: 14,
    color: Colors.light.success,
    textAlign: 'center',
    marginBottom: 12,
  },
  mealPlanStats: {
    flexDirection: 'row',
    gap: 20,
  },
  statText: {
    fontSize: 12,
    color: Colors.light.success,
    fontWeight: '500',
  },
  welcomeSection: {
    alignItems: 'center',
    marginBottom: 20,
  },
  welcomeTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.light.text,
    marginBottom: 8,
  },
  welcomeText: {
    fontSize: 16,
    color: Colors.light.gray[600],
    textAlign: 'center',
    lineHeight: 22,
  },
  generateButton: {
    backgroundColor: Colors.light.primary,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  generateButtonDisabled: {
    opacity: 0.7,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  generateButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  featuresSection: {
    paddingHorizontal: 20,
  },
  featuresTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.light.text,
    marginBottom: 16,
    textAlign: 'center',
  },
  featuresList: {
    gap: 16,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.gray[50],
    padding: 16,
    borderRadius: 12,
  },
  featureIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  featureText: {
    flex: 1,
    fontSize: 16,
    color: Colors.light.text,
    fontWeight: '500',
  },
  bottomSpacing: {
    height: 40,
  },
  targetsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  targetsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.light.text,
  },
  editTargetsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: Colors.light.primary + '10',
  },
  editTargetsText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.light.primary,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: Colors.light.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 20,
    paddingBottom: 40,
    paddingHorizontal: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.light.text,
  },
  modalInputGroup: {
    marginBottom: 20,
  },
  modalLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.light.text,
    marginBottom: 8,
  },
  modalInput: {
    borderWidth: 1,
    borderColor: Colors.light.gray[300],
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: Colors.light.background,
  },
  modalSaveButton: {
    backgroundColor: Colors.light.primary,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
  },
  modalSaveButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  modalHint: {
    fontSize: 12,
    color: Colors.light.gray[500],
    marginTop: 4,
  },
  validationError: {
    backgroundColor: Colors.light.error + '10',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  validationErrorText: {
    fontSize: 14,
    color: Colors.light.error,
    textAlign: 'center',
    lineHeight: 20,
  },
});