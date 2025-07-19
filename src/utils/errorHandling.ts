import type { GameState, Player, Card, GamePhase } from '../types';
import type { HandRank } from '../types/card';

/**
 * エラーの種類を定義
 */
export const ErrorType = {
  INVALID_GAME_STATE: 'INVALID_GAME_STATE',
  INVALID_PLAYER_ACTION: 'INVALID_PLAYER_ACTION',
  INVALID_BET_AMOUNT: 'INVALID_BET_AMOUNT',
  INVALID_CARD_DISTRIBUTION: 'INVALID_CARD_DISTRIBUTION',
  INVALID_PHASE_TRANSITION: 'INVALID_PHASE_TRANSITION',
  INSUFFICIENT_CHIPS: 'INSUFFICIENT_CHIPS',
  UNEXPECTED_ERROR: 'UNEXPECTED_ERROR'
} as const;

export type ErrorType = typeof ErrorType[keyof typeof ErrorType];

/**
 * エラー情報の型定義
 */
export interface GameError {
  type: ErrorType;
  message: string;
  details?: any;
  timestamp: number;
  recoverable: boolean;
}

/**
 * バリデーション結果の型定義
 */
export interface ValidationResult {
  isValid: boolean;
  errors: GameError[];
  warnings: string[];
}

/**
 * ゲーム状態の整合性を検証する
 */
