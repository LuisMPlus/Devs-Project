'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import type { Quiz, Question } from '../interfaces/quiz'
import type { UserAnswer, QuizResult, QuestionResult } from '../utils/quizEngine'
import { resolveQuestions, scoreQuestion, computeQuizResult, getAnswerId } from '../utils/quizEngine'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type QuizPhase = 'idle' | 'question' | 'question_result' | 'finished'

/** User-overridable subset of Quiz settings chosen in the config screen. */
export interface QuizConfig {
  randomizeQuestions?: boolean
  randomizeAnswers?: boolean
  timeMode?: Quiz['timeMode']
  scoringMode?: Quiz['scoringMode']
  /** Override questionPool.pick (only relevant when quiz has a pool). */
  pickCount?: number
  /** When to show the result of each answer: after each question or only at the end. */
  reviewMode?: 'per_question' | 'end'
  /** Whether to reveal the correct answer(s) during feedback. */
  showCorrectAnswers?: boolean
}

/** Shape of what gets persisted to sessionStorage. */
interface PersistedSession {
  quizId: string
  phase: QuizPhase
  activeConfig: QuizConfig | null
  questions: Question[]
  currentIndex: number
  userAnswers: UserAnswer[]
  pendingAnswer: UserAnswer | null
  quizResult: QuizResult | null
}

export interface QuizState {
  phase: QuizPhase
  /** The config the user chose before starting (null if quiz hasn't started yet). */
  activeConfig: QuizConfig | null
  questions: Question[]
  currentIndex: number
  currentQuestion: Question | null
  userAnswers: UserAnswer[]
  pendingAnswer: UserAnswer | null
  quizResult: QuizResult | null
  /** Remaining seconds for current question (null if no per-question timer). */
  timeLeft: number | null
  /** Whether to reveal correct answers during per-question feedback. */
  showCorrectAnswers: boolean
}

export interface QuizActions {
  startQuiz: (config?: QuizConfig) => void
  /** For Single / TrueOrFalse: set exactly one answer */
  selectSingleAnswer: (answerId: string) => void
  /** For MultipleChoice: toggle an answer in/out */
  toggleMultiAnswer: (answerId: string) => void
  /** For ShortAnswer */
  setShortAnswer: (text: string) => void
  /** For DragAndDropOrder */
  reorderItems: (items: string[]) => void
  /** Submit the current pending answer */
  submitAnswer: () => void
  /** Skip / time-out the current question */
  timeOut: () => void
  /** After seeing the per-question result, advance to the next question */
  nextQuestion: () => void
  resetQuiz: () => void
}

// ---------------------------------------------------------------------------
// sessionStorage helpers
// ---------------------------------------------------------------------------

function sessionKey(quizId: string) {
  return `quiz_session_${quizId}`
}

function saveSession(quizId: string, data: PersistedSession) {
  try {
    sessionStorage.setItem(sessionKey(quizId), JSON.stringify(data))
  } catch {
    // sessionStorage unavailable (SSR, private mode, etc.) — silently skip
  }
}

function loadSession(quizId: string): PersistedSession | null {
  try {
    const raw = sessionStorage.getItem(sessionKey(quizId))
    if (!raw) return null
    const parsed = JSON.parse(raw) as PersistedSession
    // Guard: only restore if same quiz
    if (parsed.quizId !== quizId) return null
    return parsed
  } catch {
    return null
  }
}

function clearSession(quizId: string) {
  try {
    sessionStorage.removeItem(sessionKey(quizId))
  } catch { /* noop */ }
}

export function saveConfigPref(quizId: string, config: QuizConfig) {
  try {
    localStorage.setItem(`quiz_config_pref_${quizId}`, JSON.stringify(config))
  } catch { /* noop */ }
}

