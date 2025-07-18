import type { ReactNode } from 'react';
import { Button } from './index';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  variant?: 'info' | 'error' | 'success' | 'warning';
}

export default function Modal({
  isOpen,
  onClose,
  title,
  children,
  variant = 'info'
}: ModalProps) {
  if (!isOpen) return null;

  const variantClasses = {
    info: 'border-blue-500',
    error: 'border-red-500',
    success: 'border-green-500',
    warning: 'border-yellow-500'
  };

  const titleClasses = {
    info: 'text-blue-600',
    error: 'text-red-600',
    success: 'text-green-600',
    warning: 'text-yellow-600'
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className={`bg-white rounded-lg p-6 max-w-md w-full mx-4 border-2 ${variantClasses[variant]}`}>
        <div className="flex justify-between items-center mb-4">
          <h2 className={`text-lg font-semibold ${titleClasses[variant]}`}>
            {title}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-xl font-bold"
          >
            ×
          </button>
        </div>
        
        <div className="mb-4">
          {children}
        </div>
        
        <div className="flex justify-end">
          <Button
            variant="secondary"
            onClick={onClose}
            size="sm"
          >
            閉じる
          </Button>
        </div>
      </div>
    </div>
  );
} 