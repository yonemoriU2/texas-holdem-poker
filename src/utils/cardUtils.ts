import type { Card, Suit } from '../types';
import { SUITS, RANKS, RANK_VALUES } from '../constants';

/**
 * 新しいデッキを生成する
 */
export function createDeck(): Card[] {
  const deck: Card[] = [];
  
  for (const suit of SUITS) {
    for (const rank of RANKS) {
      deck.push({
        suit,
        rank,
        id: `${rank}-${suit}`
      });
    }
  }
  
  return deck;
}

/**
 * デッキをシャッフルする（Fisher-Yates アルゴリズム）
 */
export function shuffleDeck(deck: Card[]): Card[] {
  const shuffled = [...deck];
  
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  
  return shuffled;
}

/**
 * デッキから指定された枚数のカードを配る
 */
export function dealCards(deck: Card[], count: number): { cards: Card[]; remainingDeck: Card[] } {
  if (count > deck.length) {
    throw new Error('Not enough cards in deck');
  }
  
  const cards = deck.slice(0, count);
  const remainingDeck = deck.slice(count);
  
  return { cards, remainingDeck };
}

/**
 * カードの値を比較する（Aが最高）
 */
export function compareCardValues(card1: Card, card2: Card): number {
  const value1 = RANK_VALUES[card1.rank];
  const value2 = RANK_VALUES[card2.rank];
  
  return value2 - value1; // 降順（高い値が先）
}

/**
 * カードの配列をランクでソートする
 */
export function sortCardsByRank(cards: Card[]): Card[] {
  return [...cards].sort(compareCardValues);
}

/**
 * カードの配列をスートでグループ化する
 */
export function groupCardsBySuit(cards: Card[]): Record<Suit, Card[]> {
  const groups: Record<Suit, Card[]> = {
    hearts: [],
    diamonds: [],
    clubs: [],
    spades: []
  };
  
  for (const card of cards) {
    groups[card.suit].push(card);
  }
  
  return groups;
}

/**
 * カードの配列をランクでグループ化する
 */
export function groupCardsByRank(cards: Card[]): Record<string, Card[]> {
  const groups: Record<string, Card[]> = {};
  
  for (const card of cards) {
    if (!groups[card.rank]) {
      groups[card.rank] = [];
    }
    groups[card.rank].push(card);
  }
  
  return groups;
}

/**
 * 新しいシャッフルされたデッキを作成する
 */
export function createShuffledDeck(): Card[] {
  return shuffleDeck(createDeck());
}