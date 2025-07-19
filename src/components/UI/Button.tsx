import { useState } from 'react';
import type { ReactNode, CSSProperties } from 'react';

interface ButtonProps {
  children: ReactNode;
  onClick: () => void;
  variant?: 'primary' | 'secondary' | 'danger' | 'success';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  className?: string;
  animate?: boolean;
  style?: CSSProperties;
}

export default function Button({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  disabled = false,
  className = '',
  animate = false,
  style = {}
}: ButtonProps) {
  const [isPressed, setIsPressed] = useState(false);

  const baseClasses = 'font-semibold rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 transform';
  
  const variantClasses = {
    primary: 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500 text-white shadow-lg hover:shadow-xl',
    secondary: 'bg-gray-600 hover:bg-gray-700 focus:ring-gray-500 text-white shadow-lg hover:shadow-xl',
    danger: 'bg-red-600 hover:bg-red-700 focus:ring-red-500 text-white shadow-lg hover:shadow-xl',
    success: 'bg-green-600 hover:bg-green-700 focus:ring-green-500 text-white shadow-lg hover:shadow-xl'
  };
  
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg'
  };
  
  const disabledClasses = disabled 
    ? 'opacity-50 cursor-not-allowed' 
    : 'hover:scale-105 active:scale-95 hover:-translate-y-1';
  
  const animationClasses = animate ? 'animate-fade-in-up' : '';
  
  const classes = [
    baseClasses,
    variantClasses[variant],
    sizeClasses[size],
    disabledClasses,
    animationClasses,
    className
  ].join(' ');

  const handleClick = () => {
    if (!disabled) {
      setIsPressed(true);
      setTimeout(() => setIsPressed(false), 150);
      onClick();
    }
  };

  return (
    <button
      className={`${classes} ${isPressed ? 'scale-95' : ''}`}
      onClick={handleClick}
      disabled={disabled}
      style={{
        animationDelay: animate ? '0.1s' : '0s',
        ...style
      }}
    >
      {children}
    </button>
  );
} 