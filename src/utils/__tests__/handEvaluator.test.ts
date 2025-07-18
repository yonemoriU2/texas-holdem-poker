import { describe, it, expect } from 'vitest';
import { 
  evaluateHand, 
  evaluateFiveCardHand, 
  compareHands, 
  determineWinners,
  getHandDescription
} from '../handEvaluator';
import type { Card, Rank, Suit } from '../../types';

// テスト用のカード作成ヘルパー
function createCard(rank: string, suit: string): Card {
  return {
    rank: rank as Rank,
    suit: suit as Suit,
    id: `${rank}-${suit}`
  };
}

describe('handEvaluator', () => {
  describe('evaluateFiveCardHand', () => {
    it('ロイヤルフラッシュを正しく判定する', () => {
      const cards = [
        createCard('A', 'hearts'),
        createCard('K', 'hearts'),
        createCard('Q', 'hearts'),
        createCard('J', 'hearts'),
        createCard('10', 'hearts')
      ];
      
      const result = evaluateFiveCardHand(cards);
      expect(result.rank).toBe(10);
      expect(result.name).toBe('ロイヤルフラッシュ');
    });

    it('ストレートフラッシュを正しく判定する', () => {
      const cards = [
        createCard('9', 'hearts'),
        createCard('8', 'hearts'),
        createCard('7', 'hearts'),
        createCard('6', 'hearts'),
        createCard('5', 'hearts')
      ];
      
      const result = evaluateFiveCardHand(cards);
      expect(result.rank).toBe(9);
      expect(result.name).toBe('ストレートフラッシュ');
    });

    it('フォーカードを正しく判定する', () => {
      const cards = [
        createCard('A', 'hearts'),
        createCard('A', 'diamonds'),
        createCard('A', 'clubs'),
        createCard('A', 'spades'),
        createCard('K', 'hearts')
      ];
      
      const result = evaluateFiveCardHand(cards);
      expect(result.rank).toBe(8);
      expect(result.name).toBe('フォーカード');
    });

    it('フルハウスを正しく判定する', () => {
      const cards = [
        createCard('A', 'hearts'),
        createCard('A', 'diamonds'),
        createCard('A', 'clubs'),
        createCard('K', 'hearts'),
        createCard('K', 'diamonds')
      ];
      
      const result = evaluateFiveCardHand(cards);
      expect(result.rank).toBe(7);
      expect(result.name).toBe('フルハウス');
    });

    it('フラッシュを正しく判定する', () => {
      const cards = [
        createCard('A', 'hearts'),
        createCard('J', 'hearts'),
        createCard('9', 'hearts'),
        createCard('7', 'hearts'),
        createCard('5', 'hearts')
      ];
      
      const result = evaluateFiveCardHand(cards);
      expect(result.rank).toBe(6);
      expect(result.name).toBe('フラッシュ');
    });

    it('ストレートを正しく判定する', () => {
      const cards = [
        createCard('A', 'hearts'),
        createCard('K', 'diamonds'),
        createCard('Q', 'clubs'),
        createCard('J', 'spades'),
        createCard('10', 'hearts')
      ];
      
      const result = evaluateFiveCardHand(cards);
      expect(result.rank).toBe(5);
      expect(result.name).toBe('ストレート');
    });

    it('A-2-3-4-5のローストレートを正しく判定する', () => {
      const cards = [
        createCard('A', 'hearts'),
        createCard('2', 'diamonds'),
        createCard('3', 'clubs'),
        createCard('4', 'spades'),
        createCard('5', 'hearts')
      ];
      
      const result = evaluateFiveCardHand(cards);
      expect(result.rank).toBe(5);
      expect(result.name).toBe('ストレート');
    });

    it('スリーカードを正しく判定する', () => {
      const cards = [
        createCard('A', 'hearts'),
        createCard('A', 'diamonds'),
        createCard('A', 'clubs'),
        createCard('K', 'hearts'),
        createCard('Q', 'diamonds')
      ];
      
      const result = evaluateFiveCardHand(cards);
      expect(result.rank).toBe(4);
      expect(result.name).toBe('スリーカード');
    });

    it('ツーペアを正しく判定する', () => {
      const cards = [
        createCard('A', 'hearts'),
        createCard('A', 'diamonds'),
        createCard('K', 'clubs'),
        createCard('K', 'hearts'),
        createCard('Q', 'diamonds')
      ];
      
      const result = evaluateFiveCardHand(cards);
      expect(result.rank).toBe(3);
      expect(result.name).toBe('ツーペア');
    });

    it('ワンペアを正しく判定する', () => {
      const cards = [
        createCard('A', 'hearts'),
        createCard('A', 'diamonds'),
        createCard('K', 'clubs'),
        createCard('Q', 'hearts'),
        createCard('J', 'diamonds')
      ];
      
      const result = evaluateFiveCardHand(cards);
      expect(result.rank).toBe(2);
      expect(result.name).toBe('ワンペア');
    });

    it('ハイカードを正しく判定する', () => {
      const cards = [
        createCard('A', 'hearts'),
        createCard('K', 'diamonds'),
        createCard('Q', 'clubs'),
        createCard('J', 'hearts'),
        createCard('9', 'diamonds')
      ];
      
      const result = evaluateFiveCardHand(cards);
      expect(result.rank).toBe(1);
      expect(result.name).toBe('ハイカード');
    });
  });

  describe('compareHands', () => {
    it('より強いハンドが勝つ', () => {
      const royalFlush = evaluateFiveCardHand([
        createCard('A', 'hearts'),
        createCard('K', 'hearts'),
        createCard('Q', 'hearts'),
        createCard('J', 'hearts'),
        createCard('10', 'hearts')
      ]);

      const pair = evaluateFiveCardHand([
        createCard('A', 'diamonds'),
        createCard('A', 'clubs'),
        createCard('K', 'spades'),
        createCard('Q', 'hearts'),
        createCard('J', 'diamonds')
      ]);

      expect(compareHands(royalFlush, pair)).toBe(1);
      expect(compareHands(pair, royalFlush)).toBe(-1);
    });

    it('同じランクのハンドでキッカーを比較する', () => {
      const highPair = evaluateFiveCardHand([
        createCard('A', 'hearts'),
        createCard('A', 'diamonds'),
        createCard('K', 'clubs'),
        createCard('Q', 'hearts'),
        createCard('J', 'diamonds')
      ]);

      const lowPair = evaluateFiveCardHand([
        createCard('2', 'hearts'),
        createCard('2', 'diamonds'),
        createCard('K', 'clubs'),
        createCard('Q', 'hearts'),
        createCard('J', 'spades')
      ]);

      expect(compareHands(highPair, lowPair)).toBe(1);
    });
  });

  describe('determineWinners', () => {
    it('単一の勝者を正しく決定する', () => {
      const hands = [
        evaluateFiveCardHand([
          createCard('A', 'hearts'),
          createCard('A', 'diamonds'),
          createCard('K', 'clubs'),
          createCard('Q', 'hearts'),
          createCard('J', 'diamonds')
        ]),
        evaluateFiveCardHand([
          createCard('2', 'hearts'),
          createCard('2', 'diamonds'),
          createCard('K', 'clubs'),
          createCard('Q', 'hearts'),
          createCard('J', 'spades')
        ])
      ];

      const winners = determineWinners(hands);
      expect(winners).toEqual([0]);
    });

    it('引き分けの場合は複数の勝者を返す', () => {
      const hand1 = evaluateFiveCardHand([
        createCard('A', 'hearts'),
        createCard('A', 'diamonds'),
        createCard('K', 'clubs'),
        createCard('Q', 'hearts'),
        createCard('J', 'diamonds')
      ]);

      const hand2 = evaluateFiveCardHand([
        createCard('A', 'clubs'),
        createCard('A', 'spades'),
        createCard('K', 'hearts'),
        createCard('Q', 'diamonds'),
        createCard('J', 'clubs')
      ]);

      const winners = determineWinners([hand1, hand2]);
      expect(winners.length).toBe(2);
      expect(winners).toContain(0);
      expect(winners).toContain(1);
    });
  });

  describe('evaluateHand (7 cards)', () => {
    it('7枚のカードから最高の5枚を選択する', () => {
      const cards = [
        createCard('A', 'hearts'),
        createCard('K', 'hearts'),
        createCard('Q', 'hearts'),
        createCard('J', 'hearts'),
        createCard('10', 'hearts'),
        createCard('2', 'diamonds'),
        createCard('3', 'clubs')
      ];

      const result = evaluateHand(cards);
      expect(result.rank).toBe(10); // ロイヤルフラッシュ
      expect(result.name).toBe('ロイヤルフラッシュ');
    });
  });

  describe('getHandDescription', () => {
    it('各ハンドタイプの説明を正しく生成する', () => {
      const royalFlush = evaluateFiveCardHand([
        createCard('A', 'hearts'),
        createCard('K', 'hearts'),
        createCard('Q', 'hearts'),
        createCard('J', 'hearts'),
        createCard('10', 'hearts')
      ]);

      const description = getHandDescription(royalFlush);
      expect(description).toBe('ロイヤルフラッシュ');
    });
  });

  describe('複雑なタイブレーカーシナリオ', () => {
    it('フラッシュのキッカー比較を正しく行う', () => {
      const highFlush = evaluateFiveCardHand([
        createCard('A', 'hearts'),
        createCard('K', 'hearts'),
        createCard('Q', 'hearts'),
        createCard('J', 'hearts'),
        createCard('9', 'hearts')
      ]);

      const lowFlush = evaluateFiveCardHand([
        createCard('A', 'diamonds'),
        createCard('K', 'diamonds'),
        createCard('Q', 'diamonds'),
        createCard('J', 'diamonds'),
        createCard('8', 'diamonds')
      ]);

      expect(compareHands(highFlush, lowFlush)).toBe(1);
    });

    it('ストレートの高さを正しく比較する', () => {
      const highStraight = evaluateFiveCardHand([
        createCard('A', 'hearts'),
        createCard('K', 'diamonds'),
        createCard('Q', 'clubs'),
        createCard('J', 'spades'),
        createCard('10', 'hearts')
      ]);

      const lowStraight = evaluateFiveCardHand([
        createCard('9', 'hearts'),
        createCard('8', 'diamonds'),
        createCard('7', 'clubs'),
        createCard('6', 'spades'),
        createCard('5', 'hearts')
      ]);

      expect(compareHands(highStraight, lowStraight)).toBe(1);
    });

    it('A-2-3-4-5のローストレートが正しく比較される', () => {
      const wheelStraight = evaluateFiveCardHand([
        createCard('A', 'hearts'),
        createCard('2', 'diamonds'),
        createCard('3', 'clubs'),
        createCard('4', 'spades'),
        createCard('5', 'hearts')
      ]);

      const sixHighStraight = evaluateFiveCardHand([
        createCard('6', 'hearts'),
        createCard('5', 'diamonds'),
        createCard('4', 'clubs'),
        createCard('3', 'spades'),
        createCard('2', 'hearts')
      ]);

      expect(compareHands(wheelStraight, sixHighStraight)).toBe(-1);
    });

    it('フォーカードのキッカー比較を正しく行う', () => {
      const highQuads = evaluateFiveCardHand([
        createCard('A', 'hearts'),
        createCard('A', 'diamonds'),
        createCard('A', 'clubs'),
        createCard('A', 'spades'),
        createCard('K', 'hearts')
      ]);

      const lowQuads = evaluateFiveCardHand([
        createCard('A', 'hearts'),
        createCard('A', 'diamonds'),
        createCard('A', 'clubs'),
        createCard('A', 'spades'),
        createCard('Q', 'hearts')
      ]);

      expect(compareHands(highQuads, lowQuads)).toBe(1);
    });

    it('フルハウスのスリーカードとペアの比較を正しく行う', () => {
      const highFullHouse = evaluateFiveCardHand([
        createCard('A', 'hearts'),
        createCard('A', 'diamonds'),
        createCard('A', 'clubs'),
        createCard('K', 'hearts'),
        createCard('K', 'diamonds')
      ]);

      const lowFullHouse = evaluateFiveCardHand([
        createCard('K', 'hearts'),
        createCard('K', 'diamonds'),
        createCard('K', 'clubs'),
        createCard('A', 'hearts'),
        createCard('A', 'diamonds')
      ]);

      expect(compareHands(highFullHouse, lowFullHouse)).toBe(1);
    });

    it('ツーペアのキッカー比較を正しく行う', () => {
      const highTwoPair = evaluateFiveCardHand([
        createCard('A', 'hearts'),
        createCard('A', 'diamonds'),
        createCard('K', 'clubs'),
        createCard('K', 'hearts'),
        createCard('Q', 'diamonds')
      ]);

      const lowTwoPair = evaluateFiveCardHand([
        createCard('A', 'hearts'),
        createCard('A', 'diamonds'),
        createCard('K', 'clubs'),
        createCard('K', 'hearts'),
        createCard('J', 'diamonds')
      ]);

      expect(compareHands(highTwoPair, lowTwoPair)).toBe(1);
    });

    it('ワンペアの複数キッカー比較を正しく行う', () => {
      const highOnePair = evaluateFiveCardHand([
        createCard('A', 'hearts'),
        createCard('A', 'diamonds'),
        createCard('K', 'clubs'),
        createCard('Q', 'hearts'),
        createCard('J', 'diamonds')
      ]);

      const lowOnePair = evaluateFiveCardHand([
        createCard('A', 'hearts'),
        createCard('A', 'diamonds'),
        createCard('K', 'clubs'),
        createCard('Q', 'hearts'),
        createCard('10', 'diamonds')
      ]);

      expect(compareHands(highOnePair, lowOnePair)).toBe(1);
    });

    it('ハイカードの全キッカー比較を正しく行う', () => {
      const highCard1 = evaluateFiveCardHand([
        createCard('A', 'hearts'),
        createCard('K', 'diamonds'),
        createCard('Q', 'clubs'),
        createCard('J', 'hearts'),
        createCard('9', 'diamonds')
      ]);

      const highCard2 = evaluateFiveCardHand([
        createCard('A', 'hearts'),
        createCard('K', 'diamonds'),
        createCard('Q', 'clubs'),
        createCard('J', 'hearts'),
        createCard('8', 'diamonds')
      ]);

      expect(compareHands(highCard1, highCard2)).toBe(1);
    });

    it('完全に同じハンドは引き分けになる', () => {
      const hand1 = evaluateFiveCardHand([
        createCard('A', 'hearts'),
        createCard('A', 'diamonds'),
        createCard('K', 'clubs'),
        createCard('Q', 'hearts'),
        createCard('J', 'diamonds')
      ]);

      const hand2 = evaluateFiveCardHand([
        createCard('A', 'clubs'),
        createCard('A', 'spades'),
        createCard('K', 'hearts'),
        createCard('Q', 'diamonds'),
        createCard('J', 'clubs')
      ]);

      expect(compareHands(hand1, hand2)).toBe(0);
    });
  });
});