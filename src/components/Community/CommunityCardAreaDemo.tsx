import React, { useState } from 'react';
import CommunityCardArea from './CommunityCardArea';
import type { Card, GamePhase } from '../../types';

const demoCards: Card[] = [
  { id: '1', suit: 'hearts', rank: 'A' },
  { id: '2', suit: 'diamonds', rank: 'K' },
  { id: '3', suit: 'clubs', rank: 'Q' },
  { id: '4', suit: 'spades', rank: 'J' },
  { id: '5', suit: 'hearts', rank: '10' }
];

const gamePhases: GamePhase[] = ['preflop', 'flop', 'turn', 'river', 'showdown', 'ended'];

export default function CommunityCardAreaDemo() {
  const [currentPhaseIndex, setCurrentPhaseIndex] = useState(0);
  const [autoPlay, setAutoPlay] = useState(false);

  const currentPhase = gamePhases[currentPhaseIndex];

  const nextPhase = () => {
    setCurrentPhaseIndex((prev) => (prev + 1) % gamePhases.length);
  };

  const prevPhase = () => {
    setCurrentPhaseIndex((prev) => (prev - 1 + gamePhases.length) % gamePhases.length);
  };

  const toggleAutoPlay = () => {
    setAutoPlay(!autoPlay);
  };

  // オートプレイ機能
  React.useEffect(() => {
    if (!autoPlay) return;

    const interval = setInterval(() => {
      setCurrentPhaseIndex((prev) => (prev + 1) % gamePhases.length);
    }, 2000);

    return () => clearInterval(interval);
  }, [autoPlay]);

  return (
    <div className="p-8 bg-gray-900 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8 text-center">
          コミュニティカードエリア デモ
        </h1>
        
        <div className="mb-8">
          <CommunityCardArea 
            communityCards={demoCards} 
            gamePhase={currentPhase}
            className="mx-auto"
          />
        </div>
        
        <div className="flex flex-col items-center gap-4">
          <div className="text-white text-lg font-semibold">
            現在のフェーズ: {currentPhase}
          </div>
          
          <div className="flex gap-4">
            <button
              onClick={prevPhase}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            >
              前のフェーズ
            </button>
            
            <button
              onClick={nextPhase}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
            >
              次のフェーズ
            </button>
            
            <button
              onClick={toggleAutoPlay}
              className={`px-4 py-2 rounded transition-colors ${
                autoPlay 
                  ? 'bg-red-600 hover:bg-red-700 text-white' 
                  : 'bg-yellow-600 hover:bg-yellow-700 text-white'
              }`}
            >
              {autoPlay ? 'オートプレイ停止' : 'オートプレイ開始'}
            </button>
          </div>
          
          <div className="flex gap-2 mt-4">
            {gamePhases.map((phase, index) => (
              <button
                key={phase}
                onClick={() => setCurrentPhaseIndex(index)}
                className={`px-3 py-1 rounded text-sm transition-colors ${
                  index === currentPhaseIndex
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-600 text-gray-300 hover:bg-gray-500'
                }`}
              >
                {phase}
              </button>
            ))}
          </div>
        </div>
        
        <div className="mt-8 p-4 bg-gray-800 rounded text-white">
          <h3 className="text-lg font-semibold mb-2">機能説明:</h3>
          <ul className="list-disc list-inside space-y-1 text-sm">
            <li>各フェーズに応じて段階的にカードが表示されます</li>
            <li>プリフロップ: カードなし</li>
            <li>フロップ: 3枚のカード</li>
            <li>ターン: 4枚のカード</li>
            <li>リバー/ショーダウン/終了: 5枚のカード</li>
            <li>フェーズ遷移時にアニメーション効果が適用されます</li>
            <li>カード配布時に順次アニメーションが実行されます</li>
          </ul>
        </div>
      </div>
    </div>
  );
} 