import type { Quiz } from '../interfaces/quiz'

/**
 * Returns all available quiz metadata (id + title + description) without loading questions.
 * Calls the /api/quizzes route handler.
 */
export async function fetchQuizList(): Promise<Pick<Quiz, 'id' | 'title' | 'description' | 'difficulty' | 'tags'>[]> {
  const res = await fetch('/api/quizzes')
  if (!res.ok) throw new Error(`Failed to fetch quiz list: ${res.status}`)
  return res.json()
}

/**
 * Fetches a single quiz (with questions) by ID.
 * Calls the /api/quizzes/[quizId] route handler. Returns null if not found.
 */
export async function fetchQuizById(id: string): Promise<Quiz | null> {
  const res = await fetch(`/api/quizzes/${id}`)
  if (res.status === 404) return null
  if (!res.ok) {
    console.error(`Failed to load quiz "${id}": ${res.status}`)
    return null
  }
  return res.json()
}
