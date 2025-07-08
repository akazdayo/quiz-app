const API_BASE = '/api/quiz';

export async function generateQuiz(theme, useWebSearch = false) {
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

export async function validateAnswer(question, userAnswer, useWebSearch = false) {
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