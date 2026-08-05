export type SemesterOption = 'auto' | 1 | 2;

export interface ScrapedCareerLink {
  careerName: string;
  url: string;
  fileType: 'google_sheets' | 'google_drive_pdf' | 'other';
  semester: 1 | 2;
  category?: string;
}

export type ClassType = 'T' | 'P' | 'TP' | 'TPL' | 'S' | 'L';

export interface RawScheduleEntry {
  subjectName: string;
  day: 'Lunes' | 'Martes' | 'Miércoles' | 'Jueves' | 'Viernes' | 'Sábado';
  startTime: string;
  endTime: string;
  classroom: string;
  commission?: string;
  group?: string;
  classType?: ClassType;
  modality?: 'virtual' | 'presencial' | 'hibrido' | string;
  careerName?: string;
}

export interface SubjectSchedule {
  day: 'Lunes' | 'Martes' | 'Miércoles' | 'Jueves' | 'Viernes' | 'Sábado';
  startTime: string;
  endTime: string;
  classroom: string;
  commission?: string;
  group?: string;
  classType?: ClassType;
  modality?: 'virtual' | 'presencial' | 'hibrido' | string;
}

export interface SubjectScheduleFileEntry {
  subjectName: string;
  cod?: number | string;
  schedules: SubjectSchedule[];
}

export interface Subject {
  cod: number | string;
  name: string;
  year: number | null | string;
  semester: 1 | 2 | null;
  prerequisites: (number | string)[];
  classroomUrl: string;
  schedules?: SubjectSchedule[]; // Optional, will be stripped when saved to subjects folder
  isOfferedBothSemesters?: boolean;
  groupLink: string | null;
  drive: string;
  isSelective?: boolean;
  type: 'mandatory' | 'optional' | 'requirement';
  description: string | null;
}
