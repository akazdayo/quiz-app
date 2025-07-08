import { GoogleGenAI } from '@google/genai';

class GeminiService {
  constructor() {
    const apiKey = import.meta.env.PUBLIC_GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('Gemini API key is not set');
    }
    this.ai = new GoogleGenAI({ apiKey });
  }

  async searchWeb(query, options = {}) {
    try {
      const searchPrompt = `
Web検索を実行して、以下のクエリに関する情報を取得してください。

検索クエリ: ${query}

要求:
1. 最新の情報を優先してください
2. 信頼できるソースからの情報を選択してください
3. 簡潔で要点をまとめた形式で結果を返してください

検索結果:`;

      const response = await this.ai.models.generateContent({
        model: 'gemini-2.0-flash',
        contents: searchPrompt,
      });
      
      return {
        query: query,
        results: response.text.trim(),
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error performing web search:', error);
      throw new Error('Web検索に失敗しました');
    }
  }

  async fetchWebContent(url, extractionPrompt = null) {
    try {
      const fetchPrompt = `
以下のURLからコンテンツを取得して分析してください。

URL: ${url}
${extractionPrompt ? `\n抽出したい情報: ${extractionPrompt}` : ''}

要求:
1. 主要なコンテンツを抽出してください
2. 構造化された形式で情報を整理してください
3. 重要なポイントを強調してください

分析結果:`;

      const response = await this.ai.models.generateContent({
        model: 'gemini-2.0-flash',
        contents: fetchPrompt,
      });
      
      return {
        url: url,
        content: response.text.trim(),
        fetchedAt: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error fetching web content:', error);
      throw new Error('Webコンテンツの取得に失敗しました');
    }
  }

  async generateQuiz(theme, useWebSearch = false) {
    let additionalContext = '';
    
    if (useWebSearch) {
      try {
        const searchResults = await this.searchWeb(`${theme} 最新情報 トリビア 面白い事実`);
        additionalContext = `\n\n参考情報（Web検索結果）:\n${searchResults.results}`;
      } catch (error) {
        console.warn('Web search failed, continuing without additional context:', error);
      }
    }
    
    const prompt = `
あなたはクイズの出題者です。以下のテーマに関する興味深いクイズを1問作成してください。

テーマ: ${theme}${additionalContext}

要求:
1. 問題文は具体的で明確にしてください
2. 難易度は中級程度にしてください
3. 解答は自由記述形式で答えられる問題にしてください
4. 問題文のみを返してください（解答や解説は含めないでください）
${useWebSearch ? '5. Web検索で得た最新の情報を活用してください' : ''}

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

  async validateAnswer(question, userAnswer, useWebSearch = false) {
    let additionalInfo = '';
    
    if (useWebSearch) {
      try {
        const searchQuery = `${question.slice(0, 50)} 正解 答え 解説`;
        const searchResults = await this.searchWeb(searchQuery);
        additionalInfo = `\n\n参考情報（Web検索結果）:\n${searchResults.results}`;
      } catch (error) {
        console.warn('Web search for validation failed:', error);
      }
    }
    
    const prompt = `
以下のクイズ問題に対するユーザーの解答を評価してください。

問題: ${question}
ユーザーの解答: ${userAnswer}${additionalInfo}

以下のJSON形式で返答してください:
{
  "isCorrect": boolean (正解かどうか),
  "correctAnswer": string (模範解答),
  "explanation": string (解説)
}

注意:
- 完全一致でなくても、意味が正しければ正解としてください
- 部分的に正しい場合も考慮してください
- 解説は分かりやすく、教育的なものにしてください
${useWebSearch ? '- Web検索の結果も参考にして、より正確な評価を行ってください' : ''}`;

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

  async generateEnhancedQuiz(theme, options = {}) {
    const { 
      searchForContext = true, 
      fetchSpecificUrl = null,
      difficulty = '中級',
      questionType = '自由記述'
    } = options;

    let contextData = '';
    
    if (searchForContext) {
      try {
        const searchResults = await this.searchWeb(`${theme} 最新情報 興味深い事実 統計 トレンド 2024`);
        contextData += `\n\nWeb検索結果:\n${searchResults.results}`;
      } catch (error) {
        console.warn('Context search failed:', error);
      }
    }
    
    if (fetchSpecificUrl) {
      try {
        const fetchedContent = await this.fetchWebContent(
          fetchSpecificUrl, 
          `${theme}に関する重要な情報や興味深い事実を抽出してください`
        );
        contextData += `\n\n抽出されたWebコンテンツ:\n${fetchedContent.content}`;
      } catch (error) {
        console.warn('URL fetch failed:', error);
      }
    }
    
    const prompt = `
あなたは知識豊富なクイズ出題者です。以下のテーマと情報を基に、興味深くて教育的なクイズを作成してください。

テーマ: ${theme}
難易度: ${difficulty}
問題形式: ${questionType}${contextData}

要求:
1. 最新の情報や興味深い事実を活用してください
2. 問題文は具体的で明確にしてください
3. 学習価値の高い問題を作成してください
4. 回答者が考えさせられる問題にしてください
5. 問題文のみを返してください（解答や解説は含めないでください）

問題:`;

    try {
      const response = await this.ai.models.generateContent({
        model: 'gemini-2.0-flash',
        contents: prompt,
      });
      return response.text.trim();
    } catch (error) {
      console.error('Error generating enhanced quiz:', error);
      throw new Error('拡張クイズの生成に失敗しました');
    }
  }

  async researchTopic(topic, depth = 'normal') {
    const queries = depth === 'deep' 
      ? [
          `${topic} 基本情報 概要`,
          `${topic} 最新ニュース 2024`,
          `${topic} 統計データ 数値`,
          `${topic} 専門家の見解`,
          `${topic} よくある誤解 正しい理解`
        ]
      : [`${topic} 重要情報 まとめ`];
    
    const results = [];
    
    for (const query of queries) {
      try {
        const searchResult = await this.searchWeb(query);
        results.push({
          query: query,
          findings: searchResult.results
        });
      } catch (error) {
        console.warn(`Search failed for query "${query}":`, error);
      }
    }
    
    return {
      topic: topic,
      depth: depth,
      researchResults: results,
      timestamp: new Date().toISOString()
    };
  }
}

export default GeminiService;