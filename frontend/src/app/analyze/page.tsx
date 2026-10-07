'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import {
  UploadCloud,
  FileText,
  Trash2,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Building,
  Briefcase,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { api } from '@/lib/api';
import { formatFileSize } from '@/lib/utils';

const ANALYSIS_STAGES = [
  'Reading your resume document structure...',
  'Extracting technical skills, frameworks, and tools...',
  'Analyzing job description requirements...',
  'Comparing keywords and alias variants...',
  'Checking ATS compatibility and layout rules...',
  'Generating explainable recommendations...',
];

const SAMPLE_RESUMES = [
  {
    title: 'Senior Backend Engineer Resume',
    filename: 'Alex_Rivera_Senior_Backend_Resume.pdf',
    size: 245000,
    text: `ALEX RIVERA\nSan Francisco, CA • alex.rivera.dev@gmail.com • (415) 890-2341\n\nSUMMARY\nSenior Backend & Systems Engineer with 6+ years of experience building high-throughput microservices, scalable distributed architectures, and developer platforms. Expertise in Python, FastAPI, PostgreSQL, and AWS.\n\nEXPERIENCE\nSenior Backend Engineer — CloudScale Technologies (2022 - Present)\n• Architected asynchronous REST APIs using FastAPI and PostgreSQL, serving 5M+ daily requests with sub-45ms p99 latency.\n• Engineered distributed caching layer with Redis cluster, reducing primary database load by 42%.\n• Spearheaded migration of monolithic Django service to containerized microservices orchestrated via Kubernetes on AWS ECS.\n\nSKILLS\nPython, Go, TypeScript, FastAPI, PostgreSQL, Redis, Docker, Kubernetes, AWS, REST APIs, Microservices, CI/CD`,
  },
  {
    title: 'Full Stack Product Engineer Resume',
    filename: 'Jordan_Taylor_Full_Stack.pdf',
    size: 198000,
    text: `JORDAN TAYLOR\nNew York, NY • jordan.taylor@example.com • (212) 555-0199\n\nSUMMARY\nProduct-minded Full Stack Engineer experienced in React, Next.js, Node.js, and TypeScript building high-conversion SaaS web applications.\n\nEXPERIENCE\nFull Stack Engineer — LaunchPad Interactive (2021 - Present)\n• Built responsive web applications using Next.js and Tailwind CSS with sub-second page loads.\n• Designed and integrated GraphQL and REST endpoints with Node.js and PostgreSQL.\n\nSKILLS\nReact, Next.js, TypeScript, Node.js, Tailwind CSS, PostgreSQL, GraphQL, Git`,
  },
];

const JOB_PRESETS = [
  {
    title: 'Senior Backend Engineer',
    company: 'Stripe',
    text: `About the Role:\nStripe is looking for a Senior Backend Engineer to join our Core Platform team. You will design, build, and operate resilient backend services and REST APIs supporting global transactional scale.\n\nRequirements:\n• 5+ years of software engineering experience with backend systems.\n• Deep proficiency in Python, Go, or Java with web frameworks (e.g. FastAPI, Django).\n• Hands-on expertise with PostgreSQL, SQL optimization, and distributed caching (Redis).\n• Strong working knowledge of cloud platforms (AWS), Docker, Kubernetes, and CI/CD pipelines.\n• Solid foundation in microservices architecture, system design, and API security.`,
  },
  {
    title: 'Staff Platform Engineer',
    company: 'Vercel',
    text: `Vercel is seeking a Staff Platform Engineer to scale developer infrastructure and global Edge deployments. Experience with Go, TypeScript, Kubernetes, and distributed systems required.`,
  },
];

