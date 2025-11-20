import React, { useState, useRef } from 'react';
import { useWeightStore } from '../store/useWeightStore';
import {
  exportToCSV,
  exportToJSON,
  downloadCSV,
  downloadJSON,
  parseCSV,
  parseJSON,
  readFileAsText,
} from '../utils/csv';
import { v4 as uuidv4 } from '../utils/uuid';
import { Download, Upload, FileJson, FileSpreadsheet, AlertCircle, CheckCircle, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { RecalculateStats } from './RecalculateStats';

export const ImportExport: React.FC = () => {
  const { entries, profile, addEntry, importEntries, createProfile, updateProfile } = useWeightStore();
  const [showModal, setShowModal] = useState(false);
  const [importStatus, setImportStatus] = useState<{
    type: 'success' | 'error' | null;
    message: string;
  }>({ type: null, message: '' });

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExportCSV = () => {
    const csv = exportToCSV(entries);
    const filename = `weight-tracker-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    downloadCSV(csv, filename);

    setImportStatus({
      type: 'success',
      message: `✅ Exportados ${entries.length} registros a CSV`,
    });
    setTimeout(() => setImportStatus({ type: null, message: '' }), 3000);
  };

  const handleExportJSON = () => {
    if (!profile) return;

    const json = exportToJSON(profile, entries);
    const filename = `weight-tracker-backup-${format(new Date(), 'yyyy-MM-dd')}.json`;
    downloadJSON(json, filename);

    setImportStatus({
      type: 'success',
      message: '✅ Backup completo creado (perfil + datos)',
    });
    setTimeout(() => setImportStatus({ type: null, message: '' }), 3000);
  };

  const handleImportFile = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const content = await readFileAsText(file);
      const fileExtension = file.name.split('.').pop()?.toLowerCase();

      if (fileExtension === 'csv') {
        await handleImportCSV(content);
      } else if (fileExtension === 'json') {
        await handleImportJSON(content);
      } else {
        throw new Error('Formato de archivo no soportado. Usa .csv o .json');
      }

      // Reset input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error: any) {
      setImportStatus({
        type: 'error',
        message: `❌ Error: ${error.message}`,
      });
      setTimeout(() => setImportStatus({ type: null, message: '' }), 5000);
    }
  };

  const handleImportCSV = async (content: string) => {
    const parsedEntries = parseCSV(content);

    if (parsedEntries.length === 0) {
      throw new Error('No se encontraron registros válidos en el CSV');
    }

    // Convertir a WeightEntry completo
    const newEntries = parsedEntries.map(entry => ({
      id: uuidv4(),
      date: entry.date!,
      weight: entry.weight!,
      isCheatMeal: entry.isCheatMeal || false,
      isRetention: entry.isRetention || false,
      notes: entry.notes,
      createdAt: new Date(),
      updatedAt: new Date(),
    }));

    // Opción: Merge o Replace
    const shouldReplace = confirm(
      `Se importarán ${newEntries.length} registros.\n\n` +
      `¿Deseas REEMPLAZAR todos tus datos actuales (${entries.length} registros)?\n\n` +
      `- OK = Reemplazar todo\n` +
      `- Cancelar = Añadir sin duplicados`
    );

    if (shouldReplace) {
      importEntries(newEntries);

      // Actualizar peso actual del perfil con el último registro válido
      const validEntries = newEntries.filter(e => !e.isCheatMeal && !e.isRetention);
      if (validEntries.length > 0 && profile) {
        updateProfile({
          currentWeight: validEntries[0].weight,
        });
      }

      setImportStatus({
        type: 'success',
        message: `✅ ${newEntries.length} registros importados (reemplazados). Recalcula estadísticas abajo.`,
      });
    } else {
      // Merge sin duplicados (por fecha)
      const existingDates = new Set(
        entries.map(e => format(new Date(e.date), 'yyyy-MM-dd'))
      );

      const uniqueNewEntries = newEntries.filter(
        e => !existingDates.has(format(new Date(e.date), 'yyyy-MM-dd'))
      );

      if (uniqueNewEntries.length === 0) {
        setImportStatus({
          type: 'error',
          message: '⚠️ No hay registros nuevos para importar (fechas duplicadas)',
        });
        return;
      }

      uniqueNewEntries.forEach(entry => addEntry(entry));

      setImportStatus({
        type: 'success',
        message: `✅ ${uniqueNewEntries.length} registros nuevos añadidos. Recalcula estadísticas abajo.`,
      });
    }

    setTimeout(() => setImportStatus({ type: null, message: '' }), 7000);
  };

  const handleImportJSON = async (content: string) => {
    const data = parseJSON(content);

    const shouldReplace = confirm(
      `Backup completo detectado:\n\n` +
      `- Perfil: ${data.profile.name}\n` +
      `- Registros: ${data.entries.length}\n\n` +
      `Esto REEMPLAZARÁ todos tus datos actuales.\n¿Continuar?`
    );

    if (!shouldReplace) {
      return;
    }

    // Restaurar perfil y entradas
    createProfile({
      name: data.profile.name,
      goalType: data.profile.goalType,
      startWeight: data.profile.startWeight,
      targetWeight: data.profile.targetWeight,
      startDate: data.profile.startDate,
      height: data.profile.height,
      age: data.profile.age,
      gender: data.profile.gender,
    });

    importEntries(data.entries);

    setImportStatus({
      type: 'success',
      message: `✅ Backup restaurado: ${data.entries.length} registros + perfil. Las estadísticas se recalculan automáticamente.`,
    });

    setTimeout(() => setImportStatus({ type: null, message: '' }), 7000);
  };

  const downloadTemplate = () => {
    const template = 'Fecha,Peso (kg),Cheat Meal,Retención,Notas\n' +
      '2025-01-01,75.5,No,No,Primer registro\n' +
      '2025-01-02,75.3,No,No,\n' +
      '2025-01-03,76.0,Sí,No,Cheat meal en la cena\n' +
      '2025-01-04,75.8,No,Sí,Retención por mucha sal';

    downloadCSV(template, 'weight-tracker-template.csv');

    setImportStatus({
      type: 'success',
      message: '✅ Plantilla CSV descargada',
    });
    setTimeout(() => setImportStatus({ type: null, message: '' }), 3000);
  };

  return (
    <>
      <div className="space-y-4">
        {/* Export Section */}
        <div className="bg-gradient-to-br from-blue-900/30 to-blue-800/30 border border-blue-500/30 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Download className="w-5 h-5 text-blue-400" />
            Exportar Datos
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              onClick={handleExportCSV}
              disabled={entries.length === 0}
              className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-700 disabled:text-slate-500 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-lg transition-all"
            >
              <FileSpreadsheet className="w-5 h-5" />
              Exportar CSV
              <span className="text-xs opacity-75">({entries.length})</span>
            </button>

            <button
              onClick={handleExportJSON}
              disabled={!profile || entries.length === 0}
              className="flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 disabled:bg-slate-700 disabled:text-slate-500 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-lg transition-all"
            >
              <FileJson className="w-5 h-5" />
              Backup JSON
              <span className="text-xs opacity-75">(completo)</span>
            </button>
          </div>

          <p className="text-slate-400 text-sm mt-3">
            <strong>CSV:</strong> Solo registros de peso (compatible con Excel)<br />
            <strong>JSON:</strong> Backup completo (perfil + registros)
          </p>
        </div>

        {/* Import Section */}
        <div className="bg-gradient-to-br from-green-900/30 to-green-800/30 border border-green-500/30 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Upload className="w-5 h-5 text-green-400" />
            Importar Datos
          </h3>

          <div className="space-y-3">
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,.json"
              onChange={handleImportFile}
              className="hidden"
              id="file-import"
            />

            <label
              htmlFor="file-import"
              className="flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-4 rounded-lg transition-all cursor-pointer"
            >
              <Upload className="w-5 h-5" />
              Seleccionar Archivo CSV o JSON
            </label>

            <button
              onClick={downloadTemplate}
              className="w-full flex items-center justify-center gap-2 bg-slate-700 hover:bg-slate-600 text-white font-medium py-2 px-4 rounded-lg transition-all text-sm"
            >
              <Download className="w-4 h-4" />
              Descargar Plantilla CSV
            </button>
          </div>

          <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-3 mt-4">
            <p className="text-yellow-400 text-sm">
              ⚠️ <strong>Importante:</strong><br />
              • CSV: Se pueden añadir o reemplazar registros<br />
              • JSON: Reemplaza TODO (perfil + datos)<br />
              • Se detectarán y omitirán fechas duplicadas
            </p>
          </div>
        </div>

        {/* Formato CSV Info */}
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
          <h4 className="text-white font-semibold mb-3">📋 Formato CSV Esperado</h4>
          <div className="bg-slate-900/50 rounded-lg p-3 font-mono text-xs text-slate-300 overflow-x-auto">
            <div>Fecha,Peso (kg),Cheat Meal,Retención,Notas</div>
            <div className="text-slate-500">2025-01-01,75.5,No,No,Primer día</div>
            <div className="text-slate-500">2025-01-02,75.3,Sí,No,Cheat meal</div>
          </div>
          <p className="text-slate-400 text-sm mt-2">
            • Fecha: yyyy-MM-dd o dd/MM/yyyy<br />
            • Peso: número con punto o coma<br />
            • Cheat/Retención: Sí/No, Yes/No, 1/0<br />
            • Notas: opcional, entre comillas si tiene comas
          </p>
        </div>

        {/* Recalcular Estadísticas Section */}
        <RecalculateStats />
      </div>

      {/* Status Toast */}
      <AnimatePresence>
        {importStatus.type && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50"
          >
            <div
              className={`flex items-center gap-3 px-6 py-4 rounded-xl shadow-2xl border ${
                importStatus.type === 'success'
                  ? 'bg-green-900/90 border-green-500/50 text-green-100'
                  : 'bg-red-900/90 border-red-500/50 text-red-100'
              } backdrop-blur-xl`}
            >
              {importStatus.type === 'success' ? (
                <CheckCircle className="w-5 h-5" />
              ) : (
                <AlertCircle className="w-5 h-5" />
              )}
              <span className="font-medium">{importStatus.message}</span>
              <button
                onClick={() => setImportStatus({ type: null, message: '' })}
                className="ml-2 hover:opacity-70 transition-opacity"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
