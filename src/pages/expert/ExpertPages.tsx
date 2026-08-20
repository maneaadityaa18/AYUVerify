import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ClipboardCheck, History, BookOpen, ArrowRight, ShieldAlert, Check, X } from 'lucide-react';
import { PageContainer } from '../../components/PageContainer';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { Loading } from '../../components/Loading';
import { useUI } from '../../context/UIContext';
import { expertService } from '../../services/expertService';
import { dashboardService } from '../../services/dashboardService';
import { getFriendlyErrorMessage } from '../../services/api';
import { cn } from '../../utils/cn';

// 1. Expert Dashboard
export const ExpertDashboard: React.FC = () => {
  const { data: summary, isLoading } = useQuery({
    queryKey: ['dashboardSummary'],
    queryFn: () => dashboardService.getSummary(),
  });

  return (
    <PageContainer
      title="Expert Botanist Panel"
      description="Review flagged identifications, audit raw material quality, and manage botanical knowledge."
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 text-left">
        <Card className="p-6 flex flex-col gap-4">
          <div className="p-3 bg-amber-50 text-amber-600 rounded-xl w-fit">
            <ClipboardCheck className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">Flagged Review Queue</h3>
            <p className="text-xs text-slate-500 mt-1">
              {isLoading ? 'Loading queue details...' : `There are currently ${summary?.pendingReviews ?? 0} batches awaiting expert verification.`}
            </p>
          </div>
          <Link to="/expert/reviews" className="mt-2">
            <Button size="sm" className="text-xs gap-1 font-bold">
              Open Queue
              <ArrowRight className="h-3 w-3" />
            </Button>
          </Link>
        </Card>

        <Card className="p-6 flex flex-col gap-4">
          <div className="p-3 bg-ayur-green-50 text-ayur-green-600 rounded-xl w-fit">
            <BookOpen className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">Materials Knowledge Base</h3>
            <p className="text-xs text-slate-500 mt-1">Verify botanical properties, taxonomic descriptions, and classification reference markers.</p>
          </div>
          <Link to="/expert/materials" className="mt-2">
            <Button variant="secondary" size="sm" className="text-xs font-bold">Browse Catalog</Button>
          </Link>
        </Card>
      </div>
    </PageContainer>
  );
};

