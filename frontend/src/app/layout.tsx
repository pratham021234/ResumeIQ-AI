import type { Metadata, Viewport } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'ResumeIQ AI — AI-Powered ATS Resume Analyzer',
  description:
    'Make your resume beat the ATS. Deterministic ATS compatibility scoring, categorized missing keywords, skill gap radar, and AI bullet optimization.',
  keywords: [
    'ATS resume analyzer',
    'AI resume optimizer',
    'ATS compatibility checker',
    'resume bullet improver',
    'job match score',
    'ATS keywords',
  ],
  authors: [{ name: 'ResumeIQ AI Engineering Team' }],
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100">
        {children}
      </body>
    </html>
  );
}
