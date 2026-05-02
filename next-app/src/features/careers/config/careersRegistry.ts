import type { CareerConfig } from '../types/career'

/**
 * Registry of all available careers.
 * Add a new CareerConfig entry here whenever you add a new career JSON on the server.
 */
export const CAREERS: CareerConfig[] = [
  {
    slug: 'computer-engineering',
    title: 'Ingeniería Informática',
    subtitle: '5 años · Cuatrimestral · Clic para ver detalles · Hover para correlatividades',
    baseRoute: '/carreras/ingenieria-informatica',
    calculatorRoute: '/carreras/ingenieria-informatica/calculadora',
    yearColors: [
      { color: '#02ffff', label: 'Año 1 — Cian'      },
      { color: '#f59e0b', label: 'Año 2 — Ámbar'     },
      { color: '#a78bfa', label: 'Año 3 — Violeta'   },
      { color: '#34d399', label: 'Año 4 — Esmeralda' },
      { color: '#f472b6', label: 'Año 5 — Rosa'      },
    ],
  },
  {
    slug: 'bachelor-in-systems',
    title: 'Licenciatura en Sistemas',
    subtitle: '5 años · Cuatrimestral · Clic para ver detalles · Hover para correlatividades',
    baseRoute: '/carreras/licenciatura-en-sistemas',
    calculatorRoute: '/carreras/licenciatura-en-sistemas/calculadora',
    yearColors: [
      { color: '#02ffff', label: 'Año 1 — Cian'      },
      { color: '#f59e0b', label: 'Año 2 — Ámbar'     },
      { color: '#a78bfa', label: 'Año 3 — Violeta'   },
      { color: '#34d399', label: 'Año 4 — Esmeralda' },
      { color: '#f472b6', label: 'Año 5 — Rosa'      },
    ],
  },
  {
    slug: 'apu',
    title: 'Analista Programador Universitario',
    subtitle: '3 años · Cuatrimestral · Clic para ver detalles · Hover para correlatividades',
    baseRoute: '/carreras/apu',
    calculatorRoute: '/carreras/apu/calculadora',
    yearColors: [
      { color: '#02ffff', label: 'Año 1 — Cian'      },
      { color: '#f59e0b', label: 'Año 2 — Ámbar'     },
      { color: '#a78bfa', label: 'Año 3 — Violeta'   },
    ],
    groupBySemester: true,
  },
]

/** Lookup a career by its slug. Returns undefined if not found. */
export function getCareerBySlug(slug: string): CareerConfig | undefined {
  return CAREERS.find(c => c.slug === slug)
}
