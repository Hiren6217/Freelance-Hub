'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowRight, BriefcaseBusiness, ShieldCheck, UserRound } from 'lucide-react';

export default function DashboardPage() {
  const router = useRouter();
  const [statusText, setStatusText] = useState('Checking your account workspace...');

  useEffect(() => {
    const role = localStorage.getItem('userRole');
    const authToken = localStorage.getItem('authToken');

    const timer = setTimeout(() => {
      if (!authToken) {
        router.push('/login');
        return;
      }

      if (role === 'CLIENT') {
        router.push('/dashboard/client');
        return;
      }

      if (role === 'ADMIN') {
        router.push('/dashboard/admin');
        return;
      }

      router.push('/dashboard/developer');
    }, 900);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <main className="min-h-screen px-4 py-10">
      <div className="page-shell">
        <div className="surface-card mx-auto max-w-5xl p-8 md:p-10">
          <div className="grid gap-8 lg:grid-cols-[1fr_0.9fr] lg:items-center">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[#0a66c2]">Workspace routing</p>
              <h1 className="headline-balance mt-4 text-4xl font-semibold leading-tight">
                Sending you to the right LinkedIn-style dashboard.
              </h1>
              <p className="mt-4 text-sm leading-7 text-slate-600">{statusText}</p>
              <Link href="/" className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-[#0a66c2]">
                Back to home <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              {[
                { icon: BriefcaseBusiness, title: 'Client', body: 'Hiring pipeline, candidates, and outreach.' },
                { icon: UserRound, title: 'Developer', body: 'Applications, messages, and profile visibility.' },
                { icon: ShieldCheck, title: 'Admin', body: 'Moderation, analytics, and platform health.' },
              ].map((item) => (
                <div key={item.title} className="rounded-[1.75rem] border border-slate-200 bg-slate-50 p-5">
                  <div className="w-fit rounded-2xl bg-[#e8f3ff] p-3 text-[#0a66c2]">
                    <item.icon className="h-5 w-5" />
                  </div>
                  <h2 className="mt-4 text-lg font-semibold">{item.title}</h2>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{item.body}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
