import * as XLSX from 'xlsx';
import { ClassType, RawScheduleEntry } from '../types';

export function normalizeDay(rawDay: string): 'Lunes' | 'Martes' | 'Miércoles' | 'Jueves' | 'Viernes' | 'Sábado' | null {
  if (!rawDay) return null;
  const clean = rawDay.trim().toLowerCase();
  if (clean.includes('lun')) return 'Lunes';
  if (clean.includes('mar')) return 'Martes';
  if (clean.includes('mié') || clean.includes('mie')) return 'Miércoles';
  if (clean.includes('jue')) return 'Jueves';
  if (clean.includes('vie')) return 'Viernes';
  if (clean.includes('sáb') || clean.includes('sab')) return 'Sábado';
  return null;
}

export function parseTimeRange(rawTime: string): { startTime: string; endTime: string } | null {
  if (!rawTime) return null;
  const clean = rawTime.replace(/\./g, ':');
  const timeMatch = clean.match(/(\d{1,2})(?::(\d{2}))?\s*(?:hs|hrs)?\s*(?:a|-|to)\s*(\d{1,2})(?::(\d{2}))?/i);
  if (timeMatch) {
    const startHour = timeMatch[1].padStart(2, '0');
    const startMin = timeMatch[2] || '00';
    const endHour = timeMatch[3].padStart(2, '0');
    const endMin = timeMatch[4] || '00';
    return {
      startTime: `${startHour}:${startMin}`,
      endTime: `${endHour}:${endMin}`,
    };
  }
  return null;
}

export function parseGlossaryTypeAndCommission(rawVal: string): { classType?: ClassType; commission?: string } {
  if (!rawVal) return {};
  const clean = rawVal.trim().toUpperCase();

  // Match C1P, C2P, C3P...
  const c1pMatch = clean.match(/\bC\d+P\b/i);
  if (c1pMatch) {
    return { classType: 'P', commission: c1pMatch[0].toUpperCase() };
  }

  // Match TPL, TPL1...
  const tplMatch = clean.match(/\bTPL\d*\b/i);
  if (tplMatch) {
    return { classType: 'TPL', commission: tplMatch[0].toUpperCase() };
  }

  // Match TP, TP1, TP2, T-P...
  const tpMatch = clean.match(/\bTP\d*\b/i) || clean.match(/\bT-P\b/i);
  if (tpMatch) {
    return { classType: 'TP', commission: tpMatch[0].toUpperCase() };
  }

  // Match T, T1, T2, T3, Teoría...
  const tMatch = clean.match(/\bT\d*\b/i) || clean.match(/\bTEOR[IÍ]A\b/i);
  if (tMatch && !clean.includes('LAB') && !clean.includes('PRAC')) {
    const comm = clean.match(/\bT\d+\b/i) ? clean.match(/\bT\d+\b/i)![0].toUpperCase() : 'T';
    return { classType: 'T', commission: comm };
  }

  // Match P, P1, P2, Práctica...
  const pMatch = clean.match(/\bP\d*\b/i) || clean.match(/\bPR[AÁ]CTICA\b/i) || clean.match(/\bPR[AÁ]CTICO\b/i);
  if (pMatch && !clean.startsWith('TP')) {
    const comm = clean.match(/\bP\d+\b/i) ? clean.match(/\bP\d+\b/i)![0].toUpperCase() : 'P';
    return { classType: 'P', commission: comm };
  }

  // Match C1, C2, C3, Comisión 1...
  const cMatch = clean.match(/\bC\d+\b/i) || clean.match(/\bCOMISI[OÓ]N\s*\d+/i);
  if (cMatch) {
    const comm = clean.match(/C\d+/i) ? clean.match(/C\d+/i)![0].toUpperCase() : clean;
    return { classType: 'P', commission: comm };
  }

  // Match L, L1, Laboratorio...
  const lMatch = clean.match(/\bL\d*\b/i) || clean.match(/\bLABORATORIO\b/i);
  if (lMatch) {
    const comm = clean.match(/\bL\d+\b/i) ? clean.match(/\bL\d+\b/i)![0].toUpperCase() : 'L';
    return { classType: 'L', commission: comm };
  }

  // Match S, Seminario...
  const sMatch = clean.match(/\bS\b/i) || clean.match(/\bSEMINARIO\b/i);
  if (sMatch) {
    return { classType: 'S', commission: 'S' };
  }

  return {};
}

export function parseModality(rawModality: string): 'virtual' | 'presencial' | 'hibrido' | string {
  if (!rawModality) return 'presencial';
  const clean = rawModality.toLowerCase().trim();
  if (clean.includes('virt') || clean.includes('http')) return 'virtual';
  if (clean.includes('híb') || clean.includes('hib')) return 'hibrido';
  if (clean.includes('presen')) return 'presencial';
  return rawModality.trim();
}

