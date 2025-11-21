import React, { useState } from 'react';
import { useWeightStore } from '../store/useWeightStore';
import { useThemeStore } from '../store/useThemeStore';
import { GoalType } from '../types';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus, Dumbbell, Rocket } from 'lucide-react';

export const ProfileSetup: React.FC = () => {
  const createProfile = useWeightStore(state => state.createProfile);
  const { theme } = useThemeStore();
  const [name, setName] = useState('');
  const [goalType, setGoalType] = useState<GoalType>('bulk');
  const [startWeight, setStartWeight] = useState('');
  const [targetWeight, setTargetWeight] = useState('');
  const [height, setHeight] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState<'male' | 'female'>('male');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    createProfile({
      name,
      goalType,
      startWeight: parseFloat(startWeight),
      targetWeight: targetWeight ? parseFloat(targetWeight) : undefined,
      startDate: new Date(),
      height: height ? parseInt(height) : undefined,
      age: age ? parseInt(age) : undefined,
      gender,
    });
  };

  const goalOptions = [
    {
      value: 'bulk' as GoalType,
      label: 'Volumen',
      icon: <TrendingUp className="w-8 h-8" />,
      color: theme === 'dark' ? 'from-green-600/80 to-green-500/80' : 'from-green-500 to-green-400',
      description: 'Ganar masa muscular',
    },
    {
      value: 'cut' as GoalType,
      label: 'Definición',
      icon: <TrendingDown className="w-8 h-8" />,
      color: theme === 'dark' ? 'from-red-600/80 to-red-500/80' : 'from-red-500 to-red-400',
      description: 'Perder grasa corporal',
    },
    {
      value: 'maintenance' as GoalType,
      label: 'Mantenimiento',
      icon: <Minus className="w-8 h-8" />,
      color: theme === 'dark' ? 'from-blue-600/80 to-blue-500/80' : 'from-blue-500 to-blue-400',
      description: 'Mantener peso actual',
    },
  ];

  return (
    <div className={`min-h-screen flex items-center justify-center p-4 theme-${theme}`}>
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className={`absolute -top-40 -right-40 w-80 h-80 rounded-full blur-3xl opacity-20 float-animation ${
          theme === 'dark' ? 'bg-blue-500' : 'bg-blue-400'
        }`} />
        <div className={`absolute -bottom-40 -left-40 w-80 h-80 rounded-full blur-3xl opacity-20 float-animation ${
          theme === 'dark' ? 'bg-cyan-500' : 'bg-cyan-400'
        }`} style={{ animationDelay: '3s' }} />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-2xl relative z-10"
      >
        <div className="glass-card p-8">
          <div className="text-center mb-8">
            <div className={`inline-flex p-3 rounded-2xl mb-4 ${
              theme === 'dark' ? 'bg-blue-500/20' : 'bg-blue-500/10'
            }`}>
              <Dumbbell className={`w-10 h-10 ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`} />
            </div>
            <h1 className="text-3xl font-bold text-theme-primary mb-2">
              Weight Tracker Pro
            </h1>
            <p className="text-theme-secondary">
              Sistema inteligente de seguimiento de peso con análisis avanzado
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-theme-secondary text-sm font-medium mb-2">
                ¿Cómo te llamas?
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                placeholder="Tu nombre"
                className="w-full input-glass rounded-xl px-4 py-3"
              />
            </div>

            <div>
              <label className="block text-theme-secondary text-sm font-medium mb-3">
                ¿Cuál es tu objetivo? *
              </label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {goalOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setGoalType(option.value)}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      goalType === option.value
                        ? `bg-gradient-to-br ${option.color} border-transparent text-white`
                        : theme === 'dark'
                          ? 'bg-slate-700/30 border-slate-600 text-slate-300 hover:border-slate-500'
                          : 'bg-white/50 border-slate-300 text-slate-600 hover:border-slate-400'
                    }`}
                  >
                    <div className="flex flex-col items-center gap-2">
                      {option.icon}
                      <span className="font-semibold">{option.label}</span>
                      <span className="text-xs opacity-80">{option.description}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-theme-secondary text-sm font-medium mb-2">
                  Peso Inicial (kg) *
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={startWeight}
                  onChange={(e) => setStartWeight(e.target.value)}
                  required
                  placeholder="75.5"
                  className="w-full input-glass rounded-xl px-4 py-3"
                />
              </div>

              <div>
                <label className="block text-theme-secondary text-sm font-medium mb-2">
                  Peso Objetivo (kg)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={targetWeight}
                  onChange={(e) => setTargetWeight(e.target.value)}
                  placeholder="80.0"
                  className="w-full input-glass rounded-xl px-4 py-3"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-theme-secondary text-sm font-medium mb-2">
                  Altura (cm)
                </label>
                <input
                  type="number"
                  value={height}
                  onChange={(e) => setHeight(e.target.value)}
                  placeholder="175"
                  className="w-full input-glass rounded-xl px-4 py-3"
                />
              </div>

              <div>
                <label className="block text-theme-secondary text-sm font-medium mb-2">
                  Edad
                </label>
                <input
                  type="number"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  placeholder="25"
                  className="w-full input-glass rounded-xl px-4 py-3"
                />
              </div>

              <div>
                <label className="block text-theme-secondary text-sm font-medium mb-2">
                  Género
                </label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value as 'male' | 'female')}
                  className="w-full input-glass rounded-xl px-4 py-3"
                >
                  <option value="male">Masculino</option>
                  <option value="female">Femenino</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              className={`w-full font-bold py-4 rounded-xl transition-all transform hover:scale-[1.02] flex items-center justify-center gap-2 ${
                theme === 'dark'
                  ? 'bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white'
                  : 'bg-gradient-to-r from-blue-500 to-blue-400 hover:from-blue-600 hover:to-blue-500 text-white'
              }`}
            >
              <Rocket className="w-5 h-5" /> Comenzar
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
};
