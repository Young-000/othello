import { useEffect, useCallback, useState } from 'react'
import { getGameRankings, RankingEntry, formatTime, clearGameRankings } from '../../services/rankingService'
import styles from './RankingModal.module.css'

interface RankingModalProps {
  gameId: string
  gameTitle: string
  isOpen: boolean
  onClose: () => void
}

export default function RankingModal({ gameId, gameTitle, isOpen, onClose }: RankingModalProps) {
  const [rankings, setRankings] = useState<RankingEntry[]>([])

  useEffect(() => {
    if (isOpen) {
      setRankings(getGameRankings(gameId))
    }
  }, [isOpen, gameId])

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose()
    }
  }, [onClose])

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'hidden'
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = ''
    }
  }, [isOpen, handleKeyDown])

  const handleClearRankings = () => {
    if (confirm('Clear all rankings for this game?')) {
      clearGameRankings(gameId)
      setRankings([])
    }
  }

  if (!isOpen) return null

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div
        className={styles.modal}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="ranking-title"
      >
        <div className={styles.header}>
          <h2 id="ranking-title" className={styles.title}>{gameTitle} Rankings</h2>
          <button
            className={styles.closeButton}
            onClick={onClose}
            aria-label="Close rankings"
          >
            x
          </button>
        </div>

        <div className={styles.content}>
          {rankings.length === 0 ? (
            <div className={styles.empty}>
              <p>No rankings yet!</p>
              <p>Complete a game to get on the leaderboard.</p>
            </div>
          ) : (
            <div className={styles.table}>
              <div className={styles.tableHeader}>
                <span className={styles.rank}>#</span>
                <span className={styles.name}>Player</span>
                <span className={styles.score}>Score</span>
                <span className={styles.time}>Time</span>
                <span className={styles.date}>Date</span>
              </div>
              {rankings.map((entry, index) => (
                <div
                  key={entry.id}
                  className={`${styles.row} ${index < 3 ? styles.topThree : ''}`}
                >
                  <span className={styles.rank}>
                    {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : index + 1}
                  </span>
                  <span className={styles.name}>{entry.playerName}</span>
                  <span className={styles.score}>{entry.score.toLocaleString()}</span>
                  <span className={styles.time}>{formatTime(entry.time)}</span>
                  <span className={styles.date}>
                    {new Date(entry.date).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {rankings.length > 0 && (
          <div className={styles.footer}>
            <button
              className={styles.clearButton}
              onClick={handleClearRankings}
            >
              Clear Rankings
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
