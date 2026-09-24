'use client';

import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { AlertTriangle, LogIn, ShieldCheck } from 'lucide-react';
import PayDues from '@/app/components/PayDues';

function PayDuesPageContent() {
  const searchParams = useSearchParams();
  const [clientId, setClientId] = useState<number | null>(null);

  useEffect(() => {
    const queryId = searchParams.get('userId');
    if (queryId) {
      const parsed = parseInt(queryId, 10);
      if (Number.isFinite(parsed)) {
        setClientId(parsed);
        return;
      }
    }
    const stored = localStorage.getItem('userId');
    if (stored) setClientId(parseInt(stored, 10));
  }, [searchParams]);

  return (
    <main className="min-h-screen px-4 py-8">
      <section className="page-shell">
        <div className="mx-auto max-w-2xl space-y-6">
          <div className="surface-card p-8">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-amber-100 p-3 text-amber-700"><AlertTriangle className="h-5 w-5" /></div>
              <div>
                <h1 className="text-3xl font-semibold">Release your platform payments</h1>
                <p className="mt-1 text-sm text-slate-500">Account access depends on clearing the payments owed to your developers through FreelanceHub.</p>
              </div>
            </div>

            <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
              <span className="inline-flex items-center gap-2"><ShieldCheck className="h-4 w-4" />Once all dues are cleared, your account is reactivated automatically (within about a minute) and you can sign in again.</span>
            </div>

            <div className="mt-6">
              {clientId ? (
                <PayDues clientId={clientId} />
              ) : (
                <p className="text-sm text-slate-500">We couldn&apos;t determine your account. Please return to sign in and try again.</p>
              )}
            </div>

            <div className="mt-6 border-t border-slate-200 pt-6">
              <Link href="/login" className="linkedin-button inline-flex items-center gap-2"><LogIn className="h-4 w-4" />Back to sign in</Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

export default function PayDuesPage() {
  return (
    <Suspense fallback={<main className="min-h-screen" />}>
      <PayDuesPageContent />
    </Suspense>
  );
}
