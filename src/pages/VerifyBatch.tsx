import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ShieldCheck, Check } from 'lucide-react';
import { PageContainer } from '../components/PageContainer';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { useUI } from '../context/UIContext';
import { batchService } from '../services/batchService';
import { getFriendlyErrorMessage } from '../services/api';

export const VerifyBatch: React.FC = () => {
  const { batchId } = useParams<{ batchId: string }>();
  const navigate = useNavigate();
  const { showToast } = useUI();
  const queryClient = useQueryClient();

  const [visualIntegrity, setVisualIntegrity] = useState(false);
  const [weightMatch, setWeightMatch] = useState(false);
  const [sealCheck, setSealCheck] = useState(false);

  const verifyMutation = useMutation({
    mutationFn: () =>
      batchService.verifyBatch(batchId!, {
        visualIntegrity,
        weightMatch,
        sealCheck,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['batch', batchId] });
      queryClient.invalidateQueries({ queryKey: ['batches'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardSummary'] });
      showToast(`Batch ${batchId} verified successfully!`, 'success');
      navigate(`/app/batches/${batchId}`);
    },
    onError: (err) => {
      const friendlyMsg = getFriendlyErrorMessage(err);
      showToast(friendlyMsg, 'error');
    }
  });

  const handleVerify = () => {
    if (!visualIntegrity || !weightMatch || !sealCheck) {
      showToast('Please confirm all physical inspection check items to submit.', 'error');
      return;
    }
    verifyMutation.mutate();
  };

  return (
    <PageContainer
      title={`Verify Batch: ${batchId}`}
      description="Inspect physical ingredients and match digital credentials to complete verification."
    >
      <div className="max-w-2xl mx-auto flex flex-col gap-6">
        <Card className="p-6 flex flex-col gap-5" hoverable={false}>
          <div className="flex items-center gap-3 border-b border-slate-50 pb-4">
            <div className="p-2.5 bg-ayur-green-50 text-ayur-green-600 rounded-xl shrink-0">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div className="text-left">
              <h3 className="text-sm font-bold text-slate-900">Physical Inspection Checklist</h3>
              <p className="text-[10px] text-slate-400 font-medium">Verify cargo properties before acceptance</p>
            </div>
          </div>

          <div className="flex flex-col gap-4 text-xs font-semibold text-slate-700">
            <label className="flex items-start gap-3 p-3 rounded-lg hover:bg-slate-50 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={visualIntegrity}
                onChange={(e) => setVisualIntegrity(e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded border-slate-300 text-ayur-green-600 focus:ring-ayur-green-500"
                disabled={verifyMutation.isPending}
              />
              <div className="flex flex-col text-left">
                <span>Visual Integrity</span>
                <span className="text-[10px] text-slate-400 font-medium mt-0.5">Material matches image preview in digital passport.</span>
              </div>
            </label>
            <label className="flex items-start gap-3 p-3 rounded-lg hover:bg-slate-50 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={weightMatch}
                onChange={(e) => setWeightMatch(e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded border-slate-300 text-ayur-green-600 focus:ring-ayur-green-500"
                disabled={verifyMutation.isPending}
              />
              <div className="flex flex-col text-left">
                <span>Weight & Volume Match</span>
                <span className="text-[10px] text-slate-400 font-medium mt-0.5">Package weight matches quantity specified by sender.</span>
              </div>
            </label>
            <label className="flex items-start gap-3 p-3 rounded-lg hover:bg-slate-50 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={sealCheck}
                onChange={(e) => setSealCheck(e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded border-slate-300 text-ayur-green-600 focus:ring-ayur-green-500"
                disabled={verifyMutation.isPending}
              />
              <div className="flex flex-col text-left">
                <span>Packaging Seal Check</span>
                <span className="text-[10px] text-slate-400 font-medium mt-0.5">Seals are untampered, and QR code label resolves correctly.</span>
              </div>
            </label>
          </div>

          <div className="border-t border-slate-100 pt-5 flex gap-3 justify-end">
            <Button variant="secondary" onClick={() => navigate(-1)} disabled={verifyMutation.isPending} className="text-xs">
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleVerify}
              isLoading={verifyMutation.isPending}
              className="text-xs gap-1.5 font-bold"
            >
              <Check className="h-4 w-4" />
              Submit Verification
            </Button>
          </div>
        </Card>
      </div>
    </PageContainer>
  );
};
