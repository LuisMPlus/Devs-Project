import { useMemo, useState, useEffect } from 'react'
import type { Subject } from '../types/subject'

function useWindowSize() {
  const [size, setSize] = useState({ width: 0, height: 0 })
  useEffect(() => {
    const check = () => setSize({ width: window.innerWidth, height: window.innerHeight })
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])
  return size
}

function splitText(text: string, maxLen: number): string[] {
  if (text.length <= maxLen) return [text]
  const words = text.split(' ')
  const lines: string[] = []
  let current = ''
  for (const w of words) {
    if (!current) {
      current = w
    } else if (current.length + 1 + w.length <= maxLen) {
      current += ' ' + w
    } else {
      lines.push(current)
      current = w
    }
  }
  if (current) lines.push(current)
  if (lines.length > 2) {
    return [lines[0], lines[1].slice(0, maxLen - 1) + '…']
  }
  return lines
}

// Colores por año — distintos entre sí, armonizan con el fondo oscuro
const YEAR_COLORS: Record<number, { bg: string; border: string; text: string; hex: string }> = {
  0: { hex: '#9ca3af', bg: 'color-mix(in srgb, #9ca3af 14%, var(--color-bg))', border: '#9ca3af', text: 'var(--color-text)' }, // Requisitos: Gris
  1: { hex: '#02ffff', bg: 'color-mix(in srgb, #02ffff 14%, var(--color-bg))', border: '#02ffff', text: 'var(--color-text)' },
  2: { hex: '#f59e0b', bg: 'color-mix(in srgb, #f59e0b 14%, var(--color-bg))', border: '#f59e0b', text: 'var(--color-text)' },
  3: { hex: '#a78bfa', bg: 'color-mix(in srgb, #a78bfa 14%, var(--color-bg))', border: '#a78bfa', text: 'var(--color-text)' },
  4: { hex: '#34d399', bg: 'color-mix(in srgb, #34d399 14%, var(--color-bg))', border: '#34d399', text: 'var(--color-text)' },
  5: { hex: '#f472b6', bg: 'color-mix(in srgb, #f472b6 14%, var(--color-bg))', border: '#f472b6', text: 'var(--color-text)' },
  99: { hex: '#fbbf24', bg: 'color-mix(in srgb, #fbbf24 14%, var(--color-bg))', border: '#fbbf24', text: 'var(--color-text)' }, // Optativas: Amarillo Oro
}

