import fs from 'fs';
import path from 'path';
import { RawScheduleEntry, Subject, SubjectSchedule, SubjectScheduleFileEntry } from './types';

const CARRERS_BASE_DIR = path.join(__dirname, '../../../next-app/src/data/carrers');
const SUBJECTS_DIR = path.join(CARRERS_BASE_DIR, 'subjects');
const SCHEDULES_DIR = path.join(CARRERS_BASE_DIR, 'schedules');

const DAY_ORDER: Record<string, number> = {
  'Lunes': 1,
  'Martes': 2,
  'Miércoles': 3,
  'Jueves': 4,
  'Viernes': 5,
  'Sábado': 6,
};

export function sortSchedulesChronologically(schedules: SubjectSchedule[]): SubjectSchedule[] {
  return [...schedules].sort((a, b) => {
    const dayA = DAY_ORDER[a.day] || 99;
    const dayB = DAY_ORDER[b.day] || 99;
    if (dayA !== dayB) {
      return dayA - dayB;
    }
    return (a.startTime || '').localeCompare(b.startTime || '');
  });
}

export function normalizeSubjectName(str: string): string {
  return str
    .replace(/\(.*?\)/g, '') // remove parenthetical notes like (2°C - I.Inf, L.Sis)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

export function calculateSimilarity(str1: string, str2: string): number {
  const norm1 = normalizeSubjectName(str1);
  const norm2 = normalizeSubjectName(str2);

  if (norm1 === norm2) return 1.0;
  if (norm1.includes(norm2) || norm2.includes(norm1)) return 0.85;

  const words1 = new Set(norm1.split(' ').filter((w) => w.length > 2));
  const words2 = new Set(norm2.split(' ').filter((w) => w.length > 2));

  let common = 0;
  words1.forEach((w) => {
    if (words2.has(w)) common++;
  });

  const total = Math.max(words1.size, words2.size);
  return total > 0 ? common / total : 0;
}

export function getSpanishCareerFileName(careerTitle: string): string {
  const norm = normalizeSubjectName(careerTitle);

  if (norm.includes('apu') || norm.includes('analista programador')) {
    return 'Analista_programador_universitario.json';
  }
  if (norm.includes('informatica')) {
    return 'Ingenieria_informatica.json';
  }
  if (norm.includes('sistemas')) {
    return 'Licenciatura_en_sistemas.json';
  }
  if (norm.includes('quimica')) {
    return 'Ingenieria_quimica.json';
  }
  if (norm.includes('industrial')) {
    return 'Ingenieria_industrial.json';
  }
  if (norm.includes('minas') && norm.includes('ingenieria')) {
    return 'Ingenieria_de_minas.json';
  }
  if (norm.includes('geologicas') || norm.includes('geologia')) {
    return 'Licenciatura_en_cs_geologicas.json';
  }
  if (norm.includes('alimentos')) {
    return 'Licenciatura_en_tecnologia_de_los_alimentos.json';
  }
  if (norm.includes('videojuegos')) {
    return 'Tecnicatura_universitaria_en_diseno_integral_de_videojuegos.json';
  }
  if (norm.includes('perforaciones')) {
    return 'Tecnicatura_universitaria_en_perforaciones.json';
  }
  if (norm.includes('petroleo')) {
    return 'Tecnicatura_universitaria_en_ciencias_de_la_tierra_orientada_a_petroleo.json';
  }
  if (norm.includes('tierra')) {
    return 'Tecnicatura_universitaria_en_ciencias_de_la_tierra.json';
  }
  if (norm.includes('explotacion')) {
    return 'Tecnico_universitario_en_explotacion_de_minas.json';
  }
  if (norm.includes('procesamiento') || norm.includes('minerales')) {
    return 'Tecnico_universitario_en_procesamiento_de_minerales.json';
  }

  const cleanName = careerTitle
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9\s]/g, '')
    .trim()
    .replace(/\s+/g, '_')
    .toLowerCase();

  return `${cleanName}.json`;
}

