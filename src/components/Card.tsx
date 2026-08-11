import type { HTMLAttributes, FC } from 'react';
import { cn } from '../utils/cn';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  hoverable?: boolean;
}

export const Card: FC<CardProps> = ({ children, className, hoverable = true, ...props }) => {
  return (
    <div
      className={cn(
        "bg-white border border-ayur-slate-100/80 rounded-xl p-5 shadow-sm transition-all duration-300",
        hoverable && "hover:shadow-md hover:border-ayur-slate-200/60",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};
