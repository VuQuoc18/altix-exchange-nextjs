const ACCESS_KEY = 'cms.accessToken';
const REFRESH_KEY = 'cms.refreshToken';
const DRAFT_TTL_MS = 24 * 60 * 60 * 1000;

function draftKey(slug: string) {
  return `cms-draft:${slug}`;
}

export function getAccessToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(ACCESS_KEY);
}

export function getRefreshToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(REFRESH_KEY);
}

export function setTokens(accessToken: string, refreshToken: string): void {
  localStorage.setItem(ACCESS_KEY, accessToken);
  localStorage.setItem(REFRESH_KEY, refreshToken);
}

export function clearTokens(): void {
  localStorage.removeItem(ACCESS_KEY);
  localStorage.removeItem(REFRESH_KEY);
}

export function backupDraft(slug: string, json: Record<string, unknown>): void {
  localStorage.setItem(
    draftKey(slug),
    JSON.stringify({ savedAt: Date.now(), content: json }),
  );
}

export function loadBackup(slug: string): Record<string, unknown> | null {
  const raw = localStorage.getItem(draftKey(slug));
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as { savedAt?: number; content?: Record<string, unknown> };
    if (!parsed.savedAt || !parsed.content) return null;
    if (Date.now() - parsed.savedAt > DRAFT_TTL_MS) {
      localStorage.removeItem(draftKey(slug));
      return null;
    }
    return parsed.content;
  } catch {
    localStorage.removeItem(draftKey(slug));
    return null;
  }
}
