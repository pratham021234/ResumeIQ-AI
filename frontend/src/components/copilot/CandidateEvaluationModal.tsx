'use client';

import React, { useState } from 'react';
import {
  X,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  HelpCircle,
  Copy,
  Check,
  Star,
  BrainCircuit,
  MessageSquare,
  ShieldCheck,
  Briefcase,
  GraduationCap,
  Mail,
  Phone,
  RefreshCw,
  Save,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';
import { CopilotEvaluation } from '@/types';

interface CandidateEvaluationModalProps {
  evaluation: CopilotEvaluation | null;
  isOpen: boolean;
  onClose: () => void;
  onStageChange?: (newStage: string, notes?: string) => Promise<void>;
  onReevaluate?: (analysisId: string) => Promise<void>;
}

export const CandidateEvaluationModal: React.FC<CandidateEvaluationModalProps> = ({
  evaluation,
  isOpen,
  onClose,
  onStageChange,
  onReevaluate,
}) => {
  const [activeTab, setActiveTab] = useState<'summary' | 'skills' | 'questions' | 'notes'>('summary');
  const [copiedQuestionIdx, setCopiedQuestionIdx] = useState<number | null>(null);
  const [copiedSummary, setCopiedSummary] = useState(false);
  const [recruiterNotes, setRecruiterNotes] = useState(evaluation?.recruiter_notes || '');
  const [currentStage, setCurrentStage] = useState(evaluation?.stage || 'Screening');
  const [isSaving, setIsSaving] = useState(false);
  const [isReevaluating, setIsReevaluating] = useState(false);
  const [checkedRubricItems, setCheckedRubricItems] = useState<Record<string, boolean>>({});

  // Sync state if evaluation changes
  React.useEffect(() => {
    if (evaluation) {
      setRecruiterNotes(evaluation.recruiter_notes || '');
      setCurrentStage(evaluation.stage || 'Screening');
    }
  }, [evaluation]);

  if (!isOpen || !evaluation) return null;

  const getDecisionBadge = (decision: string) => {
    switch (decision) {
      case 'Strong Yes':
        return {
          bg: 'bg-emerald-500/15 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border-emerald-500/30',
          dot: 'bg-emerald-500',
        };
      case 'Yes':
        return {
          bg: 'bg-blue-500/15 dark:bg-blue-500/20 text-blue-700 dark:text-blue-300 border-blue-500/30',
          dot: 'bg-blue-500',
        };
      case 'Leaning Yes':
        return {
          bg: 'bg-amber-500/15 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300 border-amber-500/30',
          dot: 'bg-amber-500',
        };
      case 'Leaning No':
        return {
          bg: 'bg-orange-500/15 dark:bg-orange-500/20 text-orange-700 dark:text-orange-300 border-orange-500/30',
          dot: 'bg-orange-500',
        };
      default:
        return {
          bg: 'bg-rose-500/15 dark:bg-rose-500/20 text-rose-700 dark:text-rose-300 border-rose-500/30',
          dot: 'bg-rose-500',
        };
    }
  };

  const badgeStyle = getDecisionBadge(evaluation.hiring_decision);

  const handleCopySummary = () => {
    const text = `AI HIRING COPILOT EVALUATION BRIEF\nCandidate: ${evaluation.candidate_name}\nRole: ${evaluation.job_title} @ ${evaluation.company}\nVerdict: ${evaluation.hiring_decision} (${evaluation.confidence_score}% confidence)\nATS Score: ${evaluation.ats_score}% | Match Score: ${evaluation.match_score}%\n\nEXECUTIVE SUMMARY:\n${evaluation.executive_summary}\n\nDECISION REASONING:\n${evaluation.decision_reasoning}`;
    navigator.clipboard.writeText(text);
    setCopiedSummary(true);
    setTimeout(() => setCopiedSummary(false), 2000);
  };

  const handleCopyQuestion = (idx: number, q: any) => {
    const checkpoints: string[] = Array.isArray(q.what_to_listen_for)
      ? q.what_to_listen_for
      : typeof q.what_to_listen_for === 'string'
      ? [q.what_to_listen_for]
      : [];
    const text = `INTERVIEW QUESTION [${q.category}]\nQuestion: ${q.question}\nPurpose: ${q.purpose || q.rationale || 'Evaluate candidate competency'}\nWhat to Listen For:\n${checkpoints.map((i: string) => `- [ ] ${i}`).join('\n')}`;
    navigator.clipboard.writeText(text);
    setCopiedQuestionIdx(idx);
    setTimeout(() => setCopiedQuestionIdx(null), 2000);
  };

  const handleSaveNotesAndStage = async (stageOverride?: string) => {
    const stageToSave = stageOverride || currentStage;
    setIsSaving(true);
    try {
      if (onStageChange) {
        await onStageChange(stageToSave, recruiterNotes);
      }
      if (stageOverride) setCurrentStage(stageOverride);
    } finally {
      setIsSaving(false);
    }
  };

  const handleReevaluateClick = async () => {
    if (!onReevaluate) return;
    setIsReevaluating(true);
    try {
      await onReevaluate(evaluation.analysis_id);
    } finally {
      setIsReevaluating(false);
    }
  };

  const toggleRubricItem = (key: string) => {
    setCheckedRubricItems((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const stages = ['Screening', 'Shortlisted', 'Interview', 'Offer', 'Rejected'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-sm overflow-y-auto animate-fade-in">
      <div className="relative w-full max-w-5xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden">
        
        {/* Top Header */}
        <div className="px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/80 dark:bg-zinc-900/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg shadow-sm shrink-0">
              {evaluation.candidate_name.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h2 className="text-xl font-extrabold text-zinc-900 dark:text-zinc-100">
                  {evaluation.candidate_name}
                </h2>
                {/* Decision Badge */}
                <span
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border shadow-xs ${badgeStyle.bg}`}
                >
                  <span className={`w-2 h-2 rounded-full ${badgeStyle.dot}`} />
                  {evaluation.hiring_decision}
                </span>

                {/* Confidence Badge */}
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700">
                  {evaluation.confidence_score}% Confidence
                </span>

                {/* Rating Stars */}
                <div className="flex items-center gap-0.5 text-amber-400">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-3.5 h-3.5 ${
                        i < evaluation.rating ? 'fill-amber-400 text-amber-400' : 'text-zinc-300 dark:text-zinc-700'
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* Sub-info */}
              <div className="flex items-center gap-3 mt-1.5 text-xs text-zinc-500 dark:text-zinc-400 flex-wrap">
                <span className="flex items-center gap-1">
                  <Briefcase className="w-3.5 h-3.5 text-zinc-400" />
                  {evaluation.job_title} • {evaluation.company}
                </span>
                {evaluation.email && (
                  <span className="flex items-center gap-1">
                    <Mail className="w-3.5 h-3.5 text-zinc-400" />
                    {evaluation.email}
                  </span>
                )}
                {evaluation.education && (
                  <span className="flex items-center gap-1 hidden sm:flex">
                    <GraduationCap className="w-3.5 h-3.5 text-zinc-400" />
                    {evaluation.education}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Quick Metrics & Close */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="px-3 py-1.5 rounded-xl bg-zinc-100 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 text-center">
                <div className="text-[10px] uppercase font-bold text-zinc-400">ATS Score</div>
                <div className="text-sm font-extrabold text-emerald-600 dark:text-emerald-400">
                  {evaluation.ats_score}%
                </div>
              </div>
              <div className="px-3 py-1.5 rounded-xl bg-zinc-100 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 text-center">
                <div className="text-[10px] uppercase font-bold text-zinc-400">Role Match</div>
                <div className="text-sm font-extrabold text-indigo-600 dark:text-indigo-400">
                  {evaluation.match_score}%
                </div>
              </div>
            </div>

            <button
              onClick={handleCopySummary}
              className="p-2 text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              title="Copy Summary to Clipboard"
            >
              {copiedSummary ? <Check className="w-5 h-5 text-emerald-500" /> : <Copy className="w-5 h-5" />}
            </button>

            <button
              onClick={onClose}
              className="p-2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="px-6 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex items-center justify-between gap-4 overflow-x-auto">
          <div className="flex gap-2">
            {[
              { id: 'summary', label: 'Screening Summary & Insights', icon: BrainCircuit },
              { id: 'skills', label: 'Skill Gap Matrix', icon: ShieldCheck },
              { id: 'questions', label: 'Interview Rubric (4 Types)', icon: MessageSquare },
              { id: 'notes', label: 'Recruiter Decision & Notes', icon: CheckCircle2 },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 py-3 px-3 text-xs font-semibold border-b-2 transition-colors whitespace-nowrap ${
                    isActive
                      ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                      : 'border-transparent text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Quick Stage Progression */}
          <div className="hidden lg:flex items-center gap-1.5 py-2">
            <span className="text-[11px] font-semibold text-zinc-400 mr-1">Stage:</span>
            {stages.map((stg) => (
              <button
                key={stg}
                onClick={() => handleSaveNotesAndStage(stg)}
                disabled={isSaving}
                className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all ${
                  currentStage === stg
                    ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 shadow-xs'
                    : 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700'
                }`}
              >
                {stg}
              </button>
            ))}
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">

          {/* TAB 1: SUMMARY & VERDICT */}
          {activeTab === 'summary' && (
            <div className="space-y-6">
              {/* Executive Synthesis Card */}
              <div className="p-5 rounded-2xl bg-gradient-to-br from-indigo-50/60 to-purple-50/40 dark:from-indigo-950/20 dark:to-purple-950/20 border border-indigo-200/80 dark:border-indigo-800/40">
                <div className="flex items-center gap-2 mb-2 text-indigo-700 dark:text-indigo-300">
                  <Sparkles className="w-4 h-4" />
                  <span className="text-xs font-bold uppercase tracking-wider">
                    Executive Screening Synthesis
                  </span>
                </div>
                <p className="text-sm leading-relaxed text-zinc-800 dark:text-zinc-200 font-medium">
                  {evaluation.executive_summary}
                </p>

                {/* Decision Rationale */}
                <div className="mt-4 pt-4 border-t border-indigo-100 dark:border-indigo-900/40 flex items-start gap-3">
                  <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 shrink-0">
                    <TrendingUp className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                      Recommendation Rationale:
                    </span>
                    <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-0.5 leading-relaxed">
                      {evaluation.decision_reasoning}
                    </p>
                  </div>
                </div>
              </div>

              {/* Strengths & Concerns Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Strengths */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold text-sm">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Key Candidate Strengths ({evaluation.strengths?.length || 0})</span>
                  </div>
                  <div className="space-y-3">
                    {evaluation.strengths?.map((str, idx) => (
                      <div
                        key={idx}
                        className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700/60"
                      >
                        <div className="text-xs font-bold text-zinc-900 dark:text-zinc-100 mb-1">
                          {str.title}
                        </div>
                        <p className="text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed mb-2">
                          {str.description}
                        </p>
                        <div className="text-[11px] bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300 px-2.5 py-1 rounded-md border border-emerald-200/60 dark:border-emerald-800/40 mb-1.5">
                          <span className="font-semibold">Evidence: </span>
                          {str.evidence}
                        </div>
                        <div className="text-[11px] text-zinc-500 dark:text-zinc-400">
                          <span className="font-semibold text-zinc-700 dark:text-zinc-300">Impact: </span>
                          {str.impact}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Concerns & Mitigations */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 font-bold text-sm">
                    <AlertTriangle className="w-4 h-4" />
                    <span>Concerns & Mitigations ({evaluation.concerns?.length || 0})</span>
                  </div>
                  <div className="space-y-3">
                    {evaluation.concerns?.map((cnc, idx) => (
                      <div
                        key={idx}
                        className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700/60"
                      >
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                            {cnc.title}
                          </span>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                              cnc.severity === 'High'
                                ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
                                : cnc.severity === 'Medium'
                                ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                                : 'bg-blue-500/10 text-blue-600 dark:text-blue-400'
                            }`}
                          >
                            {cnc.severity} Risk
                          </span>
                        </div>
                        <p className="text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed mb-2">
                          {cnc.description}
                        </p>
                        <div className="text-[11px] bg-amber-50 dark:bg-amber-950/30 text-amber-800 dark:text-amber-300 px-2.5 py-1.5 rounded-md border border-amber-200/60 dark:border-amber-800/40">
                          <span className="font-semibold">Suggested Mitigation: </span>
                          {cnc.mitigation}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: SKILL GAP MATRIX */}
          {activeTab === 'skills' && (
            <div className="space-y-6">
              {/* Verified Competencies */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-extrabold uppercase tracking-wider text-zinc-500 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    Verified Skills in Resume ({evaluation.skill_gap_analysis?.verified_skills?.length || 0})
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {evaluation.skill_gap_analysis?.verified_skills?.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700/60 flex items-center justify-between"
                    >
                      <div>
                        <div className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                          {item.skill}
                        </div>
                        <div className="text-[10px] text-zinc-500 mt-0.5">
                          Proficiency: <span className="font-semibold text-zinc-700 dark:text-zinc-300">{item.proficiency}</span>
                        </div>
                      </div>
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                        {item.match_confidence}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Critical Must-Have Gaps */}
              <div className="space-y-3 pt-3 border-t border-zinc-200 dark:border-zinc-800">
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-zinc-500 flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4 text-rose-500" />
                  Critical Required Skill Gaps ({evaluation.skill_gap_analysis?.critical_gaps?.length || 0})
                </h3>

                {evaluation.skill_gap_analysis?.critical_gaps && evaluation.skill_gap_analysis.critical_gaps.length > 0 ? (
                  <div className="space-y-2.5">
                    {evaluation.skill_gap_analysis.critical_gaps.map((gap, idx) => (
                      <div
                        key={idx}
                        className="p-3.5 rounded-xl bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200/80 dark:border-rose-900/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-rose-900 dark:text-rose-200">
                              {gap.skill}
                            </span>
                            <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-rose-500/20 text-rose-700 dark:text-rose-300">
                              {gap.priority} Priority
                            </span>
                          </div>
                          <p className="text-xs text-rose-700 dark:text-rose-300 mt-1">
                            {gap.reasoning}
                          </p>
                        </div>
                        <div className="shrink-0 text-right">
                          <span className="text-[11px] font-semibold px-2 py-1 rounded bg-rose-100 dark:bg-rose-900/40 text-rose-800 dark:text-rose-200">
                            {gap.risk_level} Risk Level
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800/40 text-xs text-zinc-500 text-center">
                    No critical must-have skill gaps detected. Candidate meets 100% of essential prerequisites.
                  </div>
                )}
              </div>

              {/* Secondary Gaps */}
              {evaluation.skill_gap_analysis?.secondary_gaps && evaluation.skill_gap_analysis.secondary_gaps.length > 0 && (
                <div className="space-y-3 pt-3 border-t border-zinc-200 dark:border-zinc-800">
                  <h3 className="text-xs font-extrabold uppercase tracking-wider text-zinc-500 flex items-center gap-1.5">
                    <HelpCircle className="w-4 h-4 text-amber-500" />
                    Secondary / Nice-to-Have Gaps ({evaluation.skill_gap_analysis.secondary_gaps.length})
                  </h3>

                  <div className="space-y-2">
                    {evaluation.skill_gap_analysis.secondary_gaps.map((gap, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-xl bg-amber-50/40 dark:bg-amber-950/15 border border-amber-200/60 dark:border-amber-900/30 flex items-center justify-between gap-3"
                      >
                        <div>
                          <span className="text-xs font-bold text-amber-900 dark:text-amber-200 mr-2">
                            {gap.skill}
                          </span>
                          <span className="text-xs text-amber-700 dark:text-amber-300">
                            {gap.reasoning}
                          </span>
                        </div>
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-200 shrink-0">
                          {gap.risk_level} Risk
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: INTERVIEW QUESTIONS & RUBRIC */}
          {activeTab === 'questions' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-extrabold text-zinc-900 dark:text-zinc-100">
                    Tailored Interview Questions & Evaluation Rubric
                  </h3>
                  <p className="text-xs text-zinc-500 mt-0.5">
                    AI questions designed specifically around this candidate's background, skill gaps, and the target role.
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                {evaluation.interview_questions?.map((item, idx) => {
                  const isCopied = copiedQuestionIdx === idx;
                  return (
                    <div
                      key={idx}
                      className="p-5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700/70 space-y-3"
                    >
                      {/* Header */}
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded-full bg-indigo-600 text-white text-[11px] font-bold flex items-center justify-center">
                            {idx + 1}
                          </span>
                          <span className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                            {item.category}
                          </span>
                        </div>

                        <button
                          onClick={() => handleCopyQuestion(idx, item)}
                          className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-lg bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white transition-colors"
                        >
                          {isCopied ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-emerald-500" />
                              <span className="text-emerald-500">Copied</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5" />
                              <span>Copy Rubric</span>
                            </>
                          )}
                        </button>
                      </div>

                      {/* Question */}
                      <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 leading-snug">
                        "{item.question}"
                      </p>

                      {/* Purpose */}
                      <div className="text-xs text-zinc-500 dark:text-zinc-400 bg-white/70 dark:bg-zinc-900/60 p-2.5 rounded-lg border border-zinc-200/80 dark:border-zinc-800">
                        <span className="font-bold text-zinc-700 dark:text-zinc-300">Target Objective: </span>
                        {item.purpose || item.rationale || 'Assess relevant competency'}
                      </div>

                      {/* What to listen for */}
                      <div className="space-y-1.5 pt-1">
                        <div className="text-[11px] font-bold uppercase tracking-wider text-zinc-500">
                          What To Listen For (Interviewer Checklist):
                        </div>
                        <div className="space-y-1">
                          {(() => {
                            const checkpoints: string[] = Array.isArray(item.what_to_listen_for)
                              ? item.what_to_listen_for
                              : typeof item.what_to_listen_for === 'string'
                              ? [item.what_to_listen_for]
                              : [];

                            return checkpoints.map((checkpoint: string, cIdx: number) => {
                              const checkKey = `${idx}-${cIdx}`;
                              const isChecked = !!checkedRubricItems[checkKey];
                              return (
                                <label
                                  key={cIdx}
                                  onClick={() => toggleRubricItem(checkKey)}
                                  className={`flex items-start gap-2.5 p-2 rounded-lg cursor-pointer transition-colors text-xs select-none ${
                                    isChecked
                                      ? 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-800 dark:text-emerald-200 border border-emerald-200 dark:border-emerald-800/40'
                                      : 'hover:bg-zinc-100 dark:hover:bg-zinc-800/80 text-zinc-700 dark:text-zinc-300'
                                  }`}
                                >
                                  <input
                                    type="checkbox"
                                    checked={isChecked}
                                    onChange={() => {}}
                                    className="mt-0.5 rounded text-indigo-600 focus:ring-indigo-500"
                                  />
                                  <span>{checkpoint}</span>
                                </label>
                              );
                            });
                          })()}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 4: RECRUITER NOTES & DECISION */}
          {activeTab === 'notes' && (
            <div className="space-y-6">
              <div className="p-5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-extrabold text-zinc-900 dark:text-zinc-100">
                    Recruiter Collaboration & Pipeline State
                  </h3>
                  <span className="text-xs text-zinc-500">
                    Updated: {new Date(evaluation.updated_at || Date.now()).toLocaleDateString()}
                  </span>
                </div>

                {/* Pipeline Stage Buttons */}
                <div>
                  <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-2">
                    Candidate Pipeline Stage
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                    {stages.map((stg) => (
                      <button
                        key={stg}
                        onClick={() => setCurrentStage(stg)}
                        className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all ${
                          currentStage === stg
                            ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                            : 'bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700 hover:border-zinc-400'
                        }`}
                      >
                        {stg}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Recruiter Notes Area */}
                <div>
                  <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-2">
                    Hiring Team Notes & Interview Debrief
                  </label>
                  <textarea
                    rows={5}
                    value={recruiterNotes}
                    onChange={(e) => setRecruiterNotes(e.target.value)}
                    placeholder="Enter phone screen observations, feedback from interviewers, compensation expectations, or next steps..."
                    className="w-full p-3 text-xs bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between pt-2">
                  <button
                    onClick={handleReevaluateClick}
                    disabled={isReevaluating}
                    className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isReevaluating ? 'animate-spin' : ''}`} />
                    <span>{isReevaluating ? 'Re-analyzing...' : 'Refresh Copilot Evaluation'}</span>
                  </button>

                  <button
                    onClick={() => handleSaveNotesAndStage()}
                    disabled={isSaving}
                    className="flex items-center gap-1.5 px-5 py-2 text-xs font-bold rounded-xl bg-indigo-600 text-white hover:bg-indigo-500 transition-colors shadow-sm"
                  >
                    <Save className="w-4 h-4" />
                    <span>{isSaving ? 'Saving...' : 'Save Decision & Notes'}</span>
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 flex items-center justify-between">
          <div className="text-[11px] text-zinc-400">
            AI Hiring Copilot Engine v2.4 • Enterprise Talent Intelligence
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold rounded-xl bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-300 dark:hover:bg-zinc-700 transition-colors"
            >
              Close
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
