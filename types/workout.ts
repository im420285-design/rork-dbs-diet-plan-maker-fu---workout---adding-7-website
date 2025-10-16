export type FitnessLevel = 'beginner' | 'intermediate' | 'advanced';
export type WorkoutGoal = 'muscle_building' | 'fat_loss' | 'fitness_improvement' | 'strength' | 'endurance' | 'flexibility';
export type WorkoutLocation = 'home' | 'gym';
export type Equipment = 'bodyweight' | 'resistance_band' | 'dumbbells' | 'gym_equipment';
export type ExperienceDuration = 'less_than_3_months' | '3_to_6_months' | '6_to_12_months' | '1_to_2_years' | 'more_than_2_years';
export type PlanDuration = 1 | 2 | 3;
export type Injury = 
  | 'cervical_disc_herniation'
  | 'lumbar_disc_herniation'
  | 'inguinal_hernia'
  | 'umbilical_hernia'
  | 'shoulder_dislocation'
  | 'rotator_cuff_tear'
  | 'shoulder_impingement'
  | 'biceps_tendonitis'
  | 'knee_osteoarthritis'
  | 'acl_tear'
  | 'mcl_tear'
  | 'meniscus_tear'
  | 'patellar_tendonitis'
  | 'lower_back_pain'
  | 'sciatica'
  | 'spondylolisthesis'
  | 'wrist_sprain'
  | 'carpal_tunnel'
  | 'ankle_sprain'
  | 'achilles_tendonitis'
  | 'plantar_fasciitis'
  | 'tennis_elbow'
  | 'golfers_elbow'
  | 'hip_bursitis'
  | 'hip_labral_tear'
  | 'groin_strain';

export interface WorkoutInput {
  age: number;
  weight: number;
  height: number;
  experienceDuration: ExperienceDuration;
  level: FitnessLevel;
  goals: WorkoutGoal[];
  daysPerWeek: number;
  planDuration: PlanDuration;
  location: WorkoutLocation;
  equipment: Equipment[];
  injuries: Injury[];
}

export interface Exercise {
  name: string;
  nameAr: string;
  sets: number;
  reps: string;
  restTime: string;
  videoUrl: string;
  notes?: string;
  injuryWarnings?: string[];
}

export interface ExerciseSet {
  setNumber: number;
  reps: number;
  weight: number;
  completed: boolean;
}

export interface WorkoutLog {
  id: string;
  workoutPlanId: string;
  dayNumber: number;
  weekNumber: number;
  exerciseName: string;
  exerciseNameAr: string;
  sets: ExerciseSet[];
  date: Date;
  notes?: string;
  completed: boolean;
}

export interface WorkoutStats {
  totalWorkouts: number;
  totalSets: number;
  totalReps: number;
  totalWeight: number;
  completedExercises: number;
  weeklyStats: WeeklyStats[];
}

export interface WeeklyStats {
  week: number;
  completedExercises: number;
  totalExercises: number;
  completionRate: number;
}

export interface ExerciseProgress {
  exerciseName: string;
  exerciseNameAr: string;
  history: {
    date: Date;
    maxWeight: number;
    totalVolume: number;
    sets: number;
    avgReps: number;
  }[];
}

export interface WorkoutDay {
  day: number;
  week: number;
  dayName: string;
  dayNameAr: string;
  focus: string;
  focusAr: string;
  exercises: Exercise[];
  weeklyIntensity?: string;
}

export interface WorkoutPlan {
  id: string;
  userId?: string;
  input: WorkoutInput;
  plan: WorkoutDay[];
  createdAt: Date;
}