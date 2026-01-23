import { memo, ReactNode } from 'react';
import { Routes, Route } from 'react-router-dom';
import ErrorBoundary from './components/common/ErrorBoundary';
import { AchievementProvider } from './contexts/AchievementContext';
import HomePage from './pages/HomePage';
import MiniGamesPage from './pages/MiniGamesPage';
import ClassicGamesPage from './pages/ClassicGamesPage';
import KlondikePage from './pages/KlondikePage';
import FreecellPage from './pages/FreecellPage';
import SpiderPage from './pages/SpiderPage';
import PyramidPage from './pages/PyramidPage';
import Game2048Page from './pages/Game2048Page';
import SudokuPage from './pages/SudokuPage';
import MinesweeperPage from './pages/MinesweeperPage';
import MemoryPage from './pages/MemoryPage';
import OlympicsPage from './pages/OlympicsPage';
import ButtonMasherPage from './pages/ButtonMasherPage';
import TimerChallengePage from './pages/TimerChallengePage';
import ReactionTestPage from './pages/ReactionTestPage';
import SequenceMemoryPage from './pages/SequenceMemoryPage';
import QuickMathPage from './pages/QuickMathPage';
import SpeedTypingPage from './pages/SpeedTypingPage';
import ColorMatchPage from './pages/ColorMatchPage';
import ArrowKeysPage from './pages/ArrowKeysPage';
import OddEvenPage from './pages/OddEvenPage';
import NumberComparePage from './pages/NumberComparePage';
import EmojiCountPage from './pages/EmojiCountPage';

const GameWrapper = memo(function GameWrapper({ children }: { children: ReactNode }) {
  return <ErrorBoundary>{children}</ErrorBoundary>;
});

export default function App() {
  return (
    <AchievementProvider>
      <Routes>
        {/* Main Pages */}
        <Route path="/" element={<HomePage />} />
        <Route path="/mini-games" element={<MiniGamesPage />} />
        <Route path="/classic-games" element={<ClassicGamesPage />} />
        <Route path="/olympics" element={<OlympicsPage />} />

        {/* Mini Games */}
        <Route path="/button-masher" element={<GameWrapper><ButtonMasherPage /></GameWrapper>} />
        <Route path="/timer-challenge" element={<GameWrapper><TimerChallengePage /></GameWrapper>} />
        <Route path="/reaction-test" element={<GameWrapper><ReactionTestPage /></GameWrapper>} />
        <Route path="/sequence-memory" element={<GameWrapper><SequenceMemoryPage /></GameWrapper>} />
        <Route path="/quick-math" element={<GameWrapper><QuickMathPage /></GameWrapper>} />
        <Route path="/speed-typing" element={<GameWrapper><SpeedTypingPage /></GameWrapper>} />
        <Route path="/color-match" element={<GameWrapper><ColorMatchPage /></GameWrapper>} />
        <Route path="/arrow-keys" element={<GameWrapper><ArrowKeysPage /></GameWrapper>} />
        <Route path="/odd-even" element={<GameWrapper><OddEvenPage /></GameWrapper>} />
        <Route path="/number-compare" element={<GameWrapper><NumberComparePage /></GameWrapper>} />
        <Route path="/emoji-count" element={<GameWrapper><EmojiCountPage /></GameWrapper>} />

        {/* Puzzle Games */}
        <Route path="/2048" element={<GameWrapper><Game2048Page /></GameWrapper>} />
        <Route path="/sudoku" element={<GameWrapper><SudokuPage /></GameWrapper>} />
        <Route path="/minesweeper" element={<GameWrapper><MinesweeperPage /></GameWrapper>} />
        <Route path="/memory" element={<GameWrapper><MemoryPage /></GameWrapper>} />

        {/* Card Games */}
        <Route path="/klondike" element={<GameWrapper><KlondikePage /></GameWrapper>} />
        <Route path="/freecell" element={<GameWrapper><FreecellPage /></GameWrapper>} />
        <Route path="/spider" element={<GameWrapper><SpiderPage /></GameWrapper>} />
        <Route path="/pyramid" element={<GameWrapper><PyramidPage /></GameWrapper>} />
      </Routes>
    </AchievementProvider>
  );
}
