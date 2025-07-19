import { describe, it, expect, beforeEach } from 'vitest';
import {
  isBettingRoundComplete,
  getNextActivePlayer,
  canTransitionToNextPhase,
  getNextPhase,
  initializePhaseTransition,
  shouldStartShowdown,
  getBettingRoundProgress,
  canPlayerAct,
  getPhaseDescription,
  getPhaseOrder,
  getPhaseIndex,
  isPhaseCompleted,
  checkGameOver,
  canStartNewHand,
  canStartNewGame,
  checkHandEndState
} from '../gameFlowUtils';
import type { GameState } from '../../types/game';
import type { Player } from '../../types/player';
import type { GamePhase } from '../../types/game';

describe('gameFlowUtils', () => {
  let mockGameState: GameState;
  let mockPlayers: Player[];

  beforeEach(() => {
    mockPlayers = [
      {
        id: 'player',
        name: 'Player',
        chips: 1000,
        holeCards: [],
        currentBet: 0,
        hasActed: false,
        hasFolded: false,
        isAllIn: false,
        isDealer: false
      },
      {
        id: 'cpu',
        name: 'CPU',
        chips: 1000,
        holeCards: [],
        currentBet: 0,
        hasActed: false,
        hasFolded: false,
        isAllIn: false,
        isDealer: true
      }
    ];

    mockGameState = {
      players: mockPlayers,
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
      handsUntilBlindIncrease: 10,
      // ゲーム継続機能の初期状態
      isGameOver: false,
      gameOverReason: null,
      canStartNewHand: true,
      canStartNewGame: true
    };
  });

  describe('isBettingRoundComplete', () => {
    it('すべてのプレイヤーがアクション済みの場合、trueを返す', () => {
      mockGameState.players[0].hasActed = true;
      mockGameState.players[1].hasActed = true;
      mockGameState.players[0].currentBet = 20;
      mockGameState.players[1].currentBet = 20;
      mockGameState.currentBet = 20;

      expect(isBettingRoundComplete(mockGameState)).toBe(true);
    });

    it('アクティブプレイヤーが1人の場合、trueを返す', () => {
      mockGameState.players[1].hasFolded = true;

      expect(isBettingRoundComplete(mockGameState)).toBe(true);
    });

    it('プレイヤーがまだアクションしていない場合、falseを返す', () => {
      expect(isBettingRoundComplete(mockGameState)).toBe(false);
    });

    it('ベット額が異なる場合、falseを返す', () => {
      mockGameState.players[0].hasActed = true;
      mockGameState.players[1].hasActed = true;
      mockGameState.players[0].currentBet = 20;
      mockGameState.players[1].currentBet = 40;
      mockGameState.currentBet = 40;

      expect(isBettingRoundComplete(mockGameState)).toBe(false);
    });
  });

  describe('getNextActivePlayer', () => {
    it('次のアクティブプレイヤーを正しく返す', () => {
      mockGameState.activePlayerIndex = 0;
      mockGameState.players[0].hasActed = true;

      expect(getNextActivePlayer(mockGameState)).toBe(1);
    });

    it('フォールドしたプレイヤーをスキップする', () => {
      mockGameState.activePlayerIndex = 0;
      mockGameState.players[1].hasFolded = true;

      expect(getNextActivePlayer(mockGameState)).toBe(0);
    });

    it('次のプレイヤーが見つからない場合、-1を返す', () => {
      mockGameState.players[0].hasFolded = true;
      mockGameState.players[1].hasFolded = true;

      expect(getNextActivePlayer(mockGameState)).toBe(-1);
    });
  });

  describe('canTransitionToNextPhase', () => {
    it('ベッティングラウンドが完了している場合、trueを返す', () => {
      mockGameState.players[0].hasActed = true;
      mockGameState.players[1].hasActed = true;
      mockGameState.players[0].currentBet = 20;
      mockGameState.players[1].currentBet = 20;
      mockGameState.currentBet = 20;

      expect(canTransitionToNextPhase(mockGameState)).toBe(true);
    });

    it('ショーダウンフェーズではfalseを返す', () => {
      mockGameState.gamePhase = 'showdown';

      expect(canTransitionToNextPhase(mockGameState)).toBe(false);
    });

    it('ゲーム終了フェーズではfalseを返す', () => {
      mockGameState.gamePhase = 'ended';

      expect(canTransitionToNextPhase(mockGameState)).toBe(false);
    });
  });

  describe('getNextPhase', () => {
    it('プリフロップからフロップに移行する', () => {
      expect(getNextPhase('preflop')).toBe('flop');
    });

    it('フロップからターンに移行する', () => {
      expect(getNextPhase('flop')).toBe('turn');
    });

    it('ターンからリバーに移行する', () => {
      expect(getNextPhase('turn')).toBe('river');
    });

    it('リバーからショーダウンに移行する', () => {
      expect(getNextPhase('river')).toBe('showdown');
    });

    it('ショーダウンから終了に移行する', () => {
      expect(getNextPhase('showdown')).toBe('ended');
    });

    it('終了フェーズでは同じフェーズを返す', () => {
      expect(getNextPhase('ended')).toBe('ended');
    });
  });

  describe('initializePhaseTransition', () => {
    it('フェーズ遷移時の初期化を正しく行う', () => {
      mockGameState.players[0].currentBet = 20;
      mockGameState.players[1].currentBet = 20;
      mockGameState.currentBet = 20;

      const updates = initializePhaseTransition(mockGameState, 'flop');

      expect(updates.gamePhase).toBe('flop');
      expect(updates.currentBet).toBe(0);
      expect(updates.players?.[0].currentBet).toBe(0);
      expect(updates.players?.[1].currentBet).toBe(0);
      expect(updates.players?.[0].hasActed).toBe(false);
      expect(updates.players?.[1].hasActed).toBe(false); // ディーラーでもフォールドしていない場合はfalse
    });
  });

  describe('shouldStartShowdown', () => {
    it('リバーが完了した場合、trueを返す', () => {
      mockGameState.gamePhase = 'river';
      mockGameState.players[0].hasActed = true;
      mockGameState.players[1].hasActed = true;
      mockGameState.players[0].currentBet = 20;
      mockGameState.players[1].currentBet = 20;
      mockGameState.currentBet = 20;

      expect(shouldStartShowdown(mockGameState)).toBe(true);
    });

    it('アクティブプレイヤーが1人の場合、trueを返す', () => {
      mockGameState.players[1].hasFolded = true;

      expect(shouldStartShowdown(mockGameState)).toBe(true);
    });
  });

  describe('checkGameOver', () => {
    it('プレイヤーのチップが不足している場合、ゲーム終了を判定する', () => {
      mockGameState.players[0].chips = 10; // 最小必要額25未満
      mockGameState.players[1].chips = 100;

      const result = checkGameOver(mockGameState.players, mockGameState.smallBlind, mockGameState.bigBlind, mockGameState.bbAnte);

      expect(result.isGameOver).toBe(true);
      expect(result.reason).toBe('プレイヤーのチップが不足しています');
      expect(result.winner).toBe('cpu');
    });
  });

  describe('getBettingRoundProgress', () => {
    it('ベッティングラウンドの進行状況を正しく計算する', () => {
      mockGameState.players[0].hasActed = true;

      const progress = getBettingRoundProgress(mockGameState);

      expect(progress.completed).toBe(1);
      expect(progress.total).toBe(2);
      expect(progress.percentage).toBe(50);
    });
  });

  describe('canPlayerAct', () => {
    it('アクション可能なプレイヤーではtrueを返す', () => {
      const player = mockPlayers[0];

      expect(canPlayerAct(player, mockGameState)).toBe(true);
    });

    it('フォールドしたプレイヤーではfalseを返す', () => {
      const player = { ...mockPlayers[0], hasFolded: true };

      expect(canPlayerAct(player, mockGameState)).toBe(false);
    });

    it('オールインしたプレイヤーではfalseを返す', () => {
      const player = { ...mockPlayers[0], isAllIn: true };

      expect(canPlayerAct(player, mockGameState)).toBe(false);
    });

    it('既にアクション済みのプレイヤーではfalseを返す', () => {
      const player = { ...mockPlayers[0], hasActed: true };

      expect(canPlayerAct(player, mockGameState)).toBe(false);
    });
  });

  describe('getPhaseDescription', () => {
    it('各フェーズの説明を正しく返す', () => {
      expect(getPhaseDescription('preflop')).toBe('ホールカード配布後の最初のベッティングラウンド');
      expect(getPhaseDescription('flop')).toBe('3枚のコミュニティカード公開後のベッティングラウンド');
      expect(getPhaseDescription('turn')).toBe('4枚目のコミュニティカード公開後のベッティングラウンド');
      expect(getPhaseDescription('river')).toBe('5枚目のコミュニティカード公開後のベッティングラウンド');
      expect(getPhaseDescription('showdown')).toBe('ハンド比較と勝者決定');
      expect(getPhaseDescription('ended')).toBe('ハンド完了');
    });
  });

  describe('getPhaseOrder', () => {
    it('フェーズの順序を正しく返す', () => {
      const order = getPhaseOrder();

      expect(order).toEqual(['preflop', 'flop', 'turn', 'river', 'showdown', 'ended']);
    });
  });

  describe('getPhaseIndex', () => {
    it('フェーズのインデックスを正しく返す', () => {
      expect(getPhaseIndex('preflop')).toBe(0);
      expect(getPhaseIndex('flop')).toBe(1);
      expect(getPhaseIndex('turn')).toBe(2);
      expect(getPhaseIndex('river')).toBe(3);
      expect(getPhaseIndex('showdown')).toBe(4);
      expect(getPhaseIndex('ended')).toBe(5);
    });
  });

  describe('isPhaseCompleted', () => {
    it('完了したフェーズを正しく判定する', () => {
      expect(isPhaseCompleted('preflop', 'flop')).toBe(true);
      expect(isPhaseCompleted('preflop', 'river')).toBe(true);
      expect(isPhaseCompleted('flop', 'turn')).toBe(true);
      expect(isPhaseCompleted('flop', 'preflop')).toBe(false);
      expect(isPhaseCompleted('river', 'river')).toBe(false);
    });
  });
});

