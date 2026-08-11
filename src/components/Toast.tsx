import type { FC } from 'react';
import { CheckCircle2, AlertTriangle, XCircle, Info, X } from 'lucide-react';
import { useUI } from '../context/UIContext';
import { cn } from '../utils/cn';

export const ToastContainer: FC = () => {
  const { toasts, dismissToast } = useUI();

  if (toasts.length === 0) return null;

  const icons = {
    success: <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" />,
    error: <XCircle className="h-5 w-5 text-rose-500 shrink-0" />,
    warning: <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0" />,
    info: <Info className="h-5 w-5 text-sky-500 shrink-0" />,
  };

  const borderStyles = {
    success: 'border-emerald-100 bg-emerald-50/50 text-emerald-950',
    error: 'border-rose-100 bg-rose-50/50 text-rose-950',
    warning: 'border-amber-100 bg-amber-50/50 text-amber-950',
    info: 'border-sky-100 bg-sky-50/50 text-sky-950',
  };

  return (
    <div
      className="fixed bottom-5 right-5 z-[100] flex flex-col gap-3 max-w-sm w-full pointer-events-none"
      role="presentation"
    >
      {toasts.map((toast) => {
        const isError = toast.type === 'error';
        return (
          <div
            key={toast.id}
            className={cn(
              "flex items-start gap-3 p-4 rounded-xl border bg-white shadow-lg pointer-events-auto transition-all duration-300 animate-[slide-in_0.2s_ease-out]",
              borderStyles[toast.type]
            )}
            role={isError ? 'alert' : 'status'}
            aria-live={isError ? 'assertive' : 'polite'}
          >
            {icons[toast.type]}
            <div className="flex-1 text-sm font-medium">{toast.message}</div>
            <button
              onClick={() => dismissToast(toast.id)}
              className="text-slate-400 hover:text-slate-600 rounded-lg p-0.5 hover:bg-slate-100/50 transition-colors outline-none focus:ring-2 focus:ring-slate-300"
              aria-label="Dismiss notification"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
