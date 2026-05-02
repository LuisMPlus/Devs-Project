'use client'

import { use } from 'react'
import { notFound } from 'next/navigation'
import { CareerProgressProvider } from '@/features/careers/context/CareerProgressContext'
import CareerPage from '@/features/careers/pages/CareerPage'
import { getCareerBySlug } from '@/features/careers/config/careersRegistry'

// Slug → path mapping for App Router dynamic segments
const SLUG_MAP: Record<string, string> = {
  'ingenieria-informatica': 'computer-engineering',
  'licenciatura-en-sistemas': 'bachelor-in-systems',
  'apu': 'apu',
}

interface PageProps {
  params: Promise<{ careerSlug: string }>
}

export default function CareerDynamicPage({ params }: PageProps) {
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
      <CareerPage career={career} />
    </CareerProgressProvider>
  )
}
