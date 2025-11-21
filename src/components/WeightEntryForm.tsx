import React, { useState } from 'react';
import { useWeightStore } from '../store/useWeightStore';
import { Plus, X, Pizza, Droplets } from 'lucide-react';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';

export const WeightEntryForm: React.FC = () => {
  const addEntry = useWeightStore(state => state.addEntry);
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
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white p-4 rounded-full shadow-2xl flex items-center gap-2 font-semibold z-50"
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
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md z-50 p-4"
            >
              <div className="bg-slate-800 rounded-2xl shadow-2xl border border-slate-700">
                <div className="flex justify-between items-center p-6 border-b border-slate-700">
                  <h2 className="text-xl font-bold text-white">📝 Nuevo Registro de Peso</h2>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="text-slate-400 hover:text-white transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                  <div>
                    <label className="block text-slate-300 text-sm font-medium mb-2">
                      Peso (kg) *
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={weight}
                      onChange={(e) => setWeight(e.target.value)}
                      required
                      placeholder="75.5"
                      className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 text-sm font-medium mb-2">
                      Fecha *
                    </label>
                    <input
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      required
                      className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                        className="w-5 h-5 rounded border-slate-600 text-blue-600 focus:ring-blue-500 focus:ring-offset-slate-800"
                      />
                      <span className="text-slate-300 group-hover:text-white transition-colors flex items-center gap-2">
                        <Pizza className="w-4 h-4 text-orange-400" /> Cheat Meal (día de exceso calórico)
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
                        className="w-5 h-5 rounded border-slate-600 text-blue-600 focus:ring-blue-500 focus:ring-offset-slate-800"
                      />
                      <span className="text-slate-300 group-hover:text-white transition-colors flex items-center gap-2">
                        <Droplets className="w-4 h-4 text-blue-400" /> Retención de líquidos
                      </span>
                    </label>
                  </div>

                  <div>
                    <label className="block text-slate-300 text-sm font-medium mb-2">
                      Notas (opcional)
                    </label>
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Ej: Pesado después del entrenamiento..."
                      rows={3}
                      className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    />
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setIsOpen(false)}
                      className="flex-1 bg-slate-700 hover:bg-slate-600 text-white font-semibold py-3 rounded-lg transition-colors"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="flex-1 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white font-semibold py-3 rounded-lg transition-all"
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
