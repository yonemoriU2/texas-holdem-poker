import type { Card, HandRank } from '../types';
import { RANK_VALUES, HAND_RANKINGS } from '../constants';
import { sortCardsByRank, groupCardsByRank, groupCardsBySuit } from './cardUtils';

/**
 * 7枚のカードから最高の5枚の組み合わせを評価する
 */
export function evaluateHand(cards: Card[]): HandRank {
  if (cards.length < 5) {
    throw new Error('At least 5 cards are required to evaluate a hand');
  }

  // 7枚から5枚の全ての組み合わせを生成
  const combinations = generateCombinations(cards, 5);
  let bestHand: HandRank | null = null;

  for (const combination of combinations) {
    const handRank = evaluateFiveCardHand(combination);
    
    if (!bestHand || handRank.score > bestHand.score) {
      bestHand = handRank;
    }
  }

  return bestHand!;
}

/**
 * 5枚のカードでハンドを評価する
 */
export function evaluateFiveCardHand(cards: Card[]): HandRank {
  if (cards.length !== 5) {
    throw new Error('Exactly 5 cards are required');
  }

  const sortedCards = sortCardsByRank(cards);
  
  // 各ハンドタイプをチェック（強い順）
  const royalFlush = checkRoyalFlush(sortedCards);
  if (royalFlush) return royalFlush;

  const straightFlush = checkStraightFlush(sortedCards);
  if (straightFlush) return straightFlush;

  const fourOfAKind = checkFourOfAKind(sortedCards);
  if (fourOfAKind) return fourOfAKind;

  const fullHouse = checkFullHouse(sortedCards);
  if (fullHouse) return fullHouse;

  const flush = checkFlush(sortedCards);
  if (flush) return flush;

  const straight = checkStraight(sortedCards);
  if (straight) return straight;

  const threeOfAKind = checkThreeOfAKind(sortedCards);
  if (threeOfAKind) return threeOfAKind;

  const twoPair = checkTwoPair(sortedCards);
  if (twoPair) return twoPair;

  const onePair = checkOnePair(sortedCards);
  if (onePair) return onePair;

  return checkHighCard(sortedCards);
}

/**
 * ロイヤルフラッシュをチェック
 */
function checkRoyalFlush(cards: Card[]): HandRank | null {
  const straightFlush = checkStraightFlush(cards);
  if (straightFlush && RANK_VALUES[cards[0].rank] === 14) { // Ace high
    return {
      rank: HAND_RANKINGS.ROYAL_FLUSH.rank,
      name: HAND_RANKINGS.ROYAL_FLUSH.name,
      cards: [...cards],
      kickers: [],
      score: calculateScore(HAND_RANKINGS.ROYAL_FLUSH.rank, [])
    };
  }
  return null;
}

/**
 * ストレートフラッシュをチェック
 */
function checkStraightFlush(cards: Card[]): HandRank | null {
  const isFlush = checkFlush(cards);
  const isStraight = checkStraight(cards);
  
  if (isFlush && isStraight) {
    return {
      rank: HAND_RANKINGS.STRAIGHT_FLUSH.rank,
      name: HAND_RANKINGS.STRAIGHT_FLUSH.name,
      cards: [...cards],
      kickers: [],
      score: calculateScore(HAND_RANKINGS.STRAIGHT_FLUSH.rank, [RANK_VALUES[cards[0].rank]])
    };
  }
  return null;
}

/**
 * フォーカードをチェック
 */
function checkFourOfAKind(cards: Card[]): HandRank | null {
  const groups = groupCardsByRank(cards);
  const ranks = Object.keys(groups);
  
  for (const rank of ranks) {
    if (groups[rank].length === 4) {
      const fourCards = groups[rank];
      const kicker = cards.find(card => card.rank !== rank)!;
      
      return {
        rank: HAND_RANKINGS.FOUR_OF_A_KIND.rank,
        name: HAND_RANKINGS.FOUR_OF_A_KIND.name,
        cards: fourCards,
        kickers: [kicker],
        score: calculateScore(HAND_RANKINGS.FOUR_OF_A_KIND.rank, [
          RANK_VALUES[rank as keyof typeof RANK_VALUES],
          RANK_VALUES[kicker.rank]
        ])
      };
    }
  }
  return null;
}

