export type Suit = 'hearts' | 'diamonds' | 'clubs' | 'spades';
export type Rank = 'A' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K';

export interface Card {
  suit: Suit;
  rank: Rank;
  id: string;
}

export interface HandRank {
  rank: number; // 1-10 (1 = high card, 10 = royal flush)
  name: string;
  cards: Card[];
  kickers: Card[];
  score: number; // For detailed comparison
}