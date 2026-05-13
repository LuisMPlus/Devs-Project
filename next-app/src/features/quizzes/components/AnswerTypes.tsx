'use client'

import { useRef } from 'react'
import type { Question, Answer } from '@/features/quizzes/interfaces/quiz'
import { getAnswerId } from '@/features/quizzes/hooks/useQuiz'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

type AnswerState = 'default' | 'selected' | 'correct' | 'wrong' | 'missed'

function getAnswerState(answer: Answer, isSelected: boolean, revealCorrect?: boolean): AnswerState {
  if (!revealCorrect) return isSelected ? 'selected' : 'default'
  if (answer.isCorrect && isSelected) return 'correct'
  if (answer.isCorrect && !isSelected) return 'missed'
  if (!answer.isCorrect && isSelected) return 'wrong'
  return 'default'
}

function getAnswerClasses(state: AnswerState) {
  const base = "w-full flex items-center gap-4 p-4 rounded-xl border text-left transition-all duration-200"
  switch (state) {
    case 'default':
      return `${base} border-white/10 bg-white/5 hover:border-white/25 hover:bg-white/10`
    case 'selected':
      return `${base} border-[--color-primary] bg-[--color-primary]/20 shadow-md shadow-[--color-primary]/10 scale-[1.01]`
    case 'correct':
      return `${base} border-green-500 bg-green-500/20 text-green-100`
    case 'wrong':
      return `${base} border-red-500 bg-red-500/20 text-red-100`
    case 'missed':
      return `${base} border-yellow-500/50 bg-yellow-500/10 text-yellow-100 border-dashed`
  }
}

// ---------------------------------------------------------------------------
// Single / TrueOrFalse
// ---------------------------------------------------------------------------

interface SingleAnswerProps {
  question: Question
  selectedIds: string[]
  onSelect: (id: string) => void
  disabled?: boolean
  revealCorrect?: boolean
}

export function SingleAnswer({ question, selectedIds, onSelect, disabled, revealCorrect }: SingleAnswerProps) {
  return (
    <div className="flex flex-col gap-3">
      {(question.answers ?? []).map((answer) => {
        const id = getAnswerId(answer)
        const isSelected = selectedIds.includes(id)
        const state = getAnswerState(answer, isSelected, revealCorrect)
        return (
          <button
            key={id}
            id={`answer-${id}`}
            onClick={() => !disabled && onSelect(id)}
            disabled={disabled}
            className={getAnswerClasses(state)}
            aria-pressed={isSelected}
          >
            <span className={`text-xl flex items-center justify-center w-6 h-6 shrink-0 rounded-full border-2 ${
              state === 'selected' ? 'border-[--color-primary] text-[--color-primary]' :
              state === 'correct' ? 'border-green-400 text-green-400' :
              state === 'wrong' ? 'border-red-400 text-red-400' :
              'border-white/40 text-transparent'
            }`}>
              {state === 'correct' ? '✓' : state === 'wrong' ? '✗' : state === 'selected' ? '●' : ''}
            </span>
            <span className="font-medium text-[--color-text] text-lg">{answer.text}</span>
          </button>
        )
      })}
    </div>
  )
}

// ---------------------------------------------------------------------------
// MultipleChoice
// ---------------------------------------------------------------------------

interface MultipleAnswerProps {
  question: Question
  selectedIds: string[]
  onToggle: (id: string) => void
  disabled?: boolean
  revealCorrect?: boolean
}

export function MultipleAnswer({ question, selectedIds, onToggle, disabled, revealCorrect }: MultipleAnswerProps) {
  return (
    <div className="flex flex-col gap-3">
      {(question.answers ?? []).map((answer) => {
        const id = getAnswerId(answer)
        const isSelected = selectedIds.includes(id)
        const state = getAnswerState(answer, isSelected, revealCorrect)
        return (
          <button
            key={id}
            id={`answer-${id}`}
            onClick={() => !disabled && onToggle(id)}
            disabled={disabled}
            className={getAnswerClasses(state)}
            aria-pressed={isSelected}
          >
            <span className={`flex items-center justify-center w-6 h-6 shrink-0 rounded border-2 ${
              state === 'selected' ? 'border-[--color-primary] bg-[--color-primary] text-[--color-bg]' :
              state === 'correct' ? 'border-green-400 bg-green-400 text-[--color-bg]' :
              state === 'wrong' ? 'border-red-400 bg-red-400 text-[--color-bg]' :
              'border-white/40 text-transparent'
            }`}>
              {state === 'correct' ? '✓' : state === 'wrong' ? '✗' : isSelected ? '✓' : ''}
            </span>
            <span className="font-medium text-[--color-text] text-lg flex-1">{answer.text}</span>
            {revealCorrect && state === 'missed' && (
              <span className="text-yellow-400 font-bold ml-auto text-sm shrink-0">¡Faltó esta!</span>
            )}
          </button>
        )
      })}
    </div>
  )
}

// ---------------------------------------------------------------------------
// TrueOrFalse
// ---------------------------------------------------------------------------

interface TrueOrFalseProps {
  question: Question
  selectedIds: string[]
  onSelect: (id: string) => void
  disabled?: boolean
  revealCorrect?: boolean
}

