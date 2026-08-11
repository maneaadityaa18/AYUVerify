import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  ScanLine,
  Package,
  Inbox,
  TrendingUp,
  Clock,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { PageContainer } from '../components/PageContainer';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { cn } from '../utils/cn';
import { useAuth } from '../context/AuthContext';
import { dashboardService } from '../services/dashboardService';

export const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const currentRole = user?.role || 'COLLECTOR';

  const { data: summary, isLoading } = useQuery({
    queryKey: ['dashboardSummary'],
    queryFn: () => dashboardService.getSummary(),
  });

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
      description="Real-time ledger overview, species identifications, and batch custody history."
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
              View Incoming Requests
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
        <Card className="lg:col-span-2 p-6 flex flex-col gap-5">
          <div className="flex items-center justify-between border-b border-slate-50 pb-3">
            <h3 className="text-sm font-bold text-slate-900">Recent Supply Chain Handoffs</h3>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
              Live Feed
            </span>
          </div>

          <div className="flex flex-col gap-4 text-center py-6">
            <p className="text-xs text-slate-400 font-semibold">
              Live handoff activity feed integration pending real-time event streaming.
            </p>
          </div>
        </Card>

        {/* Sidebar widget */}
        <Card className="p-6 flex flex-col gap-4 bg-slate-900 text-white border-transparent" hoverable={false}>
          <div className="p-3 rounded-xl bg-slate-800 text-ayur-gold-400 w-fit">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <div>
            <h4 className="text-sm font-bold tracking-tight">SIH 2026 Ledger Core</h4>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              You are signed in with secure cryptographic token validation. Register different participant accounts to experience other roles inside the supply chain system.
            </p>
          </div>
          <Link to="/app/batches" className="mt-4">
            <Button variant="accent" size="sm" className="w-full text-xs gap-1">
              View My Batches
              <ArrowRight className="h-3 w-3" />
            </Button>
          </Link>
        </Card>
      </div>
    </PageContainer>
  );
};