describe('Game Continuation Functions', () => {
  const createPlayer = (id: string, chips: number): Player => ({
    id,
    name: id === 'player' ? 'プレイヤー' : 'CPU',
    chips,
    holeCards: [],
    currentBet: 0,
    hasActed: false,
    hasFolded: false,
    isAllIn: false,
    isDealer: false
  });

  describe('checkGameOver', () => {
    it('両プレイヤーのチップが不足している場合、ゲーム終了を判定する', () => {
      const players = [
        createPlayer('player', 10), // 最小必要額25未満
        createPlayer('cpu', 15)     // 最小必要額25未満
      ];
      const smallBlind = 10;
      const bigBlind = 20;
      const bbAnte = 5;

      const result = checkGameOver(players, smallBlind, bigBlind, bbAnte);

      expect(result.isGameOver).toBe(true);
      expect(result.reason).toBe('両プレイヤーのチップが不足しています');
      expect(result.winner).toBe(null);
    });

    it('プレイヤーのチップが不足している場合、CPUの勝利を判定する', () => {
      const players = [
        createPlayer('player', 20), // 最小必要額25未満
        createPlayer('cpu', 100)    // 十分なチップ
      ];
      const smallBlind = 10;
      const bigBlind = 20;
      const bbAnte = 5;

      const result = checkGameOver(players, smallBlind, bigBlind, bbAnte);

      expect(result.isGameOver).toBe(true);
      expect(result.reason).toBe('プレイヤーのチップが不足しています');
      expect(result.winner).toBe('cpu');
    });

    it('CPUのチップが不足している場合、プレイヤーの勝利を判定する', () => {
      const players = [
        createPlayer('player', 100), // 十分なチップ
        createPlayer('cpu', 20)      // 最小必要額25未満
      ];
      const smallBlind = 10;
      const bigBlind = 20;
      const bbAnte = 5;

      const result = checkGameOver(players, smallBlind, bigBlind, bbAnte);

      expect(result.isGameOver).toBe(true);
      expect(result.reason).toBe('CPUのチップが不足しています');
      expect(result.winner).toBe('player');
    });

    it('両プレイヤーが十分なチップを持っている場合、ゲーム継続を判定する', () => {
      const players = [
        createPlayer('player', 100), // 十分なチップ
        createPlayer('cpu', 100)     // 十分なチップ
      ];
      const smallBlind = 10;
      const bigBlind = 20;
      const bbAnte = 5;

      const result = checkGameOver(players, smallBlind, bigBlind, bbAnte);

      expect(result.isGameOver).toBe(false);
      expect(result.reason).toBe(null);
      expect(result.winner).toBe(null);
    });
  });

  describe('canStartNewHand', () => {
    it('ゲーム終了条件に該当しない場合、新しいハンドを開始できる', () => {
      const players = [
        createPlayer('player', 100),
        createPlayer('cpu', 100)
      ];
      const smallBlind = 10;
      const bigBlind = 20;
      const bbAnte = 5;

      const result = canStartNewHand(players, smallBlind, bigBlind, bbAnte);

      expect(result).toBe(true);
    });

    it('ゲーム終了条件に該当する場合、新しいハンドを開始できない', () => {
      const players = [
        createPlayer('player', 20),
        createPlayer('cpu', 100)
      ];
      const smallBlind = 10;
      const bigBlind = 20;
      const bbAnte = 5;

      const result = canStartNewHand(players, smallBlind, bigBlind, bbAnte);

      expect(result).toBe(false);
    });
  });

  describe('canStartNewGame', () => {
    it('常に新しいゲームを開始できる', () => {
      const result = canStartNewGame();
      expect(result).toBe(true);
    });
  });

  describe('checkHandEndState', () => {
    it('ショーダウンフェーズでゲーム終了条件に該当しない場合、新しいハンドを開始できる', () => {
      const players = [
        createPlayer('player', 100),
        createPlayer('cpu', 100)
      ];
      const gamePhase: GamePhase = 'showdown';
      const smallBlind = 10;
      const bigBlind = 20;
      const bbAnte = 5;

      const result = checkHandEndState(gamePhase, players, smallBlind, bigBlind, bbAnte);

      expect(result.canStartNewHand).toBe(true);
      expect(result.canStartNewGame).toBe(true);
      expect(result.isGameOver).toBe(false);
      expect(result.gameOverReason).toBe(null);
    });

    it('ショーダウンフェーズでゲーム終了条件に該当する場合、新しいハンドを開始できない', () => {
      const players = [
        createPlayer('player', 20),
        createPlayer('cpu', 100)
      ];
      const gamePhase: GamePhase = 'showdown';
      const smallBlind = 10;
      const bigBlind = 20;
      const bbAnte = 5;

      const result = checkHandEndState(gamePhase, players, smallBlind, bigBlind, bbAnte);

      expect(result.canStartNewHand).toBe(false);
      expect(result.canStartNewGame).toBe(true);
      expect(result.isGameOver).toBe(true);
      expect(result.gameOverReason).toBe('プレイヤーのチップが不足しています');
    });

    it('プリフロップフェーズでは新しいハンドを開始できない', () => {
      const players = [
        createPlayer('player', 100),
        createPlayer('cpu', 100)
      ];
      const gamePhase: GamePhase = 'preflop';
      const smallBlind = 10;
      const bigBlind = 20;
      const bbAnte = 5;

      const result = checkHandEndState(gamePhase, players, smallBlind, bigBlind, bbAnte);

      expect(result.canStartNewHand).toBe(false);
      expect(result.canStartNewGame).toBe(true);
      expect(result.isGameOver).toBe(false);
      expect(result.gameOverReason).toBe(null);
    });
  });
}); 