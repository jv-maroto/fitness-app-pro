import { SkinFolds } from '../types';

// Cálculo de % grasa corporal usando Jackson-Pollock 7-site
export function calculateBodyFat(
  skinFolds: SkinFolds,
  age: number,
  gender: 'male' | 'female'
): number {
  const sum =
    skinFolds.triceps +
    skinFolds.subscapular +
    skinFolds.chest +
    skinFolds.axillary +
    skinFolds.abdominal +
    skinFolds.suprailiac +
    skinFolds.thigh;

  let bodyDensity: number;

  if (gender === 'male') {
    bodyDensity = 1.112 -
      (0.00043499 * sum) +
      (0.00000055 * sum * sum) -
      (0.00028826 * age);
  } else {
    bodyDensity = 1.097 -
      (0.00046971 * sum) +
      (0.00000056 * sum * sum) -
      (0.00012828 * age);
  }

  // Fórmula de Siri
  const bodyFatPercentage = ((4.95 / bodyDensity) - 4.5) * 100;
  return Math.max(0, Math.min(bodyFatPercentage, 50));
}

// BMR usando Mifflin-St Jeor (más precisa)
export function calculateBMR(
  weight: number,
  height: number,
  age: number,
  gender: 'male' | 'female'
): number {
  if (gender === 'male') {
    return (10 * weight) + (6.25 * height) - (5 * age) + 5;
  } else {
    return (10 * weight) + (6.25 * height) - (5 * age) - 161;
  }
}

// BMR usando Katch-McArdle (si se conoce masa magra)
export function calculateBMRKatchMcArdle(leanMass: number): number {
  return 370 + (21.6 * leanMass);
}

// Factor de actividad diaria
export function getActivityMultiplier(
  dailyActivity: 'sedentary' | 'light' | 'moderate' | 'active'
): number {
  const multipliers = {
    sedentary: 1.2,
    light: 1.375,
    moderate: 1.55,
    active: 1.725,
  };
  return multipliers[dailyActivity];
}

// Calorías quemadas por entrenamiento con pesas
export function calculateWeightTrainingCalories(
  weight: number,
  hoursPerSession: number,
  daysPerWeek: number
): number {
  // ~5-6 METs promedio para entrenamiento de fuerza moderado-intenso
  const mets = 5.5;
  const caloriesPerSession = mets * weight * hoursPerSession;
  return (caloriesPerSession * daysPerWeek) / 7; // Promedio diario
}

// Calorías quemadas por cardio
export function calculateCardioCalories(
  weight: number,
  cardioType: 'walking' | 'fast_walking' | 'jogging' | 'running' | 'hiit' | 'cycling' | 'elliptical' | 'mixed',
  minutesPerSession: number,
  daysPerWeek: number,
  intensity: number = 5
): number {
  const baseMets: Record<string, number> = {
    walking: 3.5,
    fast_walking: 4.5,
    jogging: 7.0,
    running: 9.0,
    hiit: 8.0,
    cycling: 6.0,
    elliptical: 5.0,
    mixed: 6.0,
  };

  // Ajustar METs según intensidad (1-10)
  const intensityMultiplier = 0.7 + (intensity * 0.06);
  const mets = baseMets[cardioType] * intensityMultiplier;

  const caloriesPerSession = mets * weight * (minutesPerSession / 60);
  return (caloriesPerSession * daysPerWeek) / 7; // Promedio diario
}

