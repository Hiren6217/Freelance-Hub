import { Suspense } from 'react';
import VerifyOtpPageContent from './VerifyOtpPageContent';

export default function VerifyOtpPage() {
  return (
    <Suspense fallback={<main className="min-h-screen px-4 py-8"><div className="page-shell">Loading verification…</div></main>}>
      <VerifyOtpPageContent />
    </Suspense>
  );
}