/**
 * フルハウスをチェック
 */
function checkFullHouse(cards: Card[]): HandRank | null {
  const groups = groupCardsByRank(cards);
  const ranks = Object.keys(groups);
  let threeRank: string | null = null;
  let pairRank: string | null = null;
  
  for (const rank of ranks) {
    if (groups[rank].length === 3) {
      threeRank = rank;
    } else if (groups[rank].length === 2) {
      pairRank = rank;
    }
  }
  
  if (threeRank && pairRank) {
    return {
      rank: HAND_RANKINGS.FULL_HOUSE.rank,
      name: HAND_RANKINGS.FULL_HOUSE.name,
      cards: [...groups[threeRank], ...groups[pairRank]],
      kickers: [],
      score: calculateScore(HAND_RANKINGS.FULL_HOUSE.rank, [
        RANK_VALUES[threeRank as keyof typeof RANK_VALUES],
        RANK_VALUES[pairRank as keyof typeof RANK_VALUES]
      ])
    };
  }
  return null;
}

/**
 * フラッシュをチェック
 */
function checkFlush(cards: Card[]): HandRank | null {
  const suitGroups = groupCardsBySuit(cards);
  
  for (const suit in suitGroups) {
    if (suitGroups[suit as keyof typeof suitGroups].length === 5) {
      const flushCards = sortCardsByRank(suitGroups[suit as keyof typeof suitGroups]);
      const kickers = flushCards.map(card => RANK_VALUES[card.rank]);
      
      return {
        rank: HAND_RANKINGS.FLUSH.rank,
        name: HAND_RANKINGS.FLUSH.name,
        cards: flushCards,
        kickers: [],
        score: calculateScore(HAND_RANKINGS.FLUSH.rank, kickers)
      };
    }
  }
  return null;
}

/**
 * ストレートをチェック
 */
function checkStraight(cards: Card[]): HandRank | null {
  const sortedCards = sortCardsByRank(cards);
  const values = sortedCards.map(card => RANK_VALUES[card.rank]);
  
  // 通常のストレート（A-K-Q-J-10からA-2-3-4-5まで）
  let isStraight = true;
  for (let i = 1; i < values.length; i++) {
    if (values[i-1] - values[i] !== 1) {
      isStraight = false;
      break;
    }
  }
  
  // A-2-3-4-5のローストレートをチェック
  if (!isStraight && values[0] === 14) { // Ace
    const lowStraightValues = [14, 5, 4, 3, 2];
    const sortedValues = [...values].sort((a, b) => b - a);
    isStraight = JSON.stringify(sortedValues) === JSON.stringify(lowStraightValues);
    
    if (isStraight) {
      // ローストレートの場合、Aceを1として扱う
      return {
        rank: HAND_RANKINGS.STRAIGHT.rank,
        name: HAND_RANKINGS.STRAIGHT.name,
        cards: [...sortedCards],
        kickers: [],
        score: calculateScore(HAND_RANKINGS.STRAIGHT.rank, [5]) // 5 high straight
      };
    }
  }
  
  if (isStraight) {
    return {
      rank: HAND_RANKINGS.STRAIGHT.rank,
      name: HAND_RANKINGS.STRAIGHT.name,
      cards: [...sortedCards],
      kickers: [],
      score: calculateScore(HAND_RANKINGS.STRAIGHT.rank, [values[0]])
    };
  }
  
  return null;
}

/**
 * スリーカードをチェック
 */
