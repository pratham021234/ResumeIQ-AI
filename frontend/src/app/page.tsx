'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { CircularScore } from '@/components/ui/CircularScore';
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  FileCheck2,
  CheckCircle2,
  Search,
  Zap,
  Target,
  FileText,
  Layers,
  ChevronDown,
  Lock,
  Download,
  AlertTriangle,
} from 'lucide-react';

export default function LandingPage() {
  const [activeBulletTab, setActiveBulletTab] = useState<'achievement' | 'technical' | 'shorter' | 'ats_friendly'>('achievement');
  const [faqOpen, setFaqOpen] = useState<number | null>(null);

  const bulletExamples = {
    achievement: {
      original: 'Built REST APIs using FastAPI.',
      improved: 'Designed and implemented scalable REST APIs using FastAPI and PostgreSQL, improving backend response efficiency and supporting production-ready application workflows.',
      tags: ['+ Outcome Focused', '+ Scale Highlighted', '+ Zero Fake Metrics'],
    },
    technical: {
      original: 'Built REST APIs using FastAPI.',
      improved: 'Architected high-throughput asynchronous REST microservices with FastAPI, SQLAlchemy ORM, and Redis caching, achieving sub-45ms p99 latency.',
      tags: ['+ Architectural Depth', '+ Stack Specification', '+ Concurrency Added'],
    },
    shorter: {
      original: 'Responsible for writing and building various REST APIs using the FastAPI framework.',
      improved: 'Engineered high-concurrency FastAPI REST APIs connected to PostgreSQL clusters.',
      tags: ['+ Executive Brevity', '+ Action Starter Verb', '- Passive Fluff'],
    },
    ats_friendly: {
      original: 'Built fast python APIs for web clients.',
      improved: 'Engineered enterprise RESTful APIs utilizing Python and FastAPI, standardizing OpenAPI specifications and microservice communications.',
      tags: ['+ ATS Keyword Dense', '+ Standard Terminology', '+ Industry Standards'],
    },
  };

  const faqs = [
    {
      q: 'How does ResumeIQ AI calculate ATS compatibility?',
      a: 'Unlike tools that generate random scores, ResumeIQ AI uses an explainable deterministic formula: ATS Formatting (20%), Keyword Match (25%), Skills Match (25%), Experience Relevance (15%), Resume Quality (10%), and Education/Certifications (5%). If you analyze the same resume and job description twice, you receive identical, verifiable results.',
    },
    {
      q: 'Does the AI fabricate fake numbers or achievements?',
      a: 'Absolutely not. Our bullet optimizer enforces strict truth constraints: it elevates active verbs, structures context, and specifies architectural scope without ever inventing hallucinated statistics, budgets, or team sizes.',
    },
    {
      q: 'What resume file types do you support?',
      a: 'We parse standard PDF and DOCX files using native document structure engines (PyMuPDF and python-docx). We detect multi-column layout risks, buried header text, and table formatting traps.',
    },
    {
      q: 'Can I try ResumeIQ AI without creating an account?',
      a: 'Yes! Click "See Demo" below to immediately explore a comprehensive pre-loaded Senior Software Engineer ATS audit against Stripe.',
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100">
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-20 pb-16 md:pt-28 md:pb-24 overflow-hidden border-b border-zinc-100 dark:border-zinc-900">
        {/* Subtle grid background */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          {/* Top Pill */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-xs font-semibold text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700 mb-8 animate-fade-in">
            <span className="flex h-2 w-2 rounded-full bg-indigo-500" />
            <span>Next-Gen ATS Scanner & Semantic Job Matcher</span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-zinc-900 dark:text-white leading-[1.1] mb-6">
            Make Your Resume <br className="hidden sm:inline" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-zinc-900 via-indigo-950 to-zinc-700 dark:from-white dark:via-zinc-200 dark:to-zinc-400">
              Beat the ATS.
            </span>
          </h1>

          <p className="max-w-2xl mx-auto text-base sm:text-lg text-zinc-600 dark:text-zinc-400 mb-10 leading-relaxed">
            AI-powered resume analysis that shows exactly why your resume gets rejected — and how to fix it before applying.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <Link
              href="/analyze"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl text-sm font-semibold bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200 transition-all shadow-md hover:shadow-lg"
            >
              <Sparkles className="w-4 h-4 text-indigo-400 dark:text-indigo-600" />
              <span>Analyze My Resume</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </Link>

            <Link
              href="/analysis/demo-analysis-alex-stripe"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl text-sm font-semibold bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
            >
              <FileCheck2 className="w-4 h-4 text-zinc-500" />
              <span>See Demo Analysis</span>
            </Link>
          </div>

          {/* Under Hero: Interactive Dashboard Preview Card */}
          <div className="relative max-w-4xl mx-auto rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white/95 dark:bg-zinc-900/90 shadow-2xl p-6 sm:p-8 backdrop-blur-sm">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-6 border-b border-zinc-100 dark:border-zinc-800 gap-4">
              <div className="text-left">
                <span className="text-xs font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                  Live Audit Preview
                </span>
                <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 mt-0.5">
                  Senior Backend Engineer — Stripe
                </h3>
                <span className="text-xs text-zinc-500">Alex_Rivera_Resume.pdf</span>
              </div>
              <div className="flex items-center gap-2">
                <Link
                  href="/analysis/demo-analysis-alex-stripe"
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 hover:bg-indigo-100 transition-colors"
                >
                  View Full Report →
                </Link>
              </div>
            </div>

            {/* 4 Sample Hero Metric Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 pt-6">
              <div className="p-4 rounded-xl border border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/40 flex flex-col items-center">
                <CircularScore score={87} size={96} strokeWidth={8} showStatus={false} />
                <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100 mt-2">ATS Score</span>
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold uppercase">Excellent</span>
              </div>

              <div className="p-4 rounded-xl border border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/40 flex flex-col items-center">
                <CircularScore score={82} size={96} strokeWidth={8} showStatus={false} />
                <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100 mt-2">Job Match</span>
                <span className="text-[10px] text-sky-600 dark:text-sky-400 font-semibold uppercase">Strong</span>
              </div>

              <div className="p-4 rounded-xl border border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/40 flex flex-col items-center justify-center">
                <span className="text-3xl font-extrabold text-indigo-600 dark:text-indigo-400">24</span>
                <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100 mt-1">Keywords Found</span>
                <span className="text-[10px] text-zinc-500">of 28 in Job Post</span>
              </div>

              <div className="p-4 rounded-xl border border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/40 flex flex-col items-center justify-center">
                <span className="text-3xl font-extrabold text-amber-500">6</span>
                <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100 mt-1">Missing Skills</span>
                <span className="text-[10px] text-zinc-500">Prioritized for Review</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof / Trusted Bar */}
      <section className="py-12 border-b border-zinc-100 dark:border-zinc-900 bg-zinc-50/50 dark:bg-zinc-900/30">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-6">
            Engineered for candidates targeting top tier engineering, product, and leadership teams
          </p>
          <div className="flex flex-wrap items-center justify-center gap-8 md:gap-14 opacity-75 grayscale hover:grayscale-0 transition-all text-sm font-bold text-zinc-600 dark:text-zinc-300">
            <span>Stripe</span>
            <span>Vercel</span>
            <span>Google</span>
            <span>Datadog</span>
            <span>OpenAI</span>
            <span>Airbnb</span>
          </div>
        </div>
      </section>

      {/* Before / After Resume Bullet Transformation */}
      <section className="py-20 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
            AI Bullet Improver
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-white mt-1">
            Transform Weak Bullets Into High-Impact Achievements
          </h2>
          <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-2">
            No hallucinated metrics. Just powerful action verbs, clear architectural scope, and ATS keyword alignment.
          </p>
        </div>

        {/* Style Toggles */}
        <div className="flex items-center justify-center gap-2 mb-6 overflow-x-auto pb-2">
          {(['achievement', 'technical', 'shorter', 'ats_friendly'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveBulletTab(tab)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${
                activeBulletTab === tab
                  ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 shadow-xs'
                  : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900'
              }`}
            >
              {tab.replace('_', ' ')}
            </button>
          ))}
        </div>

        {/* Comparison Box */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 sm:p-8 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm">
          {/* Before */}
          <div className="p-5 rounded-xl border border-rose-200/80 bg-rose-50/30 dark:bg-rose-950/20 dark:border-rose-900/40">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wider">
                Original Bullet (Weak)
              </span>
              <AlertTriangle className="w-4 h-4 text-rose-500" />
            </div>
            <p className="text-sm text-zinc-700 dark:text-zinc-300 italic mb-4">
              "{bulletExamples[activeBulletTab].original}"
            </p>
            <div className="text-[11px] text-rose-700 dark:text-rose-400">
              Issues: Weak verb, no architectural context, zero business impact.
            </div>
          </div>

          {/* After */}
          <div className="p-5 rounded-xl border border-emerald-200/80 bg-emerald-50/30 dark:bg-emerald-950/20 dark:border-emerald-900/40">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                AI Improved (ATS Optimized)
              </span>
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            </div>
            <p className="text-sm text-zinc-900 dark:text-zinc-100 font-medium mb-4">
              "{bulletExamples[activeBulletTab].improved}"
            </p>
            <div className="flex flex-wrap gap-1.5">
              {bulletExamples[activeBulletTab].tags.map((tag) => (
                <span
                  key={tag}
                  className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* How It Works (3 Steps) */}
      <section id="how-it-works" className="py-20 border-t border-zinc-100 dark:border-zinc-900 bg-zinc-50 dark:bg-zinc-900/40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              Workflow
            </span>
            <h2 className="text-3xl font-extrabold text-zinc-900 dark:text-white mt-1">
              How ResumeIQ AI Optimizes Your Application
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 space-y-4">
              <div className="w-10 h-10 rounded-xl bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 flex items-center justify-center font-bold text-sm">
                1
              </div>
              <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                Upload & Target
              </h3>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                Upload your resume in PDF or DOCX and paste the target job description. We extract layout elements, font hierarchies, and core sections.
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 space-y-4">
              <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-sm">
                2
              </div>
              <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                Deterministic ATS Audit
              </h3>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                Our engine runs an explainable scoring matrix: formatting compliance, keyword density, skill gaps with recruiter priorities, and section quality.
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 space-y-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-sm">
                3
              </div>
              <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                AI Optimization & Export
              </h3>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                Refine bullets in the split-screen editor, generate tailored cover letters, and export an executive PDF audit report.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
            Core Features
          </span>
          <h2 className="text-3xl font-extrabold text-zinc-900 dark:text-white mt-1">
            Engineered for Job Search Dominance
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 space-y-3">
            <div className="p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 w-fit">
              <Target className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">Categorized Keyword Radar</h3>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
              Detects Critical Missing, Recommended, and Already Found keywords with alias mapping (e.g. Postgres → PostgreSQL).
            </p>
          </div>

          <div className="p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 space-y-3">
            <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 w-fit">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">ATS Layout Compliance</h3>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
              Audits multi-column structures, embedded images, tables, contact headers, and word count constraints.
            </p>
          </div>

          <div className="p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 space-y-3">
            <div className="p-2.5 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 w-fit">
              <Zap className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">AI Bullet Improver</h3>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
              Rewrite bullets with multiple styles (achievement, technical, shorter, ATS-friendly) without fabricated metrics.
            </p>
          </div>

          <div className="p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 space-y-3">
            <div className="p-2.5 rounded-xl bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 w-fit">
              <FileText className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">Tailored Cover Letters</h3>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
              Generate role-specific cover letters customized for company culture, tone, and specific job requirements.
            </p>
          </div>

          <div className="p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 space-y-3">
            <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 w-fit">
              <Layers className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">Resume Version Library</h3>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
              Maintain separate optimized versions for Backend, Full Stack, and Systems roles without version clutter.
            </p>
          </div>

          <div className="p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 space-y-3">
            <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 w-fit">
              <Download className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">Executive PDF Reports</h3>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
              Export downloadable branded audit reports with granular score breakdowns, skill gaps, and prioritized action items.
            </p>
          </div>
        </div>
      </section>

      {/* Pricing Preview */}
      <section className="py-20 border-t border-zinc-100 dark:border-zinc-900 bg-zinc-50 dark:bg-zinc-900/40">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="text-xs font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
            Transparent Pricing
          </span>
          <h2 className="text-3xl font-extrabold text-zinc-900 dark:text-white mt-1 mb-12">
            Invest In Your Next Career Leap
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
            {/* Free */}
            <div className="p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 space-y-5">
              <div>
                <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">Free Tier</h3>
                <div className="mt-2 text-2xl font-extrabold text-zinc-900 dark:text-white">$0</div>
                <p className="text-xs text-zinc-500 mt-1">Get started with standard ATS audit.</p>
              </div>
              <ul className="space-y-2 text-xs text-zinc-600 dark:text-zinc-400">
                <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> 3 ATS Scans / Month</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Keyword Gap Detection</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Standard Formatting Audit</li>
              </ul>
              <Link
                href="/analyze"
                className="w-full inline-flex justify-center items-center py-2 rounded-xl text-xs font-semibold bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 hover:bg-zinc-200"
              >
                Start Free
              </Link>
            </div>

            {/* Pro (Highlighted) */}
            <div className="p-6 rounded-2xl border-2 border-indigo-600 bg-white dark:bg-zinc-900 space-y-5 shadow-lg relative">
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-indigo-600 text-white">
                Most Popular
              </span>
              <div>
                <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">Pro Pass</h3>
                <div className="mt-2 text-2xl font-extrabold text-zinc-900 dark:text-white">
                  $19 <span className="text-xs font-normal text-zinc-500">/ month</span>
                </div>
                <p className="text-xs text-zinc-500 mt-1">For active job seekers who want interviews.</p>
              </div>
              <ul className="space-y-2 text-xs text-zinc-600 dark:text-zinc-400">
                <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-indigo-500" /> Unlimited ATS Scans</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-indigo-500" /> AI Bullet Improver (All Styles)</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-indigo-500" /> Tailored Cover Letter Generator</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-indigo-500" /> PDF Report Downloads</li>
              </ul>
              <Link
                href="/signup"
                className="w-full inline-flex justify-center items-center py-2.5 rounded-xl text-xs font-semibold bg-indigo-600 text-white hover:bg-indigo-700"
              >
                Get Pro Access
              </Link>
            </div>

            {/* Career Booster */}
            <div className="p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 space-y-5">
              <div>
                <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">Career Booster</h3>
                <div className="mt-2 text-2xl font-extrabold text-zinc-900 dark:text-white">
                  $39 <span className="text-xs font-normal text-zinc-500">/ month</span>
                </div>
                <p className="text-xs text-zinc-500 mt-1">For executive and senior tier transitions.</p>
              </div>
              <ul className="space-y-2 text-xs text-zinc-600 dark:text-zinc-400">
                <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Everything in Pro</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Recruiter Priority Benchmarks</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Custom Industry Vocabularies</li>
              </ul>
              <Link
                href="/signup"
                className="w-full inline-flex justify-center items-center py-2 rounded-xl text-xs font-semibold bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 hover:bg-zinc-200"
              >
                Select Booster
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Accordion */}
      <section id="faq" className="py-20 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <span className="text-xs font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
            FAQ
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-white mt-1">
            Frequently Asked Questions
          </h2>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => (
            <div
              key={idx}
              className="rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden"
            >
              <button
                onClick={() => setFaqOpen(faqOpen === idx ? null : idx)}
                className="w-full px-5 py-4 text-left font-semibold text-sm flex items-center justify-between text-zinc-900 dark:text-zinc-100 bg-white dark:bg-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-800/60"
              >
                <span>{faq.q}</span>
                <ChevronDown
                  className={`w-4 h-4 text-zinc-500 transition-transform ${
                    faqOpen === idx ? 'transform rotate-180' : ''
                  }`}
                />
              </button>
              {faqOpen === idx && (
                <div className="px-5 py-4 text-xs text-zinc-600 dark:text-zinc-400 bg-zinc-50/50 dark:bg-zinc-950/50 border-t border-zinc-100 dark:border-zinc-800 leading-relaxed">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-16 bg-zinc-900 text-white text-center">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-4">
            Stop Sending Resumes Into The ATS Black Hole.
          </h2>
          <p className="text-zinc-400 text-sm max-w-xl mx-auto mb-8">
            Get instant ATS feedback, close critical skill gaps, and land interviews with confidence.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/analyze"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl text-sm font-semibold bg-white text-zinc-900 hover:bg-zinc-100 shadow-md transition-all"
            >
              <Sparkles className="w-4 h-4 text-indigo-600" />
              <span>Analyze Resume Now</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
