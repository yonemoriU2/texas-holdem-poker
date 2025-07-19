import { useEffect, useState } from 'react';
import type { Player } from '../../types';
import PlayerInfo from './PlayerInfo';
import PlayerCards from './PlayerCards';
import PlayerStatus from './PlayerStatus';

interface PlayerAreaProps {
  player: Player;
  isActive?: boolean;
  showCards?: boolean;
  className?: string;
  dealAnimation?: boolean;
  flipAnimation?: boolean;
}

export default function PlayerArea({ 
  player, 
  isActive = false, 
  showCards = false, 
  className = '',
  dealAnimation = false,
  flipAnimation = false
}: PlayerAreaProps) {
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (isActive) {
      setIsAnimating(true);
      const timer = setTimeout(() => setIsAnimating(false), 1000);
      return () => clearTimeout(timer);
    }
  }, [isActive]);

  return (
    <div 
      data-testid={player.id === 'player' ? 'player-area' : 'cpu-area'}
      className={`player-area bg-green-700/30 backdrop-blur-sm rounded-xl p-6 border-2 transition-all duration-500 ${className} ${
        isActive 
          ? 'border-yellow-400 shadow-lg shadow-yellow-400/50 scale-105 animate-pulse' 
          : 'border-green-600'
      } ${
        isAnimating ? 'animate-fade-in-up' : ''
      }`}>
      <PlayerInfo player={player} isActive={isActive} />
      
      <div className="player-cards-container flex justify-center my-4">
        <PlayerCards 
          cards={player.holeCards} 
          isVisible={showCards} 
          size="medium"
          dealAnimation={dealAnimation}
          flipAnimation={flipAnimation}
        />
      </div>
      
      <PlayerStatus player={player} isActive={isActive} />
    </div>
  );
}