'use client'

import { useRouter } from 'next/navigation'

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
  {
    id: 'licenciatura-en-sistemas',
    label: 'Licenciatura en Sistemas',
    path: '/carreras/licenciatura-en-sistemas',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 7.5l3 2.25-3 2.25m4.5 0h3m-9 8.25h16.5a1.5 1.5 0 001.5-1.5V5.25a1.5 1.5 0 00-1.5-1.5H3.75a1.5 1.5 0 00-1.5 1.5v12a1.5 1.5 0 001.5 1.5z" />
      </svg>
    ),
  },
  {
    id: 'apu',
    label: 'Analista Programador Universitario',
    path: '/carreras/apu',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M14.25 9.75L16.5 12l-2.25 2.25m-4.5 0L7.5 12l2.25-2.25M6 20.25h12A2.25 2.25 0 0020.25 18V6A2.25 2.25 0 0018 3.75H6A2.25 2.25 0 003.75 6v12A2.25 2.25 0 006 20.25z" />
      </svg>
    ),
  },
]

export default function Carreras() {
  const router = useRouter()

  return (
    <div
      className="flex-1 w-full flex flex-col items-center justify-center px-6 relative overflow-hidden"
    >
      <div
        className="absolute top-[-80px] right-[-80px] w-[400px] h-[400px] rounded-full blur-[100px] opacity-10 pointer-events-none"
        style={{ backgroundColor: 'var(--color-secondary)' }}
      />

      <div className="relative z-10 w-full max-w-md my-12">
        <button
          onClick={() => router.push('/')}
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
              onClick={() => router.push(carrera.path)}
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

        <div className="mt-8">
          <h2
            className="text-xl font-bold mb-4"
            style={{ color: 'var(--color-text)' }}
          >
            Enlaces útiles
          </h2>
          <div className="flex flex-col gap-3">
            <a
              href="https://www.fi.unju.edu.ar/secretarias/sacad/calendario-academico.html"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-4 w-full px-5 py-4 rounded-2xl border text-left transition-all duration-200 hover:-translate-y-0.5"
              style={{
                borderColor: 'color-mix(in srgb, var(--color-secondary) 20%, transparent)',
                backgroundColor: 'color-mix(in srgb, var(--color-secondary) 5%, transparent)',
                color: 'var(--color-text)',
              }}
              onMouseEnter={e => {
                const btn = e.currentTarget
                btn.style.borderColor = 'color-mix(in srgb, var(--color-secondary) 50%, transparent)'
                btn.style.backgroundColor = 'color-mix(in srgb, var(--color-secondary) 10%, transparent)'
              }}
              onMouseLeave={e => {
                const btn = e.currentTarget
                btn.style.borderColor = 'color-mix(in srgb, var(--color-secondary) 20%, transparent)'
                btn.style.backgroundColor = 'color-mix(in srgb, var(--color-secondary) 5%, transparent)'
              }}
            >
              <svg className="w-5 h-5" style={{ color: 'var(--color-secondary)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5m-9-6h.008v.008H12v-.008zM12 15h.008v.008H12V15zm0 2.25h.008v.008H12v-.008zM9.75 15h.008v.008H9.75V15zm0 2.25h.008v.008H9.75v-.008zM7.5 15h.008v.008H7.5V15zm0 2.25h.008v.008H7.5v-.008zm6.75-4.5h.008v.008h-.008v-.008zm0 2.25h.008v.008h-.008V15zm0 2.25h.008v.008h-.008v-.008zm2.25-4.5h.008v.008H16.5v-.008zm0 2.25h.008v.008H16.5V15z" />
              </svg>
              <span className="font-semibold">Calendario Académico</span>
              <svg className="w-4 h-4 ml-auto opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
              </svg>
            </a>
            
            <a
              href="https://fi.unju.edu.ar/horarios-fiunju.html"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-4 w-full px-5 py-4 rounded-2xl border text-left transition-all duration-200 hover:-translate-y-0.5"
              style={{
                borderColor: 'color-mix(in srgb, var(--color-secondary) 20%, transparent)',
                backgroundColor: 'color-mix(in srgb, var(--color-secondary) 5%, transparent)',
                color: 'var(--color-text)',
              }}
              onMouseEnter={e => {
                const btn = e.currentTarget
                btn.style.borderColor = 'color-mix(in srgb, var(--color-secondary) 50%, transparent)'
                btn.style.backgroundColor = 'color-mix(in srgb, var(--color-secondary) 10%, transparent)'
              }}
              onMouseLeave={e => {
                const btn = e.currentTarget
                btn.style.borderColor = 'color-mix(in srgb, var(--color-secondary) 20%, transparent)'
                btn.style.backgroundColor = 'color-mix(in srgb, var(--color-secondary) 5%, transparent)'
              }}
            >
              <svg className="w-5 h-5" style={{ color: 'var(--color-secondary)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="font-semibold">Horarios de Cursada</span>
              <svg className="w-4 h-4 ml-auto opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
