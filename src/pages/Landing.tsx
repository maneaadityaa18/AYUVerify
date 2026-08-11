import React from 'react';
import { Link } from 'react-router-dom';
import { Leaf, ShieldCheck, Cpu, ArrowRight, Activity, Search } from 'lucide-react';
import { Button } from '../components/Button';
import { Card } from '../components/Card';

export const Landing: React.FC = () => {
  return (
    <div className="bg-slate-50 min-h-[calc(100vh-4rem)] flex flex-col justify-between">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-16 sm:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-ayur-green-50 text-ayur-green-700 text-xs font-semibold mb-6">
            <Activity className="h-3.5 w-3.5" />
            Supply Chain Integrity for Ayurvedic Raw Materials
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight">
            AI-Powered Identification & <br />
            <span className="text-ayur-green-600">Herbal Verification</span>
          </h1>
          <p className="mt-6 max-w-2xl mx-auto text-base sm:text-lg text-slate-500 font-medium">
            AyurVerify matches raw medicinal plants using YOLOv8 computer vision and logs secure, immutable handoffs across the supply chain, ensuring pure, verifiable Ayurvedic ingredients.
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <Link to="/app/dashboard">
              <Button size="lg" className="gap-2 font-bold">
                Access Application Portal
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link to="/public/batch/AYV-2026-00042">
              <Button variant="secondary" size="lg" className="gap-2">
                <Search className="h-4 w-4" />
                Track Batch ID
              </Button>
            </Link>
          </div>
        </div>

        {/* Feature Cards Grid */}
        <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card className="flex flex-col gap-4 text-left p-6">
            <div className="p-3 bg-ayur-green-50 text-ayur-green-600 rounded-xl w-fit">
              <Cpu className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">AI Material Identification</h3>
              <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                Upload raw material crop images. The system triggers deep learning models (YOLOv8) to identify the herbal species with instant confidence scores and risk levels.
              </p>
            </div>
          </Card>

          <Card className="flex flex-col gap-4 text-left p-6">
            <div className="p-3 bg-ayur-gold-50 text-ayur-gold-600 rounded-xl w-fit">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">Digital Passport & Traceability</h3>
              <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                Create digital batch credentials immediately after low-risk AI identification. Track the complete custodian ledger as batches move through verified supply-chain stops.
              </p>
            </div>
          </Card>

          <Card className="flex flex-col gap-4 text-left p-6">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-xl w-fit">
              <Leaf className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">Active Expert Escapes</h3>
              <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                Escalate high-risk, low-confidence predictions to botanists and Ayurvedic experts. Review history logs and flag items dynamically to prevent contaminated entry.
              </p>
            </div>
          </Card>
        </div>
      </section>
    </div>
  );
};
