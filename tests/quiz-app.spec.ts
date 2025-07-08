import { test, expect } from '@playwright/test';

test.describe('Quiz App E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Disable Astro dev toolbar
    await page.addInitScript(() => {
      (window as any).__astro_dev_toolbar__ = null;
    });
    await page.goto('/');
  });

  test('should display theme input page on initial load', async ({ page }) => {
    await expect(page.locator('.bg-white h1').first()).toHaveText('クイズのテーマを入力してください');
    await expect(page.locator('input#theme')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toHaveText('クイズを生成');
  });

  test('should not submit empty theme', async ({ page }) => {
    await page.locator('button[type="submit"]').click();
    
    // Check that we're still on the theme input page
    const h1 = page.locator('.bg-white h1').first();
    await expect(h1).toHaveText('クイズのテーマを入力してください');
  });

  test('should generate quiz after theme submission', async ({ page }) => {
    // Mock the API response for faster testing
    await page.route('**/*', async route => {
      const url = route.request().url();
      if (url.includes('/api/quiz/generate.json')) {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            question: '日本で最も高い山は何という山ですか？'
          })
        });
      } else {
        await route.continue();
      }
    });

    // Enter theme and submit
    await page.locator('input#theme').fill('日本の地理');
    await page.locator('button[type="submit"]').click();

    // Wait for loading to complete
    await page.waitForSelector('text=処理中...', { state: 'hidden' });

    // Check quiz display
    await expect(page.locator('.bg-white h2').first()).toHaveText('問題');
    await expect(page.locator('p.text-lg.text-gray-700')).toContainText('日本で最も高い山は何という山ですか？');
    await expect(page.locator('textarea#answer')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toHaveText('解答を送信');
  });

  test('should validate answer and show result', async ({ page }) => {
    // Mock API responses
    await page.route('**/*', async route => {
      const url = route.request().url();
      if (url.includes('/api/quiz/generate.json')) {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            question: '日本で最も高い山は何という山ですか？'
          })
        });
      } else if (url.includes('/api/quiz/validate.json')) {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            isCorrect: true,
            correctAnswer: '富士山',
            explanation: '日本で最も高い山は富士山で、標高3,776メートルです。'
          })
        });
      } else {
        await route.continue();
      }
    });

    // Generate quiz
    await page.locator('input#theme').fill('日本の地理');
    await page.locator('button[type="submit"]').click();
    await page.waitForSelector('text=処理中...', { state: 'hidden' });

    // Submit answer
    await page.locator('textarea#answer').fill('富士山');
    await page.locator('button[type="submit"]').click();
    await page.waitForSelector('text=処理中...', { state: 'hidden' });

    // Check result display
    await expect(page.locator('.bg-white h2').first()).toHaveText('判定結果');
    await expect(page.locator('p.text-xl')).toHaveText('正解！');
    await expect(page.locator('text=あなたの解答:')).toBeVisible();
    await expect(page.locator('text=富士山').nth(1)).toBeVisible();
    await expect(page.locator('text=正解例:')).toBeVisible();
    await expect(page.locator('p').filter({ hasText: '日本で最も高い山は富士山で、標高3,776メートルです。' })).toBeVisible();
  });

  test('should handle incorrect answer', async ({ page }) => {
    // Mock API responses
    await page.route('**/*', async route => {
      const url = route.request().url();
      if (url.includes('/api/quiz/generate.json')) {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            question: '日本で最も高い山は何という山ですか？'
          })
        });
      } else if (url.includes('/api/quiz/validate.json')) {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            isCorrect: false,
            correctAnswer: '富士山',
            explanation: '日本で最も高い山は富士山です。エベレストは世界最高峰ですが、ネパールとチベットの国境にあります。'
          })
        });
      } else {
        await route.continue();
      }
    });

    // Generate quiz
    await page.locator('input#theme').fill('日本の地理');
    await page.locator('button[type="submit"]').click();
    
    // Wait for quiz screen to appear
    await page.waitForSelector('textarea#answer', { state: 'visible' });

    // Submit wrong answer
    await page.locator('textarea#answer').fill('エベレスト');
    await page.locator('button[type="submit"]').click();
    await page.waitForSelector('text=処理中...', { state: 'hidden' });

    // Check result display for incorrect answer
    await expect(page.locator('.bg-white h2').first()).toHaveText('判定結果');
    await expect(page.locator('p.text-xl')).toHaveText('不正解');
    await expect(page.locator('text=あなたの解答:')).toBeVisible();
    await expect(page.locator('text=エベレスト').first()).toBeVisible();
    await expect(page.locator('text=正解例:')).toBeVisible();
    await expect(page.locator('p').filter({ hasText: '日本で最も高い山は富士山です。エベレストは世界最高峰ですが、ネパールとチベットの国境にあります。' })).toBeVisible();
  });

  test('should return to theme input after clicking new quiz button', async ({ page }) => {
    // Mock API responses
    await page.route('**/*', async route => {
      const url = route.request().url();
      if (url.includes('/api/quiz/generate.json')) {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            question: 'テスト問題'
          })
        });
      } else if (url.includes('/api/quiz/validate.json')) {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            isCorrect: true,
            correctAnswer: 'テスト正解',
            explanation: 'テスト解説'
          })
        });
      } else {
        await route.continue();
      }
    });

    // Generate quiz
    await page.locator('input#theme').fill('テスト');
    await page.locator('button[type="submit"]').click();
    
    // Wait for quiz screen to appear
    await page.waitForSelector('textarea#answer', { state: 'visible' });

    await page.locator('textarea#answer').fill('テスト解答');
    await page.locator('button[type="submit"]').click();
    await page.waitForSelector('text=処理中...', { state: 'hidden' });

    // Click new quiz button
    await page.locator('button').filter({ hasText: '新しいクイズを始める' }).click();

    // Check we're back at theme input
    await expect(page.locator('.bg-white h1').first()).toHaveText('クイズのテーマを入力してください');
    await expect(page.locator('input#theme')).toBeVisible();
    await expect(page.locator('input#theme')).toHaveValue('');
  });

  test('should display error message when API fails', async ({ page }) => {
    // Mock API to return error
    await page.route('**/*', async route => {
      const url = route.request().url();
      if (url.includes('/api/quiz/generate.json')) {
        await route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify({
            error: 'クイズの生成に失敗しました'
          })
        });
      } else {
        await route.continue();
      }
    });

    // Try to generate quiz
    await page.locator('input#theme').fill('テスト');
    await page.locator('button[type="submit"]').click();
    
    // Wait for loading to complete
    await page.waitForSelector('text=処理中...', { state: 'hidden' });

    // Check error message is displayed
    await expect(page.locator('.bg-red-100').filter({ hasText: 'クイズの生成に失敗しました' })).toBeVisible();
    
    // Should stay on theme input page
    await expect(page.locator('.bg-white h1').first()).toHaveText('クイズのテーマを入力してください');
  });
});