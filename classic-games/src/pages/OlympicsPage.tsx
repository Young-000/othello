import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getAllGlobalRankings, GlobalRankingEntry, formatTime } from '../services/rankingService'
import styles from './OlympicsPage.module.css'

interface GameInfo {
  id: string
  name: string
  icon: string
}

const GAMES: GameInfo[] = [
  { id: 'klondike', name: '클론다이크', icon: '🃏' },
  { id: 'freecell', name: '프리셀', icon: '🎴' },
  { id: 'spider', name: '스파이더', icon: '🕷️' },
  { id: 'pyramid', name: '피라미드', icon: '🔺' },
  { id: '2048', name: '2048', icon: '🔢' },
  { id: 'sudoku', name: '스도쿠', icon: '9️⃣' },
  { id: 'minesweeper', name: '지뢰찾기', icon: '💣' },
  { id: 'memory', name: '메모리', icon: '🧠' },
]

interface PlayerStats {
  name: string
  totalScore: number
  goldMedals: number
  silverMedals: number
  bronzeMedals: number
  gamesPlayed: number
}

function calculatePlayerStats(rankings: GlobalRankingEntry[]): PlayerStats[] {
  const playerMap = new Map<string, PlayerStats>()
  const gameRankings: { [gameId: string]: GlobalRankingEntry[] } = {}

  // Group by game
  for (const entry of rankings) {
    if (!gameRankings[entry.game_id]) {
      gameRankings[entry.game_id] = []
    }
    gameRankings[entry.game_id].push(entry)
  }

  // Sort each game's rankings and assign medals
  for (const gameId of Object.keys(gameRankings)) {
    gameRankings[gameId].sort((a, b) => b.score - a.score)

    gameRankings[gameId].forEach((entry, index) => {
      const existingStats = playerMap.get(entry.player_name)
      const rank = index + 1

      if (existingStats) {
        existingStats.totalScore += entry.score
        existingStats.gamesPlayed += 1

        if (rank === 1) existingStats.goldMedals += 1
        else if (rank === 2) existingStats.silverMedals += 1
        else if (rank === 3) existingStats.bronzeMedals += 1
      } else {
        playerMap.set(entry.player_name, {
          name: entry.player_name,
          totalScore: entry.score,
          goldMedals: rank === 1 ? 1 : 0,
          silverMedals: rank === 2 ? 1 : 0,
          bronzeMedals: rank === 3 ? 1 : 0,
          gamesPlayed: 1,
        })
      }
    })
  }

  // Sort by medal count (gold > silver > bronze) then by total score
  return Array.from(playerMap.values()).sort((a, b) => {
    if (b.goldMedals !== a.goldMedals) return b.goldMedals - a.goldMedals
    if (b.silverMedals !== a.silverMedals) return b.silverMedals - a.silverMedals
    if (b.bronzeMedals !== a.bronzeMedals) return b.bronzeMedals - a.bronzeMedals
    return b.totalScore - a.totalScore
  })
}

