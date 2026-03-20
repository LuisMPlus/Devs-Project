import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { fetchSubjectsByCareer } from '../services/subjectService'
import type { Subject } from '../types/subject'
import type { CareerConfig } from '../types/career'
import { calculateAvailableSubjects } from '../utils/courseCalculator'
import SubjectDetailPanel from '../components/MateriaDetailPanel'
import { useCareerProgress } from '../context/CareerProgressContext'

interface SubjectCalculatorProps {
  career: CareerConfig
}

export default function SubjectCalculator({ career }: SubjectCalculatorProps) {
  const navigate = useNavigate()
  const {
    passedIds, toggleSubject,
    toggleYear: contextToggleYear,
    targetSemester, setTargetSemester,
    calculatorResult, setCalculatorResult,
  } = useCareerProgress()

  const [subjects, setSubjects] = useState<Subject[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null)

  // Derive availableSubjects from subjects list + stored result cods
  const availableSubjects: Subject[] = calculatorResult
    ? subjects.filter(s => calculatorResult.availableSubjectCods.includes(s.cod))
    : []

  useEffect(() => {
    let mounted = true
    const loadData = async () => {
      setLoading(true)
      const data = await fetchSubjectsByCareer(career.slug)
      if (mounted) {
        setSubjects(data)
        setLoading(false)
      }
    }
    loadData()
    return () => { mounted = false }
  }, [career.slug])

  function toggleYear(yearLabel: string) {
    const group = groupedSubjects[yearLabel] ?? []
    contextToggleYear(group.map(sub => sub.cod))
  }

  function handleCalculate() {
    const available = calculateAvailableSubjects(subjects, passedIds, targetSemester)
    setCalculatorResult({
      targetSemester,
      availableSubjectCods: available.map(s => s.cod),
    })
    setTimeout(() => {
      document.getElementById('calculator-results')?.scrollIntoView({ behavior: 'smooth' })
    }, 100)
  }

  // Only exclude pure electives (type=optional) from the checkbox list.
  const selectableSubjects = subjects.filter(sub => sub.type !== 'optional')

  // Group by year for neat display
  const groupedSubjects = selectableSubjects.reduce((acc, sub) => {
    const y = sub.year === null ? 'Extra' : sub.year.toString()
    if (!acc[y]) acc[y] = []
    acc[y].push(sub)
    return acc
  }, {} as Record<string, Subject[]>)

  const sortedYears = Object.keys(groupedSubjects).sort((a, b) => {
    if (a === 'Extra') return 1
    if (b === 'Extra') return -1
    return Number(a) - Number(b)
  })

  return (
    <div className="flex-1 w-full flex flex-col px-6 py-10 relative" style={{ backgroundColor: 'var(--color-bg)', color: 'var(--color-text)' }}>
      {/* Glow */}
      <div className="absolute top-[-100px] left-[-100px] w-[500px] h-[500px] rounded-full blur-[120px] opacity-10 pointer-events-none" style={{ backgroundColor: 'var(--color-primary)' }} />
      <div className="absolute bottom-[-100px] right-[-100px] w-[500px] h-[500px] rounded-full blur-[120px] opacity-10 pointer-events-none" style={{ backgroundColor: 'var(--color-secondary)' }} />

      <div className="relative z-10 mb-8 max-w-5xl mx-auto w-full">
        <button
          onClick={() => navigate(career.baseRoute)}
          className="inline-flex items-center gap-2 text-sm mb-6 transition-all duration-150 hover:text-(--color-primary)"
          style={{ color: 'color-mix(in srgb, var(--color-text) 50%, transparent)' }}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
          </svg>
          Volver a {career.title}
        </button>

        <h1 className="text-3xl sm:text-4xl font-extrabold mb-4" style={{ backgroundImage: 'linear-gradient(to right, var(--color-primary), var(--color-secondary))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          Calculadora de Cursada
        </h1>
        <p className="text-sm md:text-base leading-relaxed mb-10 max-w-3xl" style={{ color: 'color-mix(in srgb, var(--color-text) 60%, transparent)' }}>
          Selecciona las materias que ya tienes "Regularizadas" o "Aprobadas". Ajusta el cuatrimestre a planificar y presiona el botón para descubrir qué materias estás habilitado a cursar, teniendo en cuenta correlatividades y dictados.
        </p>

        {loading ? (
          <div className="flex flex-col items-center justify-center gap-4 text-sm opacity-60 h-64">
            <svg className="w-8 h-8 animate-spin text-(--color-primary)" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p>Cargando materias...</p>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-10 items-start">

            {/* Formulario (Materias pasadas) */}
            <div className="flex-1 w-full">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold uppercase tracking-wider">Aprobadas o Regulares</h2>
                <div className="text-xs font-semibold px-3 py-1 rounded-lg border" style={{ borderColor: 'color-mix(in srgb, var(--color-primary) 30%, transparent)', color: 'var(--color-primary)' }}>
                  {passedIds.size} seleccionadas
                </div>
              </div>

              <div className="flex flex-col gap-8">
                {sortedYears.map((yearLabel) => {
                  const group = groupedSubjects[yearLabel]
                  const allSelected = group.every(sub => passedIds.has(sub.cod))
                  const someSelected = !allSelected && group.some(sub => passedIds.has(sub.cod))
                  return (
                    <div key={yearLabel}>
                      <div className="flex items-center gap-3 mb-3">
                        <input
                          type="checkbox"
                          checked={allSelected}
                          ref={el => { if (el) el.indeterminate = someSelected }}
                          onChange={() => toggleYear(yearLabel)}
                          className="w-4 h-4 rounded text-(--color-primary) focus:ring-(--color-primary) cursor-pointer"
                        />
                        <h3 className="text-sm font-semibold tracking-widest uppercase opacity-70 cursor-pointer" onClick={() => toggleYear(yearLabel)}>
                          {yearLabel === 'Extra' ? 'Requisitos Extra' : `Año ${yearLabel}`}
                        </h3>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {group.map(sub => {
                          const isSelected = passedIds.has(sub.cod)
                          const semLabel = sub.isOfferedBothSemesters
                            ? 'Anual'
                            : sub.semester === 1
                            ? '1° Cuatrimestre'
                            : sub.semester === 2
                            ? '2° Cuatrimestre'
                            : null
                          return (
                            <label
                              key={sub.cod}
                              className="flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all duration-200"
                              style={{
                                borderColor: isSelected ? 'var(--color-primary)' : 'color-mix(in srgb, var(--color-text) 10%, transparent)',
                                backgroundColor: isSelected ? 'color-mix(in srgb, var(--color-primary) 8%, transparent)' : 'color-mix(in srgb, var(--color-bg) 50%, transparent)',
                              }}
                            >
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => toggleSubject(sub.cod)}
                                className="w-4 h-4 mt-0.5 shrink-0 rounded text-(--color-primary) focus:ring-(--color-primary)"
                              />
                              <div className="flex flex-col gap-1 min-w-0">
                                <span className="text-sm font-medium leading-tight" style={{ color: isSelected ? 'var(--color-text)' : 'color-mix(in srgb, var(--color-text) 70%, transparent)' }}>{sub.name}</span>
                                {semLabel && (
                                  <span className="text-[10px] font-semibold uppercase tracking-wide" style={{ color: 'color-mix(in srgb, var(--color-secondary) 70%, transparent)' }}>{semLabel}</span>
                                )}
                              </div>
                            </label>
                          )
                        })}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Panel flotante de Calculo */}
            <div className="w-full lg:w-80 lg:sticky lg:top-28 flex flex-col gap-6 p-6 rounded-2xl border" style={{ borderColor: 'color-mix(in srgb, var(--color-accent) 20%, transparent)', backgroundColor: 'color-mix(in srgb, var(--color-bg) 95%, transparent)', backdropFilter: 'blur(8px)' }}>

              <div>
                <h3 className="font-semibold text-sm tracking-widest uppercase mb-3 text-(--color-secondary)">Meta a planificar</h3>
                <div className="flex rounded-xl overflow-hidden border" style={{ borderColor: 'color-mix(in srgb, var(--color-text) 15%, transparent)' }}>
                  {[1, 2].map((sem) => (
                    <button
                      key={sem}
                      onClick={() => { setTargetSemester(sem as 1 | 2) }}
                      className="flex-1 py-3 text-sm font-semibold transition-colors duration-200"
                      style={{
                        backgroundColor: targetSemester === sem ? 'var(--color-accent)' : 'transparent',
                        color: targetSemester === sem ? '#fff' : 'color-mix(in srgb, var(--color-text) 50%, transparent)'
                      }}
                    >
                      Cuatrimestre {sem}
                    </button>
                  ))}
                </div>
                <p className="text-xs mt-3 text-balance opacity-60">
                  El Cuatrimestre 1 inicia aprox. en Marzo. <br/> El Cuatrimestre 2 inicia aprox. en Agosto.
                </p>
              </div>

              <button
                onClick={handleCalculate}
                className="w-full py-4 rounded-xl font-bold text-center tracking-wide uppercase transition-transform hover:scale-[1.02] active:scale-95 shadow-lg"
                style={{ backgroundColor: 'var(--color-primary)', color: 'var(--color-bg)', boxShadow: '0 4px 20px color-mix(in srgb, var(--color-primary) 30%, transparent)' }}
              >
                Calcular Cursada
              </button>
            </div>

          </div>
        )}

      </div>

      {/* RESULTADOS */}
      {calculatorResult && !loading && (
        <div id="calculator-results" className="w-full relative z-10 py-16 mt-8 border-t" style={{ borderColor: 'color-mix(in srgb, var(--color-primary) 10%, transparent)', backgroundColor: 'color-mix(in srgb, var(--color-primary) 2%, transparent)' }}>
          <div className="max-w-5xl mx-auto px-6">
            <h2 className="text-2xl font-bold mb-2">Resultados para tu Cuatrimestre {targetSemester}</h2>
            <p className="text-sm mb-8 opacity-70">
              Según las {passedIds.size} materias aprobadas seleccionadas, estás habilitado para cursar las siguientes {availableSubjects.length} materias.
            </p>

            {availableSubjects.length === 0 ? (
              <div className="p-8 text-center rounded-2xl border border-dashed" style={{ borderColor: 'color-mix(in srgb, var(--color-text) 20%, transparent)' }}>
                <p className="opacity-70">No tienes materias disponibles para este cuatrimestre dadas tus correlativas actuales.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {availableSubjects.map(sub => (
                  <div
                    key={sub.cod}
                    onClick={() => setSelectedSubject(sub)}
                    className="flex flex-col p-5 rounded-2xl border cursor-pointer transition-all duration-200 hover:-translate-y-0.5"
                    style={{ borderColor: 'color-mix(in srgb, var(--color-secondary) 30%, transparent)', backgroundColor: 'color-mix(in srgb, var(--color-bg) 50%, transparent)' }}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <span className="text-xs font-bold uppercase tracking-widest text-(--color-secondary)">
                        {sub.year ? `AÑO ${sub.year}` : sub.type === 'optional' ? 'OPTATIVA' : 'REQUISITO'}
                      </span>
                      {sub.isOfferedBothSemesters && (
                        <span className="text-[10px] uppercase px-2 py-0.5 rounded-full border border-(--color-accent) text-(--color-accent)">Redictado</span>
                      )}
                    </div>
                    <h4 className="font-semibold text-base mb-1">{sub.name}</h4>
                    <p className="text-xs opacity-40 mt-auto pt-4 border-t border-white/5">Toca para ver detalles →</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Panel lateral de detalle */}
      <SubjectDetailPanel
        subject={selectedSubject}
        subjects={subjects}
        onClose={() => setSelectedSubject(null)}
      />
    </div>
  )
}
