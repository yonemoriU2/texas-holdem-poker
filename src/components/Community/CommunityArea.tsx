import { forwardRef } from 'react';
import CommunityCardArea from './CommunityCardArea';
import type { Card } from '../../types/card';
import type { GamePhase } from '../../types';

interface CommunityAreaProps {
  communityCards: Card[];
  gamePhase: GamePhase;
  pot: number;
  currentBet: number;
  className?: string;
}

const CommunityArea = forwardRef<HTMLDivElement, CommunityAreaProps>(({ 
  communityCards, 
  gamePhase, 
  pot, 
  currentBet, 
  className = '' 
}, ref) => {
  return (
    <div 
      ref={ref}
      className={`community-area ${className} flex flex-col items-center justify-center p-4 bg-green-900 rounded-xl shadow-2xl border-4 border-green-700`}
      data-testid="community-area"
    >
      {/* ポット情報 */}
      <div className="mb-4 text-center">
        <div className="text-white text-lg font-bold mb-2">ポット</div>
        <div className="text-yellow-300 text-2xl font-bold">
          ${pot.toLocaleString()}
        </div>
        {currentBet > 0 && (
          <div className="text-blue-300 text-sm mt-1">
            現在のベット: ${currentBet.toLocaleString()}
          </div>
        )}
      </div>
      
      {/* コミュニティカードエリア */}
      <CommunityCardArea 
        communityCards={communityCards} 
        gamePhase={gamePhase}
        className="w-full"
      />
      
      {/* ゲーム進行状況インジケーター */}
      <div className="mt-4 flex gap-2">
        {['preflop', 'flop', 'turn', 'river', 'showdown'].map((phase, index) => (
          <div
            key={phase}
            className={`w-3 h-3 rounded-full transition-all duration-300 ${
              gamePhase === phase 
                ? 'bg-yellow-400 scale-125' 
                : index < ['preflop', 'flop', 'turn', 'river', 'showdown'].indexOf(gamePhase)
                ? 'bg-green-500'
                : 'bg-gray-600'
            }`}
            title={phase}
          />
        ))}
      </div>
    </div>
  );
});

export default CommunityArea; 