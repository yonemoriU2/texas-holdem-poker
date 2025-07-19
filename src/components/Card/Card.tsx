import { useEffect, useState } from 'react';
import type { Card as CardType } from '../../types';
import { SUIT_SYMBOLS, SUIT_COLORS } from '../../constants';

interface CardProps {
  card: CardType;
  faceUp?: boolean;
  size?: 'small' | 'medium' | 'large';
  className?: string;
  dealAnimation?: boolean;
  dealDelay?: number;
  flipAnimation?: boolean;
}

export default function Card({ 
  card, 
  faceUp = true, 
  size = 'medium', 
  className = '',
  dealAnimation = false,
  dealDelay = 0,
  flipAnimation = false
}: CardProps) {
  const [isDealt, setIsDealt] = useState(false);
  const [isFlipped, setIsFlipped] = useState(false);
  const [showFace, setShowFace] = useState(faceUp);

  const sizeClasses = {
    small: 'w-12 h-16',
    medium: 'w-16 h-24',
    large: 'w-20 h-28'
  };

  const textSizeClasses = {
    small: 'text-xs',
    medium: 'text-sm',
    large: 'text-base'
  };

  // 配布アニメーション
  useEffect(() => {
    if (dealAnimation) {
      const timer = setTimeout(() => {
        setIsDealt(true);
      }, dealDelay);
      return () => clearTimeout(timer);
    } else {
      setIsDealt(true);
    }
  }, [dealAnimation, dealDelay]);

  // フリップアニメーション
  useEffect(() => {
    if (flipAnimation && faceUp !== showFace) {
      setIsFlipped(true);
      const timer = setTimeout(() => {
        setShowFace(faceUp);
        setIsFlipped(false);
      }, 150);
      return () => clearTimeout(timer);
    } else {
      setShowFace(faceUp);
    }
  }, [faceUp, flipAnimation, showFace]);

  if (!showFace) {
    return (
      <div 
        className={`card-back ${sizeClasses[size]} ${className} bg-gradient-to-br from-blue-900 to-blue-700 border-2 border-blue-600 rounded-lg shadow-lg flex items-center justify-center transform transition-all duration-300 hover:scale-105 ${
          dealAnimation && !isDealt 
            ? 'opacity-0 scale-75 translate-y-8 rotate-12' 
            : 'opacity-100 scale-100 translate-y-0 rotate-0'
        } ${
          isFlipped ? 'animate-flip' : ''
        }`}
        data-testid="card-back"
        style={{
          transitionDelay: dealAnimation ? `${dealDelay}ms` : '0ms'
        }}
      >
        <div className="text-white font-bold opacity-30 text-lg">♠</div>
      </div>
    );
  }

  const color = SUIT_COLORS[card.suit];
  const symbol = SUIT_SYMBOLS[card.suit];
  const colorClass = color === 'red' ? 'text-red-600' : 'text-gray-800';

  return (
    <div 
      className={`card ${sizeClasses[size]} ${className} bg-white border-2 border-gray-300 rounded-lg shadow-lg flex flex-col justify-between p-1 transform transition-all duration-300 hover:scale-105 hover:shadow-xl ${
        dealAnimation && !isDealt 
          ? 'opacity-0 scale-75 translate-y-8 rotate-12' 
          : 'opacity-100 scale-100 translate-y-0 rotate-0'
      } ${
        isFlipped ? 'animate-flip' : ''
      }`}
      data-testid="card"
      style={{
        transitionDelay: dealAnimation ? `${dealDelay}ms` : '0ms'
      }}
    >
      {/* 左上のランクとスート */}
      <div className={`${colorClass} ${textSizeClasses[size]} font-bold leading-none`}>
        <div>{card.rank}</div>
        <div>{symbol}</div>
      </div>
      
      {/* 中央のスートシンボル */}
      <div className={`${colorClass} text-2xl flex items-center justify-center flex-1`}>
        {symbol}
      </div>
      
      {/* 右下のランクとスート（回転） */}
      <div className={`${colorClass} ${textSizeClasses[size]} font-bold leading-none transform rotate-180 self-end`}>
        <div>{card.rank}</div>
        <div>{symbol}</div>
      </div>
    </div>
  );
}