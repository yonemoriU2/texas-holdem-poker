import React, { createContext, useReducer, useEffect, useState, useCallback } from 'react';
import type { ReactNode } from 'react';
import type { GameState, GameAction, GameConfig } from '../types/game';
import type { PlayerAction } from '../types/player';
import { gameReducer, createInitialGameState } from './gameReducer';
import { decideAIActionSync } from '../utils/aiLogic';
import { validateGameState, repairGameState, logError, type GameError } from '../utils/errorHandling';

// Context の型定義
interface GameContextType {
  state: GameState;
  dispatch: React.Dispatch<GameAction>;
  errors: GameError[];
  actions: {
    startGame: () => void;
    dealCards: () => void;
    playerAction: (playerId: string, action: string, amount?: number) => void;
    nextPhase: () => void;
    evaluateHands: () => void;
    determineWinner: () => void;
    distributePot: () => void;
    newHand: () => void;
    resetGame: () => void;
    setActivePlayer: (playerIndex: number) => void;
    increaseBlinds: () => void;
    setBlindLevel: (level: number) => void;
    checkGameOver: () => void;
    startNewGame: () => void;
    // エラーハンドリング関連
    validateState: () => void;
    repairState: () => void;
    dismissError: (errorIndex: number) => void;
    clearAllErrors: () => void;
  };
}

// Context の作成
// eslint-disable-next-line react-refresh/only-export-components
export const GameContext = createContext<GameContextType | undefined>(undefined);

// Provider の Props
interface GameProviderProps {
  children: ReactNode;
  config?: GameConfig;
}

// Provider コンポーネント
export function GameProvider({ children, config }: GameProviderProps) {
  const [state, dispatch] = useReducer(gameReducer, createInitialGameState(config));
  const [errors, setErrors] = useState<GameError[]>([]);

  // エラーハンドリング関数
  const validateState = useCallback(() => {
    const validation = validateGameState(state);
    if (!validation.isValid) {
      const newErrors = validation.errors.map(error => {
        logError(error);
        return error;
      });
      setErrors(prev => [...prev, ...newErrors]);
    }
  }, [state]);

  const repairState = useCallback(() => {
    const repairedState = repairGameState(state);
    dispatch({ type: 'REPAIR_STATE', payload: { repairedState } });
    setErrors([]); // エラーをクリア
  }, [state, dispatch]);

  const dismissError = useCallback((errorIndex: number) => {
    setErrors(prev => prev.filter((_, index) => index !== errorIndex));
  }, []);

  const clearAllErrors = useCallback(() => {
    setErrors([]);
  }, []);

  // アクションヘルパー
  const actions = {
    startGame: () => dispatch({ type: 'START_GAME' }),
    dealCards: () => dispatch({ type: 'DEAL_CARDS' }),
    playerAction: (playerId: string, action: string, amount?: number) => 
      dispatch({ 
        type: 'PLAYER_ACTION', 
        payload: { playerId, action: action as PlayerAction, amount } 
      }),
    nextPhase: () => dispatch({ type: 'NEXT_PHASE' }),
    evaluateHands: () => dispatch({ type: 'EVALUATE_HANDS' }),
    determineWinner: () => dispatch({ type: 'DETERMINE_WINNER' }),
    distributePot: () => dispatch({ type: 'DISTRIBUTE_POT' }),
    newHand: () => dispatch({ type: 'NEW_HAND' }),
    resetGame: () => dispatch({ type: 'RESET_GAME' }),
    setActivePlayer: (playerIndex: number) => 
      dispatch({ type: 'SET_ACTIVE_PLAYER', payload: { playerIndex } }),
    increaseBlinds: () => dispatch({ type: 'INCREASE_BLINDS' }),
    setBlindLevel: (level: number) => 
      dispatch({ type: 'SET_BLIND_LEVEL', payload: { level } }),
    checkGameOver: () => dispatch({ type: 'CHECK_GAME_OVER' }),
    startNewGame: () => dispatch({ type: 'START_NEW_GAME' }),
    // エラーハンドリング関連
    validateState,
    repairState,
    dismissError,
    clearAllErrors
  };

  // AIの自動アクション処理
  useEffect(() => {
    if (!state.isGameActive || state.gamePhase === 'showdown' || state.gamePhase === 'ended') {
      return;
    }

    const currentPlayer = state.players[state.activePlayerIndex];
    if (!currentPlayer || currentPlayer.id !== 'cpu' || currentPlayer.hasFolded || currentPlayer.isAllIn) {
      return;
    }

    // CPUの思考時間をシミュレート
    const timer = setTimeout(() => {
      const aiAction = decideAIActionSync(currentPlayer, state);
      actions.playerAction('cpu', aiAction.action, aiAction.amount);
    }, 1000 + Math.random() * 2000); // 1-3秒のランダムな思考時間

    return () => clearTimeout(timer);
  }, [state.activePlayerIndex, state.players, state.isGameActive, state.gamePhase, actions]);

  return (
    <GameContext.Provider value={{ state, dispatch, actions, errors }}>
      {children}
    </GameContext.Provider>
  );
}

