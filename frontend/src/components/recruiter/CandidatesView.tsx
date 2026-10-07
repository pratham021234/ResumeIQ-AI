'use client';

import React, { useState, useMemo } from 'react';
import {
  Users,
  Search,
  Filter,
  SlidersHorizontal,
  Download,
  FileSpreadsheet,
  FileText,
  Sparkles,
  ArrowUpDown,
  GraduationCap,
  Briefcase,
  CheckCircle2,
  AlertTriangle,
  ChevronDown,
} from 'lucide-react';
import { CandidateRankingItem, RecruiterJob } from '@/types';
import { api } from '@/lib/api';

interface CandidatesViewProps {
  candidates: CandidateRankingItem[];
  jobs: RecruiterJob[];
  selectedJobId: string;
  onSelectJobId: (id: string) => void;
  onViewCandidateDetail: (analysisId: string) => void;
  onSwitchToScreening: () => void;
}

export const CandidatesView: React.FC<CandidatesViewProps> = ({
  candidates,
  jobs,
  selectedJobId,
  onSelectJobId,
  onViewCandidateDetail,
  onSwitchToScreening,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [minScoreFilter, setMinScoreFilter] = useState<number>(0);
  const [selectedSkillFilter, setSelectedSkillFilter] = useState<string>('All');
  const [experienceLevelFilter, setExperienceLevelFilter] = useState<string>('All');
  const [educationFilter, setEducationFilter] = useState<string>('All');
  const [sortBy, setSortBy] = useState<'ats_score' | 'match_score' | 'skill_match' | 'experience_match'>('ats_score');

  // Collect available unique skills across all candidates
  const allAvailableSkills = useMemo(() => {
    const skillSet = new Set<string>();
    candidates.forEach((c) => {
      c.verified_skills?.forEach((s) => skillSet.add(s));
    });
    return Array.from(skillSet).slice(0, 15);
  }, [candidates]);

  // Client-side filtering & sorting
  const filteredAndSortedCandidates = useMemo(() => {
    let list = [...candidates];

    // Filter by Job
    if (selectedJobId) {
      const activeJob = jobs.find((j) => j.id === selectedJobId);
      if (activeJob) {
        list = list.filter(
          (c) =>
            c.job_title?.toLowerCase().includes(activeJob.title.toLowerCase()) ||
            c.company?.toLowerCase().includes(activeJob.company.toLowerCase())
        );
      }
    }

    // Search filter
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      list = list.filter(
        (c) =>
          c.candidate_name.toLowerCase().includes(q) ||
          c.email.toLowerCase().includes(q) ||
          c.role?.toLowerCase().includes(q) ||
          c.company?.toLowerCase().includes(q) ||
          c.verified_skills?.some((s) => s.toLowerCase().includes(q))
      );
    }

    // Min ATS Score
    if (minScoreFilter > 0) {
      list = list.filter((c) => c.ats_score >= minScoreFilter);
    }

    // Skill Filter
    if (selectedSkillFilter !== 'All') {
      list = list.filter((c) =>
        c.verified_skills?.some((s) => s.toLowerCase() === selectedSkillFilter.toLowerCase())
      );
    }

    // Education Filter
    if (educationFilter !== 'All') {
      list = list.filter((c) =>
        c.education?.toLowerCase().includes(educationFilter.toLowerCase())
      );
    }

    // Sort descending by selected criteria
    list.sort((a, b) => b[sortBy] - a[sortBy]);

    // Recalculate rank based on sort
    return list.map((item, idx) => ({
      ...item,
      rank: idx + 1,
    }));
  }, [
    candidates,
    selectedJobId,
    jobs,
    searchTerm,
    minScoreFilter,
    selectedSkillFilter,
    educationFilter,
    sortBy,
  ]);

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
      {/* View Header with Export Toolbar */}
      <div className="p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                Ranking Engine
              </span>
              <span className="text-xs text-zinc-500 font-medium">Sorted Descending</span>
            </div>
            <h2 className="text-xl font-extrabold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              <Users className="w-5 h-5 text-purple-600" />
              <span>Candidate Leaderboard & Ranking Engine</span>
            </h2>
            <p className="text-xs text-zinc-600 dark:text-zinc-400">
              Ranked candidates scored across ATS Compatibility, Semantic Job Match, Skills Coverage, and Experience Depth.
            </p>
          </div>

          {/* Export & Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={handleExportCsv}
              className="px-3.5 py-2 rounded-xl text-xs font-bold text-zinc-700 dark:text-zinc-200 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 border border-zinc-200 dark:border-zinc-700 transition-colors flex items-center gap-2 shadow-xs"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>Export CSV</span>
            </button>

            <button
              onClick={handleExportPdf}
              className="px-3.5 py-2 rounded-xl text-xs font-bold text-zinc-700 dark:text-zinc-200 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 border border-zinc-200 dark:border-zinc-700 transition-colors flex items-center gap-2 shadow-xs"
            >
              <FileText className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
              <span>Export PDF Report</span>
            </button>

            <button
              onClick={onSwitchToScreening}
              className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 transition-colors flex items-center gap-1.5 shadow-sm"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Bulk Screen Resumes</span>
            </button>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs space-y-4">
        {/* Top search & sorting row */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Search box */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-2.5 w-4 h-4 text-zinc-400" />
            <input
              type="text"
              placeholder="Filter by candidate name, email, target role, or skills..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-xs bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 rounded-xl text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          {/* Sort Descending by Dropdown */}
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-xs font-semibold text-zinc-500 flex items-center gap-1">
              <ArrowUpDown className="w-3.5 h-3.5" />
              <span>Sort Descending:</span>
            </span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-2 text-xs font-bold bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="ats_score">ATS Score (Highest First)</option>
              <option value="match_score">Match Score (Highest First)</option>
              <option value="skill_match">Skill Match (Highest First)</option>
              <option value="experience_match">Experience Match (Highest First)</option>
            </select>
          </div>
        </div>

        {/* Multi-Filter Badges Row */}
        <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800/60 flex flex-wrap items-center gap-3 text-xs">
          {/* Target Job filter */}
          <div className="flex items-center gap-1.5">
            <Briefcase className="w-3.5 h-3.5 text-zinc-400" />
            <span className="text-zinc-500 font-semibold">Job:</span>
            <select
              value={selectedJobId}
              onChange={(e) => onSelectJobId(e.target.value)}
              className="px-2.5 py-1 text-xs bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-zinc-800 dark:text-zinc-200"
            >
              <option value="">All Job Openings ({jobs.length})</option>
              {jobs.map((j) => (
                <option key={j.id} value={j.id}>
                  {j.title} ({j.company})
                </option>
              ))}
            </select>
          </div>

          {/* Score Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-zinc-500 font-semibold">Min ATS Score:</span>
            <div className="flex items-center gap-1">
              {[0, 70, 75, 80, 85].map((score) => (
                <button
                  key={score}
                  type="button"
                  onClick={() => setMinScoreFilter(score)}
                  className={`px-2 py-0.5 rounded-md text-[11px] font-bold transition-colors ${
                    minScoreFilter === score
                      ? 'bg-purple-600 text-white shadow-xs'
                      : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700'
                  }`}
                >
                  {score === 0 ? 'All' : `${score}+`}
                </button>
              ))}
            </div>
          </div>

          {/* Education Filter */}
          <div className="flex items-center gap-1.5">
            <GraduationCap className="w-3.5 h-3.5 text-zinc-400" />
            <span className="text-zinc-500 font-semibold">Education:</span>
            <select
              value={educationFilter}
              onChange={(e) => setEducationFilter(e.target.value)}
              className="px-2.5 py-1 text-xs bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-zinc-800 dark:text-zinc-200"
            >
              <option value="All">All Degrees</option>
              <option value="Computer Science">Computer Science</option>
              <option value="Master">Master&apos;s Degree</option>
              <option value="Bachelor">Bachelor&apos;s Degree</option>
              <option value="Ph.D.">Ph.D. / Doctorate</option>
            </select>
          </div>

          {/* Skill Filter */}
          {allAvailableSkills.length > 0 && (
            <div className="flex items-center gap-1.5">
              <span className="text-zinc-500 font-semibold">Skill:</span>
              <select
                value={selectedSkillFilter}
                onChange={(e) => setSelectedSkillFilter(e.target.value)}
                className="px-2.5 py-1 text-xs bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-zinc-800 dark:text-zinc-200"
              >
                <option value="All">All Skills</option>
                {allAvailableSkills.map((sk) => (
                  <option key={sk} value={sk}>
                    {sk}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Active filter count / reset */}
          {(searchTerm || minScoreFilter > 0 || selectedSkillFilter !== 'All' || educationFilter !== 'All' || selectedJobId) && (
            <button
              onClick={() => {
                setSearchTerm('');
                setMinScoreFilter(0);
                setSelectedSkillFilter('All');
                setEducationFilter('All');
                onSelectJobId('');
              }}
              className="text-[11px] font-semibold text-purple-600 dark:text-purple-400 hover:underline ml-auto"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Candidate Ranking Table */}
      <div className="p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs overflow-hidden space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
              Ranked Candidates ({filteredAndSortedCandidates.length})
            </h3>
            <span className="text-xs text-zinc-400 font-medium">Sorted Descending by {sortBy.replace('_', ' ').toUpperCase()}</span>
          </div>
        </div>

        {filteredAndSortedCandidates.length === 0 ? (
          <div className="py-12 text-center space-y-3">
            <div className="w-12 h-12 mx-auto rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-400">
              <Users className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
              No candidates match your search filters
            </h4>
            <p className="text-xs text-zinc-500 max-w-sm mx-auto">
              Try adjusting your minimum score or skill filters, or upload resumes using Bulk Resume Screening.
            </p>
            <button
              onClick={onSwitchToScreening}
              className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 transition-colors shadow-xs"
            >
              Screen Resumes Now
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-zinc-200 dark:border-zinc-800">
            <table className="w-full text-xs text-left">
              <thead className="bg-zinc-50 dark:bg-zinc-800/80 text-zinc-500 font-bold border-b border-zinc-200 dark:border-zinc-700/60 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="px-4 py-3.5 w-16 text-center">Rank</th>
                  <th className="px-4 py-3.5">Candidate</th>
                  <th className="px-4 py-3.5 text-center">ATS Score</th>
                  <th className="px-4 py-3.5 text-center">Match Score</th>
                  <th className="px-4 py-3.5 text-center">Skill Match</th>
                  <th className="px-4 py-3.5 text-center">Experience Match</th>
                  <th className="px-4 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                {filteredAndSortedCandidates.map((cand) => {
                  const isTopRank = cand.rank === 1;
                  const isSecondRank = cand.rank === 2;
                  const isThirdRank = cand.rank === 3;

                  return (
                    <tr
                      key={cand.analysis_id}
                      className="hover:bg-purple-50/30 dark:hover:bg-zinc-800/40 transition-colors cursor-pointer group"
                      onClick={() => onViewCandidateDetail(cand.analysis_id)}
                    >
                      {/* Rank */}
                      <td className="px-4 py-4 text-center">
                        <span
                          className={`inline-flex items-center justify-center w-7 h-7 rounded-full font-black text-xs ${
                            isTopRank
                              ? 'bg-amber-100 text-amber-800 border border-amber-300 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-700'
                              : isSecondRank
                              ? 'bg-zinc-200 text-zinc-800 border border-zinc-300 dark:bg-zinc-800 dark:text-zinc-200 dark:border-zinc-700'
                              : isThirdRank
                              ? 'bg-orange-100 text-orange-800 border border-orange-300 dark:bg-orange-950 dark:text-orange-300 dark:border-orange-700'
                              : 'bg-zinc-100 dark:bg-zinc-800/60 text-zinc-600 dark:text-zinc-400 font-bold'
                          }`}
                        >
                          #{cand.rank}
                        </span>
                      </td>

                      {/* Candidate details */}
                      <td className="px-4 py-4">
                        <div className="font-bold text-zinc-900 dark:text-zinc-100 text-sm group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                          {cand.candidate_name}
                        </div>
                        <div className="text-[11px] text-zinc-500 flex items-center gap-2 mt-0.5">
                          <span>{cand.email}</span>
                          {cand.phone && (
                            <>
                              <span>•</span>
                              <span>{cand.phone}</span>
                            </>
                          )}
                        </div>
                        <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                          {cand.education && (
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700 flex items-center gap-1">
                              <GraduationCap className="w-2.5 h-2.5 text-purple-500" />
                              <span>{cand.education}</span>
                            </span>
                          )}
                          <span className="text-[10px] text-zinc-400">
                            Role: {cand.job_title} ({cand.company})
                          </span>
                        </div>
                      </td>

                      {/* ATS Score */}
                      <td className="px-4 py-4 text-center">
                        <div className="inline-flex flex-col items-center">
                          <span className="text-base font-black text-purple-600 dark:text-purple-400">
                            {cand.ats_score.toFixed(1)}
                          </span>
                          <span className="text-[10px] text-zinc-400 font-semibold">/100</span>
                        </div>
                      </td>

                      {/* Match Score */}
                      <td className="px-4 py-4 text-center">
                        <span className="px-2.5 py-1 rounded-full text-xs font-black bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                          {cand.match_score.toFixed(1)}%
                        </span>
                      </td>

                      {/* Skill Match */}
                      <td className="px-4 py-4 text-center">
                        <span className="font-bold text-emerald-600 dark:text-emerald-400 text-xs">
                          {cand.skill_match.toFixed(1)}%
                        </span>
                      </td>

                      {/* Experience Match */}
                      <td className="px-4 py-4 text-center">
                        <span className="font-bold text-blue-600 dark:text-blue-400 text-xs">
                          {cand.experience_match.toFixed(1)}%
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <button
                          type="button"
                          onClick={() => onViewCandidateDetail(cand.analysis_id)}
                          className="px-3 py-1.5 rounded-xl text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 transition-colors shadow-xs"
                        >
                          View Profile
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
