export interface WeightEntry {
  id: string;
  date: Date;
  weight: number;
  isCheatMeal: boolean;
  isRetention: boolean;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export type GoalType = 'bulk' | 'cut' | 'maintenance';

export interface UserProfile {
  id: string;
  name: string;
  goalType: GoalType;
  targetWeight?: number;
  startWeight: number;
  startDate: Date;
  currentWeight: number;
  height?: number; // cm
  age?: number;
  gender?: 'male' | 'female';
  bulkDurationMonths?: number; // Duración planificada del volumen en meses
  experienceLevel?: 'beginner' | 'intermediate' | 'advanced';
  createdAt: Date;
  updatedAt: Date;
}

export interface Statistics {
  averageWeight: number;
  weightChange: number;
  weeklyAverageChange: number;
  monthlyAverageChange: number;
  movingAverage7: number;
  movingAverage14: number;
  movingAverage30: number;
  totalEntries: number;
  cheatMealCount: number;
  retentionCount: number;
  daysTracked: number;
  consistencyScore: number;
  projectedWeight30Days?: number;
  projectedWeightGoal?: number;
  estimatedDaysToGoal?: number;
}

export interface ChartDataPoint {
  date: string;
  weight: number;
  movingAverage7?: number;
  movingAverage14?: number;
  movingAverage30?: number;
  isCheatMeal?: boolean;
  isRetention?: boolean;
}

export interface WeeklyAnalysis {
  weekStart: Date;
  weekEnd: Date;
  averageWeight: number;
  weightChange: number;
  entries: number;
  cheatMeals: number;
  retentions: number;
}

// Evaluación Nutricional Pro
export interface SkinFolds {
  triceps: number;
  subscapular: number;
  chest: number;
  axillary: number;
  abdominal: number;
  suprailiac: number;
  thigh: number;
}

// Detalle de cardio para cada fase
export interface CardioDetail {
  type: 'walking' | 'fast_walking' | 'jogging' | 'running' | 'hiit' | 'cycling' | 'elliptical' | 'mixed';
  daysPerWeek: number;
  minutesPerSession: number;
  intensity: number; // 1-10
  description?: string; // Para "mixed" o detalles adicionales
}

// Fase de dieta/déficit
export interface DietPhase {
  phaseNumber: number;
  startDate: Date;
  endDate?: Date;
  startWeight: number;
  endWeight?: number;

  // ¿Fue al gym durante esta fase?
  wentToGym: boolean;
  gymDaysPerWeek?: number;

  // Cardio durante esta fase
  didCardio: boolean;
  cardioDetails?: CardioDetail;

  // Rebotes/recaídas
  hadRelapses: boolean;
  relapseCount?: number;
  totalWeightGainedFromRelapses?: number;
  relapseDescription?: string;

  // Notas adicionales
  notes?: string;
}

// Reverse Diet detallado
export interface ReverseDietData {
  isCurrentlyDoing: boolean;
  startDate?: Date;
  weeksElapsed?: number;
  startCalories?: number;
  currentCalories?: number;
  weeklyIncrement?: number;
  targetCalories?: number;
  estimatedDurationWeeks?: number;
  startWeight?: number;
  currentWeight?: number;
  notes?: string;
}

// Bulk activo detallado
export interface ActiveBulkData {
  isCurrentlyDoing: boolean;
  currentCalories?: number;
  weeklyGain?: number;
  weeksInBulk?: number;
}

export interface NutritionEvaluation {
  id: string;

  // === PASO 1: Datos básicos ===
  age: number;
  gender: 'male' | 'female';
  height: number;
  weight: number;
  gymStartDate: Date; // ¿Cuándo empezaste en el gym?

  // === PASO 2: Pliegues cutáneos (7-site Jackson-Pollock) ===
  skinFolds: SkinFolds;

  // === PASO 3: Historial de peso ===
  hasLostWeightRecently: boolean; // ¿Has bajado de peso recientemente (últimos 12 meses)?
  dietPhasesCount: number; // ¿En cuántas fases bajaste? (1 = continua, 2+ = con breaks)
  dietPhases: DietPhase[];

  // === PASO 4: Reverse Diet ===
  reverseDiet: ReverseDietData;

  // === PASO 5: Bulk/Volumen activo ===
  activeBulk: ActiveBulkData;

  // === PASO 6: Actividad física actual ===
  trainingDaysPerWeek: number;
  hoursPerSession: number;
  doesCardio: boolean;
  currentCardio?: CardioDetail;
  dailyActivity: 'sedentary' | 'light' | 'moderate' | 'active';

  // === Composición corporal calculada ===
  bodyFatPercentage?: number;
  leanMass?: number;
  fatMass?: number;

  // === Metabolismo calculado ===
  bmr?: number;
  tdee?: number;

  // === Estado actual ===
  currentPhase: 'bulk' | 'cut' | 'maintenance' | 'reverse';

  createdAt: Date;
  updatedAt: Date;
}

// ==========================================
// NUTRICIÓN - REGISTRO DIARIO DE CALORÍAS
// ==========================================

// Base de datos de alimentos
export interface FoodItem {
  id: string;
  name: string;
  brand?: string;
  category: 'protein' | 'carbs' | 'fats' | 'dairy' | 'fruits' | 'vegetables' | 'drinks' | 'snacks' | 'other';
  // Por 100g
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber?: number;
  sugar?: number;
  sodium?: number;
  isCustom?: boolean;
  image?: string; // URL de imagen del producto
  barcode?: string; // Código de barras para Open Food Facts
}

// Alimento añadido a una comida
export interface FoodEntry {
  id: string;
  foodItem: FoodItem;
  grams: number;
  // Calculados
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

// Tipo de comida
export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snacks' | 'pre_workout' | 'post_workout';

// Comida del día
export interface Meal {
  id: string;
  type: MealType;
  name: string;
  time?: string;
  foods: FoodEntry[];
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
}

// Registro diario completo
export interface DailyLog {
  id: string;
  date: Date;
  meals: Meal[];
  targetCalories: number;
  targetProtein: number;
  targetCarbs: number;
  targetFat: number;
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
  waterGlasses: number;
  waterTarget: number;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Configuración de objetivos nutricionales
export interface NutritionGoals {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  water: number;
  source: 'manual' | 'evaluation';
}
