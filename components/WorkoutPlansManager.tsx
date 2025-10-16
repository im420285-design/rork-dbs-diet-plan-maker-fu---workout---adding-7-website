import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { WorkoutPlan } from '@/types/workout';
import { Calendar, Trash2, CheckCircle } from 'lucide-react-native';

interface WorkoutPlansManagerProps {
  plans: WorkoutPlan[];
  currentPlanId: string | null;
  onSelectPlan: (planId: string) => void;
  onDeletePlan: (planId: string) => void;
  onClose: () => void;
}

export default function WorkoutPlansManager({
  plans,
  currentPlanId,
  onSelectPlan,
  onDeletePlan,
  onClose,
}: WorkoutPlansManagerProps) {
  const handleDelete = (planId: string) => {
    Alert.alert(
      'تأكيد الحذف',
      'هل أنت متأكد من حذف هذا البرنامج؟',
      [
        { text: 'إلغاء', style: 'cancel' },
        {
          text: 'حذف',
          style: 'destructive',
          onPress: () => onDeletePlan(planId),
        },
      ]
    );
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('ar-EG', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getPlanDurationText = (plan: WorkoutPlan) => {
    const duration = plan.input.planDuration;
    return duration === 1 ? 'شهر واحد' : `${duration} شهور`;
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <Text style={styles.closeButtonText}>إغلاق</Text>
        </TouchableOpacity>
        <Text style={styles.title}>برامج التمرين المحفوظة</Text>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {plans.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>لا توجد برامج محفوظة</Text>
          </View>
        ) : (
          plans.map((plan) => (
            <View
              key={plan.id}
              style={[
                styles.planCard,
                currentPlanId === plan.id && styles.planCardActive,
              ]}
            >
              <TouchableOpacity
                style={styles.planContent}
                onPress={() => {
                  onSelectPlan(plan.id);
                  onClose();
                }}
              >
                <View style={styles.planHeader}>
                  <View style={styles.planTitleRow}>
                    <Text style={styles.planTitle}>
                      برنامج {getPlanDurationText(plan)}
                    </Text>
                    {currentPlanId === plan.id && (
                      <View style={styles.activeBadge}>
                        <CheckCircle size={16} color="#34C759" />
                        <Text style={styles.activeBadgeText}>نشط</Text>
                      </View>
                    )}
                  </View>
                  <View style={styles.planMeta}>
                    <Calendar size={14} color="#666" />
                    <Text style={styles.planDate}>{formatDate(plan.createdAt)}</Text>
                  </View>
                </View>

                <View style={styles.planDetails}>
                  <Text style={styles.planDetailText}>
                    🎯 {plan.input.goals.length} أهداف
                  </Text>
                  <Text style={styles.planDetailText}>
                    📅 {plan.input.daysPerWeek} أيام/أسبوع
                  </Text>
                  <Text style={styles.planDetailText}>
                    💪 {plan.plan.length} يوم تمرين
                  </Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => handleDelete(plan.id)}
              >
                <Trash2 size={20} color="#FF3B30" />
              </TouchableOpacity>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'space-between' as const,
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: '#1a1a1a',
    textAlign: 'right' as const,
  },
  closeButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  closeButtonText: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '600' as const,
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center' as const,
  },
  planCard: {
    flexDirection: 'row' as const,
    backgroundColor: '#fff',
    borderRadius: 16,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: '#e0e0e0',
    overflow: 'hidden' as const,
  },
  planCardActive: {
    borderColor: '#34C759',
    backgroundColor: '#f0fff4',
  },
  planContent: {
    flex: 1,
    padding: 16,
  },
  planHeader: {
    marginBottom: 12,
  },
  planTitleRow: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'space-between' as const,
    marginBottom: 8,
  },
  planTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: '#1a1a1a',
    textAlign: 'right' as const,
  },
  activeBadge: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 4,
    backgroundColor: '#d4f4dd',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
  },
  activeBadgeText: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: '#34C759',
  },
  planMeta: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 6,
    justifyContent: 'flex-end' as const,
  },
  planDate: {
    fontSize: 13,
    color: '#666',
  },
  planDetails: {
    flexDirection: 'row' as const,
    gap: 16,
    justifyContent: 'flex-end' as const,
    flexWrap: 'wrap' as const,
  },
  planDetailText: {
    fontSize: 14,
    color: '#333',
  },
  deleteButton: {
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    paddingHorizontal: 20,
    backgroundColor: '#fff',
  },
});
