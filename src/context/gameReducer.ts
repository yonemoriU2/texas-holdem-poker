import type { GameState, GameAction, GameConfig } from '../types/game';
import type { Player } from '../types/player';
import { createShuffledDeck, dealCards } from '../utils/cardUtils';
import { evaluateHand, determineWinners } from '../utils/handEvaluator';
import { 
  isBettingRoundComplete, 
  getNextActivePlayer, 
  canTransitionToNextPhase,
  getNextPhase,
  initializePhaseTransition,
  checkGameOver,
  canStartNewHand,
  canStartNewGame,
  checkHandEndState,
} from '../utils/gameFlowUtils';
import { 
  getBlindInfo, 
  shouldIncreaseBlinds, 
  increaseBlinds,
} from '../utils/blindUtils';
import { DEFAULT_GAME_CONFIG } from '../constants';

/**
 * ゲームの初期状態を作成する
 */
export function createInitialGameState(config: GameConfig = DEFAULT_GAME_CONFIG): GameState {
  const players: Player[] = [
    {
      id: 'player',
      name: config.playerName,
      chips: config.initialChips,
      holeCards: [],
      currentBet: 0,
      hasActed: false,
      hasFolded: false,
      isAllIn: false,
      isDealer: false
    },
    {
      id: 'cpu',
      name: config.cpuName,
      chips: config.initialChips,
      holeCards: [],
      currentBet: 0,
      hasActed: false,
      hasFolded: false,
      isAllIn: false,
      isDealer: true
    }
  ];

  const blindInfo = getBlindInfo(config, 1);

  return {
    players,
    communityCards: [],
    pot: 0,
    currentBet: 0,
    gamePhase: 'preflop',
    activePlayerIndex: 0,
    dealerIndex: 1,
    deck: createShuffledDeck(),
    winner: null,
    winningHand: null,
    isGameActive: false,
    smallBlind: blindInfo.smallBlind,
    bigBlind: blindInfo.bigBlind,
    bbAnte: blindInfo.bbAnte,
    handNumber: 0,
    blindLevel: 1,
    handsUntilBlindIncrease: config.blindIncreaseInterval,
    // ゲーム継続機能の初期状態
    isGameOver: false,
    gameOverReason: null,
    canStartNewHand: true,
    canStartNewGame: true
  };
}

/**
 * ゲームリデューサー
 */
export function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'START_GAME':
      return startGame(state);
    
    case 'DEAL_CARDS':
      return dealInitialCards(state);
    
    case 'PLAYER_ACTION':
      return handlePlayerAction(state, action.payload);
    
    case 'NEXT_PHASE':
      return nextPhase(state);
    
    case 'EVALUATE_HANDS':
      return evaluateHands(state);
    
    case 'DETERMINE_WINNER':
      return determineWinner(state);
    
    case 'DISTRIBUTE_POT':
      return distributePot(state);
    
    case 'NEW_HAND':
      return newHand(state);
    
    case 'RESET_GAME':
      return resetGame(state);
    
    case 'SET_ACTIVE_PLAYER':
      return setActivePlayer(state, action.payload.playerIndex);
    
    case 'INCREASE_BLINDS':
      return increaseBlindLevel(state);
    
    case 'SET_BLIND_LEVEL':
      return setBlindLevel(state, action.payload.level);
    
    case 'CHECK_GAME_OVER':
      return checkGameOverState(state);
    
    case 'START_NEW_GAME':
      return startNewGame(state);
    
    case 'REPAIR_STATE':
      return action.payload.repairedState;
    
    default:
      return state;
  }
}

/**
 * ゲームを開始する
 */
