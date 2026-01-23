// Quick Math - Solve as many math problems as possible in 5 seconds

export type Operator = '+' | '-' | 'x'

export interface MathProblem {
  num1: number
  num2: number
  operator: Operator
  answer: number
}

export interface QuickMathState {
  currentProblem: MathProblem | null
  correctCount: number
  wrongCount: number
  timeLeft: number
  isRunning: boolean
  isComplete: boolean
  startTime: number | null
  score: number
}

export const GAME_DURATION = 5 // seconds

export function createQuickMath(): QuickMathState {
  return {
    currentProblem: null,
    correctCount: 0,
    wrongCount: 0,
    timeLeft: GAME_DURATION,
    isRunning: false,
    isComplete: false,
    startTime: null,
    score: 0,
  }
}

export function generateProblem(): MathProblem {
  const operators: Operator[] = ['+', '-', 'x']
  const operator = operators[Math.floor(Math.random() * operators.length)]

  let num1: number
  let num2: number
  let answer: number

  switch (operator) {
    case '+':
      num1 = Math.floor(Math.random() * 20) + 1 // 1-20
      num2 = Math.floor(Math.random() * 20) + 1 // 1-20
      answer = num1 + num2
      break
    case '-':
      num1 = Math.floor(Math.random() * 20) + 10 // 10-29
      num2 = Math.floor(Math.random() * Math.min(num1, 15)) + 1 // ensure positive result
      answer = num1 - num2
      break
    case 'x':
      num1 = Math.floor(Math.random() * 9) + 2 // 2-10
      num2 = Math.floor(Math.random() * 9) + 2 // 2-10
      answer = num1 * num2
      break
    default:
      num1 = 1
      num2 = 1
      answer = 2
  }

  return { num1, num2, operator, answer }
}

export function startGame(state: QuickMathState): QuickMathState {
  if (state.isRunning || state.isComplete) return state

  return {
    ...state,
    isRunning: true,
    startTime: Date.now(),
    currentProblem: generateProblem(),
    correctCount: 0,
    wrongCount: 0,
    timeLeft: GAME_DURATION,
    score: 0,
  }
}

export function submitAnswer(state: QuickMathState, answer: number): QuickMathState {
  if (!state.isRunning || !state.currentProblem || state.isComplete) return state

  const isCorrect = answer === state.currentProblem.answer

  return {
    ...state,
    correctCount: isCorrect ? state.correctCount + 1 : state.correctCount,
    wrongCount: isCorrect ? state.wrongCount : state.wrongCount + 1,
    currentProblem: generateProblem(), // Generate next problem immediately
  }
}

export function updateTime(state: QuickMathState): QuickMathState {
  if (!state.isRunning || !state.startTime) return state

  const elapsed = (Date.now() - state.startTime) / 1000
  const timeLeft = Math.max(0, GAME_DURATION - elapsed)

  if (timeLeft === 0) {
    const timeBonus = Math.round(state.correctCount * 10)
    const baseScore = state.correctCount * 100
    const penaltyScore = state.wrongCount * 30

    return {
      ...state,
      timeLeft: 0,
      isRunning: false,
      isComplete: true,
      score: Math.max(0, baseScore + timeBonus - penaltyScore),
    }
  }

  return {
    ...state,
    timeLeft,
  }
}

export function resetGame(): QuickMathState {
  return createQuickMath()
}

export function calculateScore(state: QuickMathState): number {
  return state.score
}

export function formatProblem(problem: MathProblem): string {
  return `${problem.num1} ${problem.operator} ${problem.num2}`
}

export function getAccuracy(state: QuickMathState): number {
  const total = state.correctCount + state.wrongCount
  if (total === 0) return 0
  return Math.round((state.correctCount / total) * 100)
}
