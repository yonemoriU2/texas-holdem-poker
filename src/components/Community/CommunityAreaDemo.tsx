import React, { useState } from 'react';
import CommunityArea from './CommunityArea';
import type { Card, GamePhase } from '../../types';

const demoCards: Card[] = [
  { id: '1', suit: 'hearts', rank: 'A' },
  { id: '2', suit: 'diamonds', rank: 'K' },
  { id: '3', suit: 'clubs', rank: 'Q' },
  { id: '4', suit: 'spades', rank: 'J' },
  { id: '5', suit: 'hearts', rank: '10' }
];

const gamePhases: GamePhase[] = ['preflop', 'flop', 'turn', 'river', 'showdown', 'ended'];

export default function CommunityAreaDemo() {
  const [currentPhaseIndex, setCurrentPhaseIndex] = useState(0);
  const [pot, setPot] = useState(1500);
  const [currentBet, setCurrentBet] = useState(0);
  const [autoPlay, setAutoPlay] = useState(false);

  const currentPhase = gamePhases[currentPhaseIndex];

  const nextPhase = () => {
    setCurrentPhaseIndex((prev) => (prev + 1) % gamePhases.length);
    // フェーズが進むごとにポットを増やす
    setPot(prev => prev + Math.floor(Math.random() * 500) + 100);
    setCurrentBet(Math.floor(Math.random() * 200));
  };

  const prevPhase = () => {
    setCurrentPhaseIndex((prev) => (prev - 1 + gamePhases.length) % gamePhases.length);
    setPot(prev => Math.max(100, prev - Math.floor(Math.random() * 300) - 50));
    setCurrentBet(Math.floor(Math.random() * 150));
  };

  const toggleAutoPlay = () => {
    setAutoPlay(!autoPlay);
  };

  const resetPot = () => {
    setPot(1500);
    setCurrentBet(0);
  };

  // オートプレイ機能
  React.useEffect(() => {
    if (!autoPlay) return;

    const interval = setInterval(() => {
      setCurrentPhaseIndex((prev) => (prev + 1) % gamePhases.length);
      setPot(prev => prev + Math.floor(Math.random() * 500) + 100);
      setCurrentBet(Math.floor(Math.random() * 200));
    }, 3000);

    return () => clearInterval(interval);
  }, [autoPlay]);

  return (
    <div className="p-8 bg-gray-900 min-h-screen">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8 text-center">
          コミュニティエリア デモ
        </h1>
        
        <div className="mb-8 flex justify-center">
          <CommunityArea 
            communityCards={demoCards} 
            gamePhase={currentPhase}
            pot={pot}
            currentBet={currentBet}
            className="w-full max-w-2xl"
          />
        </div>
        
        <div className="flex flex-col items-center gap-6">
          <div className="text-white text-lg font-semibold">
            現在のフェーズ: {currentPhase}
          </div>
          
          <div className="flex gap-4 flex-wrap justify-center">
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
            
            <button
              onClick={resetPot}
              className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors"
            >
              ポットリセット
            </button>
          </div>
          
          <div className="flex gap-2 mt-4 flex-wrap justify-center">
            {gamePhases.map((phase, index) => (
              <button
                key={phase}
                onClick={() => {
                  setCurrentPhaseIndex(index);
                  setPot(1500 + index * 200);
                  setCurrentBet(Math.floor(Math.random() * 100));
                }}
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
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6 w-full max-w-2xl">
            <div className="p-4 bg-gray-800 rounded text-white">
              <h3 className="text-lg font-semibold mb-2">ポット情報:</h3>
              <div className="space-y-1 text-sm">
                <div>現在のポット: ${pot.toLocaleString()}</div>
                <div>現在のベット: ${currentBet.toLocaleString()}</div>
                <div>合計: ${(pot + currentBet).toLocaleString()}</div>
              </div>
            </div>
            
            <div className="p-4 bg-gray-800 rounded text-white">
              <h3 className="text-lg font-semibold mb-2">機能説明:</h3>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>ポット額とベット額の表示</li>
                <li>ゲーム進行状況インジケーター</li>
                <li>フェーズ別カード表示</li>
                <li>アニメーション効果</li>
                <li>レスポンシブデザイン</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 