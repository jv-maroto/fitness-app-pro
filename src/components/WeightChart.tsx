import React, { useMemo, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Scatter, ScatterChart, ZAxis } from 'recharts';
import { useWeightStore } from '../store/useWeightStore';
import { ChartDataPoint } from '../types';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { calculateMovingAverage } from '../utils/statistics';
import { motion } from 'framer-motion';

export const WeightChart: React.FC = () => {
  const { entries } = useWeightStore();
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
      <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl p-8 border border-slate-700/50 text-center">
        <p className="text-slate-400">No hay datos para mostrar. Agrega tu primer registro de peso.</p>
      </div>
    );
  }

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-slate-900/95 backdrop-blur-xl border border-slate-700 rounded-lg p-3 shadow-xl">
          <p className="text-white font-semibold mb-2">{data.date}</p>
          <p className="text-blue-400">Peso: {data.weight.toFixed(1)} kg</p>
          {data.movingAverage7 && (
            <p className="text-green-400">MA7: {data.movingAverage7.toFixed(1)} kg</p>
          )}
          {data.movingAverage14 && (
            <p className="text-yellow-400">MA14: {data.movingAverage14.toFixed(1)} kg</p>
          )}
          {data.movingAverage30 && (
            <p className="text-purple-400">MA30: {data.movingAverage30.toFixed(1)} kg</p>
          )}
          {data.isCheatMeal && <p className="text-orange-400 mt-1">🍕 Cheat Meal</p>}
          {data.isRetention && <p className="text-cyan-400 mt-1">💧 Retención</p>}
        </div>
      );
    }
    return null;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-slate-800/50 backdrop-blur-xl rounded-2xl p-6 border border-slate-700/50"
    >
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h2 className="text-xl font-bold text-white">📊 Evolución del Peso</h2>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setShowMA7(!showMA7)}
            className={`px-3 py-1 rounded-lg text-sm font-medium transition-all ${
              showMA7
                ? 'bg-green-600 text-white'
                : 'bg-slate-700 text-slate-400 hover:bg-slate-600'
            }`}
          >
            MA7
          </button>
          <button
            onClick={() => setShowMA14(!showMA14)}
            className={`px-3 py-1 rounded-lg text-sm font-medium transition-all ${
              showMA14
                ? 'bg-yellow-600 text-white'
                : 'bg-slate-700 text-slate-400 hover:bg-slate-600'
            }`}
          >
            MA14
          </button>
          <button
            onClick={() => setShowMA30(!showMA30)}
            className={`px-3 py-1 rounded-lg text-sm font-medium transition-all ${
              showMA30
                ? 'bg-purple-600 text-white'
                : 'bg-slate-700 text-slate-400 hover:bg-slate-600'
            }`}
          >
            MA30
          </button>
          <button
            onClick={() => setShowMarkers(!showMarkers)}
            className={`px-3 py-1 rounded-lg text-sm font-medium transition-all ${
              showMarkers
                ? 'bg-orange-600 text-white'
                : 'bg-slate-700 text-slate-400 hover:bg-slate-600'
            }`}
          >
            Marcadores
          </button>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={400}>
        <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
          <XAxis
            dataKey="date"
            stroke="#94a3b8"
            style={{ fontSize: '12px' }}
          />
          <YAxis
            stroke="#94a3b8"
            style={{ fontSize: '12px' }}
            domain={['dataMin - 1', 'dataMax + 1']}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend />

          <Line
            type="monotone"
            dataKey="weight"
            stroke="#3b82f6"
            strokeWidth={2}
            dot={{ fill: '#3b82f6', r: 4 }}
            name="Peso"
          />

          {showMA7 && (
            <Line
              type="monotone"
              dataKey="movingAverage7"
              stroke="#22c55e"
              strokeWidth={2}
              dot={false}
              name="MA 7 días"
            />
          )}

          {showMA14 && (
            <Line
              type="monotone"
              dataKey="movingAverage14"
              stroke="#eab308"
              strokeWidth={2}
              dot={false}
              name="MA 14 días"
            />
          )}

          {showMA30 && (
            <Line
              type="monotone"
              dataKey="movingAverage30"
              stroke="#a855f7"
              strokeWidth={2}
              dot={false}
              name="MA 30 días"
            />
          )}
        </LineChart>
      </ResponsiveContainer>

      {showMarkers && (cheatMealData.length > 0 || retentionData.length > 0) && (
        <div className="mt-4 flex gap-4 text-sm">
          {cheatMealData.length > 0 && (
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-orange-500"></div>
              <span className="text-slate-400">Cheat Meals ({cheatMealData.length})</span>
            </div>
          )}
          {retentionData.length > 0 && (
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-cyan-500"></div>
              <span className="text-slate-400">Retenciones ({retentionData.length})</span>
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
};
