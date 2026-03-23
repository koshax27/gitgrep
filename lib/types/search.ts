export interface SearchResult {
  html_url: string;
  repository: {
    full_name: string;
    stargazers_count?: number;
    language?: string;
    updated_at?: string;
    open_issues_count?: number; // 👈 أضف هذا
  };
  path: string;
  text_matches?: Array<{
    fragment: string;
  }>;
  score?: number;
}

export interface FavoriteItem extends SearchResult {
  savedAt: Date;
}

export interface AnalyticsData {
  totalSearches: number;
  topLanguages: Record<string, number>;
  topRepos: Record<string, number>;
  securityIssues: number;
}
