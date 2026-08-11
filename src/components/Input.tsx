import type { InputHTMLAttributes } from 'react';
import { forwardRef } from 'react';
import { cn } from '../utils/cn';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = 'text', label, error, helperText, id, ...props }, ref) => {
    const inputId = id || `input-${Math.random().toString(36).substring(2, 9)}`;
    const errorId = `${inputId}-error`;
    const helperId = `${inputId}-helper`;

    const descIds: string[] = [];
    if (error) descIds.push(errorId);
    if (helperText) descIds.push(helperId);
    const describedBy = descIds.length > 0 ? descIds.join(' ') : undefined;

    return (
      <div className="w-full flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="text-xs font-semibold text-ayur-slate-700 select-none"
          >
            {label} {props.required && <span className="text-red-500" aria-hidden="true">*</span>}
          </label>
        )}
        <div className="relative">
          <input
            id={inputId}
            type={type}
            ref={ref}
            className={cn(
              "w-full bg-white border border-ayur-slate-200 rounded-lg px-3.5 py-2 text-sm text-ayur-slate-900 placeholder:text-ayur-slate-400 focus:outline-none focus:ring-2 focus:ring-ayur-green-500 focus:border-transparent transition-all",
              error && "border-red-500 focus:ring-red-500",
              className
            )}
            aria-invalid={error ? 'true' : 'false'}
            aria-describedby={describedBy}
            {...props}
          />
        </div>
        {error && (
          <span
            id={errorId}
            role="alert"
            className="text-xs text-red-500 font-medium animate-fade-in"
          >
            {error}
          </span>
        )}
        {!error && helperText && (
          <span id={helperId} className="text-xs text-ayur-slate-500">
            {helperText}
          </span>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
