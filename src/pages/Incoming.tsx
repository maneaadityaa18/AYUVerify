import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Check, X, ShieldAlert, FileText } from 'lucide-react';
import { PageContainer } from '../components/PageContainer';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Modal } from '../components/Modal';
import { Loading } from '../components/Loading';
import { useUI } from '../context/UIContext';
import { cn } from '../utils/cn';
import { transferService } from '../services/transferService';
import { getFriendlyErrorMessage } from '../services/api';

interface TransferRequest {
  transferId: string;
  batchId: string;
  material: string;
  scientificName: string;
  fromId: string;
  fromOrg: string;
  confidence: number;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  date: string;
}

export const Incoming: React.FC = () => {
  const { showToast } = useUI();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Dialog State
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<TransferRequest | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Query: Get incoming handoff requests
  const { data: requests = [], isLoading } = useQuery<TransferRequest[]>({
    queryKey: ['incomingTransfers'],
    queryFn: () => transferService.getIncomingTransfers(),
  });

  // Mutation: Accept transfer request
  const acceptMutation = useMutation({
    mutationFn: (transferId: string) => transferService.acceptTransfer(transferId),
    onSuccess: (_, transferId) => {
      // Find the associated request to get the batchId
      const req = requests.find((r) => r.transferId === transferId);
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

  // Mutation: Reject transfer request
  const rejectMutation = useMutation({
    mutationFn: ({ transferId, reason }: { transferId: string; reason: string }) =>
      transferService.rejectTransfer(transferId, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['incomingTransfers'] });
      queryClient.invalidateQueries({ queryKey: ['batches'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardSummary'] });
      showToast(`Handoff transfer request rejected.`, 'warning');
      setIsRejectModalOpen(false);
      setSelectedRequest(null);
    },
    onError: (err) => {
      const friendlyMsg = getFriendlyErrorMessage(err);
      showToast(friendlyMsg, 'error');
    }
  });

  const handleAccept = (req: TransferRequest) => {
    acceptMutation.mutate(req.transferId);
  };

  const handleRejectClick = (req: TransferRequest) => {
    setSelectedRequest(req);
    setIsRejectModalOpen(true);
    setRejectReason('');
    setErrors({});
  };

  const handleRejectSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validation matching Section 81.4
    if (rejectReason.trim().length < 5) {
      setErrors({ reason: 'Please provide a reason (min 5 characters).' });
      return;
    }
    if (rejectReason.length > 500) {
      setErrors({ reason: 'Reason must be under 500 characters.' });
      return;
    }

    if (!selectedRequest) return;

    setErrors({});
    rejectMutation.mutate({
      transferId: selectedRequest.transferId,
      reason: rejectReason,
    });
  };

  const isMutationPending = acceptMutation.isPending || rejectMutation.isPending;

  if (isLoading) {
    return (
      <PageContainer title="Incoming Handoff Requests" description="Accessing pending ledger handoffs...">
        <div className="flex justify-center items-center py-20">
          <Loading />
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer
      title="Incoming Handoff Requests"
      description="View and verify incoming material transfers from upstream supply chain participants."
      isEmpty={requests.length === 0}
      emptyMessage="No pending incoming handoff requests at the moment."
    >
      <div className="flex flex-col gap-6 max-w-4xl">
        {requests.map((req) => (
          <Card key={req.transferId} className="p-6 flex flex-col sm:flex-row justify-between items-start gap-6">
            <div className="flex flex-col gap-4 text-left">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                  Transfer ID: {req.transferId}
                </span>
                <h3 className="text-base font-bold text-slate-900 mt-1">
                  {req.material} ({req.batchId})
                </h3>
                <p className="text-xs text-slate-400 italic mt-0.5">{req.scientificName}</p>
              </div>

              <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-xs text-slate-600">
                <div className="flex flex-col">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Sender ID</span>
                  <span className="font-semibold text-slate-800">{req.fromId}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Sender Org</span>
                  <span className="font-semibold text-slate-800 truncate max-w-[150px]">{req.fromOrg}</span>
                </div>
                <div className="flex flex-col mt-1">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">AI Accuracy</span>
                  <span className="font-semibold text-slate-800">{(req.confidence * 100).toFixed(0)}%</span>
                </div>
                <div className="flex flex-col mt-1">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Risk Assessment</span>
                  <span className="font-semibold text-emerald-600">🟢 {req.riskLevel}</span>
                </div>
              </div>
            </div>

            {/* Action buttons with Loading guards Section 87 */}
            <div className="flex sm:flex-col gap-3 w-full sm:w-auto shrink-0 self-stretch sm:justify-center">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => navigate(`/app/batches/${req.batchId}`)}
                className="flex-1 sm:flex-initial gap-1.5 text-xs font-bold"
                disabled={isMutationPending}
              >
                <FileText className="h-4 w-4" />
                View Passport
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => handleAccept(req)}
                isLoading={acceptMutation.isPending && acceptMutation.variables === req.transferId}
                className="flex-1 sm:flex-initial gap-1.5 text-xs font-bold"
                disabled={isMutationPending}
              >
                <Check className="h-4 w-4" />
                Accept Handoff
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={() => handleRejectClick(req)}
                className="flex-1 sm:flex-initial gap-1.5 text-xs font-bold bg-rose-50 text-rose-700 hover:bg-rose-100 hover:text-rose-800 border border-rose-100"
                disabled={isMutationPending}
              >
                <X className="h-4 w-4" />
                Reject
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {/* Reject Modal dialog Section 36 */}
      <Modal
        isOpen={isRejectModalOpen}
        onClose={() => setIsRejectModalOpen(false)}
        title="Reject Incoming Handoff"
        footer={
          <div className="flex gap-3">
            <Button variant="secondary" onClick={() => setIsRejectModalOpen(false)} disabled={isMutationPending} className="text-xs">
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={handleRejectSubmit}
              isLoading={rejectMutation.isPending}
              disabled={isMutationPending}
              className="text-xs font-bold"
            >
              Confirm Rejection
            </Button>
          </div>
        }
      >
        <form onSubmit={handleRejectSubmit} className="flex flex-col gap-4">
          <div className="bg-rose-50 border border-rose-100 p-4 rounded-xl text-rose-950 flex gap-3">
            <ShieldAlert className="h-5 w-5 text-rose-600 shrink-0 mt-0.5" />
            <div className="flex flex-col text-xs">
              <span className="font-bold">Cautionary Notice</span>
              <span className="text-rose-800/90 mt-1">
                Rejecting this transfer will leave the batch owned by the sender. The rejection event and reason will be logged permanently in the batch history.
              </span>
            </div>
          </div>

          <div className="w-full flex flex-col gap-1.5">
            <label htmlFor="rejectReason" className="text-xs font-semibold text-slate-700">
              Reason for Rejection
            </label>
            <textarea
              id="rejectReason"
              placeholder="Provide a detailed rejection note (minimum 5 characters)..."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              className={cn(
                "w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-red-500 min-h-[90px]",
                errors.reason && "border-red-500 focus:ring-red-500"
              )}
              disabled={isMutationPending}
              required
            />
            {errors.reason && <span role="alert" className="text-xs text-red-500 font-medium">{errors.reason}</span>}
          </div>
        </form>
      </Modal>
    </PageContainer>
  );
};
