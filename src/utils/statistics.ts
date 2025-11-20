import { WeightEntry, Statistics, WeeklyAnalysis, GoalType } from '../types';
import { differenceInDays, startOfWeek, endOfWeek, eachWeekOfInterval } from 'date-fns';

export function calculateStatistics(
  entries: WeightEntry[],
  goalType: GoalType,
  targetWeight?: number
): Statistics {
  if (entries.length === 0) {
    return {
      averageWeight: 0,
      weightChange: 0,
      weeklyAverageChange: 0,
      monthlyAverageChange: 0,
      movingAverage7: 0,
      movingAverage14: 0,
      movingAverage30: 0,
      totalEntries: 0,
      cheatMealCount: 0,
      retentionCount: 0,
      daysTracked: 0,
      consistencyScore: 0,
    };
  }

  // Sort entries by date (oldest first for calculations)
  const sortedEntries = [...entries].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  const validEntries = sortedEntries.filter(e => !e.isCheatMeal && !e.isRetention);
  const firstEntry = sortedEntries[0];
  const lastEntry = sortedEntries[sortedEntries.length - 1];

  const daysTracked = differenceInDays(
    new Date(lastEntry.date),
    new Date(firstEntry.date)
  ) + 1;

  // Basic stats
  const totalWeight = validEntries.reduce((sum, e) => sum + e.weight, 0);
  const averageWeight = validEntries.length > 0 ? totalWeight / validEntries.length : 0;
  const weightChange = lastEntry.weight - firstEntry.weight;
  const cheatMealCount = entries.filter(e => e.isCheatMeal).length;
  const retentionCount = entries.filter(e => e.isRetention).length;

  // Moving averages
  const movingAverage7 = calculateMovingAverage(validEntries, 7);
  const movingAverage14 = calculateMovingAverage(validEntries, 14);
  const movingAverage30 = calculateMovingAverage(validEntries, 30);

  // Weekly and monthly average change (usando solo entradas válidas)
  const validWeightChange = validEntries.length >= 2
    ? validEntries[validEntries.length - 1].weight - validEntries[0].weight
    : 0;

  const validDaysTracked = validEntries.length >= 2
    ? differenceInDays(
        new Date(validEntries[validEntries.length - 1].date),
        new Date(validEntries[0].date)
      ) + 1
    : daysTracked;

  const weeklyAverageChange = validDaysTracked >= 7
    ? (validWeightChange / validDaysTracked) * 7
    : 0;

  const monthlyAverageChange = validDaysTracked >= 30
    ? (validWeightChange / validDaysTracked) * 30
    : 0;

  // Consistency score (0-100)
  const expectedEntries = daysTracked;
  const actualEntries = entries.length;
  const consistencyScore = Math.min(100, (actualEntries / expectedEntries) * 100);

  // Projections
  let projectedWeight30Days: number | undefined;
  let projectedWeightGoal: number | undefined;
  let estimatedDaysToGoal: number | undefined;

  if (weeklyAverageChange !== 0 && validEntries.length >= 7) {
    const dailyChange = weeklyAverageChange / 7;
    projectedWeight30Days = lastEntry.weight + (dailyChange * 30);

    if (targetWeight) {
      const weightDifference = targetWeight - lastEntry.weight;
      estimatedDaysToGoal = Math.abs(weightDifference / dailyChange);
      projectedWeightGoal = targetWeight;
    }
  }

  return {
    averageWeight,
    weightChange,
    weeklyAverageChange,
    monthlyAverageChange,
    movingAverage7,
    movingAverage14,
    movingAverage30,
    totalEntries: entries.length,
    cheatMealCount,
    retentionCount,
    daysTracked,
    consistencyScore,
    projectedWeight30Days,
    projectedWeightGoal,
    estimatedDaysToGoal,
  };
}

export function calculateMovingAverage(entries: WeightEntry[], days: number): number {
  if (entries.length === 0) return 0;

  const recentEntries = entries.slice(-days);
  const sum = recentEntries.reduce((total, entry) => total + entry.weight, 0);

  return sum / recentEntries.length;
}

