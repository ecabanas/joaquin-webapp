
'use client';

import { createContext, useContext, useEffect, ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import Script from 'next/script';
import { useAuth } from './auth-context';
import * as analytics from '@/lib/analytics';

type AnalyticsContextType = {
  trackEvent: (eventName: string, eventProps?: Record<string, any>) => void;
};

const AnalyticsContext = createContext<AnalyticsContextType | undefined>(
  undefined
);

export function AnalyticsProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { user } = useAuth();

  const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
  const CLARITY_PROJECT_ID = process.env.NEXT_PUBLIC_CLARITY_PROJECT_ID;

  // Track page views
  useEffect(() => {
    if (!GA_MEASUREMENT_ID || !pathname) return;
    analytics.pageview(pathname);
  }, [pathname, GA_MEASUREMENT_ID]);
  
  // Identify user to analytics services
  useEffect(() => {
    if (user?.uid) {
      analytics.identify(user.uid);
    }
  }, [user?.uid]);
  
  const trackEvent = (eventName: string, eventProps?: Record<string, any>) => {
    analytics.track(eventName, eventProps);
  };

  return (
    <AnalyticsContext.Provider value={{ trackEvent }}>
      {/* Google Analytics Script */}
      {GA_MEASUREMENT_ID && (
        <>
          <Script
            strategy="afterInteractive"
            src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
          />
          <Script
            id="google-analytics"
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{
              __html: `
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${GA_MEASUREMENT_ID}', {
                  page_path: window.location.pathname,
                });
              `,
            }}
          />
        </>
      )}
      
       {/* Microsoft Clarity Script */}
      {CLARITY_PROJECT_ID && (
         <Script
          id="microsoft-clarity"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              (function(c,l,a,r,i,t,y){
                  c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
                  t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
                  y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
              })(window, document, "clarity", "script", "${CLARITY_PROJECT_ID}");
            `,
          }}
        />
      )}
      
      {children}
    </AnalyticsContext.Provider>
  );
}

export function useAnalytics() {
  const context = useContext(AnalyticsContext);
  if (context === undefined) {
    throw new Error('useAnalytics must be used within an AnalyticsProvider');
  }
  return context;
}
