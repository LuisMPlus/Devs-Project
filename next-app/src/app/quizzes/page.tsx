'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { fetchQuizList } from '@/features/quizzes/services/quizService'
import type { Quiz } from '@/features/quizzes/interfaces/quiz'

type QuizMeta = Pick<Quiz, 'id' | 'title' | 'description' | 'difficulty' | 'tags'>

export default function QuizzesIndexPage() {
  const [quizzes, setQuizzes] = useState<QuizMeta[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchQuizList().then(list => {
      setQuizzes(list)
      setLoading(false)
    })
  }, [])

  return (
    <div className="relative min-h-screen w-full flex flex-col items-center py-20 px-4">
      {/* Ambient glow */}
      <div 
        className="pointer-events-none fixed inset-0 -z-10"
        style={{ background: 'radial-gradient(ellipse 80% 50% at 50% 0%, color-mix(in srgb, var(--color-primary) 15%, transparent), transparent 70%)' }}
      />

      {/* Hero */}
      <div className="w-full max-w-4xl text-center flex flex-col items-center gap-6 mb-16">
        <span className="inline-block px-4 py-1.5 rounded-full text-xs font-bold tracking-widest uppercase border border-[--color-secondary]/40 text-[--color-secondary] bg-[--color-secondary]/10">
          Modo desafío
        </span>
        <h1 className="text-5xl md:text-7xl font-extrabold text-[--color-text] leading-tight tracking-tight">
          Pon a prueba tu<br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[--color-primary] to-[--color-secondary]">
            conocimiento
          </span>
        </h1>
        <p className="text-lg text-[--color-text]/70 max-w-2xl">
          Quizzes interactivos para repasar y aprender. ¡El tiempo corre!
        </p>
      </div>

      {/* Quiz grid */}
      <div className="w-full max-w-6xl">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="w-12 h-12 border-4 border-white/10 border-t-[--color-primary] rounded-full animate-spin" />
            <p className="text-[--color-text]/50 font-medium animate-pulse">Cargando quizzes...</p>
          </div>
        ) : quizzes.length === 0 ? (
          <div className="text-center py-20 p-8 rounded-3xl border border-white/10 bg-white/5">
            <span className="text-4xl">📭</span>
            <h3 className="mt-4 text-xl font-bold text-[--color-text]">No hay quizzes disponibles</h3>
            <p className="text-[--color-text]/50 mt-2">Vuelve más tarde para ver nuevos desafíos.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {quizzes.map(q => (
              <QuizCard key={q.id} quiz={q} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function QuizCard({ quiz }: { quiz: QuizMeta }) {
  const difficultyLabel: Record<string, string> = {
    easy: 'Fácil',
    medium: 'Media',
    hard: 'Difícil',
  }
  const difficultyColor: Record<string, string> = {
    easy: '#22c55e',
    medium: '#f59e0b',
    hard: '#ef4444',
  }
  const color = quiz.difficulty ? difficultyColor[quiz.difficulty] : 'var(--color-primary)'

  return (
    <Link 
      href={`/quizzes/${quiz.id}`} 
      id={`quiz-card-${quiz.id}`}
      className="group relative flex flex-col gap-4 p-6 rounded-3xl border border-white/10 bg-white/[0.03] backdrop-blur-sm transition-all duration-300 hover:bg-white/[0.08] hover:border-white/20 hover:-translate-y-1 hover:shadow-2xl overflow-hidden"
    >
      {/* Subtle background glow specific to card's difficulty */}
      <div 
        className="absolute -top-20 -right-20 w-40 h-40 blur-3xl opacity-20 transition-opacity group-hover:opacity-40" 
        style={{ backgroundColor: color }} 
      />

      {/* Header */}
      <div className="flex items-center justify-between z-10">
        <span className="text-3xl filter drop-shadow-md group-hover:scale-110 transition-transform duration-300">
          🧠
        </span>
        {quiz.difficulty && (
          <span 
            className="px-3 py-1 rounded-full text-xs font-bold border bg-black/20"
            style={{ color, borderColor: color }}
          >
            {difficultyLabel[quiz.difficulty] ?? quiz.difficulty}
          </span>
        )}
      </div>

      {/* Body */}
      <div className="flex flex-col gap-2 z-10 flex-1">
        <h2 className="text-2xl font-bold text-[--color-text] leading-tight group-hover:text-[--color-primary] transition-colors">
          {quiz.title}
        </h2>
        {quiz.description && (
          <p className="text-[--color-text]/60 text-sm leading-relaxed line-clamp-3">
            {quiz.description}
          </p>
        )}
      </div>

      {/* Footer / Tags */}
      <div className="flex flex-col gap-4 mt-auto z-10">
        {quiz.tags && quiz.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {quiz.tags.map(tag => (
              <span key={tag} className="text-xs font-medium text-[--color-text]/40 bg-white/5 px-2 py-1 rounded-md">
                #{tag}
              </span>
            ))}
          </div>
        )}
        
        {/* CTA */}
        <div className="flex items-center gap-2 text-sm font-extrabold tracking-wide uppercase transition-colors" style={{ color: color }}>
          Iniciar quiz 
          <span className="group-hover:translate-x-1 transition-transform">→</span>
        </div>
      </div>
    </Link>
  )
}
