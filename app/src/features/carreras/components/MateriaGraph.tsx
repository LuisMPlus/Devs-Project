import { useMemo, useState } from 'react'
import { MATERIAS_INGENIERIA_INFORMATICA, type Materia } from '../constants/materias'

const COL_WIDTH = 180
const COL_GAP = 40
const ROW_HEIGHT = 70
const ROW_GAP = 18
const NODE_W = 160
const NODE_H = 54
const PADDING = 40

// Colores por año usando la paleta del proyecto
const AÑO_COLORS: Record<number, { bg: string; border: string; text: string }> = {
  1: { bg: 'color-mix(in srgb, var(--color-accent) 18%, var(--color-bg))', border: 'var(--color-accent)', text: 'var(--color-text)' },
  2: { bg: 'color-mix(in srgb, var(--color-primary) 12%, var(--color-bg))', border: 'var(--color-primary)', text: 'var(--color-text)' },
  3: { bg: 'color-mix(in srgb, var(--color-secondary) 14%, var(--color-bg))', border: 'var(--color-secondary)', text: 'var(--color-text)' },
  4: { bg: 'color-mix(in srgb, #a78bfa 14%, var(--color-bg))', border: '#a78bfa', text: 'var(--color-text)' },
  5: { bg: 'color-mix(in srgb, #f472b6 14%, var(--color-bg))', border: '#f472b6', text: 'var(--color-text)' },
}

function getNodePosition(materia: Materia): { x: number; y: number } {
  // Columnas: año 1 Q1, año 1 Q2, año 2 Q1, año 2 Q2, ...
  const col = (materia.año - 1) * 2 + (materia.cuatrimestre - 1)
  const materiasEnColumna = MATERIAS_INGENIERIA_INFORMATICA.filter(
    m => m.año === materia.año && m.cuatrimestre === materia.cuatrimestre
  )
  const row = materiasEnColumna.findIndex(m => m.id === materia.id)
  const x = PADDING + col * (COL_WIDTH + COL_GAP)
  const y = PADDING + row * (ROW_HEIGHT + ROW_GAP)
  return { x, y }
}

export default function MateriaGraph() {
  const [hovered, setHovered] = useState<string | null>(null)

  const positions = useMemo(() => {
    const map: Record<string, { x: number; y: number }> = {}
    for (const m of MATERIAS_INGENIERIA_INFORMATICA) {
      map[m.id] = getNodePosition(m)
    }
    return map
  }, [])

  const totalCols = 10 // 5 años × 2 cuatrimestres
  const maxRows = 4    // máx materias por cuatrimestre
  const svgWidth = PADDING * 2 + totalCols * (COL_WIDTH + COL_GAP) - COL_GAP
  const svgHeight = PADDING * 2 + maxRows * (ROW_HEIGHT + ROW_GAP) - ROW_GAP

  // Qué correlativas resaltar cuando hay hover
  const highlightedIds = useMemo(() => {
    if (!hovered) return new Set<string>()
    const materia = MATERIAS_INGENIERIA_INFORMATICA.find(m => m.id === hovered)
    if (!materia) return new Set<string>()
    return new Set([hovered, ...materia.correlativas])
  }, [hovered])

  return (
    <div className="w-full overflow-x-auto" style={{ WebkitOverflowScrolling: 'touch' }}>
      <svg
        width={svgWidth}
        height={svgHeight}
        style={{ display: 'block', minWidth: svgWidth }}
      >
        {/* Flechas de correlatividad */}
        {MATERIAS_INGENIERIA_INFORMATICA.map(materia =>
          materia.correlativas.map(corrId => {
            const from = positions[corrId]
            const to = positions[materia.id]
            if (!from || !to) return null

            const isActive = hovered && (hovered === materia.id || hovered === corrId)
            const x1 = from.x + NODE_W
            const y1 = from.y + NODE_H / 2
            const x2 = to.x
            const y2 = to.y + NODE_H / 2
            const cx = (x1 + x2) / 2

            return (
              <g key={`${corrId}->${materia.id}`}>
                <defs>
                  <marker
                    id={`arrow-${corrId}-${materia.id}`}
                    markerWidth="8" markerHeight="8"
                    refX="6" refY="3"
                    orient="auto"
                  >
                    <path
                      d="M0,0 L0,6 L8,3 z"
                      fill={isActive ? 'var(--color-primary)' : '#ffffff22'}
                    />
                  </marker>
                </defs>
                <path
                  d={`M${x1},${y1} C${cx},${y1} ${cx},${y2} ${x2},${y2}`}
                  fill="none"
                  stroke={isActive ? 'var(--color-primary)' : '#ffffff15'}
                  strokeWidth={isActive ? 2 : 1}
                  markerEnd={`url(#arrow-${corrId}-${materia.id})`}
                  style={{ transition: 'stroke 0.2s, stroke-width 0.2s' }}
                />
              </g>
            )
          })
        )}

        {/* Nodos */}
        {MATERIAS_INGENIERIA_INFORMATICA.map(materia => {
          const { x, y } = positions[materia.id]
          const colors = AÑO_COLORS[materia.año]
          const isActive = hovered === null || highlightedIds.has(materia.id)
          const isHovered = hovered === materia.id

          return (
            <g
              key={materia.id}
              onMouseEnter={() => setHovered(materia.id)}
              onMouseLeave={() => setHovered(null)}
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
                fontSize={11}
                fontWeight={isHovered ? 700 : 400}
                opacity={isActive ? 1 : 0.3}
                style={{ transition: 'opacity 0.2s', userSelect: 'none', pointerEvents: 'none' }}
              >
                {materia.nombre.length > 22
                  ? materia.nombre.slice(0, 21) + '…'
                  : materia.nombre}
              </text>
            </g>
          )
        })}

        {/* Headers de columnas */}
        {[1, 2, 3, 4, 5].map(año =>
          [1, 2].map(q => {
            const col = (año - 1) * 2 + (q - 1)
            const x = PADDING + col * (COL_WIDTH + COL_GAP) + NODE_W / 2
            return (
              <text
                key={`header-${año}-${q}`}
                x={x}
                y={14}
                textAnchor="middle"
                fontSize={10}
                fontWeight={600}
                fill="var(--color-primary)"
                opacity={0.6}
              >
                Año {año} · Q{q}
              </text>
            )
          })
        )}
      </svg>
    </div>
  )
}
