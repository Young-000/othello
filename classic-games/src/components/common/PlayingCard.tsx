import { Card as CardType } from '../../domain/card'
import styles from './PlayingCard.module.css'

interface PlayingCardProps {
  card: CardType
  onClick?: () => void
  selected?: boolean
  draggable?: boolean
  style?: React.CSSProperties
}

const SUIT_SYMBOLS: Record<string, string> = {
  hearts: '♥',
  diamonds: '♦',
  clubs: '♣',
  spades: '♠',
}

const SUIT_NAMES: Record<string, string> = {
  hearts: 'Hearts',
  diamonds: 'Diamonds',
  clubs: 'Clubs',
  spades: 'Spades',
}

const RANK_NAMES: Record<string, string> = {
  A: 'Ace',
  K: 'King',
  Q: 'Queen',
  J: 'Jack',
}

export default function PlayingCard({
  card,
  onClick,
  selected = false,
  draggable = false,
  style,
}: PlayingCardProps) {
  const getCardLabel = () => {
    const rankName = RANK_NAMES[card.rank] || card.rank
    const suitName = SUIT_NAMES[card.suit]
    return `${rankName} of ${suitName}`
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.key === 'Enter' || e.key === ' ') && onClick) {
      e.preventDefault()
      onClick()
    }
  }

  if (!card.faceUp) {
    return (
      <div
        className={`${styles.card} ${styles.faceDown}`}
        onClick={onClick}
        onKeyDown={handleKeyDown}
        style={style}
        role="button"
        aria-label="Face down card"
        tabIndex={onClick ? 0 : undefined}
      >
        <div className={styles.backPattern} />
      </div>
    )
  }

  const isRed = card.suit === 'hearts' || card.suit === 'diamonds'
  const symbol = SUIT_SYMBOLS[card.suit]

  return (
    <div
      className={`${styles.card} ${styles.faceUp} ${isRed ? styles.red : styles.black} ${selected ? styles.selected : ''}`}
      onClick={onClick}
      onKeyDown={handleKeyDown}
      draggable={draggable}
      style={style}
      role="button"
      aria-label={getCardLabel()}
      aria-pressed={selected}
      tabIndex={onClick ? 0 : undefined}
    >
      <div className={styles.corner}>
        <span className={styles.rank}>{card.rank}</span>
        <span className={styles.suit}>{symbol}</span>
      </div>
      <div className={styles.center}>{symbol}</div>
      <div className={`${styles.corner} ${styles.bottomRight}`}>
        <span className={styles.rank}>{card.rank}</span>
        <span className={styles.suit}>{symbol}</span>
      </div>
    </div>
  )
}
