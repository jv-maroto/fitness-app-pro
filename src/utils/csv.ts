import { WeightEntry, UserProfile } from '../types';
import { format, parse } from 'date-fns';

export interface CSVExportData {
  profile: UserProfile;
  entries: WeightEntry[];
}

/**
 * Convierte los datos a formato CSV
 */
export function exportToCSV(entries: WeightEntry[]): string {
  if (entries.length === 0) {
    return 'Fecha,Peso (kg),Cheat Meal,Retención,Notas\n';
  }

  const headers = 'Fecha,Peso (kg),Cheat Meal,Retención,Notas\n';

  const rows = entries
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .map(entry => {
      const date = format(new Date(entry.date), 'yyyy-MM-dd');
      const weight = entry.weight.toString();
      const cheatMeal = entry.isCheatMeal ? 'Sí' : 'No';
      const retention = entry.isRetention ? 'Sí' : 'No';
      const notes = entry.notes ? `"${entry.notes.replace(/"/g, '""')}"` : '';

      return `${date},${weight},${cheatMeal},${retention},${notes}`;
    })
    .join('\n');

  return headers + rows;
}

/**
 * Descarga un archivo CSV
 */
export function downloadCSV(csvContent: string, filename: string = 'weight-tracker-export.csv'): void {
  const BOM = '\uFEFF'; // UTF-8 BOM para Excel
  const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');

  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}

/**
 * Exporta datos completos (perfil + entradas) en formato JSON
 */
export function exportToJSON(profile: UserProfile, entries: WeightEntry[]): string {
  const data: CSVExportData = {
    profile,
    entries: entries.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()),
  };

  return JSON.stringify(data, null, 2);
}

/**
 * Descarga un archivo JSON
 */
export function downloadJSON(jsonContent: string, filename: string = 'weight-tracker-backup.json'): void {
  const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8;' });
  const link = document.createElement('a');

  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}

/**
 * Parsea un archivo CSV y lo convierte a entradas de peso
 */
export function parseCSV(csvContent: string): Partial<WeightEntry>[] {
  const lines = csvContent.trim().split('\n');

  if (lines.length < 2) {
    throw new Error('El archivo CSV está vacío o no tiene datos');
  }

  // Detectar separador (coma o punto y coma)
  const separator = csvContent.includes(';') ? ';' : ',';

  // Saltar la primera línea (headers)
  const dataLines = lines.slice(1);

  const entries: Partial<WeightEntry>[] = [];
  const errors: string[] = [];

  dataLines.forEach((line, index) => {
    if (!line.trim()) return; // Saltar líneas vacías

    try {
      const values = parseCSVLine(line, separator);

      if (values.length < 2) {
        errors.push(`Línea ${index + 2}: Formato inválido`);
        return;
      }

      const [dateStr, weightStr, cheatMealStr = '', retentionStr = '', notesStr = ''] = values;

      // Parsear fecha (soporta varios formatos)
      let date: Date;
      try {
        // Intentar formato ISO (yyyy-MM-dd)
        date = parse(dateStr.trim(), 'yyyy-MM-dd', new Date());
        if (isNaN(date.getTime())) {
          // Intentar formato dd/MM/yyyy
          date = parse(dateStr.trim(), 'dd/MM/yyyy', new Date());
        }
        if (isNaN(date.getTime())) {
          throw new Error('Fecha inválida');
        }
      } catch {
        errors.push(`Línea ${index + 2}: Fecha inválida "${dateStr}"`);
        return;
      }

      // Parsear peso
      const weight = parseFloat(weightStr.trim().replace(',', '.'));
      if (isNaN(weight) || weight <= 0 || weight > 500) {
        errors.push(`Línea ${index + 2}: Peso inválido "${weightStr}"`);
        return;
      }

      // Parsear flags
      const isCheatMeal = ['sí', 'si', 'yes', 'true', '1'].includes(
        cheatMealStr.trim().toLowerCase()
      );
      const isRetention = ['sí', 'si', 'yes', 'true', '1'].includes(
        retentionStr.trim().toLowerCase()
      );

      // Notas
      const notes = notesStr.trim().replace(/^"|"$/g, '').replace(/""/g, '"') || undefined;

      entries.push({
        date,
        weight,
        isCheatMeal,
        isRetention,
        notes,
      });
    } catch (error) {
      errors.push(`Línea ${index + 2}: Error al procesar - ${error}`);
    }
  });

  if (errors.length > 0) {
    console.warn('Errores durante la importación:', errors);
  }

  if (entries.length === 0) {
    throw new Error('No se pudo importar ningún registro válido del CSV');
  }

  return entries;
}

/**
 * Parsea una línea CSV considerando comillas
 */
function parseCSVLine(line: string, separator: string): string[] {
  const values: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    const nextChar = line[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        // Comilla escapada
        current += '"';
        i++; // Saltar la siguiente comilla
      } else {
        // Toggle quotes
        inQuotes = !inQuotes;
      }
    } else if (char === separator && !inQuotes) {
      values.push(current);
      current = '';
    } else {
      current += char;
    }
  }

  values.push(current); // Añadir el último valor
  return values;
}

/**
 * Parsea un archivo JSON con backup completo
 */
export function parseJSON(jsonContent: string): CSVExportData {
  try {
    const data = JSON.parse(jsonContent);

    if (!data.profile || !data.entries) {
      throw new Error('Formato JSON inválido: falta profile o entries');
    }

    // Convertir fechas de string a Date
    data.entries = data.entries.map((entry: any) => ({
      ...entry,
      date: new Date(entry.date),
      createdAt: new Date(entry.createdAt),
      updatedAt: new Date(entry.updatedAt),
    }));

    data.profile.startDate = new Date(data.profile.startDate);
    data.profile.createdAt = new Date(data.profile.createdAt);
    data.profile.updatedAt = new Date(data.profile.updatedAt);

    return data as CSVExportData;
  } catch (error) {
    throw new Error(`Error al parsear JSON: ${error}`);
  }
}

/**
 * Lee un archivo y devuelve su contenido como string
 */
export function readFileAsText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      const text = e.target?.result as string;
      resolve(text);
    };

    reader.onerror = () => {
      reject(new Error('Error al leer el archivo'));
    };

    reader.readAsText(file, 'UTF-8');
  });
}
