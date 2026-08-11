import React from 'react';
import { cn } from '../utils/cn';

export interface LoadingProps {
  type?: 'spinner' | 'skeleton' | 'progress';
  message?: string;
  className?: string;
  skeletonRows?: number;
}

export const Loading: React.FC<LoadingProps> = ({
  type = 'spinner',
  message,
  className,
  skeletonRows = 3,
}) => {
  return (
    <div
      className={cn("flex flex-col items-center justify-center py-8 w-full", className)}
      role="status"
      aria-busy="true"
      aria-live="polite"
    >
      {type === 'spinner' && (
        <div className="flex flex-col items-center gap-3">
          <svg
            className="animate-spin h-8 w-8 text-ayur-green-600"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          {message && <p className="text-sm font-medium text-ayur-slate-600">{message}</p>}
        </div>
      )}

      {type === 'skeleton' && (
        <div className="w-full flex flex-col gap-4 max-w-full">
          {Array.from({ length: skeletonRows }).map((_, index) => (
            <div key={index} className="flex flex-col gap-2.5 animate-pulse w-full">
              <div className="h-5 bg-ayur-slate-200 rounded-md w-1/3" />
              <div className="h-4 bg-ayur-slate-100 rounded-md w-full" />
              <div className="h-4 bg-ayur-slate-100 rounded-md w-5/6" />
            </div>
          ))}
        </div>
      )}

      {type === 'progress' && (
        <div className="w-full max-w-md flex flex-col items-center gap-2">
          {message && <p className="text-sm font-medium text-ayur-slate-600">{message}</p>}
          <div className="w-full bg-ayur-slate-100 rounded-full h-2.5 overflow-hidden">
            <div
              className="bg-ayur-green-600 h-full rounded-full animate-[progress_2s_infinite_linear]"
              style={{ width: '40%' }}
            />
          </div>
        </div>
      )}
    </div>
  );
};
