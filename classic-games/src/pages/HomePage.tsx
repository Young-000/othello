import { Link } from 'react-router-dom'
import styles from './HomePage.module.css'

interface GameInfo {
  id: string
  name: string
  description: string
  icon: string
  path: string
  category: 'card' | 'puzzle' | 'mini'
}

const GAMES: GameInfo[] = [
  // Mini Games (Quick Play)
  {
    id: 'button-masher',
    name: '버튼 연타',
    description: '10초 동안 최대한 많이 클릭!',
    icon: '👆',
    path: '/button-masher',
    category: 'mini',
  },
  {
    id: 'timer-challenge',
    name: '5초 맞추기',
    description: '정확히 5초에 멈춰라!',
    icon: '⏱️',
    path: '/timer-challenge',
    category: 'mini',
  },
  {
    id: 'reaction-test',
    name: '반응속도',
    description: '초록색이 되면 클릭!',
    icon: '⚡',
    path: '/reaction-test',
    category: 'mini',
  },
  // Card Games
  {
    id: 'klondike',
    name: '클론다이크',
    description: '클래식 솔리테어',
    icon: '🃏',
    path: '/klondike',
    category: 'card',
  },
  {
    id: 'freecell',
    name: '프리셀',
    description: '전략 솔리테어',
    icon: '🎴',
    path: '/freecell',
    category: 'card',
  },
  {
    id: 'spider',
    name: '스파이더',
    description: '멀티덱 솔리테어',
    icon: '🕷️',
    path: '/spider',
    category: 'card',
  },
  {
    id: 'pyramid',
    name: '피라미드',
    description: '13 맞추기',
    icon: '🔺',
    path: '/pyramid',
    category: 'card',
  },
  {
    id: '2048',
    name: '2048',
    description: '숫자 퍼즐',
    icon: '🔢',
    path: '/2048',
    category: 'puzzle',
  },
  {
    id: 'sudoku',
    name: '스도쿠',
    description: '숫자 배치',
    icon: '9️⃣',
    path: '/sudoku',
    category: 'puzzle',
  },
  {
    id: 'minesweeper',
    name: '지뢰찾기',
    description: '지뢰를 피해라',
    icon: '💣',
    path: '/minesweeper',
    category: 'puzzle',
  },
  {
    id: 'memory',
    name: '메모리',
    description: '짝 맞추기',
    icon: '🧠',
    path: '/memory',
    category: 'puzzle',
  },
]

export default function HomePage() {
  const miniGames = GAMES.filter(g => g.category === 'mini')
  const cardGames = GAMES.filter(g => g.category === 'card')
  const puzzleGames = GAMES.filter(g => g.category === 'puzzle')

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>클래식 게임</h1>
        <p className={styles.subtitle}>게임을 선택하세요</p>
        <Link to="/olympics" className={styles.olympicsButton}>
          🏅 글로벌 랭킹
        </Link>
      </header>

      <main className={styles.main}>
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>🎮 미니 게임</h2>
          <div className={styles.grid}>
            {miniGames.map(game => (
              <Link key={game.id} to={game.path} className={`${styles.gameCard} ${styles.miniCard}`}>
                <span className={styles.icon}>{game.icon}</span>
                <h3 className={styles.gameName}>{game.name}</h3>
                <p className={styles.gameDesc}>{game.description}</p>
              </Link>
            ))}
          </div>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>퍼즐 게임</h2>
          <div className={styles.grid}>
            {puzzleGames.map(game => (
              <Link key={game.id} to={game.path} className={styles.gameCard}>
                <span className={styles.icon}>{game.icon}</span>
                <h3 className={styles.gameName}>{game.name}</h3>
                <p className={styles.gameDesc}>{game.description}</p>
              </Link>
            ))}
          </div>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>카드 게임</h2>
          <div className={styles.grid}>
            {cardGames.map(game => (
              <Link key={game.id} to={game.path} className={styles.gameCard}>
                <span className={styles.icon}>{game.icon}</span>
                <h3 className={styles.gameName}>{game.name}</h3>
                <p className={styles.gameDesc}>{game.description}</p>
              </Link>
            ))}
          </div>
        </section>
      </main>
    </div>
  )
}
