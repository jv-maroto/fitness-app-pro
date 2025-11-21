import React, { useState } from 'react';
import { useWeightStore } from '../store/useWeightStore';
import { useThemeStore } from '../store/useThemeStore';
import { Plus, X, Pizza, Droplets, Scale } from 'lucide-react';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';

export const WeightEntryForm: React.FC = () => {
  const addEntry = useWeightStore(state => state.addEntry);
  const { theme } = useThemeStore();
  const [isOpen, setIsOpen] = useState(false);
  const [weight, setWeight] = useState('');
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [isCheatMeal, setIsCheatMeal] = useState(false);
  const [isRetention, setIsRetention] = useState(false);
  const [notes, setNotes] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!weight) return;

    addEntry({
      weight: parseFloat(weight),
      date: new Date(date),
      isCheatMeal,
      isRetention,
      notes: notes.trim() || undefined,
    });

    // Reset form
    setWeight('');
    setDate(format(new Date(), 'yyyy-MM-dd'));
    setIsCheatMeal(false);
    setIsRetention(false);
    setNotes('');
    setIsOpen(false);
  };

  return (
    <>
      <motion.button
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 p-4 flex items-center gap-2 font-semibold z-50 text-white rounded-full backdrop-blur-xl"
        style={{
          background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.15), rgba(139, 92, 246, 0.15), rgba(236, 72, 153, 0.1))',
          boxShadow: '0 0 25px rgba(6, 182, 212, 0.4), 0 0 50px rgba(139, 92, 246, 0.2), 0 8px 32px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.2)',
          border: '1px solid transparent',
          backgroundImage: 'linear-gradient(135deg, rgba(6, 182, 212, 0.2), rgba(139, 92, 246, 0.15), rgba(236, 72, 153, 0.1)), linear-gradient(135deg, rgba(6, 182, 212, 0.8), rgba(139, 92, 246, 0.6), rgba(236, 72, 153, 0.6), rgba(6, 182, 212, 0.8))',
          backgroundOrigin: 'border-box',
          backgroundClip: 'padding-box, border-box',
        }}
      >
        <Plus className="w-6 h-6" />
        <span className="hidden sm:inline">Nuevo Registro</span>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
            >
              <div className={`glass-card w-full max-w-md max-h-[90vh] overflow-y-auto ${
                theme === 'dark' ? 'bg-slate-800/95' : 'bg-white/95'
              }`}>
                <div className={`flex justify-between items-center p-6 border-b ${
                  theme === 'dark' ? 'border-slate-700' : 'border-slate-200'
                }`}>
                  <h2 className="text-xl font-bold text-theme-primary flex items-center gap-2">
                    <Scale className="w-5 h-5" /> Nuevo Registro de Peso
                  </h2>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="text-theme-muted hover:text-theme-primary transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                  <div>
                    <label className="block text-theme-secondary text-sm font-medium mb-2">
                      Peso (kg) *
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={weight}
                      onChange={(e) => setWeight(e.target.value)}
                      required
                      placeholder="75.5"
                      className="w-full input-glass rounded-xl px-4 py-3"
                    />
                  </div>

                  <div>
                    <label className="block text-theme-secondary text-sm font-medium mb-2">
                      Fecha *
                    </label>
                    <input
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      required
                      className="w-full input-glass rounded-xl px-4 py-3"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="flex items-center gap-3 cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={isCheatMeal}
                        onChange={(e) => {
                          setIsCheatMeal(e.target.checked);
                          if (e.target.checked) setIsRetention(false);
                        }}
                        className={`w-5 h-5 rounded focus:ring-2 focus:ring-blue-500 ${
                          theme === 'dark'
                            ? 'border-slate-600 bg-slate-700 text-blue-600 focus:ring-offset-slate-800'
                            : 'border-slate-300 bg-white text-blue-600 focus:ring-offset-white'
                        }`}
                      />
                      <span className="text-theme-secondary group-hover:text-theme-primary transition-colors flex items-center gap-2">
                        <Pizza className={`w-4 h-4 ${theme === 'dark' ? 'text-orange-400' : 'text-orange-500'}`} />
                        Cheat Meal (día de exceso calórico)
                      </span>
                    </label>

                    <label className="flex items-center gap-3 cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={isRetention}
                        onChange={(e) => {
                          setIsRetention(e.target.checked);
                          if (e.target.checked) setIsCheatMeal(false);
                        }}
                        className={`w-5 h-5 rounded focus:ring-2 focus:ring-blue-500 ${
                          theme === 'dark'
                            ? 'border-slate-600 bg-slate-700 text-blue-600 focus:ring-offset-slate-800'
                            : 'border-slate-300 bg-white text-blue-600 focus:ring-offset-white'
                        }`}
                      />
                      <span className="text-theme-secondary group-hover:text-theme-primary transition-colors flex items-center gap-2">
                        <Droplets className={`w-4 h-4 ${theme === 'dark' ? 'text-blue-400' : 'text-blue-500'}`} />
                        Retención de líquidos
                      </span>
                    </label>
                  </div>

                  <div>
                    <label className="block text-theme-secondary text-sm font-medium mb-2">
                      Notas (opcional)
                    </label>
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Ej: Pesado después del entrenamiento..."
                      rows={3}
                      className="w-full input-glass rounded-xl px-4 py-3 resize-none"
                    />
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setIsOpen(false)}
                      className={`flex-1 font-semibold py-3 rounded-xl transition-colors ${
                        theme === 'dark'
                          ? 'bg-slate-700 hover:bg-slate-600 text-white'
                          : 'bg-slate-200 hover:bg-slate-300 text-slate-800'
                      }`}
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className={`flex-1 font-semibold py-3 rounded-xl transition-all ${
                        theme === 'dark'
                          ? 'bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white'
                          : 'bg-gradient-to-r from-blue-500 to-blue-400 hover:from-blue-600 hover:to-blue-500 text-white'
                      }`}
                    >
                      Guardar
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};
