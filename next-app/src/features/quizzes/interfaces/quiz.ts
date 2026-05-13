export interface Quiz {
  id: string;
  title: string;

  description?: string;
  image?: string;

  subject?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  tags?: string[];

  // ⏱️ Tiempo
  timeLimit?: number; // tiempo total del quiz
  timeMode?: 'per_question' | 'global' | 'none';

  scoringMode?: 'standard' | 'kahoot';

  // 🎲 Aleatorización
  randomizeQuestions?: boolean;
  randomizeAnswers?: boolean;
  randomSeed?: string;

  // 🧠 Pool de preguntas (opcional)
  questionPool?: {
    pick: number; // cantidad a seleccionar
    questions: Question[];
  };

  // Si no hay pool, usa estas directamente
  questions?: Question[];
}

export interface Question {
  id: string;
  question: string;
  description?: string;
  order: number;

  points: number;
  timeLimit?: number; // usado si per_question o hybrid

  markdown?: string;
  explanation?: string;
  image?: string;

  type: QuizType;

  answers?: Answer[];
}

export interface Answer {
  id?: string;
  image?: string;
  text: string;
  isCorrect: boolean;
  explanation?: string;
// 🔽 Para preguntas tipo ordenar (drag & drop)
  drag: boolean;
  correctOrder: number;
}

export type QuizType =
  | 'Single'
  | 'MultipleChoice'
  | 'TrueOrFalse'
  | 'ShortAnswer'
  | 'DragAndDropOrder';