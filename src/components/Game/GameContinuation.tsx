import React from 'react';
import { Button } from '../UI';
import type { GameState } from '../../types/game';

interface GameContinuationProps {
  gameState: GameState;
  onNewHand: () => void;
  onNewGame: () => void;
  className?: string;
}

export default function GameContinuation({ 
  gameState, 
  onNewHand, 
  onNewGame, 
  className = '' 
}: GameContinuationProps) {
  const { 
    isGameOver, 
    gameOverReason, 
    canStartNewHand, 
    canStartNewGame,
    players,
    handNumber
  } = gameState;

  // ゲーム終了状態の表示
  if (isGameOver) {
    return (
      <div className={`bg-red-900/80 backdrop-blur-sm rounded-lg p-6 border-2 border-red-600 ${className}`}>
        <div className="text-center">
          <h3 className="text-2xl font-bold text-red-100 mb-4">
            🏁 ゲーム終了
          </h3>
          
          {gameOverReason && (
            <p className="text-red-200 mb-4">
              {gameOverReason}
            </p>
          )}
          
          <div className="mb-6">
            <div className="text-yellow-300 font-semibold text-lg mb-2">
              最終結果
            </div>
            <div className="grid grid-cols-2 gap-4 text-white">
              <div>
                <div className="font-semibold">{players[0].name}</div>
                <div className="text-sm">${players[0].chips.toLocaleString()}</div>
              </div>
              <div>
                <div className="font-semibold">{players[1].name}</div>
                <div className="text-sm">${players[1].chips.toLocaleString()}</div>
              </div>
            </div>
          </div>
          
          <div className="flex justify-center">
            <Button
              variant="primary"
              onClick={onNewGame}
              className="px-8 py-3 text-lg"
            >
              新しいゲームを開始
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // ハンド終了後の継続オプション
  return (
    <div className={`bg-blue-900/80 backdrop-blur-sm rounded-lg p-6 border-2 border-blue-600 ${className}`}>
      <div className="text-center">
        <h3 className="text-2xl font-bold text-blue-100 mb-4">
          🎯 ハンド #{handNumber} 完了
        </h3>
        
        <div className="mb-6">
          <div className="text-yellow-300 font-semibold text-lg mb-2">
            現在のチップ状況
          </div>
          <div className="grid grid-cols-2 gap-4 text-white">
            <div>
              <div className="font-semibold">{players[0].name}</div>
              <div className="text-sm">${players[0].chips.toLocaleString()}</div>
            </div>
            <div>
              <div className="font-semibold">{players[1].name}</div>
              <div className="text-sm">${players[1].chips.toLocaleString()}</div>
            </div>
          </div>
        </div>
        
        <div className="flex justify-center gap-4">
          {canStartNewHand && (
            <Button
              data-testid="new-hand-button"
              variant="primary"
              onClick={onNewHand}
              className="px-6 py-2"
            >
              次のハンド
            </Button>
          )}
          
          {canStartNewGame && (
            <Button
              data-testid="new-game-button"
              variant="secondary"
              onClick={onNewGame}
              className="px-6 py-2"
            >
              新しいゲーム
            </Button>
          )}
        </div>
        
        {!canStartNewHand && (
          <div className="mt-4 text-yellow-200 text-sm">
            チップが不足しているため、新しいハンドを開始できません
          </div>
        )}
      </div>
    </div>
  );
} 