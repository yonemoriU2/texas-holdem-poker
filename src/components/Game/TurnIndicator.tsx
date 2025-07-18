import { useEffect, useState } from 'react';
import type { Player } from '../../types/player';

interface TurnIndicatorProps {
  players: Player[];
  activePlayerIndex: number;
  gamePhase: string;
  className?: string;
}

export default function TurnIndicator({ 
  players, 
  activePlayerIndex, 
  gamePhase, 
  className = '' 
}: TurnIndicatorProps) {
  const [isThinking, setIsThinking] = useState(false);
  const [thinkingTime, setThinkingTime] = useState(0);

  const activePlayer = players[activePlayerIndex];
  const isCPU = activePlayer?.id === 'cpu';

  // CPUの思考時間をシミュレート
  useEffect(() => {
    if (isCPU && activePlayer && !activePlayer.hasFolded && !activePlayer.isAllIn) {
      setIsThinking(true);
      setThinkingTime(0);
      
      const interval = setInterval(() => {
        setThinkingTime(prev => prev + 100);
      }, 100);

      const timer = setTimeout(() => {
        setIsThinking(false);
        setThinkingTime(0);
      }, 1000 + Math.random() * 2000);

      return () => {
        clearInterval(interval);
        clearTimeout(timer);
      };
    } else {
      setIsThinking(false);
      setThinkingTime(0);
    }
  }, [activePlayerIndex, isCPU, activePlayer]);

  const getPlayerStatus = (player: Player, index: number) => {
    if (player.hasFolded) {
      return { status: 'フォールド', color: 'text-red-400', icon: '❌' };
    }
    if (player.isAllIn) {
      return { status: 'オールイン', color: 'text-orange-400', icon: '🔥' };
    }
    if (index === activePlayerIndex) {
      return { status: 'アクティブ', color: 'text-green-400', icon: '▶️' };
    }
    if (player.hasActed) {
      return { status: '完了', color: 'text-blue-400', icon: '✅' };
    }
    return { status: '待機中', color: 'text-gray-400', icon: '⏳' };
  };

  const getPhaseDescription = () => {
    switch (gamePhase) {
      case 'preflop':
        return 'ホールカード配布後のベッティングラウンド';
      case 'flop':
        return 'フロップ（3枚のコミュニティカード）後のベッティングラウンド';
      case 'turn':
        return 'ターン（4枚目のコミュニティカード）後のベッティングラウンド';
      case 'river':
        return 'リバー（5枚目のコミュニティカード）後のベッティングラウンド';
      case 'showdown':
        return 'ハンド比較と勝者決定';
      case 'ended':
        return 'ハンド完了';
      default:
        return '';
    }
  };

  return (
    <div className={`${className}`}>
      {/* 現在のターン表示 */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-semibold text-white">現在のターン</h3>
          <div className="text-sm text-gray-300">
            {gamePhase === 'showdown' || gamePhase === 'ended' ? 'ゲーム終了' : 'ベッティング中'}
          </div>
        </div>

        {activePlayer && gamePhase !== 'showdown' && gamePhase !== 'ended' && (
          <div className={`rounded-lg p-4 border-2 transition-all duration-300 ${
            isCPU ? 'bg-purple-600 border-purple-400' : 'bg-blue-600 border-blue-400'
          }`}>
            <div className="flex items-center justify-between">
              <div>
                <h4 className={`text-xl font-bold ${
                  isCPU ? 'text-purple-100' : 'text-blue-100'
                }`}>
                  {activePlayer.name}のターン
                </h4>
                <p className={`text-sm ${
                  isCPU ? 'text-purple-200' : 'text-blue-200'
                } opacity-90`}>
                  {getPhaseDescription()}
                </p>
                {isCPU && isThinking && (
                  <div className="mt-2">
                    <div className="flex items-center space-x-2">
                      <div className="text-sm text-purple-200">思考中...</div>
                      <div className="flex space-x-1">
                        <div className={`w-2 h-2 rounded-full bg-purple-300 animate-pulse ${
                          thinkingTime > 0 ? 'opacity-100' : 'opacity-50'
                        }`} />
                        <div className={`w-2 h-2 rounded-full bg-purple-300 animate-pulse ${
                          thinkingTime > 500 ? 'opacity-100' : 'opacity-50'
                        }`} />
                        <div className={`w-2 h-2 rounded-full bg-purple-300 animate-pulse ${
                          thinkingTime > 1000 ? 'opacity-100' : 'opacity-50'
                        }`} />
                      </div>
                    </div>
                  </div>
                )}
              </div>
              <div className={`text-3xl ${
                isCPU ? 'text-purple-200' : 'text-blue-200'
              }`}>
                {isCPU ? '🤖' : '👤'}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* プレイヤー状態表示 */}
      <div className="space-y-2">
        {players.map((player, index) => {
          const status = getPlayerStatus(player, index);
          const isActive = index === activePlayerIndex;
          
          return (
            <div
              key={player.id}
              className={`rounded-lg p-3 border transition-all duration-200 ${
                isActive 
                  ? 'bg-green-600 border-green-400' 
                  : 'bg-gray-700 border-gray-600'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`text-lg ${status.icon}`} />
                  <div>
                    <div className={`font-semibold ${
                      isActive ? 'text-green-100' : 'text-white'
                    }`}>
                      {player.name}
                    </div>
                    <div className={`text-sm ${status.color}`}>
                      {status.status}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`font-semibold ${
                    isActive ? 'text-green-100' : 'text-gray-300'
                  }`}>
                    ${player.chips.toLocaleString()}
                  </div>
                  {player.currentBet > 0 && (
                    <div className="text-sm text-yellow-400">
                      ベット: ${player.currentBet}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ベッティングラウンド情報 */}
      {gamePhase !== 'showdown' && gamePhase !== 'ended' && (
        <div className="mt-4 p-3 bg-gray-800 rounded-lg border border-gray-600">
          <div className="text-sm text-gray-300">
            <div className="flex justify-between items-center mb-1">
              <span>ベッティングラウンド:</span>
              <span className="font-semibold text-white capitalize">{gamePhase}</span>
            </div>
            <div className="flex justify-between items-center">
              <span>アクティブプレイヤー:</span>
              <span className="font-semibold text-white">
                {players.filter(p => !p.hasFolded).length}人
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 