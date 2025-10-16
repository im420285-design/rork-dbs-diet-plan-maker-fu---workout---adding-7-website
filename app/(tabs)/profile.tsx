import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Image
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { 
  User, 
  Settings, 
  Activity, 
  Target, 
  Edit3,
  Trash2,
  Info,
  LogOut
} from 'lucide-react-native';
import { useNutritionStore } from '@/providers/nutrition-provider';
import { useStorage } from '@/providers/storage';
import { useAuth } from '@/providers/auth-provider';
import UserProfileForm from '@/components/UserProfileForm';
import Colors from '@/constants/colors';

export default function ProfileScreen() {
  const { userProfile, nutritionTargets, setUserProfile, setCurrentMealPlan } = useNutritionStore();
  const { signOut, currentUser } = useAuth();
  const { removeItem } = useStorage();
  const [isEditing, setIsEditing] = useState(false);
  const insets = useSafeAreaInsets();

  const activityLevelLabels: Record<string, string> = {
    sedentary: 'قليل الحركة (مكتبي)',
    light: 'نشاط خفيف (1-3 أيام/أسبوع)',
    moderate: 'نشاط متوسط (3-5 أيام/أسبوع)',
    active: 'نشاط عالي (6-7 أيام/أسبوع)',
    very_active: 'نشاط عالي جداً (رياضي)'
  };

  const goalLabels: Record<string, string> = {
    lose: 'فقدان الوزن',
    maintain: 'الحفاظ على الوزن',
    gain: 'زيادة الوزن'
  };

  const handleResetProfile = () => {
    Alert.alert(
      'إعادة تعيين الملف الشخصي',
      'هل أنت متأكد؟ سيتم حذف جميع بياناتك وخطط الوجبات.',
      [
        { text: 'إلغاء', style: 'cancel' },
        {
          text: 'نعم، احذف',
          style: 'destructive',
          onPress: async () => {
            try {
              await removeItem('userProfile');
              setUserProfile(null);
              setCurrentMealPlan(null);
              Alert.alert('تم', 'تم حذف الملف الشخصي بنجاح');
            } catch {
              Alert.alert('خطأ', 'فشل في حذف الملف الشخصي');
            }
          }
        }
      ]
    );
  };

  const handleSignOut = () => {
    Alert.alert(
      'تسجيل الخروج',
      'هل أنت متأكد من تسجيل الخروج؟',
      [
        { text: 'إلغاء', style: 'cancel' },
        {
          text: 'نعم',
          style: 'destructive',
          onPress: signOut
        }
      ]
    );
  };

  if (isEditing) {
    return (
      <View style={styles.container}>
        <UserProfileForm 
          initialData={userProfile}
          onComplete={() => setIsEditing(false)} 
        />
      </View>
    );
  }

  if (!userProfile) {
    return (
      <View style={styles.container}>
        <View style={styles.emptyState}>
          <User size={64} color={Colors.light.gray[400]} />
          <Text style={styles.emptyTitle}>لا يوجد ملف شخصي</Text>
          <Text style={styles.emptySubtitle}>
            اذهب إلى الصفحة الرئيسية لإنشاء ملفك الشخصي
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingTop: insets.top }}>
        <View style={styles.headerImageContainer}>
          <Image 
            source={{ uri: 'https://pub-e001eb4506b145aa938b5d3badbff6a5.r2.dev/attachments/jjwjhr9qk0peombqmca85' }}
            style={styles.headerImage}
            resizeMode="cover"
          />
        </View>
        
        <View style={styles.header}>
          <View style={styles.profileIcon}>
            <User size={32} color={Colors.light.primary} />
          </View>
          <Text style={styles.title}>{currentUser?.name || 'الملف الشخصي'}</Text>
          <Text style={styles.subtitle}>معلوماتك الصحية والغذائية</Text>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Info size={20} color={Colors.light.primary} />
            <Text style={styles.sectionTitle}>المعلومات الأساسية</Text>
          </View>
          
          <View style={styles.infoGrid}>
            <View style={styles.infoCard}>
              <Text style={styles.infoLabel}>العمر</Text>
              <Text style={styles.infoValue}>{userProfile.age} سنة</Text>
            </View>
            <View style={styles.infoCard}>
              <Text style={styles.infoLabel}>الوزن</Text>
              <Text style={styles.infoValue}>{userProfile.weight} كيلو</Text>
            </View>
            <View style={styles.infoCard}>
              <Text style={styles.infoLabel}>الطول</Text>
              <Text style={styles.infoValue}>{userProfile.height} سم</Text>
            </View>
            <View style={styles.infoCard}>
              <Text style={styles.infoLabel}>الجنس</Text>
              <Text style={styles.infoValue}>
                {userProfile.gender === 'male' ? 'ذكر' : 'أنثى'}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Activity size={20} color={Colors.light.primary} />
            <Text style={styles.sectionTitle}>النشاط والهدف</Text>
          </View>
          
          <View style={styles.detailCard}>
            <Text style={styles.detailLabel}>مستوى النشاط</Text>
            <Text style={styles.detailValue}>
              {activityLevelLabels[userProfile.activityLevel as keyof typeof activityLevelLabels]}
            </Text>
          </View>
          
          <View style={styles.detailCard}>
            <Text style={styles.detailLabel}>الهدف</Text>
            <Text style={styles.detailValue}>
              {goalLabels[userProfile.goal as keyof typeof goalLabels]}
            </Text>
          </View>
          
          <View style={styles.detailCard}>
            <Text style={styles.detailLabel}>عدد الوجبات اليومية</Text>
            <Text style={styles.detailValue}>
              {userProfile.mealsPerDay} وجبات
            </Text>
          </View>
        </View>

        {nutritionTargets && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Target size={20} color={Colors.light.primary} />
              <Text style={styles.sectionTitle}>الأهداف الغذائية اليومية</Text>
            </View>
            
            <View style={styles.nutritionGrid}>
              <View style={styles.nutritionCard}>
                <Text style={styles.nutritionValue}>{nutritionTargets.calories}</Text>
                <Text style={styles.nutritionLabel}>سعرة حرارية</Text>
              </View>
              <View style={styles.nutritionCard}>
                <Text style={styles.nutritionValue}>{nutritionTargets.protein}</Text>
                <Text style={styles.nutritionLabel}>جرام بروتين</Text>
              </View>
              <View style={styles.nutritionCard}>
                <Text style={styles.nutritionValue}>{nutritionTargets.carbs}</Text>
                <Text style={styles.nutritionLabel}>جرام كربوهيدرات</Text>
              </View>
              <View style={styles.nutritionCard}>
                <Text style={styles.nutritionValue}>{nutritionTargets.fat}</Text>
                <Text style={styles.nutritionLabel}>جرام دهون</Text>
              </View>
            </View>
          </View>
        )}

        {(userProfile.dietType || userProfile.dietaryRestrictions.length > 0 || userProfile.allergies.length > 0 || userProfile.healthConditions?.length > 0 || userProfile.dislikedFoods?.length > 0 || userProfile.preferredCuisines?.length > 0) && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Settings size={20} color={Colors.light.primary} />
              <Text style={styles.sectionTitle}>التفضيلات الغذائية</Text>
            </View>
            
            {userProfile.dietType && (
              <View style={styles.detailCard}>
                <Text style={styles.detailLabel}>نوع الدايت</Text>
                <Text style={styles.detailValue}>
                  {userProfile.dietType === 'balanced' && 'دايت عادي متوازن'}
                  {userProfile.dietType === 'keto' && 'كيتو (منخفض الكربوهيدرات)'}
                  {userProfile.dietType === 'low_carb' && 'منخفض الكربوهيدرات'}
                  {userProfile.dietType === 'intermittent_fasting' && 'صيام متقطع'}
                  {userProfile.dietType === 'high_protein' && 'عالي البروتين'}
                  {userProfile.dietType === 'vegan' && 'نباتي صرف (فيجان)'}
                  {userProfile.dietType === 'paleo' && 'باليو'}
                  {userProfile.dietType === 'mediterranean' && 'البحر الأبيض المتوسط'}
                </Text>
              </View>
            )}
            
            {userProfile.healthConditions?.length > 0 && (
              <View style={styles.detailCard}>
                <Text style={styles.detailLabel}>الحالات الصحية</Text>
                <Text style={styles.detailValue}>
                  {userProfile.healthConditions.join(', ')}
                </Text>
              </View>
            )}
            
            {userProfile.dietaryRestrictions.length > 0 && (
              <View style={styles.detailCard}>
                <Text style={styles.detailLabel}>القيود الغذائية</Text>
                <Text style={styles.detailValue}>
                  {userProfile.dietaryRestrictions.join(', ')}
                </Text>
              </View>
            )}
            
            {userProfile.allergies.length > 0 && (
              <View style={styles.detailCard}>
                <Text style={styles.detailLabel}>الحساسية</Text>
                <Text style={styles.detailValue}>
                  {userProfile.allergies.join(', ')}
                </Text>
              </View>
            )}
            
            {userProfile.dislikedFoods?.length > 0 && (
              <View style={styles.detailCard}>
                <Text style={styles.detailLabel}>أطعمة غير مرغوبة</Text>
                <Text style={styles.detailValue}>
                  {userProfile.dislikedFoods.join(', ')}
                </Text>
              </View>
            )}
            
            {userProfile.preferredCuisines?.length > 0 && (
              <View style={styles.detailCard}>
                <Text style={styles.detailLabel}>المطابخ المفضلة</Text>
                <Text style={styles.detailValue}>
                  {userProfile.preferredCuisines.join(', ')}
                </Text>
              </View>
            )}
          </View>
        )}

        <View style={styles.actionsSection}>
          <TouchableOpacity 
            style={styles.editButton}
            onPress={() => setIsEditing(true)}
          >
            <Edit3 size={20} color={Colors.light.primary} />
            <Text style={styles.editButtonText}>تعديل الملف الشخصي</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.resetButton} onPress={handleResetProfile}>
            <Trash2 size={20} color={Colors.light.error} />
            <Text style={styles.resetButtonText}>إعادة تعيين الملف</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
            <LogOut size={20} color={Colors.light.gray[600]} />
            <Text style={styles.signOutButtonText}>تسجيل الخروج</Text>
          </TouchableOpacity>
        </View>

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
  headerImageContainer: {
    width: '100%',
    height: 200,
    backgroundColor: Colors.light.gray[100],
  },
  headerImage: {
    width: '100%',
    height: '100%',
  },
  header: {
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 30,
  },
  profileIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.light.primary + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.light.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.light.gray[500],
    textAlign: 'center',
  },
  section: {
    marginHorizontal: 20,
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.light.text,
    marginLeft: 8,
  },
  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  infoCard: {
    width: '48%',
    backgroundColor: Colors.light.gray[50],
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  infoLabel: {
    fontSize: 12,
    color: Colors.light.gray[500],
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.light.text,
  },
  detailCard: {
    backgroundColor: Colors.light.gray[50],
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  detailLabel: {
    fontSize: 14,
    color: Colors.light.gray[500],
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 16,
    color: Colors.light.text,
    fontWeight: '500',
  },
  nutritionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  nutritionCard: {
    width: '48%',
    backgroundColor: Colors.light.primary + '10',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  nutritionValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.light.primary,
    marginBottom: 4,
  },
  nutritionLabel: {
    fontSize: 12,
    color: Colors.light.primary,
    textAlign: 'center',
  },
  actionsSection: {
    paddingHorizontal: 20,
    gap: 12,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.light.primary + '10',
    paddingVertical: 16,
    borderRadius: 12,
  },
  editButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.primary,
  },
  resetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.light.error + '10',
    paddingVertical: 16,
    borderRadius: 12,
  },
  resetButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.error,
  },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.light.gray[100],
    paddingVertical: 16,
    borderRadius: 12,
  },
  signOutButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.gray[600],
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