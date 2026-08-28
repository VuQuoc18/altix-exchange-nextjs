'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowRight, BookOpen, Plus } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import EditableText from '@/components/cms/EditableText';
import { useCms } from '@/components/cms/CmsProvider';
import { createBlog, listPublicBlog } from '@/lib/cms/api';
import type { PublicBlogListItem } from '@/lib/cms/types';

function formatDate(iso: string | null): string {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

export default function InsightsPage() {
  const router = useRouter();
  const { isEditing, registerBlog } = useCms();
  const [posts, setPosts] = useState<PublicBlogListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void listPublicBlog()
      .then((items) => {
        if (!cancelled) setPosts(items);
      })
      .catch(() => {
        if (!cancelled) setPosts([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const handleNewArticle = async () => {
    if (creating) return;
    setCreating(true);
    try {
      const post = await createBlog('Untitled');
      registerBlog(post.id, post.draft_updated_at);
      router.push(`/insights/${post.slug}`);
    } catch {
      // errors surface via toolbar status
    } finally {
      setCreating(false);
    }
  };

  return (
    <>
      <Header />

      <main id="main" data-cms-page="insights">
        <section className="relative overflow-hidden bg-[#17192b] text-white">
          <div
            className="absolute inset-0 opacity-10 pointer-events-none"
            style={{
              backgroundImage:
                'linear-gradient(to right, rgba(255,255,255,0.08) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.08) 1px, transparent 1px)',
              backgroundSize: '48px 48px',
            }}
          />
          <div className="container relative z-10 py-20 lg:py-24">
            <div className="eyebrow eyebrow--light mb-3">
              <BookOpen className="h-4 w-4" />
              ALTIX Insights
            </div>
            <h1 className="max-w-3xl font-serif text-4xl font-black tracking-tight sm:text-5xl">
              <EditableText
                pageSlug="insights"
                path="title"
                fallback="Insights"
              />
            </h1>
            <p className="mt-5 max-w-2xl text-lg text-slate-300">
              <EditableText
                pageSlug="insights"
                path="intro"
                fallback="Notes on litigation finance, recovery, and market structure."
              />
            </p>
            {isEditing ? (
              <div className="mt-8">
                <button
                  type="button"
                  className="button button--sm"
                  disabled={creating}
                  onClick={() => void handleNewArticle()}
                >
                  <Plus className="h-4 w-4" />
                  {creating ? 'Creating…' : 'New article'}
                </button>
              </div>
            ) : null}
          </div>
        </section>

        <section className="section bg-white">
          <div className="container">
            {loading ? (
              <p className="text-slate-500">Loading articles…</p>
            ) : posts.length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-6 py-16 text-center">
                <p className="text-lg font-semibold text-slate-700">No published articles yet</p>
                <p className="mt-2 text-slate-500">
                  Check back soon for notes on litigation finance and recovery.
                </p>
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {posts.map((post) => (
                  <Link
                    key={post.slug}
                    href={`/insights/${post.slug}`}
                    className="group flex h-full flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:border-[#e6463a]/30 hover:shadow-lg"
                  >
                    <div className="aspect-[16/10] overflow-hidden bg-slate-100">
                      {post.cover_image_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={post.cover_image_url}
                          alt=""
                          className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.02]"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 text-sm text-slate-500">
                          ALTIX Insights
                        </div>
                      )}
                    </div>
                    <div className="flex flex-1 flex-col p-6">
                      {post.published_at ? (
                        <p className="text-xs font-semibold uppercase tracking-wider text-[#e6463a]">
                          {formatDate(post.published_at)}
                        </p>
                      ) : null}
                      <h2 className="mt-2 font-serif text-2xl font-bold text-[#24263f] group-hover:text-[#e6463a]">
                        {post.title}
                      </h2>
                      <p className="mt-3 flex-1 text-slate-600">{post.excerpt}</p>
                      <span className="mt-5 inline-flex items-center gap-1 text-sm font-semibold text-[#e6463a]">
                        Read article
                        <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
