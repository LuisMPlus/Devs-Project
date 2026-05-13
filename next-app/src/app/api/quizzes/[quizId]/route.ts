import { NextResponse } from 'next/server'
import { readFile, readdir } from 'fs/promises'
import path from 'path'

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ quizId: string }> }
) {
  const { quizId } = await params
  
  try {
    const quizzesDir = path.join(process.cwd(), 'src/data/quizes')
    let files: string[] = []
    try {
      files = await readdir(quizzesDir)
    } catch {
      files = []
    }

    const jsonFiles = files.filter(f => f.endsWith('.json'))

    // Search for the quiz with the matching ID
    for (const filename of jsonFiles) {
      const absolutePath = path.join(quizzesDir, filename)
      const content = await readFile(absolutePath, 'utf8')
      const quiz = JSON.parse(content)
      
      const parsedId = quiz.id ?? filename.replace('.json', '')
      if (parsedId === quizId) {
        return NextResponse.json(quiz)
      }
    }

    // If loop finishes without returning, the quiz wasn't found
    return NextResponse.json(
      { error: `No quiz found with id: "${quizId}"` },
      { status: 404 }
    )
  } catch (error) {
    console.error('Error reading quiz data:', error)
    return NextResponse.json(
      { error: 'Failed to retrieve quiz data' },
      { status: 500 }
    )
  }
}
