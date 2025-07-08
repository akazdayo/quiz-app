import type { Component } from "solid-js";

interface Result {
  question: string;
  userAnswer: string;
  isCorrect: boolean;
  correctAnswer: string;
  explanation: string;
}

interface ResultDisplayProps {
  result: Result;
  onNewQuiz: () => void;
}

const ResultDisplay: Component<ResultDisplayProps> = ({ result, onNewQuiz }) => {
  return (
    <div class="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div class="bg-white p-8 rounded-lg shadow-md w-full max-w-2xl">
        <h2 class="text-2xl font-bold text-gray-800 mb-6 text-center">
          判定結果
        </h2>
        
        <div class={`mb-6 p-4 rounded-lg ${
          result.isCorrect ? 'bg-green-100 border-green-400' : 'bg-red-100 border-red-400'
        } border-2`}>
          <p class="text-xl font-semibold text-center">
            {result.isCorrect ? '正解！' : '不正解'}
          </p>
        </div>

        <div class="space-y-4 mb-6">
          <div>
            <h3 class="font-semibold text-gray-700 mb-2">問題:</h3>
            <p class="text-gray-600 whitespace-pre-wrap">{result.question}</p>
          </div>
          
          <div>
            <h3 class="font-semibold text-gray-700 mb-2">あなたの解答:</h3>
            <p class="text-gray-600 whitespace-pre-wrap">{result.userAnswer}</p>
          </div>
          
          <div>
            <h3 class="font-semibold text-gray-700 mb-2">正解例:</h3>
            <p class="text-gray-600 whitespace-pre-wrap">{result.correctAnswer}</p>
          </div>
          
          {result.explanation && (
            <div>
              <h3 class="font-semibold text-gray-700 mb-2">解説:</h3>
              <p class="text-gray-600 whitespace-pre-wrap">{result.explanation}</p>
            </div>
          )}
        </div>

        <button
          onClick={onNewQuiz}
          class="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition duration-200"
        >
          新しいクイズを始める
        </button>
      </div>
    </div>
  );
};

export default ResultDisplay;