import { useEffect, useState } from 'react';
import type { Card as CardType } from '../../types';
import { Card } from '../Card';

interface PlayerCardsProps {
  cards: CardType[];
  isVisible?: boolean;
  size?: 'small' | 'medium' | 'large';
  className?: string;
  dealAnimation?: boolean;
  flipAnimation?: boolean;
}

export default function PlayerCards({ cards = [], isVisible = false, size = 'medium', className = '', dealAnimation = false, flipAnimation = false }: PlayerCardsProps) {
  const [isDealing, setIsDealing] = useState(false);

  useEffect(() => {
    if (dealAnimation && cards.length > 0) {
      setIsDealing(true);
    }
  }, [dealAnimation, cards.length]);

  return (
    <div 
      data-testid={cards.length > 0 && cards[0]?.suit ? 'player-cards' : 'cpu-cards'}
      className={`player-cards flex justify-center gap-2 ${className}`}>
      {cards.map((card, index) => (
        <div
          key={card.id}
          className={`hole-card transform transition-all duration-500 ${
            index > 0 ? '-ml-4' : ''
          } hover:scale-110 hover:z-10`}
          style={{
            animationDelay: dealAnimation ? `${index * 200}ms` : '0ms'
          }}
        >
          <Card
            card={card}
            faceUp={isVisible}
            size={size}
            dealAnimation={dealAnimation}
            dealDelay={index * 200}
            flipAnimation={flipAnimation}
          />
        </div>
      ))}
    </div>
  );
}