function startGame(state: GameState): GameState {
  const newState = { ...state };
  
  // ブラインド増加チェック
  if (shouldIncreaseBlinds(state.handNumber + 1, 10)) { // 10ハンドごとに増加
    const newBlinds = increaseBlinds(
      state.smallBlind,
      state.bigBlind,
      state.bbAnte,
      1.5
    );
    newState.smallBlind = newBlinds.smallBlind;
    newState.bigBlind = newBlinds.bigBlind;
    newState.bbAnte = newBlinds.bbAnte;
    newState.blindLevel = state.blindLevel + 1;
  }
  
  // ブラインドを設定
  const smallBlindIndex = (state.dealerIndex + 1) % state.players.length;
  const bigBlindIndex = (state.dealerIndex + 2) % state.players.length;
  
  newState.players = state.players.map((player, index) => ({
    ...player,
    currentBet: index === smallBlindIndex ? state.smallBlind : 
                index === bigBlindIndex ? state.bigBlind : 0,
    hasActed: false,
    hasFolded: false,
    isAllIn: false,
    holeCards: [],
    bestHand: undefined
  }));
  
  // チップを減らす（ブラインド + BBアンティ）
  newState.players[smallBlindIndex].chips -= state.smallBlind + state.bbAnte;
  newState.players[bigBlindIndex].chips -= state.bigBlind + state.bbAnte;
  
  // ポットを設定（ブラインド + BBアンティ）
  newState.pot = state.smallBlind + state.bigBlind + (state.bbAnte * 2);
  newState.currentBet = state.bigBlind;
  
  // アクティブプレイヤーを設定（ビッグブラインドの次）
  newState.activePlayerIndex = (bigBlindIndex + 1) % state.players.length;
  
  newState.isGameActive = true;
  newState.gamePhase = 'preflop';
  newState.winner = null;
  newState.winningHand = null;
  newState.handNumber = state.handNumber + 1;
  newState.handsUntilBlindIncrease = 10;
  
  return newState;
}

/**
 * 初期カードを配る
 */
function dealInitialCards(state: GameState): GameState {
  const newState = { ...state };
  let deck = [...state.deck];
  
  // 各プレイヤーに2枚ずつ配る
  for (let i = 0; i < state.players.length; i++) {
    const { cards, remainingDeck } = dealCards(deck, 2);
    newState.players[i] = {
      ...state.players[i],
      holeCards: cards
    };
    deck = remainingDeck;
  }
  
  newState.deck = deck;
  return newState;
}

/**
 * プレイヤーアクションを処理する
 */
function handlePlayerAction(state: GameState, payload: { playerId: string; action: string; amount?: number }): GameState {
  const { playerId, action, amount = 0 } = payload;
  const playerIndex = state.players.findIndex(p => p.id === playerId);
  
  if (playerIndex === -1) {
    return state;
  }
  
  const newState = { ...state };
  const player = { ...state.players[playerIndex] };
  
  switch (action) {
    case 'fold': {
      player.hasFolded = true;
      player.hasActed = true;
      break;
    }
    
    case 'check': {
      if (state.currentBet === player.currentBet) {
        player.hasActed = true;
      }
      break;
    }
    
    case 'call': {
      const callAmount = Math.min(state.currentBet - player.currentBet, player.chips);
      player.chips -= callAmount;
      player.currentBet += callAmount;
      player.hasActed = true;
      newState.pot += callAmount;
      
      if (player.chips === 0) {
        player.isAllIn = true;
      }
      break;
    }
    
    case 'bet':
    case 'raise': {
      const betAmount = Math.min(amount, player.chips);
      player.chips -= betAmount;
      player.currentBet += betAmount;
      player.hasActed = true;
      newState.pot += betAmount;
      newState.currentBet = Math.max(newState.currentBet, player.currentBet);
      
      if (player.chips === 0) {
        player.isAllIn = true;
      }
      
      // 他のプレイヤーのhasActedをリセット（レイズの場合）
      if (action === 'raise') {
        newState.players = state.players.map((p, index) => ({
          ...p,
          hasActed: index === playerIndex ? true : p.hasFolded || p.isAllIn
        }));
      }
      break;
    }
    
    case 'all-in': {
      const allInAmount = player.chips;
      player.chips = 0;
      player.currentBet += allInAmount;
      player.isAllIn = true;
      player.hasActed = true;
      newState.pot += allInAmount;
      newState.currentBet = Math.max(newState.currentBet, player.currentBet);
      break;
    }
  }
  
  newState.players[playerIndex] = player;
  
  // 次のプレイヤーに移る
  return moveToNextPlayer(newState);
}

