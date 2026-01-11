import GameHeader from '../components/common/GameHeader'
import PlayingCard from '../components/common/PlayingCard'
import CardPlaceholder from '../components/common/CardPlaceholder'
import WinModal from '../components/common/WinModal'
import { useKlondikeGame } from '../hooks/useKlondikeGame'
import { useGameTimer } from '../hooks/useGameTimer'
import styles from './KlondikePage.module.css'

export default function KlondikePage() {
  const {
    state,
    selection,
    canUndo,
    newGame,
    undo,
    handleDraw,
    handleWasteClick,
    handleTableauClick,
    handleFoundationClick,
  } = useKlondikeGame()

  const { formattedTime, seconds, reset } = useGameTimer(!state.isWon)

  const handleNewGame = () => {
    newGame()
    reset()
  }

  return (
    <div className={styles.container}>
      <GameHeader
        title="Klondike"
        gameId="klondike"
        moves={state.moves}
        time={formattedTime}
        onNewGame={handleNewGame}
        onUndo={undo}
        canUndo={canUndo}
      />

      <div className={styles.game}>
        {/* Top row: Stock, Waste, Foundations */}
        <div className={styles.topRow}>
          <div className={styles.stockWaste}>
            {/* Stock */}
            <div className={styles.pile} onClick={handleDraw}>
              {state.stock.length > 0 ? (
                <PlayingCard card={state.stock[state.stock.length - 1]} />
              ) : (
                <CardPlaceholder type="stock" />
              )}
            </div>

            {/* Waste */}
            <div className={styles.pile} onClick={handleWasteClick}>
              {state.waste.length > 0 ? (
                <PlayingCard
                  card={state.waste[state.waste.length - 1]}
                  selected={selection?.type === 'waste'}
                />
              ) : (
                <CardPlaceholder type="empty" />
              )}
            </div>
          </div>

          {/* Foundations */}
          <div className={styles.foundations}>
            {state.foundations.map((foundation, i) => (
              <div
                key={i}
                className={styles.pile}
                onClick={() => handleFoundationClick(i)}
              >
                {foundation.length > 0 ? (
                  <PlayingCard card={foundation[foundation.length - 1]} />
                ) : (
                  <CardPlaceholder type="foundation" />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Tableau */}
        <div className={styles.tableau}>
          {state.tableau.map((column, colIndex) => (
            <div key={colIndex} className={styles.column}>
              {column.length === 0 ? (
                <CardPlaceholder
                  type="empty"
                  onClick={() => handleTableauClick(colIndex, 0)}
                />
              ) : (
                column.map((card, cardIndex) => {
                  const isSelected =
                    selection?.type === 'tableau' &&
                    selection.columnIndex === colIndex &&
                    cardIndex >= column.length - selection.cardCount

                  return (
                    <div
                      key={`${card.suit}-${card.rank}-${cardIndex}`}
                      className={styles.stackedCard}
                      style={{ top: `${cardIndex * 25}px` }}
                    >
                      <PlayingCard
                        card={card}
                        selected={isSelected}
                        onClick={() => handleTableauClick(colIndex, cardIndex)}
                      />
                    </div>
                  )
                })
              )}
            </div>
          ))}
        </div>
      </div>

      {state.isWon && (
        <WinModal
          gameId="klondike"
          moves={state.moves}
          time={formattedTime}
          timeInSeconds={seconds}
          onPlayAgain={handleNewGame}
        />
      )}
    </div>
  )
}