export function parseExcelSchedule(filePath: string, careerName: string): RawScheduleEntry[] {
  console.log(`Parsing Excel schedule file: ${filePath}`);
  const workbook = XLSX.readFile(filePath);
  const results: RawScheduleEntry[] = [];

  for (const sheetName of workbook.SheetNames) {
    const sheet = workbook.Sheets[sheetName];
    const rows = XLSX.utils.sheet_to_json<Record<string, any>>(sheet, { header: 1, raw: false, defval: '' });

    if (!rows || rows.length < 2) continue;

    let headerRowIndex = -1;
    let colSubject = -1;
    let colDay = -1;
    let colTime = -1;
    let colClassroom = -1;
    let colGroup = -1;
    let colType = -1;
    let colModality = -1;

    for (let i = 0; i < Math.min(rows.length, 20); i++) {
      const row = rows[i] as any[];
      if (!Array.isArray(row)) continue;

      row.forEach((cell, colIdx) => {
        const val = String(cell || '').toLowerCase().trim();
        if (val.includes('materia') || val.includes('asignatura') || val.includes('cátedra') || val.includes('catedra') || val.includes('espacio') || val.includes('nombre')) colSubject = colIdx;
        if (val.includes('día') || val.includes('dia') || val.includes('jornada')) colDay = colIdx;
        if (val.includes('hora') || val.includes('horario') || val.includes('hs') || val.includes('turno')) colTime = colIdx;
        if (val.includes('aula') || val.includes('lugar') || val.includes('salón') || val.includes('salon')) colClassroom = colIdx;
        if (val.includes('comisi') || val.includes('grupo')) colGroup = colIdx;
        if (val.includes('tipo') || val.includes('carácter') || val.includes('caracter')) colType = colIdx;
        if (val.includes('modalidad') || val.includes('dictado')) colModality = colIdx;
      });

      if (colSubject !== -1 && (colDay !== -1 || colTime !== -1)) {
        headerRowIndex = i;
        break;
      }
    }

    let currentSubjectName = '';

    if (headerRowIndex !== -1) {
      for (let r = headerRowIndex + 1; r < rows.length; r++) {
        const row = rows[r] as any[];
        if (!Array.isArray(row) || row.every((c) => !c)) continue;

        const rawSubject = String(row[colSubject] || '').trim();
        if (rawSubject) {
          currentSubjectName = rawSubject.split('\n')[0].trim();
        }

        if (!currentSubjectName) continue;

        const rawDay = colDay !== -1 ? String(row[colDay] || '') : '';
        const day = normalizeDay(rawDay);
        if (!day) continue;

        const rawTime = colTime !== -1 ? String(row[colTime] || '') : '';
        const timeRange = parseTimeRange(rawTime);
        if (!timeRange) continue;

        const classroom = colClassroom !== -1 ? String(row[colClassroom] || '').trim() || 'Por definir' : 'Por definir';
        const rawGroup = colGroup !== -1 ? String(row[colGroup] || '').trim() : '';
        const rawType = colType !== -1 ? String(row[colType] || '').trim() : '';

        const typeAndComm = parseGlossaryTypeAndCommission(`${rawType} ${rawGroup}`);
        const modality = colModality !== -1 ? parseModality(String(row[colModality] || '')) : 'presencial';

        results.push({
          subjectName: currentSubjectName,
          day,
          startTime: timeRange.startTime,
          endTime: timeRange.endTime,
          classroom,
          commission: typeAndComm.commission || rawGroup || undefined,
          group: typeAndComm.commission || rawGroup || undefined,
          classType: typeAndComm.classType,
          modality,
          careerName,
        });
      }
    } else {
      // Block Layout
      for (let r = 0; r < rows.length; r++) {
        const row = rows[r] as any[];
        if (!Array.isArray(row) || row.every((c) => !c)) continue;

        let foundDay: 'Lunes' | 'Martes' | 'Miércoles' | 'Jueves' | 'Viernes' | 'Sábado' | null = null;
        let foundTime: { startTime: string; endTime: string } | null = null;
        let classroom = 'Por definir';
        let rawTypeAndCommStr = '';
        let modality: 'virtual' | 'presencial' | 'hibrido' | string = 'presencial';

        for (const cell of row) {
          const val = String(cell || '').trim();
          if (!val) continue;

          const dayMatch = normalizeDay(val);
          if (dayMatch && !foundDay) {
            foundDay = dayMatch;
          }

          const timeMatch = parseTimeRange(val);
          if (timeMatch && !foundTime) {
            foundTime = timeMatch;
          }

          if (val.match(/^(T|P|TP|TPL|S|L|C\d+|C\d+P|T\d+|P\d+|TP\d+|G\d+)$/i)) {
            rawTypeAndCommStr += ' ' + val;
          }

          if (val.toLowerCase().includes('aula') || val.toLowerCase().includes('salón') || val.toLowerCase().includes('virtual') || val.toLowerCase().includes('anfiteatro')) {
            classroom = val;
            modality = parseModality(val);
          }
        }

        if (foundDay && foundTime && currentSubjectName) {
          const typeAndComm = parseGlossaryTypeAndCommission(rawTypeAndCommStr);

          results.push({
            subjectName: currentSubjectName,
            day: foundDay,
            startTime: foundTime.startTime,
            endTime: foundTime.endTime,
            classroom,
            commission: typeAndComm.commission || rawTypeAndCommStr.trim() || undefined,
            group: typeAndComm.commission || rawTypeAndCommStr.trim() || undefined,
            classType: typeAndComm.classType,
            modality,
            careerName,
          });
        } else {
          const titleCandidate = row.find((c) => String(c || '').trim().length > 5);
          if (titleCandidate) {
            const cleanTitle = String(titleCandidate).split('\n')[0].trim();
            if (
              !cleanTitle.toUpperCase().includes('HORARIOS') &&
              !cleanTitle.toUpperCase().includes('CUATRIMESTRE') &&
              !cleanTitle.toUpperCase().includes('AÑO:') &&
              !cleanTitle.toUpperCase().includes('LICENCIATURA') &&
              !cleanTitle.toUpperCase().includes('UNIVERSIDAD') &&
              !cleanTitle.toUpperCase().includes('GRANDEZA')
            ) {
              currentSubjectName = cleanTitle;
            }
          }
        }
      }
    }
  }

  console.log(`Parsed ${results.length} schedule entries from Excel file: ${filePath}`);
  return results;
}
