'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function DashboardPage() {
  const router = useRouter();

  useEffect(() => {
    // Check user role and redirect to appropriate dashboard
    const role = localStorage.getItem('userRole');
    const authToken = localStorage.getItem('authToken');
    
    if (!authToken) {
      router.push('/login');
      return;
    }
    
    if (role === 'CLIENT') {
      router.push('/dashboard/client');
    } else if (role === 'DEVELOPER') {
      router.push('/dashboard/developer');
    } else {
      // Default to developer if no role set
      router.push('/dashboard/developer');
    }
  }, [router]);

  return (
    <main className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <p className="text-lg">Redirecting to your dashboard...</p>
      </div>
    </main>
  );
}
