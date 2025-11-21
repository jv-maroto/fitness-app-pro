import React, { useState, useMemo } from 'react';
import { useWeightStore } from '../store/useWeightStore';
import { useThemeStore } from '../store/useThemeStore';
import { Calendar, TrendingUp, Target, Calculator, Info, Lightbulb } from 'lucide-react';
import { motion } from 'framer-motion';
import { differenceInDays } from 'date-fns';
import { CustomSelect } from './CustomSelect';

export const BulkPlanner: React.FC = () => {
  const { profile, updateProfile, entries } = useWeightStore();
  const { theme } = useThemeStore();
  const [bulkDuration, setBulkDuration] = useState(profile?.bulkDurationMonths || 3);
  const [experienceLevel, setExperienceLevel] = useState<'beginner' | 'intermediate' | 'advanced'>(
    profile?.experienceLevel || 'intermediate'
  );

  // Rangos recomendados según nivel (basados en estudios: Garthe et al., Helms)
  const recommendedRanges = {
    beginner: { min: 0.25, max: 0.5, label: '0.25-0.5 kg/sem (1-2 kg/mes)' },
    intermediate: { min: 0.15, max: 0.35, label: '0.15-0.35 kg/sem (0.6-1.4 kg/mes)' },
    advanced: { min: 0.1, max: 0.25, label: '0.1-0.25 kg/sem (0.4-1 kg/mes)' },
  };

  const currentRange = recommendedRanges[experienceLevel];

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
        className={`glass-card p-6 ${
          theme === 'dark'
            ? 'bg-gradient-to-br from-purple-900/20 to-indigo-900/20'
            : 'bg-gradient-to-br from-purple-100/50 to-indigo-100/50'
        }`}
      >
        <h2 className="text-2xl font-bold text-theme-primary mb-6 flex items-center gap-2">
          <Calculator className={`w-6 h-6 ${theme === 'dark' ? 'text-purple-400' : 'text-purple-600'}`} />
          Planificador de Volumen
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-theme-secondary text-sm font-medium mb-2">
              Nivel de Experiencia
            </label>
            <CustomSelect
              value={experienceLevel}
              onChange={(val) => setExperienceLevel(val as any)}
              options={[
                { value: 'beginner', label: 'Principiante (menos de 1 año)' },
                { value: 'intermediate', label: 'Intermedio (1-4 años)' },
                { value: 'advanced', label: 'Avanzado (más de 4 años)' },
              ]}
            />
            <p className="text-theme-muted text-xs mt-2">
              Ganancia recomendada: <strong className="text-theme-secondary">{currentRange.label}</strong>
            </p>
          </div>

          <div>
            <label className="block text-theme-secondary text-sm font-medium mb-2">
              Duración del Volumen (meses)
            </label>
            <input
              type="number"
              min="1"
              max="12"
              value={bulkDuration}
              onChange={(e) => setBulkDuration(parseInt(e.target.value))}
              className="w-full input-glass rounded-xl px-4 py-3"
            />
            <p className="text-theme-muted text-xs mt-2">
              Rango típico: 3-6 meses para volumen limpio
            </p>
          </div>
        </div>

        <button
          onClick={handleSaveSettings}
          className={`mt-4 font-semibold px-6 py-2 rounded-xl transition-colors ${
            theme === 'dark'
              ? 'bg-purple-600 hover:bg-purple-700 text-white'
              : 'bg-purple-500 hover:bg-purple-600 text-white'
          }`}
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
          className="glass-card p-6"
        >
          <h3 className="text-xl font-bold text-theme-primary mb-4 flex items-center gap-2">
            <TrendingUp className={`w-5 h-5 ${theme === 'dark' ? 'text-green-400' : 'text-green-600'}`} />
            Tu Progreso Actual
          </h3>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className={`rounded-xl p-4 ${
              theme === 'dark' ? 'bg-slate-700/30' : 'bg-slate-100/50'
            }`}>
              <div className="text-theme-muted text-sm mb-1">Tiempo Transcurrido</div>
              <div className="text-theme-primary text-2xl font-bold">
                {currentProgress.monthsElapsed}
                <span className="text-sm text-theme-muted ml-1">meses</span>
              </div>
              <div className="text-theme-muted text-xs">({currentProgress.weeksElapsed} semanas)</div>
            </div>

            <div className={`rounded-xl p-4 ${
              theme === 'dark' ? 'bg-slate-700/30' : 'bg-slate-100/50'
            }`}>
              <div className="text-theme-muted text-sm mb-1">Peso Ganado</div>
              <div className="text-theme-primary text-2xl font-bold">
                {currentProgress.weightGained}
                <span className="text-sm text-theme-muted ml-1">kg</span>
              </div>
            </div>

            <div className={`rounded-xl p-4 ${
              theme === 'dark' ? 'bg-slate-700/30' : 'bg-slate-100/50'
            }`}>
              <div className="text-theme-muted text-sm mb-1">Ritmo Semanal</div>
              <div className="text-theme-primary text-2xl font-bold">
                {currentProgress.weeklyRate}
                <span className="text-sm text-theme-muted ml-1">kg/sem</span>
              </div>
            </div>

            <div className={`rounded-xl p-4 ${
              theme === 'dark' ? 'bg-slate-700/30' : 'bg-slate-100/50'
            }`}>
              <div className="text-theme-muted text-sm mb-1">Ritmo Mensual</div>
              <div className="text-theme-primary text-2xl font-bold">
                {currentProgress.monthlyRate}
                <span className="text-sm text-theme-muted ml-1">kg/mes</span>
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
          className={`glass-card p-6 ${
            theme === 'dark'
              ? 'bg-gradient-to-br from-blue-900/20 to-cyan-900/20'
              : 'bg-gradient-to-br from-blue-100/50 to-cyan-100/50'
          }`}
        >
          <h3 className="text-xl font-bold text-theme-primary mb-4 flex items-center gap-2">
            <Target className={`w-5 h-5 ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`} />
            Proyecciones para {bulkDuration} meses
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Conservador */}
            <div className={`glass-card p-5 ${
              theme === 'dark' ? 'border-green-500/30' : 'border-green-400/50'
            }`}>
              <div className={`font-semibold mb-3 flex items-center gap-2 ${
                theme === 'dark' ? 'text-green-400' : 'text-green-600'
              }`}>
                Conservador
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-theme-muted">Ganancia semanal:</span>
                  <span className="text-theme-primary font-medium">
                    {projections.conservative.weeklyGain.toFixed(2)} kg
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-theme-muted">Ganancia mensual:</span>
                  <span className="text-theme-primary font-medium">
                    {projections.conservative.monthlyGain.toFixed(2)} kg
                  </span>
                </div>
                <div className={`flex justify-between border-t pt-2 mt-2 ${
                  theme === 'dark' ? 'border-slate-700' : 'border-slate-200'
                }`}>
                  <span className="text-theme-muted">Ganancia total:</span>
                  <span className={`font-bold ${theme === 'dark' ? 'text-green-400' : 'text-green-600'}`}>
                    +{projections.conservative.totalGain.toFixed(1)} kg
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-theme-muted">Peso final:</span>
                  <span className="text-theme-primary font-bold">
                    {projections.conservative.finalWeight.toFixed(1)} kg
                  </span>
                </div>
              </div>
              <div className="mt-3 text-xs text-theme-muted">
                Mínima ganancia de grasa
              </div>
            </div>

            {/* Óptimo */}
            <div className={`glass-card p-5 ring-2 ${
              theme === 'dark' ? 'border-blue-500/50 ring-blue-500/30' : 'border-blue-400 ring-blue-400/30'
            }`}>
              <div className={`font-semibold mb-3 flex items-center gap-2 ${
                theme === 'dark' ? 'text-blue-400' : 'text-blue-600'
              }`}>
                Óptimo (Recomendado)
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-theme-muted">Ganancia semanal:</span>
                  <span className="text-theme-primary font-medium">
                    {projections.optimal.weeklyGain.toFixed(2)} kg
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-theme-muted">Ganancia mensual:</span>
                  <span className="text-theme-primary font-medium">
                    {projections.optimal.monthlyGain.toFixed(2)} kg
                  </span>
                </div>
                <div className={`flex justify-between border-t pt-2 mt-2 ${
                  theme === 'dark' ? 'border-slate-700' : 'border-slate-200'
                }`}>
                  <span className="text-theme-muted">Ganancia total:</span>
                  <span className={`font-bold ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`}>
                    +{projections.optimal.totalGain.toFixed(1)} kg
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-theme-muted">Peso final:</span>
                  <span className="text-theme-primary font-bold">
                    {projections.optimal.finalWeight.toFixed(1)} kg
                  </span>
                </div>
              </div>
              <div className="mt-3 text-xs text-theme-muted">
                Balance ideal músculo/grasa
              </div>
            </div>

            {/* Agresivo */}
            <div className={`glass-card p-5 ${
              theme === 'dark' ? 'border-orange-500/30' : 'border-orange-400/50'
            }`}>
              <div className={`font-semibold mb-3 flex items-center gap-2 ${
                theme === 'dark' ? 'text-orange-400' : 'text-orange-600'
              }`}>
                Agresivo
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-theme-muted">Ganancia semanal:</span>
                  <span className="text-theme-primary font-medium">
                    {projections.aggressive.weeklyGain.toFixed(2)} kg
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-theme-muted">Ganancia mensual:</span>
                  <span className="text-theme-primary font-medium">
                    {projections.aggressive.monthlyGain.toFixed(2)} kg
                  </span>
                </div>
                <div className={`flex justify-between border-t pt-2 mt-2 ${
                  theme === 'dark' ? 'border-slate-700' : 'border-slate-200'
                }`}>
                  <span className="text-theme-muted">Ganancia total:</span>
                  <span className={`font-bold ${theme === 'dark' ? 'text-orange-400' : 'text-orange-600'}`}>
                    +{projections.aggressive.totalGain.toFixed(1)} kg
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-theme-muted">Peso final:</span>
                  <span className="text-theme-primary font-bold">
                    {projections.aggressive.finalWeight.toFixed(1)} kg
                  </span>
                </div>
              </div>
              <div className="mt-3 text-xs text-theme-muted">
                Mayor riesgo de grasa
              </div>
            </div>
          </div>

          <div className={`mt-6 rounded-xl p-4 ${
            theme === 'dark'
              ? 'bg-yellow-900/20 border border-yellow-500/30'
              : 'bg-yellow-100/50 border border-yellow-400/50'
          }`}>
            <p className={`text-sm flex items-start gap-2 ${
              theme === 'dark' ? 'text-yellow-400' : 'text-yellow-700'
            }`}>
              <Lightbulb className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span>
                <strong>Consejo:</strong> El escenario "Óptimo" equilibra ganancia muscular con mínima
                acumulación de grasa. Ajusta según tus resultados y composición corporal.
              </span>
            </p>
          </div>
        </motion.div>
      )}

      {/* Guía de Rangos */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="glass-card p-6"
      >
        <h3 className="text-lg font-semibold text-theme-primary mb-4 flex items-center gap-2">
          <Info className="w-4 h-4" /> Rangos Recomendados por Nivel
        </h3>

        <div className="space-y-3">
          <div className={`flex items-center justify-between p-3 rounded-xl ${
            theme === 'dark' ? 'bg-slate-700/30' : 'bg-slate-100/50'
          }`}>
            <div>
              <div className="text-theme-primary font-medium">Principiante</div>
              <div className="text-theme-muted text-sm">Menos de 1 año</div>
            </div>
            <div className="text-right">
              <div className={`font-bold ${theme === 'dark' ? 'text-green-400' : 'text-green-600'}`}>
                0.25-0.5 kg/semana
              </div>
              <div className="text-theme-muted text-xs">~1-2 kg/mes | 12-24 kg/año</div>
            </div>
          </div>

          <div className={`flex items-center justify-between p-3 rounded-xl ${
            theme === 'dark' ? 'bg-slate-700/30' : 'bg-slate-100/50'
          }`}>
            <div>
              <div className="text-theme-primary font-medium">Intermedio</div>
              <div className="text-theme-muted text-sm">1-4 años</div>
            </div>
            <div className="text-right">
              <div className={`font-bold ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`}>
                0.15-0.35 kg/semana
              </div>
              <div className="text-theme-muted text-xs">~0.6-1.4 kg/mes | 7-17 kg/año</div>
            </div>
          </div>

          <div className={`flex items-center justify-between p-3 rounded-xl ${
            theme === 'dark' ? 'bg-slate-700/30' : 'bg-slate-100/50'
          }`}>
            <div>
              <div className="text-theme-primary font-medium">Avanzado</div>
              <div className="text-theme-muted text-sm">Más de 4 años</div>
            </div>
            <div className="text-right">
              <div className={`font-bold ${theme === 'dark' ? 'text-purple-400' : 'text-purple-600'}`}>
                0.1-0.25 kg/semana
              </div>
              <div className="text-theme-muted text-xs">~0.4-1 kg/mes | 5-12 kg/año</div>
            </div>
          </div>
        </div>

        <div className={`mt-4 rounded-xl p-3 ${
          theme === 'dark'
            ? 'bg-blue-900/20 border border-blue-500/30'
            : 'bg-blue-100/50 border border-blue-400/50'
        }`}>
          <p className={`text-xs ${theme === 'dark' ? 'text-blue-400' : 'text-blue-700'}`}>
            <strong>Fuentes científicas:</strong> Garthe et al. (2011), Helms et al. (2014), McDonald (2017).
            Estos rangos maximizan ganancia muscular minimizando grasa en naturales.
          </p>
        </div>
      </motion.div>
    </div>
  );
};
