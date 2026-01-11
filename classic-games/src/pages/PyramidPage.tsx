import { useState, useCallback, useMemo } from 'react'
import GameHeader from '../components/common/GameHeader'
import {
  createPyramidGame,
  PyramidState,
  drawFromStock,
  isCardExposed,
  removePyramidCard,
  removePyramidPair,
  removePyramidWithWaste,
  removeWasteKing,
  canRemovePair,
  canRemoveSingle,
  checkGameOver,
} from '../domain/game/pyramid/PyramidGame'
import { useGameTimer } from '../hooks/useGameTimer'
import PlayingCard from '../components/common/PlayingCard'
import CardPlaceholder from '../components/common/CardPlaceholder'
import WinModal from '../components/common/WinModal'
import styles from './PyramidPage.module.css'

interface Selection {
  type: 'pyramid' | 'waste'
  row?: number
  col?: number
}

export default function PyramidPage() {
  const [state, setState] = useState<PyramidState>(() => createPyramidGame())
  const [selection, setSelection] = useState<Selection | null>(null)
  const { formattedTime, seconds, reset } = useGameTimer(!state.isWon && !state.isGameOver)

  // Memoize exposed card positions to avoid duplicate isCardExposed calls
  const exposedCards = useMemo(() => {
    const exposed = new Set<string>()
    state.pyramid.forEach((row, ri) => {
      row.forEach((card, ci) => {
        if (card && isCardExposed(state, ri, ci)) {
          exposed.add(`${ri}-${ci}`)
        }
      })
    })
    return exposed
  }, [state])

  const isExposed = useCallback((row: number, col: number) => {
    return exposedCards.has(`${row}-${col}`)
  }, [exposedCards])

  const handleNewGame = useCallback(() => {
    setState(createPyramidGame())
    setSelection(null)
    reset()
  }, [reset])

  const handleDraw = useCallback(() => {
    setState(prev => {
      const next = drawFromStock(prev)
      return { ...next, isGameOver: checkGameOver(next) }
    })
    setSelection(null)
  }, [])

  const handlePyramidCardClick = useCallback((row: number, col: number) => {
    setState(prev => {
      const card = prev.pyramid[row][col]
      if (!card || !isCardExposed(prev, row, col)) return prev

      // If King, remove it directly
      if (canRemoveSingle(card)) {
        setSelection(null)
        const next = removePyramidCard(prev, row, col)
        return { ...next, isGameOver: checkGameOver(next) }
      }

      // If no selection, select this card
      if (!selection) {
        setSelection({ type: 'pyramid', row, col })
        return prev
      }

      // If same card clicked, deselect
      if (selection.type === 'pyramid' && selection.row === row && selection.col === col) {
        setSelection(null)
        return prev
      }

      // Try to match with selected card
      if (selection.type === 'pyramid') {
        const selRow = selection.row
        const selCol = selection.col
        if (selRow !== undefined && selCol !== undefined) {
          const selectedCard = prev.pyramid[selRow][selCol]
          if (selectedCard && canRemovePair(card, selectedCard)) {
            setSelection(null)
            const next = removePyramidPair(prev, selRow, selCol, row, col)
            return { ...next, isGameOver: checkGameOver(next) }
          }
        }
      } else if (selection.type === 'waste') {
        const wasteCard = prev.waste[prev.waste.length - 1]
        if (wasteCard && canRemovePair(card, wasteCard)) {
          setSelection(null)
          const next = removePyramidWithWaste(prev, row, col)
          return { ...next, isGameOver: checkGameOver(next) }
        }
      }

      // No match, select the new card
      setSelection({ type: 'pyramid', row, col })
      return prev
    })
  }, [selection])

  const handleWasteClick = useCallback(() => {
    setState(prev => {
      if (prev.waste.length === 0) return prev

      const wasteCard = prev.waste[prev.waste.length - 1]

      // If King, remove it directly
      if (canRemoveSingle(wasteCard)) {
        setSelection(null)
        const next = removeWasteKing(prev)
        return { ...next, isGameOver: checkGameOver(next) }
      }

      // If no selection, select waste
      if (!selection) {
        setSelection({ type: 'waste' })
        return prev
      }

      // If waste already selected, deselect
      if (selection.type === 'waste') {
        setSelection(null)
        return prev
      }

      // Try to match with selected pyramid card
      if (selection.type === 'pyramid') {
        const selRow = selection.row
        const selCol = selection.col
        if (selRow !== undefined && selCol !== undefined) {
          const selectedCard = prev.pyramid[selRow][selCol]
          if (selectedCard && canRemovePair(wasteCard, selectedCard)) {
            setSelection(null)
            const next = removePyramidWithWaste(prev, selRow, selCol)
            return { ...next, isGameOver: checkGameOver(next) }
          }
        }
      }

      // No match, select waste
      setSelection({ type: 'waste' })
      return prev
    })
  }, [selection])

  const isCardSelected = (type: 'pyramid' | 'waste', row?: number, col?: number) => {
    if (!selection) return false
    if (selection.type !== type) return false
    if (type === 'pyramid') {
      return selection.row === row && selection.col === col
    }
    return true
  }

  return (
    <div className={styles.container}>
      <GameHeader
        title="Pyramid"
        gameId="pyramid"
        moves={state.moves}
        time={formattedTime}
        onNewGame={handleNewGame}
      />

      <div className={styles.game}>
        <div className={styles.pyramid}>
          {state.pyramid.map((row, rowIndex) => (
            <div key={rowIndex} className={styles.row}>
              {row.map((card, colIndex) => (
                <div
                  key={`${rowIndex}-${colIndex}`}
                  className={styles.pyramidCard}
                >
                  {card ? (
                    <PlayingCard
                      card={card}
                      onClick={() => handlePyramidCardClick(rowIndex, colIndex)}
                      selected={isCardSelected('pyramid', rowIndex, colIndex)}
                      style={{
                        opacity: isExposed(rowIndex, colIndex) ? 1 : 0.7,
                        cursor: isExposed(rowIndex, colIndex) ? 'pointer' : 'default',
                      }}
                    />
                  ) : (
                    <div className={styles.empty} />
                  )}
                </div>
              ))}
            </div>
          ))}
        </div>

        <div className={styles.stockArea}>
          <div className={styles.pile} onClick={handleDraw}>
            {state.stock.length > 0 ? (
              <PlayingCard card={state.stock[state.stock.length - 1]} />
            ) : (
              <CardPlaceholder type="stock" />
            )}
          </div>
          <div className={styles.pile} onClick={handleWasteClick}>
            {state.waste.length > 0 ? (
              <PlayingCard
                card={state.waste[state.waste.length - 1]}
                selected={isCardSelected('waste')}
              />
            ) : (
              <CardPlaceholder type="empty" />
            )}
          </div>
        </div>

        <div className={styles.info}>
          <span>Removed: {state.removedCount}/28</span>
          <span>Stock: {state.stock.length}</span>
        </div>
      </div>

      {state.isWon && (
        <WinModal
          gameId="pyramid"
          moves={state.moves}
          time={formattedTime}
          timeInSeconds={seconds}
          onPlayAgain={handleNewGame}
          extra={{ removedCards: state.removedCount }}
        />
      )}

      {state.isGameOver && !state.isWon && (
        <div className={styles.overlay}>
          <div className={styles.modal}>
            <h2>Game Over</h2>
            <p>No more moves available.</p>
            <p>Removed: {state.removedCount}/28 cards</p>
            <button onClick={handleNewGame}>Try Again</button>
          </div>
        </div>
      )}
    </div>
  )
}
