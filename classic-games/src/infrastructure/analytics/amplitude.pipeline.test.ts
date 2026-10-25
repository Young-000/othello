// @vitest-environment jsdom
/*
  실제 Amplitude SDK 플러그인 파이프라인을 돌리고 전송 계층(fetch)만 가짜로 바꾼다.
  SDK가 서버로 보내는 본문 전체에 토큰·해시·민감 쿼리가 남지 않는지 확인한다.
*/
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import type * as AmplitudeModule from './amplitude';

const FORBIDDEN = [/code=/, /access_token/, /refresh_token/, /#/, /email=/];

let sentBodies: string[] = [];
let requestedUrls: string[] = [];

const OK_BODY = { code: 200, events_ingested: 1, payload_size_bytes: 1, server_upload_time: 1 };

function fakeFetch(url: unknown, init?: { body?: unknown }): Promise<unknown> {
  requestedUrls.push(String(url));
  if (typeof init?.body === 'string') sentBodies.push(init.body);
  return Promise.resolve({
    ok: true,
    status: 200,
    json: async () => OK_BODY,
    text: async () => JSON.stringify(OK_BODY),
  });
}

function setUrl(url: string): void {
  window.history.replaceState(null, '', url);
}

/** 테스트 setup 이 localStorage 를 key()/length 없는 목으로 바꾸는 저장소가 있어, 표준 Storage 형태를 직접 만든다. */
function createStorage(): typeof window.localStorage {
  const entries = new Map<string, string>();
  return {
    get length(): number {
      return entries.size;
    },
    key: (index: number): string | null => [...entries.keys()][index] ?? null,
    getItem: (key: string): string | null => entries.get(key) ?? null,
    setItem: (key: string, value: string): void => {
      entries.set(key, String(value));
    },
    removeItem: (key: string): void => {
      entries.delete(key);
    },
    clear: (): void => entries.clear(),
  };
}

/** 앞선 테스트의 쿠키가 남으면 기기 ID 저장 위치 검증이 흐려진다. (localStorage 는 테스트마다 새로 끼운다) */
function clearCookies(): void {
  document.cookie.split(';').forEach((cookie) => {
    const name = cookie.split('=')[0].trim();
    if (name) document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
  });
}

function setReferrer(url: string): void {
  Object.defineProperty(document, 'referrer', { value: url, configurable: true });
}

async function startAndFlush(
  afterStart: (api: typeof AmplitudeModule) => void,
): Promise<string> {
  vi.resetModules();
  const api = await import('./amplitude');
  const sdk = await import('@amplitude/analytics-browser');
  api.initAmplitude();
  await vi.waitFor(() => expect(sentBodies.length).toBeGreaterThan(0), { timeout: 8_000 });
  afterStart(api);
  await sdk.flush().promise;
  return sentBodies.join('\n');
}

describe('amplitude pipeline (real SDK, fake transport)', () => {
  beforeEach(() => {
    sentBodies = [];
    requestedUrls = [];
    vi.stubGlobal('localStorage', createStorage());
    vi.stubGlobal('fetch', fakeFetch);
    vi.stubEnv('VITE_AMPLITUDE_API_KEY', 'pipeline-test-key');
    Object.defineProperty(navigator, 'webdriver', { value: false, configurable: true });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
    Reflect.deleteProperty(document, 'referrer');
    clearCookies();
    setUrl('/');
  });

  it('/auth/callback 에서 시작해 /next 로 이동해도 전송 본문에 토큰이 없다', async () => {
    setUrl('/auth/callback?code=x#access_token=y&refresh_token=z');
    vi.resetModules();
    const api = await import('./amplitude');
    const sdk = await import('@amplitude/analytics-browser');

    api.initAmplitude();
    await new Promise((resolve) => setTimeout(resolve, 600));
    expect(sentBodies).toEqual([]); // 콜백 URL이 남아 있는 동안은 아무것도 보내지 않는다

    setUrl('/next');
    api.trackAmplitude('game_started', { game_id: 'timer' });
    await vi.waitFor(() => expect(sentBodies.length).toBeGreaterThan(0), { timeout: 8_000 });
    await sdk.flush().promise;

    const sent = sentBodies.join('\n');
    expect(sent).toContain('game_started');
    expect(sent).toContain('/next');
    FORBIDDEN.forEach((pattern) => expect(sent).not.toMatch(pattern));
  }, 20_000);

  it('인증 파라미터가 아닌 민감 쿼리·해시도 페이지뷰에서 제거하고 utm은 남긴다', async () => {
    setUrl('/promo?email=a%40b.c&utm_source=news&key=k#section');

    const sent = await startAndFlush((api) => api.trackAmplitude('share_clicked', { channel: 'link' }));

    expect(sent).toContain('utm_source');
    FORBIDDEN.forEach((pattern) => expect(sent).not.toMatch(pattern));
    expect(sent).not.toMatch(/[?&]key=k/);
  }, 20_000);

  it('referrer 에 code·access_token·해시가 있어도 session_start 와 첫 페이지뷰 본문에 남지 않는다', async () => {
    setReferrer('https://idp.example/cb?code=REFCODE&access_token=REFTOKEN&utm_source=ref#frag=REFFRAG');
    setUrl('/landing');

    await startAndFlush((api) => api.trackAmplitude('share_clicked', { channel: 'link' }));
    const sdk = await import('@amplitude/analytics-browser');
    await vi.waitFor(
      async () => {
        await sdk.flush().promise;
        const sent = sentBodies.join('\n');
        expect(sent).toContain('session_start');
        expect(sent).toContain('[Amplitude] Page Viewed');
      },
      { timeout: 8_000 },
    );

    const sent = sentBodies.join('\n');
    expect(sent).toContain('idp.example');
    FORBIDDEN.forEach((pattern) => expect(sent).not.toMatch(pattern));
    expect(sent).not.toMatch(/REFCODE|REFTOKEN|REFFRAG/);
  }, 30_000);

  it('IP 주소를 수집하지 않는다 (전송 본문에 ip 필드가 없다)', async () => {
    setUrl('/landing');

    const sent = await startAndFlush((api) => api.trackAmplitude('share_clicked', { channel: 'link' }));

    expect(sent).not.toMatch(/"ip"|\$remote/);
  }, 20_000);

  it('원격 설정을 가져오지 않는다 (대시보드 토글로 autocapture 가 켜지지 않는다)', async () => {
    setUrl('/landing');

    await startAndFlush((api) => api.trackAmplitude('share_clicked', { channel: 'link' }));

    expect(requestedUrls.length).toBeGreaterThan(0);
    requestedUrls.forEach((url) => expect(new URL(url).hostname).toBe('api2.amplitude.com'));
  }, 20_000);

  it('기기 ID를 쿠키가 아니라 localStorage 의 AMP_ 키에만 저장한다', async () => {
    setUrl('/landing');

    await startAndFlush((api) => api.trackAmplitude('share_clicked', { channel: 'link' }));

    const keys = Array.from({ length: window.localStorage.length }, (_, i) => window.localStorage.key(i));
    expect(keys.some((key) => key?.startsWith('AMP_'))).toBe(true);
    expect(document.cookie).not.toMatch(/AMP_/);
  }, 20_000);

  it('clearAmplitudeData 이후에는 예전 기기 ID가 저장소에도 이후 전송에도 남지 않는다', async () => {
    setUrl('/landing');
    let clear = (): void => undefined;
    const first = await startAndFlush((api) => {
      clear = api.clearAmplitudeData;
    });
    const oldId = /"device_id":"([^"]+)"/.exec(first)?.[1] ?? '';
    expect(oldId).not.toBe('');

    clear();
    sentBodies = [];
    const api = await import('./amplitude');
    const sdk = await import('@amplitude/analytics-browser');
    api.trackAmplitude('share_clicked', { channel: 'after-clear' });
    await vi.waitFor(async () => {
      await sdk.flush().promise;
      expect(sentBodies.join('\n')).toContain('after-clear');
    }, { timeout: 8_000 });

    expect(sentBodies.join('\n')).not.toContain(oldId);
    expect(JSON.stringify(window.localStorage)).not.toContain(oldId);
  }, 30_000);
});
