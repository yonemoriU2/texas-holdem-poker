import type { Card as CardType } from '../../types';
import { Card } from '../Card';

interface PlayerCardsProps {
  cards: CardType[];
  isVisible?: boolean;
  size?: 'small' | 'medium' | 'large';
  className?: string;
}

export default function PlayerCards({ cards, isVisible = false, size = 'medium', className = '' }: PlayerCardsProps) {
  return (
    <div className={`player-cards flex justify-center gap-2 ${className}`}>
      {cards.map((card, index) => (
        <div
          key={card.id}
          className={`hole-card transform transition-all duration-500 ${
            index > 0 ? '-ml-4' : ''
          } hover:scale-110 hover:z-10`}
        >
          <Card
            card={card}
            faceUp={isVisible}
            size={size}
          />
        </div>
      ))}
    </div>
  );
}