// 2. Pending Reviews Queue
export const ExpertReviews: React.FC = () => {
  const navigate = useNavigate();
  const { data: reviews = [], isLoading } = useQuery<any[]>({
    queryKey: ['expertReviews'],
    queryFn: () => expertService.getReviews(),
  });

  if (isLoading) {
    return (
      <PageContainer title="Pending Materials Reviews" description="Escalated crop batches awaiting species verification checks.">
        <div className="flex justify-center items-center py-20">
          <Loading />
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer
      title="Pending Materials Reviews"
      description="Select flagged items to audit species and approve batch clearance."
      isEmpty={reviews.length === 0}
      emptyMessage="No pending escalated review requests in your queue."
    >
      <div className="flex flex-col gap-6 max-w-4xl">
        {reviews.map((rev) => (
          <Card key={rev.batchId} className="p-6 flex flex-col sm:flex-row justify-between items-start gap-6 text-left" hoverable={true}>
            <div className="flex flex-col gap-4">
              <div>
                <span className="text-[10px] uppercase font-bold text-amber-600 tracking-wider">
                  ⚠️ Flagged Review Case
                </span>
                <h3 className="text-base font-bold text-slate-900 mt-1">
                  {rev.materialName} ({rev.batchId})
                </h3>
                <p className="text-xs text-slate-400 italic mt-0.5">{rev.scientificName}</p>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl flex flex-col gap-2 max-w-lg text-xs">
                <div className="flex justify-between">
                  <span className="font-bold text-slate-500">Disputed Category:</span>
                  <span className="font-extrabold text-slate-800">{rev.reportedIssue?.reason}</span>
                </div>
                <div className="flex flex-col border-t border-slate-200/50 pt-2 mt-1">
                  <span className="font-bold text-slate-500">Description:</span>
                  <p className="text-slate-700 mt-1 leading-relaxed italic">
                    "{rev.reportedIssue?.description}"
                  </p>
                </div>
                <div className="flex justify-between mt-2 pt-2 border-t border-slate-200/50 text-[10px] text-slate-400 font-medium">
                  <span>Flagged By: {rev.reportedIssue?.reportedByName} ({rev.reportedIssue?.reportedByRole})</span>
                  <span>{new Date(rev.reportedIssue?.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>

            <div className="shrink-0 self-stretch sm:self-center flex sm:flex-col justify-center">
              <Button
                variant="primary"
                onClick={() => navigate(`/expert/reviews/${rev.batchId}`)}
                className="gap-1.5 text-xs font-bold w-full sm:w-auto"
              >
                <ClipboardCheck className="h-4 w-4" />
                View Workspace
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </PageContainer>
  );
};

// 3. Review Details / Expert Workspace
export const ReviewDetails: React.FC = () => {
  const { reviewId } = useParams<{ reviewId: string }>();
  const navigate = useNavigate();
  const { showToast } = useUI();
  const queryClient = useQueryClient();
  const [notes, setNotes] = useState('');

  // Fetch the detailed review details
  const { data: rev, isLoading, error } = useQuery({
    queryKey: ['expertReview', reviewId],
    queryFn: () => expertService.getReview(reviewId!),
    enabled: !!reviewId,
  });

  const decisionMutation = useMutation({
    mutationFn: (decisionData: { decision: string; notes: string }) =>
      expertService.submitDecision(reviewId!, decisionData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expertReviews'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardSummary'] });
      showToast(`Expert review submitted successfully!`, 'success');
      navigate('/expert/reviews');
    },
    onError: (err) => {
      const friendlyMsg = getFriendlyErrorMessage(err);
      showToast(friendlyMsg, 'error');
    }
  });

  const handleDecision = (decision: 'APPROVE' | 'REJECT') => {
    if (notes.trim().length < 5) {
      showToast('Please enter review notes explaining your verdict (min 5 characters).', 'error');
      return;
    }
    decisionMutation.mutate({ decision, notes });
  };

  if (isLoading) {
    return (
      <PageContainer title="Expert Review Workspace" description="Accessing escalated case logs...">
        <div className="flex justify-center items-center py-20">
          <Loading />
        </div>
      </PageContainer>
    );
  }

  if (error || !rev) {
    return (
      <PageContainer title="Expert Review Workspace" description="Escalation record not found.">
        <div className="text-center py-16 text-slate-400">
          <p className="font-bold text-sm text-slate-500">Escalated Record Not Found</p>
          <p className="text-xs text-slate-400 mt-1">This review case could not be retrieved from the ledger databases.</p>
        </div>
      </PageContainer>
    );
  }

  const { identification } = rev;
  
  // Base API url to construct full image path (image url is relative /uploads/...)
  const backendBase = import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace('/api/v1', '') : 'http://localhost:8000';
  const fullImageUrl = identification?.imageUrl ? `${backendBase}${identification.imageUrl}` : '';

  return (
    <PageContainer
      title={`Audit Batch: ${rev.batchId}`}
      description="Inspect crop imagery, match classification descriptors, and submit final clearance verdict."
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start text-left">
        {/* Left Side: AI Bounding Box Viewer & Details */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          <Card className="p-6 flex flex-col gap-5" hoverable={false}>
            <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-900">AI Species Detection Image View</span>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider font-mono">
                {identification?.identificationId}
              </span>
            </div>

            {identification?.imageUrl ? (
              <div className="relative w-full overflow-hidden bg-slate-100 border border-slate-200 rounded-2xl shadow-sm">
                <img
                  src={fullImageUrl}
                  alt="Escalated crop preview"
                  className="w-full h-auto block"
                />
                
                {/* Bounding box rendering */}
                {identification.detections && identification.detections.map((det: any, idx: number) => {
                  const { x1, y1, x2, y2 } = det.normalized_bbox;
                  const left = `${x1 * 100}%`;
                  const top = `${y1 * 100}%`;
                  const width = `${(x2 - x1) * 100}%`;
                  const height = `${(y2 - y1) * 100}%`;
                  const isAloeClass = det.class_id === 0;
                  
                  return (
                    <div
                      key={idx}
                      className={cn(
                        "absolute border-[3px] rounded-xs shadow-md group",
                        isAloeClass ? 'border-emerald-500 bg-emerald-50/10' : 'border-amber-500 bg-amber-50/10'
                      )}
                      style={{ left, top, width, height }}
                    >
                      <span className={cn(
                        "absolute -top-6 left-0 text-[10px] font-extrabold px-2 py-0.5 rounded shadow-sm whitespace-nowrap uppercase tracking-wider",
                        isAloeClass ? 'bg-emerald-600 text-white' : 'bg-amber-500 text-slate-900'
                      )}>
                        {det.class_name} ({(det.confidence * 100).toFixed(0)}%)
                      </span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-12 border-2 border-dashed border-slate-200 rounded-2xl text-center text-slate-400 text-xs bg-slate-50/50">
                No image preview stored for this identification.
              </div>
            )}

            {/* AI result info */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-semibold text-slate-600 border-t border-slate-100 pt-4">
              <div className="flex flex-col gap-0.5">
                <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">AI Match</span>
                <span className="text-slate-800 font-bold">{identification?.material?.name}</span>
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Confidence</span>
                <span className="text-slate-800 font-bold">{(identification?.confidence * 100).toFixed(1)}%</span>
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Inference Speed</span>
                <span className="text-slate-800 font-bold">{identification?.inference_time_ms} ms</span>
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Device Used</span>
                <span className="text-slate-800 font-extrabold uppercase">{identification?.device}</span>
              </div>
            </div>
          </Card>
        </div>

        {/* Right Side: Flagged Dispute Details & Resolution panel */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          {/* Dispute report details */}
          <Card className="p-6 flex flex-col gap-4 border-amber-200 bg-amber-50/20" hoverable={false}>
            <div className="border-b border-amber-100 pb-3 flex items-center justify-between">
              <span className="text-xs font-bold text-amber-950 flex items-center gap-1.5">
                <ShieldAlert className="h-4 w-4 text-amber-600 shrink-0" />
                Reported Issue Details
              </span>
            </div>

            <div className="flex flex-col gap-3 text-xs">
              <div className="flex flex-col">
                <span className="font-bold text-slate-500">Disputed Category</span>
                <span className="font-extrabold text-slate-800 mt-1">{rev.reportedIssue?.reason}</span>
              </div>

              <div className="flex flex-col border-t border-slate-200/50 pt-2 mt-1">
                <span className="font-bold text-slate-500">Custodian Description</span>
                <p className="text-slate-700 mt-1 leading-relaxed bg-white border border-slate-200/60 p-3 rounded-lg italic">
                  "{rev.reportedIssue?.description}"
                </p>
              </div>

              <div className="flex justify-between mt-1 text-[10px] text-slate-400 font-medium">
                <span>Flagged By: {rev.reportedIssue?.reportedByName} ({rev.reportedIssue?.reportedByRole})</span>
                <span>{new Date(rev.reportedIssue?.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          </Card>

          {/* Expert resolution controls */}
          <Card className="p-6 flex flex-col gap-4" hoverable={false}>
            <div className="border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900 font-black">Botanist Verdict Desk</h3>
              <p className="text-[10px] text-slate-400 font-medium mt-0.5">Submit taxonomic clearance decision</p>
            </div>

            <div className="flex flex-col gap-4">
              <div className="w-full flex flex-col gap-1.5">
                <label htmlFor="notes" className="text-xs font-semibold text-slate-700">
                  Expert Review Notes / Justification
                </label>
                <textarea
                  id="notes"
                  placeholder="Explain why this batch is approved (verified species alignment) or rejected (adulteration/substitution detected)..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-ayur-green-500 min-h-[90px]"
                  disabled={decisionMutation.isPending}
                  required
                />
              </div>

              <div className="flex gap-3 justify-end border-t border-slate-100 pt-4">
                <Link to="/expert/reviews">
                  <Button variant="secondary" size="sm" disabled={decisionMutation.isPending} className="text-xs">
                    Cancel
                  </Button>
                </Link>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => handleDecision('REJECT')}
                  isLoading={decisionMutation.isPending && decisionMutation.variables?.decision === 'REJECT'}
                  disabled={decisionMutation.isPending}
                  className="text-xs gap-1.5 font-bold bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-100"
                >
                  <X className="h-4 w-4" />
                  Reject Batch
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => handleDecision('APPROVE')}
                  isLoading={decisionMutation.isPending && decisionMutation.variables?.decision === 'APPROVE'}
                  disabled={decisionMutation.isPending}
                  className="text-xs gap-1.5 font-bold"
                >
                  <Check className="h-4 w-4" />
                  Approve Species
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </PageContainer>
  );
};

// 4. Expert History
export const ExpertHistory: React.FC = () => {
  return (
    <PageContainer
      title="Expert Audit Logs"
      description="Review historical botanist decisions and batch validation logs."
    >
      <Card className="p-8 text-center text-slate-400" hoverable={false}>
        <History className="h-10 w-10 text-slate-300 mx-auto mb-3" />
        <h4 className="text-sm font-bold text-slate-800">No Review History</h4>
        <p className="text-xs text-slate-400 mt-1">When you verify or reject flagged materials, logs will compile here.</p>
      </Card>
    </PageContainer>
  );
};

// 5. Materials Knowledge Base
export const ExpertMaterials: React.FC = () => {
  return (
    <PageContainer
      title="Herbal Knowledge Catalog"
      description="Browse verified species taxonomy, reference images, and chemical identification profiles."
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <Card className="p-5 text-left flex flex-col gap-2">
          <h4 className="text-sm font-bold text-slate-900">Aloevera (Aloe barbadensis miller)</h4>
          <p className="text-xs text-slate-500 leading-relaxed">
            Asphodelaceae family. Prominent markers: thick, fleshy green leaves with spiny margins, enclosing a clear inner gel.
          </p>
        </Card>
        <Card className="p-5 text-left flex flex-col gap-2">
          <h4 className="text-sm font-bold text-slate-900">Amla (Phyllanthus emblica)</h4>
          <p className="text-xs text-slate-500 leading-relaxed">
            Phyllanthaceae family. Prominent markers: round light greenish-yellow fruits with vertical stripes, rich in Vitamin C.
          </p>
        </Card>
      </div>
    </PageContainer>
  );
};
