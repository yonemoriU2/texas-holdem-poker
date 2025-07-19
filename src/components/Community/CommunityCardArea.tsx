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
  const [dealAnimation, setDealAnimation] = useState(false);

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
    setDealAnimation(true);
    
    const timer = setTimeout(() => {
      setPhaseTransition(false);
      // 新しいカードのアニメーション状態を設定
      const newAnimatedCards = Array.from({ length: 5 }, (_, index) => 
        index < visibleCardCount
      );
      setAnimatedCards(newAnimatedCards);
    }, 300);

    const dealTimer = setTimeout(() => {
      setDealAnimation(false);
    }, 1000);

    return () => {
      clearTimeout(timer);
      clearTimeout(dealTimer);
    };
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
      className={`community-card-area ${className} flex flex-col items-center justify-center p-6 bg-green-800/50 backdrop-blur-sm rounded-lg shadow-lg transition-all duration-500 border-2 border-green-600 relative overflow-hidden`}
      data-testid="community-card-area"
    >
      <h3 className="text-white text-lg font-bold mb-4 animate-slide-in">コミュニティカード</h3>
      
      <div className="flex gap-3 justify-center items-center min-h-[6rem] relative">
        {Array.from({ length: 5 }, (_, index) => {
          const card = communityCards[index];
          const isVisible = index < visibleCardCount;
          const isAnimated = animatedCards[index];
          
          return (
            <div 
              key={index}
              className={`transition-all duration-700 ease-out transform ${
                isVisible && isAnimated 
                  ? 'opacity-100 scale-100 translate-y-0 rotate-0' 
                  : 'opacity-0 scale-75 translate-y-8 rotate-12'
              } ${
                phaseTransition && isVisible ? 'animate-pulse' : ''
              }`}
              style={{
                animationDelay: isVisible ? `${index * 200}ms` : '0ms',
                transitionDelay: isVisible ? `${index * 200}ms` : '0ms'
              }}
            >
              {card && isVisible ? (
                <Card 
                  card={card} 
                  faceUp={true} 
                  size="medium"
                  dealAnimation={dealAnimation}
                  dealDelay={index * 200}
                  className={`${
                    phaseTransition ? 'animate-pulse' : ''
                  } hover:scale-110 hover:z-10 transition-transform duration-300`}
                />
              ) : (
                <div className="w-16 h-24 bg-gray-700/50 backdrop-blur-sm rounded-lg border-2 border-gray-600 flex items-center justify-center transition-all duration-500 hover:scale-110">
                  <div className="text-gray-400 text-xs animate-pulse">?</div>
                </div>
              )}
            </div>
          );
        })}
      </div>
      
      <div className={`mt-4 text-white text-sm font-semibold transition-all duration-500 ${
        phaseTransition ? 'scale-110 text-yellow-300 animate-pulse' : ''
      }`}>
        {getPhaseName(gamePhase)}
      </div>
      
      {/* フェーズ遷移時の視覚的フィードバック */}
      {phaseTransition && (
        <div className="absolute inset-0 bg-yellow-400/20 rounded-lg animate-pulse pointer-events-none" />
      )}
      
      {/* カード配布時の光効果 */}
      {dealAnimation && (
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-yellow-400/10 to-transparent animate-pulse pointer-events-none" />
      )}
    </div>
  );
} 