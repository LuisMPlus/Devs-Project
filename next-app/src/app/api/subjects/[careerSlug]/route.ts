import { NextResponse } from 'next/server'
import apu from '@/data/carrers/subjects/Analista_programador_universitario.json'
import chemical from '@/data/carrers/subjects/Ingenieria_Quimica.json'
import mining from '@/data/carrers/subjects/Ingenieria_de_Minas.json'
import industrial from '@/data/carrers/subjects/Ingenieria_industrial.json'
import computer from '@/data/carrers/subjects/Ingenieria_informatica.json'
import geology from '@/data/carrers/subjects/Licenciatura_en_Cs_Geologicas.json'
import food from '@/data/carrers/subjects/Licenciatura_en_Tecnologia_de_los_Alimentos.json'
import systems from '@/data/carrers/subjects/Licenciatura_en_sistemas.json'
import games from '@/data/carrers/subjects/Tecnicatura_Universitaria_en_Diseno_Integral_de_Videojuegos.json'

const CAREER_DATA_MAP: Record<string, unknown> = {
  'computer-engineering': computer,
  'bachelor-in-systems': systems,
  'apu': apu,
  'chemical-engineering': chemical,
  'industrial-engineering': industrial,
  'mining-engineering': mining,
  'geological-sciences': geology,
  'food-technology': food,
  'game-design-technique': games,
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ careerSlug: string }> }
) {
  const { careerSlug } = await params
  const data = CAREER_DATA_MAP[careerSlug]

  if (!data) {
    return NextResponse.json(
      { error: `No data found for career slug: "${careerSlug}"` },
      { status: 404 }
    )
  }

  return NextResponse.json(data)
}
