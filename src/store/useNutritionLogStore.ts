import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { DailyLog, Meal, FoodEntry, FoodItem, NutritionGoals, MealType } from '../types';
import { v4 as uuidv4 } from '../utils/uuid';
import { format, startOfDay, isSameDay } from 'date-fns';

interface NutritionLogStore {
  // Datos
  logs: DailyLog[];
  customFoods: FoodItem[];
  recentFoods: FoodItem[];
  goals: NutritionGoals;
  mealNames: Record<MealType, string>;

  // Acciones para logs
  getTodayLog: () => DailyLog | undefined;
  getLogByDate: (date: Date) => DailyLog | undefined;
  createOrGetTodayLog: () => DailyLog;

  // Acciones para comidas
  addFoodToMeal: (date: Date, mealType: MealType, food: FoodItem, grams: number) => void;
  removeFoodFromMeal: (date: Date, mealType: MealType, foodEntryId: string) => void;
  updateFoodInMeal: (date: Date, mealType: MealType, foodEntryId: string, grams: number) => void;

  // Agua
  addWater: (date: Date) => void;
  removeWater: (date: Date) => void;
  setWaterGlasses: (date: Date, glasses: number) => void;

  // Objetivos
  setGoals: (goals: NutritionGoals) => void;

  // Alimentos personalizados
  addCustomFood: (food: Omit<FoodItem, 'id' | 'isCustom'>) => void;
  removeCustomFood: (foodId: string) => void;

  // Alimentos recientes
  addToRecentFoods: (food: FoodItem) => void;

  // Notas
  setDayNotes: (date: Date, notes: string) => void;

  // Recalcular totales
  recalculateTotals: (date: Date) => void;

  // Nombres de comidas
  setMealName: (mealType: MealType, name: string) => void;
  getMealName: (mealType: MealType) => string;
}

const MEAL_NAMES: Record<MealType, string> = {
  breakfast: 'Desayuno',
  lunch: 'Almuerzo',
  dinner: 'Cena',
  snacks: 'Snacks',
  pre_workout: 'Pre-entreno',
  post_workout: 'Post-entreno',
};

const createEmptyMeal = (type: MealType): Meal => ({
  id: uuidv4(),
  type,
  name: MEAL_NAMES[type],
  foods: [],
  totalCalories: 0,
  totalProtein: 0,
  totalCarbs: 0,
  totalFat: 0,
});

const createEmptyDayLog = (date: Date, goals: NutritionGoals): DailyLog => ({
  id: uuidv4(),
  date: startOfDay(date),
  meals: [
    createEmptyMeal('breakfast'),
    createEmptyMeal('lunch'),
    createEmptyMeal('dinner'),
    createEmptyMeal('snacks'),
  ],
  targetCalories: goals.calories,
  targetProtein: goals.protein,
  targetCarbs: goals.carbs,
  targetFat: goals.fat,
  totalCalories: 0,
  totalProtein: 0,
  totalCarbs: 0,
  totalFat: 0,
  waterGlasses: 0,
  waterTarget: goals.water,
  createdAt: new Date(),
  updatedAt: new Date(),
});

const calculateFoodNutrients = (food: FoodItem, grams: number) => ({
  calories: Math.round((food.calories * grams) / 100),
  protein: Math.round((food.protein * grams) / 100 * 10) / 10,
  carbs: Math.round((food.carbs * grams) / 100 * 10) / 10,
  fat: Math.round((food.fat * grams) / 100 * 10) / 10,
});

