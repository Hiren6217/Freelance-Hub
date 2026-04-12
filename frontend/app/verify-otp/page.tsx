'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ShieldCheck, KeyRound } from 'lucide-react';
import { verifySignupOtp, verifyLoginOtp } from '@/lib/api';

export default function VerifyOtpPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [mode, setMode] = useState<string | null>(null);
  const [email, setEmail] = useState<string>('');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const queryMode = searchParams.get('mode');
    const queryEmail = searchParams.get('email');
    setMode(queryMode);

    if (queryEmail) {
      setEmail(queryEmail);
      localStorage.setItem('pendingEmail', queryEmail);
    } else {
      const pendingEmail = localStorage.getItem('pendingEmail');
      if (pendingEmail) {
        setEmail(pendingEmail);
      }
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (!email || !code) {
      setError('Please provide your email and OTP code.');
      return;
    }

    setLoading(true);

    try {
      if (mode === 'signup') {
        const response = await verifySignupOtp(email, code);
        setMessage(response.message || 'Email verified successfully.');
        setTimeout(() => router.push('/login'), 1500);
        return;
      }

      if (mode === 'login') {
        const response = await verifyLoginOtp(email, code);
        localStorage.setItem('authToken', response.token);
        localStorage.setItem('userId', response.userId.toString());
        localStorage.setItem('userEmail', response.email);
        localStorage.setItem('userName', response.name);
        localStorage.setItem('userRole', response.role);

        if (response.role === 'CLIENT') {
          router.push('/dashboard/client');
          return;
        }

        if (response.role === 'ADMIN') {
          router.push('/dashboard/admin');
          return;
        }

        router.push('/dashboard/developer');
        return;
      }

      setError('Missing verification mode.');
    } catch (err: any) {
      setError(err.message || 'OTP verification failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen px-4 py-8">
      <section className="page-shell">
        <div className="mx-auto max-w-xl rounded-[2rem] border border-slate-200 bg-white p-8 shadow-xl md:p-10">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-[#e8f3ff] p-3 text-[#0a66c2]">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-3xl font-semibold">Verify your email</h1>
              <p className="mt-1 text-sm text-slate-500">
                Enter the OTP sent to {email || 'your email'} to complete {mode === 'login' ? 'login' : 'signup'}.
              </p>
            </div>
          </div>

          {message && <div className="mt-5 rounded-2xl border border-green-200 bg-green-50 p-4 text-sm text-green-800">{message}</div>}
          {error && <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">{error}</div>}

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
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

            <div>
              <label className="mb-2 block text-sm font-medium">OTP code</label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-[#0a66c2] focus:ring-2 focus:ring-[#e8f3ff]"
                placeholder="123456"
                required
                disabled={loading}
              />
            </div>

            <button type="submit" disabled={loading} className="linkedin-button flex w-full justify-center gap-2 disabled:cursor-not-allowed disabled:opacity-50">
              {loading ? 'Verifying...' : 'Verify OTP'}
              {!loading && <KeyRound className="h-4 w-4" />}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-500">
            Need a new code?{' '}
            <Link href={mode === 'login' ? '/login' : '/signup'} className="font-semibold text-[#0a66c2] hover:underline">
              {mode === 'login' ? 'Back to login' : 'Back to signup'}
            </Link>
          </p>
        </div>
      </section>
    </main>
  );
}