export function validateGameState(state: GameState): ValidationResult {
  const errors: GameError[] = [];
  const warnings: string[] = [];

  // プレイヤーの検証
  if (state.players.length !== 2) {
    errors.push({
      type: ErrorType.INVALID_GAME_STATE,
      message: 'プレイヤー数が不正です',
      details: { expected: 2, actual: state.players.length },
      timestamp: Date.now(),
      recoverable: false
    });
  }

  // 各プレイヤーの検証
  state.players.forEach((player, index) => {
    const playerErrors = validatePlayer(player, index);
    errors.push(...playerErrors);
  });

  // コミュニティカードの検証
  const communityCardErrors = validateCommunityCards(state.communityCards, state.gamePhase);
  errors.push(...communityCardErrors);

  // ポットとベット額の検証
  const potErrors = validatePotAndBets(state);
  errors.push(...potErrors);

  // フェーズの検証
  const phaseErrors = validateGamePhase(state);
  errors.push(...phaseErrors);

  // デッキの検証
  const deckErrors = validateDeck(state.deck);
  errors.push(...deckErrors);

  // 警告の追加
  if (state.pot > 0 && !state.isGameActive) {
    warnings.push('ゲームが非アクティブな状態でポットが残っています');
  }

  if (state.players.some(p => p.chips < 0)) {
    warnings.push('プレイヤーのチップ数が負の値になっています');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * プレイヤーの状態を検証する
 */
function validatePlayer(player: Player, index: number): GameError[] {
  const errors: GameError[] = [];

  // チップ数の検証
  if (player.chips < 0) {
    errors.push({
      type: ErrorType.INVALID_GAME_STATE,
      message: `プレイヤー${index + 1}のチップ数が負の値です`,
      details: { playerId: player.id, chips: player.chips },
      timestamp: Date.now(),
      recoverable: true
    });
  }

  // ベット額の検証
  if (player.currentBet < 0) {
    errors.push({
      type: ErrorType.INVALID_GAME_STATE,
      message: `プレイヤー${index + 1}のベット額が負の値です`,
      details: { playerId: player.id, currentBet: player.currentBet },
      timestamp: Date.now(),
      recoverable: true
    });
  }

  // ホールカードの検証
  if (player.holeCards.length > 2) {
    errors.push({
      type: ErrorType.INVALID_CARD_DISTRIBUTION,
      message: `プレイヤー${index + 1}のホールカードが多すぎます`,
      details: { playerId: player.id, cardCount: player.holeCards.length },
      timestamp: Date.now(),
      recoverable: true
    });
  }

  // 矛盾する状態の検証
  if (player.hasFolded && player.isAllIn) {
    errors.push({
      type: ErrorType.INVALID_GAME_STATE,
      message: `プレイヤー${index + 1}がフォールドとオールインの両方の状態です`,
      details: { playerId: player.id },
      timestamp: Date.now(),
      recoverable: true
    });
  }

  return errors;
}

/**
 * コミュニティカードを検証する
 */
function validateCommunityCards(cards: Card[], phase: GamePhase): GameError[] {
  const errors: GameError[] = [];

  const expectedCardCounts = {
    preflop: 0,
    flop: 3,
    turn: 4,
    river: 5,
    showdown: 5,
    ended: 5
  };

  const expectedCount = expectedCardCounts[phase];
  if (cards.length !== expectedCount) {
    errors.push({
      type: ErrorType.INVALID_CARD_DISTRIBUTION,
      message: `フェーズ${phase}でコミュニティカード数が不正です`,
      details: { phase, expected: expectedCount, actual: cards.length },
      timestamp: Date.now(),
      recoverable: true
    });
  }

  // 重複カードの検証
  const cardIds = cards.map(card => `${card.suit}-${card.rank}`);
  const uniqueIds = new Set(cardIds);
  if (cardIds.length !== uniqueIds.size) {
    errors.push({
      type: ErrorType.INVALID_CARD_DISTRIBUTION,
      message: 'コミュニティカードに重複があります',
      details: { cards },
      timestamp: Date.now(),
      recoverable: true
    });
  }

  return errors;
}

/**
 * ポットとベット額を検証する
 */
function validatePotAndBets(state: GameState): GameError[] {
  const errors: GameError[] = [];

  // ポット額の検証
  if (state.pot < 0) {
    errors.push({
      type: ErrorType.INVALID_GAME_STATE,
      message: 'ポット額が負の値です',
      details: { pot: state.pot },
      timestamp: Date.now(),
      recoverable: true
    });
  }

  // 現在のベット額の検証
  if (state.currentBet < 0) {
    errors.push({
      type: ErrorType.INVALID_GAME_STATE,
      message: '現在のベット額が負の値です',
      details: { currentBet: state.currentBet },
      timestamp: Date.now(),
      recoverable: true
    });
  }

  // プレイヤーのベット額とポットの整合性
  const totalBets = state.players.reduce((sum, player) => sum + player.currentBet, 0);
  if (Math.abs(totalBets - state.pot) > 0.01) { // 浮動小数点誤差を考慮
    errors.push({
      type: ErrorType.INVALID_GAME_STATE,
      message: 'プレイヤーのベット額とポット額が一致しません',
      details: { totalBets, pot: state.pot },
      timestamp: Date.now(),
      recoverable: true
    });
  }

  return errors;
}

/**
 * ゲームフェーズを検証する
 */
function validateGamePhase(state: GameState): GameError[] {
  const errors: GameError[] = [];

  // アクティブプレイヤーインデックスの検証
  if (state.activePlayerIndex < 0 || state.activePlayerIndex >= state.players.length) {
    errors.push({
      type: ErrorType.INVALID_GAME_STATE,
      message: 'アクティブプレイヤーインデックスが不正です',
      details: { activePlayerIndex: state.activePlayerIndex, playerCount: state.players.length },
      timestamp: Date.now(),
      recoverable: true
    });
  }

  // ディーラーインデックスの検証
  if (state.dealerIndex < 0 || state.dealerIndex >= state.players.length) {
    errors.push({
      type: ErrorType.INVALID_GAME_STATE,
      message: 'ディーラーインデックスが不正です',
      details: { dealerIndex: state.dealerIndex, playerCount: state.players.length },
      timestamp: Date.now(),
      recoverable: true
    });
  }

  return errors;
}

/**
 * デッキを検証する
 */
function validateDeck(deck: Card[]): GameError[] {
  const errors: GameError[] = [];

  // デッキサイズの検証
  if (deck.length > 52) {
    errors.push({
      type: ErrorType.INVALID_CARD_DISTRIBUTION,
      message: 'デッキのカード数が多すぎます',
      details: { deckSize: deck.length },
      timestamp: Date.now(),
      recoverable: true
    });
  }

  // 重複カードの検証
  const cardIds = deck.map(card => `${card.suit}-${card.rank}`);
  const uniqueIds = new Set(cardIds);
  if (cardIds.length !== uniqueIds.size) {
    errors.push({
      type: ErrorType.INVALID_CARD_DISTRIBUTION,
      message: 'デッキに重複カードがあります',
      details: { deckSize: deck.length, uniqueCards: uniqueIds.size },
      timestamp: Date.now(),
      recoverable: true
    });
  }

  return errors;
}

/**
 * ゲーム状態を修復する
 */
export function repairGameState(state: GameState): GameState {
  const repairedState = { ...state };

  // プレイヤーの修復
  repairedState.players = state.players.map(player => ({
    ...player,
    chips: Math.max(0, player.chips),
    currentBet: Math.max(0, player.currentBet),
    holeCards: player.holeCards.slice(0, 2), // 最大2枚まで
    hasFolded: player.hasFolded && !player.isAllIn // 矛盾する状態を修正
  }));

  // ポットとベット額の修復
  repairedState.pot = Math.max(0, state.pot);
  repairedState.currentBet = Math.max(0, state.currentBet);

  // インデックスの修復
  repairedState.activePlayerIndex = Math.max(0, Math.min(state.activePlayerIndex, state.players.length - 1));
  repairedState.dealerIndex = Math.max(0, Math.min(state.dealerIndex, state.players.length - 1));

  // コミュニティカードの修復
  const expectedCardCounts = {
    preflop: 0,
    flop: 3,
    turn: 4,
    river: 5,
    showdown: 5,
    ended: 5
  };
  const expectedCount = expectedCardCounts[state.gamePhase];
  repairedState.communityCards = state.communityCards.slice(0, expectedCount);

  return repairedState;
}

/**
 * エラーをログに記録する
 */
export function logError(error: GameError): void {
  console.error('Game Error:', {
    type: error.type,
    message: error.message,
    details: error.details,
    timestamp: new Date(error.timestamp).toISOString(),
    recoverable: error.recoverable
  });
}

/**
 * エラーメッセージをユーザーフレンドリーに変換する
 */
export function getUserFriendlyErrorMessage(error: GameError): string {
  const messages: Record<ErrorType, string> = {
    [ErrorType.INVALID_GAME_STATE]: 'ゲーム状態に問題が発生しました',
    [ErrorType.INVALID_PLAYER_ACTION]: '無効なプレイヤーアクションです',
    [ErrorType.INVALID_BET_AMOUNT]: '無効なベット額です',
    [ErrorType.INVALID_CARD_DISTRIBUTION]: 'カードの配布に問題があります',
    [ErrorType.INVALID_PHASE_TRANSITION]: 'フェーズ遷移に問題があります',
    [ErrorType.INSUFFICIENT_CHIPS]: 'チップが不足しています',
    [ErrorType.UNEXPECTED_ERROR]: '予期しないエラーが発生しました'
  };

  return messages[error.type] || 'エラーが発生しました';
}

/**
 * エラーが回復可能かどうかを判定する
 */
export function isErrorRecoverable(error: GameError): boolean {
  return error.recoverable;
}

/**
 * エラーの重要度を判定する
 */
export function getErrorSeverity(error: GameError): 'low' | 'medium' | 'high' | 'critical' {
  switch (error.type) {
    case ErrorType.INVALID_GAME_STATE:
      return 'high';
    case ErrorType.INVALID_CARD_DISTRIBUTION:
      return 'high';
    case ErrorType.INVALID_PLAYER_ACTION:
      return 'medium';
    case ErrorType.INVALID_BET_AMOUNT:
      return 'medium';
    case ErrorType.INSUFFICIENT_CHIPS:
      return 'low';
    case ErrorType.INVALID_PHASE_TRANSITION:
      return 'medium';
    case ErrorType.UNEXPECTED_ERROR:
      return 'critical';
    default:
      return 'medium';
  }
} 