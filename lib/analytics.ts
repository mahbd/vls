import ReactGA from 'react-ga4';

// Initialize Google Analytics
export const initGA = () => {
  try {
    const TRACKING_ID = process.env.NEXT_PUBLIC_GA_TRACKING_ID;
    if (TRACKING_ID && typeof window !== 'undefined') {
      ReactGA.initialize(TRACKING_ID);
    }
  } catch (error) {
    console.error('Error initializing Google Analytics:', error);
  }
};

// Track page views
export const trackPageView = (path: string) => {
  try {
    if (typeof window !== 'undefined' && process.env.NEXT_PUBLIC_GA_TRACKING_ID) {
      ReactGA.send({ hitType: 'pageview', page: path });
    }
  } catch (error) {
    console.error('Error tracking page view:', error);
  }
};

// Track vulnerability demo events
export const trackVulnerabilityDemo = (type: 'sql_injection' | 'xss' | 'mode_toggle', details?: Record<string, string | number | boolean>) => {
  try {
    if (typeof window !== 'undefined' && process.env.NEXT_PUBLIC_GA_TRACKING_ID) {
      ReactGA.event({
        category: 'Vulnerability Demo',
        action: type,
        label: details ? JSON.stringify(details) : undefined,
      });
    }
  } catch (error) {
    console.error('Error tracking vulnerability demo:', error);
  }
};

// Track login attempts (anonymized)
export const trackLoginAttempt = (success: boolean, isSecureMode: boolean) => {
  try {
    if (typeof window !== 'undefined' && process.env.NEXT_PUBLIC_GA_TRACKING_ID) {
      ReactGA.event({
        category: 'Login',
        action: success ? 'success' : 'failure',
        label: isSecureMode ? 'secure' : 'vulnerable',
      });
    }
  } catch (error) {
    console.error('Error tracking login attempt:', error);
  }
};

// Track comment submissions (anonymized)
export const trackCommentSubmission = (isSecureMode: boolean, hasXssPayload: boolean) => {
  try {
    if (typeof window !== 'undefined' && process.env.NEXT_PUBLIC_GA_TRACKING_ID) {
      ReactGA.event({
        category: 'Comment',
        action: 'submit',
        label: `${isSecureMode ? 'secure' : 'vulnerable'}_${hasXssPayload ? 'with_xss' : 'normal'}`,
      });
    }
  } catch (error) {
    console.error('Error tracking comment submission:', error);
  }
};

// Track security mode toggles
export const trackSecurityModeToggle = (isSecureMode: boolean) => {
  try {
    if (typeof window !== 'undefined' && process.env.NEXT_PUBLIC_GA_TRACKING_ID) {
      ReactGA.event({
        category: 'Security Mode',
        action: 'toggle',
        label: isSecureMode ? 'secure' : 'vulnerable',
      });
    }
  } catch (error) {
    console.error('Error tracking security mode toggle:', error);
  }
};
