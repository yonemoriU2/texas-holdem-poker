import { useEffect, useState } from 'react';
import type { GamePhase } from '../../types/game';

interface PhaseTransitionProps {
  fromPhase: GamePhase;
  toPhase: GamePhase;
  onComplete: () => void;
  className?: string;
}

const phaseMessages = {
  preflop: {
    title: 'プリフロップ',
    message: 'ホールカードが配布されました',
    icon: '🃏'
  },
  flop: {
    title: 'フロップ',
    message: '3枚のコミュニティカードが公開されました',
    icon: '🎴'
  },
  turn: {
    title: 'ターン',
    message: '4枚目のコミュニティカードが公開されました',
    icon: '🃏'
  },
  river: {
    title: 'リバー',
    message: '5枚目のコミュニティカードが公開されました',
    icon: '🎴'
  },
  showdown: {
    title: 'ショーダウン',
    message: 'ハンド比較を開始します',
    icon: '🏆'
  },
  ended: {
    title: 'ゲーム終了',
    message: 'ハンドが完了しました',
    icon: '✅'
  }
};

export default function PhaseTransition({ 
  fromPhase, 
  toPhase, 
  onComplete, 
  className = '' 
}: PhaseTransitionProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [animationStage, setAnimationStage] = useState<'enter' | 'show' | 'exit'>('enter');

  useEffect(() => {
    if (fromPhase !== toPhase) {
      setIsVisible(true);
      setAnimationStage('enter');

      // フェーズ遷移アニメーションのタイミング
      const enterTimer = setTimeout(() => {
        setAnimationStage('show');
      }, 300);

      const showTimer = setTimeout(() => {
        setAnimationStage('exit');
      }, 2000);

      const exitTimer = setTimeout(() => {
        setIsVisible(false);
        onComplete();
      }, 2300);

      return () => {
        clearTimeout(enterTimer);
        clearTimeout(showTimer);
        clearTimeout(exitTimer);
      };
    }
  }, [fromPhase, toPhase, onComplete]);

  if (!isVisible || fromPhase === toPhase) {
    return null;
  }

  const message = phaseMessages[toPhase];

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center ${className}`}>
      {/* 背景オーバーレイ */}
      <div 
        className={`absolute inset-0 bg-black transition-opacity duration-300 ${
          animationStage === 'enter' ? 'opacity-0' : 
          animationStage === 'show' ? 'opacity-75' : 'opacity-0'
        }`}
      />

      {/* フェーズ遷移カード */}
      <div 
        className={`relative bg-gradient-to-br from-blue-600 to-purple-700 rounded-2xl p-8 border-4 border-white/20 shadow-2xl transform transition-all duration-500 ${
          animationStage === 'enter' ? 'scale-75 opacity-0 rotate-12' : 
          animationStage === 'show' ? 'scale-100 opacity-100 rotate-0' : 
          'scale-125 opacity-0 -rotate-12'
        }`}
      >
        {/* カードの装飾 */}
        <div className="absolute top-4 right-4 text-white/20 text-6xl">
          {message.icon}
        </div>
        <div className="absolute bottom-4 left-4 text-white/20 text-6xl">
          {message.icon}
        </div>

        {/* メインコンテンツ */}
        <div className="text-center relative z-10">
          <div className="text-8xl mb-4 animate-bounce">
            {message.icon}
          </div>
          
          <h2 className="text-4xl font-bold text-white mb-4 animate-pulse">
            {message.title}
          </h2>
          
          <p className="text-xl text-white/90 mb-6">
            {message.message}
          </p>

          {/* 進行バー */}
          <div className="w-64 h-2 bg-white/20 rounded-full overflow-hidden">
            <div 
              className={`h-full bg-gradient-to-r from-yellow-400 to-orange-500 transition-all duration-2000 ease-out ${
                animationStage === 'enter' ? 'w-0' : 
                animationStage === 'show' ? 'w-full' : 'w-full'
              }`}
            />
          </div>

          {/* フェーズ進行インジケーター */}
          <div className="mt-6 flex justify-center space-x-2">
            {(['preflop', 'flop', 'turn', 'river', 'showdown', 'ended'] as GamePhase[]).map((phase, index) => {
              const phaseIndex = ['preflop', 'flop', 'turn', 'river', 'showdown', 'ended'].indexOf(toPhase);
              const isActive = phase === toPhase;
              const isCompleted = index < phaseIndex;
              
              return (
                <div
                  key={phase}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    isActive 
                      ? 'bg-yellow-400 scale-125' 
                      : isCompleted 
                      ? 'bg-green-400' 
                      : 'bg-white/30'
                  }`}
                />
              );
            })}
          </div>
        </div>

        {/* パーティクルエフェクト */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className={`absolute w-2 h-2 bg-yellow-400 rounded-full animate-ping ${
                animationStage === 'show' ? 'opacity-100' : 'opacity-0'
              }`}
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${1 + Math.random()}s`
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
} 