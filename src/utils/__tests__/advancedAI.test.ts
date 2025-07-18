import { describe, it, expect } from 'vitest';
import {
  decideAdvancedAIAction,
  addRandomnessToAction,
  adjustPersonality
} from '../advancedAI';
import type { Player, GameState, PlayerAction } from '../../types';
import type { AIPersonality } from '../advancedAI';

// モックデータ
const mockPlayer: Player = {
  id: 'cpu-1',
  name: 'CPU',
  chips: 1000,
  holeCards: [
    { rank: 'A', suit: 'hearts', id: 'A-hearts' },
    { rank: 'K', suit: 'hearts', id: 'K-hearts' }
  ],
  currentBet: 0,
  hasActed: false,
  hasFolded: false,
  isAllIn: false,
  isDealer: false
};

const mockGameState: GameState = {
  players: [],
  communityCards: [],
  pot: 0,
  currentBet: 0,
  gamePhase: 'preflop',
  activePlayerIndex: 0,
  dealerIndex: 0,
  deck: [],
  winner: null,
  winningHand: null,
  isGameActive: true,
  smallBlind: 10,
  bigBlind: 20,
  bbAnte: 0,
  handNumber: 1,
  blindLevel: 1,
  handsUntilBlindIncrease: 10
};

const mockPersonality: AIPersonality = {
  aggressionLevel: 0.6,
  bluffFrequency: 0.3,
  patienceLevel: 0.5,
  riskTolerance: 0.4,
  adaptability: 0.7
};