/**
 * 次のプレイヤーに移る
 */
function moveToNextPlayer(state: GameState): GameState {
  const newState = { ...state };
  
  // ベッティングラウンドが完了したかチェック
  if (isBettingRoundComplete(state)) {
    // アクティブプレイヤーが1人になった場合、勝者を決定
    const activePlayers = state.players.filter(p => !p.hasFolded);
    if (activePlayers.length === 1) {
      return determineWinner(newState);
    }
    return nextPhase(newState);
  }
  
  // 次のアクティブプレイヤーを取得
  const nextIndex = getNextActivePlayer(state);
  
  // 次のプレイヤーが見つからない場合、フェーズを進める
  if (nextIndex === -1) {
    return nextPhase(newState);
  }
  
  newState.activePlayerIndex = nextIndex;
  return newState;
}

/**
 * 次のフェーズに移る
 */
function nextPhase(state: GameState): GameState {
  // フェーズ遷移が可能かチェック
  if (!canTransitionToNextPhase(state)) {
    return state;
  }
  
  const newState = { ...state };
  const nextPhaseType = getNextPhase(state.gamePhase);
  
  // フェーズ遷移の初期化処理
  const phaseUpdates = initializePhaseTransition(state, nextPhaseType);
  Object.assign(newState, phaseUpdates);
  
  switch (state.gamePhase) {
    case 'preflop': {
      // フロップ（3枚のコミュニティカード）
      const { cards: flopCards, remainingDeck: afterFlop } = dealCards(state.deck, 3);
      newState.communityCards = flopCards;
      newState.deck = afterFlop;
      break;
    }
    
    case 'flop': {
      // ターン（1枚のコミュニティカード）
      const { cards: turnCards, remainingDeck: afterTurn } = dealCards(state.deck, 1);
      newState.communityCards = [...state.communityCards, ...turnCards];
      newState.deck = afterTurn;
      break;
    }
    
    case 'turn': {
      // リバー（1枚のコミュニティカード）
      const { cards: riverCards, remainingDeck: afterRiver } = dealCards(state.deck, 1);
      newState.communityCards = [...state.communityCards, ...riverCards];
      newState.deck = afterRiver;
      break;
    }
    
    case 'river':
      // ショーダウン
      return evaluateHands(newState);
    
    case 'showdown':
      return distributePot(newState);
    
    default:
      return newState;
  }
  
  return newState;
}

/**
 * ハンドを評価する
 */
function evaluateHands(state: GameState): GameState {
  const newState = { ...state };
  
  newState.players = state.players.map(player => {
    if (player.hasFolded) {
      return player;
    }
    
    const allCards = [...player.holeCards, ...state.communityCards];
    const bestHand = evaluateHand(allCards);
    
    return {
      ...player,
      bestHand
    };
  });
  
  return determineWinner(newState);
}

/**
 * 勝者を決定する
 */
