'use client'

import type { QuizResult, QuestionResult, UserAnswer } from '@/features/quizzes/utils/quizEngine'
import type { Answer } from '@/features/quizzes/interfaces/quiz'
import { getAnswerId } from '@/features/quizzes/hooks/useQuiz'

interface QuizResultScreenProps {
  result: QuizResult
  showCorrectAnswers: boolean
  onRestart: () => void
}

export default function QuizResultScreen({ result, showCorrectAnswers, onRestart }: QuizResultScreenProps) {
  const { quiz, results, totalScore, maxScore, percentage, timeTakenMs } = result
  const minutes = Math.floor(timeTakenMs / 60000)
  const seconds = Math.floor((timeTakenMs % 60000) / 1000)

  const medal = getMedal(percentage)

  return (
    <div className="relative w-full max-w-4xl mx-auto flex flex-col items-center py-10 px-4">
      {/* Background glow based on score */}
      <div
        className="pointer-events-none fixed inset-0 -z-10 opacity-20 blur-[100px]"
        style={{ background: `radial-gradient(circle at 50% 20%, ${medal.color}, transparent 60%)` }}
      />

      {/* Hero Section */}
      <div className="w-full flex flex-col items-center gap-6 mb-12 text-center z-10">
        <div
          className="text-[120px] leading-none filter drop-shadow-2xl animate-bounce"
          style={{ filter: `drop-shadow(0 20px 30px ${medal.color}60)` }}
        >
          {medal.emoji}
        </div>

        <div className="flex flex-col gap-2">
          <h2 className="text-4xl md:text-5xl font-extrabold text-[--color-text] tracking-tight">
            {medal.label}
          </h2>
          <p className="text-xl font-medium text-[--color-text]/60">{quiz.title}</p>
        </div>

        {/* Big Score Display */}
        <div className="relative flex items-center justify-center mt-6 w-56 h-56">
          <div className="absolute inset-0 rounded-full border-4 opacity-10" style={{ borderColor: medal.color }} />
          <svg className="absolute inset-0 w-full h-full -rotate-90 drop-shadow-lg" viewBox="0 0 100 100">
            <circle
              cx="50" cy="50" r="48"
              fill="none"
              stroke={medal.color}
              strokeWidth="4"
              strokeDasharray={`${(percentage / 100) * 301.59} 301.59`}
              strokeLinecap="round"
              className="transition-all duration-1000 ease-out"
            />
          </svg>
          <div className="w-48 h-48 rounded-full flex flex-col items-center justify-center bg-black/40 backdrop-blur-md border border-white/5 shadow-2xl">
            <span className="text-6xl font-black" style={{ color: medal.color }}>{percentage}%</span>
            <span className="text-lg font-bold text-[--color-text]/70 mt-1">{totalScore} / {maxScore} pts</span>
          </div>
        </div>

        {/* Stats Row */}
        <div className="flex flex-wrap justify-center gap-4 mt-6">
          <StatBox label="Correctas"   value={results.filter(r => r.isCorrect).length}  color="text-green-400" />
          <StatBox label="Incorrectas" value={results.filter(r => !r.isCorrect).length} color="text-red-400" />
          <StatBox label="Tiempo total" value={`${minutes > 0 ? `${minutes}m ` : ''}${seconds}s`} />
        </div>
      </div>

      {/* Per-question breakdown */}
      <div className="w-full flex flex-col gap-4 z-10">
        <h3 className="text-2xl font-bold text-[--color-text] mb-2 px-2">Detalle por pregunta</h3>
        <div className="flex flex-col gap-4">
          {results.map((r, i) => (
            <QuestionResultRow key={r.question.id} result={r} index={i} showCorrectAnswers={showCorrectAnswers} />
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="mt-12 w-full max-w-sm z-10">
        <button
          id="btn-restart-quiz"
          onClick={onRestart}
          className="w-full flex items-center justify-center gap-3 py-4 rounded-2xl font-extrabold text-xl text-[--color-bg] bg-[--color-primary] hover:brightness-110 active:scale-95 transition-all shadow-[0_0_20px_var(--color-primary)] opacity-90 hover:opacity-100"
        >
          🔄 Volver a intentar
        </button>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// StatBox
// ---------------------------------------------------------------------------
function StatBox({ label, value, color = "text-[--color-text]" }: { label: string; value: string | number; color?: string }) {
  return (
    <div className="flex flex-col items-center justify-center min-w-[130px] p-4 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm shadow-xl">
      <span className={`text-3xl font-black ${color}`}>{value}</span>
      <span className="text-xs font-bold text-[--color-text]/50 uppercase tracking-wider mt-1">{label}</span>
    </div>
  )
}

// ---------------------------------------------------------------------------
// QuestionResultRow
// ---------------------------------------------------------------------------
function QuestionResultRow({ result, index, showCorrectAnswers }: {
  result: QuestionResult
  index: number
  showCorrectAnswers: boolean
}) {
  const { question, earnedPoints, maxPoints, isCorrect, userAnswer } = result
  const hasAnswerOptions = ['Single', 'TrueOrFalse', 'MultipleChoice'].includes(question.type)

  return (
    <div className={`flex flex-col rounded-2xl border backdrop-blur-sm shadow-lg overflow-hidden ${
      isCorrect
        ? 'border-green-500/20 bg-green-500/5'
        : 'border-red-500/20 bg-red-500/5'
    }`}>
      {/* Row header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-5">
        {/* Index & Icon */}
        <div className="flex items-center gap-3 shrink-0">
          <span className="flex items-center justify-center w-8 h-8 rounded-full bg-black/30 font-bold text-sm text-[--color-text]/70">
            {index + 1}
          </span>
          <span className={`flex items-center justify-center w-8 h-8 rounded-full text-xl ${
            isCorrect ? 'text-green-400 bg-green-400/10' : 'text-red-400 bg-red-400/10'
          }`}>
            {isCorrect ? '✓' : '✗'}
          </span>
        </div>

        {/* Body */}
        <div className="flex-1 flex flex-col gap-1.5">
          <p className="font-semibold text-[--color-text] text-lg leading-snug">{question.question}</p>
          {(!showCorrectAnswers || !hasAnswerOptions) && (
            <p className={`text-sm font-medium ${isCorrect ? 'text-green-300/80' : 'text-red-300/80'}`}>
              <span className="opacity-70 font-normal">Tu respuesta:</span> {formatUserAnswer(result)}
            </p>
          )}
        </div>

        {/* Points */}
        <div className="flex flex-col items-end shrink-0 bg-black/30 px-4 py-2 rounded-xl border border-white/5">
          <span className={`text-xl font-black ${isCorrect ? 'text-[--color-primary]' : 'text-red-400'}`}>
            {earnedPoints}/{maxPoints}
          </span>
          <span className="text-[10px] font-bold text-[--color-text]/40 uppercase tracking-widest">pts</span>
        </div>
      </div>

      {/* Answer options breakdown (only when showCorrectAnswers + has selectable options) */}
      {showCorrectAnswers && hasAnswerOptions && question.answers && (
        <div className="px-5 pb-5 flex flex-col gap-2 border-t border-white/5 pt-4">
          <p className="text-xs font-bold uppercase tracking-wider text-[--color-text]/40 mb-1">Opciones</p>
          <div className="flex flex-col gap-2">
            {question.answers.map(answer => (
              <AnswerOptionRow
                key={getAnswerId(answer)}
                answer={answer}
                userAnswer={userAnswer}
                questionType={question.type}
              />
            ))}
          </div>
        </div>
      )}

      {/* ShortAnswer / DragAndDrop: show user answer + correct inline */}
      {showCorrectAnswers && !hasAnswerOptions && (
        <div className="px-5 pb-5 flex flex-col gap-2 border-t border-white/5 pt-4">
          {question.type === 'DragAndDropOrder' && question.answers && (
            <div className="flex flex-col gap-1.5">
              <p className="text-xs font-bold uppercase tracking-wider text-[--color-text]/40 mb-1">Orden correcto</p>
              {[...question.answers].sort((a, b) => a.correctOrder - b.correctOrder).map((a, i) => (
                <div key={getAnswerId(a)} className="flex items-center gap-3 text-sm text-[--color-text]/80">
                  <span className="w-5 h-5 flex items-center justify-center rounded-full bg-[--color-primary]/20 text-[--color-primary] font-bold text-xs">{i + 1}</span>
                  <span>{a.text}</span>
                </div>
              ))}
            </div>
          )}
          {question.type === 'ShortAnswer' && (
            <div className="flex flex-col gap-1">
              <p className="text-xs font-bold uppercase tracking-wider text-[--color-text]/40">Respuestas válidas</p>
              <p className="text-sm text-[--color-primary] font-semibold">
                {question.answers?.filter(a => a.isCorrect).map(a => a.text).join(' / ')}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// AnswerOptionRow — renders a single answer option with state styling
// ---------------------------------------------------------------------------
function AnswerOptionRow({ answer, userAnswer, questionType }: {
  answer: Answer
  userAnswer: UserAnswer
  questionType: string
}) {
  const id = getAnswerId(answer)
  const selectedIds = new Set(userAnswer.selectedAnswerIds ?? [])
  const isSelected = selectedIds.has(id)
  const isCorrect = answer.isCorrect

  const state: 'correct-selected' | 'correct-missed' | 'wrong-selected' | 'neutral' =
    isCorrect && isSelected ? 'correct-selected' :
    isCorrect && !isSelected ? 'correct-missed' :
    !isCorrect && isSelected ? 'wrong-selected' : 'neutral'

  const styles = {
    'correct-selected': 'border-green-500 bg-green-500/15 text-green-200',
    'correct-missed':   'border-green-500/40 bg-green-500/5 text-green-300/70 border-dashed',
    'wrong-selected':   'border-red-500 bg-red-500/15 text-red-200',
    'neutral':          'border-white/10 bg-white/[0.02] text-[--color-text]/60',
  }

  const badge = {
    'correct-selected': { icon: '✓', label: 'Correcta · Tu respuesta', cls: 'text-green-400 bg-green-400/20' },
    'correct-missed':   { icon: '!', label: 'Correcta',                cls: 'text-green-400/70 bg-green-400/10' },
    'wrong-selected':   { icon: '✗', label: 'Incorrecta · Tu respuesta', cls: 'text-red-400 bg-red-400/20' },
    'neutral':          null,
  }[state]

  return (
    <div className={`flex items-center justify-between gap-4 px-4 py-3 rounded-xl border text-sm font-medium transition-all ${styles[state]}`}>
      <span className="flex-1">{answer.text}</span>
      {badge && (
        <span className={`flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full shrink-0 ${badge.cls}`}>
          <span>{badge.icon}</span>
          <span>{badge.label}</span>
        </span>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatUserAnswer(result: QuestionResult): string {
  const { question, userAnswer } = result

  if (userAnswer.timedOut) return '⏱ Sin respuesta (tiempo agotado)'

  switch (question.type) {
    case 'Single':
    case 'TrueOrFalse': {
      const ids = userAnswer.selectedAnswerIds ?? []
      if (ids.length === 0) return 'Sin respuesta'
      const selected = question.answers?.find(a => (a.id ?? a.text) === ids[0])
      return selected?.text ?? ids[0]
    }
    case 'MultipleChoice': {
      const ids = new Set(userAnswer.selectedAnswerIds ?? [])
      const selected = question.answers?.filter(a => ids.has(a.id ?? a.text)).map(a => a.text) ?? []
      return selected.length > 0 ? selected.join(', ') : 'Sin respuesta'
    }
    case 'ShortAnswer':
      return userAnswer.shortAnswerText?.trim() || 'Sin respuesta'
    case 'DragAndDropOrder':
      return (userAnswer.orderedItems ?? []).join(' → ')
    default:
      return '—'
  }
}

interface Medal { emoji: string; label: string; color: string }

function getMedal(percentage: number): Medal {
  if (percentage === 100) return { emoji: '🏆', label: '¡Perfecto!',         color: '#f59e0b' }
  if (percentage >= 80)  return { emoji: '🥇', label: '¡Excelente!',         color: '#02ffff' }
  if (percentage >= 60)  return { emoji: '🥈', label: 'Muy bien',             color: '#42d7c7' }
  if (percentage >= 40)  return { emoji: '🥉', label: 'Puedes mejorar',       color: '#8b5cf6' }
  return                        { emoji: '💪', label: '¡Sigue practicando!', color: '#ef4444' }
}
