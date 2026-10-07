'use client';

import React, { useState, useEffect } from 'react';
import { analytics, ConsentStatus } from '@/lib/analytics';
import { ShieldCheck, Cookie, X, Check, Lock } from 'lucide-react';

export const CookieConsent: React.FC = () => {
  const [consent, setConsent] = useState<ConsentStatus>('granted'); // default hide in SSR
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    const current = analytics.getConsent();
    setConsent(current);
    if (current === 'granted') {
      analytics.initExternalProviders();
    }
  }, []);

  if (consent !== 'pending') {
    return null;
  }

  const handleAcceptAll = () => {
    analytics.setConsent('granted');
    setConsent('granted');
  };

  const handleEssentialOnly = () => {
    analytics.setConsent('denied');
    setConsent('denied');
  };

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-6 md:max-w-md z-50 animate-in fade-in slide-in-from-bottom-5 duration-300">
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 shadow-2xl space-y-3.5 backdrop-blur-md">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-zinc-900 dark:text-white flex items-center gap-1.5">
                <span>Privacy & Analytics Consent</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 font-bold uppercase">
                  GDPR / CCPA
                </span>
              </h4>
              <p className="text-[11px] text-zinc-500 mt-0.5 leading-relaxed">
                ResumeIQ AI uses privacy-preserving analytics (PostHog & Google Analytics) to improve ATS keyword detection and application workflows.
              </p>
            </div>
          </div>
          <button
            onClick={handleEssentialOnly}
            className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
            title="Decline"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 text-[10px] text-zinc-500 space-y-1 border border-zinc-100 dark:border-zinc-800">
          <div className="flex items-center gap-1.5 font-semibold text-zinc-700 dark:text-zinc-300">
            <Lock className="w-3 h-3 text-indigo-500" />
            <span>Privacy Guarantee:</span>
          </div>
          <p>
            IP addresses are hashed using SHA-256. Resumes, passwords, and sensitive job descriptions are strictly excluded from all telemetry streams.
          </p>
        </div>

        <div className="flex items-center justify-between gap-2 pt-1">
          <button
            onClick={handleEssentialOnly}
            className="flex-1 py-2 px-3 rounded-xl text-xs font-semibold border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            Essential Only
          </button>
          <button
            onClick={handleAcceptAll}
            className="flex-1 py-2 px-3 rounded-xl text-xs font-bold bg-indigo-600 text-white hover:bg-indigo-700 transition-colors shadow-xs flex items-center justify-center gap-1.5"
          >
            <Check className="w-3.5 h-3.5" />
            <span>Accept All</span>
          </button>
        </div>
      </div>
    </div>
  );
};
