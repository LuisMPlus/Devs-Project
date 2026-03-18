import { useNavigate } from 'react-router-dom'

const CARRERAS = [
  {
    id: 'ingenieria-informatica',
    label: 'Ingeniería Informática',
    path: '/carreras/ingenieria-informatica',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round"
          d="M9 17.25v1.007a3 3 0 0 1-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0 1 15 18.257V17.25m6-12V15a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 15V5.25m18 0A2.25 2.25 0 0 0 18.75 3H5.25A2.25 2.25 0 0 0 3 5.25m18 0H3" />
      </svg>
    ),
  },
]

export default function Carreras() {
  const navigate = useNavigate()

  return (
    <main
      className="min-h-screen flex flex-col items-center justify-center px-6 relative overflow-hidden"
      style={{ backgroundColor: 'var(--color-bg)', color: 'var(--color-text)' }}
    >
      <div
        className="absolute top-[-80px] right-[-80px] w-[400px] h-[400px] rounded-full blur-[100px] opacity-10 pointer-events-none"
        style={{ backgroundColor: 'var(--color-secondary)' }}
      />

      <div className="relative z-10 w-full max-w-md">
        <button
          onClick={() => navigate('/')}
          className="inline-flex items-center gap-2 text-sm mb-8 transition-all duration-150"
          style={{ color: 'color-mix(in srgb, var(--color-text) 50%, transparent)' }}
          onMouseEnter={e => (e.currentTarget.style.color = 'var(--color-primary)')}
          onMouseLeave={e => (e.currentTarget.style.color = 'color-mix(in srgb, var(--color-text) 50%, transparent)')}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
          </svg>
          Volver al inicio
        </button>

        <h1
          className="text-3xl font-extrabold mb-2"
          style={{
            backgroundImage: 'linear-gradient(to right, var(--color-primary), var(--color-secondary))',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          Carreras
        </h1>
        <p className="mb-8 text-sm" style={{ color: 'color-mix(in srgb, var(--color-text) 50%, transparent)' }}>
          Seleccioná tu carrera para explorar el plan de estudios.
        </p>

        <div className="flex flex-col gap-3">
          {CARRERAS.map(carrera => (
            <button
              id={`btn-${carrera.id}`}
              key={carrera.id}
              onClick={() => navigate(carrera.path)}
              className="flex items-center gap-4 w-full px-5 py-4 rounded-2xl border text-left transition-all duration-200 hover:-translate-y-0.5"
              style={{
                borderColor: 'color-mix(in srgb, var(--color-primary) 20%, transparent)',
                backgroundColor: 'color-mix(in srgb, var(--color-primary) 5%, transparent)',
                color: 'var(--color-text)',
              }}
              onMouseEnter={e => {
                const btn = e.currentTarget
                btn.style.borderColor = 'color-mix(in srgb, var(--color-primary) 50%, transparent)'
                btn.style.backgroundColor = 'color-mix(in srgb, var(--color-primary) 10%, transparent)'
              }}
              onMouseLeave={e => {
                const btn = e.currentTarget
                btn.style.borderColor = 'color-mix(in srgb, var(--color-primary) 20%, transparent)'
                btn.style.backgroundColor = 'color-mix(in srgb, var(--color-primary) 5%, transparent)'
              }}
            >
              <span style={{ color: 'var(--color-primary)' }}>{carrera.icon}</span>
              <span className="font-semibold">{carrera.label}</span>
              <svg
                className="w-4 h-4 ml-auto opacity-40"
                fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
              </svg>
            </button>
          ))}
        </div>
      </div>
    </main>
  )
}
