import { describe, it, expect } from 'vitest';
import {
  calculateActionOptions,
  validateBetAmount,
  calculatePotOdds,
  getPresetBetAmounts
} from '../bettingUtils';
import type { Player, GameState } from '../../types';

describe('bettingUtils', () => {
  const mockPlayer: Player = {
    id: 'player1',
    name: 'Player',
    chips: 1000,
    holeCards: [],
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

  describe('calculateActionOptions', () => {
    it('ベット可能な状況でアクションオプションを計算', () => {
      const options = calculateActionOptions(mockPlayer, mockGameState);
      
      expect(options).toHaveLength(4);
      expect(options[0]).toEqual({
        type: 'fold',
        label: 'フォールド',
        enabled: true
      });
      expect(options[1]).toEqual({
        type: 'check',
        label: 'チェック',
        enabled: true
      });
      expect(options[2]).toEqual({
        type: 'bet',
        label: 'ベット',
        minAmount: 1,
        maxAmount: 1000,
        enabled: true
      });
      expect(options[3]).toEqual({
        type: 'all-in',
        label: 'オールイン $1000',
        amount: 1000,
        enabled: true
      });
    });

    it('コールが必要な状況でアクションオプションを計算', () => {
      const gameStateWithBet = {
        ...mockGameState,
        currentBet: 50
      };
      const playerWithBet = {
        ...mockPlayer,
        currentBet: 20
      };

      const options = calculateActionOptions(playerWithBet, gameStateWithBet);
      
      expect(options[1]).toEqual({
        type: 'call',
        label: 'コール $30',
        amount: 30,
        enabled: true
      });
    });

    it('レイズ可能な状況でアクションオプションを計算', () => {
      const gameStateWithBet = {
        ...mockGameState,
        currentBet: 50
      };

      const options = calculateActionOptions(mockPlayer, gameStateWithBet);
      
      expect(options[2]).toEqual({
        type: 'raise',
        label: 'レイズ',
        minAmount: 100,
        maxAmount: 1000,
        enabled: true
      });
    });

    it('チップ不足のプレイヤーのアクションオプションを計算', () => {
      const poorPlayer = {
        ...mockPlayer,
        chips: 5
      };
      const gameStateWithBet = {
        ...mockGameState,
        currentBet: 50
      };

      const options = calculateActionOptions(poorPlayer, gameStateWithBet);
      
      expect(options[1].enabled).toBe(false); // コール不可
      expect(options[2].enabled).toBe(false); // レイズ不可
      expect(options[3].enabled).toBe(true);  // オールイン可能
    });
  });

  describe('validateBetAmount', () => {
    it('有効なベット額を検証', () => {
      const result = validateBetAmount(100, 'bet', mockPlayer, mockGameState);
      expect(result.isValid).toBe(true);
    });

    it('無効なベット額を検証（負の値）', () => {
      const result = validateBetAmount(-10, 'bet', mockPlayer, mockGameState);
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('ベット額は0以上である必要があります');
    });

    it('無効なベット額を検証（チップ超過）', () => {
      const result = validateBetAmount(1500, 'bet', mockPlayer, mockGameState);
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('ベット額は所持チップを超えることはできません');
    });

    it('レイズ額の検証（最小額未満）', () => {
      const gameStateWithBet = {
        ...mockGameState,
        currentBet: 50
      };
      const result = validateBetAmount(75, 'raise', mockPlayer, gameStateWithBet);
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('レイズ額は現在のベット額の2倍以上である必要があります');
    });

    it('コール額の検証（不正な額）', () => {
      const gameStateWithBet = {
        ...mockGameState,
        currentBet: 50
      };
      const playerWithBet = {
        ...mockPlayer,
        currentBet: 20
      };
      const result = validateBetAmount(25, 'call', playerWithBet, gameStateWithBet);
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('コール額が正しくありません');
    });
  });

  describe('calculatePotOdds', () => {
    it('ポットオッズを計算', () => {
      const odds = calculatePotOdds(20, 100);
      expect(odds).toBe(5);
    });

    it('コール額が0の場合のポットオッズ', () => {
      const odds = calculatePotOdds(0, 100);
      expect(odds).toBe(0);
    });
  });

  describe('getPresetBetAmounts', () => {
    it('プリセットベット額を計算', () => {
      const amounts = getPresetBetAmounts(100, 1000);
      expect(amounts).toEqual({
        quarter: 25,
        half: 50,
        pot: 100
      });
    });

    it('最大ベット額を超える場合の制限', () => {
      const amounts = getPresetBetAmounts(1000, 100);
      expect(amounts).toEqual({
        quarter: 100,
        half: 100,
        pot: 100
      });
    });
  });
}); 