'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { ScoreBadge } from '@/components/ui/ScoreBadge';
import {
  FileText,
  Plus,
  Sparkles,
  Wand2,
  PenTool,
  Copy,
  Trash2,
  Clock,
  Briefcase,
  UploadCloud,
  Check,
} from 'lucide-react';
import { api } from '@/lib/api';
import { Resume } from '@/types';
import { formatFileSize, formatDate } from '@/lib/utils';

export default function ResumeLibraryPage() {
  const router = useRouter();
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [loading, setLoading] = useState(true);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploading, setUploading] = useState(false);

  const loadResumes = async () => {
    try {
      const data = await api.getResumes();
      setResumes(data);
    } catch {
      setResumes([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadResumes();
  }, []);

  const handleDuplicate = async (id: string) => {
    try {
      await api.duplicateResume(id);
      loadResumes();
    } catch (err: any) {
      alert(err?.message || 'Failed to duplicate resume');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this resume version?')) return;
    try {
      await api.deleteResume(id);
      loadResumes();
    } catch (err: any) {
      alert(err?.message || 'Failed to delete resume');
    }
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadFile) return;
    setUploading(true);
    try {
      await api.uploadResume(uploadFile, uploadTitle || uploadFile.name.replace(/\.[^/.]+$/, ''));
      setShowUploadModal(false);
      setUploadFile(null);
      setUploadTitle('');
      loadResumes();
    } catch (err: any) {
      alert(err?.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-zinc-200 dark:border-zinc-800">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-100">
              Resume Library
            </h1>
            <p className="text-xs text-zinc-500 mt-1">
              Manage tailored versions of your resume for specific job functions and seniorities.
            </p>
          </div>

          <button
            onClick={() => setShowUploadModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200 transition-all shadow-xs w-fit"
          >
            <Plus className="w-4 h-4 text-indigo-400 dark:text-indigo-600" />
            <span>Upload New Version</span>
          </button>
        </div>

        {/* Resumes Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {resumes.map((resume) => (
            <div
              key={resume.id}
              className="p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs flex flex-col justify-between hover:border-zinc-300 dark:hover:border-zinc-700 transition-all"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="p-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
                    <FileText className="w-5 h-5" />
                  </div>
                  <ScoreBadge score={86} label="86% Avg ATS" size="sm" />
                </div>

                <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 line-clamp-1 mb-1">
                  {resume.title}
                </h3>
                <span className="text-xs text-zinc-500 block mb-3 font-mono">
                  {resume.file_name} ({formatFileSize(resume.file_size)})
                </span>

                <div className="space-y-1.5 py-3 border-y border-zinc-100 dark:border-zinc-800 text-xs text-zinc-600 dark:text-zinc-400">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-zinc-500">
                      <Clock className="w-3.5 h-3.5" /> Updated
                    </span>
                    <span>{formatDate(resume.updated_at)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-zinc-500">
                      <Briefcase className="w-3.5 h-3.5" /> Applications
                    </span>
                    <span className="font-semibold text-zinc-800 dark:text-zinc-200">3 Scans</span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="pt-4 mt-4 flex items-center justify-between gap-2">
                <div className="flex items-center gap-1">
                  <Link
                    href={`/tailor?resume_id=${resume.id}`}
                    className="p-2 rounded-lg text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors"
                    title="AI Tailor for specific Job Description"
                  >
                    <Wand2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  </Link>
                  <Link
                    href={`/analyze?resume_id=${resume.id}`}
                    className="p-2 rounded-lg text-xs font-semibold bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 hover:bg-zinc-200 transition-colors"
                    title="Analyze against job"
                  >
                    <Sparkles className="w-4 h-4 text-indigo-500" />
                  </Link>
                  <Link
                    href={`/editor?resume_id=${resume.id}`}
                    className="p-2 rounded-lg text-xs font-semibold bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 hover:bg-zinc-200 transition-colors"
                    title="Edit in bullet improver"
                  >
                    <PenTool className="w-4 h-4 text-zinc-500" />
                  </Link>
                  <button
                    onClick={() => handleDuplicate(resume.id)}
                    className="p-2 rounded-lg text-xs font-semibold bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 hover:bg-zinc-200 transition-colors"
                    title="Duplicate version"
                  >
                    <Copy className="w-4 h-4 text-zinc-500" />
                  </button>
                  <button
                    onClick={() => handleDelete(resume.id)}
                    className="p-2 rounded-lg text-xs font-semibold bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                    title="Delete version"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <Link
                  href="/analysis/demo-analysis-alex-stripe"
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 hover:opacity-90 transition-opacity"
                >
                  <span>Results</span>
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* Upload Modal */}
        {showUploadModal && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6 shadow-2xl">
              <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100 mb-1">
                Upload Resume Version
              </h3>
              <p className="text-xs text-zinc-500 mb-4">
                Support for PDF (.pdf) and Word documents (.docx).
              </p>

              <form onSubmit={handleUploadSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                    Custom Title
                  </label>
                  <input
                    type="text"
                    value={uploadTitle}
                    onChange={(e) => setUploadTitle(e.target.value)}
                    placeholder="e.g. Staff Systems Architect Resume"
                    className="w-full px-3 py-2 text-xs rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                    Select File
                  </label>
                  <input
                    type="file"
                    required
                    accept=".pdf,.docx"
                    onChange={(e) => e.target.files && setUploadFile(e.target.files[0])}
                    className="w-full text-xs text-zinc-600 dark:text-zinc-400 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-zinc-900 file:text-white dark:file:bg-zinc-100 dark:file:text-zinc-900"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-4 border-t border-zinc-100 dark:border-zinc-800">
                  <button
                    type="button"
                    onClick={() => setShowUploadModal(false)}
                    className="px-3 py-2 rounded-lg text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={uploading || !uploadFile}
                    className="px-4 py-2 rounded-xl text-xs font-semibold bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 hover:opacity-90 disabled:opacity-50"
                  >
                    {uploading ? 'Parsing...' : 'Upload & Parse'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
