/**
 * 광고 그룹 ID 상수 (AIT 콘솔에서 등록 후 PLACEHOLDER 교체)
 *
 * 개발: 토스 공식 테스트 ID 사용 (운영 ID 사용 시 토스 제재)
 * 운영: 콘솔에서 광고 그룹 생성 후 발급된 `ait.v2.live.*` ID로 교체
 */

const isDev = import.meta.env.DEV;

export const AD_IDS = {
  /** 보상형 — 게임 부활/힌트 등 */
  rewarded: isDev
    ? 'ait-ad-test-rewarded-id'
    : 'PLACEHOLDER_REWARDED_AD_ID',

  /** 전면형 — 게임 종료 후 */
  interstitial: isDev
    ? 'ait-ad-test-interstitial-id'
    : 'PLACEHOLDER_INTERSTITIAL_AD_ID',

  /** 배너 — 텍스트(리스트형) */
  bannerText: isDev
    ? 'ait-ad-test-banner-id'
    : 'PLACEHOLDER_BANNER_TEXT_AD_ID',

  /** 배너 — 이미지(피드형) */
  bannerImage: isDev
    ? 'ait-ad-test-native-image-id'
    : 'PLACEHOLDER_BANNER_IMAGE_AD_ID',
} as const;
