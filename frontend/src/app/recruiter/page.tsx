'use client';

import React, { useState, useEffect } from 'react';
import {
  Briefcase,
  Users,
  FileSearch,
  BarChart3,
  Settings,
  Menu,
  X,
  Plus,
  Sparkles,
  Download,
  ShieldCheck,
  Search,
  Bell,
  ArrowLeftRight,
} from 'lucide-react';
import Link from 'next/link';

import {
  RecruiterSidebar,
  RecruiterTab,
} from '@/components/recruiter/RecruiterSidebar';
import { JobsView } from '@/components/recruiter/JobsView';
import { CandidatesView } from '@/components/recruiter/CandidatesView';
import { BulkScreeningView } from '@/components/recruiter/BulkScreeningView';
import { ReportsView } from '@/components/recruiter/ReportsView';
import { SettingsView } from '@/components/recruiter/SettingsView';
import { JobCreationModal } from '@/components/recruiter/JobCreationModal';
import { CandidateDetailModal } from '@/components/recruiter/CandidateDetailModal';
import { RecruiterAuthModal } from '@/components/recruiter/RecruiterAuthModal';

import {
  RecruiterJob,
  CandidateRankingItem,
  CandidateDetail,
  RecruiterJobCreate,
  User as UserType,
} from '@/types';
import { api } from '@/lib/api';
import {
  DEMO_RECRUITER_JOBS,
  DEMO_RANKED_CANDIDATES,
  DEMO_CANDIDATE_DETAIL,
} from '@/lib/demoData';

