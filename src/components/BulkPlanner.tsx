import React, { useState, useMemo } from 'react';
import { useWeightStore } from '../store/useWeightStore';
import { Calendar, TrendingUp, Target, Calculator } from 'lucide-react';
import { motion } from 'framer-motion';
import { differenceInDays } from 'date-fns';

export const BulkPlanner: React.FC = () => {
  const { profile, updateProfile, entries } = useWeightStore();
  const [bulkDuration, setBulkDuration] = useState(profile?.bulkDurationMonths || 3);
  const [experienceLevel, setExperienceLevel] = useState<'beginner' | 'intermediate' | 'advanced'>(
    profile?.experienceLevel || 'intermediate'
  );

  // Rangos recomendados según nivel (basados en estudios: Garthe et al., Helms)
  // Valores en kg/semana
  const recommendedRanges = {
    beginner: { min: 0.25, max: 0.5, label: '0.25-0.5 kg/sem (1-2 kg/mes)' },
    intermediate: { min: 0.15, max: 0.35, label: '0.15-0.35 kg/sem (0.6-1.4 kg/mes)' },
    advanced: { min: 0.1, max: 0.25, label: '0.1-0.25 kg/sem (0.4-1 kg/mes)' },
  };

  const currentRange = recommendedRanges[experienceLevel];

  // Calcular progreso actual
  const currentProgress = useMemo(() => {
    if (!profile || entries.length === 0) return null;

    const validEntries = entries.filter(e => !e.isCheatMeal && !e.isRetention);
    if (validEntries.length < 2) return null;

    const sortedEntries = [...validEntries].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    const firstEntry = sortedEntries[0];
    const lastEntry = sortedEntries[sortedEntries.length - 1];
    const daysElapsed = differenceInDays(new Date(lastEntry.date), new Date(firstEntry.date));
    const weeksElapsed = daysElapsed / 7;
    const monthsElapsed = daysElapsed / 30;

    const weightGained = lastEntry.weight - firstEntry.weight;
    const weeklyRate = weeksElapsed > 0 ? weightGained / weeksElapsed : 0;
    const monthlyRate = monthsElapsed > 0 ? weightGained / monthsElapsed : 0;

    return {
      daysElapsed,
      weeksElapsed: weeksElapsed.toFixed(1),
      monthsElapsed: monthsElapsed.toFixed(1),
      weightGained: weightGained.toFixed(2),
      weeklyRate: weeklyRate.toFixed(3),
      monthlyRate: monthlyRate.toFixed(2),
    };
  }, [profile, entries]);

  // Proyecciones para diferentes escenarios
  const projections = useMemo(() => {
    if (!profile) return null;

    const months = bulkDuration;
    const currentWeight = profile.currentWeight;

    return {
      conservative: {
        weeklyGain: currentRange.min,
        monthlyGain: currentRange.min * 4.33,
        totalGain: currentRange.min * 4.33 * months,
        finalWeight: currentWeight + currentRange.min * 4.33 * months,
      },
      optimal: {
        weeklyGain: (currentRange.min + currentRange.max) / 2,
        monthlyGain: ((currentRange.min + currentRange.max) / 2) * 4.33,
        totalGain: ((currentRange.min + currentRange.max) / 2) * 4.33 * months,
        finalWeight: currentWeight + ((currentRange.min + currentRange.max) / 2) * 4.33 * months,
      },
      aggressive: {
        weeklyGain: currentRange.max,
        monthlyGain: currentRange.max * 4.33,
        totalGain: currentRange.max * 4.33 * months,
        finalWeight: currentWeight + currentRange.max * 4.33 * months,
      },
    };
  }, [profile, bulkDuration, currentRange]);

  const handleSaveSettings = () => {
    updateProfile({
      bulkDurationMonths: bulkDuration,
      experienceLevel: experienceLevel,
    });
  };

  if (!profile) return null;

  return (
    <div className="space-y-6">
      {/* Configuración */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-purple-900/30 to-indigo-900/30 border border-purple-500/30 rounded-2xl p-6"
      >
        <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
          <Calculator className="w-6 h-6 text-purple-400" />
          Planificador de Volumen
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-slate-300 text-sm font-medium mb-2">
              Nivel de Experiencia
            </label>
            <select
              value={experienceLevel}
              onChange={(e) => setExperienceLevel(e.target.value as any)}
              className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="beginner">🌱 Principiante (<1 año entrenando)</option>
              <option value="intermediate">💪 Intermedio (1-4 años entrenando)</option>
              <option value="advanced">🏆 Avanzado (+4 años entrenando)</option>
            </select>
            <p className="text-slate-400 text-xs mt-2">
              Ganancia recomendada: <strong>{currentRange.label}</strong>
            </p>
          </div>

          <div>
            <label className="block text-slate-300 text-sm font-medium mb-2">
              Duración del Volumen (meses)
            </label>
            <input
              type="number"
              min="1"
              max="12"
              value={bulkDuration}
              onChange={(e) => setBulkDuration(parseInt(e.target.value))}
              className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <p className="text-slate-400 text-xs mt-2">
              Rango típico: 3-6 meses para volumen limpio
            </p>
          </div>
        </div>

        <button
          onClick={handleSaveSettings}
          className="mt-4 bg-purple-600 hover:bg-purple-700 text-white font-semibold px-6 py-2 rounded-lg transition-colors"
        >
          Guardar Configuración
        </button>
      </motion.div>

      {/* Progreso Actual */}
      {currentProgress && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-6"
        >
          <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-green-400" />
            Tu Progreso Actual
          </h3>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-slate-700/30 rounded-lg p-4">
              <div className="text-slate-400 text-sm mb-1">Tiempo Transcurrido</div>
              <div className="text-white text-2xl font-bold">
                {currentProgress.monthsElapsed}
                <span className="text-sm text-slate-400 ml-1">meses</span>
              </div>
              <div className="text-slate-500 text-xs">({currentProgress.weeksElapsed} semanas)</div>
            </div>

            <div className="bg-slate-700/30 rounded-lg p-4">
              <div className="text-slate-400 text-sm mb-1">Peso Ganado</div>
              <div className="text-white text-2xl font-bold">
                {currentProgress.weightGained}
                <span className="text-sm text-slate-400 ml-1">kg</span>
              </div>
            </div>

            <div className="bg-slate-700/30 rounded-lg p-4">
              <div className="text-slate-400 text-sm mb-1">Ritmo Semanal</div>
              <div className="text-white text-2xl font-bold">
                {currentProgress.weeklyRate}
                <span className="text-sm text-slate-400 ml-1">kg/sem</span>
              </div>
            </div>

            <div className="bg-slate-700/30 rounded-lg p-4">
              <div className="text-slate-400 text-sm mb-1">Ritmo Mensual</div>
              <div className="text-white text-2xl font-bold">
                {currentProgress.monthlyRate}
                <span className="text-sm text-slate-400 ml-1">kg/mes</span>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Proyecciones */}
      {projections && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-br from-blue-900/30 to-cyan-900/30 border border-blue-500/30 rounded-2xl p-6"
        >
          <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <Target className="w-5 h-5 text-blue-400" />
            Proyecciones para {bulkDuration} meses
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Conservador */}
            <div className="bg-slate-800/50 border border-green-500/30 rounded-xl p-5">
              <div className="text-green-400 font-semibold mb-3 flex items-center gap-2">
                🐢 Conservador
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-400">Ganancia semanal:</span>
                  <span className="text-white font-medium">
                    {projections.conservative.weeklyGain.toFixed(2)} kg
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Ganancia mensual:</span>
                  <span className="text-white font-medium">
                    {projections.conservative.monthlyGain.toFixed(2)} kg
                  </span>
                </div>
                <div className="flex justify-between border-t border-slate-700 pt-2 mt-2">
                  <span className="text-slate-400">Ganancia total:</span>
                  <span className="text-green-400 font-bold">
                    +{projections.conservative.totalGain.toFixed(1)} kg
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Peso final:</span>
                  <span className="text-white font-bold">
                    {projections.conservative.finalWeight.toFixed(1)} kg
                  </span>
                </div>
              </div>
              <div className="mt-3 text-xs text-slate-500">
                Mínima ganancia de grasa
              </div>
            </div>

            {/* Óptimo */}
            <div className="bg-slate-800/50 border border-blue-500/50 rounded-xl p-5 ring-2 ring-blue-500/30">
              <div className="text-blue-400 font-semibold mb-3 flex items-center gap-2">
                ⭐ Óptimo (Recomendado)
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-400">Ganancia semanal:</span>
                  <span className="text-white font-medium">
                    {projections.optimal.weeklyGain.toFixed(2)} kg
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Ganancia mensual:</span>
                  <span className="text-white font-medium">
                    {projections.optimal.monthlyGain.toFixed(2)} kg
                  </span>
                </div>
                <div className="flex justify-between border-t border-slate-700 pt-2 mt-2">
                  <span className="text-slate-400">Ganancia total:</span>
                  <span className="text-blue-400 font-bold">
                    +{projections.optimal.totalGain.toFixed(1)} kg
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Peso final:</span>
                  <span className="text-white font-bold">
                    {projections.optimal.finalWeight.toFixed(1)} kg
                  </span>
                </div>
              </div>
              <div className="mt-3 text-xs text-slate-500">
                Balance ideal músculo/grasa
              </div>
            </div>

            {/* Agresivo */}
            <div className="bg-slate-800/50 border border-orange-500/30 rounded-xl p-5">
              <div className="text-orange-400 font-semibold mb-3 flex items-center gap-2">
                🚀 Agresivo
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-400">Ganancia semanal:</span>
                  <span className="text-white font-medium">
                    {projections.aggressive.weeklyGain.toFixed(2)} kg
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Ganancia mensual:</span>
                  <span className="text-white font-medium">
                    {projections.aggressive.monthlyGain.toFixed(2)} kg
                  </span>
                </div>
                <div className="flex justify-between border-t border-slate-700 pt-2 mt-2">
                  <span className="text-slate-400">Ganancia total:</span>
                  <span className="text-orange-400 font-bold">
                    +{projections.aggressive.totalGain.toFixed(1)} kg
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Peso final:</span>
                  <span className="text-white font-bold">
                    {projections.aggressive.finalWeight.toFixed(1)} kg
                  </span>
                </div>
              </div>
              <div className="mt-3 text-xs text-slate-500">
                Mayor riesgo de grasa
              </div>
            </div>
          </div>

          <div className="mt-6 bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-4">
            <p className="text-yellow-400 text-sm">
              💡 <strong>Consejo:</strong> El escenario "Óptimo" equilibra ganancia muscular con mínima
              acumulación de grasa. Ajusta según tus resultados y composición corporal.
            </p>
          </div>
        </motion.div>
      )}

      {/* Guía de Rangos */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6"
      >
        <h3 className="text-lg font-semibold text-white mb-4">📊 Rangos Recomendados por Nivel</h3>

        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg">
            <div>
              <div className="text-white font-medium">🌱 Principiante</div>
              <div className="text-slate-400 text-sm">Menos de 1 año entrenando</div>
            </div>
            <div className="text-right">
              <div className="text-green-400 font-bold">0.25-0.5 kg/semana</div>
              <div className="text-slate-500 text-xs">~1-2 kg/mes | 12-24 kg/año</div>
            </div>
          </div>

          <div className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg">
            <div>
              <div className="text-white font-medium">💪 Intermedio</div>
              <div className="text-slate-400 text-sm">1-4 años de entrenamiento</div>
            </div>
            <div className="text-right">
              <div className="text-blue-400 font-bold">0.15-0.35 kg/semana</div>
              <div className="text-slate-500 text-xs">~0.6-1.4 kg/mes | 7-17 kg/año</div>
            </div>
          </div>

          <div className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg">
            <div>
              <div className="text-white font-medium">🏆 Avanzado</div>
              <div className="text-slate-400 text-sm">+4 años de entrenamiento</div>
            </div>
            <div className="text-right">
              <div className="text-purple-400 font-bold">0.1-0.25 kg/semana</div>
              <div className="text-slate-500 text-xs">~0.4-1 kg/mes | 5-12 kg/año</div>
            </div>
          </div>
        </div>

        <div className="mt-4 bg-blue-900/20 border border-blue-500/30 rounded-lg p-3">
          <p className="text-blue-400 text-xs">
            📚 <strong>Fuentes científicas:</strong> Garthe et al. (2011), Helms et al. (2014), McDonald (2017).
            Estos rangos maximizan ganancia muscular minimizando grasa en naturales.
          </p>
        </div>
      </motion.div>
    </div>
  );
};
