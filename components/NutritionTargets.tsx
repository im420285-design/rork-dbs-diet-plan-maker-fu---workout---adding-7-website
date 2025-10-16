import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Zap, Beef, Wheat, Droplets } from 'lucide-react-native';
import { NutritionTargets as NutritionTargetsType } from '@/types/nutrition';
import Colors from '@/constants/colors';

interface Props {
  targets: NutritionTargetsType;
}

export default function NutritionTargets({ targets }: Props) {
  const macros = [
    {
      icon: Zap,
      label: 'السعرات',
      value: targets.calories,
      unit: 'سعرة',
      color: Colors.light.primary,
    },
    {
      icon: Beef,
      label: 'البروتين',
      value: targets.protein,
      unit: 'جم',
      color: Colors.light.error,
    },
    {
      icon: Wheat,
      label: 'الكربوهيدرات',
      value: targets.carbs,
      unit: 'جم',
      color: Colors.light.warning,
    },
    {
      icon: Droplets,
      label: 'الدهون',
      value: targets.fat,
      unit: 'جم',
      color: Colors.light.secondary,
    },
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>احتياجاتك الغذائية اليومية</Text>
      
      <View style={styles.macrosGrid}>
        {macros.map((macro, index) => (
          <View key={macro.label} style={styles.macroCard}>
            <View style={[styles.iconContainer, { backgroundColor: macro.color + '20' }]}>
              <macro.icon size={24} color={macro.color} />
            </View>
            <Text style={styles.macroValue}>{macro.value}</Text>
            <Text style={styles.macroUnit}>{macro.unit}</Text>
            <Text style={styles.macroLabel}>{macro.label}</Text>
          </View>
        ))}
      </View>
      
      <View style={styles.fiberContainer}>
        <Text style={styles.fiberText}>
          الألياف المطلوبة: {targets.fiber} جرام يومياً
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.light.background,
    padding: 20,
    borderRadius: 16,
    margin: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.light.text,
    textAlign: 'center',
    marginBottom: 20,
  },
  macrosGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  macroCard: {
    width: '48%',
    backgroundColor: Colors.light.gray[50],
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  macroValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.light.text,
  },
  macroUnit: {
    fontSize: 12,
    color: Colors.light.gray[500],
    marginBottom: 4,
  },
  macroLabel: {
    fontSize: 14,
    color: Colors.light.gray[600],
    textAlign: 'center',
  },
  fiberContainer: {
    marginTop: 16,
    padding: 12,
    backgroundColor: Colors.light.success + '10',
    borderRadius: 8,
    alignItems: 'center',
  },
  fiberText: {
    fontSize: 14,
    color: Colors.light.success,
    fontWeight: '500',
  },
});