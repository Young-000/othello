import { useState } from 'react'
import GameHeader from '../components/common/GameHeader'
import { createSpiderGame, SpiderState, SpiderSuit, moveCards, dealFromStock, canMoveCards } from '../domain/game/spider/SpiderGame'
import { useGameTimer } from '../hooks/useGameTimer'
import PlayingCard from '../components/common/PlayingCard'
import CardPlaceholder from '../components/common/CardPlaceholder'
import WinModal from '../components/common/WinModal'
import styles from './SpiderPage.module.css'

interface Selection {
  columnIndex: number
  cardIndex: number
  cardCount: number
}

export default function SpiderPage() {
  const [state, setState] = useState<SpiderState>(() => createSpiderGame(1))
  const [currentSuits, setCurrentSuits] = useState<SpiderSuit>(1)
  const [selection, setSelection] = useState<Selection | null>(null)
  const { formattedTime, seconds, reset } = useGameTimer(!state.isWon)

  const handleNewGame = (suits: SpiderSuit = 1) => {
    setState(createSpiderGame(suits))
    setCurrentSuits(suits)
    setSelection(null)
    reset()
  }

  const getDifficultyName = (suits: SpiderSuit) => {
    switch (suits) {
      case 1: return 'easy'
      case 2: return 'medium'
      case 4: return 'hard'
    }
  }

  const handleCardClick = (colIndex: number, cardIndex: number) => {
    const column = state.tableau[colIndex]
    const card = column[cardIndex]

    // Cannot select face-down cards
    if (!card.faceUp) return

    // If no selection, try to select this card and cards below it
    if (!selection) {
      const cardsToMove = column.slice(cardIndex)
      if (canMoveCards(cardsToMove)) {
        setSelection({
          columnIndex: colIndex,
          cardIndex: cardIndex,
          cardCount: cardsToMove.length,
        })
      }
      return
    }

    // If clicking on same column, deselect
    if (selection.columnIndex === colIndex) {
      setSelection(null)
      return
    }

    // Try to move cards to this column
    const newState = moveCards(state, selection.columnIndex, colIndex, selection.cardCount)
    if (newState !== state) {
      setState(newState)
    }
    setSelection(null)
  }

  const handleEmptyColumnClick = (colIndex: number) => {
    if (!selection) return

    const newState = moveCards(state, selection.columnIndex, colIndex, selection.cardCount)
    if (newState !== state) {
      setState(newState)
    }
    setSelection(null)
  }

  const handleStockClick = () => {
    // Clear selection when dealing from stock
    setSelection(null)

    // Check if any column is empty
    const hasEmptyColumn = state.tableau.some(col => col.length === 0)
    if (hasEmptyColumn) {
      alert('Cannot deal from stock while there are empty columns')
      return
    }

    const newState = dealFromStock(state)
    if (newState !== state) {
      setState(newState)
    }
  }

  return (
    <div className={styles.container}>
      <GameHeader
        title="Spider"
        gameId="spider"
        moves={state.moves}
        time={formattedTime}
        onNewGame={() => handleNewGame(currentSuits)}
      />

      <div className={styles.game}>
        <div className={styles.info}>
          <span>Completed: {state.completedSuits}/8</span>
          <span className={styles.stockInfo} onClick={handleStockClick}>
            Stock: {state.stock.length} piles {state.stock.length > 0 && '(click to deal)'}
          </span>
        </div>

        <div className={styles.tableau}>
          {state.tableau.map((column, colIndex) => (
            <div key={colIndex} className={styles.column}>
              {column.length === 0 ? (
                <CardPlaceholder
                  type="empty"
                  onClick={() => handleEmptyColumnClick(colIndex)}
                />
              ) : (
                column.map((card, cardIndex) => {
                  const isSelected =
                    selection !== null &&
                    selection.columnIndex === colIndex &&
                    cardIndex >= selection.cardIndex

                  return (
                    <div
                      key={`${colIndex}-${cardIndex}`}
                      className={styles.stackedCard}
                      style={{ top: `${cardIndex * 20}px` }}
                    >
                      <PlayingCard
                        card={card}
                        selected={isSelected}
                        onClick={() => handleCardClick(colIndex, cardIndex)}
                      />
                    </div>
                  )
                })
              )}
            </div>
          ))}
        </div>

        <div className={styles.stockArea}>
          <div className={styles.stockPiles} onClick={handleStockClick}>
            {state.stock.length > 0 ? (
              state.stock.map((_, index) => (
                <div
                  key={index}
                  className={styles.stockPile}
                  style={{ left: `${index * 15}px` }}
                >
                  <PlayingCard card={{ suit: 'spades', rank: 'A', faceUp: false }} />
                </div>
              ))
            ) : (
              <CardPlaceholder type="empty" />
            )}
          </div>
        </div>

        <div className={styles.difficulty}>
          <button
            onClick={() => handleNewGame(1)}
            className={currentSuits === 1 ? styles.active : ''}
          >
            1 Suit
          </button>
          <button
            onClick={() => handleNewGame(2)}
            className={currentSuits === 2 ? styles.active : ''}
          >
            2 Suits
          </button>
          <button
            onClick={() => handleNewGame(4)}
            className={currentSuits === 4 ? styles.active : ''}
          >
            4 Suits
          </button>
        </div>
      </div>

      {state.isWon && (
        <WinModal
          gameId="spider"
          moves={state.moves}
          time={formattedTime}
          timeInSeconds={seconds}
          onPlayAgain={() => handleNewGame(currentSuits)}
          extra={{ difficulty: getDifficultyName(currentSuits), completedSuits: state.completedSuits }}
        />
      )}
    </div>
  )
}
