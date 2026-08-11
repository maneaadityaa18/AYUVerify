import React from 'react';
import { PageContainer } from '../components/PageContainer';
import { Card } from '../components/Card';
import { History as HistoryIcon, ShieldAlert } from 'lucide-react';

export const History: React.FC = () => {
  return (
    <PageContainer
      title="Transaction Logs & History"
      description="View the immutable verification trail and custodian movements for all raw materials."
    >
      <div className="max-w-3xl mx-auto flex flex-col gap-6">
        <Card className="p-8 flex flex-col items-center justify-center text-center gap-4 min-h-[300px]" hoverable={false}>
          <div className="p-4 bg-slate-50 text-slate-400 rounded-full">
            <HistoryIcon className="h-10 w-10 text-slate-300" />
          </div>
          <div className="max-w-md">
            <h3 className="text-sm font-bold text-slate-800">Immutable Ledger Feed Offline</h3>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              Global supply chain transaction audit streaming is currently pending integration with real-time distributed ledger event streams.
            </p>
          </div>
          <div className="mt-4 p-4.5 rounded-xl bg-slate-50 border border-slate-100 flex items-start gap-3 text-left text-xs max-w-lg">
            <ShieldAlert className="h-5 w-5 text-slate-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-slate-700">Audit Status</span>
              <p className="text-slate-500 mt-1">
                Material-specific custody history is fully operational. To view local transit event histories, please inspect individual batch passport timeline profiles in the Batches list.
              </p>
            </div>
          </div>
        </Card>
      </div>
    </PageContainer>
  );
};
