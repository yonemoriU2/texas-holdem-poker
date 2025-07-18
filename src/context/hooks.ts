import { useContext } from 'react';
import { GameContext } from './GameContext';

// Context を使用するためのカスタムフック
export function useGame() {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
}

// 個別のフック
export function useGameState() {
  const { state } = useGame();
  return state;
}

export function useGameActions() {
  const { actions } = useGame();
  return actions;
}

export function useGameDispatch() {
  const { dispatch } = useGame();
  return dispatch;
}