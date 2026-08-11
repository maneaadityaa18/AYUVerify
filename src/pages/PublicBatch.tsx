import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { CheckCircle2, AlertTriangle, ArrowRight, User } from 'lucide-react';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { PageContainer } from '../components/PageContainer';
import { Loading } from '../components/Loading';
import { batchService } from '../services/batchService';

export const PublicBatch: React.FC = () => {
  const { batchId } = useParams<{ batchId: string }>();

  const { data: batchData, isLoading, error } = useQuery({
    queryKey: ['publicBatch', batchId],
    queryFn: () => batchService.getPublicBatch(batchId!),
    enabled: !!batchId,
  });

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8">
        <PageContainer>
          <div className="flex justify-center items-center py-20">
            <Loading />
          </div>
        </PageContainer>
      </div>
    );
  }

  if (error || !batchData) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="mb-6 p-4 rounded-xl border border-rose-100 bg-rose-50 text-rose-950 flex items-center gap-3 text-xs font-semibold">
          <AlertTriangle className="h-5 w-5 text-rose-500 shrink-0" />
          <span>This batch ID could not be found or resolved in the public ledger registry.</span>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Banner warning */}
      <div className="mb-6 p-4 rounded-xl border border-amber-100 bg-amber-50 text-amber-950 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3 text-xs font-semibold">
          <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0" />
          <span>You are viewing public batch information. Log in for full details.</span>
        </div>
        <Link to="/auth/login" className="w-full sm:w-auto shrink-0">
          <Button size="sm" variant="accent" className="w-full gap-1 font-bold">
            Log In
            <ArrowRight className="h-3 w-3" />
          </Button>
        </Link>
      </div>

      <PageContainer>
        <Card className="flex flex-col gap-6 p-6 md:p-8" hoverable={false}>
          {/* Certificate header */}
          <div className="border-b border-slate-100 pb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                Digital Passport Passport
              </span>
              <h1 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight mt-1">
                {batchData.batchId}
              </h1>
            </div>
            <div className="flex items-center gap-2 self-start sm:self-auto">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-100">
                <CheckCircle2 className="h-3.5 w-3.5" />
                {batchData.status}
              </span>
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700">
                🟢 {batchData.riskLevel} RISK
              </span>
            </div>
          </div>

          {/* Details grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-left">
            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Material Name
              </span>
              <span className="text-sm font-semibold text-slate-800">{batchData.materialName}</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Scientific Name
              </span>
              <span className="text-sm font-semibold text-slate-800 italic">{batchData.scientificName}</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Current Custodian ID
              </span>
              <span className="text-sm font-bold text-ayur-green-700 flex items-center gap-1.5">
                <User className="h-4 w-4 text-slate-400" />
                {batchData.currentOwnerId}
              </span>
            </div>
          </div>

          {/* Verification Timeline */}
          <div className="border-t border-slate-100 pt-6">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-5">
              Custody Timeline (Participants Only)
            </h3>
            <div className="relative border-l-2 border-slate-100 ml-3 pl-6 flex flex-col gap-6 text-left">
              {batchData.timeline.map((step: any, idx: number) => (
                <div key={idx} className="relative">
                  {/* Point */}
                  <span className="absolute -left-[31px] top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-white border-2 border-ayur-green-600 ring-4 ring-white" />
                  <div className="flex flex-col gap-0.5 text-left">
                    <span className="text-xs font-bold text-slate-900">
                      {step.action}
                    </span>
                    <span className="text-[10px] font-bold text-ayur-green-700">{step.id}</span>
                    <span className="text-[9px] text-slate-400 font-medium mt-0.5">{step.date}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </PageContainer>
    </div>
  );
};
