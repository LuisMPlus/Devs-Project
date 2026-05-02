import type { Metadata } from 'next'
import { Analytics } from '@vercel/analytics/react'
import Header from '@/shared/components/Header'
import Footer from '@/shared/components/Footer'
import './globals.css'

export const metadata: Metadata = {
  title: 'Devs Project — Tu travesía académica, simplificada',
  description: 'Recursos, guías y comunidad para que navegues la facultad sin perderte en el camino. Explorador de materias y correlatividades para carreras de la FI-UNJu.',
  keywords: ['carreras', 'ingeniería informática', 'licenciatura en sistemas', 'APU', 'FI-UNJu', 'correlatividades', 'plan de estudios'],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" />
      </head>
      <body>
        <div className="flex flex-col min-h-screen relative w-full" style={{ backgroundColor: 'var(--color-bg)', color: 'var(--color-text)' }}>
          <Header />
          <main className="w-full flex flex-col items-center flex-1">
            {children}
          </main>
          <Footer />
          <Analytics />
        </div>
      </body>
    </html>
  )
}
