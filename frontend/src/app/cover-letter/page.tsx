'use client';

import React, { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import {
  Mail,
  Sparkles,
  Copy,
  Check,
  Download,
  RotateCcw,
  Briefcase,
  Building,
  Sliders,
} from 'lucide-react';
import { api } from '@/lib/api';

const DEFAULT_COVER_LETTER = `Dear Hiring Team at Stripe,

I am writing to express my strong interest in the Senior Backend Engineer position at Stripe. With 6+ years of experience designing scalable distributed microservices, optimizing low-latency database architectures, and deploying cloud infrastructure on AWS, I am excited about the opportunity to contribute to Stripe's mission-critical global payments infrastructure.

At CloudScale Technologies, I architected and deployed asynchronous REST services using FastAPI and PostgreSQL that reliably process 5M+ daily requests with sub-45ms p99 latency. By introducing distributed caching with Redis and containerizing legacy monoliths via Kubernetes, our engineering team reduced primary database load by 42% and enhanced deployment velocity 4-fold.

Stripe's engineering rigor and commitment to developer velocity deeply align with my technical values. I welcome the opportunity to discuss how my background in distributed systems and API performance can benefit your team.

Sincerely,
Alex Rivera
(415) 890-2341 • alex.rivera.dev@gmail.com`;

export default function CoverLetterPage() {
  const [jobTitle, setJobTitle] = useState('Senior Backend Engineer');
  const [company, setCompany] = useState('Stripe');
  const [jobDescription, setJobDescription] = useState(
    'Stripe is looking for a Senior Backend Engineer to join our Core Infrastructure and Payments Platform team. You will design, build, and maintain mission-critical distributed systems and high-availability APIs in Python/Go, PostgreSQL, and AWS.'
  );
  const [tone, setTone] = useState<'Professional' | 'Confident' | 'Conversational'>('Professional');
  const [length, setLength] = useState<'Short' | 'Standard' | 'Detailed'>('Standard');

  const [coverLetterContent, setCoverLetterContent] = useState(DEFAULT_COVER_LETTER);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const res = await api.generateCoverLetter({
        job_title: jobTitle,
        company,
        job_description: jobDescription,
        tone,
        length,
      });
      setCoverLetterContent(res.content);
    } catch {
      // Fallback
      setCoverLetterContent(DEFAULT_COVER_LETTER);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(coverLetterContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadTxt = () => {
    const blob = new Blob([coverLetterContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Cover_Letter_${company}_${jobTitle.replace(/\s+/g, '_')}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-zinc-200 dark:border-zinc-800">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              <Mail className="w-5 h-5 text-indigo-500" />
              <span>Tailored Cover Letter Generator</span>
            </h1>
            <p className="text-xs text-zinc-500 mt-1">
              Synthesize your resume achievements with target job requirements into an executive cover letter.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200 hover:bg-zinc-50 transition-colors shadow-xs"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied!' : 'Copy to Clipboard'}</span>
            </button>

            <button
              onClick={handleDownloadTxt}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 hover:opacity-90 transition-opacity shadow-xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Letter</span>
            </button>
          </div>
        </div>

        {/* 2 Column Form & Preview */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Controls Column (5 cols) */}
          <div className="lg:col-span-5 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 pb-2 border-b border-zinc-100 dark:border-zinc-800 flex items-center gap-2">
              <Sliders className="w-4 h-4 text-indigo-500" />
              <span>Target Role & Tone Settings</span>
            </h3>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1 flex items-center gap-1">
                <Briefcase className="w-3.5 h-3.5 text-zinc-400" />
                <span>Target Position</span>
              </label>
              <input
                type="text"
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                placeholder="Senior Backend Engineer"
                className="w-full px-3 py-2 text-xs rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1 flex items-center gap-1">
                <Building className="w-3.5 h-3.5 text-zinc-400" />
                <span>Company</span>
              </label>
              <input
                type="text"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder="Stripe, Vercel, Datadog"
                className="w-full px-3 py-2 text-xs rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                Job Context & Key Requirements
              </label>
              <textarea
                rows={5}
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                placeholder="Paste key responsibilities or qualifications..."
                className="w-full px-3 py-2 text-xs font-mono rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            {/* Tone Toggle */}
            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                Tone
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                {(['Professional', 'Confident', 'Conversational'] as const).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setTone(t)}
                    className={`py-1.5 px-2 rounded-lg text-xs font-semibold border transition-all text-center ${
                      tone === t
                        ? 'border-indigo-600 bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 dark:border-indigo-500'
                        : 'border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* Length Toggle */}
            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                Length
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                {(['Short', 'Standard', 'Detailed'] as const).map((l) => (
                  <button
                    key={l}
                    type="button"
                    onClick={() => setLength(l)}
                    className={`py-1.5 px-2 rounded-lg text-xs font-semibold border transition-all text-center ${
                      length === l
                        ? 'border-indigo-600 bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 dark:border-indigo-500'
                        : 'border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400'
                    }`}
                  >
                    {l}
                  </button>
                ))}
              </div>
            </div>

            {/* Generate CTA */}
            <button
              onClick={handleGenerate}
              disabled={loading}
              className="w-full mt-2 inline-flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-semibold bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200 transition-colors shadow-xs disabled:opacity-50"
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-400 dark:text-indigo-600" />
              <span>{loading ? 'Generating Cover Letter...' : 'Generate Tailored Cover Letter'}</span>
            </button>
          </div>

          {/* Editor & Preview Column (7 cols) */}
          <div className="lg:col-span-7 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs space-y-3">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800">
              <span className="text-xs font-bold uppercase tracking-wider text-zinc-500">
                Letter Preview & Live Editor
              </span>
              <span className="text-xs text-zinc-400 font-mono">
                {coverLetterContent.split(/\s+/).filter(Boolean).length} words
              </span>
            </div>

            <textarea
              rows={18}
              value={coverLetterContent}
              onChange={(e) => setCoverLetterContent(e.target.value)}
              className="w-full p-4 text-xs font-mono rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50/40 dark:bg-zinc-950/40 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-indigo-500 leading-relaxed resize-y"
            />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
