import type { Player, PlayerAction } from '../types/player';
import type { GameState } from '../types/game';
import type { AIAction, AIState } from './aiLogic';
import { evaluateHandStrength } from './aiLogic';

export interface BluffStrategy {
  frequency: number;
  minHandStrength: number;
  maxHandStrength: number;
  preferredActions: PlayerAction[];
  timingFactors: {
    position: number;
    potSize: number;
    opponentBehavior: number;
  };
}

export interface AIPersonality {
  aggressionLevel: number;
  bluffFrequency: number;
  patienceLevel: number;
  riskTolerance: number;
  adaptability: number;
}

/**
 * 高度なAI行動を決定する
 */
export function decideAdvancedAIAction(
  player: Player,
  gameState: GameState,
  personality: AIPersonality,
  opponentHistory: PlayerAction[] = []
): AIAction {
  const aiState = analyzeAdvancedGameState(player, gameState, opponentHistory);
  const handStrength = evaluateHandStrength(player, gameState);
  
  // ブラフ判定
  if (shouldBluff(handStrength, aiState, personality)) {
    return createBluffAction(player, gameState, personality, aiState);
  }
  
  // 適応的行動判定
  if (shouldAdaptBehavior(aiState, personality, opponentHistory)) {
    return createAdaptiveAction(player, gameState, personality, aiState);
  }
  
  // 通常の戦略的判定
  return createStrategicAction(player, gameState, handStrength, personality, aiState);
}

/**
 * 高度なゲーム状態分析
 */
function analyzeAdvancedGameState(
  player: Player,
  gameState: GameState,
  opponentHistory: PlayerAction[]
): AIState & {
  opponentAggression: number;
  potOddsRatio: number;
  impliedOdds: number;
  foldEquity: number;
} {
  const baseState = {
    handStrength: 0,
    potOdds: 0,
    position: 'middle' as const,
    stackToPotRatio: player.chips / gameState.pot,
    aggressionLevel: 0.5
  };
  
  // 相手の攻撃性を分析
  const opponentAggression = analyzeOpponentAggression(opponentHistory);
  
  // ポットオッズ比率
  const potOddsRatio = calculatePotOddsRatio(player, gameState);
  
  // インプライドオッズ
  const impliedOdds = calculateImpliedOdds(player, gameState);
  
  // フォールドエクイティ
  const foldEquity = calculateFoldEquity(opponentAggression, gameState);
  
  return {
    ...baseState,
    opponentAggression,
    potOddsRatio,
    impliedOdds,
    foldEquity
  };
}

/**
 * 相手の攻撃性を分析
 */
function analyzeOpponentAggression(history: PlayerAction[]): number {
  if (history.length === 0) return 0.5;
  
  const aggressiveActions = history.filter(action => 
    action === 'bet' || action === 'raise' || action === 'all-in'
  ).length;
  
  const totalActions = history.length;
  
  if (totalActions === 0) return 0.5;
  
  return aggressiveActions / totalActions;
}

/**
 * ポットオッズ比率を計算
 */
function calculatePotOddsRatio(player: Player, gameState: GameState): number {
  const callAmount = gameState.currentBet - player.currentBet;
  if (callAmount === 0) return 0;
  
  return gameState.pot / callAmount;
}

/**
 * インプライドオッズを計算
 */
function calculateImpliedOdds(player: Player, gameState: GameState): number {
  const remainingCards = 52 - gameState.communityCards.length - player.holeCards.length;
  const outs = estimateOuts(player.holeCards, gameState.communityCards);
  
  if (outs === 0) return 0;
  
  const probability = outs / remainingCards;
  return probability * gameState.pot;
}

/**
 * アウツ数を推定
 */
function estimateOuts(holeCards: any[], communityCards: any[]): number {
  // 簡易的なアウツ計算
  if (communityCards.length === 0) {
    // プリフロップ
    return 0;
  }
  
  // フロップ以降のアウツ計算（簡易版）
  const handStrength = evaluateHandStrength({ holeCards } as Player, { communityCards } as GameState);
  
  if (handStrength > 0.8) return 0; // 強いハンド
  if (handStrength > 0.6) return 2; // 中程度のハンド
  if (handStrength > 0.4) return 4; // 弱いハンド
  return 8; // 非常に弱いハンド
}

/**
 * フォールドエクイティを計算
 */
function calculateFoldEquity(opponentAggression: number, gameState: GameState): number {
  // 相手の攻撃性が低いほどフォールドエクイティが高い
  const baseFoldEquity = 1 - opponentAggression;
  
  // ポットサイズによる調整
  const potSizeFactor = Math.min(gameState.pot / 100, 1);
  
  return baseFoldEquity * potSizeFactor;
}

