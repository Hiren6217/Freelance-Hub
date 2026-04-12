'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  ArrowRight,
  BriefcaseBusiness,
  ChartColumn,
  CircleFadingArrowUp,
  MessageSquareMore,
  Search,
  ShieldCheck,
  Users,
} from 'lucide-react';

export default function HomePage() {
  const [hasSignedUp, setHasSignedUp] = useState(false);

  useEffect(() => {
    const signedUp = localStorage.getItem('hasSignedUp');
    setHasSignedUp(signedUp === 'true');
  }, []);

  return (
    <main className="min-h-screen py-6">
      <section className="page-shell">
        <section className="surface-subtle mt-6 overflow-hidden px-6 py-8 md:px-10 md:py-12">
          <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
            <div className="surface-card fade-up rounded-[2rem] border border-slate-200 bg-slate-50 p-4 shadow-sm">
              <Image
                src="/job-portal-hero.svg"
                alt="Freelancers finding jobs on a hiring platform"
                width={760}
                height={520}
                className="w-full rounded-[1.5rem] object-cover"
                priority
              />
            </div>

            <div className="fade-up fade-up-delay-1 space-y-6">
              <div>
                <p className="text-xs uppercase tracking-[0.35em] text-[#0a66c2]">Freelancer marketplace</p>
                <h2 className="headline-balance mt-4 text-4xl font-semibold leading-tight md:text-5xl">
                  Find freelance jobs, manage applications, and grow your professional network.
                </h2>
              </div>

              <div className="space-y-4 text-sm leading-7 text-slate-600">
                <p>
                  FreelanceHub connects independent professionals with remote and contract work opportunities across product, engineering, design, and growth. Discover curated roles, submit applications, and keep your hiring activity organized in one purpose-built workspace.
                </p>
                <p>
                  The platform is designed for freelancers who want a modern job search experience with clear role details, application status tracking, and a trusted portfolio of clients.
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                {[
                  { title: 'Curated job matches', body: 'Relevant freelance roles delivered directly to your profile.' },
                  { title: 'Fast application flow', body: 'Submit proposals, track status, and follow up from one interface.' },
                  { title: 'Trusted recruiter network', body: 'Engage with vetted clients and referral-backed opportunities.' },
                  { title: 'Role-aware dashboard', body: 'See jobs, messages, and feedback tailored to freelancers.' },
                ].map((item) => (
                  <div key={item.title} className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm">
                    <h3 className="text-base font-semibold text-slate-900">{item.title}</h3>
                    <p className="mt-2 text-sm text-slate-600">{item.body}</p>
                  </div>
                ))}
              </div>

              <div className="flex flex-wrap gap-4">
                <Link href="/dashboard" className="linkedin-button gap-2">
                  Browse jobs <ArrowRight className="h-4 w-4" />
                </Link>
                <Link href={hasSignedUp ? '/login' : '/signup'} className="linkedin-button-secondary">
                  {hasSignedUp ? 'Sign in' : 'Join FreelanceHub'}
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-10 grid gap-4 md:grid-cols-3">
          {[
            { icon: Search, title: 'Discover talent', body: 'Search developer profiles, availability, and trust signals the way recruiters expect.' },
            { icon: ChartColumn, title: 'Track hiring', body: 'Pipeline summaries, application statuses, and response velocity stay visible.' },
            { icon: ShieldCheck, title: 'Admin oversight', body: 'Ops can monitor growth, flagged activity, team health, and moderation queues.' },
          ].map((feature, index) => (
            <article key={feature.title} className={`surface-card fade-up ${index === 1 ? 'fade-up-delay-1' : index === 2 ? 'fade-up-delay-2' : ''} p-6`}>
              <feature.icon className="h-6 w-6 text-[#0a66c2]" />
              <h3 className="mt-4 text-xl font-semibold">{feature.title}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">{feature.body}</p>
            </article>
          ))}
        </section>

        <section className="mt-10 grid gap-6 lg:grid-cols-[0.95fr_1.05fr] items-start">
          <div className="surface-card fade-up p-7">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[#0a66c2]">Jobs feed preview</p>
            <h3 className="mt-4 text-3xl font-semibold">Live job portal experience for recruiters and applicants</h3>
            <div className="mt-6 space-y-5 text-sm leading-7 text-slate-600">
              <p>
                The homepage now shows job portal details with a realistic hiring feed, saved roles, and status indicators that make the product feel more like a recruiter dashboard.
              </p>
              <p>
                Use the new illustration and sample listing module to highlight job titles, company name, location, and hiring stage at a glance.
              </p>
            </div>
          </div>

          <div className="surface-card fade-up fade-up-delay-1 p-6">
            <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Now hiring</p>
                  <h4 className="mt-3 text-xl font-semibold">Featured openings</h4>
                </div>
                <span className="rounded-full bg-[#eaf2ff] px-3 py-1 text-xs font-semibold text-[#0a66c2]">Recruiter</span>
              </div>

              <div className="mt-6 space-y-4">
                {[
                  {
                    role: 'Senior React Developer',
                    company: 'Atlas Labs',
                    location: 'Remote · Full-time',
                    badge: 'Trending',
                  },
                  {
                    role: 'Product Designer',
                    company: 'WorkWave',
                    location: 'New York, NY · Contract',
                    badge: 'Urgent',
                  },
                  {
                    role: 'Backend Engineer',
                    company: 'FinFlow',
                    location: 'San Francisco, CA · Hybrid',
                    badge: 'New',
                  },
                ].map((job) => (
                  <div key={job.role} className="rounded-[1.5rem] border border-slate-200 bg-white p-4 shadow-sm">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-lg font-semibold">{job.role}</p>
                        <p className="mt-1 text-sm text-slate-600">{job.company}</p>
                        <p className="mt-2 text-sm text-slate-500">{job.location}</p>
                      </div>
                      <span className="rounded-full bg-[#e0f2fe] px-3 py-1 text-xs font-semibold text-[#0369a1]">{job.badge}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

      </section>
    </main>
  );
}
