import fs from 'fs';
import path from 'path';
import { ScrapedCareerPlan } from './careerScraper';
import { normalizeSubjectNameKey } from './syllabusScraper';

const SUBJECTS_DIR = path.join(__dirname, '../../../next-app/src/data/carrers/subjects');

const PROTECTED_FILES = new Set([
  'Analista_programador_universitario.json',
  'Ingenieria_informatica.json',
  'Licenciatura_en_sistemas.json',
]);

export function getSpanishSubjectFileName(careerTitle: string): string {
  const norm = normalizeSubjectNameKey(careerTitle);

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

export function cleanupSubjectsDirectory(): string[] {
  if (!fs.existsSync(SUBJECTS_DIR)) {
    fs.mkdirSync(SUBJECTS_DIR, { recursive: true });
    return [];
  }

  const deletedFiles: string[] = [];
  const files = fs.readdirSync(SUBJECTS_DIR);

  for (const file of files) {
    if (file.endsWith('.json') && !PROTECTED_FILES.has(file)) {
      const filePath = path.join(SUBJECTS_DIR, file);
      fs.unlinkSync(filePath);
      deletedFiles.push(file);
    }
  }

  console.log(`Cleaned up ${deletedFiles.length} non-protected files in subjects directory.`);
  return deletedFiles;
}

export function integrateSyllabusAndCareerPlans(
  scrapedPlans: ScrapedCareerPlan[],
  syllabusMap: Map<string, string>
): void {
  cleanupSubjectsDirectory();

  // 1. Enrich the 3 Protected Files
  for (const protectedFileName of PROTECTED_FILES) {
    const filePath = path.join(SUBJECTS_DIR, protectedFileName);

    if (fs.existsSync(filePath)) {
      try {
        const fileContent = fs.readFileSync(filePath, 'utf8');
        const subjects: any[] = JSON.parse(fileContent);

        // Find corresponding scraped career plan if available
        const scrapedPlan = scrapedPlans.find((p) => getSpanishSubjectFileName(p.careerTitle) === protectedFileName);

        let enrichedCount = 0;

        for (const subject of subjects) {
          delete subject.schedules; // Ensure schedules property is removed

          const nameLower = (subject.name || '').toLowerCase();
          if (
            nameLower.includes('optativ') ||
            nameLower.includes('electiv') ||
            nameLower.includes('curso opt') ||
            nameLower.includes('materia opt')
          ) {
            subject.type = 'optional';
          }

          const key = normalizeSubjectNameKey(subject.name);
          let syllabusUrl: string | null = syllabusMap.get(key) || null;

          if (!syllabusUrl && scrapedPlan) {
            const matchedScrapedSubject = scrapedPlan.subjects.find(
              (s) => normalizeSubjectNameKey(s.name) === key
            );
            if (matchedScrapedSubject && matchedScrapedSubject.syllabusUrl) {
              syllabusUrl = matchedScrapedSubject.syllabusUrl;
            }
          }

          if (!syllabusUrl && subject.drive && subject.drive.includes('drive.google.com')) {
            syllabusUrl = subject.drive;
          }

          subject.syllabusUrl = syllabusUrl;
          if (syllabusUrl) enrichedCount++;
        }

        fs.writeFileSync(filePath, JSON.stringify(subjects, null, 2), 'utf8');
        console.log(`Enriched protected file "${protectedFileName}" (${enrichedCount}/${subjects.length} subjects have syllabusUrl).`);
      } catch (err: any) {
        console.error(`Error processing protected file ${protectedFileName}:`, err.message || err);
      }
    }
  }

  // 2. Generate JSON files for all other scraped careers
  for (const plan of scrapedPlans) {
    const fileName = getSpanishSubjectFileName(plan.careerTitle);

    if (PROTECTED_FILES.has(fileName)) {
      // Already enriched above
      continue;
    }

    const filePath = path.join(SUBJECTS_DIR, fileName);

    const seenCods = new Set<string>();
    let maxNum = 0;
    for (const subject of plan.subjects) {
      const num = parseInt(String(subject.cod), 10);
      if (!isNaN(num) && num > maxNum) maxNum = num;
    }

    for (const subject of plan.subjects) {
      delete (subject as any).schedules;

      const strCod = String(subject.cod);
      if (seenCods.has(strCod)) {
        if (subject.type === 'optional') {
          let newCod = 'O' + subject.cod;
          if (seenCods.has(newCod)) newCod = 'O' + (++maxNum);
          (subject as any).cod = newCod;
        } else {
          (subject as any).cod = ++maxNum;
        }
      }
      seenCods.add(String(subject.cod));

      const key = normalizeSubjectNameKey(subject.name);

      if (!subject.syllabusUrl && syllabusMap.has(key)) {
        subject.syllabusUrl = syllabusMap.get(key) || null;
      }
    }

    fs.writeFileSync(filePath, JSON.stringify(plan.subjects, null, 2), 'utf8');
    console.log(`Saved new career subjects JSON: ${filePath} (${plan.subjects.length} subjects).`);
  }
}
