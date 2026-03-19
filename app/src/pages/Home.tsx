import { useNavigate } from 'react-router-dom'

export default function Home() {
  const navigate = useNavigate()

  return (
    <div
      className="flex-1 w-full flex flex-col items-center justify-center px-6 py-24 relative overflow-hidden"
    >
      {/* Background glow top */}
      <div
        className="absolute top-[-150px] left-1/2 -translate-x-1/2 w-[700px] h-[400px] rounded-full blur-[130px] opacity-20 pointer-events-none"
        style={{ backgroundColor: 'var(--color-primary)' }}
      />
      {/* Background glow bottom-right */}
      <div
        className="absolute bottom-[-100px] right-[-100px] w-[400px] h-[400px] rounded-full blur-[100px] opacity-10 pointer-events-none"
        style={{ backgroundColor: 'var(--color-secondary)' }}
      />

      {/* Badge */}
      <span
        className="mb-6 px-4 py-1.5 rounded-full text-xs font-semibold tracking-widest uppercase border"
        style={{
          borderColor: 'color-mix(in srgb, var(--color-primary) 26%, transparent)',
          backgroundColor: 'color-mix(in srgb, var(--color-primary) 7%, transparent)',
          color: 'var(--color-secondary)',
        }}
      >
        Comunidad · Devs Project
      </span>

      {/* Heading */}
      <h1
        className="text-5xl sm:text-6xl font-extrabold text-center leading-tight tracking-tight mb-4"
        style={{ color: 'var(--color-text)' }}
      >
        Tu travesía <br />
        <span
          style={{
            backgroundImage: 'linear-gradient(to right, var(--color-primary), var(--color-secondary))',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          académica
        </span>
        , simplificada.
      </h1>

      {/* Subheading */}
      <p
        className="text-lg sm:text-xl text-center max-w-xl mb-12 leading-relaxed"
        style={{ color: 'color-mix(in srgb, var(--color-text) 60%, transparent)' }}
      >
        Recursos, guías y comunidad para que navegues la facultad sin perderte en el camino.
      </p>

      {/* CTA Button */}
      <button
        id="btn-carreras"
        onClick={() => navigate('/carreras')}
        className="group inline-flex items-center gap-3 px-8 py-4 rounded-2xl font-semibold text-lg transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0"
        style={{
          backgroundColor: 'var(--color-accent)',
          color: 'var(--color-text)',
          boxShadow: '0 8px 32px color-mix(in srgb, var(--color-accent) 25%, transparent)',
        }}
        onMouseEnter={e => {
          const btn = e.currentTarget as HTMLButtonElement
          btn.style.backgroundColor = 'var(--color-primary)'
          btn.style.color = 'var(--color-bg)'
          btn.style.boxShadow = '0 8px 32px color-mix(in srgb, var(--color-primary) 25%, transparent)'
        }}
        onMouseLeave={e => {
          const btn = e.currentTarget as HTMLButtonElement
          btn.style.backgroundColor = 'var(--color-accent)'
          btn.style.color = 'var(--color-text)'
          btn.style.boxShadow = '0 8px 32px color-mix(in srgb, var(--color-accent) 25%, transparent)'
        }}
      >
        <svg
          className="w-5 h-5 opacity-80 group-hover:opacity-100 transition"
          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round"
            d="M4.26 10.147a60.438 60.438 0 0 0-.491 6.347A48.62 48.62 0 0 1 12 20.904a48.62 48.62 0 0 1 8.232-4.41 60.46 60.46 0 0 0-.491-6.347m-15.482 0a50.636 50.636 0 0 0-2.658-.813A59.906 59.906 0 0 1 12 3.493a59.903 59.903 0 0 1 10.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0 1 12 13.489a50.702 50.702 0 0 1 7.74-3.342M6.75 15a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Zm0 0v-3.675A55.378 55.378 0 0 1 12 8.443m-7.007 11.55A5.981 5.981 0 0 0 6.75 15.75v-1.5" />
        </svg>
        Explorar Carreras
        <svg
          className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200"
          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
        </svg>
      </button>

    </div>
  )
}
