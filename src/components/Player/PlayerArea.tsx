import type { Player } from '../../types';
import PlayerInfo from './PlayerInfo';
import PlayerCards from './PlayerCards';
import PlayerStatus from './PlayerStatus';

interface PlayerAreaProps {
  player: Player;
  isActive?: boolean;
  showCards?: boolean;
  className?: string;
}

export default function PlayerArea({ 
  player, 
  isActive = false, 
  showCards = false, 
  className = '' 
}: PlayerAreaProps) {
  return (
    <div className={`player-area bg-green-700/30 backdrop-blur-sm rounded-xl p-6 border-2 transition-all duration-300 ${className} ${
      isActive 
        ? 'border-yellow-400 shadow-lg shadow-yellow-400/50 scale-105' 
        : 'border-green-600'
    }`}>
      <PlayerInfo player={player} isActive={isActive} />
      
      <div className="player-cards-container flex justify-center my-4">
        <PlayerCards 
          cards={player.holeCards} 
          isVisible={showCards} 
          size="medium" 
        />
      </div>
      
      <PlayerStatus player={player} isActive={isActive} />
    </div>
  );
}