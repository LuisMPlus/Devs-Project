import type { Subject } from '../types/subject'

export function getCurrentSemester(): 1 | 2 {
  const now = new Date()
  const month = now.getMonth() // 0-based index
  const day = now.getDate()

  // 1st Semester starts ~ March 23
  // 2nd Semester starts ~ August 22 (month 7 is Aug)
  if (month < 7 || (month === 7 && day < 22)) {
    return 1
  }
  return 2
}

// Codes excluded from results (non-courseable blocks)
const EXCLUDED_CODES = new Set<number | string>([31, 'R3'])

export function calculateAvailableSubjects(
  subjects: Subject[],
  passedSubjectCodes: Set<number | string>,
  targetSemester: 1 | 2
): Subject[] {
  return subjects.filter(subject => {
    // 1. If already passed, skip
    if (passedSubjectCodes.has(subject.cod)) {
      return false
    }

    // 2. Exclude R3 and Cursos Optativos (cod 31) from being suggested
    if (EXCLUDED_CODES.has(subject.cod) || subject.name === 'Cursos Optativos') {
      return false
    }

    // 2. Check direct prerequisites
    const hasAllPrerequisites = subject.prerequisites.every(prereq =>
      passedSubjectCodes.has(prereq)
    )

    if (!hasAllPrerequisites) {
      return false
    }

    // 3. Check semester availability (redictado)
    if (subject.isOfferedBothSemesters) {
      return true
    }
    
    // Optativas and Requisitos Extra might have semester null
    if (subject.semester === null) {
      return true
    }

    if (subject.semester === targetSemester) {
      return true
    }

    return false
  })
}
