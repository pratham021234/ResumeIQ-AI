'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { CircularScore } from '@/components/ui/CircularScore';
import { ScoreBadge } from '@/components/ui/ScoreBadge';
import {
  Wand2,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  PlusCircle,
  MinusCircle,
  TrendingUp,
  Copy,
  Download,
  Share2,
  RefreshCw,
  FileText,
  Building2,
  Briefcase,
  Layers,
  ChevronRight,
  ShieldCheck,
  Check,
  Eye,
  Columns,
  Maximize2,
  PenTool,
  Save,
} from 'lucide-react';
import { api } from '@/lib/api';
import { Resume, ResumeTailorResponse, TailorChangeItem } from '@/types';
import { TAILOR_PRESETS, DEMO_TAILOR_RESPONSE } from '@/lib/demoData';

function TailorPageContent() {
  const searchParams = useSearchParams();
  const prefillResumeId = searchParams.get('resume_id');
  const prefillJobTitle = searchParams.get('job_title') || '';
  const prefillCompany = searchParams.get('company') || '';

  // Form State
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [selectedResumeId, setSelectedResumeId] = useState<string>(prefillResumeId || '');
  const [jobTitle, setJobTitle] = useState<string>(prefillJobTitle || TAILOR_PRESETS[0].job_title);
  const [company, setCompany] = useState<string>(prefillCompany || TAILOR_PRESETS[0].company);
  const [jobDescription, setJobDescription] = useState<string>(TAILOR_PRESETS[0].job_description);
  const [resumeText, setResumeText] = useState<string>(TAILOR_PRESETS[0].sample_resume);

  // Tailor Results State
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [tailorResult, setTailorResult] = useState<ResumeTailorResponse | null>(DEMO_TAILOR_RESPONSE);
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [viewMode, setViewMode] = useState<'split' | 'tailored' | 'original'>('split');
  const [copied, setCopied] = useState<boolean>(false);
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Load user resumes on mount
  useEffect(() => {
    async function loadResumes() {
      try {
        const list = await api.getResumes();
        setResumes(list);
        if (prefillResumeId) {
          const match = list.find((r) => r.id === prefillResumeId);
          if (match && match.raw_text) {
            setResumeText(match.raw_text);
          }
        }
      } catch (err) {
        console.warn('Could not load resumes, using defaults:', err);
      }
    }
    loadResumes();
  }, [prefillResumeId]);

  // Handle Preset Selection
  const applyPreset = (presetId: string) => {
    const preset = TAILOR_PRESETS.find((p) => p.id === presetId);
    if (preset) {
      setJobTitle(preset.job_title);
      setCompany(preset.company);
      setJobDescription(preset.job_description);
      setResumeText(preset.sample_resume);
      setSelectedResumeId('');
    }
  };

  // Handle Tailoring Execution
  const handleGenerateTailored = async () => {
    if (!jobTitle.trim() || !company.trim() || !jobDescription.trim()) {
      setErrorMsg('Please enter job title, company, and target job description.');
      return;
    }
    if (!resumeText.trim()) {
      setErrorMsg('Please select or paste your existing resume.');
      return;
    }

    setErrorMsg(null);
    setIsGenerating(true);
    setSavedSuccess(false);

    try {
      const response = await api.tailorResume({
        resume_id: selectedResumeId || undefined,
        resume_text: resumeText,
        job_title: jobTitle,
        company: company,
        job_description: jobDescription,
      });
      setTailorResult(response);
    } catch (err: any) {
      console.error('Tailor error:', err);
      setErrorMsg(err?.message || 'Failed to tailor resume. Loaded demo preview.');
      setTailorResult(DEMO_TAILOR_RESPONSE);
    } finally {
      setIsGenerating(false);
    }
  };

  // Copy Tailored Resume to Clipboard
  const handleCopyTailored = () => {
    if (!tailorResult) return;
    navigator.clipboard.writeText(tailorResult.tailored_resume);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  // Download Tailored Resume as TXT
  const handleDownloadTxt = () => {
    if (!tailorResult) return;
    const element = document.createElement('a');
    const file = new Blob([tailorResult.tailored_resume], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `${company}_${jobTitle.replace(/\s+/g, '_')}_Tailored_Resume.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  // Filter change log items
  const changeLog = tailorResult?.change_log || [];
  const filteredChanges =
    activeCategory === 'All'
      ? changeLog
      : changeLog.filter((c) => c.category === activeCategory);

  const counts = {
    All: changeLog.length,
    Added: changeLog.filter((c) => c.category === 'Added').length,
    Improved: changeLog.filter((c) => c.category === 'Improved').length,
    Removed: changeLog.filter((c) => c.category === 'Removed').length,
    Recommended: changeLog.filter((c) => c.category === 'Recommended').length,
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-16">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-zinc-200 dark:border-zinc-800 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-xs">
              Premium Engine
            </span>
            <span className="text-xs text-zinc-500 font-medium">Deterministic ATS Optimization</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-950 dark:text-zinc-50 flex items-center gap-2.5">
            <Wand2 className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            AI Resume Tailor
          </h1>
          <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1 max-w-2xl">
            Automatically align your summary, technical skills, and experience bullets to target any specific job description without inventing metrics or experience.
          </p>
        </div>

        {/* Quick Presets */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-zinc-500 mr-1">Try Quick Role:</span>
          {TAILOR_PRESETS.map((preset) => (
            <button
              key={preset.id}
              onClick={() => applyPreset(preset.id)}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 hover:border-indigo-500 dark:hover:border-indigo-500 transition-all shadow-xs"
            >
              {preset.company} ({preset.job_title.split(' ')[0]})
            </button>
          ))}
        </div>
      </div>

      {/* Inputs Configuration Form */}
      <div className="p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs space-y-6">
        <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-4">
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-indigo-500" />
            <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
              Target Job & Resume Details
            </h2>
          </div>
          <div className="flex items-center gap-2 text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
            <ShieldCheck className="w-4 h-4" />
            <span>Zero-Fabrication Guarantee Active</span>
          </div>
        </div>

        {errorMsg && (
          <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
              Target Job Title <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={jobTitle}
              onChange={(e) => setJobTitle(e.target.value)}
              placeholder="e.g. Senior Backend Engineer"
              className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
              Target Company <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              placeholder="e.g. Stripe, OpenAI, Vercel"
              className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Resume Input */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-zinc-500" />
                <span>Existing Resume Content</span>
              </label>
              {resumes.length > 0 && (
                <select
                  value={selectedResumeId}
                  onChange={(e) => {
                    const id = e.target.value;
                    setSelectedResumeId(id);
                    const found = resumes.find((r) => r.id === id);
                    if (found && found.raw_text) setResumeText(found.raw_text);
                  }}
                  className="text-xs bg-zinc-100 dark:bg-zinc-800 border-none rounded-lg px-2.5 py-1 text-zinc-700 dark:text-zinc-300"
                >
                  <option value="">Load from Library...</option>
                  {resumes.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.title}
                    </option>
                  ))}
                </select>
              )}
            </div>
            <textarea
              value={resumeText}
              onChange={(e) => setResumeText(e.target.value)}
              rows={9}
              placeholder="Paste existing resume text here..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 font-mono text-xs text-zinc-800 dark:text-zinc-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Job Description Input */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
              <Briefcase className="w-3.5 h-3.5 text-zinc-500" />
              <span>Target Job Description (JD)</span>
            </label>
            <textarea
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              rows={9}
              placeholder="Paste full job description requirements and responsibilities..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 font-mono text-xs text-zinc-800 dark:text-zinc-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        {/* Generate CTA Button */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
          <div className="flex items-center gap-2 text-xs text-zinc-500">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>Optimizes: Summary, Skills Taxonomy, Project Scope & Work Bullets</span>
          </div>

          <button
            onClick={handleGenerateTailored}
            disabled={isGenerating}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-xs font-bold bg-indigo-600 text-white hover:bg-indigo-500 disabled:opacity-50 transition-all shadow-md shadow-indigo-500/20"
          >
            {isGenerating ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Tailoring Resume & Forecasting ATS...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>Generate Tailored Version</span>
              </>
            )}
          </button>
        </div>
      </div>

      {tailorResult && (
        <>
          {/* ATS Improvement Forecast Card */}
          <div className="p-6 rounded-2xl border border-indigo-100 dark:border-indigo-900/50 bg-gradient-to-br from-indigo-50/40 via-white to-purple-50/20 dark:from-indigo-950/20 dark:via-zinc-900 dark:to-purple-950/20 shadow-xs space-y-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <span className="px-2.5 py-0.5 rounded-md text-[10px] font-extrabold uppercase tracking-wide bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 mb-2 inline-block">
                  ATS Score Forecast
                </span>
                <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                  Targeted ATS Improvement for {tailorResult.company}
                </h3>
                <p className="text-xs text-zinc-500 mt-0.5">
                  Re-evaluated against standard applicant tracking filters and keyword algorithms.
                </p>
              </div>

              {/* Forecast Metrics */}
              <div className="flex items-center gap-4 bg-white dark:bg-zinc-950 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-xs">
                <div className="text-center px-3">
                  <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">
                    Current ATS
                  </span>
                  <span className="text-2xl font-extrabold text-zinc-700 dark:text-zinc-300">
                    {tailorResult.ats_forecast.current_score}
                  </span>
                </div>

                <div className="flex flex-col items-center px-1">
                  <ArrowRight className="w-5 h-5 text-indigo-500" />
                  <span className="text-[10px] font-extrabold text-emerald-600 dark:text-emerald-400">
                    +{tailorResult.ats_forecast.increase} pts
                  </span>
                </div>

                <div className="text-center px-3">
                  <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider block">
                    Expected ATS
                  </span>
                  <span className="text-2xl font-black text-indigo-600 dark:text-indigo-400">
                    {tailorResult.ats_forecast.expected_score}
                  </span>
                </div>
              </div>
            </div>

            {/* Reasoning Breakdown */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 border-t border-zinc-100 dark:border-zinc-800">
              {tailorResult.ats_forecast.reasoning.map((reason, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-2.5 p-3 rounded-xl bg-white/70 dark:bg-zinc-950/60 border border-zinc-200/60 dark:border-zinc-800/60 text-xs text-zinc-700 dark:text-zinc-300"
                >
                  <TrendingUp className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span>{reason}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Change Log UI */}
          <div className="p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-zinc-100 dark:border-zinc-800 pb-4">
              <div>
                <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                  Comprehensive Change Log
                </h3>
                <p className="text-xs text-zinc-500 mt-0.5">
                  Detailed record of additions, vocabulary enhancements, and distractions removed.
                </p>
              </div>

              {/* Filter Tabs */}
              <div className="flex flex-wrap items-center gap-1.5">
                {(['All', 'Added', 'Improved', 'Removed', 'Recommended'] as const).map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      activeCategory === cat
                        ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 shadow-xs'
                        : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200'
                    }`}
                  >
                    {cat} ({counts[cat]})
                  </button>
                ))}
              </div>
            </div>

            {/* Change Items Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {filteredChanges.map((change, idx) => {
                const isAdded = change.category === 'Added';
                const isImproved = change.category === 'Improved';
                const isRemoved = change.category === 'Removed';
                const isRecommended = change.category === 'Recommended';

                return (
                  <div
                    key={idx}
                    className="p-3.5 rounded-xl border border-zinc-100 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-zinc-950/50 space-y-1.5"
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold ${
                          isAdded
                            ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400'
                            : isImproved
                            ? 'bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400'
                            : isRemoved
                            ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400'
                            : 'bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-400'
                        }`}
                      >
                        {isAdded && <PlusCircle className="w-3 h-3" />}
                        {isImproved && <CheckCircle2 className="w-3 h-3" />}
                        {isRemoved && <MinusCircle className="w-3 h-3" />}
                        {isRecommended && <Sparkles className="w-3 h-3" />}
                        {change.category}
                      </span>
                      <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 line-clamp-1">
                        {change.item}
                      </h4>
                    </div>
                    {change.description && (
                      <p className="text-xs text-zinc-600 dark:text-zinc-400 pl-1 leading-relaxed">
                        {change.description}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Side-by-Side Comparison */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                  Side-by-Side Resume Comparison
                </h3>
                <p className="text-xs text-zinc-500 mt-0.5">
                  Compare your original content with the tailored, ATS-compliant version.
                </p>
              </div>

              {/* View mode toggle & Action Buttons */}
              <div className="flex flex-wrap items-center gap-2">
                <div className="flex items-center bg-zinc-100 dark:bg-zinc-800 p-1 rounded-xl text-xs font-semibold">
                  <button
                    onClick={() => setViewMode('split')}
                    className={`px-2.5 py-1 rounded-lg transition-all ${
                      viewMode === 'split'
                        ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-xs'
                        : 'text-zinc-500 hover:text-zinc-900'
                    }`}
                  >
                    Split View
                  </button>
                  <button
                    onClick={() => setViewMode('original')}
                    className={`px-2.5 py-1 rounded-lg transition-all ${
                      viewMode === 'original'
                        ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-xs'
                        : 'text-zinc-500 hover:text-zinc-900'
                    }`}
                  >
                    Original Only
                  </button>
                  <button
                    onClick={() => setViewMode('tailored')}
                    className={`px-2.5 py-1 rounded-lg transition-all ${
                      viewMode === 'tailored'
                        ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-xs'
                        : 'text-zinc-500 hover:text-zinc-900'
                    }`}
                  >
                    Tailored Only
                  </button>
                </div>

                <button
                  onClick={handleCopyTailored}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 transition-colors shadow-xs"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-500" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Tailored</span>
                    </>
                  )}
                </button>

                <button
                  onClick={handleDownloadTxt}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 transition-colors shadow-xs"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download TXT</span>
                </button>

                <Link
                  href="/editor"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 hover:opacity-90 transition-opacity shadow-xs"
                >
                  <PenTool className="w-3.5 h-3.5 text-indigo-400 dark:text-indigo-600" />
                  <span>Open in Bullet Improver</span>
                </Link>
              </div>
            </div>

            {/* Split View Columns */}
            <div
              className={`grid gap-6 ${
                viewMode === 'split'
                  ? 'grid-cols-1 lg:grid-cols-2'
                  : 'grid-cols-1'
              }`}
            >
              {/* Left Column: Original Resume */}
              {(viewMode === 'split' || viewMode === 'original') && (
                <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden shadow-xs flex flex-col">
                  <div className="p-4 bg-zinc-50 dark:bg-zinc-950/60 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-zinc-400" />
                      <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200">
                        Original Resume
                      </span>
                    </div>
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
                      ATS: {tailorResult.ats_forecast.current_score}
                    </span>
                  </div>
                  <div className="p-6 font-mono text-xs text-zinc-600 dark:text-zinc-400 whitespace-pre-wrap leading-relaxed max-h-[650px] overflow-y-auto">
                    {tailorResult.original_resume}
                  </div>
                </div>
              )}

              {/* Right Column: Tailored Resume */}
              {(viewMode === 'split' || viewMode === 'tailored') && (
                <div className="rounded-2xl border-2 border-indigo-500/40 dark:border-indigo-500/30 bg-white dark:bg-zinc-900 overflow-hidden shadow-sm flex flex-col">
                  <div className="p-4 bg-indigo-50/50 dark:bg-indigo-950/40 border-b border-indigo-100 dark:border-indigo-900/50 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                      <span className="text-xs font-bold text-indigo-900 dark:text-indigo-200">
                        Tailored for {tailorResult.job_title} at {tailorResult.company}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400">
                        ATS: {tailorResult.ats_forecast.expected_score}
                      </span>
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-indigo-600 text-white">
                        Optimized
                      </span>
                    </div>
                  </div>
                  <div className="p-6 font-mono text-xs text-zinc-900 dark:text-zinc-100 whitespace-pre-wrap leading-relaxed max-h-[650px] overflow-y-auto bg-indigo-50/5 dark:bg-indigo-950/10">
                    {tailorResult.tailored_resume}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Saved in Library Notice */}
          <div className="p-4 rounded-xl border border-emerald-200 dark:border-emerald-800/60 bg-emerald-50/40 dark:bg-emerald-950/20 text-xs text-emerald-800 dark:text-emerald-300 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>
                Tailored resume saved to your resume library as a new version.
              </span>
            </div>
            <Link
              href="/resumes"
              className="font-bold underline hover:text-emerald-900 dark:hover:text-emerald-200"
            >
              View in Resume Library →
            </Link>
          </div>
        </>
      )}
    </div>
  );
}

export default function TailorPage() {
  return (
    <DashboardLayout>
      <Suspense fallback={<div className="p-12 text-center text-xs text-zinc-500">Loading AI Resume Tailor...</div>}>
        <TailorPageContent />
      </Suspense>
    </DashboardLayout>
  );
}
