import React, { useState } from 'react';
import { useWeightStore } from './store/useWeightStore';
import { ProfileSetup } from './components/ProfileSetup';
import { Dashboard } from './components/Dashboard';
import { WeightChart } from './components/WeightChart';
import { WeightList } from './components/WeightList';
import { WeightEntryForm } from './components/WeightEntryForm';
import { ImportExport } from './components/ImportExport';
import { BulkPlanner } from './components/BulkPlanner';
import { Settings, BarChart3, List, Home, Download, Calculator } from 'lucide-react';
import { motion } from 'framer-motion';

type View = 'dashboard' | 'chart' | 'list' | 'planner' | 'import-export' | 'settings';

function App() {
  const { profile, updateProfile, clearAllData } = useWeightStore();
  const [currentView, setCurrentView] = useState<View>('dashboard');

  if (!profile) {
    return <ProfileSetup />;
  }

  const goalEmoji = profile.goalType === 'bulk' ? '💪' : profile.goalType === 'cut' ? '🔥' : '⚖️';

  const navItems: Array<{ view: View; icon: React.ReactNode; label: string }> = [
    { view: 'dashboard', icon: <Home className="w-5 h-5" />, label: 'Inicio' },
    { view: 'chart', icon: <BarChart3 className="w-5 h-5" />, label: 'Gráficas' },
    { view: 'list', icon: <List className="w-5 h-5" />, label: 'Historial' },
    { view: 'planner', icon: <Calculator className="w-5 h-5" />, label: 'Planificador' },
    { view: 'import-export', icon: <Download className="w-5 h-5" />, label: 'Importar/Exportar' },
    { view: 'settings', icon: <Settings className="w-5 h-5" />, label: 'Ajustes' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <header className="bg-slate-800/50 backdrop-blur-xl border-b border-slate-700/50 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                🎯 Weight Tracker Pro
              </h1>
              <p className="text-slate-400 text-sm">
                {profile.name} {goalEmoji} • {profile.currentWeight.toFixed(1)} kg
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-slate-400 text-sm hidden sm:inline">Vista:</span>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-slate-800/30 backdrop-blur-xl border-b border-slate-700/50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex gap-2 overflow-x-auto py-2">
            {navItems.map((item) => (
              <button
                key={item.view}
                onClick={() => setCurrentView(item.view)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap ${
                  currentView === item.view
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        <motion.div
          key={currentView}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {currentView === 'dashboard' && <Dashboard />}

          {currentView === 'chart' && (
            <div className="space-y-6">
              <WeightChart />
            </div>
          )}

          {currentView === 'list' && <WeightList />}

          {currentView === 'planner' && <BulkPlanner />}

          {currentView === 'import-export' && <ImportExport />}

          {currentView === 'settings' && (
            <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl p-6 border border-slate-700/50 space-y-6">
              <div>
                <h2 className="text-xl font-bold text-white mb-4">⚙️ Configuración</h2>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-slate-300 text-sm font-medium mb-2">
                    Objetivo Actual
                  </label>
                  <select
                    value={profile.goalType}
                    onChange={(e) => updateProfile({ goalType: e.target.value as any })}
                    className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="bulk">💪 Volumen</option>
                    <option value="cut">🔥 Definición</option>
                    <option value="maintenance">⚖️ Mantenimiento</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 text-sm font-medium mb-2">
                    Peso Objetivo (kg)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={profile.targetWeight || ''}
                    onChange={(e) =>
                      updateProfile({
                        targetWeight: e.target.value ? parseFloat(e.target.value) : undefined,
                      })
                    }
                    placeholder="Opcional"
                    className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="pt-4 border-t border-slate-700">
                  <button
                    onClick={() => {
                      if (
                        confirm(
                          '¿Estás seguro de que quieres eliminar todos los datos? Esta acción no se puede deshacer.'
                        )
                      ) {
                        clearAllData();
                      }
                    }}
                    className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3 rounded-lg transition-colors"
                  >
                    🗑️ Eliminar Todos los Datos
                  </button>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </main>

      {/* Floating Action Button */}
      <WeightEntryForm />
    </div>
  );
}

export default App;
