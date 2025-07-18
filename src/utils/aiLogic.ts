import type { Player, PlayerAction, ActionOption } from '../types/player';
import type { GameState } from '../types/game';
import { evaluateHand, getHandStrength } from './handEvaluator';
import { calculateActionOptions, calculatePotOdds } from './bettingUtils';

export interface AIAction {
  action: PlayerAction;
  amount?: number;
  confidence: number;
  reasoning: string;
}

export interface AIState {
  handStrength: number;
  potOdds: number;
  position: 'early' | 'middle' | 'late';
  stackToPotRatio: number;
  aggressionLevel: number;
}

export interface AIPersonality {
  aggressionLevel: number;
  bluffFrequency: number;
  patienceLevel: number;
  riskTolerance: number;
  adaptability: number;
}

/**
 * AIプレイヤーの行動を決定する（同期的）
 */
export function decideAIActionSync(player: Player, gameState: GameState): AIAction {
  return calculateAIAction(player, gameState);
}

/**
 * AIプレイヤーの行動を決定する（非同期）
 */
export function decideAIAction(
  player: Player,
  gameState: GameState,
  thinkingTimeMs: number = 1000
): Promise<AIAction> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const action = calculateAIAction(player, gameState);
      resolve(action);
    }, thinkingTimeMs);
  });
}

/**
 * AIの行動を計算する
 */
function calculateAIAction(player: Player, gameState: GameState): AIAction {
  const aiState = analyzeGameState(player, gameState);
  const actionOptions = calculateActionOptions(player, gameState);
  
  // ハンド強度を評価
  const handStrength = evaluateHandStrength(player, gameState);
  
  // 基本戦略に基づいて行動を決定
  const action = determineActionByStrategy(handStrength, aiState, actionOptions);
  
  return action;
}

/**
 * ゲーム状態を分析してAIの状態を決定
 */
function analyzeGameState(player: Player, gameState: GameState): AIState {
  const potOdds = calculatePotOdds(
    gameState.currentBet - player.currentBet,
    gameState.pot
  );
  
  const stackToPotRatio = player.chips / gameState.pot;
  
  // ポジションを決定（簡易版）
  const position = determinePosition(player, gameState);
  
  // アグレッション度を決定（ランダム要素を含む）
  const aggressionLevel = Math.random() * 0.4 + 0.3; // 0.3-0.7の範囲
  
  return {
    handStrength: 0, // 後で計算
    potOdds,
    position,
    stackToPotRatio,
    aggressionLevel
  };
}

/**
 * プレイヤーのポジションを決定
 */
function determinePosition(player: Player, gameState: GameState): 'early' | 'middle' | 'late' {
  const playerIndex = gameState.players.findIndex(p => p.id === player.id);
  const dealerIndex = gameState.dealerIndex;
  const totalPlayers = gameState.players.length;
  
  // ディーラーからの相対位置を計算
  let relativePosition = (playerIndex - dealerIndex + totalPlayers) % totalPlayers;
  
  if (relativePosition <= 1) return 'early';
  if (relativePosition <= 2) return 'middle';
  return 'late';
}

/**
 * ハンド強度を評価
 */
export function evaluateHandStrength(player: Player, gameState: GameState): number {
  const allCards = [...player.holeCards, ...gameState.communityCards];
  
  if (allCards.length < 5) {
    // プリフロップまたは不完全なコミュニティカード
    return evaluatePreflopStrength(player.holeCards);
  }
  
  // 完全なハンドを評価
  const handRank = evaluateHand(allCards);
  // スコアを0-1の範囲に正規化
  const maxScore = 10 * Math.pow(15, 5) + 14 * Math.pow(15, 4) + 14 * Math.pow(15, 3) + 14 * Math.pow(15, 2) + 14 * Math.pow(15, 1) + 14;
  return Math.min(1, getHandStrength(handRank) / maxScore);
}

