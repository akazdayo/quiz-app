import { createSignal, Show } from "solid-js";
import ThemeInput from "./ThemeInput";
import QuizDisplay from "./QuizDisplay";
import ResultDisplay from "./ResultDisplay";
import { generateQuiz, validateAnswer } from "../services/api";

export default function QuizApp() {
  const [screen, setScreen] = createSignal("theme"); // theme, quiz, result
  const [theme, setTheme] = createSignal("");
  const [quiz, setQuiz] = createSignal(null);
  const [result, setResult] = createSignal(null);
  const [loading, setLoading] = createSignal(false);
  const [error, setError] = createSignal("");

  const handleThemeSubmit = async (submittedTheme) => {
    setTheme(submittedTheme);
    setLoading(true);
    setError("");

    try {
      const question = await generateQuiz(submittedTheme, false);
      setQuiz({ question });
      setScreen("quiz");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerSubmit = async (answer) => {
    setLoading(true);
    setError("");

    try {
      const validation = await validateAnswer(quiz().question, answer, false);
      setResult({
        question: quiz().question,
        userAnswer: answer,
        ...validation
      });
      setScreen("result");
    } catch (err) {
      setError(err.message);
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
        <QuizDisplay quiz={quiz()} onSubmit={handleAnswerSubmit} />
      </Show>

      <Show when={screen() === "result" && result()}>
        <ResultDisplay result={result()} onNewQuiz={handleNewQuiz} />
      </Show>
    </>
  );
}