const recalculateMeal = (meal: Meal): Meal => {
  const totals = meal.foods.reduce(
    (acc, entry) => ({
      calories: acc.calories + entry.calories,
      protein: acc.protein + entry.protein,
      carbs: acc.carbs + entry.carbs,
      fat: acc.fat + entry.fat,
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  );

  return {
    ...meal,
    totalCalories: totals.calories,
    totalProtein: Math.round(totals.protein * 10) / 10,
    totalCarbs: Math.round(totals.carbs * 10) / 10,
    totalFat: Math.round(totals.fat * 10) / 10,
  };
};

const recalculateDayTotals = (log: DailyLog): DailyLog => {
  const totals = log.meals.reduce(
    (acc, meal) => ({
      calories: acc.calories + meal.totalCalories,
      protein: acc.protein + meal.totalProtein,
      carbs: acc.carbs + meal.totalCarbs,
      fat: acc.fat + meal.totalFat,
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  );

  return {
    ...log,
    totalCalories: totals.calories,
    totalProtein: Math.round(totals.protein * 10) / 10,
    totalCarbs: Math.round(totals.carbs * 10) / 10,
    totalFat: Math.round(totals.fat * 10) / 10,
    updatedAt: new Date(),
  };
};

export const useNutritionLogStore = create<NutritionLogStore>()(
  persist(
    (set, get) => ({
      logs: [],
      customFoods: [],
      recentFoods: [],
      goals: {
        calories: 2500,
        protein: 150,
        carbs: 300,
        fat: 80,
        water: 8,
        source: 'manual',
      },
      mealNames: { ...MEAL_NAMES },

      getTodayLog: () => {
        const today = startOfDay(new Date());
        return get().logs.find((log) => isSameDay(new Date(log.date), today));
      },

      getLogByDate: (date: Date) => {
        return get().logs.find((log) => isSameDay(new Date(log.date), date));
      },

      createOrGetTodayLog: () => {
        const today = startOfDay(new Date());
        const existingLog = get().logs.find((log) => isSameDay(new Date(log.date), today));

        if (existingLog) return existingLog;

        const newLog = createEmptyDayLog(today, get().goals);
        set((state) => ({
          logs: [newLog, ...state.logs],
        }));
        return newLog;
      },

      addFoodToMeal: (date, mealType, food, grams) => {
        const nutrients = calculateFoodNutrients(food, grams);
        const newEntry: FoodEntry = {
          id: uuidv4(),
          foodItem: food,
          grams,
          ...nutrients,
        };

        set((state) => {
          let log = state.logs.find((l) => isSameDay(new Date(l.date), date));

          if (!log) {
            log = createEmptyDayLog(date, state.goals);
            state.logs = [log, ...state.logs];
          }

          const updatedLogs = state.logs.map((l) => {
            if (!isSameDay(new Date(l.date), date)) return l;

            let mealExists = l.meals.some((m) => m.type === mealType);
            let updatedMeals = l.meals;

            if (!mealExists) {
              updatedMeals = [...l.meals, createEmptyMeal(mealType)];
            }

            updatedMeals = updatedMeals.map((meal) => {
              if (meal.type !== mealType) return meal;
              const updatedMeal = {
                ...meal,
                foods: [...meal.foods, newEntry],
              };
              return recalculateMeal(updatedMeal);
            });

            return recalculateDayTotals({ ...l, meals: updatedMeals });
          });

          return { logs: updatedLogs };
        });
      },

      removeFoodFromMeal: (date, mealType, foodEntryId) => {
        set((state) => ({
          logs: state.logs.map((log) => {
            if (!isSameDay(new Date(log.date), date)) return log;

            const updatedMeals = log.meals.map((meal) => {
              if (meal.type !== mealType) return meal;
              const updatedMeal = {
                ...meal,
                foods: meal.foods.filter((f) => f.id !== foodEntryId),
              };
              return recalculateMeal(updatedMeal);
            });

            return recalculateDayTotals({ ...log, meals: updatedMeals });
          }),
        }));
      },

      updateFoodInMeal: (date, mealType, foodEntryId, grams) => {
        set((state) => ({
          logs: state.logs.map((log) => {
            if (!isSameDay(new Date(log.date), date)) return log;

            const updatedMeals = log.meals.map((meal) => {
              if (meal.type !== mealType) return meal;
              const updatedMeal = {
                ...meal,
                foods: meal.foods.map((f) => {
                  if (f.id !== foodEntryId) return f;
                  const nutrients = calculateFoodNutrients(f.foodItem, grams);
                  return { ...f, grams, ...nutrients };
                }),
              };
              return recalculateMeal(updatedMeal);
            });

            return recalculateDayTotals({ ...log, meals: updatedMeals });
          }),
        }));
      },

      addWater: (date) => {
        set((state) => {
          let log = state.logs.find((l) => isSameDay(new Date(l.date), date));
          if (!log) {
            log = createEmptyDayLog(date, state.goals);
            return { logs: [{ ...log, waterGlasses: 1 }, ...state.logs] };
          }

          return {
            logs: state.logs.map((l) =>
              isSameDay(new Date(l.date), date)
                ? { ...l, waterGlasses: l.waterGlasses + 1, updatedAt: new Date() }
                : l
            ),
          };
        });
      },

      removeWater: (date) => {
        set((state) => ({
          logs: state.logs.map((l) =>
            isSameDay(new Date(l.date), date)
              ? { ...l, waterGlasses: Math.max(0, l.waterGlasses - 1), updatedAt: new Date() }
              : l
          ),
        }));
      },

      setWaterGlasses: (date, glasses) => {
        set((state) => ({
          logs: state.logs.map((l) =>
            isSameDay(new Date(l.date), date)
              ? { ...l, waterGlasses: Math.max(0, glasses), updatedAt: new Date() }
              : l
          ),
        }));
      },

      setGoals: (goals) => {
        set({ goals });
      },

      addCustomFood: (food) => {
        const newFood: FoodItem = {
          ...food,
          id: uuidv4(),
          isCustom: true,
        };
        set((state) => ({
          customFoods: [...state.customFoods, newFood],
        }));
      },

      removeCustomFood: (foodId) => {
        set((state) => ({
          customFoods: state.customFoods.filter((f) => f.id !== foodId),
        }));
      },

      addToRecentFoods: (food) => {
        set((state) => {
          // Evitar duplicados y mantener máximo 20 recientes
          const filtered = state.recentFoods.filter((f) => f.id !== food.id);
          return {
            recentFoods: [food, ...filtered].slice(0, 20),
          };
        });
      },

      setDayNotes: (date, notes) => {
        set((state) => ({
          logs: state.logs.map((l) =>
            isSameDay(new Date(l.date), date) ? { ...l, notes, updatedAt: new Date() } : l
          ),
        }));
      },

      recalculateTotals: (date) => {
        set((state) => ({
          logs: state.logs.map((log) => {
            if (!isSameDay(new Date(log.date), date)) return log;
            const updatedMeals = log.meals.map(recalculateMeal);
            return recalculateDayTotals({ ...log, meals: updatedMeals });
          }),
        }));
      },

      setMealName: (mealType, name) => {
        set((state) => ({
          mealNames: { ...state.mealNames, [mealType]: name },
        }));
      },

      getMealName: (mealType) => {
        return get().mealNames[mealType] || MEAL_NAMES[mealType];
      },
    }),
    {
      name: 'nutrition-log-storage',
      version: 1,
    }
  )
);