/**
 * プリフロップ強度を評価
 */
function evaluatePreflopStrength(holeCards: any[]): number {
  if (holeCards.length !== 2) return 0;
  
  const [card1, card2] = holeCards;
  const rank1 = getRankValue(card1.rank);
  const rank2 = getRankValue(card2.rank);
  const isSuited = card1.suit === card2.suit;
  
  // ペア
  if (rank1 === rank2) {
    if (rank1 >= 14) return 0.95; // AA
    if (rank1 >= 12) return 0.85; // KK, QQ
    if (rank1 >= 10) return 0.75; // JJ, TT
    if (rank1 >= 8) return 0.65;  // 99, 88
    if (rank1 >= 6) return 0.55;  // 77, 66
    return 0.45; // 55以下
  }
  
  // ハイカード
  const maxRank = Math.max(rank1, rank2);
  const minRank = Math.min(rank1, rank2);
  
  if (maxRank >= 14) { // Ace
    if (minRank >= 10) return isSuited ? 0.8 : 0.7; // AK, AQ, AJ, AT
    if (minRank >= 8) return isSuited ? 0.7 : 0.6;  // A9, A8
    return isSuited ? 0.6 : 0.5; // A7以下
  }
  
  if (maxRank >= 12) { // King
    if (minRank >= 10) return isSuited ? 0.7 : 0.6; // KQ, KJ
    if (minRank >= 8) return isSuited ? 0.6 : 0.5;  // K9, K8
    return isSuited ? 0.5 : 0.4; // K7以下
  }
  
  if (maxRank >= 10) { // Queen
    if (minRank >= 8) return isSuited ? 0.6 : 0.5;  // QJ, Q9
    return isSuited ? 0.5 : 0.4; // Q8以下
  }
  
  // その他の組み合わせ
  const rankDiff = maxRank - minRank;
  if (rankDiff <= 2) return isSuited ? 0.4 : 0.3; // 連続または近いランク
  return isSuited ? 0.3 : 0.2; // その他
}

/**
 * ランクの数値を取得
 */
function getRankValue(rank: string): number {
  const rankValues: { [key: string]: number } = {
    '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8, '9': 9,
    '10': 10, 'J': 11, 'Q': 12, 'K': 13, 'A': 14
  };
  return rankValues[rank] || 0;
}

/**
 * 戦略に基づいて行動を決定
 */
function determineActionByStrategy(
  handStrength: number,
  aiState: AIState,
  actionOptions: ActionOption[]
): AIAction {
  const { potOdds, position, stackToPotRatio, aggressionLevel } = aiState;
  
  // フォールド判定
  if (shouldFold(handStrength, potOdds, position, stackToPotRatio)) {
    return {
      action: 'fold',
      confidence: 0.8,
      reasoning: `ハンド強度(${handStrength.toFixed(2)})が低く、ポットオッズ(${potOdds.toFixed(2)})が不利なためフォールド`
    };
  }
  
  // オールイン判定
  if (shouldAllIn(handStrength, stackToPotRatio, aggressionLevel)) {
    const allInOption = actionOptions.find(opt => opt.type === 'all-in');
    if (allInOption?.enabled) {
      return {
        action: 'all-in',
        amount: allInOption.amount,
        confidence: 0.9,
        reasoning: `ハンド強度(${handStrength.toFixed(2)})が高く、オールインでポットを狙う`
      };
    }
  }
  
  // ベット/レイズ判定
  if (shouldBetOrRaise(handStrength, position, aggressionLevel)) {
    const betOption = actionOptions.find(opt => opt.type === 'bet' || opt.type === 'raise');
    if (betOption?.enabled) {
      const amount = calculateBetAmount(handStrength, aiState, betOption);
      return {
        action: betOption.type,
        amount,
        confidence: 0.7,
        reasoning: `ハンド強度(${handStrength.toFixed(2)})に基づいて${betOption.type}`
      };
    }
  }
  
  // デフォルトはコール/チェック
  const callOption = actionOptions.find(opt => opt.type === 'call' || opt.type === 'check');
  if (callOption?.enabled) {
    return {
      action: callOption.type,
      amount: callOption.amount,
      confidence: 0.6,
      reasoning: `ハンド強度(${handStrength.toFixed(2)})でコール/チェック`
    };
  }
  
  // 最後の手段としてフォールド
  return {
    action: 'fold',
    confidence: 0.5,
    reasoning: '他の選択肢がないためフォールド'
  };
}

