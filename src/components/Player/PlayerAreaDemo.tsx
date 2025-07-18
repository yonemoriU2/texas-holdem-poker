import { useState } from 'react';
import PlayerArea from './PlayerArea';
import type { Player } from '../../types';

const mockPlayers: Player[] = [
  {
    id: 'player',
    name: 'プレイヤー',
    chips: 1500,
    holeCards: [
      { rank: 'A', suit: 'hearts', id: 'A-hearts' },
      { rank: 'K', suit: 'spades', id: 'K-spades' }
    ],
    currentBet: 100,
    hasActed: false,
    hasFolded: false,
    isAllIn: false,
    isDealer: false
  },
  {
    id: 'cpu',
    name: 'CPU',
    chips: 850,
    holeCards: [
      { rank: 'Q', suit: 'diamonds', id: 'Q-diamonds' },
      { rank: 'J', suit: 'clubs', id: 'J-clubs' }
    ],
    currentBet: 50,
    hasActed: true,
    hasFolded: false,
    isAllIn: false,
    isDealer: true
  }
];

export default function PlayerAreaDemo() {
  const [showPlayerCards, setShowPlayerCards] = useState(true);
  const [showCpuCards, setShowCpuCards] = useState(false);
  const [activePlayer, setActivePlayer] = useState<string>('player');

  const togglePlayerCards = () => setShowPlayerCards(!showPlayerCards);
  const toggleCpuCards = () => setShowCpuCards(!showCpuCards);
  const switchActivePlayer = () => setActivePlayer(activePlayer === 'player' ? 'cpu' : 'player');

  return (
    <div className="min-h-screen bg-poker-green p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8 text-center">
          プレイヤーエリアコンポーネント デモ
        </h1>
        
        <div className="flex justify-center gap-4 mb-8">
          <button
            onClick={togglePlayerCards}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            プレイヤーカード表示切替
          </button>
          <button
            onClick={toggleCpuCards}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            CPUカード表示切替
          </button>
          <button
            onClick={switchActivePlayer}
            className="px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700"
          >
            アクティブプレイヤー切替
          </button>
        </div>
        
        <div className="flex justify-between items-center max-w-4xl mx-auto">
          <div className="flex flex-col items-center">
            <h2 className="text-xl font-semibold text-white mb-4">CPU</h2>
            <PlayerArea
              player={mockPlayers[1]}
              isActive={activePlayer === 'cpu'}
              showCards={showCpuCards}
              className="transform rotate-180"
            />
          </div>
          
          <div className="flex flex-col items-center">
            <h2 className="text-xl font-semibold text-white mb-4">プレイヤー</h2>
            <PlayerArea
              player={mockPlayers[0]}
              isActive={activePlayer === 'player'}
              showCards={showPlayerCards}
            />
          </div>
        </div>
        
        <div className="mt-8 text-center text-white">
          <p className="text-lg">
            アクティブプレイヤー: <span className="font-bold">{activePlayer === 'player' ? 'プレイヤー' : 'CPU'}</span>
          </p>
        </div>
      </div>
    </div>
  );
}