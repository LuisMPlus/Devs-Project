import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import { getCurrentSemester } from '../utils/courseCalculator'

interface CalculatorResult {
  targetSemester: 1 | 2
  availableSubjectCods: (number | string)[]
}

interface CareerProgressContextType {
  passedIds: Set<number | string>
  toggleSubject: (cod: number | string) => void
  toggleYear: (codes: (number | string)[]) => void
  clearAll: () => void
  calculatorResult: CalculatorResult | null
  setCalculatorResult: (result: CalculatorResult | null) => void
  targetSemester: 1 | 2
  setTargetSemester: (sem: 1 | 2) => void
}

const CareerProgressContext = createContext<CareerProgressContextType | null>(null)

const KEYS = {
  passed: 'devs-career-passed-subjects',
  result: 'devs-career-calculator-result',
  semester: 'devs-career-target-semester',
}

function loadSet(): Set<number | string> {
  try {
    const raw = sessionStorage.getItem(KEYS.passed)
    if (!raw) return new Set()
    return new Set(JSON.parse(raw) as (number | string)[])
  } catch { return new Set() }
}

function loadResult(): CalculatorResult | null {
  try {
    const raw = sessionStorage.getItem(KEYS.result)
    if (!raw) return null
    return JSON.parse(raw) as CalculatorResult
  } catch { return null }
}

function loadSemester(): 1 | 2 {
  try {
    const raw = sessionStorage.getItem(KEYS.semester)
    if (!raw) return getCurrentSemester()
    return JSON.parse(raw) as 1 | 2
  } catch { return getCurrentSemester() }
}

export function CareerProgressProvider({ children }: { children: ReactNode }) {
  const [passedIds, setPassedIds] = useState<Set<number | string>>(loadSet)
  const [calculatorResult, setCalculatorResultState] = useState<CalculatorResult | null>(loadResult)
  const [targetSemester, setTargetSemesterState] = useState<1 | 2>(loadSemester)

  useEffect(() => {
    sessionStorage.setItem(KEYS.passed, JSON.stringify(Array.from(passedIds)))
  }, [passedIds])

  useEffect(() => {
    if (calculatorResult) {
      sessionStorage.setItem(KEYS.result, JSON.stringify(calculatorResult))
    } else {
      sessionStorage.removeItem(KEYS.result)
    }
  }, [calculatorResult])

  useEffect(() => {
    sessionStorage.setItem(KEYS.semester, JSON.stringify(targetSemester))
  }, [targetSemester])

  function toggleSubject(cod: number | string) {
    setPassedIds(prev => {
      const next = new Set(prev)
      if (next.has(cod)) next.delete(cod)
      else next.add(cod)
      return next
    })
    // invalidate results when selection changes
    setCalculatorResultState(null)
  }

  function toggleYear(codes: (number | string)[]) {
    setPassedIds(prev => {
      const allSelected = codes.every(cod => prev.has(cod))
      const next = new Set(prev)
      if (allSelected) {
        codes.forEach(cod => next.delete(cod))
      } else {
        codes.forEach(cod => next.add(cod))
      }
      return next
    })
    setCalculatorResultState(null)
  }

  function clearAll() {
    setPassedIds(new Set())
    setCalculatorResultState(null)
  }

  function setCalculatorResult(result: CalculatorResult | null) {
    setCalculatorResultState(result)
  }

  function setTargetSemester(sem: 1 | 2) {
    setTargetSemesterState(sem)
    setCalculatorResultState(null)
  }

  return (
    <CareerProgressContext.Provider value={{
      passedIds,
      toggleSubject,
      toggleYear,
      clearAll,
      calculatorResult,
      setCalculatorResult,
      targetSemester,
      setTargetSemester,
    }}>
      {children}
    </CareerProgressContext.Provider>
  )
}

export function useCareerProgress() {
  const ctx = useContext(CareerProgressContext)
  if (!ctx) throw new Error('useCareerProgress must be used within CareerProgressProvider')
  return ctx
}
