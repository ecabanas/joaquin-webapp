
/**
 * Centralized analytics service.
 * This module abstracts the underlying analytics providers (e.g., GA4, Clarity)
 * and provides a consistent interface for tracking events throughout the app.
 */

declare global {
  interface Window {
    gtag: (...args: any[]) => void;
    clarity: (...args: any[]) => void;
  }
}

/**
 * Tracks a page view event. This is typically called automatically
 * by the AnalyticsProvider when the route changes.
 * @param url The URL of the page being viewed.
 */
export const pageview = (url: string) => {
  const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
  if (typeof window.gtag !== 'function' || !GA_MEASUREMENT_ID) {
    return;
  }
  window.gtag('config', GA_MEASUREMENT_ID, {
    page_path: url,
  });
};

/**
 * Tracks a custom event.
 * @param eventName The name of the event to track.
 * @param eventProps An object of properties to associate with the event.
 */
export const track = (eventName: string, eventProps?: Record<string, any>) => {
  if (typeof window.gtag !== 'function') {
    return;
  }
  window.gtag('event', eventName, eventProps);
};

/**
 * Associates a user ID with subsequent analytics events.
 * This helps in analyzing user journeys without storing PII.
 * @param userId The unique identifier for the user.
 */
export const identify = (userId: string) => {
   // Identify the user to Google Analytics
  if (typeof window.gtag === 'function' && process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID) {
    window.gtag('config', process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID, {
      user_id: userId,
    });
  }
  
  // Identify the user to Microsoft Clarity
  if (typeof window.clarity === 'function') {
    window.clarity('identify', userId);
  }
};
