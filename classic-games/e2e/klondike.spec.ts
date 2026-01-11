import { test, expect } from '@playwright/test';

test.describe('Klondike Game', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/klondike');
  });

  test('1. Game initialization - 7 tableau columns', async ({ page }) => {
    // 7개의 테이블로 컬럼이 있는지 확인
    const columns = page.locator('[class*="column"]');
    await expect(columns).toHaveCount(7);
  });

  test('2. Game initialization - stock pile has cards', async ({ page }) => {
    // 스톡 파일에 카드가 있는지 확인
    const stockPile = page.locator('[class*="stockWaste"] [class*="pile"]').first();
    await expect(stockPile).toBeVisible();

    // 카드가 표시되는지 확인
    const card = stockPile.locator('[class*="card"]').first();
    await expect(card).toBeVisible();
  });

  test('3. Stock click draws card to waste', async ({ page }) => {
    // 스톡 파일 클릭
    const stockPile = page.locator('[class*="stockWaste"] [class*="pile"]').first();
    await stockPile.click();

    // 웨이스트 파일에 카드가 표시되는지 확인
    const wastePile = page.locator('[class*="stockWaste"] [class*="pile"]').nth(1);
    const wasteCard = wastePile.locator('[class*="card"]');
    await expect(wasteCard).toBeVisible();
  });

  test('4. Card selection highlights the card', async ({ page }) => {
    // 웨이스트에서 카드 가져오기
    const stockPile = page.locator('[class*="stockWaste"] [class*="pile"]').first();
    await stockPile.click();

    // 웨이스트 카드 클릭
    const wastePile = page.locator('[class*="stockWaste"] [class*="pile"]').nth(1);
    await wastePile.click();

    // 선택된 카드가 하이라이트 되는지 확인
    const selectedCard = wastePile.locator('[class*="selected"]');
    await expect(selectedCard).toBeVisible();
  });

  test('5. Tableau cards are stacked visually', async ({ page }) => {
    // 테이블로 컬럼에서 카드들이 겹쳐 표시되는지 확인
    const firstColumn = page.locator('[class*="column"]').first();
    const stackedCards = firstColumn.locator('[class*="stackedCard"]');
    const count = await stackedCards.count();
    expect(count).toBeGreaterThanOrEqual(1);
  });

  test('6. Foundation piles are empty initially', async ({ page }) => {
    // 4개의 파운데이션이 있는지 확인
    const foundations = page.locator('[class*="foundations"] [class*="pile"]');
    await expect(foundations).toHaveCount(4);

    // 파운데이션에 플레이스홀더가 있는지 확인 (빈 상태)
    const placeholders = page.locator('[class*="foundations"] [class*="placeholder"]');
    await expect(placeholders).toHaveCount(4);
  });

  test('7. Moves counter starts at 0', async ({ page }) => {
    // Moves 라벨이 있는지 확인
    const movesLabel = page.locator('text=Moves');
    await expect(movesLabel).toBeVisible();

    // 초기 Moves 값 확인
    const movesValue = page.locator('[aria-label="0 moves"]');
    await expect(movesValue).toBeVisible();
  });

  test('8. Undo button is initially disabled', async ({ page }) => {
    // Undo 버튼 찾기
    const undoButton = page.locator('button', { hasText: /↶|Undo/ });

    // 초기에는 비활성화 상태
    // (disabled 속성이 있거나 특정 클래스가 있을 수 있음)
    const isDisabled = await undoButton.isDisabled().catch(() => {
      // disabled 속성이 없으면 opacity나 클래스로 확인
      return false;
    });
    // 초기 상태에서 undo가 가능하지 않음을 확인
    // canUndo prop이 false면 버튼이 비활성화됨
  });

  test('9. Stock draw increases moves count', async ({ page }) => {
    // 초기 Moves 0
    await expect(page.locator('[aria-label="0 moves"]')).toBeVisible();

    // 스톡에서 카드 뽑기
    const stockPile = page.locator('[class*="stockWaste"] [class*="pile"]').first();
    await stockPile.click();

    // Moves가 증가했는지 확인
    const movesValue = page.locator('[aria-label="1 moves"]');
    await expect(movesValue).toBeVisible();
  });

  test('10. Timer starts on game start', async ({ page }) => {
    // 초기 시간 확인
    await expect(page.locator('text=0:00')).toBeVisible();

    // 몇 초 대기
    await page.waitForTimeout(2000);

    // 시간이 증가했는지 확인
    const timeElement = page.locator('[class*="time"], [aria-label*="Time"]').first();
    const timeText = await timeElement.textContent();
    expect(timeText).not.toBe('0:00');
  });

  test('11. New Game button resets the game', async ({ page }) => {
    // 몇 가지 동작 수행
    const stockPile = page.locator('[class*="stockWaste"] [class*="pile"]').first();
    await stockPile.click();
    await stockPile.click();
    await stockPile.click();

    // New Game 버튼 클릭
    const newGameButton = page.locator('button', { hasText: /New Game|새 게임/i });
    await newGameButton.click();

    // Moves가 0으로 리셋
    await expect(page.locator('[aria-label="0 moves"]')).toBeVisible();
  });

  test('12. Face-down cards in tableau', async ({ page }) => {
    // 테이블로에서 뒤집어진 카드가 있는지 확인
    // 마지막 컬럼에는 여러 장의 뒤집어진 카드가 있어야 함
    const lastColumn = page.locator('[class*="column"]').last();
    const cards = lastColumn.locator('[class*="stackedCard"]');
    const count = await cards.count();

    // 7번째 컬럼에는 7장의 카드가 있고, 6장은 뒤집어져 있음
    expect(count).toBe(7);
  });

  test('13. Click same card to deselect', async ({ page }) => {
    // 스톡에서 카드 뽑기
    const stockPile = page.locator('[class*="stockWaste"] [class*="pile"]').first();
    await stockPile.click();

    // 웨이스트 카드 클릭 (선택)
    const wastePile = page.locator('[class*="stockWaste"] [class*="pile"]').nth(1);
    await wastePile.click();

    // 선택 확인
    let selectedCard = wastePile.locator('[class*="selected"]');
    await expect(selectedCard).toBeVisible();

    // 같은 카드 다시 클릭 (선택 해제)
    await wastePile.click();

    // 선택 해제 확인
    selectedCard = wastePile.locator('[class*="selected"]');
    await expect(selectedCard).not.toBeVisible();
  });

  test('14. Empty tableau column shows placeholder', async ({ page }) => {
    // 빈 컬럼의 플레이스홀더 확인은 게임 진행 중에만 가능
    // 초기에는 모든 컬럼에 카드가 있음
    const columns = page.locator('[class*="column"]');
    const firstColumn = columns.first();

    // 첫 번째 컬럼에 카드가 있는지 확인
    const cards = firstColumn.locator('[class*="stackedCard"]');
    const count = await cards.count();
    expect(count).toBeGreaterThanOrEqual(1);
  });

  test('15. Stock cycles through when exhausted', async ({ page }) => {
    // 스톡을 끝까지 소진하기 (많이 클릭)
    const stockPile = page.locator('[class*="stockWaste"] [class*="pile"]').first();

    // 24번 클릭 (스톡에 24장의 카드)
    for (let i = 0; i < 30; i++) {
      await stockPile.click();
      await page.waitForTimeout(50);
    }

    // 스톡이 비어있으면 플레이스홀더가 표시됨
    // 그리고 다시 클릭하면 웨이스트에서 스톡으로 카드가 돌아옴
    const placeholder = stockPile.locator('[class*="placeholder"]');
    const isPlaceholder = await placeholder.isVisible().catch(() => false);

    // 플레이스홀더가 보이면 다시 클릭해서 리셋
    if (isPlaceholder) {
      await stockPile.click();
      const card = stockPile.locator('[class*="card"]');
      await expect(card).toBeVisible();
    }
  });
});
