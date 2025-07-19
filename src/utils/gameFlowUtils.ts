import type { GameState, GamePhase } from '../types/game';
import type { Player } from '../types/player';

/**
 * ベッティングラウンドが完了したかどうかを判定する
 */
export function isBettingRoundComplete(state: GameState): boolean {
  const activePlayers = state.players.filter(p => !p.hasFolded);
  
  // アクティブプレイヤーが1人以下の場合
  if (activePlayers.length <= 1) {
    return true;
  }
  
  // すべてのアクティブプレイヤーがアクションを完了しているかチェック
  const allActed = activePlayers.every(p => p.hasActed || p.isAllIn);
  
  // すべてのプレイヤーのベット額が同じかチェック
  const activePlayerBets = activePlayers.map(p => p.currentBet);
  const allBetsEqual = activePlayerBets.every(bet => bet === activePlayerBets[0]);
  
  return allActed && allBetsEqual;
}

/**
 * 次のアクティブプレイヤーを決定する
 */
export function getNextActivePlayer(state: GameState): number {
  const { players, activePlayerIndex } = state;
  
  // 次のプレイヤーインデックスを計算
  let nextIndex = (activePlayerIndex + 1) % players.length;
  let attempts = 0;
  const maxAttempts = players.length;
  
  // フォールドしていない、アクション未完了、オールインでないプレイヤーを探す
  while (
    (players[nextIndex].hasFolded || 
     players[nextIndex].hasActed || 
     players[nextIndex].isAllIn) && 
    attempts < maxAttempts
  ) {
    nextIndex = (nextIndex + 1) % players.length;
    attempts++;
  }
  
  // 無限ループ防止
  if (attempts >= maxAttempts) {
    return -1; // 次のプレイヤーが見つからない
  }
  
  return nextIndex;
}

/**
 * フェーズ遷移が可能かどうかを判定する
 */
export function canTransitionToNextPhase(state: GameState): boolean {
  // ショーダウンまたはゲーム終了の場合は遷移不可
  if (state.gamePhase === 'showdown' || state.gamePhase === 'ended') {
    return false;
  }
  
  // ベッティングラウンドが完了しているかチェック
  return isBettingRoundComplete(state);
}

/**
 * 次のフェーズを取得する
 */
export function getNextPhase(currentPhase: GamePhase): GamePhase {
  const phaseOrder: GamePhase[] = ['preflop', 'flop', 'turn', 'river', 'showdown', 'ended'];
  const currentIndex = phaseOrder.indexOf(currentPhase);
  
  if (currentIndex === -1 || currentIndex >= phaseOrder.length - 1) {
    return currentPhase;
  }
  
  return phaseOrder[currentIndex + 1];
}

/**
 * フェーズ遷移時の初期化処理
 */
export function initializePhaseTransition(state: GameState, newPhase: GamePhase): Partial<GameState> {
  const updates: Partial<GameState> = {
    gamePhase: newPhase,
    currentBet: 0
  };
  
  // プレイヤーの状態をリセット（フォールドした状態は保持）
  updates.players = state.players.map(player => ({
    ...player,
    hasActed: player.hasFolded ? true : false,
    currentBet: 0
  }));
  
  // 新しいフェーズに応じたアクティブプレイヤーを設定
  if (newPhase !== 'showdown' && newPhase !== 'ended') {
    // ディーラーの次から開始
    updates.activePlayerIndex = (state.dealerIndex + 1) % state.players.length;
  }
  
  return updates;
}

/**
 * ショーダウン条件をチェックする
 */
export function shouldStartShowdown(state: GameState): boolean {
  // リバーが終了した場合
  if (state.gamePhase === 'river' && isBettingRoundComplete(state)) {
    return true;
  }
  
  // アクティブプレイヤーが1人になった場合
  const activePlayers = state.players.filter(p => !p.hasFolded);
  if (activePlayers.length === 1) {
    return true;
  }
  
  return false;
}

/**
 * ゲーム終了条件をチェックする
 */
