'use client'

import { useState } from 'react';

import { QuizData } from '@/types/quiz';

interface QuizProps {
  data: QuizData;
  onComplete?: (success: boolean) => void;
}

export default function Quiz({ data, onComplete }: QuizProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>(new Array(data.questions.length).fill(-1));
  const [showResults, setShowResults] = useState(false);

  const handleAnswerSelect = (optionIndex: number) => {
    const newAnswers = [...selectedAnswers];
    newAnswers[currentQuestion] = optionIndex;
    setSelectedAnswers(newAnswers);
  };
  const handleNext = () => {
    if (currentQuestion < data.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      const score = calculateScore();
      setShowResults(true);
      
      // Check if all answers are correct and call onComplete if provided
      if (onComplete && score === 100) {
        onComplete(true);
      }
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const handleRetry = () => {
    setCurrentQuestion(0);
    setSelectedAnswers(new Array(data.questions.length).fill(-1));
    setShowResults(false);
  };

  const calculateScore = () => {
    let correct = 0;
    selectedAnswers.forEach((answer, index) => {
      if (answer === data.questions[index].correctAnswer) {
        correct++;
      }
    });
    return Math.round((correct / data.questions.length) * 100);
  };
  if (showResults) {
    const score = calculateScore();
    const allCorrect = score === 100;

    return (
      <div className="bg-white rounded-lg p-6 shadow-lg">
        <h3 className="text-2xl font-bold mb-4">Kết quả</h3>
        <div className="text-center mb-6">
          <div className={`text-4xl font-bold ${allCorrect ? 'text-green-600' : 'text-blue-600'} mb-2`}>{score}%</div>
          <p className="text-gray-600">
            Bạn trả lời đúng {selectedAnswers.filter((answer, index) => answer === data.questions[index].correctAnswer).length}/{data.questions.length} câu hỏi
          </p>
          {allCorrect && (
            <p className="mt-2 text-green-600 font-medium">
              Chúc mừng! Bạn đã hoàn thành xuất sắc bài trắc nghiệm này.
            </p>
          )}
        </div>
        {data.questions.map((question, index) => (
          <div key={index} className="mb-6 p-4 rounded-lg bg-gray-50">
            <p className="font-medium mb-2">{index + 1}. {question.question}</p>
            <div className="space-y-2">
              {question.options.map((option, optionIndex) => (
                <div
                  key={optionIndex}
                  className={`p-3 rounded-lg ${
                    optionIndex === question.correctAnswer
                      ? 'bg-green-100 text-green-800'
                      : selectedAnswers[index] === optionIndex
                      ? 'bg-red-100 text-red-800'
                      : 'bg-white'
                  }`}
                >
                  {option}
                </div>
              ))}
            </div>            
            {selectedAnswers[index] !== question.correctAnswer && question.explanation && (
              <div className="mt-2 text-sm text-gray-600">
                <span className="font-medium">Giải thích:</span> {question.explanation}
              </div>
            )}
          </div>
        ))}
        <button
          onClick={handleRetry}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition"
        >
          Làm lại
        </button>
      </div>
    );
  }

  const currentQuestionData = data.questions[currentQuestion];

  return (
    <div className="bg-white rounded-lg p-6 shadow-lg">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold">Câu hỏi {currentQuestion + 1}/{data.questions.length}</h3>
        <div className="text-sm text-gray-500">
          {selectedAnswers.filter(a => a !== -1).length}/{data.questions.length} câu đã trả lời
        </div>
      </div>
      
      <div className="mb-6">
        <p className="text-lg font-medium mb-4">{currentQuestionData.question}</p>
        <div className="space-y-3">
          {currentQuestionData.options.map((option, index) => (
            <button
              key={index}
              className={`w-full p-4 text-left rounded-lg border transition ${
                selectedAnswers[currentQuestion] === index
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-blue-300'
              }`}
              onClick={() => handleAnswerSelect(index)}
            >
              {option}
            </button>
          ))}
        </div>
      </div>

      <div className="flex justify-between gap-4">
        <button
          onClick={handlePrevious}
          disabled={currentQuestion === 0}
          className={`px-6 py-2 rounded-lg ${
            currentQuestion === 0
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Trước
        </button>
        <button
          onClick={handleNext}
          disabled={selectedAnswers[currentQuestion] === -1}
          className={`px-6 py-2 rounded-lg ${
            selectedAnswers[currentQuestion] === -1
              ? 'bg-blue-100 text-blue-400 cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
        >
          {currentQuestion === data.questions.length - 1 ? 'Nộp bài' : 'Tiếp theo'}
        </button>
      </div>
    </div>
  );
}
