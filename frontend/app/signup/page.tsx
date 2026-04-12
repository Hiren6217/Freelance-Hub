'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowRight,
  BriefcaseBusiness,
  ShieldCheck,
  UserRoundPlus,
  Users,
} from 'lucide-react';
import { signup } from '@/lib/api';

export default function SignupPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fallbackOtp, setFallbackOtp] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (!formData.role) {
      setError('Please select your role.');
      return;
    }

    setLoading(true);
    setFallbackOtp('');

    try {
      const response: any = await signup(formData.name, formData.email, formData.password, formData.role);
      localStorage.setItem('hasSignedUp', 'true');
      localStorage.setItem('userEmail', formData.email);
      localStorage.setItem('userRole', formData.role);
      if (response.otp) {
        localStorage.setItem('pendingOtp', response.otp);
      } else {
        localStorage.removeItem('pendingOtp');
      }
      localStorage.setItem('pendingEmail', formData.email);
      const otpQuery = response.otp ? `&otp=${encodeURIComponent(response.otp)}` : '';
      router.push(`/verify-otp?mode=signup&email=${encodeURIComponent(formData.email)}${otpQuery}`);
    } catch (err: any) {
      setError(err.message || 'Signup failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((current) => ({
      ...current,
      [e.target.name]: e.target.value,
    }));
  };

  return (
    <main className="min-h-screen px-4 py-8">
      <section className="page-shell">
        <div className="grid gap-8 lg:grid-cols-[1.02fr_0.98fr] lg:items-center">
          <div className="surface-card p-8 md:p-10">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-[#e8f3ff] p-3 text-[#0a66c2]">
                <UserRoundPlus className="h-5 w-5" />
              </div>
              <div>
                <h1 className="text-3xl font-semibold">Create your FreelanceHub account</h1>
                <p className="mt-1 text-sm text-slate-500">Choose the role that matches how you use the network.</p>
              </div>
            </div>

            {error && <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">{error}</div>}
            {fallbackOtp && (
              <div className="mt-5 rounded-2xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-800">
                <p>Your OTP code is:</p>
                <p className="mt-2 rounded-xl bg-white px-4 py-3 font-mono text-left text-sm text-slate-900">{fallbackOtp}</p>
                <p className="mt-2 text-xs text-slate-500">Use this code on the verify page.</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium">Full Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-[#0a66c2] focus:ring-2 focus:ring-[#e8f3ff]"
                  placeholder="John Doe"
                  required
                  disabled={loading}
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-[#0a66c2] focus:ring-2 focus:ring-[#e8f3ff]"
                  placeholder="you@example.com"
                  required
                  disabled={loading}
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium">Password</label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-[#0a66c2] focus:ring-2 focus:ring-[#e8f3ff]"
                    placeholder="Minimum 6 characters"
                    required
                    minLength={6}
                    disabled={loading}
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium">Confirm Password</label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-[#0a66c2] focus:ring-2 focus:ring-[#e8f3ff]"
                    placeholder="Repeat password"
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              <div>
                <label className="mb-3 block text-sm font-medium">Select role</label>
                <div className="grid gap-3">
                  {[
                    {
                      role: 'CLIENT',
                      title: 'Hire talent',
                      body: 'Post jobs, review applicants, and message candidates.',
                      icon: BriefcaseBusiness,
                    },
                    {
                      role: 'DEVELOPER',
                      title: 'Find work',
                      body: 'Browse roles, submit applications, and track responses.',
                      icon: Users,
                    },
                    {
                      role: 'ADMIN',
                      title: 'Run platform ops',
                      body: 'Review platform metrics, moderation, and support queues.',
                      icon: ShieldCheck,
                    },
                  ].map((item) => (
                    <label key={item.role} className="cursor-pointer rounded-[1.5rem] border border-slate-200 bg-slate-50 p-4 transition hover:border-[#0a66c2] hover:bg-[#f7fbff]">
                      <div className="flex items-center gap-3">
                        <input
                          type="radio"
                          name="role"
                          value={item.role}
                          checked={formData.role === item.role}
                          onChange={handleChange}
                          className="h-5 w-5"
                          required
                          disabled={loading}
                        />
                        <div className="rounded-2xl bg-[#e8f3ff] p-3 text-[#0a66c2]">
                          <item.icon className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="font-semibold">{item.title}</p>
                          <p className="text-xs text-slate-500">{item.body}</p>
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <button type="submit" disabled={loading} className="linkedin-button flex w-full gap-2 disabled:cursor-not-allowed disabled:opacity-50">
                {loading ? 'Creating account...' : 'Create account'}
                {!loading && <ArrowRight className="h-4 w-4" />}
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-slate-500">
              Already have an account?{' '}
              <Link href="/login" className="font-semibold text-[#0a66c2] hover:underline">
                Sign in
              </Link>
            </p>
          </div>

          <div className="surface-subtle p-8 md:p-10">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[#0a66c2]">Platform setup</p>
            <h2 className="headline-balance mt-4 text-4xl font-semibold leading-tight">
              Join a freelance network designed like a professional social product.
            </h2>
            <div className="mt-8 space-y-4">
              {[
                'Blue and white UI across landing, auth, dashboards, discovery pages, and admin views.',
                'Role-based onboarding for recruiter, developer, and admin scenarios.',
                'Hiring flows remain connected to your existing Spring Boot and MySQL setup.',
              ].map((item) => (
                <div key={item} className="rounded-[1.5rem] border border-slate-200 bg-white/90 p-4 text-sm leading-7 text-slate-600">
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
