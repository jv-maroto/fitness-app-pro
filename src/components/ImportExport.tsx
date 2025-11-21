import React, { useState, useRef } from 'react';
import { useWeightStore } from '../store/useWeightStore';
import { useThemeStore } from '../store/useThemeStore';
import { useNutritionStore } from '../store/useNutritionStore';
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
import { Download, Upload, FileJson, FileSpreadsheet, AlertCircle, CheckCircle, X, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { RecalculateStats } from './RecalculateStats';

export const ImportExport: React.FC = () => {
  const { entries, profile, addEntry, importEntries, createProfile, updateProfile } = useWeightStore();
  const { theme } = useThemeStore();
  const { evaluation: nutritionEvaluation } = useNutritionStore();
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
      message: `Exportados ${entries.length} registros a CSV`,
    });
    setTimeout(() => setImportStatus({ type: null, message: '' }), 3000);
  };

  const handleExportJSON = () => {
    if (!profile) return;

    const json = exportToJSON(profile, entries, nutritionEvaluation);
    const filename = `fitness-app-backup-${format(new Date(), 'yyyy-MM-dd')}.json`;
    downloadJSON(json, filename);

    const hasNutrition = nutritionEvaluation ? ' + nutrición' : '';
    setImportStatus({
      type: 'success',
      message: `Backup completo creado (perfil + datos${hasNutrition})`,
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

      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error: any) {
      setImportStatus({
        type: 'error',
        message: `Error: ${error.message}`,
      });
      setTimeout(() => setImportStatus({ type: null, message: '' }), 5000);
    }
  };

  const handleImportCSV = async (content: string) => {
    const parsedEntries = parseCSV(content);

    if (parsedEntries.length === 0) {
      throw new Error('No se encontraron registros válidos en el CSV');
    }

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

    const shouldReplace = confirm(
      `Se importarán ${newEntries.length} registros.\n\n` +
      `¿Deseas REEMPLAZAR todos tus datos actuales (${entries.length} registros)?\n\n` +
      `- OK = Reemplazar todo\n` +
      `- Cancelar = Añadir sin duplicados`
    );

    if (shouldReplace) {
      importEntries(newEntries);

      const validEntries = newEntries.filter(e => !e.isCheatMeal && !e.isRetention);
      if (validEntries.length > 0 && profile) {
        updateProfile({
          currentWeight: validEntries[0].weight,
        });
      }

      setImportStatus({
        type: 'success',
        message: `${newEntries.length} registros importados (reemplazados). Recalcula estadísticas abajo.`,
      });
    } else {
      const existingDates = new Set(
        entries.map(e => format(new Date(e.date), 'yyyy-MM-dd'))
      );

      const uniqueNewEntries = newEntries.filter(
        e => !existingDates.has(format(new Date(e.date), 'yyyy-MM-dd'))
      );

      if (uniqueNewEntries.length === 0) {
        setImportStatus({
          type: 'error',
          message: 'No hay registros nuevos para importar (fechas duplicadas)',
        });
        return;
      }

      uniqueNewEntries.forEach(entry => addEntry(entry));

      setImportStatus({
        type: 'success',
        message: `${uniqueNewEntries.length} registros nuevos añadidos. Recalcula estadísticas abajo.`,
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
      message: `Backup restaurado: ${data.entries.length} registros + perfil.`,
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
      message: 'Plantilla CSV descargada',
    });
    setTimeout(() => setImportStatus({ type: null, message: '' }), 3000);
  };

  return (
    <>
      <div className="space-y-4">
        {/* Export Section */}
        <div className={`glass-card p-6 ${
          theme === 'dark'
            ? 'bg-gradient-to-br from-blue-900/20 to-blue-800/20'
            : 'bg-gradient-to-br from-blue-100/50 to-blue-50/50'
        }`}>
          <h3 className="text-lg font-semibold text-theme-primary mb-4 flex items-center gap-2">
            <Download className={`w-5 h-5 ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`} />
            Exportar Datos
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              onClick={handleExportCSV}
              disabled={entries.length === 0}
              className={`flex items-center justify-center gap-2 font-semibold py-3 px-4 rounded-xl transition-all ${
                entries.length === 0
                  ? 'bg-slate-500/30 text-slate-500 cursor-not-allowed'
                  : theme === 'dark'
                    ? 'bg-blue-600 hover:bg-blue-700 text-white'
                    : 'bg-blue-500 hover:bg-blue-600 text-white'
              }`}
            >
              <FileSpreadsheet className="w-5 h-5" />
              Exportar CSV
              <span className="text-xs opacity-75">({entries.length})</span>
            </button>

            <button
              onClick={handleExportJSON}
              disabled={!profile || entries.length === 0}
              className={`flex items-center justify-center gap-2 font-semibold py-3 px-4 rounded-xl transition-all ${
                !profile || entries.length === 0
                  ? 'bg-slate-500/30 text-slate-500 cursor-not-allowed'
                  : theme === 'dark'
                    ? 'bg-purple-600 hover:bg-purple-700 text-white'
                    : 'bg-purple-500 hover:bg-purple-600 text-white'
              }`}
            >
              <FileJson className="w-5 h-5" />
              Backup JSON
              <span className="text-xs opacity-75">(completo)</span>
            </button>
          </div>

          <p className="text-theme-muted text-sm mt-3">
            <strong>CSV:</strong> Solo registros de peso (compatible con Excel)<br />
            <strong>JSON:</strong> Backup completo (perfil + registros + evaluación nutricional)
          </p>
        </div>

        {/* Import Section */}
        <div className={`glass-card p-6 ${
          theme === 'dark'
            ? 'bg-gradient-to-br from-green-900/20 to-green-800/20'
            : 'bg-gradient-to-br from-green-100/50 to-green-50/50'
        }`}>
          <h3 className="text-lg font-semibold text-theme-primary mb-4 flex items-center gap-2">
            <Upload className={`w-5 h-5 ${theme === 'dark' ? 'text-green-400' : 'text-green-600'}`} />
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
              className={`flex items-center justify-center gap-2 font-semibold py-3 px-4 rounded-xl transition-all cursor-pointer ${
                theme === 'dark'
                  ? 'bg-green-600 hover:bg-green-700 text-white'
                  : 'bg-green-500 hover:bg-green-600 text-white'
              }`}
            >
              <Upload className="w-5 h-5" />
              Seleccionar Archivo CSV o JSON
            </label>

            <button
              onClick={downloadTemplate}
              className={`w-full flex items-center justify-center gap-2 font-medium py-2 px-4 rounded-xl transition-all text-sm ${
                theme === 'dark'
                  ? 'bg-slate-700/50 hover:bg-slate-700 text-slate-300'
                  : 'bg-slate-200/50 hover:bg-slate-200 text-slate-700'
              }`}
            >
              <Download className="w-4 h-4" />
              Descargar Plantilla CSV
            </button>
          </div>

          <div className={`rounded-xl p-3 mt-4 ${
            theme === 'dark'
              ? 'bg-yellow-900/20 border border-yellow-500/30'
              : 'bg-yellow-100/50 border border-yellow-400/50'
          }`}>
            <p className={`text-sm ${theme === 'dark' ? 'text-yellow-400' : 'text-yellow-700'}`}>
              <strong>Importante:</strong><br />
              • CSV: Se pueden añadir o reemplazar registros<br />
              • JSON: Reemplaza TODO (perfil + datos)<br />
              • Se detectarán y omitirán fechas duplicadas
            </p>
          </div>
        </div>

        {/* Formato CSV Info */}
        <div className="glass-card p-6">
          <h4 className="text-theme-primary font-semibold mb-3 flex items-center gap-2">
            <Info className="w-4 h-4" /> Formato CSV Esperado
          </h4>
          <div className={`rounded-xl p-3 font-mono text-xs overflow-x-auto ${
            theme === 'dark' ? 'bg-slate-900/50 text-slate-300' : 'bg-slate-100 text-slate-700'
          }`}>
            <div>Fecha,Peso (kg),Cheat Meal,Retención,Notas</div>
            <div className="text-theme-muted">2025-01-01,75.5,No,No,Primer día</div>
            <div className="text-theme-muted">2025-01-02,75.3,Sí,No,Cheat meal</div>
          </div>
          <p className="text-theme-muted text-sm mt-2">
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
              className={`flex items-center gap-3 px-6 py-4 rounded-xl shadow-2xl border backdrop-blur-xl ${
                importStatus.type === 'success'
                  ? theme === 'dark'
                    ? 'bg-green-900/90 border-green-500/50 text-green-100'
                    : 'bg-green-100 border-green-400 text-green-800'
                  : theme === 'dark'
                    ? 'bg-red-900/90 border-red-500/50 text-red-100'
                    : 'bg-red-100 border-red-400 text-red-800'
              }`}
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
