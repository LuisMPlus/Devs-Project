import { NextResponse } from 'next/server'
import { readFile } from 'fs/promises'
import path from 'path'

// Map of career slugs to their JSON data files (relative to project root).
const CAREER_FILE_MAP: Record<string, string> = {
  'computer-engineering':  'src/data/carrers/subjects/Ingenieria_informatica.json',
  'bachelor-in-systems':   'src/data/carrers/subjects/Licenciatura_en_sistemas.json',
  'apu':                   'src/data/carrers/subjects/Analista_programador_universitario.json',
  'chemical-engineering':  'src/data/carrers/subjects/Ingenieria_quimica.json',
  'industrial-engineering':'src/data/carrers/subjects/Ingenieria_industrial.json',
  'mining-engineering':    'src/data/carrers/subjects/Ingenieria_de_minas.json',
  'geological-sciences':   'src/data/carrers/subjects/Licenciatura_en_cs_geologicas.json',
  'food-technology':       'src/data/carrers/subjects/Licenciatura_en_tecnologia_de_los_alimentos.json',
  'game-design-technique': 'src/data/carrers/subjects/Tecnicatura_universitaria_en_diseno_integral_de_videojuegos.json',
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ careerSlug: string }> }
) {
  const { careerSlug } = await params
  const relativeFilePath = CAREER_FILE_MAP[careerSlug]

  if (!relativeFilePath) {
    return NextResponse.json(
      { error: `No data found for career slug: "${careerSlug}"` },
      { status: 404 }
    )
  }

  try {
    const absolutePath = path.join(process.cwd(), relativeFilePath)
    const content = await readFile(absolutePath, 'utf8')
    return NextResponse.json(JSON.parse(content))
  } catch (error) {
    console.error('Error reading subject data:', error)
    return NextResponse.json(
      { error: 'Failed to retrieve subjects data' },
      { status: 500 }
    )
  }
}
