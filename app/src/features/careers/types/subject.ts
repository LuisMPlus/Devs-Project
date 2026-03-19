export interface Schedule {
  day: 'Lunes' | 'Martes' | 'Miércoles' | 'Jueves' | 'Viernes' | 'Sábado'
  startTime: string
  endTime: string
  classroom: string
  group?: string
  classType?: 'T' | 'P' | 'TP' | 'S'
  modality?: 'virtual' | 'presencial' | 'hibrido' | string
}

export interface Subject {
  cod: number | string
  name: string
  year: number | null | string
  semester: 1 | 2 | null
  prerequisites: (number | string)[]
  classroomUrl: string
  schedules: Schedule[]
  isOfferedBothSemesters?: boolean
  groupLink: string | null
  drive: string
  isSelective: boolean
  type: "mandatory" | "optional" | "requirement"
  description: string | null
}
