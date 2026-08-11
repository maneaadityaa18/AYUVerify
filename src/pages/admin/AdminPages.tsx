import React from 'react';
import { PageContainer } from '../../components/PageContainer';
import { Card } from '../../components/Card';
import { Users, BookOpen, Cpu, Package, ClipboardCheck, BarChart3 } from 'lucide-react';

// 1. Admin Dashboard
export const AdminDashboard: React.FC = () => {
  return (
    <PageContainer
      title="System Admin Dashboard"
      description="Overview of network health, active participants, neural prediction feeds, and audit trail metrics."
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="p-5 flex items-center gap-4">
          <div className="p-3 rounded-xl bg-blue-50 text-blue-600 shrink-0">
            <Users className="h-5 w-5" />
          </div>
          <div className="text-left">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Registered Participants</span>
            <h3 className="text-lg font-black text-slate-900 mt-1">42</h3>
          </div>
        </Card>

        <Card className="p-5 flex items-center gap-4">
          <div className="p-3 rounded-xl bg-emerald-50 text-emerald-600 shrink-0">
            <Package className="h-5 w-5" />
          </div>
          <div className="text-left">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Active Batches</span>
            <h3 className="text-lg font-black text-slate-900 mt-1">104</h3>
          </div>
        </Card>

        <Card className="p-5 flex items-center gap-4">
          <div className="p-3 rounded-xl bg-purple-50 text-purple-600 shrink-0">
            <Cpu className="h-5 w-5" />
          </div>
          <div className="text-left">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">AI Inferences Run</span>
            <h3 className="text-lg font-black text-slate-900 mt-1">842</h3>
          </div>
        </Card>
      </div>
    </PageContainer>
  );
};

// 2. Admin Users Manager
export const AdminUsers: React.FC = () => {
  return (
    <PageContainer
      title="Participant Registry Manager"
      description="Manage blockchain credentials, role authorizations, and profile registries."
    >
      <Card className="p-6 text-center text-slate-400" hoverable={false}>
        <Users className="h-8 w-8 text-slate-300 mx-auto mb-2" />
        <h4 className="text-sm font-bold text-slate-800">Registry Table Workplace</h4>
        <p className="text-xs text-slate-400 mt-1">Authorized participants management list will be set up in Phase 8.</p>
      </Card>
    </PageContainer>
  );
};

// 3. Admin Materials Manager
export const AdminMaterials: React.FC = () => {
  return (
    <PageContainer
      title="Herbal Classification Catalog"
      description="Create or configure raw herbal species classification parameters and metadata catalog."
    >
      <Card className="p-6 text-center text-slate-400" hoverable={false}>
        <BookOpen className="h-8 w-8 text-slate-300 mx-auto mb-2" />
        <h4 className="text-sm font-bold text-slate-800">Botanical Catalog Configurator</h4>
        <p className="text-xs text-slate-400 mt-1">Add, edit, or delete botanical identifiers and risk scores.</p>
      </Card>
    </PageContainer>
  );
};

// 4. Admin Predictions Feed
export const AdminPredictions: React.FC = () => {
  return (
    <PageContainer
      title="AI Inferences Feed"
      description="Live feed of YOLOv8 neural network identification triggers across the node networks."
    >
      <Card className="p-6 text-center text-slate-400" hoverable={false}>
        <Cpu className="h-8 w-8 text-slate-300 mx-auto mb-2" />
        <h4 className="text-sm font-bold text-slate-800">YOLO Model Inferences Ledger</h4>
        <p className="text-xs text-slate-400 mt-1">Review live upload statistics, confidence levels, and edge execution speeds.</p>
      </Card>
    </PageContainer>
  );
};

// 5. Admin Batches
export const AdminBatches: React.FC = () => {
  return (
    <PageContainer
      title="Global Batches Ledger"
      description="Inspect all supply chain raw material batch digital passports."
    >
      <Card className="p-6 text-center text-slate-400" hoverable={false}>
        <Package className="h-8 w-8 text-slate-300 mx-auto mb-2" />
        <h4 className="text-sm font-bold text-slate-800">Custodian Batches Directory</h4>
        <p className="text-xs text-slate-400 mt-1">Search and audit status, custodian paths, and verification histories globally.</p>
      </Card>
    </PageContainer>
  );
};

// 6. Admin Reviews
export const AdminReviews: React.FC = () => {
  return (
    <PageContainer
      title="Botanists Reviews Ledger"
      description="Monitor active escalations, botanist review timelines, and species audit records."
    >
      <Card className="p-6 text-center text-slate-400" hoverable={false}>
        <ClipboardCheck className="h-8 w-8 text-slate-300 mx-auto mb-2" />
        <h4 className="text-sm font-bold text-slate-800">Active Escapes Registry</h4>
        <p className="text-xs text-slate-400 mt-1">Track pending reviews, botanists assigned, and audit duration stats.</p>
      </Card>
    </PageContainer>
  );
};

// 7. Admin Analytics
export const AdminAnalytics: React.FC = () => {
  return (
    <PageContainer
      title="Supply Chain Analytics"
      description="Visualize transaction throughputs, verification ratios, and network delays."
    >
      <Card className="p-6 text-center text-slate-400" hoverable={false}>
        <BarChart3 className="h-8 w-8 text-slate-300 mx-auto mb-2" />
        <h4 className="text-sm font-bold text-slate-800">Visual Insights Workplace</h4>
        <p className="text-xs text-slate-400 mt-1">Detailed graphs mapping batch lifecycle durations and verification ratios.</p>
      </Card>
    </PageContainer>
  );
};
