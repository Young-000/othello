import styles from './CardPlaceholder.module.css'

interface CardPlaceholderProps {
  onClick?: () => void
  type?: 'empty' | 'foundation' | 'stock'
}

export default function CardPlaceholder({ onClick, type = 'empty' }: CardPlaceholderProps) {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.key === 'Enter' || e.key === ' ') && onClick) {
      e.preventDefault()
      onClick()
    }
  }

  const ariaLabel = type === 'foundation' ? 'Empty foundation pile' :
                    type === 'stock' ? 'Draw from stock' :
                    'Empty card slot'

  return (
    <div
      className={`${styles.placeholder} ${styles[type]}`}
      onClick={onClick}
      onKeyDown={handleKeyDown}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      aria-label={ariaLabel}
    >
      {type === 'foundation' && <span className={styles.icon}>A</span>}
      {type === 'stock' && <span className={styles.refreshIcon}>↻</span>}
    </div>
  )
}