export function getWeeklyAnalysis(entries: WeightEntry[]): WeeklyAnalysis[] {
  if (entries.length === 0) return [];

  const sortedEntries = [...entries].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  const firstDate = new Date(sortedEntries[0].date);
  const lastDate = new Date(sortedEntries[sortedEntries.length - 1].date);

  const weeks = eachWeekOfInterval(
    { start: firstDate, end: lastDate },
    { weekStartsOn: 1 } // Monday
  );

  return weeks.map(weekStart => {
    const weekEnd = endOfWeek(weekStart, { weekStartsOn: 1 });

    const weekEntries = sortedEntries.filter(entry => {
      const entryDate = new Date(entry.date);
      return entryDate >= weekStart && entryDate <= weekEnd;
    });

    const validEntries = weekEntries.filter(e => !e.isCheatMeal && !e.isRetention);
    const averageWeight = validEntries.length > 0
      ? validEntries.reduce((sum, e) => sum + e.weight, 0) / validEntries.length
      : 0;

    const previousWeekEntries = sortedEntries.filter(entry => {
      const entryDate = new Date(entry.date);
      return entryDate < weekStart;
    });

    const previousAverage = previousWeekEntries.length > 0
      ? previousWeekEntries.reduce((sum, e) => sum + e.weight, 0) / previousWeekEntries.length
      : averageWeight;

    const weightChange = averageWeight - previousAverage;

    return {
      weekStart,
      weekEnd,
      averageWeight,
      weightChange,
      entries: weekEntries.length,
      cheatMeals: weekEntries.filter(e => e.isCheatMeal).length,
      retentions: weekEntries.filter(e => e.isRetention).length,
    };
  });
}