function determineWinner(state: GameState): GameState {
  const newState = { ...state };
  
  const activePlayers = state.players.filter(p => !p.hasFolded);
  
  if (activePlayers.length === 1) {
    // フォールドによる勝利
    newState.winner = activePlayers[0].id;
    newState.winningHand = null;
    newState.gamePhase = 'showdown';
  } else if (activePlayers.length === 0) {
    // 全員フォールド（異常な状態）
    newState.winner = null;
    newState.winningHand = null;
    newState.gamePhase = 'showdown';
  } else {
    // ハンド比較による勝利
    const hands = activePlayers.map(p => p.bestHand!);
    const winnerIndices = determineWinners(hands);
    
    if (winnerIndices.length === 1) {
      // 単独勝利
      newState.winner = activePlayers[winnerIndices[0]].id;
      newState.winningHand = hands[winnerIndices[0]];
    } else {
      // 引き分け（複数の勝者）
      newState.winner = 'tie';
      newState.winningHand = hands[winnerIndices[0]];
    }
    
    newState.gamePhase = 'showdown';
  }
  
  return newState;
}

/**
 * ポットを分配する
 */
function distributePot(state: GameState): GameState {
  const newState = { ...state };
  
  if (!state.winner || state.pot === 0) {
    // 勝者がいない場合やポットが0の場合は何もしない
    newState.isGameActive = false;
    return newState;
  }
  
  if (state.winner === 'tie') {
    // 引き分けの場合、ポットを分割
    const activePlayers = state.players.filter(p => !p.hasFolded);
    const potShare = Math.floor(state.pot / activePlayers.length);
    const remainder = state.pot % activePlayers.length; // 端数
    
    newState.players = state.players.map(player => {
      if (activePlayers.some(p => p.id === player.id)) {
        // 最初のプレイヤーに端数も追加
        const isFirstWinner = activePlayers[0].id === player.id;
        const additionalChips = isFirstWinner ? remainder : 0;
        return {
          ...player,
          chips: player.chips + potShare + additionalChips
        };
      }
      return player;
    });
  } else {
    // 単独勝利の場合
    newState.players = state.players.map(player => {
      if (player.id === state.winner) {
        return {
          ...player,
          chips: player.chips + state.pot
        };
      }
      return player;
    });
  }
  
  newState.pot = 0;
  newState.isGameActive = false;
  newState.gamePhase = 'ended';
  
  // ゲーム終了状態をチェック
  const gameOverCheck = checkGameOver(newState.players, newState.smallBlind, newState.bigBlind, newState.bbAnte);
  const handEndState = checkHandEndState(
    newState.gamePhase,
    newState.players,
    newState.smallBlind,
    newState.bigBlind,
    newState.bbAnte
  );
  
  newState.isGameOver = gameOverCheck.isGameOver;
  newState.gameOverReason = gameOverCheck.reason;
  newState.canStartNewHand = handEndState.canStartNewHand;
  newState.canStartNewGame = handEndState.canStartNewGame;
  
  // ゲーム終了の場合、勝者を設定
  if (gameOverCheck.isGameOver && gameOverCheck.winner) {
    newState.winner = gameOverCheck.winner;
  }
  
  return newState;
}

/**
 * 新しいハンドを開始する
 */
function newHand(state: GameState): GameState {
  const newState = { ...state };
  
  // ハンド数を増加
  newState.handNumber = state.handNumber + 1;
  
  // ブラインド増加チェック
  if (shouldIncreaseBlinds(state.handNumber, 10)) {
    const newBlinds = increaseBlinds(
      state.smallBlind,
      state.bigBlind,
      state.bbAnte,
      1.5
    );
    newState.smallBlind = newBlinds.smallBlind;
    newState.bigBlind = newBlinds.bigBlind;
    newState.bbAnte = newBlinds.bbAnte;
    newState.blindLevel = state.blindLevel + 1;
    newState.handsUntilBlindIncrease = 10;
  } else {
    newState.handsUntilBlindIncrease = state.handsUntilBlindIncrease - 1;
  }
  
  // ディーラーを交代
  newState.dealerIndex = (state.dealerIndex + 1) % state.players.length;
  
  // プレイヤーの状態をリセット
  newState.players = state.players.map((player, index) => ({
    ...player,
    holeCards: [],
    currentBet: 0,
    hasActed: false,
    hasFolded: false,
    isAllIn: false,
    isDealer: index === newState.dealerIndex,
    bestHand: undefined
  }));
  
  // ゲーム状態をリセット
  newState.communityCards = [];
  newState.pot = 0;
  newState.currentBet = 0;
  newState.gamePhase = 'preflop';
  newState.activePlayerIndex = 0;
  newState.deck = createShuffledDeck();
  newState.winner = null;
  newState.winningHand = null;
  newState.isGameActive = false;
  
  return newState;
}

