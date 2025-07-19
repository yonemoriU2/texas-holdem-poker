import React from 'react';
import type { GameError } from '../../utils/errorHandling';
import { getUserFriendlyErrorMessage, getErrorSeverity, isErrorRecoverable } from '../../utils/errorHandling';
import Button from './Button';

interface ErrorDisplayProps {
  error: GameError;
  onDismiss?: () => void;
  onRetry?: () => void;
  onRepair?: () => void;
  className?: string;
}

export default function ErrorDisplay({
  error,
  onDismiss,
  onRetry,
  onRepair,
  className = ''
}: ErrorDisplayProps) {
  const severity = getErrorSeverity(error);
  const isRecoverable = isErrorRecoverable(error);
  const userMessage = getUserFriendlyErrorMessage(error);

  const severityClasses = {
    low: 'border-yellow-500 bg-yellow-50',
    medium: 'border-orange-500 bg-orange-50',
    high: 'border-red-500 bg-red-50',
    critical: 'border-red-700 bg-red-100'
  };

  const severityIcons = {
    low: '⚠️',
    medium: '⚠️',
    high: '🚨',
    critical: '💥'
  };

  const severityTitles = {
    low: '警告',
    medium: 'エラー',
    high: '重大なエラー',
    critical: '致命的なエラー'
  };

  return (
    <div className={`rounded-lg border-2 p-4 ${severityClasses[severity]} ${className}`}>
      <div className="flex items-start gap-3">
        <div className="text-2xl flex-shrink-0">
          {severityIcons[severity]}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-gray-900">
              {severityTitles[severity]}
            </h3>
            {onDismiss && (
              <button
                onClick={onDismiss}
                className="text-gray-400 hover:text-gray-600 text-xl font-bold"
                aria-label="エラーを閉じる"
              >
                ×
              </button>
            )}
          </div>
          
          <p className="text-gray-700 mb-3">
            {userMessage}
          </p>
          
          {import.meta.env.DEV && error.details && (
            <details className="mb-3">
              <summary className="cursor-pointer text-sm font-semibold text-gray-600 mb-1">
                詳細情報
              </summary>
              <pre className="text-xs bg-gray-100 p-2 rounded overflow-auto max-h-24">
                {JSON.stringify(error.details, null, 2)}
              </pre>
            </details>
          )}
          
          <div className="flex gap-2 flex-wrap">
            {isRecoverable && onRepair && (
              <Button
                variant="primary"
                size="sm"
                onClick={onRepair}
              >
                自動修復
              </Button>
            )}
            
            {onRetry && (
              <Button
                variant="secondary"
                size="sm"
                onClick={onRetry}
              >
                再試行
              </Button>
            )}
            
            {!onDismiss && (
              <Button
                variant="secondary"
                size="sm"
                onClick={() => window.location.reload()}
              >
                ページを再読み込み
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 