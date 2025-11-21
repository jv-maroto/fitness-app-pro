import React, { useState } from 'react';
import { useWeightStore } from '../store/useWeightStore';
import { useThemeStore } from '../store/useThemeStore';
import { RefreshCw, CheckCircle, AlertCircle, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const RecalculateStats: React.FC = () => {
  const { entries, profile, updateProfile } = useWeightStore();
  const { theme } = useThemeStore();
  const [isRecalculating, setIsRecalculating] = useState(false);
  const [status, setStatus] = useState<{
    type: 'success' | 'error' | null;
    message: string;
  }>({ type: null, message: '' });

  const handleRecalculate = () => {
    if (!profile || entries.length === 0) {
      setStatus({
        type: 'error',
        message: 'No hay datos para recalcular',
      });
      setTimeout(() => setStatus({ type: null, message: '' }), 3000);
      return;
    }

    setIsRecalculating(true);

    setTimeout(() => {
      try {
        const validEntries = entries.filter(e => !e.isCheatMeal && !e.isRetention);
        const latestValidEntry = validEntries.length > 0 ? validEntries[0] : entries[0];

        updateProfile({
          currentWeight: latestValidEntry.weight,
          updatedAt: new Date(),
        });

        setStatus({
          type: 'success',
          message: `Estadísticas recalculadas correctamente (${entries.length} registros procesados)`,
        });

        setIsRecalculating(false);

        setTimeout(() => setStatus({ type: null, message: '' }), 5000);
      } catch (error: any) {
        setStatus({
          type: 'error',
          message: `Error al recalcular: ${error.message}`,
        });
        setIsRecalculating(false);
        setTimeout(() => setStatus({ type: null, message: '' }), 5000);
      }
    }, 1500);
  };

  return (
    <div className="space-y-4">
      <div className={`glass-card p-6 ${
        theme === 'dark'
          ? 'bg-gradient-to-br from-indigo-900/20 to-purple-900/20'
          : 'bg-gradient-to-br from-indigo-100/50 to-purple-100/50'
      }`}>
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
              theme === 'dark' ? 'bg-indigo-600' : 'bg-indigo-500'
            }`}>
              <RefreshCw className="w-6 h-6 text-white" />
            </div>
          </div>

          <div className="flex-1">
            <h3 className="text-lg font-semibold text-theme-primary mb-2">
              Recalcular Estadísticas
            </h3>
            <p className="text-theme-muted text-sm mb-4">
              Recalcula todas las métricas basándose en tus datos actuales:
            </p>
            <ul className="text-theme-muted text-sm space-y-1 mb-4">
              <li>• Medias móviles (7, 14 y 30 días)</li>
              <li>• Cambio semanal y mensual</li>
              <li>• Consistencia de registro</li>
              <li>• Proyecciones y estimaciones</li>
              <li>• Peso actual del perfil</li>
              <li>• Insights inteligentes</li>
            </ul>

            <div className={`rounded-xl p-3 mb-4 ${
              theme === 'dark'
                ? 'bg-yellow-900/20 border border-yellow-500/30'
                : 'bg-yellow-100/50 border border-yellow-400/50'
            }`}>
              <p className={`text-sm ${theme === 'dark' ? 'text-yellow-400' : 'text-yellow-700'}`}>
                <strong>¿Cuándo usar esto?</strong><br />
                • Después de importar datos desde CSV/JSON<br />
                • Si notas inconsistencias en las estadísticas<br />
                • Si importaste datos con algoritmos diferentes<br />
                • Para verificar que todo esté actualizado
              </p>
            </div>

            <button
              onClick={handleRecalculate}
              disabled={isRecalculating || entries.length === 0}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all ${
                isRecalculating
                  ? theme === 'dark'
                    ? 'bg-indigo-800 text-indigo-300 cursor-not-allowed'
                    : 'bg-indigo-200 text-indigo-400 cursor-not-allowed'
                  : entries.length === 0
                  ? theme === 'dark'
                    ? 'bg-slate-700 text-slate-500 cursor-not-allowed'
                    : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  : theme === 'dark'
                    ? 'bg-indigo-600 hover:bg-indigo-700 text-white transform hover:scale-105'
                    : 'bg-indigo-500 hover:bg-indigo-600 text-white transform hover:scale-105'
              }`}
            >
              <RefreshCw className={`w-5 h-5 ${isRecalculating ? 'animate-spin' : ''}`} />
              {isRecalculating ? 'Recalculando...' : 'Recalcular Ahora'}
            </button>

            {entries.length === 0 && (
              <p className="text-theme-muted text-sm mt-2">
                No hay registros para recalcular
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Info adicional */}
      <div className="glass-card p-4">
        <h4 className="text-theme-primary font-medium mb-2 text-sm flex items-center gap-2">
          <Info className="w-4 h-4" /> Información Técnica
        </h4>
        <div className="text-theme-muted text-xs space-y-1">
          <p>• <strong>Medias móviles:</strong> Se calculan en tiempo real excluyendo cheat meals y retenciones</p>
          <p>• <strong>Cambio semanal:</strong> Basado en la tendencia de peso a lo largo del tiempo</p>
          <p>• <strong>Consistencia:</strong> Porcentaje de días con registro desde el inicio</p>
          <p>• <strong>Proyecciones:</strong> Estimaciones basadas en tu tendencia actual (mínimo 7 registros válidos)</p>
          <p>• <strong>Peso actual:</strong> Se sincroniza con el último registro válido (no marcado como cheat/retención)</p>
        </div>
      </div>

      {/* Status Message */}
      <AnimatePresence>
        {status.type && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl border ${
              status.type === 'success'
                ? theme === 'dark'
                  ? 'bg-green-900/30 border-green-500/50 text-green-200'
                  : 'bg-green-100 border-green-400 text-green-700'
                : theme === 'dark'
                  ? 'bg-red-900/30 border-red-500/50 text-red-200'
                  : 'bg-red-100 border-red-400 text-red-700'
            }`}
          >
            {status.type === 'success' ? (
              <CheckCircle className="w-5 h-5 flex-shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
            )}
            <span className="text-sm font-medium">{status.message}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
