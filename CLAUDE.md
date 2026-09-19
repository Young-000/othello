# Othello (Classic Games)

오셀로 게임 (클래식 보드 게임 컬렉션)

## Overview

| 항목 | 값 |
|------|-----|
| **배포 URL** | https://classic-games-kappa.vercel.app |
| **Supabase** | Project 1 - `ayibvijmjygujjieueny` |
| **Schema** | `classic_games` |

## 진행상황

| 영역 | 상태 |
|------|:----:|
| Frontend | ✅ |
| DB 연결 | ✅ |
| 배포 | ✅ |

## 프로젝트 구조

```
othello/
└── classic-games/   # 메인 앱 디렉토리
    ├── src/
    └── ...
```

## DB 테이블

```sql
-- classic_games 스키마 사용 (5sec-challenge와 공유)
classic_games.rankings
```

## 환경 변수 (classic-games/.env.local)

```env
VITE_SUPABASE_URL=https://ayibvijmjygujjieueny.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
```

## 개발 명령어

```bash
cd classic-games
npm run dev
```

---

*전역 설정 참조: `workspace/CLAUDE.md`, `SUPABASE_RULES.md`*
