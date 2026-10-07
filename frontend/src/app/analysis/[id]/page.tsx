'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { CircularScore } from '@/components/ui/CircularScore';
import { ScoreBadge } from '@/components/ui/ScoreBadge';
import { KeywordChip } from '@/components/ui/KeywordChip';
import { SkillBar } from '@/components/ui/SkillBar';
import { AuditFindingCard } from '@/components/analysis/AuditFindingCard';
import {
  FileText,
  Briefcase,
  Building,
  Download,
  PenTool,
  Mail,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  Layers,
  ChevronDown,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import { api } from '@/lib/api';
import { Analysis } from '@/types';
import { DEMO_ANALYSIS } from '@/lib/demoData';
import { formatDate } from '@/lib/utils';

function AnalysisContent() {
  const params = useParams();
  const router = useRouter();
  const analysisId = (params?.id as string) || 'demo-analysis-alex-stripe';

  const [analysis, setAnalysis] = useState<Analysis>(DEMO_ANALYSIS);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'keywords' | 'skills' | 'audit' | 'sections'>('overview');

  useEffect(() => {
    async function loadAnalysis() {
      try {
        if (analysisId === 'demo' || analysisId === 'sample') {
          const sample = await api.getSampleAnalysis();
          setAnalysis(sample);
        } else {
          const data = await api.getAnalysis(analysisId);
          setAnalysis(data);
        }
      } catch (err) {
        setAnalysis(DEMO_ANALYSIS);
      } finally {
        setLoading(false);
      }
    }
    loadAnalysis();
  }, [analysisId]);

  const handleDownloadPDF = () => {
    const url = api.getReportPdfUrl(analysis.id);
    window.open(url, '_blank');
  };

  const criticalKeywords = analysis.keywords.filter((k) => k.category === 'Critical Missing');
  const recommendedKeywords = analysis.keywords.filter((k) => k.category === 'Recommended');
  const foundKeywords = analysis.keywords.filter((k) => k.category === 'Already Found' || k.status === 'found');

  return (
    <DashboardLayout>
      <div className="space-y-8 max-w-6xl mx-auto">
        {/* Top Header Card */}
        <div className="p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>ATS Audit Verified</span>
            </div>

            <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              <span>{analysis.job_title || 'Senior Software Engineer'}</span>
              <span className="text-zinc-400 font-normal">at</span>
              <span className="text-indigo-600 dark:text-indigo-400">{analysis.company_name || 'Stripe'}</span>
            </h1>

            <div className="flex flex-wrap items-center gap-4 text-xs text-zinc-500">
              <span className="flex items-center gap-1.5 font-medium text-zinc-700 dark:text-zinc-300">
                <FileText className="w-3.5 h-3.5 text-zinc-400" />
                {analysis.resume_title || 'Resume.pdf'}
              </span>
              <span>•</span>
              <span>Scanned on {formatDate(analysis.created_at)}</span>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={handleDownloadPDF}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors shadow-xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download PDF Report</span>
            </button>

            <Link
              href="/editor"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200 transition-colors shadow-xs"
            >
              <PenTool className="w-3.5 h-3.5 text-indigo-400 dark:text-indigo-600" />
              <span>Edit in Bullet Improver</span>
            </Link>

            <Link
              href="/cover-letter"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold border border-indigo-200 dark:border-indigo-800 bg-indigo-50/50 dark:bg-indigo-950/30 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 transition-colors"
            >
              <Mail className="w-3.5 h-3.5" />
              <span>Generate Cover Letter</span>
            </Link>
          </div>
        </div>

        {/* 4 Major Score Cards with Radial Gauges */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs flex flex-col items-center text-center">
            <CircularScore
              score={analysis.overall_ats_score}
              label="ATS Score"
              sublabel="Compatibility with ATS scanners"
              size={130}
              strokeWidth={9}
            />
          </div>

          <div className="p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs flex flex-col items-center text-center">
            <CircularScore
              score={analysis.job_match_score}
              label="Job Match"
              sublabel="Semantic role alignment"
              size={130}
              strokeWidth={9}
            />
          </div>

          <div className="p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs flex flex-col items-center text-center">
            <CircularScore
              score={analysis.keyword_match_score}
              label="Keyword Match"
              sublabel="Found vs required terms"
              size={130}
              strokeWidth={9}
            />
          </div>

          <div className="p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs flex flex-col items-center text-center">
            <CircularScore
              score={analysis.quality_score}
              label="Resume Quality"
              sublabel="Action verbs & quantified metrics"
              size={130}
              strokeWidth={9}
            />
          </div>
        </div>

        {/* Executive Summary Callout */}
        {analysis.summary && (
          <div className="p-5 rounded-2xl border border-indigo-100 dark:border-indigo-950/60 bg-gradient-to-r from-indigo-50/60 via-zinc-50/60 to-white dark:from-indigo-950/20 dark:via-zinc-900/60 dark:to-zinc-900 shadow-xs">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-xl bg-indigo-600 text-white shrink-0 mt-0.5">
                <Sparkles className="w-4 h-4" />
              </div>
              <div className="space-y-1">
                <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-700 dark:text-indigo-400">
                  Executive Assessment
                </h3>
                <p className="text-xs text-zinc-700 dark:text-zinc-300 leading-relaxed font-medium">
                  {analysis.summary}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Section View Tabs */}
        <div className="flex items-center gap-2 border-b border-zinc-200 dark:border-zinc-800 overflow-x-auto pb-1 text-xs font-semibold">
          {[
            { id: 'overview', label: 'Score Breakdown' },
            { id: 'keywords', label: `Keywords (${analysis.keywords.length})` },
            { id: 'skills', label: `Skill Gap Analysis (${analysis.skills.length})` },
            { id: 'audit', label: `Formatting Audit (${analysis.issues.length})` },
            { id: 'sections', label: 'Section Analysis' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2.5 rounded-lg whitespace-nowrap transition-all ${
                activeTab === tab.id
                  ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 font-bold'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab 1: Detailed Score Breakdown */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {analysis.scores.map((sc, idx) => (
                <div
                  key={idx}
                  className="p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                      {sc.category}
                    </span>
                    <ScoreBadge score={sc.score} label={`${Math.round(sc.score)}% • ${sc.status}`} />
                  </div>
                  <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                    {sc.explanation}
                  </p>
                </div>
              ))}
            </div>

            {/* Recommendations */}
            <div className="p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs space-y-4">
              <div className="flex items-center gap-2">
                <Lightbulb className="w-5 h-5 text-amber-500" />
                <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                  Prioritized Action Items
                </h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {analysis.recommendations.map((rec, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-xl border border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/30 space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                        {rec.section}
                      </span>
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300">
                        {rec.priority} Priority
                      </span>
                    </div>
                    <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                      {rec.title}
                    </h4>
                    <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                      {rec.action_item}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Categorized Missing Keywords */}
        {activeTab === 'keywords' && (
          <div className="space-y-6">
            {/* Critical Missing */}
            <div className="p-6 rounded-2xl border border-rose-200 dark:border-rose-900/40 bg-white dark:bg-zinc-900 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-rose-600 dark:text-rose-400 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-rose-500" />
                    <span>Critical Missing Keywords ({criticalKeywords.length})</span>
                  </h3>
                  <p className="text-xs text-zinc-500">
                    High-importance terms explicitly stressed in the job requirements.
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 pt-2">
                {criticalKeywords.length > 0 ? (
                  criticalKeywords.map((kw, idx) => (
                    <KeywordChip key={idx} keyword={kw} onClickSection={(s) => router.push('/editor')} />
                  ))
                ) : (
                  <span className="text-xs text-emerald-600 font-medium">None! All critical keywords detected in your resume.</span>
                )}
              </div>
            </div>

            {/* Recommended Additions */}
            <div className="p-6 rounded-2xl border border-amber-200 dark:border-amber-900/40 bg-white dark:bg-zinc-900 shadow-xs space-y-3">
              <div>
                <h3 className="text-sm font-bold text-amber-600 dark:text-amber-400 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-amber-500" />
                  <span>Recommended Additions ({recommendedKeywords.length})</span>
                </h3>
                <p className="text-xs text-zinc-500">
                  Secondary skills and tooling that elevate match ranking beyond the median.
                </p>
              </div>
              <div className="flex flex-wrap gap-2 pt-2">
                {recommendedKeywords.map((kw, idx) => (
                  <KeywordChip key={idx} keyword={kw} onClickSection={(s) => router.push('/editor')} />
                ))}
              </div>
            </div>

            {/* Already Found */}
            <div className="p-6 rounded-2xl border border-emerald-200 dark:border-emerald-900/40 bg-white dark:bg-zinc-900 shadow-xs space-y-3">
              <div>
                <h3 className="text-sm font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span>Already Found in Resume ({foundKeywords.length})</span>
                </h3>
                <p className="text-xs text-zinc-500">
                  Successfully parsed by ATS algorithm with exact match or normalized alias.
                </p>
              </div>
              <div className="flex flex-wrap gap-2 pt-2">
                {foundKeywords.map((kw, idx) => (
                  <KeywordChip key={idx} keyword={kw} />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Skill Gap Analysis */}
        {activeTab === 'skills' && (
          <div className="p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs space-y-4">
            <div>
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                Required Skills vs Resume Coverage
              </h3>
              <p className="text-xs text-zinc-500">
                Horizontal comparison bars highlighting candidate coverage against Recruiter Priorities.
              </p>
            </div>

            <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {analysis.skills.map((skill, idx) => (
                <SkillBar key={idx} skill={skill} />
              ))}
            </div>
          </div>
        )}

        {/* Tab 4: ATS Formatting Audit */}
        {activeTab === 'audit' && (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-600 dark:text-zinc-400">
              ATS parsers flatten multi-column layouts and discard graphics. Below is the structural compliance audit of your uploaded resume.
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {analysis.issues.map((issue, idx) => (
                <AuditFindingCard key={idx} issue={issue} />
              ))}
            </div>
          </div>
        )}

        {/* Tab 5: Resume Section Analysis */}
        {activeTab === 'sections' && (
          <div className="space-y-6">
            {(analysis.sections_analysis || []).map((sec, idx) => (
              <div
                key={idx}
                className="p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs space-y-4"
              >
                <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800">
                  <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                    {sec.section_name} Section
                  </h3>
                  <ScoreBadge score={sec.score} label={`${Math.round(sec.score)}/100`} />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                  {/* Strengths */}
                  <div className="space-y-2">
                    <span className="font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider text-[10px]">
                      Strengths
                    </span>
                    <ul className="space-y-1.5 text-zinc-700 dark:text-zinc-300">
                      {sec.strengths.map((str, sIdx) => (
                        <li key={sIdx} className="flex items-start gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                          <span>{str}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Issues */}
                  <div className="space-y-2">
                    <span className="font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wider text-[10px]">
                      Issues
                    </span>
                    <ul className="space-y-1.5 text-zinc-700 dark:text-zinc-300">
                      {sec.issues.map((iss, iIdx) => (
                        <li key={iIdx} className="flex items-start gap-1.5">
                          <AlertTriangle className="w-3.5 h-3.5 text-rose-500 shrink-0 mt-0.5" />
                          <span>{iss}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Recommendations */}
                  <div className="space-y-2">
                    <span className="font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider text-[10px]">
                      Recommendations
                    </span>
                    <ul className="space-y-1.5 text-zinc-700 dark:text-zinc-300">
                      {sec.recommendations.map((rec, rIdx) => (
                        <li key={rIdx} className="flex items-start gap-1.5">
                          <Lightbulb className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                          <span>{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

export default function AnalysisResultsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-950 text-xs text-zinc-500">
        Loading ATS Audit Analysis...
      </div>
    }>
      <AnalysisContent />
    </Suspense>
  );
}
