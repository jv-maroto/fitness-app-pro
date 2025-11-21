import React, { useState, useMemo } from 'react';
import { useNutritionLogStore } from '../store/useNutritionLogStore';
import { useThemeStore } from '../store/useThemeStore';
import { MealType, Meal, FoodEntry } from '../types';
import { mealEmojis } from '../data/foodDatabase';
import { format, addDays, subDays, isSameDay, startOfDay } from 'date-fns';
import { es } from 'date-fns/locale';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  X,
  Trash2,
  Calendar,
  Flame,
} from 'lucide-react';
import { AddFoodModal } from './AddFoodModal';

// Anillos estilo Apple Watch mejorados con diseño liquid glass
const AppleRings: React.FC<{
  calories: { value: number; target: number };
  protein: { value: number; target: number };
  carbs: { value: number; target: number };
  fat: { value: number; target: number };
}> = ({ calories, protein, carbs, fat }) => {
  const { theme } = useThemeStore();

  const rings = [
    { ...calories, color: '#FF2D55', bgColor: 'rgba(255,45,85,0.15)', label: 'kcal' },
    { ...protein, color: '#30D158', bgColor: 'rgba(48,209,88,0.15)', label: 'Prot' },
    { ...carbs, color: '#5AC8FA', bgColor: 'rgba(90,200,250,0.15)', label: 'Carbs' },
    { ...fat, color: '#FF9500', bgColor: 'rgba(255,149,0,0.15)', label: 'Grasas' },
  ];

  const size = 150;
  const strokeWidth = 12;
  const gap = 3;

  const caloriesRemaining = calories.target - calories.value;
  const isOver = caloriesRemaining < 0;

  return (
    <div className="flex items-center gap-4">
      {/* Anillos */}
      <div className="relative flex-shrink-0" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="transform -rotate-90">
          {rings.map((ring, index) => {
            const radius = (size / 2) - (strokeWidth / 2) - (index * (strokeWidth + gap));
            const circumference = 2 * Math.PI * radius;
            const percentage = Math.min((ring.value / ring.target) * 100, 100);
            const strokeDashoffset = circumference - (percentage / 100) * circumference;
            const ringIsOver = ring.value > ring.target;

            return (
              <g key={ring.label}>
                <circle
                  cx={size / 2}
                  cy={size / 2}
                  r={radius}
                  fill="none"
                  stroke={theme === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}
                  strokeWidth={strokeWidth}
                />
                <circle
                  cx={size / 2}
                  cy={size / 2}
                  r={radius}
                  fill="none"
                  stroke={ringIsOver ? '#FF3B30' : ring.color}
                  strokeWidth={strokeWidth}
                  strokeLinecap="round"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  className="transition-all duration-700 ease-out"
                  style={{ filter: `drop-shadow(0 0 8px ${ringIsOver ? '#FF3B30' : ring.color}50)` }}
                />
              </g>
            );
          })}
        </svg>
        {/* Centro con icono */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
            theme === 'dark' ? 'bg-slate-800/80' : 'bg-white/80'
          } backdrop-blur-sm`}>
            <Flame className={`w-7 h-7 ${isOver ? 'text-red-500' : 'text-orange-500'}`} />
          </div>
        </div>
      </div>

      {/* Stats en columna - más compacto */}
      <div className="flex-1 space-y-0.5">
        {rings.map((ring) => {
          const ringIsOver = ring.value > ring.target;
          return (
            <div key={ring.label} className="flex items-center justify-between gap-1">
              <span className="text-xs font-bold" style={{ color: ringIsOver ? '#FF3B30' : ring.color }}>
                {Math.round(ring.value)}
              </span>
              <span className="text-[9px] text-theme-muted">/ {ring.target} {ring.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// Selector de días estilo Apple con animaciones
const DaySelector: React.FC<{
  selectedDate: Date;
  onDateChange: (date: Date) => void;
  isToday: boolean;
}> = ({ selectedDate, onDateChange, isToday }) => {
  const { theme } = useThemeStore();
  const days = useMemo(() => {
    const result = [];
    for (let i = -3; i <= 3; i++) result.push(addDays(selectedDate, i));
    return result;
  }, [selectedDate]);

  return (
    <div className="flex items-center justify-center gap-1">
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => onDateChange(subDays(selectedDate, 1))}
        className="p-1.5 rounded-full hover:bg-white/10"
      >
        <ChevronLeft className="w-4 h-4 text-theme-muted" />
      </motion.button>

      <div className="flex items-center gap-0.5">
        {days.map((day, idx) => {
          const isSelected = isSameDay(day, selectedDate);
          const isDayToday = isSameDay(day, new Date());
          const isFuture = day > new Date();
          return (
            <motion.button
              key={day.toISOString()}
              onClick={() => !isFuture && onDateChange(startOfDay(day))}
              disabled={isFuture}
              whileHover={!isFuture ? { scale: 1.05 } : {}}
              whileTap={!isFuture ? { scale: 0.95 } : {}}
              className={`relative flex flex-col items-center px-2 py-1 rounded-xl min-w-[36px] transition-colors ${
                isFuture ? 'opacity-30' : ''
              }`}
            >
              {isSelected && (
                <motion.div
                  layoutId="daySelector"
                  className="absolute inset-0 bg-gradient-to-b from-blue-500 to-blue-600 rounded-xl shadow-lg shadow-blue-500/30"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.4 }}
                />
              )}
              <span className={`relative text-[8px] uppercase font-medium ${isSelected ? 'text-white/80' : 'text-theme-muted'}`}>
                {format(day, 'EEE', { locale: es }).slice(0, 2)}
              </span>
              <span className={`relative text-sm font-bold ${
                isSelected ? 'text-white' : isDayToday ? 'text-blue-500' : 'text-theme-primary'
              }`}>
                {format(day, 'd')}
              </span>
            </motion.button>
          );
        })}
      </div>

      <motion.button
        whileHover={!isToday ? { scale: 1.1 } : {}}
        whileTap={!isToday ? { scale: 0.9 } : {}}
        onClick={() => !isToday && onDateChange(addDays(selectedDate, 1))}
        disabled={isToday}
        className={`p-1.5 rounded-full ${isToday ? 'opacity-30' : 'hover:bg-white/10'}`}
      >
        <ChevronRight className="w-4 h-4 text-theme-muted" />
      </motion.button>
    </div>
  );
};

// Card resumen compacto
const SummaryCard: React.FC<{
  dayLog: any;
  goals: any;
}> = ({ dayLog, goals }) => {
  const { theme } = useThemeStore();
  const caloriesRemaining = dayLog ? goals.calories - dayLog.totalCalories : goals.calories;
  const isOver = caloriesRemaining < 0;

  if (!dayLog) {
    return (
      <div className={`liquid-glass-card p-4 ${theme === 'dark' ? 'liquid-glass-dark' : 'liquid-glass-light'}`}>
        <div className="text-center py-4">
          <Calendar className="w-10 h-10 mx-auto mb-2 text-theme-muted opacity-30" />
          <p className="text-sm text-theme-muted">Sin registros</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-2">
      {/* Anillos centrados */}
      <AppleRings
        calories={{ value: dayLog.totalCalories, target: goals.calories }}
        protein={{ value: dayLog.totalProtein, target: goals.protein }}
        carbs={{ value: dayLog.totalCarbs, target: goals.carbs }}
        fat={{ value: dayLog.totalFat, target: goals.fat }}
      />

      {/* Calorías restantes */}
      <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full ${
        isOver ? 'bg-red-500/20' : 'bg-emerald-500/20'
      }`}>
        <Flame className={`w-3 h-3 ${isOver ? 'text-red-400' : 'text-emerald-400'}`} />
        <span className={`text-xs font-bold ${isOver ? 'text-red-400' : 'text-emerald-400'}`}>
          {isOver ? `${Math.abs(caloriesRemaining)} kcal excedidas` : `${caloriesRemaining} kcal disponibles`}
        </span>
      </div>
    </div>
  );
};