/**
 * ブラフすべきか判定
 */
function shouldBluff(
  handStrength: number,
  aiState: any,
  personality: AIPersonality
): boolean {
  // パーソナリティによるブラフ頻度
  if (Math.random() > personality.bluffFrequency) return false;
  
  // ハンド強度が中程度の場合（強すぎず弱すぎず）
  if (handStrength < 0.3 || handStrength > 0.7) return false;
  
  // フォールドエクイティが高い場合
  if (aiState.foldEquity < 0.3) return false;
  
  // 相手が受動的でない場合
  if (aiState.opponentAggression > 0.7) return false;
  
  // ポジションが良い場合
  if (aiState.position === 'late') return true;
  
  // リスク許容度による判定
  return Math.random() < personality.riskTolerance;
}

/**
 * ブラフアクションを作成
 */
function createBluffAction(
  _player: Player,
  _gameState: GameState,
  personality: AIPersonality,
  aiState: any
): AIAction {
  const bluffSize = calculateBluffSize(personality, aiState);
  
  return {
    action: 'bet',
    amount: bluffSize,
    confidence: 0.6,
    reasoning: `ブラフ: フォールドエクイティ(${aiState.foldEquity.toFixed(2)})を狙ってベット`
  };
}

/**
 * ブラフサイズを計算
 */
function calculateBluffSize(personality: AIPersonality, aiState: any): number {
  const baseSize = 50; // 基本ブラフサイズ
  
  // リスク許容度による調整
  const riskFactor = personality.riskTolerance;
  
  // フォールドエクイティによる調整
  const foldEquityFactor = aiState.foldEquity;
  
  return Math.floor(baseSize * riskFactor * foldEquityFactor);
}

/**
 * 適応的行動すべきか判定
 */
function shouldAdaptBehavior(
  _aiState: any,
  personality: AIPersonality,
  opponentHistory: PlayerAction[]
): boolean {
  // 適応性が低い場合は適応しない
  if (personality.adaptability < 0.3) return false;
  
  // 相手の行動パターンが一貫している場合
  const patternConsistency = calculatePatternConsistency(opponentHistory);
  if (patternConsistency > 0.7) return true;
  
  // ランダム要素
  return Math.random() < personality.adaptability;
}

/**
 * 行動パターンの一貫性を計算
 */
function calculatePatternConsistency(history: PlayerAction[]): number {
  if (history.length < 3) return 0;
  
  // 簡易的な一貫性計算
  let consistency = 0;
  for (let i = 1; i < history.length; i++) {
    if (history[i] === history[i - 1]) {
      consistency += 1;
    }
  }
  
  return consistency / (history.length - 1);
}

/**
 * 適応的アクションを作成
 */
function createAdaptiveAction(
  _player: Player,
  gameState: GameState,
  _personality: AIPersonality,
  aiState: any
): AIAction {
  // 相手の行動に反応する
  
  if (aiState.opponentAggression > 0.7) {
    // 相手が攻撃的なら受動的に
    return {
      action: 'call',
      confidence: 0.7,
      reasoning: '相手が攻撃的なので受動的に行動'
    };
  } else {
    // 相手が受動的なら攻撃的に
    return {
      action: 'bet',
      amount: Math.floor(gameState.pot * 0.5),
      confidence: 0.6,
      reasoning: '相手が受動的なので攻撃的に行動'
    };
  }
}

/**
 * 戦略的アクションを作成
 */
