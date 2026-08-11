import type { ReactNode, FC } from 'react';
import { Loading } from './Loading';
import { Card } from './Card';
import { AlertCircle, RotateCcw } from 'lucide-react';
import { Button } from './Button';

export interface PageContainerProps {
  title?: string;
  description?: string;
  action?: ReactNode;
  isLoading?: boolean;
  loadingMessage?: string;
  error?: string | null;
  onRetry?: () => void;
  isEmpty?: boolean;
  emptyMessage?: string;
  emptyAction?: ReactNode;
  children: ReactNode;
}

export const PageContainer: FC<PageContainerProps> = ({
  title,
  description,
  action,
  isLoading = false,
  loadingMessage = 'Loading data...',
  error = null,
  onRetry,
  isEmpty = false,
  emptyMessage = 'No data available.',
  emptyAction,
  children,
}) => {
  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center p-8 min-h-[50vh]">
        <Loading type="spinner" message={loadingMessage} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center p-8 min-h-[50vh]">
        <Card className="max-w-md w-full text-center flex flex-col items-center gap-4 py-8 border-red-100 bg-red-50/20">
          <div className="bg-red-100 p-3 rounded-full text-red-600">
            <AlertCircle className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-red-950">Failed to Load Content</h3>
            <p className="text-xs text-red-800/80 mt-1">{error}</p>
          </div>
          {onRetry && (
            <Button variant="secondary" size="sm" onClick={onRetry} className="gap-2">
              <RotateCcw className="h-3.5 w-3.5" />
              Retry
            </Button>
          )}
        </Card>
      </div>
    );
  }

  if (isEmpty) {
    return (
      <div className="flex-1 flex items-center justify-center p-8 min-h-[50vh]">
        <Card className="max-w-md w-full text-center flex flex-col items-center gap-4 py-8 border-slate-100/60 bg-white">
          <div className="bg-slate-100 p-3 rounded-full text-slate-500">
            <AlertCircle className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">No Items Found</h3>
            <p className="text-xs text-slate-500 mt-1">{emptyMessage}</p>
          </div>
          {emptyAction && <div className="mt-2">{emptyAction}</div>}
        </Card>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col gap-6 w-full animate-[fade-in_0.2s_ease-out]">
      {(title || description || action) && (
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-ayur-slate-100 pb-5">
          <div>
            {title && <h1 className="text-2xl font-bold tracking-tight text-ayur-slate-900">{title}</h1>}
            {description && <p className="text-xs text-ayur-slate-500 mt-1">{description}</p>}
          </div>
          {action && <div className="flex items-center gap-2 self-start md:self-auto">{action}</div>}
        </div>
      )}
      <div className="flex-1 flex flex-col">{children}</div>
    </div>
  );
};
