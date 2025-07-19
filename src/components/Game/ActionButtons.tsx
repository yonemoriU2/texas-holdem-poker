import { useState } from 'react';
import type { Player, GameState } from '../../types';

interface ActionButtonsProps {
  player: Player;
  gameState: GameState;
  onAction: (action: string, amount?: number) => void;
  className?: string;
}

interface ActionOption {
  action: string;
  label: string;
  variant: 'primary' | 'secondary' | 'danger';
  disabled?: boolean;
}

export default function ActionButtons({ 
  player, 
  gameState, 
  onAction, 
  className = '' 
}: ActionButtonsProps) {
  const [showBetInput, setShowBetInput] = useState(false);
  const [betAmount, setBetAmount] = useState(0);

  // プレイヤーがアクション可能かチェック
  const canPlayerAct = (): boolean => {
    return !player.hasFolded && 
           !player.isAllIn && 
           !player.hasActed && 
           gameState.isGameActive &&
           gameState.gamePhase !== 'showdown' &&
           gameState.gamePhase !== 'ended';
  };

  // 利用可能なアクションを取得
  const getAvailableActions = (): ActionOption[] => {
    if (!canPlayerAct()) {
      return [];
    }

    const actions: ActionOption[] = [];
    const callAmount = gameState.currentBet - player.currentBet;
    const canCheck = callAmount === 0;
    const canCall = callAmount > 0 && callAmount <= player.chips;
    const canBet = gameState.currentBet === 0 && player.chips > 0;
    const canRaise = gameState.currentBet > 0 && player.chips > callAmount;

    // フォールド（常に可能）
    actions.push({
      action: 'fold',
      label: 'フォールド',
      variant: 'danger'
    });

    // チェック/コール
    if (canCheck) {
      actions.push({
        action: 'check',
        label: 'チェック',
        variant: 'secondary'
      });
    } else if (canCall) {
      actions.push({
        action: 'call',
        label: `コール ($${callAmount})`,
        variant: 'secondary'
      });
    }

    // ベット/レイズ
    if (canBet) {
      actions.push({
        action: 'bet',
        label: 'ベット',
        variant: 'primary'
      });
    } else if (canRaise) {
      actions.push({
        action: 'raise',
        label: 'レイズ',
        variant: 'primary'
      });
    }

    // オールイン（チップが残っている場合）
    if (player.chips > 0) {
      actions.push({
        action: 'all-in',
        label: `オールイン ($${player.chips})`,
        variant: 'primary'
      });
    }

    return actions;
  };

  // ボタンのスタイルを取得
  const getButtonStyle = (variant: string): string => {
    const baseStyle = 'px-6 py-3 rounded-lg font-semibold text-sm transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-lg';
    
    switch (variant) {
      case 'primary':
        return `${baseStyle} bg-green-600 hover:bg-green-700 text-white border-2 border-green-500`;
      case 'secondary':
        return `${baseStyle} bg-blue-600 hover:bg-blue-700 text-white border-2 border-blue-500`;
      case 'danger':
        return `${baseStyle} bg-red-600 hover:bg-red-700 text-white border-2 border-red-500`;
      default:
        return `${baseStyle} bg-gray-600 hover:bg-gray-700 text-white border-2 border-gray-500`;
    }
  };

  // アクションを実行
  const handleAction = (action: string) => {
    if (action === 'bet' || action === 'raise') {
      setShowBetInput(true);
      // 最小ベット額を設定
      const minBet = action === 'bet' ? gameState.bigBlind : gameState.currentBet * 2;
      setBetAmount(Math.min(minBet, player.chips));
    } else {
      onAction(action);
    }
  };

  // ベット額を確定
  const handleBetConfirm = () => {
    if (betAmount > 0 && betAmount <= player.chips) {
      onAction(showBetInput ? 'bet' : 'raise', betAmount);
      setShowBetInput(false);
      setBetAmount(0);
    }
  };

  // ベット入力をキャンセル
  const handleBetCancel = () => {
    setShowBetInput(false);
    setBetAmount(0);
  };

  const availableActions = getAvailableActions();

  if (!canPlayerAct()) {
    return (
      <div 
        data-testid="action-buttons"
        className={`action-buttons text-center ${className}`}
      >
        <div className="no-actions text-gray-400 text-sm">
          アクション待機中...
        </div>
      </div>
    );
  }

  if (showBetInput) {
    const callAmount = gameState.currentBet - player.currentBet;
    const minBet = gameState.currentBet === 0 ? gameState.bigBlind : gameState.currentBet + gameState.bigBlind;
    const maxBet = player.chips;

    return (
      <div 
        data-testid="action-buttons"
        className={`action-buttons ${className}`}
      >
        <div className="bet-input-area bg-gray-800/80 backdrop-blur-sm rounded-xl p-4 border-2 border-yellow-400">
          <div className="bet-info text-center mb-4">
            <h3 className="text-lg font-bold text-yellow-300 mb-2">
              ベット額を選択
            </h3>
            <div className="bet-range text-sm text-gray-300">
              最小: ${minBet} / 最大: ${maxBet}
            </div>
          </div>

          <div className="bet-slider mb-4">
            <input
              type="range"
              min={minBet}
              max={maxBet}
              value={betAmount}
              onChange={(e) => setBetAmount(Number(e.target.value))}
              className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
              data-testid="bet-slider"
            />
            <div className="bet-amount text-center mt-2">
              <span className="text-2xl font-bold text-yellow-300">
                ${betAmount.toLocaleString()}
              </span>
            </div>
          </div>

          <div className="preset-buttons grid grid-cols-3 gap-2 mb-4">
            <button
              onClick={() => setBetAmount(Math.min(Math.floor(gameState.pot / 2), maxBet))}
              className="preset-btn bg-gray-700 hover:bg-gray-600 text-white px-3 py-2 rounded text-sm"
              data-testid="half-pot-btn"
            >
              ポット半分
            </button>
            <button
              onClick={() => setBetAmount(Math.min(gameState.pot, maxBet))}
              className="preset-btn bg-gray-700 hover:bg-gray-600 text-white px-3 py-2 rounded text-sm"
              data-testid="pot-btn"
            >
              ポット
            </button>
            <button
              onClick={() => setBetAmount(maxBet)}
              className="preset-btn bg-gray-700 hover:bg-gray-600 text-white px-3 py-2 rounded text-sm"
              data-testid="all-in-btn"
            >
              オールイン
            </button>
          </div>

          <div className="bet-actions flex gap-3 justify-center">
            <button
              onClick={handleBetCancel}
              className="cancel-btn bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-lg"
              data-testid="cancel-bet-btn"
            >
              キャンセル
            </button>
            <button
              onClick={handleBetConfirm}
              disabled={betAmount < minBet || betAmount > maxBet}
              className="confirm-btn bg-green-600 hover:bg-green-700 disabled:bg-gray-500 disabled:cursor-not-allowed text-white px-6 py-2 rounded-lg"
              data-testid="confirm-bet-btn"
            >
              確定
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      data-testid="action-buttons"
      className={`action-buttons ${className}`}
    >
      <div className="actions-grid grid grid-cols-2 md:grid-cols-4 gap-3 max-w-2xl mx-auto">
        {availableActions.map((actionOption) => (
          <button
            key={actionOption.action}
            onClick={() => handleAction(actionOption.action)}
            className={getButtonStyle(actionOption.variant)}
            disabled={actionOption.disabled}
            data-testid={`${actionOption.action}-btn`}
          >
            {actionOption.label}
          </button>
        ))}
      </div>

      {/* アクション情報 */}
      <div className="action-info text-center mt-4 text-sm text-gray-400">
        <div>現在のベット: ${gameState.currentBet}</div>
        <div>ポット: ${gameState.pot}</div>
        {gameState.currentBet > player.currentBet && (
          <div>コール額: ${gameState.currentBet - player.currentBet}</div>
        )}
      </div>
    </div>
  );
}