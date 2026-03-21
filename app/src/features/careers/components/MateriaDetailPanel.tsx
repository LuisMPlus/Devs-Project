import { useEffect, useMemo } from 'react'
import type { Subject } from '../types/subject'

const YEAR_COLORS: Record<number, string> = {
  1: '#02ffff',
  2: '#f59e0b',
  3: '#a78bfa',
  4: '#34d399',
  5: '#f472b6',
}

const DAY_ICONS: Record<string, string> = {
  Lunes: 'L', Martes: 'Ma', Miércoles: 'Mi',
  Jueves: 'J', Viernes: 'V', Sábado: 'S',
}

interface Props {
  subject: Subject | null
  subjects: Subject[]
  onClose: () => void
}

export default function SubjectDetailPanel({ subject, subjects, onClose }: Props) {
  // Cerrar con Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  const getSubjectType = (subject: Subject): number => {
    if (subject.type === 'requirement') return 0 // Requisitos
    if (subject.type === 'optional') return 99 // Optativas/Otros
    return Number(subject.year)
  }

  const color = subject ? YEAR_COLORS[getSubjectType(subject)] || '#02ffff' : '#02ffff'
  const subjectNum: number | string = subject ? subject.cod : 0

  const prerequisitesData = useMemo(() => {
    if (!subject) return []
    const data: { num: number | string, name: string, isSuspended?: boolean, isAdded?: boolean }[] = []
    
    // Original prereqs
    for (const cCod of subject.prerequisites) {
      const isSuspended = subject.suspendedPrerequisites?.includes(cCod as never) || false
      const mat = subjects.find(m => m.cod === cCod)
      data.push({ num: cCod, name: mat ? mat.name : '?', isSuspended })
    }

    // Added prereqs
    if (subject.addedPrerequisites) {
      for (const cCod of subject.addedPrerequisites) {
        if (!data.some(d => d.num === cCod)) {
          const mat = subjects.find(m => m.cod === cCod)
          data.push({ num: cCod, name: mat ? mat.name : '?', isAdded: true })
        }
      }
    }
    
    return data
  }, [subject, subjects])

  const getEffectivePrerequisites = (mat: Subject): (number | string)[] => {
    let prereqs = [...mat.prerequisites]
    if (mat.suspendedPrerequisites) {
      prereqs = prereqs.filter(p => !mat.suspendedPrerequisites!.includes(p as never))
    }
    if (mat.addedPrerequisites) {
      for (const p of mat.addedPrerequisites) {
        if (!prereqs.includes(p as never)) prereqs.push(p)
      }
    }
    return prereqs
  }

  const indirectPrerequisitesData = useMemo(() => {
    if (!subject) return []
    const indirect = new Set<number | string>()
    const queue = getEffectivePrerequisites(subject)
    const subjectEffective = getEffectivePrerequisites(subject)
    
    while (queue.length > 0) {
      const current = queue.shift()!
      const mat = subjects.find(m => m.cod === current)
      if (mat) {
        const effective = getEffectivePrerequisites(mat)
        for (const c of effective) {
          if (!subjectEffective.includes(c) && !indirect.has(c)) {
            indirect.add(c)
            queue.push(c)
          }
        }
      }
    }
    
    return Array.from(indirect).map(cCod => {
      const mat = subjects.find(m => m.cod === cCod)
      return { num: cCod, name: mat ? mat.name : '?' }
    })
  }, [subject, subjects])

  const opensData = useMemo(() => {
    if (!subject) return []
    return subjects
      .filter(m => getEffectivePrerequisites(m).includes(subject.cod))
      .map(m => ({ num: m.cod, name: m.name }))
  }, [subject, subjects])

  return (
    <>
      <div
        onClick={onClose}
        className="fixed inset-0 z-40 transition-opacity duration-300"
        style={{
          backgroundColor: 'rgba(0,0,0,0.45)',
          opacity: subject ? 1 : 0,
          pointerEvents: subject ? 'auto' : 'none',
        }}
      />

      <aside
        className="fixed top-0 right-0 h-full z-50 flex flex-col"
        style={{
          width: '100%',
          maxWidth: '420px',
          backgroundColor: 'color-mix(in srgb, var(--color-bg) 95%, #000)',
          borderLeft: `1px solid color-mix(in srgb, ${color} 25%, transparent)`,
          transform: subject ? 'translateX(0)' : 'translateX(100%)',
          transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          boxShadow: subject ? `-12px 0 40px color-mix(in srgb, ${color} 10%, transparent)` : 'none',
        }}
      >
        {subject && (
          <>
            <div
              className="px-6 pt-6 pb-5 flex items-start justify-between gap-3"
              style={{ borderBottom: `1px solid color-mix(in srgb, ${color} 15%, transparent)` }}
            >
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <span
                    className="text-xs font-semibold tracking-widest uppercase block"
                    style={{ color }}
                  >
                    {subject.year === 0 || subject.year === 99 || subject.type === 'requirement' || subject.type === 'optional'
                      ? 'Materias Especiales'
                      : [
                          subject.year ? `Año ${subject.year}` : null,
                          subject.semester ? `Cuatrimestre ${subject.semester}` : null
                        ].filter(Boolean).join(' · ')}
                  </span>
                  {subject.isOfferedBothSemesters && (
                    <span
                      title="Esta materia se ofrece en ambos cuatrimestres"
                      className="text-[10px] font-bold px-2 py-0.5 rounded-full border"
                      style={{
                        borderColor: `color-mix(in srgb, ${color} 30%, transparent)`,
                        backgroundColor: `color-mix(in srgb, ${color} 10%, transparent)`,
                        color: color,
                      }}
                    >
                      ↻ REDICTADO
                    </span>
                  )}
                </div>
                <h2 className="text-lg font-bold leading-snug" style={{ color: 'var(--color-text)' }}>
                  #{subjectNum} — {subject.name}
                </h2>
              </div>
              <button
                onClick={onClose}
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-6 custom-scrollbar">
              {/* Encabezado */}
              <div>
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  <span
                    className="px-2 py-1 rounded text-xs font-bold"
                    style={{ backgroundColor: 'color-mix(in srgb, var(--color-primary) 20%, transparent)', color: 'var(--color-primary)' }}
                  >
                    Cód. {subjectNum}
                  </span>
                  {subject.type === 'optional' && (
                    <span className="px-2 py-1 rounded text-xs font-bold bg-yellow-500/20 text-yellow-400">
                      Optativa
                    </span>
                  )}
                  {subject.type === 'requirement' && (
                    <span className="px-2 py-1 rounded text-xs font-bold bg-gray-500/20 text-gray-400">
                      Requisito
                    </span>
                  )}
                </div>
                <h2 className="text-2xl font-bold tracking-tight mb-2">
                  {subject.name}
                </h2>
              </div>

              {/* Descripción (R1, R2, R3 y optativas) */}
              {(['R1', 'R2', 'R3', 21, 31].includes(subject.cod as any) || subject.type === 'optional') && (
                <section>
                  <h3 className="text-xs font-semibold uppercase tracking-widest mb-3"
                    style={{ color: 'color-mix(in srgb, var(--color-text) 45%, transparent)' }}>
                    Descripción
                  </h3>
                  <p className="text-sm leading-relaxed" style={{ color: 'color-mix(in srgb, var(--color-text) 80%, transparent)' }}>
                    {subject.description || 'Sin descripción disponible.'}
                  </p>
                </section>
              )}

              {subject.classroomUrl && (
                <section>
                  <h3 className="text-xs font-semibold uppercase tracking-widest mb-3"
                    style={{ color: 'color-mix(in srgb, var(--color-text) 45%, transparent)' }}>
                    Aula Virtual
                  </h3>
                  <a
                    href={subject.classroomUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 px-4 py-3 rounded-xl border transition-all duration-150 group"
                    style={{
                      borderColor: `color-mix(in srgb, ${color} 25%, transparent)`,
                      backgroundColor: `color-mix(in srgb, ${color} 6%, transparent)`,
                      color: 'var(--color-text)',
                      textDecoration: 'none',
                    }}
                    onMouseEnter={e => {
                      (e.currentTarget as HTMLAnchorElement).style.backgroundColor = `color-mix(in srgb, ${color} 12%, transparent)`
                    }}
                    onMouseLeave={e => {
                      (e.currentTarget as HTMLAnchorElement).style.backgroundColor = `color-mix(in srgb, ${color} 6%, transparent)`
                    }}
                  >
                    <svg className="w-4 h-4 shrink-0" style={{ color }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round"
                        d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                    </svg>
                    <span className="text-sm truncate flex-1" style={{ color }}>
                      {subject.classroomUrl.replace('https://', '')}
                    </span>
                    <svg className="w-3.5 h-3.5 opacity-50 group-hover:opacity-100 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                    </svg>
                  </a>
                </section>
              )}

              {subject.groupLink && (
                <section>
                  <h3 className="text-xs font-semibold uppercase tracking-widest mb-3"
                    style={{ color: 'color-mix(in srgb, var(--color-text) 45%, transparent)' }}>
                    Grupo de Estudiantes
                  </h3>
                  <a
                    href={subject.groupLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 px-4 py-3 rounded-xl border transition-all duration-150 group"
                    style={{
                      borderColor: `color-mix(in srgb, #22c55e 25%, transparent)`,
                      backgroundColor: `color-mix(in srgb, #22c55e 6%, transparent)`,
                      color: 'var(--color-text)',
                      textDecoration: 'none',
                    }}
                    onMouseEnter={e => {
                      (e.currentTarget as HTMLAnchorElement).style.backgroundColor = `color-mix(in srgb, #22c55e 12%, transparent)`
                    }}
                    onMouseLeave={e => {
                      (e.currentTarget as HTMLAnchorElement).style.backgroundColor = `color-mix(in srgb, #22c55e 6%, transparent)`
                    }}
                  >
                    <svg className="w-4 h-4 shrink-0 text-[#22c55e]" fill="currentColor" viewBox="0 0 16 16">
                      <path d="M11.42 9.49c-.23-.11-1.33-.66-1.54-.73-.2-.07-.35-.11-.5.11-.14.23-.58.73-.71.88-.13.15-.26.17-.49.06-.23-.11-.95-.35-1.81-1.12-.66-.6-1.12-1.34-1.25-1.57-.13-.23-.01-.35.1-.46.1-.11.23-.26.35-.4.11-.13.15-.23.23-.38.07-.15.03-.29-.02-.4-.06-.11-.5-1.22-.69-1.66-.18-.44-.36-.38-.5-.38-.13-.01-.28-.01-.43-.01-.15 0-.4.06-.61.28-.21.23-.8.78-.8 1.91 0 1.13.82 2.22.94 2.38.11.15 1.62 2.48 3.93 3.48.55.24.98.38 1.32.48.55.18 1.05.15 1.45.09.45-.06 1.33-.55 1.52-1.07.19-.53.19-.98.13-1.07-.06-.1-.21-.15-.44-.27M8 14.61c-1.14 0-2.25-.3-3.23-.88l-.23-.14-2.4.63.64-2.34-.15-.25A6.55 6.55 0 0 1 1.41 8c0-3.63 2.96-6.59 6.59-6.59 1.76 0 3.41.69 4.66 1.93s1.93 2.91 1.93 4.66-2.96 6.61-6.59 6.61M8 0C3.59 0 0 3.59 0 8c0 1.41.37 2.78 1.07 4L.01 16l4.11-1.08C5.35 15.63 6.65 16 8 16c4.41 0 8-3.59 8-8s-3.59-8-8-8"/>
                    </svg>
                    <span className="text-sm truncate flex-1 text-[#22c55e] font-medium">
                      Grupo WhatsApp
                    </span>
                    <svg className="w-3.5 h-3.5 opacity-50 group-hover:opacity-100 shrink-0 text-[#22c55e]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                    </svg>
                  </a>
                </section>
              )}

              {subject.schedules && subject.schedules.length > 0 && (
                <section>
                  <h3 className="text-xs font-semibold uppercase tracking-widest mb-3"
                    style={{ color: 'color-mix(in srgb, var(--color-text) 45%, transparent)' }}>
                    Horarios
                  </h3>
                  <div className="flex flex-col gap-2">
                    {subject.schedules.map((h, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-3 px-4 py-3 rounded-xl border"
                        style={{
                          borderColor: 'color-mix(in srgb, var(--color-text) 8%, transparent)',
                          backgroundColor: 'color-mix(in srgb, var(--color-text) 3%, transparent)',
                        }}
                      >
                        <span
                          className="text-xs font-bold w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                          style={{
                            backgroundColor: `color-mix(in srgb, ${color} 15%, transparent)`,
                            color,
                          }}
                        >
                          {DAY_ICONS[h.day] ?? h.day.slice(0, 2)}
                        </span>
                        <div className="flex flex-col flex-1 min-w-0 gap-2">
                          {/* Fila superior: Día, Horas y Aula */}
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-baseline gap-2">
                              <span className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>
                                {h.day}
                              </span>
                              <span className="text-xs" style={{ color: 'color-mix(in srgb, var(--color-text) 55%, transparent)' }}>
                                {h.startTime} – {h.endTime}
                              </span>
                            </div>
                            {h.classroom && (
                              <span
                                className="text-[10px] px-1.5 py-px rounded-md border whitespace-nowrap"
                                style={{
                                  borderColor: 'color-mix(in srgb, var(--color-text) 15%, transparent)',
                                  color: 'color-mix(in srgb, var(--color-text) 60%, transparent)',
                                }}
                              >
                                📍 {h.classroom}
                              </span>
                            )}
                          </div>
                          
                          {/* Fila inferior: Etiquetas (Grupo, Tipo, Modalidad) */}
                          <div className="flex items-center gap-1.5 flex-wrap">
                            {h.group ? (
                              <span className="text-[10px] px-1.5 py-px rounded font-mono border" style={{ borderColor: color, color: color }}>
                                {h.group}
                              </span>
                            ) : (
                              <span className="text-[10px] px-1.5 py-px rounded opacity-50" style={{ backgroundColor: 'color-mix(in srgb, var(--color-text) 10%, transparent)' }}>
                                Único
                              </span>
                            )}
                            {h.classType && (
                              <span className="text-[10px] px-1.5 py-px rounded font-bold" style={{ backgroundColor: 'color-mix(in srgb, var(--color-text) 15%, transparent)', color: 'color-mix(in srgb, var(--color-text) 80%, transparent)' }}>
                                {h.classType === 'T' ? 'Teoría' : h.classType === 'P' ? 'Práctica' : h.classType === 'S' ? 'Seminario' : 'Teórico-Práctico'}
                              </span>
                            )}
                            {h.modality && (
                              <span className="text-[10px] px-1.5 py-px rounded font-bold uppercase" style={{
                                backgroundColor: h.modality === 'virtual' ? 'color-mix(in srgb, #3b82f6 15%, transparent)' : h.modality === 'presencial' ? 'color-mix(in srgb, #22c55e 15%, transparent)' : 'color-mix(in srgb, #a855f7 15%, transparent)',
                                color: h.modality === 'virtual' ? '#60a5fa' : h.modality === 'presencial' ? '#4ade80' : '#c084fc'
                              }}>
                                {h.modality}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {(prerequisitesData.length > 0 || indirectPrerequisitesData.length > 0) && (
                <section>
                  {((subject.suspendedPrerequisites && subject.suspendedPrerequisites.length > 0) || (subject.addedPrerequisites && subject.addedPrerequisites.length > 0)) && (
                    <div className="mb-5 p-3.5 rounded-xl border flex gap-3 items-start" style={{
                      borderColor: 'color-mix(in srgb, #f59e0b 25%, transparent)',
                      backgroundColor: 'color-mix(in srgb, #f59e0b 8%, transparent)',
                      color: 'color-mix(in srgb, var(--color-text) 85%, transparent)'
                    }}>
                      <svg className="w-5 h-5 mt-0.5 shrink-0 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <p className="text-[13px] leading-relaxed">
                        <strong className="block mb-0.5 text-amber-500 font-semibold tracking-wide">Régimen de Excepción</strong>
                        Esta modificación en las correlatividades se debe al régimen de excepción de correlatividades por el cambio al plan 2022.
                      </p>
                    </div>
                  )}

                  {prerequisitesData.length > 0 && (
                    <>
                      <h3 className="text-xs font-semibold uppercase tracking-widest mb-3"
                        style={{ color: 'color-mix(in srgb, var(--color-text) 45%, transparent)' }}>
                        Correlativas
                      </h3>
                      <div className="flex flex-col gap-1.5 mb-6">
                        {prerequisitesData.map(({ num, name, isSuspended, isAdded }) => (
                          <div
                            key={String(num) + name}
                            className={`flex items-center gap-2 text-sm px-3 py-2 rounded-lg ${isSuspended ? 'opacity-60' : ''}`}
                            style={{
                              backgroundColor: 'color-mix(in srgb, var(--color-text) 4%, transparent)',
                              color: 'color-mix(in srgb, var(--color-text) 75%, transparent)',
                            }}
                          >
                            <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: color }} />
                            <span className={`font-mono text-xs opacity-60 ${isSuspended ? 'line-through' : ''}`}>#{num}</span>
                            <span className={isSuspended ? 'line-through text-red-300' : isAdded ? 'text-blue-300 font-medium' : ''}>{name}</span>
                            
                            {isSuspended && (
                              <span className="ml-auto px-1.5 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider" style={{ backgroundColor: 'color-mix(in srgb, #ef4444 15%, transparent)', color: '#f87171' }}>Suspendida</span>
                            )}
                            {isAdded && (
                              <span className="ml-auto px-1.5 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider" style={{ backgroundColor: 'color-mix(in srgb, #3b82f6 15%, transparent)', color: '#60a5fa' }}>Agregada</span>
                            )}
                          </div>
                        ))}
                      </div>
                    </>
                  )}

                  {indirectPrerequisitesData.length > 0 && (
                    <>
                      <h3 className="text-xs font-semibold uppercase tracking-widest mb-3"
                        style={{ color: 'color-mix(in srgb, var(--color-text) 35%, transparent)' }}>
                        Correlativas Indirectas (Requisitos Previos)
                      </h3>
                      <div className="flex flex-col gap-1.5">
                        {indirectPrerequisitesData.map(({ num, name }) => (
                          <div
                            key={name}
                            className="flex items-center gap-2 text-sm px-3 py-2 rounded-lg"
                            style={{
                              backgroundColor: 'color-mix(in srgb, var(--color-text) 2%, transparent)',
                              color: 'color-mix(in srgb, var(--color-text) 45%, transparent)',
                            }}
                          >
                            <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: 'color-mix(in srgb, var(--color-text) 30%, transparent)' }} />
                            <span className="font-mono text-xs opacity-60">#{num}</span>
                            {name}
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </section>
              )}
              {prerequisitesData.length === 0 && indirectPrerequisitesData.length === 0 && (
                <section>
                  <h3 className="text-xs font-semibold uppercase tracking-widest mb-3"
                    style={{ color: 'color-mix(in srgb, var(--color-text) 45%, transparent)' }}>
                    Correlativas
                  </h3>
                  <p className="text-sm" style={{ color: 'color-mix(in srgb, var(--color-text) 45%, transparent)' }}>
                    Sin correlativas previas
                  </p>
                </section>
              )}

              {opensData.length > 0 && (
                <section className="mt-2">
                  <h3 className="text-xs font-semibold uppercase tracking-widest mb-3"
                    style={{ color: 'color-mix(in srgb, var(--color-text) 45%, transparent)' }}>
                    Al aprobar abre:
                  </h3>
                  <div className="flex flex-col gap-1.5">
                    {opensData.map(({ num, name }) => (
                      <div
                        key={String(num)}
                        className="flex items-center gap-2 text-sm px-3 py-2 rounded-lg"
                        style={{
                          backgroundColor: 'color-mix(in srgb, var(--color-text) 2%, transparent)',
                          color: 'color-mix(in srgb, var(--color-text) 85%, transparent)',
                          borderColor: `color-mix(in srgb, ${color} 15%, transparent)`,
                          borderWidth: '1px'
                        }}
                      >
                        <span className="font-mono text-xs font-bold" style={{ color }}>#{num}</span>
                        <span className="truncate">{name}</span>
                      </div>
                    ))}
                  </div>
                </section>
              )}
            </div>
          </>
        )}
      </aside>
    </>
  )
}