export function getSmartInsights(
  entries: WeightEntry[],
  statistics: Statistics,
  goalType: GoalType
): string[] {
  const insights: string[] = [];

  // Consistency insights
  if (statistics.consistencyScore >= 90) {
    insights.push('🎯 ¡Excelente consistencia! Estás registrando tu peso casi todos los días.');
  } else if (statistics.consistencyScore < 50) {
    insights.push('⚠️ Intenta registrar tu peso más seguido para obtener datos más precisos.');
  }

  // Progress insights (mejorados con rangos correctos)
  const weeklyChange = statistics.weeklyAverageChange;
  const monthlyChange = statistics.monthlyAverageChange;

  if (goalType === 'bulk') {
    // Rangos óptimos basados en evidencia científica (Garthe et al., Helms, McDonald)
    // Valores en kg/semana para natural bodybuilding

    if (weeklyChange >= 0.1 && weeklyChange <= 0.15) {
      insights.push('🏆 PERFECTO - Volumen ultra-limpio (0.1-0.15 kg/sem). Máxima ganancia muscular, mínima grasa. Ideal para avanzados.');
    } else if (weeklyChange >= 0.15 && weeklyChange <= 0.25) {
      insights.push('✅ ÓPTIMO - Volumen limpio (0.15-0.25 kg/sem). ~70-75% músculo. Ideal para intermedios y avanzados.');
    } else if (weeklyChange >= 0.25 && weeklyChange <= 0.35) {
      insights.push('💪 MUY BUENO - Volumen moderado (0.25-0.35 kg/sem). ~65-70% músculo. Adecuado para principiantes (<1 año).');
    } else if (weeklyChange >= 0.35 && weeklyChange <= 0.5) {
      insights.push('⚡ BUENO - Volumen agresivo (0.35-0.5 kg/sem). ~60-65% músculo. Solo para principiantes totales o bulking rápido.');
    } else if (weeklyChange > 0.5 && weeklyChange <= 0.75) {
      insights.push('⚠️ RÁPIDO - Ganando ' + weeklyChange.toFixed(2) + ' kg/sem. Riesgo moderado de grasa. Considera reducir calorías ligeramente.');
    } else if (weeklyChange > 0.75) {
      insights.push('🚨 MUY RÁPIDO - Ganando ' + weeklyChange.toFixed(2) + ' kg/sem (>' + monthlyChange.toFixed(1) + ' kg/mes). Alto % de grasa. REDUCE calorías.');
    } else if (weeklyChange >= 0.05 && weeklyChange < 0.1) {
      insights.push('📊 Ganancia lenta (0.05-0.1 kg/sem). Muy conservador pero funcional. Puedes aumentar calorías si quieres más masa.');
    } else if (weeklyChange < 0.05 && weeklyChange >= 0) {
      insights.push('⚡ Ganancia mínima (<0.05 kg/sem = ~0.2 kg/mes). Aumenta calorías para mejores resultados en volumen.');
    } else {
      insights.push('⚠️ Estás PERDIENDO peso en volumen (' + weeklyChange.toFixed(2) + ' kg/sem). Aumenta calorías YA.');
    }

    // Insight adicional sobre proyección mensual y ratio músculo/grasa
    if (monthlyChange > 0) {
      const monthlyKg = monthlyChange;
      const weeklyKg = weeklyChange;

      // Estimar ratio músculo/grasa basado en rate (según estudios Garthe)
      let musclePercentage = 50;
      if (weeklyKg >= 0.1 && weeklyKg <= 0.15) musclePercentage = 85;
      else if (weeklyKg > 0.15 && weeklyKg <= 0.25) musclePercentage = 72;
      else if (weeklyKg > 0.25 && weeklyKg <= 0.35) musclePercentage = 67;
      else if (weeklyKg > 0.35 && weeklyKg <= 0.5) musclePercentage = 62;
      else if (weeklyKg > 0.5) musclePercentage = 55;

      insights.push(`📈 Proyección: ~${monthlyKg.toFixed(1)} kg/mes (${(monthlyKg * 3).toFixed(1)} kg en 3 meses). Estimado ~${musclePercentage}% músculo magro.`);
    }

  } else if (goalType === 'cut') {
    // Rangos óptimos para definición
    if (weeklyChange <= -0.5 && weeklyChange >= -1) {
      insights.push('🔥 Ritmo de pérdida IDEAL para preservar músculo (-0.5 a -1 kg/semana). ¡Perfecto!');
    } else if (weeklyChange < -1 && weeklyChange >= -1.5) {
      insights.push('⚠️ Pérdida rápida (-1 a -1.5 kg/sem). Riesgo de perder músculo. Considera aumentar calorías.');
    } else if (weeklyChange < -1.5) {
      insights.push('🚨 Pérdida MUY rápida (>' + Math.abs(weeklyChange).toFixed(1) + ' kg/sem). Alto riesgo muscular. Aumenta calorías YA.');
    } else if (weeklyChange > -0.5 && weeklyChange <= -0.25) {
      insights.push('📊 Pérdida moderada (-0.25 a -0.5 kg/sem). Ritmo seguro pero lento.');
    } else if (weeklyChange > -0.25 && weeklyChange < 0) {
      insights.push('⚡ Pérdida muy lenta (<0.25 kg/sem). Considera reducir calorías ligeramente.');
    } else {
      insights.push('⚠️ No estás perdiendo peso. Reduce calorías o aumenta actividad.');
    }
  }

  // Cheat meal insights
  const cheatMealPercentage = (statistics.cheatMealCount / statistics.totalEntries) * 100;
  if (cheatMealPercentage > 20) {
    insights.push('🍕 Alto porcentaje de cheat meals. Esto puede afectar tus promedios.');
  }

  // Retention insights
  if (statistics.retentionCount > statistics.totalEntries * 0.15) {
    insights.push('💧 Muchos registros de retención. Revisa tu consumo de sodio y agua.');
  }

  // Moving average insights
  const ma7 = statistics.movingAverage7;
  const ma30 = statistics.movingAverage30;

  if (Math.abs(ma7 - ma30) > 1) {
    const trend = ma7 > ma30 ? 'subiendo' : 'bajando';
    insights.push(`📈 Tendencia a corto plazo ${trend} respecto al promedio mensual.`);
  }

  // Goal projection
  if (statistics.estimatedDaysToGoal) {
    const days = Math.round(statistics.estimatedDaysToGoal);
    if (days <= 30) {
      insights.push(`🎯 ¡Estás cerca! Aproximadamente ${days} días para tu objetivo.`);
    } else if (days <= 90) {
      insights.push(`📅 Aproximadamente ${Math.round(days / 7)} semanas para alcanzar tu objetivo.`);
    }
  }

  return insights;
}
