import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  ScanLine,
  Package,
  Inbox,
  History,
  User,
  ClipboardCheck,
  BookOpen,
  Users,
  Cpu,
  BarChart3,
  Menu,
  X,
  Leaf,
  Bell,
  ChevronDown,
  LogOut,
} from 'lucide-react';
import { cn } from '../utils/cn';
import { useUI } from '../context/UIContext';
import { ToastContainer } from '../components/Toast';

import { useAuth } from '../context/AuthContext';

interface NavItem {
  label: string;
  path: string;
  icon: React.ReactNode;
}

export const AppLayout: React.FC = () => {
  const { sidebarOpen, toggleSidebar, showToast } = useUI();
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  
  const currentRole = user?.role || 'COLLECTOR';
  const userInitials = user?.name
    ? user.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : 'US';

  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    showToast('Successfully signed out.', 'success');
    navigate('/auth/login');
  };

  // Get navigation links based on current role
  const getNavItems = (): NavItem[] => {
    const common = [
      { label: 'Dashboard', path: '/app/dashboard', icon: <LayoutDashboard className="h-5 w-5" /> },
      { label: 'My Batches', path: '/app/batches', icon: <Package className="h-5 w-5" /> },
      { label: 'History', path: '/app/history', icon: <History className="h-5 w-5" /> },
      { label: 'Profile', path: '/app/profile', icon: <User className="h-5 w-5" /> },
    ];

    switch (currentRole) {
      case 'COLLECTOR':
        return [
          { label: 'Dashboard', path: '/app/dashboard', icon: <LayoutDashboard className="h-5 w-5" /> },
          { label: 'Identify Material', path: '/app/identify', icon: <ScanLine className="h-5 w-5" /> },
          { label: 'My Batches', path: '/app/batches', icon: <Package className="h-5 w-5" /> },
          { label: 'History', path: '/app/history', icon: <History className="h-5 w-5" /> },
          { label: 'Profile', path: '/app/profile', icon: <User className="h-5 w-5" /> },
        ];
      case 'WHOLESALER':
      case 'DISTRIBUTOR':
      case 'MANUFACTURER':
        return [
          { label: 'Dashboard', path: '/app/dashboard', icon: <LayoutDashboard className="h-5 w-5" /> },
          { label: 'Incoming Batches', path: '/app/incoming', icon: <Inbox className="h-5 w-5" /> },
          { label: 'My Batches', path: '/app/batches', icon: <Package className="h-5 w-5" /> },
          { label: 'History', path: '/app/history', icon: <History className="h-5 w-5" /> },
          { label: 'Profile', path: '/app/profile', icon: <User className="h-5 w-5" /> },
        ];
      case 'EXPERT':
        return [
          { label: 'Expert Dashboard', path: '/expert/dashboard', icon: <LayoutDashboard className="h-5 w-5" /> },
          { label: 'Pending Reviews', path: '/expert/reviews', icon: <ClipboardCheck className="h-5 w-5" /> },
          { label: 'Review History', path: '/expert/history', icon: <History className="h-5 w-5" /> },
          { label: 'Materials Knowledge', path: '/expert/materials', icon: <BookOpen className="h-5 w-5" /> },
          { label: 'Profile', path: '/app/profile', icon: <User className="h-5 w-5" /> },
        ];
      case 'ADMIN':
        return [
          { label: 'Admin Dashboard', path: '/admin/dashboard', icon: <LayoutDashboard className="h-5 w-5" /> },
          { label: 'Users Manager', path: '/admin/users', icon: <Users className="h-5 w-5" /> },
          { label: 'Materials Manager', path: '/admin/materials', icon: <BookOpen className="h-5 w-5" /> },
          { label: 'Predictions Feed', path: '/admin/predictions', icon: <Cpu className="h-5 w-5" /> },
          { label: 'All Batches', path: '/admin/batches', icon: <Package className="h-5 w-5" /> },
          { label: 'Expert Reviews', path: '/admin/reviews', icon: <ClipboardCheck className="h-5 w-5" /> },
          { label: 'Analytics Panel', path: '/admin/analytics', icon: <BarChart3 className="h-5 w-5" /> },
          { label: 'Profile', path: '/app/profile', icon: <User className="h-5 w-5" /> },
        ];
      default:
        return common;
    }
  };

  const navItems = getNavItems();

  const isLinkActive = (path: string) => {
    // Exact or nested matching for dashboard
    if (path === '/app/dashboard' && location.pathname !== '/app/dashboard') {
      return false;
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen flex bg-slate-50">
      <ToastContainer />
      
      {/* Mobile Sidebar Overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/60 md:hidden backdrop-blur-sm transition-opacity"
          aria-hidden="true"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar - Desktop & Mobile */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex flex-col w-64 bg-white border-r border-slate-100 transform transition-transform duration-300 md:translate-x-0 md:static shrink-0",
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full",
          !sidebarOpen && "md:hidden"
        )}
      >
        {/* Brand Header */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-slate-100 shrink-0">
          <Link to="/app/dashboard" className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-ayur-green-50 text-ayur-green-600">
              <Leaf className="h-5 w-5" />
            </div>
            <span className="font-bold text-base tracking-tight text-slate-900">
              Ayur<span className="text-ayur-green-600">Verify</span>
            </span>
          </Link>
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="md:hidden p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-colors"
            aria-label="Close sidebar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* User Identity Display */}
        <div className="p-4 border-b border-slate-100 bg-slate-50/50 shrink-0">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-ayur-green-600 flex items-center justify-center text-white font-bold text-sm tracking-wide shadow-sm shadow-ayur-green-700/20">
              {currentRole.substring(0, 3)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-slate-900 truncate">Demo Participant</p>
              <p className="text-[10px] text-slate-500 font-medium tracking-wide truncate">
                {currentRole === 'COLLECTOR' && 'COL-0047'}
                {currentRole === 'WHOLESALER' && 'WHO-0124'}
                {currentRole === 'DISTRIBUTOR' && 'DIS-0031'}
                {currentRole === 'MANUFACTURER' && 'MAN-0018'}
                {currentRole === 'EXPERT' && 'EXP-0001'}
                {currentRole === 'ADMIN' && 'ADM-0001'}
              </p>
            </div>
          </div>
        </div>

        {/* Sidebar Nav Links */}
        <nav className="flex-1 overflow-y-auto px-4 py-6 flex flex-col gap-1">
          {navItems.map((item) => {
            const active = isLinkActive(item.path);
            return (
              <Link
                key={item.label}
                to={item.path}
                onClick={() => setMobileMenuOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition-all group focus:ring-2 focus:ring-slate-300 outline-none",
                  active
                    ? "bg-ayur-green-50 text-ayur-green-700"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                )}
              >
                <span
                  className={cn(
                    "transition-colors",
                    active ? "text-ayur-green-600" : "text-slate-400 group-hover:text-slate-600"
                  )}
                >
                  {item.icon}
                </span>
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Bottom Utility Profile Section */}
        <div className="p-4 border-t border-slate-100 shrink-0">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-semibold text-rose-600 hover:bg-rose-50/50 hover:text-rose-700 transition-colors focus:ring-2 focus:ring-rose-200 outline-none"
          >
            <LogOut className="h-5 w-5 text-rose-500" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Container wrapper */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Top Header */}
        <header className="h-16 bg-white border-b border-slate-100 px-6 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-4">
            <button
              onClick={() => {
                toggleSidebar();
                setMobileMenuOpen(true);
              }}
              className="p-1 rounded-lg text-slate-500 hover:bg-slate-50 hover:text-slate-700 outline-none focus:ring-2 focus:ring-slate-300"
              aria-label="Toggle sidebar menu"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div className="hidden sm:flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 select-none">
                Role:
              </span>
              <span className="text-xs font-bold text-ayur-green-700 select-none">
                {currentRole}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Notifications Dropdown */}
            <div className="relative">
              <button
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                className="p-2 rounded-lg text-slate-400 hover:bg-slate-50 hover:text-slate-600 relative outline-none focus:ring-2 focus:ring-slate-300"
                aria-label="View notifications"
              >
                <Bell className="h-5 w-5" />
                <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-ayur-gold-500 ring-2 ring-white" />
              </button>
              {notificationsOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setNotificationsOpen(false)} />
                  <div className="absolute right-0 mt-2 z-50 w-80 bg-white rounded-xl border border-slate-100 shadow-xl overflow-hidden">
                    <div className="px-4 py-3 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-800">Notifications</span>
                      <span className="text-[10px] bg-ayur-gold-100 text-ayur-gold-800 px-1.5 py-0.5 rounded font-bold">1 New</span>
                    </div>
                    <div className="max-h-64 overflow-y-auto">
                      <div className="px-4 py-3 hover:bg-slate-50/50 border-b border-slate-50 flex flex-col gap-1 cursor-pointer">
                        <p className="text-xs font-semibold text-slate-900">Incoming transfer request</p>
                        <p className="text-[11px] text-slate-500">A new batch has been transferred to your ID.</p>
                        <p className="text-[9px] text-slate-400 mt-0.5 font-medium">Recently</p>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Profile Dropdown */}
            <div className="relative">
              <button
                onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                className="flex items-center gap-2 hover:bg-slate-50 p-1.5 rounded-lg transition-colors outline-none focus:ring-2 focus:ring-slate-300"
              >
                <div className="h-7 w-7 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600 font-bold text-xs select-none">
                  {userInitials}
                </div>
                <ChevronDown className="h-4 w-4 text-slate-400 hidden sm:inline" />
              </button>
              {profileMenuOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setProfileMenuOpen(false)} />
                  <div className="absolute right-0 mt-2 z-50 w-48 bg-white rounded-lg border border-slate-100 shadow-xl py-1 text-xs">
                    <Link
                      to="/app/profile"
                      onClick={() => setProfileMenuOpen(false)}
                      className="flex items-center gap-2 px-4 py-2 text-slate-700 hover:bg-slate-50 font-semibold"
                    >
                      <User className="h-4 w-4 text-slate-400" />
                      My Profile
                    </Link>
                    <hr className="border-slate-100 my-1" />
                    <button
                      onClick={() => {
                        setProfileMenuOpen(false);
                        handleLogout();
                      }}
                      className="w-full flex items-center gap-2 px-4 py-2 text-rose-600 hover:bg-rose-50/50 text-left font-semibold"
                    >
                      <LogOut className="h-4 w-4 text-rose-500" />
                      Sign Out
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        {/* Content Body */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8">
          <Outlet context={{ currentRole }} />
        </main>
      </div>
    </div>
  );
};
