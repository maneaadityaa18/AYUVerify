import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, Cpu, ShieldCheck, Package, Terminal, ChevronDown, ChevronUp, AlertCircle } from 'lucide-react';
import { PageContainer } from '../components/PageContainer';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { useUI } from '../context/UIContext';
import { cn } from '../utils/cn';
import { predictionService } from '../services/predictionService';
import { getFriendlyErrorMessage } from '../services/api';

export const Identify: React.FC = () => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisStep, setAnalysisStep] = useState('');
  const [result, setResult] = useState<any | null>(null);
  const [isDebugOpen, setIsDebugOpen] = useState(false);
  
  const { showToast } = useUI();
  const navigate = useNavigate();

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
        setResult(null); // Clear previous results
      };
      reader.readAsDataURL(file);
    }
  };

  const startAnalysis = () => {
    if (!selectedImage || !imageFile) {
      showToast('Please select or capture an image first.', 'error');
      return;
    }

    setIsAnalyzing(true);
    
    // Simulated pipeline loading steps
    const steps = [
      'Uploading raw crop image...',
      'Scaling tensor resolution...',
      'Executing YOLOv8n medicinal material detection...',
      'Fetching botanical attributes...',
      'Computing adulteration risk scores...',
    ];

    let currentStepIdx = 0;
    setAnalysisStep(steps[0]);

    const stepInterval = setInterval(() => {
      currentStepIdx++;
      if (currentStepIdx < steps.length) {
        setAnalysisStep(steps[currentStepIdx]);
      }
    }, 450);

    predictionService.predict(imageFile)
      .then((data) => {
        clearInterval(stepInterval);
        setIsAnalyzing(false);
        setAnalysisStep('');
        setResult(data);
        showToast('AI species detection completed successfully!', 'success');
      })
      .catch((err) => {
        clearInterval(stepInterval);
        setIsAnalyzing(false);
        setAnalysisStep('');
        const friendlyMsg = getFriendlyErrorMessage(err);
        showToast(friendlyMsg, 'error');
      });
  };

  const handleCreateBatch = () => {
    if (!result || !result.material) return;
    showToast('Redirecting to digital passport batch registration...', 'info');
    navigate(`/app/batches?create=true&id=${result.identificationId}&materialId=${result.material.id}`);
  };

  return (
    <PageContainer
      title="Identify Crop Material"
      description="Upload or take a photo of medicinal crops to execute real-time YOLOv8 object detection, bounding-box localizations, and botanical checks."
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Upload & Bounding Box Viewer Column */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          <Card className="p-6 flex flex-col gap-5 text-center items-center justify-center min-h-[380px]">
            {selectedImage ? (
              <div className="relative w-full overflow-hidden bg-slate-100 border border-slate-100 rounded-2xl shadow-sm">
                <img
                  src={selectedImage}
                  alt="Uploaded material preview"
                  className={cn(
                    "w-full h-auto block transition-all",
                    isAnalyzing && "blur-xs brightness-75 duration-300"
                  )}
                />
                
                {/* Visual Bounding Box Overlay */}
                {!isAnalyzing && result && result.detections && result.detections.map((det: any, idx: number) => {
                  const { x1, y1, x2, y2 } = det.normalized_bbox;
                  const left = `${x1 * 100}%`;
                  const top = `${y1 * 100}%`;
                  const width = `${(x2 - x1) * 100}%`;
                  const height = `${(y2 - y1) * 100}%`;
                  
                  const isAloe = det.class_id === 0;
                  const borderColor = isAloe ? 'border-emerald-500' : 'border-amber-500';
                  const bgColor = isAloe ? 'bg-emerald-500/10' : 'bg-amber-500/10';
                  const labelColor = isAloe ? 'bg-emerald-600 text-white' : 'bg-amber-500 text-slate-900';
                  
                  return (
                    <div
                      key={idx}
                      className={cn("absolute border-[3px] rounded-xs shadow-md transition-all duration-300 group", borderColor, bgColor)}
                      style={{ left, top, width, height }}
                    >
                      <span className={cn("absolute -top-6 left-0 text-[10px] font-extrabold px-2 py-0.5 rounded shadow-sm whitespace-nowrap uppercase tracking-wider", labelColor)}>
                        {det.class_name} ({(det.confidence * 100).toFixed(0)}%)
                      </span>
                    </div>
                  );
                })}

                {isAnalyzing && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900/50 text-white gap-3 p-4">
                    <svg className="animate-spin h-8 w-8 text-emerald-400" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <p className="text-xs font-bold tracking-wide animate-pulse text-emerald-300">{analysisStep}</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center p-12 border-2 border-dashed border-slate-200 rounded-2xl w-full flex-grow bg-slate-50/50">
                <Upload className="h-12 w-12 text-slate-400 mb-4" />
                <p className="text-sm font-semibold text-slate-700">Select or Drop Raw Crop Photo</p>
                <p className="text-[10px] text-slate-400 mt-1 max-w-[200px] leading-relaxed">
                  Supports JPEG, PNG up to 5MB. Photo should focus on a single plant/fruit.
                </p>
              </div>
            )}

            <div className="flex gap-3 w-full mt-2">
              <input
                type="file"
                accept="image/*"
                id="image-file"
                onChange={handleImageUpload}
                className="hidden"
                disabled={isAnalyzing}
              />
              <label
                htmlFor="image-file"
                className={cn(
                  "btn-secondary flex-1 flex items-center justify-center gap-2 text-xs py-2.5 cursor-pointer font-bold select-none border border-slate-200 hover:bg-slate-50 transition-colors rounded-xl",
                  isAnalyzing && "opacity-50 pointer-events-none"
                )}
              >
                Browse File
              </label>
              <Button
                variant="primary"
                disabled={!selectedImage || isAnalyzing}
                onClick={startAnalysis}
                className="flex-1 text-xs gap-1.5 font-bold"
              >
                <Cpu className="h-4 w-4" />
                Analyze Material
              </Button>
            </div>
          </Card>
        </div>

        {/* Results & Metadata Panel Column */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          {result ? (
            <>
              {/* Primary detection layout */}
              {result.detections && result.detections.length > 0 ? (
                <Card className="p-6 flex flex-col gap-6" hoverable={false}>
                  <div className="border-b border-slate-100 pb-4 flex items-center justify-between">
                    <div>
                      <span className="text-[9px] text-slate-400 uppercase font-extrabold tracking-widest block">
                        AI Object Detection Report
                      </span>
                      <h3 className="text-lg font-bold text-slate-900 mt-1">
                        {result.material.name}
                      </h3>
                    </div>
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700">
                      <ShieldCheck className="h-3.5 w-3.5" />
                      🟢 {result.riskLevel} RISK
                    </span>
                  </div>

                  {/* Confidence metrics */}
                  <div className="flex flex-col gap-4">
                    <span className="text-xs font-extrabold text-slate-700 uppercase tracking-wider block">
                      Localizations Identified
                    </span>
                    <div className="flex flex-col gap-3">
                      {result.detections.map((det: any, idx: number) => {
                        const isAloe = det.class_id === 0;
                        return (
                          <div key={idx} className="p-3 bg-slate-50/50 rounded-xl border border-slate-100 flex flex-col gap-2">
                            <div className="flex justify-between items-center text-xs">
                              <span className="font-bold text-slate-800 uppercase tracking-wide">
                                {idx + 1}. {det.class_name}
                              </span>
                              <span className="font-extrabold text-slate-900">
                                {(det.confidence * 100).toFixed(1)}% confidence
                              </span>
                            </div>
                            
                            {/* Confidence bar meter */}
                            <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                              <div 
                                className={cn("h-full rounded-full transition-all duration-500", isAloe ? "bg-emerald-500" : "bg-amber-500")}
                                style={{ width: `${det.confidence * 100}%` }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Scientific detail list */}
                  <div className="flex flex-col gap-4 text-xs font-semibold text-slate-600 border-t border-slate-100 pt-4">
                    <div className="flex justify-between border-b border-slate-50 pb-2">
                      <span>Scientific Name</span>
                      <span className="text-slate-900 font-bold italic">{result.material.scientificName}</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-50 pb-2">
                      <span>Inference Latency</span>
                      <span className="text-slate-900 font-bold">{result.inference_time_ms} ms</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-50 pb-2">
                      <span>Accelerator Device</span>
                      <span className="text-slate-900 font-extrabold uppercase text-[10px] px-2 py-0.5 rounded bg-slate-100 border border-slate-200">{result.device}</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-50 pb-2">
                      <span>Image Quality Indicator</span>
                      <span className="text-slate-900 font-bold text-emerald-600">{result.imageQuality}</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-50 pb-2">
                      <span>Identification Code</span>
                      <span className="text-slate-900 font-mono font-bold">{result.identificationId}</span>
                    </div>
                  </div>

                  <Button onClick={handleCreateBatch} variant="accent" className="w-full gap-2 text-xs font-bold py-2.5 rounded-xl shadow-sm">
                    <Package className="h-4 w-4" />
                    Create Digital Batch Passport
                  </Button>
                </Card>
              ) : (
                /* No Detections Layout */
                <Card className="p-6 flex flex-col gap-5 text-center items-center justify-center" hoverable={false}>
                  <AlertCircle className="h-12 w-12 text-amber-500" />
                  <div>
                    <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wide">No Supported Material Detected</h3>
                    <p className="text-xs text-slate-400 mt-2 max-w-[260px] leading-relaxed">
                      The AI model did not identify Aloevera or Amla leaves in this image. Please check crop centering, lighting conditions, and try again.
                    </p>
                  </div>
                  
                  <div className="w-full text-left bg-slate-50 border border-slate-100 p-3 rounded-xl flex flex-col gap-2 text-[10px] text-slate-500 font-semibold">
                    <div className="flex justify-between">
                      <span>Inference Device:</span>
                      <span className="font-bold uppercase text-slate-800">{result.device}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Inference Latency:</span>
                      <span className="font-bold text-slate-800">{result.inference_time_ms} ms</span>
                    </div>
                  </div>
                </Card>
              )}

              {/* Dev Only Expandable Debug Block */}
              <Card className="p-0 overflow-hidden border border-slate-200/60 shadow-sm" hoverable={false}>
                <button
                  onClick={() => setIsDebugOpen(!isDebugOpen)}
                  className="w-full p-4 flex items-center justify-between text-left bg-slate-50/50 hover:bg-slate-50 transition-colors select-none"
                >
                  <div className="flex items-center gap-2">
                    <Terminal className="h-4 w-4 text-slate-400" />
                    <span className="text-xs font-bold text-slate-700 tracking-wide uppercase">Development Debug Console</span>
                  </div>
                  {isDebugOpen ? <ChevronUp className="h-4 w-4 text-slate-400" /> : <ChevronDown className="h-4 w-4 text-slate-400" />}
                </button>
                
                {isDebugOpen && (
                  <div className="p-4 border-t border-slate-100 bg-slate-900 text-slate-200 font-mono text-[10px] leading-relaxed flex flex-col gap-4 overflow-x-auto">
                    <div>
                      <span className="text-emerald-400 font-bold block"># Model Parameters & Hardware</span>
                      <p>Active Accelerator: {result.device.toUpperCase()}</p>
                      <p>Inference Speed:    {result.inference_time_ms} ms</p>
                      <p>Detections Found:    {result.detections ? result.detections.length : 0}</p>
                    </div>
                    <div>
                      <span className="text-emerald-400 font-bold block"># Raw Detections Array</span>
                      <pre className="mt-1 bg-slate-950 p-3 rounded border border-slate-800/80 text-[9px] overflow-x-auto text-slate-300">
                        {JSON.stringify(result.detections || [], null, 2)}
                      </pre>
                    </div>
                  </div>
                )}
              </Card>
            </>
          ) : (
            <Card className="p-8 text-center text-slate-400 flex flex-col items-center justify-center min-h-[300px]" hoverable={false}>
              <Cpu className="h-12 w-12 text-slate-300 mb-4" />
              <h3 className="text-sm font-bold text-slate-800">Pending Identification</h3>
              <p className="text-xs text-slate-400 mt-2 max-w-[240px] leading-relaxed">
                Add an image of the raw material crop on the left and run analysis to view the neural classification model output.
              </p>
            </Card>
          )}
        </div>
      </div>
    </PageContainer>
  );
};
