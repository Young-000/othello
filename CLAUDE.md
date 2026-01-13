# Othello (Classic Games)

오셀로 게임 (클래식 보드 게임 컬렉션)

---

## 진행상황 체크리스트

| 영역 | 상태 | 배포 URL |
|------|:----:|----------|
| **Frontend** | ✅ | [classic-games-kappa.vercel.app](https://classic-games-kappa.vercel.app) |
| **Backend** | ✅ | Supabase 직접 연결 |
| **DB 연결** | ✅ | `classic_games.rankings` 테이블 생성 완료 |
| **배포** | ✅ | Vercel |

<details>
<summary>상세 체크리스트</summary>

### Frontend
- [x] 프로젝트 초기화 (Vite)
- [x] TypeScript 설정
- [x] 환경 변수 (.env.local)

### Backend
- [x] Supabase 직접 연결 (별도 백엔드 없음)

### DB 연결
- [x] Project 1 선택
- [x] `classic_games` 스키마 생성
- [x] `rankings` 테이블 생성 (RLS 활성화)
- [x] 클라이언트 `.schema()` 적용

### 배포
- [x] Vercel 연결
- [x] 프로덕션 배포

</details>

---

## Supabase 설정

> ⚠️ **필수 참조**: [`/SUPABASE_RULES.md`](/SUPABASE_RULES.md)

| 항목 | 값 |
|------|-----|
| **Project** | Project 1 (게임) |
| **Project ID** | `ayibvijmjygujjieueny` |
| **Schema** | `classic_games` |
| **URL** | `https://ayibvijmjygujjieueny.supabase.co` |

## 프로젝트 구조

```
othello/
└── classic-games/   # 메인 앱 디렉토리
    ├── src/
    ├── supabase/
    └── ...
```

## 기술 스택

- **Frontend**: React + Vite + TypeScript
- **Styling**: Tailwind CSS
- **Database**: Supabase (PostgreSQL)

## 개발 명령어

```bash
cd classic-games
npm install    # 의존성 설치
npm run dev    # 개발 서버
npm run build  # 프로덕션 빌드
npm run lint   # 린트 실행
```

## 환경 변수

`classic-games/.env.local`:
```env
# Supabase Configuration - Project 1 (게임)
# Schema: classic_games

VITE_SUPABASE_URL=https://ayibvijmjygujjieueny.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
```

## 테이블 구조

```sql
-- classic_games.rankings (RLS 활성화)
CREATE TABLE classic_games.rankings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id TEXT NOT NULL,
  player_name TEXT NOT NULL,
  score INTEGER NOT NULL,
  moves INTEGER NOT NULL,
  time INTEGER NOT NULL,
  difficulty TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

---

*이 프로젝트는 글로벌 규칙 `/CLAUDE.md` 및 `/SUPABASE_RULES.md`를 따릅니다.*
