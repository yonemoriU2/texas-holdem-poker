import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  decideAIAction,
  evaluateHandStrength,
  simulateThinkingTime,
  getAIPersonality
} from '../aiLogic';
import type { Player, GameState } from '../../types';

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

describe('AI Logic', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('evaluateHandStrength', () => {
    it('プリフロップで強いハンドを正しく評価する', () => {
      const strongPlayer: Player = {
        ...mockPlayer,
        holeCards: [
          { rank: 'A', suit: 'hearts', id: 'A-hearts' },
          { rank: 'A', suit: 'diamonds', id: 'A-diamonds' }
        ]
      };

      const strength = evaluateHandStrength(strongPlayer, mockGameState);
      expect(strength).toBeGreaterThan(0.9);
    });

    it('プリフロップで弱いハンドを正しく評価する', () => {
      const weakPlayer: Player = {
        ...mockPlayer,
        holeCards: [
          { rank: '2', suit: 'hearts', id: '2-hearts' },
          { rank: '7', suit: 'clubs', id: '7-clubs' }
        ]
      };

      const strength = evaluateHandStrength(weakPlayer, mockGameState);
      expect(strength).toBeLessThan(0.3);
    });

    it('フロップ以降でハンド強度を正しく評価する', () => {
      const gameStateWithCommunity: GameState = {
        ...mockGameState,
        communityCards: [
          { rank: 'A', suit: 'spades', id: 'A-spades' },
          { rank: 'K', suit: 'diamonds', id: 'K-diamonds' },
          { rank: 'Q', suit: 'clubs', id: 'Q-clubs' }
        ]
      };

      const strength = evaluateHandStrength(mockPlayer, gameStateWithCommunity);
      expect(strength).toBeGreaterThan(0);
      expect(strength).toBeLessThanOrEqual(1);
    });
  });

  describe('decideAIAction', () => {
    it('非同期でAIアクションを決定する', async () => {
      const action = await decideAIAction(mockPlayer, mockGameState, 100);
      
      expect(action).toHaveProperty('action');
      expect(action).toHaveProperty('confidence');
      expect(action).toHaveProperty('reasoning');
      expect(typeof action.action).toBe('string');
      expect(action.confidence).toBeGreaterThan(0);
      expect(action.confidence).toBeLessThanOrEqual(1);
    });

    it('思考時間を正しく適用する', async () => {
      const startTime = Date.now();
      await decideAIAction(mockPlayer, mockGameState, 200);
      const endTime = Date.now();
      
      expect(endTime - startTime).toBeGreaterThanOrEqual(200);
    });
  });

  describe('simulateThinkingTime', () => {
    it('基本思考時間を返す', () => {
      const time = simulateThinkingTime(1000, 0);
      expect(time).toBe(1000);
    });

    it('分散を含む思考時間を返す', () => {
      const baseTime = 1000;
      const variance = 500;
      const time = simulateThinkingTime(baseTime, variance);
      
      expect(time).toBeGreaterThanOrEqual(baseTime - variance);
      expect(time).toBeLessThanOrEqual(baseTime + variance);
    });

    it('最小思考時間を保証する', () => {
      const time = simulateThinkingTime(100, 1000);
      expect(time).toBeGreaterThanOrEqual(200);
    });
  });

  describe('getAIPersonality', () => {
    it('有効なパーソナリティを返す', () => {
      const personality = getAIPersonality();
      
      expect(personality).toHaveProperty('aggressionLevel');
      expect(personality).toHaveProperty('bluffFrequency');
      expect(personality).toHaveProperty('patienceLevel');
      
      expect(personality.aggressionLevel).toBeGreaterThanOrEqual(0.2);
      expect(personality.aggressionLevel).toBeLessThanOrEqual(0.8);
      expect(personality.bluffFrequency).toBeGreaterThanOrEqual(0.1);
      expect(personality.bluffFrequency).toBeLessThanOrEqual(0.5);
      expect(personality.patienceLevel).toBeGreaterThanOrEqual(0.3);
      expect(personality.patienceLevel).toBeLessThanOrEqual(0.8);
    });
  });

  describe('AI Action Logic', () => {
    it('強いハンドで積極的な行動を選択する', async () => {
      const strongPlayer: Player = {
        ...mockPlayer,
        holeCards: [
          { rank: 'A', suit: 'hearts', id: 'A-hearts' },
          { rank: 'A', suit: 'diamonds', id: 'A-diamonds' }
        ]
      };

      const action = await decideAIAction(strongPlayer, mockGameState, 100);
      
      // 強いハンドではフォールドしない
      expect(action.action).not.toBe('fold');
      expect(action.confidence).toBeGreaterThan(0.6);
    });

    it('弱いハンドで保守的な行動を選択する', async () => {
      const weakPlayer: Player = {
        ...mockPlayer,
        holeCards: [
          { rank: '2', suit: 'hearts', id: '2-hearts' },
          { rank: '7', suit: 'clubs', id: '7-clubs' }
        ]
      };

      const action = await decideAIAction(weakPlayer, mockGameState, 100);
      
      // 弱いハンドではフォールドする可能性が高い
      expect(['fold', 'call', 'check']).toContain(action.action);
    });

    it('ベット/レイズ時に適切な金額を設定する', async () => {
      const gameStateWithBet: GameState = {
        ...mockGameState,
        currentBet: 50,
        pot: 200
      };

      const action = await decideAIAction(mockPlayer, gameStateWithBet, 100);
      
      if (action.action === 'bet' || action.action === 'raise') {
        expect(action.amount).toBeGreaterThan(0);
        expect(action.amount).toBeLessThanOrEqual(mockPlayer.chips);
      }
    });
  });
}); 