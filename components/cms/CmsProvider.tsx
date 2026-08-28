'use client';

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { usePathname } from 'next/navigation';
import * as cmsApi from '@/lib/cms/api';
import { getByPath, setByPath } from '@/lib/cms/path';
import { backupDraft, clearTokens, getAccessToken, loadBackup } from '@/lib/cms/storage';
import type { CmsStatus, PageState } from '@/lib/cms/types';

type PendingPatch = {
  pageSlug: string;
  path: string;
  value: string;
};

type BlogState = {
  draftUpdatedAt: string;
  dirty: boolean;
};

type CmsContextValue = {
  isAdmin: boolean;
  isEditing: boolean;
  status: CmsStatus;
  getString: (pageSlug: string, path: string, fallback: string) => string;
  patch: (pageSlug: string, path: string, value: string) => void;
  patchBlogField: (blogId: string, path: string, value: string) => void;
  publishDirty: () => Promise<void>;
  enterEditMode: () => Promise<void>;
  exitEditMode: () => void;
  previewMode: () => void;
  flushPendingPatch: () => Promise<void>;
  uploadMedia: (file: File) => Promise<string>;
};

const CmsContext = createContext<CmsContextValue | null>(null);

const TRACKED_SLUGS = ['site'] as const;

function pathnameToPageSlug(pathname: string): string | null {
  if (pathname === '/') return 'home';
  if (pathname === '/insights' || pathname.startsWith('/insights/')) return 'insights';
  return null;
}

function mergePageState(
  prev: Record<string, PageState>,
  slug: string,
  content: Record<string, unknown>,
  draftUpdatedAt: string,
  dirty = false,
): Record<string, PageState> {
  return {
    ...prev,
    [slug]: { content, draftUpdatedAt, dirty },
  };
}

