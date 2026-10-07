'use client';

import React, { useEffect, Suspense } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

import { analytics } from '@/lib/analytics';
import { CookieConsent } from './CookieConsent';

function AnalyticsTrackerInner() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Track page views and landing page visits on client navigation
    const url = pathname + (searchParams?.toString() ? `?${searchParams.toString()}` : '');
    analytics.trackLandingPage(url);
  }, [pathname, searchParams]);

  return null;
}

export const AnalyticsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <>
      <Suspense fallback={null}>
        <AnalyticsTrackerInner />
      </Suspense>
      {children}
      <CookieConsent />
    </>
  );
};