/**
 * フォールドすべきか判定
 */
function shouldFold(
  handStrength: number,
  potOdds: number,
  position: string,
  stackToPotRatio: number
): boolean {
  // ハンド強度が非常に低い場合
  if (handStrength < 0.2) return true;
  
  // ポットオッズが非常に不利な場合
  if (potOdds < 0.1 && handStrength < 0.4) return true;
  
  // 早期ポジションで弱いハンド
  if (position === 'early' && handStrength < 0.3) return true;
  
  // スタックが小さい場合の厳しい判定
  if (stackToPotRatio < 0.5 && handStrength < 0.5) return true;
  
  return false;
}

/**
 * オールインすべきか判定
 */
function shouldAllIn(
  handStrength: number,
  stackToPotRatio: number,
  aggressionLevel: number
): boolean {
  // 非常に強いハンド
  if (handStrength > 0.9) return true;
  
  // スタックが小さい場合のプッシュ判定
  if (stackToPotRatio < 0.3 && handStrength > 0.6) return true;
  
  // アグレッション度が高い場合
  if (aggressionLevel > 0.6 && handStrength > 0.7) return true;
  
  return false;
}

/**
 * ベット/レイズすべきか判定
 */
function shouldBetOrRaise(
  handStrength: number,
  position: string,
  aggressionLevel: number
): boolean {
  // 強いハンド
  if (handStrength > 0.7) return true;
  
  // 後期ポジションでのブラフ
  if (position === 'late' && handStrength > 0.4 && aggressionLevel > 0.5) return true;
  
  // アグレッション度が高い場合
  if (aggressionLevel > 0.6 && handStrength > 0.5) return true;
  
  return false;
}

/**
 * ベット額を計算
 */
function calculateBetAmount(
  handStrength: number,
  aiState: AIState,
  betOption: ActionOption
): number {
  const { minAmount = 0, maxAmount = 0 } = betOption;
  
  if (maxAmount === 0) return minAmount;
  
  // ハンド強度に基づいてベットサイズを決定
  let betRatio = handStrength * 0.8 + 0.2; // 0.2-1.0の範囲
  
  // アグレッション度で調整
  betRatio *= aiState.aggressionLevel;
  
  // ポジションによる調整
  if (aiState.position === 'late') betRatio *= 1.1;
  if (aiState.position === 'early') betRatio *= 0.9;
  
  const betAmount = Math.floor((maxAmount - minAmount) * betRatio + minAmount);
  
  return Math.max(minAmount, Math.min(maxAmount, betAmount));
}

/**
 * AIの思考時間をシミュレート
 */
export function simulateThinkingTime(
  baseTimeMs: number = 1000,
  varianceMs: number = 500
): number {
  const variance = (Math.random() - 0.5) * 2 * varianceMs;
  return Math.max(200, baseTimeMs + variance);
}

/**
 * AIの行動パターンを取得
 */
export function getAIPersonality(): AIPersonality {
  return {
    aggressionLevel: Math.random() * 0.6 + 0.2, // 0.2-0.8
    bluffFrequency: Math.random() * 0.4 + 0.1,  // 0.1-0.5
    patienceLevel: Math.random() * 0.5 + 0.3,    // 0.3-0.8
    riskTolerance: Math.random(), // 0-1
    adaptability: Math.random() // 0-1
  };
} 