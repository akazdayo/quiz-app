import GeminiService from '../../../services/geminiService.js';

export const prerender = false;

export async function POST({ request }) {
  try {
    const { theme, useWebSearch } = await request.json();
    
    if (!theme) {
      return new Response(JSON.stringify({ error: 'テーマが指定されていません' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const geminiService = new GeminiService();
    const question = await geminiService.generateQuiz(theme, useWebSearch);
    
    return new Response(JSON.stringify({ question }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Quiz generation error:', error);
    return new Response(JSON.stringify({ error: 'クイズの生成に失敗しました' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}