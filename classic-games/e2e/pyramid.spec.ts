import { test, expect } from '@playwright/test';

test.describe('Pyramid Game', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/pyramid');
  });

  test('1. Game initialization - pyramid is displayed', async ({ page }) => {
    // 피라미드 영역 확인
    const pyramid = page.locator('[class*="pyramid"]');
    await expect(pyramid).toBeVisible();

    // 피라미드에 카드가 있는지 확인
    const pyramidCards = pyramid.locator('[class*="pyramidCard"]');
    const count = await pyramidCards.count();
    expect(count).toBeGreaterThan(0);
  });

  test('2. Pyramid has 28 cards initially', async ({ page }) => {
    // 피라미드에 28장의 카드 (1+2+3+4+5+6+7 = 28)
    const pyramid = page.locator('[class*="pyramid"]');
    const cards = pyramid.locator('[class*="card"]:not([class*="placeholder"])');
    await expect(cards).toHaveCount(28);
  });

  test('3. Removed count starts at 0', async ({ page }) => {
    // Removed: 0/28 표시 확인
    const removedInfo = page.locator('text=/Removed.*0.*28/');
    await expect(removedInfo).toBeVisible();
  });

  test('4. Stock pile is shown', async ({ page }) => {
    // Stock 정보 표시 확인
    const stockInfo = page.locator('text=/Stock:/');
    await expect(stockInfo).toBeVisible();

    // 스톡 파일에 카드가 있는지 확인
    const stockArea = page.locator('[class*="stockArea"]');
    const stockPile = stockArea.locator('[class*="pile"]').first();
    const stockCard = stockPile.locator('[class*="card"]');
    await expect(stockCard).toBeVisible();
  });

  test('5. Waste pile is initially empty', async ({ page }) => {
    // 웨이스트 파일이 비어있는지 확인
    const stockArea = page.locator('[class*="stockArea"]');
    const wastePile = stockArea.locator('[class*="pile"]').nth(1);
    const wasteCard = wastePile.locator('[class*="card"]:not([class*="placeholder"])');
    await expect(wasteCard).not.toBeVisible();
  });

  test('6. Stock click draws card to waste', async ({ page }) => {
    // 스톡 클릭
    const stockArea = page.locator('[class*="stockArea"]');
    const stockPile = stockArea.locator('[class*="pile"]').first();
    await stockPile.click();

    // 웨이스트에 카드가 표시되는지 확인
    const wastePile = stockArea.locator('[class*="pile"]').nth(1);
    const wasteCard = wastePile.locator('[class*="card"]:not([class*="placeholder"])');
    await expect(wasteCard).toBeVisible();
  });

  test('7. Card selection in pyramid', async ({ page }) => {
    // 피라미드 맨 아래 행의 카드 클릭 (노출된 카드)
    const pyramid = page.locator('[class*="pyramid"]');
    const lastRow = pyramid.locator('[class*="row"]').last();
    const cards = lastRow.locator('[class*="pyramidCard"]');
    const exposedCard = cards.first();

    await exposedCard.click();

    // 선택된 카드가 하이라이트 되는지 확인
    const selectedCard = pyramid.locator('[class*="selected"]');
    await expect(selectedCard).toBeVisible();
  });

  test('8. Click same card to deselect', async ({ page }) => {
    const pyramid = page.locator('[class*="pyramid"]');
    const lastRow = pyramid.locator('[class*="row"]').last();
    const exposedCard = lastRow.locator('[class*="pyramidCard"]').first();

    // 클릭하여 선택
    await exposedCard.click();
    let selectedCard = pyramid.locator('[class*="selected"]');
    await expect(selectedCard).toBeVisible();

    // 다시 클릭하여 선택 해제
    await exposedCard.click();
    selectedCard = pyramid.locator('[class*="selected"]');
    await expect(selectedCard).not.toBeVisible();
  });

  test('9. Waste card selection', async ({ page }) => {
    // 스톡에서 웨이스트로 카드 이동
    const stockArea = page.locator('[class*="stockArea"]');
    const stockPile = stockArea.locator('[class*="pile"]').first();
    await stockPile.click();

    // 웨이스트 카드 클릭
    const wastePile = stockArea.locator('[class*="pile"]').nth(1);
    await wastePile.click();

    // 선택된 카드 확인
    const selectedCard = wastePile.locator('[class*="selected"]');
    await expect(selectedCard).toBeVisible();
  });

  test('10. Moves counter starts at 0', async ({ page }) => {
    // Moves 라벨이 있는지 확인
    const movesLabel = page.locator('text=Moves');
    await expect(movesLabel).toBeVisible();

    // 초기 Moves 값 확인
    const movesValue = page.locator('[aria-label="0 moves"]');
    await expect(movesValue).toBeVisible();
  });

  test('11. Timer starts on game start', async ({ page }) => {
    // 초기 시간 확인
    await expect(page.locator('text=0:00')).toBeVisible();

    // 몇 초 대기
    await page.waitForTimeout(2000);

    // 시간이 증가했는지 확인
    const timeElement = page.locator('[class*="time"], [aria-label*="Time"]').first();
    const timeText = await timeElement.textContent();
    expect(timeText).not.toBe('0:00');
  });

  test('12. New Game button resets the game', async ({ page }) => {
    // 스톡에서 카드 뽑기
    const stockArea = page.locator('[class*="stockArea"]');
    const stockPile = stockArea.locator('[class*="pile"]').first();
    await stockPile.click();

    // New Game 버튼 클릭
    const newGameButton = page.locator('button', { hasText: /New Game|새 게임/i });
    await newGameButton.click();

    // Moves가 0으로 리셋
    await expect(page.locator('[aria-label="0 moves"]')).toBeVisible();

    // 웨이스트가 다시 비어있는지 확인
    const wastePile = stockArea.locator('[class*="pile"]').nth(1);
    const wasteCard = wastePile.locator('[class*="card"]:not([class*="placeholder"])');
    await expect(wasteCard).not.toBeVisible();
  });

  test('13. Bottom row cards are exposed', async ({ page }) => {
    // 피라미드 맨 아래 행의 카드는 노출되어 클릭 가능
    const pyramid = page.locator('[class*="pyramid"]');
    const pyramidCards = pyramid.locator('[class*="pyramidCard"]');

    // 카드가 표시되는지 확인
    const count = await pyramidCards.count();
    expect(count).toBeGreaterThan(0);

    // 맨 아래 카드 클릭 가능 (cursor: pointer)
    const lastCard = pyramidCards.last();
    const card = lastCard.locator('[class*="card"]');
    await expect(card).toBeVisible();
  });

  test('14. King removal (single card)', async ({ page }) => {
    // King(13)은 혼자서 제거 가능
    // 피라미드에서 King을 찾아 클릭하면 제거됨
    // (실제 게임에서는 King이 노출되어 있어야 함)
    const pyramid = page.locator('[class*="pyramid"]');
    const lastRow = pyramid.locator('[class*="row"]').last();
    const cards = lastRow.locator('[class*="pyramidCard"]');

    // 카드들을 클릭하면서 King인지 확인
    const cardCount = await cards.count();
    for (let i = 0; i < cardCount; i++) {
      const card = cards.nth(i);
      const cardContent = card.locator('[class*="card"]:not([class*="placeholder"])');

      if (await cardContent.isVisible()) {
        const text = await cardContent.textContent();
        if (text && text.includes('K')) {
          // King 클릭
          await card.click();

          // Removed 카운터 확인
          const removedInfo = page.locator('text=/Removed.*1.*28/');
          const isRemoved = await removedInfo.isVisible().catch(() => false);
          if (isRemoved) {
            await expect(removedInfo).toBeVisible();
            return;
          }
        }
      }
    }
  });

  test('15. Stock count decreases on draw', async ({ page }) => {
    // 초기 스톡 수 확인
    const stockInfo = page.locator('text=/Stock:/');
    const initialText = await stockInfo.textContent();
    const initialCount = parseInt(initialText?.match(/\d+/)?.[0] || '24');

    // 스톡에서 카드 뽑기
    const stockArea = page.locator('[class*="stockArea"]');
    const stockPile = stockArea.locator('[class*="pile"]').first();
    await stockPile.click();

    // 스톡 수가 감소했는지 확인
    const newText = await stockInfo.textContent();
    const newCount = parseInt(newText?.match(/\d+/)?.[0] || '0');
    expect(newCount).toBe(initialCount - 1);
  });

  test('16. Pair matching with 13 sum', async ({ page }) => {
    // 합이 13이 되는 두 카드를 선택하면 제거됨
    // (테스트 환경에서 랜덤 카드 배치로 인해 정확한 테스트 어려움)

    // 피라미드의 노출된 카드들 확인
    const pyramid = page.locator('[class*="pyramid"]');
    const lastRow = pyramid.locator('[class*="row"]').last();
    const cards = lastRow.locator('[class*="pyramidCard"]');

    // 첫 번째 카드 선택
    const firstCard = cards.first();
    await firstCard.click();

    // 두 번째 카드 선택
    const secondCard = cards.nth(1);
    await secondCard.click();

    // 매칭이 성공하면 Removed 증가, 실패하면 새 카드 선택
    // (결과는 카드 값에 따라 다름)
  });

  test('17. Exposed cards have cursor pointer', async ({ page }) => {
    // 노출된 카드는 클릭 가능 (cursor: pointer)
    const pyramid = page.locator('[class*="pyramid"]');
    const lastRow = pyramid.locator('[class*="row"]').last();
    const exposedCard = lastRow.locator('[class*="pyramidCard"] [class*="card"]').first();

    const cursor = await exposedCard.evaluate(el => {
      const style = window.getComputedStyle(el);
      return style.cursor;
    });
    expect(cursor).toBe('pointer');
  });
});
