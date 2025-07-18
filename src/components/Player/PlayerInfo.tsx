import type { Player } from '../../types';

interface PlayerInfoProps {
  player: Player;
  isActive?: boolean;
}

export default function PlayerInfo({ player, isActive = false }: PlayerInfoProps) {
  return (
    <div className={`player-info text-center ${isActive ? 'active' : ''}`}>
      <div className="player-name flex items-center justify-center gap-2 mb-2">
        <span className={`name text-lg font-bold transition-colors duration-300 ${
          isActive ? 'text-yellow-300' : 'text-white'
        }`}>
          {player.name}
        </span>
        {player.isDealer && (
          <span className="dealer-button bg-white text-black rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
            D
          </span>
        )}
        {isActive && (
          <span className="active-indicator text-yellow-300 text-sm animate-pulse">
            ▶ あなたのターン
          </span>
        )}
      </div>
      
      <div className="player-stats flex justify-center gap-4 text-sm">
        <div className="chips flex items-center gap-1">
          <span className="label text-gray-300">チップ:</span>
          <span className="value text-yellow-300 font-semibold">
            ${player.chips.toLocaleString()}
          </span>
        </div>
        
        {player.currentBet > 0 && (
          <div className="current-bet flex items-center gap-1">
            <span className="label text-gray-300">ベット:</span>
            <span className="value text-blue-300 font-semibold">
              ${player.currentBet.toLocaleString()}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}