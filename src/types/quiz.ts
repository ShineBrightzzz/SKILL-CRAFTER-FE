// Backend DTO types for quiz data matching backend QuizQuestionDTO
export interface QuizQuestion {
  question: string;
  options: string[];  // Must contain exactly 4 options
  correctAnswer: number;  // Index of the correct answer (0-3)
  explanation?: string;  // Optional explanation for the correct answer
}

// Matches backend QuizDTO
export interface QuizData {
  questions: QuizQuestion[];
}

// Test case interface for programming lessons
export interface TestCaseDTO {
  id?: string;  // UUID
  lessonId: string;  // UUID
  input: string;
  expectedOutput: string;
  isSample: boolean;
  createdAt?: string;
  updatedAt?: string;
}

// Matches backend LessonUpdateDTO
export interface LessonUpdateDTO {
  title?: string;
  type: number;
  content?: string | null;
  quizData?: QuizData | null;
  videoUrl?: string | null;
  initialCode?: string | null;
  solutionCode?: string | null;
  testCases?: string | null;
  duration?: number | null;
}
