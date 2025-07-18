import { useState } from 'react';
import { GameProvider } from '../../context/GameContext';
import BettingActions from './BettingActions';
import { Button } from '../UI';
import type { GameConfig } from '../../types/game';

export const BettingActionsDemo: React.FC = () => {
  const [scenario, setScenario] = useState<'preflop' | 'flop' | 'betting' | 'raising'>('preflop');
  
  const config: GameConfig = {
    initialChips: 1000,
    smallBlind: 10,
    bigBlind: 20,
    bbAnte: 0,
    playerName: 'Player',
    cpuName: 'CPU',
    blindIncreaseInterval: 10,
    blindIncreaseMultiplier: 2
  };

  const scenarios = [
    { id: 'preflop', name: 'プリフロップ（ベット可能）' },
    { id: 'flop', name: 'フロップ（チェック可能）' },
    { id: 'betting', name: 'ベッティング（コール必要）' },
    { id: 'raising', name: 'レイジング（レイズ可能）' }
  ];

  return (
    <div className="min-h-screen bg-gray-900 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8">ベッティングアクション UI デモ</h1>
        
        {/* シナリオ選択 */}
        <div className="bg-gray-800 rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold text-white mb-4">シナリオ選択</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {scenarios.map((s) => (
              <Button
                key={s.id}
                variant={scenario === s.id ? 'primary' : 'secondary'}
                onClick={() => setScenario(s.id as any)}
                className="text-sm"
              >
                {s.name}
              </Button>
            ))}
          </div>
        </div>

        {/* ゲーム状態の説明 */}
        <div className="bg-gray-800 rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold text-white mb-4">現在のシナリオ: {scenarios.find(s => s.id === scenario)?.name}</h2>
          <div className="text-gray-300 space-y-2">
            {scenario === 'preflop' && (
              <>
                <p>• プリフロップラウンド</p>
                <p>• 現在のベット: $20 (ビッグブラインド)</p>
                <p>• プレイヤーのチップ: $1000</p>
                <p>• 可能なアクション: フォールド、コール、レイズ、オールイン</p>
              </>
            )}
            {scenario === 'flop' && (
              <>
                <p>• フロップラウンド</p>
                <p>• 現在のベット: $0</p>
                <p>• プレイヤーのチップ: $1000</p>
                <p>• 可能なアクション: フォールド、チェック、ベット、オールイン</p>
              </>
            )}
            {scenario === 'betting' && (
              <>
                <p>• ベッティングラウンド</p>
                <p>• 現在のベット: $50</p>
                <p>• プレイヤーのチップ: $1000</p>
                <p>• 可能なアクション: フォールド、コール、レイズ、オールイン</p>
              </>
            )}
            {scenario === 'raising' && (
              <>
                <p>• レイジングラウンド</p>
                <p>• 現在のベット: $100</p>
                <p>• プレイヤーのチップ: $1000</p>
                <p>• 可能なアクション: フォールド、コール、レイズ、オールイン</p>
              </>
            )}
          </div>
        </div>

        {/* BettingActionsコンポーネント */}
        <div className="flex justify-center">
          <div className="w-full max-w-md">
            <GameProvider config={config}>
              <BettingActions />
            </GameProvider>
          </div>
        </div>

        {/* 機能説明 */}
        <div className="bg-gray-800 rounded-lg p-6 mt-8">
          <h2 className="text-xl font-semibold text-white mb-4">実装された機能</h2>
          <div className="text-gray-300 space-y-2">
            <p>✅ 基本アクションボタン（フォールド、チェック/コール、ベット/レイズ、オールイン）</p>
            <p>✅ アクション可能性に基づく動的ボタン表示</p>
            <p>✅ ベット額入力用スライダー</p>
            <p>✅ プリセットベット額ボタン（1/4ポット、1/2ポット、ポット）</p>
            <p>✅ 最小/最大ベット額の制限機能</p>
            <p>✅ ベット額のバリデーション</p>
            <p>✅ エラーメッセージ表示</p>
            <p>✅ レスポンシブデザイン</p>
          </div>
        </div>
      </div>
    </div>
  );
} 