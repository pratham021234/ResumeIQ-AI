'use client';

import React from 'react';
import {
  Users,
  Award,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertTriangle,
  BrainCircuit,
  Filter,
  BarChart2,
  PieChart,
  Layers,
  ArrowUpRight,
} from 'lucide-react';
import { CopilotAnalytics } from '@/types';

interface CopilotAnalyticsViewProps {
  analytics: CopilotAnalytics | null;
  selectedJobTitle?: string;
}

export const CopilotAnalyticsView: React.FC<CopilotAnalyticsViewProps> = ({
  analytics,
  selectedJobTitle,
}) => {
  if (!analytics) return null;

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Overview Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs">
          <div className="flex items-center justify-between text-zinc-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Screened</span>
            <Users className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="text-2xl font-black text-zinc-900 dark:text-zinc-100">
            {analytics.total_screened}
          </div>
          <div className="text-[11px] text-zinc-500 mt-1">Total in talent pool</div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs">
          <div className="flex items-center justify-between text-zinc-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Shortlisted</span>
            <Award className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
            {analytics.shortlisted_count}
          </div>
          <div className="text-[11px] text-zinc-500 mt-1">
            {analytics.total_screened > 0
              ? `${Math.round((analytics.shortlisted_count / analytics.total_screened) * 100)}% pass rate`
              : '0%'}
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs">
          <div className="flex items-center justify-between text-zinc-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Interviewing</span>
            <TrendingUp className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-2xl font-black text-blue-600 dark:text-blue-400">
            {analytics.interview_count}
          </div>
          <div className="text-[11px] text-zinc-500 mt-1">Active loops</div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs">
          <div className="flex items-center justify-between text-zinc-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Offers</span>
            <CheckCircle className="w-4 h-4 text-purple-500" />
          </div>
          <div className="text-2xl font-black text-purple-600 dark:text-purple-400">
            {analytics.offer_count}
          </div>
          <div className="text-[11px] text-zinc-500 mt-1">Offers extended</div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs">
          <div className="flex items-center justify-between text-zinc-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Avg ATS Score</span>
            <BarChart2 className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-black text-zinc-900 dark:text-zinc-100">
            {analytics.avg_ats_score}%
          </div>
          <div className="text-[11px] text-zinc-500 mt-1">Pool average</div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs">
          <div className="flex items-center justify-between text-zinc-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Velocity</span>
            <Clock className="w-4 h-4 text-teal-500" />
          </div>
          <div className="text-2xl font-black text-teal-600 dark:text-teal-400">
            {analytics.hiring_velocity_days}d
          </div>
          <div className="text-[11px] text-zinc-500 mt-1">Time to shortlist</div>
        </div>
      </div>

      {/* Main Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Pipeline Funnel Progression */}
        <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                <Layers className="w-4 h-4 text-indigo-500" />
                Pipeline Conversion Funnel
              </h3>
              <p className="text-xs text-zinc-500 mt-0.5">
                Conversion velocity through hiring stages for {selectedJobTitle || 'all active positions'}
              </p>
            </div>
          </div>

          <div className="space-y-4 pt-2">
            {analytics.stage_funnel?.map((step, idx) => (
              <div key={idx} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                    {step.stage}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-zinc-900 dark:text-zinc-100">
                      {step.count} candidates
                    </span>
                    <span className="text-zinc-400 text-[11px]">({step.percentage}%)</span>
                  </div>
                </div>
                <div className="h-3 w-full bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-700 bg-gradient-to-r from-indigo-500 to-purple-600"
                    style={{ width: `${step.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ATS Score Distribution Curve */}
        <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                <BarChart2 className="w-4 h-4 text-emerald-500" />
                ATS Compatibility Distribution
              </h3>
              <p className="text-xs text-zinc-500 mt-0.5">
                Density curve of applicant qualification bands across the applicant pool
              </p>
            </div>
          </div>

          <div className="space-y-4 pt-2">
            {analytics.score_distribution?.map((dist, idx) => (
              <div key={idx} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                    Score Band {dist.range}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-zinc-900 dark:text-zinc-100">
                      {dist.count} candidates
                    </span>
                    <span className="text-zinc-400 text-[11px]">({dist.percentage}%)</span>
                  </div>
                </div>
                <div className="h-3 w-full bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ${
                      dist.range === '90-100%'
                        ? 'bg-emerald-500'
                        : dist.range === '80-89%'
                        ? 'bg-indigo-500'
                        : dist.range === '70-79%'
                        ? 'bg-amber-500'
                        : 'bg-rose-500'
                    }`}
                    style={{ width: `${dist.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Talent Pool Gaps Heatmap & Hiring Decisions Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Pool-Wide Skill Gap Frequency Heatmap (2 Cols) */}
        <div className="lg:col-span-2 p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                Talent Pool Skill Gap Heatmap
              </h3>
              <p className="text-xs text-zinc-500 mt-0.5">
                Most frequent missing skills across applicants. Identifies market talent scarcity.
              </p>
            </div>
          </div>

          <div className="space-y-3 pt-2">
            {analytics.top_pool_skill_gaps?.map((gap, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/80 dark:border-zinc-700/60 flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-lg bg-zinc-200 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300 font-bold text-xs flex items-center justify-center">
                    {idx + 1}
                  </span>
                  <div>
                    <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                      {gap.skill}
                    </span>
                    <div className="text-[11px] text-zinc-500">
                      Missing in {gap.missing_in_candidates} candidate resumes
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <div className="w-28 h-2 bg-zinc-200 dark:bg-zinc-700 rounded-full overflow-hidden hidden sm:block">
                    <div
                      className="h-full bg-amber-500 rounded-full"
                      style={{ width: `${gap.pool_percentage}%` }}
                    />
                  </div>
                  <span className="text-xs font-extrabold px-2.5 py-1 rounded-md bg-amber-500/15 text-amber-700 dark:text-amber-300">
                    {gap.pool_percentage}% of pool
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Copilot Recommendation Breakdown (1 Col) */}
        <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2 mb-1">
              <BrainCircuit className="w-4 h-4 text-purple-500" />
              AI Hiring Verdict Mix
            </h3>
            <p className="text-xs text-zinc-500 mb-4">
              Distribution of automated recruiter verdicts across candidates
            </p>

            <div className="space-y-2.5">
              {Object.entries(analytics.decision_breakdown || {}).map(([verdict, count]) => {
                const total = analytics.total_screened || 1;
                const pct = Math.round((count / total) * 100);

                const getColors = (v: string) => {
                  if (v === 'Strong Yes') return 'text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/30';
                  if (v === 'Yes') return 'text-blue-600 dark:text-blue-400 bg-blue-500/10 border-blue-500/30';
                  if (v === 'Leaning Yes') return 'text-amber-600 dark:text-amber-400 bg-amber-500/10 border-amber-500/30';
                  if (v === 'Leaning No') return 'text-orange-600 dark:text-orange-400 bg-orange-500/10 border-orange-500/30';
                  return 'text-rose-600 dark:text-rose-400 bg-rose-500/10 border-rose-500/30';
                };

                return (
                  <div
                    key={verdict}
                    className={`p-3 rounded-xl border flex items-center justify-between ${getColors(
                      verdict
                    )}`}
                  >
                    <span className="text-xs font-bold">{verdict}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-extrabold">{count}</span>
                      <span className="text-[10px] opacity-75">({pct}%)</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-zinc-200 dark:border-zinc-800 text-center">
            <span className="text-[11px] font-semibold text-zinc-400">
              Deterministic calibration based on ATS scoring & role benchmarks
            </span>
          </div>
        </div>

      </div>
    </div>
  );
};