export default function OlympicsPage() {
  const [rankings, setRankings] = useState<GlobalRankingEntry[]>([])
  const [playerStats, setPlayerStats] = useState<PlayerStats[]>([])
  const [selectedGame, setSelectedGame] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchRankings() {
      setLoading(true)
      const data = await getAllGlobalRankings(100)
      setRankings(data)
      setPlayerStats(calculatePlayerStats(data))
      setLoading(false)
    }
    fetchRankings()
  }, [])

  const gameRankings = selectedGame
    ? rankings
        .filter(r => r.game_id === selectedGame)
        .sort((a, b) => b.score - a.score)
        .slice(0, 10)
    : []

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <Link to="/" className={styles.backButton} aria-label="홈으로">
          ←
        </Link>
        <div className={styles.titleArea}>
          <h1 className={styles.title}>🏅 글로벌 랭킹</h1>
          <p className={styles.subtitle}>전세계 플레이어 순위</p>
        </div>
      </header>

      <main className={styles.main}>
        {loading ? (
          <div className={styles.loading}>
            <p>랭킹을 불러오는 중...</p>
          </div>
        ) : (
          <>
            {/* Medal Table */}
            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>🏆 메달 순위</h2>
              {playerStats.length === 0 ? (
                <div className={styles.empty}>
                  <p>아직 랭킹이 없습니다!</p>
                  <p>게임을 플레이하고 기록을 남겨보세요.</p>
                  <Link to="/" className={styles.playButton}>
                    게임 시작하기
                  </Link>
                </div>
              ) : (
                <div className={styles.medalTable}>
                  <div className={styles.tableHeader}>
                    <span className={styles.rankCol}>순위</span>
                    <span className={styles.nameCol}>플레이어</span>
                    <span className={styles.medalCol}>🥇</span>
                    <span className={styles.medalCol}>🥈</span>
                    <span className={styles.medalCol}>🥉</span>
                    <span className={styles.totalCol}>총점</span>
                  </div>
                  {playerStats.map((player, index) => (
                    <div
                      key={player.name}
                      className={`${styles.tableRow} ${index < 3 ? styles.topThree : ''}`}
                    >
                      <span className={styles.rankCol}>
                        {index === 0 ? '👑' : index + 1}
                      </span>
                      <span className={styles.nameCol}>{player.name}</span>
                      <span className={styles.medalCol}>
                        {player.goldMedals > 0 ? player.goldMedals : '-'}
                      </span>
                      <span className={styles.medalCol}>
                        {player.silverMedals > 0 ? player.silverMedals : '-'}
                      </span>
                      <span className={styles.medalCol}>
                        {player.bronzeMedals > 0 ? player.bronzeMedals : '-'}
                      </span>
                      <span className={styles.totalCol}>
                        {player.totalScore.toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* Game-by-Game Results */}
            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>🎮 게임별 순위</h2>
              <div className={styles.gameButtons}>
                {GAMES.map((game) => (
                  <button
                    key={game.id}
                    className={`${styles.gameButton} ${selectedGame === game.id ? styles.active : ''}`}
                    onClick={() => setSelectedGame(selectedGame === game.id ? null : game.id)}
                  >
                    <span className={styles.gameIcon}>{game.icon}</span>
                    <span className={styles.gameName}>{game.name}</span>
                  </button>
                ))}
              </div>

              {selectedGame && (
                <div className={styles.gameResults}>
                  <h3 className={styles.gameTitle}>
                    {GAMES.find(g => g.id === selectedGame)?.icon}{' '}
                    {GAMES.find(g => g.id === selectedGame)?.name} 랭킹
                  </h3>
                  {gameRankings.length === 0 ? (
                    <p className={styles.noResults}>아직 기록이 없습니다.</p>
                  ) : (
                    <div className={styles.resultsList}>
                      {gameRankings.map((entry, index) => (
                        <div key={entry.id} className={styles.resultRow}>
                          <span className={styles.resultRank}>
                            {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`}
                          </span>
                          <span className={styles.resultName}>{entry.player_name}</span>
                          <span className={styles.resultScore}>{entry.score.toLocaleString()}점</span>
                          <span className={styles.resultTime}>
                            {entry.time ? formatTime(entry.time) : '-'}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </section>

            {/* Statistics Summary */}
            {rankings.length > 0 && (
              <section className={styles.section}>
                <h2 className={styles.sectionTitle}>📊 통계</h2>
                <div className={styles.statsGrid}>
                  <div className={styles.statCard}>
                    <span className={styles.statValue}>{rankings.length}</span>
                    <span className={styles.statLabel}>총 기록</span>
                  </div>
                  <div className={styles.statCard}>
                    <span className={styles.statValue}>{playerStats.length}</span>
                    <span className={styles.statLabel}>플레이어</span>
                  </div>
                  <div className={styles.statCard}>
                    <span className={styles.statValue}>
                      {new Set(rankings.map(r => r.game_id)).size}
                    </span>
                    <span className={styles.statLabel}>플레이된 게임</span>
                  </div>
                  <div className={styles.statCard}>
                    <span className={styles.statValue}>
                      {playerStats.reduce((max, p) => Math.max(max, p.goldMedals), 0)}
                    </span>
                    <span className={styles.statLabel}>최다 금메달</span>
                  </div>
                </div>
              </section>
            )}
          </>
        )}
      </main>
    </div>
  )
}
