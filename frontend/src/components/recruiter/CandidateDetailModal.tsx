'use client';

import React, { useState } from 'react';
import {
  X,
  User,
  Mail,
  Phone,
  GraduationCap,
  Briefcase,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  FileText,
  Sparkles,
  Download,
  Share2,
  ThumbsUp,
  ThumbsDown,
  Layers,
  Award,
} from 'lucide-react';
import { CandidateDetail } from '@/types';

interface CandidateDetailModalProps {
  candidate: CandidateDetail | null;
  isOpen: boolean;
  onClose: () => void;
  onExportPdf?: () => void;
}

export const CandidateDetailModal: React.FC<CandidateDetailModalProps> = ({
  candidate,
  isOpen,
  onClose,
  onExportPdf,
}) => {
  const [activeResumeTab, setActiveResumeTab] = useState<'structured' | 'raw'>('structured');

  if (!isOpen || !candidate) return null;

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-emerald-600 dark:text-emerald-400 border-emerald-500/30 bg-emerald-50 dark:bg-emerald-950/30';
    if (score >= 70) return 'text-blue-600 dark:text-blue-400 border-blue-500/30 bg-blue-50 dark:bg-blue-950/30';
    return 'text-amber-600 dark:text-amber-400 border-amber-500/30 bg-amber-50 dark:bg-amber-950/30';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-xs">
      <div className="relative w-full max-w-4xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl overflow-hidden max-h-[92vh] flex flex-col">
        {/* Header Bar */}
        <div className="px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between bg-zinc-50/80 dark:bg-zinc-900/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-600/10 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold text-sm">
              <User className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-extrabold text-zinc-900 dark:text-zinc-100">
                  {candidate.candidate_name}
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                  Candidate Detail
                </span>
              </div>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 flex items-center gap-2 mt-0.5">
                <span>{candidate.job_title}</span>
                <span>•</span>
                <span className="font-semibold">{candidate.company}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onExportPdf && (
              <button
                onClick={onExportPdf}
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-zinc-700 dark:text-zinc-200 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 hover:border-purple-400 rounded-xl transition-colors shadow-xs"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export PDF</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 rounded-xl transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Scroll Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Quick Contact & Education Strip */}
          <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-800 flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-4 text-xs text-zinc-600 dark:text-zinc-400">
              <div className="flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-zinc-400" />
                <span className="font-medium text-zinc-900 dark:text-zinc-200">{candidate.email}</span>
              </div>
              {candidate.phone && (
                <div className="flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-zinc-400" />
                  <span>{candidate.phone}</span>
                </div>
              )}
              {candidate.education && (
                <div className="flex items-center gap-1.5">
                  <GraduationCap className="w-3.5 h-3.5 text-purple-500" />
                  <span className="font-medium text-zinc-800 dark:text-zinc-200">{candidate.education}</span>
                </div>
              )}
            </div>

            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-semibold text-zinc-500">Screened:</span>
              <span className="text-[11px] font-mono text-zinc-700 dark:text-zinc-300">
                {new Date(candidate.created_at).toLocaleDateString()}
              </span>
            </div>
          </div>

          {/* KPI Score Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 shadow-xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                ATS Compatibility
              </span>
              <div className="mt-1 flex items-baseline gap-1">
                <span className="text-2xl font-black text-purple-600 dark:text-purple-400">
                  {candidate.ats_score.toFixed(1)}
                </span>
                <span className="text-xs text-zinc-400 font-semibold">/100</span>
              </div>
              <div className="mt-1.5 h-1.5 w-full bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-purple-500 rounded-full"
                  style={{ width: `${Math.min(candidate.ats_score, 100)}%` }}
                />
              </div>
            </div>

            <div className="p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 shadow-xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                Job Match Score
              </span>
              <div className="mt-1 flex items-baseline gap-1">
                <span className="text-2xl font-black text-indigo-600 dark:text-indigo-400">
                  {candidate.match_score.toFixed(1)}%
                </span>
              </div>
              <div className="mt-1.5 h-1.5 w-full bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-indigo-500 rounded-full"
                  style={{ width: `${Math.min(candidate.match_score, 100)}%` }}
                />
              </div>
            </div>

            <div className="p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 shadow-xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                Skill Match
              </span>
              <div className="mt-1 flex items-baseline gap-1">
                <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
                  {candidate.skill_match.toFixed(1)}%
                </span>
              </div>
              <div className="mt-1.5 h-1.5 w-full bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-500 rounded-full"
                  style={{ width: `${Math.min(candidate.skill_match, 100)}%` }}
                />
              </div>
            </div>

            <div className="p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 shadow-xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                Experience Match
              </span>
              <div className="mt-1 flex items-baseline gap-1">
                <span className="text-2xl font-black text-blue-600 dark:text-blue-400">
                  {candidate.experience_match.toFixed(1)}%
                </span>
              </div>
              <div className="mt-1.5 h-1.5 w-full bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-500 rounded-full"
                  style={{ width: `${Math.min(candidate.experience_match, 100)}%` }}
                />
              </div>
            </div>
          </div>

          {/* AI Screening Summary (Strengths & Concerns) */}
          <div className="p-5 rounded-2xl border border-purple-200 dark:border-purple-900/50 bg-gradient-to-br from-purple-50/40 via-white to-indigo-50/20 dark:from-purple-950/20 dark:via-zinc-900 dark:to-indigo-950/10 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1 rounded-lg bg-purple-600 text-white">
                  <Sparkles className="w-3.5 h-3.5" />
                </div>
                <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                  AI Screening Summary
                </h3>
              </div>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-100 dark:bg-purple-900/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                Deterministic Fit Analysis
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Strengths */}
              <div className="p-4 rounded-xl bg-white dark:bg-zinc-900 border border-emerald-200 dark:border-emerald-900/40 space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 dark:text-emerald-400">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Strengths</span>
                </div>
                <ul className="space-y-1.5">
                  {candidate.strengths && candidate.strengths.length > 0 ? (
                    candidate.strengths.map((str, idx) => (
                      <li key={idx} className="text-xs text-zinc-700 dark:text-zinc-300 flex items-start gap-2">
                        <span className="text-emerald-500 font-bold">•</span>
                        <span>{str}</span>
                      </li>
                    ))
                  ) : (
                    <li className="text-xs text-zinc-400">Strong technical alignment observed.</li>
                  )}
                </ul>
              </div>

              {/* Concerns */}
              <div className="p-4 rounded-xl bg-white dark:bg-zinc-900 border border-amber-200 dark:border-amber-900/40 space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-amber-700 dark:text-amber-400">
                  <AlertTriangle className="w-4 h-4" />
                  <span>Concerns & Skill Gaps</span>
                </div>
                <ul className="space-y-1.5">
                  {candidate.concerns && candidate.concerns.length > 0 ? (
                    candidate.concerns.map((con, idx) => (
                      <li key={idx} className="text-xs text-zinc-700 dark:text-zinc-300 flex items-start gap-2">
                        <span className="text-amber-500 font-bold">•</span>
                        <span>{con}</span>
                      </li>
                    ))
                  ) : (
                    <li className="text-xs text-zinc-400">No critical disqualifying concerns detected.</li>
                  )}
                </ul>
              </div>
            </div>
          </div>

          {/* Match Explanation */}
          <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/60 dark:bg-zinc-900/40 space-y-1.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-500">
              Role Match Explanation
            </h4>
            <p className="text-xs text-zinc-700 dark:text-zinc-300 leading-relaxed font-sans">
              {candidate.match_explanation}
            </p>
          </div>

          {/* Skills Breakdown: Verified vs Missing */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-500">
              Technical Competency Matrix
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Verified Skills */}
              <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Verified Skills ({candidate.verified_skills?.length || 0})</span>
                  </span>
                  <span className="text-[10px] text-zinc-400">Present in Resume</span>
                </div>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {candidate.verified_skills && candidate.verified_skills.length > 0 ? (
                    candidate.verified_skills.map((skill, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800"
                      >
                        ✓ {skill}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-zinc-400">None detected</span>
                  )}
                </div>
              </div>

              {/* Missing Skills */}
              <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-red-600 dark:text-red-400 flex items-center gap-1.5">
                    <XCircle className="w-3.5 h-3.5" />
                    <span>Missing Skills ({candidate.missing_skills?.length || 0})</span>
                  </span>
                  <span className="text-[10px] text-zinc-400">Required by Role</span>
                </div>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {candidate.missing_skills && candidate.missing_skills.length > 0 ? (
                    candidate.missing_skills.map((skill, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-red-50 dark:bg-red-950/60 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800"
                      >
                        ✗ {skill}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-emerald-600 dark:text-emerald-400">
                      Zero skill gaps detected! Full coverage.
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Resume Viewer */}
          <div className="border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden bg-white dark:bg-zinc-900">
            <div className="px-4 py-3 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between bg-zinc-50 dark:bg-zinc-900/80">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-purple-600" />
                <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                  Applicant Resume Viewer
                </span>
              </div>
              <div className="flex items-center bg-zinc-200 dark:bg-zinc-800 p-0.5 rounded-lg text-xs">
                <button
                  onClick={() => setActiveResumeTab('structured')}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all ${
                    activeResumeTab === 'structured'
                      ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-xs'
                      : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100'
                  }`}
                >
                  Parsed Sections
                </button>
                <button
                  onClick={() => setActiveResumeTab('raw')}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all ${
                    activeResumeTab === 'raw'
                      ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-xs'
                      : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100'
                  }`}
                >
                  Raw Text
                </button>
              </div>
            </div>

            <div className="p-4 max-h-80 overflow-y-auto">
              {activeResumeTab === 'structured' ? (
                <div className="space-y-4 text-xs">
                  {candidate.parsed_sections?.summary && (
                    <div className="p-3 rounded-lg bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-800">
                      <span className="font-bold text-zinc-700 dark:text-zinc-300 block mb-1">
                        Professional Summary:
                      </span>
                      <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed font-sans">
                        {candidate.parsed_sections.summary}
                      </p>
                    </div>
                  )}

                  {candidate.parsed_sections?.skills && (
                    <div className="p-3 rounded-lg bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-800">
                      <span className="font-bold text-zinc-700 dark:text-zinc-300 block mb-1">
                        Technical Skills:
                      </span>
                      <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed font-sans">
                        {candidate.parsed_sections.skills}
                      </p>
                    </div>
                  )}

                  {candidate.parsed_sections?.experience && (
                    <div className="p-3 rounded-lg bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-800">
                      <span className="font-bold text-zinc-700 dark:text-zinc-300 block mb-1">
                        Work Experience:
                      </span>
                      <pre className="text-zinc-600 dark:text-zinc-400 leading-relaxed whitespace-pre-wrap font-sans">
                        {candidate.parsed_sections.experience}
                      </pre>
                    </div>
                  )}

                  {candidate.parsed_sections?.education && (
                    <div className="p-3 rounded-lg bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-800">
                      <span className="font-bold text-zinc-700 dark:text-zinc-300 block mb-1">
                        Education & Credentials:
                      </span>
                      <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed font-sans">
                        {candidate.parsed_sections.education}
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <pre className="text-xs text-zinc-700 dark:text-zinc-300 font-mono whitespace-pre-wrap p-2 leading-relaxed bg-zinc-50 dark:bg-zinc-950 rounded-lg border border-zinc-200 dark:border-zinc-800">
                  {candidate.raw_resume || 'Raw resume text is not stored.'}
                </pre>
              )}
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div className="px-6 py-3.5 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between bg-zinc-50/50 dark:bg-zinc-900/50">
          <div className="flex items-center gap-2">
            <span className="text-xs text-zinc-500">Recruiter Quick Action:</span>
            <span className="text-xs font-bold text-purple-600 dark:text-purple-400">
              Shortlist for Technical Interview
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl transition-colors"
            >
              Close
            </button>
            {onExportPdf && (
              <button
                onClick={onExportPdf}
                className="px-4 py-2 text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download Report</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
