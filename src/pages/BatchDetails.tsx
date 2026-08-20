import React, { useState, useEffect } from 'react';
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
  ShieldAlert,
  Cpu,
  UserCheck,
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

  // Auto-set default recipient role based on logged-in user
  useEffect(() => {
    if (user?.role === 'COLLECTOR') {
      setRecipientRole('WHOLESALER');
    } else if (user?.role === 'WHOLESALER') {
      setRecipientRole('DISTRIBUTOR');
    } else if (user?.role === 'DISTRIBUTOR') {
      setRecipientRole('MANUFACTURER');
    }
  }, [user?.role]);

  // Report Issue Modal States
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [reportReason, setReportReason] = useState('Wrong Material');
  const [reportDescription, setReportDescription] = useState('');
  const [reportErrors, setReportErrors] = useState<Record<string, string>>({});

  const reportMutation = useMutation({
    mutationFn: (data: { reason: string; description: string }) =>
      batchService.reportIssue(batchId!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['batch', batchId] });
      queryClient.invalidateQueries({ queryKey: ['batches'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardSummary'] });
      showToast('Dispute submitted for expert review.', 'warning');
      setIsReportModalOpen(false);
      setReportDescription('');
    },
    onError: (err) => {
      const friendlyMsg = getFriendlyErrorMessage(err);
      showToast(friendlyMsg, 'error');
    }
  });

  const handleReportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (reportDescription.trim().length < 5) {
      setReportErrors({ description: 'Description must be at least 5 characters.' });
      return;
    }
    setReportErrors({});
    reportMutation.mutate({
      reason: reportReason,
      description: reportDescription
    });
  };

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
    enabled: isTransferModalOpen,
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

  // Helper to extract verification record for role
  const getVerificationRecord = (role: string) => {
    if (passport?.verificationRecords && passport.verificationRecords.length > 0) {
      const rec = passport.verificationRecords.find((r: any) => r.actorRole === role);
      if (rec) return rec;
    }
    const prefixMap: Record<string, string> = {
      'COLLECTOR': 'COL-',
      'WHOLESALER': 'WHO-',
      'DISTRIBUTOR': 'DIS-',
      'MANUFACTURER': 'MAN-'
    };
    const prefix = prefixMap[role];
    const hist = passport?.history?.find((h: any) => h.type === 'BATCH_VERIFIED' && (h.actorRole === role || (prefix && h.actor?.startsWith(prefix))));
    if (hist) {
      return {
        verifiedBy: hist.actor,
        actorName: hist.actorName,
        actorRole: hist.actorRole,
        organizationName: hist.organizationName || '',
        date: hist.date,
        comments: hist.detail
      };
    }
    return null;
  };

  const collectorRecord = getVerificationRecord('COLLECTOR');
  const wholesalerRecord = getVerificationRecord('WHOLESALER');
  const distributorRecord = getVerificationRecord('DISTRIBUTOR');
  const manufacturerRecord = getVerificationRecord('MANUFACTURER');

  const hasExpertVerified = passport?.history?.some((h: any) => h.type === 'EXPERT_VERIFIED') ?? false;
  const expertVerifyEvent = passport?.history?.find((h: any) => h.type === 'EXPERT_VERIFIED');

  const hasExpertRejected = passport?.history?.some((h: any) => h.type === 'EXPERT_REJECTED') ?? false;
  const expertRejectEvent = passport?.history?.find((h: any) => h.type === 'EXPERT_REJECTED');

  const isOwner = user?.participantId === passport?.currentOwner;
  const isPendingHandoff = passport?.status === 'TRANSFER_PENDING';
  
  const showVerificationButton =
    isOwner &&
    user?.role !== 'COLLECTOR' &&
    passport?.status === 'TRANSFER_ACCEPTED';

  const showTransferButton = isOwner && (passport?.status === 'VERIFIED' || passport?.status === 'READY_FOR_TRANSFER');

  const showReportIssueButton =
    user?.role !== 'COLLECTOR' &&
    user?.role !== 'EXPERT' &&
    user?.role !== 'ADMIN' &&
    passport?.status !== 'REJECTED' &&
    passport?.status !== 'COMPLETED' &&
    passport?.status !== 'PENDING_EXPERT_REVIEW';

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

  const { identification } = passport;

  return (
    <PageContainer
      title={`Batch: ${passport.batchId}`}
      description="View full material classification details, digital passport verification, and custody audit logs."
      action={
        <div className="flex items-center gap-3">
          {showReportIssueButton && (
            <Button onClick={() => setIsReportModalOpen(true)} className="gap-1.5 text-xs font-bold bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-100" variant="secondary">
              <ShieldAlert className="h-4 w-4" />
              Report Issue
            </Button>
          )}
          {showVerificationButton && (
            <Link to={`/app/verify/${passport.batchId}`}>
              <Button className="gap-1.5 text-xs font-bold" variant="secondary">
                <ClipboardCheck className="h-4 w-4 text-ayur-green-600" />
                Verify Package Checks
              </Button>
            </Link>
          )}
          {showTransferButton ? (
            <Button onClick={() => setIsTransferModalOpen(true)} className="gap-1.5 text-xs font-bold">
              <ArrowRightLeft className="h-4 w-4" />
              Transfer Custody
            </Button>
          ) : isPendingHandoff ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-amber-50 text-amber-700 border border-amber-100">
              ⏳ Transfer Pending
            </span>
          ) : passport.status === 'PENDING_EXPERT_REVIEW' ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-amber-50 text-amber-700 border border-amber-100">
              ⚠️ Flagged for Expert Review
            </span>
          ) : passport.status === 'REJECTED' ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-rose-50 text-rose-700 border border-rose-100">
              🚫 Rejected
            </span>
          ) : passport.status === 'COMPLETED' ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-100">
              ✓ Completed
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
                  Raw Material Identification
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
                    "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border uppercase",
                    (passport.status === 'VERIFIED' || passport.status === 'READY_FOR_TRANSFER') && 'bg-emerald-50 text-emerald-700 border-emerald-100',
                    passport.status === 'TRANSFER_PENDING' && 'bg-amber-50 text-amber-700 border-amber-100',
                    passport.status === 'TRANSFER_ACCEPTED' && 'bg-indigo-50 text-indigo-700 border-indigo-100',
                    passport.status === 'COMPLETED' && 'bg-emerald-100 text-emerald-800 border-emerald-200',
                    passport.status === 'REJECTED' && 'bg-rose-50 text-rose-700 border-rose-100'
                  )}
                >
                  <ShieldCheck className="h-3.5 w-3.5" />
                  {passport.status.replace(/_/g, ' ')}
                </span>
                {identification?.confidence && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700">
                    🟢 {(identification.confidence * 100).toFixed(0)}% AI Confidence
                  </span>
                )}
              </div>
            </div>

            {/* Grid stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs text-slate-600">
              <div className="flex flex-col gap-1">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                  Material ID
                </span>
                <span className="font-bold text-slate-900 font-mono">
                  {passport.material?.materialId || (passport.material?.materialName === 'Aloevera' ? 'MAT-001' : 'MAT-002')}
                </span>
              </div>

              <div className="flex flex-col gap-1">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                  Batch Passport ID
                </span>
                <span className="font-bold text-slate-900 font-mono">{passport.batchId}</span>
              </div>

              <div className="flex flex-col gap-1">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                  Source / Harvest Location
                </span>
                <span className="font-semibold text-slate-800 flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5 text-slate-400" />
                  {passport.sourceLocation}
                </span>
              </div>

              <div className="flex flex-col gap-1">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                  Harvest Timestamp
                </span>
                <span className="font-semibold text-slate-800 flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5 text-slate-400" />
                  {new Date(passport.createdAt).toLocaleString()}
                </span>
              </div>

              <div className="flex flex-col gap-1">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                  Collector Participant
                </span>
                <span className="font-semibold text-slate-800 flex items-center gap-1">
                  <UserCheck className="h-3.5 w-3.5 text-slate-400" />
                  {passport.createdByInfo?.name || passport.createdBy} ({passport.createdBy})
                </span>
              </div>

              <div className="flex flex-col gap-1">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                  Current Owner Custodian
                </span>
                <span className="font-semibold text-slate-800 flex items-center gap-1">
                  <UserCheck className="h-3.5 w-3.5 text-ayur-green-600" />
                  {passport.currentOwnerInfo?.name || passport.currentOwner} ({passport.currentOwner})
                </span>
              </div>

              {passport.status === 'TRANSFER_PENDING' && passport.transferredTo && (
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                    Transferred To (Pending Acceptance)
                  </span>
                  <span className="font-semibold text-amber-700 flex items-center gap-1">
                    <ArrowRightLeft className="h-3.5 w-3.5 text-amber-500" />
                    {passport.transferredToName || passport.transferredTo} ({passport.transferredTo})
                  </span>
                </div>
              )}
            </div>

            {/* Collector Notes */}
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

          {/* AI Species Identification Image & Bounding Box View */}
          {identification && (
            <Card className="p-6 flex flex-col gap-4 text-left" hoverable={false}>
              <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Cpu className="h-4 w-4 text-emerald-600" />
                  AI Raw Material Identification
                </h3>
                <span className="text-[10px] text-slate-400 font-mono font-bold">
                  {identification.identificationId}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                {identification.imageUrl && (
                  <div className="md:col-span-5 relative w-full overflow-hidden bg-slate-100 border border-slate-200 rounded-xl">
                    <img
                      src={identification.imageUrl}
                      alt="Raw material photo"
                      className="w-full h-auto block"
                    />
                    {identification.detections && identification.detections.map((det: any, idx: number) => {
                      const { x1, y1, x2, y2 } = det.normalized_bbox || {};
                      if (x1 === undefined) return null;
                      const left = `${x1 * 100}%`;
                      const top = `${y1 * 100}%`;
                      const width = `${(x2 - x1) * 100}%`;
                      const height = `${(y2 - y1) * 100}%`;
                      const isAloe = det.class_id === 0;

                      return (
                        <div
                          key={idx}
                          className={cn(
                            "absolute border-[2px] rounded-xs shadow-sm",
                            isAloe ? 'border-emerald-500 bg-emerald-500/10' : 'border-amber-500 bg-amber-500/10'
                          )}
                          style={{ left, top, width, height }}
                        >
                          <span className={cn(
                            "absolute -top-5 left-0 text-[9px] font-extrabold px-1.5 py-0.5 rounded shadow-xs uppercase",
                            isAloe ? 'bg-emerald-600 text-white' : 'bg-amber-500 text-slate-900'
                          )}>
                            {det.class_name} ({(det.confidence * 100).toFixed(0)}%)
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}

                <div className="md:col-span-7 flex flex-col gap-3 text-xs">
                  <div className="flex justify-between border-b border-slate-50 pb-2">
                    <span className="text-slate-500">Detected Species:</span>
                    <span className="font-bold text-slate-900">{passport.material?.materialName}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-50 pb-2">
                    <span className="text-slate-500">AI Confidence:</span>
                    <span className="font-bold text-emerald-700">{(identification.confidence * 100).toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-50 pb-2">
                    <span className="text-slate-500">Adulteration Risk Level:</span>
                    <span className="font-extrabold text-slate-800">🟢 {passport.riskLevel}</span>
                  </div>
                  {identification.inference_time_ms && (
                    <div className="flex justify-between border-b border-slate-50 pb-2">
                      <span className="text-slate-500">Inference Latency:</span>
                      <span className="font-bold text-slate-800">{identification.inference_time_ms} ms</span>
                    </div>
                  )}
                  {identification.device && (
                    <div className="flex justify-between border-b border-slate-50 pb-2">
                      <span className="text-slate-500">Device Accelerator:</span>
                      <span className="font-bold uppercase text-slate-800">{identification.device}</span>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          )}

          {/* VERIFIED BY Section */}
          <Card className="p-6 flex flex-col gap-4 text-left" hoverable={false}>
            <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">VERIFIED BY</h3>
              <span className={cn(
                "inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold uppercase",
                passport.status === 'COMPLETED' && 'bg-emerald-100 text-emerald-800',
                passport.status === 'PENDING_EXPERT_REVIEW' && 'bg-amber-100 text-amber-800',
                passport.status === 'REJECTED' && 'bg-red-100 text-red-800',
                (passport.status === 'VERIFIED' || passport.status === 'READY_FOR_TRANSFER') && 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              )}>
                {passport.status.replace(/_/g, ' ')}
              </span>
            </div>

            <div className="flex flex-col gap-3">
              {/* 1. Collector Verification */}
              <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-100 text-xs">
                <div className="flex items-center gap-3">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 text-emerald-800 font-bold shrink-0">✓</span>
                  <div className="flex flex-col">
                    <span className="font-bold text-slate-900">1. Collector Stage</span>
                    <span className="text-[11px] text-slate-600 font-medium mt-0.5">
                      {collectorRecord ? `${collectorRecord.actorName} (${collectorRecord.verifiedBy})` : `${passport.createdByInfo?.name || passport.createdBy} (${passport.createdBy})`}
                    </span>
                    <span className="text-[10px] text-slate-400 font-semibold mt-0.5">
                      {new Date(collectorRecord?.date || passport.createdAt).toLocaleString()}
                    </span>
                  </div>
                </div>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-1 rounded border border-emerald-100">
                  VERIFIED
                </span>
              </div>

              {/* 2. Wholesaler Verification */}
              <div className={cn(
                "flex items-center justify-between p-3.5 rounded-xl border text-xs",
                wholesalerRecord ? "bg-emerald-50/40 border-emerald-200" : "bg-slate-50/30 border-slate-100 text-slate-400"
              )}>
                <div className="flex items-center gap-3">
                  <span className={cn(
                    "flex h-6 w-6 items-center justify-center rounded-full font-bold shrink-0",
                    wholesalerRecord ? "bg-emerald-100 text-emerald-800" : "bg-slate-200 text-slate-400"
                  )}>{wholesalerRecord ? "✓" : "○"}</span>
                  <div className="flex flex-col">
                    <span className="font-bold text-slate-900">2. Wholesaler Stage</span>
                    {wholesalerRecord ? (
                      <>
                        <span className="text-[11px] text-slate-700 font-medium mt-0.5">
                          {wholesalerRecord.actorName} ({wholesalerRecord.verifiedBy}) — {wholesalerRecord.organizationName}
                        </span>
                        <span className="text-[10px] text-slate-400 font-semibold mt-0.5">
                          {new Date(wholesalerRecord.date).toLocaleString()}
                        </span>
                        {wholesalerRecord.comments && (
                          <span className="text-[10px] text-slate-500 italic mt-1 bg-white p-2 rounded border border-slate-100">
                            "{wholesalerRecord.comments}"
                          </span>
                        )}
                      </>
                    ) : (
                      <span className="text-[10px] text-slate-400 mt-0.5">Pending Wholesaler physical cargo check</span>
                    )}
                  </div>
                </div>
                <span className={cn(
                  "text-[10px] font-bold px-2 py-1 rounded border",
                  wholesalerRecord ? "text-emerald-700 bg-emerald-50 border-emerald-100" : "text-slate-400 bg-slate-100 border-slate-200"
                )}>
                  {wholesalerRecord ? "VERIFIED" : "PENDING"}
                </span>
              </div>

              {/* 3. Distributor Verification */}
              <div className={cn(
                "flex items-center justify-between p-3.5 rounded-xl border text-xs",
                distributorRecord ? "bg-emerald-50/40 border-emerald-200" : "bg-slate-50/30 border-slate-100 text-slate-400"
              )}>
                <div className="flex items-center gap-3">
                  <span className={cn(
                    "flex h-6 w-6 items-center justify-center rounded-full font-bold shrink-0",
                    distributorRecord ? "bg-emerald-100 text-emerald-800" : "bg-slate-200 text-slate-400"
                  )}>{distributorRecord ? "✓" : "○"}</span>
                  <div className="flex flex-col">
                    <span className="font-bold text-slate-900">3. Distributor Stage</span>
                    {distributorRecord ? (
                      <>
                        <span className="text-[11px] text-slate-700 font-medium mt-0.5">
                          {distributorRecord.actorName} ({distributorRecord.verifiedBy}) — {distributorRecord.organizationName}
                        </span>
                        <span className="text-[10px] text-slate-400 font-semibold mt-0.5">
                          {new Date(distributorRecord.date).toLocaleString()}
                        </span>
                        {distributorRecord.comments && (
                          <span className="text-[10px] text-slate-500 italic mt-1 bg-white p-2 rounded border border-slate-100">
                            "{distributorRecord.comments}"
                          </span>
                        )}
                      </>
                    ) : (
                      <span className="text-[10px] text-slate-400 mt-0.5">Pending Distributor physical cargo check</span>
                    )}
                  </div>
                </div>
                <span className={cn(
                  "text-[10px] font-bold px-2 py-1 rounded border",
                  distributorRecord ? "text-emerald-700 bg-emerald-50 border-emerald-100" : "text-slate-400 bg-slate-100 border-slate-200"
                )}>
                  {distributorRecord ? "VERIFIED" : "PENDING"}
                </span>
              </div>

              {/* 4. Manufacturer Verification */}
              <div className={cn(
                "flex items-center justify-between p-3.5 rounded-xl border text-xs",
                manufacturerRecord ? "bg-emerald-50/40 border-emerald-200" : "bg-slate-50/30 border-slate-100 text-slate-400"
              )}>
                <div className="flex items-center gap-3">
                  <span className={cn(
                    "flex h-6 w-6 items-center justify-center rounded-full font-bold shrink-0",
                    manufacturerRecord ? "bg-emerald-100 text-emerald-800" : "bg-slate-200 text-slate-400"
                  )}>{manufacturerRecord ? "✓" : "○"}</span>
                  <div className="flex flex-col">
                    <span className="font-bold text-slate-900">4. Manufacturer Final Release</span>
                    {manufacturerRecord ? (
                      <>
                        <span className="text-[11px] text-slate-700 font-medium mt-0.5">
                          {manufacturerRecord.actorName} ({manufacturerRecord.verifiedBy}) — {manufacturerRecord.organizationName}
                        </span>
                        <span className="text-[10px] text-slate-400 font-semibold mt-0.5">
                          {new Date(manufacturerRecord.date).toLocaleString()}
                        </span>
                        {manufacturerRecord.comments && (
                          <span className="text-[10px] text-slate-500 italic mt-1 bg-white p-2 rounded border border-slate-100">
                            "{manufacturerRecord.comments}"
                          </span>
                        )}
                      </>
                    ) : (
                      <span className="text-[10px] text-slate-400 mt-0.5">Pending Manufacturer final release check</span>
                    )}
                  </div>
                </div>
                <span className={cn(
                  "text-[10px] font-bold px-2 py-1 rounded border",
                  manufacturerRecord ? "text-emerald-700 bg-emerald-50 border-emerald-100" : "text-slate-400 bg-slate-100 border-slate-200"
                )}>
                  {manufacturerRecord ? "COMPLETED" : "PENDING"}
                </span>
              </div>

              {/* Expert Botanist Escalation (if applicable) */}
              {(passport.status === 'PENDING_EXPERT_REVIEW' || hasExpertVerified || hasExpertRejected) && (
                <div className="flex items-center justify-between p-3.5 rounded-xl border text-xs bg-amber-50/40 border-amber-200">
                  <div className="flex items-center gap-3">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-100 text-amber-800 font-bold shrink-0">!</span>
                    <div className="flex flex-col text-left">
                      <span className="font-bold text-slate-900">Expert Botanist Review</span>
                      {passport.status === 'PENDING_EXPERT_REVIEW' && (
                        <span className="text-[11px] text-amber-800 font-bold mt-0.5 animate-pulse">
                          Disputed crop identification pending Expert analysis.
                        </span>
                      )}
                      {hasExpertVerified && (
                        <span className="text-[11px] text-emerald-700 font-medium mt-0.5">
                          Approved & certified by Expert on {new Date(expertVerifyEvent?.date).toLocaleDateString()}
                        </span>
                      )}
                      {hasExpertRejected && (
                        <span className="text-[11px] text-rose-700 font-bold mt-0.5">
                          Rejected by Expert on {new Date(expertRejectEvent?.date).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </Card>

          {/* Timeline Audit log */}
          <Card className="p-6" hoverable={false}>
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-5">
              TRANSFER & AUDIT TIMELINE
            </h3>
            <div className="relative border-l-2 border-slate-100 ml-3 pl-6 flex flex-col gap-6 text-left">
              {passport.history.map((event: any, idx: number) => (
                <div key={idx} className="relative">
                  <span className="absolute -left-[31px] top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-white border-2 border-ayur-green-600 ring-4 ring-white" />
                  <div className="flex flex-col text-left">
                    <span className="text-xs font-bold text-slate-900">
                      {event.type ? event.type.replace(/_/g, ' ') : 'EVENT'}
                    </span>
                    <span className="text-[11px] text-slate-600 mt-0.5">{event.detail}</span>
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
        <form onSubmit={handleTransferSubmit} className="flex flex-col gap-4 text-left">
          <div className="w-full flex flex-col gap-1.5">
            <label htmlFor="recipientRole" className="text-xs font-semibold text-slate-700">
              Transfer To Role
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
            <label className="text-xs font-semibold text-slate-700">Select Recipient Participant</label>
            <Input
              id="searchQuery"
              placeholder="Search by ID or Organization..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              disabled={transferMutation.isPending}
            />

            {/* Recipient list results */}
            <div className="border border-slate-200 rounded-lg max-h-48 overflow-y-auto mt-1 flex flex-col divide-y divide-slate-100 text-xs">
              {searchedRecipients.map((rec: any) => (
                <button
                  type="button"
                  key={rec.participantId}
                  onClick={() => {
                    setSelectedRecipient(rec);
                    setSearchQuery(`${rec.participantId} — ${rec.organizationName}`);
                  }}
                  className={cn(
                    "w-full text-left px-4 py-3 hover:bg-slate-50 flex justify-between items-center transition-colors",
                    selectedRecipient?.participantId === rec.participantId && "bg-ayur-green-50 text-ayur-green-900 border-l-4 border-ayur-green-600 font-bold"
                  )}
                >
                  <div className="flex flex-col">
                    <span className="font-bold text-slate-800">{rec.organizationName} ({rec.name})</span>
                    <span className="text-[10px] text-slate-400">{rec.location}</span>
                  </div>
                  <span className="font-extrabold text-ayur-green-700 font-mono">{rec.participantId}</span>
                </button>
              ))}
              {searchedRecipients.length === 0 && (
                <div className="p-4 text-center text-slate-400 text-xs">
                  No matching participants registered for {recipientRole}.
                </div>
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

      {/* Report Issue Dialog Modal */}
      <Modal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        title="Report Identification Issue"
        footer={
          <div className="flex gap-3">
            <Button variant="secondary" onClick={() => setIsReportModalOpen(false)} disabled={reportMutation.isPending} className="text-xs">
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={handleReportSubmit}
              isLoading={reportMutation.isPending}
              disabled={reportDescription.trim().length < 5}
              className="text-xs font-bold"
            >
              Submit For Expert Review
            </Button>
          </div>
        }
      >
        <form onSubmit={handleReportSubmit} className="flex flex-col gap-4 text-left">
          <div className="bg-amber-50 border border-amber-100 p-4 rounded-xl text-amber-950 flex gap-3 text-xs">
            <ShieldAlert className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="flex flex-col">
              <span className="font-bold">Botanical Identification Review Flag</span>
              <span className="text-amber-800/90 mt-1">
                Flagging this batch will escalate it to the Expert Review Queue. Physical transfers and verification checks will be locked until the Expert Botanist issues a verdict.
              </span>
            </div>
          </div>

          <div className="w-full flex flex-col gap-1.5">
            <label htmlFor="reportReason" className="text-xs font-semibold text-slate-700">
              Dispute Category
            </label>
            <select
              id="reportReason"
              value={reportReason}
              onChange={(e) => setReportReason(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-ayur-green-500"
            >
              <option value="Wrong Material">Wrong Material (AI Mismatch)</option>
              <option value="Poor Quality / Adulteration">Poor Quality / Adulteration Detected</option>
              <option value="Contaminated Crop Batch">Contaminated Crop Batch</option>
              <option value="Other">Other Issues</option>
            </select>
          </div>

          <div className="w-full flex flex-col gap-1.5">
            <label htmlFor="reportDescription" className="text-xs font-semibold text-slate-700">
              Reason Description
            </label>
            <textarea
              id="reportDescription"
              placeholder="Describe what physical features or markers are incorrect (minimum 5 characters)..."
              value={reportDescription}
              onChange={(e) => setReportDescription(e.target.value)}
              className={cn(
                "w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-ayur-green-500 min-h-[90px]",
                reportErrors.description && "border-red-500 focus:ring-red-500"
              )}
              disabled={reportMutation.isPending}
              required
            />
            {reportErrors.description && <span role="alert" className="text-xs text-red-500 font-medium">{reportErrors.description}</span>}
          </div>
        </form>
      </Modal>
    </PageContainer>
  );
};