/**
 * ゲーム終了状態をチェックする
 */
function checkGameOverState(state: GameState): GameState {
  const newState = { ...state };
  
  const gameOverCheck = checkGameOver(state.players, state.smallBlind, state.bigBlind, state.bbAnte);
  const handEndState = checkHandEndState(
    state.gamePhase,
    state.players,
    state.smallBlind,
    state.bigBlind,
    state.bbAnte
  );
  
  newState.isGameOver = gameOverCheck.isGameOver;
  newState.gameOverReason = gameOverCheck.reason;
  newState.canStartNewHand = handEndState.canStartNewHand;
  newState.canStartNewGame = handEndState.canStartNewGame;
  
  // ゲーム終了の場合、勝者を設定
  if (gameOverCheck.isGameOver && gameOverCheck.winner) {
    newState.winner = gameOverCheck.winner;
    newState.gamePhase = 'ended';
    newState.isGameActive = false;
  }
  
  return newState;
}

/**
 * 新しいゲームを開始する
 */
function startNewGame(state: GameState): GameState {
  const config = {
    initialChips: 1000,
    smallBlind: 10,
    bigBlind: 20,
    bbAnte: 5,
    playerName: state.players[0].name,
    cpuName: state.players[1].name,
    blindIncreaseInterval: 10,
    blindIncreaseMultiplier: 1.5
  };
  
  return createInitialGameState(config);
}

/**
 * ゲームをリセットする
 */
function resetGame(state: GameState): GameState {
  const config = {
    initialChips: 1000,
    smallBlind: state.smallBlind,
    bigBlind: state.bigBlind,
    bbAnte: state.bbAnte,
    playerName: state.players[0].name,
    cpuName: state.players[1].name,
    blindIncreaseInterval: 10,
    blindIncreaseMultiplier: 1.5
  };
  
  return createInitialGameState(config);
}

/**
 * アクティブプレイヤーを設定する
 */
function setActivePlayer(state: GameState, playerIndex: number): GameState {
  return {
    ...state,
    activePlayerIndex: playerIndex
  };
}

/**
 * ブラインドレベルを増加する
 */
function increaseBlindLevel(state: GameState): GameState {
  const newState = { ...state };
  const newBlinds = increaseBlinds(
    state.smallBlind,
    state.bigBlind,
    state.bbAnte,
    1.5
  );
  
  newState.smallBlind = newBlinds.smallBlind;
  newState.bigBlind = newBlinds.bigBlind;
  newState.bbAnte = newBlinds.bbAnte;
  newState.blindLevel = state.blindLevel + 1;
  newState.handsUntilBlindIncrease = 10;
  
  return newState;
}

/**
 * ブラインドレベルを設定する
 */
function setBlindLevel(state: GameState, level: number): GameState {
  const newState = { ...state };
  const config = {
    initialChips: 1000,
    smallBlind: 10,
    bigBlind: 20,
    bbAnte: 5,
    playerName: state.players[0].name,
    cpuName: state.players[1].name,
    blindIncreaseInterval: 10,
    blindIncreaseMultiplier: 1.5
  };
  
  const blindInfo = getBlindInfo(config, level);
  
  newState.smallBlind = blindInfo.smallBlind;
  newState.bigBlind = blindInfo.bigBlind;
  newState.bbAnte = blindInfo.bbAnte;
  newState.blindLevel = level;
  newState.handsUntilBlindIncrease = 10;
  
  return newState;
}