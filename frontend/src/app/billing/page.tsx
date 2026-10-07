'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { api } from '@/lib/api';
import {
  BillingOverview,
  BillingPlan,
  Invoice,
  Payment,
  UsageTracker,
  Subscription,
  CheckoutSessionResponse,
} from '@/types';
import {
  CreditCard,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  RefreshCw,
  Sparkles,
  Zap,
  ShieldCheck,
  Download,
  ArrowRight,
  Clock,
  Layers,
  FileText,
  Users,
  Check,
  Lock,
  ChevronRight,
  ExternalLink,
  Flame,
  AlertCircle,
  X,
} from 'lucide-react';

export default function BillingPage() {
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
      <BillingContent />
    </Suspense>
  );
}

function BillingContent() {
  const searchParams = useSearchParams();
  const initialPlanParam = searchParams.get('plan');


  const [overview, setOverview] = useState<BillingOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<'stripe' | 'razorpay'>('stripe');

  // Checkout Modal State
  const [checkoutModalOpen, setCheckoutModalOpen] = useState(false);
  const [checkoutPlan, setCheckoutPlan] = useState<BillingPlan | null>(null);
  const [checkoutSession, setCheckoutSession] = useState<CheckoutSessionResponse | null>(null);
  const [checkoutStep, setCheckoutStep] = useState<'form' | 'processing' | 'success'>('form');
  const [cardDetails, setCardDetails] = useState({
    number: '4242 •••• •••• 4242',
    exp: '12/28',
    cvc: '888',
    name: 'Alex Rivera',
  });
  const [upiDetails, setUpiDetails] = useState({
    vpa: 'alexrivera@okhdfcbank',
    app: 'Google Pay / PhonePe',
  });

  // Cancel / Downgrade Modal State
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [downgradeModalOpen, setDowngradeModalOpen] = useState(false);
  const [targetDowngradePlan, setTargetDowngradePlan] = useState<string>('free');

  // Receipt Modal State
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [feedbackMessage, setFeedbackMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    loadBillingData();
  }, []);

  // If query parameter specified a plan, trigger checkout modal once overview is loaded
  useEffect(() => {
    if (initialPlanParam && overview?.plans) {
      const match = overview.plans.find((p) => p.id === initialPlanParam);
      if (match && overview.current_plan !== initialPlanParam) {
        handleOpenCheckout(match);
      }
    }
  }, [initialPlanParam, overview?.plans]);

  const loadBillingData = async () => {
    try {
      setLoading(true);
      const data = await api.getBillingOverview();
      setOverview(data);
    } catch (err: any) {
      console.error('Failed to load billing overview:', err);
    } finally {
      setLoading(false);
    }
  };

  const showNotification = (type: 'success' | 'error', text: string) => {
    setFeedbackMessage({ type, text });
    setTimeout(() => {
      setFeedbackMessage(null);
    }, 5000);
  };

  const handleOpenCheckout = async (plan: BillingPlan) => {
    try {
      setActionLoading(true);
      setCheckoutPlan(plan);
      setCheckoutStep('form');
      const session = await api.createCheckoutSession({
        plan_id: plan.id,
        provider: selectedProvider,
      });
      setCheckoutSession(session);
      setCheckoutModalOpen(true);
    } catch (err: any) {
      showNotification('error', err?.message || 'Failed to initialize payment gateway.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleProcessPayment = async () => {
    if (!checkoutPlan) return;
    try {
      setCheckoutStep('processing');
      // Verify payment with backend
      const res = await api.verifyPayment({
        plan_id: checkoutPlan.id,
        provider: selectedProvider,
        payment_id: selectedProvider === 'stripe' ? 'pi_mock_' + Date.now() : 'pay_mock_' + Date.now(),
        payment_method: selectedProvider === 'stripe' ? 'credit_card' : 'upi',
      });

      if (res.success) {
        setCheckoutStep('success');
        await loadBillingData();
        showNotification('success', `Subscribed successfully to ${checkoutPlan.name} Plan!`);
      } else {
        throw new Error(res.message || 'Payment processing failed');
      }
    } catch (err: any) {
      setCheckoutStep('form');
      showNotification('error', err?.message || 'Payment verification failed. Please try again.');
    }
  };

  const handleCancelSubscription = async (immediate: boolean) => {
    try {
      setActionLoading(true);
      const res = await api.cancelSubscription(immediate);
      setCancelModalOpen(false);
      await loadBillingData();
      showNotification('success', res.message || 'Subscription cancellation updated.');
    } catch (err: any) {
      showNotification('error', err?.message || 'Failed to cancel subscription.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDowngrade = async (planId: string) => {
    try {
      setActionLoading(true);
      const res = await api.downgradeSubscription(planId);
      setDowngradeModalOpen(false);
      await loadBillingData();
      showNotification('success', res.message || `Switched plan to ${planId.toUpperCase()}.`);
    } catch (err: any) {
      showNotification('error', err?.message || 'Failed to downgrade plan.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleSimulateFailure = async () => {
    try {
      setActionLoading(true);
      const res = await api.simulateFailedPayment(selectedProvider, 'Card declined: Insufficient funds');
      await loadBillingData();
      showNotification('error', 'Simulated recurring payment failure! Account marked past due.');
    } catch (err: any) {
      showNotification('error', err?.message || 'Simulation failed.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleSimulateTrialExpiry = async () => {
    try {
      setActionLoading(true);
      const res = await api.simulateTrialExpiration();
      await loadBillingData();
      showNotification('error', 'Simulated trial expiration! Plan reverted to Free.');
    } catch (err: any) {
      showNotification('error', err?.message || 'Simulation failed.');
    } finally {
      setActionLoading(false);
    }
  };

  const formatCurrency = (amt: number) => {
    return `₹${amt.toLocaleString('en-IN')}`;
  };

  const formatDate = (isoString?: string) => {
    if (!isoString) return '—';
    try {
      return new Date(isoString).toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return isoString;
    }
  };

  const currentPlan = overview?.plans.find((p) => p.id === overview.current_plan) || {
    id: overview?.current_plan || 'free',
    name: overview?.current_plan ? overview.current_plan.toUpperCase() : 'Free',
    price_inr: overview?.current_plan === 'recruiter' ? 1999 : overview?.current_plan === 'pro' ? 299 : 0,
    features: [],
    max_analyses: overview?.current_plan === 'free' ? 3 : -1,
    allows_tailor: overview?.current_plan !== 'free',
    allows_cover_letter: overview?.current_plan !== 'free',
    allows_recruiter: overview?.current_plan === 'recruiter',
  };

  const isPastDue = overview?.subscription?.status === 'past_due';
  const isCanceledAtPeriodEnd = overview?.subscription?.cancel_at_period_end;
  const isFreePlan = overview?.current_plan === 'free';
  const isProPlan = overview?.current_plan === 'pro';
  const isRecruiterPlan = overview?.current_plan === 'recruiter';

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Banner Alert Feedback */}
        {feedbackMessage && (
          <div
            className={`p-4 rounded-xl border flex items-center justify-between transition-all ${
              feedbackMessage.type === 'success'
                ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200'
                : 'bg-rose-50 dark:bg-rose-950/40 border-rose-300 dark:border-rose-800 text-rose-900 dark:text-rose-200'
            }`}
          >
            <div className="flex items-center gap-2.5">
              {feedbackMessage.type === 'success' ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
              ) : (
                <AlertCircle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0" />
              )}
              <span className="text-sm font-medium">{feedbackMessage.text}</span>
            </div>
            <button
              onClick={() => setFeedbackMessage(null)}
              className="text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Failed Payment Warning Banner */}
        {isPastDue && (
          <div className="p-5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border-2 border-amber-300 dark:border-amber-700/80 text-amber-900 dark:text-amber-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
            <div className="flex items-start sm:items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/60 flex items-center justify-center shrink-0 text-amber-700 dark:text-amber-300">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold">Renewal Payment Failed — Action Required</h4>
                <p className="text-xs text-amber-800 dark:text-amber-300/90 mt-0.5">
                  Your last subscription charge of {formatCurrency(currentPlan.price_inr)} failed (Card declined: Insufficient funds).
                  Your account is in grace period. Please retry payment to avoid service interruption.
                </p>
              </div>
            </div>
            <button
              onClick={() => currentPlan && handleOpenCheckout(currentPlan as BillingPlan)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-amber-600 text-white hover:bg-amber-700 transition-colors shadow-xs shrink-0"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Retry Payment</span>
            </button>
          </div>
        )}

        {/* Cancellation Pending Banner */}
        {isCanceledAtPeriodEnd && (
          <div className="p-4 rounded-xl bg-zinc-100 dark:bg-zinc-800/80 border border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Clock className="w-5 h-5 text-zinc-500 shrink-0" />
              <div>
                <p className="text-xs font-semibold">Subscription Cancellation Scheduled</p>
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                  Your plan will remain active until{' '}
                  <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                    {formatDate(overview?.subscription?.current_period_end)}
                  </span>
                  , after which you will be downgraded to the Free plan.
                </p>
              </div>
            </div>
            <button
              onClick={() => handleCancelSubscription(false)}
              className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline shrink-0"
            >
              Resume Subscription
            </button>
          </div>
        )}

        {/* Header & Provider Selector */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-200 dark:border-zinc-800 pb-6">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
              <CreditCard className="w-3.5 h-3.5" />
              <span>Subscription & Usage</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-white mt-1">
              Billing Management
            </h1>
            <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-1">
              Manage your active plan, usage quotas, invoice receipts, and multi-gateway payment methods.
            </p>
          </div>

          {/* Payment Gateway Toggle */}
          <div className="flex items-center gap-2 bg-zinc-100 dark:bg-zinc-800/80 p-1.5 rounded-2xl border border-zinc-200 dark:border-zinc-700/60 self-start md:self-auto">
            <span className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400 pl-2 pr-1">
              Gateway:
            </span>
            <button
              onClick={() => setSelectedProvider('stripe')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                selectedProvider === 'stripe'
                  ? 'bg-white dark:bg-zinc-900 text-indigo-600 dark:text-indigo-400 shadow-xs border border-zinc-200 dark:border-zinc-700'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-indigo-500" />
              <span>Stripe</span>
              <span className="text-[10px] opacity-70">(Global Cards)</span>
            </button>
            <button
              onClick={() => setSelectedProvider('razorpay')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                selectedProvider === 'razorpay'
                  ? 'bg-white dark:bg-zinc-900 text-blue-600 dark:text-blue-400 shadow-xs border border-zinc-200 dark:border-zinc-700'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-blue-500" />
              <span>Razorpay</span>
              <span className="text-[10px] opacity-70">(UPI / INR)</span>
            </button>
          </div>
        </div>

        {/* Current Plan Overview & Usage Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Current Plan Summary Card */}
          <div className="lg:col-span-1 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">Current Plan</span>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-xs font-extrabold uppercase tracking-wider border ${
                    isPastDue
                      ? 'bg-rose-50 text-rose-700 border-rose-300 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800'
                      : isFreePlan
                      ? 'bg-zinc-100 text-zinc-700 border-zinc-300 dark:bg-zinc-800 dark:text-zinc-300 dark:border-zinc-700'
                      : 'bg-indigo-50 text-indigo-700 border-indigo-300 dark:bg-indigo-950/60 dark:text-indigo-300 dark:border-indigo-800'
                  }`}
                >
                  {isPastDue ? 'Past Due' : overview?.subscription?.status || (isFreePlan ? 'Active' : 'Pro')}
                </span>
              </div>

              <div>
                <h3 className="text-2xl font-black text-zinc-900 dark:text-white capitalize flex items-center gap-2">
                  {currentPlan.name}
                  {isProPlan && <Zap className="w-5 h-5 text-indigo-500 fill-indigo-500" />}
                  {isRecruiterPlan && <Flame className="w-5 h-5 text-amber-500 fill-amber-500" />}
                </h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                  {isFreePlan
                    ? 'Free baseline ATS scanner with 3 monthly scans'
                    : isProPlan
                    ? 'Pro subscription with unlimited scans, Resume Tailor & Cover Letters'
                    : 'Recruiter subscription with candidate ranking & bulk 100-resume screening'}
                </p>
              </div>

              <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800">
                <div className="text-3xl font-extrabold text-zinc-900 dark:text-white">
                  {formatCurrency(currentPlan.price_inr)}
                  <span className="text-xs font-normal text-zinc-400"> / month</span>
                </div>
                {!isFreePlan && overview?.subscription && (
                  <p className="text-[11px] text-zinc-500 mt-1">
                    {isCanceledAtPeriodEnd
                      ? `Access ends on ${formatDate(overview.subscription.current_period_end)}`
                      : `Next renewal on ${formatDate(overview.subscription.current_period_end)}`}
                  </p>
                )}
              </div>
            </div>

            {/* Quick Plan Actions */}
            <div className="pt-6 border-t border-zinc-100 dark:border-zinc-800 flex items-center gap-2">
              {!isFreePlan ? (
                <>
                  <button
                    onClick={() => setDowngradeModalOpen(true)}
                    className="flex-1 py-2 px-3 rounded-xl text-xs font-semibold border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
                  >
                    Change Plan
                  </button>
                  <button
                    onClick={() => setCancelModalOpen(true)}
                    className="py-2 px-3 rounded-xl text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                  >
                    Cancel
                  </button>
                </>
              ) : (
                <button
                  onClick={() => {
                    const proPlan = overview?.plans.find((p) => p.id === 'pro');
                    if (proPlan) handleOpenCheckout(proPlan);
                  }}
                  className="w-full py-2.5 px-4 rounded-xl text-xs font-bold bg-indigo-600 text-white hover:bg-indigo-700 transition-colors shadow-xs flex items-center justify-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Upgrade to Pro (₹299/mo)</span>
                </button>
              )}
            </div>
          </div>

          {/* Usage Tracking Meter Cards (2 Columns) */}
          <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Analyses Quota */}
            <div className="p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between text-zinc-500 dark:text-zinc-400">
                  <span className="text-xs font-semibold">ATS Analyses</span>
                  <Sparkles className="w-4 h-4 text-indigo-500" />
                </div>
                <div className="mt-3">
                  <div className="text-2xl font-extrabold text-zinc-900 dark:text-white">
                    {overview?.usage.analyses_used || 0}
                    {overview?.usage.max_analyses === -1 ? (
                      <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 ml-1.5">
                        / Unlimited
                      </span>
                    ) : (
                      <span className="text-xs font-semibold text-zinc-400 ml-1.5">
                        / {overview?.usage.max_analyses || 3} used
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-zinc-500 mt-0.5">
                    Monthly billing cycle: {overview?.usage.month || 'Current'}
                  </p>
                </div>
              </div>

              {/* Progress bar */}
              <div className="mt-4 pt-4 border-t border-zinc-100 dark:border-zinc-800">
                {overview?.usage.max_analyses === -1 ? (
                  <div className="flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Unlimited Allowance Active</span>
                  </div>
                ) : (
                  <div>
                    <div className="w-full bg-zinc-100 dark:bg-zinc-800 h-2 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all ${
                          (overview?.usage.analyses_used || 0) >= 3
                            ? 'bg-rose-500'
                            : 'bg-indigo-600'
                        }`}
                        style={{
                          width: `${Math.min(
                            100,
                            (((overview?.usage.analyses_used || 0) / 3) * 100)
                          )}%`,
                        }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-zinc-400 mt-1">
                      <span>{3 - (overview?.usage.analyses_used || 0)} scans remaining</span>
                      <span>Cap: 3/mo</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Resumes Uploaded */}
            <div className="p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between text-zinc-500 dark:text-zinc-400">
                  <span className="text-xs font-semibold">Resumes Uploaded</span>
                  <FileText className="w-4 h-4 text-emerald-500" />
                </div>
                <div className="mt-3">
                  <div className="text-2xl font-extrabold text-zinc-900 dark:text-white">
                    {overview?.usage.resumes_uploaded || 0}
                  </div>
                  <p className="text-[11px] text-zinc-500 mt-0.5">
                    Saved in personal library
                  </p>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-zinc-100 dark:border-zinc-800">
                <Link
                  href="/resumes"
                  className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
                >
                  <span>View Resume Library</span>
                  <ChevronRight className="w-3 h-3" />
                </Link>
              </div>
            </div>

            {/* AI Generations */}
            <div className="p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between text-zinc-500 dark:text-zinc-400">
                  <span className="text-xs font-semibold">AI Generations</span>
                  <Zap className="w-4 h-4 text-amber-500" />
                </div>
                <div className="mt-3">
                  <div className="text-2xl font-extrabold text-zinc-900 dark:text-white">
                    {overview?.usage.ai_generations_used || 0}
                  </div>
                  <p className="text-[11px] text-zinc-500 mt-0.5">
                    Tailored resumes & cover letters
                  </p>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-zinc-100 dark:border-zinc-800">
                {isFreePlan ? (
                  <span className="text-[11px] text-amber-600 dark:text-amber-400 font-medium flex items-center gap-1">
                    <Lock className="w-3 h-3" />
                    <span>Requires Pro Pass</span>
                  </span>
                ) : (
                  <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>Full Feature Access</span>
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Plan Comparison & Subscription Cards */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-zinc-900 dark:text-white">
                Subscription Tiers
              </h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Transparent pricing with automatic monthly invoicing via Stripe or Razorpay.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {overview?.plans.map((plan) => {
              const isCurrent = overview.current_plan === plan.id;
              const isUpgrade =
                (overview.current_plan === 'free' && plan.id !== 'free') ||
                (overview.current_plan === 'pro' && plan.id === 'recruiter');
              const isDowngrade =
                (overview.current_plan === 'recruiter' && plan.id !== 'recruiter') ||
                (overview.current_plan === 'pro' && plan.id === 'free');

              const isFeatured = plan.id === 'pro';

              return (
                <div
                  key={plan.id}
                  className={`p-6 rounded-2xl border flex flex-col justify-between space-y-6 relative transition-all ${
                    isCurrent
                      ? 'border-2 border-indigo-600 bg-indigo-50/20 dark:bg-indigo-950/20 shadow-md'
                      : isFeatured
                      ? 'border-indigo-300 dark:border-indigo-800 bg-white dark:bg-zinc-900 shadow-sm'
                      : 'border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900'
                  }`}
                >
                  {isCurrent && (
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-indigo-600 text-white">
                      Current Active Plan
                    </span>
                  )}
                  {isFeatured && !isCurrent && (
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-indigo-600 text-white">
                      Most Popular
                    </span>
                  )}

                  <div className="space-y-4">
                    <div>
                      <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                        {plan.name}
                        {plan.id === 'recruiter' && (
                          <span className="px-2 py-0.5 text-[10px] font-bold uppercase bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 rounded">
                            Enterprise
                          </span>
                        )}
                      </h3>
                      <p className="text-xs text-zinc-500 mt-1">
                        {plan.id === 'free'
                          ? '3 analyses per month for individual job hunters.'
                          : plan.id === 'pro'
                          ? 'Unlimited ATS analyses, Resume Tailor & Cover Letters.'
                          : 'Bulk screening up to 100 resumes & candidate ranking.'}
                      </p>
                    </div>

                    <div className="text-3xl font-extrabold text-zinc-900 dark:text-white">
                      {formatCurrency(plan.price_inr)}
                      <span className="text-xs font-normal text-zinc-400"> / month</span>
                    </div>

                    {/* Features list */}
                    <ul className="space-y-2 text-xs text-zinc-600 dark:text-zinc-400 pt-4 border-t border-zinc-100 dark:border-zinc-800">
                      {plan.features.map((feat, idx) => (
                        <li key={idx} className="flex items-center gap-2">
                          <CheckCircle2
                            className={`w-4 h-4 shrink-0 ${
                              isFeatured ? 'text-indigo-500' : 'text-emerald-500'
                            }`}
                          />
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Action CTA */}
                  <div>
                    {isCurrent ? (
                      <button
                        disabled
                        className="w-full py-2.5 rounded-xl text-xs font-semibold bg-zinc-100 dark:bg-zinc-800 text-zinc-400 cursor-not-allowed"
                      >
                        Active Plan
                      </button>
                    ) : isUpgrade ? (
                      <button
                        onClick={() => handleOpenCheckout(plan)}
                        disabled={actionLoading}
                        className="w-full py-2.5 rounded-xl text-xs font-bold bg-indigo-600 text-white hover:bg-indigo-700 transition-colors shadow-xs flex items-center justify-center gap-1.5"
                      >
                        <Zap className="w-3.5 h-3.5" />
                        <span>Upgrade to {plan.name}</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          setTargetDowngradePlan(plan.id);
                          setDowngradeModalOpen(true);
                        }}
                        disabled={actionLoading}
                        className="w-full py-2.5 rounded-xl text-xs font-semibold border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
                      >
                        Downgrade to {plan.name}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Developer / Testing Toolbar for Failure & Expiration States */}
        <div className="p-5 rounded-2xl border border-dashed border-zinc-300 dark:border-zinc-700 bg-zinc-50/50 dark:bg-zinc-900/50 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
                Payment Lifecycle & Simulation Suite
              </h4>
            </div>
            <span className="text-[11px] text-zinc-400">
              Test failed webhook events, grace periods, and expiration handling
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={handleSimulateFailure}
              disabled={actionLoading}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-all flex items-center gap-1.5 shadow-xs"
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Simulate Payment Failure (Mark Past Due)</span>
            </button>

            <button
              onClick={handleSimulateTrialExpiry}
              disabled={actionLoading}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/30 transition-all flex items-center gap-1.5 shadow-xs"
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Simulate Trial Expiration (Revert to Free)</span>
            </button>

            <button
              onClick={() => {
                const pro = overview?.plans.find((p) => p.id === 'pro');
                if (pro) handleOpenCheckout(pro);
              }}
              disabled={actionLoading}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/30 transition-all flex items-center gap-1.5 shadow-xs"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Restore Pro Plan</span>
            </button>

            <button
              onClick={() => {
                const rec = overview?.plans.find((p) => p.id === 'recruiter');
                if (rec) handleOpenCheckout(rec);
              }}
              disabled={actionLoading}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 transition-all flex items-center gap-1.5 shadow-xs"
            >
              <Users className="w-3.5 h-3.5" />
              <span>Restore Recruiter Plan</span>
            </button>
          </div>
        </div>

        {/* Invoice History Table */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-zinc-900 dark:text-white">
                Invoice History
              </h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Official billing receipts and transaction logs for tax and expense reporting.
              </p>
            </div>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/40 text-zinc-500 uppercase tracking-wider text-[10px]">
                  <th className="py-3 px-4 font-bold">Invoice #</th>
                  <th className="py-3 px-4 font-bold">Billing Date</th>
                  <th className="py-3 px-4 font-bold">Plan</th>
                  <th className="py-3 px-4 font-bold">Provider</th>
                  <th className="py-3 px-4 font-bold">Amount</th>
                  <th className="py-3 px-4 font-bold">Status</th>
                  <th className="py-3 px-4 font-bold text-right">Receipt</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                {overview?.invoices && overview.invoices.length > 0 ? (
                  overview.invoices.map((inv) => (
                    <tr key={inv.id} className="hover:bg-zinc-50/60 dark:hover:bg-zinc-800/40">
                      <td className="py-3.5 px-4 font-mono font-medium text-zinc-900 dark:text-zinc-100">
                        {inv.invoice_number}
                      </td>
                      <td className="py-3.5 px-4 text-zinc-500">
                        {formatDate(inv.created_at)}
                      </td>
                      <td className="py-3.5 px-4 font-medium text-zinc-900 dark:text-zinc-100">
                        {inv.plan_name}
                      </td>
                      <td className="py-3.5 px-4 capitalize text-zinc-600 dark:text-zinc-400">
                        <span className="inline-flex items-center gap-1">
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              inv.provider === 'stripe' ? 'bg-indigo-500' : 'bg-blue-500'
                            }`}
                          />
                          {inv.provider}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-bold text-zinc-900 dark:text-zinc-100">
                        {formatCurrency(inv.amount)}
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            inv.status === 'paid'
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                              : 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300'
                          }`}
                        >
                          {inv.status === 'paid' ? (
                            <Check className="w-3 h-3" />
                          ) : (
                            <XCircle className="w-3 h-3" />
                          )}
                          {inv.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => setSelectedInvoice(inv)}
                          className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>View PDF</span>
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-zinc-400">
                      No invoices recorded yet. Subscribe to a paid plan to generate your first invoice.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Interactive Checkout Modal (Stripe / Razorpay) */}
      {checkoutModalOpen && checkoutPlan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 max-w-md w-full p-6 shadow-2xl relative space-y-6">
            <button
              onClick={() => setCheckoutModalOpen(false)}
              className="absolute top-5 right-5 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Modal Header */}
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span
                  className={`w-2.5 h-2.5 rounded-full ${
                    selectedProvider === 'stripe' ? 'bg-indigo-500' : 'bg-blue-500'
                  }`}
                />
                <span className="text-xs font-bold uppercase tracking-wider text-zinc-500">
                  Secure {selectedProvider === 'stripe' ? 'Stripe Checkout' : 'Razorpay Gateway'}
                </span>
              </div>
              <h3 className="text-xl font-bold text-zinc-900 dark:text-white">
                Subscribe to {checkoutPlan.name} Plan
              </h3>
              <p className="text-xs text-zinc-500">
                Billed monthly at {formatCurrency(checkoutPlan.price_inr)} with instant feature activation.
              </p>
            </div>

            {/* Order Summary Box */}
            <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 space-y-2.5">
              <div className="flex justify-between text-xs font-medium text-zinc-600 dark:text-zinc-300">
                <span>{checkoutPlan.name} Plan (Monthly)</span>
                <span>{formatCurrency(checkoutPlan.price_inr)}</span>
              </div>
              <div className="flex justify-between text-xs font-medium text-zinc-600 dark:text-zinc-300">
                <span>Taxes & GST (Included)</span>
                <span>₹0.00</span>
              </div>
              <div className="pt-2 border-t border-zinc-200 dark:border-zinc-700 flex justify-between text-sm font-bold text-zinc-900 dark:text-white">
                <span>Total Due Today</span>
                <span className="text-indigo-600 dark:text-indigo-400">
                  {formatCurrency(checkoutPlan.price_inr)}
                </span>
              </div>
            </div>

            {/* Provider Forms */}
            {checkoutStep === 'form' && (
              <div className="space-y-4">
                {selectedProvider === 'stripe' ? (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                        Card Details (Stripe Mock)
                      </label>
                      <button
                        type="button"
                        onClick={() =>
                          setCardDetails({
                            number: '4242 •••• •••• 4242',
                            exp: '12/28',
                            cvc: '888',
                            name: 'Alex Rivera',
                          })
                        }
                        className="text-[10px] font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
                      >
                        Autofill Test Card
                      </button>
                    </div>

                    <div className="p-3 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50/50 dark:bg-zinc-800/40 space-y-2">
                      <div className="flex items-center gap-2 text-xs font-mono text-zinc-800 dark:text-zinc-200">
                        <CreditCard className="w-4 h-4 text-zinc-400 shrink-0" />
                        <input
                          type="text"
                          value={cardDetails.number}
                          onChange={(e) =>
                            setCardDetails({ ...cardDetails, number: e.target.value })
                          }
                          className="w-full bg-transparent focus:outline-none"
                        />
                      </div>
                      <div className="flex items-center gap-3 pt-2 border-t border-zinc-200 dark:border-zinc-700 text-xs font-mono">
                        <input
                          type="text"
                          value={cardDetails.exp}
                          onChange={(e) =>
                            setCardDetails({ ...cardDetails, exp: e.target.value })
                          }
                          placeholder="MM/YY"
                          className="w-16 bg-transparent focus:outline-none"
                        />
                        <input
                          type="text"
                          value={cardDetails.cvc}
                          onChange={(e) =>
                            setCardDetails({ ...cardDetails, cvc: e.target.value })
                          }
                          placeholder="CVC"
                          className="w-16 bg-transparent focus:outline-none"
                        />
                        <input
                          type="text"
                          value={cardDetails.name}
                          onChange={(e) =>
                            setCardDetails({ ...cardDetails, name: e.target.value })
                          }
                          placeholder="Name on Card"
                          className="flex-1 bg-transparent focus:outline-none text-right font-sans"
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                        Razorpay UPI ID / QR
                      </label>
                      <button
                        type="button"
                        onClick={() =>
                          setUpiDetails({
                            vpa: 'alexrivera@okhdfcbank',
                            app: 'Google Pay / PhonePe',
                          })
                        }
                        className="text-[10px] font-semibold text-blue-600 dark:text-blue-400 hover:underline"
                      >
                        Autofill Test UPI
                      </button>
                    </div>

                    <div className="p-3 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50/50 dark:bg-zinc-800/40 space-y-2">
                      <div className="flex items-center gap-2 text-xs font-mono text-zinc-800 dark:text-zinc-200">
                        <Zap className="w-4 h-4 text-blue-500 shrink-0" />
                        <input
                          type="text"
                          value={upiDetails.vpa}
                          onChange={(e) =>
                            setUpiDetails({ ...upiDetails, vpa: e.target.value })
                          }
                          className="w-full bg-transparent focus:outline-none"
                        />
                      </div>
                      <p className="text-[10px] text-zinc-400">
                        App: {upiDetails.app} • Instant Paise settlement
                      </p>
                    </div>
                  </div>
                )}

                <button
                  onClick={handleProcessPayment}
                  className="w-full py-3 rounded-xl text-xs font-bold bg-indigo-600 text-white hover:bg-indigo-700 transition-colors shadow-md flex items-center justify-center gap-2"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>Authorize & Pay {formatCurrency(checkoutPlan.price_inr)}</span>
                </button>
              </div>
            )}

            {/* Processing Step */}
            {checkoutStep === 'processing' && (
              <div className="py-8 flex flex-col items-center justify-center text-center space-y-3">
                <RefreshCw className="w-8 h-8 text-indigo-600 animate-spin" />
                <h4 className="text-sm font-bold text-zinc-900 dark:text-white">
                  Processing via {selectedProvider === 'stripe' ? 'Stripe' : 'Razorpay'}...
                </h4>
                <p className="text-xs text-zinc-500">
                  Verifying cryptographic tokens and provisioning your tier access.
                </p>
              </div>
            )}

            {/* Success Step */}
            {checkoutStep === 'success' && (
              <div className="py-6 flex flex-col items-center justify-center text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h4 className="text-base font-bold text-zinc-900 dark:text-white">
                  Payment Confirmed!
                </h4>
                <p className="text-xs text-zinc-500">
                  You are now on the {checkoutPlan.name} plan. All features and quotas have been unlocked.
                </p>
                <button
                  onClick={() => setCheckoutModalOpen(false)}
                  className="mt-2 px-6 py-2 rounded-xl text-xs font-semibold bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 hover:opacity-90"
                >
                  Return to Dashboard
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Downgrade Confirmation Modal */}
      {downgradeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 max-w-sm w-full p-6 shadow-2xl space-y-4">
            <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-zinc-900 dark:text-white">
                Downgrade to {targetDowngradePlan.toUpperCase()} Plan?
              </h3>
              <p className="text-xs text-zinc-500 mt-1">
                {targetDowngradePlan === 'free'
                  ? 'Your account will be restricted to 3 analyses per month, and premium features (Resume Tailor, Cover Letter, Recruiter Dashboard) will be locked.'
                  : `Your account will be switched to ${targetDowngradePlan.toUpperCase()} at the start of your next billing cycle.`}
              </p>
            </div>
            <div className="pt-2 flex items-center gap-2">
              <button
                onClick={() => setDowngradeModalOpen(false)}
                className="flex-1 py-2 rounded-xl text-xs font-semibold border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800"
              >
                Keep Current Plan
              </button>
              <button
                onClick={() => handleDowngrade(targetDowngradePlan)}
                disabled={actionLoading}
                className="flex-1 py-2 rounded-xl text-xs font-bold bg-amber-600 text-white hover:bg-amber-700 transition-colors"
              >
                Confirm Downgrade
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cancel Subscription Modal */}
      {cancelModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 max-w-sm w-full p-6 shadow-2xl space-y-4">
            <div className="w-10 h-10 rounded-xl bg-rose-100 dark:bg-rose-950/60 text-rose-600 flex items-center justify-center">
              <XCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-zinc-900 dark:text-white">
                Cancel Active Subscription?
              </h3>
              <p className="text-xs text-zinc-500 mt-1">
                Choose whether you wish to retain access through the end of your billing cycle or cancel immediately.
              </p>
            </div>

            <div className="space-y-2 pt-2">
              <button
                onClick={() => handleCancelSubscription(false)}
                disabled={actionLoading}
                className="w-full py-2.5 rounded-xl text-xs font-semibold bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors text-left px-3 flex items-center justify-between"
              >
                <span>Cancel at end of cycle (Recommended)</span>
                <ChevronRight className="w-3.5 h-3.5 text-zinc-400" />
              </button>
              <button
                onClick={() => handleCancelSubscription(true)}
                disabled={actionLoading}
                className="w-full py-2.5 rounded-xl text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors text-left px-3 flex items-center justify-between"
              >
                <span>Cancel immediately (Revert to Free)</span>
                <ChevronRight className="w-3.5 h-3.5 text-rose-400" />
              </button>
            </div>

            <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800">
              <button
                onClick={() => setCancelModalOpen(false)}
                className="w-full py-2 rounded-xl text-xs font-semibold text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
              >
                Keep My Subscription
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Invoice Receipt Modal */}
      {selectedInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 max-w-lg w-full p-8 shadow-2xl relative space-y-6">
            <button
              onClick={() => setSelectedInvoice(null)}
              className="absolute top-5 right-5 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Receipt Header */}
            <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-sm font-extrabold text-zinc-900 dark:text-white">
                    ResumeIQ <span className="text-indigo-500">AI</span>
                  </span>
                  <p className="text-[10px] text-zinc-400">Official Payment Tax Receipt</p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-xs font-mono font-bold text-zinc-700 dark:text-zinc-300">
                  {selectedInvoice.invoice_number}
                </span>
                <p className="text-[10px] text-zinc-400">{formatDate(selectedInvoice.created_at)}</p>
              </div>
            </div>

            {/* Invoice Line Items */}
            <div className="space-y-3">
              <div className="flex justify-between text-xs py-2 border-b border-zinc-100 dark:border-zinc-800 text-zinc-500 uppercase font-semibold text-[10px]">
                <span>Description</span>
                <span>Amount</span>
              </div>
              <div className="flex justify-between text-xs font-medium text-zinc-900 dark:text-zinc-100">
                <span>{selectedInvoice.plan_name} — 1 Month Access</span>
                <span>{formatCurrency(selectedInvoice.amount)}</span>
              </div>
              <div className="flex justify-between text-xs font-medium text-zinc-500">
                <span>Payment Gateway ({selectedInvoice.provider.toUpperCase()})</span>
                <span>Authorized</span>
              </div>
              <div className="pt-3 border-t border-zinc-200 dark:border-zinc-700 flex justify-between text-sm font-bold text-zinc-900 dark:text-white">
                <span>Total Paid</span>
                <span className="text-emerald-600 dark:text-emerald-400">
                  {formatCurrency(selectedInvoice.amount)}
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="pt-4 flex items-center justify-between border-t border-zinc-100 dark:border-zinc-800">
              <div className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
                <CheckCircle2 className="w-4 h-4" />
                <span>Status: Paid & Reconciled</span>
              </div>
              <button
                onClick={() => window.print()}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 hover:opacity-90 flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Print / Save PDF</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
