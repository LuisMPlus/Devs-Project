import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import SubjectGraph from '../components/MateriaGraph'
import SubjectDetailPanel from '../components/MateriaDetailPanel'
import { fetchComputerEngineeringSubjects } from '../services/subjectService'
import type { Subject } from '../types/subject'

export default function ComputerEngineering() {
  const navigate = useNavigate()
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null)
  
  const total = subjects.length

  useEffect(() => {
    let mounted = true
    const loadSubjects = async () => {
      setLoading(true)
      const data = await fetchComputerEngineeringSubjects()
      if (mounted) {
        setSubjects(data)
        setLoading(false)
      }
    }
    loadSubjects()
    return () => { mounted = false }
  }, [])

  function handleSelect(cod: number | string) {
    const subject = subjects.find(m => m.cod === cod) ?? null
    setSelectedSubject(subject)
  }

  return (
    <main
      className="min-h-screen flex flex-col px-6 py-10 relative overflow-x-hidden"
      style={{ backgroundColor: 'var(--color-bg)', color: 'var(--color-text)' }}
    >
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

          <h1
            className="text-3xl sm:text-4xl font-extrabold"
            style={{
              backgroundImage: 'linear-gradient(to right, var(--color-primary), var(--color-secondary))',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Ingeniería Informática
          </h1>
          <p
            className="mt-2 text-sm"
            style={{ color: 'color-mix(in srgb, var(--color-text) 55%, transparent)' }}
          >
            {total} materias · 5 años · Cuatrimestral · Clic para ver detalles · Hover para correlatividades
          </p>
        </div>

        {/* Leyenda */}
        <div className="flex flex-wrap gap-3">
          {[
            { color: '#02ffff', label: 'Año 1 — Cian'      },
            { color: '#f59e0b', label: 'Año 2 — Ámbar'     },
            { color: '#a78bfa', label: 'Año 3 — Violeta'   },
            { color: '#34d399', label: 'Año 4 — Esmeralda' },
            { color: '#f472b6', label: 'Año 5 — Rosa'      },
          ].map(({ color, label }) => (
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
            <svg className="w-8 h-8 animate-spin text-[color:var(--color-primary)]" fill="none" viewBox="0 0 24 24">
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
    </main>
  )
}
