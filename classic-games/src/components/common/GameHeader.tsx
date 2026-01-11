import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import HelpModal from './HelpModal'
import RankingModal from './RankingModal'
import styles from './GameHeader.module.css'

interface GameHeaderProps {
  title: string
  gameId: string
  moves?: number
  time?: string
  score?: number
  onNewGame?: () => void
  onUndo?: () => void
  canUndo?: boolean
}

export default function GameHeader({
  title,
  gameId,
  moves,
  time,
  score,
  onNewGame,
  onUndo,
  canUndo = false,
}: GameHeaderProps) {
  const navigate = useNavigate()
  const [showHelp, setShowHelp] = useState(false)
  const [showRanking, setShowRanking] = useState(false)

  return (
    <>
      <header className={styles.header}>
        <div className={styles.left}>
          <button
            className={styles.backButton}
            onClick={() => navigate('/')}
            aria-label="Back to game selection"
          >
            ←
          </button>
          <h1 className={styles.title}>{title}</h1>
          <button
            className={styles.helpButton}
            onClick={() => setShowHelp(true)}
            aria-label="How to play"
          >
            ?
          </button>
        </div>

        <div className={styles.stats} role="status" aria-live="polite">
          {moves !== undefined && (
            <div className={styles.stat}>
              <span className={styles.label}>Moves</span>
              <span className={styles.value} aria-label={`${moves} moves`}>{moves}</span>
            </div>
          )}
          {time && (
            <div className={styles.stat}>
              <span className={styles.label}>Time</span>
              <span className={styles.value} aria-label={`Time: ${time}`}>{time}</span>
            </div>
          )}
          {score !== undefined && (
            <div className={styles.stat}>
              <span className={styles.label}>Score</span>
              <span className={styles.value} aria-label={`Score: ${score}`}>{score}</span>
            </div>
          )}
        </div>

        <div className={styles.actions}>
          <button
            className={styles.actionButton}
            onClick={() => setShowRanking(true)}
            aria-label="View rankings"
          >
            🏆
          </button>
          {onUndo && (
            <button
              className={styles.actionButton}
              onClick={onUndo}
              disabled={!canUndo}
            >
              Undo
            </button>
          )}
          {onNewGame && (
            <button className={styles.newGameButton} onClick={onNewGame}>
              New Game
            </button>
          )}
        </div>
      </header>

      <HelpModal
        gameId={gameId}
        isOpen={showHelp}
        onClose={() => setShowHelp(false)}
      />

      <RankingModal
        gameId={gameId}
        gameTitle={title}
        isOpen={showRanking}
        onClose={() => setShowRanking(false)}
      />
    </>
  )
}
