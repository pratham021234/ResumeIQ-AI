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
  AlertTriangle,
  X,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  FolderOpen,
} from 'lucide-react';
import { api } from '@/lib/api';
import { Resume } from '@/types';
import { formatFileSize, formatDate } from '@/lib/utils';

export default function ResumeLibraryPage() {
  const router = useRouter();
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [loading, setLoading] = useState(true);

  // Upload modal state
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploading, setUploading] = useState(false);

  // Delete modal state
  const [resumeToDelete, setResumeToDelete] = useState<Resume | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // User feedback toast state
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const showNotification = (type: 'success' | 'error', message: string) => {
    setFeedback({ type, message });
    setTimeout(() => {
      setFeedback(null);
    }, 4500);
  };

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

  const handleDuplicate = async (id: string, title: string) => {
    try {
      await api.duplicateResume(id);
      showNotification('success', `Created duplicated copy of "${title}"`);
      loadResumes();
    } catch (err: any) {
      showNotification('error', err?.message || 'Failed to duplicate resume');
    }
  };

  const handleConfirmDelete = async () => {
    if (!resumeToDelete) return;
    const targetId = resumeToDelete.id;
    const targetTitle = resumeToDelete.title;

    // Optimistic UI update: immediately remove from current view
    const previousResumes = [...resumes];
    setResumes((prev) => prev.filter((r) => r.id !== targetId));
    setIsDeleting(true);

    try {
      await api.deleteResume(targetId);
      showNotification('success', `"${targetTitle}" has been deleted permanently.`);
      setResumeToDelete(null);
    } catch (err: any) {
      // Rollback on failure
      setResumes(previousResumes);
      showNotification('error', err?.message || 'Failed to delete resume from server.');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadFile) return;
    setUploading(true);
    try {
      const newResume = await api.uploadResume(uploadFile, uploadTitle || uploadFile.name.replace(/\.[^/.]+$/, ''));
      setShowUploadModal(false);
      setUploadFile(null);
      setUploadTitle('');
      showNotification('success', `"${newResume.title}" uploaded and parsed successfully.`);
      loadResumes();
    } catch (err: any) {
      showNotification('error', err?.message || 'Resume upload failed');
    } finally {
      setUploading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-6xl mx-auto">
        {/* Header */}
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

        {/* Feedback Alert Toast */}
        {feedback && (
          <div
            className={`p-4 rounded-xl border flex items-center justify-between transition-all ${
              feedback.type === 'success'
                ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200'
                : 'bg-rose-50 dark:bg-rose-950/40 border-rose-300 dark:border-rose-800 text-rose-900 dark:text-rose-200'
            }`}
          >
            <div className="flex items-center gap-2.5">
              {feedback.type === 'success' ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
              ) : (
                <AlertCircle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0" />
              )}
              <span className="text-sm font-medium">{feedback.message}</span>
            </div>
            <button
              onClick={() => setFeedback(null)}
              className="text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Resumes Grid / Empty State */}
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center text-center space-y-3">
            <RefreshCw className="w-8 h-8 text-indigo-600 animate-spin" />
            <p className="text-xs text-zinc-500">Loading your resumes...</p>
          </div>
        ) : resumes.length === 0 ? (
          <div className="py-16 px-4 border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-2xl flex flex-col items-center justify-center text-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-400">
              <FolderOpen className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                No Resumes Found
              </h3>
              <p className="text-xs text-zinc-500 mt-1 max-w-sm">
                You haven&apos;t uploaded any resume versions yet or they have all been deleted. Upload your baseline resume to get started.
              </p>
            </div>
            <button
              onClick={() => setShowUploadModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 hover:opacity-90"
            >
              <Plus className="w-4 h-4" />
              <span>Upload Resume</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {resumes.map((resume) => (
              <div
                key={resume.id}
                className="p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs flex flex-col justify-between hover:border-zinc-300 dark:hover:border-zinc-700 transition-all group"
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
                      onClick={() => handleDuplicate(resume.id, resume.title)}
                      className="p-2 rounded-lg text-xs font-semibold bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 hover:bg-zinc-200 transition-colors"
                      title="Duplicate version"
                    >
                      <Copy className="w-4 h-4 text-zinc-500" />
                    </button>
                    <button
                      onClick={() => setResumeToDelete(resume)}
                      className="p-2 rounded-lg text-xs font-semibold bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
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
        )}

        {/* Delete Confirmation Modal */}
        {resumeToDelete && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="w-full max-w-sm bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
              <div className="w-11 h-11 rounded-2xl bg-rose-100 dark:bg-rose-950/60 text-rose-600 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5" />
              </div>

              <div>
                <h3 className="text-base font-bold text-zinc-900 dark:text-white">
                  Delete Resume Version?
                </h3>
                <p className="text-xs text-zinc-500 mt-1">
                  Are you sure you want to delete <span className="font-semibold text-zinc-800 dark:text-zinc-200">&quot;{resumeToDelete.title}&quot;</span>?
                </p>
                <div className="mt-2.5 p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700/60 text-[11px] text-zinc-600 dark:text-zinc-400 space-y-1">
                  <div className="flex justify-between font-mono">
                    <span>File:</span>
                    <span className="truncate max-w-[180px]">{resumeToDelete.file_name}</span>
                  </div>
                  <div className="flex justify-between font-mono">
                    <span>Size:</span>
                    <span>{formatFileSize(resumeToDelete.file_size)}</span>
                  </div>
                </div>
                <p className="text-[11px] text-rose-600 dark:text-rose-400 font-medium mt-2">
                  This action is permanent and cannot be undone. All linked ATS scan results will also be deleted.
                </p>
              </div>

              <div className="pt-2 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setResumeToDelete(null)}
                  disabled={isDeleting}
                  className="flex-1 py-2 rounded-xl text-xs font-semibold border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDelete}
                  disabled={isDeleting}
                  className="flex-1 py-2 rounded-xl text-xs font-bold bg-rose-600 text-white hover:bg-rose-700 transition-colors shadow-xs flex items-center justify-center gap-1.5 disabled:opacity-50"
                >
                  {isDeleting ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Deleting...</span>
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete Resume</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Upload Modal */}
        {showUploadModal && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
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