function checkThreeOfAKind(cards: Card[]): HandRank | null {
  const groups = groupCardsByRank(cards);
  const ranks = Object.keys(groups);
  
  for (const rank of ranks) {
    if (groups[rank].length === 3) {
      const threeCards = groups[rank];
      const kickers = cards
        .filter(card => card.rank !== rank)
        .sort((a, b) => RANK_VALUES[b.rank] - RANK_VALUES[a.rank]);
      
      return {
        rank: HAND_RANKINGS.THREE_OF_A_KIND.rank,
        name: HAND_RANKINGS.THREE_OF_A_KIND.name,
        cards: threeCards,
        kickers: kickers,
        score: calculateScore(HAND_RANKINGS.THREE_OF_A_KIND.rank, [
          RANK_VALUES[rank as keyof typeof RANK_VALUES],
          ...kickers.map(card => RANK_VALUES[card.rank])
        ])
      };
    }
  }
  return null;
}

/**
 * ツーペアをチェック
 */
function checkTwoPair(cards: Card[]): HandRank | null {
  const groups = groupCardsByRank(cards);
  const ranks = Object.keys(groups);
  const pairs: string[] = [];
  
  for (const rank of ranks) {
    if (groups[rank].length === 2) {
      pairs.push(rank);
    }
  }
  
  if (pairs.length === 2) {
    // ペアを強い順にソート
    pairs.sort((a, b) => RANK_VALUES[b as keyof typeof RANK_VALUES] - RANK_VALUES[a as keyof typeof RANK_VALUES]);
    
    const pairCards = [...groups[pairs[0]], ...groups[pairs[1]]];
    const kicker = cards.find(card => !pairs.includes(card.rank))!;
    
    return {
      rank: HAND_RANKINGS.TWO_PAIR.rank,
      name: HAND_RANKINGS.TWO_PAIR.name,
      cards: pairCards,
      kickers: [kicker],
      score: calculateScore(HAND_RANKINGS.TWO_PAIR.rank, [
        RANK_VALUES[pairs[0] as keyof typeof RANK_VALUES],
        RANK_VALUES[pairs[1] as keyof typeof RANK_VALUES],
        RANK_VALUES[kicker.rank]
      ])
    };
  }
  return null;
}

/**
 * ワンペアをチェック
 */
function checkOnePair(cards: Card[]): HandRank | null {
  const groups = groupCardsByRank(cards);
  const ranks = Object.keys(groups);
  
  for (const rank of ranks) {
    if (groups[rank].length === 2) {
      const pairCards = groups[rank];
      const kickers = cards
        .filter(card => card.rank !== rank)
        .sort((a, b) => RANK_VALUES[b.rank] - RANK_VALUES[a.rank]);
      
      return {
        rank: HAND_RANKINGS.ONE_PAIR.rank,
        name: HAND_RANKINGS.ONE_PAIR.name,
        cards: pairCards,
        kickers: kickers,
        score: calculateScore(HAND_RANKINGS.ONE_PAIR.rank, [
          RANK_VALUES[rank as keyof typeof RANK_VALUES],
          ...kickers.map(card => RANK_VALUES[card.rank])
        ])
      };
    }
  }
  return null;
}

/**
 * ハイカードをチェック
 */
function checkHighCard(cards: Card[]): HandRank {
  const sortedCards = sortCardsByRank(cards);
  const kickers = sortedCards.map(card => RANK_VALUES[card.rank]);
  
  return {
    rank: HAND_RANKINGS.HIGH_CARD.rank,
    name: HAND_RANKINGS.HIGH_CARD.name,
    cards: [sortedCards[0]], // 最高のカード
    kickers: sortedCards.slice(1), // 残りのカード
    score: calculateScore(HAND_RANKINGS.HIGH_CARD.rank, kickers)
  };
}

/**
 * ハンドスコアを計算する（比較用）
 */
function calculateScore(handRank: number, values: number[]): number {
  // ハンドランクを基数として、各値を桁として扱う
  let score = handRank * Math.pow(15, 5);
  
  for (let i = 0; i < values.length && i < 5; i++) {
    score += values[i] * Math.pow(15, 4 - i);
  }
  
  return score;
}

