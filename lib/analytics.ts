// lib/analytics.ts
declare global {
  interface Window {
    gtag: (...args: any[]) => void;
  }
}

export const event = (action: string, params?: Record<string, any>) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', action, params);
  }
};

// الأحداث المخصصة
export const trackSearch = (query: string, resultsCount: number) => {
  event('search', {
    event_category: 'search',
    event_label: query,
    value: resultsCount,
  });
};

export const trackUnderstandRepo = (repo: string) => {
  event('understand_repo', {
    event_category: 'analysis',
    event_label: repo,
  });
};

export const trackAIAnalysis = (repo: string) => {
  event('ai_analysis', {
    event_category: 'analysis',
    event_label: repo,
  });
};

export const trackFeedback = (rating: number, category: string) => {
  event('feedback', {
    event_category: 'feedback',
    event_label: category,
    value: rating,
  });
};

export const trackLogin = (provider: string) => {
  event('login', {
    event_category: 'auth',
    event_label: provider,
  });
};

export const trackFavorite = (action: 'add' | 'remove', repo: string) => {
  event('favorite', {
    event_category: 'favorites',
    event_label: repo,
    value: action === 'add' ? 1 : 0,
  });
};