export function checkGameOver(players: Player[], smallBlind: number, bigBlind: number, bbAnte: number): {
  isGameOver: boolean;
  reason: string | null;
  winner: string | null;
} {
  // プレイヤーのチップ数をチェック
  const playerChips = players[0].chips;
  const cpuChips = players[1].chips;
  
  // 必要な最小チップ数（ブラインド + BBアンティ）
  const minRequiredChips = bigBlind + bbAnte;
  
  // 両プレイヤーが最小チップ数に満たない場合
  if (playerChips < minRequiredChips && cpuChips < minRequiredChips) {
    return {
      isGameOver: true,
      reason: "両プレイヤーのチップが不足しています",
      winner: null
    };
  }
  
  // プレイヤーのチップが不足
  if (playerChips < minRequiredChips) {
    return {
      isGameOver: true,
      reason: "プレイヤーのチップが不足しています",
      winner: "cpu"
    };
  }
  
  // CPUのチップが不足
  if (cpuChips < minRequiredChips) {
    return {
      isGameOver: true,
      reason: "CPUのチップが不足しています",
      winner: "player"
    };
  }
  
  return {
    isGameOver: false,
    reason: null,
    winner: null
  };
}

/**
 * 新しいハンドを開始できるかチェックする
 */
export function canStartNewHand(players: Player[], smallBlind: number, bigBlind: number, bbAnte: number): boolean {
  const gameOverCheck = checkGameOver(players, smallBlind, bigBlind, bbAnte);
  return !gameOverCheck.isGameOver;
}

/**
 * 新しいゲームを開始できるかチェックする
 */
export function canStartNewGame(): boolean {
  // 新しいゲームは常に開始可能
  return true;
}

/**
 * ハンド終了後の状態をチェックする
 */
export function checkHandEndState(
  gamePhase: GamePhase, 
  players: Player[], 
  smallBlind: number, 
  bigBlind: number, 
  bbAnte: number
): {
  canStartNewHand: boolean;
  canStartNewGame: boolean;
  isGameOver: boolean;
  gameOverReason: string | null;
} {
  // ショーダウンまたはゲーム終了フェーズでのみチェック
  if (gamePhase !== 'showdown' && gamePhase !== 'ended') {
    return {
      canStartNewHand: false,
      canStartNewGame: true,
      isGameOver: false,
      gameOverReason: null
    };
  }
  
  const gameOverCheck = checkGameOver(players, smallBlind, bigBlind, bbAnte);
  
  return {
    canStartNewHand: !gameOverCheck.isGameOver,
    canStartNewGame: true,
    isGameOver: gameOverCheck.isGameOver,
    gameOverReason: gameOverCheck.reason
  };
}

/**
 * ベッティングラウンドの進行状況を取得する
 */
export function getBettingRoundProgress(state: GameState): {
  completed: number;
  total: number;
  percentage: number;
} {
  const activePlayers = state.players.filter(p => !p.hasFolded);
  const completedPlayers = activePlayers.filter(p => p.hasActed || p.isAllIn);
  
  return {
    completed: completedPlayers.length,
    total: activePlayers.length,
    percentage: activePlayers.length > 0 ? (completedPlayers.length / activePlayers.length) * 100 : 0
  };
}

/**
 * プレイヤーのアクション可能性をチェックする
 */
export function canPlayerAct(player: Player, _state: GameState): boolean {
  // フォールドまたはオールインの場合はアクション不可
  if (player.hasFolded || player.isAllIn) {
    return false;
  }
  
  // 既にアクション済みの場合はアクション不可
  if (player.hasActed) {
    return false;
  }
  
  return true;
}

/**
 * フェーズの説明を取得する
 */
export function getPhaseDescription(phase: GamePhase): string {
  const descriptions = {
    preflop: 'ホールカード配布後の最初のベッティングラウンド',
    flop: '3枚のコミュニティカード公開後のベッティングラウンド',
    turn: '4枚目のコミュニティカード公開後のベッティングラウンド',
    river: '5枚目のコミュニティカード公開後のベッティングラウンド',
    showdown: 'ハンド比較と勝者決定',
    ended: 'ハンド完了'
  };
  
  return descriptions[phase] || '';
}

/**
 * フェーズの進行順序を取得する
 */
export function getPhaseOrder(): GamePhase[] {
  return ['preflop', 'flop', 'turn', 'river', 'showdown', 'ended'];
}

/**
 * フェーズのインデックスを取得する
 */
export function getPhaseIndex(phase: GamePhase): number {
  return getPhaseOrder().indexOf(phase);
}

/**
 * フェーズが完了したかどうかを判定する
 */
export function isPhaseCompleted(phase: GamePhase, currentPhase: GamePhase): boolean {
  const currentIndex = getPhaseIndex(currentPhase);
  const phaseIndex = getPhaseIndex(phase);
  
  return phaseIndex < currentIndex;
} 