import { useState, useContext } from 'react';
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

  const currentPlayer = state.players[state.activePlayerIndex];
  const isPlayerTurn = currentPlayer && !currentPlayer.hasFolded && !currentPlayer.isAllIn;
  
  const canCheck = state.currentBet === currentPlayer?.currentBet;
  const callAmount = state.currentBet - (currentPlayer?.currentBet || 0);
  const minRaise = state.currentBet * 2;
  const maxBet = currentPlayer?.chips || 0;

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
      <div className={`bg-gray-800 rounded-lg p-6 ${className}`}>
      <div className="mb-4">
        <h3 className="text-white text-lg font-semibold mb-2">アクションを選択</h3>
        <div className="text-gray-300 text-sm">
          <p>ポット: ${state.pot}</p>
          <p>現在のベット: ${state.currentBet}</p>
          <p>あなたのチップ: ${currentPlayer?.chips}</p>
        </div>
      </div>

      <div className="space-y-3">
        {/* フォールドボタン */}
        <Button
          variant="danger"
          onClick={() => handleAction('fold')}
          className="w-full"
        >
          フォールド
        </Button>

        {/* チェック/コールボタン */}
        <Button
          variant={canCheck ? "secondary" : "primary"}
          onClick={() => handleAction(canCheck ? 'check' : 'call', callAmount)}
          className="w-full"
        >
          {canCheck ? 'チェック' : `コール $${callAmount}`}
        </Button>

        {/* ベット/レイズボタン */}
        <Button
          variant="success"
          onClick={() => setShowBetSlider(!showBetSlider)}
          className="w-full"
        >
          {state.currentBet === 0 ? 'ベット' : 'レイズ'}
        </Button>

        {/* オールインボタン */}
        <Button
          variant="danger"
          onClick={() => handleAction('all-in', maxBet)}
          className="w-full"
        >
          オールイン ${maxBet}
        </Button>
      </div>

      {/* ベット額入力エリア */}
      {showBetSlider && (
        <div className="mt-4 p-4 bg-gray-700 rounded-lg">
          <h4 className="text-white font-semibold mb-3">ベット額を設定</h4>
          
          {/* プリセットボタン */}
          <div className="grid grid-cols-3 gap-2 mb-4">
            <Button
              size="sm"
              variant="secondary"
              onClick={() => setBetAmount(presetAmounts.quarter)}
            >
              1/4 ポット
            </Button>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => setBetAmount(presetAmounts.half)}
            >
              1/2 ポット
            </Button>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => setBetAmount(presetAmounts.pot)}
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
              {state.currentBet === 0 ? 'ベット' : 'レイズ'} ${betAmount}
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