export function loadConfigPref(quizId: string): QuizConfig | null {
  try {
    const raw = localStorage.getItem(`quiz_config_pref_${quizId}`)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function useQuiz(quiz: Quiz): QuizState & QuizActions {
  const [phase,          setPhase]          = useState<QuizPhase>('idle')
  const [activeConfig,   setActiveConfig]   = useState<QuizConfig | null>(null)
  const [questions,      setQuestions]      = useState<Question[]>([])
  const [currentIndex,   setCurrentIndex]   = useState(0)
  const [userAnswers,    setUserAnswers]     = useState<UserAnswer[]>([])
  const [pendingAnswer,  setPendingAnswer]   = useState<UserAnswer | null>(null)
  const [quizResult,     setQuizResult]      = useState<QuizResult | null>(null)
  const [timeLeft,       setTimeLeft]        = useState<number | null>(null)
  const [isInitialized,  setIsInitialized]   = useState(false)

  const quizStartTimeRef    = useRef<number>(0)
  const questionStartTimeRef = useRef<number>(0)
  const timerRef            = useRef<ReturnType<typeof setInterval> | null>(null)

  const currentQuestion = questions[currentIndex] ?? null

  // ── Rehydrate from sessionStorage on first mount ────────────────────────
  useEffect(() => {
    const session = loadSession(quiz.id)
    if (session && session.phase !== 'idle') {
      setPhase(session.phase)
      setActiveConfig(session.activeConfig)
      setQuestions(session.questions)
      setCurrentIndex(session.currentIndex)
      setUserAnswers(session.userAnswers)
      setPendingAnswer(session.pendingAnswer)
      setQuizResult(session.quizResult)
      // Timer is NOT restored
      quizStartTimeRef.current = Date.now()
      questionStartTimeRef.current = Date.now()
    }
    setIsInitialized(true)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ── Persist to sessionStorage on every meaningful state change ──────────
  useEffect(() => {
    if (phase === 'idle') return // nothing to persist in idle
    saveSession(quiz.id, {
      quizId: quiz.id,
      phase,
      activeConfig,
      questions,
      currentIndex,
      userAnswers,
      pendingAnswer,
      quizResult,
    })
  }, [quiz.id, phase, activeConfig, questions, currentIndex, userAnswers, pendingAnswer, quizResult])

  // ── Timer ─────────────────────────────────────────────────────────────────

  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
  }, [])

  const startTimer = useCallback((seconds: number) => {
    stopTimer()
    setTimeLeft(seconds)
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev === null || prev <= 1) {
          stopTimer()
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }, [stopTimer])

  // Auto-submit when timer reaches 0
  useEffect(() => {
    if (timeLeft === 0 && phase === 'question') {
      handleTimeOut()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeLeft, phase])

  // Cleanup timer on unmount
  useEffect(() => () => stopTimer(), [stopTimer])

  // ── Actions ───────────────────────────────────────────────────────────────

  const startQuiz = useCallback((config?: QuizConfig) => {
    // If no explicit config provided (e.g. Quick Start), try to load saved preference
    const cfg = config ?? loadConfigPref(quiz.id) ?? {}
    saveConfigPref(quiz.id, cfg)

    // Merge user config overrides onto the base quiz
    const effectiveQuiz: Quiz = {
      ...quiz,
      ...(cfg.randomizeQuestions !== undefined && { randomizeQuestions: cfg.randomizeQuestions }),
      ...(cfg.randomizeAnswers   !== undefined && { randomizeAnswers:   cfg.randomizeAnswers }),
      ...(cfg.timeMode           !== undefined && { timeMode:           cfg.timeMode }),
      ...(cfg.scoringMode        !== undefined && { scoringMode:        cfg.scoringMode }),
      ...(cfg.pickCount !== undefined && quiz.questionPool
        ? { questionPool: { ...quiz.questionPool, pick: cfg.pickCount } }
        : {}),
    }

    const resolved = resolveQuestions(effectiveQuiz)
    // Slice to pickCount if the user chose fewer questions than available
    const finalQuestions = cfg.pickCount && cfg.pickCount < resolved.length
      ? resolved.slice(0, cfg.pickCount)
      : resolved

    setActiveConfig(cfg)
    setQuestions(finalQuestions)
    setCurrentIndex(0)
    setUserAnswers([])
    setQuizResult(null)
    quizStartTimeRef.current = Date.now()
    setPhase('question')

    const firstQ = finalQuestions[0]
    const timeMode = effectiveQuiz.timeMode ?? (firstQ?.timeLimit ? 'per_question' : undefined)
    if (timeMode === 'per_question' && firstQ?.timeLimit && effectiveQuiz.timeMode !== 'none') {
      questionStartTimeRef.current = Date.now()
      startTimer(firstQ.timeLimit)
    } else {
      setTimeLeft(null)
    }
  }, [quiz, startTimer])

  const buildBlankAnswer = useCallback((question: Question): UserAnswer => {
    if (question.type === 'DragAndDropOrder') {
      const items = (question.answers ?? []).map(a => a.text)
      for (let i = items.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1))
        ;[items[i], items[j]] = [items[j], items[i]]
      }
      return { questionId: question.id, orderedItems: items }
    }
    if (question.type === 'ShortAnswer') {
      return { questionId: question.id, shortAnswerText: '' }
    }
    return { questionId: question.id, selectedAnswerIds: [] }
  }, [])

  // Lazy-init pending answer when entering a new question
  useEffect(() => {
    if (phase === 'question' && currentQuestion) {
      setPendingAnswer(prev => {
        if (prev?.questionId === currentQuestion.id) return prev
        return buildBlankAnswer(currentQuestion)
      })
    }
  }, [phase, currentQuestion, buildBlankAnswer])

  const selectSingleAnswer = useCallback((answerId: string) => {
    setPendingAnswer(prev => prev ? { ...prev, selectedAnswerIds: [answerId] } : prev)
  }, [])

  const toggleMultiAnswer = useCallback((answerId: string) => {
    setPendingAnswer(prev => {
      if (!prev) return prev
      const current = prev.selectedAnswerIds ?? []
      const next = current.includes(answerId)
        ? current.filter(id => id !== answerId)
        : [...current, answerId]
      return { ...prev, selectedAnswerIds: next }
    })
  }, [])

  const setShortAnswer = useCallback((text: string) => {
    setPendingAnswer(prev => prev ? { ...prev, shortAnswerText: text } : prev)
  }, [])

  const reorderItems = useCallback((items: string[]) => {
    setPendingAnswer(prev => prev ? { ...prev, orderedItems: items } : prev)
  }, [])

  const finalizeAnswer = useCallback((answer: UserAnswer) => {
    const timeTakenMs = Date.now() - questionStartTimeRef.current
    const finalAnswer = { ...answer, timeTakenMs }
    stopTimer()

    // If reviewMode is 'end', skip the question_result phase
    if (activeConfig?.reviewMode === 'end') {
      // Update answers and immediately advance (via setState batch)
      setUserAnswers(prev => {
        const next = [...prev, finalAnswer]
        // Calculate if this was the last question
        const nextIndex = currentIndex + 1
        if (nextIndex >= questions.length) {
          // Done — compute result
          const results: QuestionResult[] = questions.map((q, i) => {
            const ua = next[i] ?? { questionId: q.id, timedOut: true }
            return scoreQuestion(q, ua)
          })
          const totalTime = Date.now() - quizStartTimeRef.current
          setQuizResult(computeQuizResult(quiz, results, totalTime))
          setPhase('finished')
        } else {
          setCurrentIndex(nextIndex)
          setPhase('question')
          // Restart timer for next question
          const nextQ = questions[nextIndex]
          const timeMode = (activeConfig?.timeMode ?? quiz.timeMode) ?? (nextQ?.timeLimit ? 'per_question' : undefined)
          if (timeMode === 'per_question' && nextQ?.timeLimit && activeConfig?.timeMode !== 'none') {
            questionStartTimeRef.current = Date.now()
            startTimer(nextQ.timeLimit)
          } else {
            setTimeLeft(null)
          }
        }
        return next
      })
      setPendingAnswer(null)
    } else {
      // Default: show question_result phase
      setUserAnswers(prev => [...prev, finalAnswer])
      setPendingAnswer(null)
      setPhase('question_result')
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeConfig, currentIndex, questions, quiz, startTimer, stopTimer])

  const handleTimeOut = useCallback(() => {
    stopTimer()
    if (!currentQuestion) return
    finalizeAnswer({
      questionId: currentQuestion.id,
      timedOut: true,
      timeTakenMs: currentQuestion.timeLimit ? currentQuestion.timeLimit * 1000 : 0,
    })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentQuestion, stopTimer])

  const submitAnswer = useCallback(() => {
    if (!pendingAnswer || !currentQuestion) return
    finalizeAnswer(pendingAnswer)
  }, [pendingAnswer, currentQuestion, finalizeAnswer])

  const timeOut = useCallback(() => handleTimeOut(), [handleTimeOut])

  const nextQuestion = useCallback(() => {
    const nextIndex = currentIndex + 1

    if (nextIndex >= questions.length) {
      // Quiz finished — compute result using the effective quiz (config already merged in startQuiz)
      const results: QuestionResult[] = questions.map((q, i) => {
        const ua = userAnswers[i] ?? { questionId: q.id, timedOut: true }
        return scoreQuestion(q, ua)
      })
      const totalTime = Date.now() - quizStartTimeRef.current
      setQuizResult(computeQuizResult(quiz, results, totalTime))
      setPhase('finished')
      return
    }

    setCurrentIndex(nextIndex)
    setPhase('question')

    const nextQ = questions[nextIndex]
    const timeMode = (activeConfig?.timeMode ?? quiz.timeMode) ?? (nextQ?.timeLimit ? 'per_question' : undefined)
    if (timeMode === 'per_question' && nextQ?.timeLimit && activeConfig?.timeMode !== 'none') {
      questionStartTimeRef.current = Date.now()
      startTimer(nextQ.timeLimit)
    } else {
      setTimeLeft(null)
    }
  }, [currentIndex, questions, userAnswers, quiz, activeConfig, startTimer])

  const resetQuiz = useCallback(() => {
    stopTimer()
    clearSession(quiz.id)
    setPhase('idle')
    setActiveConfig(null)
    setQuestions([])
    setCurrentIndex(0)
    setUserAnswers([])
    setPendingAnswer(null)
    setQuizResult(null)
    setTimeLeft(null)
  }, [stopTimer, quiz.id])

  return {
    // State
    phase,
    activeConfig,
    questions,
    currentIndex,
    currentQuestion,
    userAnswers,
    pendingAnswer,
    quizResult,
    timeLeft,
    // Derived config
    showCorrectAnswers: activeConfig?.showCorrectAnswers ?? true,
    // Actions
    startQuiz,
    selectSingleAnswer,
    toggleMultiAnswer,
    setShortAnswer,
    reorderItems,
    submitAnswer,
    timeOut,
    nextQuestion,
    resetQuiz
  }
}

// Re-export getAnswerId so components don't need to import from utils directly
export { getAnswerId }
