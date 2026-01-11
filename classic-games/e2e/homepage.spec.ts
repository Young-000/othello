import { test, expect } from '@playwright/test';

test.describe('Home Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('1. Page loads with title', async ({ page }) => {
    // 메인 제목 확인
    const title = page.locator('text=클래식 게임');
    await expect(title).toBeVisible();
  });

  test('2. Subtitle is displayed', async ({ page }) => {
    // 부제목 확인
    const subtitle = page.locator('text=게임을 선택하세요');
    await expect(subtitle).toBeVisible();
  });

  test('3. Global ranking button exists', async ({ page }) => {
    // 글로벌 랭킹 버튼 확인
    const rankingButton = page.locator('text=글로벌 랭킹');
    await expect(rankingButton).toBeVisible();
  });

  test('4. Global ranking button navigates to olympics', async ({ page }) => {
    // 글로벌 랭킹 버튼 클릭
    const rankingButton = page.locator('text=글로벌 랭킹');
    await rankingButton.click();

    // Olympics 페이지로 이동
    await expect(page).toHaveURL('/olympics');
  });

  test('5. Puzzle games section exists', async ({ page }) => {
    // 퍼즐 게임 섹션 확인
    const puzzleSection = page.locator('text=퍼즐 게임');
    await expect(puzzleSection).toBeVisible();
  });

  test('6. Card games section exists', async ({ page }) => {
    // 카드 게임 섹션 확인
    const cardSection = page.locator('text=카드 게임');
    await expect(cardSection).toBeVisible();
  });

  test('7. All 8 game cards are displayed', async ({ page }) => {
    // 8개의 게임 카드 확인
    const gameCards = page.locator('[class*="gameCard"]');
    await expect(gameCards).toHaveCount(8);
  });

  test('8. Puzzle games have correct count (4)', async ({ page }) => {
    // 퍼즐 게임 섹션에 4개의 게임
    const puzzleSection = page.locator('[class*="section"]').filter({ hasText: '퍼즐 게임' });
    const puzzleGames = puzzleSection.locator('[class*="gameCard"]');
    await expect(puzzleGames).toHaveCount(4);
  });

  test('9. Card games have correct count (4)', async ({ page }) => {
    // 카드 게임 섹션에 4개의 게임
    const cardSection = page.locator('[class*="section"]').filter({ hasText: '카드 게임' });
    const cardGames = cardSection.locator('[class*="gameCard"]');
    await expect(cardGames).toHaveCount(4);
  });

  test('10. 2048 game card navigates to game', async ({ page }) => {
    // 2048 게임 카드 클릭
    const game2048Card = page.locator('[class*="gameCard"]', { hasText: '2048' });
    await game2048Card.click();

    // 2048 페이지로 이동
    await expect(page).toHaveURL('/2048');
  });

  test('11. Memory game card navigates to game', async ({ page }) => {
    // 메모리 게임 카드 클릭
    const memoryCard = page.locator('[class*="gameCard"]', { hasText: '메모리' });
    await memoryCard.click();

    // Memory 페이지로 이동
    await expect(page).toHaveURL('/memory');
  });

  test('12. Sudoku game card navigates to game', async ({ page }) => {
    // 스도쿠 게임 카드 클릭
    const sudokuCard = page.locator('[class*="gameCard"]', { hasText: '스도쿠' });
    await sudokuCard.click();

    // Sudoku 페이지로 이동
    await expect(page).toHaveURL('/sudoku');
  });

  test('13. Minesweeper game card navigates to game', async ({ page }) => {
    // 지뢰찾기 게임 카드 클릭
    const minesweeperCard = page.locator('[class*="gameCard"]', { hasText: '지뢰찾기' });
    await minesweeperCard.click();

    // Minesweeper 페이지로 이동
    await expect(page).toHaveURL('/minesweeper');
  });

  test('14. Klondike game card navigates to game', async ({ page }) => {
    // 클론다이크 게임 카드 클릭
    const klondikeCard = page.locator('[class*="gameCard"]', { hasText: '클론다이크' });
    await klondikeCard.click();

    // Klondike 페이지로 이동
    await expect(page).toHaveURL('/klondike');
  });

  test('15. FreeCell game card navigates to game', async ({ page }) => {
    // 프리셀 게임 카드 클릭
    const freecellCard = page.locator('[class*="gameCard"]', { hasText: '프리셀' });
    await freecellCard.click();

    // FreeCell 페이지로 이동
    await expect(page).toHaveURL('/freecell');
  });

  test('16. Spider game card navigates to game', async ({ page }) => {
    // 스파이더 게임 카드 클릭
    const spiderCard = page.locator('[class*="gameCard"]', { hasText: '스파이더' });
    await spiderCard.click();

    // Spider 페이지로 이동
    await expect(page).toHaveURL('/spider');
  });

  test('17. Pyramid game card navigates to game', async ({ page }) => {
    // 피라미드 게임 카드 클릭
    const pyramidCard = page.locator('[class*="gameCard"]', { hasText: '피라미드' });
    await pyramidCard.click();

    // Pyramid 페이지로 이동
    await expect(page).toHaveURL('/pyramid');
  });

  test('18. Game cards have icons', async ({ page }) => {
    // 게임 카드에 아이콘이 있는지 확인
    const gameCards = page.locator('[class*="gameCard"]');
    const icons = gameCards.locator('[class*="icon"]');

    // 모든 게임 카드에 아이콘이 있음
    await expect(icons).toHaveCount(8);
  });

  test('19. Game cards have names', async ({ page }) => {
    // 게임 카드에 이름이 있는지 확인
    const gameCards = page.locator('[class*="gameCard"]');
    const names = gameCards.locator('[class*="gameName"]');

    await expect(names).toHaveCount(8);
  });

  test('20. Game cards have descriptions', async ({ page }) => {
    // 게임 카드에 설명이 있는지 확인
    const gameCards = page.locator('[class*="gameCard"]');
    const descriptions = gameCards.locator('[class*="gameDesc"]');

    await expect(descriptions).toHaveCount(8);
  });

  test('21. Game card descriptions are accurate', async ({ page }) => {
    // 각 게임의 설명이 정확한지 확인
    await expect(page.locator('text=숫자 퍼즐')).toBeVisible(); // 2048
    await expect(page.locator('text=숫자 배치')).toBeVisible(); // Sudoku
    await expect(page.locator('text=지뢰를 피해라')).toBeVisible(); // Minesweeper
    await expect(page.locator('text=짝 맞추기')).toBeVisible(); // Memory
    await expect(page.locator('text=클래식 솔리테어')).toBeVisible(); // Klondike
    await expect(page.locator('text=전략 솔리테어')).toBeVisible(); // FreeCell
    await expect(page.locator('text=멀티덱 솔리테어')).toBeVisible(); // Spider
    await expect(page.locator('text=13 맞추기')).toBeVisible(); // Pyramid
  });
});
