'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { ScoreBadge } from '@/components/ui/ScoreBadge';
import {
  FileCheck2,
  Download,
  ExternalLink,
  Clock,
  Sparkles,
  Building,
  Briefcase,
} from 'lucide-react';
import { api } from '@/lib/api';
import { Analysis } from '@/types';
import { DEMO_ANALYSIS } from '@/lib/demoData';
import { formatDate } from '@/lib/utils';

export default function ReportsPage() {
  const [analyses, setAnalyses] = useState<Analysis[]>([DEMO_ANALYSIS]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadReports() {
      try {
        const list = await api.getAllAnalyses();
        setAnalyses(list.length > 0 ? list : [DEMO_ANALYSIS]);
      } catch {
        setAnalyses([DEMO_ANALYSIS]);
      } finally {
        setLoading(false);
      }
    }
    loadReports();
  }, []);

  const handleDownload = (id: string) => {
    const url = api.getReportPdfUrl(id);
    window.open(url, '_blank');
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-zinc-200 dark:border-zinc-800">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              <FileCheck2 className="w-5 h-5 text-indigo-500" />
              <span>ATS Audit Reports</span>
            </h1>
            <p className="text-xs text-zinc-500 mt-1">
              Download and share professional executive PDF audit reports for each application.
            </p>
          </div>

          <Link
            href="/analyze"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200 transition-all shadow-xs w-fit"
          >
            <Sparkles className="w-4 h-4 text-indigo-400 dark:text-indigo-600" />
            <span>Generate New Audit</span>
          </Link>
        </div>

        {/* Reports Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {analyses.map((report) => (
            <div
              key={report.id}
              className="p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs space-y-4 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                      Official ATS Evaluation
                    </span>
                    <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                      {report.job_title || 'Senior Software Engineer'}
                    </h3>
                    <div className="flex items-center gap-2 text-xs text-zinc-500">
                      <Building className="w-3.5 h-3.5" />
                      <span>{report.company_name || 'Stripe'}</span>
                      <span>•</span>
                      <span>{report.resume_title || 'Resume.pdf'}</span>
                    </div>
                  </div>

                  <ScoreBadge score={report.overall_ats_score} label={`${Math.round(report.overall_ats_score)}/100`} />
                </div>

                <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-100 dark:border-zinc-800 mt-4 text-xs text-zinc-600 dark:text-zinc-400 line-clamp-2">
                  {report.summary}
                </div>

                <div className="grid grid-cols-3 gap-2 mt-4 text-center">
                  <div className="p-2 rounded-lg bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-100 dark:border-zinc-800">
                    <span className="text-[10px] text-zinc-400 block">Job Match</span>
                    <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                      {Math.round(report.job_match_score)}%
                    </span>
                  </div>
                  <div className="p-2 rounded-lg bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-100 dark:border-zinc-800">
                    <span className="text-[10px] text-zinc-400 block">Keywords</span>
                    <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                      {Math.round(report.keyword_match_score)}%
                    </span>
                  </div>
                  <div className="p-2 rounded-lg bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-100 dark:border-zinc-800">
                    <span className="text-[10px] text-zinc-400 block">Quality</span>
                    <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                      {Math.round(report.quality_score)}%
                    </span>
                  </div>
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
                <span className="text-[11px] text-zinc-400 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  {formatDate(report.created_at)}
                </span>

                <div className="flex items-center gap-2">
                  <Link
                    href={`/analysis/${report.id}`}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200 hover:bg-zinc-50 transition-colors flex items-center gap-1"
                  >
                    <span>View Interactive</span>
                    <ExternalLink className="w-3 h-3" />
                  </Link>
                  <button
                    onClick={() => handleDownload(report.id)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 hover:opacity-90 transition-opacity shadow-xs"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download PDF</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
