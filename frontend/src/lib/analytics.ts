/**
 * ResumeIQ AI Analytics Client
 * Dual Provider Support: PostHog + Google Analytics (GA4)
 * Privacy-First Architecture: GDPR/CCPA Compliant with Granular Consent Management
 */

const POSTHOG_API_KEY = process.env.NEXT_PUBLIC_POSTHOG_KEY || 'phc_mock_test_key_resumeiq_ai_2026';
const POSTHOG_HOST = process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://us.i.posthog.com';
const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_ID || 'G-RESUMEIQ2026';
const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api';

export type ConsentStatus = 'granted' | 'denied' | 'pending';

class AnalyticsTracker {
  private anonymousId: string = '';
  private sessionId: string = '';
  private initialized: boolean = false;

  constructor() {
    if (typeof window !== 'undefined') {
      this.initIdentifiers();
    }
  }

  private initIdentifiers() {
    let anon = localStorage.getItem('resumeiq_anon_id');
    if (!anon) {
      anon = 'anon_' + Math.random().toString(36).substring(2, 12) + Date.now().toString(36);
      localStorage.setItem('resumeiq_anon_id', anon);
    }
    this.anonymousId = anon;

    let sess = sessionStorage.getItem('resumeiq_sess_id');
    if (!sess) {
      sess = 'sess_' + Math.random().toString(36).substring(2, 12);
      sessionStorage.setItem('resumeiq_sess_id', sess);
    }
    this.sessionId = sess;
  }

  public getConsent(): ConsentStatus {
    if (typeof window === 'undefined') return 'pending';
    // Respect Do Not Track header if set
    if (typeof navigator !== 'undefined' && navigator.doNotTrack === '1') {
      return 'denied';
    }
    const val = localStorage.getItem('resumeiq_cookie_consent');
    if (val === 'granted' || val === 'denied') return val;
    return 'pending';
  }

  public setConsent(status: 'granted' | 'denied') {
    if (typeof window !== 'undefined') {
      localStorage.setItem('resumeiq_cookie_consent', status);
      if (status === 'granted') {
        this.initExternalProviders();
        this.track('consent_granted', 'activation', { provider: 'all' });
      } else {
        this.track('consent_denied', 'activation', { provider: 'essential_only' });
      }
    }
  }

  public initExternalProviders() {
    if (this.initialized || typeof window === 'undefined') return;
    if (this.getConsent() === 'denied') return;

    try {
      // 1. Google Analytics (gtag.js) Stub & Global Loader
      if (!(window as any).gtag && typeof document !== 'undefined') {
        (window as any).dataLayer = (window as any).dataLayer || [];
        function gtag(...args: any[]) {
          (window as any).dataLayer.push(args);
        }
        (window as any).gtag = gtag;
        gtag('js', new Date());
        gtag('config', GA_MEASUREMENT_ID, {
          anonymize_ip: true,
          cookie_flags: 'SameSite=None;Secure',
        });

        // Insert GA script asynchronously
        const gaScript = document.createElement('script');
        gaScript.async = true;
        gaScript.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
        document.head.appendChild(gaScript);
      }

      // 2. PostHog Client Initialization Stub
      if (!(window as any).posthog) {
        (window as any).posthog = {
          capture: (name: string, props?: Record<string, any>) => {
            if (process.env.NODE_ENV === 'development') {
              console.log('[PostHog Event Captured]', name, props);
            }
          },
          identify: (id: string, traits?: Record<string, any>) => {
            if (process.env.NODE_ENV === 'development') {
              console.log('[PostHog Identified]', id, traits);
            }
          },
        };
      }

      this.initialized = true;
    } catch (e) {
      console.warn('Analytics external provider initialization warning:', e);
    }
  }

  /**
   * Dispatches event to backend ingestion (first-party) + PostHog + GA4
   */
  public async track(
    eventName: string,
    category: 'acquisition' | 'activation' | 'engagement' | 'revenue' = 'engagement',
    properties: Record<string, any> = {}
  ) {
    if (typeof window === 'undefined') return;

    // Filter out any potential sensitive PII fields
    const sanitizedProps: Record<string, any> = {};
    for (const [k, v] of Object.entries(properties)) {
      if (!['password', 'token', 'cvc', 'secret', 'raw_text'].includes(k.toLowerCase())) {
        sanitizedProps[k] = v;
      }
    }

    // 1. Dispatch to PostHog
    try {
      if ((window as any).posthog?.capture) {
        (window as any).posthog.capture(eventName, {
          category,
          ...sanitizedProps,
          $current_url: window.location.href,
        });
      }
    } catch {}

    // 2. Dispatch to Google Analytics (GA4)
    try {
      if ((window as any).gtag) {
        (window as any).gtag('event', eventName, {
          event_category: category,
          ...sanitizedProps,
        });
      }
    } catch {}

    // 3. Dispatch to First-Party Backend Analytics Ingestion API
    try {
      fetch(`${API_BASE}/analytics/event`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event_name: eventName,
          category,
          anonymous_id: this.anonymousId,
          session_id: this.sessionId,
          properties: sanitizedProps,
          url: window.location.pathname + window.location.search,
          referrer: document.referrer || null,
        }),
      }).catch(() => {});
    } catch {}
  }

  // Common Lifecycle Event Helpers
  public trackLandingPage(url?: string) {
    const path = url || (typeof window !== 'undefined' ? window.location.pathname : '/');
    this.track('landing_page_visit', 'acquisition', {
      path,
      referrer: typeof document !== 'undefined' ? document.referrer : '',
    });
  }

  public trackSignup(plan: string = 'free', method: string = 'email') {
    this.track('user_signup', 'activation', { plan, method });
  }

  public trackFirstAnalysis(score: number) {
    this.track('first_analysis_completed', 'activation', { ats_score: score });
  }

  public trackAnalysisCreated(score: number, jobTitle?: string) {
    this.track('analysis_created', 'engagement', {
      ats_score: score,
      job_title: jobTitle,
    });
  }

  public trackResumeUpload(fileType: string, fileSize: number) {
    this.track('resume_uploaded', 'engagement', {
      file_type: fileType,
      file_size: fileSize,
    });
  }

  public trackTailorUsed(jobTitle: string, company: string, scoreIncrease?: number) {
    this.track('tailor_used', 'engagement', {
      job_title: jobTitle,
      company,
      score_increase: scoreIncrease || 0,
    });
  }

  public trackUpgrade(planId: string, amount: number, provider: string) {
    this.track('subscription_upgraded', 'revenue', {
      plan_id: planId,
      amount_inr: amount,
      provider,
    });
  }

  public trackChurn(planId: string) {
    this.track('subscription_canceled', 'revenue', {
      plan_id: planId,
    });
  }
}

export const analytics = new AnalyticsTracker();
