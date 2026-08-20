import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  ScanLine,
  Package,
  Inbox,
  TrendingUp,
  Clock,
  ArrowRight,
  ShieldCheck,
  Check,
  X,
  FileText,
  ArrowRightLeft,
  ClipboardCheck,
} from 'lucide-react';
import { PageContainer } from '../components/PageContainer';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { cn } from '../utils/cn';
import { useAuth } from '../context/AuthContext';
import { useUI } from '../context/UIContext';
import { dashboardService } from '../services/dashboardService';
import { transferService } from '../services/transferService';
import { batchService } from '../services/batchService';
import { getFriendlyErrorMessage } from '../services/api';

export const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const currentRole = user?.role || 'COLLECTOR';
  const navigate = useNavigate();
  const { showToast } = useUI();
  const queryClient = useQueryClient();

  const { data: summary, isLoading } = useQuery({
    queryKey: ['dashboardSummary'],
    queryFn: () => dashboardService.getSummary(),
    refetchInterval: 10000,
  });

  // Query: Get user batches
  const { data: batches = [] } = useQuery({
    queryKey: ['batches'],
    queryFn: () => batchService.getBatches(),
    refetchInterval: 15000,
  });

  // Query: Get incoming handoff requests
  const { data: incomingRequests = [] } = useQuery({
    queryKey: ['incomingTransfers'],
    queryFn: () => transferService.getIncomingTransfers(),
    enabled: currentRole !== 'COLLECTOR' && currentRole !== 'EXPERT' && currentRole !== 'ADMIN',
    refetchInterval: 8000,
  });

  // Mutation: Accept transfer request
  const acceptMutation = useMutation({
    mutationFn: (transferId: string) => transferService.acceptTransfer(transferId),
    onSuccess: (_, transferId) => {
      const req = incomingRequests.find((r: any) => r.transferId === transferId);
      queryClient.invalidateQueries({ queryKey: ['incomingTransfers'] });
      queryClient.invalidateQueries({ queryKey: ['batches'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardSummary'] });
      showToast(`Handoff accepted successfully!`, 'success');
      if (req) {
        navigate(`/app/batches/${req.batchId}`);
      }
    },
    onError: (err) => {
      const friendlyMsg = getFriendlyErrorMessage(err);
      showToast(friendlyMsg, 'error');
    }
  });

  const handleAccept = (transferId: string) => {
    acceptMutation.mutate(transferId);
  };

  const getStats = () => {
    if (isLoading) {
      return [
        { label: 'Loading...', value: '...', icon: <Clock className="text-slate-400 h-5 w-5" />, bg: 'bg-slate-50' }
      ];
    }

    switch (currentRole) {
      case 'COLLECTOR':
        return [
          { label: 'Identified Crops', value: String(summary?.totalIdentifications ?? 0), icon: <ScanLine className="text-emerald-600 h-5 w-5" />, bg: 'bg-emerald-50' },
          { label: 'Created Batches', value: String(summary?.totalBatches ?? 0), icon: <Package className="text-ayur-green-600 h-5 w-5" />, bg: 'bg-ayur-green-50' },
          { label: 'Pending Handoffs', value: String(summary?.pendingTransfers ?? 0), icon: <Clock className="text-amber-600 h-5 w-5" />, bg: 'bg-amber-50' },
        ];
      case 'WHOLESALER':
      case 'DISTRIBUTOR':
      case 'MANUFACTURER':
        return [
          { label: 'Incoming Transfers', value: String(summary?.incomingTransfers ?? 0), icon: <Inbox className="text-amber-600 h-5 w-5" />, bg: 'bg-amber-50' },
          { label: 'Managed Batches', value: String(summary?.receivedBatches ?? 0), icon: <Package className="text-ayur-green-600 h-5 w-5" />, bg: 'bg-ayur-green-50' },
          { label: 'Pending Verification', value: String(summary?.pendingVerification ?? 0), icon: <ShieldCheck className="text-emerald-600 h-5 w-5" />, bg: 'bg-emerald-50' },
        ];
      default:
        return [
          { label: 'Total Logs', value: String(summary?.totalBatches ?? 0), icon: <TrendingUp className="text-slate-600 h-5 w-5" />, bg: 'bg-slate-100' },
        ];
    }
  };

  const stats = getStats();

  return (
    <PageContainer
      title={`${currentRole.charAt(0) + currentRole.slice(1).toLowerCase()} Dashboard`}
      description="Real-time supply chain ledger, botanical material passports, and transfer controls."
      action={
        currentRole === 'COLLECTOR' ? (
          <Link to="/app/identify">
            <Button className="gap-2 text-xs">
              <ScanLine className="h-4 w-4" />
              Identify New Crop
            </Button>
          </Link>
        ) : (
          <Link to="/app/incoming">
            <Button className="gap-2 text-xs" variant="accent">
              <Inbox className="h-4 w-4" />
              Incoming Transfers ({incomingRequests.length})
            </Button>
          </Link>
        )
      }
    >
      {/* Stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {stats.map((stat, idx) => (
          <Card key={idx} className="flex items-center gap-4 p-5">
            <div className={cn("p-3 rounded-xl shrink-0", stat.bg)}>
              {stat.icon}
            </div>
            <div>
              <p className="text-xs text-slate-500 font-semibold">{stat.label}</p>
              <h3 className="text-2xl font-black text-slate-900 mt-1">{stat.value}</h3>
            </div>
          </Card>
        ))}
      </div>

      {/* Main layout widgets */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Info panel */}
        <Card className="lg:col-span-2 p-6 flex flex-col gap-6" hoverable={false}>
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-slate-900">
              {currentRole === 'COLLECTOR' ? 'MY BATCH PASSPORTS' : 'INCOMING TRANSFERS'}
            </h3>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
              {currentRole === 'COLLECTOR' ? `${batches.length} Total Batches` : `${incomingRequests.length} Pending`}
            </span>
          </div>

          {currentRole === 'COLLECTOR' ? (
            /* Collector Dashboard: MY BATCH PASSPORTS */
            <div className="flex flex-col gap-4">
              {batches.length === 0 ? (
                <div className="text-center py-10 text-slate-400 text-xs flex flex-col items-center gap-3">
                  <Package className="h-10 w-10 text-slate-300" />
                  <p className="font-semibold text-slate-600">No batch passports registered yet.</p>
                  <p className="text-[11px] text-slate-400 max-w-xs">
                    Identify a crop raw material image and click "Create Batch Passport" to start tracking.
                  </p>
                  <Link to="/app/identify" className="mt-2">
                    <Button variant="primary" size="sm" className="text-xs gap-1">
                      <ScanLine className="h-3.5 w-3.5" />
                      Identify Crop Material
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {batches.map((b: any) => {
                    const isOwner = b.currentOwner === user?.participantId;
                    const canTransfer = isOwner && (b.status === 'READY_FOR_TRANSFER' || b.status === 'VERIFIED');
                    const isAloevera = b.material?.toLowerCase().includes('aloe') || b.materialId === 'MAT-001';

                    return (
                      <div
                        key={b.batchId}
                        className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 flex flex-col justify-between gap-3 text-left hover:border-ayur-green-300 transition-colors"
                      >
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-mono font-bold text-slate-500">{b.batchId}</span>
                            <span
                              className={cn(
                                "px-2 py-0.5 rounded text-[9px] font-extrabold uppercase border",
                                b.status === 'READY_FOR_TRANSFER' && "bg-emerald-50 text-emerald-700 border-emerald-200",
                                b.status === 'VERIFIED' && "bg-emerald-50 text-emerald-700 border-emerald-200",
                                b.status === 'TRANSFER_PENDING' && "bg-amber-50 text-amber-700 border-amber-200",
                                b.status === 'TRANSFER_ACCEPTED' && "bg-indigo-50 text-indigo-700 border-indigo-200",
                                b.status === 'COMPLETED' && "bg-emerald-100 text-emerald-800 border-emerald-300",
                                b.status === 'REJECTED' && "bg-rose-50 text-rose-700 border-rose-200",
                                b.status === 'PENDING_EXPERT_REVIEW' && "bg-amber-100 text-amber-800 border-amber-200"
                              )}
                            >
                              {b.status.replace(/_/g, ' ')}
                            </span>
                          </div>
                          <h4 className="text-sm font-bold text-slate-900 mt-1">{b.material}</h4>
                          <span className="text-[10px] text-slate-400 italic">{b.scientificName}</span>
                          <span className="text-[10px] text-slate-500 font-medium mt-1">
                            Material ID: <span className="font-bold text-slate-700">{isAloevera ? 'MAT-001' : 'MAT-002'}</span>
                          </span>
                          <span className="text-[10px] text-slate-500 font-medium">
                            Current Owner: <span className="font-bold text-slate-700">{b.currentOwnerName || b.currentOwner}</span>
                          </span>
                        </div>

                        <div className="flex items-center gap-2 pt-2 border-t border-slate-200/60">
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => navigate(`/app/batches/${b.batchId}`)}
                            className="flex-1 text-[10px] font-bold py-1.5 gap-1"
                          >
                            <FileText className="h-3 w-3" />
                            VIEW PASSPORT
                          </Button>
                          {canTransfer && (
                            <Button
                              variant="primary"
                              size="sm"
                              onClick={() => navigate(`/app/batches/${b.batchId}`)}
                              className="flex-1 text-[10px] font-bold py-1.5 gap-1"
                            >
                              <ArrowRightLeft className="h-3 w-3" />
                              TRANSFER
                            </Button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ) : (
            /* Wholesaler / Distributor / Manufacturer Dashboard: Incoming Transfers & Managed Batches */
            <div className="flex flex-col gap-6">
              {/* Incoming Transfers Section */}
              <div className="flex flex-col gap-4">
                {incomingRequests.length === 0 ? (
                  <div className="text-center py-6 text-slate-400 text-xs bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
                    No incoming transfer requests at the moment.
                  </div>
                ) : (
                  <div className="flex flex-col gap-3">
                    {incomingRequests.map((req: any) => (
                      <div key={req.transferId} className="p-4 bg-amber-50/30 rounded-xl border border-amber-200/80 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-left">
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-2">
                            <span className="text-[9px] uppercase font-bold text-amber-700 font-mono">
                              INCOMING BATCH: {req.batchId}
                            </span>
                          </div>
                          <h4 className="text-sm font-bold text-slate-900">
                            {req.material} ({req.materialId || (req.material === 'Aloevera' ? 'MAT-001' : 'MAT-002')})
                          </h4>
                          <p className="text-[10px] text-slate-600 font-medium">
                            From: <span className="font-bold text-slate-800">{req.fromName || req.fromId}</span> ({req.fromOrg})
                          </p>
                        </div>

                        <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => navigate(`/app/batches/${req.batchId}`)}
                            className="flex-1 sm:flex-initial text-[10px] px-2.5 py-1.5 font-bold gap-1"
                          >
                            <FileText className="h-3.5 w-3.5" />
                            View Passport
                          </Button>
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => handleAccept(req.transferId)}
                            isLoading={acceptMutation.isPending && acceptMutation.variables === req.transferId}
                            className="flex-1 sm:flex-initial text-[10px] px-2.5 py-1.5 font-bold gap-1"
                          >
                            <Check className="h-3.5 w-3.5" />
                            Accept
                          </Button>
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => navigate('/app/incoming')}
                            className="flex-1 sm:flex-initial text-[10px] px-2.5 py-1.5 font-bold gap-1 bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-100"
                          >
                            <X className="h-3.5 w-3.5" />
                            Reject
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Managed Batches Section */}
              <div className="border-t border-slate-100 pt-5 flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                    MY MANAGED BATCHES ({batches.length})
                  </h4>
                  <Link to="/app/batches" className="text-[11px] text-ayur-green-700 font-bold hover:underline">
                    View All
                  </Link>
                </div>

                {batches.length === 0 ? (
                  <div className="text-center py-6 text-slate-400 text-xs">
                    No active managed batches in custody. Accept incoming transfers above to manage batches.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {batches.slice(0, 4).map((b: any) => {
                      const isOwner = b.currentOwner === user?.participantId;
                      const isAcceptedPendingCheck = isOwner && b.status === 'TRANSFER_ACCEPTED';
                      const canTransfer = isOwner && b.status === 'VERIFIED';

                      return (
                        <div key={b.batchId} className="p-4 bg-slate-50 rounded-xl border border-slate-100 text-left flex flex-col justify-between gap-3">
                          <div>
                            <div className="flex justify-between items-center">
                              <span className="text-[10px] font-mono font-bold text-slate-400">{b.batchId}</span>
                              <span className={cn(
                                "px-2 py-0.5 rounded text-[9px] font-bold uppercase border",
                                b.status === 'VERIFIED' && "bg-emerald-50 text-emerald-700 border-emerald-200",
                                b.status === 'TRANSFER_ACCEPTED' && "bg-indigo-50 text-indigo-700 border-indigo-200",
                                b.status === 'COMPLETED' && "bg-emerald-100 text-emerald-800 border-emerald-300",
                                b.status === 'TRANSFER_PENDING' && "bg-amber-50 text-amber-700 border-amber-200"
                              )}>
                                {b.status.replace(/_/g, ' ')}
                              </span>
                            </div>
                            <h5 className="text-xs font-bold text-slate-900 mt-1">{b.material}</h5>
                            <p className="text-[10px] text-slate-400 italic">{b.scientificName}</p>
                          </div>

                          <div className="flex gap-2 pt-2 border-t border-slate-200/50">
                            <Button
                              variant="secondary"
                              size="sm"
                              onClick={() => navigate(`/app/batches/${b.batchId}`)}
                              className="flex-1 text-[10px] font-bold py-1 gap-1"
                            >
                              <FileText className="h-3 w-3" />
                              View
                            </Button>
                            {isAcceptedPendingCheck && (
                              <Button
                                variant="primary"
                                size="sm"
                                onClick={() => navigate(`/app/verify/${b.batchId}`)}
                                className="flex-1 text-[10px] font-bold py-1 gap-1"
                              >
                                <ClipboardCheck className="h-3 w-3" />
                                Verify
                              </Button>
                            )}
                            {canTransfer && (
                              <Button
                                variant="primary"
                                size="sm"
                                onClick={() => navigate(`/app/batches/${b.batchId}`)}
                                className="flex-1 text-[10px] font-bold py-1 gap-1"
                              >
                                <ArrowRightLeft className="h-3 w-3" />
                                Transfer
                              </Button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}
        </Card>

        {/* Sidebar widget */}
        <Card className="p-6 flex flex-col gap-4 bg-slate-900 text-white border-transparent" hoverable={false}>
          <div className="p-3 rounded-xl bg-slate-800 text-ayur-gold-400 w-fit">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <div>
            <h4 className="text-sm font-bold tracking-tight">SIH 2026 Ledger Core</h4>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              Active Session: <span className="font-bold text-white">{user?.name}</span> ({user?.role})
            </p>
            <p className="text-[10px] text-slate-400 mt-1">
              Org: {user?.organizationName} | ID: {user?.participantId}
            </p>
          </div>
          <Link to="/app/batches" className="mt-4">
            <Button variant="accent" size="sm" className="w-full text-xs gap-1 font-bold">
              View All Batches
              <ArrowRight className="h-3 w-3" />
            </Button>
          </Link>
        </Card>
      </div>
    </PageContainer>
  );
};

