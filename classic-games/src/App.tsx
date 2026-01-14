import { memo, ReactNode } from 'react'
import { Routes, Route } from 'react-router-dom'
import ErrorBoundary from './components/common/ErrorBoundary'
import HomePage from './pages/HomePage'
import KlondikePage from './pages/KlondikePage'
import FreecellPage from './pages/FreecellPage'
import SpiderPage from './pages/SpiderPage'
import PyramidPage from './pages/PyramidPage'
import Game2048Page from './pages/Game2048Page'
import SudokuPage from './pages/SudokuPage'
import MinesweeperPage from './pages/MinesweeperPage'
import MemoryPage from './pages/MemoryPage'
import OlympicsPage from './pages/OlympicsPage'
import ButtonMasherPage from './pages/ButtonMasherPage'
import TimerChallengePage from './pages/TimerChallengePage'
import ReactionTestPage from './pages/ReactionTestPage'

const GameWrapper = memo(function GameWrapper({ children }: { children: ReactNode }) {
  return <ErrorBoundary>{children}</ErrorBoundary>
})

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/olympics" element={<OlympicsPage />} />
      <Route path="/klondike" element={<GameWrapper><KlondikePage /></GameWrapper>} />
      <Route path="/freecell" element={<GameWrapper><FreecellPage /></GameWrapper>} />
      <Route path="/spider" element={<GameWrapper><SpiderPage /></GameWrapper>} />
      <Route path="/pyramid" element={<GameWrapper><PyramidPage /></GameWrapper>} />
      <Route path="/2048" element={<GameWrapper><Game2048Page /></GameWrapper>} />
      <Route path="/sudoku" element={<GameWrapper><SudokuPage /></GameWrapper>} />
      <Route path="/minesweeper" element={<GameWrapper><MinesweeperPage /></GameWrapper>} />
      <Route path="/memory" element={<GameWrapper><MemoryPage /></GameWrapper>} />
      <Route path="/button-masher" element={<GameWrapper><ButtonMasherPage /></GameWrapper>} />
      <Route path="/timer-challenge" element={<GameWrapper><TimerChallengePage /></GameWrapper>} />
      <Route path="/reaction-test" element={<GameWrapper><ReactionTestPage /></GameWrapper>} />
    </Routes>
  )
}