export default function RecruiterPortalPage() {
  const [activeTab, setActiveTab] = useState<RecruiterTab>('jobs');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Recruiter authentication state
  const [user, setUser] = useState<UserType | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isAuthChecking, setIsAuthChecking] = useState(true);

  // Data states
  const [jobs, setJobs] = useState<RecruiterJob[]>(DEMO_RECRUITER_JOBS);
  const [candidates, setCandidates] = useState<CandidateRankingItem[]>(DEMO_RANKED_CANDIDATES);
  const [selectedJobId, setSelectedJobId] = useState<string>('');

  // Modals
  const [isJobModalOpen, setIsJobModalOpen] = useState(false);
  const [selectedCandidateDetail, setSelectedCandidateDetail] = useState<CandidateDetail | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  // Load user & recruiter data on mount
  useEffect(() => {
    const checkRecruiterAuthAndLoadData = async () => {
      try {
        let storedUser: UserType | null = null;
        if (typeof window !== 'undefined') {
          const rawUser = localStorage.getItem('resumeiq_user');
          if (rawUser) {
            try {
              storedUser = JSON.parse(rawUser);
            } catch {}
          }
        }

        // Auto authenticate as recruiter if in demo session
        if (!storedUser || !storedUser.is_recruiter) {
          const demoRecruiter: UserType = {
            id: 'recruiter-demo-elena',
            email: 'recruiter@resumeiq.ai',
            full_name: 'Elena Rostova (Recruiter)',
            plan: 'enterprise',
            is_recruiter: true,
            created_at: new Date().toISOString(),
          };
          setUser(demoRecruiter);
          if (typeof window !== 'undefined') {
            localStorage.setItem('resumeiq_user', JSON.stringify(demoRecruiter));
          }
        } else {
          setUser(storedUser);
        }

        // Fetch live jobs from backend
        try {
          const liveJobs = await api.getRecruiterJobs();
          if (liveJobs && liveJobs.length > 0) {
            setJobs(liveJobs);
            if (!selectedJobId) {
              setSelectedJobId(liveJobs[0].id);
            }
          } else {
            setJobs(DEMO_RECRUITER_JOBS);
            setSelectedJobId(DEMO_RECRUITER_JOBS[0].id);
          }
        } catch {
          setJobs(DEMO_RECRUITER_JOBS);
          setSelectedJobId(DEMO_RECRUITER_JOBS[0].id);
        }

        // Fetch live candidates from backend
        try {
          const liveCandidates = await api.getRankedCandidates();
          if (liveCandidates && liveCandidates.length > 0) {
            setCandidates(liveCandidates);
          } else {
            setCandidates(DEMO_RANKED_CANDIDATES);
          }
        } catch {
          setCandidates(DEMO_RANKED_CANDIDATES);
        }
      } catch (err) {
        console.warn('Error loading recruiter portal state:', err);
      } finally {
        setIsAuthChecking(false);
      }
    };

    checkRecruiterAuthAndLoadData();
  }, []);

  // Handlers
  const handleJobCreated = async (jobData: RecruiterJobCreate) => {
    try {
      const newJob = await api.createRecruiterJob(jobData);
      setJobs((prev) => [newJob, ...prev]);
      setSelectedJobId(newJob.id);
    } catch {
      // Offline fallback
      const fallbackJob: RecruiterJob = {
        id: `job-${Date.now()}`,
        title: jobData.title,
        company: jobData.company,
        description: jobData.description,
        skills: jobData.skills,
        experience_level: jobData.experience_level,
        status: 'Active',
        candidate_count: 0,
        average_ats_score: 0.0,
        created_at: new Date().toISOString(),
      };
      setJobs((prev) => [fallbackJob, ...prev]);
      setSelectedJobId(fallbackJob.id);
    }
  };

  const handleDeleteJob = async (jobId: string) => {
    try {
      await api.deleteRecruiterJob(jobId);
    } catch {}
    setJobs((prev) => prev.filter((j) => j.id !== jobId));
    if (selectedJobId === jobId) {
      setSelectedJobId('');
    }
  };

  const handleScreeningComplete = (screenedCandidates: CandidateRankingItem[]) => {
    setCandidates((prev) => {
      const combined = [...screenedCandidates, ...prev];
      // deduplicate by analysis_id
      const map = new Map<string, CandidateRankingItem>();
      combined.forEach((c) => map.set(c.analysis_id, c));
      return Array.from(map.values()).sort((a, b) => b.ats_score - a.ats_score);
    });
    // Update candidate count on active job
    setJobs((prev) =>
      prev.map((j) =>
        j.id === selectedJobId
          ? {
              ...j,
              candidate_count: (j.candidate_count || 0) + screenedCandidates.length,
            }
          : j
      )
    );
  };

  const handleOpenCandidateDetail = async (analysisId: string) => {
    try {
      const detail = await api.getCandidateDetail(analysisId);
      setSelectedCandidateDetail(detail);
      setIsDetailModalOpen(true);
    } catch {
      // Fallback matching candidate from local list
      const cand = candidates.find((c) => c.analysis_id === analysisId);
      if (cand) {
        setSelectedCandidateDetail({
          analysis_id: cand.analysis_id,
          resume_id: cand.resume_id,
          candidate_name: cand.candidate_name,
          email: cand.email,
          phone: cand.phone,
          education: cand.education,
          job_title: cand.job_title,
          company: cand.company,
          ats_score: cand.ats_score,
          match_score: cand.match_score,
          skill_match: cand.skill_match,
          experience_match: cand.experience_match,
          raw_resume: DEMO_CANDIDATE_DETAIL.raw_resume,
          parsed_sections: DEMO_CANDIDATE_DETAIL.parsed_sections,
          match_explanation: `Candidate ${cand.candidate_name} exhibits an ATS compatibility score of ${cand.ats_score}% and a job match score of ${cand.match_score}% for ${cand.job_title} at ${cand.company}.`,
          missing_skills: cand.missing_skills || [],
          verified_skills: cand.verified_skills || [],
          strengths: cand.strengths || DEMO_CANDIDATE_DETAIL.strengths,
          concerns: cand.concerns || DEMO_CANDIDATE_DETAIL.concerns,
          scores: {
            'ATS Compatibility': cand.ats_score,
            'Job Match': cand.match_score,
            'Skills Match': cand.skill_match,
            'Experience Match': cand.experience_match,
          },
          created_at: cand.created_at,
        });
      } else {
        setSelectedCandidateDetail(DEMO_CANDIDATE_DETAIL);
      }
      setIsDetailModalOpen(true);
    }
  };

  const handleLogout = () => {
    api.clearToken();
    setUser(null);
    setIsAuthModalOpen(true);
  };

  const handleExportPdf = () => {
    const url = api.getExportCandidatesPdfUrl(selectedJobId || undefined);
    window.open(url, '_blank');
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex flex-col md:flex-row font-sans">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/60 backdrop-blur-xs md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Recruiter Sidebar */}
      <RecruiterSidebar
        activeTab={activeTab}
        onTabChange={(tab) => setActiveTab(tab)}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        user={user}
        onLogout={handleLogout}
        candidateCount={candidates.length}
        jobCount={jobs.length}
      />

      {/* Main Content Area */}
      <div className="flex-1 md:pl-64 flex flex-col min-w-0">
        {/* Recruiter Topbar */}
        <header className="sticky top-0 z-20 h-16 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800 px-4 sm:px-6 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 rounded-lg text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 md:hidden"
            >
              {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            {/* Breadcrumb Indicator */}
            <div className="flex items-center gap-2 text-xs">
              <span className="font-bold text-purple-600 dark:text-purple-400">
                Recruiter Portal
              </span>
              <span className="text-zinc-400">/</span>
              <span className="font-semibold text-zinc-800 dark:text-zinc-200 capitalize">
                {activeTab === 'screening' ? 'Resume Screening (1-100 files)' : activeTab}
              </span>
            </div>
          </div>

          {/* Quick Header Actions */}
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setIsJobModalOpen(true)}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 transition-colors shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create Job</span>
            </button>

            <button
              onClick={() => setActiveTab('screening')}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-800 hover:bg-purple-100 transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Bulk Screen</span>
            </button>

            {/* Job Seeker Switcher */}
            <Link
              href="/dashboard"
              className="px-2.5 py-1.5 rounded-xl text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors flex items-center gap-1.5"
              title="Return to Job Seeker Dashboard"
            >
              <ArrowLeftRight className="w-3.5 h-3.5" />
              <span className="hidden lg:inline">Seeker Mode</span>
            </Link>

            {/* Recruiter Enterprise Badge */}
            <div className="hidden md:flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
              <ShieldCheck className="w-3 h-3" />
              <span>Enterprise Recruiter</span>
            </div>
          </div>
        </header>

        {/* Tab View Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {activeTab === 'jobs' && (
            <JobsView
              jobs={jobs}
              onOpenCreateModal={() => setIsJobModalOpen(true)}
              onSelectJobForScreening={(jobId) => {
                setSelectedJobId(jobId);
                setActiveTab('screening');
              }}
              onViewJobCandidates={(jobId) => {
                setSelectedJobId(jobId);
                setActiveTab('candidates');
              }}
              onDeleteJob={handleDeleteJob}
            />
          )}

          {activeTab === 'candidates' && (
            <CandidatesView
              candidates={candidates}
              jobs={jobs}
              selectedJobId={selectedJobId}
              onSelectJobId={(id) => setSelectedJobId(id)}
              onViewCandidateDetail={handleOpenCandidateDetail}
              onSwitchToScreening={() => setActiveTab('screening')}
            />
          )}

          {activeTab === 'screening' && (
            <BulkScreeningView
              jobs={jobs}
              selectedJobId={selectedJobId}
              onSelectJobId={(id) => setSelectedJobId(id)}
              onScreeningComplete={handleScreeningComplete}
              onViewCandidateDetail={handleOpenCandidateDetail}
            />
          )}

          {activeTab === 'reports' && (
            <ReportsView
              candidates={candidates}
              jobs={jobs}
              selectedJobId={selectedJobId}
            />
          )}

          {activeTab === 'settings' && <SettingsView user={user} />}
        </main>
      </div>

      {/* Modals */}
      <JobCreationModal
        isOpen={isJobModalOpen}
        onClose={() => setIsJobModalOpen(false)}
        onSubmit={handleJobCreated}
      />

      <CandidateDetailModal
        candidate={selectedCandidateDetail}
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        onExportPdf={handleExportPdf}
      />

      <RecruiterAuthModal
        isOpen={isAuthModalOpen}
        onSuccess={(authenticatedUser) => {
          setUser(authenticatedUser);
          setIsAuthModalOpen(false);
        }}
        onCancel={() => {
          setIsAuthModalOpen(false);
          window.location.href = '/dashboard';
        }}
      />
    </div>
  );
}
