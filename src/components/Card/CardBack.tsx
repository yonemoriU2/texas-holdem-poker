interface CardBackProps {
  size?: 'small' | 'medium' | 'large';
  className?: string;
}

export default function CardBack({ size = 'medium', className = '' }: CardBackProps) {
  const sizeClasses = {
    small: 'w-12 h-16',
    medium: 'w-16 h-24',
    large: 'w-20 h-28'
  };

  return (
    <div className={`card-back ${sizeClasses[size]} ${className} flex items-center justify-center`}>
      <div className="text-white font-bold opacity-30 text-lg">K</div>
    </div>
  );
}