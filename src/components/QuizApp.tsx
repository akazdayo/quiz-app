import { createSignal, Show } from "solid-js";
import type { Component } from "solid-js";
import ThemeInput from "./ThemeInput";
import QuizDisplay from "./QuizDisplay";
import ResultDisplay from "./ResultDisplay";
import { generateQuiz, validateAnswer } from "../services/api";
import type { ValidationResult } from "../services/api";

type Screen = "theme" | "quiz" | "result";

interface Quiz {
  question: string;
}

interface Result extends ValidationResult {
  question: string;
  userAnswer: string;
}

const QuizApp: Component = () => {
  const [screen, setScreen] = createSignal<Screen>("theme");
  const [theme, setTheme] = createSignal<string>("");
  const [quiz, setQuiz] = createSignal<Quiz | null>(null);
  const [result, setResult] = createSignal<Result | null>(null);
  const [loading, setLoading] = createSignal<boolean>(false);
  const [error, setError] = createSignal<string>("");

  const handleThemeSubmit = async (submittedTheme: string) => {
    setTheme(submittedTheme);
    setLoading(true);
    setError("");

    try {
      const question = await generateQuiz(submittedTheme, false);
      setQuiz({ question });
      setScreen("quiz");
    } catch (err) {
      setError(err instanceof Error ? err.message : "エラーが発生しました");
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerSubmit = async (answer: string) => {
    setLoading(true);
    setError("");

    try {
      const currentQuiz = quiz();
      if (!currentQuiz) return;
      
      const validation = await validateAnswer(currentQuiz.question, answer, false);
      setResult({
        question: currentQuiz.question,
        userAnswer: answer,
        ...validation
      });
      setScreen("result");
    } catch (err) {
      setError(err instanceof Error ? err.message : "エラーが発生しました");
    } finally {
      setLoading(false);
    }
  };

  const handleNewQuiz = () => {
    setQuiz(null);
    setResult(null);
    setTheme("");
    setScreen("theme");
  };

  return (
    <>
      <Show when={loading()}>
        <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div class="bg-white p-6 rounded-lg">
            <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
            <p class="mt-4 text-gray-700">処理中...</p>
          </div>
        </div>
      </Show>

      <Show when={error()}>
        <div class="fixed top-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded z-50">
          <p>{error()}</p>
          <button
            onClick={() => setError("")}
            class="ml-4 text-red-700 hover:text-red-900"
          >
            ✕
          </button>
        </div>
      </Show>

      <Show when={screen() === "theme"}>
        <ThemeInput onSubmit={handleThemeSubmit} />
      </Show>

      <Show when={screen() === "quiz" && quiz()}>
        <QuizDisplay quiz={quiz()!} onSubmit={handleAnswerSubmit} />
      </Show>

      <Show when={screen() === "result" && result()}>
        <ResultDisplay result={result()!} onNewQuiz={handleNewQuiz} />
      </Show>
    </>
  );
};

export default QuizApp;