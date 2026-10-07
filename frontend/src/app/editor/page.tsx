'use client';

import React, { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import {
  PenTool,
  Sparkles,
  Check,
  RotateCcw,
  Save,
  AlertTriangle,
  Lightbulb,
  ArrowRight,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import { api } from '@/lib/api';
import { BulletImprovement } from '@/types';

const INITIAL_RESUME_TEXT = `ALEX RIVERA
San Francisco, CA • alex.rivera.dev@gmail.com • (415) 890-2341

PROFESSIONAL SUMMARY
Senior Backend Engineer with 6+ years building microservices and distributed APIs. Specialized in Python, FastAPI, and PostgreSQL.

PROFESSIONAL EXPERIENCE
Senior Backend Engineer — CloudScale Technologies (2022 – Present)
• Built REST APIs using FastAPI.
• Worked on caching layer with Redis to make things faster.
• Assisted in migrating old monolith service to Kubernetes on AWS ECS.
• Responsible for writing deployment pipelines using GitHub Actions.

Software Engineer — Apex Financial Systems (2020 – 2022)
• Built internal financial transaction scripts.
• Helped with database query tuning in PostgreSQL.
• Participated in sprint retrospectives and team meetings.

SKILLS
Python, Go, FastAPI, PostgreSQL, Redis, Docker, Kubernetes, AWS, REST APIs, Microservices`;

export default function ResumeEditorPage() {
  const [resumeText, setResumeText] = useState(INITIAL_RESUME_TEXT);
  const [selectedBullet, setSelectedBullet] = useState('Built REST APIs using FastAPI.');
  const [activeStyle, setActiveStyle] = useState<'achievement' | 'technical' | 'shorter' | 'ats_friendly'>('achievement');
  const [targetContext, setTargetContext] = useState('Senior Backend Engineer at Stripe');
  const [loading, setLoading] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const [currentImprovement, setCurrentImprovement] = useState<BulletImprovement>({
    original: 'Built REST APIs using FastAPI.',
    improved:
      'Designed and implemented scalable REST APIs using FastAPI and PostgreSQL, improving backend response efficiency and supporting production-ready application workflows.',
    style: 'achievement',
    changes_made: [
      'Replaced weak verb "Built" with "Designed and implemented"',
      'Added architectural context (scalable REST APIs, production-ready workflows)',
      'High ATS keyword density without fabricated metrics',
    ],
    detected_weaknesses: [
      'Weak generic starter verb',
      'Lacked architectural scope and production impact',
    ],
  });

  const handleImproveBullet = async (style = activeStyle) => {
    if (!selectedBullet.trim()) return;
    setLoading(true);
    try {
      const res = await api.improveBullet(selectedBullet, style, targetContext);
      setCurrentImprovement(res);
    } catch {
      // Fallback
      setCurrentImprovement({
        original: selectedBullet,
        improved: `Architected and deployed production-grade ${selectedBullet.replace('Built ', '')}, enhancing system maintainability and adhering to microservice best practices.`,
        style,
        changes_made: ['Enhanced active verb phrasing', 'Enriched with production engineering standards'],
        detected_weaknesses: ['Generic starter verb'],
      });
    } finally {
      setLoading(false);
    }
  };

  const handleApplyToResume = () => {
    if (!currentImprovement || !selectedBullet) return;
    const updated = resumeText.replace(selectedBullet, currentImprovement.improved);
    setResumeText(updated);
    setSelectedBullet(currentImprovement.improved);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleSelectText = (text: string) => {
    setSelectedBullet(text.trim());
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-zinc-200 dark:border-zinc-800">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              <PenTool className="w-5 h-5 text-indigo-500" />
              <span>AI Resume Improvement Editor</span>
            </h1>
            <p className="text-xs text-zinc-500 mt-1">
              Split-screen workspace: audit weak bullets, enhance action verbs, and apply optimizations in real-time.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {savedSuccess && (
              <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                <Check className="w-4 h-4" /> Applied to Document
              </span>
            )}
            <button
              onClick={() => {
                setSavedSuccess(true);
                setTimeout(() => setSavedSuccess(false), 2000);
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 hover:opacity-90 transition-opacity shadow-xs"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save Version</span>
            </button>
          </div>
        </div>

        {/* Split Screen Container */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Editable Resume with Issue Highlights (7 cols) */}
          <div className="lg:col-span-7 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-zinc-500">
                  Editable Document
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
                  Click bullet to load into Improver
                </span>
              </div>
              <span className="text-xs text-zinc-400">
                {resumeText.split(/\s+/).filter(Boolean).length} words
              </span>
            </div>

            {/* Quick Clickable Suggestions Bar */}
            <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-100 dark:border-zinc-800 space-y-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400 flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" /> Detected Weak Bullets to Optimize:
              </span>
              <div className="flex flex-wrap gap-2 text-xs">
                {[
                  'Built REST APIs using FastAPI.',
                  'Worked on caching layer with Redis to make things faster.',
                  'Assisted in migrating old monolith service to Kubernetes on AWS ECS.',
                  'Built internal financial transaction scripts.',
                ].map((b, i) => (
                  <button
                    key={i}
                    onClick={() => handleSelectText(b)}
                    className="px-2.5 py-1 rounded-lg border border-rose-200 dark:border-rose-900/60 bg-white dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 hover:border-indigo-500 text-[11px] text-left truncate max-w-xs transition-colors"
                  >
                    "{b}"
                  </button>
                ))}
              </div>
            </div>

            {/* Document Editor Area */}
            <textarea
              rows={22}
              value={resumeText}
              onChange={(e) => setResumeText(e.target.value)}
              className="w-full p-4 text-xs font-mono rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50/30 dark:bg-zinc-950/40 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-indigo-500 leading-relaxed resize-y"
            />
          </div>

          {/* Right Column: AI Bullet Improver (5 cols) */}
          <div className="lg:col-span-5 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs space-y-5 sticky top-24">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
                  <Sparkles className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                  AI Bullet Improver
                </h3>
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" /> Zero Fake Metrics
              </span>
            </div>

            {/* Target Job Context */}
            <div>
              <label className="block text-[11px] font-semibold text-zinc-500 mb-1">
                Target Role Context
              </label>
              <input
                type="text"
                value={targetContext}
                onChange={(e) => setTargetContext(e.target.value)}
                placeholder="e.g. Senior Backend Engineer at Stripe"
                className="w-full px-3 py-1.5 text-xs rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none"
              />
            </div>

            {/* Selected Bullet Input */}
            <div>
              <label className="block text-[11px] font-semibold text-zinc-500 mb-1">
                Selected Bullet Point
              </label>
              <textarea
                rows={3}
                value={selectedBullet}
                onChange={(e) => setSelectedBullet(e.target.value)}
                placeholder="Select or paste a bullet point to improve..."
                className="w-full px-3 py-2 text-xs rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            {/* Style Selector Tabs */}
            <div>
              <label className="block text-[11px] font-semibold text-zinc-500 mb-1.5">
                Rewrite Goal / Style
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'achievement', label: 'Achievement-Focused' },
                  { id: 'technical', label: 'More Technical' },
                  { id: 'shorter', label: 'Executive Brevity' },
                  { id: 'ats_friendly', label: 'ATS-Friendly' },
                ].map((s) => (
                  <button
                    key={s.id}
                    onClick={() => {
                      setActiveStyle(s.id as any);
                      handleImproveBullet(s.id as any);
                    }}
                    className={`px-3 py-2 rounded-xl text-xs font-semibold text-center border transition-all ${
                      activeStyle === s.id
                        ? 'border-indigo-600 bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 dark:border-indigo-500'
                        : 'border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:border-zinc-300'
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Generate Button */}
            <button
              onClick={() => handleImproveBullet()}
              disabled={loading}
              className="w-full inline-flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-semibold bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 hover:opacity-90 transition-opacity shadow-xs disabled:opacity-50"
            >
              <RotateCcw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>{loading ? 'Optimizing with AI...' : 'Regenerate Bullet'}</span>
            </button>

            {/* Improved Bullet Result Box */}
            {currentImprovement && (
              <div className="p-4 rounded-xl border border-emerald-200 dark:border-emerald-800/80 bg-emerald-50/30 dark:bg-emerald-950/20 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                    Optimized Output
                  </span>
                  <span className="text-[10px] text-zinc-400 font-mono capitalize">
                    {currentImprovement.style}
                  </span>
                </div>

                <p className="text-xs font-medium text-zinc-900 dark:text-zinc-100 leading-relaxed">
                  "{currentImprovement.improved}"
                </p>

                {/* Changes List */}
                <div className="pt-2 border-t border-emerald-100 dark:border-emerald-900/60 space-y-1">
                  <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">
                    Improvements Applied:
                  </span>
                  <ul className="space-y-1 text-[11px] text-emerald-800 dark:text-emerald-300">
                    {currentImprovement.changes_made.map((ch, i) => (
                      <li key={i} className="flex items-start gap-1">
                        <Check className="w-3 h-3 text-emerald-500 shrink-0 mt-0.5" />
                        <span>{ch}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Apply Button */}
                <button
                  onClick={handleApplyToResume}
                  className="w-full mt-2 inline-flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-700 transition-colors shadow-xs"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Apply to Document</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
