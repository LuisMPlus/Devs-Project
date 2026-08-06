'use client'

import { use } from 'react'
import { notFound } from 'next/navigation'
import { CareerProgressProvider } from '@/features/careers/context/CareerProgressContext'
import SubjectCalculator from '@/features/careers/pages/SubjectCalculator'
import { getCareerBySlug } from '@/features/careers/config/careersRegistry'

// Slug → API slug mapping
const SLUG_MAP: Record<string, string> = {
  'ingenieria-informatica': 'computer-engineering',
  'licenciatura-en-sistemas': 'bachelor-in-systems',
  'apu': 'apu',
  'ingenieria-quimica': 'chemical-engineering',
  'ingenieria-industrial': 'industrial-engineering',
  'ingenieria-de-minas': 'mining-engineering',
  'licenciatura-en-cs-geologicas': 'geological-sciences',
  'licenciatura-en-tecnologia-de-los-alimentos': 'food-technology',
  'tecnicatura-universitaria-en-diseno-integral-de-videojuegos': 'game-design-technique',
}

interface PageProps {
  params: Promise<{ careerSlug: string }>
}

export default function CalculadoraPage({ params }: PageProps) {
  const { careerSlug } = use(params)
  const apiSlug = SLUG_MAP[careerSlug]

  if (!apiSlug) {
    notFound()
  }

  const career = getCareerBySlug(apiSlug)
  if (!career) {
    notFound()
  }

  return (
    <CareerProgressProvider careerSlug={career.slug}>
      <SubjectCalculator career={career} />
    </CareerProgressProvider>
  )
}
