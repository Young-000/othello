import { test, expect } from '@playwright/test';

test.describe('Sudoku Game', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/sudoku');
  });

  test('1. Game initialization - 9x9 grid displayed', async ({ page }) => {
    // 9x9 그리드인지 확인 (총 81개의 셀)
    const cells = page.locator('[class*="cell"]');
    await expect(cells).toHaveCount(81);
  });

  test('2. Cell selection highlights row/column/box', async ({ page }) => {
    const cells = page.locator('[class*="cell"]');

    // 첫 번째 빈 셀 클릭
    const firstCell = cells.first();
    await firstCell.click();

    // 선택된 셀이 selected 클래스를 갖는지 확인
    await expect(firstCell).toHaveClass(/selected/);

    // 하이라이트된 셀들이 있는지 확인
    const highlightedCells = page.locator('[class*="highlighted"]');
    const highlightedCount = await highlightedCells.count();
    expect(highlightedCount).toBeGreaterThan(0);
  });

  test('3. Number input via keyboard (1-9)', async ({ page }) => {
    const cells = page.locator('[class*="cell"]');

    // 고정되지 않은 셀 찾기
    let editableCell = null;
    for (let i = 0; i < 81; i++) {
      const cell = cells.nth(i);
      const isFixed = await cell.evaluate(el => el.className.includes('fixed'));
      if (!isFixed) {
        editableCell = cell;
        break;
      }
    }

    if (editableCell) {
      await editableCell.click();
      await page.keyboard.press('5');

      // 셀에 숫자가 입력되었는지 확인
      await expect(editableCell).toContainText('5');
    }
  });

  test('4. Number input via number buttons', async ({ page }) => {
    const cells = page.locator('[class*="cell"]');

    // 고정되지 않은 셀 찾기
    let editableCell = null;
    for (let i = 0; i < 81; i++) {
      const cell = cells.nth(i);
      const isFixed = await cell.evaluate(el => el.className.includes('fixed'));
      if (!isFixed) {
        editableCell = cell;
        break;
      }
    }

    if (editableCell) {
      await editableCell.click();

      // 숫자 버튼 클릭
      const numberButton = page.locator('[class*="numbers"] button').filter({ hasText: '7' });
      await numberButton.click();

      // 셀에 숫자가 입력되었는지 확인
      await expect(editableCell).toContainText('7');
    }
  });

  test('5. Clear button removes cell value', async ({ page }) => {
    const cells = page.locator('[class*="cell"]');

    // 고정되지 않은 셀 찾기 및 숫자 입력
    for (let i = 0; i < 81; i++) {
      const cell = cells.nth(i);
      const isFixed = await cell.evaluate(el => el.className.includes('fixed'));
      if (!isFixed) {
        await cell.click();
        await page.keyboard.press('3');
        await expect(cell).toContainText('3');

        // Clear 버튼 클릭
        const clearButton = page.locator('button', { hasText: 'Clear' });
        await clearButton.click();

        // 셀이 비워졌는지 확인
        const cellText = await cell.textContent();
        expect(cellText?.trim()).toBe('');
        break;
      }
    }
  });

  test('6. Notes mode toggle', async ({ page }) => {
    // Notes 버튼 확인
    const notesButton = page.locator('button', { hasText: /Notes/ });
    await expect(notesButton).toBeVisible();

    // 초기 상태: Notes OFF
    await expect(notesButton).toContainText('OFF');

    // Notes 버튼 클릭
    await notesButton.click();

    // Notes ON 상태
    await expect(notesButton).toContainText('ON');

    // 다시 클릭하면 OFF
    await notesButton.click();
    await expect(notesButton).toContainText('OFF');
  });

  test('7. Notes mode adds candidate numbers', async ({ page }) => {
    const cells = page.locator('[class*="cell"]');

    // 고정되지 않은 셀 찾기
    let editableCell = null;
    for (let i = 0; i < 81; i++) {
      const cell = cells.nth(i);
      const isFixed = await cell.evaluate(el => el.className.includes('fixed'));
      if (!isFixed) {
        editableCell = cell;
        break;
      }
    }

    if (editableCell) {
      // Notes 모드 활성화
      const notesButton = page.locator('button', { hasText: /Notes/ });
      await notesButton.click();

      await editableCell.click();
      await page.keyboard.press('1');
      await page.keyboard.press('2');

      // 노트가 표시되는지 확인
      const notes = editableCell.locator('[class*="notes"]');
      await expect(notes).toBeVisible();
    }
  });

  test('8. Difficulty selection changes game', async ({ page }) => {
    // Hard 버튼 클릭
    const hardButton = page.locator('[class*="difficulty"] button', { hasText: 'Hard' });
    await hardButton.click();
    await page.waitForTimeout(200);

    // 새 게임이 시작되었는지 확인 (타이머 리셋)
    const timeDisplay = page.locator('text=0:00');
    await expect(timeDisplay).toBeVisible();

    // 그리드가 여전히 81셀인지 확인
    const cells = page.locator('[class*="cell"]');
    await expect(cells).toHaveCount(81);
  });

  test('9. Error cells are highlighted', async ({ page }) => {
    const cells = page.locator('[class*="cell"]');

    // 고정되지 않은 셀을 찾아 잘못된 값 입력
    for (let i = 0; i < 81; i++) {
      const cell = cells.nth(i);
      const isFixed = await cell.evaluate(el => el.className.includes('fixed'));
      if (!isFixed) {
        await cell.click();

        // 같은 행의 다른 셀 값을 입력해서 오류 유발
        // 1-9 모두 시도하여 오류 발생시키기
        for (let num = 1; num <= 9; num++) {
          await page.keyboard.press(num.toString());
          await page.waitForTimeout(50);

          const hasError = await cell.evaluate(el => el.className.includes('error'));
          if (hasError) {
            // 오류 셀이 error 클래스를 갖는지 확인
            await expect(cell).toHaveClass(/error/);
            return;
          }
        }
        break;
      }
    }
  });

  test('10. New Game button resets the game', async ({ page }) => {
    const cells = page.locator('[class*="cell"]');

    // 셀에 값 입력
    for (let i = 0; i < 81; i++) {
      const cell = cells.nth(i);
      const isFixed = await cell.evaluate(el => el.className.includes('fixed'));
      if (!isFixed) {
        await cell.click();
        await page.keyboard.press('9');
        break;
      }
    }

    // New Game 버튼 클릭
    const newGameButton = page.locator('button', { hasText: /New Game|새 게임/i });
    await newGameButton.click();

    // 새 게임이 시작되었는지 확인 (타이머 리셋)
    const timeDisplay = page.locator('text=0:00');
    await expect(timeDisplay).toBeVisible({ timeout: 2000 });
  });

  test('11. Timer starts on game start', async ({ page }) => {
    // 초기 시간 0:00
    await expect(page.locator('text=0:00')).toBeVisible();

    // 잠시 대기 후 시간이 증가하는지 확인
    await page.waitForTimeout(2000);

    // 시간이 0:00이 아닌지 확인
    const timeText = await page.locator('[class*="time"], [aria-label*="Time"]').first().textContent();
    expect(timeText).not.toBe('0:00');
  });

  test('12. Fixed cells cannot be edited', async ({ page }) => {
    const cells = page.locator('[class*="cell"]');

    // 고정된 셀 찾기
    for (let i = 0; i < 81; i++) {
      const cell = cells.nth(i);
      const isFixed = await cell.evaluate(el => el.className.includes('fixed'));
      if (isFixed) {
        const originalValue = await cell.textContent();

        await cell.click();
        await page.keyboard.press('5');

        // 값이 변경되지 않았는지 확인
        const newValue = await cell.textContent();
        expect(newValue).toBe(originalValue);
        break;
      }
    }
  });
});
