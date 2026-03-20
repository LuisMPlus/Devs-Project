import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import SubjectGraph from '../components/MateriaGraph'
import SubjectDetailPanel from '../components/MateriaDetailPanel'
import { fetchSubjectsByCareer } from '../services/subjectService'
import type { Subject } from '../types/subject'
import type { CareerConfig } from '../types/career'

interface CareerPageProps {
  career: CareerConfig
}

export default function CareerPage({ career }: CareerPageProps) {
  const navigate = useNavigate()
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null)

  const total = subjects.length

  useEffect(() => {
    let mounted = true
    const loadSubjects = async () => {
      setLoading(true)
      const data = await fetchSubjectsByCareer(career.slug)
      if (mounted) {
        setSubjects(data)
        setLoading(false)
      }
    }
    loadSubjects()
    return () => { mounted = false }
  }, [career.slug])

  function handleSelect(cod: number | string) {
    const subject = subjects.find(m => m.cod === cod) ?? null
    setSelectedSubject(subject)
  }

  return (
    <div className="flex-1 w-full flex flex-col px-6 py-10 relative overflow-x-hidden">
      {/* Glow */}
      <div
        className="absolute top-[-100px] left-[-100px] w-[500px] h-[500px] rounded-full blur-[120px] opacity-10 pointer-events-none"
        style={{ backgroundColor: 'var(--color-primary)' }}
      />

      {/* Header */}
      <div className="relative z-10 mb-8 flex items-start justify-between flex-wrap gap-4">
        <div>
          <button
            onClick={() => navigate('/carreras')}
            className="inline-flex items-center gap-2 text-sm mb-4 transition-all duration-150"
            style={{ color: 'color-mix(in srgb, var(--color-text) 50%, transparent)' }}
            onMouseEnter={e => (e.currentTarget.style.color = 'var(--color-primary)')}
            onMouseLeave={e => (e.currentTarget.style.color = 'color-mix(in srgb, var(--color-text) 50%, transparent)')}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
            </svg>
            Volver a Carreras
          </button>

          <div className="flex flex-col sm:flex-row sm:items-end gap-6 mb-2">
            <h1
              className="text-3xl sm:text-4xl font-extrabold"
              style={{
                backgroundImage: 'linear-gradient(to right, var(--color-primary), var(--color-secondary))',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              {career.title}
            </h1>

            <button
              onClick={() => navigate(career.calculatorRoute)}
              className="inline-flex items-center gap-2 px-6 py-2 rounded-xl text-sm font-bold uppercase tracking-widest transition-transform hover:-translate-y-0.5"
              style={{ backgroundColor: 'var(--color-primary)', color: 'var(--color-bg)' }}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 15.75V18m-7.5-6.75h.008v.008H8.25v-.008Zm0 2.25h.008v.008H8.25V13.5Zm0 2.25h.008v.008H8.25v-.008Zm0 2.25h.008v.008H8.25V18Zm2.498-6.75h.007v.008h-.007v-.008Zm0 2.25h.007v.008h-.007V13.5Zm0 2.25h.007v.008h-.007v-.008Zm0 2.25h.007v.008h-.007V18Zm2.504-6.75h.008v.008h-.008v-.008Zm0 2.25h.008v.008h-.008V13.5Zm0 2.25h.008v.008h-.008v-.008Zm0 2.25h.008v.008h-.008V18Zm2.498-6.75h.008v.008h-.008v-.008Zm0 2.25h.008v.008h-.008V13.5ZM8.25 6h7.5v2.25h-7.5V6ZM12 2.25c-1.892 0-3.758.11-5.593.322C5.307 2.7 4.5 3.65 4.5 4.757V19.5a2.25 2.25 0 0 0 2.25 2.25h10.5a2.25 2.25 0 0 0 2.25-2.25V4.757c0-1.108-.806-2.057-1.907-2.185A48.507 48.507 0 0 0 12 2.25Z" />
              </svg>
              Calculadora
            </button>
          </div>

          <p
            className="text-sm"
            style={{ color: 'color-mix(in srgb, var(--color-text) 55%, transparent)' }}
          >
            {total} materias · {career.subtitle}
          </p>
        </div>

        {/* Leyenda */}
        <div className="flex flex-wrap gap-3">
          {career.yearColors.map(({ color, label }) => (
            <span
              key={label}
              className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border"
              style={{
                borderColor: `color-mix(in srgb, ${color} 40%, transparent)`,
                backgroundColor: `color-mix(in srgb, ${color} 10%, transparent)`,
                color: 'var(--color-text)',
              }}
            >
              <span className="w-2 h-2 rounded-full inline-block" style={{ backgroundColor: color }} />
              {label}
            </span>
          ))}
        </div>
      </div>

      {/* Graph or Loader */}
      <div
        className="relative z-10 rounded-2xl border p-4 flex-1 flex flex-col"
        style={{
          borderColor: 'color-mix(in srgb, var(--color-primary) 15%, transparent)',
          backgroundColor: 'color-mix(in srgb, var(--color-primary) 3%, var(--color-bg))',
        }}
      >
        {loading ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-4 text-sm opacity-60">
            <svg className="w-8 h-8 animate-spin text-(--color-primary)" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p>Cargando materias desde el servidor...</p>
          </div>
        ) : (
          <SubjectGraph subjects={subjects} onSelect={handleSelect} />
        )}
      </div>

      {/* Panel lateral de detalle */}
      <SubjectDetailPanel
        subject={selectedSubject}
        subjects={subjects}
        onClose={() => setSelectedSubject(null)}
      />
    </div>
  )
}
