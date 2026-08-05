import fs from 'fs';
import pdfParse from 'pdf-parse';
import { RawScheduleEntry } from '../types';
import { normalizeDay, parseTimeRange, parseGlossaryTypeAndCommission, parseModality } from './sheetParser';

export async function parsePdfSchedule(filePath: string, careerName: string): Promise<RawScheduleEntry[]> {
  console.log(`Parsing PDF schedule file: ${filePath}`);
  const dataBuffer = fs.readFileSync(filePath);
  const pdfData = await pdfParse(dataBuffer);
  const text = pdfData.text || '';
  const lines = text.split('\n').map((l) => l.trim()).filter((l) => l.length > 0);

  const results: RawScheduleEntry[] = [];
  let currentSubjectName = '';

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    const dayMatch = normalizeDay(line);
    const timeMatch = parseTimeRange(line);

    if (!dayMatch && !timeMatch && line.length > 4 && !line.startsWith('Horario') && !line.startsWith('Facultad')) {
      if (!line.toLowerCase().includes('aula') && !line.toLowerCase().includes('comisión')) {
        currentSubjectName = line;
      }
    }

    if (dayMatch && timeMatch && currentSubjectName) {
      const classroomMatch = line.match(/(?:Aula|Sala|Lab|Laboratorio)\s*\d+([a-zA-Z0-9_-]*)/i);
      const classroom = classroomMatch ? classroomMatch[0] : 'Por definir';
      const typeAndComm = parseGlossaryTypeAndCommission(line);

      results.push({
        subjectName: currentSubjectName,
        day: dayMatch,
        startTime: timeMatch.startTime,
        endTime: timeMatch.endTime,
        classroom,
        commission: typeAndComm.commission,
        group: typeAndComm.commission,
        classType: typeAndComm.classType,
        modality: parseModality(line),
        careerName,
      });
    } else if (dayMatch && !timeMatch && i + 1 < lines.length) {
      const nextTimeMatch = parseTimeRange(lines[i + 1]);
      if (nextTimeMatch && currentSubjectName) {
        const fullLine = line + ' ' + lines[i + 1];
        const classroomMatch = fullLine.match(/(?:Aula|Sala|Lab|Laboratorio)\s*\d+([a-zA-Z0-9_-]*)/i);
        const classroom = classroomMatch ? classroomMatch[0] : 'Por definir';
        const typeAndComm = parseGlossaryTypeAndCommission(fullLine);

        results.push({
          subjectName: currentSubjectName,
          day: dayMatch,
          startTime: nextTimeMatch.startTime,
          endTime: nextTimeMatch.endTime,
          classroom,
          commission: typeAndComm.commission,
          group: typeAndComm.commission,
          classType: typeAndComm.classType,
          modality: parseModality(fullLine),
          careerName,
        });
      }
    }
  }

  console.log(`Parsed ${results.length} schedule entries from PDF file: ${filePath}`);
  return results;
}
