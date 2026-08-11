import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { Leaf } from 'lucide-react';

export const PublicLayout: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white border-b border-slate-100 backdrop-blur-md bg-white/95">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="p-2 rounded-xl bg-ayur-green-50 text-ayur-green-600 transition-colors group-hover:bg-ayur-green-100">
              <Leaf className="h-5 w-5" />
            </div>
            <span className="font-bold text-lg tracking-tight text-slate-900">
              Ayur<span className="text-ayur-green-600">Verify</span>
            </span>
          </Link>
          <nav className="flex items-center gap-4">
            <Link
              to="/auth/login"
              className="text-sm font-semibold text-slate-600 hover:text-slate-900 px-3 py-2 transition-colors"
            >
              Log In
            </Link>
            <Link
              to="/auth/register"
              className="text-sm font-semibold bg-ayur-green-600 text-white hover:bg-ayur-green-700 px-4 py-2 rounded-lg shadow-sm transition-all focus:ring-2 focus:ring-offset-2 focus:ring-ayur-green-500 outline-none"
            >
              Get Started
            </Link>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-100 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <Leaf className="h-4 w-4 text-ayur-green-600/70" />
            <span>&copy; {new Date().getFullYear()} AyurVerify. All rights reserved.</span>
          </div>
          <div className="flex gap-4 text-xs text-slate-500">
            <Link to="/public/batch/AYV-2026-00042" className="hover:text-slate-800 underline">
              Demo Batch Lookup
            </Link>
            <span className="text-slate-200">|</span>
            <span className="text-slate-400">SIH 2026 Prototype</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
