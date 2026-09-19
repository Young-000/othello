import { Link } from 'react-router-dom';
import { BannerAd } from '../components/ads';
import styles from './MiniGamesPage.module.css';

interface MiniGameInfo {
  id: string;
  name: string;
  description: string;
  icon: string;
  path: string;
  color: string;
}

const MINI_GAMES: MiniGameInfo[] = [
  {
    id: 'button-masher',
    name: '버튼 연타',
    description: '5초 동안 최대한 많이 클릭!',
    icon: '👆',
    path: '/button-masher',
    color: '#FF6B35',
  },
  {
    id: 'timer-challenge',
    name: '5초 맞추기',
    description: '정확히 5초에 멈춰라!',
    icon: '⏱️',
    path: '/timer-challenge',
    color: '#FFD93D',
  },
  {
    id: 'reaction-test',
    name: '반응속도',
    description: '초록색이 되면 클릭!',
    icon: '⚡',
    path: '/reaction-test',
    color: '#00C471',
  },
  {
    id: 'sequence-memory',
    name: '순서 기억',
    description: '색깔 순서를 기억하세요!',
    icon: '🧩',
    path: '/sequence-memory',
    color: '#9C27B0',
  },
  {
    id: 'quick-math',
    name: '빠른 암산',
    description: '5초 동안 수학 문제 풀기!',
    icon: '🔢',
    path: '/quick-math',
    color: '#2196F3',
  },
  {
    id: 'speed-typing',
    name: '타이핑 챌린지',
    description: '최대한 빠르게 타이핑!',
    icon: '⌨️',
    path: '/speed-typing',
    color: '#00BCD4',
  },
  {
    id: 'color-match',
    name: '색상 판별',
    description: '글자색이 의미와 맞는지?',
    icon: '🎨',
    path: '/color-match',
    color: '#E91E63',
  },
  {
    id: 'arrow-keys',
    name: '방향 반응',
    description: '화살표 방향키를 빠르게!',
    icon: '⬆️',
    path: '/arrow-keys',
    color: '#673AB7',
  },
  {
    id: 'odd-even',
    name: '홀짝 판단',
    description: '숫자가 홀수? 짝수?',
    icon: '🔣',
    path: '/odd-even',
    color: '#00ACC1',
  },
  {
    id: 'number-compare',
    name: '크기 비교',
    description: '더 큰 숫자를 클릭!',
    icon: '⚖️',
    path: '/number-compare',
    color: '#FF9800',
  },
  {
    id: 'emoji-count',
    name: '이모지 카운트',
    description: '이모지가 몇 개?',
    icon: '🔍',
    path: '/emoji-count',
    color: '#8BC34A',
  },
];

const COMING_SOON: { name: string; icon: string }[] = [
  { name: '단어 찾기', icon: '📝' },
  { name: '패턴 맞추기', icon: '🔷' },
  { name: '소리 기억', icon: '🔊' },
];

export default function MiniGamesPage() {
  return (
    <div className={styles.container}>
      <div className={styles.backgroundPulse} />

      <header className={styles.header}>
        <Link to="/" className={styles.backButton}>
          ← 홈으로
        </Link>
        <div className={styles.titleArea}>
          <span className={styles.titleIcon}>⚡</span>
          <h1 className={styles.title}>5초 미니게임</h1>
        </div>
        <p className={styles.subtitle}>짧은 시간, 최고의 집중!</p>
      </header>

      <main className={styles.main}>
        <div className={styles.grid}>
          {MINI_GAMES.map((game) => (
            <Link
              key={game.id}
              to={game.path}
              className={styles.gameCard}
              style={{ '--accent-color': game.color } as React.CSSProperties}
            >
              <div className={styles.cardGlow} />
              <span className={styles.icon}>{game.icon}</span>
              <h3 className={styles.gameName}>{game.name}</h3>
              <p className={styles.gameDesc}>{game.description}</p>
              <span className={styles.playBadge}>PLAY</span>
            </Link>
          ))}
        </div>

        {/* 게임 목록 하단 광고 */}
        <BannerAd testMode={true} />

        <section className={styles.comingSoonSection}>
          <h2 className={styles.sectionTitle}>🚀 Coming Soon</h2>
          <div className={styles.comingSoonGrid}>
            {COMING_SOON.map((game) => (
              <div key={game.name} className={styles.comingSoonCard}>
                <span className={styles.comingSoonIcon}>{game.icon}</span>
                <span className={styles.comingSoonName}>{game.name}</span>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
