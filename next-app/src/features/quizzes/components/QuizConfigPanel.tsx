'use client'

import { useForm, Controller } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import type { Quiz } from '@/features/quizzes/interfaces/quiz'
import type { QuizConfig } from '@/features/quizzes/hooks/useQuiz'
import { loadConfigPref } from '@/features/quizzes/hooks/useQuiz'

// ---------------------------------------------------------------------------
// Schema
// ---------------------------------------------------------------------------
const configSchema = z.object({
  randomizeQuestions: z.string(),
  randomizeAnswers:   z.string(),
  timeMode:    z.enum(['per_question', 'global', 'none']),
  scoringMode: z.enum(['standard', 'kahoot']),
  pickCount:   z.number().int().min(1),
  reviewMode:          z.enum(['per_question', 'end']),
  showCorrectAnswers:  z.string(),
})

type ConfigFormValues = z.infer<typeof configSchema>

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------
interface QuizConfigPanelProps {
  quiz: Quiz
  onStart: (config: QuizConfig) => void
  onBack: () => void
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export default function QuizConfigPanel({ quiz, onStart, onBack }: QuizConfigPanelProps) {
  const totalQuestions = quiz.questionPool?.questions.length ?? quiz.questions?.length ?? 0
  const defaultPick    = quiz.questionPool?.pick ?? totalQuestions
  const hasTimers      = (quiz.questions ?? quiz.questionPool?.questions ?? []).some(q => !!q.timeLimit)

  const defaultTimeMode =
    quiz.timeMode === 'per_question' ? 'per_question'
    : quiz.timeMode === 'global'    ? 'global'
    : 'none'

  const pref = loadConfigPref(quiz.id)

  const { register, control, handleSubmit, watch, formState: { errors } } = useForm<ConfigFormValues>({
    resolver: zodResolver(configSchema),
    defaultValues: {
      randomizeQuestions: String(pref?.randomizeQuestions ?? quiz.randomizeQuestions ?? false),
      randomizeAnswers:   String(pref?.randomizeAnswers   ?? quiz.randomizeAnswers   ?? false),
      timeMode:           pref?.timeMode ?? defaultTimeMode,
      scoringMode:        pref?.scoringMode ?? quiz.scoringMode ?? 'standard',
      pickCount:          pref?.pickCount ?? defaultPick,
      reviewMode:         pref?.reviewMode ?? 'per_question',
      showCorrectAnswers: String(pref?.showCorrectAnswers ?? true),
    },
  })

  const pickCount          = watch('pickCount')
  const randQuestions      = watch('randomizeQuestions')
  const randAnswers        = watch('randomizeAnswers')
  const selectedTimeMode   = watch('timeMode')
  const selectedScoring    = watch('scoringMode')
  const selectedReview     = watch('reviewMode')
  const selectedShowAnswers = watch('showCorrectAnswers')

  function onSubmit(values: ConfigFormValues) {
    onStart({
      randomizeQuestions:  values.randomizeQuestions === 'true',
      randomizeAnswers:    values.randomizeAnswers   === 'true',
      timeMode:            values.timeMode,
      scoringMode:         values.scoringMode,
      pickCount:           values.pickCount,
      reviewMode:          values.reviewMode,
      showCorrectAnswers:  values.showCorrectAnswers === 'true',
    })
  }

  return (
    <div className="relative min-h-screen w-full flex flex-col items-center py-10 px-4">

      {/* Ambient glow */}
      <div className="pointer-events-none fixed inset-0 -z-10"
        style={{ background: 'radial-gradient(ellipse 60% 40% at 50% 0%, color-mix(in srgb, var(--color-primary) 12%, transparent), transparent 70%)' }}
      />

      <div className="w-full max-w-2xl flex flex-col gap-8">

        {/* Back button */}
        <button
          type="button"
          onClick={onBack}
          id="btn-config-back"
          className="self-start flex items-center gap-2 text-sm font-semibold text-[--color-primary] hover:opacity-70 transition-opacity"
        >
          ← Volver al lobby
        </button>

        {/* Header */}
        <div className="text-center flex flex-col items-center gap-3">
          <span className="inline-block px-3 py-1 rounded-full text-xs font-bold tracking-widest uppercase border border-[--color-primary]/40 text-[--color-primary] bg-[--color-primary]/10">
            Configuración
          </span>
          <h1 className="text-3xl font-extrabold text-[--color-text]">{quiz.title}</h1>
          <p className="text-sm text-[--color-text]/60">Personaliza cómo quieres jugar antes de comenzar.</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">

          {/* ── Cantidad de preguntas ──────────────────────────────── */}
          {totalQuestions > 1 && (
            <Section title="Cantidad de preguntas" icon="❓">
              <Controller
                name="pickCount"
                control={control}
                render={({ field }) => (
                  <div className="flex flex-col gap-3">
                    {/* Slider value display */}
                    <div className="flex items-end justify-between">
                      <span className="text-sm text-[--color-text]/60">Preguntas a responder</span>
                      <div className="flex items-baseline gap-1">
                        <span className="text-3xl font-extrabold text-[--color-primary]">{pickCount}</span>
                        <span className="text-sm text-[--color-text]/40">/ {totalQuestions}</span>
                      </div>
                    </div>
                    {/* Slider */}
                    <input
                      id="config-pick-count"
                      type="range"
                      min={1}
                      max={totalQuestions}
                      {...field}
                      onChange={e => field.onChange(Number(e.target.value))}
                      className="w-full h-2 rounded-full cursor-pointer accent-[--color-primary]"
                    />
                    {/* Min / Max labels */}
                    <div className="flex justify-between text-xs text-[--color-text]/30">
                      <span>1</span>
                      <span>{totalQuestions}</span>
                    </div>
                  </div>
                )}
              />
              {errors.pickCount && <ErrorMsg>{errors.pickCount.message}</ErrorMsg>}
            </Section>
          )}

          {/* ── Orden de preguntas ─────────────────────────────────── */}
          <Section title="Orden de preguntas" icon="🔀">
            <div className="grid grid-cols-2 gap-3">
              {([
                { value: 'false', label: 'En orden',  icon: '↕', desc: 'Las preguntas siguen el orden original.' },
                { value: 'true',  label: 'Aleatorio', icon: '🎲', desc: 'Cada sesión tiene un orden diferente.' },
              ] as const).map(opt => {
                const isActive = randQuestions === opt.value
                return (
                  <label
                    key={opt.value}
                    htmlFor={`order-${opt.value}`}
                    className={[
                      'flex flex-col gap-2 p-4 rounded-xl border cursor-pointer transition-all duration-200',
                      isActive
                        ? 'border-[--color-primary] bg-[--color-primary]/15 shadow-md shadow-[--color-primary]/20 scale-[1.02]'
                        : 'border-white/10 bg-white/5 hover:border-white/25 hover:bg-white/8',
                    ].join(' ')}
                  >
                    <input
                      id={`order-${opt.value}`}
                      type="radio"
                      className="sr-only"
                      {...register('randomizeQuestions')}
                      value={opt.value}
                    />
                    <span className="text-2xl">{opt.icon}</span>
                    <p className={`text-sm font-bold ${isActive ? 'text-[--color-primary]' : 'text-[--color-text]'}`}>{opt.label}</p>
                    <p className="text-xs text-[--color-text]/50 leading-relaxed">{opt.desc}</p>
                    {isActive && (
                      <span className="mt-1 self-start text-[10px] font-bold uppercase tracking-widest text-[--color-primary] bg-[--color-primary]/20 px-2 py-0.5 rounded-full">
                        Seleccionado
                      </span>
                    )}
                  </label>
                )
              })}
            </div>
          </Section>

          {/* ── Orden de respuestas ─────────────────────────────────── */}
          <Section title="Orden de respuestas" icon="◈">
            <div className="grid grid-cols-2 gap-3">
              {([
                { value: 'false', label: 'Fijas',      icon: '☰', desc: 'Las opciones siempre aparecen en el mismo orden.' },
                { value: 'true',  label: 'Aleatorias', icon: '🎲', desc: 'Las opciones se mezclan en cada pregunta.' },
              ] as const).map(opt => {
                const isActive = randAnswers === opt.value
                return (
                  <label
                    key={opt.value}
                    htmlFor={`ans-order-${opt.value}`}
                    className={[
                      'flex flex-col gap-2 p-4 rounded-xl border cursor-pointer transition-all duration-200',
                      isActive
                        ? 'border-[--color-secondary] bg-[--color-secondary]/15 shadow-md shadow-[--color-secondary]/20 scale-[1.02]'
                        : 'border-white/10 bg-white/5 hover:border-white/25 hover:bg-white/8',
                    ].join(' ')}
                  >
                    <input
                      id={`ans-order-${opt.value}`}
                      type="radio"
                      className="sr-only"
                      {...register('randomizeAnswers')}
                      value={opt.value}
                    />
                    <span className="text-2xl">{opt.icon}</span>
                    <p className={`text-sm font-bold ${isActive ? 'text-[--color-secondary]' : 'text-[--color-text]'}`}>{opt.label}</p>
                    <p className="text-xs text-[--color-text]/50 leading-relaxed">{opt.desc}</p>
                    {isActive && (
                      <span className="mt-1 self-start text-[10px] font-bold uppercase tracking-widest text-[--color-secondary] bg-[--color-secondary]/20 px-2 py-0.5 rounded-full">
                        Seleccionado
                      </span>
                    )}
                  </label>
                )
              })}
            </div>
          </Section>

          {/* ── Modo de tiempo ─────────────────────────────────────── */}
          {hasTimers && (
            <Section title="Modo de tiempo" icon="⏱">
              <div className="flex flex-col gap-2">
                {([
                  { value: 'none',         label: 'Sin tiempo',     desc: 'Responde sin presión.' },
                  { value: 'per_question', label: 'Por pregunta',   desc: 'Cada pregunta tiene su propio temporizador.' },
                  { value: 'global',       label: 'Tiempo global',  desc: 'Un solo cronómetro para todo el quiz.' },
                ] as const).map(opt => (
                  <label
                    key={opt.value}
                    htmlFor={`time-mode-${opt.value}`}
                    className="flex items-center gap-4 p-3 rounded-xl border border-white/10 bg-white/5 cursor-pointer hover:border-[--color-primary]/40 transition-colors has-[:checked]:border-[--color-primary]/70 has-[:checked]:bg-[--color-primary]/10"
                  >
                    <input
                      id={`time-mode-${opt.value}`}
                      type="radio"
                      value={opt.value}
                      {...register('timeMode')}
                      className="accent-[--color-primary] w-4 h-4 shrink-0"
                    />
                    <div>
                      <p className="text-sm font-semibold text-[--color-text]">{opt.label}</p>
                      <p className="text-xs text-[--color-text]/50">{opt.desc}</p>
                    </div>
                  </label>
                ))}
              </div>
              {errors.timeMode && <ErrorMsg>{errors.timeMode.message}</ErrorMsg>}
            </Section>
          )}

          {/* ── Puntuación ─────────────────────────────────────────── */}
          <Section title="Modo de puntuación" icon="⭐">
            <div className="flex flex-col gap-2">
              {([
                { value: 'standard', label: 'Estándar', desc: 'Puntos fijos por respuesta correcta.' },
                { value: 'kahoot',   label: 'Kahoot',   desc: 'Más puntos cuanto más rápido respondas.' },
              ] as const).map(opt => (
                <label
                  key={opt.value}
                  htmlFor={`scoring-mode-${opt.value}`}
                  className="flex items-center gap-4 p-3 rounded-xl border border-white/10 bg-white/5 cursor-pointer hover:border-[--color-primary]/40 transition-colors has-[:checked]:border-[--color-primary]/70 has-[:checked]:bg-[--color-primary]/10"
                >
                  <input
                    id={`scoring-mode-${opt.value}`}
                    type="radio"
                    value={opt.value}
                    {...register('scoringMode')}
                    className="accent-[--color-primary] w-4 h-4 shrink-0"
                  />
                  <div>
                    <p className="text-sm font-semibold text-[--color-text]">{opt.label}</p>
                    <p className="text-xs text-[--color-text]/50">{opt.desc}</p>
                  </div>
                </label>
              ))}
            </div>
            {errors.scoringMode && <ErrorMsg>{errors.scoringMode.message}</ErrorMsg>}
          </Section>

          {/* ── Verificación de respuesta ────────────────────────────── */}
          <Section title="Verificar respuesta" icon="✅">
            <div className="grid grid-cols-2 gap-3">
              {([
                { value: 'per_question', label: 'Tras cada pregunta', icon: '🔍', desc: 'Ves si acertaste antes de continuar.' },
                { value: 'end',         label: 'Al finalizar',       icon: '🏁', desc: 'Los resultados se muestran al terminar el quiz.' },
              ] as const).map(opt => {
                const isActive = selectedReview === opt.value
                return (
                  <label
                    key={opt.value}
                    htmlFor={`review-mode-${opt.value}`}
                    className={[
                      'flex flex-col gap-2 p-4 rounded-xl border cursor-pointer transition-all duration-200',
                      isActive
                        ? 'border-[--color-primary] bg-[--color-primary]/15 shadow-md shadow-[--color-primary]/20 scale-[1.02]'
                        : 'border-white/10 bg-white/5 hover:border-white/25 hover:bg-white/8',
                    ].join(' ')}
                  >
                    <input
                      id={`review-mode-${opt.value}`}
                      type="radio"
                      className="sr-only"
                      {...register('reviewMode')}
                      value={opt.value}
                    />
                    <span className="text-2xl">{opt.icon}</span>
                    <p className={`text-sm font-bold ${isActive ? 'text-[--color-primary]' : 'text-[--color-text]'}`}>{opt.label}</p>
                    <p className="text-xs text-[--color-text]/50 leading-relaxed">{opt.desc}</p>
                    {isActive && (
                      <span className="mt-1 self-start text-[10px] font-bold uppercase tracking-widest text-[--color-primary] bg-[--color-primary]/20 px-2 py-0.5 rounded-full">
                        Seleccionado
                      </span>
                    )}
                  </label>
                )
              })}
            </div>
          </Section>

          {/* ── Mostrar respuesta correcta ──────────────────────────────── */}
          <Section title="Mostrar respuesta correcta" icon="💡">
            <div className="grid grid-cols-2 gap-3">
              {([
                { value: 'true',  label: 'Sí, mostrar',  icon: '👁',  desc: 'Se resalta la respuesta correcta en el feedback.' },
                { value: 'false', label: 'No mostrar',   icon: '🙈', desc: 'Solo sabrás si acertaste o no, sin ver la correcta.' },
              ] as const).map(opt => {
                const isActive = selectedShowAnswers === opt.value
                return (
                  <label
                    key={opt.value}
                    htmlFor={`show-answers-${opt.value}`}
                    className={[
                      'flex flex-col gap-2 p-4 rounded-xl border cursor-pointer transition-all duration-200',
                      isActive
                        ? 'border-[--color-secondary] bg-[--color-secondary]/15 shadow-md shadow-[--color-secondary]/20 scale-[1.02]'
                        : 'border-white/10 bg-white/5 hover:border-white/25 hover:bg-white/8',
                    ].join(' ')}
                  >
                    <input
                      id={`show-answers-${opt.value}`}
                      type="radio"
                      className="sr-only"
                      {...register('showCorrectAnswers')}
                      value={opt.value}
                    />
                    <span className="text-2xl">{opt.icon}</span>
                    <p className={`text-sm font-bold ${isActive ? 'text-[--color-secondary]' : 'text-[--color-text]'}`}>{opt.label}</p>
                    <p className="text-xs text-[--color-text]/50 leading-relaxed">{opt.desc}</p>
                    {isActive && (
                      <span className="mt-1 self-start text-[10px] font-bold uppercase tracking-widest text-[--color-secondary] bg-[--color-secondary]/20 px-2 py-0.5 rounded-full">
                        Seleccionado
                      </span>
                    )}
                  </label>
                )
              })}
            </div>
          </Section>

          {/* Submit */}
          <button
            type="submit"
            id="btn-start-quiz-configured"
            className="mt-2 w-full flex items-center justify-center gap-3 py-4 rounded-2xl font-extrabold text-lg text-[--color-bg] bg-[--color-primary] hover:brightness-110 active:scale-95 transition-all shadow-lg shadow-[--color-primary]/20"
          >
            ¡Comenzar Quiz! <span>→</span>
          </button>
        </form>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function Section({ title, icon, children }: { title: string; icon: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <span className="text-xl">{icon}</span>
        <h2 className="font-bold text-[--color-text] text-base">{title}</h2>
      </div>
      {children}
    </div>
  )
}

function ErrorMsg({ children }: { children: React.ReactNode }) {
  return <p className="text-xs text-red-400 mt-1">{children}</p>
}
