import type { Player } from '../../types';

interface PlayerStatusProps {
  player: Player;
  isActive?: boolean;
}

export default function PlayerStatus({ player, isActive = false }: PlayerStatusProps) {
  const getStatusText = () => {
    if (player.hasFolded) return 'フォールド';
    if (player.isAllIn) return 'オールイン';
    if (isActive) return 'アクション中';
    if (player.hasActed) return 'アクション済み';
    return '';
  };

  const getStatusClass = () => {
    if (player.hasFolded) return 'bg-red-600 text-white';
    if (player.isAllIn) return 'bg-purple-600 text-white';
    if (isActive) return 'bg-yellow-500 text-black';
    if (player.hasActed) return 'bg-green-600 text-white';
    return '';
  };

  const statusText = getStatusText();
  const statusClass = getStatusClass();

  if (!statusText) return null;

  return (
    <div className="player-status text-center">
      <span className={`status-text inline-block px-3 py-1 rounded-full text-sm font-semibold transition-all duration-300 ${statusClass}`}>
        {statusText}
      </span>
    </div>
  );
}