export function mergeSchedulesIntoCareerJson(
  careerTitle: string,
  rawSchedules: RawScheduleEntry[]
): { updatedCount: number; targetSubjectsFile: string; targetSchedulesFile: string } {
  if (!fs.existsSync(SUBJECTS_DIR)) fs.mkdirSync(SUBJECTS_DIR, { recursive: true });
  if (!fs.existsSync(SCHEDULES_DIR)) fs.mkdirSync(SCHEDULES_DIR, { recursive: true });

  const fileName = getSpanishCareerFileName(careerTitle);
  const subjectsFilePath = path.join(SUBJECTS_DIR, fileName);
  const schedulesFilePath = path.join(SCHEDULES_DIR, fileName);

  let subjects: Subject[] = [];

  if (fs.existsSync(subjectsFilePath)) {
    try {
      subjects = JSON.parse(fs.readFileSync(subjectsFilePath, 'utf8'));
    } catch (e) {
      subjects = [];
    }
  }

  const scheduleMap = new Map<string, { originalName: string; schedules: SubjectSchedule[] }>();

  for (const entry of rawSchedules) {
    const key = normalizeSubjectName(entry.subjectName);
    if (!scheduleMap.has(key)) {
      scheduleMap.set(key, { originalName: entry.subjectName, schedules: [] });
    }

    const item: SubjectSchedule = {
      day: entry.day,
      startTime: entry.startTime,
      endTime: entry.endTime,
      classroom: entry.classroom,
      commission: entry.commission,
      group: entry.group || entry.commission,
      classType: entry.classType,
      modality: entry.modality,
    };

    scheduleMap.get(key)!.schedules.push(item);
  }

  const scheduleOutputEntries: SubjectScheduleFileEntry[] = [];
  const processedRawKeys = new Set<string>();
  let updatedCount = 0;

  if (subjects.length > 0) {
    for (const subject of subjects) {
      delete subject.schedules;

      let bestMatchKey = '';
      let highestSim = 0;

      for (const rawKey of scheduleMap.keys()) {
        const sim = calculateSimilarity(subject.name, rawKey);
        if (sim > highestSim && sim >= 0.4) {
          highestSim = sim;
          bestMatchKey = rawKey;
        }
      }

      if (bestMatchKey && highestSim >= 0.4) {
        const matchData = scheduleMap.get(bestMatchKey)!;
        const sortedSchedules = sortSchedulesChronologically(matchData.schedules);

        scheduleOutputEntries.push({
          subjectName: subject.name,
          cod: subject.cod,
          schedules: sortedSchedules,
        });
        processedRawKeys.add(bestMatchKey);
        updatedCount++;
      }
    }
  }

  // Include any remaining raw schedule items not matched to subjects.json
  for (const [rawKey, matchData] of scheduleMap.entries()) {
    if (!processedRawKeys.has(rawKey)) {
      scheduleOutputEntries.push({
        subjectName: matchData.originalName,
        schedules: sortSchedulesChronologically(matchData.schedules),
      });
      updatedCount++;
    }
  }

  // If subjects were missing, populate subjects array with clean items
  if (subjects.length === 0) {
    let codCounter = 1;
    for (const item of scheduleOutputEntries) {
      subjects.push({
        cod: item.cod || codCounter++,
        name: item.subjectName,
        year: 1,
        semester: 1,
        prerequisites: [],
        classroomUrl: '',
        isOfferedBothSemesters: false,
        groupLink: null,
        drive: '',
        type: 'mandatory',
        description: '',
      });
    }
  }

  fs.writeFileSync(subjectsFilePath, JSON.stringify(subjects, null, 2), 'utf8');
  fs.writeFileSync(schedulesFilePath, JSON.stringify(scheduleOutputEntries, null, 2), 'utf8');

  console.log(`Saved subjects to ${subjectsFilePath}`);
  console.log(`Saved schedules to ${schedulesFilePath} (${updatedCount} subjects included, sorted chronologically).`);

  return {
    updatedCount,
    targetSubjectsFile: fileName,
    targetSchedulesFile: fileName,
  };
}
