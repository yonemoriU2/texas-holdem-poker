import { useState, useContext, useEffect } from 'react';
import { GameContext } from '../../context/GameContext';
import { Button, Slider, Modal } from '../UI';
import { validateBetAmount, getPresetBetAmounts } from '../../utils/bettingUtils';
import type { PlayerAction } from '../../types/player';

interface BettingActionsProps {
  className?: string;
}

export default function BettingActions({ className = '' }: BettingActionsProps) {
  const { state, actions } = useContext(GameContext)!;
  const [betAmount, setBetAmount] = useState(0);
  const [showBetSlider, setShowBetSlider] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  const currentPlayer = state.players[state.activePlayerIndex];
  const isPlayerTurn = currentPlayer && !currentPlayer.hasFolded && !currentPlayer.isAllIn;
  
  const canCheck = state.currentBet === currentPlayer?.currentBet;
  const callAmount = state.currentBet - (currentPlayer?.currentBet || 0);
  const minRaise = state.currentBet * 2;
  const maxBet = currentPlayer?.chips || 0;

  // コンポーネント表示アニメーション
  useEffect(() => {
    if (isPlayerTurn) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  }, [isPlayerTurn]);

  const handleAction = (action: PlayerAction, amount?: number) => {
    if (!currentPlayer) return;
    
    actions.playerAction(currentPlayer.id, action, amount);
    setShowBetSlider(false);
    setBetAmount(0);
    setErrorMessage(null);
  };

  const handleBet = () => {
    if (!currentPlayer) return;
    
    const validation = validateBetAmount(betAmount, 'bet', currentPlayer, state);
    if (validation.isValid) {
      handleAction('bet', betAmount);
    } else {
      setErrorMessage(validation.error || '無効なベット額です');
    }
  };

  const handleRaise = () => {
    if (!currentPlayer) return;
    
    const validation = validateBetAmount(betAmount, 'raise', currentPlayer, state);
    if (validation.isValid) {
      handleAction('raise', betAmount);
    } else {
      setErrorMessage(validation.error || '無効なレイズ額です');
    }
  };

  const presetAmounts = getPresetBetAmounts(state.pot, maxBet);

  if (!isPlayerTurn) {
    return null;
  }

  return (
    <>
      <div 
        data-testid="betting-actions"
        className={`bg-gray-800/90 backdrop-blur-sm rounded-lg p-6 border-2 border-gray-600 shadow-2xl transition-all duration-500 ${className} ${
          isVisible ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 translate-y-4'
        }`}>
        <div className="mb-4">
          <h3 className="text-white text-lg font-semibold mb-2 animate-slide-in">アクションを選択</h3>
          <div className="text-gray-300 text-sm space-y-1">
            <p className="animate-fade-in-up" style={{ animationDelay: '0.1s' }}>ポット: ${state.pot.toLocaleString()}</p>
            <p className="animate-fade-in-up" style={{ animationDelay: '0.2s' }}>現在のベット: ${state.currentBet.toLocaleString()}</p>
            <p className="animate-fade-in-up" style={{ animationDelay: '0.3s' }}>あなたのチップ: ${currentPlayer?.chips.toLocaleString()}</p>
          </div>
        </div>

        <div className="space-y-3">
          {/* フォールドボタン */}
          <Button
            variant="danger"
            onClick={() => handleAction('fold')}
            className="w-full"
            animate={true}
          >
            フォールド
          </Button>

          {/* チェック/コールボタン */}
          <Button
            variant={canCheck ? "secondary" : "primary"}
            onClick={() => handleAction(canCheck ? 'check' : 'call', callAmount)}
            className="w-full"
            animate={true}
          >
            {canCheck ? 'チェック' : `コール $${callAmount.toLocaleString()}`}
          </Button>

          {/* ベット/レイズボタン */}
          <Button
            variant="success"
            onClick={() => setShowBetSlider(!showBetSlider)}
            className="w-full"
            animate={true}
          >
            {state.currentBet === 0 ? 'ベット' : 'レイズ'}
          </Button>

          {/* オールインボタン */}
          <Button
            variant="danger"
            onClick={() => handleAction('all-in', maxBet)}
            className="w-full"
            animate={true}
          >
            オールイン ${maxBet.toLocaleString()}
          </Button>
        </div>

        {/* ベット額入力エリア */}
        {showBetSlider && (
          <div className="mt-4 p-4 bg-gray-700/80 backdrop-blur-sm rounded-lg border border-gray-600 animate-fade-in-up">
            <h4 className="text-white font-semibold mb-3">ベット額を設定</h4>
            
            {/* プリセットボタン */}
            <div className="grid grid-cols-3 gap-2 mb-4">
              <Button
                size="sm"
                variant="secondary"
                onClick={() => setBetAmount(presetAmounts.quarter)}
                className="animate-slide-in"
                style={{ animationDelay: '0.1s' }}
              >
                1/4 ポット
              </Button>
              <Button
                size="sm"
                variant="secondary"
                onClick={() => setBetAmount(presetAmounts.half)}
                className="animate-slide-in"
                style={{ animationDelay: '0.2s' }}
              >
                1/2 ポット
              </Button>
              <Button
                size="sm"
                variant="secondary"
                onClick={() => setBetAmount(presetAmounts.pot)}
                className="animate-slide-in"
                style={{ animationDelay: '0.3s' }}
              >
                ポット
              </Button>
            </div>

            {/* スライダー */}
            <Slider
              value={betAmount}
              min={state.currentBet === 0 ? 1 : minRaise}
              max={maxBet}
              onChange={setBetAmount}
              className="mb-4"
            />

            {/* アクションボタン */}
            <div className="flex gap-2">
              <Button
                variant="primary"
                onClick={state.currentBet === 0 ? handleBet : handleRaise}
                disabled={betAmount === 0}
                className="flex-1"
              >
                {state.currentBet === 0 ? 'ベット' : 'レイズ'} ${betAmount.toLocaleString()}
              </Button>
              <Button
                variant="secondary"
                onClick={() => setShowBetSlider(false)}
                className="flex-1"
              >
                キャンセル
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* エラーモーダル */}
      <Modal
        isOpen={!!errorMessage}
        onClose={() => setErrorMessage(null)}
        title="エラー"
        variant="error"
      >
        <p className="text-red-600">{errorMessage}</p>
      </Modal>
    </>
  );
} 