'use client';

import React, { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import {
  Settings,
  User,
  Key,
  CreditCard,
  Bell,
  Check,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<'profile' | 'api' | 'billing' | 'preferences'>('profile');
  const [fullName, setFullName] = useState('Alex Rivera');
  const [email, setEmail] = useState('alex.rivera.dev@gmail.com');
  const [targetIndustry, setTargetIndustry] = useState('FinTech & Cloud Infrastructure');
  const [geminiKey, setGeminiKey] = useState('');
  const [strictness, setStrictness] = useState('standard');
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-4xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-zinc-200 dark:border-zinc-800">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              <Settings className="w-5 h-5 text-indigo-500" />
              <span>Account Settings</span>
            </h1>
            <p className="text-xs text-zinc-500 mt-1">
              Configure profile information, AI provider keys, ATS preferences, and billing.
            </p>
          </div>

          {savedSuccess && (
            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
              <Check className="w-4 h-4" /> Preferences Saved
            </span>
          )}
        </div>

        {/* Tab Buttons */}
        <div className="flex items-center gap-2 border-b border-zinc-200 dark:border-zinc-800 pb-2 text-xs font-semibold">
          {[
            { id: 'profile', label: 'Profile', icon: User },
            { id: 'api', label: 'AI Configuration', icon: Key },
            { id: 'billing', label: 'Billing & Plan', icon: CreditCard },
            { id: 'preferences', label: 'ATS Preferences', icon: Bell },
          ].map((t) => {
            const Icon = t.icon;
            return (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id as any)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl transition-all ${
                  activeTab === t.id
                    ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 font-bold'
                    : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{t.label}</span>
              </button>
            );
          })}
        </div>

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <form onSubmit={handleSave} className="p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 pb-2 border-b border-zinc-100 dark:border-zinc-800">
              Personal Profile
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                Target Industry & Technical Domain
              </label>
              <input
                type="text"
                value={targetIndustry}
                onChange={(e) => setTargetIndustry(e.target.value)}
                placeholder="e.g. Distributed Systems, FinTech, Machine Learning"
                className="w-full px-3 py-2 text-xs rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <div className="pt-4 flex justify-end">
              <button
                type="submit"
                className="px-5 py-2 rounded-xl text-xs font-semibold bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 hover:opacity-90 transition-opacity"
              >
                Save Changes
              </button>
            </div>
          </form>
        )}

        {/* AI Configuration Tab */}
        {activeTab === 'api' && (
          <form onSubmit={handleSave} className="p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 pb-2 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
              <span>Google Gemini API Configuration</span>
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" /> System Engine Ready
              </span>
            </h3>

            <p className="text-xs text-zinc-500 leading-relaxed">
              ResumeIQ AI includes built-in AI models for scoring and bullet improvements. You can optionally supply your own Gemini API key for dedicated rate limits.
            </p>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                Gemini API Key (Optional)
              </label>
              <input
                type="password"
                value={geminiKey}
                onChange={(e) => setGeminiKey(e.target.value)}
                placeholder="AIzaSy..."
                className="w-full px-3 py-2 text-xs font-mono rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
              <span className="text-[11px] text-zinc-400 mt-1 block">
                Never shared publicly. Encrypted in your local profile session.
              </span>
            </div>

            <div className="pt-4 flex justify-end">
              <button
                type="submit"
                className="px-5 py-2 rounded-xl text-xs font-semibold bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 hover:opacity-90 transition-opacity"
              >
                Save API Key
              </button>
            </div>
          </form>
        )}

        {/* Billing Tab */}
        {activeTab === 'billing' && (
          <div className="p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                  Current Membership
                </span>
                <h3 className="text-lg font-extrabold text-zinc-900 dark:text-zinc-100">
                  Pro Plan ($19 / month)
                </h3>
              </div>
              <span className="px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                Active
              </span>
            </div>

            <p className="text-xs text-zinc-500 leading-relaxed">
              Your next billing cycle is scheduled for next month. You have unlimited ATS scans and full AI bullet optimization enabled.
            </p>

            <div className="pt-3 flex items-center gap-3">
              <button
                type="button"
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 hover:opacity-90 transition-opacity"
              >
                Manage Payment Method
              </button>
              <button
                type="button"
                className="px-4 py-2 rounded-xl text-xs font-semibold border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
              >
                Cancel Subscription
              </button>
            </div>
          </div>
        )}

        {/* Preferences Tab */}
        {activeTab === 'preferences' && (
          <form onSubmit={handleSave} className="p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 pb-2 border-b border-zinc-100 dark:border-zinc-800">
              ATS Audit Engine Strictness
            </h3>

            <div className="space-y-3">
              {[
                { id: 'standard', title: 'Standard Industry Benchmark', desc: 'Calibrated against modern enterprise ATS platforms (Greenhouse, Lever, Workday).' },
                { id: 'strict', title: 'Strict Tier (Fortune 500 & Government)', desc: 'Penalizes any layout anomaly, graphics, or nested table structure heavily.' },
                { id: 'startup', title: 'Startup & High-Growth Relaxed', desc: 'Prioritizes raw tech stack overlap and github project links.' },
              ].map((lvl) => (
                <label
                  key={lvl.id}
                  className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition-all ${
                    strictness === lvl.id
                      ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/30'
                      : 'border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800'
                  }`}
                >
                  <input
                    type="radio"
                    name="strictness"
                    value={lvl.id}
                    checked={strictness === lvl.id}
                    onChange={(e) => setStrictness(e.target.value)}
                    className="mt-1"
                  />
                  <div>
                    <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-100">{lvl.title}</h4>
                    <p className="text-[11px] text-zinc-500 mt-0.5">{lvl.desc}</p>
                  </div>
                </label>
              ))}
            </div>

            <div className="pt-4 flex justify-end">
              <button
                type="submit"
                className="px-5 py-2 rounded-xl text-xs font-semibold bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 hover:opacity-90 transition-opacity"
              >
                Save Preferences
              </button>
            </div>
          </form>
        )}
      </div>
    </DashboardLayout>
  );
}
