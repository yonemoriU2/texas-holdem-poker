import type { GameState, Player, Card, HandRank } from '../types';

export const createMockCard = (suit: Card['suit'], rank: Card['rank'], id?: string): Card => ({
  suit,
  rank,
  id: id || `${rank}_${suit}`,
});

export const createMockPlayer = (overrides: Partial<Player> = {}): Player => ({
  id: 'player',
  name: 'プレイヤー',
  chips: 1000,
  holeCards: [],
  currentBet: 0,
  hasActed: false,
  hasFolded: false,
  isAllIn: false,
  ...overrides,
});

export const createMockHandRank = (overrides: Partial<HandRank> = {}): HandRank => ({
  rank: 1,
  name: 'ハイカード',
  cards: [],
  kickers: [],
  ...overrides,
});

export const createMockGameState = (overrides: Partial<GameState> = {}): GameState => ({
  players: [
    createMockPlayer({ id: 'player', name: 'プレイヤー' }),
    createMockPlayer({ id: 'cpu', name: 'CPU' }),
  ],
  communityCards: [],
  pot: 30,
  currentBet: 20,
  gamePhase: 'preflop',
  activePlayerIndex: 0,
  deck: [],
  winner: null,
  winningHand: null,
  isGameActive: true,
  isGameOver: false,
  handNumber: 1,
  smallBlind: 10,
  bigBlind: 20,
  bbAnte: 0,
  blindLevel: 1,
  handsUntilBlindIncrease: 10,
  ...overrides,
});

export const mockCards = {
  aceHearts: createMockCard('hearts', 'A', 'ace_hearts'),
  kingHearts: createMockCard('hearts', 'K', 'king_hearts'),
  queenHearts: createMockCard('hearts', 'Q', 'queen_hearts'),
  jackHearts: createMockCard('hearts', 'J', 'jack_hearts'),
  tenHearts: createMockCard('hearts', '10', 'ten_hearts'),
  aceSpades: createMockCard('spades', 'A', 'ace_spades'),
  kingSpades: createMockCard('spades', 'K', 'king_spades'),
  twoClubs: createMockCard('clubs', '2', 'two_clubs'),
  threeDiamonds: createMockCard('diamonds', '3', 'three_diamonds'),
};

export const mockHands = {
  royalFlush: createMockHandRank({
    rank: 10,
    name: 'ロイヤルフラッシュ',
    cards: [
      mockCards.aceHearts,
      mockCards.kingHearts,
      mockCards.queenHearts,
      mockCards.jackHearts,
      mockCards.tenHearts,
    ],
  }),
  pair: createMockHandRank({
    rank: 2,
    name: 'ワンペア',
    cards: [mockCards.aceHearts, mockCards.aceSpades],
    kickers: [mockCards.kingHearts, mockCards.queenHearts, mockCards.jackHearts],
  }),
  highCard: createMockHandRank({
    rank: 1,
    name: 'ハイカード',
    cards: [mockCards.aceHearts],
    kickers: [mockCards.kingHearts, mockCards.queenHearts, mockCards.jackHearts, mockCards.tenHearts],
  }),
};

export const createGameScenario = {
  preflop: () => createMockGameState({
    gamePhase: 'preflop',
    players: [
      createMockPlayer({
        id: 'player',
        name: 'プレイヤー',
        holeCards: [mockCards.aceHearts, mockCards.kingHearts],
        currentBet: 20,
      }),
      createMockPlayer({
        id: 'cpu',
        name: 'CPU',
        holeCards: [mockCards.twoClubs, mockCards.threeDiamonds],
        currentBet: 20,
      }),
    ],
    communityCards: [],
    pot: 40,
    currentBet: 20,
  }),

  flop: () => createMockGameState({
    gamePhase: 'flop',
    players: [
      createMockPlayer({
        id: 'player',
        name: 'プレイヤー',
        holeCards: [mockCards.aceHearts, mockCards.kingHearts],
        currentBet: 0,
        hasActed: false,
      }),
      createMockPlayer({
        id: 'cpu',
        name: 'CPU',
        holeCards: [mockCards.twoClubs, mockCards.threeDiamonds],
        currentBet: 0,
        hasActed: false,
      }),
    ],
    communityCards: [mockCards.queenHearts, mockCards.jackHearts, mockCards.tenHearts],
    pot: 40,
    currentBet: 0,
  }),

  showdown: () => createMockGameState({
    gamePhase: 'showdown',
    players: [
      createMockPlayer({
        id: 'player',
        name: 'プレイヤー',
        holeCards: [mockCards.aceHearts, mockCards.kingHearts],
        currentBet: 100,
        hasActed: true,
      }),
      createMockPlayer({
        id: 'cpu',
        name: 'CPU',
        holeCards: [mockCards.twoClubs, mockCards.threeDiamonds],
        currentBet: 100,
        hasActed: true,
      }),
    ],
    communityCards: [
      mockCards.queenHearts,
      mockCards.jackHearts,
      mockCards.tenHearts,
      mockCards.kingSpades,
      mockCards.aceSpades,
    ],
    pot: 240,
    currentBet: 100,
    winner: 'player',
    winningHand: mockHands.royalFlush,
  }),

  playerFolded: () => createMockGameState({
    gamePhase: 'showdown',
    players: [
      createMockPlayer({
        id: 'player',
        name: 'プレイヤー',
        holeCards: [mockCards.twoClubs, mockCards.threeDiamonds],
        hasFolded: true,
        hasActed: true,
      }),
      createMockPlayer({
        id: 'cpu',
        name: 'CPU',
        holeCards: [mockCards.aceHearts, mockCards.kingHearts],
        currentBet: 50,
        hasActed: true,
      }),
    ],
    communityCards: [mockCards.queenHearts, mockCards.jackHearts, mockCards.tenHearts],
    pot: 70,
    winner: 'cpu',
  }),

  gameOver: () => createMockGameState({
    gamePhase: 'ended',
    players: [
      createMockPlayer({
        id: 'player',
        name: 'プレイヤー',
        chips: 0,
      }),
      createMockPlayer({
        id: 'cpu',
        name: 'CPU',
        chips: 2000,
      }),
    ],
    isGameOver: true,
    winner: 'cpu',
  }),
};