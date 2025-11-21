import React, { useState } from 'react';
import { useWeightStore } from '../store/useWeightStore';
import { useThemeStore } from '../store/useThemeStore';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Trash2, Edit2, Save, X, Pizza, Droplets, ClipboardList } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { WeightEntry } from '../types';

export const WeightList: React.FC = () => {
  const { entries, deleteEntry, updateEntry } = useWeightStore();
  const { theme } = useThemeStore();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editWeight, setEditWeight] = useState('');
  const [editNotes, setEditNotes] = useState('');

  const handleEdit = (entry: WeightEntry) => {
    setEditingId(entry.id);
    setEditWeight(entry.weight.toString());
    setEditNotes(entry.notes || '');
  };

  const handleSave = (id: string) => {
    updateEntry(id, {
      weight: parseFloat(editWeight),
      notes: editNotes.trim() || undefined,
    });
    setEditingId(null);
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditWeight('');
    setEditNotes('');
  };

  if (entries.length === 0) {
    return (
      <div className="glass-card p-8 text-center">
        <p className="text-theme-secondary">No hay registros aún. ¡Añade tu primer peso!</p>
      </div>
    );
  }

  return (
    <div className="glass-card overflow-hidden">
      <div className={`p-6 border-b ${theme === 'dark' ? 'border-slate-700/50' : 'border-slate-200/50'}`}>
        <h2 className="text-xl font-bold text-theme-primary flex items-center gap-2">
          <ClipboardList className="w-5 h-5" /> Historial de Registros
        </h2>
        <p className="text-theme-secondary text-sm mt-1">{entries.length} registros totales</p>
      </div>

      <div className="max-h-[600px] overflow-y-auto">
        <AnimatePresence>
          {entries.map((entry, index) => (
            <motion.div
              key={entry.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ delay: index * 0.05 }}
              className={`border-b last:border-b-0 transition-colors ${
                theme === 'dark'
                  ? 'border-slate-700/50 hover:bg-slate-700/30'
                  : 'border-slate-200/50 hover:bg-slate-100/50'
              }`}
            >
              <div className="p-4">
                {editingId === entry.id ? (
                  // Edit Mode
                  <div className="space-y-3">
                    <div className="flex gap-2">
                      <input
                        type="number"
                        step="0.1"
                        value={editWeight}
                        onChange={(e) => setEditWeight(e.target.value)}
                        className="flex-1 input-glass rounded-lg px-3 py-2"
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleSave(entry.id)}
                          className="p-2 bg-green-500/20 hover:bg-green-500/30 text-green-500 rounded-lg transition-colors border border-green-500/30"
                        >
                          <Save className="w-5 h-5" />
                        </button>
                        <button
                          onClick={handleCancel}
                          className={`p-2 rounded-lg transition-colors ${
                            theme === 'dark'
                              ? 'bg-slate-700/50 hover:bg-slate-700 text-slate-400'
                              : 'bg-slate-200/50 hover:bg-slate-200 text-slate-600'
                          }`}
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                    <input
                      type="text"
                      value={editNotes}
                      onChange={(e) => setEditNotes(e.target.value)}
                      placeholder="Notas..."
                      className="w-full input-glass rounded-lg px-3 py-2 text-sm"
                    />
                  </div>
                ) : (
                  // View Mode
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl font-bold text-theme-primary">
                          {entry.weight.toFixed(1)} kg
                        </span>
                        {entry.isCheatMeal && (
                          <span className={`px-2 py-1 rounded-lg text-xs font-medium flex items-center gap-1 ${
                            theme === 'dark'
                              ? 'bg-orange-900/30 border border-orange-500/50 text-orange-400'
                              : 'bg-orange-100 border border-orange-300 text-orange-600'
                          }`}>
                            <Pizza className="w-3 h-3" /> Cheat
                          </span>
                        )}
                        {entry.isRetention && (
                          <span className={`px-2 py-1 rounded-lg text-xs font-medium flex items-center gap-1 ${
                            theme === 'dark'
                              ? 'bg-blue-900/30 border border-blue-500/50 text-blue-400'
                              : 'bg-blue-100 border border-blue-300 text-blue-600'
                          }`}>
                            <Droplets className="w-3 h-3" /> Retención
                          </span>
                        )}
                      </div>
                      <div className="text-theme-secondary text-sm mt-1">
                        {format(new Date(entry.date), "d 'de' MMMM, yyyy", { locale: es })}
                      </div>
                      {entry.notes && (
                        <div className="text-theme-muted text-sm mt-2 italic">
                          "{entry.notes}"
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(entry)}
                        className={`p-2 rounded-lg transition-colors ${
                          theme === 'dark'
                            ? 'text-blue-400 hover:bg-blue-900/30'
                            : 'text-blue-600 hover:bg-blue-100'
                        }`}
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm('¿Eliminar este registro?')) {
                            deleteEntry(entry.id);
                          }
                        }}
                        className={`p-2 rounded-lg transition-colors ${
                          theme === 'dark'
                            ? 'text-red-400 hover:bg-red-900/30'
                            : 'text-red-600 hover:bg-red-100'
                        }`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};
