import type { GamePhase } from '../../types/game';

interface PhaseIndicatorProps {
  currentPhase: GamePhase;
  className?: string;
}

const phaseConfig = {
  preflop: {
    label: 'プリフロップ',
    description: 'ホールカード配布後、最初のベッティングラウンド',
    color: 'bg-blue-500',
    textColor: 'text-blue-100',
    borderColor: 'border-blue-400'
  },
  flop: {
    label: 'フロップ',
    description: '3枚のコミュニティカードが公開',
    color: 'bg-green-500',
    textColor: 'text-green-100',
    borderColor: 'border-green-400'
  },
  turn: {
    label: 'ターン',
    description: '4枚目のコミュニティカードが公開',
    color: 'bg-yellow-500',
    textColor: 'text-yellow-100',
    borderColor: 'border-yellow-400'
  },
  river: {
    label: 'リバー',
    description: '5枚目のコミュニティカードが公開',
    color: 'bg-purple-500',
    textColor: 'text-purple-100',
    borderColor: 'border-purple-400'
  },
  showdown: {
    label: 'ショーダウン',
    description: 'ハンド比較と勝者決定',
    color: 'bg-red-500',
    textColor: 'text-red-100',
    borderColor: 'border-red-400'
  },
  ended: {
    label: 'ゲーム終了',
    description: 'ハンド完了',
    color: 'bg-gray-500',
    textColor: 'text-gray-100',
    borderColor: 'border-gray-400'
  }
};

const phaseOrder: GamePhase[] = ['preflop', 'flop', 'turn', 'river', 'showdown', 'ended'];

export default function PhaseIndicator({ currentPhase, className = '' }: PhaseIndicatorProps) {
  const currentIndex = phaseOrder.indexOf(currentPhase);

  return (
    <div className={`${className}`}>
      {/* フェーズ進行バー */}
      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-lg font-semibold text-white">ゲームフェーズ</h3>
          <span className="text-sm text-gray-300">
            {currentIndex + 1} / {phaseOrder.length}
          </span>
        </div>
        
        <div className="flex space-x-1">
          {phaseOrder.map((phase, index) => {
            const config = phaseConfig[phase];
            const isActive = phase === currentPhase;
            const isCompleted = index < currentIndex;
            
            return (
              <div
                key={phase}
                className={`flex-1 h-2 rounded-full transition-all duration-300 ${
                  isActive 
                    ? `${config.color} ${config.borderColor} border-2` 
                    : isCompleted 
                    ? 'bg-green-400' 
                    : 'bg-gray-600'
                }`}
              />
            );
          })}
        </div>
      </div>

      {/* 現在のフェーズ表示 */}
      <div className={`rounded-lg p-4 border-2 transition-all duration-300 ${phaseConfig[currentPhase].color} ${phaseConfig[currentPhase].borderColor}`}>
        <div className="flex items-center justify-between">
          <div>
            <h4 className={`text-xl font-bold ${phaseConfig[currentPhase].textColor}`}>
              {phaseConfig[currentPhase].label}
            </h4>
            <p className={`text-sm ${phaseConfig[currentPhase].textColor} opacity-90`}>
              {phaseConfig[currentPhase].description}
            </p>
          </div>
          <div className={`text-3xl ${phaseConfig[currentPhase].textColor}`}>
            {currentPhase === 'preflop' && '🃏'}
            {currentPhase === 'flop' && '🎴'}
            {currentPhase === 'turn' && '🃏'}
            {currentPhase === 'river' && '🎴'}
            {currentPhase === 'showdown' && '🏆'}
            {currentPhase === 'ended' && '✅'}
          </div>
        </div>
      </div>

      {/* フェーズ詳細情報 */}
      <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-gray-300">
        {phaseOrder.map((phase, index) => {
          const config = phaseConfig[phase];
          const isActive = phase === currentPhase;
          const isCompleted = index < currentIndex;
          
          return (
            <div
              key={phase}
              className={`p-2 rounded transition-all duration-200 ${
                isActive 
                  ? `${config.color} ${config.textColor}` 
                  : isCompleted 
                  ? 'bg-green-600 text-green-100' 
                  : 'bg-gray-700 text-gray-400'
              }`}
            >
              <div className="font-semibold">{config.label}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}