// TDEE completo
export function calculateTDEE(params: {
  weight: number;
  height: number;
  age: number;
  gender: 'male' | 'female';
  dailyActivity: 'sedentary' | 'light' | 'moderate' | 'active';
  trainingDaysPerWeek: number;
  hoursPerSession: number;
  doesCardio: boolean;
  cardioDaysPerWeek?: number;
  cardioMinutesPerSession?: number;
  cardioType?: 'walking' | 'fast_walking' | 'jogging' | 'running' | 'hiit' | 'cycling' | 'elliptical' | 'mixed';
  cardioIntensity?: number;
  leanMass?: number;
}): { bmr: number; tdee: number; breakdown: { bmr: number; neat: number; weights: number; cardio: number } } {
  // BMR - usar Katch-McArdle si hay masa magra, sino Mifflin-St Jeor
  const bmr = params.leanMass
    ? calculateBMRKatchMcArdle(params.leanMass)
    : calculateBMR(params.weight, params.height, params.age, params.gender);

  // NEAT (Non-Exercise Activity Thermogenesis)
  const activityMultiplier = getActivityMultiplier(params.dailyActivity);
  const neat = bmr * (activityMultiplier - 1);

  // Ejercicio con pesas
  const weightsCalories = calculateWeightTrainingCalories(
    params.weight,
    params.hoursPerSession,
    params.trainingDaysPerWeek
  );

  // Cardio
  let cardioCalories = 0;
  if (params.doesCardio && params.cardioDaysPerWeek && params.cardioMinutesPerSession && params.cardioType) {
    cardioCalories = calculateCardioCalories(
      params.weight,
      params.cardioType,
      params.cardioMinutesPerSession,
      params.cardioDaysPerWeek,
      params.cardioIntensity || 5
    );
  }

  const tdee = bmr + neat + weightsCalories + cardioCalories;

  return {
    bmr: Math.round(bmr),
    tdee: Math.round(tdee),
    breakdown: {
      bmr: Math.round(bmr),
      neat: Math.round(neat),
      weights: Math.round(weightsCalories),
      cardio: Math.round(cardioCalories),
    },
  };
}

// Calcular macros para diferentes objetivos
export function calculateMacros(
  tdee: number,
  weight: number,
  goal: 'bulk' | 'cut' | 'maintenance'
): { calories: number; protein: number; carbs: number; fat: number } {
  let calories: number;
  let proteinMultiplier: number;

  switch (goal) {
    case 'bulk':
      calories = tdee + 300; // Superávit moderado
      proteinMultiplier = 2.0; // g/kg
      break;
    case 'cut':
      calories = tdee - 400; // Déficit moderado
      proteinMultiplier = 2.4; // Mayor proteína en déficit
      break;
    default:
      calories = tdee;
      proteinMultiplier = 2.0;
  }

  const protein = Math.round(weight * proteinMultiplier);
  const proteinCalories = protein * 4;

  const fatCalories = calories * 0.25; // 25% de calorías de grasa
  const fat = Math.round(fatCalories / 9);

  const carbCalories = calories - proteinCalories - fatCalories;
  const carbs = Math.round(carbCalories / 4);

  return {
    calories: Math.round(calories),
    protein,
    carbs: Math.max(carbs, 50), // Mínimo 50g carbos
    fat,
  };
}

// Calcular TDEE real basado en datos de bulk activo
export function calculateRealTDEE(
  currentCalories: number,
  weeklyGain: number
): number {
  // 1 kg de peso = ~7700 kcal (mezcla músculo/grasa)
  const dailySurplus = (weeklyGain * 7700) / 7;
  return Math.round(currentCalories - dailySurplus);
}

// Años de entrenamiento
export function calculateTrainingYears(gymStartDate: Date): number {
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - new Date(gymStartDate).getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays / 365;
}

// Nivel de experiencia basado en años
export function getExperienceLevel(years: number): 'beginner' | 'intermediate' | 'advanced' {
  if (years < 1) return 'beginner';
  if (years < 4) return 'intermediate';
  return 'advanced';
}

// Potencial muscular natural (modelo McDonald)
export function calculateMuscularPotential(
  height: number,
  years: number
): { maxLeanMass: number; yearlyGain: number } {
  // Altura en cm a pulgadas
  const heightInches = height / 2.54;

  // Masa magra máxima natural aproximada (fórmula simplificada de McDonald)
  const maxLeanMass = (heightInches - 100) * 1.1;

  // Ganancia muscular esperada por año (McDonald)
  const yearlyGains = [10, 5, 2.5, 1.25]; // kg por año (1°, 2°, 3°, 4°+)
  const yearIndex = Math.min(Math.floor(years), 3);
  const yearlyGain = yearlyGains[yearIndex];

  return { maxLeanMass, yearlyGain };
}
