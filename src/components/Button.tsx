import type { ButtonHTMLAttributes, FC } from 'react';
import { cn } from '../utils/cn';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'accent' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  loadingText?: string;
}

export const Button: FC<ButtonProps> = ({
  children,
  className,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  loadingText = 'Processing...',
  disabled,
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-medium transition-all focus:ring-2 focus:ring-offset-2 outline-none rounded-lg active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none disabled:active:scale-100';
  
  const variants = {
    primary: 'bg-ayur-green-600 hover:bg-ayur-green-700 text-white focus:ring-ayur-green-500',
    secondary: 'bg-white border border-ayur-slate-200 text-ayur-slate-700 hover:bg-ayur-slate-50 focus:ring-ayur-slate-500',
    accent: 'bg-ayur-gold-500 hover:bg-ayur-gold-600 text-white focus:ring-ayur-gold-500',
    danger: 'bg-red-600 hover:bg-red-700 text-white focus:ring-red-500',
    ghost: 'text-ayur-slate-600 hover:bg-ayur-slate-100 hover:text-ayur-slate-900 focus:ring-ayur-slate-400',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-5 py-2.5 text-base',
  };

  return (
    <button
      className={cn(baseStyles, variants[variant], sizes[size], className)}
      disabled={disabled || isLoading}
      aria-busy={isLoading ? 'true' : undefined}
      {...props}
    >
      {isLoading ? (
        <>
          <svg
            className="animate-spin -ml-1 mr-2 h-4 w-4 text-current"
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
          {loadingText}
        </>
      ) : (
        children
      )}
    </button>
  );
};
