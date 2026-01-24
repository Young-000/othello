import { Link } from 'react-router-dom';
import DailyChallengeCard from '../components/common/DailyChallengeCard';
import styles from './HomePage.module.css';

export default function HomePage() {
  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>게임 허브</h1>
        <p className={styles.subtitle}>원하는 게임 종류를 선택하세요</p>
        <Link to="/olympics" className={styles.olympicsButton}>
          🏅 글로벌 랭킹
        </Link>
      </header>

      <main className={styles.main}>
        <DailyChallengeCard />

        <div className={styles.hubGrid}>
          <Link to="/mini-games" className={styles.hubCard}>
            <div className={styles.hubCardInner}>
              <div className={styles.hubIconWrapper}>
                <span className={styles.hubIcon}>⚡</span>
              </div>
              <h2 className={styles.hubTitle}>5초 미니게임</h2>
              <p className={styles.hubDesc}>짧고 강렬한 도전!</p>
              <div className={styles.hubMeta}>
                <span className={styles.gameCount}>11개 게임</span>
                <span className={styles.hubArrow}>→</span>
              </div>
            </div>
            <div className={styles.hubGlow} />
          </Link>

          <Link to="/classic-games" className={styles.hubCard}>
            <div className={styles.hubCardInner}>
              <div className={styles.hubIconWrapper}>
                <span className={styles.hubIcon}>🎮</span>
              </div>
              <h2 className={styles.hubTitle}>클래식 게임</h2>
              <p className={styles.hubDesc}>퍼즐과 카드 게임</p>
              <div className={styles.hubMeta}>
                <span className={styles.gameCount}>8개 게임</span>
                <span className={styles.hubArrow}>→</span>
              </div>
            </div>
            <div className={styles.hubGlow} />
          </Link>
        </div>
      </main>
    </div>
  );
}
