/** Headers GitHub API expects; optional GITHUB_TOKEN reduces rate limits. */
export function githubHeaders(): HeadersInit {
  const h: Record<string, string> = {
    Accept: "application/vnd.github+json",
    "User-Agent": "GitGrep/1.0 (repo-insights)",
  };
  const token = process.env.GITHUB_TOKEN;
  if (token) {
    h.Authorization = `Bearer ${token}`;
  }
  return h;
}
