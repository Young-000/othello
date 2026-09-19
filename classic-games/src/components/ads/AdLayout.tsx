import { ReactNode } from 'react'
import AdSlot from './AdSlot'
import styles from './AdLayout.module.css'

interface AdLayoutProps {
  children: ReactNode
  showSideAds?: boolean   // 양쪽 사이드 광고
  showBottomAd?: boolean  // 하단 광고
  showTopAd?: boolean     // 상단 광고
  testMode?: boolean
}

export default function AdLayout({
  children,
  showSideAds = true,
  showBottomAd = true,
  showTopAd = false,
  testMode = true,
}: AdLayoutProps) {
  return (
    <div className={styles.adLayout}>
      {/* 상단 광고 */}
      {showTopAd && (
        <div className={styles.topAd}>
          <AdSlot size="leaderboard" testMode={testMode} />
        </div>
      )}

      <div className={styles.mainContent}>
        {/* 왼쪽 사이드 광고 */}
        {showSideAds && (
          <aside className={styles.sideAd}>
            <div className={styles.stickyAd}>
              <AdSlot size="skyscraper" testMode={testMode} />
            </div>
          </aside>
        )}

        {/* 메인 콘텐츠 */}
        <main className={styles.content}>
          {children}
        </main>

        {/* 오른쪽 사이드 광고 */}
        {showSideAds && (
          <aside className={styles.sideAd}>
            <div className={styles.stickyAd}>
              <AdSlot size="skyscraper" testMode={testMode} />
            </div>
          </aside>
        )}
      </div>

      {/* 하단 광고 */}
      {showBottomAd && (
        <div className={styles.bottomAd}>
          <AdSlot size="rectangle" testMode={testMode} />
        </div>
      )}
    </div>
  )
}

// 단순 배너 광고만 필요할 때
export function BannerAd({ testMode = true }: { testMode?: boolean }) {
  return (
    <div className={styles.bannerWrapper}>
      <AdSlot size="banner" testMode={testMode} />
    </div>
  )
}

// 게임 결과 후 광고
export function ResultAd({ testMode = true }: { testMode?: boolean }) {
  return (
    <div className={styles.resultAdWrapper}>
      <AdSlot size="rectangle" testMode={testMode} />
    </div>
  )
}
