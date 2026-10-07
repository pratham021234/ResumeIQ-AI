'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Sparkles,
  Wand2,
  FileText,
  FileCheck2,
  Mail,
  PenTool,
  CreditCard,
  Settings,
  Users2,
  Bot,
  ShieldCheck,
  ChevronRight,
  LogOut,
} from 'lucide-react';
import { api } from '@/lib/api';

const navigationItems = [
  { name: 'Overview', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Analyze Resume', href: '/analyze', icon: Sparkles },
  { name: 'AI Resume Tailor', href: '/tailor', icon: Wand2, badge: 'PRO' },
  { name: 'My Resumes', href: '/resumes', icon: FileText },
  { name: 'Bullet Improver', href: '/editor', icon: PenTool },
  { name: 'Cover Letters', href: '/cover-letter', icon: Mail },
  { name: 'Audit Reports', href: '/reports', icon: FileCheck2 },
  { name: 'Billing & Plans', href: '/billing', icon: CreditCard },
  { name: 'Settings', href: '/settings', icon: Settings },
];

export const Sidebar: React.FC<{ isOpen?: boolean; onClose?: () => void }> = ({
  isOpen = false,
  onClose,
}) => {
  const pathname = usePathname();

  const handleLogout = () => {
    api.clearToken();
    window.location.href = '/login';
  };

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-40 w-64 bg-zinc-900 text-zinc-300 flex flex-col border-r border-zinc-800 transition-transform duration-300 ease-in-out md:translate-x-0 ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}
    >
      {/* Brand Header */}
      <div className="h-16 px-6 flex items-center justify-between border-b border-zinc-800">
        <Link href="/dashboard" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-xs">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <span className="text-base font-extrabold tracking-tight text-white flex items-center gap-1">
            ResumeIQ <span className="text-indigo-400">AI</span>
          </span>
        </Link>
      </div>

      {/* Nav List */}
      <div className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <div className="px-3 pb-2 text-[11px] font-semibold tracking-wider uppercase text-zinc-500">
          Navigation
        </div>
        {navigationItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={onClose}
              className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                isActive
                  ? 'bg-zinc-800 text-white font-semibold'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-800/60'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon
                  className={`w-4 h-4 ${
                    isActive ? 'text-indigo-400' : 'text-zinc-400'
                  }`}
                />
                <span>{item.name}</span>
              </div>
              {item.badge && (
                <span className="px-1.5 py-0.5 text-[10px] font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 rounded">
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}

        {/* Recruiter Dashboard (Behind Feature Flag) */}
        <div className="pt-4 mt-4 border-t border-zinc-800/80">
          <div className="px-3 pb-2 text-[11px] font-semibold tracking-wider uppercase text-zinc-500">
            For Employers & Teams
          </div>
          <Link
            href="/copilot"
            onClick={onClose}
            className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors mb-1 ${
              pathname === '/copilot'
                ? 'bg-zinc-800 text-white font-semibold'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-800/60'
            }`}
          >
            <div className="flex items-center gap-3">
              <Bot className="w-4 h-4 text-emerald-400" />
              <span>AI Hiring Copilot</span>
            </div>
            <span className="px-1.5 py-0.5 text-[9px] font-bold uppercase bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded">
              SaaS
            </span>
          </Link>
          <Link
            href="/recruiter"
            onClick={onClose}
            className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
              pathname === '/recruiter'
                ? 'bg-zinc-800 text-white'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-800/60'
            }`}
          >
            <div className="flex items-center gap-3">
              <Users2 className="w-4 h-4 text-purple-400" />
              <span>Recruiter Portal</span>
            </div>
            <span className="px-1.5 py-0.5 text-[9px] font-semibold uppercase bg-zinc-800 text-zinc-400 border border-zinc-700 rounded">
              Beta
            </span>
          </Link>
        </div>
      </div>

      {/* Plan Card & User Info */}
      <div className="p-3 border-t border-zinc-800">
        <div className="p-3 rounded-xl bg-zinc-800/60 border border-zinc-700/60 mb-2">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-semibold text-white">Pro Plan</span>
            <span className="px-1.5 py-0.5 text-[10px] font-bold bg-emerald-500/20 text-emerald-400 rounded">
              Active
            </span>
          </div>
          <p className="text-[11px] text-zinc-400 mb-2">Unlimited ATS scans & AI bullet improver.</p>
          <Link
            href="/pricing"
            className="text-[11px] font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
          >
            Manage subscription <ChevronRight className="w-3 h-3" />
          </Link>
        </div>

        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-medium text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
};