function createStrategicAction(
  player: Player,
  gameState: GameState,
  handStrength: number,
  _personality: AIPersonality,
  aiState: any
): AIAction {
  const { potOdds, position, stackToPotRatio, aggressionLevel } = aiState;
  
  // フォールド判定
  if (shouldFold(handStrength, potOdds, position, stackToPotRatio)) {
    return {
      action: 'fold',
      confidence: 0.8,
      reasoning: 'ハンドが弱く、ポットオッズが悪いためフォールド'
    };
  }
  
  // オールイン判定
  if (shouldAllIn(handStrength, stackToPotRatio, aggressionLevel)) {
    return {
      action: 'all-in',
      confidence: 0.9,
      reasoning: '強いハンドでオールイン'
    };
  }
  
  // ベット/レイズ判定
  if (shouldBetOrRaise(handStrength, position, aggressionLevel)) {
    const betAmount = calculateBetAmount(handStrength, aiState, { action: 'bet', minAmount: gameState.bigBlind, maxAmount: player.chips });
    return {
      action: 'bet',
      amount: betAmount,
      confidence: 0.7,
      reasoning: 'ハンドが強く、ポジションが良いためベット'
    };
  }
  
  // デフォルトはコール
  return {
    action: 'call',
    confidence: 0.6,
    reasoning: '中程度のハンドでコール'
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
  // ハンドが非常に弱い場合
  if (handStrength < 0.2) return true;
  
  // ポットオッズが悪い場合
  if (potOdds < 0.2) return true;
  
  // ポジションが悪く、ハンドが弱い場合
  if (position === 'early' && handStrength < 0.4) return true;
  
  // スタックが少なく、ハンドが弱い場合
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
  
  // スタックが少なく、ハンドが強い場合
  if (stackToPotRatio < 0.3 && handStrength > 0.7) return true;
  
  // 攻撃性が高く、ハンドが強い場合
  if (aggressionLevel > 0.8 && handStrength > 0.6) return true;
  
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
  
  // ポジションが良く、中程度のハンド
  if (position === 'late' && handStrength > 0.5) return true;
  
  // 攻撃性が高く、中程度のハンド
  if (aggressionLevel > 0.7 && handStrength > 0.4) return true;
  
  return false;
}

/**
 * ベット額を計算
 */
function calculateBetAmount(
  handStrength: number,
  aiState: any,
  betOption: any
): number {
  const { minAmount, maxAmount } = betOption;
  const potSize = aiState.stackToPotRatio * 100; // 簡易的なポットサイズ
  
  // ハンド強度に基づくベットサイズ
  let betSize = minAmount;
  
  if (handStrength > 0.8) {
    betSize = Math.floor(potSize * 0.8); // ポットの80%
  } else if (handStrength > 0.6) {
    betSize = Math.floor(potSize * 0.5); // ポットの50%
  } else if (handStrength > 0.4) {
    betSize = Math.floor(potSize * 0.3); // ポットの30%
  } else {
    betSize = minAmount; // 最小ベット
  }
  
  // 範囲内に制限
  return Math.max(minAmount, Math.min(maxAmount, betSize));
}

/**
 * AIの行動パターンにランダム性を追加
 */
export function addRandomnessToAction(
  action: AIAction,
  personality: AIPersonality
): AIAction {
  const randomness = 1 - personality.patienceLevel; // 忍耐力が低いほどランダム
  
  if (Math.random() < randomness * 0.3) {
    // 30%の確率で行動を変更
    const alternativeActions: PlayerAction[] = ['fold', 'call', 'bet'];
    const newAction = alternativeActions[Math.floor(Math.random() * alternativeActions.length)];
    
    return {
      ...action,
      action: newAction,
      confidence: action.confidence * 0.8,
      reasoning: `${action.reasoning} (ランダム要素により${newAction}に変更)`
    };
  }
  
  return action;
}

/**
 * 動的パーソナリティ調整
 */
export function adjustPersonality(
  basePersonality: AIPersonality,
  gameProgress: number,
  winRate: number
): AIPersonality {
  const adjustment = {
    aggressionLevel: 0,
    bluffFrequency: 0,
    patienceLevel: 0,
    riskTolerance: 0,
    adaptability: 0
  };
  
  // ゲーム進行による調整
  if (gameProgress > 0.7) {
    // ゲーム終盤はより攻撃的に
    adjustment.aggressionLevel = 0.2;
    adjustment.riskTolerance = 0.1;
  }
  
  // 勝率による調整
  if (winRate < 0.3) {
    // 負けている場合はより保守的に
    adjustment.aggressionLevel = -0.2;
    adjustment.bluffFrequency = -0.1;
    adjustment.patienceLevel = 0.2;
  } else if (winRate > 0.7) {
    // 勝っている場合はより攻撃的に
    adjustment.aggressionLevel = 0.2;
    adjustment.bluffFrequency = 0.1;
    adjustment.riskTolerance = 0.1;
  }
  
  return {
    aggressionLevel: Math.max(0, Math.min(1, basePersonality.aggressionLevel + adjustment.aggressionLevel)),
    bluffFrequency: Math.max(0, Math.min(1, basePersonality.bluffFrequency + adjustment.bluffFrequency)),
    patienceLevel: Math.max(0, Math.min(1, basePersonality.patienceLevel + adjustment.patienceLevel)),
    riskTolerance: Math.max(0, Math.min(1, basePersonality.riskTolerance + adjustment.riskTolerance)),
    adaptability: basePersonality.adaptability
  };
} 