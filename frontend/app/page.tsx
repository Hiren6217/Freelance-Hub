'use client';

import { useState, useEffect } from 'react';
import Link from "next/link";
import { ArrowRight, BriefcaseBusiness, MessageSquareMore, Users } from "lucide-react";

export default function HomePage() {
  const [hasSignedUp, setHasSignedUp] = useState(false);

  useEffect(() => {
    // Check if user has signed up
    const signedUp = localStorage.getItem('hasSignedUp');
    setHasSignedUp(signedUp === 'true');
  }, []);

  return (
    <main className="min-h-screen px-4 py-8">
      <section className="mx-auto max-w-6xl">
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/freelancehub-logo.svg" alt="FreelanceHub" className="h-12 w-12 rounded-2xl" />
            <div>
              <h1 className="text-xl font-semibold">FreelanceHub</h1>
              <p className="text-sm text-slate/70">Referral-first freelance hiring</p>
            </div>
          </div>
          <Link href="/dashboard" className="rounded-full bg-ink px-5 py-3 text-sm font-semibold text-white">
            Open platform
          </Link>
        </header>

        <div className="mt-16 grid gap-10 lg:grid-cols-2 lg:items-center">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-ember">Freelance referrals</p>
            <h2 className="mt-4 text-5xl font-semibold leading-tight">
              Freelancers get discovered through trusted introductions, not crowded bid boards.
            </h2>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate/80">
              Showcase work, request intros, refer top talent, message clients, and manage referral-led project pipelines.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link href="/dashboard" className="inline-flex items-center gap-2 rounded-full bg-ember px-6 py-3 font-semibold text-white">
                Launch dashboard <ArrowRight className="h-4 w-4" />
              </Link>
              {!hasSignedUp ? (
                <Link href="/signup" className="rounded-full border border-black/10 px-6 py-3 font-semibold">
                  Sign up
                </Link>
              ) : (
                <Link href="/login" className="rounded-full border border-black/10 px-6 py-3 font-semibold">
                  Sign in
                </Link>
              )}
            </div>
          </div>

          <div className="rounded-[2rem] bg-ink p-6 text-white shadow-2xl">
            <div className="space-y-4">
              {[
                "Clients post freelance projects with referral bonuses",
                "Professionals refer vetted freelancers from their network",
                "Freelancers chat directly with clients and referrers"
              ].map((item) => (
                <div key={item} className="rounded-[1.5rem] bg-white/10 p-4 text-sm leading-6">
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-16 grid gap-4 md:grid-cols-3">
          {[
            { icon: Users, title: "Referral graph", body: "Track reputation and warm connections." },
            { icon: BriefcaseBusiness, title: "Project board", body: "Share contract, remote, and retained roles." },
            { icon: MessageSquareMore, title: "Live messaging", body: "Move from intro to project discussion quickly." }
          ].map((feature) => (
            <article key={feature.title} className="rounded-[2rem] bg-white p-6 shadow-lg">
              <feature.icon className="h-6 w-6 text-ember" />
              <h3 className="mt-4 text-xl font-semibold">{feature.title}</h3>
              <p className="mt-2 text-sm leading-6 text-slate/75">{feature.body}</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