/**
 * 2つのハンドを比較する
 * @param hand1 最初のハンド
 * @param hand2 2番目のハンド
 * @returns 1 if hand1 wins, -1 if hand2 wins, 0 if tie
 */
export function compareHands(hand1: HandRank, hand2: HandRank): number {
  if (hand1.score > hand2.score) return 1;
  if (hand1.score < hand2.score) return -1;
  return 0;
}

/**
 * 複数のハンドから勝者を決定する
 * @param hands ハンドの配列
 * @returns 勝利したハンドのインデックス配列（引き分けの場合は複数）
 */
export function determineWinners(hands: HandRank[]): number[] {
  if (hands.length === 0) return [];
  if (hands.length === 1) return [0];

  let bestScore = hands[0].score;
  let winners: number[] = [0];

  for (let i = 1; i < hands.length; i++) {
    const currentScore = hands[i].score;
    
    if (currentScore > bestScore) {
      bestScore = currentScore;
      winners = [i];
    } else if (currentScore === bestScore) {
      winners.push(i);
    }
  }

  return winners;
}

/**
 * ハンドの強度を数値で表現する（デバッグ用）
 */
export function getHandStrength(hand: HandRank): number {
  return hand.score;
}

/**
 * ハンドの詳細な説明を取得する
 */
export function getHandDescription(hand: HandRank): string {
  const descriptions: Record<number, (hand: HandRank) => string> = {
    10: () => `${hand.name}`,
    9: (hand) => `${hand.name} (${RANK_VALUES[hand.cards[0].rank]} high)`,
    8: (hand) => `${hand.name} (${hand.cards[0].rank}s)`,
    7: (hand) => {
      const threeRank = hand.cards.find(card => 
        hand.cards.filter(c => c.rank === card.rank).length === 3
      )?.rank;
      const pairRank = hand.cards.find(card => 
        hand.cards.filter(c => c.rank === card.rank).length === 2
      )?.rank;
      return `${hand.name} (${threeRank}s over ${pairRank}s)`;
    },
    6: (hand) => `${hand.name} (${hand.cards[0].suit})`,
    5: (hand) => `${hand.name} (${RANK_VALUES[hand.cards[0].rank]} high)`,
    4: (hand) => `${hand.name} (${hand.cards[0].rank}s)`,
    3: (hand) => {
      const pairs = hand.cards.reduce((acc: string[], card) => {
        if (hand.cards.filter(c => c.rank === card.rank).length === 2 && !acc.includes(card.rank)) {
          acc.push(card.rank);
        }
        return acc;
      }, []);
      pairs.sort((a, b) => RANK_VALUES[b as keyof typeof RANK_VALUES] - RANK_VALUES[a as keyof typeof RANK_VALUES]);
      return `${hand.name} (${pairs[0]}s and ${pairs[1]}s)`;
    },
    2: (hand) => `${hand.name} (${hand.cards[0].rank}s)`,
    1: (hand) => `${hand.name} (${hand.cards[0].rank} high)`
  };

  const descriptionFn = descriptions[hand.rank];
  return descriptionFn ? descriptionFn(hand) : hand.name;
}

/**
 * 配列から指定された数の組み合わせを生成する
 */
function generateCombinations<T>(array: T[], size: number): T[][] {
  if (size > array.length) return [];
  if (size === 1) return array.map(item => [item]);
  if (size === array.length) return [array];
  
  const combinations: T[][] = [];
  
  function backtrack(start: number, currentCombination: T[]) {
    if (currentCombination.length === size) {
      combinations.push([...currentCombination]);
      return;
    }
    
    for (let i = start; i < array.length; i++) {
      currentCombination.push(array[i]);
      backtrack(i + 1, currentCombination);
      currentCombination.pop();
    }
  }
  
  backtrack(0, []);
  return combinations;
}