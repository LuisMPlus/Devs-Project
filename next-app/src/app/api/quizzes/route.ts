import { NextResponse } from 'next/server'
import { readFile } from 'fs/promises'
import path from 'path'

/**
 * Map of quiz IDs to their JSON file paths (relative to project root).
 * Add new quizzes here as they are created.
 */
const QUIZ_FILE_MAP: Record<string, string> = {
  quiz1: 'src/data/quizes/prueba.json',
}

export async function GET() {
  try {
    const quizzes = await Promise.all(
      Object.entries(QUIZ_FILE_MAP).map(async ([id, relPath]) => {
        const absolutePath = path.join(process.cwd(), relPath)
        const content = await readFile(absolutePath, 'utf8')
        const quiz = JSON.parse(content)

        // Return only metadata — no questions
        return {
          id: quiz.id ?? id,
          title: quiz.title,
          description: quiz.description ?? null,
          difficulty: quiz.difficulty ?? null,
          tags: quiz.tags ?? [],
        }
      })
    )

    return NextResponse.json(quizzes)
  } catch (error) {
    console.error('Error reading quiz list:', error)
    return NextResponse.json(
      { error: 'Failed to retrieve quiz list' },
      { status: 500 }
    )
  }
}
