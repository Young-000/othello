import { test, expect } from '@playwright/test';

test.describe('Memory Game', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/memory');
  });

  test('1. Game initialization - 16 cards (8 pairs)', async ({ page }) => {
    // 카드가 16장인지 확인
    const cards = page.locator('button').filter({ has: page.locator('.cardInner, [class*="cardInner"]') });
    await expect(cards).toHaveCount(16);
  });

  test('2. All cards should be face down initially', async ({ page }) => {
    // 모든 카드가 뒷면인지 확인 (flipped 클래스가 없어야 함)
    const flippedCards = page.locator('button.flipped, button[class*="flipped"]');
    await expect(flippedCards).toHaveCount(0);
  });

  test('3. Card flip on click', async ({ page }) => {
    // 첫 번째 카드 클릭
    const cards = page.locator('button').filter({ has: page.locator('[class*="cardInner"]') });
    const firstCard = cards.first();
    
    await firstCard.click();
    
    // 카드가 뒤집혔는지 확인
    await expect(firstCard).toHaveClass(/flipped/);
  });

  test('4. Check match after flipping 2 cards', async ({ page }) => {
    const cards = page.locator('button').filter({ has: page.locator('[class*="cardInner"]') });
    
    // 첫 번째 카드 클릭
    await cards.first().click();
    
    // 두 번째 카드 클릭 (다른 카드)
    await cards.nth(1).click();
    
    // 두 카드가 모두 뒤집혔는지 확인
    await expect(cards.first()).toHaveClass(/flipped/);
    await expect(cards.nth(1)).toHaveClass(/flipped/);
    
    // 매칭 체크 후 결과 대기 (800ms 딜레이)
    await page.waitForTimeout(1000);
  });

  test('5. Matching success keeps cards, failure flips back', async ({ page }) => {
    const cards = page.locator('button').filter({ has: page.locator('[class*="cardInner"]') });
    
    // 첫 번째 카드의 값을 찾기
    await cards.first().click();
    const firstCardValue = await cards.first().locator('[class*="cardBack"]').textContent();
    
    // 같은 값을 가진 짝을 찾기
    let matchIndex = -1;
    for (let i = 1; i < 16; i++) {
      await page.goto('/memory'); // 리셋
      await cards.first().click();
      await cards.nth(i).click();
      
      const secondCardValue = await cards.nth(i).locator('[class*="cardBack"]').textContent();
      
      if (firstCardValue === secondCardValue) {
        matchIndex = i;
        break;
      }
      
      // 매칭 실패 시 카드가 다시 뒤집히는지 확인
      await page.waitForTimeout(1000);
      
      // 매칭 실패 후 두 카드가 다시 뒤집혔는지 확인 (flipped 클래스가 제거됨)
      const firstIsFlipped = await cards.first().evaluate(el => el.className.includes('flipped'));
      const secondIsFlipped = await cards.nth(i).evaluate(el => el.className.includes('flipped'));
      
      expect(firstIsFlipped || secondIsFlipped).toBe(false);
    }
  });

  test('6. Moves count', async ({ page }) => {
    // Moves 라벨과 값 찾기 - GameHeader에서 Moves 라벨과 값이 분리됨
    const movesLabel = page.locator('text=Moves');
    await expect(movesLabel).toBeVisible();

    // 초기 Moves가 0인지 확인 - aria-label로 확인
    const movesValue = page.locator('[aria-label="0 moves"]');
    await expect(movesValue).toBeVisible();
    await expect(movesValue).toHaveText('0');

    const cards = page.locator('button').filter({ has: page.locator('[class*="cardInner"]') });

    // 두 카드 클릭
    await cards.first().click();
    await cards.nth(1).click();

    // 매칭 체크 대기
    await page.waitForTimeout(1000);

    // Moves가 1로 증가했는지 확인
    const updatedMovesValue = page.locator('[aria-label="1 moves"]');
    await expect(updatedMovesValue).toBeVisible();
    await expect(updatedMovesValue).toHaveText('1');
  });

  test('7. Game completion condition', async ({ page }) => {
    // 이 테스트는 실제로 게임을 완료하여 WinModal이 표시되는지 확인
    test.setTimeout(180000); // 3분 타임아웃

    const cards = page.locator('button').filter({ has: page.locator('[class*="cardInner"]') });

    // 카드 값들을 저장할 맵 (인덱스 -> 값)
    const cardValues: Map<number, string> = new Map();
    const matched = new Set<number>();

    // 최대 시도 횟수 (무한 루프 방지)
    let attempts = 0;
    const maxAttempts = 100;

    // 모든 쌍을 찾을 때까지 반복
    while (matched.size < 16 && attempts < maxAttempts) {
      attempts++;

      // 매칭되지 않고 클릭 가능한 첫 번째 카드 찾기
      let firstIndex = -1;
      for (let i = 0; i < 16; i++) {
        if (!matched.has(i)) {
          const isDisabled = await cards.nth(i).isDisabled();
          if (!isDisabled) {
            firstIndex = i;
            break;
          }
        }
      }

      if (firstIndex === -1) {
        // 모든 카드가 매칭되었거나 disabled
        break;
      }

      // 첫 번째 카드 클릭
      await cards.nth(firstIndex).click();
      const firstValue = await cards.nth(firstIndex).locator('[class*="cardBack"]').textContent();
      cardValues.set(firstIndex, firstValue || '');

      // 이미 알고 있는 카드 중에서 같은 값 찾기
      let pairIndex = -1;
      for (const [idx, val] of cardValues.entries()) {
        if (idx !== firstIndex && val === firstValue && !matched.has(idx)) {
          pairIndex = idx;
          break;
        }
      }

      if (pairIndex !== -1) {
        // 알려진 쌍 클릭
        await cards.nth(pairIndex).click();
        await page.waitForTimeout(900);
        matched.add(firstIndex);
        matched.add(pairIndex);
      } else {
        // 아직 모르는 카드들 중에서 탐색
        let foundNewCard = false;
        for (let j = firstIndex + 1; j < 16; j++) {
          if (matched.has(j) || cardValues.has(j)) continue;

          const isDisabled = await cards.nth(j).isDisabled();
          if (isDisabled) continue;

          await cards.nth(j).click();
          const secondValue = await cards.nth(j).locator('[class*="cardBack"]').textContent();
          cardValues.set(j, secondValue || '');

          await page.waitForTimeout(900);
          foundNewCard = true;

          if (firstValue === secondValue) {
            // 매칭 성공
            matched.add(firstIndex);
            matched.add(j);
          }
          // 매칭 실패하든 성공하든 다음 라운드로
          break;
        }

        // 새 카드를 못 찾으면 알려진 카드로 다시 시도
        if (!foundNewCard && pairIndex === -1) {
          // 아무 미매칭 카드나 클릭해서 넘어감
          for (let j = 0; j < 16; j++) {
            if (j !== firstIndex && !matched.has(j)) {
              const isDisabled = await cards.nth(j).isDisabled();
              if (!isDisabled) {
                await cards.nth(j).click();
                await page.waitForTimeout(900);
                break;
              }
            }
          }
        }
      }
    }

    // 게임 완료 확인 - Matches: 8 / 8
    await expect(page.locator('text=Matches: 8 / 8')).toBeVisible({ timeout: 10000 });

    // WinModal 표시 확인
    const winModal = page.locator('text=/Congratulations|You Win|Victory/i');
    await expect(winModal).toBeVisible({ timeout: 10000 });
  });
});
