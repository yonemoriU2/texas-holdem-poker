import { useEffect, useState } from 'react';
import Chip from './Chip';

interface ChipAnimationProps {
  fromPosition: { x: number; y: number };
  toPosition: { x: number; y: number };
  amount: number;
  onComplete: () => void;
  delay?: number;
}

export default function ChipAnimation({ 
  fromPosition, 
  toPosition, 
  amount, 
  onComplete, 
  delay = 0 
}: ChipAnimationProps) {
  const [isAnimating, setIsAnimating] = useState(false);
  const [position, setPosition] = useState(fromPosition);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsAnimating(true);
      
      // アニメーション完了後にコールバックを呼び出し
      const animationTimer = setTimeout(() => {
        onComplete();
      }, 1000); // アニメーション時間

      return () => clearTimeout(animationTimer);
    }, delay);

    return () => clearTimeout(timer);
  }, [delay, onComplete]);

  useEffect(() => {
    if (isAnimating) {
      // スムーズな移動アニメーション
      const startTime = Date.now();
      const duration = 1000; // 1秒

      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // イージング関数（ease-out）
        const easeOut = 1 - Math.pow(1 - progress, 3);
        
        const currentX = fromPosition.x + (toPosition.x - fromPosition.x) * easeOut;
        const currentY = fromPosition.y + (toPosition.y - fromPosition.y) * easeOut;
        
        setPosition({ x: currentX, y: currentY });
        
        if (progress < 1) {
          requestAnimationFrame(animate);
        }
      };
      
      requestAnimationFrame(animate);
    }
  }, [isAnimating, fromPosition, toPosition]);

  if (!isAnimating) return null;

  return (
    <div
      className="fixed pointer-events-none z-50 transition-all duration-1000 ease-out"
      style={{
        left: position.x,
        top: position.y,
        transform: 'translate(-50%, -50%)'
      }}
    >
      <Chip amount={amount} size="sm" />
    </div>
  );
}

interface ChipPileAnimationProps {
  fromPosition: { x: number; y: number };
  toPosition: { x: number; y: number };
  amount: number;
  onComplete: () => void;
  delay?: number;
}

export function ChipPileAnimation({ 
  fromPosition, 
  toPosition, 
  amount, 
  onComplete, 
  delay = 0 
}: ChipPileAnimationProps) {
  const [chips, setChips] = useState<Array<{ id: number; delay: number }>>([]);

  useEffect(() => {
    // チップの枚数を計算（1チップ = 100単位と仮定）
    const chipCount = Math.min(Math.ceil(amount / 100), 10); // 最大10枚
    
    const chipArray = Array.from({ length: chipCount }, (_, index) => ({
      id: index,
      delay: delay + index * 100 // 各チップを少しずつ遅延
    }));
    
    setChips(chipArray);
  }, [amount, delay]);

  const handleChipComplete = (chipId: number) => {
    // 全てのチップのアニメーションが完了したらコールバックを呼び出し
    const remainingChips = chips.filter(chip => chip.id !== chipId);
    if (remainingChips.length === 0) {
      onComplete();
    }
  };

  return (
    <>
      {chips.map(chip => (
        <ChipAnimation
          key={chip.id}
          fromPosition={fromPosition}
          toPosition={toPosition}
          amount={Math.floor(amount / chips.length)}
          onComplete={() => handleChipComplete(chip.id)}
          delay={chip.delay}
        />
      ))}
    </>
  );
} 