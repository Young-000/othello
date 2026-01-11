import { useState, useEffect } from 'react'
import GameHeader from '../components/common/GameHeader'
import { createMemoryGame, flipCard, checkMatch, MemoryGameState } from '../domain/game/memory/MemoryGame'
import { useGameTimer } from '../hooks/useGameTimer'
import { useBestScore } from '../hooks/useBestScore'
import WinModal from '../components/common/WinModal'
import styles from './MemoryPage.module.css'

type Difficulty = 'easy' | 'medium' | 'hard'

const DIFFICULTY_CONFIG: Record<Difficulty, { pairs: number; label: string; cols: number }> = {
  easy: { pairs: 6, label: 'Easy (6 pairs)', cols: 4 },
  medium: { pairs: 8, label: 'Medium (8 pairs)', cols: 4 },
  hard: { pairs: 12, label: 'Hard (12 pairs)', cols: 6 },
}

export default function MemoryPage() {
  const [difficulty, setDifficulty] = useState<Difficulty>('medium')
  const [state, setState] = useState<MemoryGameState>(() => createMemoryGame(DIFFICULTY_CONFIG.medium.pairs))
  const { formattedTime, seconds, reset } = useGameTimer(!state.isComplete)
  const { bestScore, updateBestScore } = useBestScore(`memory-${difficulty}`)
  const [checking, setChecking] = useState(false)

  useEffect(() => {
    if (state.isComplete && state.moves > 0) {
      updateBestScore(state.moves, false) // lower is better for moves
    }
  }, [state.isComplete, state.moves, updateBestScore])

  // flippedIndices가 2개일 때 매칭 체크
  const flippedCount = state.flippedIndices.length
  useEffect(() => {
    // flippedCount가 2가 아니면 아무것도 하지 않음
    if (flippedCount !== 2) return

    // 매칭 체크 시작
    setChecking(true)
    const timer = setTimeout(() => {
      setState(prev => checkMatch(prev))
      setChecking(false)
    }, 800)

    return () => clearTimeout(timer)
  }, [flippedCount]) // checking을 의존성에서 제거

  const handleCardClick = (index: number) => {
    if (checking) return
    setState(prev => flipCard(prev, index))
  }

  const handleNewGame = (newDifficulty: Difficulty = difficulty) => {
    const config = DIFFICULTY_CONFIG[newDifficulty]
    setState(createMemoryGame(config.pairs))
    setDifficulty(newDifficulty)
    reset()
  }

  return (
    <div className={styles.container}>
      <GameHeader
        title="Memory"
        gameId="memory"
        moves={state.moves}
        time={formattedTime}
        onNewGame={handleNewGame}
      />

      <div className={styles.game}>
        <div className={styles.difficultySelector}>
          {(Object.keys(DIFFICULTY_CONFIG) as Difficulty[]).map((diff) => (
            <button
              key={diff}
              className={`${styles.difficultyBtn} ${difficulty === diff ? styles.active : ''}`}
              onClick={() => handleNewGame(diff)}
            >
              {DIFFICULTY_CONFIG[diff].label}
            </button>
          ))}
        </div>

        <div
          className={styles.grid}
          style={{ gridTemplateColumns: `repeat(${DIFFICULTY_CONFIG[difficulty].cols}, 80px)` }}
        >
          {state.cards.map((card, index) => (
            <button
              key={card.id}
              className={`${styles.card} ${card.isFlipped || card.isMatched ? styles.flipped : ''} ${card.isMatched ? styles.matched : ''}`}
              onClick={() => handleCardClick(index)}
              disabled={card.isFlipped || card.isMatched}
            >
              <div className={styles.cardInner}>
                <div className={styles.cardFront}>?</div>
                <div className={styles.cardBack}>{card.value}</div>
              </div>
            </button>
          ))}
        </div>

        <div className={styles.info}>
          <span>Matches: {state.matches} / {state.totalPairs}</span>
          {bestScore !== null && (
            <span className={styles.bestScore}>Best: {bestScore} moves</span>
          )}
        </div>
      </div>

      {state.isComplete && (
        <WinModal
          gameId="memory"
          moves={state.moves}
          time={formattedTime}
          timeInSeconds={seconds}
          onPlayAgain={handleNewGame}
        />
      )}
    </div>
  )
}