export function CmsProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const currentPageSlug = pathnameToPageSlug(pathname ?? '/');

  const [isAdmin, setIsAdmin] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [status, setStatus] = useState<CmsStatus>('idle');
  const [pages, setPages] = useState<Record<string, PageState>>({});
  const [blogs, setBlogs] = useState<Record<string, BlogState>>({});

  const pagesRef = useRef(pages);
  const blogsRef = useRef(blogs);
  const pendingRef = useRef<Map<string, PendingPatch>>(new Map());
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    pagesRef.current = pages;
  }, [pages]);

  useEffect(() => {
    blogsRef.current = blogs;
  }, [blogs]);

  const loadPublicPage = useCallback(async (slug: string) => {
    try {
      const page = await cmsApi.getPublicPage(slug);
      setPages((prev) =>
        mergePageState(prev, slug, page.content, page.published_at ?? new Date(0).toISOString()),
      );
    } catch {
      const backup = loadBackup(slug);
      if (backup) {
        setPages((prev) =>
          mergePageState(prev, slug, backup, new Date().toISOString()),
        );
      }
    }
  }, []);

  useEffect(() => {
    void loadPublicPage('site');
  }, [loadPublicPage]);

  useEffect(() => {
    if (currentPageSlug && currentPageSlug !== 'site') {
      void loadPublicPage(currentPageSlug);
    }
  }, [currentPageSlug, loadPublicPage]);

  useEffect(() => {
    const token = getAccessToken();
    if (!token) {
      setIsAdmin(false);
      return;
    }

    let cancelled = false;
    void cmsApi
      .me()
      .then((user) => {
        if (!cancelled) {
          setIsAdmin(user.role.name === 'ADMIN');
        }
      })
      .catch(() => {
        if (!cancelled) {
          clearTokens();
          setIsAdmin(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const getString = useCallback(
    (pageSlug: string, path: string, fallback: string): string => {
      const page = pages[pageSlug];
      if (!page) return fallback;
      try {
        const value = getByPath(page.content, path);
        return typeof value === 'string' ? value : fallback;
      } catch {
        return fallback;
      }
    },
    [pages],
  );

  const executePatch = useCallback(async (pending: PendingPatch) => {
    const page = pagesRef.current[pending.pageSlug];
    if (!page) return;

    setStatus('saving');
    try {
      const updated = await cmsApi.patchPage(pending.pageSlug, {
        expected_draft_updated_at: page.draftUpdatedAt,
        path: pending.path,
        value: pending.value,
      });

      setPages((prev) =>
        mergePageState(
          prev,
          pending.pageSlug,
          updated.draft_content,
          updated.draft_updated_at,
          true,
        ),
      );
      backupDraft(pending.pageSlug, updated.draft_content);
      setStatus('saved');
    } catch (error) {
      if (cmsApi.isCmsApiError(error) && error.status === 409) {
        setStatus('conflict');
        return;
      }
      setStatus('error');
    }
  }, []);

  const pendingPatchKey = (pageSlug: string, path: string) => `${pageSlug}:${path}`;

  const flushPendingPatch = useCallback(async () => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
      debounceRef.current = null;
    }
    const pending = Array.from(pendingRef.current.values());
    if (pending.length === 0) return;
    pendingRef.current.clear();
    for (const patch of pending) {
      await executePatch(patch);
    }
  }, [executePatch]);

  const schedulePatch = useCallback(
    (pageSlug: string, path: string, value: string) => {
      pendingRef.current.set(pendingPatchKey(pageSlug, path), { pageSlug, path, value });
      setStatus('unsaved');
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
      debounceRef.current = setTimeout(() => {
        debounceRef.current = null;
        void flushPendingPatch();
      }, 1000);
    },
    [flushPendingPatch],
  );

  const patch = useCallback(
    (pageSlug: string, path: string, value: string) => {
      setPages((prev) => {
        const page = prev[pageSlug];
        if (!page) return prev;
        try {
          const content = setByPath(page.content, path, value);
          return mergePageState(prev, pageSlug, content, page.draftUpdatedAt, true);
        } catch {
          return prev;
        }
      });
      schedulePatch(pageSlug, path, value);
    },
    [schedulePatch],
  );

  const patchBlogField = useCallback(
    (blogId: string, path: string, value: string) => {
      const draftUpdatedAt =
        blogsRef.current[blogId]?.draftUpdatedAt ?? new Date().toISOString();
      const nextBlog = { draftUpdatedAt, dirty: true };

      setBlogs((prev) => ({
        ...prev,
        [blogId]: nextBlog,
      }));
      blogsRef.current = { ...blogsRef.current, [blogId]: nextBlog };

      setStatus('saving');
      void cmsApi
        .patchBlog(blogId, {
          expected_draft_updated_at: draftUpdatedAt,
          path,
          value,
        })
        .then((updated) => {
          setBlogs((prev) => ({
            ...prev,
            [blogId]: { draftUpdatedAt: updated.draft_updated_at, dirty: true },
          }));
          setStatus('saved');
        })
        .catch((error) => {
          if (cmsApi.isCmsApiError(error) && error.status === 409) {
            setStatus('conflict');
            return;
          }
          setStatus('error');
        });
    },
    [],
  );

  const enterEditMode = useCallback(async () => {
    const slugs = new Set<string>([...TRACKED_SLUGS]);
    if (currentPageSlug) slugs.add(currentPageSlug);

    setStatus('saving');
    try {
      const results = await Promise.all(
        Array.from(slugs).map((slug) => cmsApi.getAdminPage(slug)),
      );
      setPages((prev) => {
        let next = { ...prev };
        for (const page of results) {
          next = mergePageState(
            next,
            page.slug,
            page.draft_content,
            page.draft_updated_at,
            false,
          );
        }
        return next;
      });
      setIsEditing(true);
      setStatus('idle');
    } catch {
      setStatus('error');
    }
  }, [currentPageSlug]);

  const previewMode = useCallback(() => {
    setIsEditing(false);
  }, []);

  const exitEditMode = useCallback(() => {
    setIsEditing(false);
    setStatus('idle');
    void loadPublicPage('site');
    if (currentPageSlug && currentPageSlug !== 'site') {
      void loadPublicPage(currentPageSlug);
    }
  }, [currentPageSlug, loadPublicPage]);

  const publishDirty = useCallback(async () => {
    await flushPendingPatch();
    setStatus('saving');

    const dirtyPages = Object.entries(pagesRef.current).filter(([, page]) => page.dirty);
    const dirtyBlogs = Object.entries(blogsRef.current).filter(([, blog]) => blog.dirty);

    try {
      await Promise.all([
        ...dirtyPages.map(([slug]) => cmsApi.publishPage(slug)),
        ...dirtyBlogs.map(([id]) => cmsApi.publishBlog(id)),
      ]);

      setPages((prev) => {
        const next = { ...prev };
        for (const [slug] of dirtyPages) {
          if (next[slug]) {
            next[slug] = { ...next[slug], dirty: false };
          }
        }
        return next;
      });
      setBlogs((prev) => {
        const next = { ...prev };
        for (const [id] of dirtyBlogs) {
          if (next[id]) {
            next[id] = { ...next[id], dirty: false };
          }
        }
        return next;
      });
      setStatus('saved');
    } catch {
      setStatus('error');
    }
  }, [flushPendingPatch]);

  const uploadMedia = useCallback(async (file: File) => {
    const result = await cmsApi.uploadMedia(file);
    return result.url;
  }, []);

  const value = useMemo<CmsContextValue>(
    () => ({
      isAdmin,
      isEditing,
      status,
      getString,
      patch,
      patchBlogField,
      publishDirty,
      enterEditMode,
      exitEditMode,
      previewMode,
      flushPendingPatch,
      uploadMedia,
    }),
    [
      isAdmin,
      isEditing,
      status,
      getString,
      patch,
      patchBlogField,
      publishDirty,
      enterEditMode,
      exitEditMode,
      previewMode,
      flushPendingPatch,
      uploadMedia,
    ],
  );

  return <CmsContext.Provider value={value}>{children}</CmsContext.Provider>;
}

export function useCms(): CmsContextValue {
  const ctx = useContext(CmsContext);
  if (!ctx) {
    throw new Error('useCms must be used within CmsProvider');
  }
  return ctx;
}
