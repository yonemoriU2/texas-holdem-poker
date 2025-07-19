import React, { useState } from 'react';
import { decideAIAction, getAIPersonality, type AIPersonality } from '../../utils/aiLogic';
import { decideAdvancedAIAction, addRandomnessToAction, adjustPersonality } from '../../utils/advancedAI';
import type { Player, PlayerAction } from '../../types/player';
import type { GameState } from '../../types/game';

interface AILogicDemoProps {
  className?: string;
}

export const AILogicDemo: React.FC<AILogicDemoProps> = ({ className = '' }) => {
  const [aiAction, setAiAction] = useState<any | null>(null);
  const [advancedAction, setAdvancedAction] = useState<any | null>(null);
  const [personality, setPersonality] = useState<AIPersonality>(getAIPersonality());
  const [isThinking, setIsThinking] = useState(false);
  const [opponentHistory, setOpponentHistory] = useState<PlayerAction[]>([]);

  // モックプレイヤーとゲーム状態
  const mockPlayer: Player = {
    id: 'cpu-1',
    name: 'CPU',
    chips: 1000,
    holeCards: [
      { rank: 'A', suit: 'hearts', id: 'A-hearts' },
      { rank: 'K', suit: 'hearts', id: 'K-hearts' }
    ],
    currentBet: 0,
    hasActed: false,
    hasFolded: false,
    isAllIn: false,
    isDealer: false
  };

  const mockGameState: GameState = {
    players: [mockPlayer],
    communityCards: [],
    pot: 100,
    currentBet: 10,
    gamePhase: 'preflop',
    activePlayerIndex: 0,
    dealerIndex: 1,
    deck: [],
    winner: null,
    winningHand: null,
    isGameActive: true,
    isGameOver: false,
    gameOverReason: null,
    canStartNewHand: false,
    canStartNewGame: false,
    smallBlind: 5,
    bigBlind: 10,
    bbAnte: 0,
    handNumber: 1,
    blindLevel: 1,
    handsUntilBlindIncrease: 10
  };

  const testBasicAI = async () => {
    setIsThinking(true);
    try {
      const action = await decideAIAction(mockPlayer, mockGameState, 1000);
      setAiAction(action);
    } catch (error) {
      console.error('AI action error:', error);
    } finally {
      setIsThinking(false);
    }
  };

  const testAdvancedAI = () => {
    const action = decideAdvancedAIAction(mockPlayer, mockGameState, personality, opponentHistory);
    setAdvancedAction(action);
  };

  const addOpponentAction = (action: PlayerAction) => {
    setOpponentHistory(prev => [...prev, action]);
  };

  const generateNewPersonality = () => {
    setPersonality(getAIPersonality());
  };

  const adjustPersonalityByGameState = () => {
    const gameProgress = 0.6; // 60%進行
    const winRate = 0.4; // 40%勝率
    const adjusted = adjustPersonality(personality, gameProgress, winRate);
    setPersonality(adjusted);
  };

  const testRandomness = () => {
    if (aiAction) {
      const randomAction = addRandomnessToAction(aiAction, personality);
      setAiAction(randomAction);
    }
  };

  const clearHistory = () => {
    setOpponentHistory([]);
  };

  return (
    <div className={`p-6 bg-gray-100 rounded-lg ${className}`}>
      <h2 className="text-2xl font-bold mb-4">AI ロジック デモ</h2>
      
      {/* 基本AIテスト */}
      <div className="mb-6 p-4 bg-white rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-3">基本AIロジック</h3>
        <button
          onClick={testBasicAI}
          disabled={isThinking}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400"
        >
          {isThinking ? '思考中...' : '基本AIアクション実行'}
        </button>
        
        {aiAction && (
          <div className="mt-3 p-3 bg-blue-50 rounded">
            <p><strong>アクション:</strong> {aiAction.action}</p>
            <p><strong>信頼度:</strong> {(aiAction.confidence * 100).toFixed(1)}%</p>
            <p><strong>理由:</strong> {aiAction.reasoning}</p>
            {aiAction.amount && <p><strong>金額:</strong> ${aiAction.amount}</p>}
          </div>
        )}
      </div>

      {/* 高度なAIテスト */}
      <div className="mb-6 p-4 bg-white rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-3">高度なAIロジック</h3>
        <button
          onClick={testAdvancedAI}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
        >
          高度AIアクション実行
        </button>
        
        {advancedAction && (
          <div className="mt-3 p-3 bg-green-50 rounded">
            <p><strong>アクション:</strong> {advancedAction.action}</p>
            <p><strong>信頼度:</strong> {(advancedAction.confidence * 100).toFixed(1)}%</p>
            <p><strong>理由:</strong> {advancedAction.reasoning}</p>
            {advancedAction.amount && <p><strong>金額:</strong> ${advancedAction.amount}</p>}
          </div>
        )}
      </div>

      {/* パーソナリティ管理 */}
      <div className="mb-6 p-4 bg-white rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-3">AIパーソナリティ</h3>
        <div className="grid grid-cols-2 gap-4 mb-3">
          <div>
            <p><strong>攻撃性:</strong> {(personality.aggressionLevel * 100).toFixed(1)}%</p>
            <p><strong>ブラフ頻度:</strong> {(personality.bluffFrequency * 100).toFixed(1)}%</p>
            <p><strong>忍耐力:</strong> {(personality.patienceLevel * 100).toFixed(1)}%</p>
          </div>
          <div>
            <p><strong>リスク許容度:</strong> {(personality.riskTolerance * 100).toFixed(1)}%</p>
            <p><strong>適応性:</strong> {(personality.adaptability * 100).toFixed(1)}%</p>
          </div>
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={generateNewPersonality}
            className="px-3 py-1 bg-purple-500 text-white rounded hover:bg-purple-600"
          >
            新しいパーソナリティ生成
          </button>
          <button
            onClick={adjustPersonalityByGameState}
            className="px-3 py-1 bg-orange-500 text-white rounded hover:bg-orange-600"
          >
            ゲーム状態で調整
          </button>
          <button
            onClick={testRandomness}
            className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
          >
            ランダム性テスト
          </button>
        </div>
      </div>

      {/* 相手行動履歴 */}
      <div className="mb-6 p-4 bg-white rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-3">相手行動履歴</h3>
        <div className="mb-3">
          <p><strong>履歴:</strong> {opponentHistory.join(' → ') || 'なし'}</p>
        </div>
        
        <div className="flex gap-2 mb-3">
          <button
            onClick={() => addOpponentAction('fold')}
            className="px-3 py-1 bg-gray-500 text-white rounded hover:bg-gray-600"
          >
            フォールド追加
          </button>
          <button
            onClick={() => addOpponentAction('call')}
            className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            コール追加
          </button>
          <button
            onClick={() => addOpponentAction('bet')}
            className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
          >
            ベット追加
          </button>
          <button
            onClick={() => addOpponentAction('raise')}
            className="px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600"
          >
            レイズ追加
          </button>
        </div>
        
        <button
          onClick={clearHistory}
          className="px-3 py-1 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
        >
          履歴クリア
        </button>
      </div>

      {/* ゲーム状態表示 */}
      <div className="p-4 bg-white rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-3">現在のゲーム状態</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p><strong>フェーズ:</strong> {mockGameState.gamePhase}</p>
            <p><strong>ポット:</strong> ${mockGameState.pot}</p>
            <p><strong>現在のベット:</strong> ${mockGameState.currentBet}</p>
          </div>
          <div>
            <p><strong>CPUチップ:</strong> ${mockPlayer.chips}</p>
            <p><strong>ホールカード:</strong> {mockPlayer.holeCards.map(card => `${card.rank}${card.suit.charAt(0)}`).join(', ')}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AILogicDemo; 