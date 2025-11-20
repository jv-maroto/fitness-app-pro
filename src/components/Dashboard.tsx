import React, { useMemo } from 'react';
import { useWeightStore } from '../store/useWeightStore';
import { calculateStatistics, getSmartInsights } from '../utils/statistics';
import { TrendingUp, TrendingDown, Target, Calendar, Award, Activity } from 'lucide-react';
import { motion } from 'framer-motion';

export const Dashboard: React.FC = () => {
  const { entries, profile } = useWeightStore();

  const statistics = useMemo(() => {
    if (!profile) return null;
    return calculateStatistics(entries, profile.goalType, profile.targetWeight);
  }, [entries, profile]);

  const insights = useMemo(() => {
    if (!profile || !statistics) return [];
    return getSmartInsights(entries, statistics, profile.goalType);
  }, [entries, statistics, profile]);

  if (!profile || !statistics) {
    return null;
  }

  const StatCard: React.FC<{
    icon: React.ReactNode;
    title: string;
    value: string | number;
    subtitle?: string;
    trend?: 'up' | 'down' | 'neutral';
    delay?: number;
  }> = ({ icon, title, value, subtitle, trend, delay = 0 }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="bg-slate-800/50 backdrop-blur-xl rounded-2xl p-6 border border-slate-700/50 hover:border-slate-600/50 transition-all duration-300 hover:shadow-xl"
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 text-slate-400 text-sm mb-2">
            {icon}
            <span>{title}</span>
          </div>
          <div className="text-3xl font-bold text-white mb-1">{value}</div>
          {subtitle && (
            <div className="text-sm text-slate-400 flex items-center gap-1">
              {trend === 'up' && <TrendingUp className="w-4 h-4 text-green-400" />}
              {trend === 'down' && <TrendingDown className="w-4 h-4 text-red-400" />}
              {subtitle}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );

  const goalEmoji = profile.goalType === 'bulk' ? '💪' : profile.goalType === 'cut' ? '🔥' : '⚖️';
  const weightChangeSign = statistics.weightChange >= 0 ? '+' : '';
  const weeklyChangeSign = statistics.weeklyAverageChange >= 0 ? '+' : '';

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={<Activity className="w-4 h-4" />}
          title="Peso Actual"
          value={`${profile.currentWeight.toFixed(1)} kg`}
          subtitle={`${weightChangeSign}${statistics.weightChange.toFixed(1)} kg total`}
          trend={statistics.weightChange >= 0 ? 'up' : 'down'}
          delay={0}
        />

        <StatCard
          icon={<TrendingUp className="w-4 h-4" />}
          title="Media Móvil 7 días"
          value={`${statistics.movingAverage7.toFixed(1)} kg`}
          subtitle="Tendencia semanal"
          delay={0.1}
        />

        <StatCard
          icon={<Target className="w-4 h-4" />}
          title={`Objetivo ${goalEmoji}`}
          value={profile.targetWeight ? `${profile.targetWeight.toFixed(1)} kg` : 'No definido'}
          subtitle={
            profile.targetWeight
              ? `${Math.abs(profile.targetWeight - profile.currentWeight).toFixed(1)} kg restantes`
              : 'Define tu meta'
          }
          delay={0.2}
        />

        <StatCard
          icon={<Calendar className="w-4 h-4" />}
          title="Consistencia"
          value={`${statistics.consistencyScore.toFixed(0)}%`}
          subtitle={`${statistics.totalEntries} registros en ${statistics.daysTracked} días`}
          delay={0.3}
        />
      </div>

      {/* Progress Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard
          icon={<TrendingUp className="w-4 h-4" />}
          title="Cambio Semanal"
          value={`${weeklyChangeSign}${statistics.weeklyAverageChange.toFixed(2)} kg/sem`}
          trend={statistics.weeklyAverageChange >= 0 ? 'up' : 'down'}
          delay={0.4}
        />

        <StatCard
          icon={<Activity className="w-4 h-4" />}
          title="Media 14 días"
          value={`${statistics.movingAverage14.toFixed(1)} kg`}
          delay={0.5}
        />

        <StatCard
          icon={<Award className="w-4 h-4" />}
          title="Media 30 días"
          value={`${statistics.movingAverage30.toFixed(1)} kg`}
          delay={0.6}
        />
      </div>

      {/* Special Markers */}
      {(statistics.cheatMealCount > 0 || statistics.retentionCount > 0) && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="grid grid-cols-2 gap-4"
        >
          {statistics.cheatMealCount > 0 && (
            <div className="bg-orange-900/20 border border-orange-500/30 rounded-xl p-4">
              <div className="text-orange-400 text-sm mb-1">🍕 Cheat Meals</div>
              <div className="text-2xl font-bold text-white">
                {statistics.cheatMealCount}
                <span className="text-sm text-slate-400 ml-2">
                  ({((statistics.cheatMealCount / statistics.totalEntries) * 100).toFixed(0)}%)
                </span>
              </div>
            </div>
          )}

          {statistics.retentionCount > 0 && (
            <div className="bg-blue-900/20 border border-blue-500/30 rounded-xl p-4">
              <div className="text-blue-400 text-sm mb-1">💧 Retenciones</div>
              <div className="text-2xl font-bold text-white">
                {statistics.retentionCount}
                <span className="text-sm text-slate-400 ml-2">
                  ({((statistics.retentionCount / statistics.totalEntries) * 100).toFixed(0)}%)
                </span>
              </div>
            </div>
          )}
        </motion.div>
      )}

      {/* Projections */}
      {statistics.projectedWeight30Days && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="bg-gradient-to-br from-purple-900/30 to-blue-900/30 border border-purple-500/30 rounded-2xl p-6"
        >
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Target className="w-5 h-5 text-purple-400" />
            Proyecciones
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="text-slate-400 text-sm mb-1">Peso estimado en 30 días</div>
              <div className="text-2xl font-bold text-white">
                {statistics.projectedWeight30Days.toFixed(1)} kg
              </div>
            </div>
            {statistics.estimatedDaysToGoal && (
              <div>
                <div className="text-slate-400 text-sm mb-1">Días estimados hasta objetivo</div>
                <div className="text-2xl font-bold text-white">
                  {Math.round(statistics.estimatedDaysToGoal)} días
                  <span className="text-sm text-slate-400 ml-2">
                    (~{Math.round(statistics.estimatedDaysToGoal / 7)} semanas)
                  </span>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      )}

      {/* Smart Insights */}
      {insights.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-xl rounded-2xl p-6 border border-slate-700/50"
        >
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            🧠 Análisis Inteligente
          </h3>
          <div className="space-y-3">
            {insights.map((insight, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.9 + index * 0.1 }}
                className="bg-slate-800/30 rounded-lg p-3 border border-slate-700/30"
              >
                <p className="text-slate-200 text-sm">{insight}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
};
