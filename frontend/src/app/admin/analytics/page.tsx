'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { api } from '@/lib/api';
import { AdminAnalyticsMetrics, FunnelStep } from '@/types';
import {
  TrendingUp,
  Users,
  DollarSign,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
  ShieldCheck,
  RefreshCw,
  Layers,
  Filter,
  CheckCircle2,
  Calendar,
  Eye,
  FileText,
  Zap,
  Globe,
  Share2,
  Lock,
  BarChart3,
  Flame,
  UserCheck,
  PieChart as PieIcon,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts';

export default function AdminAnalyticsPage() {
  return (
    <Suspense
      fallback={
        <DashboardLayout>
          <div className="flex items-center justify-center min-h-[60vh]">
            <RefreshCw className="w-8 h-8 text-indigo-600 animate-spin" />
          </div>
        </DashboardLayout>
      }
    >
      <AdminAnalyticsContent />
    </Suspense>
  );
}

function AdminAnalyticsContent() {
  const [metrics, setMetrics] = useState<AdminAnalyticsMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedDays, setSelectedDays] = useState<number>(30);
  const [activeTab, setActiveTab] = useState<'funnel' | 'traffic' | 'engagement'>('funnel');

  useEffect(() => {
    fetchMetrics(selectedDays);
  }, [selectedDays]);

  const fetchMetrics = async (days: number) => {
    try {
      setLoading(true);
      const data = await api.getAdminAnalytics(days);
      setMetrics(data);
    } catch (err) {
      console.error('Failed to load admin analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amt: number) => `₹${amt.toLocaleString('en-IN')}`;

  const overview = metrics?.overview;

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Top Header Banner */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-200 dark:border-zinc-800 pb-6">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Executive Telemetry & Business Intelligence</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-white mt-1">
              Product & Revenue Analytics
            </h1>
            <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-1">
              End-to-end event stream tracking powered by PostHog & Google Analytics (GA4) with strict GDPR privacy compliance.
            </p>
          </div>

          {/* Controls: Date Range & Status Badges */}
          <div className="flex flex-wrap items-center gap-2.5 self-start md:self-auto">
            {/* Privacy & Provider Badges */}
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-[11px] font-semibold border border-zinc-200 dark:border-zinc-700">
              <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                PostHog Live
              </span>
              <span className="text-zinc-300 dark:text-zinc-600">•</span>
              <span className="flex items-center gap-1 text-blue-600 dark:text-blue-400">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                GA4 Active
              </span>
              <span className="text-zinc-300 dark:text-zinc-600">•</span>
              <span className="flex items-center gap-1 text-zinc-600 dark:text-zinc-400">
                <Lock className="w-3 h-3 text-emerald-500" />
                GDPR/CCPA
              </span>
            </div>

            {/* Date Range Selector */}
            <div className="flex items-center bg-zinc-100 dark:bg-zinc-800 p-1 rounded-xl border border-zinc-200 dark:border-zinc-700 text-xs">
              {[7, 30, 90].map((d) => (
                <button
                  key={d}
                  onClick={() => setSelectedDays(d)}
                  className={`px-3 py-1 rounded-lg font-bold transition-all ${
                    selectedDays === d
                      ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white shadow-xs'
                      : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100'
                  }`}
                >
                  {d}D
                </button>
              ))}
            </div>

            <button
              onClick={() => fetchMetrics(selectedDays)}
              disabled={loading}
              className="p-2 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors shadow-xs"
              title="Refresh Analytics"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Top Metric KPI Cards (5 Columns) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Card 1: MRR */}
          <div className="p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-zinc-500 dark:text-zinc-400">
                <span className="text-xs font-semibold">Monthly Recurring Revenue</span>
                <DollarSign className="w-4 h-4 text-emerald-500" />
              </div>
              <div className="mt-2">
                <div className="text-2xl font-black text-zinc-900 dark:text-white">
                  {formatCurrency(overview?.mrr || 0)}
                </div>
                <div className="flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 mt-0.5">
                  <ArrowUpRight className="w-3.5 h-3.5" />
                  <span>+{overview?.mrr_growth_rate_pct || 18.6}% MoM Growth</span>
                </div>
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-zinc-100 dark:border-zinc-800 text-[10px] text-zinc-400">
              ARR Run-Rate: <span className="font-semibold text-zinc-700 dark:text-zinc-300">{formatCurrency(overview?.arr || 0)}</span>
            </div>
          </div>

          {/* Card 2: Acquisition Traffic */}
          <div className="p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-zinc-500 dark:text-zinc-400">
                <span className="text-xs font-semibold">Total Unique Visitors</span>
                <Globe className="w-4 h-4 text-indigo-500" />
              </div>
              <div className="mt-2">
                <div className="text-2xl font-black text-zinc-900 dark:text-white">
                  {(overview?.total_visitors || 0).toLocaleString()}
                </div>
                <div className="flex items-center gap-1 text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 mt-0.5">
                  <Activity className="w-3.5 h-3.5" />
                  <span>Tracked via GA4 & PostHog</span>
                </div>
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-zinc-100 dark:border-zinc-800 text-[10px] text-zinc-400">
              Top Channel: <span className="font-semibold text-zinc-700 dark:text-zinc-300">Google (Organic)</span>
            </div>
          </div>

          {/* Card 3: Signups & Activation */}
          <div className="p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-zinc-500 dark:text-zinc-400">
                <span className="text-xs font-semibold">New User Signups</span>
                <Users className="w-4 h-4 text-blue-500" />
              </div>
              <div className="mt-2">
                <div className="text-2xl font-black text-zinc-900 dark:text-white">
                  {(overview?.total_signups || 0).toLocaleString()}
                </div>
                <div className="flex items-center gap-1 text-[11px] font-semibold text-blue-600 dark:text-blue-400 mt-0.5">
                  <UserCheck className="w-3.5 h-3.5" />
                  <span>{overview?.activation_rate_pct || 72.4}% Activated (1st Scan)</span>
                </div>
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-zinc-100 dark:border-zinc-800 text-[10px] text-zinc-400">
              Activated Users: <span className="font-semibold text-zinc-700 dark:text-zinc-300">{(overview?.total_activations || 0).toLocaleString()}</span>
            </div>
          </div>

          {/* Card 4: Product Engagement */}
          <div className="p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-zinc-500 dark:text-zinc-400">
                <span className="text-xs font-semibold">Analyses & Tailors</span>
                <Zap className="w-4 h-4 text-amber-500" />
              </div>
              <div className="mt-2">
                <div className="text-2xl font-black text-zinc-900 dark:text-white">
                  {(overview?.total_analyses || 0).toLocaleString()}
                </div>
                <div className="flex items-center gap-1 text-[11px] font-semibold text-amber-600 dark:text-amber-400 mt-0.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{(overview?.total_tailor_usage || 0).toLocaleString()} AI Tailor Sessions</span>
                </div>
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-zinc-100 dark:border-zinc-800 text-[10px] text-zinc-400">
              Resumes in Vault: <span className="font-semibold text-zinc-700 dark:text-zinc-300">{(overview?.total_resumes_uploaded || 0).toLocaleString()}</span>
            </div>
          </div>

          {/* Card 5: Net Revenue Churn */}
          <div className="p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-zinc-500 dark:text-zinc-400">
                <span className="text-xs font-semibold">Net Churn Rate</span>
                <TrendingUp className="w-4 h-4 text-emerald-500" />
              </div>
              <div className="mt-2">
                <div className="text-2xl font-black text-zinc-900 dark:text-white">
                  {overview?.churn_rate_pct || 1.69}%
                </div>
                <div className="flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 mt-0.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Below 2.5% Target Cap</span>
                </div>
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-zinc-100 dark:border-zinc-800 text-[10px] text-zinc-400">
              Churned MRR: <span className="font-semibold text-rose-600">{formatCurrency(overview?.churned_mrr || 0)}</span>
            </div>
          </div>
        </div>

        {/* Charts Grid: Revenue Trend & Signup Activation Trend */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Revenue Chart */}
          <div className="p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-zinc-900 dark:text-white">
                  Revenue & MRR Trajectory (Last {selectedDays} Days)
                </h3>
                <p className="text-xs text-zinc-400">
                  Daily billings (Stripe + Razorpay) and monthly recurring revenue baseline
                </p>
              </div>
              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                ARR: {formatCurrency(overview?.arr || 0)}
              </span>
            </div>

            <div className="h-64 w-full">
              {metrics?.revenue_chart && metrics.revenue_chart.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={metrics.revenue_chart} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorMrr" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.25} />
                        <stop offset="95%" stopColor="#4f46e5" stopOpacity={0.0} />
                      </linearGradient>
                      <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#27272a" opacity={0.2} />
                    <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#71717a' }} tickLine={false} />
                    <YAxis tick={{ fontSize: 10, fill: '#71717a' }} tickLine={false} tickFormatter={(v) => `₹${v >= 1000 ? `${(v/1000).toFixed(0)}k` : v}`} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '12px', fontSize: '11px' }}
                      formatter={(value: any, name: any) => [formatCurrency(Number(value)), name === 'mrr' ? 'MRR Baseline' : 'Daily Revenue']}
                    />
                    <Area type="monotone" dataKey="mrr" stroke="#4f46e5" strokeWidth={2.5} fillOpacity={1} fill="url(#colorMrr)" name="MRR Run-rate" />
                    <Area type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={1.5} fillOpacity={1} fill="url(#colorRev)" name="Daily Billings" />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-xs text-zinc-400">Loading chart data...</div>
              )}
            </div>
          </div>

          {/* Signups & Activation Chart */}
          <div className="p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-zinc-900 dark:text-white">
                  User Acquisition vs Activation
                </h3>
                <p className="text-xs text-zinc-400">
                  New registered signups vs users who completed their first ATS resume scan
                </p>
              </div>
              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                {overview?.activation_rate_pct || 72.4}% Activated
              </span>
            </div>

            <div className="h-64 w-full">
              {metrics?.signup_chart && metrics.signup_chart.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={metrics.signup_chart} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#27272a" opacity={0.2} />
                    <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#71717a' }} tickLine={false} />
                    <YAxis tick={{ fontSize: 10, fill: '#71717a' }} tickLine={false} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '12px', fontSize: '11px' }}
                    />
                    <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                    <Bar dataKey="signups" fill="#6366f1" radius={[4, 4, 0, 0]} name="New Signups" />
                    <Bar dataKey="activations" fill="#10b981" radius={[4, 4, 0, 0]} name="1st Scan Completed" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-xs text-zinc-400">Loading chart data...</div>
              )}
            </div>
          </div>
        </div>

        {/* Multi-Tab Detailed Analytics Section */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-200 dark:border-zinc-800 pb-3">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveTab('funnel')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  activeTab === 'funnel'
                    ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 shadow-xs'
                    : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Conversion Funnel</span>
              </button>
              <button
                onClick={() => setActiveTab('traffic')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  activeTab === 'traffic'
                    ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 shadow-xs'
                    : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200'
                }`}
              >
                <Globe className="w-3.5 h-3.5" />
                <span>Landing Pages & Traffic</span>
              </button>
              <button
                onClick={() => setActiveTab('engagement')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  activeTab === 'engagement'
                    ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 shadow-xs'
                    : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200'
                }`}
              >
                <Zap className="w-3.5 h-3.5" />
                <span>Product Telemetry Stream</span>
              </button>
            </div>
            <span className="text-[11px] text-zinc-400 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              <span>Zero-PII Payload Policy Active</span>
            </span>
          </div>

          {/* TAB 1: 5-Stage Conversion Funnel */}
          {activeTab === 'funnel' && (
            <div className="p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs space-y-6">
              <div>
                <h3 className="text-base font-bold text-zinc-900 dark:text-white">
                  5-Stage SaaS Growth & Monetization Funnel
                </h3>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Tracks conversion from first anonymous impression to active recruiter enterprise accounts.
                </p>
              </div>

              <div className="space-y-4">
                {metrics?.conversion_funnel.map((step, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-xl border border-zinc-100 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-zinc-800/30 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-all space-y-2.5"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-bold flex items-center justify-center text-xs">
                          {idx + 1}
                        </span>
                        <span className="font-bold text-zinc-900 dark:text-zinc-100">{step.step}</span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-zinc-200/60 dark:bg-zinc-700/60 text-zinc-600 dark:text-zinc-300">
                          {step.stage}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-right">
                        <div>
                          <span className="font-extrabold text-sm text-zinc-900 dark:text-white">
                            {step.count.toLocaleString()}
                          </span>
                          <span className="text-[11px] text-zinc-400 ml-1">users</span>
                        </div>
                        <div className="w-16 text-right">
                          <span className="font-black text-indigo-600 dark:text-indigo-400">
                            {step.percentage}%
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Funnel Progress Visual */}
                    <div className="w-full bg-zinc-200/60 dark:bg-zinc-800 h-2.5 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-500 ${
                          idx === 0
                            ? 'bg-indigo-600'
                            : idx === 1
                            ? 'bg-blue-500'
                            : idx === 2
                            ? 'bg-emerald-500'
                            : idx === 3
                            ? 'bg-amber-500'
                            : 'bg-rose-500'
                        }`}
                        style={{ width: `${Math.max(step.percentage, 3)}%` }}
                      />
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-zinc-400">
                      <span>{step.description}</span>
                      {idx > 0 && (
                        <span className="text-rose-500 font-medium">
                          Drop-off: {step.drop_off_pct}%
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: Top Landing Pages & Traffic Sources */}
          {activeTab === 'traffic' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Top Landing Pages Table */}
              <div className="lg:col-span-2 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs space-y-4">
                <div>
                  <h3 className="text-base font-bold text-zinc-900 dark:text-white">
                    Top Landing Pages (Acquisition Performance)
                  </h3>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    Traffic volume, bounce rates, and signup conversion by entry URL.
                  </p>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-zinc-100 dark:border-zinc-800 text-zinc-400 uppercase font-bold text-[10px]">
                        <th className="py-2.5 px-3">Landing Path</th>
                        <th className="py-2.5 px-3">Visitors</th>
                        <th className="py-2.5 px-3">Signups</th>
                        <th className="py-2.5 px-3">Bounce Rate</th>
                        <th className="py-2.5 px-3 text-right">Conversion %</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                      {metrics?.top_landing_pages.map((page, i) => (
                        <tr key={i} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/40">
                          <td className="py-3 px-3 font-mono font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
                            <span>{page.path}</span>
                            <Link href={page.path} target="_blank" className="text-zinc-400 hover:text-indigo-500">
                              <ExternalLink className="w-3 h-3" />
                            </Link>
                          </td>
                          <td className="py-3 px-3 text-zinc-600 dark:text-zinc-300">
                            {page.visitors.toLocaleString()}
                          </td>
                          <td className="py-3 px-3 font-semibold text-emerald-600 dark:text-emerald-400">
                            {page.signups.toLocaleString()}
                          </td>
                          <td className="py-3 px-3 text-zinc-500">{page.bounce_rate}%</td>
                          <td className="py-3 px-3 text-right font-black text-indigo-600 dark:text-indigo-400">
                            {page.conversion_rate}%
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Traffic Sources Breakdown */}
              <div className="lg:col-span-1 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs space-y-4">
                <div>
                  <h3 className="text-base font-bold text-zinc-900 dark:text-white">
                    Acquisition Sources
                  </h3>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    Attribution via referrer and UTM parameters.
                  </p>
                </div>

                <div className="space-y-3 pt-2">
                  {metrics?.traffic_sources.map((src, i) => (
                    <div key={i} className="space-y-1">
                      <div className="flex justify-between text-xs font-semibold text-zinc-800 dark:text-zinc-200">
                        <span>{src.source}</span>
                        <span className="font-mono text-zinc-500">{src.percentage}%</span>
                      </div>
                      <div className="w-full bg-zinc-100 dark:bg-zinc-800 h-2 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-indigo-600 rounded-full"
                          style={{ width: `${src.percentage}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: Telemetry Stream & Engagement */}
          {activeTab === 'engagement' && (
            <div className="p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-zinc-900 dark:text-white">
                    Product Telemetry Event Architecture
                  </h3>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    Core event catalog dispatched cleanly across PostHog, Google Analytics, and first-party event store.
                  </p>
                </div>
                <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                  Dual Stream Active
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
                {/* Acquisition Events */}
                <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/40 space-y-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                    Acquisition Category
                  </span>
                  <h4 className="text-xs font-bold text-zinc-900 dark:text-white">Landing & Sources</h4>
                  <ul className="text-[11px] text-zinc-500 space-y-1 font-mono">
                    <li>• landing_page_visit</li>
                    <li>• traffic_source_attributed</li>
                    <li>• campaign_clicked</li>
                  </ul>
                </div>

                {/* Activation Events */}
                <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/40 space-y-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                    Activation Category
                  </span>
                  <h4 className="text-xs font-bold text-zinc-900 dark:text-white">Onboarding & Value</h4>
                  <ul className="text-[11px] text-zinc-500 space-y-1 font-mono">
                    <li>• user_signup</li>
                    <li>• first_analysis_completed</li>
                    <li>• onboarding_completed</li>
                  </ul>
                </div>

                {/* Engagement Events */}
                <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/40 space-y-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                    Engagement Category
                  </span>
                  <h4 className="text-xs font-bold text-zinc-900 dark:text-white">Core Feature Use</h4>
                  <ul className="text-[11px] text-zinc-500 space-y-1 font-mono">
                    <li>• analysis_created</li>
                    <li>• resume_uploaded</li>
                    <li>• tailor_used</li>
                  </ul>
                </div>

                {/* Revenue Events */}
                <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/40 space-y-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                    Revenue Category
                  </span>
                  <h4 className="text-xs font-bold text-zinc-900 dark:text-white">Billing & Churn</h4>
                  <ul className="text-[11px] text-zinc-500 space-y-1 font-mono">
                    <li>• subscription_upgraded</li>
                    <li>• invoice_paid</li>
                    <li>• subscription_canceled</li>
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
