import React, { useState } from 'react';
import { useWeightStore } from '../store/useWeightStore';
import { GoalType } from '../types';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

export const ProfileSetup: React.FC = () => {
  const createProfile = useWeightStore(state => state.createProfile);
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
      color: 'from-green-600 to-green-500',
      description: 'Ganar masa muscular',
    },
    {
      value: 'cut' as GoalType,
      label: 'Definición',
      icon: <TrendingDown className="w-8 h-8" />,
      color: 'from-red-600 to-red-500',
      description: 'Perder grasa corporal',
    },
    {
      value: 'maintenance' as GoalType,
      label: 'Mantenimiento',
      icon: <Minus className="w-8 h-8" />,
      color: 'from-blue-600 to-blue-500',
      description: 'Mantener peso actual',
    },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-2xl"
      >
        <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl shadow-2xl border border-slate-700/50 p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">
              🎯 Weight Tracker Pro
            </h1>
            <p className="text-slate-400">
              Sistema inteligente de seguimiento de peso con análisis avanzado
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-slate-300 text-sm font-medium mb-2">
                ¿Cómo te llamas?
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                placeholder="Tu nombre"
                className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-slate-300 text-sm font-medium mb-3">
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
                        : 'bg-slate-700/30 border-slate-600 text-slate-300 hover:border-slate-500'
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
                <label className="block text-slate-300 text-sm font-medium mb-2">
                  Peso Inicial (kg) *
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={startWeight}
                  onChange={(e) => setStartWeight(e.target.value)}
                  required
                  placeholder="75.5"
                  className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-slate-300 text-sm font-medium mb-2">
                  Peso Objetivo (kg)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={targetWeight}
                  onChange={(e) => setTargetWeight(e.target.value)}
                  placeholder="80.0"
                  className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-slate-300 text-sm font-medium mb-2">
                  Altura (cm)
                </label>
                <input
                  type="number"
                  value={height}
                  onChange={(e) => setHeight(e.target.value)}
                  placeholder="175"
                  className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-slate-300 text-sm font-medium mb-2">
                  Edad
                </label>
                <input
                  type="number"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  placeholder="25"
                  className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-slate-300 text-sm font-medium mb-2">
                  Género
                </label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value as 'male' | 'female')}
                  className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="male">Masculino</option>
                  <option value="female">Femenino</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white font-bold py-4 rounded-lg transition-all transform hover:scale-[1.02]"
            >
              🚀 Comenzar
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
};