// Comida compacta
const MealCard: React.FC<{
  meal: Meal;
  onAddFood: () => void;
  onRemoveFood: (foodId: string) => void;
  onFoodClick: (food: FoodEntry) => void;
}> = ({ meal, onAddFood, onRemoveFood, onFoodClick }) => {
  const { theme } = useThemeStore();
  const { getMealName } = useNutritionLogStore();
  const [expanded, setExpanded] = useState(true);
  const displayName = getMealName(meal.type);

  return (
    <div className={`liquid-glass-card p-3 ${theme === 'dark' ? 'liquid-glass-dark' : 'liquid-glass-light'}`}>
      <div className="flex items-center gap-3">
        <div className="text-xl">{mealEmojis[meal.type] || '🍽️'}</div>

        <div className="flex-1 cursor-pointer" onClick={() => setExpanded(!expanded)}>
          <h3 className="font-medium text-theme-primary text-sm">{displayName}</h3>
          <p className="text-xs text-theme-muted">
            {meal.totalCalories} kcal · {meal.totalProtein}p · {meal.totalCarbs}c · {meal.totalFat}g
          </p>
        </div>

        <button
          onClick={onAddFood}
          className="w-8 h-8 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center hover:bg-blue-500/30 transition-colors"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      <AnimatePresence>
        {expanded && meal.foods.length > 0 && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="mt-2 space-y-1 overflow-hidden"
          >
            {meal.foods.map((food) => (
              <div
                key={food.id}
                className={`flex items-center gap-2 p-2 rounded-lg ${
                  theme === 'dark' ? 'bg-white/5' : 'bg-black/5'
                }`}
              >
                {/* Imagen del alimento */}
                {food.foodItem.image ? (
                  <img
                    src={food.foodItem.image}
                    alt={food.foodItem.name}
                    className="w-10 h-10 rounded-lg object-cover flex-shrink-0"
                    onError={(e) => { e.currentTarget.style.display = 'none'; }}
                  />
                ) : (
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                    theme === 'dark' ? 'bg-white/10' : 'bg-black/10'
                  }`}>
                    <span className="text-lg">🍽️</span>
                  </div>
                )}
                <div className="flex-1 cursor-pointer min-w-0" onClick={() => onFoodClick(food)}>
                  <p className="text-sm font-medium text-theme-primary truncate">{food.foodItem.name}</p>
                  <p className="text-xs text-theme-muted">{food.grams}g · {food.calories} kcal</p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <div className="flex gap-2 text-[10px]">
                    <span className="text-green-400">{food.protein}p</span>
                    <span className="text-cyan-400">{food.carbs}c</span>
                    <span className="text-orange-400">{food.fat}g</span>
                  </div>
                  <button
                    onClick={() => onRemoveFood(food.id)}
                    className="p-1 text-red-400/60 hover:text-red-400 hover:bg-red-400/10 rounded"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Modal detalle alimento
const FoodDetailModal: React.FC<{ food: FoodEntry | null; onClose: () => void }> = ({ food, onClose }) => {
  const { theme } = useThemeStore();
  if (!food) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        className={`w-full max-w-sm rounded-2xl p-5 ${theme === 'dark' ? 'bg-slate-800/95' : 'bg-white/95'} backdrop-blur-xl`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            {food.foodItem.image ? (
              <img
                src={food.foodItem.image}
                alt={food.foodItem.name}
                className="w-14 h-14 rounded-xl object-cover"
                onError={(e) => { e.currentTarget.style.display = 'none'; }}
              />
            ) : (
              <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${
                theme === 'dark' ? 'bg-white/10' : 'bg-black/10'
              }`}>
                <span className="text-2xl">🍽️</span>
              </div>
            )}
            <div>
              <h3 className="text-lg font-bold text-theme-primary">{food.foodItem.name}</h3>
              {food.foodItem.brand && (
                <p className="text-xs text-theme-muted">{food.foodItem.brand}</p>
              )}
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/10">
            <X className="w-4 h-4 text-theme-muted" />
          </button>
        </div>
        <div className={`p-3 rounded-xl mb-3 ${theme === 'dark' ? 'bg-white/5' : 'bg-black/5'}`}>
          <p className="text-xs text-theme-muted">Cantidad</p>
          <p className="text-xl font-bold text-theme-primary">{food.grams}g</p>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div className="p-2.5 rounded-xl text-center bg-red-500/10">
            <p className="text-lg font-bold text-red-400">{food.calories}</p>
            <p className="text-[10px] text-theme-muted">kcal</p>
          </div>
          <div className="p-2.5 rounded-xl text-center bg-green-500/10">
            <p className="text-lg font-bold text-green-400">{food.protein}g</p>
            <p className="text-[10px] text-theme-muted">Proteína</p>
          </div>
          <div className="p-2.5 rounded-xl text-center bg-cyan-500/10">
            <p className="text-lg font-bold text-cyan-400">{food.carbs}g</p>
            <p className="text-[10px] text-theme-muted">Carbos</p>
          </div>
          <div className="p-2.5 rounded-xl text-center bg-orange-500/10">
            <p className="text-lg font-bold text-orange-400">{food.fat}g</p>
            <p className="text-[10px] text-theme-muted">Grasas</p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

// Componente principal
export const NutritionLog: React.FC = () => {
  const { theme } = useThemeStore();
  const { logs, goals, createOrGetTodayLog, getLogByDate, addFoodToMeal, removeFoodFromMeal } = useNutritionLogStore();
  const [selectedDate, setSelectedDate] = useState(startOfDay(new Date()));
  const [selectedMealType, setSelectedMealType] = useState<MealType | null>(null);
  const [showAddFood, setShowAddFood] = useState(false);
  const [selectedFood, setSelectedFood] = useState<FoodEntry | null>(null);

  const isToday = isSameDay(selectedDate, new Date());
  const dayLog = useMemo(() => isToday ? createOrGetTodayLog() : getLogByDate(selectedDate), [selectedDate, logs, isToday]);

  const handleAddFood = (mealType: MealType) => {
    setSelectedMealType(mealType);
    setShowAddFood(true);
  };

  const handleFoodSelected = (food: any, grams: number) => {
    if (selectedMealType) addFoodToMeal(selectedDate, selectedMealType, food, grams);
    setShowAddFood(false);
    setSelectedMealType(null);
  };

  return (
    <div className="space-y-3">
      <DaySelector selectedDate={selectedDate} onDateChange={setSelectedDate} isToday={isToday} />
      <SummaryCard dayLog={dayLog} goals={goals} />


      {dayLog && (
        <div className="space-y-2">
          <h2 className="text-sm font-semibold text-theme-primary px-1">Comidas</h2>
          {dayLog.meals.map((meal) => (
            <MealCard
              key={meal.id}
              meal={meal}
              onAddFood={() => handleAddFood(meal.type)}
              onRemoveFood={(foodId) => removeFoodFromMeal(selectedDate, meal.type, foodId)}
              onFoodClick={setSelectedFood}
            />
          ))}
          <div className="flex gap-2">
            {!dayLog.meals.some((m) => m.type === 'pre_workout') && (
              <button
                onClick={() => handleAddFood('pre_workout')}
                className={`flex-1 p-2.5 rounded-xl border border-dashed text-xs font-medium ${
                  theme === 'dark' ? 'border-slate-600 text-slate-400' : 'border-slate-300 text-slate-500'
                }`}
              >
                + Pre-entreno
              </button>
            )}
            {!dayLog.meals.some((m) => m.type === 'post_workout') && (
              <button
                onClick={() => handleAddFood('post_workout')}
                className={`flex-1 p-2.5 rounded-xl border border-dashed text-xs font-medium ${
                  theme === 'dark' ? 'border-slate-600 text-slate-400' : 'border-slate-300 text-slate-500'
                }`}
              >
                + Post-entreno
              </button>
            )}
          </div>
        </div>
      )}

      {showAddFood && (
        <AddFoodModal
          onClose={() => { setShowAddFood(false); setSelectedMealType(null); }}
          onSelect={handleFoodSelected}
          mealType={selectedMealType}
        />
      )}
      <AnimatePresence>
        {selectedFood && <FoodDetailModal food={selectedFood} onClose={() => setSelectedFood(null)} />}
      </AnimatePresence>
    </div>
  );
};
