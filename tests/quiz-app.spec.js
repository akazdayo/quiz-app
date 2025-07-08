import { test, expect } from '@playwright/test';

test.describe('Quiz App E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Disable Astro dev toolbar
    await page.addInitScript(() => {
      window.__astro_dev_toolbar__ = null;
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
      if (url.includes('generativelanguage.googleapis.com') || url.includes('generateContent')) {
        const request = route.request();
        const postData = request.postData();
        
        if (postData && postData.includes('クイズを1問作成してください')) {
          await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({
              candidates: [{
                content: {
                  parts: [{
                    text: '日本で最も高い山は何という山ですか？'
                  }],
                  role: 'model'
                },
                finishReason: 'STOP',
                safetyRatings: []
              }]
            })
          });
        } else {
          await route.continue();
        }
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
      if (url.includes('generativelanguage.googleapis.com') || url.includes('generateContent')) {
        const request = route.request();
        const postData = request.postData();
        
        if (postData && postData.includes('クイズを1問作成してください')) {
          await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({
              candidates: [{
                content: {
                  parts: [{
                    text: '日本で最も高い山は何という山ですか？'
                  }],
                  role: 'model'
                },
                finishReason: 'STOP',
                safetyRatings: []
              }]
            })
          });
        } else if (postData && postData.includes('ユーザーの解答を評価してください')) {
          await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({
              candidates: [{
                content: {
                  parts: [{
                    text: `{
                      "isCorrect": true,
                      "correctAnswer": "富士山",
                      "explanation": "正解です！富士山は標高3,776メートルで、日本最高峰の山です。"
                    }`
                  }],
                  role: 'model'
                },
                finishReason: 'STOP',
                safetyRatings: []
              }]
            })
          });
        } else {
          await route.continue();
        }
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
    await expect(page.locator('text=正解！')).toBeVisible();
    await expect(page.locator('text=あなたの解答:')).toBeVisible();
    await expect(page.locator('text=富士山').nth(1)).toBeVisible();
    await expect(page.locator('.bg-white button')).toHaveText('新しいクイズを始める');
  });

  test('should handle incorrect answer', async ({ page }) => {
    // Mock API responses
    await page.route('**/*', async route => {
      const url = route.request().url();
      if (url.includes('generativelanguage.googleapis.com') || url.includes('generateContent')) {
        const request = route.request();
        const postData = request.postData();
        
        if (postData && postData.includes('クイズを1問作成してください')) {
          await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({
              candidates: [{
                content: {
                  parts: [{
                    text: '日本で最も高い山は何という山ですか？'
                  }],
                  role: 'model'
                },
                finishReason: 'STOP',
                safetyRatings: []
              }]
            })
          });
        } else if (postData && postData.includes('ユーザーの解答を評価してください')) {
          await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({
              candidates: [{
                content: {
                  parts: [{
                    text: `{
                      "isCorrect": false,
                      "correctAnswer": "富士山",
                      "explanation": "残念ながら不正解です。日本最高峰は富士山（3,776m）です。"
                    }`
                  }],
                  role: 'model'
                },
                finishReason: 'STOP',
                safetyRatings: []
              }]
            })
          });
        } else {
          await route.continue();
        }
      } else {
        await route.continue();
      }
    });

    // Generate quiz
    await page.locator('input#theme').fill('日本の地理');
    await page.locator('button[type="submit"]').click();
    await page.waitForSelector('text=処理中...', { state: 'hidden' });
    
    // Wait for quiz screen to appear
    await page.waitForSelector('textarea#answer', { state: 'visible' });

    // Submit wrong answer
    await page.locator('textarea#answer').fill('エベレスト');
    await page.locator('button[type="submit"]').click();
    await page.waitForSelector('text=処理中...', { state: 'hidden' });

    // Check result display
    await expect(page.locator('.bg-white h2').first()).toHaveText('判定結果');
    await expect(page.locator('p:has-text("不正解")').first()).toBeVisible();
    await expect(page.locator('text=あなたの解答:')).toBeVisible();
    await expect(page.locator('text=エベレスト')).toBeVisible();
  });

  test('should return to theme input after clicking new quiz button', async ({ page }) => {
    // Mock API responses
    await page.route('**/*', async route => {
      const url = route.request().url();
      if (url.includes('generativelanguage.googleapis.com') || url.includes('generateContent')) {
        const request = route.request();
        const postData = request.postData();
        
        if (postData && postData.includes('クイズを1問作成してください')) {
          await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({
              candidates: [{
                content: {
                  parts: [{
                    text: 'テスト問題'
                  }],
                  role: 'model'
                },
                finishReason: 'STOP',
                safetyRatings: []
              }]
            })
          });
        } else if (postData && postData.includes('ユーザーの解答を評価してください')) {
          await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({
              candidates: [{
                content: {
                  parts: [{
                    text: `{
                      "isCorrect": true,
                      "correctAnswer": "正解",
                      "explanation": "説明"
                    }`
                  }],
                  role: 'model'
                },
                finishReason: 'STOP',
                safetyRatings: []
              }]
            })
          });
        } else {
          await route.continue();
        }
      } else {
        await route.continue();
      }
    });

    // Complete a quiz cycle
    await page.locator('input#theme').fill('テスト');
    await page.locator('button[type="submit"]').click();
    await page.waitForSelector('text=処理中...', { state: 'hidden' });
    
    // Wait for quiz screen to appear
    await page.waitForSelector('textarea#answer', { state: 'visible' });

    await page.locator('textarea#answer').fill('テスト解答');
    await page.locator('button[type="submit"]').click();
    await page.waitForSelector('text=処理中...', { state: 'hidden' });

    // Click new quiz button
    await page.locator('button:has-text("新しいクイズを始める")').click();

    // Should be back at theme input
    await expect(page.locator('.bg-white h1').first()).toHaveText('クイズのテーマを入力してください');
    await expect(page.locator('input#theme')).toHaveValue('');
  });

  test('should display error message when API fails', async ({ page }) => {
    // Mock API to return error
    await page.route('**/*', async route => {
      const url = route.request().url();
      if (url.includes('generativelanguage.googleapis.com') || url.includes('generateContent')) {
        await route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify({ error: 'Internal Server Error' })
        });
      } else {
        await route.continue();
      }
    });

    await page.locator('input#theme').fill('エラーテスト');
    await page.locator('button[type="submit"]').click();
    
    // Wait for error to appear
    await page.waitForTimeout(1000);

    // Check error display
    await expect(page.locator('.bg-red-100')).toBeVisible();
    await expect(page.locator('.bg-red-100')).toContainText('クイズの生成に失敗しました');
  });
});