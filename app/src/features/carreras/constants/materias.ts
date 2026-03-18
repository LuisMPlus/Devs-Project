export interface Materia {
  id: string
  nombre: string
  año: number
  cuatrimestre: 1 | 2
  correlativas: string[] // ids de materias prerequisito
}

export const MATERIAS_INGENIERIA_INFORMATICA: Materia[] = [
  // ── AÑO 1 ──────────────────────────────────────────────────────────
  { id: 'alg', nombre: 'Álgebra', año: 1, cuatrimestre: 1, correlativas: [] },
  { id: 'anm1', nombre: 'Análisis Matemático I', año: 1, cuatrimestre: 1, correlativas: [] },
  { id: 'prog1', nombre: 'Programación I', año: 1, cuatrimestre: 1, correlativas: [] },
  { id: 'org', nombre: 'Organización del Computador', año: 1, cuatrimestre: 1, correlativas: [] },

  { id: 'discreta', nombre: 'Matemática Discreta', año: 1, cuatrimestre: 2, correlativas: ['alg'] },
  { id: 'anm2', nombre: 'Análisis Matemático II', año: 1, cuatrimestre: 2, correlativas: ['anm1'] },
  { id: 'prog2', nombre: 'Programación II', año: 1, cuatrimestre: 2, correlativas: ['prog1'] },
  { id: 'arq', nombre: 'Arquitectura de Computadoras', año: 1, cuatrimestre: 2, correlativas: ['org'] },

  // ── AÑO 2 ──────────────────────────────────────────────────────────
  { id: 'edd', nombre: 'Estructuras de Datos', año: 2, cuatrimestre: 1, correlativas: ['prog2', 'discreta'] },
  { id: 'prob', nombre: 'Probabilidad y Estadística', año: 2, cuatrimestre: 1, correlativas: ['anm2'] },
  { id: 'sist', nombre: 'Sistemas Operativos', año: 2, cuatrimestre: 1, correlativas: ['arq'] },
  { id: 'bd1', nombre: 'Bases de Datos I', año: 2, cuatrimestre: 1, correlativas: ['prog2'] },

  { id: 'algo', nombre: 'Algoritmos y Complejidad', año: 2, cuatrimestre: 2, correlativas: ['edd'] },
  { id: 'redes', nombre: 'Redes de Computadoras', año: 2, cuatrimestre: 2, correlativas: ['sist'] },
  { id: 'bd2', nombre: 'Bases de Datos II', año: 2, cuatrimestre: 2, correlativas: ['bd1'] },
  { id: 'ing_soft', nombre: 'Ingeniería de Software', año: 2, cuatrimestre: 2, correlativas: ['prog2'] },

  // ── AÑO 3 ──────────────────────────────────────────────────────────
  { id: 'comp', nombre: 'Compiladores', año: 3, cuatrimestre: 1, correlativas: ['algo', 'discreta'] },
  { id: 'ia', nombre: 'Inteligencia Artificial', año: 3, cuatrimestre: 1, correlativas: ['prob', 'algo'] },
  { id: 'seg', nombre: 'Seguridad Informática', año: 3, cuatrimestre: 1, correlativas: ['redes', 'sist'] },
  { id: 'poo', nombre: 'Paradigmas de Programación', año: 3, cuatrimestre: 1, correlativas: ['ing_soft'] },

  { id: 'dist', nombre: 'Sistemas Distribuidos', año: 3, cuatrimestre: 2, correlativas: ['redes', 'sist'] },
  { id: 'ml', nombre: 'Aprendizaje Automático', año: 3, cuatrimestre: 2, correlativas: ['ia', 'prob'] },
  { id: 'arq_soft', nombre: 'Arquitectura de Software', año: 3, cuatrimestre: 2, correlativas: ['ing_soft', 'bd2'] },
  { id: 'ux', nombre: 'Diseño UX/UI', año: 3, cuatrimestre: 2, correlativas: ['ing_soft'] },

  // ── AÑO 4 ──────────────────────────────────────────────────────────
  { id: 'cloud', nombre: 'Computación en la Nube', año: 4, cuatrimestre: 1, correlativas: ['dist'] },
  { id: 'vision', nombre: 'Visión por Computadora', año: 4, cuatrimestre: 1, correlativas: ['ml'] },
  { id: 'devops', nombre: 'DevOps y CI/CD', año: 4, cuatrimestre: 1, correlativas: ['arq_soft', 'dist'] },
  { id: 'blockchain', nombre: 'Blockchain y Criptografía', año: 4, cuatrimestre: 1, correlativas: ['seg'] },

  { id: 'nlp', nombre: 'Procesamiento del Lenguaje Natural', año: 4, cuatrimestre: 2, correlativas: ['ml'] },
  { id: 'iot', nombre: 'Internet de las Cosas', año: 4, cuatrimestre: 2, correlativas: ['cloud', 'redes'] },
  { id: 'lega', nombre: 'Legislación y Ética Informática', año: 4, cuatrimestre: 2, correlativas: [] },
  { id: 'tesis_p', nombre: 'Seminario de Tesis', año: 4, cuatrimestre: 2, correlativas: ['arq_soft'] },

  // ── AÑO 5 ──────────────────────────────────────────────────────────
  { id: 'robotica', nombre: 'Robótica e IA Aplicada', año: 5, cuatrimestre: 1, correlativas: ['vision', 'iot'] },
  { id: 'gestion', nombre: 'Gestión de Proyectos IT', año: 5, cuatrimestre: 1, correlativas: ['devops', 'lega'] },
  { id: 'seg_adv', nombre: 'Ciberseguridad Avanzada', año: 5, cuatrimestre: 1, correlativas: ['blockchain', 'seg'] },
  { id: 'data_eng', nombre: 'Ingeniería de Datos', año: 5, cuatrimestre: 1, correlativas: ['nlp', 'cloud'] },

  { id: 'startup', nombre: 'Emprendimiento Tecnológico', año: 5, cuatrimestre: 2, correlativas: ['gestion', 'lega'] },
  { id: 'tesis', nombre: 'Tesis Final', año: 5, cuatrimestre: 2, correlativas: ['tesis_p', 'gestion'] },
  { id: 'practica', nombre: 'Práctica Profesional', año: 5, cuatrimestre: 2, correlativas: ['tesis_p'] },
  { id: 'seminario', nombre: 'Seminario de Especialización', año: 5, cuatrimestre: 2, correlativas: ['seg_adv', 'data_eng'] },
]

export const AÑOS = [1, 2, 3, 4, 5] as const
export const CUATRIMESTRES = [1, 2] as const