export default function NewAnalysisPage() {
  const router = useRouter();

  // Form State
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [resumeText, setResumeText] = useState<string>('');
  const [resumeName, setResumeName] = useState<string>('');
  const [fileSize, setFileSize] = useState<number>(0);

  const [jobTitle, setJobTitle] = useState('Senior Backend Engineer');
  const [jobCompany, setJobCompany] = useState('Stripe');
  const [jobDescription, setJobDescription] = useState(JOB_PRESETS[0].text);

  // Workflow & Loading State
  const [analyzing, setAnalyzing] = useState(false);
  const [currentStageIdx, setCurrentStageIdx] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setResumeFile(file);
      setResumeName(file.name);
      setFileSize(file.size);
      setResumeText(''); // Let backend parse real binary file
    }
  };

  const handleSelectSampleResume = (sample: typeof SAMPLE_RESUMES[0]) => {
    setResumeFile(null);
    setResumeName(sample.filename);
    setFileSize(sample.size);
    setResumeText(sample.text);
  };

  const handleSelectJobPreset = (preset: typeof JOB_PRESETS[0]) => {
    setJobTitle(preset.title);
    setJobCompany(preset.company);
    setJobDescription(preset.text);
  };

  const handleStartAnalysis = async () => {
    if (!resumeFile && !resumeText) {
      setErrorMessage('Please upload a resume or select a sample resume.');
      return;
    }
    if (!jobDescription.trim() || !jobTitle.trim()) {
      setErrorMessage('Please provide a job title and job description.');
      return;
    }

    setErrorMessage(null);
    setAnalyzing(true);
    setCurrentStageIdx(0);

    // Progress through stages smoothly
    const interval = setInterval(() => {
      setCurrentStageIdx((prev) => (prev < ANALYSIS_STAGES.length - 1 ? prev + 1 : prev));
    }, 600);

    try {
      let analysisResult;

      if (resumeFile) {
        // Upload resume file first
        const uploaded = await api.uploadResume(resumeFile, resumeFile.name.replace(/\.[^/.]+$/, ''));
        // Run analysis on uploaded resume ID
        analysisResult = await api.runAnalysis({
          resume_id: uploaded.id,
          job_title: jobTitle,
          job_company: jobCompany,
          job_text: jobDescription,
        });
      } else {
        // Run analysis using raw resume text
        analysisResult = await api.runAnalysis({
          resume_text: resumeText,
          resume_filename: resumeName || 'Resume.pdf',
          job_title: jobTitle,
          job_company: jobCompany,
          job_text: jobDescription,
        });
      }

      clearInterval(interval);
      setTimeout(() => {
        router.push(`/analysis/${analysisResult.id}`);
      }, 700);
    } catch (err: any) {
      clearInterval(interval);
      setAnalyzing(false);
      setErrorMessage(err?.message || 'Analysis encountered an issue. Please try again.');
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-8">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-100">
            New ATS Resume Analysis
          </h1>
          <p className="text-xs text-zinc-500 mt-1">
            Compare your resume against any job description to discover missing keywords, ATS formatting traps, and skill gaps.
          </p>
        </div>

        {errorMessage && (
          <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs text-rose-700 dark:text-rose-400 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Step 1: Resume Upload */}
        <div className="p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 flex items-center justify-center text-xs font-bold">
                1
              </span>
              <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                Upload Resume (PDF or DOCX)
              </h2>
            </div>
            <span className="text-[11px] text-zinc-400">Max size 10MB</span>
          </div>

          {resumeName ? (
            <div className="p-4 rounded-xl border border-emerald-200 dark:border-emerald-800/80 bg-emerald-50/40 dark:bg-emerald-950/20 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-lg bg-emerald-100 dark:bg-emerald-900/60 text-emerald-600 dark:text-emerald-400">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                    {resumeName}
                  </h4>
                  <span className="text-[11px] text-zinc-500">
                    {formatFileSize(fileSize)} • Ready for ATS scan
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setResumeFile(null);
                  setResumeName('');
                  setResumeText('');
                }}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                title="Remove resume"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div>
              <label className="border-2 border-dashed border-zinc-200 dark:border-zinc-800 hover:border-zinc-400 dark:hover:border-zinc-600 rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer transition-colors bg-zinc-50/50 dark:bg-zinc-800/20">
                <UploadCloud className="w-8 h-8 text-indigo-500 mb-2" />
                <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                  Click to browse or drag and drop your resume
                </span>
                <span className="text-[11px] text-zinc-500 mt-0.5">
                  Supports PDF (.pdf) and Microsoft Word (.docx)
                </span>
                <input
                  type="file"
                  accept=".pdf,.docx,.doc"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>

              {/* Sample Resumes Option */}
              <div className="mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-800">
                <span className="text-[11px] text-zinc-500 block mb-2 font-medium">
                  Or select a pre-loaded sample resume:
                </span>
                <div className="flex flex-wrap gap-2">
                  {SAMPLE_RESUMES.map((sample, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSelectSampleResume(sample)}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:border-indigo-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors flex items-center gap-1.5"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>{sample.title}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Step 2: Target Job Description */}
        <div className="p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 flex items-center justify-center text-xs font-bold">
                2
              </span>
              <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                Target Job Description
              </h2>
            </div>
            {/* Presets */}
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] text-zinc-400 hidden sm:inline">Presets:</span>
              {JOB_PRESETS.map((p, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSelectJobPreset(p)}
                  className="px-2 py-0.5 rounded text-[10px] font-semibold border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:border-zinc-400"
                >
                  {p.company}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1 flex items-center gap-1">
                <Briefcase className="w-3.5 h-3.5 text-zinc-400" />
                <span>Job Title</span>
              </label>
              <input
                type="text"
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                placeholder="e.g. Senior Backend Engineer"
                className="w-full px-3 py-2 text-xs rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1 flex items-center gap-1">
                <Building className="w-3.5 h-3.5 text-zinc-400" />
                <span>Company Name</span>
              </label>
              <input
                type="text"
                value={jobCompany}
                onChange={(e) => setJobCompany(e.target.value)}
                placeholder="e.g. Stripe, Vercel, Datadog"
                className="w-full px-3 py-2 text-xs rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
              Job Description Requirements & Scope
            </label>
            <textarea
              rows={8}
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder="Paste the complete job description text here..."
              className="w-full px-3 py-2 text-xs font-mono rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>
        </div>

        {/* Action Button */}
        <div className="flex justify-end">
          <button
            type="button"
            onClick={handleStartAnalysis}
            disabled={analyzing}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl text-sm font-semibold bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200 transition-all shadow-md hover:shadow-lg disabled:opacity-50"
          >
            <Sparkles className="w-4 h-4 text-indigo-400 dark:text-indigo-600" />
            <span>Launch ATS Audit & Analysis</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Step 3: Polished Loading Modal State */}
        {analyzing && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6 sm:p-8 shadow-2xl text-center space-y-6 animate-fade-in">
              <div className="w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 flex items-center justify-center mx-auto text-indigo-600 dark:text-indigo-400">
                <Loader2 className="w-7 h-7 animate-spin" />
              </div>

              <div>
                <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                  Auditing Resume Compatibility
                </h3>
                <p className="text-xs text-zinc-500 mt-1">
                  Applying deterministic scoring algorithm against target job description.
                </p>
              </div>

              {/* Progress Steps List */}
              <div className="space-y-2.5 text-left border-y border-zinc-100 dark:border-zinc-800 py-4">
                {ANALYSIS_STAGES.map((stage, idx) => {
                  const isDone = idx < currentStageIdx;
                  const isCurrent = idx === currentStageIdx;
                  return (
                    <div
                      key={idx}
                      className={`flex items-center gap-2.5 text-xs transition-opacity ${
                        isDone
                          ? 'text-emerald-600 dark:text-emerald-400 font-medium'
                          : isCurrent
                          ? 'text-zinc-900 dark:text-zinc-100 font-bold'
                          : 'text-zinc-400 opacity-40'
                      }`}
                    >
                      {isDone ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                      ) : isCurrent ? (
                        <Loader2 className="w-4 h-4 text-indigo-500 animate-spin shrink-0" />
                      ) : (
                        <div className="w-4 h-4 rounded-full border border-zinc-300 dark:border-zinc-700 shrink-0" />
                      )}
                      <span>{stage}</span>
                    </div>
                  );
                })}
              </div>

              <div className="text-[11px] text-zinc-400">
                Parsing PyMuPDF vectors • Calculating keyword density • Deterministic scoring
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
