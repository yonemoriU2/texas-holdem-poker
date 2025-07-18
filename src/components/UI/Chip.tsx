interface ChipProps {
  amount: number;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export default function Chip({ amount, size = 'md', className = '' }: ChipProps) {
  const getChipColor = (amount: number) => {
    if (amount >= 1000) return 'bg-purple-600 text-white';
    if (amount >= 500) return 'bg-black text-white';
    if (amount >= 100) return 'bg-green-600 text-white';
    if (amount >= 25) return 'bg-blue-600 text-white';
    if (amount >= 5) return 'bg-red-600 text-white';
    return 'bg-gray-600 text-white';
  };

  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-12 h-12 text-sm',
    lg: 'w-16 h-16 text-base'
  };

  const classes = [
    'rounded-full border-2 border-white shadow-lg flex items-center justify-center font-bold',
    getChipColor(amount),
    sizeClasses[size],
    className
  ].join(' ');

  return (
    <div className={classes}>
      {amount >= 1000 ? `${amount / 1000}k` : amount}
    </div>
  );
} 