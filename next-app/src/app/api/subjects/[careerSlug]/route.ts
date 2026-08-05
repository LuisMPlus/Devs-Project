import { NextResponse } from 'next/server'
import { readFile } from 'fs/promises'
import path from 'path'

// Map of career slugs to their JSON data files (relative to project root).
const CAREER_FILE_MAP: Record<string, string> = {
  'computer-engineering': 'src/data/carrers/subjects/Ingenieria_Informatica.json',
  'bachelor-in-systems':  'src/data/carrers/subjects/Licenciatura_en_Sistemas.json',
  'apu':                  'src/data/carrers/subjects/Analista_Programador_Universitario.json',
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
