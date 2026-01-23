import { useState } from 'react'
import { saveRanking, calculateScore, isTopScore, saveToGlobalRanking } from '../../services/rankingService'
import { shareScore, getGameDisplayName, ShareResult } from '../../services/shareService'
import { RANKING_CONSTRAINTS } from '../../domain/ranking/types'
import styles from './WinModal.module.css'

const PLAYER_NAME_KEY = 'classic-games-player-name'

interface WinModalProps {
  gameId: string
  moves: number
  time: string
  timeInSeconds: number
  onPlayAgain: () => void
  extra?: { difficulty?: string; completedSuits?: number; removedCards?: number; gameScore?: number }
  customTitle?: string
  customMessage?: string
}

export default function WinModal({
  gameId,
  moves,
  time,
  timeInSeconds,
  onPlayAgain,
  extra,
  customTitle,
  customMessage,
}: WinModalProps) {
  const [playerName, setPlayerName] = useState(() => {
    try {
      return localStorage.getItem(PLAYER_NAME_KEY) || ''
    } catch {
      return ''
    }
  })
  const [saved, setSaved] = useState(false)
  const [shareStatus, setShareStatus] = useState<'idle' | 'copied' | 'shared' | 'error'>('idle')

  const score = extra?.gameScore ?? calculateScore(gameId, moves, timeInSeconds, true, extra)
  const isTop = isTopScore(gameId, score, timeInSeconds)

  const handleSave = async () => {
    if (!playerName.trim()) return

    const trimmedName = playerName.trim()

    // Remember player name for next time
    try {
      localStorage.setItem(PLAYER_NAME_KEY, trimmedName)
    } catch {
      // Ignore storage errors
    }

    // Save to local storage
    saveRanking(gameId, {
      playerName: trimmedName,
      score,
      moves,
      time: timeInSeconds,
      difficulty: extra?.difficulty,
    })

    // Save to global ranking (Supabase)
    try {
      await saveToGlobalRanking(gameId, {
        playerName: trimmedName,
        score,
        moves,
        time: timeInSeconds,
        difficulty: extra?.difficulty,
      })
    } catch (error) {
      console.error('Failed to save to global ranking:', error)
      // Continue - local save succeeded
    }

    setSaved(true)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave()
    }
  }

  const handleShare = async () => {
    const result: ShareResult = await shareScore({
      gameId,
      gameName: getGameDisplayName(gameId),
      score,
      moves,
      time,
    })

    if (result.success) {
      setShareStatus(result.method === 'clipboard' ? 'copied' : 'shared')
      // Reset status after 2 seconds
      setTimeout(() => setShareStatus('idle'), 2000)
    } else if (result.error !== 'cancelled') {
      setShareStatus('error')
      setTimeout(() => setShareStatus('idle'), 2000)
    }
  }

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <div className={styles.confetti}>🎉</div>
        <h2 className={styles.title}>{customTitle || '축하합니다!'}</h2>
        <p className={styles.subtitle}>{customMessage || '게임 클리어!'}</p>

        <div className={styles.stats}>
          <div className={styles.statRow}>
            <span>이동</span>
            <span>{moves}</span>
          </div>
          <div className={styles.statRow}>
            <span>시간</span>
            <span>{time}</span>
          </div>
          <div className={styles.statRow}>
            <span>점수</span>
            <span className={styles.score}>{score.toLocaleString()}</span>
          </div>
        </div>

        {isTop && !saved && (
          <div className={styles.rankingSection}>
            <p className={styles.topScore}>🏆 신기록 달성!</p>
            <div className={styles.inputGroup}>
              <input
                type="text"
                placeholder="이름을 입력하세요"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                onKeyDown={handleKeyDown}
                maxLength={RANKING_CONSTRAINTS.MAX_PLAYER_NAME_LENGTH}
                className={styles.input}
                autoFocus
                aria-label="플레이어 이름"
              />
              <button
                className={styles.saveButton}
                onClick={handleSave}
                disabled={!playerName.trim()}
              >
                저장
              </button>
            </div>
          </div>
        )}

        {saved && (
          <p className={styles.savedMessage}>글로벌 랭킹에 저장되었습니다!</p>
        )}

        <div className={styles.buttonGroup}>
          <button className={styles.shareButton} onClick={handleShare}>
            {shareStatus === 'copied' && '복사됨!'}
            {shareStatus === 'shared' && '공유됨!'}
            {shareStatus === 'error' && '실패'}
            {shareStatus === 'idle' && '공유하기'}
          </button>
          <button className={styles.playAgainButton} onClick={onPlayAgain}>
            다시 하기
          </button>
        </div>
      </div>
    </div>
  )
}
