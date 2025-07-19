import { 
  validateGameState, 
  repairGameState, 
  getUserFriendlyErrorMessage, 
  isErrorRecoverable, 
  getErrorSeverity,
  ErrorType,
  type GameError,
  type ValidationResult 
} from '../errorHandling';
import type { GameState } from '../../types/game';

// モックゲーム状態
const createMockGameState = (overrides: Partial<GameState> = {}): GameState => ({
  players: [
    {
      id: 'player',
      name: 'プレイヤー',
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
  ],
  communityCards: [],
  pot: 0,
  currentBet: 0,
  gamePhase: 'preflop',
  activePlayerIndex: 0,
  dealerIndex: 1,
  deck: [],
  winner: null,
  winningHand: null,
  isGameActive: false,
  smallBlind: 10,
  bigBlind: 20,
  bbAnte: 5,
  handNumber: 1,
  blindLevel: 1,
  handsUntilBlindIncrease: 10,
  isGameOver: false,
  gameOverReason: null,
  canStartNewHand: true,
  canStartNewGame: true,
  ...overrides
});

describe('errorHandling', () => {
  describe('validateGameState', () => {
    it('正常なゲーム状態を検証', () => {
      const state = createMockGameState();
      const result = validateGameState(state);
      
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
      expect(result.warnings).toHaveLength(0);
    });

    it('プレイヤー数が不正な場合を検証', () => {
      const state = createMockGameState({
        players: [createMockGameState().players[0]] // 1人だけ
      });
      const result = validateGameState(state);
      
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      const playerCountError = result.errors.find(error => 
        error.message.includes('プレイヤー数が不正です')
      );
      expect(playerCountError).toBeDefined();
      expect(playerCountError?.type).toBe(ErrorType.INVALID_GAME_STATE);
    });

    it('プレイヤーのチップ数が負の値の場合を検証', () => {
      const state = createMockGameState({
        players: [
          { ...createMockGameState().players[0], chips: -100 },
          createMockGameState().players[1]
        ]
      });
      const result = validateGameState(state);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].type).toBe(ErrorType.INVALID_GAME_STATE);
      expect(result.errors[0].message).toContain('チップ数が負の値です');
    });

    it('プレイヤーのベット額が負の値の場合を検証', () => {
      const state = createMockGameState({
        players: [
          { ...createMockGameState().players[0], currentBet: -50 },
          createMockGameState().players[1]
        ]
      });
      const result = validateGameState(state);
      
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      const betError = result.errors.find(error => 
        error.message.includes('ベット額が負の値です')
      );
      expect(betError).toBeDefined();
      expect(betError?.type).toBe(ErrorType.INVALID_GAME_STATE);
    });

    it('ホールカードが多すぎる場合を検証', () => {
      const state = createMockGameState({
        players: [
          { 
            ...createMockGameState().players[0], 
            holeCards: [
              { suit: 'hearts', rank: 'A' },
              { suit: 'diamonds', rank: 'K' },
              { suit: 'clubs', rank: 'Q' } // 3枚目
            ]
          },
          createMockGameState().players[1]
        ]
      });
      const result = validateGameState(state);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].type).toBe(ErrorType.INVALID_CARD_DISTRIBUTION);
      expect(result.errors[0].message).toContain('ホールカードが多すぎます');
    });

    it('矛盾する状態（フォールドとオールイン）を検証', () => {
      const state = createMockGameState({
        players: [
          { 
            ...createMockGameState().players[0], 
            hasFolded: true,
            isAllIn: true
          },
          createMockGameState().players[1]
        ]
      });
      const result = validateGameState(state);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].type).toBe(ErrorType.INVALID_GAME_STATE);
      expect(result.errors[0].message).toContain('フォールドとオールインの両方の状態です');
    });

    it('コミュニティカード数が不正な場合を検証', () => {
      const state = createMockGameState({
        gamePhase: 'flop',
        communityCards: [
          { suit: 'hearts', rank: 'A' },
          { suit: 'diamonds', rank: 'K' }
          // 3枚目が不足
        ]
      });
      const result = validateGameState(state);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].type).toBe(ErrorType.INVALID_CARD_DISTRIBUTION);
      expect(result.errors[0].message).toContain('コミュニティカード数が不正です');
    });

    it('ポット額が負の値の場合を検証', () => {
      const state = createMockGameState({
        pot: -100
      });
      const result = validateGameState(state);
      
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      const potError = result.errors.find(error => 
        error.message.includes('ポット額が負の値です')
      );
      expect(potError).toBeDefined();
      expect(potError?.type).toBe(ErrorType.INVALID_GAME_STATE);
    });

    it('アクティブプレイヤーインデックスが不正な場合を検証', () => {
      const state = createMockGameState({
        activePlayerIndex: 5 // 存在しないインデックス
      });
      const result = validateGameState(state);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].type).toBe(ErrorType.INVALID_GAME_STATE);
      expect(result.errors[0].message).toContain('アクティブプレイヤーインデックスが不正です');
    });
  });

  describe('repairGameState', () => {
    it('負のチップ数を修復', () => {
      const state = createMockGameState({
        players: [
          { ...createMockGameState().players[0], chips: -100 },
          createMockGameState().players[1]
        ]
      });
      
      const repairedState = repairGameState(state);
      
      expect(repairedState.players[0].chips).toBe(0);
      expect(repairedState.players[1].chips).toBe(1000);
    });

    it('負のベット額を修復', () => {
      const state = createMockGameState({
        players: [
          { ...createMockGameState().players[0], currentBet: -50 },
          createMockGameState().players[1]
        ]
      });
      
      const repairedState = repairGameState(state);
      
      expect(repairedState.players[0].currentBet).toBe(0);
      expect(repairedState.players[1].currentBet).toBe(0);
    });

    it('多すぎるホールカードを修復', () => {
      const state = createMockGameState({
        players: [
          { 
            ...createMockGameState().players[0], 
            holeCards: [
              { suit: 'hearts', rank: 'A' },
              { suit: 'diamonds', rank: 'K' },
              { suit: 'clubs', rank: 'Q' }
            ]
          },
          createMockGameState().players[1]
        ]
      });
      
      const repairedState = repairGameState(state);
      
      expect(repairedState.players[0].holeCards).toHaveLength(2);
      expect(repairedState.players[0].holeCards[0]).toEqual({ suit: 'hearts', rank: 'A' });
      expect(repairedState.players[0].holeCards[1]).toEqual({ suit: 'diamonds', rank: 'K' });
    });

    it('矛盾する状態を修復', () => {
      const state = createMockGameState({
        players: [
          { 
            ...createMockGameState().players[0], 
            hasFolded: true,
            isAllIn: true
          },
          createMockGameState().players[1]
        ]
      });
      
      const repairedState = repairGameState(state);
      
      expect(repairedState.players[0].hasFolded).toBe(false);
      expect(repairedState.players[0].isAllIn).toBe(true);
    });

    it('不正なインデックスを修復', () => {
      const state = createMockGameState({
        activePlayerIndex: 5,
        dealerIndex: -1
      });
      
      const repairedState = repairGameState(state);
      
      expect(repairedState.activePlayerIndex).toBe(1); // 最大値に制限
      expect(repairedState.dealerIndex).toBe(0); // 最小値に制限
    });

    it('コミュニティカード数を修復', () => {
      const state = createMockGameState({
        gamePhase: 'flop',
        communityCards: [
          { suit: 'hearts', rank: 'A' },
          { suit: 'diamonds', rank: 'K' },
          { suit: 'clubs', rank: 'Q' },
          { suit: 'spades', rank: 'J' } // 多すぎる
        ]
      });
      
      const repairedState = repairGameState(state);
      
      expect(repairedState.communityCards).toHaveLength(3);
    });
  });

  describe('getUserFriendlyErrorMessage', () => {
    it('各エラータイプのメッセージを取得', () => {
      const errorTypes = [
        ErrorType.INVALID_GAME_STATE,
        ErrorType.INVALID_PLAYER_ACTION,
        ErrorType.INVALID_BET_AMOUNT,
        ErrorType.INVALID_CARD_DISTRIBUTION,
        ErrorType.INVALID_PHASE_TRANSITION,
        ErrorType.INSUFFICIENT_CHIPS,
        ErrorType.UNEXPECTED_ERROR
      ];

      errorTypes.forEach(type => {
        const error: GameError = {
          type,
          message: 'Test message',
          timestamp: Date.now(),
          recoverable: true
        };
        
        const message = getUserFriendlyErrorMessage(error);
        expect(message).toBeTruthy();
        expect(typeof message).toBe('string');
        expect(message.length).toBeGreaterThan(0);
      });
    });
  });

  describe('isErrorRecoverable', () => {
    it('回復可能なエラーを判定', () => {
      const error: GameError = {
        type: ErrorType.INVALID_GAME_STATE,
        message: 'Test',
        timestamp: Date.now(),
        recoverable: true
      };
      
      expect(isErrorRecoverable(error)).toBe(true);
    });

    it('回復不可能なエラーを判定', () => {
      const error: GameError = {
        type: ErrorType.INVALID_GAME_STATE,
        message: 'Test',
        timestamp: Date.now(),
        recoverable: false
      };
      
      expect(isErrorRecoverable(error)).toBe(false);
    });
  });

  describe('getErrorSeverity', () => {
    it('各エラータイプの重要度を判定', () => {
      const testCases = [
        { type: ErrorType.INVALID_GAME_STATE, expected: 'high' },
        { type: ErrorType.INVALID_CARD_DISTRIBUTION, expected: 'high' },
        { type: ErrorType.INVALID_PLAYER_ACTION, expected: 'medium' },
        { type: ErrorType.INVALID_BET_AMOUNT, expected: 'medium' },
        { type: ErrorType.INSUFFICIENT_CHIPS, expected: 'low' },
        { type: ErrorType.INVALID_PHASE_TRANSITION, expected: 'medium' },
        { type: ErrorType.UNEXPECTED_ERROR, expected: 'critical' }
      ];

      testCases.forEach(({ type, expected }) => {
        const error: GameError = {
          type,
          message: 'Test',
          timestamp: Date.now(),
          recoverable: true
        };
        
        expect(getErrorSeverity(error)).toBe(expected);
      });
    });
  });
}); 