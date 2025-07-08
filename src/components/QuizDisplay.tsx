import { createSignal } from "solid-js";
import type { Component } from "solid-js";

interface Quiz {
  question: string;
}

interface QuizDisplayProps {
  quiz: Quiz;
  onSubmit: (answer: string) => void;
}

const QuizDisplay: Component<QuizDisplayProps> = ({ quiz, onSubmit }) => {
  const [answer, setAnswer] = createSignal<string>("");

  const handleSubmit = (e: Event) => {
    e.preventDefault();
    if (answer().trim()) {
      onSubmit(answer());
    }
  };

  return (
    <div class="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div class="bg-white p-8 rounded-lg shadow-md w-full max-w-2xl">
        <h2 class="text-xl font-semibold text-gray-800 mb-6">問題</h2>
        <p class="text-lg text-gray-700 mb-8 whitespace-pre-wrap">
          {quiz.question}
        </p>
        
        <form onSubmit={handleSubmit}>
          <div class="mb-6">
            <label for="answer" class="block text-sm font-medium text-gray-700 mb-2">
              解答
            </label>
            <textarea
              id="answer"
              value={answer()}
              onInput={(e) => setAnswer(e.currentTarget.value)}
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[100px]"
              placeholder="ここに解答を入力してください"
              required
            />
          </div>
          <button
            type="submit"
            class="w-full bg-green-500 text-white py-2 px-4 rounded-md hover:bg-green-600 transition duration-200"
          >
            解答を送信
          </button>
        </form>
      </div>
    </div>
  );
};

export default QuizDisplay;