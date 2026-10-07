'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { CheckCircle2, ShieldCheck, ArrowRight, Sparkles, HelpCircle } from 'lucide-react';

export default function PricingPage() {
  const [annual, setAnnual] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 space-y-16">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-xs font-semibold text-indigo-700 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Investment in Your Career Trajectory</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
            Simple, Transparent Pricing
          </h1>
          <p className="text-sm sm:text-base text-zinc-600 dark:text-zinc-400">
            Unlock deterministic ATS scanning, semantic keyword alignment, and AI bullet optimization.
          </p>

          {/* Billing Interval Toggle */}
          <div className="pt-4 flex items-center justify-center gap-3">
            <span className={`text-xs font-semibold ${!annual ? 'text-zinc-900 dark:text-zinc-100' : 'text-zinc-500'}`}>
              Monthly
            </span>
            <button
              onClick={() => setAnnual(!annual)}
              className="relative w-12 h-6 rounded-full bg-zinc-200 dark:bg-zinc-800 transition-colors focus:outline-none"
            >
              <div
                className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-indigo-600 transition-transform ${
                  annual ? 'transform translate-x-6' : ''
                }`}
              />
            </button>
            <span className={`text-xs font-semibold flex items-center gap-1.5 ${annual ? 'text-zinc-900 dark:text-zinc-100' : 'text-zinc-500'}`}>
              Annual
              <span className="px-1.5 py-0.5 text-[10px] font-bold uppercase bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 rounded">
                Save 20%
              </span>
            </span>
          </div>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto items-stretch">
          {/* Free Tier */}
          <div className="p-8 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">Free Starter</h3>
                <p className="text-xs text-zinc-500 mt-1">For job seekers testing their baseline resume ATS score.</p>
              </div>
              <div className="text-3xl font-extrabold text-zinc-900 dark:text-white">
                ₹0 <span className="text-xs font-normal text-zinc-400">/ forever</span>
              </div>
              <ul className="space-y-2.5 text-xs text-zinc-600 dark:text-zinc-400 pt-4 border-t border-zinc-100 dark:border-zinc-800">
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" /> 3 ATS Analyses / month</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" /> Core ATS Compatibility Score</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" /> Keyword & Skill Gap Analysis</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" /> Standard Formatting Audit</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" /> PDF Scorecard Export</li>
              </ul>
            </div>
            <Link
              href="/analyze"
              className="w-full inline-flex justify-center items-center py-2.5 rounded-xl text-xs font-semibold bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 hover:bg-zinc-200 transition-colors"
            >
              Get Started Free
            </Link>
          </div>

          {/* Pro Tier (Featured) */}
          <div className="p-8 rounded-2xl border-2 border-indigo-600 bg-white dark:bg-zinc-900 shadow-xl flex flex-col justify-between space-y-6 relative">
            <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-indigo-600 text-white">
              Recommended for Job Seekers
            </span>
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">Pro</h3>
                <p className="text-xs text-zinc-500 mt-1">For active applicants who want to land top tech & enterprise interviews.</p>
              </div>
              <div className="text-3xl font-extrabold text-zinc-900 dark:text-white">
                ₹{annual ? '239' : '299'}{' '}
                <span className="text-xs font-normal text-zinc-400">/ month</span>
              </div>
              <ul className="space-y-2.5 text-xs text-zinc-600 dark:text-zinc-400 pt-4 border-t border-zinc-100 dark:border-zinc-800">
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-indigo-500 shrink-0" /> <b>Unlimited</b> ATS Analyses</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-indigo-500 shrink-0" /> <b>AI Resume Tailor</b> (Side-by-Side)</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-indigo-500 shrink-0" /> <b>Tailored Cover Letters</b> Generator</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-indigo-500 shrink-0" /> AI Bullet Impact Polisher (STAR)</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-indigo-500 shrink-0" /> Priority Processing & Reports</li>
              </ul>
            </div>
            <Link
              href="/billing?plan=pro"
              className="w-full inline-flex justify-center items-center py-3 rounded-xl text-xs font-semibold bg-indigo-600 text-white hover:bg-indigo-700 transition-colors shadow-md gap-1.5"
            >
              <span>Upgrade to Pro</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Recruiter Tier */}
          <div className="p-8 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">Recruiter</h3>
                <p className="text-xs text-zinc-500 mt-1">For hiring managers, talent teams, and agency headhunters.</p>
              </div>
              <div className="text-3xl font-extrabold text-zinc-900 dark:text-white">
                ₹{annual ? '1599' : '1999'}{' '}
                <span className="text-xs font-normal text-zinc-400">/ month</span>
              </div>
              <ul className="space-y-2.5 text-xs text-zinc-600 dark:text-zinc-400 pt-4 border-t border-zinc-100 dark:border-zinc-800">
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" /> Everything in Pro included</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" /> <b>Bulk Resume Screening</b> (1-100 files)</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" /> <b>Candidate Ranking Engine</b></li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" /> Dedicated Recruiter Dashboard</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" /> Multi-Job Pipeline Management</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" /> Bulk CSV & PDF Pipeline Export</li>
              </ul>
            </div>
            <Link
              href="/billing?plan=recruiter"
              className="w-full inline-flex justify-center items-center py-2.5 rounded-xl text-xs font-semibold bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors gap-1.5"
            >
              <span>Upgrade to Recruiter</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Feature Comparison Matrix */}
        <div className="max-w-4xl mx-auto pt-12 space-y-6">
          <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 text-center">
            Detailed Plan Comparison
          </h3>
          <div className="overflow-x-auto rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/40 text-zinc-500 uppercase tracking-wider text-[10px]">
                  <th className="py-3.5 px-4 font-bold">Feature</th>
                  <th className="py-3.5 px-4 font-bold">Free Starter (₹0)</th>
                  <th className="py-3.5 px-4 font-bold">Pro (₹299/mo)</th>
                  <th className="py-3.5 px-4 font-bold">Recruiter (₹1999/mo)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                {[
                  ['Monthly Resume Analyses', '3 / month', 'Unlimited', 'Unlimited'],
                  ['Deterministic ATS Scoring Engine', 'Yes', 'Yes', 'Yes'],
                  ['Keyword & Skill Gap Highlighting', 'Yes', 'Yes', 'Yes'],
                  ['AI Resume Tailor (Side-by-Side)', 'No (Locked)', 'Yes (Unlimited)', 'Yes (Unlimited)'],
                  ['AI Cover Letter Generator', 'No (Locked)', 'Yes (Unlimited)', 'Yes (Unlimited)'],
                  ['Bullet Point Impact Polisher', 'Limited', 'Unlimited', 'Unlimited'],
                  ['Recruiter Mode & Dashboard', 'No', 'No', 'Yes (Full Access)'],
                  ['Bulk Resume Upload & Screening', 'No', 'No', 'Up to 100 files'],
                  ['Candidate Ranking Matrix', 'No', 'No', 'Yes'],
                  ['Candidate Export (CSV/PDF)', 'No', 'No', 'Yes'],
                  ['Payment Providers Supported', 'N/A', 'Stripe & Razorpay', 'Stripe & Razorpay'],
                ].map(([feat, f1, f2, f3], i) => (
                  <tr key={i} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50">
                    <td className="py-3 px-4 font-semibold text-zinc-900 dark:text-zinc-100">{feat}</td>
                    <td className="py-3 px-4 text-zinc-500">{f1}</td>
                    <td className="py-3 px-4 font-bold text-indigo-600 dark:text-indigo-400">{f2}</td>
                    <td className="py-3 px-4 font-bold text-emerald-600 dark:text-emerald-400">{f3}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

