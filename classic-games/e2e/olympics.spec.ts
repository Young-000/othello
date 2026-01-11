import { test, expect } from '@playwright/test';

test.describe('Olympics Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/olympics');
  });

  test('1. Page loads with title', async ({ page }) => {
    // 글로벌 랭킹 제목 확인
    const title = page.locator('text=글로벌 랭킹');
    await expect(title).toBeVisible();
  });

  test('2. Back button navigates to home', async ({ page }) => {
    // 뒤로가기 버튼 클릭
    const backButton = page.locator('[aria-label="홈으로"]');
    await expect(backButton).toBeVisible();
    await backButton.click();

    // 홈 페이지로 이동
    await expect(page).toHaveURL('/');
  });

  test('3. Loading state is shown initially', async ({ page }) => {
    // 로딩 상태 확인 (빠르게 지나갈 수 있음)
    // 로딩 메시지 또는 컨텐츠가 표시되는지 확인
    const loadingOrContent = page.locator('text=/랭킹을 불러오는 중|메달 순위|아직 랭킹이 없습니다/');
    await expect(loadingOrContent).toBeVisible({ timeout: 5000 });
  });

  test('4. Medal ranking section exists', async ({ page }) => {
    // 로딩 완료 대기
    await page.waitForSelector('text=/메달 순위|아직 랭킹이 없습니다/', { timeout: 10000 });

    // 메달 순위 섹션 확인
    const medalSection = page.locator('text=메달 순위');
    await expect(medalSection).toBeVisible();
  });

  test('5. Game selection buttons exist', async ({ page }) => {
    // 로딩 완료 대기
    await page.waitForSelector('text=게임별 순위', { timeout: 10000 });

    // 게임별 순위 섹션 확인
    const gameSection = page.locator('text=게임별 순위');
    await expect(gameSection).toBeVisible();

    // 게임 버튼들 확인 (클론다이크, 프리셀 등)
    await expect(page.locator('button', { hasText: '클론다이크' })).toBeVisible();
    await expect(page.locator('button', { hasText: '프리셀' })).toBeVisible();
  });

  test('6. Game button click shows game rankings', async ({ page }) => {
    // 로딩 완료 대기
    await page.waitForSelector('text=게임별 순위', { timeout: 10000 });

    // 클론다이크 게임 버튼 클릭
    const klondikeButton = page.locator('button', { hasText: '클론다이크' });
    await klondikeButton.click();

    // 게임 제목이 표시되는지 확인
    const gameTitle = page.locator('text=/클론다이크.*랭킹/');
    await expect(gameTitle).toBeVisible();
  });

  test('7. Game button toggle deselects', async ({ page }) => {
    // 로딩 완료 대기
    await page.waitForSelector('text=게임별 순위', { timeout: 10000 });

    // 게임 버튼 클릭
    const gameButton = page.locator('button', { hasText: '클론다이크' });
    await gameButton.click();

    // 게임 제목 표시 확인
    const gameTitle = page.locator('text=/클론다이크.*랭킹/');
    await expect(gameTitle).toBeVisible();

    // 다시 클릭하여 비활성화
    await gameButton.click();
    await expect(gameTitle).not.toBeVisible();
  });

  test('8. Empty state message when no rankings', async ({ page }) => {
    // 로딩 완료 대기
    await page.waitForSelector('text=/메달 순위|아직 랭킹이 없습니다/', { timeout: 10000 });

    // 랭킹이 없으면 빈 상태 메시지 표시
    const emptyState = page.locator('text=아직 랭킹이 없습니다');
    const medalTable = page.locator('[class*="medalTable"]');

    // 둘 중 하나가 표시되어야 함
    const hasEmpty = await emptyState.isVisible().catch(() => false);
    const hasTable = await medalTable.isVisible().catch(() => false);

    expect(hasEmpty || hasTable).toBe(true);
  });

  test('9. Statistics section when data exists', async ({ page }) => {
    // 로딩 완료 대기
    await page.waitForSelector('text=/메달 순위|아직 랭킹이 없습니다/', { timeout: 10000 });

    // 통계 섹션 확인 (데이터가 있을 때만 표시)
    const statsSection = page.locator('text=통계');
    const emptyState = page.locator('text=아직 랭킹이 없습니다');

    const hasStats = await statsSection.isVisible().catch(() => false);
    const isEmpty = await emptyState.isVisible().catch(() => false);

    // 통계가 있거나 빈 상태
    expect(hasStats || isEmpty).toBe(true);
  });

  test('10. Medal table header columns', async ({ page }) => {
    // 로딩 완료 대기
    await page.waitForSelector('text=/메달 순위|아직 랭킹이 없습니다/', { timeout: 10000 });

    // 메달 테이블이 있으면 헤더 확인
    const medalTable = page.locator('[class*="medalTable"]');
    const hasTable = await medalTable.isVisible().catch(() => false);

    if (hasTable) {
      // 순위, 플레이어, 메달 아이콘들 확인
      await expect(page.locator('text=순위')).toBeVisible();
      await expect(page.locator('text=플레이어')).toBeVisible();
      await expect(page.locator('text=🥇')).toBeVisible();
      await expect(page.locator('text=🥈')).toBeVisible();
      await expect(page.locator('text=🥉')).toBeVisible();
      await expect(page.locator('text=총점')).toBeVisible();
    }
  });

  test('11. Play button in empty state', async ({ page }) => {
    // 로딩 완료 대기
    await page.waitForSelector('text=/메달 순위|아직 랭킹이 없습니다/', { timeout: 10000 });

    // 빈 상태일 때 게임 시작 버튼 확인
    const emptyState = page.locator('text=아직 랭킹이 없습니다');
    const isEmpty = await emptyState.isVisible().catch(() => false);

    if (isEmpty) {
      const playButton = page.locator('text=게임 시작하기');
      await expect(playButton).toBeVisible();

      // 클릭 시 홈으로 이동
      await playButton.click();
      await expect(page).toHaveURL('/');
    }
  });

  test('12. Game buttons have icons', async ({ page }) => {
    // 로딩 완료 대기
    await page.waitForSelector('text=게임별 순위', { timeout: 10000 });

    // 게임 버튼에 아이콘이 있는지 확인 (이모지)
    await expect(page.locator('button', { hasText: '🃏' })).toBeVisible(); // 클론다이크
    await expect(page.locator('button', { hasText: '🎴' })).toBeVisible(); // 프리셀
  });

  test('13. Subtitle text', async ({ page }) => {
    // 부제목 확인
    const subtitle = page.locator('text=전세계 플레이어 순위');
    await expect(subtitle).toBeVisible();
  });
});
