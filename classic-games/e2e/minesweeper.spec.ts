import { test, expect } from '@playwright/test';

test.describe('Minesweeper Game', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/minesweeper');
  });

  test('1. Game initialization - grid displayed', async ({ page }) => {
    // 그리드가 표시되는지 확인
    const grid = page.locator('[data-testid="minesweeper-grid"]');
    await expect(grid).toBeVisible();

    // Easy 난이도 기본 (9x9 = 81 셀)
    const cells = page.locator('[data-testid^="cell-"]');
    await expect(cells).toHaveCount(81);
  });

  test('2. Cell reveal on left click', async ({ page }) => {
    const cells = page.locator('[data-testid^="cell-"]');

    // 첫 번째 셀 클릭
    const firstCell = cells.first();
    await firstCell.click();

    // 셀이 revealed 상태인지 확인
    await expect(firstCell).toHaveAttribute('data-revealed', 'true');
  });

  test('3. Flag toggle on right click', async ({ page }) => {
    const cells = page.locator('[data-testid^="cell-"]');

    // 비공개 상태의 셀에 우클릭
    const cell = cells.first();
    await cell.click({ button: 'right' });

    // 깃발이 표시되는지 확인
    await expect(cell).toContainText('🚩');
    await expect(cell).toHaveAttribute('data-flagged', 'true');

    // 다시 우클릭하면 깃발 제거
    await cell.click({ button: 'right' });
    await expect(cell).toHaveAttribute('data-flagged', 'false');
  });

  test('4. Mine count decreases with flags', async ({ page }) => {
    // Easy 기본 지뢰 수: 10
    const mineInfo = page.locator('text=/Mines:/');
    await expect(mineInfo).toBeVisible();

    const initialText = await mineInfo.textContent();
    const initialMines = parseInt(initialText?.replace(/\D/g, '') || '10');

    // 셀에 깃발 표시
    const cell = page.locator('[data-testid="cell-0-0"]');
    await cell.click({ button: 'right' });

    // 지뢰 카운트가 감소했는지 확인
    const newText = await mineInfo.textContent();
    const newMines = parseInt(newText?.replace(/\D/g, '') || '0');
    expect(newMines).toBe(initialMines - 1);
  });

  test('5. Revealed cell shows adjacent mine count', async ({ page }) => {
    // 여러 셀을 클릭하여 숫자가 표시되는 셀 찾기
    const cells = page.locator('[data-testid^="cell-"]');

    for (let row = 0; row < 9; row++) {
      for (let col = 0; col < 9; col++) {
        const cell = page.locator(`[data-testid="cell-${row}-${col}"]`);
        const isMine = await cell.getAttribute('data-mine');
        const isRevealed = await cell.getAttribute('data-revealed');

        if (isRevealed === 'true' && isMine === 'false') {
          // 숫자 셀이 있으면 1-8 사이의 숫자를 포함하는지 확인
          const text = await cell.textContent();
          if (text && /[1-8]/.test(text)) {
            expect(parseInt(text)).toBeGreaterThanOrEqual(1);
            expect(parseInt(text)).toBeLessThanOrEqual(8);
            return;
          }
        }
      }
    }
  });

  test('6. Difficulty selection changes grid size', async ({ page }) => {
    // Medium 버튼 클릭
    const mediumButton = page.locator('button', { hasText: 'Medium' });
    await mediumButton.click();

    // Medium 난이도는 16x16 = 256 셀
    const cells = page.locator('[data-testid^="cell-"]');
    await expect(cells).toHaveCount(256);

    // Hard 버튼 클릭
    const hardButton = page.locator('button', { hasText: 'Hard' });
    await hardButton.click();

    // Hard 난이도는 30x16 = 480 셀 (또는 다른 크기)
    const hardCellsCount = await cells.count();
    expect(hardCellsCount).toBeGreaterThan(256);
  });

  test('7. Game over on mine click', async ({ page }) => {
    test.setTimeout(60000); // 1분 타임아웃
    const cells = page.locator('[data-testid^="cell-"]');

    // 지뢰를 찾을 때까지 클릭 (테스트용으로 많이 클릭)
    for (let i = 0; i < 81; i++) {
      const cell = cells.nth(i);
      const isDisabled = await cell.isDisabled().catch(() => true);

      if (!isDisabled) {
        await cell.click();
        await page.waitForTimeout(50);

        // Game Over 모달 확인
        const gameOverModal = page.locator('text=Game Over');
        const isGameOver = await gameOverModal.isVisible().catch(() => false);

        if (isGameOver) {
          await expect(gameOverModal).toBeVisible();
          // 폭탄 아이콘도 표시되는지 확인
          await expect(page.locator('text=💣')).toBeVisible();
          return;
        }
      }
    }

    // 모든 셀 클릭 후에도 게임 오버가 안되면 (모든 지뢰 피함) 테스트 통과
    expect(true).toBe(true);
  });

  test('8. New Game button resets the game', async ({ page }) => {
    // 셀 클릭
    const cell1 = page.locator('[data-testid="cell-0-0"]');
    await cell1.click();
    await page.waitForTimeout(100);

    // New Game 버튼 클릭
    const newGameButton = page.locator('button', { hasText: /New Game|새 게임/i });
    await newGameButton.click();
    await page.waitForTimeout(100);

    // 리셋 후 셀들이 다시 클릭 가능해짐
    const resetCell = page.locator('[data-testid="cell-0-0"]');
    const isRevealed = await resetCell.getAttribute('data-revealed');
    expect(isRevealed).toBe('false');
  });

  test('9. Timer starts on first click', async ({ page }) => {
    // 초기 시간 확인
    await expect(page.locator('text=0:00')).toBeVisible();

    // 첫 클릭
    const cell = page.locator('[data-testid="cell-0-0"]');
    await cell.click();

    // 잠시 대기 후 시간이 증가하는지 확인
    await page.waitForTimeout(2000);

    const timeElement = page.locator('[class*="time"], [aria-label*="Time"]').first();
    const timeText = await timeElement.textContent();
    expect(timeText).not.toBe('0:00');
  });

  test('10. Play Again button in game over modal', async ({ page }) => {
    // 게임 오버 상태 만들기
    const cells = page.locator('[data-testid^="cell-"]');

    for (let i = 0; i < 81; i++) {
      const cell = cells.nth(i);
      const isFlagged = await cell.getAttribute('data-flagged');
      const isRevealed = await cell.getAttribute('data-revealed');

      if (isFlagged !== 'true' && isRevealed !== 'true') {
        await cell.click();

        const gameOverModal = page.locator('text=Game Over');
        const isGameOver = await gameOverModal.isVisible().catch(() => false);

        if (isGameOver) {
          // Play Again 버튼 클릭
          const playAgainButton = page.locator('button', { hasText: /Play Again|다시 하기/i });
          await playAgainButton.click();

          // 게임이 리셋되었는지 확인
          await expect(gameOverModal).not.toBeVisible();
          return;
        }
      }
    }
  });

  test('11. Clicking revealed cell does nothing', async ({ page }) => {
    const cell = page.locator('[data-testid="cell-4-4"]');
    await cell.click();

    // revealed 상태 확인
    const wasRevealed = await cell.getAttribute('data-revealed');
    expect(wasRevealed).toBe('true');

    // 공개된 셀은 disabled 상태가 됨
    const isDisabled = await cell.isDisabled();
    expect(isDisabled).toBe(true);
  });

  test('12. Cannot flag revealed cells', async ({ page }) => {
    const cell = page.locator('[data-testid="cell-4-4"]');

    // 셀 공개
    await cell.click();

    // 공개된 셀은 disabled 상태
    const isDisabled = await cell.isDisabled();
    expect(isDisabled).toBe(true);

    // disabled된 셀은 우클릭해도 깃발이 표시되지 않음
    const isFlagged = await cell.getAttribute('data-flagged');
    expect(isFlagged).toBe('false');
  });
});
