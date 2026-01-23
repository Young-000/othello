# Classic Games API Documentation

This document provides comprehensive API documentation for the Classic Games project, including services, domain types, database schema, hooks, and components.

---

## Table of Contents

1. [Services API Reference](#services-api-reference)
   - [Ranking Service](#ranking-service)
   - [Challenge Service](#challenge-service)
   - [Share Service](#share-service)
2. [Domain Types Reference](#domain-types-reference)
   - [Ranking Types](#ranking-types)
   - [Challenge Types](#challenge-types)
   - [Card Types](#card-types)
3. [Supabase Database Schema](#supabase-database-schema)
4. [Custom Hooks Reference](#custom-hooks-reference)
5. [Component Props Reference](#component-props-reference)
6. [Score Calculation Formulas](#score-calculation-formulas)

---

## Services API Reference

### Ranking Service

Location: `/src/services/rankingService.ts`

The ranking service manages both local (localStorage) and global (Supabase) game rankings.

#### Interfaces

```typescript
interface RankingEntry {
  id: string;
  playerName: string;
  score: number;
  moves: number;
  time: number;      // in seconds
  date: string;      // ISO date string
  difficulty?: string;
}

interface GameRankings {
  [gameId: string]: RankingEntry[];
}

interface GlobalRankingEntry {
  id: string;
  game_id: string;
  player_name: string;
  score: number;
  moves: number | null;
  time: number | null;
  difficulty: string | null;
  created_at: string;
}
```

#### Functions

##### `getRankings()`

Retrieves all local rankings from localStorage.

```typescript
function getRankings(): GameRankings
```

**Returns:** Object containing rankings for all games.

**Example:**
```typescript
const allRankings = getRankings();
// { klondike: [...], sudoku: [...] }
```

---

##### `getGameRankings(gameId)`

Retrieves local rankings for a specific game.

```typescript
function getGameRankings(gameId: string): RankingEntry[]
```

| Parameter | Type | Description |
|-----------|------|-------------|
| `gameId` | `string` | The unique identifier of the game |

**Returns:** Array of ranking entries, sorted by score (descending), then time (ascending).

**Example:**
```typescript
const klondikeRankings = getGameRankings('klondike');
```

---

##### `saveRanking(gameId, entry)`

Saves a new ranking entry to localStorage.

```typescript
function saveRanking(
  gameId: string,
  entry: Omit<RankingEntry, 'id' | 'date'>
): RankingEntry
```

| Parameter | Type | Description |
|-----------|------|-------------|
| `gameId` | `string` | The unique identifier of the game |
| `entry` | `object` | Ranking data (playerName, score, moves, time, difficulty?) |

**Returns:** The created ranking entry with generated `id` and `date`.

**Throws:** `Error` if playerName is empty or score is invalid.

**Example:**
```typescript
const newEntry = saveRanking('klondike', {
  playerName: 'Player1',
  score: 1500,
  moves: 45,
  time: 120,
  difficulty: 'easy'
});
```

---

##### `clearGameRankings(gameId)`

Clears all rankings for a specific game.

```typescript
function clearGameRankings(gameId: string): void
```

---

##### `clearAllRankings()`

Clears all rankings from localStorage.

```typescript
function clearAllRankings(): void
```

---

##### `isTopScore(gameId, score, time)`

Checks if a score qualifies for the top 10 leaderboard.

```typescript
function isTopScore(gameId: string, score: number, time: number): boolean
```

| Parameter | Type | Description |
|-----------|------|-------------|
| `gameId` | `string` | The unique identifier of the game |
| `score` | `number` | The player's score |
| `time` | `number` | The completion time in seconds |

**Returns:** `true` if the score qualifies for top 10.

---

##### `calculateScore(gameId, moves, timeInSeconds, won, extra?)`

Calculates the final score based on game-specific formulas.

```typescript
function calculateScore(
  gameId: string,
  moves: number,
  timeInSeconds: number,
  won: boolean,
  extra?: {
    difficulty?: string;
    completedSuits?: number;
    removedCards?: number;
    gameScore?: number;
  }
): number
```

| Parameter | Type | Description |
|-----------|------|-------------|
| `gameId` | `string` | Game identifier |
| `moves` | `number` | Number of moves made |
| `timeInSeconds` | `number` | Time taken in seconds |
| `won` | `boolean` | Whether the game was won |
| `extra` | `object` | (Optional) Game-specific parameters |

**Returns:** Calculated score (0 if game was not won).

See [Score Calculation Formulas](#score-calculation-formulas) for game-specific calculations.

---

##### `formatTime(seconds)`

Formats seconds into MM:SS display format.

```typescript
function formatTime(seconds: number): string
```

**Example:**
```typescript
formatTime(125); // "2:05"
```

---

##### `saveToGlobalRanking(gameId, entry)` (Async)

Saves a ranking to the global Supabase database.

```typescript
async function saveToGlobalRanking(
  gameId: string,
  entry: Omit<RankingEntry, 'id' | 'date'>
): Promise<boolean>
```

**Returns:** `true` if save was successful, `false` otherwise.

---

##### `getGlobalRankings(gameId, limit?)` (Async)

Retrieves global rankings from Supabase.

```typescript
async function getGlobalRankings(
  gameId: string,
  limit: number = 10
): Promise<GlobalRankingEntry[]>
```

---

##### `getAllGlobalRankings(limit?)` (Async)

Retrieves all global rankings across all games.

```typescript
async function getAllGlobalRankings(
  limit: number = 50
): Promise<GlobalRankingEntry[]>
```

---

### Challenge Service

Location: `/src/services/challengeService.ts`

Manages daily challenges with localStorage persistence, including streak tracking.

#### Functions

##### `getDailyChallenge()`

Gets today's daily challenge.

```typescript
function getDailyChallenge(): DailyChallenge
```

**Returns:** Today's challenge configuration (deterministic based on date).

**Example:**
```typescript
const challenge = getDailyChallenge();
// { gameId: 'sudoku', date: '2025-01-23', targetScore: 450, ... }
```

---

##### `isTodayChallengeCompleted()`

Checks if today's challenge has been completed.

```typescript
function isTodayChallengeCompleted(): boolean
```

---

##### `getTodayChallengeResult()`

Gets today's challenge result if it exists.

```typescript
function getTodayChallengeResult(): ChallengeResult | null
```

---

##### `saveChallengeResult(gameId, score, targetScore)`

Saves a challenge result and updates streak.

```typescript
function saveChallengeResult(
  gameId: string,
  score: number,
  targetScore: number
): ChallengeResult
```

| Parameter | Type | Description |
|-----------|------|-------------|
| `gameId` | `string` | Game identifier |
| `score` | `number` | Player's achieved score |
| `targetScore` | `number` | Target score to beat |

**Returns:** The saved challenge result.

**Note:** Updates existing result if new score is higher. Maintains only last 30 days of results.

---

##### `getChallengeStreak()`

Gets the current streak count.

```typescript
function getChallengeStreak(): number
```

**Returns:** Current streak (0 if broken).

---

##### `getLongestStreak()`

Gets the longest streak achieved.

```typescript
function getLongestStreak(): number
```

---

##### `getChallengeStats()`

Gets comprehensive challenge statistics.

```typescript
function getChallengeStats(): {
  currentStreak: number;
  longestStreak: number;
  totalCompleted: number;
  todayCompleted: boolean;
}
```

---

##### `getRecentResults(days?)`

Gets recent challenge results.

```typescript
function getRecentResults(days: number = 7): ChallengeResult[]
```

---

##### `clearChallengeData()`

Clears all challenge data (for testing/debugging).

```typescript
function clearChallengeData(): void
```

---

### Share Service

Location: `/src/services/shareService.ts`

Handles sharing game scores via Web Share API or clipboard fallback.

#### Interfaces

```typescript
interface ShareData {
  gameId: string;
  gameName: string;
  score: number;
  moves: number;
  time: string;
}

interface ShareResult {
  success: boolean;
  method: 'share' | 'clipboard' | 'none';
  error?: string;
}
```

#### Functions

##### `getGameDisplayName(gameId)`

Gets the localized display name for a game.

```typescript
function getGameDisplayName(gameId: string): string
```

**Example:**
```typescript
getGameDisplayName('klondike'); // "클론다이크 솔리테어"
```

---

##### `generateShareUrl(gameId)`

Generates the shareable URL for a game.

```typescript
function generateShareUrl(gameId: string): string
```

**Example:**
```typescript
generateShareUrl('sudoku'); // "https://classic-games-kappa.vercel.app/sudoku"
```

---

##### `generateShareText(data)`

Generates the formatted share text message.

```typescript
function generateShareText(data: ShareData): string
```

**Returns:** Formatted message with game name, score, time, moves, and URL.

---

##### `isWebShareAvailable()`

Checks if Web Share API is available.

```typescript
function isWebShareAvailable(): boolean
```

---

##### `isClipboardAvailable()`

Checks if Clipboard API is available.

```typescript
function isClipboardAvailable(): boolean
```

---

##### `shareScore(data)` (Async)

Shares score using Web Share API or clipboard fallback.

```typescript
async function shareScore(data: ShareData): Promise<ShareResult>
```

**Returns:** Result indicating success and method used.

**Example:**
```typescript
const result = await shareScore({
  gameId: 'klondike',
  gameName: 'Klondike',
  score: 1500,
  moves: 45,
  time: '2:05'
});

if (result.success) {
  console.log(`Shared via ${result.method}`);
}
```

---

## Domain Types Reference

### Ranking Types

Location: `/src/domain/ranking/types.ts`

#### Interfaces

```typescript
interface RankingEntry {
  id: string;
  playerName: string;
  score: number;
  moves: number;
  time: number;
  date: string;
  difficulty?: string;
  gameId: string;
}

interface CreateRankingInput {
  playerName: string;
  score: number;
  moves: number;
  time: number;
  difficulty?: string;
}

interface IRankingRepository {
  getAll(gameId: string): Promise<RankingEntry[]>;
  save(gameId: string, entry: CreateRankingInput): Promise<RankingEntry>;
  clear(gameId: string): Promise<void>;
  clearAll(): Promise<void>;
}
```

#### Constants

```typescript
const RANKING_CONSTRAINTS = {
  MAX_PLAYER_NAME_LENGTH: 50,
  MIN_PLAYER_NAME_LENGTH: 1,
  MIN_SCORE: 0,
  MAX_SCORE: 1_000_000_000,
  MAX_MOVES: 1_000_000,
  MAX_TIME: 86_400_000, // 24 hours in ms
}
```

#### Validation Functions

##### `validateRankingInput(input)`

Validates ranking input data.

```typescript
function validateRankingInput(input: CreateRankingInput): void
```

**Throws:** `RankingValidationError` if validation fails.

---

##### `sanitizePlayerName(name)`

Sanitizes player name for XSS prevention.

```typescript
function sanitizePlayerName(name: string): string
```

**Returns:** Sanitized name with HTML tags removed and trimmed.

---

##### `isRankingEntry(obj)`

Type guard for RankingEntry.

```typescript
function isRankingEntry(obj: unknown): obj is RankingEntry
```

---

### Challenge Types

Location: `/src/domain/challenge/types.ts`

#### Interfaces

```typescript
interface DailyChallenge {
  gameId: string;
  date: string;           // ISO date string (YYYY-MM-DD)
  targetScore: number;
  seed: number;
  gameName: string;
  gameIcon: string;
  gamePath: string;
}

interface ChallengeResult {
  date: string;
  gameId: string;
  completed: boolean;
  score: number;
  targetScore: number;
  completedAt: string;
}

interface ChallengeData {
  lastPlayedDate: string;
  currentStreak: number;
  longestStreak: number;
  results: ChallengeResult[];
}
```

#### Functions

##### `getTodayDateString()`

Gets today's date in YYYY-MM-DD format.

```typescript
function getTodayDateString(): string
```

---

##### `generateDailyChallenge(dateString?)`

Generates a deterministic daily challenge based on date.

```typescript
function generateDailyChallenge(dateString?: string): DailyChallenge
```

| Parameter | Type | Description |
|-----------|------|-------------|
| `dateString` | `string?` | Optional date string (defaults to today) |

**Returns:** Challenge configuration for the specified date.

---

##### `createInitialChallengeData()`

Creates initial challenge data structure.

```typescript
function createInitialChallengeData(): ChallengeData
```

---

##### `isChallengeData(obj)` / `isChallengeResult(obj)`

Type guards for challenge types.

```typescript
function isChallengeData(obj: unknown): obj is ChallengeData
function isChallengeResult(obj: unknown): obj is ChallengeResult
```

---

### Card Types

Location: `/src/domain/card/Card.ts`

#### Types

```typescript
type Suit = 'hearts' | 'diamonds' | 'clubs' | 'spades'
type Rank = 'A' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K'

interface Card {
  readonly suit: Suit;
  readonly rank: Rank;
  readonly faceUp: boolean;
}
```

#### Constants

```typescript
const SUITS: readonly Suit[] = ['hearts', 'diamonds', 'clubs', 'spades']
const RANKS: readonly Rank[] = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K']
```

#### Functions

##### `createCard(suit, rank, faceUp?)`

Creates a new card.

```typescript
function createCard(suit: Suit, rank: Rank, faceUp = false): Card
```

---

##### `flipCard(card)`

Returns a new card with flipped face state.

```typescript
function flipCard(card: Card): Card
```

---

##### `isRed(card)` / `isBlack(card)`

Checks card color.

```typescript
function isRed(card: Card): boolean
function isBlack(card: Card): boolean
```

---

##### `getRankValue(card)`

Gets numeric value of rank (A=1, K=13).

```typescript
function getRankValue(card: Card): number
```

---

##### `areOppositeColors(card1, card2)`

Checks if two cards have opposite colors.

```typescript
function areOppositeColors(card1: Card, card2: Card): boolean
```

---

##### `isOneRankLower(lower, higher)` / `isOneRankHigher(higher, lower)`

Checks rank relationships.

```typescript
function isOneRankLower(lower: Card, higher: Card): boolean
function isOneRankHigher(higher: Card, lower: Card): boolean
```

---

##### `getCardId(card)`

Gets unique identifier for a card.

```typescript
function getCardId(card: Card): string
// Returns: "hearts-A", "spades-K", etc.
```

---

## Supabase Database Schema

### Connection Configuration

| Item | Value |
|------|-------|
| **Project** | Project 1 (Games) |
| **Project ID** | `ayibvijmjygujjieueny` |
| **Schema** | `classic_games` |
| **URL** | `https://ayibvijmjygujjieueny.supabase.co` |

### Environment Variables

```env
VITE_SUPABASE_URL=https://ayibvijmjygujjieueny.supabase.co
VITE_SUPABASE_ANON_KEY=<your-anon-key>
```

### Table: `classic_games.rankings`

Main table for storing global game rankings.

#### Schema

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | `UUID` | No | `gen_random_uuid()` | Primary key |
| `game_id` | `TEXT` | No | - | Game identifier |
| `player_name` | `TEXT` | No | - | Player's display name |
| `score` | `INTEGER` | No | - | Final score |
| `moves` | `INTEGER` | Yes | `NULL` | Number of moves |
| `time` | `INTEGER` | Yes | `NULL` | Time in seconds |
| `difficulty` | `TEXT` | Yes | `NULL` | Difficulty level |
| `created_at` | `TIMESTAMPTZ` | No | `now()` | Creation timestamp |

#### SQL Definition

```sql
CREATE TABLE classic_games.rankings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id TEXT NOT NULL,
  player_name TEXT NOT NULL,
  score INTEGER NOT NULL,
  moves INTEGER,
  time INTEGER,
  difficulty TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

#### RLS Policies

Row Level Security (RLS) is enabled on this table.

| Policy | Action | Target | Description |
|--------|--------|--------|-------------|
| `rankings_select_all` | SELECT | Public | Allow anyone to read rankings |
| `rankings_insert_anon` | INSERT | Anon | Allow anonymous users to insert |

```sql
-- Enable RLS
ALTER TABLE classic_games.rankings ENABLE ROW LEVEL SECURITY;

-- Allow public read access
CREATE POLICY rankings_select_all ON classic_games.rankings
  FOR SELECT
  USING (true);

-- Allow anonymous inserts
CREATE POLICY rankings_insert_anon ON classic_games.rankings
  FOR INSERT
  WITH CHECK (true);
```

#### Recommended Indexes

```sql
-- Index for game-specific queries
CREATE INDEX rankings_game_id_idx ON classic_games.rankings(game_id);

-- Index for leaderboard queries
CREATE INDEX rankings_score_idx ON classic_games.rankings(game_id, score DESC, time ASC);
```

---

## Custom Hooks Reference

### `useGameTimer`

Location: `/src/hooks/useGameTimer.ts`

Manages game timer with start/stop functionality.

#### Signature

```typescript
function useGameTimer(isRunning: boolean = true): {
  seconds: number;
  formattedTime: string;
  reset: () => void;
}
```

#### Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `isRunning` | `boolean` | `true` | Whether the timer is active |

#### Returns

| Property | Type | Description |
|----------|------|-------------|
| `seconds` | `number` | Elapsed time in seconds |
| `formattedTime` | `string` | Formatted time string (MM:SS) |
| `reset` | `() => void` | Resets the timer to 0 |

#### Example

```typescript
function GameComponent() {
  const [gameOver, setGameOver] = useState(false);
  const { seconds, formattedTime, reset } = useGameTimer(!gameOver);

  const handleNewGame = () => {
    reset();
    setGameOver(false);
  };

  return (
    <div>
      <span>Time: {formattedTime}</span>
      <button onClick={handleNewGame}>New Game</button>
    </div>
  );
}
```

---

### `useLocalStorage`

Location: `/src/hooks/useLocalStorage.ts`

Persists state to localStorage with automatic serialization.

#### Signature

```typescript
function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T | ((prev: T) => T)) => void]
```

#### Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `key` | `string` | localStorage key |
| `initialValue` | `T` | Initial value if no stored value exists |

#### Returns

Tuple of `[storedValue, setValue]` similar to `useState`.

#### Example

```typescript
const [settings, setSettings] = useLocalStorage('game-settings', {
  sound: true,
  difficulty: 'medium'
});

setSettings(prev => ({ ...prev, sound: false }));
```

---

### `useSavedGame`

Location: `/src/hooks/useLocalStorage.ts`

Manages game state persistence with new game and clear functionality.

#### Signature

```typescript
function useSavedGame<T>(
  gameKey: string,
  createGame: () => T
): {
  state: T;
  setState: (value: T | ((prev: T) => T)) => void;
  newGame: () => void;
  clearSave: () => void;
}
```

#### Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `gameKey` | `string` | Unique key for the game |
| `createGame` | `() => T` | Factory function to create new game state |

#### Returns

| Property | Type | Description |
|----------|------|-------------|
| `state` | `T` | Current game state |
| `setState` | `function` | Updates game state |
| `newGame` | `() => void` | Creates new game and saves |
| `clearSave` | `() => void` | Clears saved game from storage |

#### Example

```typescript
const { state, setState, newGame, clearSave } = useSavedGame(
  'sudoku',
  () => createSudokuGame('medium')
);
```

---

### `useBestScore`

Location: `/src/hooks/useBestScore.ts`

Tracks and persists the best score for a game.

#### Signature

```typescript
function useBestScore(gameKey: string): {
  bestScore: number | null;
  bestDate: string | null;
  updateBestScore: (score: number, higherIsBetter?: boolean) => void;
  resetBestScore: () => void;
  isNewBest: (score: number, higherIsBetter?: boolean) => boolean;
}
```

#### Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `gameKey` | `string` | Unique identifier for the game |

#### Returns

| Property | Type | Description |
|----------|------|-------------|
| `bestScore` | `number \| null` | Best recorded score |
| `bestDate` | `string \| null` | ISO date when best was achieved |
| `updateBestScore` | `function` | Updates best score if applicable |
| `resetBestScore` | `() => void` | Resets best score to null |
| `isNewBest` | `function` | Checks if score beats the current best |

#### Example

```typescript
const { bestScore, updateBestScore, isNewBest } = useBestScore('2048');

const handleGameOver = (score: number) => {
  if (isNewBest(score, true)) {
    console.log('New high score!');
    updateBestScore(score, true);
  }
};
```

---

### `useKlondikeGame`

Location: `/src/hooks/useKlondikeGame.ts`

Complete game logic hook for Klondike Solitaire.

#### Signature

```typescript
function useKlondikeGame(): {
  state: KlondikeState;
  selection: Selection | null;
  canUndo: boolean;
  newGame: () => void;
  undo: () => void;
  handleDraw: () => void;
  handleWasteClick: () => void;
  handleTableauClick: (columnIndex: number, cardIndex: number) => void;
  handleFoundationClick: (foundationIndex: number) => void;
  handleDoubleClick: () => void;
}
```

#### Selection Type

```typescript
interface Selection {
  type: 'tableau' | 'waste';
  columnIndex?: number;
  cardCount: number;
}
```

#### Returns

| Property | Type | Description |
|----------|------|-------------|
| `state` | `KlondikeState` | Current game state |
| `selection` | `Selection \| null` | Currently selected cards |
| `canUndo` | `boolean` | Whether undo is available |
| `newGame` | `function` | Starts a new game |
| `undo` | `function` | Undoes the last move |
| `handleDraw` | `function` | Draws from stock pile |
| `handleWasteClick` | `function` | Handles waste pile clicks |
| `handleTableauClick` | `function` | Handles tableau column clicks |
| `handleFoundationClick` | `function` | Handles foundation pile clicks |
| `handleDoubleClick` | `function` | Auto-moves card to foundation |

---

## Component Props Reference

### GameHeader

Location: `/src/components/common/GameHeader.tsx`

Header component displaying game info and controls.

#### Props

```typescript
interface GameHeaderProps {
  title: string;           // Game title displayed
  gameId: string;          // Game identifier for help/rankings
  moves?: number;          // Move counter
  time?: string;           // Formatted time string
  score?: number;          // Current score
  onNewGame?: () => void;  // New game button handler
  onUndo?: () => void;     // Undo button handler
  canUndo?: boolean;       // Whether undo is enabled (default: false)
}
```

#### Example

```typescript
<GameHeader
  title="Klondike Solitaire"
  gameId="klondike"
  moves={45}
  time="2:30"
  score={1500}
  onNewGame={handleNewGame}
  onUndo={handleUndo}
  canUndo={canUndo}
/>
```

---

### WinModal

Location: `/src/components/common/WinModal.tsx`

Modal displayed when a game is won.

#### Props

```typescript
interface WinModalProps {
  gameId: string;          // Game identifier
  moves: number;           // Total moves made
  time: string;            // Formatted time string
  timeInSeconds: number;   // Time in seconds for scoring
  onPlayAgain: () => void; // Play again button handler
  extra?: {
    difficulty?: string;       // Game difficulty
    completedSuits?: number;   // For Spider solitaire
    removedCards?: number;     // For Pyramid solitaire
    gameScore?: number;        // Pre-calculated score
  };
  customTitle?: string;    // Custom title (default: "Congratulations!")
  customMessage?: string;  // Custom message (default: "Game Clear!")
}
```

#### Features

- Automatic score calculation based on `gameId`
- Ranking save functionality (local + global)
- Share button with Web Share API / clipboard fallback
- Player name persistence
- XSS protection for player names

---

### RankingModal

Location: `/src/components/common/RankingModal.tsx`

Modal displaying game rankings.

#### Props

```typescript
interface RankingModalProps {
  gameId: string;      // Game identifier
  gameTitle: string;   // Display title
  isOpen: boolean;     // Modal visibility
  onClose: () => void; // Close handler
}
```

#### Features

- Displays top 10 rankings
- Medal icons for top 3 positions
- Clear rankings functionality
- Keyboard navigation (Escape to close)
- Accessible ARIA attributes

---

### HelpModal

Location: `/src/components/common/HelpModal.tsx`

Modal displaying game instructions.

#### Props

```typescript
interface HelpModalProps {
  gameId: string;      // Game identifier
  isOpen: boolean;     // Modal visibility
  onClose: () => void; // Close handler
}
```

#### Features

- Bilingual support (English/Korean)
- Language preference persistence
- Sections: Objective, How to Play, Tips, Scoring
- Keyboard navigation (Escape to close)

---

### PlayingCard

Location: `/src/components/common/PlayingCard.tsx`

Visual playing card component for card games.

#### Props

```typescript
interface PlayingCardProps {
  card: Card;                 // Card data
  onClick?: () => void;       // Click handler
  selected?: boolean;         // Selection state (default: false)
  draggable?: boolean;        // Enable dragging (default: false)
  style?: React.CSSProperties; // Custom styles
}
```

#### Features

- Face-up and face-down rendering
- Color-coded suits (red/black)
- Selection highlight
- Keyboard accessibility
- ARIA labels for screen readers

---

### DailyChallengeCard

Location: `/src/components/common/DailyChallengeCard.tsx`

Card displaying the daily challenge on the home page.

#### Props

None - stateless component that fetches challenge data internally.

#### Features

- Displays today's challenge game
- Shows target score
- Streak counter with fire icon
- Completion status badge
- Link to challenge game

---

## Score Calculation Formulas

Location: `/src/services/rankingService.ts` - `calculateScore()` function

### Klondike / Freecell

```
Score = BaseScore + TimeBonus - MovePenalty

BaseScore = 1000
TimeBonus = max(0, 500 - timeInSeconds)
MovePenalty = moves * 2

Final = max(0, BaseScore + TimeBonus - MovePenalty)
```

**Example:** 100 moves in 300 seconds = max(0, 1000 + 200 - 200) = **1000 points**

---

### Spider Solitaire

```
Score = BaseScore + TimeBonus - MovePenalty

BaseScore = completedSuits * 125  (default: 8 suits = 1000)
TimeBonus = max(0, 1000 - timeInSeconds)
MovePenalty = moves

Final = max(0, BaseScore + TimeBonus - MovePenalty)
```

---

### Pyramid Solitaire

```
Score = BaseScore + TimeBonus

BaseScore = removedCards * 50  (default: 28 cards = 1400)
TimeBonus = max(0, 300 - timeInSeconds)

Final = max(0, BaseScore + TimeBonus)
```

---

### 2048

```
Score = gameScore (sum of all merged tile values)
```

**Note:** The score is calculated by the game domain logic and passed directly.

---

### Sudoku

```
Score = BaseScore + TimeBonus

DifficultyMultiplier:
  - easy: 1
  - medium: 2
  - hard: 3

BaseScore = 500 * DifficultyMultiplier
TimeBonus = max(0, (300 * DifficultyMultiplier) - timeInSeconds)

Final = max(0, BaseScore + TimeBonus)
```

**Example (Hard):** Completed in 500 seconds = max(0, 1500 + 400) = **1900 points**

---

### Minesweeper

```
Score = BaseScore + TimeBonus

DifficultyMultiplier:
  - easy: 1
  - medium: 2
  - hard: 3

BaseScore = 500 * DifficultyMultiplier
TimeBonus = max(0, (200 * DifficultyMultiplier) - timeInSeconds)

Final = max(0, BaseScore + TimeBonus)
```

---

### Memory Match

```
Score = BaseScore - MovePenalty + TimeBonus

BaseScore = 1000
MovePenalty = (moves - 8) * 20  (8 = minimum possible moves for 8 pairs)
TimeBonus = max(0, 120 - timeInSeconds)

Final = max(0, BaseScore - MovePenalty + TimeBonus)
```

**Note:** Minimum moves is 8 because there are 8 pairs.

---

### Mini-games (Button Masher, Timer Challenge, Reaction Test)

```
Score = gameScore (pre-calculated by game domain logic)
```

**Note:** Mini-games have their own scoring systems implemented in their respective domain modules.

---

## Appendix

### Game IDs

| Game | ID | Type |
|------|-----|------|
| Klondike Solitaire | `klondike` | Card |
| Freecell | `freecell` | Card |
| Spider Solitaire | `spider` | Card |
| Pyramid Solitaire | `pyramid` | Card |
| 2048 | `2048` | Puzzle |
| Sudoku | `sudoku` | Puzzle |
| Minesweeper | `minesweeper` | Puzzle |
| Memory Match | `memory` | Puzzle |
| Button Masher | `button-masher` | Mini-game |
| Timer Challenge | `timer-challenge` | Mini-game |
| Reaction Test | `reaction-test` | Mini-game |

### localStorage Keys

| Key | Description |
|-----|-------------|
| `classic-games-rankings` | All local rankings |
| `classic-games-player-name` | Last used player name |
| `classic-games-daily-challenge` | Challenge data and streaks |
| `classic-games-best-{gameId}` | Best score for each game |
| `classic-games-{gameId}` | Saved game state |
| `preferred-language` | UI language preference |

---

*Last updated: 2025-01-23*
