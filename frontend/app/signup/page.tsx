'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { signup } from '@/lib/api';

export default function SignupPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: '' // 'CLIENT' or 'DEVELOPER'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match!');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    if (!formData.role) {
      setError('Please select your role');
      return;
    }

    setLoading(true);

    try {
      // Call backend API with role
      await signup(formData.name, formData.email, formData.password, formData.role);
      
      // Store signup state in localStorage
      localStorage.setItem('hasSignedUp', 'true');
      localStorage.setItem('userEmail', formData.email);
      localStorage.setItem('userRole', formData.role);
      
      // Redirect to login page after successful signup
      router.push('/login?signup=success');
    } catch (err: any) {
      setError(err.message || 'Signup failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <main className="flex min-h-screen items-center justify-center p-6">
      <div className="w-full max-w-md rounded-[2rem] bg-white p-8 shadow-xl">
        <h1 className="text-2xl font-semibold">Sign up for FreelanceHub</h1>
        <p className="mt-2 text-sm text-slate/70">Create your account to get started</p>
        
        {error && (
          <div className="mt-4 rounded-2xl bg-red-50 border border-red-200 p-4">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium">Full Name</label>
            <input 
              type="text" 
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full rounded-2xl border border-black/10 px-4 py-3" 
              placeholder="John Doe"
              required
              disabled={loading}
            />
          </div>
          
          <div>
            <label className="mb-1 block text-sm font-medium">Email</label>
            <input 
              type="email" 
              name="email"
              value={formData.email}
              onChange={handleChange}
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
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="w-full rounded-2xl border border-black/10 px-4 py-3" 
              placeholder="••••••••"
              required
              minLength={6}
              disabled={loading}
            />
          </div>
          
          <div>
            <label className="mb-1 block text-sm font-medium">Confirm Password</label>
            <input 
              type="password" 
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              className="w-full rounded-2xl border border-black/10 px-4 py-3" 
              placeholder="••••••••"
              required
              disabled={loading}
            />
          </div>
          
          <div>
            <label className="mb-3 block text-sm font-medium">I want to:</label>
            <div className="space-y-3">
              <label className="flex items-center gap-3 rounded-2xl border border-black/10 p-4 cursor-pointer hover:bg-slate/5 transition-colors">
                <input 
                  type="radio" 
                  name="role"
                  value="CLIENT"
                  checked={formData.role === 'CLIENT'}
                  onChange={handleChange}
                  className="h-5 w-5 text-ember"
                  required
                  disabled={loading}
                />
                <div>
                  <p className="font-semibold">Hire Developer</p>
                  <p className="text-xs text-slate/70">Post jobs and find top talent</p>
                </div>
              </label>
              
              <label className="flex items-center gap-3 rounded-2xl border border-black/10 p-4 cursor-pointer hover:bg-slate/5 transition-colors">
                <input 
                  type="radio" 
                  name="role"
                  value="DEVELOPER"
                  checked={formData.role === 'DEVELOPER'}
                  onChange={handleChange}
                  className="h-5 w-5 text-ember"
                  required
                  disabled={loading}
                />
                <div>
                  <p className="font-semibold">Find Work</p>
                  <p className="text-xs text-slate/70">Get referred to exciting projects</p>
                </div>
              </label>
            </div>
          </div>
          
          <button 
            type="submit"
            disabled={loading}
            className="w-full rounded-full bg-ember px-5 py-3 font-semibold text-white hover:bg-ember/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Creating account...' : 'Sign Up'}
          </button>
        </form>
        
        <p className="mt-6 text-center text-sm text-slate/70">
          Already have an account?{' '}
          <Link href="/login" className="font-semibold text-ember hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </main>
  );
}
