'use client';

import React from 'react';
import {
  BarChart3,
  Download,
  FileSpreadsheet,
  FileText,
  TrendingUp,
  CheckCircle2,
  AlertTriangle,
  Award,
  Layers,
  Sparkles,
} from 'lucide-react';
import { CandidateRankingItem, RecruiterJob } from '@/types';
import { api } from '@/lib/api';

interface ReportsViewProps {
  candidates: CandidateRankingItem[];
  jobs: RecruiterJob[];
  selectedJobId: string;
}

export const ReportsView: React.FC<ReportsViewProps> = ({
  candidates,
  jobs,
  selectedJobId,
}) => {
  // Score Brackets
  const topTier = candidates.filter((c) => c.ats_score >= 85);
  const strongFit = candidates.filter((c) => c.ats_score >= 75 && c.ats_score < 85);
  const reviewRecommended = candidates.filter((c) => c.ats_score >= 65 && c.ats_score < 75);
  const belowThreshold = candidates.filter((c) => c.ats_score < 65);

  const total = candidates.length || 1;

  // Most common verified skills
  const verifiedMap: Record<string, number> = {};
  const missingMap: Record<string, number> = {};

  candidates.forEach((c) => {
    c.verified_skills?.forEach((s) => {
      verifiedMap[s] = (verifiedMap[s] || 0) + 1;
    });
    c.missing_skills?.forEach((s) => {
      missingMap[s] = (missingMap[s] || 0) + 1;
    });
  });

  const topVerified = Object.entries(verifiedMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  const topMissing = Object.entries(missingMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  const handleExportCsv = () => {
    const url = api.getExportCandidatesCsvUrl(selectedJobId || undefined);
    window.open(url, '_blank');
  };

  const handleExportPdf = () => {
    const url = api.getExportCandidatesPdfUrl(selectedJobId || undefined);
    window.open(url, '_blank');
  };

  return (
    <div className="space-y-6">
      {/* View Header */}
      <div className="p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                Talent Intelligence
              </span>
              <span className="text-xs text-zinc-500 font-medium">Screening Analytics</span>
            </div>
            <h2 className="text-xl font-extrabold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-purple-600" />
              <span>Recruiter Screening Reports & Analytics</span>
            </h2>
            <p className="text-xs text-zinc-600 dark:text-zinc-400">
              Distribution of applicant scores, common competency strengths, missing skill frequencies, and download export center.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={handleExportCsv}
              className="px-3.5 py-2 rounded-xl text-xs font-bold text-zinc-700 dark:text-zinc-200 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 border border-zinc-200 dark:border-zinc-700 transition-colors flex items-center gap-2 shadow-xs"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
              <span>Export CSV</span>
            </button>
            <button
              onClick={handleExportPdf}
              className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 transition-colors flex items-center gap-2 shadow-xs"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Export Executive PDF</span>
            </button>
          </div>
        </div>
      </div>

      {/* Score Distribution Brackets */}
      <div className="p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-purple-600" />
          <span>ATS Score Distribution & Applicant Quality</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl border border-emerald-200 dark:border-emerald-900/40 bg-emerald-50/40 dark:bg-emerald-950/20 space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-emerald-800 dark:text-emerald-300">
              <span>Top Tier (85 - 100)</span>
              <Award className="w-4 h-4" />
            </div>
            <div className="text-2xl font-black text-emerald-700 dark:text-emerald-400">
              {topTier.length}{' '}
              <span className="text-xs text-zinc-500 font-normal">
                ({((topTier.length / total) * 100).toFixed(0)}%)
              </span>
            </div>
            <p className="text-[11px] text-zinc-500">Immediate technical screen recommended</p>
          </div>

          <div className="p-4 rounded-xl border border-blue-200 dark:border-blue-900/40 bg-blue-50/40 dark:bg-blue-950/20 space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-blue-800 dark:text-blue-300">
              <span>Strong Fit (75 - 84)</span>
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div className="text-2xl font-black text-blue-700 dark:text-blue-400">
              {strongFit.length}{' '}
              <span className="text-xs text-zinc-500 font-normal">
                ({((strongFit.length / total) * 100).toFixed(0)}%)
              </span>
            </div>
            <p className="text-[11px] text-zinc-500">Solid technical competency overlap</p>
          </div>

          <div className="p-4 rounded-xl border border-amber-200 dark:border-amber-900/40 bg-amber-50/40 dark:bg-amber-950/20 space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-amber-800 dark:text-amber-300">
              <span>Review (65 - 74)</span>
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div className="text-2xl font-black text-amber-700 dark:text-amber-400">
              {reviewRecommended.length}{' '}
              <span className="text-xs text-zinc-500 font-normal">
                ({((reviewRecommended.length / total) * 100).toFixed(0)}%)
              </span>
            </div>
            <p className="text-[11px] text-zinc-500">Noticeable gaps in secondary skills</p>
          </div>

          <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/40 space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-zinc-600 dark:text-zinc-400">
              <span>Below Bar (&lt; 65)</span>
              <Layers className="w-4 h-4" />
            </div>
            <div className="text-2xl font-black text-zinc-700 dark:text-zinc-300">
              {belowThreshold.length}{' '}
              <span className="text-xs text-zinc-500 font-normal">
                ({((belowThreshold.length / total) * 100).toFixed(0)}%)
              </span>
            </div>
            <p className="text-[11px] text-zinc-500">Weak semantic match with job description</p>
          </div>
        </div>
      </div>

      {/* Skills Matrix */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Top Verified Skills */}
        <div className="p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Most Frequent Verified Skills</span>
          </h3>
          <div className="space-y-3">
            {topVerified.map(([skill, count]) => (
              <div key={skill} className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="font-semibold text-zinc-800 dark:text-zinc-200">{skill}</span>
                  <span className="text-zinc-500 font-mono">
                    {count} applicants ({((count / total) * 100).toFixed(0)}%)
                  </span>
                </div>
                <div className="h-2 w-full bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 rounded-full"
                    style={{ width: `${(count / total) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Most Frequent Missing Skills */}
        <div className="p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-500" />
            <span>Most Frequent Skill Gaps</span>
          </h3>
          <div className="space-y-3">
            {topMissing.map(([skill, count]) => (
              <div key={skill} className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="font-semibold text-zinc-800 dark:text-zinc-200">{skill}</span>
                  <span className="text-zinc-500 font-mono">
                    {count} applicants ({((count / total) * 100).toFixed(0)}%)
                  </span>
                </div>
                <div className="h-2 w-full bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-red-500 rounded-full"
                    style={{ width: `${(count / total) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Export Center Card */}
      <div className="p-6 rounded-2xl border border-purple-200 dark:border-purple-900/50 bg-gradient-to-r from-purple-50/50 via-zinc-50/50 to-white dark:from-purple-950/20 dark:via-zinc-900 dark:to-zinc-900 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
            Export Complete Candidate Leaderboard
          </h3>
          <p className="text-xs text-zinc-600 dark:text-zinc-400">
            Generate executive-ready CSV spreadsheets or formal PDF reports formatted with candidate ranks, ATS ratings, and AI screening notes.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleExportCsv}
            className="px-4 py-2 text-xs font-bold rounded-xl bg-white dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-700 hover:border-purple-400 transition-colors shadow-xs flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download CSV</span>
          </button>
          <button
            onClick={handleExportPdf}
            className="px-4 py-2 text-xs font-bold rounded-xl bg-purple-600 hover:bg-purple-700 text-white transition-colors shadow-xs flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download PDF</span>
          </button>
        </div>
      </div>
    </div>
  );
};
