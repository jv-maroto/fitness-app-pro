import React, { useState } from 'react';
import { useThemeStore } from '../store/useThemeStore';
import { useNutritionStore } from '../store/useNutritionStore';
import { useWeightStore } from '../store/useWeightStore';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calculator,
  Activity,
  Dumbbell,
  Flame,
  Target,
  TrendingUp,
  ChevronRight,
  ChevronLeft,
  Check,
  Scale,
  Zap,
  Utensils,
  RefreshCw,
  Calendar,
  AlertTriangle,
} from 'lucide-react';
import { CustomSelect } from './CustomSelect';
import { calculateTrainingYears, getExperienceLevel, calculateMuscularPotential } from '../utils/nutrition';
import { DietPhase, CardioDetail } from '../types';

const CARDIO_TYPES = [
  { value: 'walking', label: 'Caminar ligero (3-5 km/h)' },
  { value: 'fast_walking', label: 'Caminar rápido (5-7 km/h)' },
  { value: 'jogging', label: 'Trotar suave' },
  { value: 'running', label: 'Correr' },
  { value: 'hiit', label: 'HIIT (Alta intensidad)' },
  { value: 'cycling', label: 'Bicicleta' },
  { value: 'elliptical', label: 'Elíptica' },
  { value: 'mixed', label: 'Combinado/Mixto' },
];

const emptyCardio: CardioDetail = {
  type: 'walking',
  daysPerWeek: 3,
  minutesPerSession: 30,
  intensity: 5,
  description: '',
};

const emptyPhase = (num: number): DietPhase => ({
  phaseNumber: num,
  startDate: new Date(),
  startWeight: 80,
  wentToGym: false,
  didCardio: false,
  hadRelapses: false,
});

