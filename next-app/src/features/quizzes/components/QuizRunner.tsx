'use client'

import { useState } from 'react'
import type { Quiz } from '@/features/quizzes/interfaces/quiz'
import { useQuiz } from '@/features/quizzes/hooks/useQuiz'
import type { QuizConfig } from '@/features/quizzes/hooks/useQuiz'
import { scoreQuestion } from '@/features/quizzes/utils/quizEngine'
import QuizLobby from './QuizLobby'
import QuizConfigPanel from './QuizConfigPanel'
import QuestionCard from './QuestionCard'
import QuizResultScreen from './QuizResultScreen'

interface QuizRunnerProps {
  quiz: Quiz
}

export default function QuizRunner({ quiz }: QuizRunnerProps) {
  const {
    phase,
    questions,
    currentIndex,
    currentQuestion,
    pendingAnswer,
    userAnswers,
    quizResult,
    timeLeft,
    startQuiz,
    selectSingleAnswer,
    toggleMultiAnswer,
    setShortAnswer,
    reorderItems,
    submitAnswer,
    timeOut,
    nextQuestion,
    resetQuiz,
    showCorrectAnswers,
  } = useQuiz(quiz)

  const [uiPhase, setUiPhase] = useState<'lobby' | 'config' | 'playing'>('lobby')

  // ---- LOBBY -------------------------------------------------------
  if (uiPhase === 'lobby') {
    return (
      <QuizLobby
        quiz={quiz}
        hasActiveSession={phase !== 'idle'}
        onResume={() => setUiPhase('playing')}
        onQuickStart={() => {
          if (phase !== 'idle') resetQuiz()
          startQuiz()          // uses quiz defaults, no overrides
          setUiPhase('playing')
        }}
        onConfigure={() => {
          if (phase !== 'idle') resetQuiz()
          setUiPhase('config')
        }}
      />
    )
  }

  // ---- CONFIG SCREEN -------------------------------------------------------
  if (uiPhase === 'config') {
    return (
      <QuizConfigPanel
        quiz={quiz}
        onBack={() => setUiPhase('lobby')}
        onStart={(config: QuizConfig) => {
          startQuiz(config)
          setUiPhase('playing')
        }}
      />
    )
  }

  // ---- FINISHED -----------------------------------------------------------
  if (phase === 'finished' && quizResult && uiPhase === 'playing') {
    return (
      <QuizResultScreen
        result={quizResult}
        showCorrectAnswers={showCorrectAnswers}
        onRestart={() => {
          resetQuiz()
          setUiPhase('lobby')
        }}
      />
    )
  }

  // ---- ACTIVE QUESTION (input or reveal) ----------------------------------
  if (!currentQuestion || uiPhase !== 'playing') return null

  const isReveal = phase === 'question_result'
  // Only show correct answers in feedback if the user enabled it
  const revealCorrect = isReveal && showCorrectAnswers

  const submittedAnswer = isReveal ? (userAnswers[currentIndex] ?? null) : null
  const questionResult = isReveal && submittedAnswer
    ? scoreQuestion(currentQuestion, submittedAnswer)
    : null

  return (
    <div className="relative min-h-screen w-full flex flex-col items-center py-10 px-4 gap-6 overflow-hidden">
      {/* Ambient glow */}
      <div 
        className="pointer-events-none fixed inset-0 -z-10"
        style={{ background: 'radial-gradient(ellipse 70% 40% at 50% -20%, color-mix(in srgb, var(--color-primary) 10%, transparent), transparent 70%)' }}
      />

      {/* Progress bar fixed at the top */}
      <div className="fixed top-0 left-0 w-full h-1.5 bg-black/30 z-50">
        <div
          className="h-full bg-[--color-primary] transition-all duration-500 ease-out shadow-[0_0_10px_var(--color-primary)]"
          style={{ width: `${((currentIndex + (isReveal ? 1 : 0)) / questions.length) * 100}%` }}
        />
      </div>

      <div className="w-full max-w-3xl flex-1 flex flex-col z-10 gap-6">
        <QuestionCard
          question={currentQuestion}
          questionNumber={currentIndex + 1}
          totalQuestions={questions.length}
          pendingAnswer={isReveal ? submittedAnswer : pendingAnswer}
          timeLeft={isReveal ? null : timeLeft}
          revealCorrect={revealCorrect}
          onSelectSingle={selectSingleAnswer}
          onToggleMulti={toggleMultiAnswer}
          onShortAnswer={setShortAnswer}
          onReorder={reorderItems}
          onSubmit={submitAnswer}
          onTimeOut={timeOut}
        />

        {/* After-answer feedback bar */}
        {isReveal && questionResult && (
          <div
            className={`w-full rounded-3xl border border-white/10 backdrop-blur-xl shadow-2xl overflow-hidden animate-slide-up ${
              questionResult.isCorrect 
                ? 'bg-green-500/10 shadow-[0_10px_40px_rgba(34,197,94,0.1)]' 
                : 'bg-red-500/10 shadow-[0_10px_40px_rgba(239,68,68,0.1)]'
            }`}
          >
            <div className="p-6 sm:px-8 flex flex-col sm:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-5 w-full sm:w-auto">
                <span className={`flex items-center justify-center w-14 h-14 shrink-0 rounded-full text-3xl shadow-lg ${
                  questionResult.isCorrect ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                }`}>
                  {questionResult.isCorrect ? '🎉' : '😞'}
                </span>
                <div className="flex flex-col">
                  <p className={`text-2xl font-black tracking-wide uppercase ${
                    questionResult.isCorrect ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {questionResult.isCorrect ? '¡Correcto!' : 'Incorrecto'}
                  </p>
                  <p className="text-[--color-text]/80 font-medium mt-0.5">
                    {questionResult.earnedPoints > 0
                      ? `+${questionResult.earnedPoints} puntos conseguidos`
                      : 'Sin puntos'}
                  </p>
                </div>
              </div>
              <button
                id="btn-next-question"
                onClick={nextQuestion}
                className={`w-full sm:w-auto px-8 py-4 rounded-2xl font-extrabold text-lg text-[--color-bg] hover:brightness-110 active:scale-95 transition-all shadow-lg shrink-0 ${
                  questionResult.isCorrect ? 'bg-green-400 shadow-green-500/20' : 'bg-red-400 shadow-red-500/20'
                }`}
              >
                {currentIndex + 1 < questions.length ? 'Siguiente →' : 'Ver resultados →'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
