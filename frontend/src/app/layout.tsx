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
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://resumeiq.ai'),
  title: {
    default: 'ResumeIQ AI — AI-Powered ATS Resume Analyzer & Hiring Platform',
    template: '%s | ResumeIQ AI',
  },
  description:
    'Make your resume beat the ATS. Deterministic ATS compatibility scoring, categorized missing keywords, skill gap radar, AI bullet optimization, and automated B2B hiring copilot.',
  keywords: [
    'ATS resume analyzer',
    'AI resume optimizer',
    'ATS compatibility checker',
    'resume bullet improver',
    'job match score',
    'ATS keywords',
    'AI hiring copilot',
    'recruiter resume screening',
  ],
  authors: [{ name: 'ResumeIQ AI Engineering Team' }],
  openGraph: {
    title: 'ResumeIQ AI — AI-Powered ATS Resume Analyzer',
    description:
      'Beat applicant tracking systems with deterministic scoring, keyword gap detection, and AI resume tailoring.',
    url: 'https://resumeiq.ai',
    siteName: 'ResumeIQ AI',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ResumeIQ AI — AI-Powered ATS Resume Analyzer',
    description:
      'Deterministic ATS scoring and AI resume tailoring for top engineers.',
  },
  robots: {
    index: true,
    follow: true,
  },
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
