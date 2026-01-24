import { useEffect, useRef } from 'react'
import styles from './AdSlot.module.css'

// Google AdSense Publisher ID (글로벌 설정)
const ADSENSE_CLIENT_ID = 'ca-pub-1379707580934572'

export type AdSize =
  | 'banner'        // 320x100 (모바일 배너)
  | 'leaderboard'   // 728x90 (상단 배너)
  | 'rectangle'     // 300x250 (사이드/콘텐츠)
  | 'skyscraper'    // 160x600 (사이드 세로)
  | 'large-rectangle' // 336x280 (큰 사각형)

interface AdSlotProps {
  size: AdSize
  slot?: string     // AdSense 광고 단위 ID (승인 후 설정)
  className?: string
  testMode?: boolean // 테스트 모드 (개발용)
}

const AD_DIMENSIONS: Record<AdSize, { width: number; height: number }> = {
  banner: { width: 320, height: 100 },
  leaderboard: { width: 728, height: 90 },
  rectangle: { width: 300, height: 250 },
  skyscraper: { width: 160, height: 600 },
  'large-rectangle': { width: 336, height: 280 },
}

declare global {
  interface Window {
    adsbygoogle: unknown[]
  }
}

export default function AdSlot({ size, slot, className = '', testMode = true }: AdSlotProps) {
  const adRef = useRef<HTMLDivElement>(null)
  const dimensions = AD_DIMENSIONS[size]
  const isAdPushed = useRef(false)

  useEffect(() => {
    // 실제 광고 모드일 때만 AdSense 로드
    if (!testMode && slot && !isAdPushed.current) {
      try {
        (window.adsbygoogle = window.adsbygoogle || []).push({})
        isAdPushed.current = true
      } catch (e) {
        console.error('AdSense error:', e)
      }
    }
  }, [testMode, slot])

  return (
    <div
      ref={adRef}
      className={`${styles.adSlot} ${styles[size]} ${className}`}
      style={{
        width: dimensions.width,
        height: dimensions.height,
        maxWidth: '100%',
      }}
    >
      {testMode ? (
        <div className={styles.placeholder}>
          <span className={styles.adLabel}>AD</span>
          <span className={styles.adSize}>{dimensions.width}x{dimensions.height}</span>
        </div>
      ) : (
        <ins
          className="adsbygoogle"
          style={{
            display: 'block',
            width: dimensions.width,
            height: dimensions.height,
          }}
          data-ad-client={ADSENSE_CLIENT_ID}
          data-ad-slot={slot}
          data-ad-format="auto"
          data-full-width-responsive="true"
        />
      )}
    </div>
  )
}
