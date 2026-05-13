'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import type { Quiz } from '@/features/quizzes/interfaces/quiz'
import { fetchQuizById } from '@/features/quizzes/services/quizService'
import QuizRunner from '@/features/quizzes/components/QuizRunner'

export default function QuizPage() {
  const params = useParams()
  const router = useRouter()
  const quizId = typeof params?.quizId === 'string' ? params.quizId : ''

  const [quiz, setQuiz] = useState<Quiz | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    if (!quizId) return
    fetchQuizById(quizId).then(q => {
      if (!q) setNotFound(true)
      else setQuiz(q)
      setLoading(false)
    })
  }, [quizId])

  if (loading) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center py-20 gap-4">
        <div className="w-12 h-12 border-4 border-white/10 border-t-[--color-primary] rounded-full animate-spin" />
        <p className="text-[--color-text]/50 font-medium animate-pulse">Cargando quiz…</p>
      </div>
    )
  }

  if (notFound || !quiz) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center p-4">
        <div className="flex flex-col items-center gap-6 p-10 max-w-sm text-center rounded-3xl border border-red-500/20 bg-red-500/5 backdrop-blur-md">
          <span className="text-6xl drop-shadow-lg">😕</span>
          <div className="flex flex-col gap-2">
            <h2 className="text-2xl font-bold text-red-400">Quiz no encontrado</h2>
            <p className="text-[--color-text]/60">El desafío que buscas no existe o fue eliminado.</p>
          </div>
          <button
            onClick={() => router.push('/quizzes')}
            className="mt-4 w-full flex items-center justify-center gap-2 py-4 rounded-2xl font-bold text-lg text-[--color-bg] bg-red-500 hover:brightness-110 active:scale-95 transition-all shadow-lg shadow-red-500/20"
          >
            ← Volver a Quizzes
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen w-full flex flex-col">
      <QuizRunner quiz={quiz} />
    </div>
  )
}
