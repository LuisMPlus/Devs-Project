'use client'

import Link from 'next/link'

export default function Header() {
  return (
    <header 
      className="w-full flex justify-between items-center py-4 px-6 md:px-12 border-b z-50 sticky top-0" 
      style={{ 
        borderColor: 'color-mix(in srgb, var(--color-primary) 20%, transparent)', 
        backgroundColor: 'color-mix(in srgb, var(--color-bg) 95%, transparent)',
        backdropFilter: 'blur(8px)'
      }}
    >
      <Link href="/" className="flex items-center gap-3 group">
        <img 
          src="/assets/images/LogoIconoGato.png" 
          alt="Devs Project Cat Icon" 
          className="h-10 w-10 md:h-12 md:w-12 rounded-full border-2 transition-transform duration-300 group-hover:scale-105" 
          style={{ borderColor: 'var(--color-secondary)' }} 
        />
        <h1 className="text-lg md:text-xl font-black tracking-widest uppercase hidden sm:block" style={{ color: 'var(--color-primary)' }}>
          Devs Project
        </h1>
      </Link>
      
      <nav className="flex items-center gap-6 lg:gap-8 text-sm md:text-base font-medium tracking-wide" style={{ color: 'var(--color-text)' }}>
        <Link href="/" className="hover:text-[--color-primary] transition-colors">Inicio</Link>
        <Link href="/carreras" className="hover:text-[--color-secondary] transition-colors">Carreras</Link>
      </nav>
    </header>
  )
}
