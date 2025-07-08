import { GoogleGenAI } from '@google/genai';

class GeminiService {
  constructor() {
    const apiKey = import.meta.env.PUBLIC_GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('Gemini API key is not set');
    }
    this.ai = new GoogleGenAI({ apiKey });
  }

  async generateQuiz(theme) {
    const prompt = `
あなたはクイズの出題者です。以下のテーマに関する興味深いクイズを1問作成してください。

テーマ: ${theme}

要求:
1. 問題文は具体的で明確にしてください
2. 難易度は中級程度にしてください
3. 解答は自由記述形式で答えられる問題にしてください
4. 問題文のみを返してください（解答や解説は含めないでください）

問題:`;

    try {
      const response = await this.ai.models.generateContent({
        model: 'gemini-2.0-flash',
        contents: prompt,
      });
      return response.text.trim();
    } catch (error) {
      console.error('Error generating quiz:', error);
      throw new Error('クイズの生成に失敗しました');
    }
  }

  async validateAnswer(question, userAnswer) {
    const prompt = `
以下のクイズ問題に対するユーザーの解答を評価してください。

問題: ${question}
ユーザーの解答: ${userAnswer}

以下のJSON形式で返答してください:
{
  "isCorrect": boolean (正解かどうか),
  "correctAnswer": string (模範解答),
  "explanation": string (解説)
}

注意:
- 完全一致でなくても、意味が正しければ正解としてください
- 部分的に正しい場合も考慮してください
- 解説は分かりやすく、教育的なものにしてください`;

    try {
      const response = await this.ai.models.generateContent({
        model: 'gemini-2.0-flash',
        contents: prompt,
      });
      const text = response.text;
      
      // JSONを抽出
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error) {
      console.error('Error validating answer:', error);
      throw new Error('解答の検証に失敗しました');
    }
  }
}

export default GeminiService;