export default function SubjectGraph({ subjects, onSelect, groupBySemester = false }: { subjects: Subject[], onSelect: (cod: number | string) => void, groupBySemester?: boolean }) {
  const getSubjectType = (subject: Subject): number => {
    if (subject.type === 'requirement') return 0 // Requisitos
    if (subject.type === 'optional') return 99 // Optativas/Otros
    return Number(subject.year)
  }

  const [hovered, setHovered] = useState<number | string | null>(null)
  const { width: winW } = useWindowSize()
  const isXs = winW > 0 && winW < 400
  const isMobile = winW > 0 && winW < 768
  const isTablet = winW >= 768 && winW < 1024
  const isWide = winW >= 1440

  // Layout responsivo para ajustar tamaños de contenedor a múltiples vistas (Tamaños reducidos)
  const NODE_W = isXs ? 120 : isMobile ? 140 : isTablet ? 150 : isWide ? 170 : 160
  const NODE_H = isXs ? 54 : isMobile ? 58 : isTablet ? 60 : isWide ? 68 : 64
  const PADDING = isMobile ? 16 : isTablet ? 24 : 40
  const COL_GAP = isXs ? 10 : isMobile ? 12 : isTablet ? 24 : isWide ? 40 : 30
  const ROW_GAP = isMobile ? 12 : isTablet ? 16 : isWide ? 24 : 20
  const SEMESTER_GAP = isMobile ? 40 : 0

  // Fuentes dinámicas
  const FONT_MAIN = isXs ? 8 : isMobile ? 9 : isTablet ? 11 : isWide ? 12 : 11
  const FONT_NUM = isMobile ? 8 : isTablet ? 9 : isWide ? 10 : 9
  const FONT_CORR = isMobile ? 7 : isTablet ? 8 : isWide ? 9 : 8
  const FONT_HEADER = isMobile ? 11 : isTablet ? 13 : isWide ? 15 : 13

  const regularSubjects = useMemo(() => subjects.filter(s => {
    const t = getSubjectType(s)
    return t !== 0 && t !== 99
  }), [subjects])

  const optativas = useMemo(() => subjects.filter(s => getSubjectType(s) === 99), [subjects])
  const requisitos = useMemo(() => subjects.filter(s => getSubjectType(s) === 0), [subjects])

  const positions = useMemo(() => {
    const map: Record<number | string, { x: number; y: number }> = {}
    for (const subject of regularSubjects) {
      const subjSemester = subject.semester
      const isSemestral = groupBySemester && subjSemester != null
      // Determine logical column index
      const colIndex = isSemestral
        ? (Number(subject.year) - 1) * 2 + (subjSemester - 1)
        : getSubjectType(subject) - 1

      // Find subjects in the same group (year or semester)
      const subjectsInGroup = regularSubjects.filter(mat => {
        if (isSemestral) {
          return Number(mat.year) === Number(subject.year) && mat.semester === subjSemester
        }
        return getSubjectType(mat) === getSubjectType(subject)
      })
      const idx = subjectsInGroup.findIndex(mat => mat.cod === subject.cod)

      if (isMobile) {
        // Mobile layout: temporal flow goes top-down
        const col = idx % 2
        const rowInYear = Math.floor(idx / 2)
        const x = PADDING + col * (NODE_W + COL_GAP)
        
        let prevYearsHeight = 0
        for (let i = 0; i < colIndex; i++) {
          const count = regularSubjects.filter(mat => {
            if (isSemestral) {
              const cy = Math.floor(i / 2) + 1
              const cs = (i % 2) + 1
              return Number(mat.year) === cy && mat.semester === cs
            }
            return getSubjectType(mat) === i + 1
          }).length
          const rows = Math.ceil(count / 2)
          prevYearsHeight += rows * (NODE_H + ROW_GAP) + SEMESTER_GAP
        }

        const y = PADDING + prevYearsHeight + SEMESTER_GAP + rowInYear * (NODE_H + ROW_GAP)
        map[subject.cod] = { x, y }
      } else {
        // Desktop layout: temporal flow goes left-right
        const x = PADDING + colIndex * (NODE_W + COL_GAP)
        const y = PADDING + idx * (NODE_H + ROW_GAP)
        map[subject.cod] = { x, y }
      }
    }
    return map
  }, [isMobile, NODE_W, NODE_H, COL_GAP, ROW_GAP, PADDING, SEMESTER_GAP, regularSubjects])

  // Compute SVG boundaries for regular subjects
  let maxX = 0, maxY = 0
  for (const pos of Object.values(positions)) {
    if (pos.x > maxX) maxX = pos.x
    if (pos.y > maxY) maxY = pos.y
  }
  const svgWidth = Object.keys(positions).length > 0 ? maxX + NODE_W + PADDING : 0
  const svgHeight = Object.keys(positions).length > 0 ? maxY + NODE_H + PADDING : 0

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

  // Correlativas to highlight on hover (toda la rama que abre la materia)
  const highlightedIds = useMemo(() => {
    if (!hovered) return new Set<number | string>()
    const ids = new Set<number | string>([hovered])
    
    let added = true
    while (added) {
      added = false
      for (const mat of subjects) {
        if (!ids.has(mat.cod)) {
          const prereqs = getEffectivePrerequisites(mat)
          if (prereqs.some(p => ids.has(p) || ids.has(String(p)) || ids.has(Number(p)))) {
            ids.add(mat.cod)
            added = true
          }
        }
      }
    }
    
    return ids
  }, [hovered, subjects])

  const renderExtraNode = (subject: Subject, yearType: number) => {
    const num = subject.cod
    const colors = YEAR_COLORS[yearType] || YEAR_COLORS[99]
    const isActive = hovered === null || highlightedIds.has(subject.cod)
    const isHovered = hovered === subject.cod

    return (
      <div
        key={subject.cod}
        onMouseEnter={() => setHovered(subject.cod)}
        onMouseLeave={() => setHovered(null)}
        onClick={() => onSelect(subject.cod)}
        className="relative rounded-xl flex items-center justify-center p-2 text-center"
        style={{
          width: NODE_W,
          height: NODE_H,
          backgroundColor: colors.bg,
          border: `${isHovered ? 2 : 1}px solid ${colors.border}`,
          opacity: isActive ? 1 : 0.25,
          cursor: 'pointer',
          transition: 'opacity 0.2s, border-width 0.15s'
        }}
      >
        {/* Enumeración (# de materia) */}
        <div className="absolute flex items-center justify-center font-bold"
             style={{
               top: '8px',
               left: '8px',
               width: '18px',
               height: '18px',
               borderRadius: '50%',
               backgroundColor: colors.bg,
               border: `1px solid ${colors.border}`,
               color: colors.text,
               fontSize: `${FONT_NUM}px`,
               opacity: isActive ? 1 : 0.4
             }}>
          {num}
        </div>

        {/* Text */}
        <div className="flex flex-col items-center justify-center pointer-events-none select-none"
             style={{ color: colors.text, fontSize: `${FONT_MAIN}px`, fontWeight: isHovered ? 700 : 400, opacity: isActive ? 1 : 0.4 }}>
          {splitText(subject.name, Math.floor(NODE_W / (isMobile ? 7.5 : 8.2))).map((line, i) => (
            <span key={i} className="leading-tight">{line}</span>
          ))}
        </div>

        {/* Corr */}
        {subject.prerequisites.length > 0 && (
          <div className="absolute bottom-1 right-2 pointer-events-none select-none"
               style={{ fontSize: `${FONT_CORR}px`, color: colors.text, opacity: isActive ? 0.6 : 0.2 }}>
            Corr: {subject.prerequisites.join(', ')}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="w-full flex flex-col gap-10">
      {/* Gráfico SVG Principal */}
      <div
        className="w-full overflow-x-auto"
        style={{ WebkitOverflowScrolling: 'touch' }}
      >
        <svg
          width={svgWidth}
          height={svgHeight}
          style={{
            display: 'block',
            minWidth: svgWidth,
            minHeight: svgHeight,
            margin: '0 auto'
          }}
        >
          {/* Flechas de correlatividad */}
          {subjects.map(subject =>
            getEffectivePrerequisites(subject).map(corrCod => {
              const from = positions[corrCod]
              const to = positions[subject.cod]
              if (!from || !to) return null

              const isActive = hovered && highlightedIds.has(subject.cod) && highlightedIds.has(corrCod)
              if (!isActive) return null
              
              let x1, y1, x2, y2, cx, cy, d
              
              if (isMobile) {
                x1 = from.x + NODE_W / 2
                y1 = from.y + NODE_H
                x2 = to.x + NODE_W / 2
                y2 = to.y - 4 // small padding for the arrow tip
                cy = (y1 + y2) / 2
                d = `M${x1},${y1} C${x1},${cy} ${x2},${cy} ${x2},${y2}`
              } else {
                x1 = from.x + NODE_W
                y1 = from.y + NODE_H / 2
                x2 = to.x - 4 // small padding
                y2 = to.y + NODE_H / 2
                cx = (x1 + x2) / 2
                d = `M${x1},${y1} C${cx},${y1} ${cx},${y2} ${x2},${y2}`
              }

              return (
                <path
                  key={`${corrCod}->${subject.cod}`}
                  d={d}
                  fill="none"
                  stroke={isActive ? 'var(--color-primary)' : '#ffffff15'}
                  strokeWidth={isActive ? 2 : 1.5}
                  style={{ transition: 'stroke 0.2s, stroke-width 0.2s' }}
                />
              )
            })
          )}

          {/* Nodos de años 1 al 5 */}
          {regularSubjects.map((subject) => {
            const num = subject.cod
            const { x, y } = positions[subject.cod]
            const colors = YEAR_COLORS[getSubjectType(subject)] || YEAR_COLORS[1]
            const isActive = hovered === null || highlightedIds.has(subject.cod)
            const isHovered = hovered === subject.cod

            return (
              <g
                key={subject.cod}
                onMouseEnter={() => setHovered(subject.cod)}
                onMouseLeave={() => setHovered(null)}
                onClick={() => onSelect(subject.cod)}
                style={{ cursor: 'pointer' }}
              >
                <rect
                  x={x}
                  y={y}
                  width={NODE_W}
                  height={NODE_H}
                  rx={10}
                  ry={10}
                  fill={colors.bg}
                  stroke={colors.border}
                  strokeWidth={isHovered ? 2 : 1}
                  opacity={isActive ? 1 : 0.25}
                  style={{ transition: 'opacity 0.2s, stroke-width 0.15s' }}
                />
                <text
                  x={x + NODE_W / 2}
                  y={y + NODE_H / 2}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill={colors.text}
                  fontSize={FONT_MAIN}
                  fontWeight={isHovered ? 700 : 400}
                  opacity={isActive ? 1 : 0.4}
                  style={{ transition: 'opacity 0.2s', userSelect: 'none', pointerEvents: 'none' }}
                >
                  {splitText(subject.name, Math.floor(NODE_W / (isMobile ? 7.5 : 8.2))).map((line, i, arr) => (
                    <tspan
                      key={i}
                      x={x + NODE_W / 2}
                      dy={arr.length === 1 ? 0 : i === 0 ? '-0.4em' : '1.2em'}
                    >
                      {line}
                    </tspan>
                  ))}
                </text>

                {/* Enumeración (# de materia) */}
                <g style={{ userSelect: 'none', pointerEvents: 'none' }}>
                  <circle cx={x + 12} cy={y + 12} r={9} fill={colors.bg} stroke={colors.border} strokeWidth={1} opacity={isActive ? 1 : 0.4} />
                  <text x={x + 12} y={y + 13} textAnchor="middle" dominantBaseline="middle" fontSize={FONT_NUM} fontWeight={700} fill={colors.text} opacity={isActive ? 1 : 0.4}>
                    {num}
                  </text>
                </g>

                {/* Correlativas (#) */}
                {subject.prerequisites.length > 0 && (
                  <text
                    x={x + NODE_W - 8}
                    y={y + NODE_H - 8}
                    textAnchor="end"
                    fontSize={FONT_CORR}
                    fill={colors.text}
                    opacity={isActive ? 0.6 : 0.2}
                    style={{ userSelect: 'none', pointerEvents: 'none' }}
                  >
                    Corr: {subject.prerequisites.join(', ')}
                  </text>
                )}

                {/* Cuatrimestre (Solo mandatory) */}
                {subject.type === 'mandatory' && subject.semester && (
                  <text
                    x={x + NODE_W - 8}
                    y={y + 14}
                    textAnchor="end"
                    fontSize={FONT_CORR}
                    fontWeight={700}
                    fill={colors.text}
                    opacity={isActive ? 0.5 : 0.2}
                    style={{ userSelect: 'none', pointerEvents: 'none' }}
                  >
                    {subject.semester}º Cuat.
                  </text>
                )}
              </g>
            )
          })}
          
          {/* Headers de columnas */}
          {(() => {
            const maxYear = regularSubjects.length > 0 
              ? Math.max(...regularSubjects.map(s => Number(s.year)))
              : groupBySemester ? 3 : 5

            const numCols = groupBySemester ? maxYear * 2 : maxYear
            const columns = Array.from({ length: numCols }, (_, i) => {
              if (groupBySemester) {
                const y = Math.floor(i / 2) + 1
                const c = (i % 2) + 1
                return { label: `AÑO ${y} - C${c}`, colIndex: i, year: y }
              }
              return { label: `AÑO ${i + 1}`, colIndex: i, year: i + 1 }
            })

            return columns.map(({ label, colIndex, year }) => {
            let hx, hy;

            if (isMobile) {
              let prevYearsHeight = 0
              for (let i = 0; i < colIndex; i++) {
                const count = regularSubjects.filter(mat => {
                  if (groupBySemester) {
                    const cy = Math.floor(i / 2) + 1
                    const cs = (i % 2) + 1
                    return Number(mat.year) === cy && mat.semester === cs
                  }
                  return getSubjectType(mat) === i + 1
                }).length
                const rows = Math.ceil(count / 2)
                prevYearsHeight += rows * (NODE_H + ROW_GAP) + SEMESTER_GAP
              }
              const baseY = PADDING + prevYearsHeight
              hx = PADDING + NODE_W + COL_GAP / 2
              hy = baseY + SEMESTER_GAP / 2 + 6
            } else {
              hx = PADDING + colIndex * (NODE_W + COL_GAP) + NODE_W / 2
              hy = 14
            }

            return (
              <text
                key={`header-${colIndex}`}
                x={hx}
                y={hy}
                textAnchor="middle"
                fontSize={FONT_HEADER}
                fontWeight={700}
                fill={YEAR_COLORS[year]?.hex || YEAR_COLORS[3].hex}
                opacity={0.8}
                style={{ userSelect: 'none' }}
              >
                {label}
              </text>
            )
          })})()}
        </svg>
      </div>

      {/* Contenedores de Materias Extra */}
      <div className="flex flex-col gap-8 px-4 pb-8 sm:px-10 items-center">
        {optativas.length > 0 && (
          <div className="w-full flex flex-col items-center">
            <h3 className="text-sm font-bold mb-4 tracking-wider text-center" style={{ color: YEAR_COLORS[99].hex }}>
              MATERIAS OPTATIVAS
            </h3>
            <div className="flex flex-wrap justify-center gap-4">
              {optativas.map(subject => renderExtraNode(subject, 99))}
            </div>
          </div>
        )}

        {requisitos.length > 0 && (
          <div className="w-full flex flex-col items-center">
            <h3 className="text-sm font-bold mb-4 tracking-wider text-center" style={{ color: YEAR_COLORS[0].hex }}>
              REQUISITOS EXTRA
            </h3>
            <div className="flex flex-wrap justify-center gap-4">
              {requisitos.map(subject => renderExtraNode(subject, 0))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
