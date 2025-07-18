import type { Player, PlayerAction, ActionOption } from '../types/player';
import type { GameState } from '../types/game';

export function calculateActionOptions(
  player: Player,
  gameState: GameState
): ActionOption[] {
  const options: ActionOption[] = [];
  const currentBet = gameState.currentBet;
  const playerBet = player.currentBet;
  const callAmount = currentBet - playerBet;
  const minRaise = currentBet * 2;
  const maxBet = player.chips;

  // フォールド - 常に可能
  options.push({
    type: 'fold',
    label: 'フォールド',
    enabled: true
  });

  // チェック/コール
  if (callAmount === 0) {
    options.push({
      type: 'check',
      label: 'チェック',
      enabled: true
    });
  } else {
    options.push({
      type: 'call',
      label: `コール $${callAmount}`,
      amount: callAmount,
      enabled: callAmount <= maxBet
    });
  }

  // ベット/レイズ
  if (currentBet === 0) {
    // ベット可能
    options.push({
      type: 'bet',
      label: 'ベット',
      minAmount: 1,
      maxAmount: maxBet,
      enabled: maxBet > 0
    });
  } else {
    // レイズ可能
    options.push({
      type: 'raise',
      label: 'レイズ',
      minAmount: minRaise,
      maxAmount: maxBet,
      enabled: maxBet >= minRaise
    });
  }

  // オールイン
  options.push({
    type: 'all-in',
    label: `オールイン $${maxBet}`,
    amount: maxBet,
    enabled: maxBet > 0
  });

  return options;
}

export function validateBetAmount(
  amount: number,
  action: PlayerAction,
  player: Player,
  gameState: GameState
): { isValid: boolean; error?: string } {
  const currentBet = gameState.currentBet;
  const playerBet = player.currentBet;
  const maxBet = player.chips;

  if (amount < 0) {
    return { isValid: false, error: 'ベット額は0以上である必要があります' };
  }

  if (amount > maxBet) {
    return { isValid: false, error: 'ベット額は所持チップを超えることはできません' };
  }

  switch (action) {
    case 'bet':
      if (currentBet > 0) {
        return { isValid: false, error: '現在のラウンドではベットできません' };
      }
      if (amount === 0) {
        return { isValid: false, error: 'ベット額は1以上である必要があります' };
      }
      break;

    case 'raise':
      if (amount <= currentBet) {
        return { isValid: false, error: 'レイズ額は現在のベット額を超える必要があります' };
      }
      if (amount < currentBet * 2) {
        return { isValid: false, error: 'レイズ額は現在のベット額の2倍以上である必要があります' };
      }
      break;

    case 'call':
      const callAmount = currentBet - playerBet;
      if (amount !== callAmount) {
        return { isValid: false, error: 'コール額が正しくありません' };
      }
      break;

    case 'all-in':
      if (amount !== maxBet) {
        return { isValid: false, error: 'オールイン額が正しくありません' };
      }
      break;
  }

  return { isValid: true };
}

export function calculatePotOdds(
  callAmount: number,
  potSize: number
): number {
  if (callAmount === 0) return 0;
  return potSize / callAmount;
}

export function getPresetBetAmounts(potSize: number, maxBet: number): {
  quarter: number;
  half: number;
  pot: number;
} {
  return {
    quarter: Math.min(Math.floor(potSize * 0.25), maxBet),
    half: Math.min(Math.floor(potSize * 0.5), maxBet),
    pot: Math.min(potSize, maxBet)
  };
} 