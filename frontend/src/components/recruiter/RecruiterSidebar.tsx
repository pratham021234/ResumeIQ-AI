'use client';

import React from 'react';
import Link from 'next/link';
import {
  Briefcase,
  Users,
  FileSearch,
  BarChart3,
  Settings,
  ShieldCheck,
  LogOut,
  ArrowLeftRight,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';
import { User } from '@/types';

export type RecruiterTab = 'jobs' | 'candidates' | 'screening' | 'reports' | 'settings';

interface RecruiterSidebarProps {
  activeTab: RecruiterTab;
  onTabChange: (tab: RecruiterTab) => void;
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  onLogout: () => void;
  candidateCount: number;
  jobCount: number;
}

export const RecruiterSidebar: React.FC<RecruiterSidebarProps> = ({
  activeTab,
  onTabChange,
  isOpen,
  onClose,
  user,
  onLogout,
  candidateCount,
  jobCount,
}) => {
  const navItems: Array<{
    id: RecruiterTab;
    label: string;
    icon: React.ElementType;
    badge?: string | number;
  }> = [
    { id: 'jobs', label: 'Jobs', icon: Briefcase, badge: jobCount },
    { id: 'candidates', label: 'Candidates', icon: Users, badge: candidateCount },
    { id: 'screening', label: 'Resume Screening', icon: FileSearch, badge: '1-100 files' },
    { id: 'reports', label: 'Reports', icon: BarChart3 },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-40 w-64 bg-zinc-950 text-zinc-300 flex flex-col border-r border-zinc-800/80 transition-transform duration-300 ease-in-out md:translate-x-0 ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}
    >
      {/* Brand Header */}
      <div className="h-16 px-5 flex items-center justify-between border-b border-zinc-800/80 bg-zinc-950/60">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center text-white shadow-sm ring-1 ring-purple-500/30">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-extrabold tracking-tight text-white">
                ResumeIQ
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.2 bg-purple-500/20 text-purple-300 border border-purple-500/30 rounded">
                Recruit
              </span>
            </div>
            <p className="text-[10px] text-zinc-400 font-medium">Enterprise Hiring Engine</p>
          </div>
        </div>
      </div>

      {/* Recruiter Mode Active Banner */}
      <div className="mx-3 mt-3 px-3 py-2 rounded-xl bg-purple-950/30 border border-purple-800/40 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-500"></span>
          </span>
          <span className="text-[11px] font-semibold text-purple-200">Recruiter Mode Active</span>
        </div>
        <span className="text-[9px] font-mono text-purple-300/80 uppercase">SaaS v2.4</span>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <div className="px-3 pb-2 text-[10px] font-bold tracking-wider uppercase text-zinc-500">
          Recruiting Workspace
        </div>

        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => {
                onTabChange(item.id);
                onClose();
              }}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
                isActive
                  ? 'bg-purple-600 text-white font-semibold shadow-sm shadow-purple-600/30 ring-1 ring-purple-500/40'
                  : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon
                  className={`w-4 h-4 transition-colors ${
                    isActive ? 'text-white' : 'text-zinc-400'
                  }`}
                />
                <span className="truncate">{item.label}</span>
              </div>
              {item.badge !== undefined && (
                <span
                  className={`px-1.5 py-0.5 text-[10px] font-bold rounded ${
                    isActive
                      ? 'bg-purple-700/80 text-white'
                      : 'bg-zinc-900 text-zinc-400 border border-zinc-800'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}

        {/* Quick Portal Switcher */}
        <div className="pt-4 mt-4 border-t border-zinc-800/80">
          <div className="px-3 pb-2 text-[10px] font-bold tracking-wider uppercase text-zinc-500">
            Switch Environment
          </div>
          <Link
            href="/dashboard"
            className="flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium text-zinc-400 hover:text-white hover:bg-zinc-900 transition-colors"
          >
            <div className="flex items-center gap-3">
              <ArrowLeftRight className="w-4 h-4 text-zinc-400" />
              <span>Job Seeker Mode</span>
            </div>
            <span className="text-[10px] text-zinc-500">Return</span>
          </Link>
        </div>
      </nav>

      {/* Recruiter Profile Footer */}
      <div className="p-3 border-t border-zinc-800/80 bg-zinc-950/80">
        <div className="p-3 rounded-xl bg-zinc-900/80 border border-zinc-800 mb-2">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-bold text-white truncate">
              {user?.full_name || 'Elena Rostova'}
            </span>
            <span className="px-1.5 py-0.5 text-[9px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded flex items-center gap-1">
              <CheckCircle2 className="w-2.5 h-2.5" /> Recruiter
            </span>
          </div>
          <p className="text-[11px] text-zinc-400 truncate">
            {user?.email || 'recruiter@resumeiq.ai'}
          </p>
          <div className="mt-2 pt-2 border-t border-zinc-800/60 flex items-center justify-between text-[10px] text-zinc-500">
            <span>Stripe Talent Team</span>
            <span className="font-semibold text-purple-400">Enterprise</span>
          </div>
        </div>

        <button
          onClick={onLogout}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-medium text-zinc-400 hover:text-red-400 hover:bg-zinc-900 rounded-xl transition-colors"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Sign Out Recruiter</span>
        </button>
      </div>
    </aside>
  );
};
