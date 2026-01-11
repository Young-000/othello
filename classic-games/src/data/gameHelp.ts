export interface GameHelp {
  title: string
  objective: string
  rules: string[]
  tips: string[]
  scoring?: string
}

export interface BilingualGameHelp {
  en: GameHelp
  ko: GameHelp
}

export type Language = 'en' | 'ko'

export const gameHelpData: Record<string, BilingualGameHelp> = {
  klondike: {
    en: {
      title: 'Klondike Solitaire',
      objective: 'Move all cards to the four foundation piles, sorted by suit from Ace to King.',
      rules: [
        'Build tableau columns in descending order with alternating colors (red/black)',
        'Only Kings can be placed on empty tableau columns',
        'Move cards from the stock pile to the waste pile by clicking the stock',
        'Foundation piles must be built up from Ace to King in the same suit',
        'You can move multiple face-up cards between tableau columns if they form a valid sequence',
        'Double-click a card to auto-move it to foundation if possible',
      ],
      tips: [
        'Always move Aces and Twos to foundations immediately',
        'Try to expose face-down cards as soon as possible',
        'Keep foundation piles relatively even',
        'Empty columns are valuable - save them for Kings',
      ],
      scoring: 'Score is based on moves and time. Fewer moves and faster completion = better score.',
    },
    ko: {
      title: '클론다이크 솔리테어',
      objective: '모든 카드를 4개의 기초 더미로 옮기세요. 각 더미는 같은 무늬로 A부터 K까지 정렬됩니다.',
      rules: [
        '타블로 열은 색상을 번갈아가며 (빨강/검정) 내림차순으로 쌓습니다',
        '빈 타블로 열에는 K만 놓을 수 있습니다',
        '스톡 더미를 클릭하여 카드를 웨이스트 더미로 이동합니다',
        '기초 더미는 같은 무늬로 A부터 K까지 오름차순으로 쌓아야 합니다',
        '유효한 시퀀스를 형성하는 여러 앞면 카드를 타블로 열 사이에서 이동할 수 있습니다',
        '카드를 더블클릭하면 가능한 경우 기초 더미로 자동 이동합니다',
      ],
      tips: [
        'A와 2는 항상 즉시 기초 더미로 이동하세요',
        '뒷면 카드를 최대한 빨리 뒤집으세요',
        '기초 더미를 비교적 균등하게 유지하세요',
        '빈 열은 귀중합니다 - K를 위해 남겨두세요',
      ],
      scoring: '점수는 이동 횟수와 시간에 기반합니다. 적은 이동과 빠른 완료 = 높은 점수.',
    },
  },
  freecell: {
    en: {
      title: 'FreeCell',
      objective: 'Move all cards to the four foundation piles, sorted by suit from Ace to King.',
      rules: [
        'All cards are face-up from the start',
        'Four free cells can each hold one card temporarily',
        'Build tableau columns in descending order with alternating colors',
        'Any card can be placed on empty tableau columns',
        'The number of cards you can move at once depends on empty free cells and columns',
        'Double-click a card to auto-move it to foundation or free cell',
      ],
      tips: [
        'Plan several moves ahead',
        'Keep free cells empty as long as possible',
        'Try to clear a column early for more flexibility',
        'Move Aces to foundations as soon as they appear',
      ],
      scoring: 'Score is based on moves and time.',
    },
    ko: {
      title: '프리셀',
      objective: '모든 카드를 4개의 기초 더미로 옮기세요. 각 더미는 같은 무늬로 A부터 K까지 정렬됩니다.',
      rules: [
        '시작부터 모든 카드가 앞면입니다',
        '4개의 프리셀은 각각 1장의 카드를 임시로 보관할 수 있습니다',
        '타블로 열은 색상을 번갈아가며 내림차순으로 쌓습니다',
        '빈 타블로 열에는 어떤 카드든 놓을 수 있습니다',
        '한 번에 이동할 수 있는 카드 수는 빈 프리셀과 빈 열의 수에 따라 달라집니다',
        '카드를 더블클릭하면 기초 더미 또는 프리셀로 자동 이동합니다',
      ],
      tips: [
        '여러 수 앞을 계획하세요',
        '프리셀은 가능한 한 비워두세요',
        '유연성을 위해 일찍 열을 비우세요',
        'A가 나타나면 즉시 기초 더미로 이동하세요',
      ],
      scoring: '점수는 이동 횟수와 시간에 기반합니다.',
    },
  },
  spider: {
    en: {
      title: 'Spider Solitaire',
      objective: 'Build eight complete suits (King to Ace) to remove them from the game.',
      rules: [
        'Build tableau columns in descending order (suit doesn\'t matter for placement)',
        'Only sequences of the same suit can be moved together',
        'Complete suits (K-Q-J-10-9-8-7-6-5-4-3-2-A of one suit) are automatically removed',
        'Deal new cards from the stock when stuck (all columns must have cards)',
        'Empty columns can hold any card or sequence',
        'Double-click a sequence to auto-complete if it forms a full suit',
      ],
      tips: [
        'Focus on building sequences of the same suit',
        'Try to empty columns for more flexibility',
        'Avoid dealing new cards until necessary',
        '1-suit mode is easiest, 4-suit is hardest',
      ],
      scoring: 'Score is based on completed suits, moves, and time.',
    },
    ko: {
      title: '스파이더 솔리테어',
      objective: '8개의 완전한 세트(K부터 A까지)를 만들어 게임에서 제거하세요.',
      rules: [
        '타블로 열은 내림차순으로 쌓습니다 (놓을 때 무늬는 상관없음)',
        '같은 무늬의 시퀀스만 함께 이동할 수 있습니다',
        '완성된 세트(한 무늬의 K-Q-J-10-9-8-7-6-5-4-3-2-A)는 자동으로 제거됩니다',
        '막혔을 때 스톡에서 새 카드를 나눠줍니다 (모든 열에 카드가 있어야 함)',
        '빈 열에는 어떤 카드나 시퀀스든 놓을 수 있습니다',
        '시퀀스를 더블클릭하면 완전한 세트가 되면 자동 완성됩니다',
      ],
      tips: [
        '같은 무늬의 시퀀스 만들기에 집중하세요',
        '유연성을 위해 열을 비우세요',
        '필요할 때까지 새 카드 나눠주기를 피하세요',
        '1무늬 모드가 가장 쉽고, 4무늬가 가장 어렵습니다',
      ],
      scoring: '점수는 완성된 세트, 이동 횟수, 시간에 기반합니다.',
    },
  },
  pyramid: {
    en: {
      title: 'Pyramid Solitaire',
      objective: 'Remove all cards from the pyramid by matching pairs that add up to 13.',
      rules: [
        'Match two cards that add up to 13 (A=1, J=11, Q=12, K=13)',
        'Kings can be removed alone (they equal 13)',
        'Only exposed cards (not covered by other cards) can be selected',
        'Draw cards from the stock to the waste pile',
        'Match pyramid cards with waste cards or other pyramid cards',
        'Double-click a King to remove it instantly',
      ],
      tips: [
        'Remove Kings immediately when exposed',
        'Plan ahead - removing certain cards exposes others',
        'Keep track of which cards remain in the stock',
        'Sometimes it\'s better to draw new cards than force a match',
      ],
      scoring: 'Score is based on cards removed and time.',
    },
    ko: {
      title: '피라미드 솔리테어',
      objective: '합이 13이 되는 카드 쌍을 찾아 피라미드의 모든 카드를 제거하세요.',
      rules: [
        '합이 13이 되는 두 카드를 매칭합니다 (A=1, J=11, Q=12, K=13)',
        'K는 혼자 제거할 수 있습니다 (13이므로)',
        '다른 카드에 가려지지 않은 노출된 카드만 선택할 수 있습니다',
        '스톡에서 웨이스트 더미로 카드를 뽑습니다',
        '피라미드 카드를 웨이스트 카드 또는 다른 피라미드 카드와 매칭합니다',
        'K를 더블클릭하면 즉시 제거됩니다',
      ],
      tips: [
        'K가 노출되면 즉시 제거하세요',
        '계획을 세우세요 - 특정 카드를 제거하면 다른 카드가 노출됩니다',
        '스톡에 남은 카드를 추적하세요',
        '매치를 강요하기보다 새 카드를 뽑는 것이 나을 때도 있습니다',
      ],
      scoring: '점수는 제거된 카드와 시간에 기반합니다.',
    },
  },
  '2048': {
    en: {
      title: '2048',
      objective: 'Combine tiles to create a tile with the number 2048.',
      rules: [
        'Use arrow keys or swipe to move all tiles in one direction',
        'Tiles with the same number merge into one when they touch',
        'After each move, a new tile (2 or 4) appears randomly',
        'The game ends when no more moves are possible',
        'You can continue playing after reaching 2048 to get higher scores',
      ],
      tips: [
        'Keep your highest tile in a corner',
        'Build up tiles along edges',
        'Don\'t chase tiles around the board',
        'Plan ahead - think about where new tiles will appear',
      ],
      scoring: 'Your score increases by the value of tiles you merge. Higher tiles = more points.',
    },
    ko: {
      title: '2048',
      objective: '타일을 합쳐서 2048 숫자 타일을 만드세요.',
      rules: [
        '방향키 또는 스와이프로 모든 타일을 한 방향으로 이동합니다',
        '같은 숫자의 타일이 만나면 하나로 합쳐집니다',
        '매 이동 후 새 타일(2 또는 4)이 무작위로 나타납니다',
        '더 이상 이동이 불가능하면 게임이 종료됩니다',
        '2048에 도달한 후에도 계속 플레이하여 더 높은 점수를 얻을 수 있습니다',
      ],
      tips: [
        '가장 높은 타일을 코너에 유지하세요',
        '가장자리를 따라 타일을 쌓으세요',
        '타일을 이리저리 쫓지 마세요',
        '새 타일이 어디에 나타날지 미리 생각하세요',
      ],
      scoring: '합친 타일의 값만큼 점수가 증가합니다. 높은 타일 = 높은 점수.',
    },
  },
  sudoku: {
    en: {
      title: 'Sudoku',
      objective: 'Fill the grid so every row, column, and 3x3 box contains numbers 1-9.',
      rules: [
        'Each row must contain the numbers 1-9 with no repeats',
        'Each column must contain the numbers 1-9 with no repeats',
        'Each 3x3 box must contain the numbers 1-9 with no repeats',
        'Gray numbers are fixed hints and cannot be changed',
        'Use notes to track possible numbers for each cell',
        'Double-click a cell to quickly enter a number if only one possibility remains',
      ],
      tips: [
        'Start with rows, columns, or boxes that have the most numbers filled in',
        'Use the process of elimination',
        'Look for "naked pairs" - two cells that can only have the same two numbers',
        'Take notes to track possibilities',
      ],
      scoring: 'Score is based on difficulty level and completion time.',
    },
    ko: {
      title: '스도쿠',
      objective: '모든 행, 열, 3x3 박스에 1-9 숫자가 들어가도록 격자를 채우세요.',
      rules: [
        '각 행에는 1-9 숫자가 중복 없이 들어가야 합니다',
        '각 열에는 1-9 숫자가 중복 없이 들어가야 합니다',
        '각 3x3 박스에는 1-9 숫자가 중복 없이 들어가야 합니다',
        '회색 숫자는 고정된 힌트이며 변경할 수 없습니다',
        '메모 기능으로 각 셀의 가능한 숫자를 추적하세요',
        '셀을 더블클릭하면 가능한 숫자가 하나만 남았을 때 빠르게 입력됩니다',
      ],
      tips: [
        '숫자가 가장 많이 채워진 행, 열, 박스부터 시작하세요',
        '소거법을 사용하세요',
        '"네이키드 페어"를 찾으세요 - 같은 두 숫자만 가질 수 있는 두 셀',
        '가능성을 추적하기 위해 메모하세요',
      ],
      scoring: '점수는 난이도와 완료 시간에 기반합니다.',
    },
  },
  minesweeper: {
    en: {
      title: 'Minesweeper',
      objective: 'Reveal all cells without clicking on any mines.',
      rules: [
        'Left-click to reveal a cell',
        'Right-click (or long press on mobile) to flag a suspected mine',
        'Numbers show how many mines are adjacent to that cell',
        'Blank cells have no adjacent mines and auto-reveal neighbors',
        'The first click is always safe',
        'Double-click a number to auto-reveal surrounding cells if enough flags are placed',
      ],
      tips: [
        'Start by clicking near the center',
        'Use flags to mark known mines',
        'Count carefully - if a number matches its flagged neighbors, other neighbors are safe',
        'Look for patterns - e.g., 1-2-1 pattern on an edge means mines at the 2\'s neighbors',
      ],
      scoring: 'Score is based on difficulty level and completion time.',
    },
    ko: {
      title: '지뢰찾기',
      objective: '지뢰를 클릭하지 않고 모든 셀을 공개하세요.',
      rules: [
        '왼쪽 클릭으로 셀을 공개합니다',
        '오른쪽 클릭(또는 모바일에서 길게 누르기)으로 지뢰 의심 셀에 깃발을 세웁니다',
        '숫자는 해당 셀에 인접한 지뢰의 수를 나타냅니다',
        '빈 셀은 인접 지뢰가 없으며 주변 셀을 자동으로 공개합니다',
        '첫 번째 클릭은 항상 안전합니다',
        '숫자를 더블클릭하면 충분한 깃발이 세워졌을 때 주변 셀을 자동 공개합니다',
      ],
      tips: [
        '중앙 근처를 클릭하여 시작하세요',
        '확실한 지뢰에는 깃발을 사용하세요',
        '신중하게 세세요 - 숫자가 깃발 이웃 수와 일치하면 나머지 이웃은 안전합니다',
        '패턴을 찾으세요 - 예: 가장자리의 1-2-1 패턴은 2의 이웃에 지뢰가 있음을 의미',
      ],
      scoring: '점수는 난이도와 완료 시간에 기반합니다.',
    },
  },
  memory: {
    en: {
      title: 'Memory Match',
      objective: 'Find all matching pairs of cards with the fewest moves.',
      rules: [
        'Click to flip a card and reveal its symbol',
        'Flip two cards per turn to try to find a match',
        'If the cards match, they stay face-up',
        'If they don\'t match, they flip back face-down',
        'The game ends when all pairs are found',
      ],
      tips: [
        'Pay close attention to card positions',
        'Try to remember cards you\'ve seen before',
        'Develop a pattern for scanning the board',
        'Focus on one area at a time to better remember positions',
      ],
      scoring: 'Score is based on the number of moves and time. Fewer moves = better score.',
    },
    ko: {
      title: '메모리 매치',
      objective: '가장 적은 이동으로 모든 짝을 찾으세요.',
      rules: [
        '클릭하여 카드를 뒤집고 기호를 확인합니다',
        '한 턴에 두 장의 카드를 뒤집어 짝을 찾습니다',
        '카드가 일치하면 앞면으로 유지됩니다',
        '일치하지 않으면 다시 뒷면으로 뒤집힙니다',
        '모든 짝을 찾으면 게임이 종료됩니다',
      ],
      tips: [
        '카드 위치에 주의를 기울이세요',
        '이전에 본 카드를 기억하세요',
        '보드를 스캔하는 패턴을 개발하세요',
        '한 영역에 집중하여 위치를 더 잘 기억하세요',
      ],
      scoring: '점수는 이동 횟수와 시간에 기반합니다. 적은 이동 = 높은 점수.',
    },
  },
}

export function getHelp(gameId: string, language: Language = 'en'): GameHelp {
  const helpData = gameHelpData[gameId]
  if (!helpData) {
    return {
      title: 'Game Help',
      objective: 'No help available for this game.',
      rules: [],
      tips: [],
    }
  }
  return helpData[language]
}
