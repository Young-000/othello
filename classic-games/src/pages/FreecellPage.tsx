import { useState, useEffect, useCallback } from 'react'
import GameHeader from '../components/common/GameHeader'
import {
  createFreecellGame,
  FreecellState,
  moveTableauToTableau,
  moveTableauToFreecell,
  moveFreecellToTableau,
  moveToFoundation,
  autoMoveToFoundation,
} from '../domain/game/freecell/FreecellGame'
import { useGameTimer } from '../hooks/useGameTimer'
import PlayingCard from '../components/common/PlayingCard'
import CardPlaceholder from '../components/common/CardPlaceholder'
import WinModal from '../components/common/WinModal'
import styles from './FreecellPage.module.css'

type Selection =
  | { type: 'tableau'; colIndex: number; cardIndex: number }
  | { type: 'freecell'; index: number }
  | null

export default function FreecellPage() {
  const [state, setState] = useState<FreecellState>(() => createFreecellGame())
  const [selection, setSelection] = useState<Selection>(null)
  const { formattedTime, seconds, reset } = useGameTimer(!state.isWon)

  const handleNewGame = () => {
    setState(createFreecellGame())
    setSelection(null)
    reset()
  }

  // Auto-move to foundation when possible
  const tryAutoMove = useCallback((currentState: FreecellState) => {
    const newState = autoMoveToFoundation(currentState)
    if (newState) {
      setState(newState)
    }
  }, [])

  useEffect(() => {
    if (!state.isWon) {
      const timer = setTimeout(() => tryAutoMove(state), 300)
      return () => clearTimeout(timer)
    }
  }, [state, tryAutoMove])

  const handleTableauCardClick = (colIndex: number, cardIndex: number) => {
    // If nothing selected, select this card (and all cards below it)
    if (!selection) {
      setSelection({ type: 'tableau', colIndex, cardIndex })
      return
    }

    // If clicking the same selection, deselect
    if (
      selection.type === 'tableau' &&
      selection.colIndex === colIndex &&
      selection.cardIndex === cardIndex
    ) {
      setSelection(null)
      return
    }

    // Try to move the selected card(s) to this column
    if (selection.type === 'tableau') {
      const cardCount = state.tableau[selection.colIndex].length - selection.cardIndex
      const newState = moveTableauToTableau(state, selection.colIndex, colIndex, cardCount)
      if (newState !== state) {
        setState(newState)
        setSelection(null)
        return
      }
    } else if (selection.type === 'freecell') {
      const newState = moveFreecellToTableau(state, selection.index, colIndex)
      if (newState !== state) {
        setState(newState)
        setSelection(null)
        return
      }
    }

    // If move failed, select the clicked card instead
    setSelection({ type: 'tableau', colIndex, cardIndex })
  }

  const handleEmptyColumnClick = (colIndex: number) => {
    if (!selection) return

    if (selection.type === 'tableau') {
      const cardCount = state.tableau[selection.colIndex].length - selection.cardIndex
      const newState = moveTableauToTableau(state, selection.colIndex, colIndex, cardCount)
      if (newState !== state) {
        setState(newState)
        setSelection(null)
      }
    } else if (selection.type === 'freecell') {
      const newState = moveFreecellToTableau(state, selection.index, colIndex)
      if (newState !== state) {
        setState(newState)
        setSelection(null)
      }
    }
  }

  const handleFreecellClick = (cellIndex: number) => {
    const cellCard = state.freecells[cellIndex]

    // If nothing selected and cell has a card, select it
    if (!selection) {
      if (cellCard) {
        setSelection({ type: 'freecell', index: cellIndex })
      }
      return
    }

    // If clicking the same selection, deselect
    if (selection.type === 'freecell' && selection.index === cellIndex) {
      setSelection(null)
      return
    }

    // If cell is empty and we have a tableau card selected (only top card)
    if (!cellCard && selection.type === 'tableau') {
      const column = state.tableau[selection.colIndex]
      // Can only move top card to freecell
      if (selection.cardIndex === column.length - 1) {
        const newState = moveTableauToFreecell(state, selection.colIndex, cellIndex)
        if (newState !== state) {
          setState(newState)
          setSelection(null)
          return
        }
      }
    }

    // If cell has a card, select it instead
    if (cellCard) {
      setSelection({ type: 'freecell', index: cellIndex })
    }
  }

  const handleFoundationClick = (foundationIndex: number) => {
    if (!selection) return

    if (selection.type === 'tableau') {
      const column = state.tableau[selection.colIndex]
      // Can only move top card to foundation
      if (selection.cardIndex === column.length - 1) {
        const newState = moveToFoundation(state, { type: 'tableau', index: selection.colIndex }, foundationIndex)
        if (newState !== state) {
          setState(newState)
          setSelection(null)
        }
      }
    } else if (selection.type === 'freecell') {
      const newState = moveToFoundation(state, { type: 'freecell', index: selection.index }, foundationIndex)
      if (newState !== state) {
        setState(newState)
        setSelection(null)
      }
    }
  }

  const isCardSelected = (type: 'tableau' | 'freecell', colOrCellIndex: number, cardIndex?: number) => {
    if (!selection) return false
    if (selection.type !== type) return false

    if (type === 'tableau' && selection.type === 'tableau') {
      return selection.colIndex === colOrCellIndex && cardIndex !== undefined && cardIndex >= selection.cardIndex
    }
    if (type === 'freecell' && selection.type === 'freecell') {
      return selection.index === colOrCellIndex
    }
    return false
  }

  return (
    <div className={styles.container}>
      <GameHeader
        title="FreeCell"
        gameId="freecell"
        moves={state.moves}
        time={formattedTime}
        onNewGame={handleNewGame}
      />

      <div className={styles.game}>
        <div className={styles.topRow}>
          <div className={styles.freecells} data-testid="freecells">
            {state.freecells.map((card, i) => (
              <div key={i} className={styles.pile} onClick={() => handleFreecellClick(i)} data-testid={`freecell-${i}`}>
                {card ? (
                  <PlayingCard card={card} selected={isCardSelected('freecell', i)} />
                ) : (
                  <CardPlaceholder type="empty" />
                )}
              </div>
            ))}
          </div>
          <div className={styles.foundations} data-testid="foundations">
            {state.foundations.map((foundation, i) => (
              <div key={i} className={styles.pile} onClick={() => handleFoundationClick(i)} data-testid={`foundation-${i}`}>
                {foundation.length > 0 ? (
                  <PlayingCard card={foundation[foundation.length - 1]} />
                ) : (
                  <CardPlaceholder type="foundation" />
                )}
              </div>
            ))}
          </div>
        </div>

        <div className={styles.tableau} data-testid="tableau">
          {state.tableau.map((column, colIndex) => (
            <div key={colIndex} className={styles.column} data-testid={`column-${colIndex}`}>
              {column.length === 0 ? (
                <div onClick={() => handleEmptyColumnClick(colIndex)}>
                  <CardPlaceholder type="empty" />
                </div>
              ) : (
                column.map((card, cardIndex) => (
                  <div
                    key={`${card.suit}-${card.rank}`}
                    className={styles.stackedCard}
                    style={{ top: `${cardIndex * 22}px` }}
                    onClick={() => handleTableauCardClick(colIndex, cardIndex)}
                    data-testid={`card-${colIndex}-${cardIndex}`}
                  >
                    <PlayingCard
                      card={card}
                      selected={isCardSelected('tableau', colIndex, cardIndex)}
                    />
                  </div>
                ))
              )}
            </div>
          ))}
        </div>
      </div>

      {state.isWon && (
        <WinModal
          gameId="freecell"
          moves={state.moves}
          time={formattedTime}
          timeInSeconds={seconds}
          onPlayAgain={handleNewGame}
        />
      )}
    </div>
  )
}
