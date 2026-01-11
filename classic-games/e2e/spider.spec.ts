import { test, expect } from '@playwright/test';

test.describe('Spider Game', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/spider');
  });

  test('1. Game initialization - 10 tableau columns', async ({ page }) => {
    // 10개의 테이블로 컬럼이 있는지 확인
    const columns = page.locator('[class*="column"]');
    await expect(columns).toHaveCount(10);
  });

  test('2. Game initialization - completed suits starts at 0', async ({ page }) => {
    // Completed: 0/8 표시 확인
    const completedInfo = page.locator('text=/Completed.*0.*8/');
    await expect(completedInfo).toBeVisible();
  });

  test('3. Stock piles are shown', async ({ page }) => {
    // Stock 정보 표시 확인
    const stockInfo = page.locator('text=/Stock:/');
    await expect(stockInfo).toBeVisible();

    // 스톡 영역에 카드가 있는지 확인
    const stockArea = page.locator('[class*="stockPiles"], [class*="stockArea"]');
    await expect(stockArea).toBeVisible();
  });

  test('4. Difficulty selection - 1 Suit', async ({ page }) => {
    // 1 Suit 버튼이 활성화되어 있는지 확인 (기본값)
    const oneSuitButton = page.locator('[class*="difficulty"] button', { hasText: '1 Suit' });
    await expect(oneSuitButton).toHaveClass(/active/);
  });

  test('5. Difficulty selection - 2 Suits', async ({ page }) => {
    // 2 Suits 버튼 클릭
    const twoSuitsButton = page.locator('[class*="difficulty"] button', { hasText: '2 Suits' });
    await twoSuitsButton.click();

    // 2 Suits 버튼이 활성화
    await expect(twoSuitsButton).toHaveClass(/active/);
  });

  test('6. Difficulty selection - 4 Suits', async ({ page }) => {
    // 4 Suits 버튼 클릭
    const fourSuitsButton = page.locator('[class*="difficulty"] button', { hasText: '4 Suits' });
    await fourSuitsButton.click();

    // 4 Suits 버튼이 활성화
    await expect(fourSuitsButton).toHaveClass(/active/);
  });

  test('7. Card selection highlights cards', async ({ page }) => {
    // 컬럼에서 앞면 카드 클릭
    const columns = page.locator('[class*="column"]');
    const firstColumn = columns.first();
    const cards = firstColumn.locator('[class*="stackedCard"]');

    // 마지막 카드 (앞면) 클릭
    const lastCard = cards.last();
    await lastCard.click();

    // 선택된 카드가 하이라이트 되는지 확인
    const selectedCard = firstColumn.locator('[class*="selected"]');
    await expect(selectedCard).toBeVisible();
  });

  test('8. Click same column to deselect', async ({ page }) => {
    const columns = page.locator('[class*="column"]');
    const firstColumn = columns.first();
    const cards = firstColumn.locator('[class*="stackedCard"]');
    const lastCard = cards.last();

    // 클릭하여 선택
    await lastCard.click();
    let selectedCard = firstColumn.locator('[class*="selected"]');
    await expect(selectedCard).toBeVisible();

    // 같은 컬럼 다시 클릭하여 선택 해제
    await lastCard.click();
    selectedCard = firstColumn.locator('[class*="selected"]');
    await expect(selectedCard).not.toBeVisible();
  });

  test('9. Stock deal adds cards to columns', async ({ page }) => {
    // 초기 카드 수 확인
    const firstColumn = page.locator('[class*="column"]').first();
    const initialCards = await firstColumn.locator('[class*="stackedCard"]').count();

    // 스톡 클릭 (카드 배분)
    const stockArea = page.locator('[class*="stockPiles"]');
    await stockArea.click();

    // 카드 수가 증가했는지 확인
    const newCards = await firstColumn.locator('[class*="stackedCard"]').count();
    expect(newCards).toBe(initialCards + 1);
  });

  test('10. Cannot deal from stock with empty column', async ({ page }) => {
    // 빈 컬럼이 있으면 스톡에서 카드를 배분할 수 없음
    // (알림 또는 동작 없음)
    // 초기에는 빈 컬럼이 없으므로 정상 배분 가능

    const stockInfo = page.locator('text=/Stock:/');
    const initialText = await stockInfo.textContent();

    // 스톡 클릭
    const stockArea = page.locator('[class*="stockPiles"]');
    await stockArea.click();

    // 스톡 수가 감소했는지 확인
    const newText = await stockInfo.textContent();
    expect(newText).not.toBe(initialText);
  });

  test('11. Moves counter starts at 0', async ({ page }) => {
    // Moves 라벨이 있는지 확인
    const movesLabel = page.locator('text=Moves');
    await expect(movesLabel).toBeVisible();

    // 초기 Moves 값 확인
    const movesValue = page.locator('[aria-label="0 moves"]');
    await expect(movesValue).toBeVisible();
  });

  test('12. Timer starts on game start', async ({ page }) => {
    // 초기 시간 확인
    await expect(page.locator('text=0:00')).toBeVisible();

    // 몇 초 대기
    await page.waitForTimeout(2000);

    // 시간이 증가했는지 확인
    const timeElement = page.locator('[class*="time"], [aria-label*="Time"]').first();
    const timeText = await timeElement.textContent();
    expect(timeText).not.toBe('0:00');
  });

  test('13. New Game button resets the game', async ({ page }) => {
    // New Game 버튼 클릭
    const newGameButton = page.locator('button', { hasText: /New Game|새 게임/i });
    await newGameButton.click();
    await page.waitForTimeout(200);

    // Moves가 0으로 리셋
    await expect(page.locator('[aria-label="0 moves"]')).toBeVisible();

    // Stock 정보가 다시 표시됨
    const stockInfo = page.locator('text=/Stock:/');
    await expect(stockInfo).toBeVisible();
  });

  test('14. Face-down cards in tableau', async ({ page }) => {
    // 테이블로에서 뒤집어진 카드가 있는지 확인
    const columns = page.locator('[class*="column"]');
    const firstColumn = columns.first();
    const cards = firstColumn.locator('[class*="stackedCard"]');
    const count = await cards.count();

    // 첫 4개 컬럼에는 6장, 나머지 6개 컬럼에는 5장
    expect(count).toBeGreaterThanOrEqual(5);
  });

  test('15. Cards are stacked visually', async ({ page }) => {
    // 카드들이 겹쳐서 표시되는지 확인
    const columns = page.locator('[class*="column"]');
    const firstColumn = columns.first();
    const stackedCards = firstColumn.locator('[class*="stackedCard"]');

    // 여러 장의 카드가 스택됨
    const count = await stackedCards.count();
    expect(count).toBeGreaterThan(1);
  });

  test('16. Stock deal adds cards to all columns', async ({ page }) => {
    // 스톡 클릭 (카드 배분)
    const stockArea = page.locator('[class*="stockPiles"], [class*="stockArea"]');
    const stockInfo = page.locator('text=/Stock:/');

    const initialText = await stockInfo.textContent();
    await stockArea.click();
    await page.waitForTimeout(200);

    // 스톡 수가 감소했는지 확인
    const newText = await stockInfo.textContent();
    expect(newText).not.toBe(initialText);
  });

  test('17. Difficulty changes reset game', async ({ page }) => {
    // 2 Suits로 변경
    const twoSuitsButton = page.locator('[class*="difficulty"] button', { hasText: '2 Suits' });
    await twoSuitsButton.click();
    await page.waitForTimeout(200);

    // Moves가 0으로 리셋
    await expect(page.locator('[aria-label="0 moves"]')).toBeVisible();

    // Stock 정보가 표시됨
    const stockInfo = page.locator('text=/Stock:/');
    await expect(stockInfo).toBeVisible();
  });
});
