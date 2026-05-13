import { NextResponse } from 'next/server'
import { readFile, readdir } from 'fs/promises'
import path from 'path'

export async function GET() {
  try {
    const quizzesDir = path.join(process.cwd(), 'src/data/quizes')
    let files: string[] = []
    try {
      files = await readdir(quizzesDir)
    } catch {
      files = []
    }

    const jsonFiles = files.filter(f => f.endsWith('.json'))

    const quizzes = await Promise.all(
      jsonFiles.map(async (filename) => {
        const absolutePath = path.join(quizzesDir, filename)
        const content = await readFile(absolutePath, 'utf8')
        const quiz = JSON.parse(content)

        // Return only metadata — no questions
        return {
          id: quiz.id ?? filename.replace('.json', ''),
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
