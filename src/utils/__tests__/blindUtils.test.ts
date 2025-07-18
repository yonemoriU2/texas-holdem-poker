import { describe, it, expect } from 'vitest';
import {
  calculateBlinds,
  calculateBBAnte,
  calculateHandsUntilBlindIncrease,
  shouldIncreaseBlinds,
  increaseBlinds,
  getBlindInfo
} from '../blindUtils';
import type { GameConfig } from '../../types/game';

describe('blindUtils', () => {
  const testConfig: GameConfig = {
    initialChips: 1000,
    smallBlind: 10,
    bigBlind: 20,
    bbAnte: 5,
    playerName: 'Player',
    cpuName: 'CPU',
    blindIncreaseInterval: 10,
    blindIncreaseMultiplier: 1.5
  };

  describe('calculateBlinds', () => {
    it('レベル1のブラインドを正しく計算する', () => {
      const result = calculateBlinds(10, 20, 1, 1.5);
      expect(result.smallBlind).toBe(10);
      expect(result.bigBlind).toBe(20);
    });

    it('レベル2のブラインドを正しく計算する', () => {
      const result = calculateBlinds(10, 20, 2, 1.5);
      expect(result.smallBlind).toBe(15);
      expect(result.bigBlind).toBe(30);
    });

    it('レベル3のブラインドを正しく計算する', () => {
      const result = calculateBlinds(10, 20, 3, 1.5);
      expect(result.smallBlind).toBe(22);
      expect(result.bigBlind).toBe(45);
    });
  });

  describe('calculateBBAnte', () => {
    it('レベル1のBBアンティを正しく計算する', () => {
      const result = calculateBBAnte(5, 1, 1.5);
      expect(result).toBe(5);
    });

    it('レベル2のBBアンティを正しく計算する', () => {
      const result = calculateBBAnte(5, 2, 1.5);
      expect(result).toBe(7);
    });

    it('レベル3のBBアンティを正しく計算する', () => {
      const result = calculateBBAnte(5, 3, 1.5);
      expect(result).toBe(11);
    });
  });

  describe('calculateHandsUntilBlindIncrease', () => {
    it('現在のハンドが1の場合、9ハンド後に増加', () => {
      const result = calculateHandsUntilBlindIncrease(1, 1, 10);
      expect(result).toBe(9);
    });

    it('現在のハンドが5の場合、5ハンド後に増加', () => {
      const result = calculateHandsUntilBlindIncrease(5, 1, 10);
      expect(result).toBe(5);
    });

    it('現在のハンドが10の場合、10ハンド後に増加', () => {
      const result = calculateHandsUntilBlindIncrease(10, 1, 10);
      expect(result).toBe(10);
    });
  });

  describe('shouldIncreaseBlinds', () => {
    it('ハンド数が10の倍数の場合、trueを返す', () => {
      expect(shouldIncreaseBlinds(10, 10)).toBe(true);
      expect(shouldIncreaseBlinds(20, 10)).toBe(true);
      expect(shouldIncreaseBlinds(30, 10)).toBe(true);
    });

    it('ハンド数が10の倍数でない場合、falseを返す', () => {
      expect(shouldIncreaseBlinds(5, 10)).toBe(false);
      expect(shouldIncreaseBlinds(15, 10)).toBe(false);
      expect(shouldIncreaseBlinds(25, 10)).toBe(false);
    });

    it('ハンド数が0の場合、falseを返す', () => {
      expect(shouldIncreaseBlinds(0, 10)).toBe(false);
    });
  });

  describe('increaseBlinds', () => {
    it('現在のブラインドを1.5倍に増加する', () => {
      const result = increaseBlinds(10, 20, 5, 1.5);
      expect(result.smallBlind).toBe(15);
      expect(result.bigBlind).toBe(30);
      expect(result.bbAnte).toBe(7);
    });

    it('現在のブラインドを2倍に増加する', () => {
      const result = increaseBlinds(10, 20, 5, 2);
      expect(result.smallBlind).toBe(20);
      expect(result.bigBlind).toBe(40);
      expect(result.bbAnte).toBe(10);
    });
  });

  describe('getBlindInfo', () => {
    it('レベル1のブラインド情報を正しく取得する', () => {
      const result = getBlindInfo(testConfig, 1);
      expect(result.smallBlind).toBe(10);
      expect(result.bigBlind).toBe(20);
      expect(result.bbAnte).toBe(5);
      expect(result.totalAnte).toBe(10);
    });

    it('レベル2のブラインド情報を正しく取得する', () => {
      const result = getBlindInfo(testConfig, 2);
      expect(result.smallBlind).toBe(15);
      expect(result.bigBlind).toBe(30);
      expect(result.bbAnte).toBe(7);
      expect(result.totalAnte).toBe(14);
    });

    it('レベル3のブラインド情報を正しく取得する', () => {
      const result = getBlindInfo(testConfig, 3);
      expect(result.smallBlind).toBe(22);
      expect(result.bigBlind).toBe(45);
      expect(result.bbAnte).toBe(11);
      expect(result.totalAnte).toBe(22);
    });
  });
}); 