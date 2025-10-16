export interface UserProfile {
  age: number;
  weight: number;
  height: number;
  gender: 'male' | 'female';
  activityLevel: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';
  goal: 'lose' | 'maintain' | 'gain';
  weightLossMode?: 'standard' | 'aggressive';
  bodyFatPercent?: number;
  mealsPerDay: number;
  dietaryRestrictions: string[];
  allergies: string[];
  healthConditions: string[];
  dislikedFoods: string[];
  preferredCuisines: string[];
  dietType?: 'keto' | 'low_carb' | 'low_fat' | 'high_protein' | 'balanced' | 'intermittent_fasting' | 'mediterranean' | 'paleo' | 'vegan' | 'vegetarian';
}

export interface NutritionTargets {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
}

export interface Meal {
  id: string;
  name: string;
  type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  ingredients: string[];
  instructions: string[];
  nutrition: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    fiber: number;
  };
  prepTime: number;
  servings: number;
}

export interface DailyMealPlan {
  id: string;
  date: string;
  meals: Meal[];
  totalNutrition: NutritionTargets;
}

export interface MealLog {
  id: string;
  mealId: string;
  mealName: string;
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  date: string; // YYYY-MM-DD
  timestamp: string; // ISO string
  nutrition: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    fiber: number;
  };
}

export interface DailyLog {
  date: string; // YYYY-MM-DD
  meals: MealLog[];
  totalNutrition: NutritionTargets;
}