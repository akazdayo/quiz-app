# AIクイズアプリ

Gemini APIを使用して自動生成されるクイズアプリケーションです。

## 機能

- ユーザーが指定したテーマに基づいてAIがクイズを自動生成
- 自由記述形式の解答入力
- AIによる動的な正誤判定
- 正解・不正解の表示と解説

## 技術スタック

- Astro
- Solid.js
- Tailwind CSS
- Google Gemini API (Gemini 2.5 Flash)
- Playwright (E2Eテスト)

## セットアップ

1. 依存関係のインストール
```bash
pnpm install
```

2. Gemini APIキーの設定
   - [Google AI Studio](https://aistudio.google.com/apikey)でAPIキーを取得
   - `.env`ファイルにAPIキーを設定:
```
PUBLIC_GEMINI_API_KEY=your-api-key-here
```

3. 開発サーバーの起動
```bash
pnpm run dev
```

## 使い方

1. アプリケーションにアクセス（デフォルト: http://localhost:4321）
2. クイズのテーマを入力（例：日本の歴史、プログラミング、科学）
3. 生成されたクイズに解答を入力
4. 解答を送信して正誤判定を確認

## テスト

### E2Eテストの実行
```bash
pnpm run test
```

### UIモードでテストを実行
```bash
pnpm run test:ui
```

## プロジェクト構成

```
quiz-app/
├── src/
│   ├── components/
│   │   ├── QuizApp.jsx        # メインアプリケーションコンポーネント
│   │   ├── ThemeInput.jsx     # テーマ入力画面
│   │   ├── QuizDisplay.jsx    # クイズ表示・解答画面
│   │   └── ResultDisplay.jsx  # 結果表示画面
│   ├── services/
│   │   └── geminiService.js   # Gemini API連携サービス
│   ├── pages/
│   │   └── index.astro        # メインページ
│   └── styles/
│       └── global.css         # グローバルスタイル
├── tests/
│   └── quiz-app.spec.js       # E2Eテスト
├── .env                       # 環境変数（gitignore対象）
└── playwright.config.js       # Playwrightの設定
```

## 注意事項

- Gemini APIの利用にはAPIキーが必要です
- APIキーは`.env`ファイルに保存し、Gitにコミットしないでください
- テスト実行時はAPIのモックを使用しているため、実際のAPIコールは発生しません