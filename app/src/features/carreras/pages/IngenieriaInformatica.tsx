import { useNavigate } from 'react-router-dom'
import MateriaGraph from '../components/MateriaGraph'
import { MATERIAS_INGENIERIA_INFORMATICA } from '../constants/materias'

export default function IngenieriaInformatica() {
  const navigate = useNavigate()
  const total = MATERIAS_INGENIERIA_INFORMATICA.length

  return (
    <main
      className="min-h-screen flex flex-col px-6 py-10 relative overflow-hidden"
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
            {total} materias · 5 años · Cuatrimestral · Hover para ver correlatividades
          </p>
        </div>

        {/* Leyenda */}
        <div className="flex flex-wrap gap-3">
          {[
            { año: 1, color: 'var(--color-accent)', label: 'Año 1' },
            { año: 2, color: 'var(--color-primary)', label: 'Año 2' },
            { año: 3, color: 'var(--color-secondary)', label: 'Año 3' },
            { año: 4, color: '#a78bfa', label: 'Año 4' },
            { año: 5, color: '#f472b6', label: 'Año 5' },
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
              <span
                className="w-2 h-2 rounded-full inline-block"
                style={{ backgroundColor: color }}
              />
              {label}
            </span>
          ))}
        </div>
      </div>

      {/* Graph */}
      <div
        className="relative z-10 rounded-2xl border p-4 flex-1"
        style={{
          borderColor: 'color-mix(in srgb, var(--color-primary) 15%, transparent)',
          backgroundColor: 'color-mix(in srgb, var(--color-primary) 3%, var(--color-bg))',
        }}
      >
        <MateriaGraph />
      </div>
    </main>
  )
}
