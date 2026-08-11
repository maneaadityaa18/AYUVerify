import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { PageContainer } from '../../components/PageContainer';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { ClipboardCheck, History, BookOpen, ArrowRight, ShieldAlert } from 'lucide-react';

// 1. Expert Dashboard
export const ExpertDashboard: React.FC = () => {
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
            <p className="text-xs text-slate-500 mt-1">Review queue API endpoint integration is currently pending on the backend ledger service.</p>
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
  return (
    <PageContainer
      title="Pending Materials Reviews"
      description="Select flagged items to audit species and approve batch clearance."
    >
      <div className="max-w-2xl mx-auto">
        <Card className="p-8 flex flex-col items-center justify-center text-center gap-4 min-h-[250px]" hoverable={false}>
          <div className="p-4 bg-slate-50 text-slate-400 rounded-full">
            <ClipboardCheck className="h-10 w-10 text-slate-300" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-800">Review Queue Offline</h3>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              Botanist reviews and flagged species escalation endpoints are currently offline. These endpoints are pending integration in Phase 2.
            </p>
          </div>
        </Card>
      </div>
    </PageContainer>
  );
};

// 3. Review Details
export const ReviewDetails: React.FC = () => {
  const { reviewId } = useParams<{ reviewId: string }>();

  return (
    <PageContainer
      title={`Audit: ${reviewId || 'REV-00123'}`}
      description="Inspect crop imagery, match classification descriptors, and submit final clearance verdict."
    >
      <Card className="max-w-2xl mx-auto p-6 flex flex-col gap-6" hoverable={false}>
        <div className="border-b border-slate-100 pb-4 text-left">
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Expert Review Workspace</span>
          <h3 className="text-base font-bold text-slate-950 mt-1">Uncertain Raw Material Batch</h3>
        </div>

        <div className="flex flex-col items-center justify-center p-8 bg-slate-50 rounded-xl border border-slate-100 text-slate-400 text-center">
          <ShieldAlert className="h-8 w-8 text-slate-400 mb-2" />
          <p className="text-xs font-bold text-slate-700">Detailed Review Fields Offline</p>
          <p className="text-[10px] text-slate-400 mt-1">Botanical image workspace is pending integration with the species escalation API backend.</p>
        </div>

        <div className="flex gap-3 justify-end">
          <Link to="/expert/reviews">
            <Button variant="secondary" size="sm" className="text-xs">Back to Queue</Button>
          </Link>
        </div>
      </Card>
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
          <h4 className="text-sm font-bold text-slate-900">Ashwagandha (Withania somnifera)</h4>
          <p className="text-xs text-slate-500 leading-relaxed">
            Solanaceae family. Prominent markers: stout roots, oval green leaves, bell-shaped flowers, and small red berries.
          </p>
        </Card>
        <Card className="p-5 text-left flex flex-col gap-2">
          <h4 className="text-sm font-bold text-slate-900">Tulsi (Ocimum sanctum)</h4>
          <p className="text-xs text-slate-500 leading-relaxed">
            Lamiaceae family. Prominent markers: highly aromatic, square stems, serrated purple or green leaves, small purplish spikes.
          </p>
        </Card>
      </div>
    </PageContainer>
  );
};
