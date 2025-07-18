import { useEffect, useState } from 'react';
import type { Card as CardType, GamePhase } from '../../types';
import Card from '../Card/Card';

interface CommunityCardAreaProps {
  communityCards: CardType[];
  gamePhase: GamePhase;
  className?: string;
}

export default function CommunityCardArea({ 
  communityCards, 
  gamePhase, 
  className = '' 
}: CommunityCardAreaProps) {
  const [animatedCards, setAnimatedCards] = useState<boolean[]>([]);
  const [phaseTransition, setPhaseTransition] = useState(false);

  // ゲームフェーズに応じて表示するカード数を決定
  const getVisibleCardCount = (phase: GamePhase): number => {
    switch (phase) {
      case 'preflop':
        return 0;
      case 'flop':
        return 3;
      case 'turn':
        return 4;
      case 'river':
      case 'showdown':
      case 'ended':
        return 5;
      default:
        return 0;
    }
  };

  const visibleCardCount = getVisibleCardCount(gamePhase);

  // フェーズ遷移時のアニメーション処理
  useEffect(() => {
    setPhaseTransition(true);
    
    const timer = setTimeout(() => {
      setPhaseTransition(false);
      // 新しいカードのアニメーション状態を設定
      const newAnimatedCards = Array.from({ length: 5 }, (_, index) => 
        index < visibleCardCount
      );
      setAnimatedCards(newAnimatedCards);
    }, 300);

    return () => clearTimeout(timer);
  }, [gamePhase, visibleCardCount]);

  // フェーズ名の取得
  const getPhaseName = (phase: GamePhase): string => {
    switch (phase) {
      case 'preflop':
        return 'プリフロップ';
      case 'flop':
        return 'フロップ';
      case 'turn':
        return 'ターン';
      case 'river':
        return 'リバー';
      case 'showdown':
        return 'ショーダウン';
      case 'ended':
        return 'ゲーム終了';
      default:
        return '';
    }
  };

  return (
    <div 
      className={`community-card-area ${className} flex flex-col items-center justify-center p-6 bg-green-800/50 backdrop-blur-sm rounded-lg shadow-lg transition-all duration-300 border-2 border-green-600`}
      data-testid="community-card-area"
    >
      <h3 className="text-white text-lg font-bold mb-4">コミュニティカード</h3>
      
      <div className="flex gap-3 justify-center items-center min-h-[6rem]">
        {Array.from({ length: 5 }, (_, index) => {
          const card = communityCards[index];
          const isVisible = index < visibleCardCount;
          const isAnimated = animatedCards[index];
          
          return (
            <div 
              key={index}
              className={`transition-all duration-500 ease-out ${
                isVisible && isAnimated 
                  ? 'opacity-100 scale-100 translate-y-0' 
                  : 'opacity-0 scale-75 translate-y-4'
              }`}
              style={{
                animationDelay: isVisible ? `${index * 150}ms` : '0ms',
                transform: phaseTransition && isVisible 
                  ? 'scale(1.1) rotate(2deg)' 
                  : undefined
              }}
            >
              {card && isVisible ? (
                <Card 
                  card={card} 
                  faceUp={true} 
                  size="medium"
                  className={`animate-card-deal ${
                    phaseTransition ? 'animate-pulse' : ''
                  }`}
                />
              ) : (
                <div className="w-16 h-24 bg-gray-700/50 backdrop-blur-sm rounded-lg border-2 border-gray-600 flex items-center justify-center transition-all duration-300">
                  <div className="text-gray-400 text-xs">?</div>
                </div>
              )}
            </div>
          );
        })}
      </div>
      
      <div className={`mt-4 text-white text-sm font-semibold transition-all duration-300 ${
        phaseTransition ? 'scale-110 text-yellow-300' : ''
      }`}>
        {getPhaseName(gamePhase)}
      </div>
      
      {/* フェーズ遷移時の視覚的フィードバック */}
      {phaseTransition && (
        <div className="absolute inset-0 bg-yellow-400 bg-opacity-20 rounded-lg animate-pulse pointer-events-none" />
      )}
    </div>
  );
} 