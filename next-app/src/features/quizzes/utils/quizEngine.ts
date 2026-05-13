import type { Quiz, Question, Answer } from '../interfaces/quiz'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface UserAnswer {
  questionId: string
  /** IDs/indices of selected answers (for Single, Multi, TrueOrFalse) */
  selectedAnswerIds?: string[]
  /** Raw text for ShortAnswer */
  shortAnswerText?: string
  /** Ordered list of answer texts for DragAndDropOrder */
  orderedItems?: string[]
  /** Whether the answer was submitted within the time limit */
  timedOut?: boolean
  /** ms taken to answer (for Kahoot scoring) */
  timeTakenMs?: number
}

export interface QuestionResult {
  question: Question
  userAnswer: UserAnswer
  earnedPoints: number
  maxPoints: number
  isCorrect: boolean
}

export interface QuizResult {
  quiz: Quiz
  results: QuestionResult[]
  totalScore: number
  maxScore: number
  percentage: number
  timeTakenMs: number
}

// ---------------------------------------------------------------------------
// Question resolution
// ---------------------------------------------------------------------------

/**
 * Resolves the effective question list from a Quiz, respecting questionPool if present.
 */
export function resolveQuestions(quiz: Quiz): Question[] {
  let questions: Question[] = []

  if (quiz.questionPool) {
    const pool = [...quiz.questionPool.questions]
    if (quiz.randomizeQuestions) shuffle(pool)
    questions = pool.slice(0, quiz.questionPool.pick)
  } else {
    questions = quiz.questions ? [...quiz.questions] : []
    if (quiz.randomizeQuestions) shuffle(questions)
  }

  // Randomize answer order if requested
  if (quiz.randomizeAnswers) {
    questions = questions.map(q => ({
      ...q,
      answers: q.answers ? shuffle([...q.answers]) : q.answers,
    }))
  }

  return questions
}

// ---------------------------------------------------------------------------
// Scoring
// ---------------------------------------------------------------------------

/**
 * Scores a single question based on its type and the user's answer.
 */
export function scoreQuestion(question: Question, userAnswer: UserAnswer): QuestionResult {
  let earnedPoints = 0
  let isCorrect = false

  if (userAnswer.timedOut) {
    return { question, userAnswer, earnedPoints: 0, maxPoints: question.points, isCorrect: false }
  }

  switch (question.type) {
    case 'Single':
    case 'TrueOrFalse': {
      const correctAnswer = question.answers?.find(a => a.isCorrect)
      const selectedId = userAnswer.selectedAnswerIds?.[0]
      if (correctAnswer && selectedId !== undefined) {
        const selectedAnswer = question.answers?.find(a => getAnswerId(a) === selectedId)
        isCorrect = selectedAnswer?.isCorrect === true
        earnedPoints = isCorrect ? question.points : 0
      }
      break
    }

    case 'MultipleChoice': {
      const answers = question.answers ?? []
      const correctIds = new Set(answers.filter(a => a.isCorrect).map(getAnswerId))
      const selectedIds = new Set(userAnswer.selectedAnswerIds ?? [])

      // Partial scoring: points per correct selected, minus per incorrect selected
      const correctSelected = [...selectedIds].filter(id => correctIds.has(id)).length
      const incorrectSelected = [...selectedIds].filter(id => !correctIds.has(id)).length
      const totalCorrect = correctIds.size

      if (totalCorrect > 0) {
        const ratio = Math.max(0, (correctSelected - incorrectSelected) / totalCorrect)
        earnedPoints = Math.round(question.points * ratio)
        isCorrect = correctSelected === totalCorrect && incorrectSelected === 0
      }
      break
    }

    case 'ShortAnswer': {
      const validAnswers = (question.answers ?? [])
        .filter(a => a.isCorrect)
        .map(a => a.text.trim().toLowerCase())
      const userText = (userAnswer.shortAnswerText ?? '').trim().toLowerCase()
      isCorrect = validAnswers.includes(userText)
      earnedPoints = isCorrect ? question.points : 0
      break
    }

    case 'DragAndDropOrder': {
      const answers = question.answers ?? []
      const orderedCorrect = [...answers].sort((a, b) => a.correctOrder - b.correctOrder).map(a => a.text)
      const userOrder = userAnswer.orderedItems ?? []

      const totalItems = orderedCorrect.length
      if (totalItems === 0) break

      const correctCount = userOrder.filter((item, idx) => item === orderedCorrect[idx]).length
      const ratio = correctCount / totalItems
      earnedPoints = Math.round(question.points * ratio)
      isCorrect = correctCount === totalItems
      break
    }
  }

  return { question, userAnswer, earnedPoints, maxPoints: question.points, isCorrect }
}

/**
 * Computes the final quiz result from all question results.
 */
export function computeQuizResult(quiz: Quiz, results: QuestionResult[], timeTakenMs: number): QuizResult {
  const totalScore = results.reduce((sum, r) => sum + r.earnedPoints, 0)
  const maxScore = results.reduce((sum, r) => sum + r.maxPoints, 0)
  const percentage = maxScore > 0 ? Math.round((totalScore / maxScore) * 100) : 0

  return { quiz, results, totalScore, maxScore, percentage, timeTakenMs }
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Stable ID for an answer: uses `id` field if present, otherwise falls back to `text`. */
export function getAnswerId(answer: Answer): string {
  return answer.id ?? answer.text
}

function shuffle<T>(arr: T[]): T[] {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}
