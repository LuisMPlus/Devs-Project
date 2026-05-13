'use client'

import type { Question } from '@/features/quizzes/interfaces/quiz'
import type { UserAnswer } from '@/features/quizzes/utils/quizEngine'
import {
  SingleAnswer,
  MultipleAnswer,
  TrueOrFalseAnswer,
  ShortAnswerInput,
  DragAndDropOrder,
} from './AnswerTypes'

interface QuestionCardProps {
  question: Question
  questionNumber: number
  totalQuestions: number
  pendingAnswer: UserAnswer | null
  timeLeft: number | null
  /** Whether to show correct/wrong feedback overlay */
  revealCorrect?: boolean
  onSelectSingle: (id: string) => void
  onToggleMulti: (id: string) => void
  onShortAnswer: (text: string) => void
  onReorder: (items: string[]) => void
  onSubmit: () => void
  onTimeOut?: () => void
}

export default function QuestionCard({
  question,
  questionNumber,
  totalQuestions,
  pendingAnswer,
  timeLeft,
  revealCorrect = false,
  onSelectSingle,
  onToggleMulti,
  onShortAnswer,
  onReorder,
  onSubmit,
}: QuestionCardProps) {
  const selectedIds = pendingAnswer?.selectedAnswerIds ?? []
  const shortText = pendingAnswer?.shortAnswerText ?? ''
  const orderedItems = pendingAnswer?.orderedItems ?? []
  const isDisabled = revealCorrect

  const correctAnswers = question.answers?.filter(a => a.isCorrect).map(a => a.text) ?? []

  const isShortAnswerCorrect = (() => {
    if (question.type !== 'ShortAnswer') return false
    const valid = correctAnswers.map(t => t.trim().toLowerCase())
    return valid.includes(shortText.trim().toLowerCase())
  })()

  const correctOrder = question.answers
    ? [...question.answers].sort((a, b) => a.correctOrder - b.correctOrder).map(a => a.text)
    : []

  const timerPercent = question.timeLimit && timeLeft !== null
    ? Math.max(0, (timeLeft / question.timeLimit) * 100)
    : null

  const timerColor = timerPercent !== null
    ? timerPercent > 50 ? 'var(--color-primary)' : timerPercent > 25 ? '#f59e0b' : '#ef4444'
    : 'var(--color-primary)'

  const canSubmit = (() => {
    if (revealCorrect) return false
    switch (question.type) {
      case 'Single':
      case 'TrueOrFalse':
        return selectedIds.length > 0
      case 'MultipleChoice':
        return selectedIds.length > 0
      case 'ShortAnswer':
        return shortText.trim().length > 0
      case 'DragAndDropOrder':
        return orderedItems.length > 0
      default:
        return false
    }
  })()

  return (
    <div className="w-full max-w-3xl mx-auto flex flex-col gap-6 p-6 sm:p-8 rounded-3xl border border-white/10 bg-white/[0.03] shadow-2xl backdrop-blur-sm">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4">
          <span className="text-sm font-bold tracking-wider text-[--color-text]/60 uppercase">
            Pregunta {questionNumber} <span className="opacity-50">/ {totalQuestions}</span>
          </span>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-semibold border border-[--color-secondary]/40 text-[--color-secondary] bg-[--color-secondary]/10">
              {getTypeName(question.type)}
            </span>
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-[--color-primary]/20 text-[--color-primary]">
              +{question.points} pts
            </span>
          </div>
        </div>

        {/* Timer */}
        {timeLeft !== null && (
          <div className="flex flex-col gap-1.5">
            <div className="w-full h-2 rounded-full bg-black/40 overflow-hidden">
              <div
                className="h-full rounded-full"
                style={{
                  width: `${timerPercent ?? 0}%`,
                  backgroundColor: timerColor,
                  transition: 'width 1s linear, background-color 0.5s ease',
                }}
              />
            </div>
            <span className="text-right text-xs font-bold" style={{ color: timerColor }}>
              {timeLeft}s
            </span>
          </div>
        )}
      </div>

      {/* Question text */}
      <div className="flex flex-col gap-4">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-[--color-text] leading-snug">
          {question.question}
        </h2>
        {question.description && (
          <p className="text-[--color-text]/70 text-base leading-relaxed">
            {question.description}
          </p>
        )}
        {question.image && (
          <img 
            src={question.image} 
            alt="Imagen de la pregunta" 
            className="w-full max-h-80 object-contain rounded-2xl border border-white/10 bg-black/20" 
          />
        )}
      </div>

      {/* Answers */}
      <div className="flex flex-col gap-3 mt-4">
        {question.type === 'Single' && (
          <SingleAnswer
            question={question}
            selectedIds={selectedIds}
            onSelect={onSelectSingle}
            disabled={isDisabled}
            revealCorrect={revealCorrect}
          />
        )}
        {question.type === 'TrueOrFalse' && (
          <TrueOrFalseAnswer
            question={question}
            selectedIds={selectedIds}
            onSelect={onSelectSingle}
            disabled={isDisabled}
            revealCorrect={revealCorrect}
          />
        )}
        {question.type === 'MultipleChoice' && (
          <MultipleAnswer
            question={question}
            selectedIds={selectedIds}
            onToggle={onToggleMulti}
            disabled={isDisabled}
            revealCorrect={revealCorrect}
          />
        )}
        {question.type === 'ShortAnswer' && (
          <ShortAnswerInput
            value={shortText}
            onChange={onShortAnswer}
            disabled={isDisabled}
            revealCorrect={revealCorrect}
            correctAnswers={correctAnswers}
            isCorrect={isShortAnswerCorrect}
          />
        )}
        {question.type === 'DragAndDropOrder' && (
          <DragAndDropOrder
            items={orderedItems}
            onReorder={onReorder}
            disabled={isDisabled}
            revealCorrect={revealCorrect}
            correctOrder={correctOrder}
          />
        )}
      </div>

      {/* Explanation after reveal */}
      {revealCorrect && question.explanation && (
        <div className="mt-4 p-5 rounded-2xl border border-[--color-secondary]/30 bg-[--color-secondary]/10 flex gap-4 items-start">
          <span className="text-2xl shrink-0">💡</span>
          <p className="text-sm text-[--color-text]/90 leading-relaxed">
            {question.explanation}
          </p>
        </div>
      )}

      {/* Submit button */}
      {!revealCorrect && (
        <button
          id="btn-submit-answer"
          onClick={onSubmit}
          disabled={!canSubmit}
          className="mt-6 w-full flex items-center justify-center py-4 rounded-2xl font-extrabold text-lg text-[--color-bg] bg-[--color-primary] hover:brightness-110 disabled:opacity-50 disabled:grayscale disabled:cursor-not-allowed transition-all shadow-lg shadow-[--color-primary]/20"
        >
          Confirmar respuesta
        </button>
      )}
    </div>
  )
}

function getTypeName(type: string): string {
  const names: Record<string, string> = {
    Single: 'Única opción',
    MultipleChoice: 'Múltiple opción',
    TrueOrFalse: 'Verdadero / Falso',
    ShortAnswer: 'Respuesta corta',
    DragAndDropOrder: 'Ordenar',
  }
  return names[type] ?? type
}
