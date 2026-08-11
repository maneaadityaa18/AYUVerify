import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Calendar,
  MapPin,
  QrCode,
  ArrowRightLeft,
  ShieldCheck,
  Download,
  ClipboardCheck,
} from 'lucide-react';
import { PageContainer } from '../components/PageContainer';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Modal } from '../components/Modal';
import { Input } from '../components/Input';
import { Loading } from '../components/Loading';
import { useUI } from '../context/UIContext';
import { useAuth } from '../context/AuthContext';
import { cn } from '../utils/cn';
import { batchService } from '../services/batchService';
import { transferService } from '../services/transferService';
import { participantService } from '../services/participantService';
import { getFriendlyErrorMessage } from '../services/api';

export const BatchDetails: React.FC = () => {
  const { batchId } = useParams<{ batchId: string }>();
  const { showToast } = useUI();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Modal States
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [recipientRole, setRecipientRole] = useState('WHOLESALER');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRecipient, setSelectedRecipient] = useState<any | null>(null);
  const [transferNote, setTransferNote] = useState('');
  
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Query: Get batch passport details
  const { data: passport, isLoading, error } = useQuery({
    queryKey: ['batch', batchId],
    queryFn: () => batchService.getBatch(batchId!),
    enabled: !!batchId,
  });

  // Query: Search participants live from backend directory
  const { data: searchedRecipients = [] } = useQuery({
    queryKey: ['participantsSearch', searchQuery, recipientRole],
    queryFn: () => participantService.search(searchQuery, recipientRole),
    enabled: searchQuery.length >= 2,
  });

  // Mutation: Transfer batch ownership request
  const transferMutation = useMutation({
    mutationFn: (data: { recipientId: string; note?: string }) =>
      transferService.createTransfer(batchId!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['batch', batchId] });
      queryClient.invalidateQueries({ queryKey: ['batches'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardSummary'] });
      showToast('Transfer request dispatched successfully!', 'success');
      setIsTransferModalOpen(false);
      setSelectedRecipient(null);
      setSearchQuery('');
      setTransferNote('');
    },
    onError: (err) => {
      const friendlyMsg = getFriendlyErrorMessage(err);
      showToast(friendlyMsg, 'error');
    }
  });

  const handleTransferSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validation matching Section 81.3
    const validationErrors: Record<string, string> = {};
    if (!selectedRecipient) {
      validationErrors.recipient = 'Please select a recipient.';
    }
    if (transferNote.length > 500) {
      validationErrors.note = 'Note must be under 500 characters.';
    }

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setErrors({});
    transferMutation.mutate({
      recipientId: selectedRecipient.participantId,
      note: transferNote,
    });
  };

  const isOwner = user?.participantId === passport?.currentOwner;
  const isPendingHandoff = passport?.status === 'TRANSFER_PENDING';
  const showVerificationButton =
    !isOwner &&
    user?.role !== 'COLLECTOR' &&
    user?.participantId === passport?.currentOwner;

  if (isLoading) {
    return (
      <PageContainer title="Batch Passport" description="Accessing digital passport details from the ledger...">
        <div className="flex justify-center items-center py-24">
          <Loading />
        </div>
      </PageContainer>
    );
  }

  if (error || !passport) {
    return (
      <PageContainer title="Batch Passport" description="Ledger registry error.">
        <div className="text-center py-16 text-slate-400">
          <p className="font-bold text-sm text-slate-500">Passport Record Not Found</p>
          <p className="text-xs text-slate-400 mt-1">This Batch ID could not be resolved in the secure ledger database.</p>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer
      title={`Batch: ${passport.batchId}`}
      description="View full material classification details, digital passport verification, and custody audit logs."
      action={
        <div className="flex items-center gap-3">
          {showVerificationButton && (
            <Link to={`/app/verify/${passport.batchId}`}>
              <Button className="gap-1.5 text-xs font-bold" variant="secondary">
                <ClipboardCheck className="h-4 w-4 text-ayur-green-600" />
                Verify Package Checks
              </Button>
            </Link>
          )}
          {isOwner && !isPendingHandoff ? (
            <Button onClick={() => setIsTransferModalOpen(true)} className="gap-1.5 text-xs font-bold">
              <ArrowRightLeft className="h-4 w-4" />
              Transfer Custody
            </Button>
          ) : isPendingHandoff ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-amber-50 text-amber-700 border border-amber-100">
              ⏳ Transfer Pending
            </span>
          ) : null}
        </div>
      }
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Passport details */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          <Card className="p-6 md:p-8 flex flex-col gap-6" hoverable={false}>
            {/* Header info */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-5 gap-4">
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                  Raw Material Details
                </span>
                <h2 className="text-xl font-bold text-slate-900 mt-1">
                  {passport.material?.materialName || 'Unknown Botanical'}
                </h2>
                <p className="text-xs text-slate-400 italic mt-0.5">
                  {passport.material?.scientificName || 'Unclassified Taxonomy'}
                </p>
              </div>
              <div className="flex gap-2 shrink-0">
                <span
                  className={cn(
                    "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border",
                    passport.status === 'VERIFIED' && 'bg-emerald-50 text-emerald-700 border-emerald-100',
                    passport.status === 'TRANSFER_PENDING' && 'bg-amber-50 text-amber-700 border-amber-100',
                    passport.status === 'TRANSFER_REJECTED' && 'bg-rose-50 text-rose-700 border-rose-100'
                  )}
                >
                  <ShieldCheck className="h-3.5 w-3.5" />
                  {passport.status.replace('_', ' ')}
                </span>
                {passport.identification && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700">
                    🟢 {(passport.identification.confidence * 100).toFixed(0)}% AI Match
                  </span>
                )}
              </div>
            </div>

            {/* Grid stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs text-slate-600">
              <div className="flex flex-col gap-1">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                  Harvest Location
                </span>
                <span className="font-semibold text-slate-800 flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5 text-slate-400" />
                  {passport.sourceLocation}
                </span>
              </div>

              <div className="flex flex-col gap-1">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                  Harvest Date
                </span>
                <span className="font-semibold text-slate-800 flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5 text-slate-400" />
                  {new Date(passport.createdAt).toLocaleString()}
                </span>
              </div>

              <div className="flex flex-col gap-1">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                  Original Creator ID
                </span>
                <span className="font-semibold text-slate-800">{passport.createdBy}</span>
              </div>

              <div className="flex flex-col gap-1">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                  Current Owner ID
                </span>
                <span className="font-semibold text-slate-800">{passport.currentOwner}</span>
              </div>
            </div>

            {/* Notes */}
            {passport.notes && (
              <div className="border-t border-slate-100 pt-4 text-xs">
                <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[10px] mb-2">
                  Collector Notes
                </h4>
                <p className="text-slate-500 leading-relaxed bg-slate-50/50 p-3 rounded-lg border border-slate-100/50">
                  {passport.notes}
                </p>
              </div>
            )}
          </Card>

          {/* Timeline Audit log */}
          <Card className="p-6" hoverable={false}>
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-5">
              Supply Chain Audit Timeline
            </h3>
            <div className="relative border-l-2 border-slate-100 ml-3 pl-6 flex flex-col gap-6 text-left">
              {passport.history.map((event: any, idx: number) => (
                <div key={idx} className="relative">
                  <span className="absolute -left-[31px] top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-white border-2 border-ayur-green-600 ring-4 ring-white" />
                  <div className="flex flex-col text-left">
                    <span className="text-xs font-bold text-slate-900">{event.type.replace('_', ' ').title || event.type}</span>
                    <span className="text-[11px] text-slate-500 mt-0.5">{event.detail}</span>
                    <span className="text-[9px] text-slate-400 mt-1 font-semibold">
                      {new Date(event.date).toLocaleString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* QR Code sidebar container */}
        <div className="flex flex-col gap-6 w-full">
          <Card className="p-6 text-center flex flex-col items-center gap-4" hoverable={false}>
            <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl relative group">
              <QrCode className="h-32 w-32 text-slate-800" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900">Physical Packaging QR Label</h4>
              <p className="text-[11px] text-slate-400 mt-1">
                Print and attach this label. Scanners open the public batch lookup details page.
              </p>
            </div>
            <a
              href={`${window.location.origin}/public/batch/${passport.batchId}`}
              target="_blank"
              rel="noreferrer"
              className="w-full"
            >
              <Button variant="secondary" size="sm" className="w-full gap-1.5 text-xs font-bold">
                <Download className="h-3.5 w-3.5" />
                View Label Link
              </Button>
            </a>
          </Card>
        </div>
      </div>

      {/* Transfer Dialog Modal */}
      <Modal
        isOpen={isTransferModalOpen}
        onClose={() => setIsTransferModalOpen(false)}
        title="Transfer Material Handoff"
        footer={
          <div className="flex gap-3">
            <Button variant="secondary" onClick={() => setIsTransferModalOpen(false)} disabled={transferMutation.isPending} className="text-xs">
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleTransferSubmit}
              isLoading={transferMutation.isPending}
              disabled={!selectedRecipient}
              className="text-xs font-bold"
            >
              Send Transfer Request
            </Button>
          </div>
        }
      >
        <form onSubmit={handleTransferSubmit} className="flex flex-col gap-4">
          <div className="w-full flex flex-col gap-1.5">
            <label htmlFor="recipientRole" className="text-xs font-semibold text-slate-700">
              Recipient Role Type
            </label>
            <select
              id="recipientRole"
              value={recipientRole}
              onChange={(e) => {
                setRecipientRole(e.target.value);
                setSelectedRecipient(null);
              }}
              className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-ayur-green-500"
            >
              <option value="WHOLESALER">Wholesaler (WHO)</option>
              <option value="DISTRIBUTOR">Distributor (DIS)</option>
              <option value="MANUFACTURER">Manufacturer (MAN)</option>
            </select>
          </div>

          <div className="w-full flex flex-col gap-1.5">
            <Input
              id="searchQuery"
              label="Search Registered Recipient"
              placeholder="Enter ID or Organization (min 2 chars)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              disabled={transferMutation.isPending}
            />

            {/* Recipient list results */}
            <div className="border border-slate-100 rounded-lg max-h-36 overflow-y-auto mt-1 flex flex-col divide-y divide-slate-50 text-xs">
              {searchedRecipients.map((rec: any) => (
                <button
                  type="button"
                  key={rec.participantId}
                  onClick={() => {
                    setSelectedRecipient(rec);
                    setSearchQuery(`${rec.participantId} — ${rec.organizationName}`);
                  }}
                  className={cn(
                    "w-full text-left px-4 py-2.5 hover:bg-slate-50 flex justify-between items-center",
                    selectedRecipient?.participantId === rec.participantId && "bg-ayur-green-50/50 text-ayur-green-800"
                  )}
                >
                  <div className="flex flex-col font-bold">
                    <span>{rec.organizationName}</span>
                    <span className="text-[10px] text-slate-400 font-medium">{rec.location}</span>
                  </div>
                  <span className="font-bold text-ayur-green-700">{rec.participantId}</span>
                </button>
              ))}
              {searchQuery.length >= 2 && searchedRecipients.length === 0 && (
                <div className="p-4 text-center text-slate-400">No matching participants found.</div>
              )}
              {searchQuery.length < 2 && (
                <div className="p-4 text-center text-slate-400 font-medium">Type at least 2 characters to search...</div>
              )}
            </div>
            {errors.recipient && <span role="alert" className="text-xs text-red-500 font-medium mt-1">{errors.recipient}</span>}
          </div>

          <div className="w-full flex flex-col gap-1.5">
            <label htmlFor="transferNote" className="text-xs font-semibold text-slate-700">
              Handoff Note (Optional)
            </label>
            <textarea
              id="transferNote"
              placeholder="Add shipping references or package details..."
              value={transferNote}
              onChange={(e) => setTransferNote(e.target.value)}
              className={cn(
                "w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-ayur-green-500 min-h-[70px]",
                errors.note && "border-red-500 focus:ring-red-500"
              )}
              disabled={transferMutation.isPending}
            />
            {errors.note && <span role="alert" className="text-xs text-red-500 font-medium">{errors.note}</span>}
          </div>
        </form>
      </Modal>
    </PageContainer>
  );
};
