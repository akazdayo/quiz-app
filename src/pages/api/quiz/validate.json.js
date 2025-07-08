import GeminiService from '../../../services/geminiService.js';

export const prerender = false;

export async function POST({ request }) {
  try {
    const { question, userAnswer, useWebSearch } = await request.json();
    
    if (!question || !userAnswer) {
      return new Response(JSON.stringify({ error: '問題と解答の両方が必要です' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const geminiService = new GeminiService();
    const result = await geminiService.validateAnswer(question, userAnswer, useWebSearch);
    
    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Answer validation error:', error);
    return new Response(JSON.stringify({ error: '解答の検証に失敗しました' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}