export function TrueOrFalseAnswer({ question, selectedIds, onSelect, disabled, revealCorrect }: TrueOrFalseProps) {
  return (
    <div className="grid grid-cols-2 gap-4">
      {(question.answers ?? []).map((answer) => {
        const id = getAnswerId(answer)
        const isSelected = selectedIds.includes(id)
        const state = getAnswerState(answer, isSelected, revealCorrect)
        const isTrue = answer.text.toLowerCase().includes('verdadero') || answer.text.toLowerCase() === 'true'
        return (
          <button
            key={id}
            id={`answer-${id}`}
            onClick={() => !disabled && onSelect(id)}
            disabled={disabled}
            className={`flex flex-col items-center justify-center gap-3 p-6 rounded-2xl border transition-all duration-200 ${
              state === 'default' ? 'border-white/10 bg-white/5 hover:border-white/25 hover:bg-white/10' :
              state === 'selected' ? 'border-[--color-primary] bg-[--color-primary]/20 shadow-md shadow-[--color-primary]/10 scale-[1.02]' :
              state === 'correct' ? 'border-green-500 bg-green-500/20 text-green-100' :
              state === 'wrong' ? 'border-red-500 bg-red-500/20 text-red-100' :
              'border-yellow-500/50 bg-yellow-500/10 text-yellow-100 border-dashed'
            }`}
            aria-pressed={isSelected}
          >
            <span className={`text-4xl font-extrabold ${isTrue ? 'text-green-400' : 'text-red-400'}`}>
              {isTrue ? 'V' : 'F'}
            </span>
            <span className="font-bold text-[--color-text] text-xl uppercase tracking-wider">{answer.text}</span>
          </button>
        )
      })}
    </div>
  )
}

// ---------------------------------------------------------------------------
// ShortAnswer
// ---------------------------------------------------------------------------

interface ShortAnswerProps {
  value: string
  onChange: (text: string) => void
  disabled?: boolean
  revealCorrect?: boolean
  correctAnswers?: string[]
  isCorrect?: boolean
}

export function ShortAnswerInput({ value, onChange, disabled, revealCorrect, correctAnswers, isCorrect }: ShortAnswerProps) {
  return (
    <div className="flex flex-col gap-3">
      <input
        id="short-answer-input"
        type="text"
        value={value}
        onChange={e => onChange(e.target.value)}
        disabled={disabled}
        placeholder="Escribe tu respuesta aquí..."
        className={`w-full p-4 rounded-xl border-2 bg-black/20 text-[--color-text] text-lg font-medium transition-colors outline-none focus:border-[--color-primary] ${
          revealCorrect 
            ? (isCorrect ? 'border-green-500 text-green-300' : 'border-red-500 text-red-300')
            : 'border-white/10 hover:border-white/30'
        }`}
        autoComplete="off"
        spellCheck={false}
      />
      {revealCorrect && correctAnswers && (
        <div className={`p-4 rounded-xl border ${isCorrect ? 'border-green-500/30 bg-green-500/10' : 'border-red-500/30 bg-red-500/10'}`}>
          <p className={`font-semibold ${isCorrect ? 'text-green-400' : 'text-red-400'}`}>
            {isCorrect ? '✓ ¡Respuesta correcta!' : '✗ Respuesta incorrecta'}
          </p>
          {!isCorrect && (
            <p className="text-[--color-text]/70 text-sm mt-1">
              Respuestas aceptadas: <span className="font-bold text-[--color-text]">{correctAnswers.join(' / ')}</span>
            </p>
          )}
        </div>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// DragAndDropOrder
// ---------------------------------------------------------------------------

interface DragAndDropOrderProps {
  items: string[]
  onReorder: (items: string[]) => void
  disabled?: boolean
  revealCorrect?: boolean
  correctOrder?: string[]
}

export function DragAndDropOrder({ items, onReorder, disabled, revealCorrect, correctOrder }: DragAndDropOrderProps) {
  const dragItem = useRef<number | null>(null)
  const dragOverItem = useRef<number | null>(null)

  function handleDragStart(index: number) { dragItem.current = index }
  function handleDragEnter(index: number) { dragOverItem.current = index }
  function handleDragEnd() {
    if (dragItem.current === null || dragOverItem.current === null) return
    const next = [...items]
    const dragged = next.splice(dragItem.current, 1)[0]
    next.splice(dragOverItem.current, 0, dragged)
    dragItem.current = null
    dragOverItem.current = null
    onReorder(next)
  }

  return (
    <div className="flex flex-col gap-2">
      {items.map((item, index) => {
        const isInCorrectPosition = revealCorrect && correctOrder ? item === correctOrder[index] : null
        return (
          <div
            key={item}
            draggable={!disabled}
            onDragStart={() => handleDragStart(index)}
            onDragEnter={() => handleDragEnter(index)}
            onDragEnd={handleDragEnd}
            onDragOver={e => e.preventDefault()}
            className={`flex items-center gap-4 p-4 rounded-xl border transition-all ${
              disabled ? 'cursor-not-allowed opacity-80' : 'cursor-grab active:cursor-grabbing hover:bg-white/10'
            } ${
              isInCorrectPosition === true ? 'border-green-500 bg-green-500/20' :
              isInCorrectPosition === false ? 'border-red-500 bg-red-500/20' :
              'border-white/10 bg-white/5'
            }`}
          >
            <span className="text-white/30 cursor-grab text-xl" aria-hidden="true">⠿</span>
            <span className="flex items-center justify-center w-8 h-8 rounded-full bg-black/40 text-sm font-bold text-[--color-primary]">
              {index + 1}
            </span>
            <span className="font-medium text-[--color-text] text-lg flex-1">{item}</span>
            {isInCorrectPosition === true && <span className="text-green-400 font-bold text-xl">✓</span>}
            {isInCorrectPosition === false && <span className="text-red-400 font-bold text-xl">✗</span>}
          </div>
        )
      })}
    </div>
  )
}
