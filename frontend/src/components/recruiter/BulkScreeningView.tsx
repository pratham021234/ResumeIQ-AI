'use client';

import React, { useState, useRef } from 'react';
import {
  UploadCloud,
  FileText,
  X,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ArrowRight,
  Briefcase,
  Users,
  Layers,
  FileCheck,
} from 'lucide-react';
import { RecruiterJob, BatchScreenResponse, CandidateRankingItem } from '@/types';
import { api } from '@/lib/api';

interface BulkScreeningViewProps {
  jobs: RecruiterJob[];
  selectedJobId: string;
  onSelectJobId: (id: string) => void;
  onScreeningComplete: (candidates: CandidateRankingItem[]) => void;
  onViewCandidateDetail: (analysisId: string) => void;
}

export const BulkScreeningView: React.FC<BulkScreeningViewProps> = ({
  jobs,
  selectedJobId,
  onSelectJobId,
  onScreeningComplete,
  onViewCandidateDetail,
}) => {
  const [files, setFiles] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [progressPercent, setProgressPercent] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [batchResults, setBatchResults] = useState<BatchScreenResponse | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const steps = [
    'Parsing file payloads (PDF & DOCX structure)...',
    'Executing ATS heuristic compatibility scoring...',
    'Performing semantic keyword & skill-gap alignment...',
    'Synthesizing AI screening summaries and ranking leaderboard...',
  ];

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const validateAndAddFiles = (incomingFiles: FileList | File[]) => {
    setError(null);
    const validFiles: File[] = [];
    const validExtensions = ['.pdf', '.docx', '.txt'];

    for (let i = 0; i < incomingFiles.length; i++) {
      const file = incomingFiles[i];
      const lowerName = file.name.toLowerCase();
      const isValid = validExtensions.some((ext) => lowerName.endsWith(ext));

      if (!isValid) {
        setError(`"${file.name}" is not a supported format. Please upload PDF or DOCX files.`);
        continue;
      }

      if (validFiles.length + files.length >= 100) {
        setError('Maximum 100 resumes per batch screening session.');
        break;
      }

      validFiles.push(file);
    }

    setFiles((prev) => [...prev, ...validFiles]);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      validateAndAddFiles(e.dataTransfer.files);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      validateAndAddFiles(e.target.files);
    }
  };

  const handleRemoveFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleClearAll = () => {
    setFiles([]);
    setBatchResults(null);
    setError(null);
  };

  const handleLoadDemoResumes = () => {
    // Generate simulated files for instant evaluation
    const demo1 = new File(
      [
        `ALEX RIVERA
alex.rivera@techmail.io • (415) 890-2341 • UC Berkeley
Senior Backend Engineer with 6 years experience in Python, FastAPI, PostgreSQL, Redis, and Kubernetes.
Built microservices handling 5M daily requests with sub-45ms p99 latency. Migrated legacy stack to AWS ECS.`,
      ],
      'Alex_Rivera_Senior_Backend.pdf',
      { type: 'application/pdf' }
    );

    const demo2 = new File(
      [
        `JORDAN LEE
jordan.lee@domain.com • (206) 555-0192 • Univ of Washington
Backend Engineer with 5 years building scalable web APIs with Go, Python, PostgreSQL, and Docker.
Containerized microservices and tuned database indexes for 35% speedup.`,
      ],
      'Jordan_Lee_Backend_Engineer.docx',
      { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' }
    );

    const demo3 = new File(
      [
        `SARAH CHEN
sarah.chen@innovate.org • (917) 555-4412 • Columbia University
Full Stack Developer with 4 years experience with Python, Django, REST APIs, and MySQL.
Maintained customer billing APIs handling 50k transactions weekly.`,
      ],
      'Sarah_Chen_FullStack.pdf',
      { type: 'application/pdf' }
    );

    setFiles([demo1, demo2, demo3]);
  };

  const handleStartScreening = async () => {
    if (!selectedJobId) {
      setError('Please select a target job requisition to screen candidates against.');
      return;
    }
    if (files.length === 0) {
      setError('Please upload at least 1 resume file (PDF or DOCX).');
      return;
    }

    try {
      setIsProcessing(true);
      setError(null);
      setProgressPercent(15);
      setCurrentStep(0);

      const stepInterval = setInterval(() => {
        setProgressPercent((prev) => {
          if (prev >= 90) return prev;
          const next = prev + 25;
          if (next >= 40 && next < 65) setCurrentStep(1);
          else if (next >= 65 && next < 85) setCurrentStep(2);
          else if (next >= 85) setCurrentStep(3);
          return next;
        });
      }, 500);

      const response = await api.screenBatchResumes(selectedJobId, files);

      clearInterval(stepInterval);
      setProgressPercent(100);
      setCurrentStep(3);

      setBatchResults(response);
      onScreeningComplete(response.candidates);
    } catch (err: any) {
      setError(err?.message || 'Failed to complete batch screening.');
    } finally {
      setIsProcessing(false);
    }
  };

  const activeJob = jobs.find((j) => j.id === selectedJobId) || jobs[0];

  return (
    <div className="space-y-6">
      {/* View Header */}
      <div className="p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                Bulk Screening Engine
              </span>
              <span className="text-xs text-zinc-500 font-medium">1 to 100 Resumes Supported</span>
            </div>
            <h2 className="text-xl font-extrabold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              <UploadCloud className="w-5 h-5 text-purple-600" />
              <span>Bulk Resume Screening & AI Batch Parser</span>
            </h2>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 max-w-2xl">
              Upload from 1 to 100 resumes in PDF or DOCX format. The engine extracts contact info,
              evaluates ATS formatting compliance, tests keyword and skill coverage against the job description,
              and generates ranked candidate leaderboards with AI strengths & concerns.
            </p>
          </div>

          {/* Quick Demo Button */}
          <button
            type="button"
            onClick={handleLoadDemoResumes}
            className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 hover:bg-purple-100 dark:hover:bg-purple-900/60 transition-colors flex items-center gap-2 self-start md:self-center"
          >
            <Sparkles className="w-3.5 h-3.5 text-purple-600" />
            <span>Load 3 Demo Resumes</span>
          </button>
        </div>
      </div>

      {/* Target Job Selector */}
      <div className="p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 flex items-center gap-2">
            <Briefcase className="w-4 h-4 text-purple-600" />
            <span>Select Target Job Opening for Screening <span className="text-red-500">*</span></span>
          </label>
          {activeJob && (
            <span className="text-xs font-semibold text-purple-600 dark:text-purple-400">
              {activeJob.company} • {activeJob.experience_level}
            </span>
          )}
        </div>

        <select
          value={selectedJobId}
          onChange={(e) => onSelectJobId(e.target.value)}
          className="w-full px-3.5 py-2.5 text-xs bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 rounded-xl text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-purple-500 font-medium"
        >
          {jobs.length === 0 ? (
            <option value="">No active job requisitions found. Please create one.</option>
          ) : (
            jobs.map((job) => (
              <option key={job.id} value={job.id}>
                {job.title} — {job.company} ({job.experience_level}) • {job.skills?.slice(0, 3).join(', ') || 'No skills'}
              </option>
            ))
          )}
        </select>
      </div>

      {/* Dropzone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`relative p-8 rounded-2xl border-2 border-dashed transition-all flex flex-col items-center justify-center text-center ${
          isDragging
            ? 'border-purple-600 bg-purple-50/60 dark:bg-purple-950/20'
            : 'border-zinc-300 dark:border-zinc-700 hover:border-purple-400 bg-zinc-50/50 dark:bg-zinc-900/50'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".pdf,.docx,.txt"
          onChange={handleFileInputChange}
          className="hidden"
        />

        <div className="w-14 h-14 rounded-2xl bg-purple-100 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center mb-3 shadow-xs">
          <UploadCloud className="w-7 h-7" />
        </div>

        <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 mb-1">
          Drag & Drop Candidate Resumes Here
        </h3>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-3 max-w-md">
          Support: <span className="font-semibold text-zinc-700 dark:text-zinc-300">1 to 100 resumes</span>.
          Accepted Formats: <span className="font-semibold text-purple-600 dark:text-purple-400">PDF, DOCX</span>.
        </p>

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 transition-colors shadow-xs"
        >
          Browse Files on Device
        </button>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="p-3.5 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 text-xs text-red-600 dark:text-red-300 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Upload Queue Inspector */}
      {files.length > 0 && (
        <div className="p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                Uploaded Queue ({files.length} / 100 Resumes)
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300">
                Ready for Screening
              </span>
            </div>

            <button
              type="button"
              onClick={handleClearAll}
              className="text-xs font-semibold text-zinc-500 hover:text-red-600 dark:hover:text-red-400 transition-colors"
            >
              Clear All
            </button>
          </div>

          {/* Files Grid */}
          <div className="max-h-56 overflow-y-auto space-y-1.5 pr-1">
            {files.map((file, idx) => (
              <div
                key={`${file.name}-${idx}`}
                className="flex items-center justify-between p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700/60 text-xs"
              >
                <div className="flex items-center gap-2.5 truncate">
                  <FileText className="w-4 h-4 text-purple-500 shrink-0" />
                  <span className="font-medium text-zinc-800 dark:text-zinc-200 truncate">
                    {file.name}
                  </span>
                  <span className="text-[10px] font-mono text-zinc-400 shrink-0">
                    {(file.size / 1024).toFixed(1)} KB
                  </span>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase bg-zinc-200 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300">
                    {file.name.split('.').pop()}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleRemoveFile(idx)}
                    className="p-1 text-zinc-400 hover:text-red-500 rounded"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Action Button & Live Progress */}
          <div className="pt-3 border-t border-zinc-200 dark:border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-xs text-zinc-500">
              Target Opening:{' '}
              <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                {activeJob?.title || 'Selected Job'} ({activeJob?.company || 'Company'})
              </span>
            </div>

            <button
              type="button"
              disabled={isProcessing || files.length === 0}
              onClick={handleStartScreening}
              className="w-full sm:w-auto px-6 py-2.5 text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 disabled:opacity-50 rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
            >
              {isProcessing ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Processing {files.length} Resumes...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Run Batch AI Screening ({files.length} Resumes)</span>
                </>
              )}
            </button>
          </div>

          {/* Live Progress Bar when processing */}
          {isProcessing && (
            <div className="p-4 rounded-xl bg-purple-50/60 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-900/40 space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold text-purple-900 dark:text-purple-200">
                <span>{steps[currentStep]}</span>
                <span>{progressPercent}%</span>
              </div>
              <div className="h-2 w-full bg-purple-200/50 dark:bg-purple-950 rounded-full overflow-hidden">
                <div
                  className="h-full bg-purple-600 rounded-full transition-all duration-300"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          )}
        </div>
      )}

      {/* Batch Screening Results Summary */}
      {batchResults && (
        <div className="p-6 rounded-2xl border border-emerald-200 dark:border-emerald-900/60 bg-white dark:bg-zinc-900 shadow-md space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                  Batch Screening Complete ({batchResults.total_screened} Resumes Processed)
                </h3>
                <p className="text-xs text-zinc-500">
                  Scored and ranked deterministically against {batchResults.job_title} at {batchResults.company}
                </p>
              </div>
            </div>

            <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
              Ranked descending
            </span>
          </div>

          {/* Leaderboard Table Preview */}
          <div className="overflow-x-auto rounded-xl border border-zinc-200 dark:border-zinc-800">
            <table className="w-full text-xs text-left">
              <thead className="bg-zinc-50 dark:bg-zinc-800/80 text-zinc-500 font-bold border-b border-zinc-200 dark:border-zinc-700/60">
                <tr>
                  <th className="px-4 py-3">Rank</th>
                  <th className="px-4 py-3">Candidate</th>
                  <th className="px-4 py-3">ATS Score</th>
                  <th className="px-4 py-3">Match Score</th>
                  <th className="px-4 py-3">Skill Match</th>
                  <th className="px-4 py-3">Experience Match</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                {batchResults.candidates.map((cand) => (
                  <tr
                    key={cand.analysis_id}
                    className="hover:bg-zinc-50/80 dark:hover:bg-zinc-800/40 transition-colors"
                  >
                    <td className="px-4 py-3 font-bold text-zinc-900 dark:text-zinc-100">
                      #{cand.rank}
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-bold text-zinc-900 dark:text-zinc-100">
                        {cand.candidate_name}
                      </div>
                      <div className="text-[11px] text-zinc-500">{cand.email}</div>
                    </td>
                    <td className="px-4 py-3 font-bold text-purple-600 dark:text-purple-400">
                      {cand.ats_score.toFixed(1)}/100
                    </td>
                    <td className="px-4 py-3 font-bold text-indigo-600 dark:text-indigo-400">
                      {cand.match_score.toFixed(1)}%
                    </td>
                    <td className="px-4 py-3 font-semibold text-emerald-600 dark:text-emerald-400">
                      {cand.skill_match.toFixed(1)}%
                    </td>
                    <td className="px-4 py-3 font-semibold text-blue-600 dark:text-blue-400">
                      {cand.experience_match.toFixed(1)}%
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => onViewCandidateDetail(cand.analysis_id)}
                        className="px-3 py-1 rounded-lg text-xs font-semibold bg-purple-600 text-white hover:bg-purple-700 transition-colors"
                      >
                        View Profile
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
