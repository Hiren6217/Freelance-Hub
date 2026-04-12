'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function GlobalHeader() {
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    setUserRole(localStorage.getItem('userRole'));
  }, []);

  const isAdmin = userRole === 'ADMIN';

  return (
    <header className="surface-card sticky top-0 z-50 mx-auto mb-6 w-full max-w-7xl rounded-b-3xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link href="/" className="flex items-center gap-3">
          <img src="/freelancehub-logo.svg" alt="FreelanceHub" className="h-10 w-10 rounded-2xl" />
          <div>
            <p className="text-sm font-semibold text-slate-900">FreelanceHub</p>
            <p className="text-xs text-slate-500">Freelance hiring platform</p>
          </div>
        </Link>
        <div className="flex flex-wrap items-center gap-3">
          {isAdmin && (
            <Link href="/dashboard/admin" className="linkedin-button-secondary">
              Admin panel
            </Link>
          )}
          <Link href="/login" className="linkedin-button-secondary">
            Sign in
          </Link>
          <Link href="/dashboard" className="linkedin-button">
            Open network
          </Link>
        </div>
      </div>
    </header>
  );
}
