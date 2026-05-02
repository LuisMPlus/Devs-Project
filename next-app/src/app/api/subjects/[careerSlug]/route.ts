import { NextResponse } from 'next/server'
import { readFile } from 'fs/promises'
import path from 'path'

// Map of career slugs to their JSON data files (relative to project root).
const CAREER_FILE_MAP: Record<string, string> = {
  'computer-engineering': 'src/data/computerEngineeringSubjects.json',
  'bachelor-in-systems':  'src/data/bachelorInSystemsSubjects.json',
  'apu':                  'src/data/APU-Subjects.json',
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