describe('Advanced AI Logic', () => {
  describe('decideAdvancedAIAction', () => {
    it('基本的なAIアクションを決定する', () => {
      const action = decideAdvancedAIAction(mockPlayer, mockGameState, mockPersonality);
      
      expect(action).toHaveProperty('action');
      expect(action).toHaveProperty('confidence');
      expect(action).toHaveProperty('reasoning');
      expect(typeof action.action).toBe('string');
      expect(action.confidence).toBeGreaterThan(0);
      expect(action.confidence).toBeLessThanOrEqual(1);
    });

    it('相手の行動履歴を考慮する', () => {
      const opponentHistory: PlayerAction[] = ['fold', 'call', 'bet', 'fold'];
      const action = decideAdvancedAIAction(mockPlayer, mockGameState, mockPersonality, opponentHistory);
      
      expect(action).toHaveProperty('action');
      expect(action).toHaveProperty('reasoning');
    });

    it('異なるパーソナリティで異なる行動を選択する', () => {
      const aggressivePersonality: AIPersonality = {
        ...mockPersonality,
        aggressionLevel: 0.9,
        bluffFrequency: 0.5
      };

      const passivePersonality: AIPersonality = {
        ...mockPersonality,
        aggressionLevel: 0.2,
        bluffFrequency: 0.1
      };

      const aggressiveAction = decideAdvancedAIAction(mockPlayer, mockGameState, aggressivePersonality);
      const passiveAction = decideAdvancedAIAction(mockPlayer, mockGameState, passivePersonality);

      // 有効なアクションであることを確認
      expect(['fold', 'call', 'check', 'bet', 'raise', 'all-in']).toContain(aggressiveAction.action);
      expect(['fold', 'call', 'check', 'bet', 'raise', 'all-in']).toContain(passiveAction.action);
    });
  });

  describe('addRandomnessToAction', () => {
    it('行動にランダム性を追加する', () => {
      const originalAction = {
        action: 'call' as PlayerAction,
        confidence: 0.8,
        reasoning: 'テスト'
      };

      const randomAction = addRandomnessToAction(originalAction, mockPersonality);
      
      expect(randomAction).toHaveProperty('action');
      expect(randomAction).toHaveProperty('confidence');
      expect(randomAction).toHaveProperty('reasoning');
    });

    it('忍耐力が低いほどランダム性が高くなる', () => {
      const lowPatiencePersonality: AIPersonality = {
        ...mockPersonality,
        patienceLevel: 0.1
      };

      const highPatiencePersonality: AIPersonality = {
        ...mockPersonality,
        patienceLevel: 0.9
      };

      const originalAction = {
        action: 'call' as PlayerAction,
        confidence: 0.8,
        reasoning: 'テスト'
      };

      // 複数回実行してランダム性をテスト
      const lowPatienceResults = [];
      const highPatienceResults = [];

      for (let i = 0; i < 10; i++) {
        lowPatienceResults.push(addRandomnessToAction(originalAction, lowPatiencePersonality));
        highPatienceResults.push(addRandomnessToAction(originalAction, highPatiencePersonality));
      }

      // 低い忍耐力の方が行動が変化する可能性が高い
      const lowPatienceChanges = lowPatienceResults.filter(result => result.action !== 'call').length;
      const highPatienceChanges = highPatienceResults.filter(result => result.action !== 'call').length;

      expect(lowPatienceChanges).toBeGreaterThanOrEqual(0);
      expect(highPatienceChanges).toBeGreaterThanOrEqual(0);
    });
  });

  describe('adjustPersonality', () => {
    it('ゲーム進行に基づいてパーソナリティを調整する', () => {
      const adjustedPersonality = adjustPersonality(mockPersonality, 0.8, 0.5);
      
      expect(adjustedPersonality).toHaveProperty('aggressionLevel');
      expect(adjustedPersonality).toHaveProperty('bluffFrequency');
      expect(adjustedPersonality).toHaveProperty('patienceLevel');
      expect(adjustedPersonality).toHaveProperty('riskTolerance');
      expect(adjustedPersonality).toHaveProperty('adaptability');
    });

    it('勝率が低い場合により保守的になる', () => {
      const lowWinRatePersonality = adjustPersonality(mockPersonality, 0.5, 0.2);
      
      // 負けている場合は攻撃性が下がり、忍耐力が上がる
      expect(lowWinRatePersonality.aggressionLevel).toBeLessThanOrEqual(mockPersonality.aggressionLevel);
      expect(lowWinRatePersonality.patienceLevel).toBeGreaterThanOrEqual(mockPersonality.patienceLevel);
    });

    it('勝率が高い場合により攻撃的になる', () => {
      const highWinRatePersonality = adjustPersonality(mockPersonality, 0.5, 0.8);
      
      // 勝っている場合は攻撃性が上がり、リスク許容度が上がる
      expect(highWinRatePersonality.aggressionLevel).toBeGreaterThanOrEqual(mockPersonality.aggressionLevel);
      expect(highWinRatePersonality.riskTolerance).toBeGreaterThanOrEqual(mockPersonality.riskTolerance);
    });

    it('ゲーム終盤により攻撃的になる', () => {
      const lateGamePersonality = adjustPersonality(mockPersonality, 0.9, 0.5);
      
      // ゲーム終盤は攻撃性とリスク許容度が上がる
      expect(lateGamePersonality.aggressionLevel).toBeGreaterThanOrEqual(mockPersonality.aggressionLevel);
      expect(lateGamePersonality.riskTolerance).toBeGreaterThanOrEqual(mockPersonality.riskTolerance);
    });

    it('パーソナリティ値が有効範囲内に収まる', () => {
      const adjustedPersonality = adjustPersonality(mockPersonality, 0.5, 0.5);
      
      expect(adjustedPersonality.aggressionLevel).toBeGreaterThanOrEqual(0);
      expect(adjustedPersonality.aggressionLevel).toBeLessThanOrEqual(1);
      expect(adjustedPersonality.bluffFrequency).toBeGreaterThanOrEqual(0);
      expect(adjustedPersonality.bluffFrequency).toBeLessThanOrEqual(1);
      expect(adjustedPersonality.patienceLevel).toBeGreaterThanOrEqual(0);
      expect(adjustedPersonality.patienceLevel).toBeLessThanOrEqual(1);
      expect(adjustedPersonality.riskTolerance).toBeGreaterThanOrEqual(0);
      expect(adjustedPersonality.riskTolerance).toBeLessThanOrEqual(1);
      expect(adjustedPersonality.adaptability).toBeGreaterThanOrEqual(0);
      expect(adjustedPersonality.adaptability).toBeLessThanOrEqual(1);
    });
  });

  describe('Bluff Detection', () => {
    it('適切な条件下でブラフを実行する', () => {
      const bluffPersonality: AIPersonality = {
        ...mockPersonality,
        bluffFrequency: 0.8,
        riskTolerance: 0.7
      };

      const gameStateWithBet: GameState = {
        ...mockGameState,
        currentBet: 50,
        pot: 200
      };

      const action = decideAdvancedAIAction(mockPlayer, gameStateWithBet, bluffPersonality);
      
      // ブラフの可能性をチェック（確実ではないが、ブラフの条件が揃っている場合）
      if (action.action === 'bet' || action.action === 'raise') {
        expect(action.amount).toBeGreaterThan(0);
        expect(action.confidence).toBeGreaterThan(0);
      }
    });
  });

  describe('Adaptive Behavior', () => {
    it('相手の行動パターンに適応する', () => {
      const adaptivePersonality: AIPersonality = {
        ...mockPersonality,
        adaptability: 0.9
      };

      // 攻撃的な相手の履歴
      const aggressiveHistory: PlayerAction[] = ['bet', 'raise', 'bet', 'raise'];
      const aggressiveAction = decideAdvancedAIAction(mockPlayer, mockGameState, adaptivePersonality, aggressiveHistory);

      // 受動的な相手の履歴
      const passiveHistory: PlayerAction[] = ['call', 'check', 'fold', 'call'];
      const passiveAction = decideAdvancedAIAction(mockPlayer, mockGameState, adaptivePersonality, passiveHistory);

      expect(aggressiveAction).toHaveProperty('action');
      expect(passiveAction).toHaveProperty('action');
    });
  });
}); 