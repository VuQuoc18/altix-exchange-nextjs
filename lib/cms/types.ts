export type CmsStatus = 'idle' | 'saving' | 'saved' | 'unsaved' | 'conflict' | 'error';

export type AdminPage = {
  slug: string;
  draft_content: Record<string, unknown>;
  published_content: Record<string, unknown>;
  draft_updated_at: string;
  published_at: string | null;
};

export type PublicPage = {
  slug: string;
  content: Record<string, unknown>;
  published_at: string | null;
};

export type Token = { access_token: string; refresh_token: string; token_type: string };

export type MeUser = { id: string; email: string; role: { name: string } };

export type PublicBlogListItem = {
  slug: string;
  title: string;
  excerpt: string;
  cover_image_url: string;
  published_at: string | null;
};

export type PublicBlogDetail = PublicBlogListItem & {
  body_html: string;
  seo_title: string;
  seo_description: string;
};

export type AdminBlog = {
  id: string;
  slug: string;
  draft: Record<string, string>;
  published: Record<string, string> | null;
  status: string;
  draft_updated_at: string;
  published_at: string | null;
};

export type CmsApiError = { status: number; detail: unknown };

export type PageState = {
  content: Record<string, unknown>;
  draftUpdatedAt: string;
  dirty: boolean;
};
