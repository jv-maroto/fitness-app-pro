import React, { useState } from 'react';
import { useWeightStore } from '../store/useWeightStore';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Trash2, Edit2, Save, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { WeightEntry } from '../types';

export const WeightList: React.FC = () => {
  const { entries, deleteEntry, updateEntry } = useWeightStore();
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
      <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl p-8 border border-slate-700/50 text-center">
        <p className="text-slate-400">No hay registros aún. ¡Añade tu primer peso!</p>
      </div>
    );
  }

  return (
    <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 overflow-hidden">
      <div className="p-6 border-b border-slate-700">
        <h2 className="text-xl font-bold text-white">📋 Historial de Registros</h2>
        <p className="text-slate-400 text-sm mt-1">{entries.length} registros totales</p>
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
              className="border-b border-slate-700/50 last:border-b-0 hover:bg-slate-700/30 transition-colors"
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
                        className="flex-1 bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleSave(entry.id)}
                          className="p-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                        >
                          <Save className="w-5 h-5" />
                        </button>
                        <button
                          onClick={handleCancel}
                          className="p-2 bg-slate-600 hover:bg-slate-700 text-white rounded-lg transition-colors"
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
                      className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                ) : (
                  // View Mode
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl font-bold text-white">
                          {entry.weight.toFixed(1)} kg
                        </span>
                        {entry.isCheatMeal && (
                          <span className="px-2 py-1 bg-orange-900/30 border border-orange-500/50 rounded-lg text-orange-400 text-xs font-medium">
                            🍕 Cheat
                          </span>
                        )}
                        {entry.isRetention && (
                          <span className="px-2 py-1 bg-blue-900/30 border border-blue-500/50 rounded-lg text-blue-400 text-xs font-medium">
                            💧 Retención
                          </span>
                        )}
                      </div>
                      <div className="text-slate-400 text-sm mt-1">
                        {format(new Date(entry.date), "d 'de' MMMM, yyyy", { locale: es })}
                      </div>
                      {entry.notes && (
                        <div className="text-slate-500 text-sm mt-2 italic">
                          "{entry.notes}"
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(entry)}
                        className="p-2 text-blue-400 hover:bg-blue-900/30 rounded-lg transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm('¿Eliminar este registro?')) {
                            deleteEntry(entry.id);
                          }
                        }}
                        className="p-2 text-red-400 hover:bg-red-900/30 rounded-lg transition-colors"
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
