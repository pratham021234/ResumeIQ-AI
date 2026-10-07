'use client';

import React, { useState } from 'react';
import { X, Briefcase, Plus, Sparkles, Building2, Layers, CheckCircle2, AlertCircle } from 'lucide-react';
import { RecruiterJobCreate } from '@/types';

interface JobCreationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (jobData: RecruiterJobCreate) => Promise<void>;
}

const COMMON_SUGGESTED_SKILLS = [
  'Python',
  'FastAPI',
  'PostgreSQL',
  'Redis',
  'Docker',
  'Kubernetes',
  'AWS',
  'Go',
  'TypeScript',
  'React',
  'Next.js',
  'Microservices',
  'REST APIs',
  'System Design',
  'CI/CD Pipelines',
];

const EXPERIENCE_LEVELS = [
  { value: 'Entry', label: 'Entry Level (0-2 years)' },
  { value: 'Mid-Level', label: 'Mid-Level (3-5 years)' },
  { value: 'Senior', label: 'Senior (5-8 years)' },
  { value: 'Lead', label: 'Lead / Staff (8+ years)' },
  { value: 'Executive', label: 'Executive / Director' },
];

export const JobCreationModal: React.FC<JobCreationModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [title, setTitle] = useState('');
  const [company, setCompany] = useState('');
  const [description, setDescription] = useState('');
  const [experienceLevel, setExperienceLevel] = useState('Senior');
  const [skillInput, setSkillInput] = useState('');
  const [skills, setSkills] = useState<string[]>(['Python', 'FastAPI', 'PostgreSQL', 'Docker']);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleAddSkill = (skill: string) => {
    const trimmed = skill.trim();
    if (trimmed && !skills.includes(trimmed)) {
      setSkills([...skills, trimmed]);
      setSkillInput('');
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setSkills(skills.filter((s) => s !== skillToRemove));
  };

  const handleKeyDownSkill = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      handleAddSkill(skillInput);
    }
  };

  const handleApplyTemplate = (type: 'backend' | 'ai' | 'fullstack') => {
    if (type === 'backend') {
      setTitle('Senior Backend Engineer');
      setCompany('Stripe');
      setExperienceLevel('Senior');
      setDescription(
        `About the Role:
We are looking for a Senior Backend Engineer to join our Core Platform team. You will architect, build, and operate resilient high-throughput microservices and REST APIs supporting global transactional scale.

Key Responsibilities:
• Build asynchronous distributed services with sub-45ms latency SLAs.
• Optimize PostgreSQL database queries, clustering, and Redis caching.
• Deploy scalable workloads with Docker and Kubernetes on AWS.
• Ensure automated CI/CD testing with Pytest and GitHub Actions.`
      );
      setSkills(['Python', 'FastAPI', 'PostgreSQL', 'Redis', 'Docker', 'Kubernetes', 'AWS', 'REST APIs']);
    } else if (type === 'ai') {
      setTitle('Lead AI Systems Engineer');
      setCompany('Anthropic');
      setExperienceLevel('Lead');
      setDescription(
        `About the Role:
Join our Distributed AI Platforms team to develop high-performance inference runtime infrastructure, model serving APIs, and cluster scheduling tools.

Key Responsibilities:
• Scale multi-GPU distributed clusters for low-latency LLM serving.
• Develop high-throughput streaming endpoints with Python, C++, and Ray.
• Architect telemetry, observability, and containerized Kubernetes nodes.`
      );
      setSkills(['Python', 'PyTorch', 'Kubernetes', 'Ray', 'CUDA', 'Docker', 'Distributed Systems']);
    } else {
      setTitle('Staff Full Stack Engineer');
      setCompany('Vercel');
      setExperienceLevel('Senior');
      setDescription(
        `About the Role:
We are seeking an experienced Staff Full Stack Engineer to build developer experience products, Edge functions, and responsive cloud applications.

Key Responsibilities:
• Build enterprise-grade Next.js, React, and TypeScript user interfaces.
• Design serverless APIs and database schemas with PostgreSQL.
• Implement real-time monitoring and web performance optimizations.`
      );
      setSkills(['TypeScript', 'React', 'Next.js', 'Node.js', 'PostgreSQL', 'TailwindCSS']);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Job title is required');
      return;
    }
    if (!company.trim()) {
      setError('Company name is required');
      return;
    }
    if (!description.trim()) {
      setError('Job description is required');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      await onSubmit({
        title: title.trim(),
        company: company.trim(),
        description: description.trim(),
        skills,
        experience_level: experienceLevel,
      });
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Failed to create job');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="relative w-full max-w-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between bg-zinc-50/50 dark:bg-zinc-900/50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-purple-600/10 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <Briefcase className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                Create Job Requisition
              </h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Define role requirements for automatic ATS resume scoring & applicant ranking
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Templates Banner */}
        <div className="px-6 py-2.5 bg-purple-50/50 dark:bg-purple-950/20 border-b border-purple-100 dark:border-purple-900/30 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs text-purple-700 dark:text-purple-300 font-medium">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Load Quick Template:</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleApplyTemplate('backend')}
              className="text-[11px] font-semibold px-2 py-0.5 rounded bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700 hover:border-purple-400 transition-colors"
            >
              Backend Lead (Stripe)
            </button>
            <button
              type="button"
              onClick={() => handleApplyTemplate('ai')}
              className="text-[11px] font-semibold px-2 py-0.5 rounded bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700 hover:border-purple-400 transition-colors"
            >
              AI Systems (Anthropic)
            </button>
            <button
              type="button"
              onClick={() => handleApplyTemplate('fullstack')}
              className="text-[11px] font-semibold px-2 py-0.5 rounded bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700 hover:border-purple-400 transition-colors"
            >
              Full Stack (Vercel)
            </button>
          </div>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 text-xs text-red-600 dark:text-red-300 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Row: Title & Company */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1.5">
                Job Title <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Briefcase className="absolute left-3 top-2.5 w-4 h-4 text-zinc-400" />
                <input
                  type="text"
                  required
                  placeholder="e.g. Senior Backend Engineer"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 rounded-xl text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1.5">
                Company <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Building2 className="absolute left-3 top-2.5 w-4 h-4 text-zinc-400" />
                <input
                  type="text"
                  required
                  placeholder="e.g. Stripe, Airbnb, Scale AI"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 rounded-xl text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>
          </div>

          {/* Experience Level */}
          <div>
            <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1.5">
              Experience Level <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Layers className="absolute left-3 top-2.5 w-4 h-4 text-zinc-400" />
              <select
                value={experienceLevel}
                onChange={(e) => setExperienceLevel(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 rounded-xl text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                {EXPERIENCE_LEVELS.map((level) => (
                  <option key={level.value} value={level.value}>
                    {level.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1.5">
              Job Description & Core Requirements <span className="text-red-500">*</span>
            </label>
            <textarea
              required
              rows={5}
              placeholder="Paste or write the job requirements, responsibilities, technical expectations..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-3 text-xs bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 rounded-xl text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-purple-500 leading-relaxed font-sans"
            />
          </div>

          {/* Skills Tag Input */}
          <div>
            <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1.5">
              Required & Must-Have Skills ({skills.length})
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                placeholder="Type skill & press Enter (e.g. Docker, Kafka, AWS)"
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                onKeyDown={handleKeyDownSkill}
                className="flex-1 px-3 py-1.5 text-xs bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 rounded-xl text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <button
                type="button"
                onClick={() => handleAddSkill(skillInput)}
                className="px-3 py-1.5 text-xs font-semibold rounded-xl bg-purple-600 hover:bg-purple-700 text-white transition-colors"
              >
                Add
              </button>
            </div>

            {/* Selected Skills Pills */}
            <div className="flex flex-wrap gap-1.5 min-h-[32px] p-2 bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 rounded-xl mb-2">
              {skills.length === 0 ? (
                <span className="text-[11px] text-zinc-400">No skills added yet. Add skills or select below.</span>
              ) : (
                skills.map((skill) => (
                  <span
                    key={skill}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs font-medium bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800"
                  >
                    <span>{skill}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveSkill(skill)}
                      className="hover:text-red-500"
                    >
                      ×
                    </button>
                  </span>
                ))
              )}
            </div>

            {/* Suggestions */}
            <div className="flex flex-wrap items-center gap-1 pt-1">
              <span className="text-[11px] text-zinc-500 mr-1">Suggestions:</span>
              {COMMON_SUGGESTED_SKILLS.slice(0, 8).map((s) => (
                <button
                  type="button"
                  key={s}
                  onClick={() => handleAddSkill(s)}
                  className={`text-[10px] px-2 py-0.5 rounded-md border transition-all ${
                    skills.includes(s)
                      ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-400 border-zinc-200 dark:border-zinc-800 opacity-60'
                      : 'bg-white dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700 hover:border-purple-400'
                  }`}
                  disabled={skills.includes(s)}
                >
                  + {s}
                </button>
              ))}
            </div>
          </div>

          {/* Modal Footer */}
          <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 rounded-xl shadow-sm transition-all disabled:opacity-50 flex items-center gap-1.5"
            >
              {isSubmitting ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Publishing Job...</span>
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  <span>Create Requisition</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
