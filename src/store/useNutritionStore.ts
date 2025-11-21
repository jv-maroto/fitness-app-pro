import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { NutritionEvaluation, SkinFolds } from '../types';
import { v4 as uuidv4 } from '../utils/uuid';
import {
  calculateBodyFat,
  calculateTDEE,
  calculateMacros,
  calculateRealTDEE,
} from '../utils/nutrition';

interface NutritionStore {
  evaluation: NutritionEvaluation | null;
  calculatedData: {
    bodyFatPercentage: number;
    leanMass: number;
    fatMass: number;
    bmr: number;
    tdee: number;
    tdeeBreakdown: { bmr: number; neat: number; weights: number; cardio: number };
    realTdee?: number;
    macros: {
      bulk: { calories: number; protein: number; carbs: number; fat: number };
      cut: { calories: number; protein: number; carbs: number; fat: number };
      maintenance: { calories: number; protein: number; carbs: number; fat: number };
    };
  } | null;

  // Actions
  createEvaluation: (data: Omit<NutritionEvaluation, 'id' | 'createdAt' | 'updatedAt' | 'bodyFatPercentage' | 'leanMass' | 'fatMass' | 'bmr' | 'tdee'>) => void;
  updateEvaluation: (data: Partial<NutritionEvaluation>) => void;
  updateSkinFolds: (skinFolds: SkinFolds) => void;
  clearEvaluation: () => void;
  recalculate: () => void;
}

export const useNutritionStore = create<NutritionStore>()(
  persist(
    (set, get) => ({
      evaluation: null,
      calculatedData: null,

      createEvaluation: (data) => {
        const evaluation: NutritionEvaluation = {
          ...data,
          id: uuidv4(),
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        // Calcular composición corporal
        const bodyFatPercentage = calculateBodyFat(
          evaluation.skinFolds,
          evaluation.age,
          evaluation.gender
        );
        const fatMass = (evaluation.weight * bodyFatPercentage) / 100;
        const leanMass = evaluation.weight - fatMass;

        // Calcular TDEE
        const { bmr, tdee, breakdown } = calculateTDEE({
          weight: evaluation.weight,
          height: evaluation.height,
          age: evaluation.age,
          gender: evaluation.gender,
          dailyActivity: evaluation.dailyActivity,
          trainingDaysPerWeek: evaluation.trainingDaysPerWeek,
          hoursPerSession: evaluation.hoursPerSession,
          doesCardio: evaluation.doesCardio,
          cardioDaysPerWeek: evaluation.currentCardio?.daysPerWeek,
          cardioMinutesPerSession: evaluation.currentCardio?.minutesPerSession,
          cardioType: evaluation.currentCardio?.type,
          cardioIntensity: evaluation.currentCardio?.intensity,
          leanMass,
        });

        // TDEE real si está en bulk activo
        let realTdee: number | undefined;
        if (evaluation.activeBulk?.isCurrentlyDoing && evaluation.activeBulk.currentCalories && evaluation.activeBulk.weeklyGain) {
          realTdee = calculateRealTDEE(
            evaluation.activeBulk.currentCalories,
            evaluation.activeBulk.weeklyGain
          );
        }

        // Usar TDEE real si existe, sino el calculado
        const effectiveTdee = realTdee || tdee;

        // Calcular macros para cada objetivo
        const macros = {
          bulk: calculateMacros(effectiveTdee, evaluation.weight, 'bulk'),
          cut: calculateMacros(effectiveTdee, evaluation.weight, 'cut'),
          maintenance: calculateMacros(effectiveTdee, evaluation.weight, 'maintenance'),
        };

        set({
          evaluation: {
            ...evaluation,
            bodyFatPercentage,
            leanMass,
            fatMass,
            bmr,
            tdee,
          },
          calculatedData: {
            bodyFatPercentage,
            leanMass,
            fatMass,
            bmr,
            tdee,
            tdeeBreakdown: breakdown,
            realTdee,
            macros,
          },
        });
      },

      updateEvaluation: (data) => {
        set((state) => {
          if (!state.evaluation) return state;
          return {
            evaluation: {
              ...state.evaluation,
              ...data,
              updatedAt: new Date(),
            },
          };
        });
        get().recalculate();
      },

      updateSkinFolds: (skinFolds) => {
        set((state) => {
          if (!state.evaluation) return state;
          return {
            evaluation: {
              ...state.evaluation,
              skinFolds,
              updatedAt: new Date(),
            },
          };
        });
        get().recalculate();
      },

      clearEvaluation: () => set({ evaluation: null, calculatedData: null }),

      recalculate: () => {
        const { evaluation } = get();
        if (!evaluation) return;

        const bodyFatPercentage = calculateBodyFat(
          evaluation.skinFolds,
          evaluation.age,
          evaluation.gender
        );
        const fatMass = (evaluation.weight * bodyFatPercentage) / 100;
        const leanMass = evaluation.weight - fatMass;

        const { bmr, tdee, breakdown } = calculateTDEE({
          weight: evaluation.weight,
          height: evaluation.height,
          age: evaluation.age,
          gender: evaluation.gender,
          dailyActivity: evaluation.dailyActivity,
          trainingDaysPerWeek: evaluation.trainingDaysPerWeek,
          hoursPerSession: evaluation.hoursPerSession,
          doesCardio: evaluation.doesCardio,
          cardioDaysPerWeek: evaluation.currentCardio?.daysPerWeek,
          cardioMinutesPerSession: evaluation.currentCardio?.minutesPerSession,
          cardioType: evaluation.currentCardio?.type,
          cardioIntensity: evaluation.currentCardio?.intensity,
          leanMass,
        });

        let realTdee: number | undefined;
        if (evaluation.activeBulk?.isCurrentlyDoing && evaluation.activeBulk.currentCalories && evaluation.activeBulk.weeklyGain) {
          realTdee = calculateRealTDEE(
            evaluation.activeBulk.currentCalories,
            evaluation.activeBulk.weeklyGain
          );
        }

        const effectiveTdee = realTdee || tdee;
        const macros = {
          bulk: calculateMacros(effectiveTdee, evaluation.weight, 'bulk'),
          cut: calculateMacros(effectiveTdee, evaluation.weight, 'cut'),
          maintenance: calculateMacros(effectiveTdee, evaluation.weight, 'maintenance'),
        };

        set({
          evaluation: {
            ...evaluation,
            bodyFatPercentage,
            leanMass,
            fatMass,
            bmr,
            tdee,
          },
          calculatedData: {
            bodyFatPercentage,
            leanMass,
            fatMass,
            bmr,
            tdee,
            tdeeBreakdown: breakdown,
            realTdee,
            macros,
          },
        });
      },
    }),
    {
      name: 'nutrition-evaluation-storage',
      version: 1,
    }
  )
);
