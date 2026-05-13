'use client'

import type { Quiz } from '@/features/quizzes/interfaces/quiz'

interface QuizLobbyProps {
  quiz: Quiz
  hasActiveSession: boolean
  onResume: () => void
  onQuickStart: () => void
  onConfigure: () => void
}

export default function QuizLobby({ quiz, hasActiveSession, onResume, onQuickStart, onConfigure }: QuizLobbyProps) {
  const questionCount = quiz.questionPool
    ? quiz.questionPool.pick
    : (quiz.questions?.length ?? 0)

  const totalPoints = (quiz.questions ?? quiz.questionPool?.questions ?? [])
    .slice(0, questionCount)
    .reduce((sum, q) => sum + q.points, 0)

  const hasTimer = quiz.timeMode === 'per_question' || quiz.timeMode === 'global'

  const difficultyLabel: Record<string, string> = { easy: 'Fácil', medium: 'Media', hard: 'Difícil' }
  const difficultyColor: Record<string, string> = { easy: '#22c55e', medium: '#f59e0b', hard: '#ef4444' }

  return (
    <div className="relative min-h-screen w-full flex flex-col items-center justify-center py-16 px-4">

      {/* Ambient glow */}
      <div
        className="pointer-events-none fixed inset-0 -z-10"
        style={{ background: 'radial-gradient(ellipse 60% 50% at 50% 0%, color-mix(in srgb, var(--color-primary) 15%, transparent), transparent 70%)' }}
      />

      <div className="w-full max-w-xl flex flex-col items-center gap-8 text-center">

        {/* Subject badge */}
        <span className="inline-block px-4 py-1 rounded-full text-xs font-bold tracking-widest uppercase border border-[--color-primary]/40 text-[--color-primary] bg-[--color-primary]/10">
          {quiz.subject ?? 'Quiz'}
        </span>

        {/* Title */}
        <div className="flex flex-col gap-3">
          <h1 className="text-4xl md:text-5xl font-extrabold text-[--color-text] leading-tight">
            {quiz.title}
          </h1>
          {quiz.description && (
            <p className="text-[--color-text]/60 text-base max-w-md mx-auto">{quiz.description}</p>
          )}
        </div>

        {/* Info grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full">
          <InfoCard icon="❓" label="Preguntas" value={String(questionCount)} />
          <InfoCard icon="⭐" label="Puntos" value={String(totalPoints)} />
          {hasTimer && <InfoCard icon="⏱" label="Con tiempo" value="Sí" />}
          {quiz.difficulty && (
            <InfoCard
              icon="🎯"
              label="Dificultad"
              value={difficultyLabel[quiz.difficulty] ?? quiz.difficulty}
              valueColor={difficultyColor[quiz.difficulty]}
            />
          )}
          {quiz.randomizeQuestions && <InfoCard icon="🔀" label="Preguntas" value="Aleatorias" />}
        </div>

        {/* Question types */}
        <div className="flex flex-wrap justify-center gap-2">
          {getUniqueTypes(quiz).map(type => (
            <span
              key={type}
              className="px-3 py-1 rounded-full text-xs font-semibold border border-[--color-secondary]/40 text-[--color-secondary] bg-[--color-secondary]/10"
            >
              {getTypeName(type)}
            </span>
          ))}
        </div>

        {/* Tags */}
        {quiz.tags && quiz.tags.length > 0 && (
          <div className="flex flex-wrap justify-center gap-2">
            {quiz.tags.map(tag => (
              <span key={tag} className="text-xs text-[--color-text]/40">#{tag}</span>
            ))}
          </div>
        )}

        {/* CTAs */}
        <div className="flex flex-col w-full max-w-sm mt-4 gap-3">
          {hasActiveSession ? (
            <>
              <button
                onClick={onResume}
                className="w-full flex items-center justify-center gap-3 py-4 rounded-2xl font-bold text-base text-[--color-text] border border-white/15 bg-white/5 hover:bg-white/10 hover:border-white/25 active:scale-95 transition-all"
              >
                Continuar intento anterior <span>↺</span>
              </button>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={onQuickStart}
                  className="flex items-center justify-center gap-2 py-4 rounded-2xl font-bold text-base text-[--color-text] border border-white/15 bg-white/5 hover:bg-white/10 hover:border-white/25 active:scale-95 transition-all"
                >
                  ⚡ Inicio rápido
                </button>
                <button
                  onClick={onConfigure}
                  className="flex items-center justify-center gap-2 py-4 rounded-2xl font-bold text-base text-[--color-text] border border-white/15 bg-white/5 hover:bg-white/10 hover:border-white/25 active:scale-95 transition-all"
                >
                  ⚙ Configurar
                </button>
              </div>
            </>
          ) : (
            <>
              <button
                id="btn-start-quiz"
                onClick={onQuickStart}
                className="w-full flex items-center justify-center gap-3 py-4 rounded-2xl font-bold text-base text-[--color-text] border border-white/15 bg-white/5 hover:bg-white/10 hover:border-white/25 active:scale-95 transition-all"
              >
                ⚡ Inicio rápido
              </button>
              <button
                id="btn-configure-quiz"
                onClick={onConfigure}
                className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl font-bold text-base text-[--color-text] border border-white/15 bg-white/5 hover:bg-white/10 hover:border-white/25 active:scale-95 transition-all"
              >
                ⚙ Configurar quiz
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function InfoCard({ icon, label, value, valueColor }: { icon: string; label: string; value: string; valueColor?: string }) {
  return (
    <div className="flex flex-col items-center gap-1 p-3 rounded-xl border border-white/10 bg-white/[0.03]">
      <span className="text-2xl">{icon}</span>
      <span className="font-bold text-sm text-[--color-text]" style={valueColor ? { color: valueColor } : undefined}>
        {value}
      </span>
      <span className="text-xs text-[--color-text]/50">{label}</span>
    </div>
  )
}

function getUniqueTypes(quiz: Quiz): string[] {
  const questions = quiz.questions ?? quiz.questionPool?.questions ?? []
  return [...new Set(questions.map(q => q.type))]
}

function getTypeName(type: string): string {
  const names: Record<string, string> = {
    Single:           '⊙ Única opción',
    MultipleChoice:   '☑ Múltiple',
    TrueOrFalse:      '◈ V/F',
    ShortAnswer:      '✎ Respuesta corta',
    DragAndDropOrder: '⠿ Ordenar',
  }
  return names[type] ?? type
}
