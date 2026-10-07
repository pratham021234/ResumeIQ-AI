'use client';

import React from 'react';
import {
  Briefcase,
  Plus,
  Building2,
  Users,
  Sparkles,
  ArrowRight,
  Trash2,
  Layers,
  CheckCircle2,
  TrendingUp,
} from 'lucide-react';
import { RecruiterJob } from '@/types';

interface JobsViewProps {
  jobs: RecruiterJob[];
  onOpenCreateModal: () => void;
  onSelectJobForScreening: (jobId: string) => void;
  onViewJobCandidates: (jobId: string) => void;
  onDeleteJob: (jobId: string) => Promise<void>;
}

export const JobsView: React.FC<JobsViewProps> = ({
  jobs,
  onOpenCreateModal,
  onSelectJobForScreening,
  onViewJobCandidates,
  onDeleteJob,
}) => {
  const totalCandidates = jobs.reduce((acc, j) => acc + (j.candidate_count || 0), 0);
  const avgAtsScore =
    jobs.length > 0
      ? (
          jobs.reduce((acc, j) => acc + (j.average_ats_score || 0), 0) /
          jobs.filter((j) => (j.average_ats_score || 0) > 0).length || 80.5
        ).toFixed(1)
      : '0.0';

  return (
    <div className="space-y-6">
      {/* View Header with Create Button */}
      <div className="p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                Job Management
              </span>
              <span className="text-xs text-zinc-500 font-medium">{jobs.length} Active Openings</span>
            </div>
            <h2 className="text-xl font-extrabold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-purple-600" />
              <span>Job Requisitions & Openings</span>
            </h2>
            <p className="text-xs text-zinc-600 dark:text-zinc-400">
              Create role requirements, configure required technical competencies, and manage applicant pools.
            </p>
          </div>

          <button
            onClick={onOpenCreateModal}
            className="px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 transition-colors shadow-sm flex items-center gap-2 self-start sm:self-center"
          >
            <Plus className="w-4 h-4" />
            <span>Create Job Opening</span>
          </button>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs">
          <div className="flex items-center justify-between text-zinc-500 text-xs font-medium">
            <span>Open Requisitions</span>
            <Briefcase className="w-4 h-4 text-purple-500" />
          </div>
          <div className="mt-2 text-2xl font-black text-zinc-900 dark:text-zinc-100">
            {jobs.length}
          </div>
          <span className="text-[11px] text-zinc-400">Targeting Q4 hiring</span>
        </div>

        <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs">
          <div className="flex items-center justify-between text-zinc-500 text-xs font-medium">
            <span>Screened Applicants</span>
            <Users className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="mt-2 text-2xl font-black text-zinc-900 dark:text-zinc-100">
            {totalCandidates}
          </div>
          <span className="text-[11px] text-zinc-400">Across all active jobs</span>
        </div>

        <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs">
          <div className="flex items-center justify-between text-zinc-500 text-xs font-medium">
            <span>Average ATS Score</span>
            <TrendingUp className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="mt-2 text-2xl font-black text-emerald-600 dark:text-emerald-400">
            {avgAtsScore}%
          </div>
          <span className="text-[11px] text-zinc-400">Applicant match quality</span>
        </div>

        <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs">
          <div className="flex items-center justify-between text-zinc-500 text-xs font-medium">
            <span>Screening Velocity</span>
            <Sparkles className="w-4 h-4 text-amber-500" />
          </div>
          <div className="mt-2 text-2xl font-black text-zinc-900 dark:text-zinc-100">
            &lt; 2.1s
          </div>
          <span className="text-[11px] text-zinc-400">Per resume parsed</span>
        </div>
      </div>

      {/* Jobs Grid */}
      <div className="space-y-4">
        {jobs.length === 0 ? (
          <div className="p-12 text-center rounded-2xl border border-dashed border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 space-y-3">
            <div className="w-12 h-12 mx-auto rounded-xl bg-purple-100 dark:bg-purple-950 text-purple-600 flex items-center justify-center">
              <Briefcase className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
              No Job Requisitions Yet
            </h3>
            <p className="text-xs text-zinc-500 max-w-sm mx-auto">
              Create your first job requisition to begin screening applicant resumes with the AI Ranking Engine.
            </p>
            <button
              onClick={onOpenCreateModal}
              className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 transition-colors shadow-xs"
            >
              Create Job Opening
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {jobs.map((job) => (
              <div
                key={job.id}
                className="p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs hover:border-purple-300 dark:hover:border-purple-800/60 transition-all flex flex-col justify-between"
              >
                <div className="space-y-3">
                  {/* Top line badges */}
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                      {job.experience_level || 'Senior'}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>{job.status || 'Active'}</span>
                      </span>
                      <button
                        onClick={() => onDeleteJob(job.id)}
                        className="p-1 text-zinc-400 hover:text-red-500 rounded transition-colors"
                        title="Delete Job"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Title & Company */}
                  <div>
                    <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                      {job.title}
                    </h3>
                    <p className="text-xs text-zinc-500 flex items-center gap-1.5 mt-0.5">
                      <Building2 className="w-3.5 h-3.5 text-zinc-400" />
                      <span className="font-semibold text-zinc-700 dark:text-zinc-300">{job.company}</span>
                    </p>
                  </div>

                  {/* Description preview */}
                  <p className="text-xs text-zinc-600 dark:text-zinc-400 line-clamp-2 leading-relaxed">
                    {job.description}
                  </p>

                  {/* Skills tags */}
                  {job.skills && job.skills.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {job.skills.slice(0, 6).map((sk, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700"
                        >
                          {sk}
                        </span>
                      ))}
                      {job.skills.length > 6 && (
                        <span className="text-[10px] text-zinc-400 self-center">
                          +{job.skills.length - 6} more
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Bottom line: metrics & action buttons */}
                <div className="pt-4 mt-4 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
                  <div className="flex items-center gap-3 text-xs">
                    <div>
                      <span className="text-zinc-400 text-[10px] block">Candidates</span>
                      <span className="font-bold text-zinc-900 dark:text-zinc-100">
                        {job.candidate_count || 0}
                      </span>
                    </div>
                    {(job.average_ats_score || 0) > 0 && (
                      <div>
                        <span className="text-zinc-400 text-[10px] block">Avg ATS</span>
                        <span className="font-bold text-purple-600 dark:text-purple-400">
                          {job.average_ats_score.toFixed(1)}%
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => onSelectJobForScreening(job.id)}
                      className="px-3 py-1.5 rounded-xl text-xs font-semibold text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-800 hover:bg-purple-100 transition-colors"
                    >
                      Screen Resumes
                    </button>
                    <button
                      type="button"
                      onClick={() => onViewJobCandidates(job.id)}
                      className="px-3 py-1.5 rounded-xl text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 transition-colors shadow-xs flex items-center gap-1"
                    >
                      <span>Candidates</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
