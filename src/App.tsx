import React, { useState, useEffect } from 'react';
import { useWeightStore } from './store/useWeightStore';
import { useThemeStore } from './store/useThemeStore';
import { useNutritionLogStore } from './store/useNutritionLogStore';
import { useNutritionStore } from './store/useNutritionStore';
import { ProfileSetup } from './components/ProfileSetup';
import { Dashboard } from './components/Dashboard';
import { WeightChart } from './components/WeightChart';
import { WeightList } from './components/WeightList';
import { WeightEntryForm } from './components/WeightEntryForm';
import { ImportExport } from './components/ImportExport';
import { BulkPlanner } from './components/BulkPlanner';
import { NutritionEvaluation } from './components/NutritionEvaluation';
import { NutritionLog } from './components/NutritionLog';
import { Settings, BarChart3, List, Home, Download, Calculator, Sun, Moon, Dumbbell, Utensils, ClipboardList, Target, ChevronRight, Palette, Scale, Apple } from 'lucide-react';
import { motion } from 'framer-motion';

type View = 'dashboard' | 'chart' | 'list' | 'planner' | 'nutrition' | 'evaluation' | 'import-export' | 'settings';

function App() {
  const { profile, updateProfile, clearAllData } = useWeightStore();
  const { theme, toggleTheme } = useThemeStore();
  const { goals, setGoals } = useNutritionLogStore();
  const { calculatedData } = useNutritionStore();
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [settingsSection, setSettingsSection] = useState<string | null>(null);

  useEffect(() => {
    document.documentElement.className = `theme-${theme}`;
    document.body.className = `theme-${theme}`;
  }, [theme]);

  if (!profile) {
    return (
      <div className={`theme-${theme}`}>
        <ProfileSetup />
      </div>
    );
  }

  const goalEmoji = profile.goalType === 'bulk' ? '💪' : profile.goalType === 'cut' ? '🔥' : '⚖️';

  const navItems: Array<{ view: View; icon: React.ReactNode; label: string }> = [
    { view: 'dashboard', icon: <Home className="w-5 h-5" />, label: 'Inicio' },
    { view: 'chart', icon: <BarChart3 className="w-5 h-5" />, label: 'Gráficas' },
    { view: 'list', icon: <List className="w-5 h-5" />, label: 'Historial' },
    { view: 'planner', icon: <Calculator className="w-5 h-5" />, label: 'Planificador' },
    { view: 'nutrition', icon: <Utensils className="w-5 h-5" />, label: 'Nutrición' },
    { view: 'evaluation', icon: <ClipboardList className="w-5 h-5" />, label: 'Evaluación' },
    { view: 'import-export', icon: <Download className="w-5 h-5" />, label: 'Datos' },
    { view: 'settings', icon: <Settings className="w-5 h-5" />, label: 'Ajustes' },
  ];

  return (
    <div className={`min-h-screen theme-${theme} transition-all duration-300`}>
      {/* Static Background - optimized for performance */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className={`absolute -top-40 -right-40 w-80 h-80 rounded-full opacity-15 ${
          theme === 'dark' ? 'bg-blue-500/50' : 'bg-blue-400/30'
        }`} style={{ filter: 'blur(60px)' }} />
        <div className={`absolute -bottom-40 -left-40 w-80 h-80 rounded-full opacity-15 ${
          theme === 'dark' ? 'bg-cyan-500/50' : 'bg-cyan-400/30'
        }`} style={{ filter: 'blur(60px)' }} />
      </div>

      {/* Header */}
      <header className="glass sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-xl ${theme === 'dark' ? 'bg-blue-500/20' : 'bg-blue-500/10'}`}>
                <Dumbbell className={`w-6 h-6 ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`} />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-theme-primary">
                  Fitness App Pro
                </h1>
                <p className="text-theme-secondary text-sm">
                  {profile.name} {goalEmoji} • {profile.currentWeight.toFixed(1)} kg
                </p>
              </div>
            </div>
            <button
              onClick={toggleTheme}
              className={`p-3 rounded-xl glass-button ${
                theme === 'dark'
                  ? 'text-yellow-400 hover:bg-yellow-400/10'
                  : 'text-slate-700 hover:bg-slate-200/50'
              }`}
              title={theme === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
            >
              {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="glass border-t-0">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex gap-2 overflow-x-auto py-2">
            {navItems.map((item) => (
              <button
                key={item.view}
                onClick={() => setCurrentView(item.view)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all whitespace-nowrap ${
                  currentView === item.view
                    ? theme === 'dark'
                      ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                      : 'bg-blue-500/20 text-blue-600 border border-blue-500/30'
                    : theme === 'dark'
                      ? 'text-slate-400 hover:text-white hover:bg-white/5'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-900/5'
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
      <main className="max-w-7xl mx-auto px-4 py-6 relative z-10">
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

          {currentView === 'nutrition' && <NutritionLog />}

          {currentView === 'evaluation' && <NutritionEvaluation />}

          {currentView === 'import-export' && <ImportExport />}

          {currentView === 'settings' && (
            <div className="glass-card p-4 space-y-2">
              <h2 className="text-xl font-bold text-theme-primary mb-4 flex items-center gap-2">
                <Settings className="w-5 h-5" /> Configuración
              </h2>

              {/* Tema de la App */}
              <button
                onClick={() => setSettingsSection(settingsSection === 'theme' ? null : 'theme')}
                className={`w-full flex items-center justify-between p-4 rounded-xl transition-all ${
                  theme === 'dark' ? 'bg-slate-800/50 hover:bg-slate-700/50' : 'bg-slate-100 hover:bg-slate-200'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Palette className="w-5 h-5 text-purple-500" />
                  <div className="text-left">
                    <p className="font-medium text-theme-primary">Tema de la App</p>
                    <p className="text-xs text-theme-muted">{theme === 'dark' ? 'Oscuro' : 'Claro'}</p>
                  </div>
                </div>
                <ChevronRight className={`w-5 h-5 text-theme-muted transition-transform ${settingsSection === 'theme' ? 'rotate-90' : ''}`} />
              </button>
              {settingsSection === 'theme' && (
                <div className={`p-4 rounded-xl ${theme === 'dark' ? 'bg-slate-900/50' : 'bg-white'}`}>
                  <div className="flex gap-3">
                    <button
                      onClick={() => useThemeStore.getState().setTheme('dark')}
                      className={`flex-1 p-3 rounded-xl border transition-all flex items-center justify-center gap-2 ${
                        theme === 'dark' ? 'border-blue-500 bg-blue-500/20 text-blue-400' : 'border-slate-300'
                      }`}
                    >
                      <Moon className="w-4 h-4" /> Oscuro
                    </button>
                    <button
                      onClick={() => useThemeStore.getState().setTheme('light')}
                      className={`flex-1 p-3 rounded-xl border transition-all flex items-center justify-center gap-2 ${
                        theme === 'light' ? 'border-blue-500 bg-blue-500/20 text-blue-600' : 'border-slate-600'
                      }`}
                    >
                      <Sun className="w-4 h-4" /> Claro
                    </button>
                  </div>
                </div>
              )}

              {/* Objetivo de Peso */}
              <button
                onClick={() => setSettingsSection(settingsSection === 'goal' ? null : 'goal')}
                className={`w-full flex items-center justify-between p-4 rounded-xl transition-all ${
                  theme === 'dark' ? 'bg-slate-800/50 hover:bg-slate-700/50' : 'bg-slate-100 hover:bg-slate-200'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Scale className="w-5 h-5 text-green-500" />
                  <div className="text-left">
                    <p className="font-medium text-theme-primary">Objetivo de Peso</p>
                    <p className="text-xs text-theme-muted">
                      {profile.goalType === 'bulk' ? '💪 Volumen' : profile.goalType === 'cut' ? '🔥 Definición' : '⚖️ Mantenimiento'}
                      {profile.targetWeight ? ` • ${profile.targetWeight} kg` : ''}
                    </p>
                  </div>
                </div>
                <ChevronRight className={`w-5 h-5 text-theme-muted transition-transform ${settingsSection === 'goal' ? 'rotate-90' : ''}`} />
              </button>
              {settingsSection === 'goal' && (
                <div className={`p-4 rounded-xl space-y-3 ${theme === 'dark' ? 'bg-slate-900/50' : 'bg-white'}`}>
                  <div>
                    <label className="block text-xs text-theme-muted mb-1">Tipo de objetivo</label>
                    <select
                      value={profile.goalType}
                      onChange={(e) => updateProfile({ goalType: e.target.value as any })}
                      className="w-full input-glass rounded-xl px-3 py-2 text-sm"
                    >
                      <option value="bulk">💪 Volumen</option>
                      <option value="cut">🔥 Definición</option>
                      <option value="maintenance">⚖️ Mantenimiento</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-theme-muted mb-1">Peso objetivo (kg)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={profile.targetWeight || ''}
                      onChange={(e) => updateProfile({ targetWeight: e.target.value ? parseFloat(e.target.value) : undefined })}
                      placeholder="Opcional"
                      className="w-full input-glass rounded-xl px-3 py-2 text-sm"
                    />
                  </div>
                </div>
              )}

              {/* Objetivos de Nutrición */}
              <button
                onClick={() => setSettingsSection(settingsSection === 'nutrition' ? null : 'nutrition')}
                className={`w-full flex items-center justify-between p-4 rounded-xl transition-all ${
                  theme === 'dark' ? 'bg-slate-800/50 hover:bg-slate-700/50' : 'bg-slate-100 hover:bg-slate-200'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Target className="w-5 h-5 text-blue-500" />
                  <div className="text-left">
                    <p className="font-medium text-theme-primary">Objetivos de Nutrición</p>
                    <p className="text-xs text-theme-muted">{goals.calories} kcal • {goals.protein}p • {goals.carbs}c • {goals.fat}g</p>
                  </div>
                </div>
                <ChevronRight className={`w-5 h-5 text-theme-muted transition-transform ${settingsSection === 'nutrition' ? 'rotate-90' : ''}`} />
              </button>
              {settingsSection === 'nutrition' && (
                <div className={`p-4 rounded-xl space-y-3 ${theme === 'dark' ? 'bg-slate-900/50' : 'bg-white'}`}>
                  {calculatedData && (
                    <button
                      onClick={() => setGoals({
                        calories: calculatedData.tdee,
                        protein: Math.round(calculatedData.macros.maintenance.protein),
                        carbs: Math.round(calculatedData.macros.maintenance.carbs),
                        fat: Math.round(calculatedData.macros.maintenance.fat),
                        water: goals.water,
                        source: 'evaluation'
                      })}
                      className="w-full p-2 rounded-xl bg-purple-500/20 text-purple-400 text-xs font-medium"
                    >
                      ✨ Usar datos de Evaluación
                    </button>
                  )}
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs text-theme-muted mb-1">Calorías</label>
                      <input type="number" value={goals.calories} onChange={(e) => setGoals({ ...goals, calories: Number(e.target.value) })} className="w-full input-glass rounded-lg px-2 py-1.5 text-sm" />
                    </div>
                    <div>
                      <label className="block text-xs text-theme-muted mb-1">Proteína (g)</label>
                      <input type="number" value={goals.protein} onChange={(e) => setGoals({ ...goals, protein: Number(e.target.value) })} className="w-full input-glass rounded-lg px-2 py-1.5 text-sm" />
                    </div>
                    <div>
                      <label className="block text-xs text-theme-muted mb-1">Carbos (g)</label>
                      <input type="number" value={goals.carbs} onChange={(e) => setGoals({ ...goals, carbs: Number(e.target.value) })} className="w-full input-glass rounded-lg px-2 py-1.5 text-sm" />
                    </div>
                    <div>
                      <label className="block text-xs text-theme-muted mb-1">Grasas (g)</label>
                      <input type="number" value={goals.fat} onChange={(e) => setGoals({ ...goals, fat: Number(e.target.value) })} className="w-full input-glass rounded-lg px-2 py-1.5 text-sm" />
                    </div>
                  </div>
                </div>
              )}

              {/* Comidas */}
              <button
                onClick={() => setSettingsSection(settingsSection === 'meals' ? null : 'meals')}
                className={`w-full flex items-center justify-between p-4 rounded-xl transition-all ${
                  theme === 'dark' ? 'bg-slate-800/50 hover:bg-slate-700/50' : 'bg-slate-100 hover:bg-slate-200'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Apple className="w-5 h-5 text-orange-500" />
                  <div className="text-left">
                    <p className="font-medium text-theme-primary">Configurar Comidas</p>
                    <p className="text-xs text-theme-muted">Personalizar nombres de comidas</p>
                  </div>
                </div>
                <ChevronRight className={`w-5 h-5 text-theme-muted transition-transform ${settingsSection === 'meals' ? 'rotate-90' : ''}`} />
              </button>
              {settingsSection === 'meals' && (
                <div className={`p-4 rounded-xl space-y-2 ${theme === 'dark' ? 'bg-slate-900/50' : 'bg-white'}`}>
                  {(['breakfast', 'lunch', 'dinner', 'snacks', 'pre_workout', 'post_workout'] as const).map((mealType) => {
                    const { mealNames, setMealName } = useNutritionLogStore.getState();
                    const defaultNames: Record<string, string> = {
                      breakfast: 'Desayuno', lunch: 'Almuerzo', dinner: 'Cena',
                      snacks: 'Snacks', pre_workout: 'Pre-entreno', post_workout: 'Post-entreno'
                    };
                    const emojis: Record<string, string> = {
                      breakfast: '🌅', lunch: '☀️', dinner: '🌙',
                      snacks: '🍿', pre_workout: '💪', post_workout: '🥤'
                    };
                    return (
                      <div key={mealType} className="flex items-center gap-2">
                        <span className="text-lg">{emojis[mealType]}</span>
                        <input
                          type="text"
                          value={mealNames[mealType] || defaultNames[mealType]}
                          onChange={(e) => setMealName(mealType, e.target.value)}
                          className="flex-1 input-glass rounded-lg px-2 py-1.5 text-sm"
                        />
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Eliminar datos */}
              <div className="pt-4">
                <button
                  onClick={() => {
                    if (confirm('¿Eliminar todos los datos? Esta acción no se puede deshacer.')) {
                      clearAllData();
                    }
                  }}
                  className="w-full bg-red-500/20 hover:bg-red-500/30 text-red-400 font-medium py-3 rounded-xl transition-all text-sm"
                >
                  Eliminar Todos los Datos
                </button>
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
