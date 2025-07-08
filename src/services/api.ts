const API_BASE = '/api/quiz';

export async function generateQuiz(theme: string, useWebSearch: boolean = false): Promise<string> {
  const response = await fetch(`${API_BASE}/generate.json`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ theme, useWebSearch }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'クイズの生成に失敗しました');
  }

  const data = await response.json();
  return data.question;
}

export interface ValidationResult {
  isCorrect: boolean;
  correctAnswer: string;
  explanation: string;
}

export async function validateAnswer(
  question: string, 
  userAnswer: string, 
  useWebSearch: boolean = false
): Promise<ValidationResult> {
  const response = await fetch(`${API_BASE}/validate.json`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ question, userAnswer, useWebSearch }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || '解答の検証に失敗しました');
  }

  return await response.json();
}