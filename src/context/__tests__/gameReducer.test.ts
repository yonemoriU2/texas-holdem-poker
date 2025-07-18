import { describe, it, expect, beforeEach } from 'vitest';
import { gameReducer, createInitialGameState } from '../gameReducer';
import type { GameState, GameAction, GameConfig } from '../../types/game';

describe('gameReducer', () => {
  let initialState: GameState;
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

  beforeEach(() => {
    initialState = createInitialGameState(testConfig);
  });

  describe('createInitialGameState', () => {
    it('初期状態を正しく作成する', () => {
      expect(initialState.players).toHaveLength(2);
      expect(initialState.players[0].name).toBe('Player');
      expect(initialState.players[1].name).toBe('CPU');
      expect(initialState.players[0].chips).toBe(1000);
      expect(initialState.players[1].chips).toBe(1000);
      expect(initialState.gamePhase).toBe('preflop');
      expect(initialState.pot).toBe(0);
      expect(initialState.isGameActive).toBe(false);
      expect(initialState.deck).toHaveLength(52);
    });
  });

  describe('START_GAME', () => {
    it('ゲームを開始し、ブラインドを設定する', () => {
      const action: GameAction = { type: 'START_GAME' };
      const newState = gameReducer(initialState, action);

      expect(newState.isGameActive).toBe(true);
      expect(newState.pot).toBe(40); // small blind + big blind + bb ante * 2
      expect(newState.currentBet).toBe(20); // big blind
      expect(newState.handNumber).toBe(1);
      
      // スモールブラインドとビッグブラインドが設定されている
      const smallBlindPlayer = newState.players.find(p => p.currentBet === 10);
      const bigBlindPlayer = newState.players.find(p => p.currentBet === 20);
      
      expect(smallBlindPlayer).toBeDefined();
      expect(bigBlindPlayer).toBeDefined();
      expect(smallBlindPlayer?.chips).toBe(985); // 1000 - 10 - 5
      expect(bigBlindPlayer?.chips).toBe(975); // 1000 - 20 - 5
    });
  });

  describe('DEAL_CARDS', () => {
    it('各プレイヤーに2枚ずつカードを配る', () => {
      const action: GameAction = { type: 'DEAL_CARDS' };
      const newState = gameReducer(initialState, action);

      expect(newState.players[0].holeCards).toHaveLength(2);
      expect(newState.players[1].holeCards).toHaveLength(2);
      expect(newState.deck).toHaveLength(48); // 52 - 4 = 48
    });
  });

  describe('PLAYER_ACTION', () => {
    let gameState: GameState;

    beforeEach(() => {
      gameState = gameReducer(initialState, { type: 'START_GAME' });
    });

    it('フォールドアクションを処理する', () => {
      const action: GameAction = {
        type: 'PLAYER_ACTION',
        payload: { playerId: 'player', action: 'fold' }
      };
      const newState = gameReducer(gameState, action);

      const player = newState.players.find(p => p.id === 'player');
      expect(player?.hasFolded).toBe(true);
      expect(player?.hasActed).toBe(true);
      
      // フォールドした場合、即座にショーダウンになる
      expect(newState.gamePhase).toBe('showdown');
      expect(newState.winner).toBe('cpu');
    });

    it('コールアクションを処理する', () => {
      const action: GameAction = {
        type: 'PLAYER_ACTION',
        payload: { playerId: 'player', action: 'call' }
      };
      const newState = gameReducer(gameState, action);

      const player = newState.players.find(p => p.id === 'player');
      expect(player?.currentBet).toBe(20); // big blind amount
      expect(player?.chips).toBe(975); // 1000 - 10 - 5 - 10 (small blind + bb ante + call)
      expect(player?.hasActed).toBe(true);
      expect(newState.pot).toBe(50); // 40 + 10 (call amount)
    });

    it('ベットアクションを処理する', () => {
      // まずチェック/コールしてから
      const callAction: GameAction = {
        type: 'PLAYER_ACTION',
        payload: { playerId: 'player', action: 'call' }
      };
      const newState = gameReducer(gameState, callAction);
      
      // ベッティングラウンドを完了させる
      newState.players[0].hasActed = true;
      newState.players[1].hasActed = true;
      newState.players[0].currentBet = 20;
      newState.players[1].currentBet = 20;
      newState.currentBet = 20;
      
      // 次のフェーズに進む
      let nextState = gameReducer(newState, { type: 'NEXT_PHASE' });
      
      const betAction: GameAction = {
        type: 'PLAYER_ACTION',
        payload: { playerId: 'player', action: 'bet', amount: 50 }
      };
      nextState = gameReducer(nextState, betAction);

      const player = nextState.players.find(p => p.id === 'player');
      expect(player?.currentBet).toBe(50);
      expect(player?.hasActed).toBe(true);
      expect(nextState.currentBet).toBe(50);
    });

    it('オールインアクションを処理する', () => {
      const action: GameAction = {
        type: 'PLAYER_ACTION',
        payload: { playerId: 'player', action: 'all-in' }
      };
      const newState = gameReducer(gameState, action);

      const player = newState.players.find(p => p.id === 'player');
      expect(player?.chips).toBe(0);
      expect(player?.isAllIn).toBe(true);
      expect(player?.hasActed).toBe(true);
      expect(newState.pot).toBe(1025); // 40 + 985 (player had 985 after small blind + bb ante)
    });
  });

  describe('NEXT_PHASE', () => {
    let gameState: GameState;

    beforeEach(() => {
      gameState = gameReducer(initialState, { type: 'START_GAME' });
      gameState = gameReducer(gameState, { type: 'DEAL_CARDS' });
    });

    it('プリフロップからフロップに移行する', () => {
      // ベッティングラウンドを完了させる
      gameState.players[0].hasActed = true;
      gameState.players[1].hasActed = true;
      gameState.players[0].currentBet = 20;
      gameState.players[1].currentBet = 20;
      gameState.currentBet = 20;

      const action: GameAction = { type: 'NEXT_PHASE' };
      const newState = gameReducer(gameState, action);

      expect(newState.gamePhase).toBe('flop');
      expect(newState.communityCards).toHaveLength(3);
      expect(newState.currentBet).toBe(0);
      
      // プレイヤーの状態がリセットされている
      newState.players.forEach(player => {
        expect(player.hasActed).toBe(false);
        expect(player.currentBet).toBe(0);
      });
    });

    it('フロップからターンに移行する', () => {
      // ベッティングラウンドを完了させる
      gameState.players[0].hasActed = true;
      gameState.players[1].hasActed = true;
      gameState.players[0].currentBet = 20;
      gameState.players[1].currentBet = 20;
      gameState.currentBet = 20;

      let newState = gameReducer(gameState, { type: 'NEXT_PHASE' });
      
      // 次のベッティングラウンドも完了させる
      newState.players[0].hasActed = true;
      newState.players[1].hasActed = true;
      newState.players[0].currentBet = 0;
      newState.players[1].currentBet = 0;
      newState.currentBet = 0;
      
      newState = gameReducer(newState, { type: 'NEXT_PHASE' });

      expect(newState.gamePhase).toBe('turn');
      expect(newState.communityCards).toHaveLength(4);
    });

    it('ターンからリバーに移行する', () => {
      // ベッティングラウンドを完了させる
      gameState.players[0].hasActed = true;
      gameState.players[1].hasActed = true;
      gameState.players[0].currentBet = 20;
      gameState.players[1].currentBet = 20;
      gameState.currentBet = 20;

      let newState = gameReducer(gameState, { type: 'NEXT_PHASE' });
      
      // フロップのベッティングラウンドを完了させる
      newState.players[0].hasActed = true;
      newState.players[1].hasActed = true;
      newState.players[0].currentBet = 0;
      newState.players[1].currentBet = 0;
      newState.currentBet = 0;
      
      newState = gameReducer(newState, { type: 'NEXT_PHASE' });
      
      // ターンのベッティングラウンドを完了させる
      newState.players[0].hasActed = true;
      newState.players[1].hasActed = true;
      newState.players[0].currentBet = 0;
      newState.players[1].currentBet = 0;
      newState.currentBet = 0;
      
      newState = gameReducer(newState, { type: 'NEXT_PHASE' });

      expect(newState.gamePhase).toBe('river');
      expect(newState.communityCards).toHaveLength(5);
    });

    it('リバーからショーダウンに移行し、ハンドを評価する', () => {
      // ベッティングラウンドを完了させる
      gameState.players[0].hasActed = true;
      gameState.players[1].hasActed = true;
      gameState.players[0].currentBet = 20;
      gameState.players[1].currentBet = 20;
      gameState.currentBet = 20;

      let newState = gameReducer(gameState, { type: 'NEXT_PHASE' });
      
      // フロップのベッティングラウンドを完了させる
      newState.players[0].hasActed = true;
      newState.players[1].hasActed = true;
      newState.players[0].currentBet = 0;
      newState.players[1].currentBet = 0;
      newState.currentBet = 0;
      
      newState = gameReducer(newState, { type: 'NEXT_PHASE' });
      
      // ターンのベッティングラウンドを完了させる
      newState.players[0].hasActed = true;
      newState.players[1].hasActed = true;
      newState.players[0].currentBet = 0;
      newState.players[1].currentBet = 0;
      newState.currentBet = 0;
      
      newState = gameReducer(newState, { type: 'NEXT_PHASE' });
      
      // リバーのベッティングラウンドを完了させる
      newState.players[0].hasActed = true;
      newState.players[1].hasActed = true;
      newState.players[0].currentBet = 0;
      newState.players[1].currentBet = 0;
      newState.currentBet = 0;
      
      newState = gameReducer(newState, { type: 'NEXT_PHASE' });

      expect(newState.gamePhase).toBe('showdown');
      
      // ハンドが評価されている
      newState.players.forEach(player => {
        if (!player.hasFolded) {
          expect(player.bestHand).toBeDefined();
        }
      });
    });
  });

  describe('EVALUATE_HANDS', () => {
    it('フォールドしていないプレイヤーのハンドを評価する', () => {
      let gameState = gameReducer(initialState, { type: 'START_GAME' });
      gameState = gameReducer(gameState, { type: 'DEAL_CARDS' });
      
      // コミュニティカードを設定
      gameState.communityCards = [
        { rank: 'A', suit: 'hearts', id: 'A-hearts' },
        { rank: 'K', suit: 'diamonds', id: 'K-diamonds' },
        { rank: 'Q', suit: 'clubs', id: 'Q-clubs' },
        { rank: 'J', suit: 'spades', id: 'J-spades' },
        { rank: '10', suit: 'hearts', id: '10-hearts' }
      ];

      const action: GameAction = { type: 'EVALUATE_HANDS' };
      const newState = gameReducer(gameState, action);

      newState.players.forEach(player => {
        if (!player.hasFolded) {
          expect(player.bestHand).toBeDefined();
          expect(player.bestHand?.rank).toBeGreaterThan(0);
          expect(player.bestHand?.rank).toBeLessThanOrEqual(10);
        }
      });
    });
  });

  describe('DETERMINE_WINNER', () => {
    it('フォールドによる勝利を決定する', () => {
      const gameState = gameReducer(initialState, { type: 'START_GAME' });
      
      // 一人がフォールド
      gameState.players[0].hasFolded = true;
      
      const action: GameAction = { type: 'DETERMINE_WINNER' };
      const newState = gameReducer(gameState, action);

      expect(newState.winner).toBe('cpu');
      expect(newState.winningHand).toBeNull();
    });
  });

  describe('DISTRIBUTE_POT', () => {
    it('勝者にポットを分配する', () => {
      const gameState = gameReducer(initialState, { type: 'START_GAME' });
      gameState.pot = 100;
      gameState.winner = 'player';
      
      const action: GameAction = { type: 'DISTRIBUTE_POT' };
      const newState = gameReducer(gameState, action);

      const winner = newState.players.find(p => p.id === 'player');
      expect(winner?.chips).toBe(1085); // 985 (after small blind + bb ante) + 100
      expect(newState.pot).toBe(0);
      expect(newState.isGameActive).toBe(false);
    });

    it('引き分けの場合はポットを分割する', () => {
      const gameState = gameReducer(initialState, { type: 'START_GAME' });
      gameState.pot = 100;
      gameState.winner = 'tie';
      
      const action: GameAction = { type: 'DISTRIBUTE_POT' };
      const newState = gameReducer(gameState, action);

      // Player: 990 + 50 = 1040, CPU: 980 + 50 = 1030
      const player = newState.players.find(p => p.id === 'player');
      const cpu = newState.players.find(p => p.id === 'cpu');
      expect(player?.chips).toBe(1035); // 985 + 50
      expect(cpu?.chips).toBe(1025); // 975 + 50
      expect(newState.pot).toBe(0);
    });
  });

  describe('NEW_HAND', () => {
    it('新しいハンドを開始する', () => {
      const gameState = gameReducer(initialState, { type: 'START_GAME' });
      const originalDealerIndex = gameState.dealerIndex;
      
      const action: GameAction = { type: 'NEW_HAND' };
      const newState = gameReducer(gameState, action);

      expect(newState.dealerIndex).toBe((originalDealerIndex + 1) % 2);
      expect(newState.gamePhase).toBe('preflop');
      expect(newState.pot).toBe(0);
      expect(newState.communityCards).toHaveLength(0);
      expect(newState.isGameActive).toBe(false);
      expect(newState.winner).toBeNull();
      expect(newState.deck).toHaveLength(52);
      
      newState.players.forEach(player => {
        expect(player.holeCards).toHaveLength(0);
        expect(player.currentBet).toBe(0);
        expect(player.hasActed).toBe(false);
        expect(player.hasFolded).toBe(false);
        expect(player.isAllIn).toBe(false);
        expect(player.bestHand).toBeUndefined();
      });
    });
  });

  describe('RESET_GAME', () => {
    it('ゲームを完全にリセットする', () => {
      const gameState = gameReducer(initialState, { type: 'START_GAME' });
      gameState.handNumber = 5;
      
      const action: GameAction = { type: 'RESET_GAME' };
      const newState = gameReducer(gameState, action);

      expect(newState.handNumber).toBe(0);
      expect(newState.gamePhase).toBe('preflop');
      expect(newState.isGameActive).toBe(false);
      
      newState.players.forEach(player => {
        expect(player.chips).toBe(1000);
        expect(player.holeCards).toHaveLength(0);
        expect(player.currentBet).toBe(0);
        expect(player.hasActed).toBe(false);
        expect(player.hasFolded).toBe(false);
        expect(player.isAllIn).toBe(false);
      });
    });
  });

  describe('SET_ACTIVE_PLAYER', () => {
    it('アクティブプレイヤーを設定する', () => {
      const action: GameAction = { 
        type: 'SET_ACTIVE_PLAYER', 
        payload: { playerIndex: 1 } 
      };
      const newState = gameReducer(initialState, action);

      expect(newState.activePlayerIndex).toBe(1);
    });
  });

  describe('ゲームフロー統合テスト', () => {
    it('完全なゲームフローを実行する', () => {
      // ゲーム開始
      let gameState = gameReducer(initialState, { type: 'START_GAME' });
      expect(gameState.isGameActive).toBe(true);
      
      // カード配布
      gameState = gameReducer(gameState, { type: 'DEAL_CARDS' });
      expect(gameState.players[0].holeCards).toHaveLength(2);
      
      // プレイヤーアクション（両方のプレイヤーがチェック）
      gameState = gameReducer(gameState, {
        type: 'PLAYER_ACTION',
        payload: { playerId: 'player', action: 'call' }
      });
      
      gameState = gameReducer(gameState, {
        type: 'PLAYER_ACTION',
        payload: { playerId: 'cpu', action: 'check' }
      });
      
      // フロップ
      expect(gameState.gamePhase).toBe('flop');
      expect(gameState.communityCards).toHaveLength(3);
      
      // 両プレイヤーがチェック
      gameState = gameReducer(gameState, {
        type: 'PLAYER_ACTION',
        payload: { playerId: 'player', action: 'check' }
      });
      
      gameState = gameReducer(gameState, {
        type: 'PLAYER_ACTION',
        payload: { playerId: 'cpu', action: 'check' }
      });
      
      // ターン
      expect(gameState.gamePhase).toBe('turn');
      
      // 両プレイヤーがチェック
      gameState = gameReducer(gameState, {
        type: 'PLAYER_ACTION',
        payload: { playerId: 'player', action: 'check' }
      });
      
      gameState = gameReducer(gameState, {
        type: 'PLAYER_ACTION',
        payload: { playerId: 'cpu', action: 'check' }
      });
      
      // リバー
      expect(gameState.gamePhase).toBe('river');
      
      // 両プレイヤーがチェック
      gameState = gameReducer(gameState, {
        type: 'PLAYER_ACTION',
        payload: { playerId: 'player', action: 'check' }
      });
      
      gameState = gameReducer(gameState, {
        type: 'PLAYER_ACTION',
        payload: { playerId: 'cpu', action: 'check' }
      });
      
      // ショーダウン
      expect(gameState.gamePhase).toBe('showdown');
      expect(gameState.winner).toBeDefined();
      
      // ポット分配
      gameState = gameReducer(gameState, { type: 'DISTRIBUTE_POT' });
      expect(gameState.pot).toBe(0);
      expect(gameState.isGameActive).toBe(false);
    });
  });
});