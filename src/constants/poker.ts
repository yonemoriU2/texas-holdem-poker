import type { Suit, Rank } from '../types';

export const SUITS: Suit[] = ['hearts', 'diamonds', 'clubs', 'spades'];
export const RANKS: Rank[] = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];

export const HAND_RANKINGS = {
  HIGH_CARD: { rank: 1, name: 'ハイカード' },
  ONE_PAIR: { rank: 2, name: 'ワンペア' },
  TWO_PAIR: { rank: 3, name: 'ツーペア' },
  THREE_OF_A_KIND: { rank: 4, name: 'スリーカード' },
  STRAIGHT: { rank: 5, name: 'ストレート' },
  FLUSH: { rank: 6, name: 'フラッシュ' },
  FULL_HOUSE: { rank: 7, name: 'フルハウス' },
  FOUR_OF_A_KIND: { rank: 8, name: 'フォーカード' },
  STRAIGHT_FLUSH: { rank: 9, name: 'ストレートフラッシュ' },
  ROYAL_FLUSH: { rank: 10, name: 'ロイヤルフラッシュ' }
} as const;

export const RANK_VALUES: Record<Rank, number> = {
  'A': 14, // Ace high
  'K': 13,
  'Q': 12,
  'J': 11,
  '10': 10,
  '9': 9,
  '8': 8,
  '7': 7,
  '6': 6,
  '5': 5,
  '4': 4,
  '3': 3,
  '2': 2
};

export const SUIT_SYMBOLS: Record<Suit, string> = {
  hearts: '♥',
  diamonds: '♦',
  clubs: '♣',
  spades: '♠'
};

export const SUIT_COLORS: Record<Suit, 'red' | 'black'> = {
  hearts: 'red',
  diamonds: 'red',
  clubs: 'black',
  spades: 'black'
};

export const DEFAULT_GAME_CONFIG = {
  initialChips: 1000,
  smallBlind: 10,
  bigBlind: 20,
  bbAnte: 5,
  playerName: 'プレイヤー',
  cpuName: 'CPU',
  blindIncreaseInterval: 10,
  blindIncreaseMultiplier: 1.5
};