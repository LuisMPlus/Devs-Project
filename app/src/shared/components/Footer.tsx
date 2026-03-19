import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer 
      className="w-full mt-auto py-10 px-6 md:px-12 border-t flex flex-col items-center gap-8 shadow-[0_-10px_30px_rgba(0,0,0,0.5)]" 
      style={{ 
        borderColor: 'color-mix(in srgb, var(--color-accent) 40%, transparent)', 
        backgroundColor: 'color-mix(in srgb, var(--color-bg) 70%, #000)' 
      }}
    >
      <div className="flex flex-col md:flex-row items-center justify-between w-full max-w-6xl mx-auto gap-8 text-center md:text-left">
        
        <div className="flex flex-col items-center md:items-start gap-4 flex-1">
          <img 
            src="/assets/images/LogoDevsProject.jpg" 
            alt="Devs Project Full Logo" 
            className="h-14 sm:h-16 rounded-xl border border-white/10 shadow-lg object-contain" 
            style={{ backgroundColor: 'var(--color-bg)' }}
          />
          <p className="max-w-xs text-sm mt-2 font-medium leading-relaxed" style={{ color: 'color-mix(in srgb, var(--color-text) 65%, transparent)' }}>
            Potenciando a los estudiantes a través de trayectorias académicas visuales e interactivas. Únete a nosotros formando el futuro del mapeo educativo.
          </p>
        </div>
        
        <div className="flex flex-col md:flex-row items-center gap-6 lg:gap-12 flex-1 justify-end">
          <nav className="flex flex-col gap-2 font-semibold tracking-wide" style={{ color: 'color-mix(in srgb, var(--color-text) 80%, transparent)' }}>
            <span className="text-xs uppercase tracking-widest mb-1 opacity-50" style={{ color: 'var(--color-primary)' }}>Navegación</span>
            <Link to="/" className="hover:text-(--color-primary) transition-colors">Inicio Central</Link>
            <Link to="/carreras" className="hover:text-(--color-secondary) transition-colors">Explorar Carreras</Link>
          </nav>
          
          <div className="hidden md:block w-px h-16 bg-white/10 mx-2"></div>
          
          <img 
            src="/assets/images/LogoIconoGato.png" 
            alt="Mascota Gato de Devs Project" 
            className="h-20 w-20 rounded-full border-[3px] shadow-[0_0_15px_rgba(2,255,255,0.3)] animate-pulse" 
            style={{ borderColor: 'var(--color-primary)' }} 
          />
        </div>
      </div>
      
      <div 
        className="w-full max-w-6xl mx-auto pt-6 border-t flex flex-col sm:flex-row items-center justify-between text-xs gap-4 font-medium" 
        style={{ 
          borderColor: 'color-mix(in srgb, var(--color-secondary) 15%, transparent)', 
          color: 'color-mix(in srgb, var(--color-text) 40%, transparent)' 
        }}
      >
        <span>&copy; {new Date().getFullYear()} Devs Project. Todos los derechos reservados.</span>
        <span className="flex items-center gap-2">Hecho con <span style={{ color: 'var(--color-secondary)' }}>♥</span> por el equipo Devs Project.</span>
      </div>
    </footer>
  )
}
