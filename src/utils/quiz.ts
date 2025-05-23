import { QuizData, QuizQuestion } from '@/types/quiz';

export interface ValidationResult {
  isValid: boolean;
  data: QuizData | null;
  error?: string;
}

/**
 * Validates and processes quiz data to match backend DTO requirements
 */
export const validateAndProcessQuizData = (data: any): ValidationResult => {
  if (!data) {
    return { isValid: false, data: null, error: 'Quiz data is required' };
  }

  try {
    // Parse string data if needed
    const parsed = typeof data === 'string' ? JSON.parse(data) : data;
    
    // Validate the quiz data structure
    if (!parsed || !Array.isArray(parsed.questions)) {
      return { 
        isValid: false, 
        data: null, 
        error: 'Invalid quiz data structure - missing questions array' 
      };
    }

    // Validate and process each question
    const processedQuestions: QuizQuestion[] = [];
    for (let i = 0; i < parsed.questions.length; i++) {
      const q = parsed.questions[i];
      
      // Validate basic structure
      if (!q.question || !q.options || !Array.isArray(q.options)) {
        return {
          isValid: false,
          data: null,
          error: `Question ${i + 1}: Invalid question format`
        };
      }

      // Trim and validate question text
      const question = q.question.trim();
      if (!question) {
        return {
          isValid: false,
          data: null,
          error: `Question ${i + 1}: Question text is required`
        };
      }

      // Process options
      const options = q.options.map((o: string | null | undefined) => (o || '').toString().trim());
      if (options.length !== 4) {
        return {
          isValid: false,
          data: null,
          error: `Question ${i + 1}: Each question must have exactly 4 options`
        };
      }

      if (options.some((o: string) => !o)) {
        return {
          isValid: false,
          data: null,
          error: `Question ${i + 1}: All options must have content`
        };
      }

      // Validate correctAnswer
      const correctAnswer = Number(q.correctAnswer);
      if (isNaN(correctAnswer) || correctAnswer < 0 || correctAnswer > 3) {
        return {
          isValid: false,
          data: null,
          error: `Question ${i + 1}: Correct answer must be a number between 0-3`
        };
      }

      // Create processed question
      const processedQuestion: QuizQuestion = {
        question,
        options,
        correctAnswer,
        explanation: q.explanation?.trim()
      };

      processedQuestions.push(processedQuestion);
    }

    return {
      isValid: true,
      data: { questions: processedQuestions }
    };
  } catch (error) {
    return {
      isValid: false,
      data: null,
      error: error instanceof Error ? error.message : 'Invalid quiz data'
    };
  }
}
