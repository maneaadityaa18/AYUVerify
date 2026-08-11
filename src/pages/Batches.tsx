import React, { useState, useEffect } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { Search, Plus, Calendar, MapPin } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { PageContainer } from '../components/PageContainer';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Modal } from '../components/Modal';
import { Input } from '../components/Input';
import { useUI } from '../context/UIContext';
import { cn } from '../utils/cn';
import { batchService } from '../services/batchService';
import { getFriendlyErrorMessage } from '../services/api';

interface Batch {
  batchId: string;
  material: string;
  scientificName: string;
  createdBy: string;
  currentOwner: string;
  status: 'VERIFIED' | 'TRANSFER_PENDING' | 'TRANSFER_REJECTED';
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  createdAt: string;
  sourceLocation: string;
}

export const Batches: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { showToast } = useUI();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Dialog State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [sourceLocation, setSourceLocation] = useState('');
  const [notes, setNotes] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Sorting & Filtering State
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState('newest');

  // React Query: Fetch batches
  const { data: batches = [] } = useQuery<Batch[]>({
    queryKey: ['batches'],
    queryFn: () => batchService.getBatches(),
  });

  // React Query: Create batch mutation
  const createMutation = useMutation({
    mutationFn: (newBatch: {
      identificationId: string;
      materialId: string;
      sourceLocation: string;
      notes?: string;
    }) => batchService.createBatch(newBatch),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['batches'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardSummary'] });
      showToast(`Batch created successfully! ID: ${data.batchId}`, 'success');
      handleCloseModal();
    },
    onError: (err) => {
      const friendlyMsg = getFriendlyErrorMessage(err);
      showToast(friendlyMsg, 'error');
    }
  });

  // Check URL query parameters for create trigger (?create=true&id=...)
  useEffect(() => {
    if (searchParams.get('create') === 'true' && searchParams.get('id')) {
      setIsCreateModalOpen(true);
    }
  }, [searchParams]);

  const handleCloseModal = () => {
    setIsCreateModalOpen(false);
    setSourceLocation('');
    setNotes('');
    setErrors({});
    setSearchParams({});
  };

  const handleCreateClick = () => {
    const id = searchParams.get('id');
    if (!id) {
      showToast('To create a batch, please identify your crop raw material first.', 'info');
      navigate('/app/identify');
    } else {
      setIsCreateModalOpen(true);
    }
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Form Validation Section 81.5
    const validationErrors: Record<string, string> = {};
    if (sourceLocation.trim().length < 2) {
      validationErrors.sourceLocation = 'Please enter the source location (min 2 characters).';
    }
    if (notes.length > 1000) {
      validationErrors.notes = 'Notes must be under 1000 characters.';
    }

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    const id = searchParams.get('id');
    const materialId = searchParams.get('materialId') || 'MAT-001';

    if (!id) {
      showToast('Crop identification ID is missing.', 'error');
      return;
    }

    setErrors({});
    createMutation.mutate({
      identificationId: id,
      materialId: materialId,
      sourceLocation: sourceLocation,
      notes: notes
    });
  };

  // Filtered & Sorted list
  const filteredBatches = batches
    .filter((b) => {
      const matchSearch =
        b.batchId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.material.toLowerCase().includes(searchTerm.toLowerCase());
      const matchStatus = statusFilter === 'ALL' || b.status === statusFilter;
      return matchSearch && matchStatus;
    })
    .sort((a, b) => {
      if (sortBy === 'newest') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      if (sortBy === 'oldest') return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      if (sortBy === 'name') return a.material.localeCompare(b.material);
      return 0;
    });

  return (
    <PageContainer
      title="My Batches"
      description="View and manage physical herbal raw material batches catalogued under your ownership."
      action={
        <Button onClick={handleCreateClick} className="gap-2 text-xs font-bold">
          <Plus className="h-4 w-4" />
          Create Batch
        </Button>
      }
      isEmpty={filteredBatches.length === 0}
      emptyMessage="No batches found. Try tweaking your filters or create your first batch from the crop identification page."
    >
      {/* Filters Card */}
      <Card className="p-4 mb-6 flex flex-col md:flex-row gap-4" hoverable={false}>
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by Batch ID or material name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-50 border border-slate-100 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-ayur-green-500"
          />
        </div>
        <div className="flex items-center gap-3">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-50 border border-slate-100 rounded-lg px-3 py-2 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-ayur-green-500"
          >
            <option value="ALL">All Statuses</option>
            <option value="VERIFIED">Verified</option>
            <option value="TRANSFER_PENDING">Pending Handoff</option>
            <option value="TRANSFER_REJECTED">Rejected</option>
          </select>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="bg-slate-50 border border-slate-100 rounded-lg px-3 py-2 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-ayur-green-500"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="name">Alphabetical</option>
          </select>
        </div>
      </Card>

      {/* Grid of items */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredBatches.map((batch) => (
          <Link key={batch.batchId} to={`/app/batches/${batch.batchId}`}>
            <Card className="p-6 flex flex-col gap-4 hover:border-ayur-green-200 hover:ring-1 hover:ring-ayur-green-100/50">
              <div className="flex items-center justify-between border-b border-slate-50 pb-3">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                  {batch.batchId}
                </span>
                <span
                  className={cn(
                    "inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold border",
                    batch.status === 'VERIFIED' && 'bg-emerald-50 text-emerald-700 border-emerald-100',
                    batch.status === 'TRANSFER_PENDING' && 'bg-amber-50 text-amber-700 border-amber-100',
                    batch.status === 'TRANSFER_REJECTED' && 'bg-rose-50 text-rose-700 border-rose-100'
                  )}
                >
                  {batch.status.replace('_', ' ')}
                </span>
              </div>

              <div>
                <h3 className="text-base font-bold text-slate-900">{batch.material}</h3>
                <p className="text-xs text-slate-400 italic mt-0.5">{batch.scientificName}</p>
              </div>

              <div className="flex justify-between items-center text-[10px] text-slate-500 pt-1">
                <div className="flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                  <span>{batch.sourceLocation}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                  <span>{new Date(batch.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            </Card>
          </Link>
        ))}
      </div>

      {/* Pagination summary */}
      <div className="mt-8 flex items-center justify-between border-t border-slate-100 pt-5 text-xs text-slate-500">
        <span>Showing 1–{filteredBatches.length} of {filteredBatches.length} results</span>
        <div className="flex gap-2">
          <Button variant="secondary" size="sm" disabled className="text-xs">Prev</Button>
          <Button variant="secondary" size="sm" disabled className="text-xs">Next</Button>
        </div>
      </div>

      {/* Batch Setup Dialog */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={handleCloseModal}
        title="Create Digital Batch Passport"
        footer={
          <div className="flex gap-3">
            <Button variant="secondary" onClick={handleCloseModal} disabled={createMutation.isPending} className="text-xs">
              Cancel
            </Button>
            <Button variant="primary" onClick={handleCreateSubmit} isLoading={createMutation.isPending} className="text-xs">
              Create Batch
            </Button>
          </div>
        }
      >
        <form onSubmit={handleCreateSubmit} className="flex flex-col gap-4">
          <Input
            id="sourceLocation"
            label="Harvest / Collection Source Location"
            placeholder="Ahmedabad, Gujarat"
            value={sourceLocation}
            onChange={(e) => setSourceLocation(e.target.value)}
            error={errors.sourceLocation}
            disabled={createMutation.isPending}
            required
          />

          <div className="w-full flex flex-col gap-1.5">
            <label htmlFor="notes" className="text-xs font-semibold text-ayur-slate-700">
              Additional Notes (Optional)
            </label>
            <textarea
              id="notes"
              placeholder="E.g., harvested from certified biological farm..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className={cn(
                "w-full bg-white border border-ayur-slate-200 rounded-lg px-3 py-2 text-sm text-ayur-slate-900 focus:outline-none focus:ring-2 focus:ring-ayur-green-500 min-h-[80px]",
                errors.notes && "border-red-500 focus:ring-red-500"
              )}
              disabled={createMutation.isPending}
            />
            {errors.notes && <span role="alert" className="text-xs text-red-500 font-medium">{errors.notes}</span>}
          </div>
        </form>
      </Modal>
    </PageContainer>
  );
};
