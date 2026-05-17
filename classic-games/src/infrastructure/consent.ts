/**
 * 약관/개인정보 동의 상태 관리
 *
 * 콘솔 검토 요구사항: 첫 진입 시 약관/개인정보 동의 필수,
 * 동의 상태는 재진입 시 스킵.
 */

const CONSENT_KEY = 'legal-consent-v1';

export type ConsentState = {
  termsAccepted: boolean;
  privacyAccepted: boolean;
  acceptedAt: string;
};

function readStorage(): ConsentState | null {
  try {
    const raw = localStorage.getItem(CONSENT_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as ConsentState;
  } catch {
    return null;
  }
}

export function getConsent(): ConsentState | null {
  return readStorage();
}

export function hasConsented(): boolean {
  const state = readStorage();
  return !!state && state.termsAccepted && state.privacyAccepted;
}

export function saveConsent(): ConsentState {
  const state: ConsentState = {
    termsAccepted: true,
    privacyAccepted: true,
    acceptedAt: new Date().toISOString(),
  };
  try {
    localStorage.setItem(CONSENT_KEY, JSON.stringify(state));
  } catch {
    // fail-open
  }
  return state;
}

export function clearConsent(): void {
  try {
    localStorage.removeItem(CONSENT_KEY);
  } catch {
    // ignore
  }
}

/** 약관 / 개인정보 처리방침 공개 URL (정적 호스팅) */
export const LEGAL_URLS = {
  terms: '/legal/terms.html',
  privacy: '/legal/privacy.html',
} as const;
