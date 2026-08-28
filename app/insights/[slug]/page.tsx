'use client';

import React, { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import EditableBlogImage from '@/components/cms/EditableBlogImage';
import EditableBlogRichText from '@/components/cms/EditableBlogRichText';
import EditableBlogText from '@/components/cms/EditableBlogText';
import { useCms } from '@/components/cms/CmsProvider';
import { getPublicBlog, isCmsApiError, listAdminBlog } from '@/lib/cms/api';

type PostFields = {
  title: string;
  excerpt: string;
  cover_image_url: string;
  body_html: string;
};

const EMPTY_POST: PostFields = {
  title: '',
  excerpt: '',
  cover_image_url: '',
  body_html: '',
};

function formatDate(iso: string | null): string {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

export default function InsightPostPage() {
  const params = useParams();
  const slug = typeof params.slug === 'string' ? params.slug : '';
  const { isEditing, isAdmin, registerBlog } = useCms();

  const [blogId, setBlogId] = useState<string | null>(null);
  const [publishedAt, setPublishedAt] = useState<string | null>(null);
  const [fields, setFields] = useState<PostFields>(EMPTY_POST);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const loadAdminPost = useCallback(async () => {
    const adminPosts = await listAdminBlog();
    const match = adminPosts.find((post) => post.slug === slug);
    if (!match) return false;

    setBlogId(match.id);
    registerBlog(match.id, match.draft_updated_at, match.draft);
    setPublishedAt(match.published_at);
    setFields({
      title: match.draft.title ?? '',
      excerpt: match.draft.excerpt ?? '',
      cover_image_url: match.draft.cover_image_url ?? '',
      body_html: match.draft.body_html ?? '',
    });
    return true;
  }, [registerBlog, slug]);

  useEffect(() => {
    if (!slug) {
      setNotFound(true);
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setNotFound(false);

    void (async () => {
      try {
        const post = await getPublicBlog(slug);
        if (cancelled) return;
        if (isAdmin && isEditing) {
          await loadAdminPost();
        } else {
          setPublishedAt(post.published_at);
          setFields({
            title: post.title,
            excerpt: post.excerpt,
            cover_image_url: post.cover_image_url,
            body_html: post.body_html,
          });
          setBlogId(null);
        }
      } catch (error) {
        if (cancelled) return;
        if (isCmsApiError(error) && error.status === 404 && isAdmin && isEditing) {
          const found = await loadAdminPost();
          if (!found) setNotFound(true);
        } else if (isCmsApiError(error) && error.status === 404) {
          setNotFound(true);
        } else {
          setNotFound(true);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [isAdmin, isEditing, loadAdminPost, slug]);

  useEffect(() => {
    if (!slug || !isEditing || !isAdmin) return;
    let cancelled = false;

    void (async () => {
      try {
        const found = await loadAdminPost();
        if (!cancelled && !found && !blogId) {
          setNotFound(true);
        }
      } catch {
        if (!cancelled) setNotFound(true);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [blogId, isAdmin, isEditing, loadAdminPost, slug]);

  const updateField = useCallback(
    (path: keyof PostFields) => (value: string) => {
      setFields((prev) => ({ ...prev, [path]: value }));
    },
    [],
  );

  if (loading) {
    return (
      <>
        <Header />
        <main id="main" className="section">
          <div className="container">
            <p className="text-slate-500">Loading article…</p>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  if (notFound) {
    return (
      <>
        <Header />
        <main id="main" className="section">
          <div className="container narrow text-center">
            <h1 className="font-serif text-4xl font-black text-[#24263f]">Article not found</h1>
            <p className="mt-4 text-slate-600">
              This article may be unpublished or no longer available.
            </p>
            <Link href="/insights" className="button mt-8 inline-flex">
              <ArrowLeft className="h-4 w-4" />
              Back to Insights
            </Link>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  const canEdit = isEditing && isAdmin && blogId;

  return (
    <>
      <Header />

      <main id="main">
        <article className="article">
          <div className="relative overflow-hidden bg-[#17192b] text-white">
            <div className="container relative z-10 py-10">
              <Link
                href="/insights"
                className="inline-flex items-center gap-2 text-sm font-semibold text-slate-300 transition hover:text-white"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Insights
              </Link>
            </div>
            {canEdit ? (
              <EditableBlogImage
                blogId={blogId}
                path="cover_image_url"
                value={fields.cover_image_url}
                onValueChange={updateField('cover_image_url')}
                alt={fields.title}
                className="aspect-[21/9] w-full"
              />
            ) : fields.cover_image_url ? (
              <div className="aspect-[21/9] w-full overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={fields.cover_image_url}
                  alt=""
                  className="h-full w-full object-cover"
                />
              </div>
            ) : null}
            <div className="container relative z-10 pb-16 pt-10">
              {publishedAt ? (
                <p className="text-xs font-semibold uppercase tracking-wider text-[#ff9a91]">
                  {formatDate(publishedAt)}
                </p>
              ) : null}
              <h1 className="mt-3 max-w-4xl font-serif text-4xl font-black tracking-tight sm:text-5xl">
                {canEdit ? (
                  <EditableBlogText
                    blogId={blogId}
                    path="title"
                    value={fields.title}
                    onValueChange={updateField('title')}
                  />
                ) : (
                  fields.title
                )}
              </h1>
              <p className="mt-5 max-w-3xl text-lg text-slate-300">
                {canEdit ? (
                  <EditableBlogText
                    blogId={blogId}
                    path="excerpt"
                    value={fields.excerpt}
                    onValueChange={updateField('excerpt')}
                  />
                ) : (
                  fields.excerpt
                )}
              </p>
            </div>
          </div>

          <div className="section bg-white">
            <div className="container narrow">
              {canEdit ? (
                <EditableBlogRichText
                  blogId={blogId}
                  path="body_html"
                  value={fields.body_html}
                  onValueChange={updateField('body_html')}
                  className="text-[17px] leading-relaxed text-slate-700 [&_a]:text-[#e6463a] [&_h2]:mb-4 [&_h2]:mt-8 [&_h2]:font-serif [&_h2]:text-2xl [&_h2]:text-[#24263f] [&_h3]:mb-3 [&_h3]:mt-6 [&_h3]:font-serif [&_h3]:text-xl [&_li]:mb-2 [&_ol]:mb-4 [&_ol]:list-decimal [&_ol]:pl-6 [&_p]:mb-4 [&_ul]:mb-4 [&_ul]:list-disc [&_ul]:pl-6"
                />
              ) : (
                <div
                  className="text-[17px] leading-relaxed text-slate-700 [&_a]:text-[#e6463a] [&_h2]:mb-4 [&_h2]:mt-8 [&_h2]:font-serif [&_h2]:text-2xl [&_h2]:text-[#24263f] [&_h3]:mb-3 [&_h3]:mt-6 [&_h3]:font-serif [&_h3]:text-xl [&_li]:mb-2 [&_ol]:mb-4 [&_ol]:list-decimal [&_ol]:pl-6 [&_p]:mb-4 [&_ul]:mb-4 [&_ul]:list-disc [&_ul]:pl-6"
                  dangerouslySetInnerHTML={{ __html: fields.body_html }}
                />
              )}
            </div>
          </div>
        </article>
      </main>

      <Footer />
    </>
  );
}
