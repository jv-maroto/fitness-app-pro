import { WeightEntry } from '../types';

/**
 * Detecta automáticamente posibles cheat meals o retenciones
 * basándose en patrones de peso anormales
 */
export function detectAnomalies(
  entries: WeightEntry[]
): {
  possibleCheatMeals: string[];
  possibleRetentions: string[];
} {
  if (entries.length < 3) {
    return { possibleCheatMeals: [], possibleRetentions: [] };
  }

  const sortedEntries = [...entries].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  const possibleCheatMeals: string[] = [];
  const possibleRetentions: string[] = [];

  for (let i = 1; i < sortedEntries.length - 1; i++) {
    const prev = sortedEntries[i - 1];
    const current = sortedEntries[i];
    const next = sortedEntries[i + 1];

    // Ya marcados manualmente
    if (current.isCheatMeal || current.isRetention) continue;

    // Detectar pico anormal (subida brusca seguida de bajada)
    const increaseFromPrev = current.weight - prev.weight;
    const decreaseToNext = next.weight - current.weight;

    // Posible cheat meal: subida >0.8kg y luego baja >0.5kg
    if (increaseFromPrev > 0.8 && decreaseToNext < -0.5) {
      possibleCheatMeals.push(current.id);
    }

    // Posible retención: subida >1kg en un día
    if (increaseFromPrev > 1.0) {
      possibleRetentions.push(current.id);
    }
  }

  return { possibleCheatMeals, possibleRetentions };
}

/**
 * Calcula la media móvil excluyendo automáticamente outliers extremos
 */
export function calculateRobustMovingAverage(
  entries: WeightEntry[],
  window: number
): number {
  if (entries.length === 0) return 0;

  // Filtrar entradas válidas
  const validEntries = entries.filter(e => !e.isCheatMeal && !e.isRetention);

  if (validEntries.length === 0) return 0;

  const recentEntries = validEntries.slice(-window);

  if (recentEntries.length === 0) return 0;

  // Calcular media y desviación estándar
  const weights = recentEntries.map(e => e.weight);
  const mean = weights.reduce((sum, w) => sum + w, 0) / weights.length;

  const variance =
    weights.reduce((sum, w) => sum + Math.pow(w - mean, 2), 0) / weights.length;
  const stdDev = Math.sqrt(variance);

  // Excluir outliers (>2 desviaciones estándar)
  const filteredWeights = weights.filter(
    w => Math.abs(w - mean) <= 2 * stdDev
  );

  if (filteredWeights.length === 0) return mean;

  return filteredWeights.reduce((sum, w) => sum + w, 0) / filteredWeights.length;
}
