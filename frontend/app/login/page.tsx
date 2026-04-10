'use client';

import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { login } from '@/lib/api';

function LoginPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [hasSignedUp, setHasSignedUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    // Check if user has signed up
    const signedUp = localStorage.getItem('hasSignedUp');
    setHasSignedUp(signedUp === 'true');
    
    // Check for success message from signup
    const signupSuccess = searchParams.get('signup');
    if (signupSuccess === 'success') {
      setSuccessMessage('Account created successfully! Please log in.');
    }
  }, [searchParams]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    
    if (!hasSignedUp) {
      setError('Please sign up first before logging in!');
      setTimeout(() => router.push('/signup'), 2000);
      return;
    }
    
    setLoading(true);

    try {
      // Call backend API
      const response = await login(email, password);
      
      // Store auth token and user info
      localStorage.setItem('authToken', response.token);
      localStorage.setItem('userId', response.userId.toString());
      localStorage.setItem('userEmail', response.email);
      localStorage.setItem('userName', response.name);
      localStorage.setItem('userRole', response.role);
      
      // Redirect based on user role
      if (response.role === 'CLIENT') {
        router.push('/dashboard/client');
      } else {
        router.push('/dashboard/developer');
      }
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center p-6">
      <div className="w-full max-w-md rounded-[2rem] bg-white p-8 shadow-xl">
        <h1 className="text-2xl font-semibold">Sign in to FreelanceHub</h1>
        
        {successMessage && (
          <div className="mt-4 rounded-2xl bg-green-50 border border-green-200 p-4">
            <p className="text-sm text-green-800">✓ {successMessage}</p>
          </div>
        )}
        
        {error && (
          <div className="mt-4 rounded-2xl bg-red-50 border border-red-200 p-4">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}
        
        {!hasSignedUp && !error && (
          <div className="mt-4 rounded-2xl bg-amber-50 border border-amber-200 p-4">
            <p className="text-sm text-amber-800">
              ⚠️ You need to sign up first before you can log in.
            </p>
          </div>
        )}
        
        <form onSubmit={handleLogin} className="mt-6 space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium">Email</label>
            <input 
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-2xl border border-black/10 px-4 py-3" 
              placeholder="you@example.com"
              required
              disabled={loading}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Password</label>
            <input 
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-2xl border border-black/10 px-4 py-3" 
              placeholder="••••••••"
              required
              disabled={loading}
            />
          </div>
          <button 
            type="submit"
            disabled={loading}
            className="w-full rounded-full bg-ink px-5 py-3 font-semibold text-white hover:bg-ink/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Signing in...' : 'Login'}
          </button>
        </form>
        
        <p className="mt-6 text-center text-sm text-slate/70">
          Don't have an account?{' '}
          <Link href="/signup" className="font-semibold text-ember hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<main className="flex min-h-screen items-center justify-center p-6" />}>
      <LoginPageContent />
    </Suspense>
  );
}
