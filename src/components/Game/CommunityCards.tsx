import { useEffect, useState } from 'react';
import type { Card as CardType, GamePhase } from '../../types';
import { Card } from '../Card';

interface CommunityCardsProps {
  cards: CardType[];
  phase: GamePhase;
  className?: string;
  dealAnimation?: boolean;
}

export default function CommunityCards({ 
  cards = [], 
  phase, 
  className = '',
  dealAnimation = false
}: CommunityCardsProps) {
  const [visibleCards, setVisibleCards] = useState<CardType[]>([]);

  // フェーズに応じて表示するカードの数を決定
  const getVisibleCardCount = (currentPhase: GamePhase): number => {
    switch (currentPhase) {
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

  // フェーズが変わったときにカードを段階的に表示
  useEffect(() => {
    const targetCount = getVisibleCardCount(phase);
    const currentCount = visibleCards.length;

    if (targetCount > currentCount) {
      // 新しいカードを段階的に追加
      const newCards = cards.slice(0, targetCount);
      
      if (dealAnimation) {
        // アニメーション付きで段階的に表示
        let delay = 0;
        for (let i = currentCount; i < targetCount; i++) {
          setTimeout(() => {
            setVisibleCards(cards.slice(0, i + 1));
          }, delay);
          delay += 300; // 300msずつ遅延
        }
      } else {
        // 即座に表示
        setVisibleCards(newCards);
      }
    } else if (targetCount < currentCount) {
      // カードを減らす（通常は新しいハンドの開始時）
      setVisibleCards(cards.slice(0, targetCount));
    }
  }, [phase, cards, dealAnimation, visibleCards.length]);

  // フェーズの説明を取得
  const getPhaseDescription = (currentPhase: GamePhase): string => {
    switch (currentPhase) {
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
        return 'ハンド終了';
      default:
        return '';
    }
  };

  return (
    <div 
      data-testid="community-cards"
      className={`community-cards-area text-center ${className}`}
    >
      {/* フェーズ表示 */}
      <div className="phase-indicator mb-4">
        <span className="phase-text text-lg font-bold text-yellow-300 bg-black/50 px-4 py-2 rounded-full">
          {getPhaseDescription(phase)}
        </span>
      </div>

      {/* コミュニティカード */}
      <div className="community-cards flex justify-center gap-2 min-h-[96px]">
        {visibleCards.map((card, index) => (
          <div
            key={card.id}
            className="community-card transform transition-all duration-500 hover:scale-110 hover:z-10"
            data-testid={`community-card-${index}`}
            style={{
              animationDelay: dealAnimation ? `${index * 300}ms` : '0ms'
            }}
          >
            <Card
              card={card}
              faceUp={true}
              size="medium"
              dealAnimation={dealAnimation}
              dealDelay={index * 300}
            />
          </div>
        ))}
        
        {/* プレースホルダー（まだ配られていないカードの位置） */}
        {Array.from({ length: 5 - visibleCards.length }).map((_, index) => (
          <div
            key={`placeholder-${index}`}
            className="card-placeholder w-16 h-24 border-2 border-dashed border-gray-600 rounded-lg bg-gray-800/30 flex items-center justify-center opacity-50"
            data-testid={`card-placeholder-${visibleCards.length + index}`}
          >
            <span className="text-gray-500 text-xs">?</span>
          </div>
        ))}
      </div>

      {/* カード数の表示 */}
      <div className="card-count mt-2">
        <span className="text-sm text-gray-400">
          {visibleCards.length}/5 コミュニティカード
        </span>
      </div>
    </div>
  );
}