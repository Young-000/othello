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
  'arrow-keys': {
    en: {
      title: 'Arrow Keys',
      objective: 'Press the correct arrow key as quickly as possible within 5 seconds.',
      rules: [
        'An arrow pointing in a direction will appear on screen',
        'Press the corresponding arrow key on your keyboard',
        'Get as many correct as possible within 5 seconds',
        'Wrong key presses count against your accuracy',
      ],
      tips: [
        'Keep your fingers positioned on all four arrow keys',
        'Focus on the center of the screen',
        'React quickly but accurately - wrong presses hurt your score',
        'Speed bonus rewards faster responses',
      ],
      scoring: 'Score = correct presses x speed bonus. Faster responses earn up to 2x multiplier.',
    },
    ko: {
      title: '방향 반응',
      objective: '5초 동안 올바른 방향키를 최대한 빠르게 누르세요.',
      rules: [
        '화면에 방향을 가리키는 화살표가 나타납니다',
        '해당하는 키보드 방향키를 누르세요',
        '5초 안에 최대한 많이 정답을 맞추세요',
        '잘못된 키 입력은 정확도에 영향을 줍니다',
      ],
      tips: [
        '네 개의 방향키에 손가락을 미리 위치시키세요',
        '화면 중앙에 집중하세요',
        '빠르지만 정확하게 - 틀리면 점수가 깎입니다',
        '빠른 반응에는 속도 보너스가 있습니다',
      ],
      scoring: '점수 = 정답 수 x 속도 보너스. 빠른 반응은 최대 2배 보너스.',
    },
  },
  'odd-even': {
    en: {
      title: 'Odd or Even',
      objective: 'Determine if the number is odd or even as quickly as possible.',
      rules: [
        'A number will appear on screen',
        'Click "Odd" or "Even" button based on the number',
        'Get as many correct as possible within 5 seconds',
        'Wrong answers count against your accuracy',
      ],
      tips: [
        'Remember: odd numbers end in 1, 3, 5, 7, 9',
        'Even numbers end in 0, 2, 4, 6, 8',
        'Focus on the last digit for quick recognition',
        'Stay calm and trust your instincts',
      ],
      scoring: 'Score = correct answers x speed bonus. Faster responses earn up to 2x multiplier.',
    },
    ko: {
      title: '홀짝 판단',
      objective: '숫자가 홀수인지 짝수인지 최대한 빠르게 판단하세요.',
      rules: [
        '화면에 숫자가 나타납니다',
        '숫자에 따라 "홀수" 또는 "짝수" 버튼을 클릭하세요',
        '5초 안에 최대한 많이 정답을 맞추세요',
        '오답은 정확도에 영향을 줍니다',
      ],
      tips: [
        '기억하세요: 홀수는 1, 3, 5, 7, 9로 끝납니다',
        '짝수는 0, 2, 4, 6, 8로 끝납니다',
        '빠른 인식을 위해 마지막 숫자에 집중하세요',
        '침착하게 직감을 믿으세요',
      ],
      scoring: '점수 = 정답 수 x 속도 보너스. 빠른 반응은 최대 2배 보너스.',
    },
  },
  'number-compare': {
    en: {
      title: 'Number Compare',
      objective: 'Click the larger number as quickly as possible.',
      rules: [
        'Two numbers will appear side by side',
        'Click the larger number',
        'Get as many correct as possible within 5 seconds',
        'Wrong choices count against your accuracy',
      ],
      tips: [
        'Compare the digits from left to right',
        'Trust your first instinct',
        'The numbers are always different by at least 3',
        'Speed matters, but accuracy is important too',
      ],
      scoring: 'Score = correct choices x speed bonus. Faster responses earn up to 2x multiplier.',
    },
    ko: {
      title: '크기 비교',
      objective: '더 큰 숫자를 최대한 빠르게 클릭하세요.',
      rules: [
        '두 숫자가 나란히 나타납니다',
        '더 큰 숫자를 클릭하세요',
        '5초 안에 최대한 많이 정답을 맞추세요',
        '오답은 정확도에 영향을 줍니다',
      ],
      tips: [
        '왼쪽에서 오른쪽으로 자릿수를 비교하세요',
        '첫 직감을 믿으세요',
        '숫자는 항상 최소 3 이상 차이납니다',
        '속도도 중요하지만 정확도도 중요합니다',
      ],
      scoring: '점수 = 정답 수 x 속도 보너스. 빠른 반응은 최대 2배 보너스.',
    },
  },
  'emoji-count': {
    en: {
      title: 'Emoji Count',
      objective: 'Count how many of a specific emoji appear in the grid.',
      rules: [
        'A grid of mixed emojis will appear',
        'A target emoji is shown with the question "How many?"',
        'Select the correct count from the options',
        'Get as many correct as possible within 5 seconds',
      ],
      tips: [
        'Scan the grid systematically (row by row or column by column)',
        'The target emoji count is between 2 and 6',
        'Focus only on the target emoji, ignore others',
        'Practice improves pattern recognition',
      ],
      scoring: 'Score = correct answers x speed bonus. This game has higher base points (150) due to difficulty.',
    },
    ko: {
      title: '이모지 카운트',
      objective: '격자에서 특정 이모지가 몇 개인지 세세요.',
      rules: [
        '여러 이모지가 섞인 격자가 나타납니다',
        '"몇 개?" 질문과 함께 찾아야 할 이모지가 표시됩니다',
        '보기 중에서 정확한 개수를 선택하세요',
        '5초 안에 최대한 많이 정답을 맞추세요',
      ],
      tips: [
        '격자를 체계적으로 스캔하세요 (행 또는 열 단위로)',
        '찾아야 할 이모지 개수는 2~6개입니다',
        '목표 이모지에만 집중하고 다른 것은 무시하세요',
        '연습하면 패턴 인식이 향상됩니다',
      ],
      scoring: '점수 = 정답 수 x 속도 보너스. 난이도가 높아 기본 점수(150점)가 높습니다.',
    },
  },
  'sequence-memory': {
    en: {
      title: 'Sequence Memory',
      objective: 'Remember and repeat the sequence of colored buttons.',
      rules: [
        'Watch as 4-6 colored buttons light up in sequence',
        'After the sequence is shown, repeat it in the correct order',
        'You have 5 seconds to input the sequence',
        'Complete the sequence to advance to the next level',
      ],
      tips: [
        'Focus on the pattern and try to group colors mentally',
        'Use a memorable phrase or pattern for each color',
        'Start with smaller sequences to build confidence',
        'Practice improves short-term memory significantly',
      ],
      scoring: 'Score = base points + time bonus + level bonus. Higher levels give more points.',
    },
    ko: {
      title: '순서 기억',
      objective: '색깔 버튼의 순서를 기억하고 반복하세요.',
      rules: [
        '4-6개의 색깔 버튼이 순서대로 켜지는 것을 지켜보세요',
        '순서가 보여진 후 올바른 순서로 반복하세요',
        '순서를 입력하는 데 5초가 주어집니다',
        '순서를 완료하면 다음 레벨로 진행합니다',
      ],
      tips: [
        '패턴에 집중하고 색깔을 머리 속으로 그룹화하세요',
        '각 색깔에 대해 기억하기 쉬운 문구나 패턴을 사용하세요',
        '작은 순서부터 시작해 자신감을 쌓으세요',
        '연습하면 단기 기억력이 크게 향상됩니다',
      ],
      scoring: '점수 = 기본 점수 + 시간 보너스 + 레벨 보너스. 높은 레벨은 더 많은 점수.',
    },
  },
  'quick-math': {
    en: {
      title: 'Quick Math',
      objective: 'Solve as many math problems as possible in 5 seconds.',
      rules: [
        'Simple math problems appear (addition, subtraction, multiplication)',
        'Type the answer and press Enter to submit',
        'Correct answers give points, wrong answers give penalties',
        'Get as many correct as possible within 5 seconds',
      ],
      tips: [
        'Focus on accuracy over speed at first',
        'Keep your hands ready on the number keys',
        'Mental math practice helps improve speed',
        'Small multiplication tables (2-10) are key',
      ],
      scoring: 'Score = (correct x 100) + time bonus - (wrong x 30). Accuracy matters!',
    },
    ko: {
      title: '빠른 암산',
      objective: '5초 동안 최대한 많은 수학 문제를 풀어보세요.',
      rules: [
        '간단한 수학 문제가 나타납니다 (덧셈, 뺄셈, 곱셈)',
        '답을 입력하고 Enter를 눌러 제출하세요',
        '정답은 점수를, 오답은 감점을 받습니다',
        '5초 안에 최대한 많이 정답을 맞추세요',
      ],
      tips: [
        '처음에는 속도보다 정확도에 집중하세요',
        '숫자 키 위에 손을 준비해 두세요',
        '암산 연습이 속도 향상에 도움됩니다',
        '작은 곱셈표(2-10)가 핵심입니다',
      ],
      scoring: '점수 = (정답 x 100) + 시간 보너스 - (오답 x 30). 정확도가 중요합니다!',
    },
  },
  'speed-typing': {
    en: {
      title: 'Speed Typing',
      objective: 'Type as many words as possible in 5 seconds.',
      rules: [
        'A word appears on screen (Korean or English)',
        'Type the word exactly as shown',
        'The next word appears automatically when correct',
        'Get as many words as possible within 5 seconds',
      ],
      tips: [
        'Look at the word, not your keyboard',
        'Practice touch typing for faster input',
        'Stay calm - rushing leads to typos',
        'Focus on completing words fully before moving on',
      ],
      scoring: 'Score = (words x 100) + (characters x 5) + speed bonus.',
    },
    ko: {
      title: '타이핑 챌린지',
      objective: '5초 동안 최대한 많은 단어를 입력하세요.',
      rules: [
        '화면에 단어가 나타납니다 (한국어 또는 영어)',
        '보이는 대로 정확히 입력하세요',
        '정확하면 자동으로 다음 단어가 나타납니다',
        '5초 안에 최대한 많은 단어를 완료하세요',
      ],
      tips: [
        '키보드가 아닌 단어를 보세요',
        '더 빠른 입력을 위해 터치 타이핑을 연습하세요',
        '침착하세요 - 서두르면 오타가 납니다',
        '다음으로 넘어가기 전에 단어를 완전히 완료하는 데 집중하세요',
      ],
      scoring: '점수 = (단어 x 100) + (글자 x 5) + 속도 보너스.',
    },
  },
  'color-match': {
    en: {
      title: 'Color Match',
      objective: 'Identify if the text color matches the word meaning (Stroop effect).',
      rules: [
        'A color name appears written in a specific color',
        'Decide if the text COLOR matches the WORD meaning',
        'Press O (match) or X (no match)',
        'Get as many correct as possible within 5 seconds',
      ],
      tips: [
        'Focus on the color you SEE, not the word you read',
        'Use keyboard shortcuts (arrow keys or A/D) for speed',
        'Build a streak for bonus points',
        'This is the famous Stroop effect - it is tricky by design!',
      ],
      scoring: 'Score = (correct x 100) + (best streak x 50) - (wrong x 30).',
    },
    ko: {
      title: '색상 판별',
      objective: '글자색이 단어의 의미와 일치하는지 판별하세요 (스트룹 효과).',
      rules: [
        '특정 색으로 쓰인 색깔 이름이 나타납니다',
        '글자의 색상이 단어의 의미와 일치하는지 판단하세요',
        'O (일치) 또는 X (불일치)를 누르세요',
        '5초 안에 최대한 많이 정답을 맞추세요',
      ],
      tips: [
        '읽는 단어가 아닌 보이는 색에 집중하세요',
        '속도를 위해 키보드 단축키 (방향키 또는 A/D)를 사용하세요',
        '연속 정답으로 보너스 점수를 얻으세요',
        '이것은 유명한 스트룹 효과입니다 - 원래 어렵게 설계되었습니다!',
      ],
      scoring: '점수 = (정답 x 100) + (최고 연속 x 50) - (오답 x 30).',
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
