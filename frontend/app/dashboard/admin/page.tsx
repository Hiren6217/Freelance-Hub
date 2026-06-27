'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle,
  BarChart3,
  BriefcaseBusiness,
  LifeBuoy,
  MessageSquareText,
  ShieldCheck,
  UserCog,
  Users,
} from 'lucide-react';

const moderationQueue = [
  { id: 'MOD-112', type: 'Profile review', subject: 'Referral score anomaly', priority: 'High', owner: 'Trust team' },
  { id: 'MOD-084', type: 'Message audit', subject: 'Spam outreach cluster', priority: 'Medium', owner: 'Support ops' },
  { id: 'MOD-061', type: 'Job review', subject: 'Duplicate frontend roles', priority: 'Low', owner: 'Marketplace ops' },
];

const adminActions = [
  { icon: UserCog, title: 'User controls', body: 'Suspend accounts, verify employers, and review role changes.' },
  { icon: BriefcaseBusiness, title: 'Job governance', body: 'Audit posting quality, duplicate roles, and referral abuse.' },
  { icon: MessageSquareText, title: 'Support inbox', body: 'Triage complaints, reply to escalations, and resolve disputes.' },
];

export default function AdminDashboardPage() {
  const router = useRouter();
  const [userName, setUserName] = useState('Admin');

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    const role = localStorage.getItem('userRole');
    const name = localStorage.getItem('userName');

    if (!token) {
      router.push('/login');
      return;
    }

    if (role && role !== 'ADMIN') {
      router.push('/dashboard');
      return;
    }

    setUserName(name || 'Platform Admin');
  }, [router]);

  const totals = useMemo(
    () => ({
      users: 1284,
      recruiters: 362,
      jobs: 194,
      tickets: 17,
    }),
    [],
  );

  return (
    <main className="min-h-screen py-6">
      <div className="page-shell">
        <section className="surface-card mt-6 flex flex-wrap items-center justify-between gap-4 px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#e8f3ff] text-base font-semibold text-[#0a66c2]">
              FH
            </div>
            <div>
              <h1 className="text-xl font-semibold">FreelanceHub Admin</h1>
              <p className="text-sm text-slate-500">LinkedIn-style operations console</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="rounded-full bg-[#e8f3ff] px-4 py-2 text-sm font-semibold text-[#0a66c2]">{userName}</span>
            <Link href="/" className="linkedin-button-secondary">
              Home
            </Link>
          </div>
        </section>

        <section className="surface-subtle mt-6 px-6 py-8">
          <div className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[#0a66c2]">Operations hub</p>
              <h2 className="headline-balance mt-4 text-4xl font-semibold leading-tight">
                Platform control for hiring quality, trust signals, and user growth.
              </h2>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-600">
                This admin panel gives a clean overview of member growth, job health, moderation queues, and support operations while keeping the same blue and white visual system across the product.
              </p>
            </div>
            <div className="surface-card p-6">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Live snapshot</p>
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                {[
                  { label: 'Members', value: totals.users.toLocaleString(), icon: Users },
                  { label: 'Recruiters', value: totals.recruiters.toLocaleString(), icon: UserCog },
                  { label: 'Open jobs', value: totals.jobs.toLocaleString(), icon: BriefcaseBusiness },
                  { label: 'Active tickets', value: totals.tickets.toString(), icon: LifeBuoy },
                ].map((item) => (
                  <div key={item.label} className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-4">
                    <item.icon className="h-5 w-5 text-[#0a66c2]" />
                    <p className="mt-3 text-3xl font-semibold">{item.value}</p>
                    <p className="text-sm text-slate-500">{item.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="mt-6 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="surface-card p-6">
            <div className="mb-5 flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-[#0a66c2]" />
              <h3 className="text-xl font-semibold">Moderation queue</h3>
            </div>
            <div className="space-y-4">
              {moderationQueue.map((item) => (
                <div key={item.id} className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="font-semibold">{item.subject}</p>
                      <p className="mt-1 text-sm text-slate-500">
                        {item.id} · {item.type} · Owner: {item.owner}
                      </p>
                    </div>
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        item.priority === 'High'
                          ? 'bg-orange-100 text-orange-700'
                          : item.priority === 'Medium'
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-slate-200 text-slate-700'
                      }`}
                    >
                      {item.priority}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="surface-card p-6">
            <div className="mb-5 flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-[#0a66c2]" />
              <h3 className="text-xl font-semibold">Health metrics</h3>
            </div>
            <div className="space-y-4">
              {[
                { label: 'Profile completion', value: '81%', hint: 'Strong onboarding adoption' },
                { label: 'Recruiter response rate', value: '73%', hint: 'Above weekly baseline' },
                { label: 'Spam risk score', value: '4.2%', hint: 'Needs review in outreach flow' },
                { label: 'Dispute resolution SLA', value: '6h', hint: 'Within target threshold' },
              ].map((metric) => (
                <div key={metric.label} className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-4">
                  <div className="flex items-center justify-between gap-4">
                    <p className="font-semibold">{metric.label}</p>
                    <p className="text-lg font-semibold text-[#0a66c2]">{metric.value}</p>
                  </div>
                  <p className="mt-1 text-sm text-slate-500">{metric.hint}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mt-6 grid gap-6 md:grid-cols-3">
          {adminActions.map((action) => (
            <article key={action.title} className="surface-card p-6">
              <div className="w-fit rounded-2xl bg-[#e8f3ff] p-3 text-[#0a66c2]">
                <action.icon className="h-5 w-5" />
              </div>
              <h3 className="mt-4 text-xl font-semibold">{action.title}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">{action.body}</p>
            </article>
          ))}
        </section>

        <section className="mt-6 surface-card p-6">
          <div className="mb-5 flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-[#0a66c2]" />
            <h3 className="text-xl font-semibold">Recommended next admin features</h3>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {[
              'Role-based protected routes backed by token verification.',
              'Real user, job, and application aggregation from the backend.',
              'Moderation actions connected to user and job state changes.',
            ].map((item) => (
              <div key={item} className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-4 text-sm leading-6 text-slate-600">
                {item}
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
