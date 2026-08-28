import {
  clearTokens,
  getAccessToken,
  getRefreshToken,
  setTokens,
} from './storage';
import type {
  AdminBlog,
  AdminPage,
  CmsApiError,
  MeUser,
  PublicBlogDetail,
  PublicBlogListItem,
  PublicPage,
  Token,
} from './types';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

async function parseError(response: Response): Promise<CmsApiError> {
  const body = await response.json().catch(() => ({}));
  const detail =
    typeof body === 'object' && body !== null && 'detail' in body
      ? (body as { detail: unknown }).detail
      : body;
  return { status: response.status, detail };
}

async function refreshAccessToken(): Promise<boolean> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) return false;

  const response = await fetch(`${BASE_URL}/api/v1/auth/refresh`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${refreshToken}`,
    },
  });

  if (!response.ok) {
    clearTokens();
    return false;
  }

  const tokenData = (await response.json()) as Token;
  setTokens(tokenData.access_token, tokenData.refresh_token);
  return true;
}

async function authFetch(
  endpoint: string,
  options: RequestInit = {},
  retry = true,
): Promise<Response> {
  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string>),
  };

  const accessToken = getAccessToken();
  if (accessToken) {
    headers.Authorization = `Bearer ${accessToken}`;
  }

  if (options.body && !headers['Content-Type'] && !(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (response.status === 401 && retry) {
    const refreshed = await refreshAccessToken();
    if (refreshed) {
      return authFetch(endpoint, options, false);
    }
  }

  return response;
}

async function requestJson<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const response = await authFetch(endpoint, options);
  if (!response.ok) {
    throw await parseError(response);
  }
  if (response.status === 204) {
    return undefined as T;
  }
  return (await response.json()) as T;
}

export async function login(username: string, password: string): Promise<Token> {
  const formData = new URLSearchParams();
  formData.append('username', username);
  formData.append('password', password);
  formData.append('grant_type', 'password');

  const response = await fetch(`${BASE_URL}/api/v1/auth/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: formData,
  });

  if (!response.ok) {
    throw await parseError(response);
  }

  const tokenData = (await response.json()) as Token;
  setTokens(tokenData.access_token, tokenData.refresh_token);
  return tokenData;
}

export async function me(): Promise<MeUser> {
  return requestJson<MeUser>('/api/v1/users/me');
}

export async function getPublicPage(slug: string): Promise<PublicPage> {
  const response = await fetch(`${BASE_URL}/api/v1/public/cms/pages/${slug}`);
  if (!response.ok) {
    throw await parseError(response);
  }
  return (await response.json()) as PublicPage;
}

export async function getAdminPage(slug: string): Promise<AdminPage> {
  return requestJson<AdminPage>(`/api/v1/admin/cms/pages/${slug}`);
}

export async function patchPage(
  slug: string,
  payload: { expected_draft_updated_at: string; path: string; value: string },
): Promise<AdminPage> {
  return requestJson<AdminPage>(`/api/v1/admin/cms/pages/${slug}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
}

export async function publishPage(slug: string): Promise<AdminPage> {
  return requestJson<AdminPage>(`/api/v1/admin/cms/pages/${slug}/publish`, {
    method: 'POST',
  });
}

export async function listPublicBlog(): Promise<PublicBlogListItem[]> {
  const response = await fetch(`${BASE_URL}/api/v1/public/cms/blog`);
  if (!response.ok) {
    throw await parseError(response);
  }
  return (await response.json()) as PublicBlogListItem[];
}

export async function getPublicBlog(slug: string): Promise<PublicBlogDetail> {
  const response = await fetch(`${BASE_URL}/api/v1/public/cms/blog/${slug}`);
  if (!response.ok) {
    throw await parseError(response);
  }
  return (await response.json()) as PublicBlogDetail;
}

export async function listAdminBlog(): Promise<AdminBlog[]> {
  return requestJson<AdminBlog[]>('/api/v1/admin/cms/blog');
}

export async function createBlog(title: string): Promise<AdminBlog> {
  return requestJson<AdminBlog>('/api/v1/admin/cms/blog', {
    method: 'POST',
    body: JSON.stringify({ title }),
  });
}

export async function getAdminBlog(id: string): Promise<AdminBlog> {
  return requestJson<AdminBlog>(`/api/v1/admin/cms/blog/${id}`);
}

export async function patchBlog(
  id: string,
  payload: { expected_draft_updated_at: string; path: string; value: string },
): Promise<AdminBlog> {
  return requestJson<AdminBlog>(`/api/v1/admin/cms/blog/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
}

export async function publishBlog(id: string): Promise<AdminBlog> {
  return requestJson<AdminBlog>(`/api/v1/admin/cms/blog/${id}/publish`, {
    method: 'POST',
  });
}

export async function uploadMedia(file: File): Promise<{ url: string }> {
  const formData = new FormData();
  formData.append('file', file);

  const response = await authFetch('/api/v1/admin/cms/media', {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    throw await parseError(response);
  }

  return (await response.json()) as { url: string };
}

export function isCmsApiError(error: unknown): error is CmsApiError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'status' in error &&
    typeof (error as CmsApiError).status === 'number'
  );
}
