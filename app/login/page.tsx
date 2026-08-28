'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { login, me, isCmsApiError } from '@/lib/cms/api';
import { clearTokens } from '@/lib/cms/storage';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await login(email, password);
      const user = await me();
      if (user.role.name !== 'ADMIN') {
        clearTokens();
        setError('Admin only');
        return;
      }
      router.push('/');
    } catch (err) {
      if (isCmsApiError(err)) {
        const detail = err.detail;
        setError(typeof detail === 'string' ? detail : 'Login failed');
      } else {
        setError('Login failed');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#17192b] px-4">
      <div className="w-full max-w-md rounded-lg border border-white/10 bg-[#1e2038] p-8 shadow-xl">
        <div className="mb-8 text-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/assets/img/logo.png"
            alt="ALTIX Exchange"
            className="mx-auto mb-4 h-10 w-auto"
          />
          <h1 className="text-xl font-semibold text-white">CMS Admin Login</h1>
          <p className="mt-2 text-sm text-white/60">Authorized administrators only</p>
        </div>

        <form onSubmit={(event) => void handleSubmit(event)} className="space-y-4">
          <div>
            <label htmlFor="email" className="mb-1 block text-sm text-white/80">
              Email
            </label>
            <input
              id="email"
              type="email"
              autoComplete="username"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="w-full rounded border border-white/15 bg-[#17192b] px-3 py-2 text-white outline-none focus:border-[#e6463a]"
            />
          </div>
          <div>
            <label htmlFor="password" className="mb-1 block text-sm text-white/80">
              Password
            </label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="w-full rounded border border-white/15 bg-[#17192b] px-3 py-2 text-white outline-none focus:border-[#e6463a]"
            />
          </div>

          {error ? (
            <p className="rounded bg-[#e6463a]/15 px-3 py-2 text-sm text-[#ff9a91]" role="alert">
              {error}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded bg-[#e6463a] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#d1372b] disabled:opacity-60"
          >
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-white/50">
          <Link href="/" className="hover:text-white">
            Back to site
          </Link>
        </p>
      </div>
    </div>
  );
}
