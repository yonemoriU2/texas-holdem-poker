import { useContext } from 'react';
import { GameContext } from '../../context/GameContext';
import { Button } from '../UI';

export default function BlindManager() {
  const { state, actions } = useContext(GameContext)!;

  const handleIncreaseBlinds = () => {
    actions.increaseBlinds();
  };

  const handleSetBlindLevel = (level: number) => {
    actions.setBlindLevel(level);
  };

  return (
    <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-4 border border-gray-600">
      <h3 className="text-white text-lg font-semibold mb-3">ブラインド管理</h3>
      
      <div className="space-y-3">
        <div className="text-white/80 text-sm">
          <div>現在のレベル: {state.blindLevel}</div>
          <div>SB/BB: ${state.smallBlind}/${state.bigBlind}</div>
          <div>BBアンティ: ${state.bbAnte}</div>
          <div>次増加まで: {state.handsUntilBlindIncrease}ハンド</div>
        </div>
        
        <div className="flex gap-2">
          <Button
            variant="secondary"
            onClick={handleIncreaseBlinds}
            className="text-sm"
          >
            ブラインド増加
          </Button>
        </div>
        
        <div className="text-white/80 text-sm">
          <div className="mb-2">レベル設定:</div>
          <div className="flex gap-1 flex-wrap">
            {[1, 2, 3, 4, 5].map(level => (
              <Button
                key={level}
                variant={state.blindLevel === level ? "primary" : "secondary"}
                onClick={() => handleSetBlindLevel(level)}
                className="text-xs px-2 py-1"
              >
                L{level}
              </Button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
} 