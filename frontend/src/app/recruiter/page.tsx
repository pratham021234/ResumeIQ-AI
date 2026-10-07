'use client';

import React, { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { ScoreBadge } from '@/components/ui/ScoreBadge';
import {
  Users2,
  Lock,
  Sparkles,
  ShieldAlert,
  Search,
  Filter,
  CheckCircle2,
  ExternalLink,
  Sliders,
} from 'lucide-react';
import Link from 'next/link';

export default function RecruiterPortalPage() {
  const [flagEnabled, setFlagEnabled] = useState(false);
  const [minScoreFilter, setMinScoreFilter] = useState(80);

  const candidates = [
    {
      name: 'Alex Rivera',
      email: 'alex.rivera.dev@gmail.com',
      role: 'Senior Backend Engineer',
      targetJob: 'Core Platform & Payments — Stripe',
      atsScore: 87.0,
      matchScore: 82.5,
      status: 'Top 5% Fit',
      skills: ['Python', 'FastAPI', 'PostgreSQL', 'Redis', 'AWS', 'Kubernetes'],
    },
    {
      name: 'Jordan Taylor',
      email: 'jordan.taylor@example.com',
      role: 'Full Stack Engineer',
      targetJob: 'Staff Platform Engineer — Vercel',
      atsScore: 81.5,
      matchScore: 78.0,
      status: 'Strong Fit',
      skills: ['React', 'Next.js', 'TypeScript', 'Node.js', 'PostgreSQL'],
    },
    {
      name: 'Morgan Chen',
      email: 'morgan.chen@example.com',
      role: 'Data & Distributed Systems Engineer',
      targetJob: 'Principal Infrastructure Engineer',
      atsScore: 74.0,
      matchScore: 71.0,
      status: 'Review Recommended',
      skills: ['Python', 'Go', 'Kafka', 'Docker'],
    },
  ];

  const filteredCandidates = candidates.filter((c) => c.atsScore >= minScoreFilter);

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-6xl mx-auto">
        {/* Banner with Feature Flag Notice */}
        <div className="p-6 rounded-2xl border border-purple-200 dark:border-purple-900/60 bg-gradient-to-r from-purple-50/60 via-zinc-50/60 to-white dark:from-purple-950/20 dark:via-zinc-900/60 dark:to-zinc-900 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-purple-100 text-purple-700 dark:bg-purple-950/80 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                Architectural Prototype
              </span>
              <span className="text-xs text-zinc-500 font-mono">FLAG: ENABLE_RECRUITER_DASHBOARD</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              <Users2 className="w-6 h-6 text-purple-600" />
              <span>Recruiter Batch Screening & Applicant Ranking</span>
            </h1>
            <p className="text-xs text-zinc-600 dark:text-zinc-400">
              Rank inbound applicant resumes deterministically by ATS compatibility and target job description coverage.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setFlagEnabled(!flagEnabled)}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all ${
                flagEnabled
                  ? 'bg-purple-600 text-white border-purple-600 shadow-xs'
                  : 'bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700'
              }`}
            >
              {flagEnabled ? 'Feature Flag: Active (Simulated)' : 'Feature Flag: Gated Behind Beta'}
            </button>
          </div>
        </div>

        {/* Screening Filters */}
        <div className="p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Sliders className="w-4 h-4 text-zinc-400" />
            <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300">Minimum ATS Score Filter:</span>
            <div className="flex items-center gap-1.5">
              {[70, 75, 80, 85].map((s) => (
                <button
                  key={s}
                  onClick={() => setMinScoreFilter(s)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition-colors ${
                    minScoreFilter === s
                      ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 border-zinc-900'
                      : 'bg-zinc-50 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700'
                  }`}
                >
                  {s}+
                </button>
              ))}
            </div>
          </div>

          <span className="text-xs text-zinc-400">
            Showing {filteredCandidates.length} of {candidates.length} candidate(s)
          </span>
        </div>

        {/* Ranked Applicants Table */}
        <div className="p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-zinc-100 dark:border-zinc-800 text-zinc-400 uppercase tracking-wider text-[10px]">
                  <th className="py-3 px-3">Candidate</th>
                  <th className="py-3 px-3">Target Role</th>
                  <th className="py-3 px-3">ATS Compatibility</th>
                  <th className="py-3 px-3">Job Match</th>
                  <th className="py-3 px-3">Verified Skills</th>
                  <th className="py-3 px-3 text-right">Audit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                {filteredCandidates.map((c, i) => (
                  <tr key={i} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50">
                    <td className="py-3.5 px-3">
                      <div className="font-bold text-zinc-900 dark:text-zinc-100">{c.name}</div>
                      <div className="text-[11px] text-zinc-400">{c.email}</div>
                    </td>
                    <td className="py-3.5 px-3 text-zinc-600 dark:text-zinc-300">
                      <div>{c.role}</div>
                      <div className="text-[11px] text-zinc-400">{c.targetJob}</div>
                    </td>
                    <td className="py-3.5 px-3">
                      <ScoreBadge score={c.atsScore} label={`${c.atsScore}/100`} />
                    </td>
                    <td className="py-3.5 px-3 font-semibold text-zinc-700 dark:text-zinc-300">
                      {c.matchScore}%
                    </td>
                    <td className="py-3.5 px-3">
                      <div className="flex flex-wrap gap-1 max-w-xs">
                        {c.skills.slice(0, 4).map((s, idx) => (
                          <span
                            key={idx}
                            className="px-1.5 py-0.5 rounded text-[10px] bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700"
                          >
                            {s}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="py-3.5 px-3 text-right">
                      <Link
                        href="/analysis/demo-analysis-alex-stripe"
                        className="inline-flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-semibold bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 hover:opacity-90"
                      >
                        <span>Audit</span>
                        <ExternalLink className="w-3 h-3" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
