import React, { useMemo, useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useWeightStore } from '../store/useWeightStore';
import { useThemeStore } from '../store/useThemeStore';
import { ChartDataPoint } from '../types';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { calculateMovingAverage } from '../utils/statistics';
import { motion } from 'framer-motion';
import { TrendingUp, Zap } from 'lucide-react';

export const WeightChart: React.FC = () => {
  const { entries } = useWeightStore();
  const { theme } = useThemeStore();
  const [showMA7, setShowMA7] = useState(true);
  const [showMA14, setShowMA14] = useState(true);
  const [showMA30, setShowMA30] = useState(false);
  const [showMarkers, setShowMarkers] = useState(true);

  const chartData = useMemo((): ChartDataPoint[] => {
    const sortedEntries = [...entries].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    return sortedEntries.map((entry, index) => {
      const validEntriesUpToNow = sortedEntries
        .slice(0, index + 1)
        .filter(e => !e.isCheatMeal && !e.isRetention);

      return {
        date: format(new Date(entry.date), 'dd MMM', { locale: es }),
        weight: entry.weight,
        movingAverage7: showMA7 ? calculateMovingAverage(validEntriesUpToNow, 7) : undefined,
        movingAverage14: showMA14 ? calculateMovingAverage(validEntriesUpToNow, 14) : undefined,
        movingAverage30: showMA30 ? calculateMovingAverage(validEntriesUpToNow, 30) : undefined,
        isCheatMeal: entry.isCheatMeal,
        isRetention: entry.isRetention,
      };
    });
  }, [entries, showMA7, showMA14, showMA30]);

  const cheatMealData = chartData.filter(d => d.isCheatMeal);
  const retentionData = chartData.filter(d => d.isRetention);

  if (entries.length === 0) {
    return (
      <div className="glass-card p-8 text-center">
        <p className="text-theme-secondary">No hay datos para mostrar. Agrega tu primer registro de peso.</p>
      </div>
    );
  }

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className={`backdrop-blur-xl rounded-xl p-4 shadow-2xl border ${
          theme === 'dark'
            ? 'bg-slate-900/95 border-slate-600'
            : 'bg-white/95 border-slate-300'
        }`}>
          <p className="text-theme-primary font-bold text-lg mb-2">{data.date}</p>
          <div className="space-y-1">
            <p className="text-cyan-500 flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-cyan-400"></span>
              Peso: <span className="font-bold">{data.weight.toFixed(1)} kg</span>
            </p>
            {data.movingAverage7 && (
              <p className="text-emerald-500 flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-emerald-400"></span>
                MA 7 días: <span className="font-bold">{data.movingAverage7.toFixed(1)} kg</span>
              </p>
            )}
            {data.movingAverage14 && (
              <p className="text-amber-500 flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-amber-400"></span>
                MA 14 días: <span className="font-bold">{data.movingAverage14.toFixed(1)} kg</span>
              </p>
            )}
            {data.movingAverage30 && (
              <p className="text-violet-500 flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-violet-400"></span>
                MA 30 días: <span className="font-bold">{data.movingAverage30.toFixed(1)} kg</span>
              </p>
            )}
          </div>
          {(data.isCheatMeal || data.isRetention) && (
            <div className={`mt-2 pt-2 border-t ${theme === 'dark' ? 'border-slate-700' : 'border-slate-200'}`}>
              {data.isCheatMeal && <p className="text-orange-500 text-sm">Cheat Meal - Excluido de medias</p>}
              {data.isRetention && <p className="text-blue-500 text-sm">Retención - Excluido de medias</p>}
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  const gridColor = theme === 'dark' ? '#334155' : '#e2e8f0';
  const axisColor = theme === 'dark' ? '#64748b' : '#94a3b8';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card p-6"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-theme-primary flex items-center gap-2">
            <TrendingUp className={`w-6 h-6 ${theme === 'dark' ? 'text-cyan-400' : 'text-cyan-600'}`} />
            Evolución del Peso
          </h2>
          <p className="text-theme-muted text-sm mt-1">Visualización con medias móviles suavizadas</p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setShowMA7(!showMA7)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${
              showMA7
                ? 'bg-gradient-to-r from-emerald-600 to-emerald-500 text-white shadow-lg shadow-emerald-500/30'
                : theme === 'dark'
                  ? 'bg-slate-700/50 text-slate-400 hover:bg-slate-600/50'
                  : 'bg-slate-200/50 text-slate-600 hover:bg-slate-300/50'
            }`}
          >
            MA7
          </button>
          <button
            onClick={() => setShowMA14(!showMA14)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${
              showMA14
                ? 'bg-gradient-to-r from-amber-600 to-amber-500 text-white shadow-lg shadow-amber-500/30'
                : theme === 'dark'
                  ? 'bg-slate-700/50 text-slate-400 hover:bg-slate-600/50'
                  : 'bg-slate-200/50 text-slate-600 hover:bg-slate-300/50'
            }`}
          >
            MA14
          </button>
          <button
            onClick={() => setShowMA30(!showMA30)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${
              showMA30
                ? 'bg-gradient-to-r from-violet-600 to-violet-500 text-white shadow-lg shadow-violet-500/30'
                : theme === 'dark'
                  ? 'bg-slate-700/50 text-slate-400 hover:bg-slate-600/50'
                  : 'bg-slate-200/50 text-slate-600 hover:bg-slate-300/50'
            }`}
          >
            MA30
          </button>
          <button
            onClick={() => setShowMarkers(!showMarkers)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${
              showMarkers
                ? 'bg-gradient-to-r from-orange-600 to-orange-500 text-white shadow-lg shadow-orange-500/30'
                : theme === 'dark'
                  ? 'bg-slate-700/50 text-slate-400 hover:bg-slate-600/50'
                  : 'bg-slate-200/50 text-slate-600 hover:bg-slate-300/50'
            }`}
          >
            Marcadores
          </button>
        </div>
      </div>

      {/* Chart */}
      <div className={`rounded-xl p-4 mb-6 ${
        theme === 'dark' ? 'bg-slate-900/50' : 'bg-slate-100/50'
      }`}>
        <ResponsiveContainer width="100%" height={400}>
          <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorWeight" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#06b6d4" stopOpacity={theme === 'dark' ? 0.4 : 0.3}/>
                <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorMA7" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={theme === 'dark' ? 0.3 : 0.2}/>
                <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorMA14" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f59e0b" stopOpacity={theme === 'dark' ? 0.3 : 0.2}/>
                <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorMA30" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8b5cf6" stopOpacity={theme === 'dark' ? 0.3 : 0.2}/>
                <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="3 3" stroke={gridColor} opacity={0.5} />
            <XAxis
              dataKey="date"
              stroke={axisColor}
              style={{ fontSize: '12px' }}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke={axisColor}
              style={{ fontSize: '12px' }}
              domain={['dataMin - 0.5', 'dataMax + 0.5']}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `${value.toFixed(1)}`}
            />
            <Tooltip content={<CustomTooltip />} />

            <Area
              type="monotone"
              dataKey="weight"
              stroke="#06b6d4"
              strokeWidth={3}
              fillOpacity={1}
              fill="url(#colorWeight)"
              dot={{ fill: '#06b6d4', strokeWidth: 2, r: 4, stroke: theme === 'dark' ? '#0e1729' : '#ffffff' }}
              activeDot={{ r: 6, stroke: '#06b6d4', strokeWidth: 2, fill: theme === 'dark' ? '#0e1729' : '#ffffff' }}
            />

            {showMA7 && (
              <Area
                type="monotone"
                dataKey="movingAverage7"
                stroke="#10b981"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorMA7)"
                dot={false}
              />
            )}

            {showMA14 && (
              <Area
                type="monotone"
                dataKey="movingAverage14"
                stroke="#f59e0b"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorMA14)"
                dot={false}
              />
            )}

            {showMA30 && (
              <Area
                type="monotone"
                dataKey="movingAverage30"
                stroke="#8b5cf6"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorMA30)"
                dot={false}
              />
            )}
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Leyenda Explicativa */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className={`rounded-xl p-4 border ${
          theme === 'dark'
            ? 'bg-slate-800/50 border-cyan-500/30'
            : 'bg-cyan-50/50 border-cyan-400/30'
        }`}>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-4 h-4 rounded-full bg-cyan-400 shadow-lg shadow-cyan-400/50"></div>
            <span className="text-theme-primary font-semibold">Peso Diario</span>
          </div>
          <p className="text-theme-muted text-xs">Tu peso registrado cada día. Incluye fluctuaciones naturales.</p>
        </div>

        <div className={`rounded-xl p-4 border transition-all ${
          showMA7
            ? theme === 'dark'
              ? 'bg-slate-800/50 border-emerald-500/30'
              : 'bg-emerald-50/50 border-emerald-400/30'
            : theme === 'dark'
              ? 'bg-slate-800/30 border-slate-700/30 opacity-50'
              : 'bg-slate-100/30 border-slate-200/30 opacity-50'
        }`}>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-4 h-4 rounded-full bg-emerald-400 shadow-lg shadow-emerald-400/50"></div>
            <span className="text-theme-primary font-semibold">MA 7 días</span>
          </div>
          <p className="text-theme-muted text-xs">Media móvil semanal. Muestra tendencia a corto plazo sin ruido diario.</p>
        </div>

        <div className={`rounded-xl p-4 border transition-all ${
          showMA14
            ? theme === 'dark'
              ? 'bg-slate-800/50 border-amber-500/30'
              : 'bg-amber-50/50 border-amber-400/30'
            : theme === 'dark'
              ? 'bg-slate-800/30 border-slate-700/30 opacity-50'
              : 'bg-slate-100/30 border-slate-200/30 opacity-50'
        }`}>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-4 h-4 rounded-full bg-amber-400 shadow-lg shadow-amber-400/50"></div>
            <span className="text-theme-primary font-semibold">MA 14 días</span>
          </div>
          <p className="text-theme-muted text-xs">Media quincenal. Tendencia más estable, ideal para evaluar progreso real.</p>
        </div>

        <div className={`rounded-xl p-4 border transition-all ${
          showMA30
            ? theme === 'dark'
              ? 'bg-slate-800/50 border-violet-500/30'
              : 'bg-violet-50/50 border-violet-400/30'
            : theme === 'dark'
              ? 'bg-slate-800/30 border-slate-700/30 opacity-50'
              : 'bg-slate-100/30 border-slate-200/30 opacity-50'
        }`}>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-4 h-4 rounded-full bg-violet-400 shadow-lg shadow-violet-400/50"></div>
            <span className="text-theme-primary font-semibold">MA 30 días</span>
          </div>
          <p className="text-theme-muted text-xs">Media mensual. Tendencia a largo plazo, elimina variaciones semanales.</p>
        </div>
      </div>

      {/* Marcadores de Cheat Meal y Retención */}
      {showMarkers && (cheatMealData.length > 0 || retentionData.length > 0) && (
        <div className={`mt-4 p-4 rounded-xl border ${
          theme === 'dark'
            ? 'bg-slate-800/30 border-slate-700/50'
            : 'bg-slate-100/30 border-slate-200/50'
        }`}>
          <h4 className="text-theme-primary font-semibold mb-3 flex items-center gap-2">
            <Zap className={`w-4 h-4 ${theme === 'dark' ? 'text-yellow-400' : 'text-yellow-500'}`} />
            Marcadores Especiales
          </h4>
          <div className="flex flex-wrap gap-4">
            {cheatMealData.length > 0 && (
              <div className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${
                theme === 'dark'
                  ? 'bg-orange-500/10 border-orange-500/30'
                  : 'bg-orange-100/50 border-orange-400/30'
              }`}>
                <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                <span className={`text-sm ${theme === 'dark' ? 'text-orange-400' : 'text-orange-600'}`}>
                  Cheat Meals: <strong>{cheatMealData.length}</strong>
                  <span className="opacity-70 ml-1">(excluidos de medias)</span>
                </span>
              </div>
            )}
            {retentionData.length > 0 && (
              <div className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${
                theme === 'dark'
                  ? 'bg-blue-500/10 border-blue-500/30'
                  : 'bg-blue-100/50 border-blue-400/30'
              }`}>
                <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                <span className={`text-sm ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`}>
                  Retenciones: <strong>{retentionData.length}</strong>
                  <span className="opacity-70 ml-1">(excluidos de medias)</span>
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Info adicional */}
      <div className="mt-4 text-center">
        <p className="text-theme-muted text-xs">
          Las medias móviles excluyen automáticamente los días marcados como Cheat Meal o Retención para mostrar tu progreso real.
        </p>
      </div>
    </motion.div>
  );
};
