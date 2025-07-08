import { createSignal } from "solid-js";

export default function ThemeInput({ onSubmit }) {
  const [theme, setTheme] = createSignal("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (theme().trim()) {
      onSubmit(theme());
    }
  };

  return (
    <div class="min-h-screen bg-gray-50 flex items-center justify-center">
      <div class="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h1 class="text-2xl font-bold text-gray-800 mb-6 text-center">
          クイズのテーマを入力してください
        </h1>
        <form onSubmit={handleSubmit}>
          <div class="mb-4">
            <label for="theme" class="block text-sm font-medium text-gray-700 mb-2">
              テーマ
            </label>
            <input
              id="theme"
              type="text"
              value={theme()}
              onInput={(e) => setTheme(e.target.value)}
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="例: 日本の歴史、プログラミング、科学"
              required
            />
          </div>
          <button
            type="submit"
            class="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition duration-200"
          >
            クイズを生成
          </button>
        </form>
      </div>
    </div>
  );
}