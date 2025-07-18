import type { GameConfig } from '../types/game';

/**
 * ブラインドレベルに基づいてブラインド額を計算
 */
export function calculateBlinds(
  baseSmallBlind: number,
  baseBigBlind: number,
  blindLevel: number,
  multiplier: number
): { smallBlind: number; bigBlind: number } {
  const levelMultiplier = Math.pow(multiplier, blindLevel - 1);
  
  return {
    smallBlind: Math.floor(baseSmallBlind * levelMultiplier),
    bigBlind: Math.floor(baseBigBlind * levelMultiplier)
  };
}

/**
 * BBアンティ額を計算
 */
export function calculateBBAnte(
  baseBBAnte: number,
  _blindLevel: number,
  _multiplier: number
): number {
  return Math.floor(baseBBAnte); // 現在は基本額のみ
}

/**
 * 次のブラインド増加までのハンド数を計算
 */
export function calculateHandsUntilBlindIncrease(
  currentHand: number,
  _blindLevel: number,
  interval: number
): number {
  const handsInCurrentLevel = currentHand % interval;
  return interval - handsInCurrentLevel;
}

/**
 * ブラインド増加が必要かチェック
 */
export function shouldIncreaseBlinds(
  handNumber: number,
  blindIncreaseInterval: number
): boolean {
  return handNumber > 0 && handNumber % blindIncreaseInterval === 0;
}

/**
 * ブラインド増加時の処理
 */
export function increaseBlinds(
  currentSmallBlind: number,
  currentBigBlind: number,
  currentBBAnte: number,
  multiplier: number
): {
  smallBlind: number;
  bigBlind: number;
  bbAnte: number;
} {
  return {
    smallBlind: Math.floor(currentSmallBlind * multiplier),
    bigBlind: Math.floor(currentBigBlind * multiplier),
    bbAnte: Math.floor(currentBBAnte * multiplier)
  };
}

/**
 * ブラインド情報を取得
 */
export function getBlindInfo(
  config: GameConfig,
  blindLevel: number
): {
  smallBlind: number;
  bigBlind: number;
  bbAnte: number;
  totalAnte: number;
} {
  const blinds = calculateBlinds(
    config.smallBlind,
    config.bigBlind,
    blindLevel,
    config.blindIncreaseMultiplier
  );
  
  const bbAnte = calculateBBAnte(
    config.bbAnte,
    blindLevel,
    config.blindIncreaseMultiplier
  );
  
  return {
    ...blinds,
    bbAnte,
    totalAnte: bbAnte * 2 // 全プレイヤー分のアンティ
  };
} 