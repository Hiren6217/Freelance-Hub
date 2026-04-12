'use client';

import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowRight, KeyRound, ShieldCheck } from 'lucide-react';
import { requestLoginOtp } from '@/lib/api';

function LoginPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [fallbackOtp, setFallbackOtp] = useState('');
  const [unverifiedEmail, setUnverifiedEmail] = useState('');

  useEffect(() => {
    if (searchParams.get('signup') === 'success') {
      setSuccessMessage('Account created successfully. Sign in to open your workspace.');
    }
  }, [searchParams]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    setFallbackOtp('');

    if (!email) {
      setError('Please enter your email address first.');
      return;
    }

    setLoading(true);

    try {
      const response: any = await requestLoginOtp(email);
      if (response.otp) {
        localStorage.setItem('pendingOtp', response.otp);
      } else {
        localStorage.removeItem('pendingOtp');
      }
      localStorage.setItem('pendingEmail', email);
      const otpQuery = response.otp ? `&otp=${encodeURIComponent(response.otp)}` : '';
      router.push(`/verify-otp?mode=login&email=${encodeURIComponent(email)}${otpQuery}`);
    } catch (err: any) {
      const message = err.message || 'Unable to send login OTP.';
      if (message.includes('Email not verified')) {
        setError('Email is not verified yet. Please complete signup verification.');
        setUnverifiedEmail(email);
        router.push(`/verify-otp?mode=signup&email=${encodeURIComponent(email)}`);
        return;
      }
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen px-4 py-8">
      <section className="page-shell">
        <div className="grid gap-8 lg:grid-cols-[0.92fr_1.08fr] lg:items-center">
          <div className="surface-card p-8 md:p-10">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-[#e8f3ff] p-3 text-[#0a66c2]">
                <KeyRound className="h-5 w-5" />
              </div>
              <div>
                <h1 className="text-3xl font-semibold">Sign in to FreelanceHub</h1>
                <p className="mt-1 text-sm text-slate-500">Access your hiring, talent, or admin workspace.</p>
              </div>
            </div>

            {successMessage && <div className="mt-5 rounded-2xl border border-green-200 bg-green-50 p-4 text-sm text-green-800">{successMessage}</div>}
            {error && <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">{error}</div>}
            {fallbackOtp && (
              <div className="mt-5 rounded-2xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-800">
                <p>Your OTP code is:</p>
                <p className="mt-2 rounded-xl bg-white px-4 py-3 font-mono text-left text-sm text-slate-900">{fallbackOtp}</p>
                <p className="mt-2 text-xs text-slate-500">Use this code on the verify page.</p>
              </div>
            )}
            {unverifiedEmail && (
              <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
                Your email is not verified yet. <a href={`/verify-otp?mode=signup&email=${encodeURIComponent(unverifiedEmail)}`} className="font-semibold text-[#0a66c2] hover:underline">Enter your signup OTP</a>.
              </div>
            )}

            <form onSubmit={handleLogin} className="mt-6 space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-[#0a66c2] focus:ring-2 focus:ring-[#e8f3ff]"
                  placeholder="you@example.com"
                  required
                  disabled={loading}
                />
              </div>
                <button type="submit" disabled={loading} className="linkedin-button flex w-full gap-2 disabled:cursor-not-allowed disabled:opacity-50">
                {loading ? 'Sending code...' : 'Sign in'}
                {!loading && <ArrowRight className="h-4 w-4" />}
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-slate-500">
              Don&apos;t have an account?{' '}
              <Link href="/signup" className="font-semibold text-[#0a66c2] hover:underline">
                Sign up
              </Link>
            </p>
          </div>

          <div className="surface-subtle p-8 md:p-10">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[#0a66c2]">Single network, three workspaces</p>
            <h2 className="headline-balance mt-4 text-4xl font-semibold leading-tight">
              Recruit, apply, and manage the platform from one consistent interface.
            </h2>
            <div className="mt-8 space-y-4">
              {[
                'Clients get a jobs feed, candidate review pipeline, and messaging controls.',
                'Developers see job discovery, application tracking, and profile visibility tools.',
                'Admins enter an operations console for analytics, moderation, and support.',
              ].map((item) => (
                <div key={item} className="rounded-[1.5rem] border border-slate-200 bg-white/90 p-4">
                  <div className="flex items-start gap-3">
                    <div className="rounded-2xl bg-[#e8f3ff] p-3 text-[#0a66c2]">
                      <ShieldCheck className="h-5 w-5" />
                    </div>
                    <p className="text-sm leading-7 text-slate-600">{item}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<main className="min-h-screen" />}>
      <LoginPageContent />
    </Suspense>
  );
}