export const NutritionEvaluation: React.FC = () => {
  const { theme } = useThemeStore();
  const { evaluation, calculatedData, createEvaluation, clearEvaluation } = useNutritionStore();
  const { profile } = useWeightStore();

  const [step, setStep] = useState(1);
  const totalSteps = 6;

  const [formData, setFormData] = useState({
    // Paso 1: Datos básicos
    age: profile?.age || 25,
    gender: (profile?.gender || 'male') as 'male' | 'female',
    height: profile?.height || 175,
    weight: profile?.currentWeight || 75,
    gymStartDate: new Date().toISOString().split('T')[0],

    // Paso 2: Pliegues
    triceps: 10, subscapular: 12, chest: 8, axillary: 10,
    abdominal: 15, suprailiac: 12, thigh: 14,

    // Paso 3: Historial de peso
    hasLostWeightRecently: false,
    dietPhasesCount: 0,
    dietPhases: [] as DietPhase[],

    // Paso 4: Reverse Diet
    isInReverseDiet: false,
    reverseStartDate: new Date().toISOString().split('T')[0],
    reverseWeeksElapsed: 4,
    reverseStartCalories: 1500,
    reverseCurrentCalories: 2000,
    reverseWeeklyIncrement: 100,
    reverseTargetCalories: 2800,
    reverseStartWeight: 70,
    reverseCurrentWeight: 71,
    reverseNotes: '',

    // Paso 5: Bulk activo
    isInBulk: false,
    bulkCalories: 3000,
    bulkWeeklyGain: 0.3,
    bulkWeeks: 8,

    // Paso 6: Actividad actual
    trainingDaysPerWeek: 4,
    hoursPerSession: 1.5,
    doesCardio: false,
    currentCardio: { ...emptyCardio },
    dailyActivity: 'sedentary' as const,
    currentPhase: (profile?.goalType || 'maintenance') as 'bulk' | 'cut' | 'maintenance' | 'reverse',
  });

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handlePhaseChange = (index: number, field: string, value: any) => {
    setFormData((prev) => {
      const newPhases = [...prev.dietPhases];
      newPhases[index] = { ...newPhases[index], [field]: value };
      return { ...prev, dietPhases: newPhases };
    });
  };

  const handlePhaseCardioChange = (index: number, field: string, value: any) => {
    setFormData((prev) => {
      const newPhases = [...prev.dietPhases];
      const cardio = newPhases[index].cardioDetails || { ...emptyCardio };
      newPhases[index] = { ...newPhases[index], cardioDetails: { ...cardio, [field]: value } };
      return { ...prev, dietPhases: newPhases };
    });
  };

  const updatePhasesCount = (count: number) => {
    const newPhases: DietPhase[] = [];
    for (let i = 0; i < count; i++) {
      newPhases.push(formData.dietPhases[i] || emptyPhase(i + 1));
    }
    setFormData((prev) => ({ ...prev, dietPhasesCount: count, dietPhases: newPhases }));
  };

  const handleSubmit = () => {
    createEvaluation({
      age: formData.age,
      gender: formData.gender,
      height: formData.height,
      weight: formData.weight,
      gymStartDate: new Date(formData.gymStartDate),
      skinFolds: {
        triceps: formData.triceps, subscapular: formData.subscapular, chest: formData.chest,
        axillary: formData.axillary, abdominal: formData.abdominal, suprailiac: formData.suprailiac, thigh: formData.thigh,
      },
      hasLostWeightRecently: formData.hasLostWeightRecently,
      dietPhasesCount: formData.dietPhasesCount,
      dietPhases: formData.dietPhases,
      reverseDiet: {
        isCurrentlyDoing: formData.isInReverseDiet,
        startDate: formData.isInReverseDiet ? new Date(formData.reverseStartDate) : undefined,
        weeksElapsed: formData.isInReverseDiet ? formData.reverseWeeksElapsed : undefined,
        startCalories: formData.isInReverseDiet ? formData.reverseStartCalories : undefined,
        currentCalories: formData.isInReverseDiet ? formData.reverseCurrentCalories : undefined,
        weeklyIncrement: formData.isInReverseDiet ? formData.reverseWeeklyIncrement : undefined,
        targetCalories: formData.isInReverseDiet ? formData.reverseTargetCalories : undefined,
        startWeight: formData.isInReverseDiet ? formData.reverseStartWeight : undefined,
        currentWeight: formData.isInReverseDiet ? formData.reverseCurrentWeight : undefined,
        notes: formData.isInReverseDiet ? formData.reverseNotes : undefined,
      },
      activeBulk: {
        isCurrentlyDoing: formData.isInBulk,
        currentCalories: formData.isInBulk ? formData.bulkCalories : undefined,
        weeklyGain: formData.isInBulk ? formData.bulkWeeklyGain : undefined,
        weeksInBulk: formData.isInBulk ? formData.bulkWeeks : undefined,
      },
      trainingDaysPerWeek: formData.trainingDaysPerWeek,
      hoursPerSession: formData.hoursPerSession,
      doesCardio: formData.doesCardio,
      currentCardio: formData.doesCardio ? formData.currentCardio : undefined,
      dailyActivity: formData.dailyActivity,
      currentPhase: formData.currentPhase,
    });
  };

  // Si ya hay evaluación, mostrar resultados
  if (evaluation && calculatedData) {
    const trainingYears = calculateTrainingYears(evaluation.gymStartDate);
    const experienceLevel = getExperienceLevel(trainingYears);
    const potential = calculateMuscularPotential(evaluation.height, trainingYears);

    return (
      <div className="space-y-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className={`glass-card p-6 ${theme === 'dark' ? 'bg-gradient-to-br from-cyan-900/20 to-blue-900/20' : 'bg-gradient-to-br from-cyan-100/50 to-blue-100/50'}`}>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-theme-primary flex items-center gap-2">
              <Calculator className={`w-6 h-6 ${theme === 'dark' ? 'text-cyan-400' : 'text-cyan-600'}`} />
              Evaluación Nutricional Pro
            </h2>
            <button onClick={clearEvaluation}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium ${theme === 'dark' ? 'bg-slate-700/50 hover:bg-slate-600/50 text-slate-300' : 'bg-slate-200/50 hover:bg-slate-300/50 text-slate-700'}`}>
              <RefreshCw className="w-4 h-4" /> Nueva Evaluación
            </button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className={`p-4 rounded-xl ${theme === 'dark' ? 'bg-slate-800/50' : 'bg-white/50'}`}>
              <div className="flex items-center gap-2 text-theme-muted text-sm mb-1"><Scale className="w-4 h-4" />Peso</div>
              <div className="text-2xl font-bold text-theme-primary">{evaluation.weight} kg</div>
            </div>
            <div className={`p-4 rounded-xl ${theme === 'dark' ? 'bg-slate-800/50' : 'bg-white/50'}`}>
              <div className="flex items-center gap-2 text-theme-muted text-sm mb-1"><Activity className="w-4 h-4" />% Grasa</div>
              <div className={`text-2xl font-bold ${calculatedData.bodyFatPercentage < 15 ? 'text-green-500' : calculatedData.bodyFatPercentage < 20 ? 'text-yellow-500' : 'text-orange-500'}`}>
                {calculatedData.bodyFatPercentage.toFixed(1)}%
              </div>
            </div>
            <div className={`p-4 rounded-xl ${theme === 'dark' ? 'bg-slate-800/50' : 'bg-white/50'}`}>
              <div className="flex items-center gap-2 text-theme-muted text-sm mb-1"><Dumbbell className="w-4 h-4" />Masa Magra</div>
              <div className="text-2xl font-bold text-theme-primary">{calculatedData.leanMass.toFixed(1)} kg</div>
            </div>
            <div className={`p-4 rounded-xl ${theme === 'dark' ? 'bg-slate-800/50' : 'bg-white/50'}`}>
              <div className="flex items-center gap-2 text-theme-muted text-sm mb-1"><Flame className="w-4 h-4" />Masa Grasa</div>
              <div className="text-2xl font-bold text-theme-primary">{calculatedData.fatMass.toFixed(1)} kg</div>
            </div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card p-6">
          <h3 className="text-xl font-bold text-theme-primary mb-4 flex items-center gap-2">
            <Zap className={`w-5 h-5 ${theme === 'dark' ? 'text-yellow-400' : 'text-yellow-600'}`} /> Metabolismo
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <div className="text-theme-muted text-sm mb-2">BMR (Metabolismo Basal)</div>
              <div className="text-3xl font-bold text-theme-primary mb-4">{calculatedData.bmr} kcal/día</div>
              <div className="text-theme-muted text-sm mb-2">TDEE (Gasto Total Diario)</div>
              <div className={`text-4xl font-bold ${theme === 'dark' ? 'text-cyan-400' : 'text-cyan-600'}`}>
                {calculatedData.realTdee || calculatedData.tdee} kcal/día
              </div>
              {calculatedData.realTdee && <div className="text-sm text-theme-muted mt-1">Calculado: {calculatedData.tdee} | Real: {calculatedData.realTdee}</div>}
            </div>
            <div className={`p-4 rounded-xl ${theme === 'dark' ? 'bg-slate-800/30' : 'bg-slate-100/50'}`}>
              <div className="text-sm font-medium text-theme-secondary mb-3">Desglose</div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-theme-muted">BMR</span><span className="font-medium">{calculatedData.tdeeBreakdown.bmr} kcal</span></div>
                <div className="flex justify-between"><span className="text-theme-muted">NEAT</span><span className="font-medium">{calculatedData.tdeeBreakdown.neat} kcal</span></div>
                <div className="flex justify-between"><span className="text-theme-muted">Pesas</span><span className="font-medium">{calculatedData.tdeeBreakdown.weights} kcal</span></div>
                <div className="flex justify-between"><span className="text-theme-muted">Cardio</span><span className="font-medium">{calculatedData.tdeeBreakdown.cardio} kcal</span></div>
              </div>
            </div>
          </div>
        </motion.div>

        {evaluation.hasLostWeightRecently && evaluation.dietPhases.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="glass-card p-6">
            <h3 className="text-xl font-bold text-theme-primary mb-4 flex items-center gap-2">
              <TrendingUp className={`w-5 h-5 ${theme === 'dark' ? 'text-orange-400' : 'text-orange-600'}`} /> Historial de Fases
            </h3>
            <div className="space-y-4">
              {evaluation.dietPhases.map((phase, idx) => (
                <div key={idx} className={`p-4 rounded-xl ${theme === 'dark' ? 'bg-slate-800/30' : 'bg-slate-100/50'}`}>
                  <div className="font-semibold text-theme-primary mb-2">Fase {phase.phaseNumber}</div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                    <div><span className="text-theme-muted">Inicio:</span> {phase.startWeight} kg</div>
                    {phase.endWeight && <div><span className="text-theme-muted">Fin:</span> {phase.endWeight} kg</div>}
                    <div><span className="text-theme-muted">Gym:</span> {phase.wentToGym ? 'Sí' : 'No'}</div>
                    <div><span className="text-theme-muted">Cardio:</span> {phase.didCardio ? 'Sí' : 'No'}</div>
                  </div>
                  {phase.hadRelapses && (
                    <div className={`mt-2 p-2 rounded-lg text-sm ${theme === 'dark' ? 'bg-yellow-900/20 text-yellow-400' : 'bg-yellow-100 text-yellow-700'}`}>
                      <AlertTriangle className="w-4 h-4 inline mr-1" />
                      {phase.relapseCount} rebote(s), +{phase.totalWeightGainedFromRelapses} kg
                    </div>
                  )}
                </div>
              ))}
            </div>
          </motion.div>
        )}

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-card p-6">
          <h3 className="text-xl font-bold text-theme-primary mb-4 flex items-center gap-2">
            <Utensils className={`w-5 h-5 ${theme === 'dark' ? 'text-green-400' : 'text-green-600'}`} /> Macros Recomendados
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {(['bulk', 'maintenance', 'cut'] as const).map((goal) => {
              const macros = calculatedData.macros[goal];
              const isActive = evaluation.currentPhase === goal;
              const labels = { bulk: 'Volumen (+300)', maintenance: 'Mantenimiento', cut: 'Definición (-400)' };
              const colors = { bulk: 'green', maintenance: 'blue', cut: 'orange' };
              return (
                <div key={goal} className={`p-5 rounded-xl border ${isActive ? `border-${colors[goal]}-500/50` : theme === 'dark' ? 'border-slate-700' : 'border-slate-200'}`}>
                  <div className={`font-semibold mb-3 text-${colors[goal]}-${theme === 'dark' ? '400' : '600'}`}>{labels[goal]}</div>
                  <div className="text-2xl font-bold text-theme-primary mb-3">{macros.calories} kcal</div>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between"><span className="text-theme-muted">Proteína</span><span className="font-medium">{macros.protein}g</span></div>
                    <div className="flex justify-between"><span className="text-theme-muted">Carbos</span><span className="font-medium">{macros.carbs}g</span></div>
                    <div className="flex justify-between"><span className="text-theme-muted">Grasas</span><span className="font-medium">{macros.fat}g</span></div>
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="glass-card p-6">
          <h3 className="text-xl font-bold text-theme-primary mb-4 flex items-center gap-2">
            <Target className={`w-5 h-5 ${theme === 'dark' ? 'text-purple-400' : 'text-purple-600'}`} /> Potencial y Experiencia
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className={`p-4 rounded-xl ${theme === 'dark' ? 'bg-slate-800/30' : 'bg-slate-100/50'}`}>
              <div className="text-theme-muted text-sm mb-1">Años entrenando</div>
              <div className="text-2xl font-bold text-theme-primary">{trainingYears.toFixed(1)}</div>
            </div>
            <div className={`p-4 rounded-xl ${theme === 'dark' ? 'bg-slate-800/30' : 'bg-slate-100/50'}`}>
              <div className="text-theme-muted text-sm mb-1">Nivel</div>
              <div className={`text-2xl font-bold ${experienceLevel === 'beginner' ? 'text-green-500' : experienceLevel === 'intermediate' ? 'text-blue-500' : 'text-purple-500'}`}>
                {experienceLevel === 'beginner' ? 'Principiante' : experienceLevel === 'intermediate' ? 'Intermedio' : 'Avanzado'}
              </div>
            </div>
            <div className={`p-4 rounded-xl ${theme === 'dark' ? 'bg-slate-800/30' : 'bg-slate-100/50'}`}>
              <div className="text-theme-muted text-sm mb-1">Ganancia esperada/año</div>
              <div className="text-2xl font-bold text-theme-primary">{potential.yearlyGain} kg</div>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  // ===== FORMULARIO =====
  const renderStep = () => {
    switch (step) {
      case 1: // Datos básicos
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-theme-primary mb-4">Datos Básicos</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-theme-secondary text-sm font-medium mb-2">Edad *</label>
                <input type="number" value={formData.age} onChange={(e) => handleChange('age', parseInt(e.target.value))} className="w-full input-glass rounded-xl px-4 py-3" />
              </div>
              <div>
                <label className="block text-theme-secondary text-sm font-medium mb-2">Sexo *</label>
                <CustomSelect value={formData.gender} onChange={(val) => handleChange('gender', val)} options={[{ value: 'male', label: 'Hombre' }, { value: 'female', label: 'Mujer' }]} />
              </div>
              <div>
                <label className="block text-theme-secondary text-sm font-medium mb-2">Altura (cm) *</label>
                <input type="number" value={formData.height} onChange={(e) => handleChange('height', parseFloat(e.target.value))} className="w-full input-glass rounded-xl px-4 py-3" />
              </div>
              <div>
                <label className="block text-theme-secondary text-sm font-medium mb-2">Peso actual (kg) *</label>
                <input type="number" step="0.1" value={formData.weight} onChange={(e) => handleChange('weight', parseFloat(e.target.value))} className="w-full input-glass rounded-xl px-4 py-3" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-theme-secondary text-sm font-medium mb-2"><Calendar className="w-4 h-4 inline mr-1" />¿Cuándo empezaste en el gym? *</label>
                <input type="date" value={formData.gymStartDate} onChange={(e) => handleChange('gymStartDate', e.target.value)} className="w-full input-glass rounded-xl px-4 py-3" />
              </div>
            </div>
          </div>
        );

      case 2: // Pliegues
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-theme-primary mb-2">Pliegues Cutáneos (mm)</h3>
            <p className="text-theme-muted text-sm mb-4">Método Jackson-Pollock 7-site</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { key: 'triceps', label: 'Tríceps', desc: 'Parte posterior del brazo' },
                { key: 'subscapular', label: 'Subescapular', desc: 'Debajo del omóplato' },
                { key: 'chest', label: 'Pecho', desc: 'Entre axila y pezón' },
                { key: 'axillary', label: 'Axilar', desc: 'Línea media axilar' },
                { key: 'abdominal', label: 'Abdominal', desc: '2cm del ombligo' },
                { key: 'suprailiac', label: 'Suprailiaco', desc: 'Encima cresta ilíaca' },
                { key: 'thigh', label: 'Muslo', desc: 'Parte frontal' },
              ].map((fold) => (
                <div key={fold.key} className={`p-3 rounded-xl ${theme === 'dark' ? 'bg-slate-800/30' : 'bg-slate-100/50'}`}>
                  <label className="block text-theme-primary text-sm font-medium mb-1">{fold.label} *</label>
                  <input type="number" step="0.5" min="1" max="60" value={formData[fold.key as keyof typeof formData] as number}
                    onChange={(e) => handleChange(fold.key, parseFloat(e.target.value))} className="w-full input-glass rounded-lg px-3 py-2 text-sm" />
                  <p className="text-theme-muted text-xs mt-1">{fold.desc}</p>
                </div>
              ))}
            </div>
          </div>
        );

      case 3: // Historial
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-theme-primary mb-4">Historial de Peso</h3>
            <div>
              <label className="block text-theme-secondary text-sm font-medium mb-2">¿Has bajado de peso recientemente? (últimos 12 meses) *</label>
              <CustomSelect value={formData.hasLostWeightRecently ? 'si' : 'no'}
                onChange={(val) => { handleChange('hasLostWeightRecently', val === 'si'); if (val === 'no') updatePhasesCount(0); }}
                options={[{ value: 'no', label: 'No' }, { value: 'si', label: 'Sí' }]} />
            </div>
            {formData.hasLostWeightRecently && (
              <div className={`p-4 rounded-xl ${theme === 'dark' ? 'bg-slate-800/30' : 'bg-slate-100/50'}`}>
                <label className="block text-theme-secondary text-sm font-medium mb-2">¿En cuántas fases bajaste de peso?</label>
                <CustomSelect value={formData.dietPhasesCount.toString()} onChange={(val) => updatePhasesCount(parseInt(val))}
                  options={[{ value: '0', label: 'Seleccionar...' }, { value: '1', label: 'Una fase (continua)' }, { value: '2', label: 'Dos fases (con break)' }, { value: '3', label: 'Tres o más' }]} />
                {formData.dietPhases.map((phase, idx) => (
                  <div key={idx} className={`mt-4 p-4 rounded-xl border-2 ${theme === 'dark' ? 'border-blue-500/30 bg-blue-900/10' : 'border-blue-300 bg-blue-50/50'}`}>
                    <h4 className={`text-lg font-bold mb-4 ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`}>Fase {idx + 1}</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-theme-secondary text-sm mb-1">Fecha inicio</label>
                        <input type="date" value={phase.startDate instanceof Date ? phase.startDate.toISOString().split('T')[0] : ''} onChange={(e) => handlePhaseChange(idx, 'startDate', new Date(e.target.value))} className="w-full input-glass rounded-lg px-3 py-2 text-sm" />
                      </div>
                      <div>
                        <label className="block text-theme-secondary text-sm mb-1">Fecha fin</label>
                        <input type="date" value={phase.endDate instanceof Date ? phase.endDate.toISOString().split('T')[0] : ''} onChange={(e) => handlePhaseChange(idx, 'endDate', e.target.value ? new Date(e.target.value) : undefined)} className="w-full input-glass rounded-lg px-3 py-2 text-sm" />
                      </div>
                      <div>
                        <label className="block text-theme-secondary text-sm mb-1">Peso inicio (kg)</label>
                        <input type="number" step="0.1" value={phase.startWeight} onChange={(e) => handlePhaseChange(idx, 'startWeight', parseFloat(e.target.value))} className="w-full input-glass rounded-lg px-3 py-2 text-sm" />
                      </div>
                      <div>
                        <label className="block text-theme-secondary text-sm mb-1">Peso fin (kg)</label>
                        <input type="number" step="0.1" value={phase.endWeight || ''} onChange={(e) => handlePhaseChange(idx, 'endWeight', e.target.value ? parseFloat(e.target.value) : undefined)} className="w-full input-glass rounded-lg px-3 py-2 text-sm" />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-theme-secondary text-sm mb-1">¿Fuiste al gym?</label>
                        <CustomSelect value={phase.wentToGym ? 'si' : 'no'} onChange={(val) => handlePhaseChange(idx, 'wentToGym', val === 'si')} options={[{ value: 'no', label: 'No' }, { value: 'si', label: 'Sí' }]} />
                      </div>
                      <div>
                        <label className="block text-theme-secondary text-sm mb-1">¿Hiciste cardio?</label>
                        <CustomSelect value={phase.didCardio ? 'si' : 'no'}
                          onChange={(val) => { handlePhaseChange(idx, 'didCardio', val === 'si'); if (val === 'si' && !phase.cardioDetails) handlePhaseChange(idx, 'cardioDetails', { ...emptyCardio }); }}
                          options={[{ value: 'no', label: 'No' }, { value: 'si', label: 'Sí' }]} />
                      </div>
                    </div>
                    {phase.didCardio && (
                      <div className={`p-3 rounded-lg mb-4 ${theme === 'dark' ? 'bg-slate-700/30' : 'bg-slate-200/50'}`}>
                        <div className="text-sm font-medium text-theme-secondary mb-2">Detalles del cardio</div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-theme-muted text-xs mb-1">Tipo</label>
                            <CustomSelect value={phase.cardioDetails?.type || 'walking'} onChange={(val) => handlePhaseCardioChange(idx, 'type', val)} options={CARDIO_TYPES} />
                          </div>
                          <div>
                            <label className="block text-theme-muted text-xs mb-1">Días/semana</label>
                            <input type="number" min="1" max="7" value={phase.cardioDetails?.daysPerWeek || 3} onChange={(e) => handlePhaseCardioChange(idx, 'daysPerWeek', parseInt(e.target.value))} className="w-full input-glass rounded-lg px-3 py-2 text-sm" />
                          </div>
                          <div>
                            <label className="block text-theme-muted text-xs mb-1">Minutos/sesión</label>
                            <input type="number" min="5" max="180" value={phase.cardioDetails?.minutesPerSession || 30} onChange={(e) => handlePhaseCardioChange(idx, 'minutesPerSession', parseInt(e.target.value))} className="w-full input-glass rounded-lg px-3 py-2 text-sm" />
                          </div>
                          <div>
                            <label className="block text-theme-muted text-xs mb-1">Intensidad: {phase.cardioDetails?.intensity || 5}/10</label>
                            <input type="range" min="1" max="10" value={phase.cardioDetails?.intensity || 5} onChange={(e) => handlePhaseCardioChange(idx, 'intensity', parseInt(e.target.value))} className="w-full" />
                          </div>
                        </div>
                        {phase.cardioDetails?.type === 'mixed' && (
                          <div className="mt-2">
                            <label className="block text-theme-muted text-xs mb-1">Describe tu cardio mixto</label>
                            <textarea value={phase.cardioDetails?.description || ''} onChange={(e) => handlePhaseCardioChange(idx, 'description', e.target.value)} placeholder="Ej: 20 min caminar + 10 min correr" className="w-full input-glass rounded-lg px-3 py-2 text-sm" rows={2} />
                          </div>
                        )}
                      </div>
                    )}
                    <div>
                      <label className="block text-theme-secondary text-sm mb-1">¿Hubo rebotes/recaídas?</label>
                      <CustomSelect value={phase.hadRelapses ? 'si' : 'no'} onChange={(val) => handlePhaseChange(idx, 'hadRelapses', val === 'si')} options={[{ value: 'no', label: 'No' }, { value: 'si', label: 'Sí' }]} />
                    </div>
                    {phase.hadRelapses && (
                      <div className={`mt-3 p-3 rounded-lg ${theme === 'dark' ? 'bg-yellow-900/20' : 'bg-yellow-100/50'}`}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-2">
                          <div>
                            <label className="block text-theme-muted text-xs mb-1">Número de rebotes</label>
                            <input type="number" min="1" value={phase.relapseCount || 1} onChange={(e) => handlePhaseChange(idx, 'relapseCount', parseInt(e.target.value))} className="w-full input-glass rounded-lg px-3 py-2 text-sm" />
                          </div>
                          <div>
                            <label className="block text-theme-muted text-xs mb-1">Peso ganado (kg)</label>
                            <input type="number" step="0.1" value={phase.totalWeightGainedFromRelapses || 0} onChange={(e) => handlePhaseChange(idx, 'totalWeightGainedFromRelapses', parseFloat(e.target.value))} className="w-full input-glass rounded-lg px-3 py-2 text-sm" />
                          </div>
                        </div>
                        <div>
                          <label className="block text-theme-muted text-xs mb-1">Describe los rebotes</label>
                          <textarea value={phase.relapseDescription || ''} onChange={(e) => handlePhaseChange(idx, 'relapseDescription', e.target.value)} placeholder="Ej: Rebote después de 8 semanas..." className="w-full input-glass rounded-lg px-3 py-2 text-sm" rows={2} />
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        );

      case 4: // Reverse Diet
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-theme-primary mb-4">Reverse Diet</h3>
            <div className={`p-4 rounded-xl mb-4 ${theme === 'dark' ? 'bg-blue-900/20 border border-blue-500/30' : 'bg-blue-100/50 border border-blue-300'}`}>
              <p className="text-sm text-theme-secondary"><strong>¿Qué es Reverse Diet?</strong> Después de déficit, aumentas calorías progresivamente para recuperar metabolismo.</p>
            </div>
            <div>
              <label className="block text-theme-secondary text-sm font-medium mb-2">¿Estás haciendo reverse diet?</label>
              <CustomSelect value={formData.isInReverseDiet ? 'si' : 'no'} onChange={(val) => handleChange('isInReverseDiet', val === 'si')} options={[{ value: 'no', label: 'No' }, { value: 'si', label: 'Sí' }]} />
            </div>
            {formData.isInReverseDiet && (
              <div className={`p-4 rounded-xl ${theme === 'dark' ? 'bg-green-900/20 border border-green-500/30' : 'bg-green-100/50 border border-green-300'}`}>
                <h4 className={`font-semibold mb-4 ${theme === 'dark' ? 'text-green-400' : 'text-green-600'}`}>Detalles del Reverse</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div><label className="block text-theme-secondary text-sm mb-1">Fecha inicio</label><input type="date" value={formData.reverseStartDate} onChange={(e) => handleChange('reverseStartDate', e.target.value)} className="w-full input-glass rounded-lg px-3 py-2" /></div>
                  <div><label className="block text-theme-secondary text-sm mb-1">Semanas transcurridas</label><input type="number" min="1" value={formData.reverseWeeksElapsed} onChange={(e) => handleChange('reverseWeeksElapsed', parseInt(e.target.value))} className="w-full input-glass rounded-lg px-3 py-2" /></div>
                  <div><label className="block text-theme-secondary text-sm mb-1">Calorías inicio (las más bajas)</label><input type="number" value={formData.reverseStartCalories} onChange={(e) => handleChange('reverseStartCalories', parseInt(e.target.value))} className="w-full input-glass rounded-lg px-3 py-2" /></div>
                  <div><label className="block text-theme-secondary text-sm mb-1">Calorías actuales</label><input type="number" value={formData.reverseCurrentCalories} onChange={(e) => handleChange('reverseCurrentCalories', parseInt(e.target.value))} className="w-full input-glass rounded-lg px-3 py-2" /></div>
                  <div><label className="block text-theme-secondary text-sm mb-1">Incremento semanal (kcal)</label><input type="number" value={formData.reverseWeeklyIncrement} onChange={(e) => handleChange('reverseWeeklyIncrement', parseInt(e.target.value))} className="w-full input-glass rounded-lg px-3 py-2" /></div>
                  <div><label className="block text-theme-secondary text-sm mb-1">Calorías objetivo</label><input type="number" value={formData.reverseTargetCalories} onChange={(e) => handleChange('reverseTargetCalories', parseInt(e.target.value))} className="w-full input-glass rounded-lg px-3 py-2" /></div>
                  <div><label className="block text-theme-secondary text-sm mb-1">Peso al inicio</label><input type="number" step="0.1" value={formData.reverseStartWeight} onChange={(e) => handleChange('reverseStartWeight', parseFloat(e.target.value))} className="w-full input-glass rounded-lg px-3 py-2" /></div>
                  <div><label className="block text-theme-secondary text-sm mb-1">Peso actual</label><input type="number" step="0.1" value={formData.reverseCurrentWeight} onChange={(e) => handleChange('reverseCurrentWeight', parseFloat(e.target.value))} className="w-full input-glass rounded-lg px-3 py-2" /></div>
                </div>
                <div className="mt-4"><label className="block text-theme-secondary text-sm mb-1">Notas</label><textarea value={formData.reverseNotes} onChange={(e) => handleChange('reverseNotes', e.target.value)} placeholder="Observaciones..." className="w-full input-glass rounded-lg px-3 py-2" rows={2} /></div>
              </div>
            )}
          </div>
        );

      case 5: // Bulk
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-theme-primary mb-4">Bulk/Volumen Activo</h3>
            <div className={`p-4 rounded-xl mb-4 ${theme === 'dark' ? 'bg-blue-900/20 border border-blue-500/30' : 'bg-blue-100/50 border border-blue-300'}`}>
              <p className="text-sm text-theme-secondary"><strong>¿Por qué es importante?</strong> Con tus calorías y ganancia puedo calcular tu TDEE REAL.</p>
            </div>
            <div>
              <label className="block text-theme-secondary text-sm font-medium mb-2">¿Estás en volumen/bulk?</label>
              <CustomSelect value={formData.isInBulk ? 'si' : 'no'} onChange={(val) => handleChange('isInBulk', val === 'si')} options={[{ value: 'no', label: 'No' }, { value: 'si', label: 'Sí' }]} />
            </div>
            {formData.isInBulk && (
              <div className={`p-4 rounded-xl ${theme === 'dark' ? 'bg-green-900/20 border border-green-500/30' : 'bg-green-100/50 border border-green-300'}`}>
                <h4 className={`font-semibold mb-4 ${theme === 'dark' ? 'text-green-400' : 'text-green-600'}`}>Datos del Bulk</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div><label className="block text-theme-secondary text-sm mb-1">Calorías/día</label><input type="number" value={formData.bulkCalories} onChange={(e) => handleChange('bulkCalories', parseInt(e.target.value))} className="w-full input-glass rounded-lg px-3 py-2" /></div>
                  <div><label className="block text-theme-secondary text-sm mb-1">Kg ganados/semana</label><input type="number" step="0.01" value={formData.bulkWeeklyGain} onChange={(e) => handleChange('bulkWeeklyGain', parseFloat(e.target.value))} className="w-full input-glass rounded-lg px-3 py-2" /><p className="text-xs text-theme-muted mt-1">Ideal: 0.25-0.5</p></div>
                  <div><label className="block text-theme-secondary text-sm mb-1">Semanas en bulk</label><input type="number" value={formData.bulkWeeks} onChange={(e) => handleChange('bulkWeeks', parseInt(e.target.value))} className="w-full input-glass rounded-lg px-3 py-2" /></div>
                </div>
              </div>
            )}
          </div>
        );

      case 6: // Actividad
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-theme-primary mb-4">Actividad Física Actual</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div><label className="block text-theme-secondary text-sm font-medium mb-2">Días pesas/semana *</label><input type="number" min="0" max="7" value={formData.trainingDaysPerWeek} onChange={(e) => handleChange('trainingDaysPerWeek', parseInt(e.target.value))} className="w-full input-glass rounded-xl px-4 py-3" /></div>
              <div><label className="block text-theme-secondary text-sm font-medium mb-2">Horas/sesión *</label><input type="number" step="0.25" min="0.5" max="4" value={formData.hoursPerSession} onChange={(e) => handleChange('hoursPerSession', parseFloat(e.target.value))} className="w-full input-glass rounded-xl px-4 py-3" /></div>
            </div>
            <div>
              <label className="block text-theme-secondary text-sm font-medium mb-2">Actividad diaria *</label>
              <CustomSelect value={formData.dailyActivity} onChange={(val) => handleChange('dailyActivity', val)}
                options={[{ value: 'sedentary', label: 'Sedentario (oficina)' }, { value: 'light', label: 'Ligero (poco movimiento)' }, { value: 'moderate', label: 'Moderado (caminar frecuente)' }, { value: 'active', label: 'Activo (trabajo físico)' }]} />
            </div>
            <div>
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" checked={formData.doesCardio} onChange={(e) => handleChange('doesCardio', e.target.checked)} className="w-5 h-5 rounded" />
                <span className="text-theme-primary font-medium">¿Realizas cardio actualmente?</span>
              </label>
            </div>
            {formData.doesCardio && (
              <div className={`p-4 rounded-xl ${theme === 'dark' ? 'bg-slate-800/30' : 'bg-slate-100/50'}`}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div><label className="block text-theme-secondary text-sm mb-1">Tipo</label><CustomSelect value={formData.currentCardio.type} onChange={(val) => handleChange('currentCardio', { ...formData.currentCardio, type: val })} options={CARDIO_TYPES} /></div>
                  <div><label className="block text-theme-secondary text-sm mb-1">Días/semana</label><input type="number" min="1" max="7" value={formData.currentCardio.daysPerWeek} onChange={(e) => handleChange('currentCardio', { ...formData.currentCardio, daysPerWeek: parseInt(e.target.value) })} className="w-full input-glass rounded-lg px-3 py-2" /></div>
                  <div><label className="block text-theme-secondary text-sm mb-1">Minutos/sesión</label><input type="number" min="5" max="180" value={formData.currentCardio.minutesPerSession} onChange={(e) => handleChange('currentCardio', { ...formData.currentCardio, minutesPerSession: parseInt(e.target.value) })} className="w-full input-glass rounded-lg px-3 py-2" /></div>
                  <div><label className="block text-theme-secondary text-sm mb-1">Intensidad: {formData.currentCardio.intensity}/10</label><input type="range" min="1" max="10" value={formData.currentCardio.intensity} onChange={(e) => handleChange('currentCardio', { ...formData.currentCardio, intensity: parseInt(e.target.value) })} className="w-full" /></div>
                </div>
                {formData.currentCardio.type === 'mixed' && (
                  <div className="mt-3"><label className="block text-theme-secondary text-sm mb-1">Describe tu cardio</label><textarea value={formData.currentCardio.description || ''} onChange={(e) => handleChange('currentCardio', { ...formData.currentCardio, description: e.target.value })} className="w-full input-glass rounded-lg px-3 py-2" rows={2} /></div>
                )}
              </div>
            )}
            <div>
              <label className="block text-theme-secondary text-sm font-medium mb-2">Fase actual *</label>
              <CustomSelect value={formData.currentPhase} onChange={(val) => handleChange('currentPhase', val)}
                options={[{ value: 'bulk', label: 'Volumen' }, { value: 'cut', label: 'Definición' }, { value: 'maintenance', label: 'Mantenimiento' }, { value: 'reverse', label: 'Reverse Diet' }]} />
            </div>
          </div>
        );

      default: return null;
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
      className={`glass-card p-6 ${theme === 'dark' ? 'bg-gradient-to-br from-cyan-900/20 to-blue-900/20' : 'bg-gradient-to-br from-cyan-100/50 to-blue-100/50'}`}>
      <h2 className="text-2xl font-bold text-theme-primary mb-6 flex items-center gap-2">
        <Calculator className={`w-6 h-6 ${theme === 'dark' ? 'text-cyan-400' : 'text-cyan-600'}`} /> Evaluación Nutricional Pro
      </h2>
      <div className="mb-6">
        <div className="flex justify-between text-sm text-theme-muted mb-2"><span>Paso {step} de {totalSteps}</span><span>{Math.round((step / totalSteps) * 100)}%</span></div>
        <div className={`h-2 rounded-full ${theme === 'dark' ? 'bg-slate-700' : 'bg-slate-200'}`}>
          <div className="h-2 rounded-full bg-cyan-500 transition-all duration-300" style={{ width: `${(step / totalSteps) * 100}%` }} />
        </div>
        <div className="flex justify-between mt-2 text-xs text-theme-muted"><span>Datos</span><span>Pliegues</span><span>Historial</span><span>Reverse</span><span>Bulk</span><span>Actividad</span></div>
      </div>
      <AnimatePresence mode="wait">
        <motion.div key={step} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }}>
          {renderStep()}
        </motion.div>
      </AnimatePresence>
      <div className="flex gap-4 mt-6">
        {step > 1 && (
          <button onClick={() => setStep(step - 1)} className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-semibold ${theme === 'dark' ? 'bg-slate-700 hover:bg-slate-600 text-white' : 'bg-slate-200 hover:bg-slate-300 text-slate-800'}`}>
            <ChevronLeft className="w-5 h-5" /> Atrás
          </button>
        )}
        {step < totalSteps ? (
          <button onClick={() => setStep(step + 1)} className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-semibold ${theme === 'dark' ? 'bg-cyan-600 hover:bg-cyan-700 text-white' : 'bg-cyan-500 hover:bg-cyan-600 text-white'}`}>
            Siguiente <ChevronRight className="w-5 h-5" />
          </button>
        ) : (
          <button onClick={handleSubmit} className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-semibold ${theme === 'dark' ? 'bg-green-600 hover:bg-green-700 text-white' : 'bg-green-500 hover:bg-green-600 text-white'}`}>
            <Check className="w-5 h-5" /> Calcular
          </button>
        )}
      </div>
    </motion.div>
  );
};
