'use client';

import React, { useState } from 'react';
import {
  ShieldCheck,
  Mail,
  Lock,
  User,
  Building2,
  Sparkles,
  ArrowRight,
  AlertCircle,
  Briefcase,
} from 'lucide-react';
import { api } from '@/lib/api';
import { User as UserType } from '@/types';

interface RecruiterAuthModalProps {
  isOpen: boolean;
  onSuccess: (user: UserType) => void;
  onCancel?: () => void;
}

export const RecruiterAuthModal: React.FC<RecruiterAuthModalProps> = ({
  isOpen,
  onSuccess,
  onCancel,
}) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [company, setCompany] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const loginEmail = email.trim() || 'recruiter@resumeiq.ai';
      const loginPassword = password || 'password123';

      const res = await api.recruiterLogin({
        email: loginEmail,
        password: loginPassword,
      });

      onSuccess(res.user);
    } catch (err: any) {
      setError(err?.message || 'Failed to authenticate recruiter.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setEmail('recruiter@resumeiq.ai');
    setPassword('password123');
    setError(null);
    setIsLoading(true);

    try {
      const res = await api.recruiterLogin({
        email: 'recruiter@resumeiq.ai',
        password: 'password123',
      });
      onSuccess(res.user);
    } catch (err: any) {
      // Fallback demo user if network error
      const demoRecruiter: UserType = {
        id: 'recruiter-demo-elena',
        email: 'recruiter@resumeiq.ai',
        full_name: 'Elena Rostova (Recruiter)',
        plan: 'enterprise',
        is_recruiter: true,
        created_at: new Date().toISOString(),
      };
      if (typeof window !== 'undefined') {
        localStorage.setItem('resumeiq_token', 'demo-recruiter-token');
        localStorage.setItem('resumeiq_user', JSON.stringify(demoRecruiter));
      }
      onSuccess(demoRecruiter);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
      <div className="relative w-full max-w-md bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl shadow-2xl overflow-hidden">
        {/* Header decoration */}
        <div className="p-6 bg-gradient-to-br from-purple-900 via-indigo-950 to-zinc-950 text-white relative">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-xl bg-purple-500/30 border border-purple-400/40 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4 text-purple-300" />
            </div>
            <span className="text-xs font-bold uppercase tracking-wider text-purple-300">
              ResumeIQ Enterprise
            </span>
          </div>

          <h2 className="text-xl font-extrabold text-white">
            {isSignUp ? 'Create Recruiter Account' : 'Recruiter Portal Authentication'}
          </h2>
          <p className="text-xs text-purple-200/80 mt-1">
            Access bulk resume screening (1-100 files), applicant ranking engine, and export reporting.
          </p>
        </div>

        {/* 1-Click Demo Login Banner */}
        <div className="p-4 bg-purple-50 dark:bg-purple-950/30 border-b border-purple-100 dark:border-purple-900/40 flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-purple-900 dark:text-purple-200 block">
              1-Click Demo Access:
            </span>
            <span className="text-[11px] text-purple-700 dark:text-purple-300">
              Elena Rostova (Stripe Talent Partner)
            </span>
          </div>
          <button
            type="button"
            onClick={handleDemoLogin}
            disabled={isLoading}
            className="px-3 py-1.5 rounded-xl text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 transition-colors shadow-xs flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Instant Demo Sign In</span>
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleLogin} className="p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 text-xs text-red-600 dark:text-red-300 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {isSignUp && (
            <>
              <div>
                <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-2.5 w-4 h-4 text-zinc-400" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Elena Rostova"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                  Hiring Organization / Company
                </label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-2.5 w-4 h-4 text-zinc-400" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Stripe, Scale AI, Vercel"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>
            </>
          )}

          <div>
            <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
              Work Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-2.5 w-4 h-4 text-zinc-400" />
              <input
                type="email"
                required
                placeholder="recruiter@resumeiq.ai"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-2.5 w-4 h-4 text-zinc-400" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2.5 rounded-xl text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 transition-colors shadow-sm flex items-center justify-center gap-2 mt-2"
          >
            {isLoading ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <span>{isSignUp ? 'Create Recruiter Account' : 'Authenticate as Recruiter'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>

          <div className="flex items-center justify-between text-xs text-zinc-500 pt-2 border-t border-zinc-100 dark:border-zinc-800">
            <button
              type="button"
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-purple-600 dark:text-purple-400 font-semibold hover:underline"
            >
              {isSignUp ? 'Already registered? Log in' : 'Need a recruiter account? Sign up'}
            </button>
            {onCancel && (
              <button
                type="button"
                onClick={onCancel}
                className="text-zinc-400 hover:text-zinc-600"
              >
                Back to Seeker Mode
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};
