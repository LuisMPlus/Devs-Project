import type { CareerConfig } from '../types/career'

const default5YearColors = [
  { color: '#02ffff', label: 'Año 1 — Cian' },
  { color: '#f59e0b', label: 'Año 2 — Ámbar' },
  { color: '#a78bfa', label: 'Año 3 — Violeta' },
  { color: '#34d399', label: 'Año 4 — Esmeralda' },
  { color: '#f472b6', label: 'Año 5 — Rosa' },
]

const default3YearColors = [
  { color: '#02ffff', label: 'Año 1 — Cian' },
  { color: '#f59e0b', label: 'Año 2 — Ámbar' },
  { color: '#a78bfa', label: 'Año 3 — Violeta' },
]

/**
 * Registry of all available careers.
 */
export const CAREERS: CareerConfig[] = [
  {
    slug: 'computer-engineering',
    title: 'Ingeniería Informática',
    subtitle: '5 años · Cuatrimestral · Clic para ver detalles · Hover para correlatividades',
    baseRoute: '/carreras/ingenieria-informatica',
    calculatorRoute: '/carreras/ingenieria-informatica/calculadora',
    yearColors: default5YearColors,
  },
  {
    slug: 'bachelor-in-systems',
    title: 'Licenciatura en Sistemas',
    subtitle: '5 años · Cuatrimestral · Clic para ver detalles · Hover para correlatividades',
    baseRoute: '/carreras/licenciatura-en-sistemas',
    calculatorRoute: '/carreras/licenciatura-en-sistemas/calculadora',
    yearColors: default5YearColors,
  },
  {
    slug: 'apu',
    title: 'Analista Programador Universitario',
    subtitle: '3 años · Cuatrimestral · Clic para ver detalles · Hover para correlatividades',
    baseRoute: '/carreras/apu',
    calculatorRoute: '/carreras/apu/calculadora',
    yearColors: default3YearColors,
    groupBySemester: true,
  },
  {
    slug: 'chemical-engineering',
    title: 'Ingeniería Química',
    subtitle: '5 años · Cuatrimestral · Clic para ver detalles · Hover para correlatividades',
    baseRoute: '/carreras/ingenieria-quimica',
    calculatorRoute: '/carreras/ingenieria-quimica/calculadora',
    yearColors: default5YearColors,
  },
  {
    slug: 'industrial-engineering',
    title: 'Ingeniería Industrial',
    subtitle: '5 años · Cuatrimestral · Clic para ver detalles · Hover para correlatividades',
    baseRoute: '/carreras/ingenieria-industrial',
    calculatorRoute: '/carreras/ingenieria-industrial/calculadora',
    yearColors: default5YearColors,
  },
  {
    slug: 'mining-engineering',
    title: 'Ingeniería de Minas',
    subtitle: '5 años · Cuatrimestral · Clic para ver detalles · Hover para correlatividades',
    baseRoute: '/carreras/ingenieria-de-minas',
    calculatorRoute: '/carreras/ingenieria-de-minas/calculadora',
    yearColors: default5YearColors,
  },
  {
    slug: 'geological-sciences',
    title: 'Licenciatura en Ciencias Geológicas',
    subtitle: '5 años · Cuatrimestral · Clic para ver detalles · Hover para correlatividades',
    baseRoute: '/carreras/licenciatura-en-cs-geologicas',
    calculatorRoute: '/carreras/licenciatura-en-cs-geologicas/calculadora',
    yearColors: default5YearColors,
  },
  {
    slug: 'food-technology',
    title: 'Licenciatura en Tecnología de los Alimentos',
    subtitle: '5 años · Cuatrimestral · Clic para ver detalles · Hover para correlatividades',
    baseRoute: '/carreras/licenciatura-en-tecnologia-de-los-alimentos',
    calculatorRoute: '/carreras/licenciatura-en-tecnologia-de-los-alimentos/calculadora',
    yearColors: default5YearColors,
  },
  {
    slug: 'game-design-technique',
    title: 'Tecnicatura Universitaria en Diseño Integral de Videojuegos',
    subtitle: '3 años · Cuatrimestral · Clic para ver detalles · Hover para correlatividades',
    baseRoute: '/carreras/tecnicatura-universitaria-en-diseno-integral-de-videojuegos',
    calculatorRoute: '/carreras/tecnicatura-universitaria-en-diseno-integral-de-videojuegos/calculadora',
    yearColors: default3YearColors,
    groupBySemester: true,
  },
]

/** Lookup a career by its slug. Returns undefined if not found. */
export function getCareerBySlug(slug: string): CareerConfig | undefined {
  return CAREERS.find(c => c.slug === slug)
}
