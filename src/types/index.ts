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
