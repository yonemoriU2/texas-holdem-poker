import { describe, it, expect, beforeEach } from 'vitest';
import {
  createDeck,
  shuffleDeck,
  dealCards,
  compareCardValues,
  sortCardsByRank,
  groupCardsBySuit,
  groupCardsByRank,
  createShuffledDeck
} from '../cardUtils';
import type { Card } from '../../types';

describe('cardUtils', () => {
  describe('createDeck', () => {
    it('should create a deck with 52 cards', () => {
      const deck = createDeck();
      expect(deck).toHaveLength(52);
    });

    it('should create cards with all suits and ranks', () => {
      const deck = createDeck();
      const suits = new Set(deck.map(card => card.suit));
      const ranks = new Set(deck.map(card => card.rank));
      
      expect(suits.size).toBe(4);
      expect(ranks.size).toBe(13);
      expect(suits).toEqual(new Set(['hearts', 'diamonds', 'clubs', 'spades']));
      expect(ranks).toEqual(new Set(['A', 'K', 'Q', 'J', '10', '9', '8', '7', '6', '5', '4', '3', '2']));
    });

    it('should create cards with unique IDs', () => {
      const deck = createDeck();
      const ids = deck.map(card => card.id);
      const uniqueIds = new Set(ids);
      
      expect(uniqueIds.size).toBe(52);
    });

    it('should create cards with correct ID format', () => {
      const deck = createDeck();
      const aceOfHearts = deck.find(card => card.rank === 'A' && card.suit === 'hearts');
      
      expect(aceOfHearts?.id).toBe('A-hearts');
    });
  });

  describe('shuffleDeck', () => {
    let originalDeck: Card[];

    beforeEach(() => {
      originalDeck = createDeck();
    });

    it('should return a deck with the same number of cards', () => {
      const shuffled = shuffleDeck(originalDeck);
      expect(shuffled).toHaveLength(52);
    });

    it('should contain all the same cards', () => {
      const shuffled = shuffleDeck(originalDeck);
      const originalIds = originalDeck.map(card => card.id).sort();
      const shuffledIds = shuffled.map(card => card.id).sort();
      
      expect(shuffledIds).toEqual(originalIds);
    });

    it('should not modify the original deck', () => {
      const originalCopy = [...originalDeck];
      shuffleDeck(originalDeck);
      
      expect(originalDeck).toEqual(originalCopy);
    });

    it('should produce different orders (statistical test)', () => {
      const shuffle1 = shuffleDeck(originalDeck);
      const shuffle2 = shuffleDeck(originalDeck);
      
      // It's extremely unlikely that two shuffles produce the same order
      const sameOrder = shuffle1.every((card, index) => card.id === shuffle2[index].id);
      expect(sameOrder).toBe(false);
    });
  });

  describe('dealCards', () => {
    let deck: Card[];

    beforeEach(() => {
      deck = createDeck();
    });

    it('should deal the correct number of cards', () => {
      const { cards, remainingDeck } = dealCards(deck, 5);
      
      expect(cards).toHaveLength(5);
      expect(remainingDeck).toHaveLength(47);
    });

    it('should deal cards from the top of the deck', () => {
      const { cards } = dealCards(deck, 3);
      
      expect(cards[0]).toEqual(deck[0]);
      expect(cards[1]).toEqual(deck[1]);
      expect(cards[2]).toEqual(deck[2]);
    });

    it('should return the remaining deck without dealt cards', () => {
      const { remainingDeck } = dealCards(deck, 3);
      
      expect(remainingDeck[0]).toEqual(deck[3]);
      expect(remainingDeck).toHaveLength(49);
    });

    it('should throw error when trying to deal more cards than available', () => {
      expect(() => dealCards(deck, 53)).toThrow('Not enough cards in deck');
    });

    it('should handle dealing all cards', () => {
      const { cards, remainingDeck } = dealCards(deck, 52);
      
      expect(cards).toHaveLength(52);
      expect(remainingDeck).toHaveLength(0);
    });

    it('should handle dealing zero cards', () => {
      const { cards, remainingDeck } = dealCards(deck, 0);
      
      expect(cards).toHaveLength(0);
      expect(remainingDeck).toHaveLength(52);
    });
  });

  describe('compareCardValues', () => {
    it('should rank Ace higher than King', () => {
      const ace: Card = { suit: 'hearts', rank: 'A', id: 'A-hearts' };
      const king: Card = { suit: 'hearts', rank: 'K', id: 'K-hearts' };
      
      expect(compareCardValues(ace, king)).toBeLessThan(0);
    });

    it('should rank King higher than Queen', () => {
      const king: Card = { suit: 'hearts', rank: 'K', id: 'K-hearts' };
      const queen: Card = { suit: 'hearts', rank: 'Q', id: 'Q-hearts' };
      
      expect(compareCardValues(king, queen)).toBeLessThan(0);
    });

    it('should rank 3 higher than 2', () => {
      const three: Card = { suit: 'hearts', rank: '3', id: '3-hearts' };
      const two: Card = { suit: 'hearts', rank: '2', id: '2-hearts' };
      
      expect(compareCardValues(three, two)).toBeLessThan(0);
    });

    it('should return 0 for cards of same rank', () => {
      const ace1: Card = { suit: 'hearts', rank: 'A', id: 'A-hearts' };
      const ace2: Card = { suit: 'spades', rank: 'A', id: 'A-spades' };
      
      expect(compareCardValues(ace1, ace2)).toBe(0);
    });
  });

  describe('sortCardsByRank', () => {
    it('should sort cards in descending order by rank', () => {
      const cards: Card[] = [
        { suit: 'hearts', rank: '2', id: '2-hearts' },
        { suit: 'hearts', rank: 'A', id: 'A-hearts' },
        { suit: 'hearts', rank: 'K', id: 'K-hearts' },
        { suit: 'hearts', rank: '5', id: '5-hearts' }
      ];
      
      const sorted = sortCardsByRank(cards);
      
      expect(sorted.map(card => card.rank)).toEqual(['A', 'K', '5', '2']);
    });

    it('should not modify the original array', () => {
      const cards: Card[] = [
        { suit: 'hearts', rank: '2', id: '2-hearts' },
        { suit: 'hearts', rank: 'A', id: 'A-hearts' }
      ];
      const originalOrder = cards.map(card => card.rank);
      
      sortCardsByRank(cards);
      
      expect(cards.map(card => card.rank)).toEqual(originalOrder);
    });

    it('should handle empty array', () => {
      const sorted = sortCardsByRank([]);
      expect(sorted).toEqual([]);
    });

    it('should handle single card', () => {
      const cards: Card[] = [{ suit: 'hearts', rank: 'A', id: 'A-hearts' }];
      const sorted = sortCardsByRank(cards);
      
      expect(sorted).toEqual(cards);
    });
  });

  describe('groupCardsBySuit', () => {
    it('should group cards by suit correctly', () => {
      const cards: Card[] = [
        { suit: 'hearts', rank: 'A', id: 'A-hearts' },
        { suit: 'spades', rank: 'K', id: 'K-spades' },
        { suit: 'hearts', rank: '2', id: '2-hearts' },
        { suit: 'diamonds', rank: 'Q', id: 'Q-diamonds' }
      ];
      
      const grouped = groupCardsBySuit(cards);
      
      expect(grouped.hearts).toHaveLength(2);
      expect(grouped.spades).toHaveLength(1);
      expect(grouped.diamonds).toHaveLength(1);
      expect(grouped.clubs).toHaveLength(0);
      
      expect(grouped.hearts.map(card => card.rank)).toEqual(['A', '2']);
      expect(grouped.spades[0].rank).toBe('K');
      expect(grouped.diamonds[0].rank).toBe('Q');
    });

    it('should handle empty array', () => {
      const grouped = groupCardsBySuit([]);
      
      expect(grouped.hearts).toEqual([]);
      expect(grouped.diamonds).toEqual([]);
      expect(grouped.clubs).toEqual([]);
      expect(grouped.spades).toEqual([]);
    });

    it('should handle all cards of same suit', () => {
      const cards: Card[] = [
        { suit: 'hearts', rank: 'A', id: 'A-hearts' },
        { suit: 'hearts', rank: 'K', id: 'K-hearts' },
        { suit: 'hearts', rank: 'Q', id: 'Q-hearts' }
      ];
      
      const grouped = groupCardsBySuit(cards);
      
      expect(grouped.hearts).toHaveLength(3);
      expect(grouped.diamonds).toHaveLength(0);
      expect(grouped.clubs).toHaveLength(0);
      expect(grouped.spades).toHaveLength(0);
    });
  });

  describe('groupCardsByRank', () => {
    it('should group cards by rank correctly', () => {
      const cards: Card[] = [
        { suit: 'hearts', rank: 'A', id: 'A-hearts' },
        { suit: 'spades', rank: 'A', id: 'A-spades' },
        { suit: 'hearts', rank: 'K', id: 'K-hearts' },
        { suit: 'diamonds', rank: '2', id: '2-diamonds' }
      ];
      
      const grouped = groupCardsByRank(cards);
      
      expect(grouped['A']).toHaveLength(2);
      expect(grouped['K']).toHaveLength(1);
      expect(grouped['2']).toHaveLength(1);
      expect(grouped['Q']).toBeUndefined();
      
      expect(grouped['A'].map(card => card.suit)).toEqual(['hearts', 'spades']);
      expect(grouped['K'][0].suit).toBe('hearts');
      expect(grouped['2'][0].suit).toBe('diamonds');
    });

    it('should handle empty array', () => {
      const grouped = groupCardsByRank([]);
      expect(grouped).toEqual({});
    });

    it('should handle all cards of same rank', () => {
      const cards: Card[] = [
        { suit: 'hearts', rank: 'A', id: 'A-hearts' },
        { suit: 'spades', rank: 'A', id: 'A-spades' },
        { suit: 'diamonds', rank: 'A', id: 'A-diamonds' },
        { suit: 'clubs', rank: 'A', id: 'A-clubs' }
      ];
      
      const grouped = groupCardsByRank(cards);
      
      expect(grouped['A']).toHaveLength(4);
      expect(Object.keys(grouped)).toHaveLength(1);
    });
  });

  describe('createShuffledDeck', () => {
    it('should create a shuffled deck with 52 cards', () => {
      const deck = createShuffledDeck();
      expect(deck).toHaveLength(52);
    });

    it('should contain all unique cards', () => {
      const deck = createShuffledDeck();
      const ids = deck.map(card => card.id);
      const uniqueIds = new Set(ids);
      
      expect(uniqueIds.size).toBe(52);
    });

    it('should produce different orders each time (statistical test)', () => {
      const deck1 = createShuffledDeck();
      const deck2 = createShuffledDeck();
      
      // It's extremely unlikely that two shuffled decks have the same order
      const sameOrder = deck1.every((card, index) => card.id === deck2[index].id);
      expect(sameOrder).toBe(false);
    });

    it('should contain all expected cards', () => {
      const deck = createShuffledDeck();
      const originalDeck = createDeck();
      
      const deckIds = deck.map(card => card.id).sort();
      const originalIds = originalDeck.map(card => card.id).sort();
      
      expect(deckIds).toEqual(originalIds);
    });
  });
});