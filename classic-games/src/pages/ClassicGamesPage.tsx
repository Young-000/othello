import { Link } from 'react-router-dom';
import styles from './ClassicGamesPage.module.css';

interface GameInfo {
  id: string;
  name: string;
  description: string;
  icon: string;
  path: string;
}

const PUZZLE_GAMES: GameInfo[] = [
  {
    id: '2048',
    name: '2048',
    description: '숫자 퍼즐',
    icon: '🔢',
    path: '/2048',
  },
  {
    id: 'sudoku',
    name: '스도쿠',
    description: '숫자 배치',
    icon: '9️⃣',
    path: '/sudoku',
  },
  {
    id: 'minesweeper',
    name: '지뢰찾기',
    description: '지뢰를 피해라',
    icon: '💣',
    path: '/minesweeper',
  },
  {
    id: 'memory',
    name: '메모리',
    description: '짝 맞추기',
    icon: '🧠',
    path: '/memory',
  },
];

const CARD_GAMES: GameInfo[] = [
  {
    id: 'klondike',
    name: '클론다이크',
    description: '클래식 솔리테어',
    icon: '🃏',
    path: '/klondike',
  },
  {
    id: 'freecell',
    name: '프리셀',
    description: '전략 솔리테어',
    icon: '🎴',
    path: '/freecell',
  },
  {
    id: 'spider',
    name: '스파이더',
    description: '멀티덱 솔리테어',
    icon: '🕷️',
    path: '/spider',
  },
  {
    id: 'pyramid',
    name: '피라미드',
    description: '13 맞추기',
    icon: '🔺',
    path: '/pyramid',
  },
];

export default function ClassicGamesPage() {
  return (
    <div className={styles.container}>
      <div className={styles.backgroundPattern} />

      <header className={styles.header}>
        <Link to="/" className={styles.backButton}>
          ← 홈으로
        </Link>
        <div className={styles.titleArea}>
          <span className={styles.titleIcon}>🎮</span>
          <h1 className={styles.title}>클래식 게임</h1>
        </div>
        <p className={styles.subtitle}>전략과 논리의 시간</p>
      </header>

      <main className={styles.main}>
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionIcon}>🧩</span>
            <h2 className={styles.sectionTitle}>퍼즐 게임</h2>
          </div>
          <div className={styles.grid}>
            {PUZZLE_GAMES.map((game) => (
              <Link key={game.id} to={game.path} className={styles.gameCard}>
                <span className={styles.icon}>{game.icon}</span>
                <h3 className={styles.gameName}>{game.name}</h3>
                <p className={styles.gameDesc}>{game.description}</p>
              </Link>
            ))}
          </div>
        </section>

        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionIcon}>🃏</span>
            <h2 className={styles.sectionTitle}>카드 게임</h2>
          </div>
          <div className={styles.grid}>
            {CARD_GAMES.map((game) => (
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
  );
}
