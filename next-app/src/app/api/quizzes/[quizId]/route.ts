import { NextResponse } from 'next/server'
import { readFile } from 'fs/promises'
import path from 'path'

/**
 * Map of quiz IDs to their JSON file paths (relative to project root).
 * Must be kept in sync with /api/quizzes/route.ts
 */
const QUIZ_FILE_MAP: Record<string, string> = {
  quiz1: 'src/data/quizes/prueba.json',
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ quizId: string }> }
) {
  const { quizId } = await params
  const relativeFilePath = QUIZ_FILE_MAP[quizId]

  if (!relativeFilePath) {
    return NextResponse.json(
      { error: `No quiz found with id: "${quizId}"` },
      { status: 404 }
    )
  }

  try {
    const absolutePath = path.join(process.cwd(), relativeFilePath)
    const content = await readFile(absolutePath, 'utf8')
    return NextResponse.json(JSON.parse(content))
  } catch (error) {
    console.error('Error reading quiz data:', error)
    return NextResponse.json(
      { error: 'Failed to retrieve quiz data' },
      { status: 500 }
    )
  }
}
