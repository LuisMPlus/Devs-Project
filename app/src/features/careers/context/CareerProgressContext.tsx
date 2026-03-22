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
  setMultiple: (cods: (number | string)[], forceState?: boolean) => void
}

const CareerProgressContext = createContext<CareerProgressContextType | null>(null)

/** Build storage keys scoped to a specific career slug. */
function makeKeys(careerSlug: string) {
  return {
    passed:   `devs-career-${careerSlug}-passed-subjects`,
    result:   `devs-career-${careerSlug}-calculator-result`,
    semester: `devs-career-${careerSlug}-target-semester`,
  }
}

function loadSet(keys: ReturnType<typeof makeKeys>): Set<number | string> {
  try {
    const raw = sessionStorage.getItem(keys.passed)
    if (!raw) return new Set()
    return new Set(JSON.parse(raw) as (number | string)[])
  } catch { return new Set() }
}

function loadResult(keys: ReturnType<typeof makeKeys>): CalculatorResult | null {
  try {
    const raw = sessionStorage.getItem(keys.result)
    if (!raw) return null
    return JSON.parse(raw) as CalculatorResult
  } catch { return null }
}

function loadSemester(keys: ReturnType<typeof makeKeys>): 1 | 2 {
  try {
    const raw = sessionStorage.getItem(keys.semester)
    if (!raw) return getCurrentSemester()
    return JSON.parse(raw) as 1 | 2
  } catch { return getCurrentSemester() }
}

interface CareerProgressProviderProps {
  children: ReactNode
  /** Career slug used to namespace session storage keys (e.g. 'computer-engineering'). */
  careerSlug: string
}

export function CareerProgressProvider({ children, careerSlug }: CareerProgressProviderProps) {
  const keys = makeKeys(careerSlug)

  const [passedIds, setPassedIds] = useState<Set<number | string>>(() => loadSet(keys))
  const [calculatorResult, setCalculatorResultState] = useState<CalculatorResult | null>(() => loadResult(keys))
  const [targetSemester, setTargetSemesterState] = useState<1 | 2>(() => loadSemester(keys))

  useEffect(() => {
    sessionStorage.setItem(keys.passed, JSON.stringify(Array.from(passedIds)))
  }, [passedIds, keys.passed])

  useEffect(() => {
    if (calculatorResult) {
      sessionStorage.setItem(keys.result, JSON.stringify(calculatorResult))
    } else {
      sessionStorage.removeItem(keys.result)
    }
  }, [calculatorResult, keys.result])

  useEffect(() => {
    sessionStorage.setItem(keys.semester, JSON.stringify(targetSemester))
  }, [targetSemester, keys.semester])

  function toggleSubject(cod: number | string) {
    setPassedIds(prev => {
      const next = new Set(prev)
      if (next.has(cod)) next.delete(cod)
      else next.add(cod)
      return next
    })
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

  function setMultiple(cods: (number | string)[], forceState?: boolean) {
    setPassedIds(prev => {
      const next = new Set(prev)
      cods.forEach(cod => {
        if (forceState === true) next.add(cod)
        else if (forceState === false) next.delete(cod)
        else {
          if (next.has(cod)) next.delete(cod)
          else next.add(cod)
        }
      })
      return next
    })
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
      setMultiple,
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

